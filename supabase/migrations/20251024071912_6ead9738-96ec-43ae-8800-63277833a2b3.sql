-- Add family code system and child signup requests (corrected)

-- Add family_code to profiles (for quick parent linking)
ALTER TABLE public.profiles 
ADD COLUMN family_code TEXT UNIQUE;

-- Generate family codes for existing profiles
UPDATE public.profiles 
SET family_code = 'FAM-' || UPPER(SUBSTRING(MD5(id::TEXT || RANDOM()::TEXT) FROM 1 FOR 4))
WHERE family_code IS NULL;

-- Create index for family code lookups
CREATE INDEX idx_profiles_family_code ON public.profiles(family_code) WHERE family_code IS NOT NULL;

-- Create child signup requests table (for email validation path)
CREATE TABLE public.child_signup_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_email TEXT NOT NULL,
  child_first_name TEXT NOT NULL,
  child_dob DATE NOT NULL,
  validation_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rejected', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  validated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(parent_email, child_first_name, child_dob)
);

-- Create index for pending requests (without NOW() for immutability)
CREATE INDEX idx_child_signup_requests_pending 
ON public.child_signup_requests(parent_email, status, expires_at) 
WHERE status = 'pending';

-- RLS policies for child_signup_requests
ALTER TABLE public.child_signup_requests ENABLE ROW LEVEL SECURITY;

-- Parents can view their own requests
CREATE POLICY "Parents can view their own child signup requests"
ON public.child_signup_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.email = child_signup_requests.parent_email
    AND profiles.id = auth.uid()
  )
);

-- Parents can update their own requests (validate/reject)
CREATE POLICY "Parents can validate their own child signup requests"
ON public.child_signup_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.email = child_signup_requests.parent_email
    AND profiles.id = auth.uid()
  )
);

-- System can insert (via edge function)
CREATE POLICY "System can create child signup requests"
ON public.child_signup_requests
FOR INSERT
WITH CHECK (true);

COMMENT ON TABLE public.child_signup_requests IS 'Temporary table for child self-signup requests awaiting parent validation';
COMMENT ON COLUMN public.profiles.family_code IS 'Unique family code (e.g., FAM-2K9L) that children can use to register themselves';
