-- 1. Ajouter colonne period_type pour gérer les badges de période
ALTER TABLE activities ADD COLUMN IF NOT EXISTS period_type TEXT;

-- 2. Mettre à jour les prix des activités gratuites et ajouter mention essai gratuit
UPDATE activities 
SET 
  price_base = 150,
  description = '🎁 1ère séance d''essai GRATUITE. Cycle découverte du judo pour les enfants. Inscription annuelle ensuite : 150€.',
  period_type = 'annual'
WHERE title = 'Cycle Judo Enfants';

UPDATE activities 
SET 
  price_base = 180,
  description = '🎁 1ère séance d''essai GRATUITE. Stage de danse urban et sports combinés. Inscription complète au stage : 180€/semaine.',
  period_type = 'school_holidays'
WHERE title = 'Stage Danse Urban Sports';

UPDATE activities 
SET 
  price_base = 120,
  description = '🎁 1ère séance d''essai GRATUITE. Atelier d''escalade pour adolescents. Suite du programme : 120€/trimestre.',
  period_type = 'trimester'
WHERE title = 'Atelier Escalade Ados';

UPDATE activities 
SET 
  price_base = 90,
  description = '🎁 1ère séance d''essai GRATUITE. Découvrez notre école multisports gratuitement ! Séance d''essai offerte pour tester différentes disciplines sportives. Inscription à l''année : 90€.',
  period_type = 'annual'
WHERE title = 'École Multisports - Découverte';

UPDATE activities 
SET 
  price_base = 80,
  description = '🎁 1ère séance d''essai GRATUITE. Atelier de cuisine créative pour les jeunes gourmets. Inscription trimestrielle : 80€.',
  period_type = 'trimester'
WHERE title = 'Atelier Cuisine Junior';

UPDATE activities 
SET 
  price_base = 100,
  description = '🎁 1ère séance d''essai GRATUITE. Atelier de langues pour débutants en anglais. Inscription annuelle : 100€.',
  period_type = 'annual'
WHERE title = 'Atelier Langues - Anglais Débutant';

UPDATE activities 
SET 
  price_base = 60,
  description = '🎁 1ère séance d''essai GRATUITE. Atelier d''orientation et aide au parcours scolaire. Session complète : 60€.',
  period_type = 'trimester'
WHERE title = 'Atelier Orientation & Aide Parcours';

UPDATE activities 
SET 
  price_base = 70,
  description = '🎁 1ère séance d''essai GRATUITE. Club de jeux de société pour partager des moments conviviaux. Inscription trimestrielle : 70€.',
  period_type = 'trimester'
WHERE title = 'Club Jeux de Société - Après-midi';

UPDATE activities 
SET 
  price_base = 150,
  description = '🎁 1ère séance d''essai GRATUITE. Séjour linguistique court pendant les vacances. Programme complet : 150€/semaine.',
  period_type = 'school_holidays'
WHERE title = 'Séjour Linguistique Court - Vacances';

-- 3. Définir period_type pour toutes les activités existantes basé sur catégorie et titre
UPDATE activities SET period_type = 'school_holidays' WHERE category = 'Vacances' AND period_type IS NULL;
UPDATE activities SET period_type = 'annual' WHERE category IN ('Sport', 'Culture', 'Loisirs') AND period_type IS NULL;
UPDATE activities SET period_type = 'trimester' WHERE category = 'Scolarité' AND period_type IS NULL;