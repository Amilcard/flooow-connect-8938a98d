-- Create financial_aids table
CREATE TABLE public.financial_aids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  age_min INTEGER NOT NULL,
  age_max INTEGER NOT NULL,
  amount_type TEXT NOT NULL CHECK (amount_type IN ('fixed', 'per_day')),
  amount_value NUMERIC NOT NULL,
  qf_max INTEGER,
  territory_level TEXT NOT NULL CHECK (territory_level IN ('national', 'region', 'metropole', 'commune')),
  territory_codes TEXT[] NOT NULL DEFAULT '{}',
  categories TEXT[] NOT NULL DEFAULT '{}',
  cumulative BOOLEAN NOT NULL DEFAULT true,
  official_link TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_financial_aids_age ON public.financial_aids(age_min, age_max);
CREATE INDEX idx_financial_aids_territory_codes ON public.financial_aids USING GIN(territory_codes);
CREATE INDEX idx_financial_aids_categories ON public.financial_aids USING GIN(categories);
CREATE INDEX idx_financial_aids_active ON public.financial_aids(active) WHERE active = true;

-- Enable RLS
ALTER TABLE public.financial_aids ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Financial aids visible to all authenticated users"
ON public.financial_aids
FOR SELECT
USING (active = true);

CREATE POLICY "Only admins can manage financial aids"
ON public.financial_aids
FOR ALL
USING (has_role(auth.uid(), 'superadmin') OR has_role(auth.uid(), 'territory_admin'))
WITH CHECK (has_role(auth.uid(), 'superadmin') OR has_role(auth.uid(), 'territory_admin'));

-- Add updated_at trigger
CREATE TRIGGER update_financial_aids_updated_at
BEFORE UPDATE ON public.financial_aids
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert 8 financial aids
INSERT INTO public.financial_aids 
(name, slug, age_min, age_max, amount_type, amount_value, qf_max, territory_level, territory_codes, categories, cumulative, official_link, active)
VALUES
-- 1. Pass Culture Activités
('Pass Culture Activités', 'pass-culture-activites', 6, 17, 'fixed', 40, NULL, 'national', ARRAY['FR'], ARRAY['culture', 'loisirs'], true, 'https://pass.culture.fr', true),

-- 2. Pass'Sport
('Pass''Sport', 'pass-sport', 6, 17, 'fixed', 50, 1200, 'national', ARRAY['FR'], ARRAY['sport'], true, 'https://www.sports.gouv.fr/pass-sport', true),

-- 3. Chèques Vacances
('Chèques Vacances', 'cheques-vacances', 6, 17, 'fixed', 50, NULL, 'national', ARRAY['FR'], ARRAY['vacances', 'loisirs'], true, 'https://www.ancv.com', true),

-- 4. Bons Vacances CAF
('Bons Vacances CAF', 'bons-vacances-caf', 6, 17, 'per_day', 2, 600, 'national', ARRAY['FR'], ARRAY['vacances'], true, 'https://www.caf.fr', true),

-- 5. Pass'Région AURA
('Pass''Région Auvergne-Rhône-Alpes', 'pass-region-aura', 15, 18, 'fixed', 20, NULL, 'region', ARRAY['84'], ARRAY['culture', 'sport'], true, 'https://www.auvergnerhonealpes.fr', true),

-- 6. Carte M'RA
('Carte M''RA - Métropole Saint-Étienne', 'carte-mra-saint-etienne', 6, 17, 'fixed', 21, NULL, 'metropole', ARRAY['200071108'], ARRAY['sport', 'culture', 'loisirs'], true, 'https://www.saint-etienne-metropole.fr', true),

-- 7. CCAS Saint-Étienne
('Aide CCAS Saint-Étienne', 'ccas-saint-etienne', 6, 17, 'fixed', 12, 300, 'commune', ARRAY['42218'], ARRAY['sport', 'culture', 'loisirs', 'vacances'], true, 'https://www.saint-etienne.fr', true),

-- 8. CCAS Firminy/Ricamarie
('Aide CCAS Firminy/Ricamarie', 'ccas-firminy-ricamarie', 6, 17, 'fixed', 12, 300, 'commune', ARRAY['42095', '42184'], ARRAY['sport', 'culture', 'loisirs', 'vacances'], true, NULL, true);