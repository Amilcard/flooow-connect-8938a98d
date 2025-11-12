
-- Migration C: Créer la table postal_codes avec 64 codes postaux

CREATE TABLE IF NOT EXISTS postal_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  territory_id UUID REFERENCES territories(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE postal_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Visible par tous
CREATE POLICY "postal_codes_visible_all" ON postal_codes
  FOR SELECT USING (true);

-- RLS Policy: Admins peuvent gérer
CREATE POLICY "admins_manage_postal_codes" ON postal_codes
  FOR ALL USING (
    has_role(auth.uid(), 'superadmin'::app_role) 
    OR has_role(auth.uid(), 'territory_admin'::app_role)
  );

-- Insérer les codes postaux pour Paris (75001-75020)
INSERT INTO postal_codes (code, city, territory_id) VALUES
  ('75001', 'Paris', '11111111-1111-1111-1111-111111111111'),
  ('75002', 'Paris', '11111111-1111-1111-1111-111111111111'),
  ('75003', 'Paris', '11111111-1111-1111-1111-111111111111'),
  ('75004', 'Paris', '11111111-1111-1111-1111-111111111111'),
  ('75005', 'Paris', '11111111-1111-1111-1111-111111111111'),
  ('75006', 'Paris', '11111111-1111-1111-1111-111111111111'),
  ('75007', 'Paris', '11111111-1111-1111-1111-111111111111'),
  ('75008', 'Paris', '11111111-1111-1111-1111-111111111111'),
  ('75009', 'Paris', '11111111-1111-1111-1111-111111111111'),
  ('75010', 'Paris', '11111111-1111-1111-1111-111111111111'),
  ('75011', 'Paris', '11111111-1111-1111-1111-111111111111'),
  ('75012', 'Paris', '11111111-1111-1111-1111-111111111111'),
  ('75013', 'Paris', '11111111-1111-1111-1111-111111111111'),
  ('75014', 'Paris', '11111111-1111-1111-1111-111111111111'),
  ('75015', 'Paris', '11111111-1111-1111-1111-111111111111'),
  ('75016', 'Paris', '11111111-1111-1111-1111-111111111111'),
  ('75017', 'Paris', '11111111-1111-1111-1111-111111111111'),
  ('75018', 'Paris', '11111111-1111-1111-1111-111111111111'),
  ('75019', 'Paris', '11111111-1111-1111-1111-111111111111'),
  ('75020', 'Paris', '11111111-1111-1111-1111-111111111111');

-- Insérer les codes postaux pour Lyon (69001-69009)
INSERT INTO postal_codes (code, city, territory_id) VALUES
  ('69001', 'Lyon', '11111111-1111-1111-1111-111111111112'),
  ('69002', 'Lyon', '11111111-1111-1111-1111-111111111112'),
  ('69003', 'Lyon', '11111111-1111-1111-1111-111111111112'),
  ('69004', 'Lyon', '11111111-1111-1111-1111-111111111112'),
  ('69005', 'Lyon', '11111111-1111-1111-1111-111111111112'),
  ('69006', 'Lyon', '11111111-1111-1111-1111-111111111112'),
  ('69007', 'Lyon', '11111111-1111-1111-1111-111111111112'),
  ('69008', 'Lyon', '11111111-1111-1111-1111-111111111112'),
  ('69009', 'Lyon', '11111111-1111-1111-1111-111111111112');

-- Insérer les codes postaux pour Marseille (13001-13016)
INSERT INTO postal_codes (code, city, territory_id) VALUES
  ('13001', 'Marseille', '11111111-1111-1111-1111-111111111113'),
  ('13002', 'Marseille', '11111111-1111-1111-1111-111111111113'),
  ('13003', 'Marseille', '11111111-1111-1111-1111-111111111113'),
  ('13004', 'Marseille', '11111111-1111-1111-1111-111111111113'),
  ('13005', 'Marseille', '11111111-1111-1111-1111-111111111113'),
  ('13006', 'Marseille', '11111111-1111-1111-1111-111111111113'),
  ('13007', 'Marseille', '11111111-1111-1111-1111-111111111113'),
  ('13008', 'Marseille', '11111111-1111-1111-1111-111111111113'),
  ('13009', 'Marseille', '11111111-1111-1111-1111-111111111113'),
  ('13010', 'Marseille', '11111111-1111-1111-1111-111111111113'),
  ('13011', 'Marseille', '11111111-1111-1111-1111-111111111113'),
  ('13012', 'Marseille', '11111111-1111-1111-1111-111111111113'),
  ('13013', 'Marseille', '11111111-1111-1111-1111-111111111113'),
  ('13014', 'Marseille', '11111111-1111-1111-1111-111111111113'),
  ('13015', 'Marseille', '11111111-1111-1111-1111-111111111113'),
  ('13016', 'Marseille', '11111111-1111-1111-1111-111111111113');

-- Insérer les codes postaux pour Toulouse (31000-31500, sélection)
INSERT INTO postal_codes (code, city, territory_id) VALUES
  ('31000', 'Toulouse', '11111111-1111-1111-1111-111111111114'),
  ('31100', 'Toulouse', '11111111-1111-1111-1111-111111111114'),
  ('31200', 'Toulouse', '11111111-1111-1111-1111-111111111114'),
  ('31300', 'Toulouse', '11111111-1111-1111-1111-111111111114'),
  ('31400', 'Toulouse', '11111111-1111-1111-1111-111111111114'),
  ('31500', 'Toulouse', '11111111-1111-1111-1111-111111111114');

-- Insérer les codes postaux pour Saint-Étienne (42000-42100)
INSERT INTO postal_codes (code, city, territory_id) VALUES
  ('42000', 'Saint-Étienne', '0d533821-5995-420c-90c8-aa2a5ba78e93'),
  ('42100', 'Saint-Étienne', '0d533821-5995-420c-90c8-aa2a5ba78e93'),
  ('42230', 'Roche-la-Molière', '0d533821-5995-420c-90c8-aa2a5ba78e93'),
  ('42270', 'Saint-Priest-en-Jarez', '0d533821-5995-420c-90c8-aa2a5ba78e93'),
  ('42340', 'Veauche', '0d533821-5995-420c-90c8-aa2a5ba78e93'),
  ('42400', 'Saint-Chamond', '0d533821-5995-420c-90c8-aa2a5ba78e93'),
  ('42500', 'Le Chambon-Feugerolles', '0d533821-5995-420c-90c8-aa2a5ba78e93'),
  ('42600', 'Montbrison', '0d533821-5995-420c-90c8-aa2a5ba78e93'),
  ('42700', 'Firminy', '0d533821-5995-420c-90c8-aa2a5ba78e93'),
  ('42800', 'Rive-de-Gier', '0d533821-5995-420c-90c8-aa2a5ba78e93'),
  ('42290', 'Sorbiers', '0d533821-5995-420c-90c8-aa2a5ba78e93'),
  ('42350', 'La Talaudière', '0d533821-5995-420c-90c8-aa2a5ba78e93'),
  ('42650', 'Saint-Jean-Bonnefonds', '0d533821-5995-420c-90c8-aa2a5ba78e93');

-- Total: 20 (Paris) + 9 (Lyon) + 16 (Marseille) + 6 (Toulouse) + 13 (Saint-Étienne) = 64 codes postaux

COMMENT ON TABLE postal_codes IS 'Table de référence des codes postaux associés aux territoires';
