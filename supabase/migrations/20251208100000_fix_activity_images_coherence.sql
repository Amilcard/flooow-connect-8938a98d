-- Migration: Attribuer des images réalistes aux 29 activités Flooow
-- Date: 2024-12-10
-- Objectif: Photos d'enfants/ados en situation réelle, cohérentes avec chaque activité
-- Chaque image est unique (pas de doublons)

-- =====================================================
-- CULTURE & ARTS (7 activités)
-- =====================================================

-- 1. Arts plastiques – Atelier créatif
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800']
WHERE title = 'Arts plastiques – Atelier créatif';

-- 2. Atelier théâtre ados
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1547153760-18fc86324498?w=800']
WHERE title = 'Atelier théâtre ados';

-- 3. Chant – Chorale et technique vocale
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800']
WHERE title = 'Chant – Chorale et technique vocale';

-- 4. Cirque – Arts du cirque
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1567593810070-7a3d471af022?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1567593810070-7a3d471af022?w=800']
WHERE title = 'Cirque – Arts du cirque';

-- 5. Conservatoire de musique – Violon
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=800']
WHERE title = 'Conservatoire de musique – Violon';

-- 6. Danse classique – Cours hebdomadaire
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800']
WHERE title = 'Danse classique – Cours hebdomadaire';

-- 7. Piano – Cours individuels
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800']
WHERE title = 'Piano – Cours individuels';

-- =====================================================
-- SPORT (8 activités)
-- =====================================================

-- 8. Basket – Mini-basket et cadets
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800']
WHERE title = 'Basket – Mini-basket et cadets';

-- 9. Équitation – Poney et cheval
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1566251037378-5e04e3bec343?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1566251037378-5e04e3bec343?w=800']
WHERE title = 'Équitation – Poney et cheval';

-- 10. Escalade – Mur d'escalade
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1601598851547-4302969d0614?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1601598851547-4302969d0614?w=800']
WHERE title = 'Escalade – Mur d'escalade';

-- 11. Football – École de foot U10
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800']
WHERE title = 'Football – École de foot U10';

-- 12. Gymnastique – Baby gym et éveil
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1576858574144-9ae1ebcf5ae5?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1576858574144-9ae1ebcf5ae5?w=800']
WHERE title = 'Gymnastique – Baby gym et éveil';

-- 13. Judo – Cours débutants
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?w=800']
WHERE title = 'Judo – Cours débutants';

-- 14. Multisports – Initiation découverte
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1526676037777-05a232554f77?w=800']
WHERE title = 'Multisports – Initiation découverte';

-- 15. Natation – École de natation
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1560090995-01632a28895b?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1560090995-01632a28895b?w=800']
WHERE title = 'Natation – École de natation';

-- 16. Tennis – École de tennis
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800']
WHERE title = 'Tennis – École de tennis';

-- =====================================================
-- VACANCES & SÉJOURS (5 activités)
-- =====================================================

-- 17. Camp nature – Découverte environnement
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800']
WHERE title = 'Camp nature – Découverte environnement';

-- 18. Camp ski – Séjour montagne hiver
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800']
WHERE title = 'Camp ski – Séjour montagne hiver';

-- 19. Centre de loisirs – Vacances Automne
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=800']
WHERE title = 'Centre de loisirs – Vacances Automne';

-- 20. Colonie de vacances été – Montagne
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1551632811-561732d1e306?w=800']
WHERE title = 'Colonie de vacances été – Montagne';

-- 21. Mini-séjour mer – Découverte océan
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800']
WHERE title = 'Mini-séjour mer – Découverte océan';

-- =====================================================
-- LOISIRS & DÉCOUVERTE (2 activités)
-- =====================================================

-- 22. Robotique – Programmation et construction
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800']
WHERE title = 'Robotique – Programmation et construction';

-- =====================================================
-- STAGES (7 activités)
-- =====================================================

-- 23. Stage cuisine – Petits chefs
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1554188248-986adbb73be4?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1554188248-986adbb73be4?w=800']
WHERE title = 'Stage cuisine – Petits chefs';

-- 24. Stage dessin – Techniques artistiques
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=800']
WHERE title = 'Stage dessin – Techniques artistiques';

-- 25. Stage multi-sports – Été
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=800']
WHERE title = 'Stage multi-sports – Été';

-- 26. Stage photo – Initiation photographie
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800']
WHERE title = 'Stage photo – Initiation photographie';

-- 27. Stage rugby – Initiation et perfectionnement
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800']
WHERE title = 'Stage rugby – Initiation et perfectionnement';

-- 28. Stage sciences – Expériences et découvertes
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1567168539593-59676245a5d3?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1567168539593-59676245a5d3?w=800']
WHERE title = 'Stage sciences – Expériences et découvertes';

-- 29. Stage théâtre – Vacances Automne
UPDATE activities
SET image_url = 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800',
    images = ARRAY['https://images.unsplash.com/photo-1503095396549-807759245b35?w=800']
WHERE title = 'Stage théâtre – Vacances Automne';

-- =====================================================
-- Sync final: s'assurer que image_url = images[1]
-- =====================================================
UPDATE activities
SET image_url = images[1]
WHERE image_url IS NULL
  AND images IS NOT NULL
  AND array_length(images, 1) > 0;
