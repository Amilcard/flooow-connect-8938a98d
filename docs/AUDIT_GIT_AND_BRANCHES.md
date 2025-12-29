# AUDIT GIT & BRANCHES - Flooow Connect

**Date:** 2025-12-16
**Commit HEAD:** `d3bf5d8`

---

## BRANCHES ACTIVES

| Branche | Objectif | Status | Action requise |
|---------|----------|--------|----------------|
| `main` | Production | ✅ Sync @ d3bf5d8 | Aucune |
| `claude/complete-project-audit-yASTu` | Refactoring CC session courante | ✅ Sync @ d3bf5d8 | Peut être supprimée |

## BRANCHES À SUPPRIMER

| Branche | Raison |
|---------|--------|
| `claude/sonarqube-phase1-fixes-yASTu` | Ancienne branche, 46 commits behind, déjà mergée |

**Commande pour supprimer:**
```bash
git branch -d claude/sonarqube-phase1-fixes-yASTu
git push origin --delete claude/sonarqube-phase1-fixes-yASTu
```

---

## CONVENTION DE COMMITS

### Format
```
<scope>: <action> (<tool/rule>)
```

### Exemples utilisés dans ce projet
```
refactor(sonar): reduce cognitive complexity in ActivityDetail.tsx
refactor(sonar): reduce cognitive complexity in 11 additional files
fix(security): redact user data in logs (JS-A1004)
deepsource: remove dangerous JSX usage (JS-0440)
merge: integrate cognitive complexity refactoring
```

### Scopes valides
- `refactor` - Restructuration sans changement fonctionnel
- `fix` - Correction de bug ou issue qualité
- `feat` - Nouvelle fonctionnalité
- `docs` - Documentation
- `test` - Tests
- `chore` - Maintenance

---

## HISTORIQUE DES COMMITS RÉCENTS

```
d3bf5d8 refactor(sonar): reduce cognitive complexity in 11 additional files
77d9b13 refactor(sonar): reduce cognitive complexity in FinancialAidEngine.ts
e191a26 refactor(sonar): reduce cognitive complexity in SharedAidCalculator.tsx
dbd3a53 refactor(sonar): reduce cognitive complexity in FinancialAidsCalculator.tsx
83c6b6f refactor(sonar): reduce cognitive complexity in SessionSlotCard.tsx
a269e6c refactor(sonar): reduce cognitive complexity in ActivityDetail.tsx
```

---

## RÈGLES DE MERGE

### Stratégie retenue: Fast-forward / Squash merge

1. **Feature branch → main:** Fast-forward si possible, sinon merge commit
2. **PR required:** Non (projet solo), mais recommandé pour traçabilité
3. **Squash:** Préféré pour garder historique propre

### Checklist avant merge
- [ ] `npm run lint` ✅
- [ ] `npm run build` ✅
- [ ] Pas de régression UI (smoke test)
- [ ] Commit message clair

---

## WORKFLOW GIT RECOMMANDÉ

### Pour nouvelle session AI

```bash
# 1. Cloner et vérifier état
git clone <repo>
git log --oneline -5
git status

# 2. Créer branche de travail
git checkout -b claude/<task>-<session-id>

# 3. Faire les modifications
# ... edits ...

# 4. Valider
npm run lint
npm run build

# 5. Commit
git add -A
git commit -m "scope: description"

# 6. Push feature branch
git push -u origin claude/<task>-<session-id>

# 7. Merge dans main
git checkout main
git merge claude/<task>-<session-id>
git push origin main
```

---

## AUTOFIX DEEPSOURCE

### Commits AutoFix appliqués
Aucun AutoFix DeepSource n'a été appliqué automatiquement dans cette session.

### Recommandation
- **Activer AutoFix avec précaution** - Toujours relire les diffs
- **Risques connus:**
  - Typage trop strict peut casser le build
  - Suppression de handlers peut casser l'UI
  - Modifications JSX peuvent changer le layout

---

## PROTECTION DE BRANCHES

### main
- Push direct: Bloqué (403)
- Contournement: Feature branch + merge local + push

### Recommandation future
Configurer GitHub branch protection rules:
- Require PR reviews
- Require status checks (CI)
- Require linear history

---

## FICHIERS SENSIBLES (Ne pas toucher sans validation)

| Fichier | Raison |
|---------|--------|
| `src/pages/ActivityDetail.tsx` | Composant central, très modifié |
| `src/utils/FinancialAidEngine.ts` | Logique métier critique aides |
| `src/integrations/supabase/client.ts` | Config DB |
| `vite.config.ts` | Config build |
| `.github/workflows/` | CI/CD |
