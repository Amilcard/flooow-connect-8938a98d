/**
 * LOT 6 - buildActivityQuery Utility
 * Constructs Supabase query based on filters
 * ADAPTED TO REAL SUPABASE STRUCTURE
 *
 * LOT 1 - T1_4: Corrections pour assurer la complétude des activités
 * - Utilise 'published' au lieu de 'is_published'
 * - Utilise la relation 'structures:structure_id'
 * - Sélectionne les images pour le mapping intelligent
 *
 * REFACTOR: Alignement avec schéma BDD réel
 * - Utilise 'categories' (array) au lieu de 'tags' pour les filtres catégories
 * - Ajout filtres: payment_echelonned, covoiturage_enabled
 */

import { supabase } from '@/integrations/supabase/client';
import { FilterState } from '@/types/searchFilters';
import { safeErrorMessage } from '@/utils/sanitize';

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS: Reduce cognitive complexity
// ═══════════════════════════════════════════════════════════════════════════

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryType = any;

/**
 * Apply text search filter
 */
const applyTextSearch = (query: QueryType, searchQuery: string | undefined): QueryType => {
  if (!searchQuery) return query;
  return query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
};

/**
 * Apply quick filters
 */
const applyQuickFilters = (query: QueryType, quickFilters: FilterState['quickFilters']): QueryType => {
  let q = query;
  if (quickFilters.gratuit) q = q.or('price_base.eq.0,price_base.is.null');
  if (quickFilters.vacances_ete) q = q.eq('period_type', 'vacances').contains('vacation_periods', ['ete_2026']);
  if (quickFilters.age_6_12) q = q.lte('age_min', 6).gte('age_max', 12);
  if (quickFilters.avec_aides) q = q.not('accepts_aid_types', 'is', null);
  if (quickFilters.sport) q = q.overlaps('categories', ['Sport', 'sport']);
  if (quickFilters.culture) q = q.overlaps('categories', ['Culture', 'culture']);
  return q;
};

/**
 * Period mapping for vacation periods
 */
const PERIOD_MAPPING: Record<string, string> = {
  'spring_2026': 'printemps_2026',
  'summer_2026': 'ete_2026',
  'toussaint_2025': 'toussaint_2025',
  'noel_2025': 'noel_2025',
  'hiver_2026': 'hiver_2026'
};

/**
 * Apply period filter
 */
const applyPeriodFilter = (query: QueryType, period: string | undefined): QueryType => {
  if (!period || period === 'all') return query;
  if (period === 'scolaire') return query.eq('period_type', 'scolaire');
  if (period === 'vacances') return query.eq('period_type', 'vacances');
  const mappedPeriod = PERIOD_MAPPING[period];
  return mappedPeriod ? query.contains('vacation_periods', [mappedPeriod]) : query;
};

/**
 * Apply advanced filters
 */
const applyAdvancedFilters = (query: QueryType, advanced: FilterState['advancedFilters']): QueryType => {
  let q = query;

  // Period filter
  q = applyPeriodFilter(q, advanced.period);

  // Age filter (only if not default range)
  if (advanced.age_range[0] !== 4 || advanced.age_range[1] !== 17) {
    q = q.lte('age_min', advanced.age_range[1]).gte('age_max', advanced.age_range[0]);
  }

  // Categories filter
  if (advanced.categories.length > 0) {
    q = q.overlaps('categories', advanced.categories);
  }

  // Price filter
  if (advanced.max_budget < 200) {
    q = q.or(`price_base.eq.0,price_base.lte.${advanced.max_budget}`);
  }

  // Financial aids filter
  if (advanced.financial_aids_accepted.length > 0) {
    q = q.not('accepts_aid_types', 'is', null);
  }

  // Accessibility filter
  if (advanced.inclusivity) {
    q = q.not('accessibility_checklist', 'is', null);
  }

  // Payment echelonné
  if (advanced.payment_echelon) {
    q = q.eq('payment_echelonned', true);
  }

  // Covoiturage
  if (advanced.mobility_types?.includes('Covoiturage')) {
    q = q.eq('covoiturage_enabled', true);
  }

  return q;
};

/**
 * Sort order mapping
 */
const SORT_CONFIG: Record<string, { column: string; ascending: boolean; nullsFirst?: boolean }> = {
  'date_desc': { column: 'created_at', ascending: false },
  'price_asc': { column: 'price_base', ascending: true, nullsFirst: true },
  'distance': { column: 'created_at', ascending: false }, // Fallback - PostGIS not available
  'default': { column: 'created_at', ascending: false }
};

/**
 * Apply sorting
 */
const applySorting = (query: QueryType, sortBy: string | undefined): QueryType => {
  const config = SORT_CONFIG[sortBy || 'default'] || SORT_CONFIG['default'];
  return query.order(config.column, { ascending: config.ascending, nullsFirst: config.nullsFirst });
};

// ═══════════════════════════════════════════════════════════════════════════

// Constants for activity limits
const LIST_VIEW_LIMIT = 50; // Default limit for list view
const MAP_VIEW_LIMIT = 200; // Higher limit for map view to show all activities

export const buildActivityQuery = (filters: FilterState) => {
  // Base query with count to get total number of matching activities
  let query: QueryType = supabase
    .from('activities')
    .select('*', { count: 'exact' })
    .eq('is_published', true);

  // Apply all filters using helpers
  query = applyTextSearch(query, filters.searchQuery);
  query = applyQuickFilters(query, filters.quickFilters);
  query = applyAdvancedFilters(query, filters.advancedFilters);

  // Apply higher limit for map view to show all activities
  const limit = filters.viewMode === 'map' ? MAP_VIEW_LIMIT : LIST_VIEW_LIMIT;
  query = query.limit(limit);

  query = applySorting(query, filters.sortBy);

  return query;
};

export const getResultsCount = async (filters: FilterState): Promise<number> => {
  // Use a separate count-only query for efficiency
  let query: QueryType = supabase
    .from('activities')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true);

  // Apply all filters using helpers
  query = applyTextSearch(query, filters.searchQuery);
  query = applyQuickFilters(query, filters.quickFilters);
  query = applyAdvancedFilters(query, filters.advancedFilters);

  const { count, error } = await query;

  if (error) {
    console.error(safeErrorMessage(error, 'Error counting results'));
    return 0;
  }

  return count || 0;
};
