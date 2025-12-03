// Flooow v1.1 - 2025-12-03
// Flooow v1.1 - 2025-12-03
import { useState, useEffect } from "react";
import { logEvent } from "@/hooks/useEventLogger";
import { SearchBar } from "@/components/SearchBar";
import { AidesFinancieresCard } from "@/components/home/AidesFinancieresCard";
import { MobiliteCard } from "@/components/home/MobiliteCard";
import { MaVilleCard } from "@/components/home/MaVilleCard";
import { BonEspritCard } from "@/components/home/BonEspritCard";
import NonRecoursQuiz from "@/components/home/NonRecoursQuiz";
import { ActivityThematicSection } from "@/components/home/ActivityThematicSection";
import { useActivities } from "@/hooks/useActivities";
import { useTerritoryAccess } from "@/hooks/useTerritoryAccess";
import { useUserTerritory } from "@/hooks/useUserTerritory";
import { ErrorState } from "@/components/ErrorState";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TerritoryCheck } from "@/components/TerritoryCheck";
import PageLayout from "@/components/PageLayout";
import { AdvancedFiltersModal } from "@/components/Search/AdvancedFiltersModal";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import Footer from "@/components/Footer";
import HelpFloatingButton from "@/components/HelpFloatingButton";

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

  // Auto-trigger Usetiful tours for first 8 visits
  useEffect(() => {
    const triggerUsetifulTour = () => {
      // Get visit count from localStorage
      const visitCount = parseInt(localStorage.getItem('flooow_usetiful_visits') || '0', 10);

      // Only trigger for first 8 visits
      if (visitCount < 8) {
        // Increment visit count
        localStorage.setItem('flooow_usetiful_visits', String(visitCount + 1));

        // Wait for Usetiful to load, then trigger tours
        const checkUsetiful = setInterval(() => {
          if (typeof window !== 'undefined' && (window as any).usetiful) {
            clearInterval(checkUsetiful);

            // Trigger the main tour (replace 'flooow-main-tour' with your actual tour ID from Usetiful dashboard)
            try {
              (window as any).usetiful.start();
              console.log(`[Usetiful] Tour auto-triggered (visit ${visitCount + 1}/8)`);
            } catch (error) {
              console.warn('[Usetiful] Failed to auto-trigger tour:', error);
            }
          }
        }, 500); // Check every 500ms

        // Cleanup after 10 seconds
        setTimeout(() => clearInterval(checkUsetiful), 10000);
      } else {
        console.log('[Usetiful] Visit count exceeded (8), tour not triggered');
      }
    };

    // Trigger after component mount (delay to ensure page is ready)
    const timeoutId = setTimeout(triggerUsetifulTour, 2000);

    return () => clearTimeout(timeoutId);
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
  const { data: userTerritory } = useUserTerritory();

  // Charger les activités : avec territoire si connecté, sinon toutes les activités
  const { activities: nearbyActivities = [], isLoading: loadingNearby, error: errorNearby } = useActivities({
    limit: 6,
    territoryId: userTerritory?.id || undefined // undefined permet de charger toutes les activités si pas de territoire
  });

  // Petits budgets (max 400€)
  const { activities: budgetActivities = [], isLoading: loadingBudget } = useActivities({ 
    limit: 6,
    territoryId: userTerritory?.id,
    maxPrice: 400
  });

  // Sport & bien-être
  const { activities: sportActivities = [], isLoading: loadingSport } = useActivities({ 
    limit: 6,
    territoryId: userTerritory?.id,
    category: 'sport'
  });

  // Activités recommandées
  const { activities: recommendedActivities = [], isLoading: loadingRecommended, error: errorRecommended } = useActivities({ 
    limit: 6,
    territoryId: userTerritory?.id
  });



  const handleActivityClick = (id: string) => {
    navigate(`/activity/${id}`);
  };
  return (
    <PageLayout>
      <SearchBar 
        onFilterClick={() => setIsFiltersOpen(true)} 
        onSearch={handleSearch}
      />
      
      <AdvancedFiltersModal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filterState.advancedFilters}
        onFiltersChange={updateAdvancedFilters}
        resultsCount={0} // On Home we don't know count yet, or we could fetch it
        isCountLoading={false}
        onApply={handleApplyFilters}
        onClear={clearAllFilters}
      />
      
      <main className="max-w-[1200px] mx-auto px-6 pb-24">
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


            {/* ========== QUIZ ANTI NON-RECOURS ========== */}
            <section className="py-6 px-4">
              <NonRecoursQuiz />
            </section>

            {/* ========== SECTION 2: ACTIVITÉS RECOMMANDÉES ========== */}
            {errorRecommended ? (
              <section className="py-6 px-4">
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">Impossible de charger les suggestions</p>
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
              !loadingRecommended && recommendedActivities.length > 0 && (
                <section className="py-6" data-tour-id="home-reco-section">
                  <ActivityThematicSection
                    title="Activités recommandées"
                    subtitle="Une sélection d'activités adaptées au profil de votre famille."
                    activities={recommendedActivities}
                    showSeeAll
                    onActivityClick={handleActivityClick}
                    onSeeAllClick={() => navigate('/activities')}
                  />
                </section>
              )
            )}

            {/* ========== SECTION 3: PETITS BUDGETS ========== */}
            {!loadingBudget && budgetActivities.length > 0 && (
              <section className="py-6">
                <ActivityThematicSection
                  title="Petits budgets"
                  subtitle="Des idées d'activités à coût maîtrisé."
                  activities={budgetActivities}
                  badge="Budget maîtrisé"
                  onActivityClick={handleActivityClick}
                />
              </section>
            )}

            {/* ========== SECTION 4: SPORT & BIEN-ÊTRE ========== */}
            {!loadingSport && sportActivities.length > 0 && (
              <section className="py-6">
                <ActivityThematicSection
                  title="Sport & bien-être"
                  subtitle="Bouger, se défouler, se sentir bien."
                  activities={sportActivities}
                  badge="Sport"
                  onActivityClick={handleActivityClick}
                />
              </section>
            )}
          </>
        )}
      </main>
      <Footer />
      <HelpFloatingButton />
    </PageLayout>
  );
};

export default Index;
