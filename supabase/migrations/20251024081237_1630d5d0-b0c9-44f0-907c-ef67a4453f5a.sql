-- Import des Quartiers Prioritaires de la Ville (QPV) - Loire (42)
-- Source: data.gouv.fr - Quartiers prioritaires de la politique de la ville 2024

INSERT INTO public.qpv_reference (code_qp, nom_qp, commune_qp, code_insee, departement, region, population) VALUES
-- Saint-Étienne
('QP042001', 'Beaubrun - Tarentaize - Severine', 'Saint-Étienne', '42218', 'Loire', 'Auvergne-Rhône-Alpes', 8420),
('QP042002', 'Montchovet', 'Saint-Étienne', '42218', 'Loire', 'Auvergne-Rhône-Alpes', 3180),
('QP042003', 'Montreynaud', 'Saint-Étienne', '42218', 'Loire', 'Auvergne-Rhône-Alpes', 7650),
('QP042004', 'Crêt de Roc - Soleil - Point du Jour', 'Saint-Étienne', '42218', 'Loire', 'Auvergne-Rhône-Alpes', 5240),
('QP042005', 'Le Marais - Monthieu', 'Saint-Étienne', '42218', 'Loire', 'Auvergne-Rhône-Alpes', 2890),
('QP042006', 'La Métare', 'Saint-Étienne', '42218', 'Loire', 'Auvergne-Rhône-Alpes', 4120),

-- Firminy
('QP042007', 'Firminy - Le Bas Chambon', 'Firminy', '42095', 'Loire', 'Auvergne-Rhône-Alpes', 3450),
('QP042008', 'Firminy - Le Vert', 'Firminy', '42095', 'Loire', 'Auvergne-Rhône-Alpes', 2180),

-- Roanne
('QP042009', 'Mâtel - Parc', 'Roanne', '42187', 'Loire', 'Auvergne-Rhône-Alpes', 4560),
('QP042010', 'Bourgogne', 'Roanne', '42187', 'Loire', 'Auvergne-Rhône-Alpes', 3120),

-- Rive-de-Gier
('QP042011', 'Le Quartier Haut', 'Rive-de-Gier', '42186', 'Loire', 'Auvergne-Rhône-Alpes', 2670),

-- Montbrison
('QP042012', 'Beauregard', 'Montbrison', '42147', 'Loire', 'Auvergne-Rhône-Alpes', 1890),

-- Saint-Chamond
('QP042013', 'Quartier du Coin', 'Saint-Chamond', '42207', 'Loire', 'Auvergne-Rhône-Alpes', 2340);

-- Log
SELECT 'QPV Loire importés: ' || COUNT(*) || ' quartiers' FROM qpv_reference WHERE departement = 'Loire';