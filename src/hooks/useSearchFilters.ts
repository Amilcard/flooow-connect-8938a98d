/**
 * LOT 6 - useSearchFilters Hook
 * State management for search filters with URL sync
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterState, QuickFilters, AdvancedFilters, ActiveFilterTag } from '@/types/searchFilters';

// HELPERS: Reduce cognitive complexity by extracting URL parsing logic

const QUICK_FILTER_KEYS: (keyof QuickFilters)[] = [
  'gratuit', 'vacances_ete', 'age_6_12', 'avec_aides', 'proche', 'mercredi', 'sport', 'culture'
];

const QUICK_FILTER_LABELS: Record<string, string> = {
  gratuit: 'Gratuit',
  vacances_ete: 'Vacances été',
  age_6_12: '6-12 ans',
  avec_aides: 'Aides acceptées',
  proche: '< 2 km',
  mercredi: 'Mercredi',
  sport: 'Sport',
  culture: 'Culture'
};

const PERIOD_LABELS: Record<string, string> = {
  spring_2026: 'Printemps 2026',
  summer_2026: 'Été 2026',
  school_year_2026: 'Année scolaire',
  wednesdays: 'Mercredis'
};

/**
 * Parse quick filters from URL search params
 */
const parseQuickFiltersFromURL = (searchParams: URLSearchParams): QuickFilters => {
  const filters = { ...DEFAULT_QUICK_FILTERS };
  QUICK_FILTER_KEYS.forEach(key => {
    if (searchParams.get(key) === '1') {
      filters[key] = true;
    }
  });
  return filters;
};

/**
 * Parse advanced filters from URL search params
 */
const parseAdvancedFiltersFromURL = (searchParams: URLSearchParams): AdvancedFilters => {
  const filters = { ...DEFAULT_ADVANCED_FILTERS };

  const city = searchParams.get('city');
  if (city) filters.city = city;

  const maxDistance = searchParams.get('max_distance');
  if (maxDistance) filters.max_distance = Number(maxDistance);

  const period = searchParams.get('period');
  if (period) filters.period = period;

  const ageMin = searchParams.get('age_min');
  const ageMax = searchParams.get('age_max');
  if (ageMin && ageMax) {
    filters.age_range = [Number(ageMin), Number(ageMax)];
  }

  if (searchParams.get('payment_echelon') === '1') filters.payment_echelon = true;

  const mobility = searchParams.get('mobility');
  if (mobility) filters.mobility_types = mobility.split(',');

  const details = searchParams.get('details');
  if (details) filters.details = details.split(',');

  return filters;
};

/**
 * Build active filter tags from quick filters
 */
const buildQuickFilterTags = (quickFilters: QuickFilters): ActiveFilterTag[] => {
  return Object.entries(quickFilters)
    .filter(([, value]) => value)
    .map(([key]) => ({
      id: `quick_${key}`,
      label: QUICK_FILTER_LABELS[key] || key,
      value: key,
      section: 'quick' as const
    }));
};

/**
 * Build active filter tags from advanced filters
 */
const buildAdvancedFilterTags = (advancedFilters: AdvancedFilters): ActiveFilterTag[] => {
  const tags: ActiveFilterTag[] = [];

  if (advancedFilters.city) {
    tags.push({ id: 'adv_city', label: `Ville: ${advancedFilters.city}`, value: 'city', section: 'advanced' });
  }

  if (advancedFilters.period !== 'all') {
    tags.push({
      id: 'adv_period',
      label: PERIOD_LABELS[advancedFilters.period] || advancedFilters.period,
      value: 'period',
      section: 'advanced'
    });
  }

  if (advancedFilters.payment_echelon) {
    tags.push({ id: 'adv_payment_echelon', label: 'Paiement échelonné', value: 'payment_echelon', section: 'advanced' });
  }

  return tags;
};

export const DEFAULT_QUICK_FILTERS: QuickFilters = {
  gratuit: false,
  vacances_ete: false,
  age_6_12: false,
  avec_aides: false,
  proche: false,
  mercredi: false,
  sport: false,
  culture: false
};

export const DEFAULT_ADVANCED_FILTERS: AdvancedFilters = {
  city: '',
  max_distance: 5,
  period: 'all',
  days_of_week: [],
  age_range: [4, 17],
  specific_needs: [],
  categories: [],
  accommodation_type: 'all',
  max_budget: 500,
  financial_aids_accepted: [],
  qf_based_pricing: false,
  inclusivity: false,
  public_transport: false,
  mobility_types: [],
  details: [],
  payment_echelon: false
};

export const useSearchFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Valid sort options from FilterState type
  const validSortOptions = ['pertinence', 'date_desc', 'price_asc', 'distance'] as const;
  const sortParam = searchParams.get('sort');
  const defaultSort: FilterState['sortBy'] = validSortOptions.includes(sortParam as typeof validSortOptions[number])
    ? (sortParam as FilterState['sortBy'])
    : 'pertinence';

  const viewParam = searchParams.get('view');
  const defaultView: FilterState['viewMode'] = viewParam === 'map' ? 'map' : 'list';

  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: searchParams.get('q') || '',
    quickFilters: { ...DEFAULT_QUICK_FILTERS },
    advancedFilters: { ...DEFAULT_ADVANCED_FILTERS },
    sortBy: defaultSort,
    viewMode: defaultView
  });

  // Load filters from URL on mount (using helpers to reduce CC)
  useEffect(() => {
    const quickFilters = parseQuickFiltersFromURL(searchParams);
    const advancedFilters = parseAdvancedFiltersFromURL(searchParams);

    setFilterState((prev) => ({
      ...prev,
      quickFilters,
      advancedFilters
    }));
  }, []);

  // Sync filters to URL (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();

      if (filterState.searchQuery) params.set('q', filterState.searchQuery);
      if (filterState.sortBy !== 'pertinence') params.set('sort', filterState.sortBy);
      if (filterState.viewMode !== 'list') params.set('view', filterState.viewMode);

      // Quick filters
      Object.entries(filterState.quickFilters).forEach(([key, value]) => {
        if (value) params.set(key, '1');
      });

      // Advanced filters
      if (filterState.advancedFilters.city) params.set('city', filterState.advancedFilters.city);
      if (filterState.advancedFilters.max_distance !== 5) params.set('max_distance', String(filterState.advancedFilters.max_distance));
      if (filterState.advancedFilters.period !== 'all') params.set('period', filterState.advancedFilters.period);
      if (filterState.advancedFilters.age_range[0] !== 4) params.set('age_min', String(filterState.advancedFilters.age_range[0]));
      if (filterState.advancedFilters.age_range[1] !== 17) params.set('age_max', String(filterState.advancedFilters.age_range[1]));
      if (filterState.advancedFilters.payment_echelon) params.set('payment_echelon', '1');
      if (filterState.advancedFilters.mobility_types.length > 0) params.set('mobility', filterState.advancedFilters.mobility_types.join(','));
      if (filterState.advancedFilters.details.length > 0) params.set('details', filterState.advancedFilters.details.join(','));

      setSearchParams(params, { replace: true });
    }, 300);

    return () => clearTimeout(timer);
  }, [filterState]);

  const updateSearchQuery = useCallback((query: string) => {
    setFilterState((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const toggleQuickFilter = useCallback((filterId: keyof QuickFilters) => {
    setFilterState((prev) => ({
      ...prev,
      quickFilters: {
        ...prev.quickFilters,
        [filterId]: !prev.quickFilters[filterId]
      }
    }));
  }, []);

  const updateAdvancedFilters = useCallback((filters: AdvancedFilters) => {
    setFilterState((prev) => ({ ...prev, advancedFilters: filters }));
  }, []);

  const updateSort = useCallback((sort: string) => {
    const validOptions = ['pertinence', 'date_desc', 'price_asc', 'distance'] as const;
    if (validOptions.includes(sort as typeof validOptions[number])) {
      setFilterState((prev) => ({ ...prev, sortBy: sort as FilterState['sortBy'] }));
    }
  }, []);

  const updateViewMode = useCallback((mode: 'map' | 'list') => {
    setFilterState((prev) => ({ ...prev, viewMode: mode }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilterState({
      searchQuery: '',
      quickFilters: { ...DEFAULT_QUICK_FILTERS },
      advancedFilters: { ...DEFAULT_ADVANCED_FILTERS },
      sortBy: 'pertinence',
      viewMode: 'list'
    });
  }, []);

  const getActiveFilterTags = useCallback((): ActiveFilterTag[] => {
    // Use helpers to reduce cognitive complexity
    const quickTags = buildQuickFilterTags(filterState.quickFilters);
    const advancedTags = buildAdvancedFilterTags(filterState.advancedFilters);
    return [...quickTags, ...advancedTags];
  }, [filterState]);

  const removeFilterTag = useCallback((tagId: string) => {
    if (tagId.startsWith('quick_')) {
      const filterId = tagId.replace('quick_', '') as keyof QuickFilters;
      toggleQuickFilter(filterId);
    } else if (tagId.startsWith('adv_')) {
      const field = tagId.replace('adv_', '');
      if (field === 'city') {
        setFilterState((prev) => ({
          ...prev,
          advancedFilters: { ...prev.advancedFilters, city: '' }
        }));
      } else if (field === 'period') {
        setFilterState((prev) => ({
          ...prev,
          advancedFilters: { ...prev.advancedFilters, period: 'all' }
        }));
      }
    }
  }, [toggleQuickFilter]);

  const getActiveFiltersCount = useCallback((): number => {
    return getActiveFilterTags().length;
  }, [getActiveFilterTags]);

  return {
    filterState,
    updateSearchQuery,
    toggleQuickFilter,
    updateAdvancedFilters,
    updateSort,
    updateViewMode,
    clearAllFilters,
    getActiveFilterTags,
    removeFilterTag,
    getActiveFiltersCount
  };
};
