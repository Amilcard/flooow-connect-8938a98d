/**
 * LOT 4 - Homepage Complete Optimized
 * Refactored with new components: HomeHeader, HomeHeroCarousel, QuickAccessCards, RecommendedActivitiesSection
 * CRITICAL: padding 16px consistency, gap 12px carousels, cards 220px width
 */

import { useState, useEffect } from "react";
import { HomeHeader } from "@/components/Home/HomeHeader";
import { HomeHeroCarousel } from "@/components/Home/HomeHeroCarousel";
import { QuickAccessCards } from "@/components/Home/QuickAccessCards";
import { RecommendedActivitiesSection } from "@/components/Home/RecommendedActivitiesSection";
import { useActivities } from "@/hooks/useActivities";
import { useTerritoryAccess } from "@/hooks/useTerritoryAccess";
import { useUserTerritory } from "@/hooks/useUserTerritory";
import { ErrorState } from "@/components/ErrorState";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TerritoryCheck } from "@/components/TerritoryCheck";
import { BottomNavigation } from "@/components/BottomNavigation";
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
      <div className="min-h-screen bg-white">
        <HomeHeader />
        <main className="container px-4 py-6">
          <ErrorState
            message="Impossible de charger les activités. Veuillez réessayer."
            onRetry={() => window.location.reload()}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* LOT 4: Sticky Header (logo + search + login) */}
      <HomeHeader />

      {/* LOT 4: Hero Carousel (180-200px height) */}
      <HomeHeroCarousel />

      {/* Main Content Container - max-width 1200px */}
      <main className="max-w-[1200px] mx-auto">
        {/* Territory Check for logged-in users */}
        {isLoggedIn && userProfile?.postal_code && territoryAccess && !territoryAccess.hasAccess && (
          <div className="px-4 md:px-6">
            <TerritoryCheck postalCode={userProfile.postal_code} />
          </div>
        )}

        {/* Show activities only if user has access or not logged in */}
        {(!isLoggedIn || !userProfile?.postal_code || territoryAccess?.hasAccess) && (
          <>
            {/* LOT 4: Quick Access Cards (4 cards with gradient fallbacks) - CRITICAL: padding handled by component */}
            <QuickAccessCards />

            {/* LOT 4: Recommended Activities Section - CRITICAL: gap 12px, cards 220px */}
            <RecommendedActivitiesSection />
          </>
        )}
      </main>

      {/* Bottom margin for navigation */}
      <div className="h-20" />

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Help Floating Button */}
      <HelpFloatingButton />
    </div>
  );
};

export default Index;
