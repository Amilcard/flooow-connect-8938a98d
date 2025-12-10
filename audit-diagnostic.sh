#!/bin/bash

echo "🔍 AUDIT DIAGNOSTIC FLOOOW"
echo "=========================="
echo ""

# ZONE 1 : Images activités
echo "━━━ ZONE 1 : BUG IMAGES ━━━"
FILE1="src/components/Search/ActivityResultCard.tsx"
if [ -f "$FILE1" ]; then
    echo "✓ Fichier trouvé"
    echo ""
    echo "Variable image:"
    grep -n "displayImage\|imageSrc\|const.*image" "$FILE1" | head -5
    echo ""
    echo "Vérification activity.images:"
    grep -n "activity\.images" "$FILE1" | head -5
    echo ""
    echo "Fallback:"
    grep -n "getCategoryImage\|placeholder" "$FILE1" | head -5
else
    echo "✗ Fichier introuvable: $FILE1"
fi
echo ""

# ZONE 2 : Marges compte
echo "━━━ ZONE 2 : MARGES ESPACE CLIENT ━━━"
for FILE in src/pages/account/MonCompte.tsx src/pages/account/MesJustificatifs.tsx; do
    if [ -f "$FILE" ]; then
        echo "📄 $FILE"
        grep -n "max-w-\|container" "$FILE" | head -3
        echo ""
    fi
done

# ZONE 3 : Header Bon Esprit
echo "━━━ ZONE 3 : HEADER BON ESPRIT ━━━"
FILE3="src/pages/BonEsprit.tsx"
if [ -f "$FILE3" ]; then
    echo "Classes header:"
    grep -n "h-16\|flex items-center" "$FILE3" | head -5
    echo ""
    echo "Bouton Retour:"
    grep -n "absolute\|ChevronLeft" "$FILE3" | head -5
else
    echo "✗ Fichier introuvable: $FILE3"
fi
echo ""

# ZONE 4 : Ordre organisateur
echo "━━━ ZONE 4 : ORDRE ORGANISATEUR ━━━"
FILE4="src/pages/ActivityDetail.tsx"
if [ -f "$FILE4" ]; then
    echo "Position organisateur vs Tabs:"
    grep -n "Building\|organisateur\|<Tabs" "$FILE4" -i | head -10
else
    echo "✗ Fichier introuvable: $FILE4"
fi

echo ""
echo "✅ Audit terminé"
