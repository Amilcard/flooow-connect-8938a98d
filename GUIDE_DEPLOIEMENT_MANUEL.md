# 🚀 GUIDE DÉPLOIEMENT - 15 MINUTES

## ⏱️ TIMING
- Étape 1 : 5 minutes
- Étape 2 : 3 minutes
- Étape 3 : 7 minutes
**Total : 15 minutes**

---

## 1️⃣ CONFIGURER LES SECRETS (5 min)

### A. Obtenir votre clé Resend

1. **Aller sur** : https://resend.com/login
2. **Se connecter** (ou créer compte gratuit)
3. **Cliquer** : "API Keys" (menu gauche)
4. **Cliquer** : "Create API Key"
5. **Copier** la clé : `re_xxxxxxxxx`

### B. Ajouter les secrets dans Supabase

1. **Aller sur** : https://supabase.com/dashboard
2. **Sélectionner** votre projet `flooow-connect`
3. **Cliquer** : ⚙️ Settings (roue crantée en bas à gauche)
4. **Cliquer** : Edge Functions
5. **Scroll** jusqu'à "Secrets"
6. **Cliquer** : "New secret"

7. **Remplir** :
   ```
   Name: RESEND_API_KEY
   Value: re_xxxxxxxxx (coller votre clé)
   ```
8. **Cliquer** : "Save"

9. **Cliquer** : "New secret" (encore)

10. **Remplir** :
    ```
    Name: FRONTEND_URL
    Value: https://votre-domaine.com
    ```
    ⚠️ **Si vous testez en local** : `http://localhost:5173`

11. **Cliquer** : "Save"

### ✅ Vérification
Vous devez voir 2 secrets :
```
RESEND_API_KEY     ••••••••••
FRONTEND_URL       ••••••••••
```

---

## 2️⃣ DÉPLOYER LES MIGRATIONS (3 min)

### Option A : Via CLI (recommandé si installé)

```bash
# Vérifier si CLI installée
supabase --version

# Si oui, déployer
supabase db push
```

Si erreur "command not found", utiliser **Option B**.

---

### Option B : Via Dashboard (si pas de CLI)

1. **Aller sur** : https://supabase.com/dashboard
2. **Sélectionner** votre projet
3. **Cliquer** : 🗄️ SQL Editor (menu gauche)
4. **Cliquer** : "+ New query"

#### Migration 1 : Contrainte UNIQUE

5. **Copier ce code** :
```sql
-- Contrainte UNIQUE sur children
ALTER TABLE children
ADD CONSTRAINT unique_child_per_parent
UNIQUE (user_id, first_name, dob);

CREATE INDEX IF NOT EXISTS idx_children_parent_name_dob
ON children(user_id, first_name, dob);

COMMENT ON CONSTRAINT unique_child_per_parent ON children IS
'Prevent duplicate children with same name and date of birth for a parent';
```

6. **Coller** dans l'éditeur SQL
7. **Cliquer** : "Run" (ou Ctrl+Enter)
8. **Vérifier** : Message "Success" en vert

---

#### Migration 2 : Fonction cleanup

9. **Cliquer** : "+ New query" (nouvelle requête)
10. **Copier ce code** :
```sql
-- Fonction cleanup demandes expirées
CREATE OR REPLACE FUNCTION cleanup_expired_child_signups()
RETURNS TABLE(expired_count INT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  count INT;
BEGIN
  UPDATE child_signup_requests
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();

  GET DIAGNOSTICS count = ROW_COUNT;
  RAISE NOTICE 'Marked % child signup requests as expired', count;

  RETURN QUERY SELECT count;
END;
$$;

COMMENT ON FUNCTION cleanup_expired_child_signups IS
'Marks all pending child signup requests as expired when expires_at has passed';

GRANT EXECUTE ON FUNCTION cleanup_expired_child_signups TO anon, authenticated;
```

11. **Coller** dans l'éditeur
12. **Cliquer** : "Run"
13. **Vérifier** : Message "Success"

---

### ✅ Vérification migrations

**Tester contrainte UNIQUE** :
```sql
-- Dans SQL Editor
SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'children'
AND constraint_name = 'unique_child_per_parent';
```
Doit retourner 1 ligne.

**Tester fonction cleanup** :
```sql
-- Dans SQL Editor
SELECT * FROM cleanup_expired_child_signups();
```
Doit retourner un nombre (0 si aucune demande expirée).

---

## 3️⃣ TESTER LE FLUX COMPLET (7 min)

### A. Créer un parent test

1. **Ouvrir** votre application : https://votre-domaine.com
   (ou `http://localhost:5173` si local)

2. **S'inscrire** avec un email test :
   ```
   Email : votre.email+test@gmail.com
   Prénom : TestParent
   Nom : Dupont
   ```
   ℹ️ Astuce Gmail : `+test` permet d'utiliser le même email

3. **Vérifier** l'email de confirmation
4. **Activer** le compte parent (si nécessaire)

---

### B. Tester inscription enfant par email

5. **Aller sur** : `/child-signup` ou chercher "Inscrire un enfant"

6. **Choisir** : "Par email parent"

7. **Remplir** :
   ```
   Email parent : votre.email+test@gmail.com
   Prénom enfant : Emma
   Date naissance : 15/05/2015
   ```

8. **Cliquer** : "Envoyer la demande"

9. **Vérifier** le message de succès :
   ```
   ✅ Un email a été envoyé à votre.email+test@gmail.com
   ```

---

### C. Valider depuis l'email

10. **Ouvrir** votre boîte email
11. **Chercher** l'email "Emma souhaite s'inscrire sur InKlusif"
12. **Ouvrir** l'email
13. **Vérifier** :
    - Prénom enfant correct : Emma
    - Date naissance correcte : 15 mai 2015
    - 2 boutons : "OUI, C'EST MON ENFANT" et "NON, REFUSER"
    - URL commence par votre FRONTEND_URL

14. **Cliquer** : "✅ OUI, C'EST MON ENFANT"

15. **Vérifier** la page de confirmation :
    ```
    ✅ Inscription validée
    Emma a été inscrit(e) avec succès !
    ```

---

### D. Vérifier dans le compte parent

16. **Se connecter** avec le compte parent test
17. **Aller sur** : Mon compte > Mes enfants
18. **Vérifier** : Emma apparaît dans la liste

---

### ✅ Tests additionnels (optionnels)

**Test doublon (contrainte UNIQUE)** :
- Refaire étapes 5-14 avec les MÊMES données
- Doit afficher : "Une demande est déjà en attente pour cet enfant"

**Test rejet** :
- Créer nouvelle demande avec enfant différent
- Dans l'email, cliquer "❌ NON, REFUSER"
- Vérifier : "Demande d'inscription rejetée"
- Enfant ne doit PAS apparaître dans le compte

**Test expiration** :
- Créer demande, NE PAS valider
- Attendre 48h (ou modifier `expires_at` en SQL)
- Appeler : `SELECT * FROM cleanup_expired_child_signups();`
- Vérifier : status = 'expired'

---

## ⚠️ DÉPANNAGE

### Erreur : "Service d'email non configuré"
→ **RESEND_API_KEY** manquant, retour Étape 1

### Erreur : "Configuration serveur manquante"
→ **FRONTEND_URL** manquant, retour Étape 1

### Erreur : "Aucun compte parent trouvé"
→ Email parent incorrect ou compte pas créé

### Erreur : "Le compte parent doit être validé"
→ Compte parent status ≠ 'active', vérifier en BDD

### Email pas reçu
1. Vérifier spam/promotions
2. Vérifier logs Supabase :
   - Dashboard > Logs > Edge Functions
   - Chercher : "child-signup-email"
   - Voir erreurs
3. Vérifier logs Resend :
   - https://resend.com/logs
   - Voir si email envoyé

### URL email incorrecte
→ FRONTEND_URL mal configurée, vérifier valeur exacte

---

## 📊 CHECKLIST FINALE

Avant de considérer déployé :

- [ ] **Secrets configurés** (2/2)
  - [ ] RESEND_API_KEY
  - [ ] FRONTEND_URL

- [ ] **Migrations appliquées** (2/2)
  - [ ] Contrainte UNIQUE
  - [ ] Fonction cleanup

- [ ] **Tests réussis** (3/3)
  - [ ] Email reçu
  - [ ] Validation fonctionne
  - [ ] Enfant créé

---

## 🎉 SUCCÈS !

Si tous les tests passent :
✅ **Phase 2 déployée en production**

Temps total effectif : **~15 minutes**

---

## 📞 BESOIN D'AIDE ?

**Commandes utiles** :

```bash
# Voir logs Edge Functions
# Dashboard > Logs > Edge Functions > child-signup-email

# Tester fonction cleanup manuellement
# SQL Editor :
SELECT * FROM cleanup_expired_child_signups();

# Voir demandes en attente
SELECT id, child_first_name, status, created_at, expires_at
FROM child_signup_requests
WHERE status = 'pending'
ORDER BY created_at DESC;

# Voir enfants créés récemment
SELECT c.id, c.first_name, c.dob, p.email as parent_email
FROM children c
JOIN profiles p ON c.user_id = p.id
ORDER BY c.created_at DESC
LIMIT 10;
```

---

**FIN DU GUIDE** ✅
