# fix: resolve React.Children.only crashes with safe restoration

## 🎯 Résumé

Restauration propre depuis la version stable (hier soir) + application itérative des commits safe, en **excluant le commit problématique** qui a introduit le bug React.Children.only.

## 🐛 Problème identifié

**Commit coupable**: `50727fb` (11:40 AM) - "standardize Header height and add Button loading state"

**Changement qui a cassé**:
```tsx
// AVANT (✅ fonctionnait)
({ className, variant, size, asChild = false, ...props }, ref) => {
  return <Comp {...props} />;  // children implicite dans props
}

// APRÈS (❌ casse avec Fragments)
({ className, variant, size, asChild = false, isLoading = false, children, ...props }, ref) => {
  return <Comp {...props}>{children}</Comp>;  // children explicite → évalue Fragments
}
```

**Conséquence**: Les Fragments `<>...</>` dans EventRegistrationButton, ActivityShareButton, EventShareButton sont désormais évalués et aplatis → 2+ enfants → React.Children.only crash avec Radix Slot.

## ✅ Solution appliquée

### 1. Commits safe réappliqués (ordre chronologique)
- ✅ `402af4e` - refactor price display (10:20)
- ✅ `be5db11` - deduplicate calculateAge (10:26)
- ✅ `5d60973` - docs payment_plans (10:26)
- ✅ `2d13864` - CSS patches mobile (11:01)
- ✅ `d99de9d` - remove padding (11:14)
- ✅ `f7f5aef` - container widths (11:18)
- ❌ **SKIP** `50727fb` - Button loading state (11:40) ← **COMMIT PROBLÉMATIQUE**
- ✅ `bd2a3b3` - Header padding (12:07, adapté sans h-16 de 50727fb)
- ✅ `b4fd314` - PostCSS @import (13:07)

### 2. Réimplémentation safe de Button isLoading
Nouveau commit `2b3c96b` qui ajoute isLoading **SANS** casser Radix Slot:
```tsx
{isLoading && !asChild && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
{children}
```
✅ Loader2 uniquement si `!asChild` → pas de conflit avec Slot

### 3. Fixes Fragments préventifs
Commits `e249fe5` + `8f59bc7` qui wrappent les Fragments dans `<span className="flex items-center">`:
- EventRegistrationButton: 3 Fragments → 3 spans
- ActivityShareButton: Icon + texte conditionnel → span wrapper
- EventShareButton: Icon + "Partager" → span wrapper

## 📦 Résultat

**Build**: ✅ Réussi (`npm run build` en 20.39s)
**Erreurs**: ✅ Aucune (ni build ni React.Children.only)
**Commits**: 11 commits propres et testés

## 🧪 Test plan

- [x] Build local sans erreurs
- [ ] Onboarding → fonctionne
- [ ] /ma-ville → fonctionne
- [ ] Navigation post /ma-ville → **DEVRAIT** fonctionner (bug corrigé)
- [ ] EventRegistrationButton dans home → **DEVRAIT** fonctionner
- [ ] Share buttons → **DEVRAIENT** fonctionner

## 🔍 Commits inclus

```
8f59bc7 fix: prevent React.Children.only crash in ActivityShareButton and EventShareButton
e249fe5 fix: prevent React.Children.only crash in EventRegistrationButton
2b3c96b feat(ui): add Button isLoading state with safe asChild handling
e3aab5e fix(css): move @import before @tailwind to resolve PostCSS warning
080cbfe fix(ui): remove duplicate horizontal padding in Header
ffbae50 fix(ui): standardize container widths and remove duplicate padding
cac24e1 fix(ui): remove duplicate bottom padding on pages using PageLayout
494c723 fix(ui): add safe CSS patches for mobile tabs and iPhone safe-area
fe6c9db docs(payment_plans): document display-only status and UX gap (P1-4)
3b19801 refactor(utils): deduplicate calculateAge() across codebase (P1-1)
5501723 refactor(ui): clean up price display inconsistencies
```

## 📚 Leçon apprise

**Pattern à éviter avec Radix asChild**:
```tsx
❌ MAUVAIS: Fragments dans Button avec asChild
const getContent = () => (
  <>
    <Icon />
    Text
  </>
);
<DropdownMenuTrigger asChild>
  <Button>{getContent()}</Button>
</DropdownMenuTrigger>

✅ BON: Wrapper unique
const getContent = () => (
  <span className="flex items-center">
    <Icon />
    Text
  </span>
);
```

**Règle**: Composants Radix avec `asChild` (Slot) nécessitent **UN SEUL enfant React**. Fragments comptent pour plusieurs enfants quand React les aplatit.

---

**Base**: `a5e2e78` (hier soir, version stable)
**Mergeable**: ✅ Oui (fast-forward depuis a5e2e78)
**Breaking changes**: ❌ Non
**Risk**: 🟢 Faible (commits testés individuellement)
