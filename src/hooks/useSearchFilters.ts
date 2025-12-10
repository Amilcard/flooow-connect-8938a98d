/**
 * LOT 6 - useSearchFilters Hook
 * State management for search filters with URL sync
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterState, QuickFilters, AdvancedFilters, ActiveFilterTag } from '@/types/searchFilters';

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

  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: searchParams.get('q') || '',
    quickFilters: { ...DEFAULT_QUICK_FILTERS },
    advancedFilters: { ...DEFAULT_ADVANCED_FILTERS },
    sortBy: (searchParams.get('sort') as any) || 'pertinence',
    viewMode: (searchParams.get('view') as any) || 'list'
  });

  // Load filters from URL on mount
  useEffect(() => {
    const quickFilters = { ...DEFAULT_QUICK_FILTERS };
    if (searchParams.get('gratuit') === '1') quickFilters.gratuit = true;
    if (searchParams.get('vacances_ete') === '1') quickFilters.vacances_ete = true;
    if (searchParams.get('age_6_12') === '1') quickFilters.age_6_12 = true;
    if (searchParams.get('avec_aides') === '1') quickFilters.avec_aides = true;
    if (searchParams.get('proche') === '1') quickFilters.proche = true;
    if (searchParams.get('mercredi') === '1') quickFilters.mercredi = true;
    if (searchParams.get('sport') === '1') quickFilters.sport = true;
    if (searchParams.get('culture') === '1') quickFilters.culture = true;

    const advancedFilters = { ...DEFAULT_ADVANCED_FILTERS };
    if (searchParams.get('city')) advancedFilters.city = searchParams.get('city')!;
    if (searchParams.get('max_distance')) advancedFilters.max_distance = Number(searchParams.get('max_distance'));
    if (searchParams.get('period')) advancedFilters.period = searchParams.get('period')!;
    if (searchParams.get('age_min') && searchParams.get('age_max')) {
      advancedFilters.age_range = [
        Number(searchParams.get('age_min')),
        Number(searchParams.get('age_max'))
      ];
    }
    if (searchParams.get('payment_echelon') === '1') advancedFilters.payment_echelon = true;
    if (searchParams.get('mobility')) advancedFilters.mobility_types = searchParams.get('mobility')!.split(',');
    if (searchParams.get('details')) advancedFilters.details = searchParams.get('details')!.split(',');

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
    setFilterState((prev) => ({ ...prev, sortBy: sort as any }));
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
    const tags: ActiveFilterTag[] = [];

    // Quick filters
    Object.entries(filterState.quickFilters).forEach(([key, value]) => {
      if (value) {
        const labels: Record<string, string> = {
          gratuit: 'Gratuit',
          vacances_ete: 'Vacances été',
          age_6_12: '6-12 ans',
          avec_aides: 'Aides acceptées',
          proche: '< 2 km',
          mercredi: 'Mercredi',
          sport: 'Sport',
          culture: 'Culture'
        };
        tags.push({
          id: `quick_${key}`,
          label: labels[key] || key,
          value: key,
          section: 'quick'
        });
      }
    });

    // Advanced filters
    if (filterState.advancedFilters.city) {
      tags.push({
        id: 'adv_city',
        label: `Ville: ${filterState.advancedFilters.city}`,
        value: 'city',
        section: 'advanced'
      });
    }

    if (filterState.advancedFilters.period !== 'all') {
      const periodLabels: Record<string, string> = {
        spring_2026: 'Printemps 2026',
        summer_2026: 'Été 2026',
        school_year_2026: 'Année scolaire',
        wednesdays: 'Mercredis'
      };
      tags.push({
        id: 'adv_period',
        label: periodLabels[filterState.advancedFilters.period] || filterState.advancedFilters.period,
        value: 'period',
        section: 'advanced'
      });
    }

    if (filterState.advancedFilters.payment_echelon) {
      tags.push({
        id: 'adv_payment_echelon',
        label: 'Paiement échelonné',
        value: 'payment_echelon',
        section: 'advanced'
      });
    }

    return tags;
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
