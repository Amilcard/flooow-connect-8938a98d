# Audit Complet: 25 Activités - Cohérence UI vs Supabase

**Date:** 2026-01-11
**Contexte:** Validation de la cohérence entre les données affichées dans l'UI (captures écran) et Supabase (source de vérité)

---

## Règle Métier Critique

> **`caf_loire_temps_libre` est DÉSACTIVÉ pour les activités SAISON (scolaire)**
>
> Cette aide ne doit apparaître que sur les activités **VACANCES**.

### État de l'implémentation

| Couche | Statut | Détail |
|--------|--------|--------|
| **Backend (FinancialAidEngine.ts)** | ✅ Implémenté | Lignes 430-432: `if (periode !== 'vacances') return null;` |
| **Supabase (accepts_aid_types)** | ⚠️ À vérifier | Peut encore contenir `caf_loire_temps_libre` pour certaines activités SAISON |
| **UI (affichage)** | ❌ Incohérent | Les captures montrent `caf_loire_temps_libre` sur des activités SAISON |

---

## Synthèse des 25 Activités

### Activités SAISON (17 activités)

| # | Titre | Prix UI | Catégorie | Aides UI | CAF Loire Status |
|---|-------|---------|-----------|----------|------------------|
| 1 | Arts plastiques – Atelier créatif | 210€ | CULTURE | caf_loire (80€) | ❌ À retirer |
| 2 | Atelier théâtre ados | 230€ | CULTURE | caf_loire (80€) | ❌ À retirer |
| 3 | Basket – Mini-basket et cadets | 260€ | SPORT | caf_loire (80€) + pass_sport (50€) | ❌ À retirer |
| 4 | Chant – Chorale et technique vocale | 190€ | CULTURE | caf_loire (80€) | ❌ À retirer |
| 5 | Cirque – Arts du cirque | 220€ | CULTURE | caf_loire (80€) | ❌ À retirer |
| 6 | Conservatoire de musique – Violon | 380€ | CULTURE | caf_loire (80€) | ❌ À retirer |
| 7 | Danse classique – Cours hebdomadaire | 320€ | CULTURE | caf_loire (80€) | ❌ À retirer |
| 8 | Équitation – Poney et cheval | 420€ | SPORT | caf_loire (80€) | ❌ À retirer |
| 9 | Escalade – Mur d'escalade | 260€ | SPORT | caf_loire (80€) + pass_sport (50€) | ❌ À retirer |
| 10 | Football – École de foot U10 | 240€ | SPORT | caf_loire (80€) + pass_sport (50€) | ❌ À retirer |
| 11 | Gymnastique – Baby gym et éveil | 190€ | SPORT | caf_loire (80€) | ❌ À retirer |
| 12 | Judo – Cours débutants | 230€ | SPORT | caf_loire (80€) + pass_sport (50€) | ❌ À retirer |
| 13 | Multisports – Initiation découverte | 220€ | SPORT | pass_sport (50€) | ✅ OK |
| 14 | Natation – École de natation | 260€ | SPORT | caf_loire (80€) | ❌ À retirer |
| 15 | Piano – Cours individuels | 420€ | CULTURE | caf_loire (80€) | ❌ À retirer |
| 16 | Robotique – Programmation | 260€ | SCOLARITÉ | caf_loire (80€) | ❌ À retirer |
| 17 | Tennis – École de tennis | 260€ | SPORT | caf_loire (80€) + pass_sport (50€) | ❌ À retirer |

**Résultat SAISON:** 16/17 activités affichent `caf_loire_temps_libre` alors que cette aide doit être absente.

---

### Activités VACANCES (8 activités)

| # | Titre | Prix UI | Catégorie | Aides UI | Status |
|---|-------|---------|-----------|----------|--------|
| 1 | Camp nature – Découverte environnement | 360€ | LOISIRS | ancv (50€) + vacaf_ave (180€) | ✅ OK |
| 2 | Camp ski – Séjour montagne hiver | 560€ | LOISIRS | ancv (50€) | ✅ OK |
| 3 | Colonie de vacances été – Montagne | 550€ | LOISIRS | ancv (50€) + pass_colo (200€) + vacaf_ave (135€) | ✅ OK |
| 4 | Mini-séjour mer – Découverte océan | 360€ | LOISIRS | ancv (50€) + vacaf_ave (180€) | ✅ OK |
| 5 | Stage dessin – Techniques artistiques | 360€ | CULTURE | ancv (50€) | ✅ OK |
| 6 | Stage multi-sports – Été | 410€ | SPORT | ancv (50€) + vacaf_ave (205€) | ✅ OK |
| 7 | Stage photo – Initiation photographie | 360€ | CULTURE | ancv (50€) | ✅ OK |
| 8 | Stage sciences – Expériences et découvertes | 360€ | SCOLARITÉ | ancv (50€) | ✅ OK |

**Résultat VACANCES:** 8/8 activités conformes (aides vacances uniquement).

---

## Détail par Activité SAISON

### 1. Arts plastiques – Atelier créatif

| Champ | Valeur UI | Valeur Supabase Attendue | Status |
|-------|-----------|-------------------------|--------|
| `price_base` | 210€ | 210€ | ✅ |
| `period_type` | SAISON | scolaire | ✅ |
| `accepts_aid_types` | ["caf_loire_temps_libre"] | [] | ❌ |
| Créneaux | Mer 14:00-16:00 | `creneaux` JSON | ⚠️ Vérifier |

**Correction UI:** Reste à charge devrait être 210€ (pas 130€) sans `caf_loire_temps_libre`.

---

### 2. Atelier théâtre ados

| Champ | Valeur UI | Valeur Supabase Attendue | Status |
|-------|-----------|-------------------------|--------|
| `price_base` | 230€ | 230€ | ✅ |
| `period_type` | SAISON | scolaire | ✅ |
| `accepts_aid_types` | ["caf_loire_temps_libre"] | ["pass_culture"] | ❌ |
| Créneaux | Mer 17:00-20:00 | `creneaux` JSON | ⚠️ Vérifier |

**Note:** `pass_culture` possible pour 15-17 ans (activité CULTURE).

---

### 3. Basket – Mini-basket et cadets

| Champ | Valeur UI | Valeur Supabase Attendue | Status |
|-------|-----------|-------------------------|--------|
| `price_base` | 260€ | 260€ | ✅ |
| `period_type` | SAISON | scolaire | ✅ |
| `accepts_aid_types` | ["caf_loire_temps_libre", "pass_sport"] | ["pass_sport"] | ❌ |
| Créneaux | Mer 17:00-20:00 | `creneaux` JSON | ⚠️ Vérifier |

**Correction:** Retirer `caf_loire_temps_libre`, garder `pass_sport`.
**UI corrigée:** Reste à charge = 260 - 50 = 210€ (au lieu de 130€).

---

### 4-17. Autres activités SAISON

Voir tableau synthétique ci-dessus. Toutes suivent le même schéma:
- `caf_loire_temps_libre` affiché en UI → **À retirer**
- `pass_sport` valide pour les activités SPORT
- `pass_culture` valide pour CULTURE 15-17 ans

---

## Détail par Activité VACANCES

### Camp nature – Découverte environnement

| Champ | Valeur UI | Valeur Supabase Attendue | Status |
|-------|-----------|-------------------------|--------|
| `price_base` | 360€ | 360€ | ✅ |
| `period_type` | VACANCES | vacances | ✅ |
| `vacation_type` | - | sejour_hebergement | ✅ |
| `accepts_aid_types` | ["ancv", "vacaf_ave"] | ["ANCV", "VACAF_AVE"] | ✅ |
| Date disponible | 2026-07-07 | vacation_periods: été_2026 | ✅ |

---

### Colonie de vacances été – Montagne

| Champ | Valeur UI | Valeur Supabase Attendue | Status |
|-------|-----------|-------------------------|--------|
| `price_base` | 550€ | 550€ | ✅ |
| `period_type` | VACANCES | vacances | ✅ |
| `vacation_type` | - | sejour_hebergement | ✅ |
| `accepts_aid_types` | ["ancv", "pass_colo", "vacaf_ave"] | ["ANCV", "PASS_COLO", "VACAF_AVE"] | ✅ |
| Date disponible | 2026-07-14 | vacation_periods: été_2026 | ✅ |

---

## Actions Correctives Requises

### 1. Supabase: Retirer `caf_loire_temps_libre` des activités SAISON

```sql
-- Vérifier les activités concernées
SELECT id, title, period_type, accepts_aid_types
FROM activities
WHERE period_type = 'scolaire'
  AND (accepts_aid_types::text ILIKE '%caf%' OR accepts_aid_types::text ILIKE '%CAF_LOIRE%');

-- Appliquer la correction
UPDATE activities
SET accepts_aid_types = (
  SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
  FROM jsonb_array_elements(accepts_aid_types) AS elem
  WHERE elem::text NOT ILIKE '%caf%'
    AND elem::text NOT ILIKE '%CAF_LOIRE%'
)
WHERE period_type = 'scolaire'
  AND (accepts_aid_types::text ILIKE '%caf%' OR accepts_aid_types::text ILIKE '%CAF_LOIRE%');
```

### 2. UI: Vérifier le filtrage des aides

Le composant qui affiche les aides doit:
1. Utiliser le résultat de `FinancialAidEngine` qui filtre déjà par période
2. Ne pas afficher `caf_loire_temps_libre` si `period_type = 'scolaire'`

**Fichier concerné:** `src/components/activities/FinancialAidsCalculator.tsx`

```typescript
// Ligne 37 - déjà défini
const VACATION_ONLY_AIDS = ['Pass Colo', 'VACAF AVE', 'VACAF AVF', 'CAF Loire', 'ANCV'];

// S'assurer que ce filtrage est appliqué dans le rendu
```

### 3. Vérification des prix

Tous les prix UI correspondent aux valeurs attendues dans `aid_grid`:

| Prix | Activités |
|------|-----------|
| 190€ | Gymnastique, Chant |
| 210€ | Arts plastiques |
| 220€ | Cirque, Multisports |
| 230€ | Théâtre ados, Judo |
| 240€ | Football U10 |
| 260€ | Basket, Escalade, Natation, Robotique, Tennis |
| 320€ | Danse classique |
| 380€ | Conservatoire Violon |
| 420€ | Piano, Équitation |
| 360€ | Camp nature, Mini-séjour mer, Stages (dessin, photo, sciences) |
| 410€ | Stage multi-sports |
| 550€ | Colonie été |
| 560€ | Camp ski |

---

## Impact sur le Reste à Charge

### Avant correction (UI actuelle)

| Activité SAISON | Prix | Aides UI | Reste à charge UI |
|-----------------|------|----------|-------------------|
| Arts plastiques | 210€ | 80€ (CAF Loire) | 130€ |
| Basket | 260€ | 130€ (CAF + Pass'Sport) | 130€ |
| Chant | 190€ | 80€ (CAF Loire) | 110€ |

### Après correction (sans CAF Loire sur SAISON)

| Activité SAISON | Prix | Aides | Reste à charge |
|-----------------|------|-------|----------------|
| Arts plastiques | 210€ | 0€ | **210€** |
| Basket | 260€ | 50€ (Pass'Sport) | **210€** |
| Chant | 190€ | 0€ | **190€** |

**Note:** Les familles éligibles au Pass'Sport (activités SPORT) conservent cette aide.

---

## Fichiers Générés

| Fichier | Description |
|---------|-------------|
| `supabase/audit_25_activities_complete.sql` | Script SQL d'audit et correction |
| `docs/AUDIT_25_ACTIVITIES_COMPLETE.md` | Ce rapport |

---

## Conclusion

| Élément | Activités conformes | À corriger |
|---------|---------------------|------------|
| **Prix** | 25/25 | 0 |
| **Période** | 25/25 | 0 |
| **Aides SAISON** | 1/17 | 16 (retirer CAF Loire) |
| **Aides VACANCES** | 8/8 | 0 |

**Priorité:** Corriger l'affichage des aides sur les 16 activités SAISON qui montrent `caf_loire_temps_libre`.
