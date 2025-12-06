/**
 * Mapping des catégories vers une thématique principale unique
 */
export const getMainCategory = (categories: string[] | undefined, category?: string): string => {
  const cat = category || (categories && categories[0]) || 'Loisirs';
  const normalized = cat.toLowerCase();
  
  if (normalized.includes('sport') || normalized.includes('foot') || normalized.includes('rugby') || normalized.includes('basket') || normalized.includes('tennis') || normalized.includes('natation') || normalized.includes('judo') || normalized.includes('gym') || normalized.includes('escalade') || normalized.includes('équitation')) {
    return 'SPORT';
  }
  if (normalized.includes('culture') || normalized.includes('théâtre') || normalized.includes('musique') || normalized.includes('piano') || normalized.includes('violon') || normalized.includes('chant') || normalized.includes('danse') || normalized.includes('dessin') || normalized.includes('photo') || normalized.includes('arts')) {
    return 'CULTURE';
  }
  if (normalized.includes('scolarité') || normalized.includes('scolaire') || normalized.includes('devoirs') || normalized.includes('robotique') || normalized.includes('sciences')) {
    return 'SCOLARITÉ';
  }
  if (normalized.includes('insertion') || normalized.includes('pro')) {
    return 'INSERTION';
  }
  if (normalized.includes('vacances') || normalized.includes('séjour') || normalized.includes('colonie') || normalized.includes('camp') || normalized.includes('centre')) {
    return 'VACANCES';
  }
  return 'LOISIRS';
};

/**
 * Label de période
 */
export const getPeriodLabel = (periodType: string | undefined): string => {
  if (periodType === 'vacances') return 'VACANCES';
  if (periodType === 'scolaire') return 'SAISON';
  return '';
};

/**
 * Segments d'âge de référence
 */
const AGE_SEGMENTS = [
  { min: 3, max: 5, label: '3-5 ans' },
  { min: 6, max: 8, label: '6-8 ans' },
  { min: 9, max: 11, label: '9-11 ans' },
  { min: 12, max: 14, label: '12-14 ans' },
  { min: 15, max: 17, label: '15-17 ans' },
];

/**
 * Trouve les segments d'âge correspondants à une tranche min-max
 */
const getMatchingSegments = (ageMin: number, ageMax: number): typeof AGE_SEGMENTS => {
  return AGE_SEGMENTS.filter(seg => 
    (ageMin <= seg.max && ageMax >= seg.min)
  );
};

/**
 * Formate la tranche d'âge pour les CARTES (pilule compacte)
 * Retourne une seule tranche simplifiée (ex: "12-17 ans")
 */
export const formatAgeRangeForCard = (ageMin?: number, ageMax?: number): string => {
  if (!ageMin || !ageMax) return '';
  
  // Si la tranche est déjà dans un segment unique
  const segments = getMatchingSegments(ageMin, ageMax);
  
  if (segments.length === 0) {
    return `${ageMin}-${ageMax} ans`;
  }
  
  if (segments.length === 1) {
    return segments[0].label;
  }
  
  // Plusieurs segments: afficher la tranche globale simplifiée
  const firstSeg = segments[0];
  const lastSeg = segments[segments.length - 1];
  return `${firstSeg.min}-${lastSeg.max} ans`;
};

/**
 * Formate la tranche d'âge pour le DÉTAIL ACTIVITÉ (bandeau)
 * Retourne les segments détaillés séparés par " / " (ex: "12-14 ans / 15-17 ans")
 */
export const formatAgeRangeForDetail = (ageMin?: number, ageMax?: number): string => {
  if (!ageMin || !ageMax) return '';
  
  const segments = getMatchingSegments(ageMin, ageMax);
  
  if (segments.length === 0) {
    return `${ageMin}-${ageMax} ans`;
  }
  
  if (segments.length === 1) {
    return segments[0].label;
  }
  
  // Plusieurs segments: afficher chacun séparé par " / "
  return segments.map(s => s.label).join(' / ');
};

/**
 * Formate une tranche d'âge simple (sans "ans" pour économiser l'espace sur les cartes)
 */
export const formatAgeRangeShort = (ageMin?: number, ageMax?: number): string => {
  if (!ageMin || !ageMax) return '';
  
  const segments = getMatchingSegments(ageMin, ageMax);
  
  if (segments.length === 0) {
    return `${ageMin}-${ageMax}`;
  }
  
  if (segments.length === 1) {
    return `${segments[0].min}-${segments[0].max}`;
  }
  
  const firstSeg = segments[0];
  const lastSeg = segments[segments.length - 1];
  return `${firstSeg.min}-${lastSeg.max}`;
};
