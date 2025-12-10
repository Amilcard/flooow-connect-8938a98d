# Document de Passation - Session 09/12/2024

## Branche de travail
```
claude/audit-ui-ux-design-0191canxK8gLaHggFzGyFyho
```

## Dernier commit
```
c87587b fix(urgent): Remove images from SELECT - column not in view
```

---

## TRAVAIL ACCOMPLI CETTE SESSION

### 1. Corrections Pixel-Perfect (Commit f963189)

#### A. Alignement Boussole (Header/Content/BottomNav)
| Fichier | Modification |
|---------|-------------|
| `src/components/PageHeader.tsx` | `h-16` fixe + `flex items-center` centrage vertical |
| `src/components/Search/SearchPageHeader.tsx` | `max-w-5xl mx-auto h-16` |
| `src/components/Search/ResultsGrid.tsx` | `max-w-5xl mx-auto px-4` wrapper |
| `src/pages/MonCompte.tsx` | `max-w-5xl` remplace `max-w-[1200px]` |

#### B. Fix Mapping Images (Tentative)
- Objectif: Corriger le bug où Tennis affichait Judo, Boxe affichait Natation
- Modification dans `useActivities.ts`: Priorité à `images[]` sur `image_url`

### 2. Fix Urgent Production (Commit c87587b)

**PROBLEME**: L'ajout de `images` au SELECT cassait la page d'accueil car la colonne n'existe pas dans la vue `activities_with_sessions`.

**SOLUTION**: Retiré `images` du SELECT. Le fallback `image_url` fonctionne.

**ATTENTION**: Le bug d'images persiste potentiellement car:
- La vue `activities_with_sessions` n'a que `image_url` (singulier)
- La table `activities` a `images` (array) mais n'est pas utilisée par `useActivities`
- Pour SearchResults, `buildActivityQuery.ts` utilise `activities` avec `*` donc images[] fonctionne

---

## FICHIERS MODIFIES (non commités = 0)

Tous les changements sont commités et poussés.

---

## BUGS CONNUS / A INVESTIGUER

### Bug Images (Priorité Haute)
Le mapping des images peut encore être incorrect sur la page d'accueil car:
1. `useActivities.ts` utilise la vue `activities_with_sessions` qui n'a que `image_url`
2. Si `image_url` est vide/null, le fallback `getActivityImage()` est utilisé
3. Le fallback peut retourner une image incorrecte si le titre ne match pas bien

**Solutions possibles**:
- Modifier la vue Supabase `activities_with_sessions` pour inclure `images`
- Ou: Changer `useActivities` pour utiliser la table `activities` directement
- Ou: S'assurer que `image_url` est correctement rempli dans la BDD

### Fichiers concernés par les images
```
src/hooks/useActivities.ts          # Home page - utilise activities_with_sessions
src/utils/buildActivityQuery.ts     # Search page - utilise activities (OK)
src/types/schemas.ts                # toActivity() - logique de fallback
src/lib/imageMapping.ts             # getActivityImage() - fallback intelligent
```

---

## TACHES NON COMMENCEES (de la requête utilisateur)

### Refactoring ActivityDetail.tsx (Desktop Layout)
La requête JSON demandait:
1. **Layout 2 colonnes Desktop** (lg:grid-cols-3)
   - Colonne gauche (span 2): Image Hero + Description + Tabs
   - Colonne droite (span 1): Booking Card sticky

2. **Booking Card** avec:
   - Header Organisateur (Logo + Nom + Bouton Contact)
   - Affichage Prix
   - Sélecteur de Session (Dropdown au lieu de liste statique)
   - CTA Réserver

3. **Session Logic UX**: Remplacer "Prochaines séances" par un sélecteur cliquable

4. **Accessibilité Visuelle**: Orange text → Dark Grey (slate-700), Orange = CTA uniquement

---

## STRUCTURE TECHNIQUE IMPORTANTE

### Flux des données activités

```
HOME PAGE:
Index.tsx → useActivities() → activities_with_sessions (vue) → image_url seulement

SEARCH PAGE:
SearchResults.tsx → buildActivityQuery() → activities (table) → images[] array
```

### Pattern Alignement Boussole
```tsx
// Header
<div className="max-w-5xl mx-auto h-16 flex items-center px-4">

// Content
<div className="max-w-5xl mx-auto px-4">

// BottomNav
<div className="max-w-5xl mx-auto px-4">
```

---

## COMMANDES UTILES

```bash
# Vérifier le build
npm run build

# Voir les derniers commits
git log --oneline -10

# Push sur la branche
git push -u origin claude/audit-ui-ux-design-0191canxK8gLaHggFzGyFyho
```

---

## URL BRANCH
https://github.com/Amilcard/flooow-connect-8938a98d/tree/claude/audit-ui-ux-design-0191canxK8gLaHggFzGyFyho

---

## PROCHAINES PRIORITES SUGGEREES

1. **Vérifier si le bug images est résolu en production** après déploiement
2. **Si bug persiste**: Modifier la vue Supabase ou le hook useActivities
3. **Refactoring ActivityDetail.tsx** selon la spec JSON fournie
4. **ButtonCTA standardisé** (h-12 pour zone pouce mobile) - mentionné dans session précédente

---

*Document généré le 09/12/2024*
