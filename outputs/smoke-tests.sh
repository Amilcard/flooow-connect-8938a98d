#!/bin/bash

# ============================================
# SMOKE TESTS - Auth & Session Management
# ============================================

set -e

# Configuration
BASE_URL="https://lddlzlthtwuwxxrrbxuc.supabase.co/functions/v1"
COOKIE_FILE="cookies.txt"
OUTPUT_FILE="outputs/smoke_report.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Starting Smoke Tests for Auth API..."
echo "Base URL: $BASE_URL"
echo ""

# Clean up old cookies
rm -f $COOKIE_FILE

# Test credentials (replace with real test data)
TEST_EMAIL="test-parent@example.com"
TEST_PASSWORD="TestPassword123!"

# Initialize report
cat > $OUTPUT_FILE << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "base_url": "$BASE_URL",
  "tests": []
}
EOF

# Helper function to add test result
add_test_result() {
  local test_name=$1
  local status=$2
  local details=$3
  
  # Read current JSON
  local current=$(cat $OUTPUT_FILE)
  
  # Add new test result
  echo "$current" | jq ".tests += [{
    \"name\": \"$test_name\",
    \"status\": \"$status\",
    \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",
    \"details\": $details
  }]" > $OUTPUT_FILE
}

# ============================================
# TEST 1: POST /auth/login
# ============================================
echo -e "${YELLOW}TEST 1: POST /auth-sessions/login${NC}"

LOGIN_RESPONSE=$(curl -s -c $COOKIE_FILE -w "\n%{http_code}" -X POST \
  "$BASE_URL/auth-sessions/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"device\": \"smoke-test\"
  }")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
  echo -e "${GREEN}✓ Login successful${NC}"
  SESSION_ID=$(echo "$LOGIN_BODY" | jq -r '.session_id')
  echo "  Session ID: $SESSION_ID"
  
  # Check cookies
  if grep -q "access_token" $COOKIE_FILE; then
    echo -e "${GREEN}✓ access_token cookie set${NC}"
  else
    echo -e "${RED}✗ access_token cookie NOT set${NC}"
  fi
  
  if grep -q "refresh_token" $COOKIE_FILE; then
    echo -e "${GREEN}✓ refresh_token cookie set${NC}"
  else
    echo -e "${RED}✗ refresh_token cookie NOT set${NC}"
  fi
  
  add_test_result "login" "PASS" "$(echo "$LOGIN_BODY" | jq -c '.')"
else
  echo -e "${RED}✗ Login failed (HTTP $HTTP_CODE)${NC}"
  echo "$LOGIN_BODY"
  add_test_result "login" "FAIL" "{\"http_code\": $HTTP_CODE, \"response\": $(echo "$LOGIN_BODY" | jq -c '.')}"
  exit 1
fi

echo ""

# ============================================
# TEST 2: GET /auth-sessions/session-info
# ============================================
echo -e "${YELLOW}TEST 2: GET /auth-sessions/session-info${NC}"

SESSION_INFO_RESPONSE=$(curl -s -b $COOKIE_FILE -w "\n%{http_code}" \
  "$BASE_URL/auth-sessions/session-info")

HTTP_CODE=$(echo "$SESSION_INFO_RESPONSE" | tail -n1)
SESSION_INFO_BODY=$(echo "$SESSION_INFO_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
  echo -e "${GREEN}✓ Session info retrieved${NC}"
  echo "$SESSION_INFO_BODY" | jq '.'
  add_test_result "session_info" "PASS" "$(echo "$SESSION_INFO_BODY" | jq -c '.')"
else
  echo -e "${RED}✗ Session info failed (HTTP $HTTP_CODE)${NC}"
  add_test_result "session_info" "FAIL" "{\"http_code\": $HTTP_CODE}"
fi

echo ""

# ============================================
# TEST 3: POST /auth-sessions/refresh
# ============================================
echo -e "${YELLOW}TEST 3: POST /auth-sessions/refresh${NC}"

# Wait a bit to ensure token can be refreshed
sleep 2

REFRESH_RESPONSE=$(curl -s -b $COOKIE_FILE -c $COOKIE_FILE -w "\n%{http_code}" -X POST \
  "$BASE_URL/auth-sessions/refresh")

HTTP_CODE=$(echo "$REFRESH_RESPONSE" | tail -n1)
REFRESH_BODY=$(echo "$REFRESH_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
  echo -e "${GREEN}✓ Token refresh successful${NC}"
  echo "$REFRESH_BODY" | jq '.'
  
  # Verify new cookies were set
  if grep -q "access_token" $COOKIE_FILE; then
    echo -e "${GREEN}✓ New access_token cookie set${NC}"
  fi
  
  add_test_result "refresh" "PASS" "$(echo "$REFRESH_BODY" | jq -c '.')"
else
  echo -e "${RED}✗ Token refresh failed (HTTP $HTTP_CODE)${NC}"
  echo "$REFRESH_BODY"
  add_test_result "refresh" "FAIL" "{\"http_code\": $HTTP_CODE, \"response\": $(echo "$REFRESH_BODY" | jq -c '.')}"
fi

echo ""

# ============================================
# TEST 4: POST /auth-sessions/logout
# ============================================
echo -e "${YELLOW}TEST 4: POST /auth-sessions/logout${NC}"

LOGOUT_RESPONSE=$(curl -s -b $COOKIE_FILE -c $COOKIE_FILE -w "\n%{http_code}" -X POST \
  "$BASE_URL/auth-sessions/logout")

HTTP_CODE=$(echo "$LOGOUT_RESPONSE" | tail -n1)
LOGOUT_BODY=$(echo "$LOGOUT_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
  echo -e "${GREEN}✓ Logout successful${NC}"
  echo "$LOGOUT_BODY" | jq '.'
  
  # Verify cookies were cleared (Max-Age=0)
  if ! grep -q "access_token" $COOKIE_FILE || grep -q "Max-Age=0" $COOKIE_FILE; then
    echo -e "${GREEN}✓ Cookies cleared${NC}"
  fi
  
  add_test_result "logout" "PASS" "$(echo "$LOGOUT_BODY" | jq -c '.')"
else
  echo -e "${RED}✗ Logout failed (HTTP $HTTP_CODE)${NC}"
  add_test_result "logout" "FAIL" "{\"http_code\": $HTTP_CODE}"
fi

echo ""

# ============================================
# TEST 5: Verify session is revoked
# ============================================
echo -e "${YELLOW}TEST 5: Verify session revoked (should fail)${NC}"

REVOKED_TEST=$(curl -s -b $COOKIE_FILE -w "\n%{http_code}" \
  "$BASE_URL/auth-sessions/session-info")

HTTP_CODE=$(echo "$REVOKED_TEST" | tail -n1)

if [ "$HTTP_CODE" == "401" ]; then
  echo -e "${GREEN}✓ Session correctly revoked (401 as expected)${NC}"
  add_test_result "verify_revoked" "PASS" "{\"http_code\": 401, \"message\": \"Session correctly revoked\"}"
else
  echo -e "${RED}✗ Session should be revoked but returned HTTP $HTTP_CODE${NC}"
  add_test_result "verify_revoked" "FAIL" "{\"http_code\": $HTTP_CODE, \"message\": \"Session should return 401\"}"
fi

echo ""

# ============================================
# SUMMARY
# ============================================
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}SMOKE TEST SUMMARY${NC}"
echo -e "${YELLOW}========================================${NC}"

TOTAL_TESTS=$(jq '.tests | length' $OUTPUT_FILE)
PASSED_TESTS=$(jq '[.tests[] | select(.status == "PASS")] | length' $OUTPUT_FILE)
FAILED_TESTS=$(jq '[.tests[] | select(.status == "FAIL")] | length' $OUTPUT_FILE)

echo "Total tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

# Update summary in JSON
jq ".summary = {
  \"total\": $TOTAL_TESTS,
  \"passed\": $PASSED_TESTS,
  \"failed\": $FAILED_TESTS
}" $OUTPUT_FILE > temp.json && mv temp.json $OUTPUT_FILE

echo ""
echo "Full report saved to: $OUTPUT_FILE"

# Clean up
rm -f $COOKIE_FILE

# Exit with error if any tests failed
if [ "$FAILED_TESTS" -gt 0 ]; then
  echo -e "${RED}Some tests failed!${NC}"
  exit 1
else
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
fi
