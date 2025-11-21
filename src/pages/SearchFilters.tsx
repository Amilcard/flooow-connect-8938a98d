import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import PageLayout from "@/components/PageLayout";
import { AdvancedFilters } from "@/types/searchFilters";
import { AdvancedFiltersContent } from "@/components/search/AdvancedFiltersContent";
import { AdvancedFiltersFooter } from "@/components/search/AdvancedFiltersFooter";
import { useQuery } from "@tanstack/react-query";
import { buildActivityQuery } from "@/utils/buildActivityQuery";

const DEFAULT_ADVANCED_FILTERS: AdvancedFilters = {
  city: '',
  max_distance: 5,
  period: 'all',
  days_of_week: [],
  age_range: [4, 17],
  specific_needs: [],
  categories: [],
  accommodation_type: 'all',
  max_budget: 200,
  financial_aids_accepted: [],
  qf_based_pricing: false,
  inclusivity: false,
  public_transport: false
};

export default function SearchFilters() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [resultsCount, setResultsCount] = useState(0);

  // Parse initial filters from URL
  const [localFilters, setLocalFilters] = useState<AdvancedFilters>(() => {
    const filters = { ...DEFAULT_ADVANCED_FILTERS };
    
    if (searchParams.get('city')) filters.city = searchParams.get('city')!;
    if (searchParams.get('max_distance')) filters.max_distance = Number(searchParams.get('max_distance'));
    if (searchParams.get('period')) filters.period = searchParams.get('period')!;
    if (searchParams.get('age_min') && searchParams.get('age_max')) {
      filters.age_range = [
        Number(searchParams.get('age_min')),
        Number(searchParams.get('age_max'))
      ];
    }
    if (searchParams.get('max_budget')) filters.max_budget = Number(searchParams.get('max_budget'));
    if (searchParams.get('inclusivity') === 'true') filters.inclusivity = true;
    if (searchParams.get('public_transport') === 'true') filters.public_transport = true;
    if (searchParams.get('qf_based_pricing') === 'true') filters.qf_based_pricing = true;
    
    // Handle array params
    const categories = searchParams.getAll('categories');
    if (categories.length > 0) filters.categories = categories;
    
    const aids = searchParams.getAll('financial_aids_accepted');
    if (aids.length > 0) filters.financial_aids_accepted = aids;

    return filters;
  });

  // Fetch results count based on current filters
  const { data: activities = [], isLoading: isCountLoading } = useQuery({
    queryKey: ['search-activities-count', localFilters],
    queryFn: async () => {
      // Construct a temporary filter state for the query builder
      const tempFilterState = {
        searchQuery: searchParams.get('q') || '',
        quickFilters: {
          gratuit: false,
          vacances_ete: false,
          age_6_12: false,
          avec_aides: false,
          proche: false,
          mercredi: false,
          sport: false,
          culture: false
        },
        advancedFilters: localFilters,
        sortBy: 'pertinence' as const,
        viewMode: 'list' as const
      };

      const query = buildActivityQuery(tempFilterState);
      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    staleTime: 30000
  });

  useEffect(() => {
    if (!isCountLoading) {
      setResultsCount(activities.length);
    }
  }, [activities, isCountLoading]);

  const handleApply = () => {
    const params = new URLSearchParams(searchParams);

    // Update params based on localFilters
    if (localFilters.city) params.set('city', localFilters.city);
    else params.delete('city');

    if (localFilters.max_distance !== 5) params.set('max_distance', String(localFilters.max_distance));
    else params.delete('max_distance');

    if (localFilters.period !== 'all') params.set('period', localFilters.period);
    else params.delete('period');

    if (localFilters.age_range[0] !== 4 || localFilters.age_range[1] !== 17) {
      params.set('age_min', String(localFilters.age_range[0]));
      params.set('age_max', String(localFilters.age_range[1]));
    } else {
      params.delete('age_min');
      params.delete('age_max');
    }

    if (localFilters.max_budget !== 200) params.set('max_budget', String(localFilters.max_budget));
    else params.delete('max_budget');

    if (localFilters.inclusivity) params.set('inclusivity', 'true');
    else params.delete('inclusivity');

    if (localFilters.public_transport) params.set('public_transport', 'true');
    else params.delete('public_transport');

    if (localFilters.qf_based_pricing) params.set('qf_based_pricing', 'true');
    else params.delete('qf_based_pricing');

    // Handle arrays
    params.delete('categories');
    localFilters.categories.forEach(c => params.append('categories', c));

    params.delete('financial_aids_accepted');
    localFilters.financial_aids_accepted.forEach(a => params.append('financial_aids_accepted', a));
    
    navigate(`/search?${params.toString()}`);
  };

  const handleReset = () => {
    setLocalFilters(DEFAULT_ADVANCED_FILTERS);
  };

  const activeFiltersCount = 
    (localFilters.city ? 1 : 0) +
    (localFilters.period !== 'all' ? 1 : 0) +
    (localFilters.categories.length) +
    (localFilters.inclusivity ? 1 : 0) +
    (localFilters.public_transport ? 1 : 0) +
    (localFilters.financial_aids_accepted.length > 0 ? 1 : 0) +
    (localFilters.qf_based_pricing ? 1 : 0);

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
        <div className="flex-1 container max-w-2xl px-0 sm:px-4">
          <AdvancedFiltersContent
            filters={localFilters}
            onFiltersChange={setLocalFilters}
          />
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0">
          <div className="container max-w-2xl px-0 sm:px-4">
            <AdvancedFiltersFooter
              onClear={handleReset}
              onApply={handleApply}
              resultsCount={resultsCount}
              isCountLoading={isCountLoading}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

