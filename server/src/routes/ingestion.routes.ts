import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { PipelineService } from '../services/pipeline/pipeline.service';

const router = Router();

/**
 * POST /api/ingestion/trigger
 * Manually trigger ingestion for the workspace
 */
router.post('/trigger', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      res.status(400).json({ error: 'No workspace found' });
      return;
    }

    const { sources } = req.body; // optional: ['reddit', 'twitter', 'linkedin']

    const pipeline = new PipelineService();

    // Run ingestion
    console.log(`🔄 Manual ingestion triggered for workspace ${workspaceId}`);
    const result = await pipeline.runIngestion(workspaceId, sources);

    // Run enrichment after ingestion
    const enriched = await pipeline.runEnrichment(workspaceId);

    res.json({
      ...result,
      signals_enriched: enriched,
      message: 'Ingestion and enrichment complete',
    });
  } catch (error: any) {
    console.error('Ingestion trigger error:', error);
    res.status(500).json({ error: error.message || 'Ingestion failed' });
  }
});

export default router;
