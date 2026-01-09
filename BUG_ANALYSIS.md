# Analyse Bug React.Children.only - Post-Deployment

## Situation actuelle (14:44)

### ✅ Ce qui fonctionne
- Onboarding: ✅
- /ma-ville: ✅
- Build local: ✅ (sans erreurs)

### ❌ Ce qui crash
- Navigation APRÈS /ma-ville (probablement retour à /home ou autre route)
- Erreur: `React.Children.only expected to receive a single React element child`
- Bundle déployé: `react-vendor-dNmFfOoM.js` (nouveau hash = fix déployé)

## Fix appliqué

**Commit cf916fa** - `src/components/ui/button.tsx:51`
```tsx
{isLoading && !asChild && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
{children}
```

✅ Ce fix empêche le Loader2 d'être rendu quand asChild=true
✅ Empêche le Button de rendre 2 enfants au Slot

## Problème

**L'erreur persiste malgré le fix déployé.**

Cela signifie:
1. ❌ Il y a un AUTRE composant avec le même problème
2. ❌ OU le fix n'est pas suffisant
3. ❌ OU l'usage du Button cause le problème

## Hypothèses à vérifier

### H1: Autre composant utilisant Slot avec plusieurs enfants
- Candidates: SidebarMenuButton, SidebarGroupAction, BreadcrumbLink
- Ces composants ont aussi le pattern `asChild ? Slot : "element"`
- Mais ils n'ont PAS de logique conditionnelle interne comme isLoading

### H2: Usage de Button asChild avec enfants multiples
- Tous les usages vérifiés semblent corrects
- Chaque Button asChild reçoit UN seul enfant (<Link>, <a>)
- Aucun usage trouvé avec asChild + isLoading ensemble

### H3: Le problème vient d'un composant lazy-loaded
- EventRegistrationButton: chargé après navigation (utilisé dans AgendaCommunity, events)
- Composants home: chargés après onboarding
- Peut-être un composant chargé dynamiquement qui a le problème?

## Actions recommandées

1. **Vérifier la stack trace complète** sur Netlify
   - Identifier le composant exact qui cause l'erreur
   - La stack devrait indiquer quel composant appelle React.Children.only

2. **Tester le flow exact**
   - Onboarding → /ma-ville → retour /home
   - Identifier à quel moment précis le crash survient

3. **Chercher d'autres usages de Slot**
   - Vérifier TOUS les composants qui utilisent `@radix-ui/react-slot`
   - Chercher des patterns similaires à isLoading

4. **Vérifier si un autre prop conditionnel existe**
   - Pattern: `{someCondition && <Element />}` dans un composant asChild

## Code suspects identifiés

### ❌ AUCUN trouvé pour l'instant

Tous les usages vérifiés sont corrects:
- Button avec asChild ✓ (1 enfant)
- DropdownMenuTrigger asChild ✓ (1 Button enfant)
- Sidebar components ✓ (pas utilisés dans les pages problématiques)

## Conclusion temporaire

**Le bug persiste malgré le fix**, ce qui suggère:
- Soit une AUTRE instance du même pattern ailleurs
- Soit un cas edge non couvert par le fix
- Soit un problème de cache côté utilisateur (mais nouveau bundle confirmé)

**Action immédiate**: Demander à l'utilisateur la **stack trace complète** de l'erreur pour identifier le composant exact.
