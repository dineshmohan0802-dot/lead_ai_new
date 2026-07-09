import { getSupabaseAdmin } from '../../config/supabase';
import { SourceAdapter } from '../sources/source.interface';
import { RedditAdapter } from '../sources/reddit/reddit.adapter';
import { TwitterAdapter } from '../sources/twitter/twitter.adapter';
import { LinkedInAdapter } from '../sources/linkedin/linkedin.adapter';
import { normalizeRawEvent } from './normalize.service';
import { EnrichmentService } from '../enrichment/enrichment.service';
import { RawEvent, NormalizedSignal, SourceConfig, SourceName, MonitoringRule } from '../../types';

/**
 * Pipeline Service — orchestrates the full ingestion-to-enrichment pipeline.
 * 
 * Flow: ingest → store raw → normalize → store signal → enrich → store enrichment → create lead
 */
export class PipelineService {
  private supabase = getSupabaseAdmin();
  private enrichmentService = new EnrichmentService();
  private adapters: Map<SourceName, SourceAdapter> = new Map();

  constructor() {
    this.adapters.set('reddit', new RedditAdapter());
    this.adapters.set('twitter', new TwitterAdapter());
    this.adapters.set('linkedin', new LinkedInAdapter());
  }

  /**
   * Run full ingestion pipeline for a workspace
   */
  async runIngestion(workspaceId: string, sources?: SourceName[]): Promise<{
    raw_events_stored: number;
    signals_created: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let rawEventsStored = 0;
    let signalsCreated = 0;

    // Load workspace config
    const config = await this.getWorkspaceConfig(workspaceId);
    if (!config.keywords.length) {
      console.warn('⚠️  No keywords configured for workspace', workspaceId);
      return { raw_events_stored: 0, signals_created: 0, errors: ['No keywords configured'] };
    }

    const sourcesToRun = sources || (['reddit', 'twitter', 'linkedin'] as SourceName[]);

    for (const sourceName of sourcesToRun) {
      const adapter = this.adapters.get(sourceName);
      if (!adapter || !adapter.isAvailable()) {
        console.log(`⏭️  Skipping ${sourceName} (not available)`);
        continue;
      }

      try {
        console.log(`\n🚀 Ingesting from ${sourceName}...`);

        // Step 1: Fetch raw events from source
        const rawEvents = await adapter.fetchSignals({
          keywords: config.keywords,
          competitors: config.competitors,
          subreddits: config.subreddits,
          max_results: 25,
        });

        console.log(`   📥 Fetched ${rawEvents.length} raw events from ${sourceName}`);

        // Step 2: Store raw events + normalize + store signals
        for (const rawEvent of rawEvents) {
          try {
            rawEvent.workspace_id = workspaceId;

            // Store raw event (skip duplicates)
            const storedRaw = await this.storeRawEvent(rawEvent);
            if (!storedRaw) continue; // Duplicate
            rawEventsStored++;

            // Normalize
            const normalized = normalizeRawEvent(
              rawEvent,
              config.keywords,
              config.competitors
            );

            // Store signal
            const signal = await this.storeSignal(workspaceId, storedRaw.id!, normalized);
            if (signal) signalsCreated++;
          } catch (eventError: any) {
            errors.push(`${sourceName}/${rawEvent.external_id}: ${eventError.message}`);
          }
        }
      } catch (sourceError: any) {
        console.error(`❌ ${sourceName} ingestion failed:`, sourceError);
        errors.push(`${sourceName}: ${sourceError.message}`);
      }
    }

    console.log(
      `\n📊 Ingestion complete: ${rawEventsStored} stored, ${signalsCreated} signals created`
    );

    return { raw_events_stored: rawEventsStored, signals_created: signalsCreated, errors };
  }

  /**
   * Run enrichment for pending signals
   */
  async runEnrichment(workspaceId: string, batchSize: number = 10): Promise<number> {
    return this.enrichmentService.enrichPendingSignals(workspaceId, batchSize);
  }

  /**
   * Get workspace configuration (keywords, competitors, etc.)
   */
  private async getWorkspaceConfig(workspaceId: string): Promise<{
    keywords: string[];
    competitors: string[];
    subreddits: string[];
  }> {
    const { data: rules } = await this.supabase
      .from('monitoring_rules')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true);

    const keywords = (rules || [])
      .filter((r: MonitoringRule) => r.rule_type === 'keyword')
      .map((r: MonitoringRule) => r.value);

    const competitors = (rules || [])
      .filter((r: MonitoringRule) => r.rule_type === 'competitor')
      .map((r: MonitoringRule) => r.value);

    // Default keywords if none configured
    if (keywords.length === 0) {
      keywords.push('lead generation', 'sales prospecting', 'intent data');
    }

    return { keywords, competitors, subreddits: [] };
  }

  /**
   * Store a raw event, handling duplicates
   */
  private async storeRawEvent(rawEvent: RawEvent): Promise<RawEvent | null> {
    const { data, error } = await this.supabase
      .from('raw_events')
      .upsert(
        {
          workspace_id: rawEvent.workspace_id,
          source_name: rawEvent.source_name,
          external_id: rawEvent.external_id,
          raw_payload: rawEvent.raw_payload,
        },
        { onConflict: 'workspace_id,source_name,external_id', ignoreDuplicates: true }
      )
      .select()
      .single();

    if (error) {
      // Duplicate — that's fine
      if (error.code === '23505' || error.message?.includes('duplicate')) {
        return null;
      }
      // Real insert (check if it already existed)
      const { data: existing } = await this.supabase
        .from('raw_events')
        .select('id')
        .eq('workspace_id', rawEvent.workspace_id)
        .eq('source_name', rawEvent.source_name)
        .eq('external_id', rawEvent.external_id)
        .single();

      if (existing) return null; // Already exists
      console.warn(`⚠️  Raw event storage issue:`, error.message);
      return null;
    }

    return data;
  }

  /**
   * Store a normalized signal
   */
  private async storeSignal(
    workspaceId: string,
    rawEventId: string,
    normalized: NormalizedSignal
  ): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('signals')
      .insert({
        workspace_id: workspaceId,
        raw_event_id: rawEventId,
        source_name: normalized.source,
        author_name: normalized.author_name,
        author_handle: normalized.author_handle,
        author_profile_url: normalized.author_profile_url,
        company_name: normalized.company_name,
        title: normalized.title,
        text: normalized.text,
        url: normalized.url,
        signal_type: normalized.signal_type,
        matched_keywords: normalized.matched_keywords,
        matched_competitors: normalized.matched_competitors,
        created_at_source: normalized.created_at_source,
      })
      .select()
      .single();

    if (error) {
      console.warn(`⚠️  Signal storage issue:`, error.message);
      return null;
    }

    return data;
  }
}
