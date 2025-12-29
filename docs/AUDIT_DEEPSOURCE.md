# AUDIT DEEPSOURCE - Flooow Connect

**Date:** 2025-12-16
**Status:** Connecté via GitHub, AutoFix disponible

---

## ISSUES SÉCURITÉ (P0) ✅ TRAITÉ

### JS-A1004 - Données utilisateur dans les logs

**Gravité:** Critical
**Status:** ✅ Résolu

**Problème:**
```typescript
// DANGEREUX
console.log("User data:", userData);
console.error("Error for user:", error, userProfile);
```

**Solution:**
```typescript
// SÉCURISÉ
const redact = (obj: any) => {
  const sensitive = ['email', 'phone', 'password', 'token', 'dob'];
  return JSON.stringify(obj, (key, val) =>
    sensitive.includes(key) ? '[REDACTED]' : val
  );
};

console.log("User data:", redact(userData));
```

**Fichiers à vérifier:**
- `src/hooks/*.ts` - Rechercher `console.log`, `console.error`
- `src/pages/*.tsx` - catch blocks
- `src/components/**/*.tsx` - error handlers

**Commande de recherche:**
```bash
grep -r "console\.\(log\|error\|warn\)" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules
```

**✅ Solution implémentée:**
```typescript
// src/utils/sanitize.ts - Nouvelles fonctions ajoutées

import { redactSensitiveData, safeErrorMessage } from '@/utils/sanitize';

// Usage pour les objets
console.log("User data:", redactSensitiveData(userData));
// Output: { email: '[REDACTED]', name: 'John' }

// Usage pour les erreurs
console.error(safeErrorMessage(error, 'Auth check'));
// Output: "[Auth check] Error: message"
```

---

### JS-0440 - dangerouslySetInnerHTML

**Gravité:** High
**Status:** ✅ Résolu

**Problème:**
```tsx
// DANGEREUX - XSS possible
<div dangerouslySetInnerHTML={{ __html: userContent }} />
```

**Solution:**
```tsx
// Option 1: Sanitizer (DOMPurify)
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />

// Option 2: Supprimer si non nécessaire
<div>{userContent}</div>

// Option 3: Markdown renderer sécurisé
import ReactMarkdown from 'react-markdown';
<ReactMarkdown>{userContent}</ReactMarkdown>
```

**Fichiers à vérifier:**
```bash
grep -r "dangerouslySetInnerHTML" src/ --include="*.tsx"
```

**Fichiers connus avec dangerouslySetInnerHTML:**
- `src/pages/aides/SimulateurV2.tsx` (ligne ~228) - message_incitation
- Possiblement d'autres dans les modals d'aide

**✅ Solution implémentée:**
```tsx
// src/components/ui/formatted-text.tsx - Nouveau composant

import { FormattedText } from '@/components/ui/formatted-text';

// Avant (dangereux)
<span dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />

// Après (sécurisé)
<FormattedText>{text}</FormattedText>
// Supporte: **bold** et *italic*
```

**Fichiers corrigés:**
- ✅ `src/pages/aides/SimulateurV2.tsx`
- ✅ `src/components/aids/QuickEstimateCard.tsx`

---

## ISSUES DETTE TECHNIQUE (P2)

### JS-0323 - Usage de `any`

**Gravité:** Medium
**Status:** Reporté (volume élevé)

**Approche progressive:**
1. **Phase 1:** Helpers partagés (`src/utils/`)
2. **Phase 2:** Hooks (`src/hooks/`)
3. **Phase 3:** Composants critiques
4. **Ne pas faire:** Tout corriger d'un coup

**Pattern de correction:**
```typescript
// AVANT
const handleData = (data: any) => { ... }

// APRÈS
interface ActivityData {
  id: string;
  title: string;
  // ...
}
const handleData = (data: ActivityData) => { ... }
```

---

### JS-0339 - Non-null assertions (`!`)

**Gravité:** Low
**Status:** Reporté

**Exemple problématique:**
```typescript
// DANGEREUX
const value = someObject!.property;
```

**Solution:**
```typescript
// SÉCURISÉ
if (!someObject) return;
const value = someObject.property;

// Ou avec optional chaining
const value = someObject?.property ?? defaultValue;
```

---

### JS-0454 - Invalid HTML markup

**Gravité:** Low
**Status:** Reporté (400+ occurrences)

**Problèmes courants:**
- `<div>` dans `<p>`
- Attributs non-standard sur éléments DOM
- ARIA attributes incorrects

**Approche:**
1. Commencer par composants réutilisés (`src/components/ui/`)
2. Puis composants métier centraux
3. Ne pas faire en une passe (risque cascade)

---

## AUTOFIX DEEPSOURCE

### Status actuel
- **AutoFix activé:** Oui
- **Commits AutoFix appliqués:** Aucun dans cette session

### Recommandations AutoFix

| Type | Risque | Action |
|------|--------|--------|
| Typage `any` | Moyen | Relire diff, peut casser build |
| Non-null | Faible | OK si garde ajouté |
| Markup | Moyen | Peut changer layout |
| Security | Élevé | Toujours relire manuellement |

### Workflow AutoFix sécurisé
```bash
# 1. Créer branche
git checkout -b fix/deepsource-autofix

# 2. Appliquer AutoFix via UI DeepSource

# 3. Pull les changements
git pull origin fix/deepsource-autofix

# 4. Vérifier
npm run lint
npm run build

# 5. Test manuel
# Navigation, formulaires, etc.

# 6. Merge si OK
git checkout main
git merge fix/deepsource-autofix
```

---

## PROCHAINES ACTIONS

### Ordre de priorité

1. **JS-A1004 (Sécurité logs)**
   - Créer helper `redactSensitiveData()`
   - Rechercher tous les console.log/error
   - Remplacer ou supprimer

2. **JS-0440 (dangerouslySetInnerHTML)**
   - Installer DOMPurify si nécessaire
   - Sanitizer tous les usages
   - Ou supprimer si non nécessaire

3. **JS-0323 (any) - Progressif**
   - Commencer par `src/utils/FinancialAidEngine.ts`
   - Puis `src/hooks/useActivities.ts`

---

## MÉTRIQUES DEEPSOURCE

| Catégorie | Issues | Cible |
|-----------|--------|-------|
| Security | ~5 | 0 |
| Performance | ~10 | < 5 |
| Anti-patterns | ~50 | < 20 |
| Style | ~200 | Best effort |

---

## CONFIGURATION DEEPSOURCE

### Fichier: `.deepsource.toml`
```toml
version = 1

[[analyzers]]
name = "javascript"
enabled = true

  [analyzers.meta]
  environment = ["browser", "node"]
  dialect = "typescript"

[[transformers]]
name = "prettier"
enabled = true
```

### Exclusions recommandées
```toml
exclude_patterns = [
  "node_modules/**",
  "dist/**",
  "build/**",
  "*.config.js",
  "*.config.ts"
]
```
