// ── Shared Types for LeadPulse ──

export type SourceName = 'reddit' | 'twitter' | 'linkedin';
export type SignalType = 'post' | 'comment' | 'reply' | 'mention';
export type IntentLabel = 'low' | 'medium' | 'high' | 'hot';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'dismissed';
export type RuleType = 'keyword' | 'competitor' | 'icp_title' | 'icp_company' | 'exclusion';

// ── Normalized Signal (core pipeline type) ──
export interface NormalizedSignal {
  id?: string;
  source: SourceName;
  external_id: string;
  author_name?: string;
  author_handle?: string;
  author_profile_url?: string;
  company_name?: string | null;
  title?: string | null;
  text: string;
  url?: string;
  signal_type: SignalType;
  matched_keywords: string[];
  matched_competitors: string[];
  created_at_source: string;
  metadata: Record<string, any>;
}

// ── Raw Event ──
export interface RawEvent {
  id?: string;
  workspace_id: string;
  source_name: SourceName;
  external_id: string;
  raw_payload: Record<string, any>;
  ingested_at?: string;
}

// ── Signal (DB row) ──
export interface Signal {
  id: string;
  workspace_id: string;
  raw_event_id?: string;
  source_name: SourceName;
  author_name?: string;
  author_handle?: string;
  author_profile_url?: string;
  company_name?: string;
  title?: string;
  text: string;
  url?: string;
  signal_type: SignalType;
  matched_keywords: string[];
  matched_competitors: string[];
  created_at_source?: string;
  inserted_at: string;
}

// ── Signal Enrichment ──
export interface SignalEnrichment {
  id?: string;
  signal_id: string;
  sentiment_label?: string;
  sentiment_score?: number;
  intent_score?: number;
  intent_label?: IntentLabel;
  summary?: string;
  outreach_opening?: string;
  outreach_message?: string;
  reasoning?: string;
  model_used?: string;
  created_at?: string;
}

// ── Lead ──
export interface Lead {
  id: string;
  workspace_id: string;
  signal_id?: string;
  display_name?: string;
  company_name?: string;
  email?: string;
  linkedin_url?: string;
  score: number;
  status: LeadStatus;
  created_at: string;
}

// ── Workspace ──
export interface Workspace {
  id: string;
  owner_user_id: string;
  name: string;
  created_at: string;
}

// ── Monitoring Rule ──
export interface MonitoringRule {
  id: string;
  workspace_id: string;
  rule_type: RuleType;
  value: string;
  is_active: boolean;
  created_at: string;
}

// ── Workspace Settings ──
export interface WorkspaceSettings {
  id: string;
  workspace_id: string;
  ai_provider: string;
  outreach_tone: string;
  icp_config: {
    target_titles: string[];
    target_company_keywords: string[];
    exclusions: string[];
  };
  updated_at: string;
}

// ── AI Provider Types ──
export interface SentimentResult {
  label: string;
  score: number;
}

export interface IntentResult {
  score: number;
  label: IntentLabel;
  reasoning: string;
}

export interface OutreachResult {
  opener: string;
  message: string;
}

export interface EnrichmentResult {
  sentiment: SentimentResult;
  intent: IntentResult;
  summary: string;
  outreach: OutreachResult;
  model_used: string;
}

// ── Source Adapter Config ──
export interface SourceConfig {
  keywords: string[];
  competitors: string[];
  subreddits?: string[];
  max_results?: number;
}

// ── Dashboard Stats ──
export interface DashboardStats {
  total_signals: number;
  hot_leads: number;
  leads_by_source: Record<SourceName, number>;
  top_leads: (Lead & { enrichment?: SignalEnrichment })[];
  recent_signals: (Signal & { enrichment?: SignalEnrichment })[];
}
