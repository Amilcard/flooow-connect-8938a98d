-- Remplacer politique RLS children pour limiter accès structures aux bookings actifs uniquement
DROP POLICY IF EXISTS "Structures can view children in their bookings" ON public.children;

CREATE POLICY "Structures can view children for active bookings only"
ON public.children
FOR SELECT
USING (
  has_role(auth.uid(), 'structure'::app_role) 
  AND EXISTS (
    SELECT 1 
    FROM public.bookings b
    JOIN public.activities a ON b.activity_id = a.id
    JOIN public.availability_slots s ON b.slot_id = s.id
    WHERE b.child_id = children.id
      AND b.status IN ('en_attente', 'validee')
      AND s.end > NOW()  -- Créneau pas encore passé
  )
);

COMMENT ON POLICY "Structures can view children for active bookings only" ON public.children 
IS 'Structures accèdent aux données enfants UNIQUEMENT pour bookings actifs (en_attente/validee) et créneaux futurs. Respect RGPD - pas de rétention après fin service.';