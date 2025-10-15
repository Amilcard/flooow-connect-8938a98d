import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { ActivitySection } from "@/components/Activity/ActivitySection";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useActivities } from "@/hooks/useActivities";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, List } from "lucide-react";
import { Button } from "@/components/ui/button";

const Search = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  
  // Get filters from URL params
  const category = searchParams.get("category");
  const minAge = searchParams.get("minAge");
  const maxAge = searchParams.get("maxAge");
  const maxPrice = searchParams.get("maxPrice");
  const hasAid = searchParams.get("hasAid") === "true";
  const isPMR = searchParams.get("isPMR") === "true";
  const hasCovoiturage = searchParams.get("hasCovoiturage") === "true";

  // Build filters object
  const filters: any = {};
  if (category) filters.category = category;
  if (minAge) filters.age_min = parseInt(minAge);
  if (maxAge) filters.age_max = parseInt(maxAge);
  if (maxPrice) filters.price_base = `lte.${maxPrice}`;
  if (isPMR) filters["accessibility_checklist->>wheelchair"] = "eq.true";
  if (hasCovoiturage) filters.covoiturage_enabled = true;

  const { data: activities, isLoading, error } = useActivities(filters);

  if (error) {
    return <ErrorState message="Impossible de charger les activités" />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <SearchBar />
      
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

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          {activities?.length || 0} activité(s) trouvée(s)
        </p>

        {/* View content */}
        {viewMode === "list" ? (
          isLoading ? (
            <LoadingState />
          ) : (
            <ActivitySection
              title="Résultats de recherche"
              activities={activities || []}
            />
          )
        ) : (
          <div className="bg-muted rounded-lg p-8 text-center">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Vue carte à venir</p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Search;
