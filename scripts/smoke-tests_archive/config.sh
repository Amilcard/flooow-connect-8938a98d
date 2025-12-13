#!/usr/bin/env bash
# ============================================
# Configuration pour smoke tests - Flooow Connect
# ARCHIVE - Exemples de smoke tests pour le projet Flooow
# ============================================

# API Base URL - Supabase Edge Functions
API_BASE="https://kbrgwezkjaakoecispom.supabase.co/functions/v1"

# Credentials de test (à créer dans Supabase Auth)
# IMPORTANT: Créer ce compte via l'UI Supabase ou l'endpoint signup avant de lancer les tests
TEST_EMAIL="${TEST_EMAIL:-test-parent@flooow.local}"
TEST_PASSWORD="${TEST_PASSWORD:-TestFlooow2025!}"

# Device info pour les tests
TEST_DEVICE="smoke-test-runner"

# Output directory
OUTDIR="${OUTDIR:-./smoke_outputs}"
COOKIES="${OUTDIR}/cookies.txt"
REPORT_JSON="${OUTDIR}/smoke_report_results.json"

# Create output directory if it doesn't exist
mkdir -p "${OUTDIR}"

# Colors for terminal output
export RED='\033[0;31m'
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export BLUE='\033[0;34m'
export NC='\033[0m' # No Color

# Timeouts
export TIMEOUT_SEC=30

# Verbose mode
export VERBOSE="${VERBOSE:-false}"

# Print configuration (masking password)
echo "========================================="
echo "Flooow Connect - Smoke Tests Config"
echo "========================================="
echo "API Base:    ${API_BASE}"
echo "Test Email:  ${TEST_EMAIL}"
echo "Test Pass:   ${TEST_PASSWORD:0:3}***"
echo "Device:      ${TEST_DEVICE}"
echo "Output Dir:  ${OUTDIR}"
echo "========================================="
echo ""
