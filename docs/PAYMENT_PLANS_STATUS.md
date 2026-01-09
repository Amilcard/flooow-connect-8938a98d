# Payment Plans - Current Status

**Date**: 2026-01-09
**Status**: ⚠️ **PARTIALLY IMPLEMENTED** - Display only, not enforced in bookings

---

## Overview

`payment_plans` is a JSONB column in the `activities` table that stores flexible pricing options (installments, multiple price tiers). It is displayed in the UI but **NOT used** during the booking flow.

---

## Schema

### Database Column
```sql
-- activities table
payment_echelonned BOOLEAN DEFAULT false  -- Flag to enable payment plans
payment_plans JSONB DEFAULT '[]'::jsonb  -- Array of pricing options
```

### Data Structure (2 formats found)

**Format 1** - Installments:
```json
[
  {
    "name": "3 fois",
    "installments": 3,
    "description": "3 mensualités sans frais"
  }
]
```

**Format 2** - Price tiers:
```json
[
  {
    "type": "semaine",
    "price": 120,
    "label": "Semaine complète"
  },
  {
    "type": "jour",
    "price": 30,
    "label": "À la journée"
  }
]
```

---

## Current Usage

### ✅ Frontend Display (2 locations)

1. **ActivityDetail.tsx (lines 168-180)**
   - Checks `activity.payment_echelonned && activity.payment_plans.length > 0`
   - Displays installment plans with name and description
   - Uses Format 1 structure

2. **BookingCard.tsx (lines 118-129)**
   - Displays price tier options
   - Maps over `payment_plans` with `{label, price}` structure
   - Uses Format 2 structure

### ❌ Backend Booking Logic (NOT USED)

**Edge function**: `supabase/functions/bookings/index.ts`
- Line 221: `const effectivePrice = slot.price_override ?? activity.price_base ?? 0;`
- **Does NOT consider `payment_plans`**
- Only uses:
  - `slot.price_override` (custom slot pricing)
  - `activity.price_base` (default activity price)

---

## Problem Summary

| Aspect | Status | Issue |
|--------|--------|-------|
| **Database** | ✅ Defined | Column exists with JSONB type |
| **Data** | ⚠️ Partial | Some activities have plans (migration 20251016141346) |
| **Frontend** | ⚠️ Display only | Shows plans but doesn't allow selection |
| **Backend** | ❌ Ignored | Edge function doesn't use plans for pricing |
| **User Experience** | ⚠️ Misleading | Users see options but can't choose them |

---

## Impact

### Current Behavior
1. User sees "Semaine complète: 120€" and "À la journée: 30€" in UI
2. User books the activity
3. **Edge function charges `price_base` (e.g., 120€) regardless of user's implied choice**
4. No mechanism to capture which plan the user selected

### Risk
- **Low immediate risk**: Most activities don't use `payment_plans` (default `[]`)
- **Medium UX risk**: When present, misleading display without selection capability
- **High future risk**: If payment plans become core feature, needs full implementation

---

## Recommended Actions

### Option A: Remove Display (Quick Fix)
- Remove payment_plans display from ActivityDetail.tsx and BookingCard.tsx
- Keep column for future use
- Prevents user confusion
- **Effort**: 10 minutes

### Option B: Implement Selection (Full Feature)
1. Add plan selection UI to Booking.tsx
2. Store selected `payment_plan_type` in bookings table
3. Update edge function to read `payment_plan_type` and look up price from `activity.payment_plans`
4. Add validation: selected plan must exist in activity's plans
5. Update aid calculation to use plan price instead of base price
- **Effort**: 2-4 hours

### Option C: Document and Defer
- Add TODO comments in code
- Create GitHub issue for future implementation
- Keep current behavior (display only)
- **Effort**: This document ✅

---

## Decision

**Recommendation**: **Option A** (Remove display)

**Rationale**:
- Only a few activities have payment_plans data
- No bookings currently rely on this feature
- Prevents misleading UX where users think they can choose
- Can re-implement properly when business need is confirmed

---

## Files to Modify (if implementing Option A)

1. `src/components/Activity/ActivityDetail.tsx` (lines 168-180)
   - Remove payment plans display section
2. `src/components/BookingCard.tsx` (lines 118-129)
   - Remove payment plans mapping
3. `supabase/migrations/20251016141346_*.sql`
   - Mark as deprecated in comments

---

## Related Issues

- P0-3: ✅ FIXED - `price_override` now supported (commit eaf55a4)
- P1-1: ✅ FIXED - `calculateAge` deduplicated (commit TBD)
- P1-2: ✅ FIXED - `period_type` normalized (commit 17969ad)
- P1-4: ⚠️ **THIS ISSUE** - `payment_plans` display-only

---

## References

- Migration: `supabase/migrations/20251013102632_*.sql` (column definition)
- Migration: `supabase/migrations/20251016141346_*.sql` (added plans for vacation activities)
- Edge function: `supabase/functions/bookings/index.ts` (pricing logic)
- Frontend: `src/components/Activity/ActivityDetail.tsx`, `src/components/BookingCard.tsx`
