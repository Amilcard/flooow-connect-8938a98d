// Flooow v1.2 - 2025-12-18 - CLS optimization
import { useState, useEffect, lazy, Suspense } from "react";
import { logEvent } from "@/hooks/useEventLogger";
import { SearchBar } from "@/components/SearchBar";
import { AidesFinancieresCard } from "@/components/home/AidesFinancieresCard";
import { MobiliteCard } from "@/components/home/MobiliteCard";
import { MaVilleCard } from "@/components/home/MaVilleCard";
import { BonEspritCard } from "@/components/home/BonEspritCard";
import { ActivityThematicSection } from "@/components/home/ActivityThematicSection";
import { useActivities } from "@/hooks/useActivities";
import { useTerritoryAccess } from "@/hooks/useTerritoryAccess";
import { useTerritory } from "@/hooks/useTerritory";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TerritoryCheck } from "@/components/TerritoryCheck";
import PageLayout from "@/components/PageLayout";
import Footer from "@/components/Footer";
import HelpFloatingButton from "@/components/HelpFloatingButton";
import { useSearchFilters } from "@/hooks/useSearchFilters";

// Lazy load AdvancedFiltersModal - only needed on filter button click (saves ~19KB)
const AdvancedFiltersModal = lazy(() => import("@/components/Search/AdvancedFiltersModal").then(m => ({ default: m.AdvancedFiltersModal })));

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const { 
    filterState, 
    updateAdvancedFilters, 
    clearAllFilters 
  } = useSearchFilters();

  const handleSearch = (query: string) => {
    logEvent({ eventType: "search", metadata: { query } });
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleApplyFilters = () => {
    setIsFiltersOpen(false);
    // Construct URL from filters and navigate
    const params = new URLSearchParams();
    // ... (logic handled by useSearchFilters sync, but here we might need to force navigation if not already on search page)
    // Actually useSearchFilters syncs to URL, but if we are on Index, we want to go to Search.
    // But useSearchFilters uses useSearchParams which works on current URL.
    // If we are on Index, updating filters via hook will update Index URL parameters?
    // Yes, useSearchParams works on current URL.
    // So if we update filters, the URL of Index will change.
    // We want to navigate to /search with these parameters.
    
    // Better approach:
    // 1. Let the modal update the local state in useSearchFilters.
    // 2. On Apply, get the current filter state and navigate to /search with those params.
    
    // However, useSearchFilters automatically syncs to URL.
    // If we use it in Index, it will add params to Index URL.
    // Maybe we should pass a custom "onApply" that navigates.
    
    navigate({
      pathname: '/search',
      search: window.location.search // Since useSearchFilters already updated the URL params
    });
  };

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) setIsLoggedIn(!!session);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) setIsLoggedIn(!!session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile to check postal code
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile-index"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: isLoggedIn
  });

  // Fetch user role to control home redirect behavior
  const { data: userRole } = useQuery({
    queryKey: ["user-role-index"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 'family' as const;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return (data?.role as 'structure' | 'territory_admin' | 'partner' | 'superadmin' | 'family') ?? 'family';
    },
    enabled: isLoggedIn,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  // Fetch user's children for aid simulation
  const { data: children = [] } = useQuery({
    queryKey: ["user-children-index"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
    enabled: isLoggedIn
  });

  // Redirect logged-in non-family users away from home
  useEffect(() => {
    if (isLoggedIn && userRole && userRole !== 'family') {
      navigate("/dashboards", { replace: true });
    }
  }, [isLoggedIn, userRole, navigate]);

  // Check territory access
  const { data: territoryAccess } = useTerritoryAccess(userProfile?.postal_code || null);
  
  // Récupérer le territoire de l'utilisateur pour filtrer les activités
  const { territoryId } = useTerritory();

  // Charger un vivier large d'activités pour le split intelligent
  const { activities: allHomeActivities = [], isLoading: loadingActivities, error: errorActivities } = useActivities({
    limit: 30,
    territoryId: territoryId || undefined
  });

  // Split intelligent: 6 pour "À proximité" + 6 pour "Petits budgets" avec diversité
  const { proximityActivities, budgetActivities } = (() => {
    if (allHomeActivities.length === 0) {
      return { proximityActivities: [], budgetActivities: [] };
    }

    // Helper: extraire la catégorie principale
    const getMainCategory = (a: typeof allHomeActivities[0]) =>
      Array.isArray(a.categories) && a.categories.length > 0 ? a.categories[0] : 'other';

    // Helper: extraire la tranche d'âge
    const getAgeGroup = (a: typeof allHomeActivities[0]) => {
      const min = a.age_min ?? 0;
      if (min <= 5) return '0-5';
      if (min <= 10) return '6-10';
      if (min <= 14) return '11-14';
      return '15+';
    };

    // Helper: sélection diversifiée (greedy)
    const selectDiverse = (
      candidates: typeof allHomeActivities,
      count: number,
      excludeIds: Set<string>
    ) => {
      const selected: typeof allHomeActivities = [];
      const usedCategories = new Map<string, number>();
      const usedAgeGroups = new Map<string, number>();
      const usedPeriods = new Map<string, number>();

      // Filtrer les exclus
      const pool = candidates.filter(a => !excludeIds.has(a.id));

      // Greedy: prioriser la diversité
      for (const activity of pool) {
        if (selected.length >= count) break;

        const cat = getMainCategory(activity);
        const age = getAgeGroup(activity);
        const period = activity.period_type || 'unknown';

        // Limiter à 2 max par catégorie, 2 par tranche d'âge, 3 par période
        const catCount = usedCategories.get(cat) || 0;
        const ageCount = usedAgeGroups.get(age) || 0;
        const periodCount = usedPeriods.get(period) || 0;

        if (catCount < 2 && ageCount < 2 && periodCount < 3) {
          selected.push(activity);
          usedCategories.set(cat, catCount + 1);
          usedAgeGroups.set(age, ageCount + 1);
          usedPeriods.set(period, periodCount + 1);
        }
      }

      // Fallback: si pas assez, remplir sans contrainte
      if (selected.length < count) {
        for (const activity of pool) {
          if (selected.length >= count) break;
          if (!selected.find(s => s.id === activity.id)) {
            selected.push(activity);
          }
        }
      }

      return selected;
    };

    // Carrousel 1: "À proximité" - diversité maximale
    const proximity = selectDiverse(allHomeActivities, 6, new Set());
    const proximityIds = new Set(proximity.map(a => a.id));

    // Carrousel 2: "Petits budgets" - trier par prix, puis diversifier
    const sortedByPrice = [...allHomeActivities].sort((a, b) => {
      const priceA = a.price ?? 9999;
      const priceB = b.price ?? 9999;
      return priceA - priceB;
    });
    const budget = selectDiverse(sortedByPrice, 6, proximityIds);

    return { proximityActivities: proximity, budgetActivities: budget };
  })();



  const handleActivityClick = (id: string) => {
    navigate(`/activity/${id}`);
  };
  return (
    <PageLayout>
      <SearchBar 
        onFilterClick={() => setIsFiltersOpen(true)} 
        onSearch={handleSearch}
      />
      
      {isFiltersOpen && (
        <Suspense fallback={null}>
          <AdvancedFiltersModal
            isOpen={isFiltersOpen}
            onClose={() => setIsFiltersOpen(false)}
            filters={filterState.advancedFilters}
            onFiltersChange={updateAdvancedFilters}
            resultsCount={0}
            isCountLoading={false}
            onApply={handleApplyFilters}
            onClear={clearAllFilters}
          />
        </Suspense>
      )}

      <main className="max-w-5xl mx-auto px-4">
        {/* Territory Check for logged-in users */}
        {isLoggedIn && userProfile?.postal_code && territoryAccess && !territoryAccess.hasAccess && (
          <TerritoryCheck 
            postalCode={userProfile.postal_code}
          />
        )}

        {/* Show activities only if user has access or not logged in */}
        {(!isLoggedIn || !userProfile?.postal_code || territoryAccess?.hasAccess) && (
          <>
            {/* ========== SECTION 1: CARTES PORTRAIT (4 OUTILS) ========== */}
            <section className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div data-tour-id="home-aids-card">
                  <AidesFinancieresCard 
                    userProfile={userProfile}
                    children={children}
                  />
                </div>
                <div data-tour-id="home-mobility-card">
                  <MobiliteCard />
                </div>
                <div data-tour-id="home-ville-card">
                  <MaVilleCard />
                </div>
                <div data-tour-id="home-prix-card">
                  <BonEspritCard />
                </div>
              </div>
            </section>



            {/* ========== SECTION 2: ACTIVITÉS À PROXIMITÉ ========== */}
            {errorActivities ? (
              <section className="py-6 px-4">
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">Impossible de charger les activités</p>
                    <p className="text-xs text-red-600 mt-0.5">Vérifiez votre connexion ou réessayez plus tard.</p>
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-xs font-semibold text-red-700 hover:text-red-800 px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                  >
                    Réessayer
                  </button>
                </div>
              </section>
            ) : (
              <section className="py-6" data-tour-id="home-reco-section">
                <ActivityThematicSection
                  title="Activités à proximité"
                  subtitle="Une sélection d'activités adaptées au profil de votre famille."
                  activities={proximityActivities}
                  showSeeAll
                  onActivityClick={handleActivityClick}
                  onSeeAllClick={() => navigate('/activities')}
                  isFirstSection
                  isLoading={loadingActivities}
                />
              </section>
            )}

            {/* ========== SECTION 3: ACTIVITÉS PETITS BUDGETS ========== */}
            <section className="py-6">
              <ActivityThematicSection
                title="Activités petits budgets"
                subtitle="Des idées d'activités à coût maîtrisé."
                activities={budgetActivities}
                badge="Budget maîtrisé"
                onActivityClick={handleActivityClick}
                isLoading={loadingActivities}
              />
            </section>
          </>
        )}
      </main>
      <Footer />
      <HelpFloatingButton />
    </PageLayout>
  );
};

export default Index;
