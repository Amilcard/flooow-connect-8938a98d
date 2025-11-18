/**
 * LOT 6 - Search Filters Types
 * Type definitions for search and filtering system
 */

export interface QuickFilters {
  gratuit: boolean;
  vacances_ete: boolean;
  age_6_12: boolean;
  avec_aides: boolean;
  proche: boolean;
  mercredi: boolean;
  sport: boolean;
  culture: boolean;
}

export interface AdvancedFilters {
  city: string;
  max_distance: number;
  period: string;
  days_of_week: string[];
  age_range: [number, number];
  specific_needs: string[];
  categories: string[];
  accommodation_type: string;
  max_budget: number;
  financial_aids_accepted: string[];
  qf_based_pricing: boolean;
  pmr: boolean;
  public_transport: boolean;
}

export interface FilterState {
  searchQuery: string;
  quickFilters: QuickFilters;
  advancedFilters: AdvancedFilters;
  sortBy: 'pertinence' | 'date_desc' | 'price_asc' | 'distance';
  viewMode: 'grid' | 'list';
}

export interface QuickFilterChip {
  id: keyof QuickFilters;
  label: string;
  color_active: string;
  bg_active: string;
}

export interface ActiveFilterTag {
  id: string;
  label: string;
  value: string;
  section: 'quick' | 'advanced';
}
