import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { ActivitySection } from "@/components/Activity/ActivitySection";
import { UniversSection } from "@/components/UniversSection";
import { AidesMobiliteBlock } from "@/components/home/AidesMobiliteBlock";
import { TerritoireBlock } from "@/components/home/TerritoireBlock";
import { EventsSection } from "@/components/home/EventsSection";
import { useActivities } from "@/hooks/useActivities";
import { useMockActivities } from "@/hooks/useMockActivities";
import { useTerritoryAccess } from "@/hooks/useTerritoryAccess";
import { ErrorState } from "@/components/ErrorState";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TerritoryCheck } from "@/components/TerritoryCheck";
import PageLayout from "@/components/PageLayout";
import Footer from "@/components/Footer";
import FAQSection from "@/components/FAQSection";
import type { Activity } from "@/types/domain";

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
  
  const { data: nearbyActivities = [], isLoading: loadingNearby, error: errorNearby } = useActivities({ limit: 3 });
  const { data: budgetActivities = [], isLoading: loadingBudget } = useActivities({ maxPrice: 50, limit: 3 });
  const { data: healthActivities = [], isLoading: loadingHealth } = useActivities({ hasAccessibility: true, limit: 3 });
  const { data: mockActivities = [], isLoading: loadingMocks, error: mockError } = useMockActivities(8);

  const isLoading = loadingNearby || loadingBudget || loadingHealth || loadingMocks;


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
        {/* Territory Check for logged-in users */}
        {isLoggedIn && userProfile?.postal_code && territoryAccess && !territoryAccess.hasAccess && (
          <TerritoryCheck 
            postalCode={userProfile.postal_code}
          />
        )}

        {/* Show activities only if user has access or not logged in */}
        {(!isLoggedIn || !userProfile?.postal_code || territoryAccess?.hasAccess) && (
          <>
            {/* Section Univers - Carousel horizontal */}
            <UniversSection />

            {/* Activités à la une - GRID MODE */}
            <ActivitySection
              title="Activités à la une"
              activities={nearbyActivities}
              onSeeAll={() => navigate("/activities?type=nearby")}
              onActivityClick={(id) => console.log("Activity clicked:", id)}
            />

            {/* Mes aides & mobilités */}
            <AidesMobiliteBlock />

            <ActivitySection
              title="Activités Petits budgets"
              activities={budgetActivities}
              onSeeAll={() => navigate("/activities?type=budget")}
              onActivityClick={(id) => console.log("Activity clicked:", id)}
            />

            {/* Événements à venir */}
            <EventsSection />

            {/* Vivre mon territoire */}
            <TerritoireBlock />

            <ActivitySection
              title="Activités Innovantes"
              activities={healthActivities}
              onSeeAll={() => navigate("/activities?type=health")}
              onActivityClick={(id) => console.log("Activity clicked:", id)}
            />

            {/* Section mocks masquée si vide (edge function indisponible) */}
            {mockActivities.length > 0 && (
              <ActivitySection
                title="Activités Saint-Étienne (Mocks)"
                activities={mockActivities}
                onActivityClick={(id) => console.log("Mock activity clicked:", id)}
              />
            )}
          </>
        )}
      </main>
  <FAQSection limit={4} />
      <Footer />
    </PageLayout>
  );
};

export default Index;
