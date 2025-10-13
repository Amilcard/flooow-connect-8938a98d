import { SearchBar } from "@/components/SearchBar";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ActivityCarousel } from "@/components/ActivityCarousel";
import { ActivitySection } from "@/components/ActivitySection";
import { useActivities } from "@/hooks/useActivities";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

const Index = () => {
  // Charger les différentes catégories d'activités
  const { data: featuredActivities = [], isLoading: loadingFeatured } = useActivities({ limit: 5 });
  const { data: nearbyActivities = [], isLoading: loadingNearby } = useActivities({ limit: 5 });
  const { data: budgetActivities = [], isLoading: loadingBudget } = useActivities({ maxPrice: 50, limit: 5 });
  const { data: healthActivities = [], isLoading: loadingHealth } = useActivities({ hasAccessibility: true, limit: 5 });

  const isLoading = loadingFeatured || loadingNearby || loadingBudget || loadingHealth;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <SearchBar onFilterClick={() => console.log("Filter clicked")} />
        <main className="container px-4 py-6">
          <LoadingState />
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
          onSeeAll={() => console.log("See all nearby")}
          onActivityClick={(id) => console.log("Activity clicked:", id)}
        />

        <ActivitySection
          title="Activités Petits budgets"
          activities={budgetActivities}
          onSeeAll={() => console.log("See all budget")}
          onActivityClick={(id) => console.log("Activity clicked:", id)}
        />

        <ActivitySection
          title="Activités Santé"
          activities={healthActivities}
          onSeeAll={() => console.log("See all health")}
          onActivityClick={(id) => console.log("Activity clicked:", id)}
        />
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Index;
