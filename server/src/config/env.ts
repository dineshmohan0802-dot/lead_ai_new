import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const env = {
  // Server
  PORT: parseInt(process.env.SERVER_PORT || '3001', 10),
  APP_BASE_URL: process.env.APP_BASE_URL || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // AI Providers
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'google/gemma-2-9b-it:free',

  // Reddit (optional OAuth)
  REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID || '',
  REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET || '',
} as const;

// Validation
export function validateEnv(): void {
  const required: (keyof typeof env)[] = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  const missing = required.filter((key) => !env[key]);

  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  // AI provider check — at least one must be available
  if (!env.GEMINI_API_KEY && !env.OPENROUTER_API_KEY) {
    console.warn('⚠️  No AI provider API key found. AI enrichment will be disabled.');
  }

  console.log('✅ Environment validated');
  console.log(`   Supabase: ${env.SUPABASE_URL}`);
  console.log(`   Gemini:   ${env.GEMINI_API_KEY ? '✓ configured' : '✗ not set'}`);
  console.log(`   OpenRouter: ${env.OPENROUTER_API_KEY ? '✓ configured' : '✗ not set'}`);
}
