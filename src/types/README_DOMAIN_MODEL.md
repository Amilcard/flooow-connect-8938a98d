# [D1] Modèle Unique & Mapping FO/BO

**✅ Implémenté le 2025-01-XX**

## 📋 Résumé

Création d'un **contrat de données unifié** pour garantir la cohérence entre Front-Office (FO) et Back-Office (BO).

## 🎯 Objectifs atteints

1. ✅ **Types domain centralisés** → `/src/types/domain.ts`
2. ✅ **Validation Zod + Adapter** → `/src/types/schemas.ts`
3. ✅ **Hook de fetch avec safeParse** → `useMockActivities.ts`
4. ✅ **Composants FO typés** → `ActivityCard.tsx`
5. ✅ **Contrat FO/BO unifié** → Tous utilisent `Activity` domain

## 📁 Fichiers créés

### `/src/types/domain.ts`
Types métier source unique de vérité :
- `Activity` - Contrat de données principal
- `ActivityRaw` - Format données brutes (Edge Functions, API)
- `ActivityCategory`, `PeriodType`, `TransportMode` - Enums
- `AccessibilityFlags`, `Mobility`, `Location` - Types auxiliaires

### `/src/types/schemas.ts`
Validation runtime et adapters :
- `ActivityDomainSchema` - Schema Zod pour validation
- `toActivity(raw)` - Adapter avec defaults sécurisés
- `validateAndParseActivity(raw)` - Validation + logging écarts

## 🔄 Fichiers modifiés

### `src/hooks/useActivities.ts`
- ❌ Supprimé : Interface `Activity` locale
- ✅ Ajouté : Import depuis `/types/domain`
- ✅ Modifié : `mapActivityFromDB` utilise `toActivity()` adapter
- ✅ Export : Type `Activity` réexporté pour rétro-compatibilité

### `src/hooks/useMockActivities.ts`
- ❌ Supprimé : Interface `MockActivity` + fonction `mapMockToActivity`
- ✅ Ajouté : Import `validateAndParseActivity`
- ✅ Modifié : Validation runtime avec `safeParse` + logging
- ✅ Logging : Stats de validation (OK / corrigées / rejetées)

### `src/components/Activity/ActivityCard.tsx`
- ✅ Ajouté : Import type `Activity` depuis domain
- ✅ Commenté : Props compatibles avec type domain
- ℹ️ Interface `ActivityCardProps` conservée (permet flexibilité)

## 📊 Validation Runtime

Exemple de logs console lors du fetch :
```
🔵 [D1] Fetching mock activities from Edge Function...
✅ Mock activities received: 40
🟨 [D1] Activité abc-123 corrigée via defaults: ["price: Prix négatif interdit"]
📊 [D1] Validation: 38 OK / 2 corrigées / 0 rejetées
```

**Comportement :**
- ✅ Activités valides → passent sans modification
- 🟨 Activités avec erreurs mineures → corrigées via defaults (pas d'erreur bloquante)
- ❌ Activités avec erreurs critiques → rejetées (logging erreur)

## 🔒 Principe de résilience

**Pas d'erreur bloquante** : Si une activité ne valide pas le schema Zod :
1. Log warning avec détail des écarts
2. Application des defaults sécurisés
3. Activité retournée quand même (UX préservée)

## 🎨 Contrat de données

### Type `Activity` unifié

```typescript
interface Activity {
  id: string;
  title: string;
  image: string;
  ageRange: string;           // Format: "6-9 ans"
  category: ActivityCategory;
  price: number;
  hasAccessibility: boolean;
  hasFinancialAid: boolean;
  // ... + champs optionnels
}
```

**Utilisé par :**
- ✅ FO : `ActivityCard`, `ActivityList`, etc.
- ✅ Hooks : `useActivities`, `useMockActivities`
- ✅ BO : Dashboards (via types Supabase, mapping possible si besoin)

## 🚀 Avantages

1. **Source unique de vérité** → Plus de fragmentation de types
2. **Validation runtime** → Détection erreurs avant affichage
3. **Defaults sécurisés** → Pas d'erreurs bloquantes
4. **Traçabilité** → Logs détaillés des écarts détectés
5. **Maintenabilité** → Changement de schema = 1 seul fichier à modifier

## 🔄 Rétro-compatibilité

✅ **Export depuis `useActivities.ts`** :
```typescript
export type { Activity } from "@/types/domain";
```

Tous les anciens imports `import { Activity } from "./useActivities"` continuent de fonctionner.

## 🧪 Tests

### Vérification validation

1. Lancer l'app
2. Ouvrir console navigateur
3. Chercher logs `[D1]`
4. Vérifier stats de validation

### Scénarios testés

- ✅ Activités complètes → validation OK
- ✅ Activités incomplètes → defaults appliqués
- ✅ Activités avec prix négatif → corrigé à 0
- ✅ Activités sans titre → "Activité sans titre"

## 📝 Prochaines étapes suggérées

1. **[D2]** → Appliquer validation sur autres sources de données (API réelles)
2. **[D3]** → Intégrer validation dans formulaires de création/édition
3. **[D4]** → Créer tests unitaires pour adapters
4. **[D5]** → Documenter autres types domain (User, Booking, etc.)

---

**Note** : Cette implémentation respecte la contrainte **"AUCUN refactor UI global"** → Intervention ciblée sur types + validation uniquement.
