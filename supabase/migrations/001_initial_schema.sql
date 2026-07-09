-- LeadPulse MVP — Initial Database Schema
-- Run this in Supabase SQL Editor or via CLI migration

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- WORKSPACES
-- ============================================================
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Workspace',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SOURCE CONNECTIONS
-- ============================================================
CREATE TABLE source_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL CHECK (source_name IN ('reddit', 'twitter', 'linkedin')),
  config_json JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- MONITORING RULES
-- ============================================================
CREATE TABLE monitoring_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('keyword', 'competitor', 'icp_title', 'icp_company', 'exclusion')),
  value TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- RAW EVENTS
-- ============================================================
CREATE TABLE raw_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  external_id TEXT NOT NULL,
  raw_payload JSONB NOT NULL,
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, source_name, external_id)
);

-- ============================================================
-- SIGNALS (normalized events)
-- ============================================================
CREATE TABLE signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  raw_event_id UUID REFERENCES raw_events(id) ON DELETE SET NULL,
  source_name TEXT NOT NULL,
  author_name TEXT,
  author_handle TEXT,
  author_profile_url TEXT,
  company_name TEXT,
  title TEXT,
  text TEXT NOT NULL,
  url TEXT,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('post', 'comment', 'reply', 'mention')),
  matched_keywords TEXT[] NOT NULL DEFAULT '{}',
  matched_competitors TEXT[] NOT NULL DEFAULT '{}',
  created_at_source TIMESTAMPTZ,
  inserted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_signals_workspace ON signals(workspace_id);
CREATE INDEX idx_signals_source ON signals(source_name);
CREATE INDEX idx_signals_inserted ON signals(inserted_at DESC);

-- ============================================================
-- SIGNAL ENRICHMENTS
-- ============================================================
CREATE TABLE signal_enrichments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  signal_id UUID NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
  sentiment_label TEXT,
  sentiment_score REAL,
  intent_score INTEGER,
  intent_label TEXT CHECK (intent_label IN ('low', 'medium', 'high', 'hot')),
  summary TEXT,
  outreach_opening TEXT,
  outreach_message TEXT,
  reasoning TEXT,
  model_used TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_enrichments_signal ON signal_enrichments(signal_id);

-- ============================================================
-- LEADS
-- ============================================================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  signal_id UUID REFERENCES signals(id) ON DELETE SET NULL,
  display_name TEXT,
  company_name TEXT,
  email TEXT,
  linkedin_url TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_workspace ON leads(workspace_id);
CREATE INDEX idx_leads_score ON leads(score DESC);

-- ============================================================
-- WORKSPACE SETTINGS (ICP, tone, AI config)
-- ============================================================
CREATE TABLE workspace_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE UNIQUE,
  ai_provider TEXT DEFAULT 'gemini',
  outreach_tone TEXT DEFAULT 'professional',
  icp_config JSONB NOT NULL DEFAULT '{
    "target_titles": [],
    "target_company_keywords": [],
    "exclusions": []
  }',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_enrichments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_settings ENABLE ROW LEVEL SECURITY;

-- Policies: Users can access their own workspace data
CREATE POLICY "Users can view own workspaces"
  ON workspaces FOR SELECT
  USING (owner_user_id = auth.uid());

CREATE POLICY "Users can insert own workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users can update own workspaces"
  ON workspaces FOR UPDATE
  USING (owner_user_id = auth.uid());

-- For workspace-scoped tables, allow access if user owns the workspace
CREATE POLICY "Workspace members can view source_connections"
  ON source_connections FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_user_id = auth.uid()));

CREATE POLICY "Workspace members can manage monitoring_rules"
  ON monitoring_rules FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_user_id = auth.uid()));

CREATE POLICY "Workspace members can view raw_events"
  ON raw_events FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_user_id = auth.uid()));

CREATE POLICY "Workspace members can view signals"
  ON signals FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_user_id = auth.uid()));

CREATE POLICY "Workspace members can view enrichments"
  ON signal_enrichments FOR ALL
  USING (signal_id IN (
    SELECT s.id FROM signals s
    JOIN workspaces w ON s.workspace_id = w.id
    WHERE w.owner_user_id = auth.uid()
  ));

CREATE POLICY "Workspace members can manage leads"
  ON leads FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_user_id = auth.uid()));

CREATE POLICY "Workspace members can manage settings"
  ON workspace_settings FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_user_id = auth.uid()));

-- ============================================================
-- SERVICE ROLE BYPASS (for backend operations)
-- ============================================================
-- The service_role key bypasses RLS by default in Supabase,
-- so the backend can insert/update all tables freely.

-- ============================================================
-- HELPER FUNCTION: Auto-create workspace on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.workspaces (owner_user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'My Workspace'));
  
  -- Also create default workspace settings
  INSERT INTO public.workspace_settings (workspace_id)
  VALUES ((SELECT id FROM public.workspaces WHERE owner_user_id = NEW.id LIMIT 1));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
