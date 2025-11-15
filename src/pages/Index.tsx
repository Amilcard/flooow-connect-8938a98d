import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { ActivitiesShowcase } from "@/components/home/ActivitiesShowcase";
import { UniversSection } from "@/components/UniversSection";
import { StaticSections } from "@/components/home/StaticSections";
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
  
  const { data: nearbyActivities = [], isLoading: loadingNearby, error: errorNearby } = useActivities({ 
    limit: 6, 
    territoryId: userTerritory?.id
  });


  if (errorNearby) {
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
      
      <main className="container px-4 py-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-text-main">
            Bonjour !
          </h1>
          <p className="text-text-muted">
            Découvrez les activités et événements pour vos enfants
          </p>
        </div>

        {/* Territory Check for logged-in users */}
        {isLoggedIn && userProfile?.postal_code && territoryAccess && !territoryAccess.hasAccess && (
          <TerritoryCheck 
            postalCode={userProfile.postal_code}
          />
        )}

        {/* Show activities only if user has access or not logged in */}
        {(!isLoggedIn || !userProfile?.postal_code || territoryAccess?.hasAccess) && (
          <>
            {/* ========== SECTION 1: ACTIVITÉS À LA UNE ========== */}
            <section className="space-y-4">
              <ActivitiesShowcase activities={nearbyActivities} />
            </section>

            {/* ========== SECTION 2: UNIVERS ========== */}
            <section className="space-y-4">
              <UniversSection />
            </section>

            {/* ========== SECTION 3: ACTUALITÉS ET OUTILS ========== */}
            <section className="space-y-4">
              {isLoggedIn && <StaticSections />}
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
