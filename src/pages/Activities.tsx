import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { ActivitySection } from "@/components/Activity/ActivitySection";
import { VacationPeriodFilter } from "@/components/VacationPeriodFilter";
import { useActivities } from "@/hooks/useActivities";
import { useMockActivities } from "@/hooks/useMockActivities";
import { ErrorState } from "@/components/ErrorState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageLayout from "@/components/PageLayout";

// Mapping des IDs univers vers les catégories réelles
const UNIVERSE_TO_CATEGORY: Record<string, string> = {
  'sport': 'Sport',
  'culture': 'Culture',
  'apprentissage': 'Scolarité',
  'loisirs': 'Loisirs',
  'vacances': 'Vacances'
};

const Activities = () => {
  const [searchParams] = useSearchParams();
  const universeFromUrl = searchParams.get("universe");
  const category = searchParams.get("category");
  const type = searchParams.get("type");
  const periodFromUrl = searchParams.get("period") || undefined;
  const [selectedVacationPeriod, setSelectedVacationPeriod] = useState<string | undefined>(periodFromUrl);
  
  // Déterminer l'onglet actif initial basé sur le paramètre universe ou category
  const getInitialTab = () => {
    if (universeFromUrl && UNIVERSE_TO_CATEGORY[universeFromUrl]) {
      return UNIVERSE_TO_CATEGORY[universeFromUrl];
    }
    if (category) {
      return category;
    }
    return "all";
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());

  // Mettre à jour l'onglet actif si les paramètres URL changent
  useEffect(() => {
    const newTab = getInitialTab();
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [universeFromUrl, category]);

  // Filtres pour l'onglet "Toutes" - sans filtrage par catégorie
  const getAllFilters = () => {
    const filters: any = {};
    if (type === "budget") filters.maxPrice = 50;
    if (type === "health") filters.hasAccessibility = true;
    if (selectedVacationPeriod) filters.vacationPeriod = selectedVacationPeriod;
    return filters;
  };

  const { data: allActivities = [], isLoading, error } = useActivities(getAllFilters());
  const { data: mockActivities = [], isLoading: loadingMocks, error: mockError } = useMockActivities(10);

  console.log("📊 Activities page state:", { 
    activitiesCount: allActivities.length, 
    mockActivitiesCount: mockActivities.length,
    loadingMocks,
    mockError,
    activeTab,
    universeFromUrl
  });

  const getTitle = () => {
    if (activeTab !== "all") return `Activités ${activeTab}`;
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
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
              activities={allActivities}
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
