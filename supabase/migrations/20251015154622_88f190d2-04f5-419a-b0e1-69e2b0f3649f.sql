-- ==============================================
-- ENRICHISSEMENT TABLE PROFILES
-- ==============================================

-- Ajout colonnes profil famille
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS quotient_familial NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS marital_status TEXT CHECK (marital_status IN ('single', 'couple', 'divorced', 'widowed'));

-- Index pour matching rapide
CREATE INDEX IF NOT EXISTS idx_profiles_postal_territory ON public.profiles(postal_code, territory_id);
CREATE INDEX IF NOT EXISTS idx_profiles_qf ON public.profiles(quotient_familial) WHERE quotient_familial IS NOT NULL;

-- Trigger auto-détection territoire depuis code postal
CREATE OR REPLACE FUNCTION public.auto_detect_territory()
RETURNS TRIGGER AS $$
BEGIN
  -- Si code postal renseigné, trouver commune correspondante
  IF NEW.postal_code IS NOT NULL THEN
    SELECT t.id INTO NEW.territory_id
    FROM public.territories t
    WHERE NEW.postal_code = ANY(t.postal_codes)
      AND t.type = 'commune'
      AND t.active = TRUE
    LIMIT 1;
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_profiles_auto_territory ON public.profiles;
CREATE TRIGGER trg_profiles_auto_territory
BEFORE INSERT OR UPDATE OF postal_code ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.auto_detect_territory();

-- Vue complétude profil
CREATE OR REPLACE VIEW public.v_profile_completion AS
SELECT 
  p.id,
  p.email,
  p.postal_code IS NOT NULL as has_postal_code,
  p.quotient_familial IS NOT NULL as has_qf,
  p.marital_status IS NOT NULL as has_marital_status,
  p.territory_id IS NOT NULL as has_territory,
  COUNT(c.id) > 0 as has_children,
  CASE 
    WHEN p.postal_code IS NULL THEN 'incomplete'
    WHEN p.quotient_familial IS NULL THEN 'partial'
    WHEN COUNT(c.id) = 0 THEN 'partial'
    ELSE 'complete'
  END as completion_status,
  CASE 
    WHEN p.postal_code IS NULL THEN 'Ajoutez votre code postal'
    WHEN p.quotient_familial IS NULL THEN 'Renseignez votre quotient familial pour voir les aides'
    WHEN COUNT(c.id) = 0 THEN 'Ajoutez au moins un enfant'
    ELSE 'Profil complet'
  END as completion_message
FROM public.profiles p
LEFT JOIN public.children c ON c.user_id = p.id
GROUP BY p.id, p.email, p.postal_code, p.quotient_familial, p.marital_status, p.territory_id;

-- ==============================================
-- ENRICHISSEMENT TABLE CHILDREN
-- ==============================================

-- Ajout colonnes enfant
ALTER TABLE public.children
  ADD COLUMN IF NOT EXISTS is_student BOOLEAN DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS education_level TEXT CHECK (education_level IN ('primary', 'middle_school', 'high_school', 'apprenticeship', 'higher_education')),
  ADD COLUMN IF NOT EXISTS school_postal_code TEXT;

-- Fonction calcul âge automatique
CREATE OR REPLACE FUNCTION public.get_child_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM AGE(birth_date))::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Vue enfants avec âge calculé
CREATE OR REPLACE VIEW public.v_children_with_age AS
SELECT 
  c.*,
  public.get_child_age(c.dob) as age,
  CASE 
    WHEN public.get_child_age(c.dob) >= 11 AND c.is_student IS NULL 
    THEN 'Précisez si scolarisé pour voir aides supplémentaires'
    ELSE NULL
  END as student_status_hint
FROM public.children c;

-- ==============================================
-- SIMPLIFICATION TABLE FINANCIAL_AIDS
-- ==============================================

-- Supprimer documents_required, ajouter eligibility_summary et verification_notes
ALTER TABLE public.financial_aids 
  DROP COLUMN IF EXISTS documents_required,
  ADD COLUMN IF NOT EXISTS eligibility_summary TEXT,
  ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Mise à jour exemples d'aides existantes
UPDATE public.financial_aids SET
  eligibility_summary = 'Enfant 6-18 ans, quotient familial ≤ 1200€',
  verification_notes = 'Documents à présenter au club: attestation CAF/MSA, pièce d''identité'
WHERE slug = 'pass-sport';

UPDATE public.financial_aids SET
  eligibility_summary = 'Famille stéphanoise, enfants 4-17 ans, quotient familial ≤ 750€',
  verification_notes = 'À vérifier avec le CCAS: avis imposition, attestation QF, justificatif domicile 6 mois, livret famille'
WHERE slug = 'bourse-municipale-ccas';