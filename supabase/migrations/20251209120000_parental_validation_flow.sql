-- Migration: Parental validation flow for activity registration
-- Description: Allows minors to register with mandatory parental validation

-- 1. Add parent_id column to profiles (links minor to parent)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Add unique linking code (6 alphanumeric characters)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS linking_code VARCHAR(6) UNIQUE;

-- 3. Add date of birth to profiles (to detect minor if needed)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS dob DATE;

-- 4. Enum for temporary request statuses
DO $$ BEGIN
  CREATE TYPE child_request_status AS ENUM (
    'waiting_parent_link',
    'parent_linked',
    'validated',
    'rejected',
    'expired'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 5. Table for minor temporary requests
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

-- 6. Indexes for code search
CREATE INDEX IF NOT EXISTS idx_child_temp_requests_code ON public.child_temp_requests(linking_code);
CREATE INDEX IF NOT EXISTS idx_child_temp_requests_minor ON public.child_temp_requests(minor_profile_id);
CREATE INDEX IF NOT EXISTS idx_child_temp_requests_parent ON public.child_temp_requests(parent_id);
CREATE INDEX IF NOT EXISTS idx_child_temp_requests_status ON public.child_temp_requests(status);
CREATE INDEX IF NOT EXISTS idx_profiles_linking_code ON public.profiles(linking_code) WHERE linking_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_parent_id ON public.profiles(parent_id) WHERE parent_id IS NOT NULL;

-- 7. Function to generate unique code (avoids O/0, I/1/L confusion)
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

-- 8. Function to generate unique code for a profile
CREATE OR REPLACE FUNCTION generate_profile_linking_code(profile_id UUID) RETURNS VARCHAR(6) AS $$
DECLARE
  new_code VARCHAR(6);
  max_attempts INT := 10;
  attempts INT := 0;
BEGIN
  LOOP
    new_code := generate_linking_code();

    IF NOT EXISTS (SELECT 1 FROM profiles WHERE linking_code = new_code)
       AND NOT EXISTS (SELECT 1 FROM child_temp_requests WHERE linking_code = new_code) THEN
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

-- 9. Function to create temporary registration request (minor)
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

  INSERT INTO child_temp_requests (minor_profile_id, activity_id, slot_id, linking_code, status)
  VALUES (p_minor_id, p_activity_id, p_slot_id, new_code, 'waiting_parent_link')
  RETURNING id INTO new_request_id;

  RETURN QUERY SELECT new_request_id, new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Function to link parent to minor via code
CREATE OR REPLACE FUNCTION link_parent_to_minor(
  p_parent_id UUID,
  p_linking_code VARCHAR(6)
) RETURNS JSON AS $$
DECLARE
  v_request RECORD;
  v_minor_profile RECORD;
BEGIN
  SELECT * INTO v_request
  FROM child_temp_requests
  WHERE linking_code = UPPER(p_linking_code)
    AND status = 'waiting_parent_link'
    AND expires_at > NOW();

  IF FOUND THEN
    UPDATE child_temp_requests
    SET parent_id = p_parent_id,
        status = 'parent_linked',
        updated_at = NOW()
    WHERE id = v_request.id;

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

  SELECT * INTO v_minor_profile
  FROM profiles
  WHERE linking_code = UPPER(p_linking_code)
    AND parent_id IS NULL;

  IF FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'This code belongs to another user'
    );
  END IF;

  RETURN json_build_object(
    'success', false,
    'error', 'Invalid or expired code'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Function to validate request by parent
CREATE OR REPLACE FUNCTION validate_child_request(
  p_parent_id UUID,
  p_request_id UUID,
  p_action VARCHAR(10)
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
      'error', 'Request not found or not authorized'
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
      'error', 'Invalid action'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. RLS Policies
ALTER TABLE public.child_temp_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Minors can view own requests" ON public.child_temp_requests;
CREATE POLICY "Minors can view own requests" ON public.child_temp_requests
  FOR SELECT USING (minor_profile_id = auth.uid());

DROP POLICY IF EXISTS "Minors can create own requests" ON public.child_temp_requests;
CREATE POLICY "Minors can create own requests" ON public.child_temp_requests
  FOR INSERT WITH CHECK (minor_profile_id = auth.uid());

DROP POLICY IF EXISTS "Parents can view linked requests" ON public.child_temp_requests;
CREATE POLICY "Parents can view linked requests" ON public.child_temp_requests
  FOR SELECT USING (parent_id = auth.uid());

DROP POLICY IF EXISTS "Parents can update linked requests" ON public.child_temp_requests;
CREATE POLICY "Parents can update linked requests" ON public.child_temp_requests
  FOR UPDATE USING (parent_id = auth.uid());

-- 13. Trigger for updated_at
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

-- 14. Comments
COMMENT ON TABLE public.child_temp_requests IS 'Temporary registration requests from minors awaiting parental validation';
COMMENT ON COLUMN public.profiles.parent_id IS 'Parent ID for minor accounts';
COMMENT ON COLUMN public.profiles.linking_code IS 'Unique code for parent-child linking';
