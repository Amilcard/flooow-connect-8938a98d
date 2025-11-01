# Reservation & Financial Aids Flow - Comprehensive Analysis

## 1. EDGE FUNCTIONS (Backend API Layer)

### A. Bookings Edge Function
**Location**: `/supabase/functions/bookings/index.ts`

#### Routes:
1. **POST** - Create Booking
   - Validates JWT token
   - Checks idempotency (prevents duplicates)
   - Verifies child belongs to user
   - Calls `validate_booking_eligibility()` RPC for age/period/conflict checks
   - Checks seat availability
   - Sets booking status based on `express_flag`:
     - `express_flag=true` → status='validee' (auto-validated for V1 demo)
     - `express_flag=false` → status='en_attente' (pending validation)
   - Creates validations_parentales record for audit trail
   - Trigger atomically decrements seats_remaining

2. **GET** - Retrieve Booking by ID
   - Requires booking_id query param
   - Returns booking with activity, child, and slot details
   - Only accessible by booking owner (user_id check)

3. **PATCH** - Validate/Reject Booking
   - Requires booking_id and action (accept/reject) in body
   - Validates user has 'structure' role
   - Verifies structure manages the activity
   - Updates booking status to 'validee' or 'refusee'

#### Request Payload (Booking Creation):
```json
{
  "activity_id": "uuid",
  "slot_id": "uuid",
  "child_id": "uuid",
  "idempotency_key": "booking_timestamp_hash (optional)",
  "express_flag": false,
  "transport_mode": "non_renseigne"
}
```

#### Response (Success):
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "activity_id": "uuid",
  "slot_id": "uuid",
  "child_id": "uuid",
  "status": "en_attente|validee",
  "idempotent": false,
  "seats_remaining_after": number,
  "created_at": "timestamp"
}
```

### B. Simulate Aid Edge Function
**Location**: `/supabase/functions/simulate-aid/index.ts`

#### Route:
**POST** - Store Aid Simulation
- Validates JWT token
- Receives booking_id, child_id, activity_id, simulated_aids
- Inserts record to aid_simulations table for analytics
- No calculation done here (calculation happens in frontend via RPC)

---

## 2. DATABASE SCHEMA

### A. Bookings Table
```sql
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY,
  activity_id UUID (refs activities),
  slot_id UUID (refs availability_slots),
  child_id UUID (refs children),
  user_id UUID (refs profiles),
  status booking_status ('en_attente', 'validee', 'refusee', 'annulee'),
  express_flag BOOLEAN DEFAULT false,
  idempotency_key TEXT UNIQUE,
  reason_code TEXT,
  history JSONB DEFAULT '[]',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**Key Features**:
- `idempotency_key`: Prevents duplicate bookings (same request sent twice)
- `express_flag`: V1 feature for auto-validation
- `history`: JSONB array tracking all state changes
- `status`: Enum with 4 states

### B. Financial Aids Table
```sql
CREATE TABLE public.financial_aids (
  id UUID PRIMARY KEY,
  name TEXT,
  slug TEXT UNIQUE,
  age_min INTEGER, age_max INTEGER,
  amount_type TEXT ('fixed' | 'per_day'),
  amount_value NUMERIC,
  qf_max INTEGER (max quotient familial),
  territory_level TEXT ('national'|'region'|'metropole'|'commune'),
  territory_codes TEXT[] (INSEE codes),
  categories TEXT[] (activity categories),
  cumulative BOOLEAN DEFAULT true,
  official_link TEXT,
  active BOOLEAN DEFAULT true
)
```

**Sample Data** (8 aids):
- Pass Culture Activités: 40€, national, age 6-17
- Pass'Sport: 50€, national, age 6-17, QF≤1200
- Chèques Vacances: 50€, national, age 6-17
- Bons Vacances CAF: 2€/day, national, age 6-17, QF≤600
- Pass'Région AURA: 20€, region 84, age 15-18
- Carte M'RA: 21€, metropole 200071108 (Saint-Étienne), age 6-17
- CCAS Saint-Étienne: 12€, commune 42218, age 6-17, QF≤300
- CCAS Firminy/Ricamarie: 12€, communes 42095/42184, age 6-17, QF≤300

### C. Aid Simulations Table
```sql
CREATE TABLE public.aid_simulations (
  id UUID PRIMARY KEY,
  user_id UUID,
  child_id UUID,
  activity_id UUID,
  booking_id UUID,
  simulated_aids JSONB DEFAULT '[]',
  created_at TIMESTAMP
)
```

### D. Validations Parentales Table
```sql
CREATE TABLE public.validations_parentales (
  id UUID PRIMARY KEY,
  booking_id UUID UNIQUE (refs bookings),
  parent_id UUID (refs auth.users),
  status VARCHAR ('en_attente'|'validee'|'refusee'),
  validated_at TIMESTAMP,
  reason_refus TEXT,
  reminders_sent INTEGER DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### E. Availability Slots Table
```sql
CREATE TABLE public.availability_slots (
  id UUID PRIMARY KEY,
  activity_id UUID (refs activities),
  start TIMESTAMPTZ,
  end TIMESTAMPTZ,
  seats_total INTEGER,
  seats_remaining INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

---

## 3. DATABASE FUNCTIONS (RPC & Triggers)

### A. `validate_booking_eligibility()`
**Purpose**: Multi-layer validation before booking creation

**Checks** (in order):
1. **Child Exists**: Verifies child_id is valid
2. **Age Match**: `child_age BETWEEN activity.age_min AND activity.age_max`
3. **Period Check**: `slot.start BETWEEN 2025-11-01 AND 2026-08-30`
4. **Time Conflict**: NEW booking slot doesn't overlap with existing active bookings for same child
   - Overlap detection: `(new_start < existing_end) AND (new_end > existing_start)`
   - Only checks status IN ('en_attente', 'validee')

**Returns JSONB**:
```json
{
  "eligible": true|false,
  "reason": "age_mismatch|slot_outside_period|time_conflict|child_not_found",
  "message": "user-friendly message",
  "child_age": number,
  "child_name": string,
  "activity_age_range": {min, max},
  "slot_start": timestamp,
  "slot_end": timestamp
}
```

### B. `calculate_eligible_aids()`
**RPC Function - Called from Frontend**

**Parameters**:
- `p_age`: INT (calculated from child's DOB)
- `p_qf`: INT (quotient familial from user profile)
- `p_city_code`: TEXT (INSEE commune code)
- `p_activity_price`: DECIMAL
- `p_duration_days`: INT
- `p_categories`: TEXT[] (activity categories)

**Filters Applied** (AND conditions):
1. Aid is active: `fa.active = true`
2. Age range: `p_age BETWEEN fa.age_min AND fa.age_max`
3. QF check: `fa.qf_max IS NULL OR p_qf ≤ fa.qf_max`
4. Territory match:
   - National aids apply everywhere
   - Regional aids: code must be in territory_codes AND match region 84 (AURA)
   - Metropole/Commune aids: p_city_code must match territory_codes
5. Category overlap: `fa.categories && p_categories` (PostgreSQL array overlap)
6. Cumulative: `fa.cumulative = true`

**Amount Calculation**:
- Fixed aids: use `amount_value` as-is
- Per-day aids: `amount_value * p_duration_days`

**Order By**:
1. Territory proximity (commune > metropole > region > national)
2. Amount DESC

**Returns**: Array of:
```json
{
  "aid_name": string,
  "amount": decimal,
  "territory_level": string,
  "official_link": string|null
}
```

### C. `decrement_seat_atomic()`
**Purpose**: Thread-safe seat reservation

**Logic**:
1. Locks slot row with `FOR UPDATE` (prevents race conditions)
2. Checks if `seats_remaining > 0`
3. Decrements: `seats_remaining = seats_remaining - 1`
4. Updates booking history with seat change log

### D. Triggers

#### `on_booking_created` (AFTER INSERT)
- Calls `handle_booking_creation()` → `decrement_seat_atomic()`
- Raises error if seats unavailable

#### `prevent_booking_time_conflicts` (BEFORE INSERT/UPDATE)
- Calls `check_booking_time_conflict()`
- Prevents overlapping bookings for same child

#### `enforce_slot_id_on_booking` (BEFORE INSERT)
- Validates slot_id is NOT NULL

---

## 4. FRONTEND FLOW

### A. Booking Creation Flow
**File**: `src/pages/Booking.tsx`

**Step 1**: User arrives at booking page
- URL: `/booking/:id?slotId=uuid`
- Validates user is authenticated
- Fetches activity, slot, and user's children

**Step 2**: Child Selection
- Shows RadioGroup of user's children
- Auto-saves selection to localStorage draft

**Step 3**: Confirmation
- User clicks "Confirmer la demande"
- Calls edge function:
```typescript
const { data, error } = await supabase.functions.invoke("bookings", {
  body: {
    activity_id: id,
    slot_id: slotId,
    child_id: selectedChildId,
    idempotency_key: `booking_${id}_${slotId}_${childId}_${timestamp}`,
    express_flag: false
  }
});
```

**Step 4**: Response Handling
- On success: Navigate to `/booking-status/{booking_id}`
- On error: Show toast with error message (seat conflict, age mismatch, time conflict, etc.)

**Possible Errors**:
- `not_eligible`: Age/period/time conflict detected
- `no_seats_available`: Seat count = 0
- `invalid_token`: User not authenticated
- `child_not_found_or_unauthorized`: Child doesn't belong to user

### B. Financial Aids Calculator Flow
**File**: `src/components/activities/FinancialAidsCalculator.tsx`

**Trigger**: User opens activity detail page (if price > 0)

**Process**:
1. Component receives: price, categories, childAge, quotientFamilial, cityCode, durationDays
2. On mount, calls RPC function:
```typescript
const { data, error: rpcError } = await supabase.rpc('calculate_eligible_aids', {
  p_age: childAge,
  p_qf: quotientFamilial,
  p_city_code: cityCode,
  p_activity_price: activityPrice,
  p_duration_days: durationDays,
  p_categories: activityCategories
});
```

3. Displays results:
   - List of eligible aids with amounts
   - Total aid amount
   - Remaining price (price - total aids)
   - Savings percentage (if > 30%, show badge)

**Data Requirements**:
- Child's date of birth (to calculate age)
- Parent's quotient_familial (from profiles.profile_json)
- Parent's city_code/postal_code (from profiles.profile_json)

### C. Simulation Modal Flow
**File**: `src/components/simulations/SimulateAidModal.tsx`

**When Opened**:
1. Loads user profile and children list
2. Pre-fills form with stored profile data

**User Actions**:
1. Select child from dropdown
2. Enter/confirm quotient familial
3. Select city from list
4. Click "Calculer mes aides"

**Calculation**:
- Calls same RPC as calculator
- Displays results in modal
- Shows total savings

### D. Financial Aid Badges Component
**File**: `src/components/activities/FinancialAidBadges.tsx`

**Purpose**: Show which aids are compatible with specific activity

**Inputs**:
- activityAcceptedAidSlugs: Structure selected which aids they accept
- Activity categories, child age, QF, city code

**Logic**:
1. Filters financial_aids by:
   - Active = true
   - slug IN activityAcceptedAidSlugs
   - Categories overlap with activity categories

2. For each aid, calculates eligibility:
   - GREEN (✓ Eligible): Passes age and QF checks
   - YELLOW (? Verify): QF is 0 (not provided in profile)
   - GRAY (✗ Not eligible): Doesn't meet criteria

### E. Financial Aid Selector (for Structures)
**File**: `src/components/activities/FinancialAidSelector.tsx`

**Purpose**: Let structures choose which aids they accept

**Logic**:
1. Fetches all active financial_aids
2. Groups by territory level
3. Structure checks boxes to enable/disable aids
4. Stores selection in activities.accepts_aid_types

---

## 5. RLS (ROW LEVEL SECURITY) POLICIES

### Bookings
```sql
-- Users can view own bookings
USING (auth.uid() = user_id)

-- Users can create bookings
WITH CHECK (auth.uid() = user_id)

-- Structures can view/manage bookings for their activities
USING (has_role(auth.uid(), 'structure') 
  AND EXISTS (SELECT 1 FROM activities a 
    WHERE a.id = bookings.activity_id))
```

### Financial Aids
```sql
-- All authenticated users can read active aids
SELECT: USING (active = true)

-- Only admins can write
INSERT/UPDATE/DELETE: WITH CHECK (
  has_role(auth.uid(), 'superadmin') OR 
  has_role(auth.uid(), 'territory_admin')
)
```

### Aid Simulations
```sql
-- Users can view own simulations
SELECT: USING (auth.uid() = user_id)

-- Users can create simulations
INSERT: WITH CHECK (auth.uid() = user_id)

-- Admins can view all
SELECT: USING (has_role(auth.uid(), 'superadmin') OR 
  has_role(auth.uid(), 'territory_admin'))
```

### Children
```sql
-- Users can manage own children
ALL: USING (auth.uid() = user_id)

-- Structures can view children ONLY for active bookings
SELECT: USING (has_role(auth.uid(), 'structure') AND EXISTS (
  SELECT 1 FROM bookings b
  JOIN activities a ON b.activity_id = a.id
  WHERE b.child_id = children.id 
    AND b.status IN ('en_attente', 'validee')
    AND s.end > NOW()
))
```

---

## 6. DATA FLOW DIAGRAM

```
User Opens Activity
     ↓
[FinancialAidsCalculator.tsx]
     ↓
Calls RPC: calculate_eligible_aids()
     ↓
[Database Function]
- Checks age range ✓
- Checks QF max ✓
- Checks territory ✓
- Checks categories ✓
- Calculates amounts (fixed or per day)
     ↓
Returns Array<FinancialAid>
     ↓
Frontend Displays:
- List of eligible aids
- Total aid amount
- Remaining price
- Savings percentage badge
```

### Booking Creation Flow

```
User Clicks "Confirmer"
     ↓
POST /functions/bookings
{activity_id, slot_id, child_id, idempotency_key, express_flag}
     ↓
[Edge Function Validates]
- JWT authentication ✓
- Check idempotency (prevent duplicates) ✓
- Verify child belongs to user ✓
- Call validate_booking_eligibility() RPC
  → Age check ✓
  → Period check ✓
  → Time conflict check ✓
- Check seat availability ✓
     ↓
Set booking status:
- express_flag=true → 'validee'
- express_flag=false → 'en_attente'
     ↓
INSERT bookings record
     ↓
[Trigger: on_booking_created]
- Call decrement_seat_atomic()
  → Lock slot row
  → Decrement seats_remaining
  → Update booking history
     ↓
INSERT validations_parentales record
     ↓
Return: {booking_id, status, seats_remaining_after}
     ↓
Frontend: Navigate to /booking-status/{booking_id}
```

---

## 7. ERROR HANDLING PATTERNS

### Edge Function Errors

| Error Code | HTTP Status | Meaning | Handled By |
|-----------|------------|---------|-----------|
| missing_authorization | 401 | No JWT token | Frontend must login |
| invalid_token | 401 | Token expired/invalid | Refresh required |
| child_not_found_or_unauthorized | 403 | Child doesn't belong to user | User error |
| not_eligible | 400 | Age/period/conflict failed | Show detailed message |
| no_seats_available | 409 | Conflict - no seats | Show alternatives |
| booking_creation_failed | 500 | Database error | Retry or contact support |
| eligibility_check_failed | 500 | RPC function error | Contact support |

### RPC Function Errors

| Function | Error | Handling |
|----------|-------|----------|
| calculate_eligible_aids | RAISE EXCEPTION if auth.uid() IS NULL | Requires login |
| calculate_eligible_aids | Empty result if activity_price ≤ 0 | Don't show component |
| validate_booking_eligibility | JSONB with eligible=false | Return reason details |
| decrement_seat_atomic | EXCEPTION: NO_SEATS_AVAILABLE | Trigger raises error |

---

## 8. KEY VALIDATION RULES

### Aids Eligibility
```
ELIGIBLE IF:
age BETWEEN aid.age_min AND aid.age_max
AND (aid.qf_max IS NULL OR qf ≤ aid.qf_max)
AND (aid.territory_level = 'national' 
     OR (aid.territory_level = 'region' AND '84' IN aid.territory_codes)
     OR (aid.territory_level IN ('metropole','commune') AND city_code IN aid.territory_codes))
AND aid.categories && activity_categories
AND aid.cumulative = true
```

### Booking Eligibility
```
ELIGIBLE IF:
child_age BETWEEN activity.age_min AND activity.age_max
AND slot.start BETWEEN '2025-11-01' AND '2026-08-30'
AND NO overlapping bookings for same child
  (Overlap: new_start < existing_end AND new_end > existing_start)
```

### Seat Availability
```
AVAILABLE IF:
slot.seats_remaining > 0
(Checked atomically with FOR UPDATE lock)
```

---

## 9. CRITICAL BUSINESS RULES

1. **Idempotency**: Same request twice = returns same booking (not duplicate)
2. **Express Flag**: V1 demo auto-validates; production uses parent validation
3. **Seat Atomicity**: Database lock prevents overselling even with race conditions
4. **Time Conflict Prevention**: Child cannot have overlapping activities
5. **Age Constraints**: Hard enforcement - activity has min/max age
6. **Period Window**: All bookings must be within 2025-11-01 to 2026-08-30
7. **QF Privacy**: QF check is optional (NULL = no restriction)
8. **Territory Hierarchy**: Aids prioritized by proximity (commune > metropole > region > national)
9. **Cumulative Aids**: All eligible aids can be stacked (not one-per-activity)
10. **Activity Acceptance**: Structures choose which aids they accept

