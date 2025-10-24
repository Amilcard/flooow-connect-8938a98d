-- Migration: Gestion complète des QPV avec codes postaux
-- Ajout des codes postaux à qpv_reference et mise à jour des données

-- 1. Ajouter colonne postal_codes à qpv_reference
ALTER TABLE public.qpv_reference 
ADD COLUMN IF NOT EXISTS postal_codes TEXT[] DEFAULT '{}';

-- 2. Ajouter colonne street_address à profiles pour adresse de rue
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS street_address TEXT;

-- 3. Supprimer anciennes données QPV
DELETE FROM public.qpv_reference;

-- 4. Insérer les 20 quartiers prioritaires avec codes postaux
INSERT INTO public.qpv_reference (code_qp, nom_qp, commune_qp, code_insee, departement, region, postal_codes, population) VALUES
-- Saint-Étienne (multiple quartiers)
('QP042001', 'Cotonne Montferré', 'Saint-Étienne', '42218', 'Loire', 'Auvergne-Rhône-Alpes', ARRAY['42100', '42000'], NULL),
('QP042002', 'Crêt De Roc - Soleil', 'Saint-Étienne', '42218', 'Loire', 'Auvergne-Rhône-Alpes', ARRAY['42100', '42000'], NULL),
('QP042003', 'Grand Clos', 'Saint-Étienne', '42218', 'Loire', 'Auvergne-Rhône-Alpes', ARRAY['42100', '42000'], NULL),
('QP042004', 'Monthieu', 'Saint-Étienne', '42218', 'Loire', 'Auvergne-Rhône-Alpes', ARRAY['42100', '42000'], NULL),
('QP042005', 'Montreynaud', 'Saint-Étienne', '42218', 'Loire', 'Auvergne-Rhône-Alpes', ARRAY['42100', '42000'], NULL),
('QP042006', 'Quartiers Sud-Est', 'Saint-Étienne', '42218', 'Loire', 'Auvergne-Rhône-Alpes', ARRAY['42100', '42000'], NULL),
('QP042007', 'Solaure', 'Saint-Étienne', '42218', 'Loire', 'Auvergne-Rhône-Alpes', ARRAY['42100', '42000'], NULL),
('QP042008', 'Tardy Tarentaize Beaubrun Couriot', 'Saint-Étienne', '42218', 'Loire', 'Auvergne-Rhône-Alpes', ARRAY['42100', '42000'], NULL),
('QP042009', 'Terrenoire', 'Saint-Étienne', '42218', 'Loire', 'Auvergne-Rhône-Alpes', ARRAY['42100', '42000'], NULL),

-- Firminy
('QP042010', 'Firminy Vert', 'Firminy', '42095', 'Loire', 'Auvergne-Rhône-Alpes', ARRAY['42700'], NULL),
('QP042011', 'Layat Bas-Mas', 'Firminy', '42095', 'Loire', 'Auvergne-Rhône-Alpes', ARRAY['42700'], NULL),

-- Saint-Chamond
('QP042012', 'Centre Ville', 'Saint-Chamond', '42207', 'Loire', 'Auvergne-Rhône-Alpes', ARRAY['42400'], NULL),
('QP042013', 'St Julien - Crêt De L''Oeillet', 'Saint-Chamond', '42207', 'Loire', 'Auvergne-Rhône-Alpes', ARRAY['42400'], NULL),

-- Rive-de-Gier
('QP042014', 'Centre Ville', 'Rive-de-Gier', '42186', 'Loire', 'Auvergne-Rhône-Alpes', ARRAY['42800'], NULL),
('QP042015', 'Grand Pont', 'Rive-de-Gier', '42186', 'Loire', 'Auvergne-Rhône-Alpes', ARRAY['42800'], NULL),

-- Autres communes
('QP042016', 'La Chapelle', 'Andrézieux-Bouthéon', '42005', 'Loire', 'Auvergne-Rhône-Alpes', ARRAY['42160'], NULL),
('QP042017', 'La Romière', 'Le Chambon-Feugerolles', '42044', 'Loire', 'Auvergne-Rhône-Alpes', ARRAY['42500'], NULL),
('QP042018', 'Montcel - Centre Ville', 'La Ricamarie', '42183', 'Loire', 'Auvergne-Rhône-Alpes', ARRAY['42150'], NULL),
('QP042019', 'Montrambert Méline', 'La Ricamarie / Le Chambon-Feugerolles', '42183', 'Loire', 'Auvergne-Rhône-Alpes', ARRAY['42150', '42500'], NULL),
('QP042020', 'Le Dorlay - Les Pins - La Bachasse', 'La Grand-Croix / Saint-Paul-en-Jarez', '42105', 'Loire', 'Auvergne-Rhône-Alpes', ARRAY['42320', '42740'], NULL);

-- 5. Créer fonction pour vérifier si un profil est en QPV
CREATE OR REPLACE FUNCTION public.is_profile_in_qpv(p_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_postal_code TEXT;
  v_is_qpv BOOLEAN;
BEGIN
  -- Récupérer le code postal du profil
  SELECT postal_code INTO v_postal_code
  FROM public.profiles
  WHERE id = p_profile_id;
  
  -- Si pas de code postal, retourner false
  IF v_postal_code IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Vérifier si le code postal correspond à un QPV
  SELECT EXISTS (
    SELECT 1 
    FROM public.qpv_reference 
    WHERE v_postal_code = ANY(postal_codes)
  ) INTO v_is_qpv;
  
  RETURN v_is_qpv;
END;
$$;

-- 6. Créer vue pour statistiques QPV
CREATE OR REPLACE VIEW public.v_qpv_stats AS
SELECT 
  COUNT(DISTINCT p.id) as total_profiles,
  COUNT(DISTINCT CASE WHEN public.is_profile_in_qpv(p.id) THEN p.id END) as qpv_profiles,
  CASE 
    WHEN COUNT(DISTINCT p.id) > 0 THEN
      ROUND((COUNT(DISTINCT CASE WHEN public.is_profile_in_qpv(p.id) THEN p.id END)::numeric / COUNT(DISTINCT p.id)::numeric) * 100, 1)
    ELSE 0
  END as qpv_percentage
FROM public.profiles p
WHERE p.account_status = 'validated';

-- Log final
SELECT 'QPV configuration terminée: ' || COUNT(*) || ' quartiers prioritaires importés' 
FROM qpv_reference;