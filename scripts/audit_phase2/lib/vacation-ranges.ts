/**
 * Shared vacation date ranges for audit scripts
 * Zone A - Académie de Lyon (Saint-Étienne)
 */

export interface VacationRange {
  name: string;
  start: string;
  end: string;
}

export interface VacationRangeFr {
  nom: string;
  debut: string;
  fin: string;
}

// Format anglais (name/start/end)
export const VACATION_RANGES: VacationRange[] = [
  { name: "Automne 2025", start: "2025-10-18", end: "2025-11-03" },
  { name: "Fin d'année 2025", start: "2025-12-20", end: "2026-01-05" },
  { name: "Hiver 2026", start: "2026-02-21", end: "2026-03-09" },
  { name: "Printemps 2026", start: "2026-04-18", end: "2026-05-04" },
  { name: "Été 2026", start: "2026-07-04", end: "2026-09-01" },
  { name: "Automne 2026", start: "2026-10-17", end: "2026-11-02" },
  { name: "Fin d'année 2026", start: "2026-12-19", end: "2027-01-05" }
];

// Format français (nom/debut/fin)
export const VACANCES_ZONE_A: VacationRangeFr[] = [
  { nom: "Vacances Toussaint 2025", debut: "2025-10-18", fin: "2025-11-03" },
  { nom: "Vacances Noël 2025", debut: "2025-12-20", fin: "2026-01-05" },
  { nom: "Vacances Hiver 2026", debut: "2026-02-21", fin: "2026-03-09" },
  { nom: "Vacances Printemps 2026", debut: "2026-04-18", fin: "2026-05-04" },
  { nom: "Vacances Été 2026", debut: "2026-07-04", fin: "2026-09-01" },
  { nom: "Vacances Toussaint 2026", debut: "2026-10-17", fin: "2026-11-02" },
  { nom: "Vacances Noël 2026", debut: "2026-12-19", fin: "2027-01-05" }
];

/**
 * Check if a date falls within a vacation period
 */
export function isVacation(dateStr: string): boolean {
  const date = new Date(dateStr);
  return VACATION_RANGES.some(range => {
    const start = new Date(range.start);
    const end = new Date(range.end);
    return date >= start && date <= end;
  });
}

/**
 * Get vacation name for a date if it falls within a vacation period
 */
export function getVacationName(dateStr: string): string | null {
  const date = new Date(dateStr);
  const vacation = VACATION_RANGES.find(range => {
    const start = new Date(range.start);
    const end = new Date(range.end);
    return date >= start && date <= end;
  });
  return vacation?.name || null;
}
