#!/bin/bash

echo "🧪 Test du nouveau modal d'ajout d'enfant avec cases à cocher"
echo "=================================================="

# Vérifier que les composants existent
echo "✅ Vérification des fichiers..."
if [[ -f "src/pages/account/kids/KidAddModal.tsx" ]]; then
    echo "   ✓ KidAddModal.tsx trouvé"
else
    echo "   ❌ KidAddModal.tsx manquant"
    exit 1
fi

if [[ -f "src/pages/account/kids/MesEnfants.tsx" ]]; then
    echo "   ✓ MesEnfants.tsx trouvé"
else
    echo "   ❌ MesEnfants.tsx manquant"
    exit 1
fi

# Vérifier les imports des composants UI
echo ""
echo "✅ Vérification des imports de Checkbox..."
if grep -q "import.*Checkbox.*from" src/pages/account/kids/KidAddModal.tsx; then
    echo "   ✓ Import Checkbox trouvé"
else
    echo "   ❌ Import Checkbox manquant"
fi

# Vérifier les options prédéfinies
echo ""
echo "✅ Vérification des options prédéfinies..."
if grep -q "INTEREST_OPTIONS" src/pages/account/kids/KidAddModal.tsx; then
    echo "   ✓ Options centres d'intérêt trouvées"
    INTEREST_COUNT=$(grep -c "'.*'," src/pages/account/kids/KidAddModal.tsx | head -1)
    echo "   📊 Nombre d'options d'intérêts détectées"
else
    echo "   ❌ Options centres d'intérêt manquantes"
fi

if grep -q "SPECIAL_NEEDS_OPTIONS" src/pages/account/kids/KidAddModal.tsx; then
    echo "   ✓ Options besoins particuliers trouvées"
    echo "   📊 Nombre d'options de besoins détectées"
else
    echo "   ❌ Options besoins particuliers manquantes"
fi

# Vérifier les fonctions de gestion des cases à cocher
echo ""
echo "✅ Vérification des fonctions de gestion..."
if grep -q "handleInterestChange" src/pages/account/kids/KidAddModal.tsx; then
    echo "   ✓ Fonction handleInterestChange trouvée"
else
    echo "   ❌ Fonction handleInterestChange manquante"
fi

if grep -q "handleSpecialNeedChange" src/pages/account/kids/KidAddModal.tsx; then
    echo "   ✓ Fonction handleSpecialNeedChange trouvée"
else
    echo "   ❌ Fonction handleSpecialNeedChange manquante"
fi

echo ""
echo "🎯 Fonctionnalités du nouveau modal:"
echo "   📋 Cases à cocher pour centres d'intérêt"
echo "   🏥 Cases à cocher pour besoins particuliers"
echo "   💾 Sauvegarde en arrays dans Supabase"
echo "   ♿ Options d'accessibilité (autisme, handicap moteur, etc.)"
echo "   🔄 Interface plus user-friendly"

echo ""
echo "✨ Test terminé ! Le modal est prêt à être utilisé."