import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { ActivitySection } from "@/components/Activity/ActivitySection";
import { BottomNavigation } from "@/components/BottomNavigation";
import { BackButton } from "@/components/BackButton";
import { useActivities } from "@/hooks/useActivities";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { Badge } from "@/components/ui/badge";
import { MapPin, List, X, SlidersHorizontal, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { logSearch } from "@/lib/tracking";
import { InteractiveMapActivities } from "@/components/Search/InteractiveMapActivities";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { AdvancedFiltersModal } from "@/components/Search/AdvancedFiltersModal";

const Search = () => {
  const navigate = useNavigate();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Use the unified hook for filter state management
  const { 
    filterState, 
    updateSearchQuery,
    updateAdvancedFilters,
    getActiveFilterTags,
    removeFilterTag,
    clearAllFilters,
    updateViewMode
  } = useSearchFilters();

  const { advancedFilters, viewMode, searchQuery } = filterState;

  // Map advanced filters to useActivities filters
  // Ne pas appliquer les filtres si les valeurs par défaut sont utilisées
  const isAgeFilterActive = advancedFilters.age_range[0] !== 4 || advancedFilters.age_range[1] !== 17;
  const isPriceFilterActive = advancedFilters.max_budget !== 500; // 500€ est la valeur par défaut

  const activityFilters = {
    searchQuery: searchQuery,
    categories: advancedFilters.categories,
    // Seulement appliquer le filtre d'âge si l'utilisateur l'a modifié
    ageMin: isAgeFilterActive ? advancedFilters.age_range[0] : undefined,
    ageMax: isAgeFilterActive ? advancedFilters.age_range[1] : undefined,
    // Seulement appliquer le filtre de prix si l'utilisateur l'a modifié
    maxPrice: isPriceFilterActive ? advancedFilters.max_budget : undefined,
    hasAccessibility: advancedFilters.inclusivity || advancedFilters.specific_needs.length > 0,
    hasFinancialAid: advancedFilters.financial_aids_accepted.length > 0 || advancedFilters.payment_echelon || advancedFilters.qf_based_pricing,
    mobilityTypes: advancedFilters.mobility_types,
    // Fix: Distinguer le type de période (scolaire/vacances) des périodes spécifiques (dates)
    periodType: (advancedFilters.period === 'vacances' || advancedFilters.period === 'scolaire') ? advancedFilters.period : undefined,
    vacationPeriod: (advancedFilters.period !== 'all' && advancedFilters.period !== 'vacances' && advancedFilters.period !== 'scolaire') ? advancedFilters.period : undefined,
    // Add other mappings as needed
  };

  const { activities, isRelaxed, isLoading, error } = useActivities(activityFilters);

  const displayActivities = activities || [];
  const activeTags = getActiveFilterTags();

  // Logger la recherche quand les résultats changent
  useEffect(() => {
    if (activities && !isLoading) {
      logSearch({
        filtersApplied: activityFilters,
        resultsCount: activities.length
      });
    }
  }, [activities, isLoading]);

  if (error) {
    return <ErrorState message="Impossible de charger les activités" />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container py-2">
          <BackButton positioning="relative" size="sm" showText={true} label="Retour" />
        </div>
        <SearchBar 
          onFilterClick={() => setIsFiltersOpen(true)}
          onSearch={updateSearchQuery}
          placeholder="Rechercher..."
        />
      </div>
      
      <div className="container py-4 space-y-4">
        {/* Search query display */}
        {searchQuery && (
          <div className="mb-2 space-y-2">
            <p className="text-lg font-semibold">
              Résultats pour : <span className="text-primary">"{searchQuery}"</span>
            </p>
            {isRelaxed && (
              <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  Aucun résultat exact trouvé avec vos filtres. Nous avons élargi la recherche pour vous montrer ces activités correspondantes.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Active filters pills */}
        {activeTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <span className="text-xs font-medium text-muted-foreground">Filtres actifs:</span>
            {activeTags.map((tag) => (
              <Badge 
                key={tag.id}
                variant="secondary"
                className="gap-2 cursor-pointer hover:bg-destructive/10 transition-colors"
                onClick={() => removeFilterTag(tag.id)}
              >
                {tag.label}
                <X size={12} />
              </Badge>
            ))}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearAllFilters}
              className="h-6 text-xs px-2 ml-auto"
            >
              Tout effacer
            </Button>
          </div>
        )}

        {/* View toggle + Results count */}
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {displayActivities?.length || 0} activité(s) trouvée(s)
          </p>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFiltersOpen(true)}
              className="gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtres
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => updateViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "outline"}
              size="sm"
              onClick={() => updateViewMode("map")}
            >
              <MapPin className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* View content */}
        {isLoading ? (
          <LoadingState />
        ) : viewMode === "list" ? (
          <ActivitySection
            title="Résultats de recherche"
            activities={displayActivities || []}
          />
        ) : (
          <InteractiveMapActivities
            activities={displayActivities || []}
            height="600px"
          />
        )}
      </div>

      <AdvancedFiltersModal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={advancedFilters}
        onFiltersChange={updateAdvancedFilters}
        resultsCount={displayActivities.length}
        isCountLoading={isLoading}
        onApply={() => setIsFiltersOpen(false)}
        onClear={clearAllFilters}
      />

      <BottomNavigation />
    </div>
  );
};

export default Search;
