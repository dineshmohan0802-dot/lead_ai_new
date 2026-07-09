import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { getSupabaseAdmin } from '../config/supabase';

const router = Router();
const supabase = getSupabaseAdmin();

/**
 * GET /api/signals
 * List signals with enrichments, sorted by recency. Supports filtering.
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      res.status(400).json({ error: 'No workspace found' });
      return;
    }

    const {
      source,
      intent_label,
      search,
      page = '1',
      limit = '20',
    } = req.query;

    let query = supabase
      .from('signals')
      .select(`
        *,
        signal_enrichments (*)
      `, { count: 'exact' })
      .eq('workspace_id', workspaceId)
      .order('inserted_at', { ascending: false });

    if (source && source !== 'all') {
      query = query.eq('source_name', source);
    }

    if (search) {
      query = query.ilike('text', `%${search}%`);
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const from = (pageNum - 1) * limitNum;
    query = query.range(from, from + limitNum - 1);

    const { data, error, count } = await query;

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    // Filter by intent label if specified (post-query since it's in joined table)
    let filtered = data || [];
    if (intent_label && intent_label !== 'all') {
      filtered = filtered.filter((s: any) =>
        s.signal_enrichments?.[0]?.intent_label === intent_label
      );
    }

    res.json({
      signals: filtered,
      total: count || 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    console.error('Signals list error:', error);
    res.status(500).json({ error: 'Failed to fetch signals' });
  }
});

/**
 * GET /api/signals/:id
 * Get a single signal with enrichment
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('signals')
      .select(`
        *,
        signal_enrichments (*)
      `)
      .eq('id', req.params.id)
      .eq('workspace_id', req.workspaceId!)
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Signal not found' });
      return;
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch signal' });
  }
});

export default router;
