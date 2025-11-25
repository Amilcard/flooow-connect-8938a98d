/**
 * Helper functions for contextual aid calculator
 * Determines which questions to show based on activity type, period, and other criteria
 */

/**
 * Determine activity type from categories
 * Priority: vacances > sport > culture > loisir
 */
export function getTypeActivite(categories: string[]): 'sport' | 'culture' | 'vacances' | 'loisir' {
  if (categories.some(c => c.toLowerCase().includes('vacances'))) return 'vacances';
  if (categories.some(c => c.toLowerCase().includes('sport'))) return 'sport';
  if (categories.some(c => c.toLowerCase().includes('culture'))) return 'culture';
  return 'loisir';
}

/**
 * Determine if a date falls within school holidays (Zone A - Saint-Étienne)
 * Returns 'vacances' if in holidays, 'scolaire' otherwise
 */
export function getPeriode(date: Date): 'scolaire' | 'vacances' {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 0-indexed
  const day = date.getDate();

  // Vacances 2024-2025 (Zone A)
  const vacances2024_2025 = [
    { start: new Date(2024, 9, 19), end: new Date(2024, 10, 3) },   // Toussaint
    { start: new Date(2024, 11, 21), end: new Date(2025, 0, 5) },   // Noël
    { start: new Date(2025, 1, 8), end: new Date(2025, 1, 23) },    // Hiver
    { start: new Date(2025, 3, 5), end: new Date(2025, 3, 21) },    // Printemps
    { start: new Date(2025, 6, 5), end: new Date(2025, 7, 31) },    // Été
  ];

  // Vacances 2025-2026 (Zone A)
  const vacances2025_2026 = [
    { start: new Date(2025, 9, 18), end: new Date(2025, 10, 2) },   // Toussaint
    { start: new Date(2025, 11, 20), end: new Date(2026, 0, 4) },   // Noël
    { start: new Date(2026, 1, 7), end: new Date(2026, 1, 22) },    // Hiver
    { start: new Date(2026, 3, 4), end: new Date(2026, 3, 19) },    // Printemps
    { start: new Date(2026, 6, 4), end: new Date(2026, 7, 31) },    // Été
  ];

  const allVacances = [...vacances2024_2025, ...vacances2025_2026];

  for (const periode of allVacances) {
    if (date >= periode.start && date <= periode.end) {
      return 'vacances';
    }
  }

  return 'scolaire';
}

/**
 * Determine if QF (Quotient Familial) field should be shown
 * 
 * Rules:
 * - Always show for 'vacances' activities
 * - Show for Loire (42) during school period (CAF Loire Temps Libre)
 * - Hide for sport/culture during school period (except Loire)
 */
export function shouldShowQF(
  typeAct: string,
  periode: string,
  age: number,
  cp: string
): boolean {
  // Always show for vacation activities
  if (typeAct === 'vacances') return true;

  // Show for Loire (42) during school period if age 3-17
  if (periode === 'scolaire' && cp.startsWith('42') && age >= 3 && age <= 17) {
    return true; // CAF Loire Temps Libre
  }

  // Hide for all other cases
  return false;
}

/**
 * Determine if "Condition Sociale" (social aid) field should be shown
 * 
 * Rules:
 * - Only show for sport activities during school period
 * - Only for ages 6-17 (Pass'Sport eligibility)
 */
export function shouldShowConditionSociale(typeAct: string, age: number): boolean {
  return typeAct === 'sport' && age >= 6 && age <= 17;
}

/**
 * Determine if "Allocataire CAF" field should be shown
 * 
 * Rules:
 * - Only show for vacation activities during vacation period
 * - Required for VACAF, AVE, AVF aids
 */
export function shouldShowAllocataireCAF(typeAct: string, periode: string): boolean {
  return typeAct === 'vacances' && periode === 'vacances';
}

/**
 * Get contextual title for QF section
 */
export function getQFSectionTitle(typeAct: string, periode: string): string {
  if (typeAct === 'vacances' || periode === 'vacances') {
    return "Critères pour aides vacances CAF";
  }
  return "Critères CAF Loire Temps Libre";
}

/**
 * Get contextual help text for QF field
 */
export function getQFJustification(typeAct: string, periode: string): string {
  if (typeAct === 'vacances' || periode === 'vacances') {
    return "Utilisé pour VACAF (jusqu'à 400€), Pass Colo (200-350€) et autres aides vacances";
  }
  return "Utilisé pour CAF Loire Temps Libre (20-80€ selon QF)";
}

/**
 * Get contextual message for results
 */
export function getContextualMessage(
  typeAct: string,
  periode: string,
  age: number
): string {
  if (typeAct === 'sport' && periode === 'scolaire') {
    return "Aides détectées pour activités sportives en période scolaire";
  }
  
  if (typeAct === 'culture' && age >= 15) {
    return "Vous êtes éligible au Pass Culture (15-17 ans)";
  }
  
  if (periode === 'vacances') {
    return "Aides vacances CAF activées selon votre QF";
  }
  
  return "Aides détectées selon vos critères";
}

/**
 * Get eligible aids based on context (for display purposes)
 * This is a simplified version for UI feedback
 */
export function getAidesEligibles(context: {
  typeAct: string;
  periode: string;
  age: number;
  cp: string;
  qf?: number;
  hasConditionSociale?: boolean;
  allocataireCaf?: boolean;
}): string[] {
  const output: string[] = [];

  // Pass'Sport (sport during school period with social aid)
  if (
    context.typeAct === 'sport' &&
    context.periode === 'scolaire' &&
    context.age >= 6 &&
    context.age <= 17 &&
    context.hasConditionSociale
  ) {
    output.push("Pass'Sport");
  }

  // Pass Culture (culture, age 15-17)
  if (context.typeAct === 'culture' && context.age >= 15 && context.age <= 17) {
    output.push("Pass Culture");
  }

  // Vacation aids
  if (context.periode === 'vacances') {
    if (context.qf && context.allocataireCaf) {
      output.push('VACAF', 'AVE');
    }
    if (context.age === 11) {
      output.push('Pass Colo');
    }
  }

  // CAF Loire Temps Libre (school period, Loire)
  if (
    context.cp.startsWith('42') &&
    context.periode === 'scolaire' &&
    context.age >= 3 &&
    context.age <= 17
  ) {
    output.push('CAF Temps Libre Loire');
  }

  return output;
}
