import { useState, useEffect, useMemo } from "react";
import { SearchBar } from "@/components/SearchBar";
import { InfoBlocks } from "@/components/InfoBlocks";
import { ActivitySection } from "@/components/Activity/ActivitySection";
import { useActivities } from "@/hooks/useActivities";
import { useMockActivities } from "@/hooks/useMockActivities";
import { useTerritoryAccess } from "@/hooks/useTerritoryAccess";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { ActivityCardSkeleton } from "@/components/Activity/ActivityCardSkeleton";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { TerritoryCheck } from "@/components/TerritoryCheck";
import PageLayout from "@/components/PageLayout";
import Footer from "@/components/Footer";
import FAQSection from "@/components/FAQSection";
import { AccessibilityFilters, AccessibilityFilter } from "@/components/AccessibilityFilters";
import type { Activity } from "@/types/domain";

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessibilityFilters, setAccessibilityFilters] = useState<AccessibilityFilter[]>([]);

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

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboards", { replace: true });
    }
  }, [isLoggedIn, navigate]);

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

  // Check territory access
  const { data: territoryAccess } = useTerritoryAccess(userProfile?.postal_code || null);
  
  // Charger les différentes catégories d'activités (limité à 3 par section)
  const { data: nearbyActivities = [], isLoading: loadingNearby, error: errorNearby } = useActivities({ limit: 3 });
  const { data: budgetActivities = [], isLoading: loadingBudget } = useActivities({ maxPrice: 50, limit: 3 });
  const { data: healthActivities = [], isLoading: loadingHealth } = useActivities({ hasAccessibility: true, limit: 3 });
  const { data: mockActivities = [], isLoading: loadingMocks, error: mockError } = useMockActivities(8);

  const isLoading = loadingNearby || loadingBudget || loadingHealth || loadingMocks;

  // Filtrage des activités selon les critères d'accessibilité
  const filteredMockActivities = useMemo(() => {
    if (accessibilityFilters.length === 0) return mockActivities;

    return mockActivities.filter((activity: Activity) => {
      if (!activity.accessibility) return false;

      return accessibilityFilters.every(filter => {
        switch (filter) {
          case 'motor':
            return activity.accessibility?.wheelchair || activity.accessibility?.mobility_impaired;
          case 'cognitive':
            return activity.accessibility?.hearing_impaired || activity.accessibility?.visual_impaired;
          case 'developmental':
            return activity.accessibility?.wheelchair || activity.accessibility?.mobility_impaired;
          default:
            return false;
        }
      });
    });
  }, [mockActivities, accessibilityFilters]);


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
      
      {/* Auth CTA for non-logged users */}
      {!isLoggedIn && (
        <div className="container px-4 pt-4">
          <div className="bg-gradient-to-r from-primary to-primary-light text-white p-4 rounded-lg flex items-center justify-between">
            <div className="flex-1">
              <p className="font-semibold">Accédez aux aides financières</p>
              <p className="text-sm text-white/90">Créez un compte pour calculer vos aides</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => navigate("/auth")}
            >
              Se connecter
            </Button>
          </div>
        </div>
      )}
      
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
            <InfoBlocks />

            {/* Filtres d'accessibilité discrets */}
              <div className="flex items-center gap-3 min-h-10">
                <span className="text-sm text-muted-foreground">Accessibilité :</span>
                <div className={mockActivities.length === 0 ? "opacity-50 pointer-events-none" : ""}>
                  <AccessibilityFilters 
                    selectedFilters={accessibilityFilters}
                    onFilterChange={setAccessibilityFilters}
                  />
                </div>
              </div>

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
              title="Activités Innovantes"
              activities={healthActivities}
              onSeeAll={() => navigate("/activities?type=health")}
              onActivityClick={(id) => console.log("Activity clicked:", id)}
            />

            <ActivitySection
              title="Activités Saint-Étienne (Mocks)"
              activities={filteredMockActivities}
              onActivityClick={(id) => console.log("Mock activity clicked:", id)}
            />
          </>
        )}
      </main>
  <FAQSection limit={4} />
      <Footer />
    </PageLayout>
  );
};

export default Index;
