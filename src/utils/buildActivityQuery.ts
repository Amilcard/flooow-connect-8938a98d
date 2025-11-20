/**
 * LOT 6 - buildActivityQuery Utility
 * Constructs Supabase query based on filters
 */

import { supabase } from '@/integrations/supabase/client';
import { FilterState } from '@/types/searchFilters';

export const buildActivityQuery = (filters: FilterState) => {
  // Use any to avoid deep type instantiation errors with chained query methods
  let query: any = supabase
    .from('activities')
    .select('*');

  // Text search
  if (filters.searchQuery) {
    query = query.or(
      `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%,tags.cs.{${filters.searchQuery}}`
    );
  }

  // Quick Filters
  if (filters.quickFilters.gratuit) {
    query = query.or('price_base.eq.0,price_base.is.null');
  }

  if (filters.quickFilters.vacances_ete) {
    // Summer vacation 2026: July 4 - September 1
    query = query.gte('start_date', '2026-07-04').lte('end_date', '2026-09-01');
  }

  if (filters.quickFilters.age_6_12) {
    query = query.lte('age_min', 6).gte('age_max', 12);
  }

  if (filters.quickFilters.avec_aides) {
    query = query.not('financial_aids_accepted', 'is', null);
  }

  if (filters.quickFilters.mercredi) {
    query = query.contains('days_of_week', ['wednesday']);
  }

  if (filters.quickFilters.sport) {
    query = query.eq('category', 'sport');
  }

  if (filters.quickFilters.culture) {
    query = query.eq('category', 'culture');
  }

  // Advanced Filters - Geographic
  if (filters.advancedFilters.city) {
    query = query.ilike('location.city', `%${filters.advancedFilters.city}%`);
  }

  // Advanced Filters - Temporal
  if (filters.advancedFilters.period && filters.advancedFilters.period !== 'all') {
    const periodDates = getPeriodDates(filters.advancedFilters.period);
    if (periodDates) {
      query = query.gte('start_date', periodDates.start).lte('end_date', periodDates.end);
    }
  }

  if (filters.advancedFilters.days_of_week.length > 0) {
    query = query.overlaps('days_of_week', filters.advancedFilters.days_of_week);
  }

  // Advanced Filters - Age
  if (
    filters.advancedFilters.age_range[0] !== 4 ||
    filters.advancedFilters.age_range[1] !== 17
  ) {
    query = query
      .lte('age_min', filters.advancedFilters.age_range[1])
      .gte('age_max', filters.advancedFilters.age_range[0]);
  }

  // Advanced Filters - Categories
  if (filters.advancedFilters.categories.length > 0) {
    query = query.in('category', filters.advancedFilters.categories);
  }

  // Advanced Filters - Accommodation Type
  if (
    filters.advancedFilters.accommodation_type &&
    filters.advancedFilters.accommodation_type !== 'all'
  ) {
    query = query.eq('accommodation_type', filters.advancedFilters.accommodation_type);
  }

  // Advanced Filters - Price
  if (filters.advancedFilters.max_budget < 200) {
    query = query.or(
      `price_is_free.eq.true,price_amount.lte.${filters.advancedFilters.max_budget}`
    );
  }

  // Advanced Filters - Financial Aids
  if (filters.advancedFilters.financial_aids_accepted.length > 0) {
    query = query.contains(
      'financial_aids_accepted',
      filters.advancedFilters.financial_aids_accepted
    );
  }

  if (filters.advancedFilters.qf_based_pricing) {
    query = query.eq('qf_based_pricing', true);
  }

  // Advanced Filters - Accessibility
  if (filters.advancedFilters.pmr) {
    query = query.eq('pmr_accessible', true);
  }

  if (filters.advancedFilters.public_transport) {
    query = query.eq('public_transport_nearby', true);
  }

  // Sort
  switch (filters.sortBy) {
    case 'date_desc':
      query = query.order('created_at', { ascending: false });
      break;
    case 'price_asc':
      query = query.order('price_amount', { ascending: true, nullsFirst: true });
      break;
    case 'distance':
      // Requires PostGIS extension - fallback to default
      query = query.order('created_at', { ascending: false });
      break;
    default:
      // Pertinence: by creation date
      query = query.order('created_at', { ascending: false });
  }

  return query;
};

export const getResultsCount = async (filters: FilterState): Promise<number> => {
  const query = buildActivityQuery(filters);
  const { count, error } = await query.select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error counting results:', error);
    return 0;
  }

  return count || 0;
};

const getPeriodDates = (
  period: string
): { start: string; end: string } | null => {
  switch (period) {
    case 'spring_2026':
      return { start: '2026-04-11', end: '2026-04-26' };
    case 'summer_2026':
      return { start: '2026-07-04', end: '2026-09-01' };
    case 'school_year_2026':
      return { start: '2026-09-01', end: '2027-07-05' };
    default:
      return null;
  }
};
