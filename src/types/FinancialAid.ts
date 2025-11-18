/**
 * LOT 5 - Financial Aid Types
 * Interface definitions for Financial Aid Screen
 */

export interface FinancialAid {
  id: string;
  title: string;
  amount: string; // Ex: "50€" ou "70€"
  age_range: string; // Ex: "6-10 ans"
  type: string; // Ex: "Saison scolaire", "Vacances"
  description: string;
  organizer: string; // Ex: "Ministère des Sports"
  category: 'school_year' | 'vacations';
  eligibility_criteria: {
    is_qpv_required: boolean;
    income_ceiling?: number;
    other_requirements?: string[];
  };
  external_url?: string;
  is_eligible?: boolean; // Calculé côté client si profil user disponible
  check_eligibility_needed?: boolean;
}

export interface AidSection {
  id: string;
  title: string;
  icon: string;
  color: string;
  bg_light: string;
  aids: FinancialAid[];
}
