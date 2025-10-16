import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Search, Filter } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const ActivitiesMap = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [postalCode, setPostalCode] = useState(searchParams.get("postal") || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("categories")?.split(",").filter(Boolean) || []
  );

  const categories = ["Sport", "Culture", "Loisirs", "Scolarité", "Vacances", "Activités Innovantes"];

  // Request geolocation
  useEffect(() => {
    if (!postalCode && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log("Geolocation denied or unavailable", error);
        }
      );
    }
  }, [postalCode]);

  // Fetch activities
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities-map", selectedCategories],
    queryFn: async () => {
      let query = supabase
        .from("activities")
        .select(`
          *,
          structures:structure_id(name, address, location)
        `)
        .eq("published", true);

      if (selectedCategories.length > 0) {
        query = query.in("category", selectedCategories);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter out activities without coordinates
      return (data || []).filter(
        (activity) => activity.structures?.location
      );
    }
  });

  const handleCategoryToggle = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newCategories);
    
    // Update URL params
    const params = new URLSearchParams(searchParams);
    if (newCategories.length > 0) {
      params.set("categories", newCategories.join(","));
    } else {
      params.delete("categories");
    }
    setSearchParams(params);
  };

  const handlePostalCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (postalCode) {
      params.set("postal", postalCode);
    } else {
      params.delete("postal");
    }
    setSearchParams(params);
    // TODO: Geocode postal code to coordinates
  };

  if (isLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container flex items-center gap-3 py-3 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Retour"
          >
            <ArrowLeft />
          </Button>
          <h1 className="font-semibold text-lg flex-1">Carte des activités</h1>
          
          {/* Filters sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtres</SheetTitle>
                <SheetDescription>
                  Affinez votre recherche d'activités
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* Category filters */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Catégories</Label>
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => handleCategoryToggle(category)}
                        />
                        <Label htmlFor={category} className="cursor-pointer">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Postal code search */}
                <div>
                  <Label htmlFor="postal" className="text-base font-semibold mb-3 block">
                    Code postal
                  </Label>
                  <form onSubmit={handlePostalCodeSubmit} className="flex gap-2">
                    <Input
                      id="postal"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="75001"
                      maxLength={5}
                    />
                    <Button type="submit" size="icon">
                      <Search className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Map placeholder - TODO: Integrate React Leaflet */}
      <div className="flex-1 relative bg-muted">
        <div className="absolute inset-0 flex items-center justify-center">
          <Card className="p-6 text-center max-w-sm mx-4">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2 className="font-semibold text-lg mb-2">Carte interactive</h2>
            <p className="text-sm text-muted-foreground mb-4">
              L'intégration React Leaflet sera ajoutée ici. Affichera {activities.length} activités.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {selectedCategories.map((cat) => (
                <Badge key={cat} variant="secondary">
                  {cat}
                </Badge>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Activities list */}
      <div className="container px-4 py-4 border-t bg-background">
        <h2 className="font-semibold mb-3">
          {activities.length} activité{activities.length > 1 ? "s" : ""} trouvée{activities.length > 1 ? "s" : ""}
        </h2>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {activities.map((activity) => (
            <Card
              key={activity.id}
              className="p-3 cursor-pointer hover:bg-accent transition-colors"
              onClick={() => navigate(`/activity/${activity.id}`)}
            >
              <div className="flex gap-3">
                {activity.images?.[0] && (
                  <img
                    src={activity.images[0]}
                    alt={activity.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{activity.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {activity.structures?.name}
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    {activity.category}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivitiesMap;
