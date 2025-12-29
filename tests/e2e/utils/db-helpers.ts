import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test.local' });
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasSupabaseAdmin = !!(supabaseUrl && supabaseServiceKey);

let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!hasSupabaseAdmin) {
    console.warn('[db-helpers] Supabase not configured - skipping DB tests');
    return null;
  }
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _supabaseAdmin;
}

export async function getActivityByTitle(title: string) {
  const client = getSupabaseAdmin();
  if (!client) return null;
  const { data, error } = await client.from('activities').select('*').eq('title', title).single();
  if (error) throw error;
  return data;
}

export async function checkBookingExists(idempotencyKey: string): Promise<boolean> {
  const client = getSupabaseAdmin();
  if (!client) return false;
  const { data } = await client.from('bookings').select('id').eq('idempotency_key', idempotencyKey).maybeSingle();
  return data !== null;
}

export async function getSlotSeats(slotId: string): Promise<number | null> {
  const client = getSupabaseAdmin();
  if (!client) return null;
  const { data } = await client.from('slots').select('remaining_seats').eq('id', slotId).single();
  return data?.remaining_seats ?? null;
}
