import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import PageLayout from "@/components/PageLayout";
import { AdvancedFiltersContent } from "@/components/Search/AdvancedFiltersContent";
import { AdvancedFiltersFooter } from "@/components/Search/AdvancedFiltersFooter";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { useQuery } from "@tanstack/react-query";
import { buildActivityQuery } from "@/utils/buildActivityQuery";

export default function SearchFilters() {
  const navigate = useNavigate();
  
  // Use shared hook for filter state
  const { 
    filterState, 
    updateAdvancedFilters, 
    clearAllFilters,
    getActiveFiltersCount
  } = useSearchFilters();

  const { advancedFilters } = filterState;

  // Fetch results count based on current filters
  const { data: activities = [], isLoading: isCountLoading } = useQuery({
    queryKey: ['search-activities-count', filterState],
    queryFn: async () => {
      const query = buildActivityQuery(filterState);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000
  });

  const handleApply = () => {
    // Navigate to search page with current params
    // Since useSearchFilters syncs to URL, we just need to switch path to /search
    // preserving the query string
    navigate({
      pathname: '/search',
      search: window.location.search
    });
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <PageLayout>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="container max-w-2xl px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <BackButton
                positioning="relative"
                size="sm"
                showText={true}
                label="Retour"
              />
              {activeFiltersCount > 0 && (
                <Badge variant="secondary">{activeFiltersCount} actif(s)</Badge>
              )}
            </div>
            <h1 className="text-2xl font-display font-bold">Filtres de recherche</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Affinez votre recherche selon vos besoins
            </p>
          </div>
        </div>

        {/* Filters Content */}
        <div className="flex-1 container max-w-2xl px-4 sm:px-4 py-6">
          <AdvancedFiltersContent
            filters={advancedFilters}
            onFiltersChange={updateAdvancedFilters}
          />
        </div>

        {/* Footer Actions */}
        <AdvancedFiltersFooter
          onClear={clearAllFilters}
          onApply={handleApply}
          resultsCount={activities.length}
          isCountLoading={isCountLoading}
        />
      </div>
    </PageLayout>
  );
}

