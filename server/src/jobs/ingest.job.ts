import { PipelineService } from '../services/pipeline/pipeline.service';
import { getSupabaseAdmin } from '../config/supabase';

/**
 * Ingestion job — fetches signals from all sources for all active workspaces.
 */
export async function runIngestionJob(): Promise<void> {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 Ingestion Job Started');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const supabase = getSupabaseAdmin();
  const pipeline = new PipelineService();

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
      console.log(`\n📦 Processing workspace: ${workspace.name} (${workspace.id})`);
      const result = await pipeline.runIngestion(workspace.id);

      console.log(`   Results: ${result.raw_events_stored} raw, ${result.signals_created} signals`);
      if (result.errors.length) {
        console.warn(`   Errors: ${result.errors.length}`);
      }
    }
  } catch (error) {
    console.error('❌ Ingestion job failed:', error);
  }

  console.log('\n✅ Ingestion Job Complete');
}
