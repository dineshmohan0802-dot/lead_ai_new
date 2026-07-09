import { EnrichmentService } from '../services/enrichment/enrichment.service';
import { getSupabaseAdmin } from '../config/supabase';

/**
 * Enrichment job — processes un-enriched signals across all workspaces.
 */
export async function runEnrichmentJob(): Promise<void> {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🤖 Enrichment Job Started');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const supabase = getSupabaseAdmin();
  const enrichmentService = new EnrichmentService();

  try {
    // Get all workspaces
    const { data: workspaces, error } = await supabase
      .from('workspaces')
      .select('id, name');

    if (error || !workspaces?.length) {
      console.log('No workspaces found');
      return;
    }

    for (const workspace of workspaces) {
      console.log(`\n📦 Enriching workspace: ${workspace.name} (${workspace.id})`);
      const enriched = await enrichmentService.enrichPendingSignals(workspace.id, 10);
      console.log(`   Enriched ${enriched} signals`);
    }
  } catch (error) {
    console.error('❌ Enrichment job failed:', error);
  }

  console.log('\n✅ Enrichment Job Complete');
}
