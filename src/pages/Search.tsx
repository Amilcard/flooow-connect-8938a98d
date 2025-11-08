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
import { MapPin, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logSearch } from "@/lib/tracking";
import type { Activity } from "@/types/domain";

const MapView = ({ activities }: { activities: Activity[] }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Map placeholder with activity count */}
      <div className="relative h-[400px] bg-muted rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <Card className="p-6 text-center max-w-sm mx-4">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2 className="font-semibold text-lg mb-2">Vue carte interactive</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {activities.length} activité{activities.length > 1 ? "s" : ""} disponible{activities.length > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              La carte interactive sera disponible prochainement
            </p>
          </Card>
        </div>
      </div>

      {/* Activities list in card format */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Liste des activités</h3>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune activité trouvée
          </div>
        ) : (
          activities.map((activity) => (
            <Card
              key={activity.id}
              className="p-4 cursor-pointer hover:bg-accent transition-colors"
              onClick={() => navigate(`/activity/${activity.id}`)}
            >
              <div className="flex gap-4">
                {activity.image && (
                  <img
                    src={activity.image}
                    alt={activity.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium mb-1 truncate">{activity.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {activity.ageRange}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {activity.categories?.slice(0, 2).map((cat: string) => (
                      <Badge key={cat} variant="secondary" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                    <span className="text-sm font-semibold text-primary ml-auto">
                      {activity.price}€
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

const Search = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  
  // Get filters from URL params
  const searchQuery = searchParams.get("q") || searchParams.get("query"); // Support both q and query
  const category = searchParams.get("category");
  const minAge = searchParams.get("minAge");
  const maxAge = searchParams.get("maxAge");
  const maxPrice = searchParams.get("maxPrice");
  const hasAid = searchParams.get("hasAid") === "true";
  const isPMR = searchParams.get("isPMR") === "true";
  const hasCovoiturage = searchParams.get("hasCovoiturage") === "true";

  // Build filters object
  const filters: any = {};
  if (searchQuery) filters.searchQuery = searchQuery;
  if (category) filters.category = category;
  if (minAge) filters.ageMin = parseInt(minAge);
  if (maxAge) filters.ageMax = parseInt(maxAge);
  if (maxPrice) filters.maxPrice = parseInt(maxPrice);
  if (isPMR) filters.hasAccessibility = true;
  if (hasCovoiturage) filters.hasCovoiturage = true;
  if (hasAid) filters.hasFinancialAid = true;

  const { data: activities, isLoading, error } = useActivities(filters);

  // Ne pas afficher de fallback - montrer vraiment les résultats de recherche
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

  if (error) {
    return <ErrorState message="Impossible de charger les activités" />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container py-2">
          <BackButton />
        </div>
        <SearchBar />
      </div>
      
      <div className="container py-4 space-y-4">
        {/* View toggle */}
        <div className="flex justify-end gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4 mr-2" />
            Liste
          </Button>
          <Button
            variant={viewMode === "map" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("map")}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Carte
          </Button>
        </div>

        {/* Search query display */}
        {searchQuery && (
          <div className="mb-2">
            <p className="text-lg font-semibold">
              Résultats pour : <span className="text-primary">"{searchQuery}"</span>
            </p>
          </div>
        )}

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          {displayActivities?.length || 0} activité(s) trouvée(s)
        </p>

        {/* View content */}
        {isLoading ? (
          <LoadingState />
        ) : viewMode === "list" ? (
          <ActivitySection
            title="Résultats de recherche"
            activities={displayActivities || []}
          />
        ) : (
          <MapView activities={displayActivities || []} />
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Search;
