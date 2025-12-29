import { test, expect } from '@playwright/test';
import { supabaseAdmin, getSlotSeats, createTestSlot, getActivityByTitle } from './utils/db-helpers';
import { testActivities, generateIdempotencyKey } from './fixtures/test-data';

test.describe('Scenario 7: Concurrency Stress Test', () => {
  let activityId: string;
  let slotId: string;
  const CONCURRENT_REQUESTS = 10;
  const INITIAL_SEATS = 5;

  test.beforeAll(async () => {
    // Get activity
    const activity = await getActivityByTitle(testActivities.tennis.title);
    activityId = activity.id;
    
    // Create slot with limited seats
    const slot = await createTestSlot(activityId, INITIAL_SEATS);
    slotId = slot.id;
  });

  test('should prevent overbooking with concurrent requests', async () => {
    const startTime = Date.now();
    
    // Create N concurrent booking requests
    const bookingPromises = Array.from({ length: CONCURRENT_REQUESTS }, async (_, i) => {
      const idempotencyKey = generateIdempotencyKey();
      
      try {
        const { data, error } = await supabaseAdmin
          .from('bookings')
          .insert({
            activity_id: activityId,
            slot_id: slotId,
            child_id: 'test-child-id', // Mock child ID
            user_id: 'test-user-id', // Mock user ID
            status: 'en_attente',
            idempotency_key: idempotencyKey,
            express_flag: false,
          })
          .select()
          .single();
        
        return { success: !error, error, attempt: i + 1 };
      } catch (err) {
        return { success: false, error: err, attempt: i + 1 };
      }
    });

    // Execute all requests concurrently
    const results = await Promise.all(bookingPromises);
    
    const duration = Date.now() - startTime;
    
    // Count successful bookings
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log("\n📊 Concurrency Test Results:");
    console.log(`   Total attempts: ${CONCURRENT_REQUESTS}`);
    console.log(`   Successful: ${successful}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Duration: ${duration}ms`);
    
    // Verify final seat count
    const finalSeats = await getSlotSeats(slotId);
    const expectedSeats = INITIAL_SEATS - successful;
    
    console.log(`   Initial seats: ${INITIAL_SEATS}`);
    console.log(`   Final seats: ${finalSeats}`);
    console.log(`   Expected seats: ${expectedSeats}`);
    
    // CRITICAL ASSERTION: No overbooking
    expect(finalSeats).toBe(expectedSeats);
    expect(finalSeats).toBeGreaterThanOrEqual(0);
    
    // Should have accepted only up to available seats
    expect(successful).toBeLessThanOrEqual(INITIAL_SEATS);
    
    // At least some requests should have succeeded
    expect(successful).toBeGreaterThan(0);
    
    console.log("\n✅ PASS: Zero overbooking detected - atomicity preserved");
  });

  test('should handle rapid duplicate requests with idempotency', async () => {
    const idempotencyKey = generateIdempotencyKey();
    const DUPLICATE_ATTEMPTS = 5;
    
    // Send same booking request multiple times simultaneously
    const duplicatePromises = Array.from({ length: DUPLICATE_ATTEMPTS }, async () => {
      try {
        const { data, error } = await supabaseAdmin
          .from('bookings')
          .insert({
            activity_id: activityId,
            slot_id: slotId,
            child_id: 'test-child-duplicate',
            user_id: 'test-user-duplicate',
            status: 'en_attente',
            idempotency_key: idempotencyKey, // SAME KEY
            express_flag: false,
          })
          .select()
          .single();
        
        return { success: !error, error };
      } catch (err) {
        return { success: false, error: err };
      }
    });

    const results = await Promise.all(duplicatePromises);
    
    // Only ONE should succeed due to unique constraint on idempotency_key
    const successful = results.filter(r => r.success).length;
    
    console.log("\n🔒 Idempotency Test Results:");
    console.log(`   Duplicate attempts: ${DUPLICATE_ATTEMPTS}`);
    console.log(`   Successful: ${successful}`);
    console.log(`   Rejected: ${DUPLICATE_ATTEMPTS - successful}`);
    
    // CRITICAL: Exactly one request should succeed
    expect(successful).toBe(1);
    
    console.log("✅ PASS: Idempotency constraint working - only 1 booking created");
  });
});
