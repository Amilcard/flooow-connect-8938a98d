#!/bin/bash

echo "=== ANALYSE DES PAGES SANS BOUTON RETOUR ==="
echo ""

# Liste de toutes les pages
all_pages=$(find src/pages -name "*.tsx" -type f | grep -v "/components/" | sort)

# Pages avec bouton retour
pages_with_back=$(grep -r "ArrowLeft\|navigate(-1)" src/pages/ --include="*.tsx" -l | sort)

echo "Pages SANS bouton retour :"
echo "=========================="

for page in $all_pages; do
  if ! echo "$pages_with_back" | grep -q "$page"; then
    basename "$page"
  fi
done

echo ""
echo "=== ANALYSE DES PROBLEMES AUTH ==="
echo ""

# Vérifier les pages qui utilisent useAuth
echo "Pages utilisant useAuth :"
grep -r "useAuth" src/pages/ --include="*.tsx" -l | while read file; do
  basename "$file"
done

echo ""
echo "=== PAGES PROTEGEES ==="
grep -r "ProtectedRoute\|RoleProtectedRoute" src/App.tsx | grep -oE "path=\"[^\"]+\"" | sed 's/path="//;s/"//'
