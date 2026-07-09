import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { getSupabaseAdmin } from '../config/supabase';
import { getAIService } from '../services/ai/ai.service';

const router = Router();
const supabase = getSupabaseAdmin();

/**
 * GET /api/leads
 * List leads with signal & enrichment data
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      res.status(400).json({ error: 'No workspace found' });
      return;
    }

    const {
      status,
      min_score,
      search,
      sort_by = 'score',
      sort_order = 'desc',
      page = '1',
      limit = '20',
    } = req.query;

    let query = supabase
      .from('leads')
      .select(`
        *,
        signals (
          text, source_name, author_name, author_handle, url, title,
          matched_keywords, matched_competitors, created_at_source,
          signal_enrichments (*)
        )
      `, { count: 'exact' })
      .eq('workspace_id', workspaceId);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (min_score) {
      query = query.gte('score', parseInt(min_score as string, 10));
    }

    if (search) {
      query = query.or(`display_name.ilike.%${search}%,company_name.ilike.%${search}%`);
    }

    // Sort
    const validSortFields = ['score', 'created_at', 'display_name', 'status'];
    const sortField = validSortFields.includes(sort_by as string) ? sort_by as string : 'score';
    query = query.order(sortField, { ascending: sort_order === 'asc' });

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

    res.json({
      leads: data || [],
      total: count || 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    console.error('Leads list error:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

/**
 * PATCH /api/leads/:id
 * Update lead status
 */
router.patch('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'contacted', 'qualified', 'converted', 'dismissed'];

    if (status && !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const { data, error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', req.params.id)
      .eq('workspace_id', req.workspaceId!)
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

/**
 * POST /api/leads/:id/outreach
 * Generate (or regenerate) outreach for a specific lead
 */
router.post('/:id/outreach', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ai = getAIService();
    if (!ai.isAvailable) {
      res.status(503).json({ error: 'AI service not available — no API keys configured' });
      return;
    }

    // Get lead + signal
    const { data: lead } = await supabase
      .from('leads')
      .select(`
        *,
        signals (
          text, source_name, author_name, company_name,
          signal_enrichments (reasoning)
        )
      `)
      .eq('id', req.params.id)
      .eq('workspace_id', req.workspaceId!)
      .single();

    if (!lead || !lead.signals) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    const signal = lead.signals as any;
    const enrichment = signal.signal_enrichments?.[0];

    // Get workspace tone setting
    const { data: settings } = await supabase
      .from('workspace_settings')
      .select('outreach_tone')
      .eq('workspace_id', req.workspaceId!)
      .single();

    const { outreach } = await ai.generateOutreach({
      signalText: signal.text,
      source: signal.source_name,
      authorName: signal.author_name || lead.display_name,
      companyName: signal.company_name || lead.company_name,
      intentReason: enrichment?.reasoning,
      tone: settings?.outreach_tone || 'professional',
    });

    // Update enrichment with new outreach
    if (enrichment) {
      await supabase
        .from('signal_enrichments')
        .update({
          outreach_opening: outreach.opener,
          outreach_message: outreach.message,
        })
        .eq('signal_id', lead.signal_id);
    }

    res.json(outreach);
  } catch (error) {
    console.error('Outreach generation error:', error);
    res.status(500).json({ error: 'Failed to generate outreach' });
  }
});

export default router;
