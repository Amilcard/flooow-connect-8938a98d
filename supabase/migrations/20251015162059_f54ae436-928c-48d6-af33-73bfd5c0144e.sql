-- Corriger les vues pour utiliser security_invoker au lieu de security_definer
-- Cela assure que les vues respectent les politiques RLS

-- Vue 1: v_profile_completion
DROP VIEW IF EXISTS public.v_profile_completion;
CREATE OR REPLACE VIEW public.v_profile_completion
WITH (security_invoker=on)
AS
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

-- Vue 2: v_children_with_age
DROP VIEW IF EXISTS public.v_children_with_age;
CREATE OR REPLACE VIEW public.v_children_with_age
WITH (security_invoker=on)
AS
SELECT 
  c.*,
  public.get_child_age(c.dob) as age,
  CASE 
    WHEN public.get_child_age(c.dob) >= 11 AND c.is_student IS NULL 
    THEN 'Précisez si scolarisé pour voir aides supplémentaires'
    ELSE NULL
  END as student_status_hint
FROM public.children c;

-- Commentaires pour documenter le changement
COMMENT ON VIEW public.v_profile_completion IS 'Vue avec security_invoker pour respecter les politiques RLS';
COMMENT ON VIEW public.v_children_with_age IS 'Vue avec security_invoker pour respecter les politiques RLS';