#!/bin/bash
# CI Guard: Prevent service_role or sensitive secrets in frontend code
# Add to CI pipeline or pre-commit hook

set -e

echo "Checking for exposed secrets in frontend code..."

# Directories to scan (frontend only)
FRONTEND_DIRS="src/"

# Patterns to detect
PATTERNS=(
  "service_role"
  "SUPABASE_SERVICE_ROLE"
  "sk_live_"
  "sk_test_"
  "-----BEGIN.*PRIVATE KEY-----"
)

FOUND=0

for pattern in "${PATTERNS[@]}"; do
  if grep -r "$pattern" $FRONTEND_DIRS --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null; then
    echo "SECURITY ERROR: Found '$pattern' in frontend code!"
    FOUND=1
  fi
done

if [ $FOUND -eq 1 ]; then
  echo ""
  echo "========================================="
  echo "SECURITY CHECK FAILED"
  echo "Secrets detected in frontend code."
  echo "Please remove sensitive data before committing."
  echo "========================================="
  exit 1
fi

echo "Security check passed - no secrets found in frontend code."
exit 0
