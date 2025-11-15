-- Correction des fonctions sans search_path fixe pour éviter les injections de schéma

-- Corriger validate_booking_slot()
CREATE OR REPLACE FUNCTION public.validate_booking_slot()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.slot_id IS NULL THEN
    RAISE EXCEPTION 'slot_id est obligatoire pour créer une réservation'
      USING HINT = 'Veuillez sélectionner un créneau disponible';
  END IF;
  RETURN NEW;
END;
$function$;

-- Corriger update_notification_preferences_updated_at()
CREATE OR REPLACE FUNCTION public.update_notification_preferences_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Corriger update_event_registrations_updated_at()
CREATE OR REPLACE FUNCTION public.update_event_registrations_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;