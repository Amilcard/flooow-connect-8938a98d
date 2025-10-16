-- Enable pgcrypto extension for secure hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add hashed backup codes column
ALTER TABLE mfa_settings 
  ADD COLUMN IF NOT EXISTS backup_codes_hashed TEXT[] DEFAULT '{}';

-- Add usage tracking column
ALTER TABLE mfa_settings
  ADD COLUMN IF NOT EXISTS backup_codes_used JSONB DEFAULT '{}';

-- Add comments for documentation
COMMENT ON COLUMN mfa_settings.backup_codes_hashed IS 'Backup codes hashed with bcrypt (crypt function). Never store plain text codes.';
COMMENT ON COLUMN mfa_settings.backup_codes_used IS 'JSON object tracking which codes have been used. Format: {"code_index_0": {"used_at": "ISO_timestamp", "ip": "hashed_ip"}}';

-- Create function to hash backup code
CREATE OR REPLACE FUNCTION public.hash_backup_code(plain_code TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN crypt(plain_code, gen_salt('bf', 10));
END;
$$;

-- Create function to verify backup code
CREATE OR REPLACE FUNCTION public.verify_backup_code(plain_code TEXT, hashed_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (crypt(plain_code, hashed_code) = hashed_code);
END;
$$;

COMMENT ON FUNCTION public.hash_backup_code IS 'Securely hash a backup code using bcrypt';
COMMENT ON FUNCTION public.verify_backup_code IS 'Verify a plain text backup code against its hashed version';