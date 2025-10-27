# 🧪 TESTS DE VALIDATION - FLOOOW CONNECT

Ce document contient des tests pratiques pour vérifier le bon fonctionnement des fonctionnalités d'inscription enfant.

---

## 📋 Checklist de tests manuels

### ✅ Test 1: Inscription via code famille (Parcours A)

**Pré-requis:**
- [ ] Un compte parent actif existe en base
- [ ] Le parent a un `family_code` (ex: FAM-2K9L)
- [ ] Aucun enfant avec ce prénom + date de naissance n'existe

**Steps:**
1. Naviguer vers `/child-self-signup`
2. Cliquer sur l'onglet "Avec un code"
3. Remplir:
   - Code famille: `FAM-2K9L`
   - Prénom: `Lucas`
   - Date de naissance: `2012-06-15`
4. Cliquer sur "M'inscrire maintenant"

**Résultat attendu:**
- ✅ Toast de succès: "Lucas a été inscrit(e) avec succès !"
- ✅ Redirection vers `/`
- ✅ Enfant créé dans la table `children` avec `user_id` = parent
- ✅ Notification créée dans la table `notifications` pour le parent

**Vérification en base:**
```sql
-- Vérifier l'enfant créé
SELECT * FROM children
WHERE first_name = 'Lucas'
  AND dob = '2012-06-15';

-- Vérifier la notification
SELECT * FROM notifications
WHERE type = 'child_self_signup'
ORDER BY created_at DESC LIMIT 1;
```

---

### ❌ Test 2: Code famille invalide

**Steps:**
1. Naviguer vers `/child-self-signup`
2. Remplir avec un code inexistant: `FAM-XXXX`
3. Soumettre

**Résultat attendu:**
- ❌ Toast d'erreur: "Code famille invalide"
- ❌ Aucun enfant créé

---

### ❌ Test 3: Compte parent non validé

**Pré-requis:**
- [ ] Un compte parent existe avec `account_status = 'pending'`

**Steps:**
1. Essayer de s'inscrire avec le code de ce parent

**Résultat attendu:**
- ❌ Erreur 403: "Le compte parent doit être validé"

---

### ❌ Test 4: Doublon enfant

**Pré-requis:**
- [ ] Un enfant "Emma" né le 2010-03-10 existe déjà pour le parent

**Steps:**
1. Essayer de créer à nouveau "Emma" avec la même date de naissance

**Résultat attendu:**
- ❌ Erreur 409: "Cet enfant est déjà inscrit"

---

### 🔴 Test 5: Inscription via email (Parcours B) - ACTUELLEMENT CASSÉ

**Pré-requis:**
- [ ] RESEND_API_KEY configurée dans Supabase
- [ ] Un compte parent avec email `parent@test.com` existe

**Steps:**
1. Naviguer vers `/child-self-signup`
2. Cliquer sur l'onglet "Avec l'email parent"
3. Remplir:
   - Email parent: `parent@test.com`
   - Prénom: `Emma`
   - Date de naissance: `2014-03-10`
4. Soumettre

**Résultat attendu:**
- ✅ Toast: "Un email a été envoyé à parent@test.com"
- ✅ Record créé dans `child_signup_requests` avec status='pending'
- ✅ Email envoyé via Resend

**Vérification en base:**
```sql
SELECT * FROM child_signup_requests
WHERE parent_email = 'parent@test.com'
ORDER BY created_at DESC LIMIT 1;
```

**Vérifier l'email reçu:**
- [ ] Objet: "Emma souhaite s'inscrire sur InKlusif"
- [ ] Lien "OUI, C'EST MON ENFANT" présent
- [ ] Lien "NON, REFUSER" présent

---

### 🔴 Test 6: Validation du lien email - NON FONCTIONNEL

**Steps:**
1. Cliquer sur "OUI, C'EST MON ENFANT" dans l'email

**Résultat ACTUEL:**
- ❌ 404 Not Found (page `/validate-child-signup` n'existe pas)

**Résultat ATTENDU (après fix):**
- ✅ Page de validation affichée
- ✅ Spinner de chargement
- ✅ Message "Inscription validée !"
- ✅ Enfant créé dans la table `children`
- ✅ child_signup_requests.status passé à 'validated'
- ✅ Redirection vers `/mon-compte/mes-enfants`

---

### ❌ Test 7: Rate limiting (3 demandes max/24h)

**Steps:**
1. Envoyer 3 demandes pour le même email parent
2. Essayer d'envoyer une 4e demande

**Résultat attendu:**
- ✅ Les 3 premières passent
- ❌ La 4e retourne 429: "Limite atteinte : 3 demandes maximum par jour"

**Vérification:**
```sql
SELECT COUNT(*) FROM child_signup_requests
WHERE parent_email = 'parent@test.com'
  AND created_at > NOW() - INTERVAL '24 hours';
-- Doit retourner 3
```

---

### ❌ Test 8: Détection doublon demande pending

**Pré-requis:**
- [ ] Une demande pending existe déjà pour Emma (parent@test.com, 2014-03-10)

**Steps:**
1. Essayer de créer à nouveau la même demande

**Résultat attendu:**
- ❌ Erreur 409: "Une demande est déjà en attente pour cet enfant"

---

### ⚠️ Test 9: Expiration automatique - NON IMPLÉMENTÉ

**Pré-requis:**
- [ ] Une demande créée il y a > 48h existe

**Vérification:**
```sql
-- Vérifier qu'elle est toujours 'pending' (BUG)
SELECT * FROM child_signup_requests
WHERE expires_at < NOW()
  AND status = 'pending';

-- Devrait retourner 0 lignes mais en retournera probablement
```

**Action requise:**
Implémenter le cleanup automatique (voir AUDIT_REPORT.md section 5.3)

---

## 🔧 Tests de configuration

### Test Config 1: Variables d'environnement Supabase

**Vérifier dans Supabase Dashboard → Settings → Edge Functions → Secrets:**

```bash
SUPABASE_URL=https://lddlzlthtwuwxxrrbxuc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... (doit être défini)
RESEND_API_KEY=re_... (doit être défini)
FRONTEND_URL=https://votre-domaine.fr (recommandé)
```

**Test en ligne de commande:**
```bash
# Tester que la fonction est déployée
curl -X POST https://lddlzlthtwuwxxrrbxuc.supabase.co/functions/v1/child-signup-code \
  -H "Content-Type: application/json" \
  -d '{"familyCode":"FAM-TEST","firstName":"Test","dob":"2010-01-01"}'

# Devrait retourner 404 (code invalide) et pas 500 (erreur serveur)
```

---

### Test Config 2: RLS Policies

**Vérifier que les policies sont actives:**

```sql
-- Lister les policies de child_signup_requests
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'child_signup_requests';

-- Devrait retourner 3 policies:
-- 1. "Parents can view their own child signup requests" (SELECT)
-- 2. "Parents can validate their own child signup requests" (UPDATE)
-- 3. "System can create child signup requests" (INSERT)
```

**Test d'accès:**
```javascript
// En tant que parent authentifié
const { data, error } = await supabase
  .from('child_signup_requests')
  .select('*');

// Devrait retourner uniquement SES demandes (filtré par email)
```

---

### Test Config 3: Types TypeScript

**Vérifier que les types sont à jour:**

```bash
# Régénérer les types Supabase
npx supabase gen types typescript --project-id lddlzlthtwuwxxrrbxuc > src/integrations/supabase/types.ts

# Vérifier que child_signup_requests est présent
grep -n "child_signup_requests" src/integrations/supabase/types.ts
```

**Devrait afficher:**
```
537:      child_signup_requests: {
```

---

## 🐛 Tests de fragilité

### Fragilité 1: RESEND_API_KEY manquante

**Test:**
1. Supprimer temporairement RESEND_API_KEY des secrets Supabase
2. Essayer d'envoyer une demande par email

**Résultat ACTUEL:**
- ❌ Erreur 500 générique
- ❌ Email non envoyé mais demande créée en base (état incohérent)

**Résultat ATTENDU (après fix):**
- ❌ Erreur 500 avec message clair: "Service de mail non configuré"
- ❌ Demande NON créée en base

---

### Fragilité 2: Parent inexistant

**Test:**
1. Envoyer une demande avec email `nonexistent@example.com`

**Résultat ACTUEL:**
- ✅ Email envoyé (si RESEND_API_KEY OK)
- ✅ Demande créée
- ⚠️ Parent ne pourra JAMAIS valider (aucun compte)

**Résultat ATTENDU (après fix):**
- ❌ Erreur 404: "Aucun compte parent trouvé avec cet email"
- OU message: "Un email a été envoyé. Si le compte existe, le parent recevra un lien."

---

### Fragilité 3: Race condition validation

**Test (nécessite 2 navigateurs):**
1. Ouvrir le lien de validation dans Chrome
2. Ouvrir le MÊME lien dans Firefox
3. Cliquer sur "Valider" dans les 2 navigateurs en même temps

**Résultat ATTENDU (après ajout contrainte UNIQUE):**
- ✅ Un seul enfant créé
- ✅ L'autre requête retourne "Déjà validé"

**Vérification:**
```sql
-- Ajouter la contrainte
ALTER TABLE children
ADD CONSTRAINT unique_child_per_parent
UNIQUE (user_id, first_name, dob);
```

---

## 📊 Tests de performance

### Perf 1: Charge de requêtes

**Test avec Artillery:**

```yaml
# load-test.yml
config:
  target: https://lddlzlthtwuwxxrrbxuc.supabase.co
  phases:
    - duration: 60
      arrivalRate: 10  # 10 requêtes/seconde
scenarios:
  - name: "Child signup code"
    flow:
      - post:
          url: "/functions/v1/child-signup-code"
          json:
            familyCode: "FAM-TEST"
            firstName: "Load"
            dob: "2010-01-01"
```

**Commande:**
```bash
artillery run load-test.yml
```

**Résultats attendus:**
- Taux de succès: > 95% (404 acceptables si code invalide)
- Latence p95: < 500ms
- Aucune erreur 500

---

### Perf 2: Taille de la table child_signup_requests

**Simulation accumulation:**
```sql
-- Simuler 1000 demandes expirées
INSERT INTO child_signup_requests (parent_email, child_first_name, child_dob, validation_token, expires_at, status)
SELECT
  'parent' || i || '@test.com',
  'Child' || i,
  '2010-01-01',
  gen_random_uuid(),
  NOW() - INTERVAL '3 days',  -- Expirées
  'pending'
FROM generate_series(1, 1000) i;

-- Vérifier la taille de la table
SELECT
  pg_size_pretty(pg_total_relation_size('child_signup_requests')) AS size,
  COUNT(*) AS total_rows,
  COUNT(*) FILTER (WHERE status = 'pending' AND expires_at < NOW()) AS expired_pending
FROM child_signup_requests;
```

**Action si > 10k lignes expirées:**
→ Implémenter le cleanup automatique immédiatement

---

## 🔒 Tests de sécurité

### Sécurité 1: Injection SQL

**Test:**
```bash
curl -X POST https://lddlzlthtwuwxxrrbxuc.supabase.co/functions/v1/child-signup-code \
  -H "Content-Type: application/json" \
  -d '{"familyCode":"FAM-TEST\"; DROP TABLE children; --","firstName":"Test","dob":"2010-01-01"}'
```

**Résultat attendu:**
- ✅ Code traité comme string littéral (pas d'injection SQL)
- ✅ Retourne 404 "Code invalide"

---

### Sécurité 2: Accès RLS

**Test avec compte non-parent:**
```javascript
// Se connecter avec un compte 'structure'
const { data } = await supabase
  .from('child_signup_requests')
  .select('*');

// Devrait retourner [] (aucun accès)
```

---

### Sécurité 3: Token de validation prédictible

**Vérifier:**
```sql
SELECT validation_token FROM child_signup_requests LIMIT 10;

-- Les tokens doivent être des UUID v4 (aléatoires):
-- Ex: a3c5e2d7-8f9a-4b1c-9d3e-7f8a2c5e9d3b
-- PAS: 1, 2, 3, ... (séquentiels)
```

---

## 📈 Tests de monitoring

### Monitoring 1: Logs Supabase

**Vérifier dans Supabase Dashboard → Logs:**

```
// Rechercher les erreurs récentes
ERROR | child-signup-email | Error sending email
ERROR | child-signup-code | Error creating child
```

**Alertes à configurer:**
- Taux d'erreur > 5% sur 5 minutes
- Temps de réponse > 2s
- Rate limit 429 > 10/minute (abus potentiel)

---

### Monitoring 2: Métriques Resend

**Dans Resend Dashboard:**
- Vérifier le taux de délivrabilité: > 98%
- Vérifier les bounces: < 2%
- Vérifier les plaintes spam: < 0.1%

**Si taux de bounce élevé:**
→ Problème de validation des emails (voir Fragilité #2)

---

## ✅ Checklist finale avant production

- [ ] **Fonctionnel**
  - [ ] Parcours A (code) testé end-to-end ✅
  - [ ] Parcours B (email) testé end-to-end ❌ (page validation manquante)
  - [ ] Rate limiting validé ✅
  - [ ] Détection doublons validée ✅

- [ ] **Configuration**
  - [ ] RESEND_API_KEY définie et vérifiée ❌
  - [ ] FRONTEND_URL définie ❌
  - [ ] RLS policies actives ✅
  - [ ] Types TypeScript à jour ✅

- [ ] **Sécurité**
  - [ ] Vérification existence parent ❌ (à implémenter)
  - [ ] Contrainte UNIQUE sur children ❌ (recommandé)
  - [ ] Expiration automatique des tokens ❌ (à implémenter)

- [ ] **Performance**
  - [ ] Load test passé (> 10 req/s) ⚠️ (à tester)
  - [ ] Cleanup automatique configuré ❌ (à implémenter)

- [ ] **Monitoring**
  - [ ] Alertes configurées ❌
  - [ ] Dashboard Resend actif ❌

---

**Score de production-readiness: 5/10**

**Actions critiques avant mise en production:**
1. Créer page ValidateChildSignup + fonction backend
2. Configurer RESEND_API_KEY
3. Implémenter vérification existence parent
4. Tester parcours complet email end-to-end

---

**Date:** 2025-10-27
**Version:** 1.0
