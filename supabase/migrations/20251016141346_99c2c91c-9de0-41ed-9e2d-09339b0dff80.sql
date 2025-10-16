-- Ajouter des options tarifaires multiples pour les activités vacances
UPDATE activities 
SET 
  payment_plans = '[
    {"type": "semaine", "price": 120, "label": "Semaine complète"},
    {"type": "jour", "price": 30, "label": "À la journée"},
    {"type": "demi_journee", "price": 18, "label": "Demi-journée"}
  ]'::jsonb,
  price_note = 'Tarifs dégressifs disponibles'
WHERE title = 'Stage Football Été';

-- Mettre à jour les descriptions des activités gratuites pour mentionner les frais post-essai
UPDATE activities 
SET description = 'Découvrez notre école multisports gratuitement ! Séance d''essai offerte pour tester différentes disciplines sportives. Après l''essai gratuit, inscription possible à l''année pour 90€.'
WHERE title = 'École Multisports - Découverte';

UPDATE activities 
SET description = 'Atelier d''escalade pour adolescents. Première séance gratuite pour découvrir l''activité. Suite du programme : 120€/trimestre.'
WHERE title = 'Atelier Escalade Ados';

UPDATE activities 
SET description = 'Stage de danse urban et sports combinés. Essai gratuit le premier jour. Inscription complète au stage : 85€/semaine.'
WHERE title = 'Stage Danse Urban Sports';

UPDATE activities 
SET description = 'Cycle découverte du judo pour les enfants. Premier cours offert. Inscription annuelle ensuite : 150€.'
WHERE title = 'Cycle Judo Enfants';