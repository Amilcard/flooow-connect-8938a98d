#!/usr/bin/env bash
# ============================================
# ARCHIVE - Run Smoke Tests - Flooow Connect Auth API
# Projet Flooow - URL: https://kbrgwezkjaakoecispom.supabase.co
# ============================================

set -e

# Load configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/config.sh"

# Initialize report
init_report() {
  cat > "${REPORT_JSON}" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "base_url": "${API_BASE}",
  "test_email": "${TEST_EMAIL}",
  "tests": []
}
EOF
}

# Add test result to report
add_test() {
  local name=$1
  local status=$2
  local http_code=$3
  local response=$4
  
  local temp=$(mktemp)
  jq ".tests += [{
    \"name\": \"${name}\",
    \"status\": \"${status}\",
    \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",
    \"http_code\": ${http_code:-0},
    \"response\": ${response:-'null'}
  }]" "${REPORT_JSON}" > "${temp}" && mv "${temp}" "${REPORT_JSON}"
}

# Pretty print
log_test() {
  echo -e "${BLUE}[TEST]${NC} $1"
}

log_pass() {
  echo -e "${GREEN}[PASS]${NC} $1"
}

log_fail() {
  echo -e "${RED}[FAIL]${NC} $1"
}

log_info() {
  echo -e "${YELLOW}[INFO]${NC} $1"
}

# Clean up
cleanup() {
  rm -f "${COOKIES}"
}

trap cleanup EXIT

# Initialize
init_report
echo ""
log_info "Starting smoke tests..."
echo ""

# ============================================
# TEST 1: LOGIN
# ============================================
log_test "1. POST /auth-sessions/login"

LOGIN_RESP=$(curl -s -w "\nHTTP_CODE:%{http_code}" -c "${COOKIES}" \
  -X POST "${API_BASE}/auth-sessions/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\",
    \"device\": \"${TEST_DEVICE}\"
  }")

HTTP_CODE=$(echo "${LOGIN_RESP}" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "${LOGIN_RESP}" | sed '/HTTP_CODE:/d')

if [[ "${HTTP_CODE}" == "200" ]]; then
  SESSION_ID=$(echo "${BODY}" | jq -r '.session_id // empty')
  if [[ -n "${SESSION_ID}" ]]; then
    log_pass "Login successful - Session: ${SESSION_ID}"
    
    # Check cookies
    if grep -q "access_token" "${COOKIES}"; then
      log_pass "  ✓ access_token cookie set"
    else
      log_fail "  ✗ access_token cookie missing"
    fi
    
    if grep -q "refresh_token" "${COOKIES}"; then
      log_pass "  ✓ refresh_token cookie set"
    else
      log_fail "  ✗ refresh_token cookie missing"
    fi
    
    add_test "login" "PASS" "${HTTP_CODE}" "$(echo "${BODY}" | jq -c)"
  else
    log_fail "Login failed - No session_id in response"
    add_test "login" "FAIL" "${HTTP_CODE}" "$(echo "${BODY}" | jq -c)"
    exit 1
  fi
else
  log_fail "Login failed - HTTP ${HTTP_CODE}"
  echo "${BODY}" | jq '.' || echo "${BODY}"
  add_test "login" "FAIL" "${HTTP_CODE}" "$(echo "${BODY}" | jq -c -R)"
  exit 1
fi

echo ""

# ============================================
# TEST 2: SESSION INFO
# ============================================
log_test "2. GET /auth-sessions/session-info"

INFO_RESP=$(curl -s -w "\nHTTP_CODE:%{http_code}" -b "${COOKIES}" \
  "${API_BASE}/auth-sessions/session-info")

HTTP_CODE=$(echo "${INFO_RESP}" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "${INFO_RESP}" | sed '/HTTP_CODE:/d')

if [[ "${HTTP_CODE}" == "200" ]]; then
  log_pass "Session info retrieved"
  if [[ "${VERBOSE}" == "true" ]]; then
    echo "${BODY}" | jq '.'
  fi
  add_test "session_info" "PASS" "${HTTP_CODE}" "$(echo "${BODY}" | jq -c)"
else
  log_fail "Session info failed - HTTP ${HTTP_CODE}"
  add_test "session_info" "FAIL" "${HTTP_CODE}" "$(echo "${BODY}" | jq -c -R)"
fi

echo ""

# ============================================
# TEST 3: REFRESH TOKEN
# ============================================
log_test "3. POST /auth-sessions/refresh"

sleep 2 # Wait to ensure token can be refreshed

REFRESH_RESP=$(curl -s -w "\nHTTP_CODE:%{http_code}" -b "${COOKIES}" -c "${COOKIES}" \
  -X POST "${API_BASE}/auth-sessions/refresh")

HTTP_CODE=$(echo "${REFRESH_RESP}" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "${REFRESH_RESP}" | sed '/HTTP_CODE:/d')

if [[ "${HTTP_CODE}" == "200" ]]; then
  log_pass "Token refresh successful"
  
  # Verify new cookies
  if grep -q "access_token" "${COOKIES}"; then
    log_pass "  ✓ New access_token set"
  else
    log_fail "  ✗ New access_token missing"
  fi
  
  add_test "refresh" "PASS" "${HTTP_CODE}" "$(echo "${BODY}" | jq -c)"
else
  log_fail "Token refresh failed - HTTP ${HTTP_CODE}"
  add_test "refresh" "FAIL" "${HTTP_CODE}" "$(echo "${BODY}" | jq -c -R)"
fi

echo ""

# ============================================
# TEST 4: LOGOUT
# ============================================
log_test "4. POST /auth-sessions/logout"

LOGOUT_RESP=$(curl -s -w "\nHTTP_CODE:%{http_code}" -b "${COOKIES}" -c "${COOKIES}" \
  -X POST "${API_BASE}/auth-sessions/logout")

HTTP_CODE=$(echo "${LOGOUT_RESP}" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "${LOGOUT_RESP}" | sed '/HTTP_CODE:/d')

if [[ "${HTTP_CODE}" == "200" ]]; then
  log_pass "Logout successful"
  add_test "logout" "PASS" "${HTTP_CODE}" "$(echo "${BODY}" | jq -c)"
else
  log_fail "Logout failed - HTTP ${HTTP_CODE}"
  add_test "logout" "FAIL" "${HTTP_CODE}" "$(echo "${BODY}" | jq -c -R)"
fi

echo ""

# ============================================
# TEST 5: VERIFY REVOKED
# ============================================
log_test "5. Verify session revoked"

VERIFY_RESP=$(curl -s -w "\nHTTP_CODE:%{http_code}" -b "${COOKIES}" \
  "${API_BASE}/auth-sessions/session-info")

HTTP_CODE=$(echo "${VERIFY_RESP}" | grep "HTTP_CODE:" | cut -d: -f2)

if [[ "${HTTP_CODE}" == "401" ]]; then
  log_pass "Session correctly revoked (401 as expected)"
  add_test "verify_revoked" "PASS" "${HTTP_CODE}" "{\"message\":\"Session revoked\"}"
else
  log_fail "Session should be revoked but got HTTP ${HTTP_CODE}"
  add_test "verify_revoked" "FAIL" "${HTTP_CODE}" "{\"message\":\"Should return 401\"}"
fi

echo ""

# ============================================
# SUMMARY
# ============================================
echo "========================================="
echo "SUMMARY"
echo "========================================="

TOTAL=$(jq '.tests | length' "${REPORT_JSON}")
PASSED=$(jq '[.tests[] | select(.status == "PASS")] | length' "${REPORT_JSON}")
FAILED=$(jq '[.tests[] | select(.status == "FAIL")] | length' "${REPORT_JSON}")

# Update summary
temp=$(mktemp)
jq ".summary = {
  \"total\": ${TOTAL},
  \"passed\": ${PASSED},
  \"failed\": ${FAILED},
  \"success_rate\": \"$(echo "scale=2; ${PASSED} * 100 / ${TOTAL}" | bc)%\"
}" "${REPORT_JSON}" > "${temp}" && mv "${temp}" "${REPORT_JSON}"

echo "Total:  ${TOTAL}"
echo -e "Passed: ${GREEN}${PASSED}${NC}"
echo -e "Failed: ${RED}${FAILED}${NC}"
echo ""
echo "Full report: ${REPORT_JSON}"

if [[ "${FAILED}" -gt 0 ]]; then
  log_fail "Some tests failed!"
  exit 1
else
  log_pass "All tests passed!"
  exit 0
fi
