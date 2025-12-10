-- ============================================================
-- Migration: Enrichir les données des 29 activités
-- Date: 2025-12-10
-- Objectif: Compléter chaque activité avec toutes les infos riches
-- ============================================================

-- =====================================================
-- CULTURE & ARTS (7 activités)
-- =====================================================

-- 1. Arts plastiques – Atelier créatif
UPDATE activities SET
  lieu_nom = 'Espace culturel Jean Moulin',
  transport_info = 'Ligne T2 arrêt Centre - Bus 14',
  mobility_tc = 'Tramway T2, Bus 14',
  mobility_velo = TRUE,
  mobility_covoit = TRUE,
  sante_tags = ARRAY['Aucun certificat requis'],
  prerequis = NULL,
  pieces_a_fournir = ARRAY['Photo d''identité', 'Attestation d''assurance'],
  vacation_type = NULL,
  duration_days = NULL,
  has_accommodation = FALSE,
  creneaux = '[{"jour": "mercredi", "debut": "14:00", "fin": "16:00"}, {"jour": "samedi", "debut": "10:00", "fin": "12:00"}]'::jsonb,
  period_type = 'scolaire'
WHERE title = 'Arts plastiques – Atelier créatif';

-- 2. Atelier théâtre ados
UPDATE activities SET
  lieu_nom = 'Salle des fêtes municipale',
  transport_info = 'Bus 7 arrêt Mairie',
  mobility_tc = 'Bus 7, 12',
  mobility_velo = TRUE,
  mobility_covoit = TRUE,
  sante_tags = ARRAY['Aucun certificat requis'],
  prerequis = NULL,
  pieces_a_fournir = ARRAY['Photo d''identité', 'Autorisation parentale'],
  vacation_type = NULL,
  duration_days = NULL,
  has_accommodation = FALSE,
  creneaux = '[{"jour": "mercredi", "debut": "15:00", "fin": "17:00"}, {"jour": "vendredi", "debut": "18:00", "fin": "20:00"}]'::jsonb,
  period_type = 'scolaire'
WHERE title = 'Atelier théâtre ados';

-- 3. Chant – Chorale et technique vocale
UPDATE activities SET
  lieu_nom = 'Conservatoire municipal',
  transport_info = 'Métro ligne A arrêt Conservatoire',
  mobility_tc = 'Métro A, Bus 5',
  mobility_velo = TRUE,
  mobility_covoit = FALSE,
  sante_tags = ARRAY['Aucun certificat requis'],
  prerequis = NULL,
  pieces_a_fournir = ARRAY['Photo d''identité'],
  vacation_type = NULL,
  duration_days = NULL,
  has_accommodation = FALSE,
  creneaux = '[{"jour": "mardi", "debut": "17:30", "fin": "18:30"}, {"jour": "jeudi", "debut": "17:30", "fin": "18:30"}]'::jsonb,
  period_type = 'scolaire'
WHERE title = 'Chant – Chorale et technique vocale';

-- 4. Cirque – Arts du cirque
UPDATE activities SET
  lieu_nom = 'Chapiteau municipal - Parc des sports',
  transport_info = 'Bus 22 arrêt Parc des sports',
  mobility_tc = 'Bus 22',
  mobility_velo = TRUE,
  mobility_covoit = TRUE,
  sante_tags = ARRAY['Certificat médical requis'],
  prerequis = NULL,
  pieces_a_fournir = ARRAY['Certificat médical de non contre-indication', 'Photo d''identité', 'Attestation d''assurance'],
  vacation_type = NULL,
  duration_days = NULL,
  has_accommodation = FALSE,
  creneaux = '[{"jour": "mercredi", "debut": "14:00", "fin": "16:30"}, {"jour": "samedi", "debut": "10:00", "fin": "12:30"}]'::jsonb,
  period_type = 'scolaire'
WHERE title = 'Cirque – Arts du cirque';

-- 5. Conservatoire de musique – Violon
UPDATE activities SET
  lieu_nom = 'Conservatoire à rayonnement régional',
  transport_info = 'Métro ligne A arrêt Conservatoire',
  mobility_tc = 'Métro A, Bus 5, 8',
  mobility_velo = TRUE,
  mobility_covoit = FALSE,
  sante_tags = ARRAY['Aucun certificat requis'],
  prerequis = ARRAY['Audition d''entrée obligatoire'],
  pieces_a_fournir = ARRAY['Photo d''identité', 'Justificatif de domicile'],
  vacation_type = NULL,
  duration_days = NULL,
  has_accommodation = FALSE,
  creneaux = '[{"jour": "lundi", "debut": "17:00", "fin": "18:00"}, {"jour": "mercredi", "debut": "14:00", "fin": "15:00"}]'::jsonb,
  period_type = 'scolaire'
WHERE title = 'Conservatoire de musique – Violon';

-- 6. Danse classique – Cours hebdomadaire
UPDATE activities SET
  lieu_nom = 'École de danse - Centre culturel',
  transport_info = 'Tramway T1 arrêt Culture',
  mobility_tc = 'Tramway T1, Bus 3',
  mobility_velo = TRUE,
  mobility_covoit = TRUE,
  sante_tags = ARRAY['Certificat médical requis'],
  prerequis = NULL,
  pieces_a_fournir = ARRAY['Certificat médical', 'Photo d''identité', 'Chaussons et justaucorps obligatoires'],
  vacation_type = NULL,
  duration_days = NULL,
  has_accommodation = FALSE,
  creneaux = '[{"jour": "mercredi", "debut": "14:00", "fin": "15:30"}, {"jour": "samedi", "debut": "11:00", "fin": "12:30"}]'::jsonb,
  period_type = 'scolaire'
WHERE title = 'Danse classique – Cours hebdomadaire';

-- 7. Piano – Cours individuels
UPDATE activities SET
  lieu_nom = 'Conservatoire municipal',
  transport_info = 'Métro ligne A arrêt Conservatoire',
  mobility_tc = 'Métro A, Bus 5',
  mobility_velo = TRUE,
  mobility_covoit = FALSE,
  sante_tags = ARRAY['Aucun certificat requis'],
  prerequis = NULL,
  pieces_a_fournir = ARRAY['Photo d''identité'],
  vacation_type = NULL,
  duration_days = NULL,
  has_accommodation = FALSE,
  creneaux = '[{"jour": "mardi", "debut": "17:00", "fin": "17:45"}, {"jour": "jeudi", "debut": "17:00", "fin": "17:45"}]'::jsonb,
  period_type = 'scolaire'
WHERE title = 'Piano – Cours individuels';

-- =====================================================
-- SPORT (9 activités)
-- =====================================================

-- 8. Basket – Mini-basket et cadets
UPDATE activities SET
  lieu_nom = 'Gymnase Jean Jaurès',
  transport_info = 'Bus 15 arrêt Gymnase',
  mobility_tc = 'Bus 15, 23',
  mobility_velo = TRUE,
  mobility_covoit = TRUE,
  sante_tags = ARRAY['Certificat médical requis', 'Visite médicale annuelle'],
  prerequis = NULL,
  pieces_a_fournir = ARRAY['Certificat médical de non contre-indication à la pratique du basket', 'Photo d''identité', 'Attestation d''assurance'],
  vacation_type = NULL,
  duration_days = NULL,
  has_accommodation = FALSE,
  creneaux = '[{"jour": "mercredi", "debut": "14:00", "fin": "16:00"}, {"jour": "samedi", "debut": "10:00", "fin": "12:00"}]'::jsonb,
  period_type = 'scolaire'
WHERE title = 'Basket – Mini-basket et cadets';

-- 9. Équitation – Poney et cheval
UPDATE activities SET
  lieu_nom = 'Centre équestre Les Écuries du Parc',
  transport_info = 'Bus 30 arrêt Centre équestre (navette possible)',
  mobility_tc = 'Bus 30',
  mobility_velo = FALSE,
  mobility_covoit = TRUE,
  sante_tags = ARRAY['Certificat médical requis', 'Licence FFE obligatoire'],
  prerequis = NULL,
  pieces_a_fournir = ARRAY['Certificat médical', 'Photo d''identité', 'Bombe obligatoire (prêt possible)'],
  vacation_type = NULL,
  duration_days = NULL,
  has_accommodation = FALSE,
  creneaux = '[{"jour": "mercredi", "debut": "14:00", "fin": "16:00"}, {"jour": "samedi", "debut": "10:00", "fin": "12:00"}]'::jsonb,
  period_type = 'scolaire'
WHERE title = 'Équitation – Poney et cheval';

-- 10. Escalade – Mur d'escalade
UPDATE activities SET
  lieu_nom = 'Salle d''escalade Vertical',
  transport_info = 'Tramway T2 arrêt Sports',
  mobility_tc = 'Tramway T2',
  mobility_velo = TRUE,
  mobility_covoit = TRUE,
  sante_tags = ARRAY['Certificat médical requis'],
  prerequis = NULL,
  pieces_a_fournir = ARRAY['Certificat médical de non contre-indication', 'Photo d''identité', 'Attestation d''assurance'],
  vacation_type = NULL,
  duration_days = NULL,
  has_accommodation = FALSE,
  creneaux = '[{"jour": "mercredi", "debut": "14:00", "fin": "16:00"}, {"jour": "vendredi", "debut": "18:00", "fin": "20:00"}]'::jsonb,
  period_type = 'scolaire'
WHERE title = 'Escalade – Mur d''escalade';

-- 11. Football – École de foot U10
UPDATE activities SET
  lieu_nom = 'Stade municipal Marcel Pagnol',
  transport_info = 'Bus 8 arrêt Stade',
  mobility_tc = 'Bus 8, 18',
  mobility_velo = TRUE,
  mobility_covoit = TRUE,
  sante_tags = ARRAY['Certificat médical requis', 'Licence FFF'],
  prerequis = NULL,
  pieces_a_fournir = ARRAY['Certificat médical', 'Photo d''identité', 'Attestation d''assurance', 'Crampons obligatoires'],
  vacation_type = NULL,
  duration_days = NULL,
  has_accommodation = FALSE,
  creneaux = '[{"jour": "mercredi", "debut": "14:00", "fin": "16:00"}, {"jour": "samedi", "debut": "10:00", "fin": "12:00"}]'::jsonb,
  period_type = 'scolaire'
WHERE title = 'Football – École de foot U10';

-- 12. Gymnastique – Baby gym et éveil
UPDATE activities SET
  lieu_nom = 'Gymnase des Lilas',
  transport_info = 'Bus 12 arrêt Lilas',
  mobility_tc = 'Bus 12',
  mobility_velo = TRUE,
  mobility_covoit = TRUE,
  sante_tags = ARRAY['Certificat médical requis'],
  prerequis = NULL,
  pieces_a_fournir = ARRAY['Certificat médical', 'Photo d''identité', 'Tenue souple obligatoire'],
  vacation_type = NULL,
  duration_days = NULL,
  has_accommodation = FALSE,
  creneaux = '[{"jour": "mercredi", "debut": "10:00", "fin": "11:00"}, {"jour": "samedi", "debut": "9:00", "fin": "10:00"}]'::jsonb,
  period_type = 'scolaire'
WHERE title = 'Gymnastique – Baby gym et éveil';

-- 13. Judo – Cours débutants
UPDATE activities SET
  lieu_nom = 'Dojo municipal',
  transport_info = 'Métro ligne B arrêt Dojo',
  mobility_tc = 'Métro B, Bus 6',
  mobility_velo = TRUE,
  mobility_covoit = TRUE,
  sante_tags = ARRAY['Certificat médical requis', 'Licence FFJDA'],
  prerequis = NULL,
  pieces_a_fournir = ARRAY['Certificat médical', 'Photo d''identité', 'Judogi obligatoire'],
  vacation_type = NULL,
  duration_days = NULL,
  has_accommodation = FALSE,
  creneaux = '[{"jour": "mardi", "debut": "17:30", "fin": "18:30"}, {"jour": "jeudi", "debut": "17:30", "fin": "18:30"}, {"jour": "samedi", "debut": "10:00", "fin": "11:30"}]'::jsonb,
  period_type = 'scolaire'
WHERE title = 'Judo – Cours débutants';

-- 14. Multisports – Initiation découverte
UPDATE activities SET
  lieu_nom = 'Complexe sportif municipal',
  transport_info = 'Bus 10 arrêt Complexe sportif',
  mobility_tc = 'Bus 10, 20',
  mobility_velo = TRUE,
  mobility_covoit = TRUE,
  sante_tags = ARRAY['Certificat médical requis'],
  prerequis = NULL,
  pieces_a_fournir = ARRAY['Certificat médical', 'Photo d''identité', 'Tenue de sport'],
  vacation_type = NULL,
  duration_days = NULL,
  has_accommodation = FALSE,
  creneaux = '[{"jour": "mercredi", "debut": "14:00", "fin": "17:00"}]'::jsonb,
  period_type = 'scolaire'
WHERE title = 'Multisports – Initiation découverte';

-- 15. Natation – École de natation
UPDATE activities SET
  lieu_nom = 'Piscine olympique Jean Bouin',
  transport_info = 'Tramway T1 arrêt Piscine',
  mobility_tc = 'Tramway T1, Bus 4',
  mobility_velo = TRUE,
  mobility_covoit = TRUE,
  sante_tags = ARRAY['Certificat médical requis', 'Test anti-panique obligatoire'],
  prerequis = NULL,
  pieces_a_fournir = ARRAY['Certificat médical', 'Photo d''identité', 'Bonnet de bain obligatoire'],
  vacation_type = NULL,
  duration_days = NULL,
  has_accommodation = FALSE,
  creneaux = '[{"jour": "mercredi", "debut": "14:00", "fin": "15:00"}, {"jour": "samedi", "debut": "10:00", "fin": "11:00"}]'::jsonb,
  period_type = 'scolaire'
WHERE title = 'Natation – École de natation';

-- 16. Tennis – École de tennis
UPDATE activities SET
  lieu_nom = 'Tennis Club municipal',
  transport_info = 'Bus 16 arrêt Tennis',
  mobility_tc = 'Bus 16',
  mobility_velo = TRUE,
  mobility_covoit = TRUE,
  sante_tags = ARRAY['Certificat médical requis'],
  prerequis = NULL,
  pieces_a_fournir = ARRAY['Certificat médical', 'Photo d''identité', 'Raquette (prêt possible)'],
  vacation_type = NULL,
  duration_days = NULL,
  has_accommodation = FALSE,
  creneaux = '[{"jour": "mercredi", "debut": "14:00", "fin": "15:30"}, {"jour": "samedi", "debut": "10:00", "fin": "11:30"}]'::jsonb,
  period_type = 'scolaire'
WHERE title = 'Tennis – École de tennis';

-- =====================================================
-- VACANCES & SÉJOURS (5 activités)
-- =====================================================

-- 17. Camp nature – Découverte environnement
UPDATE activities SET
  lieu_nom = 'Centre de vacances Les Pins',
  transport_info = 'Car depuis gare routière (inclus)',
  mobility_tc = 'Transport collectif inclus',
  mobility_velo = FALSE,
  mobility_covoit = FALSE,
  sante_tags = ARRAY['Certificat médical requis', 'Vaccins à jour', 'Fiche sanitaire obligatoire'],
  prerequis = NULL,
  pieces_a_fournir = ARRAY['Certificat médical', 'Fiche sanitaire de liaison', 'Photocopie carnet de santé (vaccins)', 'Autorisation parentale'],
  vacation_type = 'sejour_hebergement',
  duration_days = 7,
  has_accommodation = TRUE,
  creneaux = NULL,
  period_type = 'vacances'
WHERE title = 'Camp nature – Découverte environnement';

-- 18. Camp ski – Séjour montagne hiver
UPDATE activities SET
  lieu_nom = 'Chalet Les Marmottes - Station des Deux Alpes',
  transport_info = 'Car depuis gare routière (inclus)',
  mobility_tc = 'Transport collectif inclus',
  mobility_velo = FALSE,
  mobility_covoit = FALSE,
  sante_tags = ARRAY['Certificat médical requis', 'Vaccins à jour', 'Fiche sanitaire obligatoire'],
  prerequis = ARRAY['Savoir skier niveau débutant minimum'],
  pieces_a_fournir = ARRAY['Certificat médical', 'Fiche sanitaire de liaison', 'Photocopie carnet de santé', 'Autorisation parentale', 'Forfait ski (en supplément)'],
  vacation_type = 'sejour_hebergement',
  duration_days = 7,
  has_accommodation = TRUE,
  creneaux = NULL,
  period_type = 'vacances'
WHERE title = 'Camp ski – Séjour montagne hiver';

-- 19. Centre de loisirs – Vacances Automne
UPDATE activities SET
  lieu_nom = 'Centre de loisirs municipal Les Coccinelles',
  transport_info = 'Bus 5 arrêt Centre de loisirs',
  mobility_tc = 'Bus 5, 11',
  mobility_velo = TRUE,
  mobility_covoit = TRUE,
  sante_tags = ARRAY['Fiche sanitaire obligatoire'],
  prerequis = NULL,
  pieces_a_fournir = ARRAY['Fiche sanitaire de liaison', 'Autorisation parentale', 'Photo d''identité'],
  vacation_type = 'centre_loisirs',
  duration_days = 5,
  has_accommodation = FALSE,
  creneaux = '[{"jour": "lundi", "debut": "08:00", "fin": "18:00"}, {"jour": "mardi", "debut": "08:00", "fin": "18:00"}, {"jour": "mercredi", "debut": "08:00", "fin": "18:00"}, {"jour": "jeudi", "debut": "08:00", "fin": "18:00"}, {"jour": "vendredi", "debut": "08:00", "fin": "18:00"}]'::jsonb,
  period_type = 'vacances'
WHERE title = 'Centre de loisirs – Vacances Automne';

-- 20. Colonie de vacances été – Montagne
UPDATE activities SET
  lieu_nom = 'Centre de vacances Le Grand Air - Savoie',
  transport_info = 'Car depuis gare routière (inclus)',
  mobility_tc = 'Transport collectif inclus',
  mobility_velo = FALSE,
  mobility_covoit = FALSE,
  sante_tags = ARRAY['Certificat médical requis', 'Vaccins à jour', 'Fiche sanitaire obligatoire'],
  prerequis = NULL,
  pieces_a_fournir = ARRAY['Certificat médical', 'Fiche sanitaire de liaison', 'Photocopie carnet de santé', 'Autorisation parentale', 'Trousseau selon liste fournie'],
  vacation_type = 'sejour_hebergement',
  duration_days = 14,
  has_accommodation = TRUE,
  creneaux = NULL,
  period_type = 'vacances'
WHERE title = 'Colonie de vacances été – Montagne';

-- 21. Mini-séjour mer – Découverte océan
UPDATE activities SET
  lieu_nom = 'Centre nautique Les Mouettes - Arcachon',
  transport_info = 'Car depuis gare routière (inclus)',
  mobility_tc = 'Transport collectif inclus',
  mobility_velo = FALSE,
  mobility_covoit = FALSE,
  sante_tags = ARRAY['Certificat médical requis', 'Savoir nager 25m obligatoire', 'Fiche sanitaire obligatoire'],
  prerequis = ARRAY['Savoir nager 25 mètres (test obligatoire)'],
  pieces_a_fournir = ARRAY['Certificat médical', 'Attestation de natation', 'Fiche sanitaire', 'Autorisation parentale'],
  vacation_type = 'sejour_hebergement',
  duration_days = 5,
  has_accommodation = TRUE,
  creneaux = NULL,
  period_type = 'vacances'
WHERE title = 'Mini-séjour mer – Découverte océan';

-- =====================================================
-- LOISIRS & DÉCOUVERTE (1 activité)
-- =====================================================

-- 22. Robotique – Programmation et construction
UPDATE activities SET
  lieu_nom = 'FabLab municipal',
  transport_info = 'Tramway T1 arrêt Innovation',
  mobility_tc = 'Tramway T1, Bus 9',
  mobility_velo = TRUE,
  mobility_covoit = TRUE,
  sante_tags = ARRAY['Aucun certificat requis'],
  prerequis = NULL,
  pieces_a_fournir = ARRAY['Photo d''identité', 'Autorisation parentale'],
  vacation_type = NULL,
  duration_days = NULL,
  has_accommodation = FALSE,
  creneaux = '[{"jour": "mercredi", "debut": "14:00", "fin": "16:30"}, {"jour": "samedi", "debut": "10:00", "fin": "12:30"}]'::jsonb,
  period_type = 'scolaire'
WHERE title = 'Robotique – Programmation et construction';

-- =====================================================
-- STAGES (7 activités)
-- =====================================================

-- 23. Stage cuisine – Petits chefs
UPDATE activities SET
  lieu_nom = 'Atelier culinaire Les Toques',
  transport_info = 'Bus 7 arrêt Marché',
  mobility_tc = 'Bus 7',
  mobility_velo = TRUE,
  mobility_covoit = TRUE,
  sante_tags = ARRAY['Signaler allergies alimentaires'],
  prerequis = NULL,
  pieces_a_fournir = ARRAY['Photo d''identité', 'Fiche allergies alimentaires', 'Tablier (fourni si besoin)'],
  vacation_type = 'stage_journee',
  duration_days = 5,
  has_accommodation = FALSE,
  creneaux = '[{"jour": "lundi", "debut": "10:00", "fin": "12:30"}, {"jour": "mardi", "debut": "10:00", "fin": "12:30"}, {"jour": "mercredi", "debut": "10:00", "fin": "12:30"}, {"jour": "jeudi", "debut": "10:00", "fin": "12:30"}, {"jour": "vendredi", "debut": "10:00", "fin": "12:30"}]'::jsonb,
  period_type = 'vacances'
WHERE title = 'Stage cuisine – Petits chefs';

-- 24. Stage dessin – Techniques artistiques
UPDATE activities SET
  lieu_nom = 'Atelier d''art municipal',
  transport_info = 'Tramway T2 arrêt Arts',
  mobility_tc = 'Tramway T2',
  mobility_velo = TRUE,
  mobility_covoit = TRUE,
  sante_tags = ARRAY['Aucun certificat requis'],
  prerequis = NULL,
  pieces_a_fournir = ARRAY['Photo d''identité', 'Matériel fourni'],
  vacation_type = 'stage_journee',
  duration_days = 5,
  has_accommodation = FALSE,
  creneaux = '[{"jour": "lundi", "debut": "14:00", "fin": "17:00"}, {"jour": "mardi", "debut": "14:00", "fin": "17:00"}, {"jour": "mercredi", "debut": "14:00", "fin": "17:00"}, {"jour": "jeudi", "debut": "14:00", "fin": "17:00"}, {"jour": "vendredi", "debut": "14:00", "fin": "17:00"}]'::jsonb,
  period_type = 'vacances'
WHERE title = 'Stage dessin – Techniques artistiques';

-- 25. Stage multi-sports – Été
UPDATE activities SET
  lieu_nom = 'Complexe sportif municipal',
  transport_info = 'Bus 10 arrêt Complexe sportif',
  mobility_tc = 'Bus 10, 20',
  mobility_velo = TRUE,
  mobility_covoit = TRUE,
  sante_tags = ARRAY['Certificat médical requis'],
  prerequis = NULL,
  pieces_a_fournir = ARRAY['Certificat médical', 'Photo d''identité', 'Tenue de sport', 'Gourde'],
  vacation_type = 'stage_journee',
  duration_days = 5,
  has_accommodation = FALSE,
  creneaux = '[{"jour": "lundi", "debut": "09:00", "fin": "17:00"}, {"jour": "mardi", "debut": "09:00", "fin": "17:00"}, {"jour": "mercredi", "debut": "09:00", "fin": "17:00"}, {"jour": "jeudi", "debut": "09:00", "fin": "17:00"}, {"jour": "vendredi", "debut": "09:00", "fin": "17:00"}]'::jsonb,
  period_type = 'vacances'
WHERE title = 'Stage multi-sports – Été';

-- 26. Stage photo – Initiation photographie
UPDATE activities SET
  lieu_nom = 'Médiathèque centrale',
  transport_info = 'Métro ligne A arrêt Centre',
  mobility_tc = 'Métro A, Bus 1, 2',
  mobility_velo = TRUE,
  mobility_covoit = TRUE,
  sante_tags = ARRAY['Aucun certificat requis'],
  prerequis = NULL,
  pieces_a_fournir = ARRAY['Photo d''identité', 'Appareil photo ou smartphone'],
  vacation_type = 'stage_journee',
  duration_days = 3,
  has_accommodation = FALSE,
  creneaux = '[{"jour": "lundi", "debut": "14:00", "fin": "17:00"}, {"jour": "mardi", "debut": "14:00", "fin": "17:00"}, {"jour": "mercredi", "debut": "14:00", "fin": "17:00"}]'::jsonb,
  period_type = 'vacances'
WHERE title = 'Stage photo – Initiation photographie';

-- 27. Stage rugby – Initiation et perfectionnement
UPDATE activities SET
  lieu_nom = 'Stade de rugby - Terrain annexe',
  transport_info = 'Bus 18 arrêt Stade rugby',
  mobility_tc = 'Bus 18',
  mobility_velo = TRUE,
  mobility_covoit = TRUE,
  sante_tags = ARRAY['Certificat médical requis'],
  prerequis = NULL,
  pieces_a_fournir = ARRAY['Certificat médical', 'Photo d''identité', 'Protège-dents obligatoire', 'Crampons'],
  vacation_type = 'stage_journee',
  duration_days = 5,
  has_accommodation = FALSE,
  creneaux = '[{"jour": "lundi", "debut": "09:00", "fin": "12:00"}, {"jour": "mardi", "debut": "09:00", "fin": "12:00"}, {"jour": "mercredi", "debut": "09:00", "fin": "12:00"}, {"jour": "jeudi", "debut": "09:00", "fin": "12:00"}, {"jour": "vendredi", "debut": "09:00", "fin": "12:00"}]'::jsonb,
  period_type = 'vacances'
WHERE title = 'Stage rugby – Initiation et perfectionnement';

-- 28. Stage sciences – Expériences et découvertes
UPDATE activities SET
  lieu_nom = 'Maison des sciences',
  transport_info = 'Tramway T1 arrêt Sciences',
  mobility_tc = 'Tramway T1',
  mobility_velo = TRUE,
  mobility_covoit = TRUE,
  sante_tags = ARRAY['Aucun certificat requis'],
  prerequis = NULL,
  pieces_a_fournir = ARRAY['Photo d''identité', 'Blouse fournie'],
  vacation_type = 'stage_journee',
  duration_days = 5,
  has_accommodation = FALSE,
  creneaux = '[{"jour": "lundi", "debut": "10:00", "fin": "16:00"}, {"jour": "mardi", "debut": "10:00", "fin": "16:00"}, {"jour": "mercredi", "debut": "10:00", "fin": "16:00"}, {"jour": "jeudi", "debut": "10:00", "fin": "16:00"}, {"jour": "vendredi", "debut": "10:00", "fin": "16:00"}]'::jsonb,
  period_type = 'vacances'
WHERE title = 'Stage sciences – Expériences et découvertes';

-- 29. Stage théâtre – Vacances Automne
UPDATE activities SET
  lieu_nom = 'Théâtre municipal - Salle de répétition',
  transport_info = 'Métro ligne B arrêt Théâtre',
  mobility_tc = 'Métro B, Bus 13',
  mobility_velo = TRUE,
  mobility_covoit = TRUE,
  sante_tags = ARRAY['Aucun certificat requis'],
  prerequis = NULL,
  pieces_a_fournir = ARRAY['Photo d''identité', 'Autorisation parentale', 'Tenue noire pour représentation finale'],
  vacation_type = 'stage_journee',
  duration_days = 5,
  has_accommodation = FALSE,
  creneaux = '[{"jour": "lundi", "debut": "10:00", "fin": "17:00"}, {"jour": "mardi", "debut": "10:00", "fin": "17:00"}, {"jour": "mercredi", "debut": "10:00", "fin": "17:00"}, {"jour": "jeudi", "debut": "10:00", "fin": "17:00"}, {"jour": "vendredi", "debut": "10:00", "fin": "17:00"}]'::jsonb,
  period_type = 'vacances'
WHERE title = 'Stage théâtre – Vacances Automne';

-- =====================================================
-- Mise à jour des jours_horaires depuis creneaux
-- =====================================================

UPDATE activities
SET jours_horaires = (
  SELECT string_agg(
    (c->>'jour') || ' ' || (c->>'debut') || '-' || (c->>'fin'),
    ', '
  )
  FROM jsonb_array_elements(creneaux) AS c
)
WHERE creneaux IS NOT NULL AND jsonb_array_length(creneaux) > 0;
