-- Migration: Flux de validation parentale à l'inscription activité
-- Description: Permet aux mineurs de s'inscrire avec validation parentale obligatoire

-- 1. Ajouter champ parent_id à profiles (lien mineur → parent)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Ajouter code de liaison unique (6 caractères alphanumériques)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS linking_code VARCHAR(6) UNIQUE;

-- 3. Ajouter date de naissance à profiles (pour détecter mineur si besoin)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS dob DATE;

-- 4. Enum pour les statuts des demandes temporaires
DO $$ BEGIN
  CREATE TYPE child_request_status AS ENUM (
    'waiting_parent_link',  -- Mineur a généré un code, attend que parent le lie
    'parent_linked',        -- Parent lié, attend validation de la demande
    'validated',            -- Parent a validé → créer booking réel
    'rejected',             -- Parent a refusé
    'expired'               -- Délai de 7 jours dépassé
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 5. Table des demandes temporaires de mineurs
CREATE TABLE IF NOT EXISTS public.child_temp_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  minor_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  slot_id UUID REFERENCES public.availability_slots(id) ON DELETE SET NULL,
  linking_code VARCHAR(6) NOT NULL,
  status child_request_status NOT NULL DEFAULT 'waiting_parent_link',
  parent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  validated_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Index pour recherche par code
CREATE INDEX IF NOT EXISTS idx_child_temp_requests_code ON public.child_temp_requests(linking_code);
CREATE INDEX IF NOT EXISTS idx_child_temp_requests_minor ON public.child_temp_requests(minor_profile_id);
CREATE INDEX IF NOT EXISTS idx_child_temp_requests_parent ON public.child_temp_requests(parent_id);
CREATE INDEX IF NOT EXISTS idx_child_temp_requests_status ON public.child_temp_requests(status);
CREATE INDEX IF NOT EXISTS idx_profiles_linking_code ON public.profiles(linking_code) WHERE linking_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_parent_id ON public.profiles(parent_id) WHERE parent_id IS NOT NULL;

-- 7. Fonction pour générer un code unique (évite O/0, I/1/L confusion)
CREATE OR REPLACE FUNCTION generate_linking_code() RETURNS VARCHAR(6) AS $$
DECLARE
  chars VARCHAR := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code VARCHAR(6) := '';
  i INT;
BEGIN
  FOR i IN 1..6 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- 8. Fonction pour générer un code unique pour un profil
CREATE OR REPLACE FUNCTION generate_profile_linking_code(profile_id UUID) RETURNS VARCHAR(6) AS $$
DECLARE
  new_code VARCHAR(6);
  max_attempts INT := 10;
  attempts INT := 0;
BEGIN
  LOOP
    new_code := generate_linking_code();

    -- Vérifier unicité
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE linking_code = new_code)
       AND NOT EXISTS (SELECT 1 FROM child_temp_requests WHERE linking_code = new_code) THEN

      -- Mettre à jour le profil avec le nouveau code
      UPDATE profiles SET linking_code = new_code, updated_at = NOW() WHERE id = profile_id;
      RETURN new_code;
    END IF;

    attempts := attempts + 1;
    IF attempts >= max_attempts THEN
      RAISE EXCEPTION 'Unable to generate unique code after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Fonction pour créer une demande temporaire d'inscription (mineur)
CREATE OR REPLACE FUNCTION create_child_temp_request(
  p_minor_id UUID,
  p_activity_id UUID,
  p_slot_id UUID DEFAULT NULL
) RETURNS TABLE(request_id UUID, linking_code VARCHAR(6)) AS $$
DECLARE
  new_code VARCHAR(6);
  new_request_id UUID;
  max_attempts INT := 10;
  attempts INT := 0;
BEGIN
  -- Générer un code unique
  LOOP
    new_code := generate_linking_code();

    IF NOT EXISTS (SELECT 1 FROM profiles WHERE linking_code = new_code)
       AND NOT EXISTS (SELECT 1 FROM child_temp_requests WHERE linking_code = new_code) THEN
      EXIT;
    END IF;

    attempts := attempts + 1;
    IF attempts >= max_attempts THEN
      RAISE EXCEPTION 'Unable to generate unique code after % attempts', max_attempts;
    END IF;
  END LOOP;

  -- Créer la demande
  INSERT INTO child_temp_requests (minor_profile_id, activity_id, slot_id, linking_code, status)
  VALUES (p_minor_id, p_activity_id, p_slot_id, new_code, 'waiting_parent_link')
  RETURNING id INTO new_request_id;

  RETURN QUERY SELECT new_request_id, new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Fonction pour lier un parent à un mineur via code
CREATE OR REPLACE FUNCTION link_parent_to_minor(
  p_parent_id UUID,
  p_linking_code VARCHAR(6)
) RETURNS JSON AS $$
DECLARE
  v_request RECORD;
  v_minor_profile RECORD;
BEGIN
  -- Chercher d'abord dans child_temp_requests
  SELECT * INTO v_request
  FROM child_temp_requests
  WHERE linking_code = UPPER(p_linking_code)
    AND status = 'waiting_parent_link'
    AND expires_at > NOW();

  IF FOUND THEN
    -- Mettre à jour la demande
    UPDATE child_temp_requests
    SET parent_id = p_parent_id,
        status = 'parent_linked',
        updated_at = NOW()
    WHERE id = v_request.id;

    -- Lier le profil mineur au parent
    UPDATE profiles
    SET parent_id = p_parent_id, updated_at = NOW()
    WHERE id = v_request.minor_profile_id;

    RETURN json_build_object(
      'success', true,
      'type', 'request',
      'request_id', v_request.id,
      'minor_id', v_request.minor_profile_id,
      'activity_id', v_request.activity_id
    );
  END IF;

  -- Chercher dans profiles (parent partage son code avec mineur)
  SELECT * INTO v_minor_profile
  FROM profiles
  WHERE linking_code = UPPER(p_linking_code)
    AND parent_id IS NULL;

  IF FOUND THEN
    -- Ce code appartient à un parent, pas à un mineur
    RETURN json_build_object(
      'success', false,
      'error', 'Ce code appartient à un autre utilisateur'
    );
  END IF;

  RETURN json_build_object(
    'success', false,
    'error', 'Code invalide ou expiré'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Fonction pour valider une demande par le parent
CREATE OR REPLACE FUNCTION validate_child_request(
  p_parent_id UUID,
  p_request_id UUID,
  p_action VARCHAR(10) -- 'validate' ou 'reject'
) RETURNS JSON AS $$
DECLARE
  v_request RECORD;
BEGIN
  SELECT * INTO v_request
  FROM child_temp_requests
  WHERE id = p_request_id
    AND parent_id = p_parent_id
    AND status = 'parent_linked';

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Demande introuvable ou non autorisée'
    );
  END IF;

  IF p_action = 'validate' THEN
    UPDATE child_temp_requests
    SET status = 'validated', validated_at = NOW(), updated_at = NOW()
    WHERE id = p_request_id;

    RETURN json_build_object(
      'success', true,
      'status', 'validated',
      'activity_id', v_request.activity_id,
      'slot_id', v_request.slot_id,
      'minor_id', v_request.minor_profile_id
    );
  ELSIF p_action = 'reject' THEN
    UPDATE child_temp_requests
    SET status = 'rejected', rejected_at = NOW(), updated_at = NOW()
    WHERE id = p_request_id;

    RETURN json_build_object(
      'success', true,
      'status', 'rejected'
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'Action invalide'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. RLS Policies
ALTER TABLE public.child_temp_requests ENABLE ROW LEVEL SECURITY;

-- Le mineur peut voir ses propres demandes
CREATE POLICY "Minors can view own requests" ON public.child_temp_requests
  FOR SELECT USING (minor_profile_id = auth.uid());

-- Le mineur peut créer des demandes pour lui-même
CREATE POLICY "Minors can create own requests" ON public.child_temp_requests
  FOR INSERT WITH CHECK (minor_profile_id = auth.uid());

-- Le parent lié peut voir les demandes de ses mineurs
CREATE POLICY "Parents can view linked requests" ON public.child_temp_requests
  FOR SELECT USING (parent_id = auth.uid());

-- Le parent peut mettre à jour les demandes liées
CREATE POLICY "Parents can update linked requests" ON public.child_temp_requests
  FOR UPDATE USING (parent_id = auth.uid());

-- 13. Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_child_temp_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_child_temp_requests_updated_at ON public.child_temp_requests;
CREATE TRIGGER trigger_child_temp_requests_updated_at
  BEFORE UPDATE ON public.child_temp_requests
  FOR EACH ROW EXECUTE FUNCTION update_child_temp_requests_updated_at();

-- 14. Commentaires
COMMENT ON TABLE public.child_temp_requests IS 'Demandes d''inscription temporaires de mineurs en attente de validation parentale';
COMMENT ON COLUMN public.profiles.parent_id IS 'ID du parent responsable (pour les comptes mineurs)';
COMMENT ON COLUMN public.profiles.linking_code IS 'Code unique pour lier parent/enfant';
