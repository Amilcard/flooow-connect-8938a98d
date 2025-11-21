import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { ActivitySection } from "@/components/Activity/ActivitySection";
import { BottomNavigation } from "@/components/BottomNavigation";
import { BackButton } from "@/components/BackButton";
import { useActivities } from "@/hooks/useActivities";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, List, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { logSearch } from "@/lib/tracking";
import type { Activity } from "@/types/domain";
import { InteractiveMapActivities } from "@/components/search/InteractiveMapActivities";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  
  // Get filters from URL params
  const searchQuery = searchParams.get("q") || searchParams.get("query");
  const category = searchParams.get("category");
  const minAge = searchParams.get("minAge");
  const maxAge = searchParams.get("maxAge");
  const maxPrice = searchParams.get("maxPrice");
  const hasAid = searchParams.get("hasAid") === "true";
  const isInclusive = searchParams.get("isInclusive") === "true";
  const hasCovoiturage = searchParams.get("hasCovoiturage") === "true";

  // Build filters object
  const filters: any = {};
  if (searchQuery) filters.searchQuery = searchQuery;
  if (category) filters.category = category;
  if (minAge) filters.ageMin = parseInt(minAge);
  if (maxAge) filters.ageMax = parseInt(maxAge);
  if (maxPrice) filters.maxPrice = parseInt(maxPrice);
  if (isInclusive) filters.hasAccessibility = true;
  if (hasCovoiturage) filters.hasCovoiturage = true;
  if (hasAid) filters.hasFinancialAid = true;

  const { activities, isRelaxed, isLoading, error } = useActivities(filters);

  const displayActivities = activities || [];

  // Logger la recherche quand les résultats changent
  useEffect(() => {
    if (activities && !isLoading) {
      logSearch({
        filtersApplied: filters,
        resultsCount: activities.length
      });
    }
  }, [activities, isLoading]);

  // Build active filters for display
  const activeFilters: Array<{ key: string; label: string; param: string }> = [];
  if (category) activeFilters.push({ key: 'category', label: `Catégorie: ${category}`, param: 'category' });
  if (minAge && maxAge) activeFilters.push({ key: 'age', label: `Âge: ${minAge}-${maxAge} ans`, param: 'age' });
  else if (minAge) activeFilters.push({ key: 'minAge', label: `À partir de ${minAge} ans`, param: 'minAge' });
  else if (maxAge) activeFilters.push({ key: 'maxAge', label: `Jusqu'à ${maxAge} ans`, param: 'maxAge' });
  if (maxPrice) activeFilters.push({ key: 'maxPrice', label: `Max ${maxPrice}€`, param: 'maxPrice' });
  if (hasAid) activeFilters.push({ key: 'hasAid', label: 'Avec aides financières', param: 'hasAid' });
  if (isInclusive) activeFilters.push({ key: 'isInclusive', label: 'Activité InKlusif', param: 'isInclusive' });
  if (hasCovoiturage) activeFilters.push({ key: 'hasCovoiturage', label: 'Covoiturage dispo', param: 'hasCovoiturage' });

  const removeFilter = (paramKey: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (paramKey === 'age') {
      newParams.delete('minAge');
      newParams.delete('maxAge');
    } else {
      newParams.delete(paramKey);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.set('q', searchQuery);
    setSearchParams(newParams);
  };

  if (error) {
    return <ErrorState message="Impossible de charger les activités" />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container py-2">
          <BackButton positioning="relative" size="sm" />
        </div>
        <SearchBar />
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
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <span className="text-xs font-medium text-muted-foreground">Filtres actifs:</span>
            {activeFilters.map((filter) => (
              <Badge 
                key={filter.key}
                variant="secondary"
                className="gap-2 cursor-pointer hover:bg-destructive/10 transition-colors"
                onClick={() => removeFilter(filter.param)}
              >
                {filter.label}
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
              onClick={() => navigate('/search-filters')}
              className="gap-2"
              data-tour-id="search-filters-button"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtres
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("map")}
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

      <BottomNavigation />
    </div>
  );
};

export default Search;
