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
