import { supabase } from './supabase';

const API_BASE = '/api';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }
  return {
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options?.headers },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ── Dashboard ──
export const dashboardApi = {
  getStats: () => apiRequest<any>('/dashboard/stats'),
};

// ── Signals ──
export const signalsApi = {
  list: (params?: { source?: string; intent_label?: string; search?: string; page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.source) searchParams.set('source', params.source);
    if (params?.intent_label) searchParams.set('intent_label', params.intent_label);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', params.page.toString());
    return apiRequest<any>(`/signals?${searchParams.toString()}`);
  },
  get: (id: string) => apiRequest<any>(`/signals/${id}`),
};

// ── Leads ──
export const leadsApi = {
  list: (params?: { status?: string; min_score?: number; search?: string; page?: number; sort_by?: string; sort_order?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.min_score) searchParams.set('min_score', params.min_score.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.sort_by) searchParams.set('sort_by', params.sort_by);
    if (params?.sort_order) searchParams.set('sort_order', params.sort_order);
    return apiRequest<any>(`/leads?${searchParams.toString()}`);
  },
  updateStatus: (id: string, status: string) =>
    apiRequest<any>(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  generateOutreach: (id: string) =>
    apiRequest<any>(`/leads/${id}/outreach`, { method: 'POST' }),
};

// ── Settings ──
export const settingsApi = {
  get: () => apiRequest<any>('/settings'),
  update: (data: any) =>
    apiRequest<any>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getRules: () => apiRequest<any>('/settings/rules'),
  createRule: (rule_type: string, value: string) =>
    apiRequest<any>('/settings/rules', {
      method: 'POST',
      body: JSON.stringify({ rule_type, value }),
    }),
  deleteRule: (id: string) =>
    apiRequest<any>(`/settings/rules/${id}`, { method: 'DELETE' }),
};

// ── Ingestion ──
export const ingestionApi = {
  trigger: (sources?: string[]) =>
    apiRequest<any>('/ingestion/trigger', {
      method: 'POST',
      body: JSON.stringify({ sources }),
    }),
};
