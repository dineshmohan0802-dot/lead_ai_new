import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

// Admin client (bypasses RLS) — for backend operations
let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    if (!env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('⚠️  No service role key — using anon key (RLS will apply)');
      adminClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    } else {
      adminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
    }
  }
  return adminClient;
}

// User-scoped client — created from JWT for RLS-protected queries
export function getSupabaseClient(accessToken?: string): SupabaseClient {
  if (accessToken) {
    return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
}
