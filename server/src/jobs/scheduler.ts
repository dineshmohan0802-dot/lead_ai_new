import cron from 'node-cron';
import { runIngestionJob } from './ingest.job';
import { runEnrichmentJob } from './enrich.job';

/**
 * Scheduler — manages cron jobs for ingestion and enrichment.
 * 
 * Default schedule:
 * - Ingestion: every 30 minutes
 * - Enrichment: every 10 minutes
 * 
 * TODO Phase 2: Make schedules configurable per workspace
 */
export class Scheduler {
  private jobs: cron.ScheduledTask[] = [];
  private isRunning = false;

  start(): void {
    if (this.isRunning) {
      console.log('⚠️  Scheduler already running');
      return;
    }

    console.log('⏰ Starting scheduler...');

    // Ingestion every 30 minutes
    const ingestionJob = cron.schedule('*/30 * * * *', async () => {
      console.log('⏰ Cron: triggering ingestion');
      await runIngestionJob();
    }, { scheduled: true });

    this.jobs.push(ingestionJob);

    // Enrichment every 10 minutes
    const enrichmentJob = cron.schedule('*/10 * * * *', async () => {
      console.log('⏰ Cron: triggering enrichment');
      await runEnrichmentJob();
    }, { scheduled: true });

    this.jobs.push(enrichmentJob);

    this.isRunning = true;
    console.log('✅ Scheduler started');
    console.log('   📥 Ingestion: every 30 minutes');
    console.log('   🤖 Enrichment: every 10 minutes');
  }

  stop(): void {
    this.jobs.forEach((job) => job.stop());
    this.jobs = [];
    this.isRunning = false;
    console.log('⏹️  Scheduler stopped');
  }

  /**
   * Run initial ingestion + enrichment immediately on startup
   */
  async runInitial(): Promise<void> {
    console.log('🚀 Running initial ingestion + enrichment...');
    await runIngestionJob();
    await runEnrichmentJob();
  }
}
