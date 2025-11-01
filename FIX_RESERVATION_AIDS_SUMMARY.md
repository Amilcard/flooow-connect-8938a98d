# Fix: Reservation Financial Aids Validation

## Problem Statement

**Symptom**: When users click "Confirmer la demande" after a successful aids simulation, they receive a red toast error: `'Edge Function returned a non-2xx status code'`.

**Root Causes Identified**:

1. ❌ **Missing Database Columns**: The `bookings` table had no columns to store pricing or aids data
2. ❌ **No Server-Side Validation**: Financial aids were calculated only on frontend, never validated or stored server-side
3. ❌ **Incomplete Data Flow**: Edge function didn't receive, calculate, or store aids information
4. ❌ **Poor Error Messages**: Generic error responses didn't provide actionable information to users

## Solution Implemented

### 1. Database Schema Enhancement

**File**: `supabase/migrations/20251101120000_add_pricing_aids_to_bookings.sql`

Added 4 new columns to `bookings` table:
- `base_price_cents INT NOT NULL DEFAULT 0` - Activity base price in cents
- `aids_total_cents INT NOT NULL DEFAULT 0` - Total financial aids in cents
- `final_price_cents INT NOT NULL DEFAULT 0` - Final price to pay (base - aids)
- `aids_applied JSONB DEFAULT '[]'` - Array of applied aids with details

**Constraints Added**:
```sql
CHECK (base_price_cents >= 0 AND aids_total_cents >= 0 AND final_price_cents >= 0)
CHECK (final_price_cents <= base_price_cents)
CHECK (aids_total_cents <= base_price_cents)
```

**Analytics View**:
- Created `booking_pricing_analytics` view for tracking aids usage rate and amounts

### 2. Edge Function Enhancement

**File**: `supabase/functions/bookings/index.ts`

**New Logic Flow**:

```
1. JWT Validation ✓
2. Idempotency Check ✓
3. Child Ownership Verification ✓
4. Eligibility Validation (age, period, conflicts) ✓
5. ✨ NEW: Server-Side Aids Calculation
   - Fetch activity price and category
   - Calculate child's age from DOB
   - Get user's quotient familial and city code from profile
   - Calculate slot duration for per-day aids
   - Call calculate_eligible_aids() RPC function
   - Convert aids to cents
   - Apply min(aids_total, base_price) cap
6. ✨ NEW: Calculate Final Price (base - aids)
7. Create Booking with Pricing Data
8. Decrement Seats Atomically (trigger)
9. ✨ NEW: Return Pricing Breakdown to Frontend
```

**Error Handling Improvements**:

All errors now follow structured format:
```json
{
  "code": "ERROR_CODE",
  "message": "User-friendly message in French",
  "hint": "Actionable suggestion",
  "details": {}
}
```

Error codes implemented:
- `CHILD_NOT_FOUND_OR_UNAUTHORIZED`
- `ELIGIBILITY_CHECK_FAILED`
- `NOT_ELIGIBLE`
- `SLOT_NOT_FOUND`
- `NO_SEATS_AVAILABLE`
- `ACTIVITY_NOT_FOUND`
- `RLS_DENIED`
- `CONSTRAINT_VIOLATION`
- `BOOKING_CREATION_FAILED`

### 3. Frontend Enhancement

**File**: `src/pages/Booking.tsx`

**Changes**:
- ✅ Parse structured error responses
- ✅ Display pricing breakdown in success toast
- ✅ Show detailed error messages with hints

Example success message:
```
"Prix initial: 180€ - Aides: 50€ = 130€ à payer"
```

**File**: `src/pages/BookingStatus.tsx`

**Changes**:
- ✅ Display pricing breakdown in booking details
- ✅ Show list of applied aids with individual amounts
- ✅ Highlight final price to pay

Display format:
```
Tarification
  Prix initial         180.00€
  Aides financières    -50.00€
    • Pass'Sport       -50.00€
  ─────────────────────────────
  Reste à payer        130.00€
```

## Technical Details

### Server-Side Aids Calculation

The edge function now performs complete aids calculation using the existing `calculate_eligible_aids()` RPC function:

```typescript
const { data: eligibleAids } = await supabase.rpc('calculate_eligible_aids', {
  p_age: childAge,
  p_qf: quotientFamilial,
  p_city_code: cityCode,
  p_activity_price: activity.price_base,
  p_duration_days: durationDays,
  p_categories: [activity.category]
});
```

This ensures:
1. **Consistency**: Same calculation logic as frontend preview
2. **Security**: Server validates aids eligibility (don't trust client)
3. **Accuracy**: Uses latest child/profile data from database
4. **Auditability**: All applied aids are stored in `aids_applied` JSONB

### Payload Contract

**Frontend → Edge Function**:
```json
{
  "activity_id": "uuid",
  "slot_id": "uuid",
  "child_id": "uuid",
  "idempotency_key": "string",
  "express_flag": boolean
}
```

**Edge Function → Frontend** (Success):
```json
{
  "id": "uuid",
  "status": "en_attente|validee",
  "base_price_cents": 18000,
  "aids_total_cents": 5000,
  "final_price_cents": 13000,
  "aids_applied": [
    {
      "aid_name": "Pass'Sport",
      "amount_cents": 5000,
      "territory_level": "national"
    }
  ],
  "pricing": {
    "base_price_euros": 180,
    "aids_total_euros": 50,
    "final_price_euros": 130,
    "aids_applied": [...]
  },
  "seats_remaining_after": 7,
  ...
}
```

**Edge Function → Frontend** (Error):
```json
{
  "code": "NOT_ELIGIBLE",
  "message": "Cette activité est réservée aux 6-16 ans. Marie a 18 ans.",
  "hint": "Vérifiez l'âge de l'enfant, la période et les conflits horaires",
  "reason": "age_mismatch",
  "details": {...}
}
```

## Testing Scenarios

### ✅ S1: Free Activity (price = 0)
- **Expected**: Booking created with all price fields = 0, no aids
- **Result**: `base_price_cents=0, aids_total_cents=0, final_price_cents=0`

### ✅ S2: Paid Activity with Eligible Aids
- **Given**: Activity price = 180€, child eligible for Pass'Sport (50€)
- **Expected**: Aids calculated server-side and applied
- **Result**: `base=18000¢, aids=5000¢, final=13000¢`

### ✅ S3: Paid Activity without Eligible Aids
- **Given**: Activity price = 180€, QF too high for any aid
- **Expected**: Booking created with aids=0
- **Result**: `base=18000¢, aids=0¢, final=18000¢`

### ✅ S4: Aids Exceed Base Price
- **Given**: Activity price = 20€, eligible aids total 70€
- **Expected**: Aids capped at base price
- **Result**: `base=2000¢, aids=2000¢, final=0¢`

### ✅ S5: RLS Violation
- **Given**: User tries to book with another user's child
- **Expected**: 403 error with clear message
- **Result**: `CHILD_NOT_FOUND_OR_UNAUTHORIZED` error

### ✅ S6: Age Mismatch
- **Given**: Child is 18, activity is 6-16 years
- **Expected**: 400 error with details
- **Result**: `NOT_ELIGIBLE` with reason and child/activity ages

## Files Changed

```
supabase/
  migrations/
    20251101120000_add_pricing_aids_to_bookings.sql   [NEW]

supabase/functions/
  bookings/
    index.ts                                          [MODIFIED]

src/
  pages/
    Booking.tsx                                       [MODIFIED]
    BookingStatus.tsx                                 [MODIFIED]
```

## Migration Notes

The migration is **backward compatible**:
- New columns have DEFAULT values
- Existing bookings will have `base_price_cents=0` (considered free)
- No data loss or breaking changes

To apply migration:
```bash
supabase db reset  # Local development
# OR
git push  # Triggers auto-deployment with migration
```

## Acceptance Criteria Status

✅ **Plus aucun toast rouge générique**
- Structured error messages with code, message, hint

✅ **Le montant final affiché après clic = montant validé par serveur**
- Server calculates aids, frontend displays returned values

✅ **Réservation créée (status 'pending') visible dans dashboard**
- BookingStatus.tsx shows full pricing breakdown

✅ **Journal d'erreurs Edge Function lisible et concis**
- Logs follow format: `{path, step, err_code, detail}`

## Next Steps (Optional Enhancements)

1. **Aid Simulation Storage**: Link `aid_simulations` table to `bookings.id` when booking is confirmed
2. **Conversion Tracking**: Update `aid_simulations.converted_to_booking = true`
3. **Email Notifications**: Include pricing breakdown in confirmation emails
4. **Admin Dashboard**: Show aids usage analytics via `booking_pricing_analytics` view
5. **Refund Logic**: Add support for partial refunds when aids are applied

## Author

Claude Code Agent
Date: 2025-11-01
Session: claude/fix-reservation-aids-validation-011CUhLma4PHTBfHzPod2dLa
