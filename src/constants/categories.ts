export const CATEGORY_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  sport: { color: '#10B981', bg: '#DCFCE7', label: 'Sport' },
  culture: { color: '#F59E0B', bg: '#FEF3E2', label: 'Culture' },
  loisirs: { color: '#A855F7', bg: '#F3E8FF', label: 'Loisirs' },
  vacances: { color: '#EF4444', bg: '#FEE2E2', label: 'Vacances' },
  scolaire: { color: '#4A90E2', bg: '#EFF6FF', label: 'Scolarité' },
  'activités innovantes': { color: '#06B6D4', bg: '#ECFEFF', label: 'Innovant' }
};

export const getCategoryStyle = (category: string) => {
  const normalizedCategory = category?.toLowerCase();
  return CATEGORY_STYLES[normalizedCategory] || CATEGORY_STYLES.loisirs;
};
