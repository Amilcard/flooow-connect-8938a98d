import type { Activity } from "@/types/domain";

/**
 * Déduplique un tableau d'activités basé sur leur ID unique
 *
 * Defensive programming utility pour garantir zéro doublons même si:
 * - Le backend retourne des doublons via JOINs complexes
 * - Le cache contient des données corrompues
 * - Plusieurs sources de données sont mergées
 *
 * @param activities - Tableau potentiellement avec doublons
 * @returns Tableau dédupliqué avec ordre préservé (premier occurrence gardée)
 *
 * @example
 * ```ts
 * const raw = await fetchActivities();
 * const unique = deduplicateActivities(raw);
 * ```
 */
export function deduplicateActivities(activities: Activity[]): Activity[] {
  if (!activities || activities.length === 0) {
    return [];
  }

  // Utilise Map pour préserver l'ordre d'insertion (premier vu = gardé)
  const uniqueMap = new Map<string, Activity>();

  activities.forEach((activity) => {
    // Ne garde que la première occurrence de chaque ID
    if (activity.id && !uniqueMap.has(activity.id)) {
      uniqueMap.set(activity.id, activity);
    }
  });

  return Array.from(uniqueMap.values());
}

/**
 * Déduplique des activités basé sur plusieurs champs (pour cas complexes)
 *
 * Utile si:
 * - IDs ne sont pas encore assignés
 * - Plusieurs critères définissent l'unicité (ex: title + structure + date)
 *
 * @param activities - Tableau d'activités
 * @param fields - Champs à utiliser pour créer la clé composite
 * @returns Tableau dédupliqué
 *
 * @example
 * ```ts
 * const unique = deduplicateByMultipleFields(activities, ['title', 'structureName', 'ageMin']);
 * ```
 */
export function deduplicateByMultipleFields<T extends Record<string, any>>(
  activities: T[],
  fields: (keyof T)[]
): T[] {
  if (!activities || activities.length === 0) {
    return [];
  }

  const seen = new Set<string>();

  return activities.filter((activity) => {
    // Créer clé composite avec | comme séparateur
    const key = fields
      .map((field) => String(activity[field] || ""))
      .join("|");

    if (seen.has(key)) {
      return false; // Doublon détecté
    }

    seen.add(key);
    return true; // Première occurrence
  });
}

/**
 * Compte le nombre de doublons dans un tableau d'activités
 *
 * Utility de debugging pour identifier s'il y a un problème de doublons
 *
 * @param activities - Tableau d'activités
 * @returns Objet avec total, uniques, et nombre de doublons
 *
 * @example
 * ```ts
 * const stats = countDuplicates(activities);
 * console.log(`Doublons trouvés: ${stats.duplicates}`);
 * ```
 */
export function countDuplicates(activities: Activity[]): {
  total: number;
  unique: number;
  duplicates: number;
} {
  const total = activities.length;
  const uniqueIds = new Set(activities.map((a) => a.id));
  const unique = uniqueIds.size;
  const duplicates = total - unique;

  return { total, unique, duplicates };
}
