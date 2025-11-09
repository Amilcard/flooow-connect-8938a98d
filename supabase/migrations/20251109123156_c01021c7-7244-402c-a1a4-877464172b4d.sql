-- Ajouter les champs price_unit et vacation_type pour clarifier le type d'accueil
ALTER TABLE public.activities
ADD COLUMN IF NOT EXISTS price_unit TEXT,
ADD COLUMN IF NOT EXISTS vacation_type TEXT,
ADD COLUMN IF NOT EXISTS duration_days INTEGER,
ADD COLUMN IF NOT EXISTS has_accommodation BOOLEAN DEFAULT false;

-- Mettre à jour les activités existantes selon leur type
-- Séjours avec hébergement (prix ≥ 470€)
UPDATE public.activities
SET 
  price_unit = 'par semaine de séjour',
  vacation_type = 'sejour_hebergement',
  has_accommodation = true,
  duration_days = 7
WHERE period_type = 'school_holidays' 
  AND price_base >= 470
  AND vacation_periods IS NOT NULL;

-- Stages courts sans hébergement (prix 50-200€, vacances)
UPDATE public.activities
SET 
  price_unit = 'par stage',
  vacation_type = 'stage_journee',
  has_accommodation = false,
  duration_days = 5
WHERE period_type = 'school_holidays' 
  AND price_base BETWEEN 50 AND 200
  AND vacation_periods IS NOT NULL
  AND price_unit IS NULL;

-- Centres de loisirs (prix < 50€, vacances)
UPDATE public.activities
SET 
  price_unit = 'par journée',
  vacation_type = 'centre_loisirs',
  has_accommodation = false,
  duration_days = 1
WHERE period_type = 'school_holidays' 
  AND price_base < 50
  AND vacation_periods IS NOT NULL
  AND price_unit IS NULL;

-- Activités annuelles (trimestre ou année)
UPDATE public.activities
SET 
  price_unit = CASE 
    WHEN period_type = 'trimester' THEN 'par trimestre'
    ELSE 'par an'
  END,
  vacation_type = NULL,
  has_accommodation = false
WHERE period_type IN ('annual', 'trimester')
  AND price_unit IS NULL;

-- Corriger le "Stage Football Été" qui était mal catégorisé
UPDATE public.activities
SET 
  period_type = 'school_holidays',
  price_unit = 'par stage',
  vacation_type = 'stage_journee',
  has_accommodation = false,
  duration_days = 5,
  vacation_periods = ARRAY['été_2026']::text[]
WHERE title LIKE '%Stage%'
  AND period_type = 'annual'
  AND price_base < 300;