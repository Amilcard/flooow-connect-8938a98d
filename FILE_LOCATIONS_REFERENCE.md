# Reservation & Aids Flow - File Locations Quick Reference

## Edge Functions

### Bookings
- **File**: `/home/user/flooow-connect/supabase/functions/bookings/index.ts`
- **Routes**: POST (create), GET (retrieve), PATCH (validate/reject)
- **Key Logic**:
  - Lines 44-215: POST - Create booking with validation
  - Lines 217-252: GET - Retrieve booking
  - Lines 254-363: PATCH - Validate/reject booking
  - Lines 59-75: Idempotency check
  - Lines 93-120: Eligibility validation via RPC
  - Lines 136-184: Seat availability check
  - Lines 187-197: V1 auto-validation logic

### Simulate Aid
- **File**: `/home/user/flooow-connect/supabase/functions/simulate-aid/index.ts`
- **Route**: POST - Store aid simulation for analytics
- **Key Logic**:
  - Lines 39-49: Insert aid_simulations record
  - Lines 25-35: Validate input with AidSimulationSchema

### Shared Validation
- **File**: `/home/user/flooow-connect/supabase/functions/_shared/validation.ts`
- **Schemas**:
  - Lines 48-55: BookingSchema (activity_id, slot_id, child_id, etc.)
  - Lines 66-76: AidSimulationSchema (booking_id, simulated_aids, etc.)
  - Lines 79-91: Authentication schemas

---

## Database Migrations (SQL)

### Core Tables Schema

#### Bookings & Related Tables
- **File**: `/home/user/flooow-connect/supabase/migrations/20251013102632_2071f62c-5a33-4da9-8329-f7fe1b7d1d72.sql`
- **Contains**:
  - Lines 100-112: bookings table definition
  - Lines 114-122: aids table definition
  - Lines 396-414: RLS policies for bookings
  - Lines 175-187: RLS enable statements

#### Seat Management & Idempotency
- **File**: `/home/user/flooow-connect/supabase/migrations/20251013120202_7b86d4c3-98ea-467c-8171-42a1eccae921.sql`
- **Contains**:
  - Lines 1-55: decrement_seat_atomic() function
  - Lines 57-86: handle_booking_creation() trigger
  - Lines 87-95: Idempotency key constraint & index

#### Financial Aids Table
- **File**: `/home/user/flooow-connect/supabase/migrations/20251013152847_8716eb0a-f9a9-4993-a472-e163875bd211.sql`
- **Contains**:
  - Lines 1-46: financial_aids table definition
  - Lines 48-74: 8 sample financial aids data
  - Lines 27-40: RLS policies for financial_aids
  - Lines 21-25: Indexes (age, territory_codes, categories)

#### Aid Simulations Table
- **File**: `/home/user/flooow-connect/supabase/migrations/20251013161028_9254069e-6e26-453b-b8fc-08b2f0ebb749.sql`
- **Contains**:
  - Lines 9-29: aid_simulations table definition
  - Lines 31-56: RLS policies & indexes
  - Lines 105-119: aid_simulation_analytics view

#### Aid Simulations Constraints
- **File**: `/home/user/flooow-connect/supabase/migrations/20251013161356_49648fb2-e323-49da-b715-0d82dcc63ba4.sql`
- **Contains**:
  - Lines 10-18: aid_simulations table recreation with NOT NULL constraints
  - Lines 23-40: RLS policies

#### Eligibility & Period Validation
- **File**: `/home/user/flooow-connect/supabase/migrations/20251017082656_8dbb2173-a5d1-47f0-98de-bdca3052dcd8.sql`
- **Contains**:
  - Lines 68-142: validate_booking_eligibility() RPC function
  - Lines 14: period_type column add
  - Lines 28: vacation_periods column add
  - Lines 48-64: validate_booking_slot() trigger
  - Lines 147-173: vw_alternative_slots view

#### Aids Calculation Function
- **File**: `/home/user/flooow-connect/supabase/migrations/20251013153155_137d8882-3996-495b-be53-962d2e379f1f.sql`
- **Contains**:
  - Lines 1-52: calculate_eligible_aids() RPC function
  - Lines 16-19: Critical rule - if price <= 0, return empty
  - Lines 31-42: Territory matching logic
  - Lines 44-50: Sort by territory proximity

#### Financial Aids RLS Update
- **File**: `/home/user/flooow-connect/supabase/migrations/20251013154304_c74e6e70-a689-45da-9649-66456250e886.sql`
- **Contains**:
  - Lines 5-38: Updated RLS policies (public read, admin write)
  - Lines 41-95: Updated calculate_eligible_aids() with auth check

#### Validations Parentales Table
- **File**: `/home/user/flooow-connect/supabase/migrations/20251013150051_c6140d1d-f670-487d-bafb-769c55426d23.sql`
- **Contains**:
  - Lines 2-13: validations_parentales table definition
  - Lines 19-36: RLS policies (parents view/update own)
  - Lines 39-55: Indexes

#### Activity Enhancements
- **File**: `/home/user/flooow-connect/supabase/migrations/20251013104621_70e4f1bb-31fa-4b82-b9c4-b2e845066a00.sql`
- **Contains**:
  - Lines 27-29: express_flag & idempotency_key columns on bookings
  - Lines 28-29: idempotency_key index & unique constraint

#### Time Conflict Prevention
- **File**: `/home/user/flooow-connect/supabase/migrations/20251101000000_add_booking_time_conflict_prevention.sql`
- **Contains**:
  - Lines 32-101: check_booking_time_conflict() function
  - Lines 106-115: prevent_booking_time_conflicts trigger
  - Lines 120-256: Updated validate_booking_eligibility() with conflict check
  - Lines 261-264: Performance index idx_bookings_child_status_slot

#### RLS for GDPR Compliance
- **File**: `/home/user/flooow-connect/supabase/migrations/20251015142155_f47332b2-b41c-45e5-9662-0bd261877c24.sql`
- **Contains**:
  - Lines 4-18: Updated RLS policy for children (active bookings only)
  - Structures can only view children for en_attente/validee bookings with future slots

---

## Frontend Components

### Booking Flow
- **File**: `/home/user/flooow-connect/src/pages/Booking.tsx`
- **Lines 32-50**: Authentication check on mount
- **Lines 60-87**: Fetch activity and slot data
- **Lines 89-106**: Fetch user's children with auth check
- **Lines 108-165**: handleSubmit - call bookings edge function
- **Lines 137-145**: Edge function invocation with payload
- **Lines 254-291**: Child selection UI with RadioGroup

### Financial Aids Calculator
- **File**: `/home/user/flooow-connect/src/components/activities/FinancialAidsCalculator.tsx`
- **Lines 30-37**: Component props definition
- **Lines 42-45**: Critical check - if price <= 0, return null
- **Lines 47-73**: useEffect - call calculate_eligible_aids() RPC
- **Lines 53-60**: RPC parameters passed
- **Lines 75-78**: Calculation of totals and savings

### Financial Aid Badges
- **File**: `/home/user/flooow-connect/src/components/activities/FinancialAidBadges.tsx`
- **Lines 37-43**: Props (activityAcceptedAidSlugs, child criteria)
- **Lines 46-66**: useQuery - fetch relevant financial_aids
- **Lines 68-119**: getEligibilityStatus() - determines color/status
- **Lines 136-142**: Sort by eligibility status
- **Lines 171-224**: Render aid cards with eligibility icons

### Simulate Aid Modal
- **File**: `/home/user/flooow-connect/src/components/simulations/SimulateAidModal.tsx`
- **Lines 80-100**: Load user profile and children
- **Lines 162-218**: handleSimulate - call RPC and update results
- **Lines 192-199**: RPC function call with parameters
- **Lines 227-229**: Calculate total aid and final price
- **Lines 244-275**: Display activity info and form
- **Lines 384-455**: Display results with financial summary

### Financial Aid Selector (for Structures)
- **File**: `/home/user/flooow-connect/src/components/activities/FinancialAidSelector.tsx`
- **Lines 23-44**: Component props
- **Lines 47-78**: useQuery - fetch financial_aids by territory
- **Lines 81-87**: handleToggle - update selected aids
- **Lines 123-159**: Render aid checkboxes with territory badges

---

## Documentation

### Financial Aids README
- **File**: `/home/user/flooow-connect/src/components/activities/README_FINANCIAL_AIDS.md`
- **Sections**:
  - Database integration summary
  - Frontend components location
  - Test prerequisites & scenarios
  - Territory codes reference
  - Activity categories
  - Maintenance procedures
  - Manual RPC testing guide

---

## Key Database Functions by Purpose

### Booking Eligibility
```
Migration File: 20251017082656_*.sql (lines 68-142)
             AND 20251101000000_*.sql (lines 120-256)
Function: validate_booking_eligibility(child_id, activity_id, slot_id)
Checks: Age + Period + Time Conflicts
Returns: JSONB with eligible status and details
```

### Financial Aid Calculation
```
Migration File: 20251013153155_*.sql (lines 1-52)
             AND 20251013154304_*.sql (lines 41-95)
Function: calculate_eligible_aids(age, qf, city_code, price, duration, categories)
Checks: Age + QF + Territory + Category + Cumulativity
Returns: Array<{aid_name, amount, territory_level, official_link}>
```

### Seat Management
```
Migration File: 20251013120202_*.sql (lines 1-86)
Functions:
  - decrement_seat_atomic(slot_id, booking_id): Thread-safe decrement
  - handle_booking_creation(): Trigger that calls decrement_seat_atomic
Trigger: on_booking_created (AFTER INSERT)
```

### Time Conflict Prevention
```
Migration File: 20251101000000_*.sql (lines 32-101)
Function: check_booking_time_conflict()
Trigger: prevent_booking_time_conflicts (BEFORE INSERT/UPDATE)
Prevents: Overlapping bookings for same child (overlap: start < end AND end > start)
```

---

## Key Data Structures

### Aid Simulation Record (INSERT to aid_simulations)
```json
{
  "user_id": "uuid",
  "child_id": "uuid",
  "activity_id": "uuid",
  "booking_id": "uuid (optional)",
  "simulated_aids": [
    {
      "aid_name": "string",
      "amount": number,
      "territory_level": "national|region|metropole|commune",
      "official_link": "string|null"
    }
  ]
}
```

### Booking History Entry (JSONB array)
```json
[
  {
    "timestamp": "ISO timestamp",
    "action": "auto_validated_v1|seat_reserved",
    "reason": "string (optional)",
    "seats_before": number,
    "seats_after": number
  }
]
```

### Eligibility Check Response
```json
{
  "eligible": boolean,
  "reason": "age_mismatch|slot_outside_period|time_conflict|child_not_found",
  "message": "Localized error message",
  "child_age": number,
  "child_name": "string",
  "activity_age_range": {"min": number, "max": number},
  "slot_start": "ISO timestamp",
  "slot_end": "ISO timestamp",
  "conflicting_booking": {"activity_title": "string", "start": "timestamp", "end": "timestamp"}
}
```

---

## Validation Schema Locations

### BookingSchema (Zod)
File: `/supabase/functions/_shared/validation.ts` (lines 48-55)
- activity_id: string.uuid()
- slot_id: string.uuid()
- child_id: string.uuid()
- idempotency_key: optional, string.min(1).max(100)
- express_flag: boolean.default(false)
- transport_mode: enum['walking', 'bus', 'car', 'bike', 'covoiturage', 'non_renseigne']

### AidSimulationSchema (Zod)
File: `/supabase/functions/_shared/validation.ts` (lines 66-76)
- booking_id: optional string.uuid()
- child_id: optional string.uuid()
- activity_id: required string.uuid()
- simulated_aids: array of {aid_name, amount, territory_level, official_link}
  - max 20 aids per simulation
  - amount must be positive and ≤ 10000€

---

## Migration Execution Order (by date)

1. 20251013102632: Core tables (bookings, aids, RLS)
2. 20251013104621: Add express_flag, idempotency_key
3. 20251013120202: Seat management & atomic decrement
4. 20251013150051: validations_parentales table
5. 20251013150349: Security definer fixes
6. 20251013152847: financial_aids table with data
7. 20251013153155: calculate_eligible_aids() function
8. 20251013154304: RLS policies update
9. 20251013161028: aid_simulations table
10. 20251013161356: Constraints fix
11. 20251015142155: GDPR RLS for children
12. 20251017082656: Period validation & eligibility
13. 20251101000000: Time conflict prevention

