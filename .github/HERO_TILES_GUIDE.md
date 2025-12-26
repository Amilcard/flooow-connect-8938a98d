# Guide de Gestion des Tuiles Hero (Page d'Accueil)

## ⚠️ IMPORTANT - Protection contre les Régressions

Les 4 tuiles hero de la page d'accueil ont un format spécifique qui doit être maintenu. Ce document explique la spécification et comment éviter les régressions.

---

## 📋 Spécification Actuelle

### Format Requis ✅
- Format **PORTRAIT** : `h-[400px] md:h-[480px]`
- Images **locales** plein cadre (`/assets/aides-financieres.webp`, etc.)
- Icônes **centrées** avec backdrop blur
- Texte sur **gradient overlay** foncé
- Layout: Image plein cadre en arrière-plan + contenu absolument positionné

**Fichiers concernés:**
- `src/components/home/AidesFinancieresCard.tsx`
- `src/components/home/MobiliteCard.tsx`
- `src/components/home/BonEspritCard.tsx`
- `src/components/home/MaVilleCard.tsx`

---

## 🛡️ Prévention des Régressions

### Règle #1 : Vérifier le format AVANT de merger

```bash
# Vérifier le format des tuiles
grep "h-\[" src/components/home/AidesFinancieresCard.tsx

# Doit afficher : h-[400px] md:h-[480px]
# ❌ Si vous voyez h-[140px] ou h-[280px] → REJETER le merge
```

### Règle #2 : CI Validation

Le workflow `.github/workflows/validate-hero-tiles.yml` vérifie automatiquement le format des tuiles sur chaque PR.

### Règle #3 : Protection de branche

Dans les settings GitHub du repo :
1. Allez dans Settings → Branches
2. Ajoutez une règle pour `main`
3. Activez "Require status checks to pass"

---

## 🚨 En Cas de Régression

### Restaurer depuis le bon format

```bash
# Vérifier et corriger si nécessaire
# Le format correct est : h-[400px] md:h-[480px]

npm run build
git add src/components/home/*.tsx
git commit -m "fix(home): Restore portrait tiles format"
git push
```

---

## 📝 Spécification des Tuiles

### Tuile 1 : Mes aides
```typescript
{
  format: "portrait h-[400px] md:h-[480px]",
  image: "/assets/aides-financieres.webp",
  icon: "Calculator",
  title: "Mes aides",
  cta: "Estimer mes aides"
}
```

### Tuile 2 : Mes trajets
```typescript
{
  format: "portrait h-[400px] md:h-[480px]",
  image: "/assets/eco-mobilite.webp",
  icon: "Train",
  title: "Mes trajets",
  cta: "Trouver mon trajet"
}
```

### Tuile 3 : Ma ville
```typescript
{
  format: "portrait h-[400px] md:h-[480px]",
  image: "/assets/actualite-ville.webp",
  icon: "Newspaper",
  title: "Ma ville",
  cta: "Explorer ma ville"
}
```

### Tuile 4 : Clubs solidaires
```typescript
{
  format: "portrait h-[400px] md:h-[480px]",
  image: "/assets/actualite-prix.webp",
  icon: "Award",
  title: "Clubs solidaires",
  cta: "Proposer un héros"
}
```

---

## ✅ Checklist de Validation

Avant de merger une modification des tuiles hero :

- [ ] Les tuiles sont en format portrait (`h-[400px] md:h-[480px]`)
- [ ] Les images locales sont présentes dans `/assets/`
- [ ] Les icônes sont centrées avec backdrop blur
- [ ] Le build passe sans erreur (`npm run build`)
- [ ] La CI "Validate Hero Tiles Format" passe

---

**Dernière mise à jour:** Décembre 2025
**Mainteneur:** Équipe Flooow
