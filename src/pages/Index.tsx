import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { AidesFinancieresCard } from "@/components/home/AidesFinancieresCard";
import { MobiliteCard } from "@/components/home/MobiliteCard";
import { MaVilleCard } from "@/components/home/MaVilleCard";
import { BonEspritCard } from "@/components/home/BonEspritCard";
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
import Footer from "@/components/Footer";
import HelpFloatingButton from "@/components/HelpFloatingButton";

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
  const { data: nearbyActivities = [], isLoading: loadingNearby, error: errorNearby } = useActivities({
    limit: 6,
    territoryId: userTerritory?.id || undefined // undefined permet de charger toutes les activités si pas de territoire
  });

  // Petits budgets (max 400€)
  const { data: budgetActivities = [], isLoading: loadingBudget } = useActivities({ 
    limit: 6,
    territoryId: userTerritory?.id,
    maxPrice: 400
  });

  // Sport & bien-être
  const { data: sportActivities = [], isLoading: loadingSport } = useActivities({ 
    limit: 6,
    territoryId: userTerritory?.id,
    category: 'sport'
  });

  // Activités recommandées
  const { data: recommendedActivities = [], isLoading: loadingRecommended, error: errorRecommended } = useActivities({ 
    limit: 6,
    territoryId: userTerritory?.id
  });

  if (errorRecommended) {
    return (
      <PageLayout>
      <SearchBar 
        placeholder="Rechercher une activité ou un événement pour votre enfant…"
        onFilterClick={() => console.log("Filter clicked")} 
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

  const handleActivityClick = (id: string) => {
    navigate(`/activity/${id}`);
  };
  return (
    <PageLayout>
      <SearchBar onFilterClick={() => console.log("Filter clicked")} />
      
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
                  <AidesFinancieresCard />
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

            {/* ========== SECTION 2: ACTIVITÉS RECOMMANDÉES ========== */}
            {!loadingRecommended && recommendedActivities.length > 0 && (
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
