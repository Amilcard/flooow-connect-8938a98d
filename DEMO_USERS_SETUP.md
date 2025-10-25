# Configuration Utilisateurs Démo

## 🎯 Objectif

Créer 3 utilisateurs de test pour la démo, un par rôle :
- **Collectivité** → dashboard territoires
- **Financeur** → dashboard aides
- **Structure** → dashboard organisateur

## 📝 Utilisateurs à créer

### 1. Utilisateur Collectivité

**Email** : `collectivite@demo.flooow.fr`
**Mot de passe** : `Demo2025!`
**Rôle** : `territory_admin`

### 2. Utilisateur Financeur

**Email** : `financeur@demo.flooow.fr`
**Mot de passe** : `Demo2025!`
**Rôle** : `partner`

### 3. Utilisateur Structure

**Email** : `structure@demo.flooow.fr`
**Mot de passe** : `Demo2025!`
**Rôle** : `structure`

---

## 🛠️ Méthode 1 : Via Supabase Dashboard (UI)

1. Aller dans **Authentication > Users**
2. Cliquer sur **Add user** (3 fois)
3. Remplir les infos ci-dessus
4. ⚠️ **Important** : Aller dans la console SQL et exécuter :

```sql
-- Assigner les rôles
INSERT INTO user_roles (user_id, role) VALUES
(
  (SELECT id FROM auth.users WHERE email = 'collectivite@demo.flooow.fr'),
  'territory_admin'
),
(
  (SELECT id FROM auth.users WHERE email = 'financeur@demo.flooow.fr'),
  'partner'
),
(
  (SELECT id FROM auth.users WHERE email = 'structure@demo.flooow.fr'),
  'structure'
);
```

---

## 🛠️ Méthode 2 : Via Script SQL (Plus rapide)

Exécuter ce script dans **SQL Editor** de Supabase :

```sql
-- Créer les 3 utilisateurs avec confirmation automatique
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token
) VALUES
-- Collectivité
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'collectivite@demo.flooow.fr',
  crypt('Demo2025!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  ''
),
-- Financeur
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'financeur@demo.flooow.fr',
  crypt('Demo2025!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  ''
),
-- Structure
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'structure@demo.flooow.fr',
  crypt('Demo2025!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  ''
)
ON CONFLICT (email) DO NOTHING;

-- Assigner les rôles
INSERT INTO user_roles (user_id, role) VALUES
(
  (SELECT id FROM auth.users WHERE email = 'collectivite@demo.flooow.fr'),
  'territory_admin'
),
(
  (SELECT id FROM auth.users WHERE email = 'financeur@demo.flooow.fr'),
  'partner'
),
(
  (SELECT id FROM auth.users WHERE email = 'structure@demo.flooow.fr'),
  'structure'
)
ON CONFLICT (user_id) DO NOTHING;
```

---

## ✅ Vérification

Après création, vérifier :

```sql
SELECT
  u.email,
  ur.role,
  u.email_confirmed_at IS NOT NULL as confirmed
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
WHERE u.email LIKE '%@demo.flooow.fr'
ORDER BY u.email;
```

Vous devriez voir :
| email | role | confirmed |
|-------|------|-----------|
| collectivite@demo.flooow.fr | territory_admin | true |
| financeur@demo.flooow.fr | partner | true |
| structure@demo.flooow.fr | structure | true |

---

## 🎬 Test de la démo

1. Ouvrir `/auth`
2. Se connecter avec `collectivite@demo.flooow.fr` / `Demo2025!`
3. Redirection automatique vers → `/dashboard/collectivite`
4. Dashboard affiche les données mock

Répéter pour les 2 autres comptes.

---

## 🔒 Sécurité démo

⚠️ **Ces comptes sont UNIQUEMENT pour la démo**
Après la réunion, les supprimer :

```sql
DELETE FROM user_roles
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@demo.flooow.fr'
);

DELETE FROM auth.users WHERE email LIKE '%@demo.flooow.fr';
```
