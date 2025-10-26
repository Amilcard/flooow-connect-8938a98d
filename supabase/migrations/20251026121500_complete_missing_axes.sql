-- Migration: Finaliser 4 axes manquants (égalité F/G, non-recours admin, accompagnement parent, insertion pro)
-- Date: 2025-10-26

-- =============================================================================
-- AXE 4 : ÉGALITÉ FILLES/GARÇONS (10% → 100%)
-- =============================================================================

-- 4A. Ajouter colonne sexe structurée sur children (sortir de needs_json)
ALTER TABLE public.children
ADD COLUMN IF NOT EXISTS sexe TEXT CHECK (sexe IN ('F', 'M', 'X'));

COMMENT ON COLUMN public.children.sexe IS
'Sexe de l''enfant: F (fille), M (garçon), X (non-binaire/autre)';

-- Migrer données existantes depuis needs_json vers colonne dédiée
UPDATE public.children
SET sexe = CASE
  WHEN needs_json->>'gender' = 'F' THEN 'F'
  WHEN needs_json->>'gender' = 'M' THEN 'M'
  WHEN needs_json->>'gender' IN ('female', 'fille') THEN 'F'
  WHEN needs_json->>'gender' IN ('male', 'garçon') THEN 'M'
  ELSE NULL
END
WHERE sexe IS NULL AND needs_json->>'gender' IS NOT NULL;

-- 4B. Ajouter stats mixité sur activities (calculé périodiquement par trigger ou job)
ALTER TABLE public.activities
ADD COLUMN IF NOT EXISTS taux_filles_inscrites NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS stats_mixite_updated_at TIMESTAMPTZ;

COMMENT ON COLUMN public.activities.taux_filles_inscrites IS
'Pourcentage de filles inscrites (0.00 à 100.00). NULL = pas encore calculé';

COMMENT ON COLUMN public.activities.stats_mixite_updated_at IS
'Dernière mise à jour des stats de mixité';

-- Vue pour stats mixité temps réel
CREATE OR REPLACE VIEW public.v_mixite_activities AS
SELECT
  a.id as activity_id,
  a.title,
  a.category,
  COUNT(DISTINCT b.child_id) as total_inscrits,
  COUNT(DISTINCT b.child_id) FILTER (WHERE c.sexe = 'F') as nb_filles,
  COUNT(DISTINCT b.child_id) FILTER (WHERE c.sexe = 'M') as nb_garcons,
  CASE
    WHEN COUNT(DISTINCT b.child_id) > 0 THEN
      ROUND((COUNT(DISTINCT b.child_id) FILTER (WHERE c.sexe = 'F')::numeric / COUNT(DISTINCT b.child_id)::numeric) * 100, 2)
    ELSE NULL
  END as taux_filles_pct,
  CASE
    WHEN COUNT(DISTINCT b.child_id) FILTER (WHERE c.sexe = 'F') = 0 THEN 'garcons_only'
    WHEN COUNT(DISTINCT b.child_id) FILTER (WHERE c.sexe = 'M') = 0 THEN 'filles_only'
    WHEN ABS(COUNT(DISTINCT b.child_id) FILTER (WHERE c.sexe = 'F')::numeric - COUNT(DISTINCT b.child_id) FILTER (WHERE c.sexe = 'M')::numeric) <= 2 THEN 'equilibre'
    ELSE 'desequilibre'
  END as statut_mixite
FROM public.activities a
LEFT JOIN public.bookings b ON b.activity_id = a.id AND b.status != 'annule'
LEFT JOIN public.children c ON c.id = b.child_id
WHERE a.published = true
GROUP BY a.id, a.title, a.category;

COMMENT ON VIEW public.v_mixite_activities IS
'Statistiques temps réel sur la mixité filles/garçons par activité';

-- Fonction pour rafraîchir les stats mixité (à appeler périodiquement)
CREATE OR REPLACE FUNCTION public.refresh_mixite_stats()
RETURNS void AS $$
BEGIN
  UPDATE public.activities a
  SET
    taux_filles_inscrites = vm.taux_filles_pct,
    stats_mixite_updated_at = NOW()
  FROM public.v_mixite_activities vm
  WHERE a.id = vm.activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.refresh_mixite_stats IS
'Rafraîchit les stats de mixité sur toutes les activités (à appeler quotidiennement)';


-- =============================================================================
-- AXE 8 : NON-RECOURS ADMINISTRATIF (5% → 100%)
-- =============================================================================

-- 8A. Score de complexité administrative sur activities
ALTER TABLE public.activities
ADD COLUMN IF NOT EXISTS complexity_score INTEGER CHECK (complexity_score BETWEEN 1 AND 5);

COMMENT ON COLUMN public.activities.complexity_score IS
'Score de complexité administrative (1=très simple, 5=très complexe). Basé sur nb documents, délais, démarches';

-- Calculer automatiquement le score basé sur documents requis
UPDATE public.activities
SET complexity_score = CASE
  WHEN documents_required IS NULL OR jsonb_array_length(documents_required) = 0 THEN 1
  WHEN jsonb_array_length(documents_required) <= 2 THEN 2
  WHEN jsonb_array_length(documents_required) <= 4 THEN 3
  WHEN jsonb_array_length(documents_required) <= 6 THEN 4
  ELSE 5
END
WHERE complexity_score IS NULL;

-- 8B. Raison d'abandon étendue sur bookings
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS abandon_raison TEXT CHECK (abandon_raison IN ('finance', 'admin', 'mobilite', 'autre', NULL));

COMMENT ON COLUMN public.bookings.abandon_raison IS
'Raison abandon/annulation: finance (trop cher), admin (paperasse), mobilite (transport), autre';

-- 8C. Tracker les dossiers incomplets
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS documents_status JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS documents_incomplete BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.bookings.documents_status IS
'Statut de chaque document requis: {certificat_medical: "valide", autorisation: "manquant"}';

COMMENT ON COLUMN public.bookings.documents_incomplete IS
'True si au moins un document obligatoire manque après 7 jours';

-- Vue stats non-recours administratif
CREATE OR REPLACE VIEW public.v_non_recours_admin AS
SELECT
  COUNT(*) FILTER (WHERE a.complexity_score >= 4) as activites_complexes,
  COUNT(DISTINCT b.id) FILTER (WHERE b.abandon_raison = 'admin') as abandons_admin,
  COUNT(DISTINCT b.id) FILTER (WHERE b.documents_incomplete = true) as dossiers_incomplets,
  AVG(a.complexity_score) as complexity_moyenne
FROM public.activities a
LEFT JOIN public.bookings b ON b.activity_id = a.id;

COMMENT ON VIEW public.v_non_recours_admin IS
'Statistiques sur le non-recours pour raisons administratives';


-- =============================================================================
-- AXE 9 : ACCOMPAGNEMENT PARENT (5% → 100%)
-- =============================================================================

-- 9A. Besoin d'accompagnement sur profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS besoin_accompagnement BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS accompagnement_demande_le TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS conseiller_assigne_id UUID REFERENCES public.profiles(id);

COMMENT ON COLUMN public.profiles.besoin_accompagnement IS
'Parent a demandé un accompagnement personnalisé pour l''inscription';

COMMENT ON COLUMN public.profiles.accompagnement_demande_le IS
'Date de la demande d''accompagnement';

COMMENT ON COLUMN public.profiles.conseiller_assigne_id IS
'Conseiller territorial assigné pour accompagner cette famille';

-- 9B. Historique des accompagnements
CREATE TABLE IF NOT EXISTS public.accompagnements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  conseiller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type_accompagnement TEXT CHECK (type_accompagnement IN ('phone', 'visio', 'presentiel', 'email')) NOT NULL,
  date_rdv TIMESTAMPTZ,
  statut TEXT CHECK (statut IN ('planifie', 'realise', 'annule')) DEFAULT 'planifie',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.accompagnements IS
'Historique des accompagnements personnalisés (RDV, appels, emails)';

-- RLS sur accompagnements
ALTER TABLE public.accompagnements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own accompagnements"
ON public.accompagnements FOR SELECT
USING (profile_id = auth.uid() OR conseiller_id = auth.uid());

CREATE POLICY "Conseillers can manage accompagnements"
ON public.accompagnements FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (role = 'superadmin' OR role = 'collectivite_admin')
  )
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_profiles_accompagnement
ON public.profiles(besoin_accompagnement)
WHERE besoin_accompagnement = true;

CREATE INDEX IF NOT EXISTS idx_accompagnements_profile
ON public.accompagnements(profile_id, statut);


-- =============================================================================
-- AXE 10 : INSERTION PROFESSIONNELLE 15-25 ANS (0% → 100%)
-- =============================================================================

-- 10A. Flags insertion pro sur activities
ALTER TABLE public.activities
ADD COLUMN IF NOT EXISTS is_insertion_pro BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS insertion_type TEXT CHECK (insertion_type IN ('BAFA', 'BAFD', 'stage_decouverte', 'job_ete', 'formation_metier', 'benevolat', NULL));

COMMENT ON COLUMN public.activities.is_insertion_pro IS
'Activité orientée insertion professionnelle jeunes 15-25 ans';

COMMENT ON COLUMN public.activities.insertion_type IS
'Type d''insertion: BAFA/BAFD (animation), stage_decouverte, job_ete, formation_metier, benevolat';

-- 10B. Ajouter tranche d'âge "jeunes adultes" aux activités existantes éligibles
UPDATE public.activities
SET is_insertion_pro = true,
    insertion_type = 'stage_decouverte'
WHERE is_insertion_pro = false
  AND age_max >= 16
  AND (
    description ILIKE '%stage%'
    OR description ILIKE '%découverte métier%'
    OR tags && ARRAY['stage', 'découverte', 'orientation']
  );

-- 10C. Vue activités insertion pro
CREATE OR REPLACE VIEW public.v_insertion_pro_activities AS
SELECT
  a.id,
  a.title,
  a.insertion_type,
  a.age_min,
  a.age_max,
  a.price_base,
  a.description,
  s.name as structure_name,
  s.address,
  COUNT(DISTINCT b.id) as nb_jeunes_inscrits
FROM public.activities a
INNER JOIN public.structures s ON s.id = a.structure_id
LEFT JOIN public.bookings b ON b.activity_id = a.id AND b.status != 'annule'
WHERE a.is_insertion_pro = true
  AND a.published = true
GROUP BY a.id, a.title, a.insertion_type, a.age_min, a.age_max, a.price_base, a.description, s.name, s.address
ORDER BY a.insertion_type, a.title;

COMMENT ON VIEW public.v_insertion_pro_activities IS
'Activités dédiées à l''insertion professionnelle des 15-25 ans';

-- Index pour filtres insertion pro
CREATE INDEX IF NOT EXISTS idx_activities_insertion_pro
ON public.activities(is_insertion_pro, insertion_type)
WHERE is_insertion_pro = true;


-- =============================================================================
-- Vue globale : dashboard KPIs pour les 4 nouveaux axes
-- =============================================================================

CREATE OR REPLACE VIEW public.v_kpis_nouveaux_axes AS
SELECT
  -- Axe 4: Égalité F/G
  (SELECT COUNT(*) FROM public.v_mixite_activities WHERE statut_mixite = 'equilibre') as activites_mixtes_equilibrees,
  (SELECT COUNT(*) FROM public.v_mixite_activities WHERE statut_mixite = 'desequilibre') as activites_desequilibrees,
  (SELECT AVG(taux_filles_pct) FROM public.v_mixite_activities WHERE taux_filles_pct IS NOT NULL) as taux_filles_moyen,

  -- Axe 8: Non-recours admin
  (SELECT COUNT(*) FROM public.activities WHERE complexity_score >= 4) as activites_complexes,
  (SELECT COUNT(*) FROM public.bookings WHERE abandon_raison = 'admin') as abandons_admin,
  (SELECT COUNT(*) FROM public.bookings WHERE documents_incomplete = true) as dossiers_incomplets,

  -- Axe 9: Accompagnement parent
  (SELECT COUNT(*) FROM public.profiles WHERE besoin_accompagnement = true) as familles_accompagnement,
  (SELECT COUNT(*) FROM public.accompagnements WHERE statut = 'realise') as accompagnements_realises,
  (SELECT COUNT(*) FROM public.accompagnements WHERE statut = 'planifie') as accompagnements_a_venir,

  -- Axe 10: Insertion pro 15-25
  (SELECT COUNT(*) FROM public.activities WHERE is_insertion_pro = true) as activites_insertion_pro,
  (SELECT COUNT(DISTINCT insertion_type) FROM public.activities WHERE is_insertion_pro = true) as types_insertion_disponibles,
  (SELECT COUNT(*) FROM public.v_insertion_pro_activities) as jeunes_15_25_inscrits;

COMMENT ON VIEW public.v_kpis_nouveaux_axes IS
'KPIs globaux pour les 4 nouveaux axes (mixité, admin, accompagnement, insertion pro)';


-- =============================================================================
-- Logs et validation
-- =============================================================================

DO $$
DECLARE
  v_children_sexe INTEGER;
  v_activities_insertion INTEGER;
  v_accompagnements INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_children_sexe FROM public.children WHERE sexe IS NOT NULL;
  SELECT COUNT(*) INTO v_activities_insertion FROM public.activities WHERE is_insertion_pro = true;
  SELECT COUNT(*) INTO v_accompagnements FROM public.profiles WHERE besoin_accompagnement = true;

  RAISE NOTICE '✅ Migration terminée:';
  RAISE NOTICE '  - % enfants avec sexe renseigné', v_children_sexe;
  RAISE NOTICE '  - % activités insertion pro identifiées', v_activities_insertion;
  RAISE NOTICE '  - % familles en accompagnement', v_accompagnements;
  RAISE NOTICE '  - Table accompagnements créée';
  RAISE NOTICE '  - Vues KPIs créées pour les 4 axes';
END $$;
