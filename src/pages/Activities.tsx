import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { BackButton } from "@/components/BackButton";
import { ActivitySection } from "@/components/Activity/ActivitySection";
import { ActivityListMobile } from "@/components/Activity/ActivityListMobile";
import { ZeroResultState } from "@/components/Activity/ZeroResultState";
import { VacationPeriodFilter } from "@/components/VacationPeriodFilter";
import { useActivities } from "@/hooks/useActivities";
import { useMockActivities } from "@/hooks/useMockActivities";
import { ErrorState } from "@/components/ErrorState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import PageLayout from "@/components/PageLayout";
import VisualModeToggle from "@/components/VisualModeToggle";

// Mapping des IDs univers vers les catégories réelles
const UNIVERSE_TO_CATEGORY: Record<string, string> = {
  'sport': 'Sport',
  'culture': 'Culture',
  'scolarite': 'Scolarité',
  'loisirs': 'Loisirs',
  'vacances': 'Vacances'
};

const Activities = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const universeFromUrl = searchParams.get("universe");
  const category = searchParams.get("category");
  const type = searchParams.get("type");
  const periodFromUrl = searchParams.get("period") || undefined;
  const visualParam = searchParams.get("visual");
  
  // Feature flag: mode visuel mobile
  const isMobile = useIsMobile();
  const mobileVisualMode = isMobile && visualParam === "true";
  
  // Paramètres de pré-filtrage par profil enfant
  const childId = searchParams.get("childId");
  const ageMin = searchParams.get("ageMin");
  const ageMax = searchParams.get("ageMax");
  const interests = searchParams.get("interests")?.split(',') || [];
  
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
  const [searchTerm, setSearchTerm] = useState<string>("");

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
    
    // Pré-filtrage par profil enfant
    if (ageMin && ageMax) {
      filters.ageMin = parseInt(ageMin);
      filters.ageMax = parseInt(ageMax);
    }
    
    return filters;
  };

  const { data: allActivities = [], isLoading, error } = useActivities(getAllFilters());
  const { data: mockActivities = [], isLoading: loadingMocks, error: mockError } = useMockActivities(10);
  
  // Fonction pour retirer le filtre enfant
  const clearChildFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('childId');
    newParams.delete('ageMin');
    newParams.delete('ageMax');
    newParams.delete('interests');
    setSearchParams(newParams);
  };

  // Fonction pour réinitialiser tous les filtres
  const handleReset = () => {
    setSearchTerm("");
    setSelectedVacationPeriod(undefined);
    clearChildFilter();
    setActiveTab("all");
  };

  // Fonction pour capturer la recherche
  const handleSearch = (query: string) => {
    setSearchTerm(query);
  };

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
        <SearchBar
          onFilterClick={() => console.log("Filter clicked")}
          onSearch={handleSearch}
        />
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
      <div className="sticky top-0 z-10 bg-background">
        <div className="container px-4 pt-2">
          <BackButton positioning="relative" size="sm" showSplash={true} fallback="/home" />
        </div>
        <SearchBar
          onFilterClick={() => console.log("Filter clicked")}
          onSearch={handleSearch}
        />
      </div>
      
      <main className="container px-4 py-6">
        {/* Afficher le bandeau de filtre enfant si présent */}
        {childId && ageMin && (
          <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Activités adaptées pour votre enfant
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Âge: {ageMin} ans
                  {interests.length > 0 && ` • Centres d'intérêt: ${interests.join(', ')}`}
                </p>
              </div>
              <button
                onClick={clearChildFilter}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-background/50 rounded-md transition-colors"
              >
                <X size={14} />
                Retirer le filtre
              </button>
            </div>
          </div>
        )}
        
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
            {mobileVisualMode ? (
              <ActivityListMobile activities={allActivities} isLoading={isLoading} />
            ) : allActivities.length === 0 && !isLoading ? (
              <ZeroResultState
                searchTerm={searchTerm}
                suggestions={[]}
                onReset={handleReset}
                hasGeoFilter={false}
              />
            ) : (
              <ActivitySection
                title={getTitle()}
                activities={allActivities}
                onActivityClick={(id) => console.log("Activity clicked:", id)}
              />
            )}
          </TabsContent>

          {["Sport", "Culture", "Loisirs", "Vacances", "Scolarité"].map((cat) => (
            <TabsContent key={cat} value={cat}>
              <CategoryActivities
                category={cat}
                searchTerm={searchTerm}
                onReset={handleReset}
              />
            </TabsContent>
          ))}
        </Tabs>
      </main>
      <VisualModeToggle />
    </PageLayout>
  );
};

const CategoryActivities = ({
  category,
  searchTerm,
  onReset
}: {
  category: string;
  searchTerm?: string;
  onReset: () => void;
}) => {
  const [searchParams] = useSearchParams();
  const visualParam = searchParams.get("visual");
  const isMobile = useIsMobile();
  const mobileVisualMode = isMobile && visualParam === "true";

  const { data: activities = [], isLoading } = useActivities({ category });

  // Gestion de l'état zéro résultat
  if (!mobileVisualMode && activities.length === 0 && !isLoading) {
    return (
      <ZeroResultState
        searchTerm={searchTerm}
        suggestions={[]}
        onReset={onReset}
        hasGeoFilter={false}
      />
    );
  }

  return mobileVisualMode ? (
    <ActivityListMobile activities={activities} isLoading={isLoading} />
  ) : (
    <ActivitySection
      title={`Activités ${category}`}
      activities={activities}
      onActivityClick={(id) => console.log("Activity clicked:", id)}
    />
  );
};

export default Activities;
