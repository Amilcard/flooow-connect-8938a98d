#!/bin/bash

# Hero Tiles Format Validation Script
# Ensures hero tiles maintain correct portrait format (h-[400px] md:h-[480px])
# Reference: .github/HERO_TILES_GUIDE.md

set -e

echo "🔍 Validating Hero Tiles Format..."
echo ""

FAILED=0

# Hero tile files to check
TILES=(
  "src/components/home/AidesFinancieresCard.tsx"
  "src/components/home/MobiliteCard.tsx"
  "src/components/home/BonEspritCard.tsx"
  "src/components/home/MaVilleCard.tsx"
)

for file in "${TILES[@]}"; do
  echo "Checking $file..."

  if [[ ! -f "$file" ]]; then
    echo "  ❌ File not found!"
    FAILED=1
    continue
  fi

  # Check for correct portrait format
  if grep -q "h-\[400px\] md:h-\[480px\]" "$file"; then
    echo "  ✅ Portrait format (h-[400px] md:h-[480px])"
  else
    echo "  ❌ ERROR: Missing portrait format!"
    FAILED=1
  fi

  # Check for local image imports
  if grep -q "from.*@/assets/" "$file"; then
    echo "  ✅ Local image assets"
  else
    echo "  ⚠️  WARNING: No local assets import found"
  fi

  # Check for forbidden old formats
  if grep -q "h-\[140px\]" "$file"; then
    echo "  ❌ ERROR: Old compact format detected (h-[140px])"
    FAILED=1
  fi

  if grep -q "h-\[280px\]" "$file"; then
    echo "  ❌ ERROR: Regression format detected (h-[280px])"
    FAILED=1
  fi

  # Check for Unsplash URLs (should use local assets)
  if grep -q "images.unsplash.com" "$file"; then
    echo "  ⚠️  WARNING: Using Unsplash images instead of local assets"
  fi

  echo ""
done

if [[ $FAILED -eq 1 ]]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "❌ VALIDATION FAILED"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Hero tiles have regressed to an old format!"
  echo ""
  echo "📚 Reference: .github/HERO_TILES_GUIDE.md"
  echo "📋 Good commit: 1c5e23e (JSON_1 specification)"
  echo ""
  echo "To fix, restore from the good commit:"
  echo "  git checkout 1c5e23e -- src/components/home/*Card.tsx"
  echo ""
  exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ALL VALIDATIONS PASSED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Hero tiles are in correct portrait format."
echo ""

exit 0
