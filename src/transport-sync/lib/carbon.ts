/**
 * Calculs d'économie carbone pour transports alternatifs
 */

/**
 * Calcule l'économie carbone pour un mode de transport
 * @param distanceKm Distance en km
 * @param carbonFactorKgPerKm Facteur carbone (kg CO2/km économisé vs voiture)
 * @returns Économie en kg CO2
 */
export const calculateCarbonSaved = (
  distanceKm: number,
  carbonFactorKgPerKm: number = 0.12
): number => {
  return parseFloat((distanceKm * carbonFactorKgPerKm).toFixed(4));
};

/**
 * Calcule le temps de marche estimé
 * @param distanceMeters Distance en mètres
 * @param walkingSpeedKmh Vitesse de marche (km/h, défaut 4.5)
 * @returns Temps en minutes
 */
export const calculateWalkingTime = (
  distanceMeters: number,
  walkingSpeedKmh: number = 4.5
): number => {
  const distanceKm = distanceMeters / 1000;
  const timeHours = distanceKm / walkingSpeedKmh;
  return Math.round(timeHours * 60);
};

/**
 * Cumule les économies carbone d'un utilisateur
 * Format: { total_kg: number, by_mode: { covoiturage: number, bus: number, bike: number } }
 */
export interface CarbonSavingsSummary {
  total_kg: number;
  by_mode: {
    covoiturage: number;
    bus: number;
    train: number;
    bike: number;
  };
  trips_count: number;
}

/**
 * Agrège les économies carbone depuis une liste de trajets
 */
export const aggregateCarbonSavings = (
  trips: Array<{ mode: string; carbon_saved_kg: number }>
): CarbonSavingsSummary => {
  const summary: CarbonSavingsSummary = {
    total_kg: 0,
    by_mode: {
      covoiturage: 0,
      bus: 0,
      train: 0,
      bike: 0,
    },
    trips_count: trips.length,
  };

  trips.forEach((trip) => {
    summary.total_kg += trip.carbon_saved_kg;

    // Mapping mode → catégorie
    const mode = trip.mode.toLowerCase();
    if (mode === 'covoiturage') summary.by_mode.covoiturage += trip.carbon_saved_kg;
    else if (mode === 'bus') summary.by_mode.bus += trip.carbon_saved_kg;
    else if (mode === 'train') summary.by_mode.train += trip.carbon_saved_kg;
    else if (mode === 'bike' || mode === 'vélo') summary.by_mode.bike += trip.carbon_saved_kg;
  });

  // Arrondir pour affichage
  summary.total_kg = parseFloat(summary.total_kg.toFixed(2));
  summary.by_mode.covoiturage = parseFloat(summary.by_mode.covoiturage.toFixed(2));
  summary.by_mode.bus = parseFloat(summary.by_mode.bus.toFixed(2));
  summary.by_mode.train = parseFloat(summary.by_mode.train.toFixed(2));
  summary.by_mode.bike = parseFloat(summary.by_mode.bike.toFixed(2));

  return summary;
};
