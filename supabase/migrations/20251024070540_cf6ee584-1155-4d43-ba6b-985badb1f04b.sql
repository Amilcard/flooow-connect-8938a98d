-- Add account validation system for families

-- Add account_status to profiles
ALTER TABLE public.profiles 
ADD COLUMN account_status TEXT DEFAULT 'pending' CHECK (account_status IN ('pending', 'active', 'suspended', 'rejected'));

-- Add validation tracking
ALTER TABLE public.profiles 
ADD COLUMN validated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN validated_by UUID REFERENCES auth.users(id),
ADD COLUMN rejection_reason TEXT;

-- Add parent validation requirements based on child age
ALTER TABLE public.bookings
ADD COLUMN requires_parent_validation BOOLEAN DEFAULT false,
ADD COLUMN parent_notified_at TIMESTAMP WITH TIME ZONE;

-- Update existing profiles to active (grandfathering)
UPDATE public.profiles SET account_status = 'active' WHERE account_status = 'pending';

-- Create index for pending accounts
CREATE INDEX idx_profiles_account_status ON public.profiles(account_status) WHERE account_status = 'pending';

COMMENT ON COLUMN public.profiles.account_status IS 'Account validation status: pending (awaiting admin validation), active (validated), suspended (temporarily blocked), rejected (denied access)';
COMMENT ON COLUMN public.bookings.requires_parent_validation IS 'True if booking requires explicit parent validation (children under 14 years old)';
