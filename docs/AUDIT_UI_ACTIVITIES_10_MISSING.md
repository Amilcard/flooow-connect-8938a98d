# Audit: 10 Activités Manquantes - Comparaison UI vs DB

**Date:** 2026-01-11
**Contexte:** Validation des données extraites des captures UI contre les données attendues en base
**Source:** JSON fourni avec 10 activités extraites des captures écran

---

## 1. Résumé de la Comparaison

| # | Activité | Prix UI | Prix DB Attendu | Statut Prix | Période UI | Aides UI |
|---|----------|---------|-----------------|-------------|------------|----------|
| 1 | Atelier arts plastiques | 210€ | 210€ | ✅ | SAISON | caf_loire_temps_libre (80€) |
| 2 | Atelier théâtre ados | 230€ | 230€ | ✅ | SAISON | caf_loire_temps_libre (80€) |
| 3 | Basket – Mini-basket et cadets | 260€ | 260€ | ✅ | SAISON | caf_loire_temps_libre (80€) + pass_sport (50€) |
| 4 | Gymnastique – Baby gym et éveil | 190€ | 190€ | ✅ | SAISON | caf_loire_temps_libre (80€) |
| 5 | Camp nature – Découverte environnement | 360€ | 360€ | ✅ | VACANCES | ancv (50€) + vacaf_ave (180€) |
| 6 | Camp ski – Séjour montagne hiver | 560€ | 560€ | ✅ | VACANCES | ancv (50€) |
| 7 | Chant – Chorale et technique vocale | 190€ | 190€ | ✅ | SAISON | caf_loire_temps_libre (80€) |
| 8 | Cirque – Arts du cirque | 220€ | 220€ | ✅ | SAISON | caf_loire_temps_libre (80€) |
| 9 | Colonie de vacances été – Montagne | 550€ | 550€ | ✅ | VACANCES | ancv (50€) + pass_colo (200€) + vacaf_ave (135€) |
| 10 | Conservatoire de musique – Violon | 380€ | 380€ | ✅ | SAISON | caf_loire_temps_libre (80€) |

**Résultat:** ✅ **10/10 prix cohérents** avec la grille `aid_grid`

---

## 2. Détail par Activité

### 2.1 Activités Scolaires (SAISON)

#### Atelier arts plastiques
| Champ | Valeur UI | Valeur DB Attendue | Statut |
|-------|-----------|-------------------|--------|
| `price_base` | 210€ | 210€ | ✅ |
| `period_type` | SAISON | scolaire | ✅ |
| `categories` | CULTURE | ['culture'] | ✅ |
| Créneaux | Mer 15:00-16:00 (3-5 ans), Mer 14:00-15:00 (6-8 ans) | À vérifier dans `creneaux` | ⚠️ |
| Prochaines dates | 14/01, 21/01, 28/01 | Mercredis de janvier 2026 | ✅ |

**Aides:**
- `caf_loire_temps_libre`: 80€ → QF ≤ 350 confirmé
- **Reste à charge:** 210 - 80 = 130€ ✅

---

#### Atelier théâtre ados
| Champ | Valeur UI | Valeur DB Attendue | Statut |
|-------|-----------|-------------------|--------|
| `price_base` | 230€ | 230€ | ✅ |
| `period_type` | SAISON | scolaire | ✅ |
| `categories` | CULTURE | ['culture'] | ✅ |
| Créneaux | Mer 18:30-20:00 (12-14 ans), Mer 17:00-18:30 (15-17 ans) | DB: Mer 15:00-17:00, Ven 18:00-20:00 | ⚠️ **MISMATCH** |

**Note:** Les créneaux DB (migration 20251210150001) diffèrent des créneaux UI.

**Aides:**
- `caf_loire_temps_libre`: 80€
- **Reste à charge:** 230 - 80 = 150€ ✅

---

#### Basket – Mini-basket et cadets
| Champ | Valeur UI | Valeur DB Attendue | Statut |
|-------|-----------|-------------------|--------|
| `price_base` | 260€ | 260€ | ✅ |
| `period_type` | SAISON | scolaire | ✅ |
| `categories` | SPORT | ['sport'] | ✅ |
| Créneaux | Mer 17:00-18:30 (12-14), Mer 18:30-20:00 (15-17) | DB: Mer 14:00-16:00, Sam 10:00-12:00 | ⚠️ **MISMATCH** |

**Aides:**
- `caf_loire_temps_libre`: 80€
- `pass_sport`: 50€ (SPORT + 6-17 ans + condition sociale)
- **Total aides:** 130€
- **Reste à charge:** 260 - 130 = 130€ ✅

---

#### Gymnastique – Baby gym et éveil
| Champ | Valeur UI | Valeur DB Attendue | Statut |
|-------|-----------|-------------------|--------|
| `price_base` | 190€ | 190€ | ✅ |
| `period_type` | SAISON | scolaire | ✅ |
| `categories` | SPORT | ['sport'] | ✅ |
| Créneaux | Sam 09:30-10:30 (3-5 ans), Sam 10:30-11:30 (6-8 ans) | DB: Mer 10:00-11:00, Sam 09:00-10:00 | ⚠️ |

**Aides:**
- `caf_loire_temps_libre`: 80€
- **Reste à charge:** 190 - 80 = 110€ ✅

---

#### Chant – Chorale et technique vocale
| Champ | Valeur UI | Valeur DB Attendue | Statut |
|-------|-----------|-------------------|--------|
| `price_base` | 190€ | 190€ | ✅ |
| `period_type` | SAISON | scolaire | ✅ |
| `categories` | CULTURE | ['culture'] | ✅ |
| Créneaux | Ven 18:00-19:00 (12-14), Ven 17:00-18:00 (15-17) | DB: Mar 17:30-18:30, Jeu 17:30-18:30 | ⚠️ **MISMATCH** |

**Aides:**
- `caf_loire_temps_libre`: 80€
- **Reste à charge:** 190 - 80 = 110€ ✅

---

#### Cirque – Arts du cirque
| Champ | Valeur UI | Valeur DB Attendue | Statut |
|-------|-----------|-------------------|--------|
| `price_base` | 220€ | 220€ | ✅ |
| `period_type` | SAISON | scolaire | ✅ |
| `categories` | CULTURE | ['culture'] | ✅ |
| Créneaux | Mer 14:00-15:30 (9-11), Mer 15:30-17:00 (12-14) | DB: Mer 14:00-16:30, Sam 10:00-12:30 | ⚠️ |

**Aides:**
- `caf_loire_temps_libre`: 80€
- **Reste à charge:** 220 - 80 = 140€ ✅

---

#### Conservatoire de musique – Violon
| Champ | Valeur UI | Valeur DB Attendue | Statut |
|-------|-----------|-------------------|--------|
| `price_base` | 380€ | 380€ | ✅ |
| `period_type` | SAISON | scolaire | ✅ |
| `categories` | CULTURE | ['culture'] | ✅ |
| Créneaux | Jeu 18:00-19:00 (12-14), Jeu 17:00-18:00 (15-17) | DB: Lun 17:00-18:00, Mer 14:00-15:00 | ⚠️ **MISMATCH** |

**Aides:**
- `caf_loire_temps_libre`: 80€
- **Reste à charge:** 380 - 80 = 300€ ✅

---

### 2.2 Activités Vacances (VACANCES)

#### Camp nature – Découverte environnement
| Champ | Valeur UI | Valeur DB Attendue | Statut |
|-------|-----------|-------------------|--------|
| `price_base` | 360€ | 360€ | ✅ |
| `period_type` | VACANCES | vacances | ✅ |
| `vacation_type` | - | sejour_hebergement | ✅ |
| `duration_days` | - | 7 jours (5 par défaut après migration) | ⚠️ |
| Date disponible | 2026-07-07 | vacation_periods: été_2026 | ✅ |

**Aides:**
- `ancv`: 50€ (Chèques Vacances)
- `vacaf_ave`: 180€ (séjour labellisé, QF ≤ 450)
- **Total aides:** 230€
- **Reste à charge:** 360 - 230 = 130€ ✅

---

#### Camp ski – Séjour montagne hiver
| Champ | Valeur UI | Valeur DB Attendue | Statut |
|-------|-----------|-------------------|--------|
| `price_base` | 560€ | 560€ | ✅ |
| `period_type` | VACANCES | vacances | ✅ |
| `vacation_type` | - | sejour_hebergement | ✅ |
| `duration_days` | - | 5 jours (après harmonisation) | ✅ |
| Date disponible | 2026-02-09 | vacation_periods: hiver_2026 | ✅ |

**Aides:**
- `ancv`: 50€ (seul affiché sur UI)
- **Note UI:** "type non affiché sur l'UI (seul le total -50€ est visible)"
- **Total aides:** 50€
- **Reste à charge:** 560 - 50 = 510€ ✅

---

#### Colonie de vacances été – Montagne
| Champ | Valeur UI | Valeur DB Attendue | Statut |
|-------|-----------|-------------------|--------|
| `price_base` | 550€ | 550€ | ✅ |
| `period_type` | VACANCES | vacances | ✅ |
| `vacation_type` | - | sejour_hebergement | ✅ |
| `duration_days` | - | 14 jours | ✅ |
| Date disponible | 2026-07-14 | vacation_periods: été_2026 | ✅ |

**Aides:**
- `ancv`: 50€
- `pass_colo`: 200€ (11 ans exact, QF-based)
- `vacaf_ave`: 135€
- **Total aides:** 385€
- **Reste à charge:** 550 - 385 = 165€ ✅

---

## 3. Points d'Attention

### 3.1 ⚠️ CAF Loire Temps Libre - Restriction de Période

**CRITIQUE:** Selon `FinancialAidEngine.ts` (lignes 427-432), l'aide `CAF_LOIRE_TEMPS_LIBRE` est **maintenant limitée aux activités vacances uniquement**.

```typescript
function evaluateCAFLoireTempsLibre(params: EligibilityParams): CalculatedAid | null {
  // RESTRICTION: Uniquement pour les vacances (demande utilisateur)
  if (periode !== 'vacances') {
    return null;
  }
  // ...
}
```

**Constat UI:** Les captures montrent cette aide (80€) sur des activités scolaires (SAISON).

**Impact:**
- Si cette restriction est intentionnelle, les UI ne devraient pas afficher `caf_loire_temps_libre` sur les activités scolaires
- Si c'est un bug, la restriction dans le code doit être corrigée

**Recommandation:** Clarifier la règle métier avec le product owner.

---

### 3.2 ⚠️ Créneaux - Divergences UI vs DB

Les créneaux horaires affichés dans l'UI diffèrent souvent de ceux stockés en DB (migration `20251210150001`).

| Activité | Créneaux UI | Créneaux DB (migration) |
|----------|-------------|-------------------------|
| Atelier théâtre ados | Mer 17:00-20:00 | Mer 15:00-17:00, Ven 18:00-20:00 |
| Basket | Mer 17:00-20:00 | Mer 14:00-16:00, Sam 10:00-12:00 |
| Chant | Ven 17:00-19:00 | Mar 17:30-18:30, Jeu 17:30-18:30 |
| Conservatoire Violon | Jeu 17:00-19:00 | Lun 17:00-18:00, Mer 14:00-15:00 |

**Recommandation:** Vérifier si les créneaux ont été mis à jour en DB après la migration, ou si l'UI affiche des données de test.

---

### 3.3 ✅ Mapping Codes Aides

Le mapping des codes d'aides entre UI et DB est cohérent:

| Code UI | Code DB | Nom Complet |
|---------|---------|-------------|
| `caf_loire_temps_libre` | `CAF_LOIRE_TEMPS_LIBRE` | CAF Loire – Temps Libre |
| `pass_sport` | `PASS_SPORT` | Pass'Sport |
| `pass_colo` | `PASS_COLO` | Pass Colo |
| `vacaf_ave` | `VACAF_AVE` | VACAF AVE (Aide Vacances Enfants) |
| `ancv` | `ANCV` | Chèques Vacances |

---

### 3.4 ✅ Calcul Reste à Charge

Le calcul du reste à charge suit la logique attendue:

```
reste_a_charge = price_initial - sum(eligible_aids)
```

Avec application du plafond 70% max coverage si nécessaire.

**Exemple Basket (260€):**
- Prix initial: 260€
- CAF Loire: 80€
- Pass'Sport: 50€
- Total aides: 130€
- Reste à charge: 130€ ✅
- Vérification 70%: 260 × 0.70 = 182€ max aides → 130€ OK

---

## 4. Scripts de Vérification

### SQL pour extraire les données DB

```sql
-- Voir fichier: supabase/audit_ui_activities_comparison.sql
```

### Commande pour comparer

```bash
# Exécuter depuis le répertoire du projet
supabase db execute -f supabase/audit_ui_activities_comparison.sql
```

---

## 5. Conclusion

| Aspect | Statut | Détail |
|--------|--------|--------|
| **Prix** | ✅ | 10/10 cohérents avec `aid_grid` |
| **Période** | ✅ | Mapping SAISON/VACANCES correct |
| **Aides affichées** | ⚠️ | CAF Loire sur scolaire à clarifier |
| **Calcul reste à charge** | ✅ | Formule correcte appliquée |
| **Créneaux horaires** | ⚠️ | Divergences UI vs DB à investiguer |
| **Dates prochaines sessions** | ✅ | Cohérent avec calendrier 2026 |

**Actions recommandées:**
1. Clarifier la règle métier CAF Loire Temps Libre (scolaire vs vacances)
2. Mettre à jour les créneaux en DB ou corriger l'UI si nécessaire
3. S'assurer que `accepts_aid_types` contient les bons codes pour chaque activité
