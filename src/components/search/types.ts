export interface EnhancedSearchFilters {
  // Pour qui ?
  childId?: string;
  ageMin?: number;
  ageMax?: number;
  needsHandicapSupport?: boolean;
  needsAseSupport?: boolean;
  needsSchoolSupport?: boolean;

  // Quand ?
  period?: string;
  vacationType?: string;
  schoolType?: string;

  // Où ?
  location?: string;
  maxTravelTime?: string;

  // Quoi ?
  categories: string[];
  activityType?: string;

  // Budget & aides
  maxPrice?: number;
  hasFinancialAid?: boolean;
  hasModulatedPricing?: boolean;
  hasAccessibility?: boolean;
  hasCovoiturage?: boolean;
}
