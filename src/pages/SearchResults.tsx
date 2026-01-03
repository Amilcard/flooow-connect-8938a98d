/**
 * LOT 6 - SearchResultsPage
 * Complete search and filtering page
 * Integrates all LOT 6 components
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchPageHeader } from '@/components/Search/SearchPageHeader';
import { QuickFiltersBar } from '@/components/Search/QuickFiltersBar';
import { ActiveFiltersDisplay } from '@/components/Search/ActiveFiltersDisplay';
import { ResultsHeader } from '@/components/Search/ResultsHeader';
import { ResultsGrid } from '@/components/Search/ResultsGrid';
import { MapSearchView } from '@/components/Search/MapSearchView';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import { buildActivityQuery, getResultsCount } from '@/utils/buildActivityQuery';
import { safeErrorMessage } from '@/utils/sanitize';

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

  // Fetch activities with count
  const { data: queryResult, isLoading: isActivitiesLoading } = useQuery({
    queryKey: ['search-activities', filterState],
    queryFn: async () => {
      const query = buildActivityQuery(filterState);
      const { data, error, count } = await query;

      if (error) {
        console.error(safeErrorMessage(error, 'Fetch activities'));
        throw error;
      }

      // LOT 1 - T1_4: Mapping amélioré pour cohérence avec les cartes
      // Refonte vue carte: ajout coordonnées + organism info
      const mappedActivities = (data || []).map((activity: any) => ({
        id: activity.id,
        title: activity.title,
        category: activity.category || (activity.categories && activity.categories[0]) || 'Loisirs',
        images: activity.images || [],
        age_min: activity.age_min,
        age_max: activity.age_max,
        period_type: activity.period_type,
        price_amount: activity.price_base,
        price_is_free: activity.price_base === 0 || activity.price_base === null,
        // Organism info (denormalized)
        organism_name: activity.organism_name,
        organism_city: activity.organism_city,
        // Location for map
        location: activity.location || (activity.structures?.location ? {
          lat: activity.structures.location.lat,
          lng: activity.structures.location.lng
        } : null),
        location_name: activity.organism_name
          ? `${activity.organism_name}${activity.organism_city ? ' • ' + activity.organism_city : ''}`
          : activity.structures?.name
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

      return { activities: uniqueActivities, totalCount: count || 0 };
    },
    staleTime: 30000 // 30 seconds
  });

  const activities = queryResult?.activities || [];
  const totalCount = queryResult?.totalCount || 0;

  // Update results count from query result
  useEffect(() => {
    if (!isActivitiesLoading && totalCount > 0) {
      setResultsCount(totalCount);
    } else if (!isActivitiesLoading && activities.length > 0) {
      // Fallback to activities.length if count is not available
      setResultsCount(activities.length);
    }
  }, [totalCount, activities.length, isActivitiesLoading]);

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
        <MapSearchView 
          activities={activities.map((a: any) => ({
            id: a.id,
            title: a.title,
            category: a.category,
            price_base: a.price_amount || 0,
            age_min: a.age_min,
            age_max: a.age_max,
            period_type: a.period_type,
            images: a.images,
            organism_name: a.organism_name || a.location_name?.split(' • ')[0],
            organism_city: a.organism_city,
            location: a.location,
          }))}
          isLoading={isActivitiesLoading}
        />
      ) : (
        <>
          <ResultsGrid
            activities={activities}
            isLoading={isActivitiesLoading}
            onResetFilters={handleClearFilters}
          />
          {/* Bottom margin for navigation - only for list view */}
          <div className="h-20" />
        </>
      )}

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
