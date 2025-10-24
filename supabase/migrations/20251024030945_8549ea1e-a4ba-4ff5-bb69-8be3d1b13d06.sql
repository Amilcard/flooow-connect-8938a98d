-- Table de référence pour les Quartiers Prioritaires de la Ville (QPV)
-- Source : données géographiques prioritaires de la politique de la ville
CREATE TABLE IF NOT EXISTS public.qpv_reference (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_qp TEXT NOT NULL UNIQUE, -- Code quartier prioritaire
  nom_qp TEXT NOT NULL, -- Nom du quartier
  commune_qp TEXT NOT NULL, -- Nom de la commune
  code_insee TEXT NOT NULL, -- Code INSEE de la commune (5 caractères)
  departement TEXT, -- Code département
  region TEXT, -- Nom de la région
  population INTEGER, -- Population estimée du QPV
  metadata JSONB DEFAULT '{}'::jsonb, -- Métadonnées supplémentaires
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour performance sur code_insee (utilisé pour jointure avec profiles)
CREATE INDEX IF NOT EXISTS idx_qpv_code_insee ON public.qpv_reference(code_insee);
CREATE INDEX IF NOT EXISTS idx_qpv_code_qp ON public.qpv_reference(code_qp);

-- Enable RLS
ALTER TABLE public.qpv_reference ENABLE ROW LEVEL SECURITY;

-- Policy : référentiel visible par tous les utilisateurs authentifiés
CREATE POLICY "QPV reference visible to all authenticated users"
  ON public.qpv_reference
  FOR SELECT
  USING (true);

-- Policy : seuls les admins peuvent gérer le référentiel
CREATE POLICY "Only admins can manage QPV reference"
  ON public.qpv_reference
  FOR ALL
  USING (
    has_role(auth.uid(), 'superadmin'::app_role) OR 
    has_role(auth.uid(), 'territory_admin'::app_role)
  );

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_qpv_reference_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_qpv_reference_updated_at
  BEFORE UPDATE ON public.qpv_reference
  FOR EACH ROW
  EXECUTE FUNCTION update_qpv_reference_updated_at();

-- Commentaires pour documentation
COMMENT ON TABLE public.qpv_reference IS 'Référentiel national des Quartiers Prioritaires de la Ville (QPV) pour calcul du % QPV';
COMMENT ON COLUMN public.qpv_reference.code_insee IS 'Code INSEE de la commune (5 caractères) - clé de jointure avec profiles.city_insee';