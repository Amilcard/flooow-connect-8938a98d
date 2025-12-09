/**
 * LOT 6 - SearchResultsPage
 * Complete search and filtering page
 * Integrates all LOT 6 components
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchPageHeader } from '@/components/search/SearchPageHeader';
import { QuickFiltersBar } from '@/components/search/QuickFiltersBar';
import { ActiveFiltersDisplay } from '@/components/search/ActiveFiltersDisplay';
import { ResultsHeader } from '@/components/search/ResultsHeader';
import { ResultsGrid } from '@/components/search/ResultsGrid';
import { ActivityMap } from '@/components/search/ActivityMap';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import { buildActivityQuery, getResultsCount } from '@/utils/buildActivityQuery';

const SearchResults = () => {
  const {
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
  } = useSearchFilters();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resultsCount, setResultsCount] = useState(0);
  const [isCountLoading, setIsCountLoading] = useState(false);

  // Fetch activities
  const { data: activities = [], isLoading: isActivitiesLoading } = useQuery({
    queryKey: ['search-activities', filterState],
    queryFn: async () => {
      const query = buildActivityQuery(filterState);
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching activities:', error);
        throw error;
      }

      // LOT 1 - T1_4: Mapping amélioré pour cohérence avec les cartes
      const mappedActivities = (data || []).map((activity: any) => ({
        id: activity.id,
        title: activity.title,
        category: activity.category || (activity.categories && activity.categories[0]) || 'Loisirs',
        images: activity.images || [],
        age_min: activity.age_min,
        age_max: activity.age_max,
        price_amount: activity.price_base,
        price_is_free: activity.price_base === 0 || activity.price_base === null,
        location_name: activity.structures?.name
          ? `${activity.structures.name}${activity.structures.address ? ' • ' + activity.structures.address : ''}`
          : undefined,
        financial_aids_accepted: activity.accepts_aid_types || [],
      }));

      // Deduplicate by ID first
      const uniqueById = mappedActivities.filter((activity: any, index: number, self: any[]) =>
        index === self.findIndex((t: any) => t.id === activity.id)
      );

      // Aggressive deduplication by normalized title
      const uniqueActivities = uniqueById.filter((activity: any, index: number, self: any[]) =>
        index === self.findIndex((t: any) => 
          t.title?.trim().toLowerCase() === activity.title?.trim().toLowerCase()
        )
      );

      return uniqueActivities;
    },
    staleTime: 30000 // 30 seconds
  });

  // Update results count (debounced) - REMOVED to avoid race conditions
  // We rely on activities.length since we fetch all results
  /*
  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsCountLoading(true);
      const count = await getResultsCount(filterState);
      setResultsCount(count);
      setIsCountLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [filterState]);
  */

  // Update results count from actual activities
  useEffect(() => {
    if (!isActivitiesLoading && activities) {
      setResultsCount(activities.length);
    }
  }, [activities, isActivitiesLoading]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleApplyFilters = () => {
    // Filters are already applied via state management
    handleCloseModal();
  };

  const handleClearFilters = () => {
    clearAllFilters();
    setResultsCount(0);
  };

  const activeFilterTags = getActiveFilterTags();
  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Search Header */}
      <SearchPageHeader
        searchQuery={filterState.searchQuery}
        onSearchChange={updateSearchQuery}
        activeFiltersCount={activeFiltersCount}
        onOpenFilters={handleOpenModal}
      />

      {/* Sticky Quick Filters Bar */}
      <QuickFiltersBar
        quickFilters={filterState.quickFilters}
        onToggleFilter={toggleQuickFilter}
      />

      {/* Active Filters Display */}
      <ActiveFiltersDisplay
        activeFilters={activeFilterTags}
        onRemoveFilter={removeFilterTag}
        onClearAll={clearAllFilters}
      />

      {/* Results Header */}
      <ResultsHeader
        resultsCount={resultsCount}
        sortBy={filterState.sortBy}
        onSortChange={updateSort}
        viewMode={filterState.viewMode}
        onViewModeChange={updateViewMode}
      />

      {/* Results Grid or Map */}
      {filterState.viewMode === 'map' ? (
        <div className="px-4 pb-8">
          <ActivityMap activities={activities} />
        </div>
      ) : (
        <ResultsGrid
          activities={activities}
          isLoading={isActivitiesLoading}
          onResetFilters={handleClearFilters}
        />
      )}

      {/* Bottom margin for navigation */}
      <div className="h-20" />

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Advanced Filters Modal - Temporarily disabled until Lovable syncs components */}
      {/* 
      <AdvancedFiltersModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        filters={filterState.advancedFilters}
        onFiltersChange={updateAdvancedFilters}
        resultsCount={resultsCount}
        isCountLoading={isCountLoading}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />
      */}
    </div>
  );
};

export default SearchResults;
