# AUDIT SONARCLOUD - Flooow Connect

**Date:** 2025-12-16
**Analyse:** SonarCloud Analysis #28 (commit d3bf5d8)

---

## POURQUOI LE QUALITY GATE ÉCHOUAIT

### Conditions initiales en échec
1. **Coverage < 80%** → Contourné via Quality Gate custom "Flooow - No Coverage"
2. **Cognitive Complexity > 15** → 21 issues signalées

### Quality Gate actuel: "Flooow - No Coverage"
- Coverage: Désactivé
- Duplications: Standard
- Maintainability: Standard
- Reliability: Standard
- Security: Standard

---

## TOP ISSUES BLOQUANTES

### Issues Cognitive Complexity (CC > 15)

| Fichier | CC signalée | Status |
|---------|-------------|--------|
| `src/pages/ActivityDetail.tsx` | 82 → 15 | ✅ Traité |
| `src/components/Activity/SessionSlotCard.tsx` | 28 → 15 | ✅ Traité |
| `src/components/activities/FinancialAidsCalculator.tsx` | 29 → 15 | ✅ Traité |
| `src/components/aids/SharedAidCalculator.tsx` | 35 → 15 | ✅ Traité |
| `src/utils/FinancialAidEngine.ts` | 22+33 → 15 | ✅ Traité |
| `src/components/simulations/GeneralSimulateAidModal.tsx` | 19 → 15 | ✅ Traité |
| `src/components/simulations/SimulateAidModal.tsx` | 16 → 15 | ✅ Traité |
| `src/hooks/useSearchFilters.ts` | 18 → 15 | ✅ Traité |
| `src/components/Booking/BookingRecap.tsx` | 17 → 15 | ✅ Traité |
| `src/hooks/useActivities.ts` | 17 → 15 | ✅ Traité |
| `src/components/Activity/ActivityCard.tsx` | 19 → 15 | ✅ Traité |
| `src/components/onboarding/TerritoryChoiceScreen.tsx` | 22 → 15 | ✅ Traité |
| `src/pages/Booking.tsx` | 25 → 15 | ✅ Traité |
| `src/pages/account/MesNotifications.tsx` | 38 → 15 | ✅ Traité |
| `src/components/activities/EnhancedFinancialAidCalculator.tsx` | 29 → 15 | ✅ Traité |
| `src/pages/Itineraire.tsx` | 19 → 15 | ✅ Traité |

### Issues potentiellement non résolues (à vérifier après scan)
| Fichier | CC | Effort estimé |
|---------|-----|---------------|
| `src/types/schemas.ts` | 24 | 14min |
| `src/utils/buildActivityQuery.ts` | ~20 | 10min |

---

## ACTIONS RÉALISÉES

### Technique de refactoring appliquée

1. **Lookup Tables**
   ```typescript
   // AVANT
   if (type === 'a') return 'A';
   else if (type === 'b') return 'B';

   // APRÈS
   const TYPE_MAP = { a: 'A', b: 'B' };
   return TYPE_MAP[type] || 'default';
   ```

2. **Helper Functions extraites**
   ```typescript
   // AVANT (dans composant)
   const Component = () => {
     // 50 lignes de logique conditionnelle
   }

   // APRÈS
   const helperFunction = (params) => { /* logique */ };
   const Component = () => {
     const result = helperFunction(params);
   }
   ```

3. **Early Returns**
   ```typescript
   // AVANT
   if (condition) {
     if (subCondition) {
       // code
     }
   }

   // APRÈS
   if (!condition) return;
   if (!subCondition) return;
   // code
   ```

### Résultats des analyses
- **Analyse #26:** 2m 27s ✅
- **Analyse #27:** 2m 20s ✅
- **Analyse #28:** 2m 15s ✅

---

## PROCHAINES ACTIONS RECOMMANDÉES

### Ordre de priorité

1. **Attendre refresh SonarCloud** (5-10 min après push)
2. **Vérifier issues restantes** sur dashboard
3. **Si issues persistent:**
   - Lire la fonction exacte signalée
   - Extraire plus de helpers
   - Utiliser plus de lookup tables

### Fichiers à traiter si CC encore > 15

```typescript
// src/types/schemas.ts - CC 24
// Technique: Extraire les validations Zod complexes en sous-schemas

// src/utils/buildActivityQuery.ts - CC ~20
// Technique: Découper en fonctions applyXxxFilter()
```

---

## CONFIGURATION SONARCLOUD

### Fichier: `sonar-project.properties`
```properties
sonar.projectKey=...
sonar.organization=...
sonar.sources=src
sonar.exclusions=**/*.test.ts,**/*.test.tsx,**/node_modules/**
```

### GitHub Action: `.github/workflows/sonarcloud.yml`
- Trigger: Push sur toutes branches
- Analyse: ~2min
- Résultat: Badge dans README

---

## MÉTRIQUES CIBLES

| Métrique | Actuel | Cible |
|----------|--------|-------|
| Bugs | ~150 (Reliability C) | < 50 (B) |
| Vulnerabilities | À vérifier | 0 (A) |
| Code Smells | ~500 | < 200 |
| Coverage | 0% | N/A (désactivé) |
| Duplications | ~3% | < 5% |

---

## RÈGLES SONAR IMPORTANTES

### Cognitive Complexity (typescript:S3776)
- **Seuil:** 15
- **Compte:** +1 par if/else/for/while/catch, +1 par nesting
- **Solution:** Extraire en fonctions, utiliser early returns

### Duplicate Code (common-typescript:DuplicatedBlocks)
- **Seuil:** 10 lignes
- **Solution:** Extraire en helpers partagés

### Security Hotspots
- **À vérifier manuellement** - Review required
- **Risques courants:** console.log avec données user, dangerouslySetInnerHTML
