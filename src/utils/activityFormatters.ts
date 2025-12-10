/**
 * Utilitaires de formatage pour les activités
 * Source unique de vérité pour le formatage des données d'activités
 * Utilisé par les cartes (Home, Recherche) et les pages de détail
 */

/**
 * Formate la tranche d'âge de manière cohérente
 * Règles :
 * - Si ageMin === ageMax : "X ans"
 * - Sinon : "X-Y ans"
 * - Si données invalides : null
 *
 * @param ageMin - Âge minimum (optionnel)
 * @param ageMax - Âge maximum (optionnel)
 * @returns Label formaté ou null si données invalides
 */
export function formatAgeRange(
  ageMin?: number | null,
  ageMax?: number | null
): string | null {
  // Validation des entrées
  if (ageMin === undefined || ageMin === null) return null;
  if (ageMax === undefined || ageMax === null) return null;
  if (ageMin < 0 || ageMax < 0) return null;
  if (ageMin > ageMax) return null;

  // Formatage
  if (ageMin === ageMax) {
    return `${ageMin} ans`;
  }

  return `${ageMin}-${ageMax} ans`;
}

/**
 * Formate la tranche d'âge pour les badges (version courte sans "ans")
 * Utilisé dans les pilules sur les cartes pour économiser l'espace
 *
 * @param ageMin - Âge minimum
 * @param ageMax - Âge maximum
 * @returns Label court (ex: "6-9") ou null
 */
export function formatAgeRangeShort(
  ageMin?: number | null,
  ageMax?: number | null
): string | null {
  if (ageMin === undefined || ageMin === null) return null;
  if (ageMax === undefined || ageMax === null) return null;
  if (ageMin < 0 || ageMax < 0) return null;
  if (ageMin > ageMax) return null;

  if (ageMin === ageMax) {
    return `${ageMin}`;
  }

  return `${ageMin}-${ageMax}`;
}

/**
 * Formate le prix d'une activité
 *
 * @param price - Prix en euros
 * @param priceUnit - Unité optionnelle (jour, semaine, an, etc.)
 * @returns Label formaté
 */
export function formatPrice(
  price?: number | null,
  priceUnit?: string | null
): string {
  if (price === undefined || price === null || price === 0) {
    return 'Gratuit';
  }

  const priceStr = `${price}€`;

  if (priceUnit) {
    return `${priceStr} / ${priceUnit}`;
  }

  return priceStr;
}

/**
 * Détermine si une activité est gratuite
 *
 * @param price - Prix en euros
 * @returns true si gratuit
 */
export function isPriceFree(price?: number | null): boolean {
  return price === undefined || price === null || price === 0;
}

/**
 * Formate le nom des aides financières pour affichage
 * Convertit les slugs en labels lisibles
 *
 * @param aidSlug - Identifiant de l'aide
 * @returns Label formaté
 */
export function formatAidLabel(aidSlug: string): string {
  const aidLabels: Record<string, string> = {
    'pass_sport': "Pass'Sport",
    'pass_culture': 'Pass Culture',
    'caf_loire_temps_libre': 'CAF',
    'vacaf_ave': 'VACAF',
    'ancv': 'ANCV',
    'pass_colo': 'Pass Colo',
    'aides_municipales_saint_etienne': 'Ville',
  };

  return aidLabels[aidSlug] || aidSlug.replace(/_/g, ' ');
}
