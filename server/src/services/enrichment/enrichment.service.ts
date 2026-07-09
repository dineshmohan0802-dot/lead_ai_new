import { getSupabaseAdmin } from '../../config/supabase';
import { getAIService } from '../ai/ai.service';
import { calculateDeterministicScore } from './scoring.service';
import { Signal, SignalEnrichment, EnrichmentResult } from '../../types';

/**
 * Enrichment Service — orchestrates AI enrichment for signals.
 * 
 * For each signal:
 * 1. Run deterministic intent scoring
 * 2. Run AI enrichment (sentiment, intent, summary, outreach)
 * 3. Merge deterministic + AI scores
 * 4. Store enrichment result
 * 5. Create/update lead record
 */
export class EnrichmentService {
  private ai = getAIService();
  private supabase = getSupabaseAdmin();

  /**
   * Enrich a single signal
   */
  async enrichSignal(signal: Signal): Promise<SignalEnrichment | null> {
    try {
      // Check if already enriched
      const { data: existing } = await this.supabase
        .from('signal_enrichments')
        .select('id')
        .eq('signal_id', signal.id)
        .single();

      if (existing) {
        console.log(`⏭️  Signal ${signal.id} already enriched, skipping`);
        return null;
      }

      // Step 1: Deterministic scoring
      const deterministicScore = calculateDeterministicScore({
        text: signal.text,
        matched_keywords: signal.matched_keywords || [],
        matched_competitors: signal.matched_competitors || [],
        source: signal.source_name,
      });

      let enrichment: SignalEnrichment;

      // Step 2: AI enrichment (if available)
      if (this.ai.isAvailable) {
        try {
          const aiResult = await this.ai.enrichSignal(signal.text, {
            keywords: signal.matched_keywords,
            competitors: signal.matched_competitors,
            source: signal.source_name,
            authorName: signal.author_name,
            companyName: signal.company_name,
          });

          // Merge: average deterministic + AI intent scores
          const mergedIntentScore = Math.round(
            (deterministicScore.final_score + aiResult.intent.score) / 2
          );
          const { scoreToLabel } = require('./scoring.service');

          enrichment = {
            signal_id: signal.id,
            sentiment_label: aiResult.sentiment.label,
            sentiment_score: aiResult.sentiment.score,
            intent_score: mergedIntentScore,
            intent_label: scoreToLabel(mergedIntentScore),
            summary: aiResult.summary,
            outreach_opening: aiResult.outreach.opener,
            outreach_message: aiResult.outreach.message,
            reasoning: aiResult.intent.reasoning,
            model_used: aiResult.model_used,
          };
        } catch (aiError) {
          console.warn(`⚠️  AI enrichment failed, using deterministic only:`, aiError);
          enrichment = this.buildDeterministicEnrichment(signal, deterministicScore);
        }
      } else {
        enrichment = this.buildDeterministicEnrichment(signal, deterministicScore);
      }

      // Step 3: Store enrichment
      const { data, error } = await this.supabase
        .from('signal_enrichments')
        .insert(enrichment)
        .select()
        .single();

      if (error) {
        console.error(`❌ Failed to store enrichment for signal ${signal.id}:`, error);
        return null;
      }

      // Step 4: Create/update lead
      await this.upsertLead(signal, enrichment);

      console.log(
        `✅ Enriched signal ${signal.id}: intent=${enrichment.intent_score} (${enrichment.intent_label})`
      );

      return data;
    } catch (error) {
      console.error(`❌ Enrichment failed for signal ${signal.id}:`, error);
      return null;
    }
  }

  /**
   * Enrich all un-enriched signals for a workspace
   */
  async enrichPendingSignals(workspaceId: string, batchSize: number = 10): Promise<number> {
    // Find signals without enrichments
    const { data: signals, error } = await this.supabase
      .from('signals')
      .select('*, signal_enrichments(id)')
      .eq('workspace_id', workspaceId)
      .is('signal_enrichments', null)
      .order('inserted_at', { ascending: false })
      .limit(batchSize);

    if (error || !signals?.length) {
      console.log('No pending signals to enrich');
      return 0;
    }

    console.log(`🔄 Enriching ${signals.length} signals for workspace ${workspaceId}`);

    let enriched = 0;
    for (const signal of signals) {
      const result = await this.enrichSignal(signal as Signal);
      if (result) enriched++;

      // Small delay between AI calls to avoid rate limits
      await new Promise((r) => setTimeout(r, 500));
    }

    return enriched;
  }

  private buildDeterministicEnrichment(
    signal: Signal,
    scoring: { final_score: number; label: string; adjustments: { reason: string; delta: number }[] }
  ): SignalEnrichment {
    return {
      signal_id: signal.id,
      sentiment_label: 'neutral',
      sentiment_score: 0,
      intent_score: scoring.final_score,
      intent_label: scoring.label as any,
      summary: signal.text.substring(0, 200) + (signal.text.length > 200 ? '...' : ''),
      outreach_opening: '',
      outreach_message: '',
      reasoning: scoring.adjustments.map((a) => a.reason).join('; '),
      model_used: 'deterministic',
    };
  }

  private async upsertLead(signal: Signal, enrichment: SignalEnrichment): Promise<void> {
    // Only create leads for medium+ intent
    if ((enrichment.intent_score || 0) < 40) return;

    try {
      const { error } = await this.supabase.from('leads').upsert(
        {
          workspace_id: signal.workspace_id,
          signal_id: signal.id,
          display_name: signal.author_name || signal.author_handle || 'Unknown',
          company_name: signal.company_name || null,
          score: enrichment.intent_score || 0,
          status: 'new',
        },
        { onConflict: 'signal_id' }
      );

      if (error) {
        // If upsert fails due to no unique constraint, try insert
        await this.supabase.from('leads').insert({
          workspace_id: signal.workspace_id,
          signal_id: signal.id,
          display_name: signal.author_name || signal.author_handle || 'Unknown',
          company_name: signal.company_name || null,
          score: enrichment.intent_score || 0,
          status: 'new',
        });
      }
    } catch (error) {
      console.warn(`⚠️  Failed to upsert lead for signal ${signal.id}:`, error);
    }
  }
}
