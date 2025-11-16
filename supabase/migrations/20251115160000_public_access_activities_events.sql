-- Migration pour permettre l'accès public (anonyme) aux activités et événements
-- Permet aux utilisateurs non connectés de consulter les activités et actualités

-- ============================================
-- ACTIVITÉS : Accès public en lecture
-- ============================================

-- Politique pour permettre aux utilisateurs anonymes de voir les activités publiées
CREATE POLICY "Activities visible to anonymous users" ON public.activities
  FOR SELECT TO anon
  USING (published = true);

-- ============================================
-- CRÉNEAUX (availability_slots) : Accès public
-- ============================================

-- Politique pour permettre aux utilisateurs anonymes de voir les créneaux
CREATE POLICY "Slots visible to anonymous users" ON public.availability_slots
  FOR SELECT TO anon
  USING (true);

-- ============================================
-- STRUCTURES : Accès public en lecture
-- ============================================

-- Politique pour permettre aux utilisateurs anonymes de voir les structures
CREATE POLICY "Structures visible to anonymous users" ON public.structures
  FOR SELECT TO anon
  USING (true);

-- ============================================
-- ÉVÉNEMENTS TERRITORIAUX : Accès public
-- ============================================

-- Vérifier si la table territory_events existe et a RLS activé
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'territory_events'
  ) THEN
    -- Activer RLS si pas déjà fait
    EXECUTE 'ALTER TABLE public.territory_events ENABLE ROW LEVEL SECURITY';

    -- Créer politique pour les utilisateurs authentifiés
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
      AND tablename = 'territory_events'
      AND policyname = 'Territory events visible to authenticated users'
    ) THEN
      EXECUTE 'CREATE POLICY "Territory events visible to authenticated users"
                ON public.territory_events
                FOR SELECT TO authenticated
                USING (published = true)';
    END IF;

    -- Créer politique pour les utilisateurs anonymes
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
      AND tablename = 'territory_events'
      AND policyname = 'Territory events visible to anonymous users'
    ) THEN
      EXECUTE 'CREATE POLICY "Territory events visible to anonymous users"
                ON public.territory_events
                FOR SELECT TO anon
                USING (published = true)';
    END IF;
  END IF;
END $$;

-- ============================================
-- COMMENTAIRES
-- ============================================

COMMENT ON POLICY "Activities visible to anonymous users" ON public.activities IS
  'Permet aux visiteurs non connectés de consulter les activités publiées pour les découvrir avant inscription';

COMMENT ON POLICY "Slots visible to anonymous users" ON public.availability_slots IS
  'Permet aux visiteurs non connectés de voir les créneaux disponibles';

COMMENT ON POLICY "Structures visible to anonymous users" ON public.structures IS
  'Permet aux visiteurs non connectés de voir les informations des structures organisatrices';
