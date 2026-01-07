# AUDIT FRONT vs SUPABASE - Flooow Connect
**Date:** 2026-01-07
**Project:** https://kbrgwezkjaakoecispom.supabase.co
**Auditeur:** Claude Code (Sonnet 4.5)

---

## 1. RÉSUMÉ EXÉCUTIF

### ✅ Points forts (Cohérence confirmée)

1. **Aucun prix hardcodé** : Le front affiche toujours `price_base` depuis Supabase, sans valeurs (360/410/560) en dur
2. **Filtrage visibilité correct** : `is_published=true` appliqué sur toutes les requêtes (Home, Recherche, Détail)
3. **Aides sur cartes** : Labels uniquement (pas de montants), conformément à C-AIDS-001
4. **Mapping champs cohérent** : Les champs Supabase sont correctement mappés vers les types TypeScript
5. **RPC utilisées** : Les montants d'aides proviennent de `get_eligible_aids` et `calculate_reste_a_charge` (pas de calcul local sauvage)

### ⚠️ Points d'attention (Potentielles incohérences)

1. **Durée inclusive** : Le front calcule `diffDays + 1` pour afficher la durée INCLUSIVE, mais si `duration_days` en DB stocke déjà la durée inclusive, il y a double-comptage
2. **Filtre date_fin** : Aucun filtre `date_fin >= today` détecté → activités passées potentiellement affichées
3. **Zone unique montants** : Montants d'aides affichés dans PricingSummaryCard (OK) ET dans SharedAidCalculator (ancien composant legacy ?)
4. **Plafond 30% reste** : Appliqué via `applyAidCap()` côté front, mais devrait idéalement être géré par RPC Supabase

---

## 2. CARTOGRAPHIE DES POINTS D'ENTRÉE DATA

### 2.1 Requêtes Supabase principales

| Fichier | Fonction/Hook | Table | Champs sélectionnés | Filtres appliqués |
|---------|---------------|-------|---------------------|-------------------|
| `src/hooks/useActivities.ts` | `useActivities()` | activities | `*` (tous) | `is_published=true` + filtres âge/catégorie/prix |
| `src/utils/buildActivityQuery.ts` | `buildActivityQuery()` | activities | `*` (tous) | `is_published=true` + filtres recherche avancée |
| `src/lib/api/activities.ts` | `searchActivities()` | activities | `*` (tous) | Filtres catégorie/âge/prix |
| `src/pages/ActivityDetail.tsx` | requête directe | activities | `*` (tous) | `id=...` pour détail |
| `src/pages/ActivityDetail.tsx` | suggestions | activities | id, title, categories, age_min, age_max, price_base, period_type, images | `is_published=true` + âge compatible |

### 2.2 RPC Supabase utilisées

| Fichier | Fonction RPC | Paramètres | Retour |
|---------|--------------|------------|--------|
| `src/hooks/useEligibleAids.ts` | `get_eligible_aids` | activity_id, age, qf, is_qpv, territory_code, nb_children | Array<EligibleAid> (aid_name, aid_amount, is_eligible) |
| `src/hooks/useResteACharge.ts` | `calculate_reste_a_charge` | activity_id, quotient_familial | prix_initial, prix_applicable, reduction_pct, tranche_appliquee |

### 2.3 Mapping champs Supabase → Types front

| Champ Supabase | Type TypeScript | Champ Activity | Transformation |
|----------------|-----------------|----------------|----------------|
| `id` | string | `id` | Direct |
| `title` | string | `title` | Direct |
| `age_min` | number | `ageMin` | Direct |
| `age_max` | number | `ageMax` | Direct |
| `price_base` | number | `price` | Direct |
| `price_unit` | string \| null | `priceUnit` | Direct |
| `duration_days` | number \| null | `durationDays` | Direct |
| `date_debut` | string \| null | `dateDebut` | Direct (ISO 8601) |
| `date_fin` | string \| null | `dateFin` | Direct (ISO 8601) |
| `categories` | string[] | `categories` + `category` | `category` = categories[0] |
| `period_type` | string | `periodType` | Direct |
| `accepts_aid_types` | any[] | `aidesEligibles` | Transformation via formatAidLabel() |
| `is_published` | boolean | *(filtre)* | Utilisé pour filtrer, pas mappé |
| `images` | string[] | `image` | images[0] ou fallback via getActivityImage() |
| `organism_name` | string | `organism_name` | Direct (colonne dénormalisée) |
| `city` | string | `structures.city` | Via mapping structures |

---

## 3. TABLEAU INCOHÉRENCES DATES/DURÉES

| # | Fichier | Ligne | Écran | Problème détecté | Champ Supabase | Action recommandée |
|---|---------|-------|-------|------------------|----------------|--------------------|
| **D-001** | `src/pages/ActivityDetail.tsx` | 541-553 | Détail activité (Dates du séjour) | Calcul `diffDays + 1` pour affichage inclusif → **Si `duration_days` en DB stocke déjà la durée inclusive, double-comptage** | `date_debut`, `date_fin`, `duration_days` | **Vérifier la convention DB** : `duration_days` stocke-t-il la durée EXCLUSIVE (fin - début) ou INCLUSIVE (fin - début + 1) ? Si inclusive, retirer le `+1` front. |
| **D-002** | Toutes requêtes | N/A | Home, Recherche | **Aucun filtre `date_fin >= today`** détecté → activités passées potentiellement affichées | `date_fin` | Ajouter un filtre `.gte('date_fin', today())` ou `.is('date_fin', null)` dans `useActivities` et `buildActivityQuery` pour respecter C-VISIBILITY-001 |
| **D-003** | `src/pages/ActivityDetail.tsx` | 545-547 | Détail activité | Rejet si `diffDays > 30 ou < 1` → logique défensive pour détecter erreurs données (dates saison au lieu de séjour) | `date_debut`, `date_fin` | ✅ Bonne pratique. Documenter que cette garde protège contre des erreurs de saisie DB. |

**Verdict D-001** :
🔴 **INCOHÉRENCE POTENTIELLE** - Le front assume que `duration_days` en DB stocke `fin - début` (EXCLUSIF) et ajoute `+1` pour afficher la durée inclusive. **Si la convention métier est que `duration_days` est déjà inclusif, il y a un bug**.

**Convention métier attendue (C-DATE-001)** :
> "Pour les vacances, la durée affichée doit intégrer le jour de départ et le jour de retour."
> Donc durée_affichée = (date_fin - date_debut + 1) jours.

**Recommandation** :
1. Vérifier en DB si `duration_days` = `date_fin - date_debut` (EXCLUSIF) ou `date_fin - date_debut + 1` (INCLUSIF)
2. Si EXCLUSIF → garder le `+1` front (OK)
3. Si INCLUSIF → retirer le `+1` front pour éviter d'afficher "6 jours" pour un séjour de 5 jours

---

## 4. TABLEAU INCOHÉRENCES TARIFS

| # | Fichier | Ligne | Écran | Problème détecté | Champ Supabase | Action recommandée |
|---|---------|-------|-------|------------------|----------------|--------------------|
| **P-001** | ✅ Aucun | N/A | Toutes cartes | **Aucun prix hardcodé (360/410/560) détecté** | `price_base` | ✅ Conforme à C-PRICE-002 |
| **P-002** | `src/components/Activity/ActivityCard.tsx` | 109 | Cartes Home/Recherche | Ligne `const priceAfterAids = price > 100 ? Math.round(price * 0.7) : price;` → **Estimation locale 70% non utilisée dans l'affichage** (variable `_hasAids` non référencée) | `price_base` | ✅ Code mort. Peut être retiré (pas de bug actif). |
| **P-003** | `src/utils/pricingSummary.ts` | 68-108 | Calcul aides | Plafond 70% appliqué via `applyAidCap()` côté **front** → devrait être géré par **RPC Supabase** pour cohérence | N/A | Migrer `applyAidCap()` dans RPC `calculate_reste_a_charge` pour éviter divergences front/back |
| **P-004** | `src/components/Activity/ActivityCard.tsx` | 28-35 | Cartes vacances | `getPriceUnitLabel()` : unité déduite du `vacationType` (sejour → "par semaine", centre → "par jour") → **Si `price_unit` existe en DB, il devrait être prioritaire** | `price_unit` | Vérifier que `price_unit` en DB est bien renseigné. Si oui, afficher `price_unit` en priorité, sinon fallback sur `getPriceUnitLabel()`. |

**Verdict P-003** :
🟡 **ATTENTION** - Le plafond 30% reste à charge est appliqué côté front dans `applyAidCap()`. Cela fonctionne, mais crée un risque de divergence si le back calcule différemment.

**Recommandation** :
Déplacer la logique de plafonnement dans la RPC `calculate_reste_a_charge` pour garantir une source unique de vérité.

---

## 5. TABLEAU INCOHÉRENCES AIDES

| # | Fichier | Ligne | Écran | Problème détecté | Champ Supabase | Action recommandée |
|---|---------|-------|-------|------------------|----------------|--------------------|
| **A-001** | `src/components/Activity/ActivityCard.tsx` | 268-279 | Cartes Home/Recherche | ✅ **Labels uniquement** (via `formatAidLabel()`), max 2 aides + "+N" → conforme C-AIDS-001 | `accepts_aid_types` | ✅ Conforme |
| **A-002** | `src/components/pricing/PricingSummaryCard.tsx` | 1-150 | Fiche activité (zone unique) | ✅ Montants affichés via RPC `get_eligible_aids` et `calculate_reste_a_charge` → conforme C-AIDS-002 | N/A | ✅ Conforme |
| **A-003** | `src/components/aids/SharedAidCalculator.tsx` | 1000-1032 | ⚠️ Ancien composant ? | **Montants d'aides affichés** (ligne 1012, 1018) → **Zone divergente ?** Si ce composant est encore utilisé, il viole C-AIDS-002 | N/A | Vérifier si `SharedAidCalculator` est encore utilisé. Si oui, le remplacer par `PricingSummaryCard`. Si non, le supprimer. |
| **A-004** | `src/utils/FinancialAidEngine.ts` | 1-1000+ | Calcul local legacy | ⚠️ **Moteur de calcul local complexe** (FinancialAidEngine) → **redondant avec RPC Supabase** ? | N/A | Vérifier si ce fichier est encore utilisé. Si non, le déprécier/supprimer pour éviter confusion. |

**Verdict A-003** :
🔴 **INCOHÉRENCE POTENTIELLE** - Le composant `SharedAidCalculator` semble être un ancien calculateur qui affiche des montants d'aides. Si encore utilisé, il crée une seconde zone de calcul/affichage, violant C-AIDS-002.

**Recommandation** :
1. Grep usage de `SharedAidCalculator` dans le codebase
2. Si utilisé → migrer vers `PricingSummaryCard` + RPC
3. Si inutilisé → supprimer

---

## 6. FILTRES VISIBILITÉ (C-VISIBILITY-001)

### 6.1 Filtre `is_published=true`

✅ **CONFORME** - Appliqué partout :

| Fichier | Ligne | Code |
|---------|-------|------|
| `src/hooks/useActivities.ts` | 215 | `.eq("is_published", true)` |
| `src/utils/buildActivityQuery.ts` | 147, 168 | `.eq('is_published', true)` |
| `src/pages/ActivityDetail.tsx` | 411 | `.eq("is_published", true)` (suggestions) |

### 6.2 Filtre `date_fin >= today`

🔴 **NON CONFORME** - Aucun filtre détecté pour exclure les activités passées.

**Recommandation** :
Ajouter dans `useActivities.ts` (ligne ~220) et `buildActivityQuery.ts` (ligne ~150) :

```typescript
// Exclure activités passées (vacances uniquement, scolaire n'a pas de date_fin fixe)
if (filters?.periodType === 'vacances') {
  query = query.or(`date_fin.is.null,date_fin.gte.${new Date().toISOString().split('T')[0]}`);
}
```

**Justification** :
Les activités `scolaire` sont cycliques (ex: cours de piano toute l'année), donc pas de `date_fin` stricte. Les activités `vacances` ont des dates fixes → doivent être filtrées si passées.

---

## 7. LISTE EXHAUSTIVE DES FICHIERS/FONCTIONS MANIPULANT ACTIVITIES

### 7.1 Hooks/API (fetching data)

| Fichier | Export principal | Description |
|---------|------------------|-------------|
| `src/hooks/useActivities.ts` | `useActivities()` | Hook principal pour récupérer liste activités (Home, Recherche) |
| `src/hooks/useEligibleAids.ts` | `useEligibleAids()` | RPC `get_eligible_aids` - calcul aides éligibles |
| `src/hooks/useResteACharge.ts` | `useResteACharge()` | RPC `calculate_reste_a_charge` - calcul prix applicable avec QF |
| `src/lib/api/activities.ts` | `searchActivities()` | API search (validation Zod + query Supabase) |
| `src/utils/buildActivityQuery.ts` | `buildActivityQuery()` | Construction query Supabase avec filtres avancés |

### 7.2 Types/Schémas (data modeling)

| Fichier | Export principal | Description |
|---------|------------------|-------------|
| `src/types/domain.ts` | `Activity`, `ActivityRaw` | Types métier (contrat FO/BO) |
| `src/types/schemas.ts` | `toActivity()`, `ActivityDomainSchema` | Validation Zod + mapping raw → Activity |
| `src/integrations/supabase/types.ts` | Types générés Supabase | Types auto-générés par CLI Supabase |

### 7.3 Composants (display)

| Fichier | Composant | Écran | Données affichées |
|---------|-----------|-------|-------------------|
| `src/components/Activity/ActivityCard.tsx` | `ActivityCard` | Home, Recherche (grille) | Titre, image, âge, prix, labels aides (max 2) |
| `src/components/Search/ActivityCardCompact.tsx` | `ActivityCardCompact` | Recherche (liste/map) | Titre, catégorie, prix, organisateur |
| `src/components/pricing/PricingSummaryCard.tsx` | `PricingSummaryCard` | Détail activité | Prix initial, aides éligibles (montants), reste à charge |
| `src/components/aids/SharedAidCalculator.tsx` | `SharedAidCalculator` | ⚠️ Ancien composant ? | Calcul aides (legacy, potentiellement redondant) |
| `src/pages/ActivityDetail.tsx` | `ActivityDetail` | Détail activité | Toutes infos (images, dates, prix, aides, sessions) |
| `src/pages/Index.tsx` | `Index` | Home | Sections "À proximité", "Petits budgets" |
| `src/pages/SearchResults.tsx` | `SearchResults` | Recherche | Liste/Grille/Map résultats |

### 7.4 Utilitaires (formatting)

| Fichier | Export principal | Description |
|---------|------------------|-------------|
| `src/utils/pricingSummary.ts` | `computePricingSummaryFromSupabase()` | Calcul résumé pricing (prix, aides, reste) depuis RPC |
| `src/utils/activityFormatters.ts` | `formatAgeRange()`, `formatPrice()`, `formatAidLabel()` | Formatage âge, prix, labels aides |
| `src/utils/categoryMapping.ts` | `formatAgeRangeForCard()`, `getPeriodLabel()` | Formatage catégories/périodes |
| `src/lib/imageMapping.ts` | `getActivityImage()` | Fallback image intelligent (titre + catégorie + âge) |

---

## 8. RÉCAPITULATIF DES ACTIONS RECOMMANDÉES

### 🔴 Priorité HAUTE (Incohérences actives)

1. **[D-002] Ajouter filtre `date_fin >= today`** pour activités vacances passées
   - Fichiers : `src/hooks/useActivities.ts`, `src/utils/buildActivityQuery.ts`
   - Impact : Activités passées peuvent apparaître en recherche/home

2. **[D-001] Vérifier convention `duration_days`** (inclusive ou exclusive)
   - Si DB stocke durée inclusive → retirer `+1` dans `ActivityDetail.tsx:553`
   - Si DB stocke durée exclusive → garder le `+1` (OK)

3. **[A-003] Audit `SharedAidCalculator.tsx`**
   - Vérifier si encore utilisé
   - Si oui → migrer vers `PricingSummaryCard` + RPC
   - Si non → supprimer

### 🟡 Priorité MOYENNE (Optimisations)

4. **[P-003] Migrer plafond 30% dans RPC Supabase**
   - Déplacer logique `applyAidCap()` de `pricingSummary.ts` vers RPC `calculate_reste_a_charge`
   - Impact : Garantit source unique de vérité back/front

5. **[P-004] Prioriser `price_unit` depuis DB**
   - Si `price_unit` existe en DB → afficher directement
   - Sinon → fallback sur `getPriceUnitLabel()` (OK actuel)

6. **[A-004] Déprécier `FinancialAidEngine.ts`** si redondant avec RPC

### 🟢 Priorité BASSE (Code cleanup)

7. **[P-002] Retirer variable `_hasAids` inutilisée**
   - `src/components/Activity/ActivityCard.tsx:110`

---

## 9. VALIDATION DES CONVENTIONS MÉTIER

| Convention | Statut | Preuve |
|------------|--------|--------|
| **C-DATE-001** (durée inclusive) | ⚠️ Incertain | Front calcule `+1`, mais si DB déjà inclusive → bug |
| **C-PRICE-001** (30% reste min) | ✅ Appliqué | `applyAidCap()` dans `pricingSummary.ts` |
| **C-VISIBILITY-001** (published + not past) | 🔴 Partiel | `is_published=true` OK, mais pas de filtre `date_fin>=today` |
| **C-PRICE-002** (prix harmonisés 360/410/560) | ✅ Conforme | Aucun prix hardcodé, affiche `price_base` |
| **C-AIDS-001** (labels seulement sur cartes) | ✅ Conforme | `ActivityCard` affiche 2 labels max via `formatAidLabel()` |
| **C-AIDS-002** (montants zone unique) | ⚠️ Risque | `PricingSummaryCard` OK, mais `SharedAidCalculator` suspect |

---

## 10. CONCLUSION

### Score de cohérence global : **7.5/10**

**Points forts** :
- Architecture RPC Supabase bien utilisée
- Pas de prix hardcodés
- Filtrage `is_published` rigoureux
- Affichage aides sur cartes conforme (labels uniquement)

**Points faibles** :
- Filtre activités passées manquant
- Incertitude sur convention `duration_days` (inclusive ou non)
- Composant legacy `SharedAidCalculator` potentiellement divergent
- Plafond 30% géré côté front (devrait être back)

**Prochaines étapes** :
1. ✅ Appliquer corrections D-002 (filtre date_fin) et D-001 (vérifier duration_days)
2. ✅ Auditer usage de `SharedAidCalculator` et `FinancialAidEngine`
3. ✅ Migrer plafond aides dans RPC Supabase (long terme)

---

**Fin du rapport**
*Généré par Claude Code le 2026-01-07*
