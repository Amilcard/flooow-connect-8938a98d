
-- Corriger les RLS policies pour availability_slots
-- Supprimer l'ancienne policy trop restrictive
DROP POLICY IF EXISTS "Slots visible to all authenticated users" ON availability_slots;

-- Créer une nouvelle policy qui permet à TOUT LE MONDE de voir les slots disponibles
CREATE POLICY "slots_visible_to_everyone"
ON availability_slots
FOR SELECT
TO public
USING (true);

-- Policy pour les structures (gérer leurs propres slots)
DROP POLICY IF EXISTS "Structures can manage slots for their activities" ON availability_slots;

CREATE POLICY "structures_manage_own_slots"
ON availability_slots
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'structure'::app_role) 
  AND EXISTS (
    SELECT 1
    FROM activities a
    JOIN structures s ON a.structure_id = s.id
    WHERE a.id = availability_slots.activity_id
  )
);
