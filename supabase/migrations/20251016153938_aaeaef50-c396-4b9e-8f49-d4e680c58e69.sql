-- Create function to validate MFA backup codes with usage tracking
CREATE OR REPLACE FUNCTION public.validate_mfa_backup_code(
  p_user_id UUID,
  p_code_attempt TEXT
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_hashed_code TEXT;
  v_code_index INT;
  v_already_used BOOLEAN;
BEGIN
  -- Iterate through all user's hashed codes
  FOR v_code_index, v_hashed_code IN 
    SELECT idx-1, code 
    FROM mfa_settings, unnest(backup_codes_hashed) WITH ORDINALITY AS t(code, idx)
    WHERE user_id = p_user_id
  LOOP
    -- Check if attempt matches this hashed code
    IF crypt(p_code_attempt, v_hashed_code) = v_hashed_code THEN
      
      -- Check if code was already used
      SELECT (backup_codes_used->(v_code_index::text)) IS NOT NULL
      INTO v_already_used
      FROM mfa_settings
      WHERE user_id = p_user_id;
      
      IF v_already_used THEN
        RAISE WARNING 'Backup code already used - potential fraud attempt for user %', p_user_id;
        RETURN FALSE;
      END IF;
      
      -- Mark code as used with metadata
      UPDATE mfa_settings
      SET backup_codes_used = jsonb_set(
        backup_codes_used,
        ARRAY[v_code_index::text],
        jsonb_build_object(
          'used_at', NOW(),
          'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
        )
      )
      WHERE user_id = p_user_id;
      
      RETURN TRUE;
    END IF;
  END LOOP;
  
  -- No matching code found
  RETURN FALSE;
END;
$$;

-- Secure function access
REVOKE ALL ON FUNCTION public.validate_mfa_backup_code FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_mfa_backup_code TO authenticated;

COMMENT ON FUNCTION public.validate_mfa_backup_code IS 'Validates MFA backup code, prevents replay attacks by tracking usage with timestamp and IP address';