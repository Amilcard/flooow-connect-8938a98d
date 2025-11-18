# Guide de Gestion des Tuiles Hero (Page d'Accueil)

## ⚠️ IMPORTANT - Protection contre les Régressions

Les 4 tuiles hero de la page d'accueil ont subi plusieurs régressions dues à des conflits entre les branches Lovable et Claude. Ce document explique la cause et comment éviter ce problème à l'avenir.

---

## 📋 Historique des Versions

### Version Actuelle (BONNE) ✅
**Commit:** `1c5e23e` - "fix(ui): restore portrait card format"
**Date:** 17 novembre 2025
**Caractéristiques:**
- Format **PORTRAIT** : `h-[400px] md:h-[480px]`
- Images **locales** plein cadre (`/assets/aides-financieres.jpg`, etc.)
- Icônes **centrées** avec backdrop blur
- Texte sur **gradient overlay** foncé
- Layout: Image plein cadre en arrière-plan + contenu absolument positionné

**Fichiers concernés:**
- `src/components/home/AidesFinancieresCard.tsx`
- `src/components/home/MobiliteCard.tsx`
- `src/components/home/BonEspritCard.tsx`
- `src/components/home/MaVilleCard.tsx`

---

### Régression 1 (MAUVAIS) ❌
**Commit:** `2981776` - "feat(home): Update hero tiles with visuals"
**Date:** 18 novembre 2025
**Problème:** Format **PAYSAGE** `h-[280px]`, images Unsplash, pas d'icônes

### Régression 2 (TRÈS MAUVAIS) ❌❌
**Commit:** `fb118c1` - "feat(design-system): implement LOT 1"
**Date:** Ancien
**Problème:** Tuiles **plates** `h-[140px]`, fonds couleur unis, icônes en filigrane

---

## 🔍 Cause du Conflit

### Architecture des Branches

1. **`origin/main`** : Branche utilisée par Lovable pour le preview
2. **`claude/*`** : Branches de travail pour les évolutions
3. **`edit/edt-*`** : Branches temporaires créées par Lovable lors d'éditions manuelles

### Problème Identifié

1. Lovable preview utilise la branche `main`
2. Les évolutions Claude sont développées sur des branches `claude/*`
3. Sans merge vers `main`, Lovable continue d'afficher l'ancienne version
4. En cas de cache corrompu, Lovable peut afficher une version très ancienne qui n'existe nulle part

---

## 🛡️ Prévention des Régressions

### Règle #1 : TOUJOURS merger vers main

Après chaque modification des tuiles hero :

```bash
# 1. Créer une PR depuis votre branche Claude vers main
gh pr create --base main --head claude/votre-branche --title "fix: Update hero tiles"

# 2. Merger la PR
gh pr merge --squash

# 3. Vérifier que Lovable rebuild
# Attendez ~2 minutes et vérifiez le preview
```

### Règle #2 : Vérifier AVANT de merger

Avant d'accepter un merge qui touche ces fichiers :

```bash
# Vérifier le format des tuiles
grep "h-\[" src/components/home/AidesFinancieresCard.tsx

# Doit afficher : h-[400px] md:h-[480px]
# ❌ Si vous voyez h-[140px] ou h-[280px] → REJETER le merge
```

### Règle #3 : Protection de branche

Dans les settings GitHub du repo :

1. Allez dans Settings → Branches
2. Ajoutez une règle pour `main`
3. Activez "Require pull request reviews"
4. Activez "Require status checks to pass"

---

## 🚨 En Cas de Régression

Si vous constatez que les tuiles ont régressé sur Lovable :

### Étape 1 : Identifier la version affichée

Regardez le preview Lovable et notez :
- Hauteur des tuiles (plates vs portrait)
- Présence de photos ou fonds de couleur
- Position des icônes (centre vs filigrane)

### Étape 2 : Restaurer depuis le bon commit

```bash
# 1. Checkout la bonne version
git checkout 1c5e23e -- src/components/home/AidesFinancieresCard.tsx \
                        src/components/home/MobiliteCard.tsx \
                        src/components/home/BonEspritCard.tsx \
                        src/components/home/MaVilleCard.tsx

# 2. Vérifier le build
npm run build

# 3. Commit et push
git add src/components/home/*.tsx
git commit -m "fix(home): Restore JSON_1 portrait tiles"
git push origin votre-branche

# 4. Créer une PR vers main
gh pr create --base main --head votre-branche
```

### Étape 3 : Forcer le rebuild Lovable

1. Mergez la PR vers `main`
2. Dans Lovable, cliquez sur le bouton "Rebuild" ou rafraîchissez le preview
3. Si le cache persiste, contactez le support Lovable

---

## 📝 Spécification JSON_1 (Référence)

### Tuile 1 : Mes aides financières
```typescript
{
  format: "portrait h-[400px] md:h-[480px]",
  image: "/assets/aides-financieres.jpg",
  icon: "Calculator",
  title: "Mes aides financières",
  subtitle: "Estimez rapidement les aides auxquelles votre famille peut avoir droit",
  cta: "Découvrir mes aides"
}
```

### Tuile 2 : Mes trajets et mobilités
```typescript
{
  format: "portrait h-[400px] md:h-[480px]",
  image: "/assets/eco-mobilite.jpg",
  icon: "Train",
  title: "Mes trajets et mobilités",
  subtitle: "Préparez vos déplacements avec des solutions éco-responsables",
  cta: "Voir les solutions"
}
```

### Tuile 3 : Ma ville & mon actu
```typescript
{
  format: "portrait h-[400px] md:h-[480px]",
  image: "/assets/actualite-ville.jpg",
  icon: "Newspaper",
  title: "Ma ville, mon actu",
  subtitle: "Tous les événements, sorties et animations près de chez vous",
  cta: "Découvrir les événements"
}
```

### Tuile 4 : Prix Bon Esprit
```typescript
{
  format: "portrait h-[400px] md:h-[480px]",
  image: "/assets/actualite-prix.jpg",
  icon: "Award",
  title: "Prix Bon Esprit",
  subtitle: "Valorisez les belles actions ! Votez pour ceux qui font briller votre quartier",
  cta: "Voter pour un héros"
}
```

---

## ✅ Checklist de Validation

Avant de merger une modification des tuiles hero :

- [ ] Les tuiles sont en format portrait (`h-[400px] md:h-[480px]`)
- [ ] Les images locales sont présentes dans `/assets/`
- [ ] Les icônes sont centrées avec backdrop blur
- [ ] Le build passe sans erreur (`npm run build`)
- [ ] Le preview local affiche correctement les tuiles
- [ ] Une PR vers `main` a été créée
- [ ] La PR a été reviewée et approuvée
- [ ] Après merge, le preview Lovable a été vérifié

---

**Dernière mise à jour:** 18 novembre 2025
**Commit de référence:** `1c5e23e` (JSON_1)
**Mainteneur:** Claude AI
