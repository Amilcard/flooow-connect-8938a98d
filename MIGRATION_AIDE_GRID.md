# 🎯 Migration vers aid_grid (Source of Truth Supabase)

**Date**: 2026-01-08
**Objectif**: Remplacer les calculs d'aides hardcodés par une grille SQL dans Supabase

---

## 📋 **ÉTAT ACTUEL**

| Composant | Statut | Approche |
|-----------|--------|----------|
| `aid_grid` table | ✅ Structure existe | 48 rows (scolaire uniquement) |
| `StandaloneAidCalculator` | ❌ Utilise `calculateAidFromQF()` local | Aides fixes 50/40/25€ (INCORRECT) |
| `AidSimulator` | ❌ Utilise `calculateAidFromQF()` local | Aides fixes 50/40/25€ (INCORRECT) |
| `SharedAidCalculator` | ✅ Utilise RPC Supabase | `useEligibleAids` + `useResteACharge` |

---

## 🚀 **ÉTAPES DE MIGRATION**

### **ÉTAPE 1 : Exécuter les migrations SQL** (VOUS)

Allez dans **Supabase Dashboard > SQL Editor** et exécutez dans l'ordre :

#### 1.1. Compléter la grille avec stage/séjour
```bash
# Fichier : /supabase/migrations/20260108_complete_aid_grid.sql
```

#### 1.2. Créer la RPC calculate_family_aid
```bash
# Fichier : /supabase/functions/calculate_family_aid.sql
```

#### 1.3. Vérifier
```sql
-- Devrait afficher 64 rows (48 scolaire + 8 stage + 8 sejour)
SELECT price_type, COUNT(*) FROM aid_grid GROUP BY price_type;

-- Tester la RPC (remplacer UUID par une vraie activité)
SELECT calculate_family_aid('activity-uuid'::UUID, 350, 0);
```

---

### **ÉTAPE 2 : Migrer les composants** (MOI - CLAUDE)

Une fois les migrations SQL exécutées avec succès, je migrerai :

1. ✅ `StandaloneAidCalculator.tsx` → Utilise `useAidCalculation`
2. ✅ `AidSimulator.tsx` → Utilise `useAidCalculation`
3. ⚠️ Déprécier `calculateAidFromQF()` dans `aidesCalculator.ts`

---

## 📊 **GRILLE VALIDÉE (Rappel)**

### Scolaire (saison)
| Prix | QF<500 | QF 500-799 | QF 800-1199 | QF≥1200 |
|------|--------|------------|-------------|---------|
| 190€ | -95€   | -55€       | -30€        | 0€      |
| 210€ | -105€  | -65€       | -30€        | 0€      |
| 220€ | -110€  | -65€       | -35€        | 0€      |
| 260€ | -130€  | -80€       | -40€        | 0€      |
| 320€ | -150€* | -95€       | -50€        | 0€      |
| 420€ | -150€* | -125€      | -65€        | 0€      |

*Plafond scolaire : 150€

### Stage (5 jours)
| Prix | QF<500 | QF 500-799 | QF 800-1199 | QF≥1200 |
|------|--------|------------|-------------|---------|
| 360€ | -120€* | -110€      | -55€        | 0€      |
| 410€ | -120€* | -120€*     | -60€        | 0€      |

*Plafond stage : 120€

### Séjour (avec hébergement)
| Prix | QF<500 | QF 500-799 | QF 800-1199 | QF≥1200 |
|------|--------|------------|-------------|---------|
| 360€ | -180€  | -110€      | -55€        | 0€      |
| 550€ | -200€* | -165€      | -85€        | 0€      |

*Plafond séjour : 200€

---

## ✅ **RÈGLES MÉTIER IMPLÉMENTÉES**

1. **Déductions FIXES en €** (pas de %)
2. **Plafonds par type** :
   - Scolaire : 150€ max
   - Stage : 120€ max
   - Séjour : 200€ max
3. **RAC minimum 30%** : La famille paie toujours au moins 30% du prix
4. **Cumul Pass'Sport manuel** : Géré via `externalAidEuros` avec respect du RAC 30%

---

## 🔧 **UTILISATION DU HOOK**

```typescript
import { useAidCalculation } from '@/hooks/useAidCalculation';

// Dans un composant
const { calculate, loading } = useAidCalculation();

// Avec activityId (lecture DB)
const result = await calculate({
  activityId: 'uuid-activity',
  quotientFamilial: 350,
  externalAidEuros: 50 // Pass'Sport
});

// Sans activityId (simulation)
const result = await calculate({
  price: 260,
  priceType: 'scolaire',
  quotientFamilial: 650
});

// Result:
// {
//   totalAidEuros: 130,
//   aidPercentage: 50,
//   remainingEuros: 130,
//   qfBracket: "QF 500-799"
// }
```

---

## ⚠️ **PROCHAINES ÉTAPES**

1. **Exécutez les migrations SQL** (ÉTAPE 1)
2. **Confirmez que ça fonctionne** (requêtes test)
3. **Je migrerai les composants** (ÉTAPE 2)
4. **Tests fonctionnels** sur chaque simulateur
5. **Déploiement** en production

---

**Statut**: 🟡 En attente de votre exécution des migrations SQL
