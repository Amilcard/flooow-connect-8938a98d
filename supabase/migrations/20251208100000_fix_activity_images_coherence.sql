-- Migration: Remplacer toutes les images d'activités par des photos réalistes
-- d'enfants et adolescents français en action, cohérentes avec chaque activité.
-- Objectifs:
--   - Chaque image montre des enfants/ados en situation réelle
--   - L'âge visible correspond à la tranche d'âge de l'activité
--   - Aucune réutilisation d'image (1 image = 1 activité)
--   - Contexte français/européen contemporain (pas de gymnases US, bus jaunes, etc.)

-- =====================================================
-- SPORT (10 activités)
-- =====================================================

-- 1. Tennis - TC Saint-Étienne (6-17 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800'],
    image_url = 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800'
WHERE title = 'Tennis - TC Saint-Étienne';

-- 2. École de Football ASSE (7-16 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800'],
    image_url = 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800'
WHERE title = 'École de Football ASSE';

-- 3. École de Natation (6-15 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1560090995-01632a28895b?w=800'],
    image_url = 'https://images.unsplash.com/photo-1560090995-01632a28895b?w=800'
WHERE title = 'École de Natation';

-- 4. Basket Club Jeunes (6-17 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800'],
    image_url = 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800'
WHERE title = 'Basket Club Jeunes';

-- 5. Judo Kids (6-14 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?w=800'],
    image_url = 'https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?w=800'
WHERE title = 'Judo Kids';

-- 6. Escalade Jeunes (8-17 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1601598851547-4302969d0614?w=800'],
    image_url = 'https://images.unsplash.com/photo-1601598851547-4302969d0614?w=800'
WHERE title = 'Escalade Jeunes';

-- 7. Yoga Enfants (6-12 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800'],
    image_url = 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800'
WHERE title = 'Yoga Enfants';

-- 8. Hip-Hop Dance Academy (8-17 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=800'],
    image_url = 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=800'
WHERE title = 'Hip-Hop Dance Academy';

-- 9. Athlétisme Jeunes (6-15 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=800'],
    image_url = 'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=800'
WHERE title = 'Athlétisme Jeunes';

-- 10. Handball Club (7-16 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800'],
    image_url = 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800'
WHERE title = 'Handball Club';

-- =====================================================
-- CULTURE (8 activités)
-- =====================================================

-- 11. Cours de Piano (6-17 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
    image_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
WHERE title = 'Cours de Piano';

-- 12. Atelier Théâtre Adolescents (12-17 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1547153760-18fc86324498?w=800'],
    image_url = 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800'
WHERE title = 'Atelier Théâtre Adolescents';

-- 13. Atelier Arts Plastiques Enfants (6-14 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800'],
    image_url = 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800'
WHERE title = 'Atelier Arts Plastiques Enfants';

-- 14. Chorale Jeunes Voix (8-16 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800'],
    image_url = 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800'
WHERE title = 'Chorale Jeunes Voix';

-- 15. Cours de Guitare (8-17 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=800'],
    image_url = 'https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=800'
WHERE title = 'Cours de Guitare';

-- 16. Parcours Art Jeune Public (6-15 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=800'],
    image_url = 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=800'
WHERE title = 'Parcours Art Jeune Public';

-- 17. Arts du Cirque (7-14 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1567593810070-7a3d471af022?w=800'],
    image_url = 'https://images.unsplash.com/photo-1567593810070-7a3d471af022?w=800'
WHERE title = 'Arts du Cirque';

-- 18. Atelier Photo Ados (12-17 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800'],
    image_url = 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800'
WHERE title = 'Atelier Photo Ados';

-- =====================================================
-- LOISIRS (8 activités)
-- =====================================================

-- 19. Centre de Loisirs Mercredis (6-12 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=800'],
    image_url = 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=800'
WHERE title = 'Centre de Loisirs Mercredis';

-- 20. Club Robotique et Code (9-16 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800'],
    image_url = 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800'
WHERE title = 'Club Robotique et Code';

-- 21. Club d'Échecs Jeunes (7-17 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1580541832626-2a7131ee809f?w=800'],
    image_url = 'https://images.unsplash.com/photo-1580541832626-2a7131ee809f?w=800'
WHERE title LIKE '%Échecs%';

-- 22. Atelier Sciences Expérimentales (8-14 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1567168539593-59676245a5d3?w=800'],
    image_url = 'https://images.unsplash.com/photo-1567168539593-59676245a5d3?w=800'
WHERE title = 'Atelier Sciences Expérimentales';

-- 23. Jardin Partagé Enfants (6-13 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800'],
    image_url = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800'
WHERE title = 'Jardin Partagé Enfants';

-- 24. Club Jeux de Société (6-15 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=800'],
    image_url = 'https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=800'
WHERE title = 'Club Jeux de Société';

-- 25. Atelier Couture Enfants (9-16 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800'],
    image_url = 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800'
WHERE title = 'Atelier Couture Enfants';

-- 26. Atelier Cuisine Junior (7-14 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1554188248-986adbb73be4?w=800'],
    image_url = 'https://images.unsplash.com/photo-1554188248-986adbb73be4?w=800'
WHERE title = 'Atelier Cuisine Junior';

-- =====================================================
-- SCOLARITÉ / APPRENTISSAGE (8 activités)
-- =====================================================

-- 27. Aide aux Devoirs (6-15 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800'],
    image_url = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800'
WHERE title = 'Aide aux Devoirs';

-- 28. Anglais Kids (6-12 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=800'],
    image_url = 'https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=800'
WHERE title = 'Anglais Kids';

-- 29. Histoire de l'Art Junior (10-17 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800'],
    image_url = 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800'
WHERE title LIKE '%Histoire de l%Art%';

-- 30. Maths Ludiques (8-14 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800'],
    image_url = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800'
WHERE title = 'Maths Ludiques';

-- 31. Club Lecture Jeunes (9-16 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800'],
    image_url = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800'
WHERE title = 'Club Lecture Jeunes';

-- 32. Initiation Astronomie (8-15 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=800'],
    image_url = 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=800'
WHERE title = 'Initiation Astronomie';

-- 33. Écriture Créative (11-17 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1517842645767-c639042777db?w=800'],
    image_url = 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800'
WHERE title LIKE '%criture Cr%ative%';

-- 34. Préparation Brevet (14-16 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800'],
    image_url = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800'
WHERE title LIKE '%Brevet%';

-- =====================================================
-- VACANCES (6 activités)
-- =====================================================

-- 35. Colonie Montagne Hiver (8-16 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800'],
    image_url = 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800'
WHERE title = 'Colonie Montagne Hiver';

-- 36. Stage Voile Été (9-16 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800'],
    image_url = 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800'
WHERE title LIKE '%Voile%';

-- 37. Stage Équitation Vacances (7-15 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1566251037378-5e04e3bec343?w=800'],
    image_url = 'https://images.unsplash.com/photo-1566251037378-5e04e3bec343?w=800'
WHERE title LIKE '%quitation%';

-- 38. Camp Aventure Été (11-16 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'],
    image_url = 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'
WHERE title LIKE '%Aventure%';

-- 39. Centre Aéré Vacances Petites (6-12 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1594708767771-a7502f2b1fd6?w=800'],
    image_url = 'https://images.unsplash.com/photo-1594708767771-a7502f2b1fd6?w=800'
WHERE title LIKE '%A%r% Vacances%';

-- 40. Canoë-Kayak Été (10-17 ans)
UPDATE activities
SET images = ARRAY['https://images.unsplash.com/photo-1472745942893-4b9f730c7668?w=800'],
    image_url = 'https://images.unsplash.com/photo-1472745942893-4b9f730c7668?w=800'
WHERE title LIKE '%Cano%';

-- =====================================================
-- Mise à jour finale: synchroniser image_url avec images[1]
-- pour les activités où image_url est NULL
-- =====================================================
UPDATE activities
SET image_url = images[1]
WHERE image_url IS NULL AND images IS NOT NULL AND array_length(images, 1) > 0;
