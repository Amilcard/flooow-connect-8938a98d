#!/bin/bash
# Script de vérification du statut de déploiement
# Usage: ./scripts/check-deploy-status.sh

echo "🔍 Vérification du statut de déploiement..."
echo ""

# Fetch latest from origin
git fetch origin main --quiet 2>/dev/null

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
CURRENT_COMMIT=$(git rev-parse HEAD)
CURRENT_COMMIT_SHORT=$(git rev-parse --short HEAD)
MAIN_COMMIT=$(git rev-parse origin/main)
MAIN_COMMIT_SHORT=$(git rev-parse --short origin/main)

echo "📍 Branche actuelle: $CURRENT_BRANCH"
echo "📍 Commit local: $CURRENT_COMMIT_SHORT"
echo "📍 Commit main (remote): $MAIN_COMMIT_SHORT"
echo ""

# Check if current commit is on main
if git merge-base --is-ancestor $CURRENT_COMMIT origin/main 2>/dev/null; then
    echo "✅ Votre commit EST sur main → Netlify va déployer cette version"
else
    # Count commits ahead of main
    COMMITS_AHEAD=$(git rev-list --count origin/main..HEAD)

    echo "⚠️  Votre commit N'EST PAS sur main"
    echo "📊 Commits en avance sur main: $COMMITS_AHEAD"
    echo ""
    echo "🔧 Actions nécessaires:"
    echo "   1. Aller sur GitHub: https://github.com/Amilcard/flooow-connect-8938a98d/pulls"
    echo "   2. Créer/Merger un PR: $CURRENT_BRANCH → main"
    echo "   3. Attendre le déploiement Netlify"
    echo ""
    echo "📋 Commits à merger:"
    git log --oneline origin/main..HEAD
fi
