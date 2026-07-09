import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { getSupabaseAdmin } from '../config/supabase';

const router = Router();
const supabase = getSupabaseAdmin();

/**
 * GET /api/settings
 * Get workspace settings (monitoring rules + ICP config + AI settings)
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      res.status(400).json({ error: 'No workspace found' });
      return;
    }

    // Get monitoring rules
    const { data: rules } = await supabase
      .from('monitoring_rules')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    // Get workspace settings
    const { data: settings } = await supabase
      .from('workspace_settings')
      .select('*')
      .eq('workspace_id', workspaceId)
      .single();

    res.json({
      rules: rules || [],
      settings: settings || {
        ai_provider: 'gemini',
        outreach_tone: 'professional',
        icp_config: { target_titles: [], target_company_keywords: [], exclusions: [] },
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/**
 * PUT /api/settings
 * Update workspace settings
 */
router.put('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { ai_provider, outreach_tone, icp_config } = req.body;

    const { data, error } = await supabase
      .from('workspace_settings')
      .upsert({
        workspace_id: req.workspaceId!,
        ai_provider,
        outreach_tone,
        icp_config,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'workspace_id' })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

/**
 * GET /api/settings/rules
 * List monitoring rules
 */
router.get('/rules', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('monitoring_rules')
      .select('*')
      .eq('workspace_id', req.workspaceId!)
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
});

/**
 * POST /api/settings/rules
 * Create a new monitoring rule
 */
router.post('/rules', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { rule_type, value } = req.body;

    if (!rule_type || !value) {
      res.status(400).json({ error: 'rule_type and value are required' });
      return;
    }

    const validTypes = ['keyword', 'competitor', 'icp_title', 'icp_company', 'exclusion'];
    if (!validTypes.includes(rule_type)) {
      res.status(400).json({ error: `Invalid rule_type. Must be one of: ${validTypes.join(', ')}` });
      return;
    }

    const { data, error } = await supabase
      .from('monitoring_rules')
      .insert({
        workspace_id: req.workspaceId!,
        rule_type,
        value,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create rule' });
  }
});

/**
 * DELETE /api/settings/rules/:id
 * Delete a monitoring rule
 */
router.delete('/rules/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error } = await supabase
      .from('monitoring_rules')
      .delete()
      .eq('id', req.params.id)
      .eq('workspace_id', req.workspaceId!);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete rule' });
  }
});

export default router;
