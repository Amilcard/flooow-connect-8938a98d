# 🤖 PROMPTS LOVEABLE - CORRECTIONS PHASE 1

Ce document contient des prompts précis et optimisés pour Loveable afin de corriger les problèmes critiques d'inscription enfant par email.

---

## 📋 ORDRE D'EXÉCUTION

Exécutez ces prompts dans l'ordre suivant :

1. **Prompt #1** : Créer la page ValidateChildSignup.tsx
2. **Prompt #2** : Ajouter la route dans App.tsx
3. **Prompt #3** : Modifier child-signup-email pour vérifier le parent
4. **Ensuite** : Partie manuelle (backend Edge Function)

---

## 🎯 PROMPT #1 : Créer ValidateChildSignup.tsx

**À copier-coller dans Loveable :**

```
Crée un nouveau fichier src/pages/ValidateChildSignup.tsx avec le code suivant :

C'est une page qui valide les inscriptions d'enfants via un lien email.

Fonctionnalités :
- Récupère les paramètres "token" et "action" de l'URL (useSearchParams)
- Affiche un loader pendant la validation
- Appelle la fonction Edge "validate-child-signup-token" avec supabase.functions.invoke()
- Affiche un message de succès ou d'erreur selon le résultat
- Redirige vers /mon-compte/mes-enfants après 3 secondes en cas de succès

Composants UI à utiliser :
- Card, CardContent, CardHeader, CardTitle (déjà importés)
- CheckCircle2 (icône succès - import de lucide-react)
- XCircle (icône erreur - import de lucide-react)
- Loader2 (icône loading animée - import de lucide-react)
- Header component (déjà existant)
- useToast hook pour les notifications

États possibles :
- loading : Affiche Loader2 + "Validation en cours..."
- success : Affiche CheckCircle2 (vert si approve, orange si reject) + message + redirection
- error : Affiche XCircle (rouge) + message d'erreur + bouton "Retour à l'accueil"

Structure HTML :
- min-h-screen bg-background
- Header en haut
- Container centré avec max-w-2xl
- Card avec les 3 états conditionnels

Le code doit gérer :
- Si token ou action manquant → état error immédiatement
- Si action n'est pas "approve" ou "reject" → état error
- Appel API avec try/catch
- Toast de succès/erreur
- Navigate après 3000ms en cas de succès
```

**Fichier attendu :** `src/pages/ValidateChildSignup.tsx`

**Temps estimé :** 5 minutes

---

## 🎯 PROMPT #2 : Ajouter la route dans App.tsx

**À copier-coller dans Loveable :**

```
Modifie le fichier src/App.tsx pour ajouter la nouvelle route :

1. Importe le composant ValidateChildSignup en haut du fichier :
   import ValidateChildSignup from "./pages/ValidateChildSignup";

2. Ajoute la route dans le <Routes> block, juste après la route /child-self-signup :
   <Route path="/validate-child-signup" element={<ValidateChildSignup />} />

C'est une route publique (pas besoin de ProtectedRoute), car elle est utilisée depuis un lien email sans authentification préalable.

Place la route vers la ligne 141, après :
<Route path="/child-self-signup" element={<ChildSelfSignup />} />
```

**Fichier modifié :** `src/App.tsx`

**Temps estimé :** 2 minutes

---

## 🎯 PROMPT #3 : Vérifier l'existence du parent dans child-signup-email

**À copier-coller dans Loveable :**

```
Modifie le fichier supabase/functions/child-signup-email/index.ts :

Ajoute une vérification que le compte parent existe AVANT de créer la demande et d'envoyer l'email.

Localisation : Après la validation des inputs (ligne 32), juste après le bloc :
if (!parentEmail || !childName || !childDob) { ... }

Code à ajouter :

// Vérifier que le parent existe et est actif
const { data: parent, error: parentError } = await supabaseAdmin
  .from('profiles')
  .select('id, account_status')
  .eq('email', parentEmail)
  .maybeSingle();

if (parentError) {
  console.error('Error checking parent:', parentError);
  return new Response(
    JSON.stringify({ error: 'Erreur lors de la vérification du compte parent' }),
    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

if (!parent) {
  return new Response(
    JSON.stringify({
      error: 'Aucun compte parent trouvé avec cet email. Créez d\'abord un compte parent sur l\'application.'
    }),
    { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

if (parent.account_status !== 'active') {
  return new Response(
    JSON.stringify({
      error: 'Le compte parent doit être validé par un administrateur avant de pouvoir inscrire un enfant.'
    }),
    { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

Explications :
- On vérifie que l'email existe dans la table profiles
- On vérifie que le compte est actif (account_status = 'active')
- Si parent inexistant → 404 avec message clair
- Si parent non validé → 403 avec message explicatif
- Cela évite d'envoyer des emails à des adresses invalides
```

**Fichier modifié :** `supabase/functions/child-signup-email/index.ts`

**Temps estimé :** 3 minutes

---

## ✅ VÉRIFICATION APRÈS LOVEABLE

Après que Loveable a exécuté les 3 prompts, vérifiez :

**1. Fichier créé :**
```bash
ls -la src/pages/ValidateChildSignup.tsx
# Devrait exister
```

**2. Route ajoutée :**
```bash
grep "validate-child-signup" src/App.tsx
# Devrait afficher 2 lignes (import + route)
```

**3. Fonction modifiée :**
```bash
grep -n "Vérifier que le parent existe" supabase/functions/child-signup-email/index.ts
# Devrait afficher le numéro de ligne
```

**4. Build sans erreur :**
```bash
npm run build
# Devrait réussir sans erreur TypeScript
```

---

## 🔧 PARTIE MANUELLE (Backend)

Loveable ne peut PAS faire cette partie. Vous devrez :

### Étape 1 : Créer la fonction Edge

**Créer le fichier :** `supabase/functions/validate-child-signup-token/index.ts`

**Copier le code depuis :** `ACTION_PLAN.md` section "Action 1.2"

Ou utilisez ce lien direct vers le code complet :
→ Voir ACTION_PLAN.md lignes 97-267

### Étape 2 : Configurer config.toml

**Ajouter dans :** `supabase/config.toml`

```toml
[functions.validate-child-signup-token]
verify_jwt = false
```

### Étape 3 : Déployer la fonction

```bash
supabase functions deploy validate-child-signup-token
```

### Étape 4 : Configurer les secrets Supabase

Dans **Supabase Dashboard → Settings → Edge Functions → Secrets** :

```
RESEND_API_KEY=re_VotreClé_XXXXXXX
FRONTEND_URL=https://votre-domaine-production.fr
```

En développement local :
```
FRONTEND_URL=http://localhost:5173
```

---

## 🧪 TESTS APRÈS CORRECTIONS

### Test 1 : Page ValidateChildSignup charge

```bash
# Démarrer le dev server
npm run dev

# Ouvrir dans le navigateur
http://localhost:5173/validate-child-signup?token=test&action=approve
```

**Résultat attendu :**
- Page s'affiche ✅
- Loader visible pendant 1-2 secondes
- Message d'erreur "Lien invalide ou expiré" (normal, token invalide)

### Test 2 : Vérification parent fonctionne

```bash
# Appeler l'API avec un email invalide (remplacer YOUR_PROJECT_REF)
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/child-signup-email \
  -H "Content-Type: application/json" \
  -d '{"parentEmail":"nonexistent@test.com","childName":"Test","childDob":"2010-01-01"}'
```

**Résultat attendu :**
```json
{
  "error": "Aucun compte parent trouvé avec cet email..."
}
```

### Test 3 : Flux complet (après déploiement backend)

1. Créer un compte parent avec email `test-parent@example.com`
2. Envoyer une demande d'inscription enfant par email
3. Vérifier réception de l'email
4. Cliquer sur "OUI, C'EST MON ENFANT"
5. Vérifier que la page charge
6. Vérifier que l'enfant est créé
7. Vérifier la redirection vers /mon-compte/mes-enfants

---

## 📊 SUIVI DE PROGRESSION

Cochez au fur et à mesure :

### Phase Loveable (10 min)
- [ ] Prompt #1 exécuté → ValidateChildSignup.tsx créé
- [ ] Prompt #2 exécuté → Route ajoutée dans App.tsx
- [ ] Prompt #3 exécuté → Vérification parent ajoutée
- [ ] Build réussi (`npm run build`)

### Phase Manuelle (1-2h)
- [ ] Fonction validate-child-signup-token créée
- [ ] config.toml mis à jour
- [ ] Fonction déployée (`supabase functions deploy`)
- [ ] RESEND_API_KEY configuré
- [ ] FRONTEND_URL configuré

### Tests (30 min)
- [ ] Test 1 : Page charge correctement
- [ ] Test 2 : Vérification parent fonctionne
- [ ] Test 3 : Flux complet end-to-end
- [ ] Build production réussi

---

## 🚨 PROBLÈMES POSSIBLES

### Problème : Loveable ne trouve pas les composants UI

**Solution :**
```
Les composants Shadcn UI sont déjà installés dans le projet.
Utilise les imports suivants :
- import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
- import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
- import { useToast } from "@/hooks/use-toast";
```

### Problème : Erreur TypeScript après modifications

**Solution :**
```bash
# Régénérer les types Supabase
npm run build

# Si erreur persiste, vérifier les imports
```

### Problème : La fonction Edge ne se déploie pas

**Solution :**
```bash
# Vérifier que vous êtes connecté
supabase login

# Vérifier le project ID
supabase projects list

# Déployer avec verbose
supabase functions deploy validate-child-signup-token --debug
```

### Problème : Email pas reçu

**Causes possibles :**
1. RESEND_API_KEY invalide → Vérifier dans Resend dashboard
2. Email dans spam → Vérifier les dossiers spam
3. Domaine non vérifié dans Resend → Utiliser onboarding@resend.dev en dev

---

## 💡 CONSEILS LOVEABLE

**Pour maximiser la réussite avec Loveable :**

1. **Un prompt à la fois**
   - N'envoyez pas les 3 prompts d'un coup
   - Attendez la confirmation de chaque étape

2. **Vérifiez après chaque prompt**
   - Ouvrez le fichier créé/modifié
   - Vérifiez que le code est correct
   - Testez dans le navigateur si possible

3. **Si Loveable se trompe**
   - Corrigez manuellement
   - Ou reformulez le prompt plus simplement
   - Ou copiez-collez le code depuis ACTION_PLAN.md

4. **Sauvegardez régulièrement**
   ```bash
   git add .
   git commit -m "WIP: Loveable corrections"
   ```

---

## 📞 SUPPORT

Si vous rencontrez un problème :

1. **Consultez ACTION_PLAN.md** pour le code complet
2. **Consultez AUDIT_REPORT.md** pour le contexte
3. **Testez avec VALIDATION_TESTS.md**

Ou demandez-moi d'implémenter directement (Option 2) !

---

**Prêt à lancer Loveable ?**

Commencez par le Prompt #1, puis vérifiez le résultat avant de passer au #2.

Bonne chance ! 🚀
