-- Créer table validations_parentales séparée
CREATE TABLE IF NOT EXISTS public.validations_parentales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('en_attente', 'validee', 'refusee')),
  validated_at TIMESTAMP WITH TIME ZONE,
  reason_refus TEXT,
  reminders_sent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(booking_id)
);

-- Enable RLS
ALTER TABLE public.validations_parentales ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Parents can view their own validations"
ON public.validations_parentales
FOR SELECT
TO authenticated
USING (auth.uid() = parent_id);

CREATE POLICY "Parents can update their own validations"
ON public.validations_parentales
FOR UPDATE
TO authenticated
USING (auth.uid() = parent_id)
WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "System can create validations"
ON public.validations_parentales
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Trigger auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_validations_parentales_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_validations_parentales_updated_at
BEFORE UPDATE ON public.validations_parentales
FOR EACH ROW
EXECUTE FUNCTION public.update_validations_parentales_updated_at();

-- Index pour performance
CREATE INDEX idx_validations_parentales_parent_id ON public.validations_parentales(parent_id);
CREATE INDEX idx_validations_parentales_booking_id ON public.validations_parentales(booking_id);
CREATE INDEX idx_validations_parentales_status ON public.validations_parentales(status);