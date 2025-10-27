-- Correction des dates de créneaux pour période novembre 2025 - août 2026

-- 1. Supprimer les créneaux avant le 1er novembre 2025 qui n'ont pas de réservations
DELETE FROM public.availability_slots
WHERE start < '2025-11-01'::DATE
  AND NOT EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE bookings.slot_id = availability_slots.id
  );

-- 2. Mettre à jour les dates de début des créneaux récurrents pour qu'ils commencent au plus tôt le 1er novembre 2025
UPDATE public.availability_slots
SET start_date = GREATEST(start_date, '2025-11-01'::DATE),
    updated_at = now()
WHERE start_date IS NOT NULL 
  AND start_date < '2025-11-01'::DATE;

-- 3. Mettre à jour les dates de fin pour qu'elles ne dépassent pas le 30 août 2026
UPDATE public.availability_slots
SET end_date = LEAST(end_date, '2026-08-30'::DATE),
    updated_at = now()
WHERE end_date IS NOT NULL 
  AND end_date > '2026-08-30'::DATE;

-- 4. Désactiver (supprimer si pas de réservations) les créneaux ponctuels après le 30 août 2026
DELETE FROM public.availability_slots
WHERE "end" > '2026-08-30 23:59:59'::TIMESTAMP
  AND recurrence_type IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE bookings.slot_id = availability_slots.id
  );