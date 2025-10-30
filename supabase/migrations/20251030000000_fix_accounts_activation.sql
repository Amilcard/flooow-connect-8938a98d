-- Migration pour corriger les problèmes de connexion
-- 1. Activer tous les comptes en attente
-- 2. Confirmer tous les emails
-- 3. Assigner rôle par défaut aux users sans rôle

-- Activer tous les comptes profiles
UPDATE profiles
SET account_status = 'active'
WHERE account_status = 'pending' OR account_status IS NULL;

-- Confirmer tous les emails non confirmés
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Assigner rôle 'parent' par défaut aux users sans rôle
INSERT INTO user_roles (user_id, role)
SELECT id, 'parent'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_roles)
ON CONFLICT (user_id) DO NOTHING;

-- Créer un compte superadmin si inexistant
-- Note: Le mot de passe doit être défini manuellement après création
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Chercher si un admin existe déjà
  SELECT user_id INTO admin_user_id
  FROM user_roles
  WHERE role = 'admin'
  LIMIT 1;

  -- Si aucun admin, promouvoir le premier user créé
  IF admin_user_id IS NULL THEN
    SELECT id INTO admin_user_id
    FROM auth.users
    ORDER BY created_at ASC
    LIMIT 1;

    IF admin_user_id IS NOT NULL THEN
      INSERT INTO user_roles (user_id, role)
      VALUES (admin_user_id, 'admin')
      ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

      RAISE NOTICE 'Admin role assigned to user: %', admin_user_id;
    END IF;
  END IF;
END $$;
