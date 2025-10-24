-- Fix security warning: set search_path for function
DROP TRIGGER IF EXISTS update_qpv_reference_updated_at ON public.qpv_reference;
DROP FUNCTION IF EXISTS update_qpv_reference_updated_at();

CREATE OR REPLACE FUNCTION update_qpv_reference_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_qpv_reference_updated_at
  BEFORE UPDATE ON public.qpv_reference
  FOR EACH ROW
  EXECUTE FUNCTION update_qpv_reference_updated_at();