import { SearchBar } from "@/components/SearchBar";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ActivityCarousel } from "@/components/ActivityCarousel";
import { ActivitySection } from "@/components/ActivitySection";
import { useActivities } from "@/hooks/useActivities";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { ActivityCardSkeleton } from "@/components/ActivityCardSkeleton";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  // Charger les différentes catégories d'activités (limité à 4 par section)
  const { data: featuredActivities = [], isLoading: loadingFeatured, error: errorFeatured } = useActivities({ limit: 4 });
  const { data: nearbyActivities = [], isLoading: loadingNearby } = useActivities({ limit: 4 });
  const { data: budgetActivities = [], isLoading: loadingBudget } = useActivities({ maxPrice: 50, limit: 4 });
  const { data: healthActivities = [], isLoading: loadingHealth } = useActivities({ hasAccessibility: true, limit: 4 });

  const isLoading = loadingFeatured || loadingNearby || loadingBudget || loadingHealth;

  if (errorFeatured) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <SearchBar onFilterClick={() => console.log("Filter clicked")} />
        <main className="container px-4 py-6">
          <ErrorState 
            message="Impossible de charger les activités. Veuillez réessayer." 
            onRetry={() => window.location.reload()}
          />
        </main>
        <BottomNavigation />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background pb-20">
      <SearchBar onFilterClick={() => console.log("Filter clicked")} />
      
      <main className="container px-4 py-6 space-y-8">
        <section aria-label="Activités en vedette">
          <h1 className="text-2xl font-bold mb-4">Découvrez nos activités</h1>
          <ActivityCarousel 
            activities={featuredActivities}
            onActivityClick={(id) => console.log("Activity clicked:", id)}
          />
        </section>

        <ActivitySection
          title="Activités à proximité"
          activities={nearbyActivities}
          onSeeAll={() => navigate("/activities?type=nearby")}
          onActivityClick={(id) => console.log("Activity clicked:", id)}
        />

        <ActivitySection
          title="Activités Petits budgets"
          activities={budgetActivities}
          onSeeAll={() => navigate("/activities?type=budget")}
          onActivityClick={(id) => console.log("Activity clicked:", id)}
        />

        <ActivitySection
          title="Activités Santé"
          activities={healthActivities}
          onSeeAll={() => navigate("/activities?type=health")}
          onActivityClick={(id) => console.log("Activity clicked:", id)}
        />
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Index;
