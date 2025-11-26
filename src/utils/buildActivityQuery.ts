/**
 * LOT 6 - buildActivityQuery Utility
 * Constructs Supabase query based on filters
 * ADAPTED TO REAL SUPABASE STRUCTURE
 */

import { supabase } from '@/integrations/supabase/client';
import { FilterState } from '@/types/searchFilters';

export const buildActivityQuery = (filters: FilterState) => {
  // Use any to avoid deep type instantiation errors with chained query methods
  let query: any = supabase
    .from('activities')
    .select('*, organisms(name, address, city, postal_code)')
    .eq('is_published', true); // Only published activities

  // Text search
  if (filters.searchQuery) {
    query = query.or(
      `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`
    );
  }

  // Quick Filters
  if (filters.quickFilters.gratuit) {
    query = query.or('price_base.eq.0,price_base.is.null');
  }

  if (filters.quickFilters.vacances_ete) {
    query = query.eq('period_type', 'vacances').contains('vacation_periods', ['ete_2026']);
  }

  if (filters.quickFilters.age_6_12) {
    query = query.lte('age_min', 6).gte('age_max', 12);
  }

  if (filters.quickFilters.avec_aides) {
    query = query.not('accepts_aid_types', 'is', null);
  }

  if (filters.quickFilters.sport) {
    query = query.contains('tags', ['sport']);
  }

  if (filters.quickFilters.culture) {
    query = query.contains('tags', ['culture']);
  }

  // Advanced Filters - Geographic
  if (filters.advancedFilters.city) {
    query = query.ilike('city', `%${filters.advancedFilters.city}%`);
  }

  // Advanced Filters - Temporal (period_type)
  if (filters.advancedFilters.period && filters.advancedFilters.period !== 'all') {
    if (filters.advancedFilters.period === 'scolaire') {
      query = query.eq('period_type', 'scolaire');
    } else if (filters.advancedFilters.period === 'vacances') {
      query = query.eq('period_type', 'vacances');
    } else {
      // Specific vacation periods
      const periodMapping: Record<string, string> = {
        'spring_2026': 'printemps_2026',
        'summer_2026': 'ete_2026',
        'toussaint_2025': 'toussaint_2025',
        'noel_2025': 'noel_2025',
        'hiver_2026': 'hiver_2026'
      };
      const mappedPeriod = periodMapping[filters.advancedFilters.period];
      if (mappedPeriod) {
        query = query.contains('vacation_periods', [mappedPeriod]);
      }
    }
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

  // Advanced Filters - Categories (using tags)
  if (filters.advancedFilters.categories.length > 0) {
    const tagConditions = filters.advancedFilters.categories.map(cat => 
      `tags.cs.{${cat.toLowerCase()}}`
    ).join(',');
    query = query.or(tagConditions);
  }

  // Advanced Filters - Price
  if (filters.advancedFilters.max_budget < 200) {
    query = query.or(
      `price_base.eq.0,price_base.lte.${filters.advancedFilters.max_budget}`
    );
  }

  // Advanced Filters - Financial Aids (accepts_aid_types)
  if (filters.advancedFilters.financial_aids_accepted.length > 0) {
    const aidsConditions = filters.advancedFilters.financial_aids_accepted.map(aid => 
      `accepts_aid_types.cs.{"${aid}"}`
    ).join(',');
    query = query.or(aidsConditions);
  }

  // Advanced Filters - Accessibility
  if (filters.advancedFilters.inclusivity) {
    query = query.not('accessibility_checklist', 'is', null);
  }

  if (filters.advancedFilters.public_transport) {
    query = query.eq('public_transport_nearby', true);
  }

  // Limit to 50 results
  query = query.limit(50);

  // Sort
  switch (filters.sortBy) {
    case 'date_desc':
      query = query.order('created_at', { ascending: false });
      break;
    case 'price_asc':
      query = query.order('price_base', { ascending: true, nullsFirst: true });
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
