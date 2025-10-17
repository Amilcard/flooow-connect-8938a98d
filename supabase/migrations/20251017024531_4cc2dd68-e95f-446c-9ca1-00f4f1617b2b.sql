-- Create promo_codes table
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  discount_percentage NUMERIC NOT NULL DEFAULT 10,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  usage_count INTEGER NOT NULL DEFAULT 0,
  max_usage INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read active promo codes
CREATE POLICY "Anyone can view active promo codes"
  ON public.promo_codes
  FOR SELECT
  USING (valid_until > NOW() AND usage_count < max_usage);

-- Policy: Structures can manage promo codes for their activities
CREATE POLICY "Structures can manage their promo codes"
  ON public.promo_codes
  FOR ALL
  USING (
    has_role(auth.uid(), 'structure'::app_role) 
    AND EXISTS (
      SELECT 1 FROM public.activities a
      WHERE a.id = promo_codes.activity_id
      AND a.structure_id IN (
        SELECT id FROM public.structures 
        WHERE id IN (
          SELECT s.id FROM public.structures s
          INNER JOIN public.user_roles ur ON ur.user_id = auth.uid()
          WHERE ur.role = 'structure'::app_role
        )
      )
    )
  );

-- Policy: Admins can manage all promo codes
CREATE POLICY "Admins can manage all promo codes"
  ON public.promo_codes
  FOR ALL
  USING (
    has_role(auth.uid(), 'superadmin'::app_role) 
    OR has_role(auth.uid(), 'territory_admin'::app_role)
  );

-- Index for performance
CREATE INDEX idx_promo_codes_activity_id ON public.promo_codes(activity_id);
CREATE INDEX idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX idx_promo_codes_valid_until ON public.promo_codes(valid_until);

-- Trigger for updated_at
CREATE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON public.promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();