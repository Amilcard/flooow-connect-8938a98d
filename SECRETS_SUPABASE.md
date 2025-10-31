# 🔐 Configuration des Secrets Supabase

## Pourquoi tu as des erreurs ?

L'edge function `child-signup-email` a besoin de 2 secrets pour fonctionner. Si tu ne les configures pas, tu auras l'erreur **"edge function returned a non 2XX status code"**.

---

## ⚡ TÂCHES À FAIRE (5 minutes)

### 1️⃣ Aller sur Supabase Dashboard

1. Va sur https://supabase.com/dashboard
2. Sélectionne ton projet **flooow-connect**
3. Clique sur **Settings** (en bas à gauche)
4. Clique sur **Edge Functions**
5. Clique sur l'onglet **Secrets**

---

### 2️⃣ Ajouter RESEND_API_KEY

**C'est quoi ?** La clé pour envoyer des emails

**Comment l'avoir ?**
1. Va sur https://resend.com
2. Crée un compte gratuit (ou connecte-toi)
3. Va dans **API Keys**
4. Clique sur **Create API Key**
5. Copie la clé (commence par `re_...`)

**Dans Supabase :**
- Nom du secret : `RESEND_API_KEY`
- Valeur : colle la clé `re_xxxxxxxxxxxxx`
- Clique **Save**

---

### 3️⃣ Ajouter FRONTEND_URL

**C'est quoi ?** L'URL de ton application frontend

**Quelle valeur mettre ?**

- Si **développement local** : `http://localhost:5173`
- Si **production** (Loveable) : `https://ton-app.lovable.app`

**Dans Supabase :**
- Nom du secret : `FRONTEND_URL`
- Valeur : l'URL de ton app (SANS `/` à la fin)
- Clique **Save**

---

### 4️⃣ Redéployer les Edge Functions

Après avoir ajouté les secrets :

1. Dans **Edge Functions**, sélectionne `child-signup-email`
2. Clique sur **Redeploy** (ou attends 1 minute, ça se met à jour auto)

---

## ✅ Comment vérifier que ça marche ?

1. Retourne sur ton app
2. Essaie de nouveau d'inscrire un enfant
3. **Avant** : Erreur "edge function returned non 2XX"
4. **Après** : Ça fonctionne OU nouveau message d'erreur plus clair :
   - "Aucun compte parent trouvé" → Normal, l'email parent n'existe pas
   - "Le compte parent doit être validé" → Normal, active le compte avec la migration SQL

---

## 📋 Résumé des secrets à configurer

| Secret | Valeur | Où l'obtenir |
|--------|--------|--------------|
| `RESEND_API_KEY` | `re_xxxxx` | https://resend.com → API Keys |
| `FRONTEND_URL` | `http://localhost:5173` ou `https://ton-app.lovable.app` | URL de ton app |

---

## 🆘 Si ça marche toujours pas après

Vérifie les **logs** de l'edge function :

1. Supabase Dashboard → **Edge Functions**
2. Clique sur `child-signup-email`
3. Clique sur **Logs**
4. Regarde les erreurs en rouge
5. Envoie-moi le message d'erreur

---

**Note :** Les secrets `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont automatiques, pas besoin de les configurer.
