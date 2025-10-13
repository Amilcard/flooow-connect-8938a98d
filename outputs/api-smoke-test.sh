#!/usr/bin/env bash
set -e

# Configuration
API_BASE="${API_BASE:-https://lddlzlthtwuwxxrrbxuc.supabase.co/functions/v1}"
T_FAMILY="${T_FAMILY:-Bearer <FAMILY_TOKEN>}"
T_PARENT="${T_PARENT:-Bearer <PARENT_TOKEN>}"

echo "========================================="
echo "API Smoke Test Suite"
echo "Base URL: ${API_BASE}"
echo "========================================="
echo ""

# 1. GET activities (preview)
echo "1) GET /activities (preview mode)"
curl -s -o /tmp/s1.json "${API_BASE}/activities?preview=true" && echo "   ✓ OK - Activities preview retrieved"
echo "   Activities count: $(jq '. | length' /tmp/s1.json 2>/dev/null || echo 'N/A')"
echo ""

# 2. GET activity detail
echo "2) GET /activities/{id} (detail)"
ACTIVITY_ID=$(jq -r '.[0].id // "act-2"' /tmp/s1.json 2>/dev/null || echo "act-2")
curl -s -o /tmp/s2.json "${API_BASE}/activities/${ACTIVITY_ID}" && echo "   ✓ OK - Activity detail retrieved"
echo "   Activity: $(jq -r '.title // "N/A"' /tmp/s2.json 2>/dev/null)"
echo ""

# 3. POST booking
echo "3) POST /bookings (create booking)"
curl -s -X POST "${API_BASE}/bookings" \
  -H "Authorization: ${T_FAMILY}" \
  -H "Content-Type: application/json" \
  -d "{\"activity_id\":\"${ACTIVITY_ID}\",\"child_id\":\"child-demo\",\"transport_mode\":\"covoiturage\"}" \
  -o /tmp/s3.json

if [ -f /tmp/s3.json ] && jq -e '.id' /tmp/s3.json >/dev/null 2>&1; then
  BOOKING_ID=$(jq -r '.id' /tmp/s3.json)
  echo "   ✓ OK - Booking created: ${BOOKING_ID}"
else
  echo "   ✗ FAIL - Booking creation failed"
  cat /tmp/s3.json 2>/dev/null || echo "   No response"
  BOOKING_ID=""
fi
echo ""

# 4. Parent validation
if [ -n "$BOOKING_ID" ]; then
  echo "4) POST /bookings/{id}/parent-validate"
  curl -s -X POST "${API_BASE}/bookings/${BOOKING_ID}/parent-validate" \
    -H "Authorization: ${T_PARENT}" \
    -H "Content-Type: application/json" \
    -d '{"action":"accept"}' \
    -o /tmp/s4.json
  
  if [ -f /tmp/s4.json ] && jq -e '.success' /tmp/s4.json >/dev/null 2>&1; then
    echo "   ✓ OK - Booking validated by parent"
  else
    echo "   ✗ FAIL - Parent validation failed"
    cat /tmp/s4.json 2>/dev/null || echo "   No response"
  fi
  echo ""
else
  echo "4) POST /bookings/{id}/parent-validate - SKIPPED (no booking ID)"
  echo ""
fi

# 5. POST aid_simulation
if [ -n "$BOOKING_ID" ]; then
  echo "5) POST /aid_simulations (save simulation)"
  curl -s -X POST "${API_BASE}/bookings/simulate-aid" \
    -H "Authorization: ${T_FAMILY}" \
    -H "Content-Type: application/json" \
    -d "{\"booking_id\":\"${BOOKING_ID}\",\"user_id\":\"user-demo\",\"child_id\":\"child-demo\",\"activity_id\":\"${ACTIVITY_ID}\",\"simulated_aids\":{\"caf\":40}}" \
    -o /tmp/s5.json
  
  if [ -f /tmp/s5.json ]; then
    echo "   ✓ OK - Aid simulation saved"
    echo "   Total aids: $(jq -r '.total_aid // "N/A"' /tmp/s5.json 2>/dev/null)"
  else
    echo "   ✗ FAIL - Aid simulation failed"
  fi
  echo ""
else
  echo "5) POST /aid_simulations - SKIPPED (no booking ID)"
  echo ""
fi

# 6. Modal split report
echo "6) GET /reports/modal_split"
curl -s "${API_BASE}/reports/modal_split" -o /tmp/s6.json

if [ -f /tmp/s6.json ] && jq -e '.data' /tmp/s6.json >/dev/null 2>&1; then
  echo "   ✓ OK - Modal split report retrieved"
  echo "   Report:"
  jq '.' /tmp/s6.json 2>/dev/null | head -20
else
  echo "   ✗ FAIL - Modal split report failed"
  cat /tmp/s6.json 2>/dev/null || echo "   No response"
fi
echo ""

# 7. Migration check
echo "7) GET /reports/check_migrations"
curl -s "${API_BASE}/reports/check_migrations" -o /tmp/s7.json

if [ -f /tmp/s7.json ] && jq -e '.migration_status' /tmp/s7.json >/dev/null 2>&1; then
  echo "   ✓ OK - Migration status retrieved"
  echo "   Status:"
  jq '.migration_status' /tmp/s7.json 2>/dev/null
else
  echo "   ✗ FAIL - Migration check failed"
  cat /tmp/s7.json 2>/dev/null || echo "   No response"
fi
echo ""

echo "========================================="
echo "Smoke test complete!"
echo "========================================="
