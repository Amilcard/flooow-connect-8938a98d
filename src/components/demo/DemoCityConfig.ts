/**
 * Configuration centralisée des villes de démonstration
 * Source unique de vérité pour les 3 villes pilotes
 */

export type DemoCityKey = 'lyon' | 'marseille' | 'saint-etienne';

export interface DemoCityConfig {
  key: DemoCityKey;
  label: string;
  shortLabel: string;
  postalCode: string;
  deptPrefix: string;
  center: {
    lat: number;
    lng: number;
  };
  sectors: string[];
}

/**
 * Configuration des 3 villes de démonstration
 */
export const DEMO_CITIES: Record<DemoCityKey, DemoCityConfig> = {
  'lyon': {
    key: 'lyon',
    label: 'Lyon Métropole',
    shortLabel: 'Lyon',
    postalCode: '69008',
    deptPrefix: '69',
    center: { lat: 45.7356, lng: 4.8717 },
    sectors: ['Monplaisir', 'Grand Trou', 'Bachut', 'Mermoz', 'États-Unis']
  },
  'marseille': {
    key: 'marseille',
    label: 'Aix-Marseille-Provence',
    shortLabel: 'Marseille',
    postalCode: '13006',
    deptPrefix: '13',
    center: { lat: 43.2873, lng: 5.3798 },
    sectors: ['Castellane', 'Préfecture', 'Notre-Dame du Mont', 'Palais de Justice']
  },
  'saint-etienne': {
    key: 'saint-etienne',
    label: 'Saint-Étienne Métropole',
    shortLabel: 'Saint-Étienne',
    postalCode: '42100',
    deptPrefix: '42',
    center: { lat: 45.4202, lng: 4.3900 },
    sectors: ['Bellevue', 'Montreynaud', 'Beaulieu', 'Centre Deux', 'Châteaucreux']
  }
};

/**
 * Liste ordonnée des clés pour itération
 */
export const DEMO_CITY_KEYS: DemoCityKey[] = ['lyon', 'marseille', 'saint-etienne'];

/**
 * Normalise un code postal (trim, supprime espaces)
 */
export const normalizePostalCode = (cp: string): string => {
  return cp.trim().replace(/\s/g, '').toUpperCase();
};

/**
 * Vérifie si un code postal correspond à une ville couverte
 * @returns la clé de la ville si couverte, null sinon
 */
export const getDemoCityFromPostalCode = (rawCp: string): DemoCityKey | null => {
  const cp = normalizePostalCode(rawCp);
  
  if (cp.startsWith('69')) return 'lyon';
  if (cp.startsWith('13')) return 'marseille';
  if (cp.startsWith('42')) return 'saint-etienne';
  
  return null;
};

/**
 * Suggère la ville démo la plus proche pour un CP non couvert
 * Retourne null si le CP n'est pas exploitable (Corse, DOM-TOM, invalide)
 */
export const suggestClosestDemoCity = (rawCp: string): DemoCityKey | null => {
  const cp = normalizePostalCode(rawCp);
  
  // Cas non exploitables → pas d'auto-suggestion, choix manuel
  if (cp.startsWith('2A') || cp.startsWith('2B')) return null; // Corse
  if (cp.startsWith('97') || cp.startsWith('98')) return null;  // DOM-TOM
  if (!/^\d{5}$/.test(cp)) return null; // Format invalide
  
  const dept = parseInt(cp.substring(0, 2), 10);
  
  // Départements Sud-Est → Marseille
  const southEastDepts = [4, 5, 6, 11, 13, 30, 34, 48, 66, 83, 84];
  if (southEastDepts.includes(dept)) return 'marseille';
  
  // Départements Rhône-Alpes élargi → Lyon  
  const rhoneAlpesDepts = [1, 7, 26, 38, 42, 43, 63, 69, 73, 74];
  if (rhoneAlpesDepts.includes(dept)) return 'lyon';
  
  // Défaut : Lyon (centre géographique France)
  return 'lyon';
};

/**
 * Vérifie si un CP est exploitable pour suggestion automatique
 */
export const isPostalCodeValid = (rawCp: string): boolean => {
  const cp = normalizePostalCode(rawCp);
  
  // Corse
  if (cp.startsWith('2A') || cp.startsWith('2B')) return false;
  // DOM-TOM
  if (cp.startsWith('97') || cp.startsWith('98')) return false;
  // Format standard
  return /^\d{5}$/.test(cp);
};

/**
 * Génère un offset déterministe pour les coordonnées
 * Évite Math.random() pour avoir des positions stables
 */
export const getDeterministicOffset = (seed: string, range: number = 0.02): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return ((hash % 1000) / 1000 - 0.5) * range * 2;
};

/**
 * Génère des coordonnées dispersées de manière déterministe
 */
export const generateDemoCoords = (
  cityKey: DemoCityKey,
  activityId: string
): { lat: number; lng: number } => {
  const city = DEMO_CITIES[cityKey];
  const latOffset = getDeterministicOffset(`${cityKey}-${activityId}-lat`);
  const lngOffset = getDeterministicOffset(`${cityKey}-${activityId}-lng`);
  
  return {
    lat: city.center.lat + latOffset,
    lng: city.center.lng + lngOffset
  };
};

/**
 * Génère un label d'adresse pour une activité démo
 * Utilise les secteurs de manière déterministe
 */
export const generateDemoAddressLabel = (
  cityKey: DemoCityKey,
  index: number
): string => {
  const city = DEMO_CITIES[cityKey];
  const sector = city.sectors[index % city.sectors.length];
  return `${city.shortLabel} – secteur ${sector}`;
};
