import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Fonction pour transformer les aides au format demandé
function transformAides(aides: string[]): string[] {
  const mapping: Record<string, string> = {
    'caf-sport': 'CAF/VACAF',
    'caf-loisirs': 'CAF/VACAF',
    'pass-sport': "Pass'Sport",
    'pass-culture': "Pass'Culture",
    'pass-culture-sport': "Pass'Culture+Sport",
    'bourse-collectivite': 'Bourse Collectivité',
    'coupon-sport': 'Coupon Sport',
    'aide-jeune-actif': 'ANCV',
    'ancv': 'ANCV'
  };
  
  const transformed = new Set<string>();
  aides.forEach(aide => {
    const mapped = mapping[aide] || aide;
    transformed.add(mapped);
  });
  
  return Array.from(transformed);
}

// Fonction pour transformer la mobilité au format simplifié
function transformMobilite(mobilite: any): { TC: string; velo: boolean; covoit: boolean } {
  const lignes = mobilite?.transportCommun?.lignes || [];
  const premiereLigne = lignes[0] || "Bus disponible";
  
  return {
    TC: `Ligne ${premiereLigne} STAS`,
    velo: mobilite?.velo?.disponible || false,
    covoit: mobilite?.covoiturage?.disponible || false
  };
}

const mockActivities = [
  {
    "id": "sport-judo-6-10",
    "theme": "Sport",
    "titre": "Judo pour débutants",
    "description": "Initiation au judo dans un dojo local. Apprentissage des chutes, prises de base et discipline.",
    "ageMin": 6,
    "ageMax": 10,
    "accessibilite": ["accessible-fauteuil", "boucle-magnetique"],
    "creneaux": [
      { "jour": "mercredi", "heureDebut": "14:00", "heureFin": "15:30" },
      { "jour": "samedi", "heureDebut": "10:00", "heureFin": "11:30" }
    ],
    "lieu": {
      "nom": "Dojo Municipal Beaulieu",
      "adresse": "12 Rue de la République, 42000 Saint-Étienne",
      "transport": "STAS Ligne T3 - Arrêt Beaulieu"
    },
    "cout": 180,
    "priceUnit": "par an",
    "aidesEligibles": ["caf-sport", "pass-sport", "bourse-collectivite"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["T3", "Bus 9"] },
      "velo": { "disponible": true, "station": "Vélivert Beaulieu" },
      "covoiturage": { "disponible": true }
    },
    "prerequis": ["certificat-medical"],
    "pieces": ["justificatif-domicile", "photo-identite"],
    "santeTags": ["motricite", "coordination"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "sport-escalade-13-17",
    "theme": "Sport",
    "titre": "Escalade Ados",
    "description": "Cours d'escalade en salle avec progression technique. Encadrement par moniteurs diplômés.",
    "ageMin": 13,
    "ageMax": 17,
    "accessibilite": ["adapte-mobilite-reduite"],
    "creneaux": [
      { "jour": "mardi", "heureDebut": "17:00", "heureFin": "19:00" },
      { "jour": "jeudi", "heureDebut": "17:00", "heureFin": "19:00" }
    ],
    "lieu": {
      "nom": "Salle d'Escalade Roc'n Wall",
      "adresse": "8 Avenue de Rochetaillée, 42100 Saint-Étienne",
      "transport": "STAS Bus 10 - Arrêt Rochetaillée"
    },
    "cout": 280,
    "priceUnit": "par an",
    "aidesEligibles": ["pass-sport", "aide-jeune-actif"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["Bus 10", "Bus 16"] },
      "velo": { "disponible": true, "station": "Vélivert Centre" },
      "covoiturage": { "disponible": true }
    },
    "prerequis": ["autorisation-parentale", "certificat-medical"],
    "pieces": ["carte-identite"],
    "santeTags": ["force", "endurance", "concentration"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "sport-natation-7-12",
    "theme": "Sport",
    "titre": "École de Natation",
    "description": "Apprentissage de la natation tous niveaux : du débutant au perfectionnement.",
    "ageMin": 7,
    "ageMax": 12,
    "accessibilite": ["vestiaires-adaptes", "acces-pmr"],
    "creneaux": [
      { "jour": "lundi", "heureDebut": "17:30", "heureFin": "18:30" },
      { "jour": "mercredi", "heureDebut": "15:00", "heureFin": "16:00" },
      { "jour": "vendredi", "heureDebut": "17:30", "heureFin": "18:30" }
    ],
    "lieu": {
      "nom": "Piscine Métare",
      "adresse": "Rue Paul Cézanne, 42100 Saint-Étienne",
      "transport": "STAS T2 - Arrêt Métare"
    },
    "cout": 220,
    "priceUnit": "par an",
    "aidesEligibles": ["caf-sport", "pass-sport", "coupon-sport"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["T2", "Bus 7"] },
      "velo": { "disponible": true, "station": "Vélivert Métare" },
      "covoiturage": { "disponible": false }
    },
    "prerequis": ["certificat-medical"],
    "pieces": ["photo-identite", "justificatif-domicile"],
    "santeTags": ["cardio", "motricite-aquatique"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "sport-football-6-10",
    "theme": "Sport",
    "titre": "Stage Football Vacances",
    "description": "Stage intensif pendant les vacances scolaires avec matchs et exercices techniques.",
    "ageMin": 6,
    "ageMax": 10,
    "accessibilite": [],
    "creneaux": [
      { "jour": "lundi-vendredi", "heureDebut": "09:00", "heureFin": "16:00", "periode": "vacances-fevrier" }
    ],
    "lieu": {
      "nom": "Stade Étivallière",
      "adresse": "15 Rue Étivallière, 42000 Saint-Étienne",
      "transport": "STAS Bus 3 - Arrêt Stade"
    },
    "cout": 120,
    "priceUnit": "pour la semaine de stage",
    "aidesEligibles": ["pass-sport", "bourse-collectivite"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["Bus 3", "Bus 11"] },
      "velo": { "disponible": true, "station": "Vélivert Stade" },
      "covoiturage": { "disponible": true }
    },
    "prerequis": ["certificat-medical"],
    "pieces": ["autorisation-parentale"],
    "santeTags": ["cardio", "coordination", "esprit-equipe"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "sport-multisports-7-12",
    "theme": "Sport",
    "titre": "Multisports Découverte",
    "description": "Découverte de plusieurs sports : basket, volley, handball, athlétisme en rotation.",
    "ageMin": 7,
    "ageMax": 12,
    "accessibilite": ["adapte-tous-handicaps"],
    "creneaux": [
      { "jour": "mercredi", "heureDebut": "14:00", "heureFin": "16:00" }
    ],
    "lieu": {
      "nom": "Gymnase Jean Jaurès",
      "adresse": "20 Cours Fauriel, 42100 Saint-Étienne",
      "transport": "STAS T1 - Arrêt Fauriel"
    },
    "cout": 150,
    "priceUnit": "par an",
    "aidesEligibles": ["caf-sport", "pass-sport"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["T1", "Bus 4"] },
      "velo": { "disponible": true, "station": "Vélivert Fauriel" },
      "covoiturage": { "disponible": true }
    },
    "prerequis": ["certificat-medical"],
    "pieces": ["justificatif-domicile"],
    "santeTags": ["motricite", "cardio", "decouverte-sportive"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "sport-tennis-11-17",
    "theme": "Sport",
    "titre": "Tennis Club Junior",
    "description": "Entraînement tennis tous niveaux avec possibilité de compétition interne.",
    "ageMin": 11,
    "ageMax": 17,
    "accessibilite": [],
    "creneaux": [
      { "jour": "mardi", "heureDebut": "18:00", "heureFin": "19:30" },
      { "jour": "samedi", "heureDebut": "14:00", "heureFin": "15:30" }
    ],
    "lieu": {
      "nom": "Tennis Club Saint-Étienne",
      "adresse": "5 Avenue de la Libération, 42000 Saint-Étienne",
      "transport": "STAS Bus 5 - Arrêt Libération"
    },
    "cout": 320,
    "priceUnit": "par an",
    "aidesEligibles": ["pass-sport"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["Bus 5"] },
      "velo": { "disponible": true, "station": "Vélivert Centre-ville" },
      "covoiturage": { "disponible": true }
    },
    "prerequis": ["certificat-medical"],
    "pieces": ["carte-identite"],
    "santeTags": ["coordination", "reflexes", "endurance"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "sport-danse-hip-hop-13-17",
    "theme": "Sport",
    "titre": "Hip-Hop & Breakdance",
    "description": "Cours de danse urbaine : hip-hop, breakdance, chorégraphies collectives.",
    "ageMin": 13,
    "ageMax": 17,
    "accessibilite": ["salle-accessible"],
    "creneaux": [
      { "jour": "mercredi", "heureDebut": "16:00", "heureFin": "18:00" },
      { "jour": "vendredi", "heureDebut": "19:00", "heureFin": "21:00" }
    ],
    "lieu": {
      "nom": "Studio Danse Urban",
      "adresse": "18 Rue Michelet, 42000 Saint-Étienne",
      "transport": "STAS T3 - Arrêt Michelet"
    },
    "cout": 200,
    "priceUnit": "par an",
    "aidesEligibles": ["pass-culture-sport", "aide-jeune-actif"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["T3", "Bus 12"] },
      "velo": { "disponible": true, "station": "Vélivert Carnot" },
      "covoiturage": { "disponible": true }
    },
    "prerequis": [],
    "pieces": ["autorisation-parentale"],
    "santeTags": ["motricite", "expression-corporelle", "creativite"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "sport-velo-7-12",
    "theme": "Sport",
    "titre": "École du Vélo",
    "description": "Apprentissage du vélo, sécurité routière et balades encadrées.",
    "ageMin": 7,
    "ageMax": 12,
    "accessibilite": [],
    "creneaux": [
      { "jour": "samedi", "heureDebut": "10:00", "heureFin": "12:00" }
    ],
    "lieu": {
      "nom": "Parc François Mitterrand",
      "adresse": "Avenue de la Libération, 42000 Saint-Étienne",
      "transport": "STAS Bus 5 - Arrêt Parc"
    },
    "cout": 80,
    "priceUnit": "par an",
    "aidesEligibles": ["bourse-collectivite"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["Bus 5", "T1"] },
      "velo": { "disponible": true, "station": "Vélivert Parc" },
      "covoiturage": { "disponible": false }
    },
    "prerequis": [],
    "pieces": ["autorisation-parentale"],
    "santeTags": ["equilibre", "autonomie", "securite-routiere"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "culture-theatre-6-10",
    "theme": "Culture",
    "titre": "Atelier Théâtre Enfants",
    "description": "Initiation au théâtre : improvisation, jeux de rôle, expression scénique.",
    "ageMin": 6,
    "ageMax": 10,
    "accessibilite": ["salle-accessible", "interpretation-signes"],
    "creneaux": [
      { "jour": "mercredi", "heureDebut": "14:30", "heureFin": "16:00" }
    ],
    "lieu": {
      "nom": "Théâtre du Parc",
      "adresse": "10 Place Jean Jaurès, 42000 Saint-Étienne",
      "transport": "STAS T1 - Arrêt Jaurès"
    },
    "cout": 160,
    "priceUnit": "par an",
    "aidesEligibles": ["pass-culture", "caf-loisirs"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["T1", "Bus 8"] },
      "velo": { "disponible": true, "station": "Vélivert Jaurès" },
      "covoiturage": { "disponible": true }
    },
    "prerequis": [],
    "pieces": ["justificatif-domicile"],
    "santeTags": ["expression-orale", "confiance-en-soi", "creativite"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "culture-musique-7-12",
    "theme": "Culture",
    "titre": "Initiation Musicale",
    "description": "Découverte des instruments : piano, guitare, percussions. Solfège ludique inclus.",
    "ageMin": 7,
    "ageMax": 12,
    "accessibilite": ["acces-pmr"],
    "creneaux": [
      { "jour": "lundi", "heureDebut": "17:00", "heureFin": "18:00" },
      { "jour": "jeudi", "heureDebut": "17:00", "heureFin": "18:00" }
    ],
    "lieu": {
      "nom": "Conservatoire Municipal",
      "adresse": "5 Rue Blanqui, 42000 Saint-Étienne",
      "transport": "STAS T2 - Arrêt Blanqui"
    },
    "cout": 240,
    "priceUnit": "par an",
    "aidesEligibles": ["pass-culture", "bourse-collectivite"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["T2", "Bus 6"] },
      "velo": { "disponible": true, "station": "Vélivert Opéra" },
      "covoiturage": { "disponible": false }
    },
    "prerequis": [],
    "pieces": ["photo-identite"],
    "santeTags": ["concentration", "coordination", "creativite-musicale"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "culture-arts-plastiques-6-10",
    "theme": "Culture",
    "titre": "Arts Plastiques Juniors",
    "description": "Peinture, modelage, collage : exploration de différentes techniques artistiques.",
    "ageMin": 6,
    "ageMax": 10,
    "accessibilite": ["adapte-tous-handicaps"],
    "creneaux": [
      { "jour": "mercredi", "heureDebut": "15:00", "heureFin": "16:30" }
    ],
    "lieu": {
      "nom": "Maison des Arts",
      "adresse": "12 Rue des Arts, 42000 Saint-Étienne",
      "transport": "STAS Bus 9 - Arrêt Arts"
    },
    "cout": 120,
    "priceUnit": "par an",
    "aidesEligibles": ["pass-culture", "caf-loisirs"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["Bus 9"] },
      "velo": { "disponible": true, "station": "Vélivert Centre" },
      "covoiturage": { "disponible": true }
    },
    "prerequis": [],
    "pieces": ["autorisation-parentale"],
    "santeTags": ["motricite-fine", "creativite", "expression-artistique"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "culture-cinema-13-17",
    "theme": "Culture",
    "titre": "Atelier Cinéma Ados",
    "description": "Réalisation de courts-métrages : écriture, tournage, montage. Projections en fin d'année.",
    "ageMin": 13,
    "ageMax": 17,
    "accessibilite": ["sous-titres", "salle-accessible"],
    "creneaux": [
      { "jour": "samedi", "heureDebut": "14:00", "heureFin": "17:00" }
    ],
    "lieu": {
      "nom": "Cinéma Le Méliès",
      "adresse": "3 Place Carnot, 42000 Saint-Étienne",
      "transport": "STAS T1 - Arrêt Carnot"
    },
    "cout": 180,
    "priceUnit": "par an",
    "aidesEligibles": ["pass-culture", "aide-jeune-actif"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["T1", "T3"] },
      "velo": { "disponible": true, "station": "Vélivert Carnot" },
      "covoiturage": { "disponible": true }
    },
    "prerequis": [],
    "pieces": ["carte-identite"],
    "santeTags": ["creativite", "travail-equipe", "culture-visuelle"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "culture-dessin-manga-11-17",
    "theme": "Culture",
    "titre": "Cours de Dessin Manga",
    "description": "Techniques de dessin manga et création de personnages. Du crayonné à l'encrage.",
    "ageMin": 11,
    "ageMax": 17,
    "accessibilite": [],
    "creneaux": [
      { "jour": "mercredi", "heureDebut": "14:00", "heureFin": "16:00" }
    ],
    "lieu": {
      "nom": "Médiathèque Tarentaize",
      "adresse": "20 Rue Tarentaize, 42000 Saint-Étienne",
      "transport": "STAS Bus 10 - Arrêt Tarentaize"
    },
    "cout": 140,
    "priceUnit": "par an",
    "aidesEligibles": ["pass-culture"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["Bus 10", "T2"] },
      "velo": { "disponible": true, "station": "Vélivert Médiathèque" },
      "covoiturage": { "disponible": false }
    },
    "prerequis": [],
    "pieces": ["autorisation-parentale"],
    "santeTags": ["concentration", "creativite", "motricite-fine"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "culture-photographie-13-17",
    "theme": "Culture",
    "titre": "Atelier Photo Numérique",
    "description": "Initiation à la photographie : cadrage, lumière, retouche. Sorties photo en ville.",
    "ageMin": 13,
    "ageMax": 17,
    "accessibilite": ["adapte-malvoyants"],
    "creneaux": [
      { "jour": "vendredi", "heureDebut": "17:00", "heureFin": "19:00" }
    ],
    "lieu": {
      "nom": "Centre Culturel Beaulieu",
      "adresse": "8 Avenue Beaulieu, 42000 Saint-Étienne",
      "transport": "STAS T3 - Arrêt Beaulieu"
    },
    "cout": 200,
    "priceUnit": "par an",
    "aidesEligibles": ["pass-culture", "aide-jeune-actif"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["T3", "Bus 9"] },
      "velo": { "disponible": true, "station": "Vélivert Beaulieu" },
      "covoiturage": { "disponible": true }
    },
    "prerequis": [],
    "pieces": ["carte-identite"],
    "santeTags": ["observation", "creativite-visuelle", "culture-artistique"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "culture-danse-classique-6-10",
    "theme": "Culture",
    "titre": "Danse Classique Initiation",
    "description": "Cours de danse classique avec spectacle de fin d'année. Bases du ballet.",
    "ageMin": 6,
    "ageMax": 10,
    "accessibilite": ["adapte-mobilite-legere"],
    "creneaux": [
      { "jour": "mercredi", "heureDebut": "13:30", "heureFin": "14:30" },
      { "jour": "samedi", "heureDebut": "10:30", "heureFin": "11:30" }
    ],
    "lieu": {
      "nom": "École de Danse Élégance",
      "adresse": "15 Rue Bergson, 42000 Saint-Étienne",
      "transport": "STAS Bus 4 - Arrêt Bergson"
    },
    "cout": 190,
    "priceUnit": "par an",
    "aidesEligibles": ["caf-loisirs", "pass-culture-sport"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["Bus 4"] },
      "velo": { "disponible": true, "station": "Vélivert Fauriel" },
      "covoiturage": { "disponible": true }
    },
    "prerequis": ["certificat-medical"],
    "pieces": ["photo-identite"],
    "santeTags": ["souplesse", "posture", "grace"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "culture-chorale-7-12",
    "theme": "Culture",
    "titre": "Chorale Enfants",
    "description": "Chant choral avec répertoire varié : classique, moderne, chansons françaises.",
    "ageMin": 7,
    "ageMax": 12,
    "accessibilite": ["interpretation-signes"],
    "creneaux": [
      { "jour": "mardi", "heureDebut": "17:30", "heureFin": "18:30" }
    ],
    "lieu": {
      "nom": "Salle Municipale Fauriel",
      "adresse": "Cours Fauriel, 42100 Saint-Étienne",
      "transport": "STAS T1 - Arrêt Fauriel"
    },
    "cout": 100,
    "priceUnit": "par an",
    "aidesEligibles": ["pass-culture", "bourse-collectivite"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["T1", "Bus 4"] },
      "velo": { "disponible": true, "station": "Vélivert Fauriel" },
      "covoiturage": { "disponible": false }
    },
    "prerequis": [],
    "pieces": ["autorisation-parentale"],
    "santeTags": ["expression-vocale", "confiance-en-soi", "travail-equipe"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "culture-ecriture-creative-11-17",
    "theme": "Culture",
    "titre": "Atelier d'Écriture Créative",
    "description": "Écriture de nouvelles, poésie, récits. Publication d'un recueil collectif.",
    "ageMin": 11,
    "ageMax": 17,
    "accessibilite": ["livres-audio"],
    "creneaux": [
      { "jour": "jeudi", "heureDebut": "17:00", "heureFin": "19:00" }
    ],
    "lieu": {
      "nom": "Médiathèque Tarentaize",
      "adresse": "20 Rue Tarentaize, 42000 Saint-Étienne",
      "transport": "STAS Bus 10 - Arrêt Tarentaize"
    },
    "cout": 130,
    "priceUnit": "par an",
    "aidesEligibles": ["pass-culture"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["Bus 10", "T2"] },
      "velo": { "disponible": true, "station": "Vélivert Médiathèque" },
      "covoiturage": { "disponible": false }
    },
    "prerequis": [],
    "pieces": ["carte-identite"],
    "santeTags": ["expression-ecrite", "imagination", "concentration"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "loisirs-echecs-7-12",
    "theme": "Loisirs",
    "titre": "Club d'Échecs Junior",
    "description": "Apprentissage du jeu d'échecs avec tournois internes. Tous niveaux acceptés.",
    "ageMin": 7,
    "ageMax": 12,
    "accessibilite": ["adapte-malvoyants"],
    "creneaux": [
      { "jour": "mercredi", "heureDebut": "14:00", "heureFin": "16:00" }
    ],
    "lieu": {
      "nom": "Maison de Quartier Beaubrun",
      "adresse": "18 Rue Beaubrun, 42000 Saint-Étienne",
      "transport": "STAS Bus 7 - Arrêt Beaubrun"
    },
    "cout": 90,
    "priceUnit": "par an",
    "aidesEligibles": ["caf-loisirs"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["Bus 7", "T2"] },
      "velo": { "disponible": true, "station": "Vélivert Carnot" },
      "covoiturage": { "disponible": false }
    },
    "prerequis": [],
    "pieces": ["autorisation-parentale"],
    "santeTags": ["reflexion", "strategie", "patience"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "loisirs-cuisine-6-10",
    "theme": "Loisirs",
    "titre": "Atelier Cuisine Enfants",
    "description": "Recettes simples et gourmandes : gâteaux, pizzas, smoothies. Découverte des saveurs.",
    "ageMin": 6,
    "ageMax": 10,
    "accessibilite": ["adapte-allergies"],
    "creneaux": [
      { "jour": "samedi", "heureDebut": "10:00", "heureFin": "12:00" }
    ],
    "lieu": {
      "nom": "Centre Social La Palle",
      "adresse": "10 Rue de la Palle, 42000 Saint-Étienne",
      "transport": "STAS Bus 11 - Arrêt La Palle"
    },
    "cout": 110,
    "priceUnit": "par an",
    "aidesEligibles": ["caf-loisirs", "bourse-collectivite"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["Bus 11"] },
      "velo": { "disponible": true, "station": "Vélivert Centre" },
      "covoiturage": { "disponible": true }
    },
    "prerequis": [],
    "pieces": ["justificatif-allergies"],
    "santeTags": ["autonomie", "decouverte-saveurs", "creativite-culinaire"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "loisirs-robotique-11-17",
    "theme": "Loisirs",
    "titre": "Atelier Robotique & Code",
    "description": "Programmation et construction de robots avec Lego Mindstorms et Arduino.",
    "ageMin": 11,
    "ageMax": 17,
    "accessibilite": ["adapte-tous-handicaps"],
    "creneaux": [
      { "jour": "samedi", "heureDebut": "14:00", "heureFin": "16:00" }
    ],
    "lieu": {
      "nom": "FabLab Saint-Étienne",
      "adresse": "25 Rue de la Montat, 42000 Saint-Étienne",
      "transport": "STAS T3 - Arrêt Montat"
    },
    "cout": 250,
    "priceUnit": "par an",
    "aidesEligibles": ["pass-numerique"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["T3", "Bus 15"] },
      "velo": { "disponible": true, "station": "Vélivert Carnot" },
      "covoiturage": { "disponible": true }
    },
    "prerequis": [],
    "pieces": ["carte-identite"],
    "santeTags": ["logique", "creativite-technique", "travail-equipe"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "loisirs-jardinage-7-12",
    "theme": "Loisirs",
    "titre": "Jardin Pédagogique",
    "description": "Initiation au jardinage : plantations, entretien, récolte. Sensibilisation à l'écologie.",
    "ageMin": 7,
    "ageMax": 12,
    "accessibilite": ["acces-pmr"],
    "creneaux": [
      { "jour": "mercredi", "heureDebut": "14:30", "heureFin": "16:30" }
    ],
    "lieu": {
      "nom": "Jardin Partagé de Montreynaud",
      "adresse": "Rue de Montreynaud, 42100 Saint-Étienne",
      "transport": "STAS Bus 12 - Arrêt Montreynaud"
    },
    "cout": 70,
    "priceUnit": "par an",
    "aidesEligibles": ["caf-loisirs"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["Bus 12"] },
      "velo": { "disponible": true, "station": "Vélivert Montreynaud" },
      "covoiturage": { "disponible": false }
    },
    "prerequis": [],
    "pieces": ["autorisation-parentale"],
    "santeTags": ["contact-nature", "patience", "ecologie"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "loisirs-jeux-societe-6-10",
    "theme": "Loisirs",
    "titre": "Club Jeux de Société",
    "description": "Découverte de jeux de plateau modernes et classiques. Ambiance conviviale.",
    "ageMin": 6,
    "ageMax": 10,
    "accessibilite": ["adapte-malvoyants", "interpretation-signes"],
    "creneaux": [
      { "jour": "mercredi", "heureDebut": "15:00", "heureFin": "17:00" }
    ],
    "lieu": {
      "nom": "Ludothèque Municipale",
      "adresse": "8 Rue du Général Foy, 42000 Saint-Étienne",
      "transport": "STAS T1 - Arrêt Foy"
    },
    "cout": 60,
    "priceUnit": "par an",
    "aidesEligibles": ["caf-loisirs"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["T1", "Bus 5"] },
      "velo": { "disponible": true, "station": "Vélivert Centre" },
      "covoiturage": { "disponible": false }
    },
    "prerequis": [],
    "pieces": [],
    "santeTags": ["reflexion", "socialisation", "cooperation"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "loisirs-magie-11-17",
    "theme": "Loisirs",
    "titre": "Atelier Magie & Illusion",
    "description": "Apprentissage de tours de magie et techniques d'illusion. Spectacle de fin d'année.",
    "ageMin": 11,
    "ageMax": 17,
    "accessibilite": [],
    "creneaux": [
      { "jour": "vendredi", "heureDebut": "18:00", "heureFin": "20:00" }
    ],
    "lieu": {
      "nom": "Salle Polyvalente Châteaucreux",
      "adresse": "Place Châteaucreux, 42000 Saint-Étienne",
      "transport": "STAS T1 - Arrêt Châteaucreux"
    },
    "cout": 140,
    "priceUnit": "par an",
    "aidesEligibles": [],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["T1", "T2", "T3"] },
      "velo": { "disponible": true, "station": "Vélivert Gare" },
      "covoiturage": { "disponible": true }
    },
    "prerequis": [],
    "pieces": ["carte-identite"],
    "santeTags": ["dexterite", "presentation-publique", "creativite"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "loisirs-bricolage-7-12",
    "theme": "Loisirs",
    "titre": "Atelier Brico Kids",
    "description": "Petits bricolages créatifs : cadres, maquettes, objets déco. Sécurité assurée.",
    "ageMin": 7,
    "ageMax": 12,
    "accessibilite": ["supervision-renforcee"],
    "creneaux": [
      { "jour": "samedi", "heureDebut": "14:00", "heureFin": "16:00" }
    ],
    "lieu": {
      "nom": "Centre Social Beaubrun",
      "adresse": "18 Rue Beaubrun, 42000 Saint-Étienne",
      "transport": "STAS Bus 7 - Arrêt Beaubrun"
    },
    "cout": 80,
    "priceUnit": "par an",
    "aidesEligibles": ["caf-loisirs"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["Bus 7", "T2"] },
      "velo": { "disponible": true, "station": "Vélivert Carnot" },
      "covoiturage": { "disponible": false }
    },
    "prerequis": [],
    "pieces": ["autorisation-parentale"],
    "santeTags": ["motricite-fine", "creativite-manuelle", "concentration"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "loisirs-yoga-enfants-6-10",
    "theme": "Loisirs",
    "titre": "Yoga pour Enfants",
    "description": "Séances de yoga ludiques avec relaxation et jeux de respiration.",
    "ageMin": 6,
    "ageMax": 10,
    "accessibilite": ["adapte-tous-handicaps"],
    "creneaux": [
      { "jour": "mercredi", "heureDebut": "16:00", "heureFin": "17:00" }
    ],
    "lieu": {
      "nom": "Studio Zen Attitude",
      "adresse": "5 Rue Gambetta, 42000 Saint-Étienne",
      "transport": "STAS T2 - Arrêt Gambetta"
    },
    "cout": 130,
    "priceUnit": "par an",
    "aidesEligibles": ["caf-loisirs"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["T2", "Bus 6"] },
      "velo": { "disponible": true, "station": "Vélivert Opéra" },
      "covoiturage": { "disponible": false }
    },
    "prerequis": [],
    "pieces": [],
    "santeTags": ["detente", "souplesse", "concentration"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "loisirs-video-gaming-13-17",
    "theme": "Loisirs",
    "titre": "Club Gaming & E-Sport",
    "description": "Tournois de jeux vidéo encadrés. Sensibilisation au jeu responsable.",
    "ageMin": 13,
    "ageMax": 17,
    "accessibilite": ["adapte-handicap-moteur"],
    "creneaux": [
      { "jour": "samedi", "heureDebut": "14:00", "heureFin": "18:00" }
    ],
    "lieu": {
      "nom": "Cyber Espace Saint-Étienne",
      "adresse": "12 Place Fourneyron, 42000 Saint-Étienne",
      "transport": "STAS T3 - Arrêt Fourneyron"
    },
    "cout": 100,
    "priceUnit": "par an",
    "aidesEligibles": [],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["T3", "Bus 8"] },
      "velo": { "disponible": true, "station": "Vélivert Centre" },
      "covoiturage": { "disponible": true }
    },
    "prerequis": ["autorisation-parentale"],
    "pieces": ["carte-identite"],
    "santeTags": ["reflexes", "strategie", "esprit-equipe"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "scolarite-soutien-maths-7-12",
    "theme": "Scolarité",
    "titre": "Soutien Scolaire Maths",
    "description": "Aide aux devoirs et renforcement en mathématiques. Petits groupes de 5 élèves max.",
    "ageMin": 7,
    "ageMax": 12,
    "accessibilite": ["adapte-dys"],
    "creneaux": [
      { "jour": "lundi", "heureDebut": "17:00", "heureFin": "18:30" },
      { "jour": "jeudi", "heureDebut": "17:00", "heureFin": "18:30" }
    ],
    "lieu": {
      "nom": "Centre de Soutien Réussite",
      "adresse": "15 Rue Michelet, 42000 Saint-Étienne",
      "transport": "STAS T3 - Arrêt Michelet"
    },
    "cout": 200,
    "priceUnit": "par an",
    "aidesEligibles": ["bourse-scolaire", "caf-education"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["T3", "Bus 12"] },
      "velo": { "disponible": true, "station": "Vélivert Carnot" },
      "covoiturage": { "disponible": false }
    },
    "prerequis": [],
    "pieces": ["bulletin-scolaire"],
    "santeTags": ["concentration", "logique"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "scolarite-francais-6-10",
    "theme": "Scolarité",
    "titre": "Atelier Lecture & Écriture",
    "description": "Renforcement en français : lecture fluide, orthographe, expression écrite.",
    "ageMin": 6,
    "ageMax": 10,
    "accessibilite": ["adapte-dys", "livres-audio"],
    "creneaux": [
      { "jour": "mardi", "heureDebut": "16:30", "heureFin": "18:00" }
    ],
    "lieu": {
      "nom": "Médiathèque Tarentaize",
      "adresse": "20 Rue Tarentaize, 42000 Saint-Étienne",
      "transport": "STAS Bus 10 - Arrêt Tarentaize"
    },
    "cout": 150,
    "priceUnit": "par an",
    "aidesEligibles": ["bourse-scolaire", "caf-education"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["Bus 10", "T2"] },
      "velo": { "disponible": true, "station": "Vélivert Médiathèque" },
      "covoiturage": { "disponible": false }
    },
    "prerequis": [],
    "pieces": ["bulletin-scolaire"],
    "santeTags": ["expression-ecrite", "concentration"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "scolarite-anglais-11-17",
    "theme": "Scolarité",
    "titre": "Cours d'Anglais Conversationnel",
    "description": "Pratique orale de l'anglais en petits groupes avec locuteur natif.",
    "ageMin": 11,
    "ageMax": 17,
    "accessibilite": [],
    "creneaux": [
      { "jour": "mercredi", "heureDebut": "14:00", "heureFin": "15:30" },
      { "jour": "samedi", "heureDebut": "10:00", "heureFin": "11:30" }
    ],
    "lieu": {
      "nom": "École de Langues Polyglotte",
      "adresse": "8 Place Dorian, 42000 Saint-Étienne",
      "transport": "STAS T1 - Arrêt Dorian"
    },
    "cout": 280,
    "priceUnit": "par an",
    "aidesEligibles": ["bourse-scolaire"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["T1", "Bus 5"] },
      "velo": { "disponible": true, "station": "Vélivert Dorian" },
      "covoiturage": { "disponible": true }
    },
    "prerequis": [],
    "pieces": ["bulletin-scolaire"],
    "santeTags": ["expression-orale", "ouverture-culturelle"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "scolarite-sciences-7-12",
    "theme": "Scolarité",
    "titre": "Club Sciences & Expériences",
    "description": "Expériences scientifiques ludiques : chimie, physique, biologie. Méthode active.",
    "ageMin": 7,
    "ageMax": 12,
    "accessibilite": ["supervision-securite"],
    "creneaux": [
      { "jour": "mercredi", "heureDebut": "14:00", "heureFin": "16:00" }
    ],
    "lieu": {
      "nom": "Maison de la Science",
      "adresse": "10 Rue Claude Bernard, 42000 Saint-Étienne",
      "transport": "STAS Bus 9 - Arrêt Bernard"
    },
    "cout": 160,
    "priceUnit": "par an",
    "aidesEligibles": ["bourse-scolaire", "pass-culture"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["Bus 9"] },
      "velo": { "disponible": true, "station": "Vélivert Centre" },
      "covoiturage": { "disponible": false }
    },
    "prerequis": [],
    "pieces": ["autorisation-parentale"],
    "santeTags": ["curiosite", "logique", "experimentation"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "scolarite-orientation-13-17",
    "theme": "Scolarité",
    "titre": "Atelier Orientation & Métiers",
    "description": "Découverte des métiers, aide à l'orientation, coaching scolaire.",
    "ageMin": 13,
    "ageMax": 17,
    "accessibilite": [],
    "creneaux": [
      { "jour": "samedi", "heureDebut": "14:00", "heureFin": "16:00" }
    ],
    "lieu": {
      "nom": "Centre d'Information Jeunesse",
      "adresse": "5 Place Jean Jaurès, 42000 Saint-Étienne",
      "transport": "STAS T1 - Arrêt Jaurès"
    },
    "cout": 0,
    "priceUnit": "gratuit",
    "aidesEligibles": [],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["T1", "Bus 8"] },
      "velo": { "disponible": true, "station": "Vélivert Jaurès" },
      "covoiturage": { "disponible": false }
    },
    "prerequis": [],
    "pieces": [],
    "santeTags": ["projet-professionnel", "confiance-en-soi"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "scolarite-code-informatique-11-17",
    "theme": "Scolarité",
    "titre": "Initiation au Code Informatique",
    "description": "Apprentissage Python et Scratch. Projets concrets et jeux programmables.",
    "ageMin": 11,
    "ageMax": 17,
    "accessibilite": ["adapte-tous-handicaps"],
    "creneaux": [
      { "jour": "samedi", "heureDebut": "10:00", "heureFin": "12:00" }
    ],
    "lieu": {
      "nom": "FabLab Saint-Étienne",
      "adresse": "25 Rue de la Montat, 42000 Saint-Étienne",
      "transport": "STAS T3 - Arrêt Montat"
    },
    "cout": 220,
    "priceUnit": "par an",
    "aidesEligibles": ["pass-numerique", "bourse-scolaire"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["T3", "Bus 15"] },
      "velo": { "disponible": true, "station": "Vélivert Carnot" },
      "covoiturage": { "disponible": true }
    },
    "prerequis": [],
    "pieces": ["carte-identite"],
    "santeTags": ["logique", "creativite-technique", "competence-numerique"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "scolarite-methodologie-7-12",
    "theme": "Scolarité",
    "titre": "Atelier Méthodologie & Organisation",
    "description": "Apprendre à apprendre : gestion du temps, mémorisation, prise de notes.",
    "ageMin": 7,
    "ageMax": 12,
    "accessibilite": ["adapte-tdah"],
    "creneaux": [
      { "jour": "mercredi", "heureDebut": "15:00", "heureFin": "16:30" }
    ],
    "lieu": {
      "nom": "Centre Éducatif Fauriel",
      "adresse": "Cours Fauriel, 42100 Saint-Étienne",
      "transport": "STAS T1 - Arrêt Fauriel"
    },
    "cout": 140,
    "priceUnit": "par an",
    "aidesEligibles": ["bourse-scolaire", "caf-education"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["T1", "Bus 4"] },
      "velo": { "disponible": true, "station": "Vélivert Fauriel" },
      "covoiturage": { "disponible": false }
    },
    "prerequis": [],
    "pieces": ["bulletin-scolaire"],
    "santeTags": ["organisation", "autonomie", "concentration"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "scolarite-histoire-geo-13-17",
    "theme": "Scolarité",
    "titre": "Soutien Histoire-Géographie",
    "description": "Révisions brevet/lycée : synthèses de cours, méthodologie dissertation.",
    "ageMin": 13,
    "ageMax": 17,
    "accessibilite": [],
    "creneaux": [
      { "jour": "jeudi", "heureDebut": "17:00", "heureFin": "19:00" }
    ],
    "lieu": {
      "nom": "Centre de Soutien Réussite",
      "adresse": "15 Rue Michelet, 42000 Saint-Étienne",
      "transport": "STAS T3 - Arrêt Michelet"
    },
    "cout": 190,
    "priceUnit": "par an",
    "aidesEligibles": ["bourse-scolaire"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["T3", "Bus 12"] },
      "velo": { "disponible": true, "station": "Vélivert Carnot" },
      "covoiturage": { "disponible": false }
    },
    "prerequis": [],
    "pieces": ["bulletin-scolaire"],
    "santeTags": ["memoire", "analyse"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "vacances-sejour-montagne-11-17",
    "theme": "Vacances",
    "titre": "Séjour Montagne Hiver",
    "description": "Séjour 5 jours à la montagne : ski, raquettes, veillées. Hébergement en chalet. Les enfants dorment sur place avec encadrement 24h/24.",
    "ageMin": 11,
    "ageMax": 17,
    "accessibilite": [],
    "creneaux": [
      { "jour": "lundi-vendredi", "heureDebut": "09:00", "heureFin": "17:00", "periode": "vacances-fevrier" }
    ],
    "lieu": {
      "nom": "Chalet Les Crêtes - Pilat",
      "adresse": "Station du Bessat, 42660 Le Bessat",
      "transport": "Transport organisé depuis Saint-Étienne"
    },
    "cout": 520,
    "vacationType": "sejour_hebergement",
    "priceUnit": "par semaine de séjour",
    "durationDays": 5,
    "hasAccommodation": true,
    "aidesEligibles": ["caf-vacances", "bourse-collectivite", "pass-sport"],
    "mobilite": {
      "transportCommun": { "disponible": false },
      "velo": { "disponible": false },
      "covoiturage": { "disponible": false }
    },
    "prerequis": ["autorisation-parentale", "certificat-medical", "assurance-ski"],
    "pieces": ["carte-identite", "carnet-sante"],
    "santeTags": ["sport-hiver", "autonomie", "vie-collective"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "vacances-centre-aere-6-10",
    "theme": "Vacances",
    "titre": "Centre Aéré Multithèmes",
    "description": "Accueil journée complète avec activités variées : sport, arts, jeux, sorties. Les enfants rentrent à la maison chaque soir.",
    "ageMin": 6,
    "ageMax": 10,
    "accessibilite": ["adapte-tous-handicaps"],
    "creneaux": [
      { "jour": "lundi-vendredi", "heureDebut": "08:00", "heureFin": "18:00", "periode": "vacances-toutes" }
    ],
    "lieu": {
      "nom": "Centre de Loisirs Beaulieu",
      "adresse": "12 Rue de la République, 42000 Saint-Étienne",
      "transport": "STAS Ligne T3 - Arrêt Beaulieu"
    },
    "cout": 15,
    "vacationType": "centre_loisirs",
    "priceUnit": "par journée",
    "durationDays": 1,
    "hasAccommodation": false,
    "aidesEligibles": ["caf-vacances", "quotient-familial"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["T3", "Bus 9"] },
      "velo": { "disponible": false },
      "covoiturage": { "disponible": true }
    },
    "prerequis": ["autorisation-parentale"],
    "pieces": ["carnet-sante", "justificatif-vaccinations"],
    "santeTags": ["socialisation", "decouverte", "vie-collective"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "vacances-stage-theatre-7-12",
    "theme": "Vacances",
    "titre": "Stage Théâtre Intensif",
    "description": "Stage 3 jours avec création et représentation d'une pièce courte. Accueil de jour uniquement, retour à la maison chaque soir.",
    "ageMin": 7,
    "ageMax": 12,
    "accessibilite": ["salle-accessible"],
    "creneaux": [
      { "jour": "mardi-jeudi", "heureDebut": "10:00", "heureFin": "16:00", "periode": "vacances-avril" }
    ],
    "lieu": {
      "nom": "Théâtre du Parc",
      "adresse": "10 Place Jean Jaurès, 42000 Saint-Étienne",
      "transport": "STAS T1 - Arrêt Jaurès"
    },
    "cout": 90,
    "vacationType": "stage_journee",
    "priceUnit": "pour les 3 jours",
    "durationDays": 3,
    "hasAccommodation": false,
    "aidesEligibles": ["pass-culture", "caf-loisirs"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["T1", "Bus 8"] },
      "velo": { "disponible": true, "station": "Vélivert Jaurès" },
      "covoiturage": { "disponible": false }
    },
    "prerequis": [],
    "pieces": ["autorisation-parentale"],
    "santeTags": ["expression-orale", "creativite", "confiance-en-soi"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "vacances-camp-nature-7-12",
    "theme": "Vacances",
    "titre": "Camp Nature & Aventure",
    "description": "Séjour 4 jours en pleine nature : randonnée, orientation, bivouac. Les enfants dorment sur place en tente avec encadrement diplômé.",
    "ageMin": 7,
    "ageMax": 12,
    "accessibilite": [],
    "creneaux": [
      { "jour": "lundi-jeudi", "heureDebut": "09:00", "heureFin": "17:00", "periode": "vacances-juillet" }
    ],
    "lieu": {
      "nom": "Base Nature Pilat",
      "adresse": "Route du Pilat, 42410 Pélussin",
      "transport": "Transport organisé depuis Saint-Étienne"
    },
    "cout": 580,
    "vacationType": "sejour_hebergement",
    "priceUnit": "pour les 4 jours/3 nuits",
    "durationDays": 4,
    "hasAccommodation": true,
    "aidesEligibles": ["caf-vacances", "bourse-collectivite"],
    "mobilite": {
      "transportCommun": { "disponible": false },
      "velo": { "disponible": false },
      "covoiturage": { "disponible": false }
    },
    "prerequis": ["autorisation-parentale", "certificat-medical"],
    "pieces": ["carnet-sante", "assurance-extrascolaire"],
    "santeTags": ["autonomie", "nature", "aventure"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "vacances-stage-arts-plastiques-11-17",
    "theme": "Vacances",
    "titre": "Stage Arts Plastiques Ados",
    "description": "Stage 5 jours avec exposition finale : peinture, sculpture, photo. Accueil de jour, retour à la maison chaque soir.",
    "ageMin": 11,
    "ageMax": 17,
    "accessibilite": ["adapte-tous-handicaps"],
    "creneaux": [
      { "jour": "lundi-vendredi", "heureDebut": "10:00", "heureFin": "16:00", "periode": "vacances-octobre" }
    ],
    "lieu": {
      "nom": "Maison des Arts",
      "adresse": "12 Rue des Arts, 42000 Saint-Étienne",
      "transport": "STAS Bus 9 - Arrêt Arts"
    },
    "cout": 150,
    "vacationType": "stage_journee",
    "priceUnit": "pour la semaine de stage",
    "durationDays": 5,
    "hasAccommodation": false,
    "aidesEligibles": ["pass-culture"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["Bus 9"] },
      "velo": { "disponible": true, "station": "Vélivert Centre" },
      "covoiturage": { "disponible": true }
    },
    "prerequis": [],
    "pieces": ["carte-identite"],
    "santeTags": ["creativite", "expression-artistique", "technique-artistique"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "vacances-sejour-linguistique-13-17",
    "theme": "Vacances",
    "titre": "Séjour Linguistique Anglais",
    "description": "Séjour 7 jours immersion anglaise avec cours et activités culturelles. Hébergement en famille d'accueil, pension complète.",
    "ageMin": 13,
    "ageMax": 17,
    "accessibilite": [],
    "creneaux": [
      { "jour": "dimanche-samedi", "heureDebut": "00:00", "heureFin": "23:59", "periode": "vacances-juillet" }
    ],
    "lieu": {
      "nom": "Centre Linguistique Lyon",
      "adresse": "Hébergement en famille d'accueil région lyonnaise",
      "transport": "Transport collectif organisé"
    },
    "cout": 680,
    "vacationType": "sejour_hebergement",
    "priceUnit": "par semaine de séjour",
    "durationDays": 7,
    "hasAccommodation": true,
    "aidesEligibles": ["bourse-scolaire"],
    "mobilite": {
      "transportCommun": { "disponible": false },
      "velo": { "disponible": false },
      "covoiturage": { "disponible": false }
    },
    "prerequis": ["autorisation-parentale", "niveau-anglais-A2"],
    "pieces": ["passeport", "autorisation-sortie-territoire"],
    "santeTags": ["ouverture-culturelle", "expression-orale", "autonomie"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "vacances-stage-escalade-11-17",
    "theme": "Vacances",
    "titre": "Stage Escalade Perfectionnement",
    "description": "Stage 3 jours en salle + falaise naturelle avec progression technique. Accueil de jour, retour à la maison chaque soir.",
    "ageMin": 11,
    "ageMax": 17,
    "accessibilite": [],
    "creneaux": [
      { "jour": "lundi-mercredi", "heureDebut": "09:00", "heureFin": "17:00", "periode": "vacances-avril" }
    ],
    "lieu": {
      "nom": "Salle d'Escalade Roc'n Wall + Site naturel Pilat",
      "adresse": "8 Avenue de Rochetaillée, 42100 Saint-Étienne",
      "transport": "STAS Bus 10 + transport organisé pour falaise"
    },
    "cout": 180,
    "vacationType": "stage_journee",
    "priceUnit": "pour les 3 jours",
    "durationDays": 3,
    "hasAccommodation": false,
    "aidesEligibles": ["pass-sport"],
    "mobilite": {
      "transportCommun": { "disponible": true, "lignes": ["Bus 10"] },
      "velo": { "disponible": false },
      "covoiturage": { "disponible": true }
    },
    "prerequis": ["certificat-medical", "niveau-escalade-debutant"],
    "pieces": ["autorisation-parentale", "assurance-sport"],
    "santeTags": ["force", "endurance", "maitrise-hauteur"],
    "territoire": "saint-etienne-metropole"
  },
  {
    "id": "vacances-colonie-mer-6-10",
    "theme": "Vacances",
    "titre": "Colonie Découverte de la Mer",
    "description": "Séjour 10 jours en bord de mer : plage, activités nautiques, découverte marine. Les enfants dorment sur place en centre de vacances avec encadrement 24h/24.",
    "ageMin": 6,
    "ageMax": 10,
    "accessibilite": [],
    "creneaux": [
      { "jour": "dimanche-mardi", "heureDebut": "00:00", "heureFin": "23:59", "periode": "vacances-aout" }
    ],
    "lieu": {
      "nom": "Centre de Vacances La Rochelle",
      "adresse": "Colonie affiliée, 17000 La Rochelle",
      "transport": "Transport collectif bus depuis Saint-Étienne"
    },
    "cout": 1050,
    "vacationType": "sejour_hebergement",
    "priceUnit": "pour les 10 jours de colonie",
    "durationDays": 10,
    "hasAccommodation": true,
    "aidesEligibles": ["caf-vacances", "bourse-collectivite", "aides-depart-vacances"],
    "mobilite": {
      "transportCommun": { "disponible": false },
      "velo": { "disponible": false },
      "covoiturage": { "disponible": false }
    },
    "prerequis": ["autorisation-parentale", "certificat-medical", "savoir-nager"],
    "pieces": ["carnet-sante", "justificatif-vaccinations", "test-natation"],
    "santeTags": ["natation", "autonomie", "decouverte-environnement"],
    "territoire": "saint-etienne-metropole"
  }
];

serve(async (req) => {
  // CORS headers
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info",
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    "Vary": "Origin",
  };

  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers, status: 204 });
  }

  // Accept both GET and POST (POST is used by supabase.functions.invoke)
  if (req.method === "GET" || req.method === "POST") {
    const CUTOFF_DATE = new Date('2025-11-01');
    
    // Filtrer les activités avec créneaux valides (>= 01/11/2025)
    const validActivities = mockActivities.filter((activity: any) => {
      // Vérifier si l'activité a des créneaux futurs
      const hasFutureSlots = activity.creneaux?.some((creneau: any) => {
        // Pour les périodes de vacances (contient "vacances" dans periode), 
        // on considère toujours valide car c'est pour 2025
        if (creneau.periode && creneau.periode.includes('vacances')) return true;
        
        // Pour les créneaux hebdomadaires récurrents sans période spécifique,
        // on les garde aussi (mercredi, samedi, etc.)
        return true;
      });
      
      return hasFutureSlots !== false;
    });
    
    // Transformer les activités au format demandé
    const transformedActivities = validActivities.map((activity: any) => ({
      ...activity,
      aidesEligibles: transformAides(activity.aidesEligibles || []),
      mobilite: transformMobilite(activity.mobilite)
    }));
    
    console.log(`📅 Filtered activities: ${transformedActivities.length}/${mockActivities.length} valid`);
    
    return new Response(JSON.stringify(transformedActivities), {
      headers,
      status: 200,
    });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    headers,
    status: 405,
  });
});
