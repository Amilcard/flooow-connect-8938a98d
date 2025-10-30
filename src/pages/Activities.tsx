import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { ActivitySection } from "@/components/Activity/ActivitySection";
import { VacationPeriodFilter } from "@/components/VacationPeriodFilter";
import { useActivities } from "@/hooks/useActivities";
import { useMockActivities } from "@/hooks/useMockActivities";
import { ErrorState } from "@/components/ErrorState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageLayout from "@/components/PageLayout";

const Activities = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");
  const type = searchParams.get("type");
  const [selectedVacationPeriod, setSelectedVacationPeriod] = useState<string | undefined>();

  // Déterminer les filtres selon le type de section
  const getFilters = () => {
    const filters: any = {};
    if (category) filters.category = category;
    if (type === "budget") filters.maxPrice = 50;
    if (type === "health") filters.hasAccessibility = true;
    if (selectedVacationPeriod) filters.vacationPeriod = selectedVacationPeriod;
    return filters;
  };

  const { data: activities = [], isLoading, error } = useActivities(getFilters());
  const { data: mockActivities = [], isLoading: loadingMocks, error: mockError } = useMockActivities(10);

  console.log("📊 Activities page state:", { 
    activitiesCount: activities.length, 
    mockActivitiesCount: mockActivities.length,
    loadingMocks,
    mockError 
  });

  const getTitle = () => {
    if (category) return `Activités ${category}`;
    if (type === "budget") return "Activités Petits budgets";
    if (type === "health") return "Activités Innovantes";
    if (type === "nearby") return "Activités à proximité";
    return "Toutes les activités";
  };

  if (error) {
    return (
      <PageLayout>
        <SearchBar onFilterClick={() => console.log("Filter clicked")} />
        <main className="container px-4 py-6">
          <ErrorState 
            message="Impossible de charger les activités. Veuillez réessayer." 
            onRetry={() => window.location.reload()}
          />
        </main>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SearchBar onFilterClick={() => console.log("Filter clicked")} />
      
      <main className="container px-4 py-6">
        <VacationPeriodFilter 
          selectedPeriod={selectedVacationPeriod}
          onPeriodChange={setSelectedVacationPeriod}
        />
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full mb-6 grid grid-cols-3 sm:grid-cols-6">
            <TabsTrigger value="all" className="flex-1">Toutes</TabsTrigger>
            <TabsTrigger value="Sport" className="flex-1">Sport</TabsTrigger>
            <TabsTrigger value="Culture" className="flex-1">Culture</TabsTrigger>
            <TabsTrigger value="Loisirs" className="flex-1">Loisirs</TabsTrigger>
            <TabsTrigger value="Vacances" className="flex-1">Vacances</TabsTrigger>
            <TabsTrigger value="Scolarité" className="flex-1">Scolarité</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <ActivitySection
              title={getTitle()}
              activities={activities}
              onActivityClick={(id) => console.log("Activity clicked:", id)}
            />
          </TabsContent>

          {["Sport", "Culture", "Loisirs", "Vacances", "Scolarité"].map((cat) => (
            <TabsContent key={cat} value={cat}>
              <CategoryActivities category={cat} />
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </PageLayout>
  );
};

const CategoryActivities = ({ category }: { category: string }) => {
  const { data: activities = [] } = useActivities({ category });
  
  return (
    <ActivitySection
      title={`Activités ${category}`}
      activities={activities}
      onActivityClick={(id) => console.log("Activity clicked:", id)}
    />
  );
};

export default Activities;
