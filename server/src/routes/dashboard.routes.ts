import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { getSupabaseAdmin } from '../config/supabase';

const router = Router();
const supabase = getSupabaseAdmin();

/**
 * GET /api/dashboard/stats
 * Returns overview statistics for the workspace dashboard
 */
router.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      res.status(400).json({ error: 'No workspace found' });
      return;
    }

    // Total signals
    const { count: totalSignals } = await supabase
      .from('signals')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId);

    // Hot leads count
    const { count: hotLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .gte('score', 60);

    // Leads by source
    const { data: signalsBySource } = await supabase
      .from('signals')
      .select('source_name')
      .eq('workspace_id', workspaceId);

    const leadsBySource: Record<string, number> = {};
    (signalsBySource || []).forEach((s: any) => {
      leadsBySource[s.source_name] = (leadsBySource[s.source_name] || 0) + 1;
    });

    // Top leads (highest score)
    const { data: topLeads } = await supabase
      .from('leads')
      .select(`
        *,
        signals (
          text, source_name, author_name, url,
          signal_enrichments (
            sentiment_label, intent_score, intent_label, summary, reasoning
          )
        )
      `)
      .eq('workspace_id', workspaceId)
      .order('score', { ascending: false })
      .limit(5);

    // Recent signals
    const { data: recentSignals } = await supabase
      .from('signals')
      .select(`
        *,
        signal_enrichments (*)
      `)
      .eq('workspace_id', workspaceId)
      .order('inserted_at', { ascending: false })
      .limit(10);

    // New leads today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: newLeadsToday } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .gte('created_at', today.toISOString());

    // Total leads
    const { count: totalLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId);

    res.json({
      total_signals: totalSignals || 0,
      total_leads: totalLeads || 0,
      hot_leads: hotLeads || 0,
      new_leads_today: newLeadsToday || 0,
      leads_by_source: leadsBySource,
      top_leads: topLeads || [],
      recent_signals: recentSignals || [],
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
