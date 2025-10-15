import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { InfoBlocks } from "@/components/InfoBlocks";
import { ActivitySection } from "@/components/ActivitySection";
import { useActivities } from "@/hooks/useActivities";
import { useTerritoryAccess } from "@/hooks/useTerritoryAccess";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { ActivityCardSkeleton } from "@/components/ActivityCardSkeleton";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { TerritoryCheck } from "@/components/TerritoryCheck";
=======
>>>>>>> 42bf34d ( sauvegarde)

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
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

  // Check territory access
  const { data: territoryAccess } = useTerritoryAccess(userProfile?.postal_code || null);
  
  // Charger les différentes catégories d'activités (limité à 3 par section)
  const { data: nearbyActivities = [], isLoading: loadingNearby, error: errorNearby } = useActivities({ limit: 3 });
  const { data: budgetActivities = [], isLoading: loadingBudget } = useActivities({ maxPrice: 50, limit: 3 });
  const { data: healthActivities = [], isLoading: loadingHealth } = useActivities({ hasAccessibility: true, limit: 3 });

  const isLoading = loadingNearby || loadingBudget || loadingHealth;

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
              title="Activités Santé"
              activities={healthActivities}
              onSeeAll={() => navigate("/activities?type=health")}
              onActivityClick={(id) => console.log("Activity clicked:", id)}
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
