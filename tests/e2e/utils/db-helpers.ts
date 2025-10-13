import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin client for test setup/teardown
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Clean up test data after tests
 */
export async function cleanupTestData(email: string) {
  // Delete user and cascade will handle related data
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  const testUser = users.users.find(u => u.email === email);
  
  if (testUser) {
    await supabaseAdmin.auth.admin.deleteUser(testUser.id);
  }
}

/**
 * Create test activity slot
 */
export async function createTestSlot(activityId: string, seatsRemaining: number) {
  const start = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 days
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // +2 hours
  
  const { data, error } = await supabaseAdmin
    .from('availability_slots')
    .insert({
      activity_id: activityId,
      start: start.toISOString(),
      end: end.toISOString(),
      seats_total: seatsRemaining,
      seats_remaining: seatsRemaining,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Get activity by title
 */
export async function getActivityByTitle(title: string) {
  const { data, error } = await supabaseAdmin
    .from('activities')
    .select('*')
    .eq('title', title)
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Check booking exists with idempotency
 */
export async function checkBookingExists(idempotencyKey: string) {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();
  
  return data !== null;
}

/**
 * Get slot remaining seats (for concurrency tests)
 */
export async function getSlotSeats(slotId: string) {
  const { data, error } = await supabaseAdmin
    .from('availability_slots')
    .select('seats_remaining')
    .eq('id', slotId)
    .single();
  
  if (error) throw error;
  return data.seats_remaining;
}
