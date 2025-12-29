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

// Legacy export for backward compatibility
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabaseAdmin();
    if (!client) {
      throw new Error(
        `supabaseAdmin.${String(prop)} called but Supabase not configured. ` +
        'Set VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY or use getSupabaseAdmin().'
      );
    }
    return (client as any)[prop];
  },
});

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

// Aligné sur le schéma Flooow : availability_slots.seats_remaining
export async function getSlotSeats(slotId: string): Promise<number | null> {
  const client = getSupabaseAdmin();
  if (!client) return null;
  const { data, error } = await client
    .from('availability_slots')
    .select('seats_remaining')
    .eq('id', slotId)
    .single();
  if (error) return null;
  return data?.seats_remaining ?? null;
}

// Création d'un créneau de test
export async function createTestSlot(activityId: string, options?: {
  date?: string;
  startTime?: string;
  endTime?: string;
  totalSeats?: number;
}): Promise<string | null> {
  const client = getSupabaseAdmin();
  if (!client) return null;
  
  const slotData = {
    activity_id: activityId,
    date: options?.date || new Date().toISOString().split('T')[0],
    start_time: options?.startTime || '09:00',
    end_time: options?.endTime || '10:00',
    total_seats: options?.totalSeats || 10,
    seats_remaining: options?.totalSeats || 10,
  };
  
  const { data, error } = await client
    .from('availability_slots')
    .insert(slotData)
    .select('id')
    .single();
  
  if (error) {
    console.error('[db-helpers] createTestSlot error:', error);
    return null;
  }
  return data?.id ?? null;
}

// Nettoyage des données de test
export async function cleanupTestData(prefix: string = 'test-'): Promise<{ bookings: number; slots: number }> {
  const client = getSupabaseAdmin();
  if (!client) return { bookings: 0, slots: 0 };
  
  // Supprimer les bookings de test
  const { data: deletedBookings } = await client
    .from('bookings')
    .delete()
    .like('idempotency_key', `${prefix}%`)
    .select('id');
  
  // Supprimer les slots de test (ceux créés aujourd'hui avec peu de places)
  const { data: deletedSlots } = await client
    .from('availability_slots')
    .delete()
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .lte('total_seats', 10)
    .select('id');
  
  return {
    bookings: deletedBookings?.length ?? 0,
    slots: deletedSlots?.length ?? 0,
  };
}
