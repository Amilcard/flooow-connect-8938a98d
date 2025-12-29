/**
 * Shared Supabase client for audit scripts
 * Centralizes environment variable handling to avoid code duplication
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables");
  console.error("   Please ensure .env file exists with:");
  console.error("   - VITE_SUPABASE_URL or SUPABASE_URL");
  console.error("   - VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY");
  process.exit(1);
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);
export { supabaseUrl, supabaseKey };
