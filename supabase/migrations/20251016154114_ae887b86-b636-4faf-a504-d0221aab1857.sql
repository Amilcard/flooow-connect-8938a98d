-- Migrate plaintext backup codes to hashed versions
DO $$
DECLARE
  r RECORD;
  old_code TEXT;
  new_hash TEXT;
BEGIN
  FOR r IN SELECT id, user_id, backup_codes FROM mfa_settings WHERE backup_codes IS NOT NULL
  LOOP
    -- For each plaintext code in the JSONB array
    FOR old_code IN SELECT jsonb_array_elements_text(r.backup_codes)
    LOOP
      -- Hash using bcrypt and append to hashed array
      new_hash := crypt(old_code, gen_salt('bf', 10));
      UPDATE mfa_settings
      SET backup_codes_hashed = array_append(backup_codes_hashed, new_hash)
      WHERE id = r.id;
    END LOOP;
    
    -- Clear plaintext codes after migration
    UPDATE mfa_settings SET backup_codes = NULL WHERE id = r.id;
  END LOOP;
END;
$$;

-- Drop vulnerable plaintext column permanently
ALTER TABLE mfa_settings DROP COLUMN IF EXISTS backup_codes;

COMMENT ON TABLE mfa_settings IS 'MFA settings table - backup codes are now stored hashed only in backup_codes_hashed column';