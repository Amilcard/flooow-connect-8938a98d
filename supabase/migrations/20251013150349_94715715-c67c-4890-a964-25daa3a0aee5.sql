-- Fix function search_path security warning
ALTER FUNCTION public.update_validations_parentales_updated_at() 
  SET search_path = 'public', 'pg_temp' SECURITY DEFINER;