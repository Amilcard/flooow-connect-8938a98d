-- ==========================================
-- LOT 1.2 : Policies RLS collectivite_viewer
-- ==========================================

-- Policy RLS pour lecture activités (scope territoire)
CREATE POLICY "collectivite_viewer_can_read_activities"
ON activities FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'collectivite_viewer'::app_role) 
  AND EXISTS (
    SELECT 1 FROM structures s
    INNER JOIN user_roles ur ON ur.territory_id = s.territory_id
    WHERE s.id = activities.structure_id
      AND ur.user_id = auth.uid()
      AND ur.role = 'collectivite_viewer'::app_role
  )
);

-- Policy RLS pour lecture bookings (vue agrégée)
CREATE POLICY "collectivite_viewer_can_read_bookings"
ON bookings FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'collectivite_viewer'::app_role)
  AND EXISTS (
    SELECT 1 FROM activities a
    INNER JOIN structures s ON s.id = a.structure_id
    INNER JOIN user_roles ur ON ur.territory_id = s.territory_id
    WHERE a.id = bookings.activity_id
      AND ur.user_id = auth.uid()
      AND ur.role = 'collectivite_viewer'::app_role
  )
);

-- Policy RLS pour lecture aid_simulations
CREATE POLICY "collectivite_viewer_can_read_aid_simulations"
ON aid_simulations FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'collectivite_viewer'::app_role)
  AND EXISTS (
    SELECT 1 
    FROM bookings b
    INNER JOIN activities a ON a.id = b.activity_id
    INNER JOIN structures s ON s.id = a.structure_id
    INNER JOIN user_roles ur ON ur.territory_id = s.territory_id
    WHERE b.id = aid_simulations.booking_id
      AND ur.user_id = auth.uid()
      AND ur.role = 'collectivite_viewer'::app_role
  )
);