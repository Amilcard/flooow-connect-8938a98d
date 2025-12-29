import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNavigation } from '@/components/BottomNavigation';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useTerritoryContext } from '@/contexts/TerritoryContext';
import { DemoBanner } from '@/components/demo/DemoBanner';

interface PageLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  className?: string;
}

// Routes publiques qui ne nécessitent pas de choix de territoire
const PUBLIC_ROUTES = [
  '/ma-ville',
  '/territoire-non-couvert',
  '/onboarding',
  '/splash',
  '/',
  '/auth',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/legal/privacy',
  '/legal/rgpd',
  '/legal/cookies',
  '/legal/mentions',
  '/legal/cgu',
];

const PageLayout = ({
  children,
  showHeader = true,
  className = ''
}: PageLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading: authLoading } = useAuth();
  const { needsTerritoryChoice, isLoaded: territoryLoaded, showDemoBanner } = useTerritoryContext();

  // Route guard: rediriger vers /ma-ville si pas de territoire choisi
  useEffect(() => {
    if (territoryLoaded && needsTerritoryChoice) {
      const isPublicRoute = PUBLIC_ROUTES.some(route =>
        location.pathname === route || location.pathname.startsWith('/auth/')
      );
      if (!isPublicRoute) {
        navigate('/ma-ville', { replace: true });
      }
    }
  }, [territoryLoaded, needsTerritoryChoice, location.pathname, navigate]);

  // Show loading state while checking auth or territory
  if (authLoading || !territoryLoaded) {
    return (
      <div className={`min-h-screen bg-background flex items-center justify-center ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background pb-20 ${className}`}>
      {showDemoBanner && <DemoBanner />}
      <div className="px-4 sm:px-6">
        {showHeader && <Header />}
        {children}
      </div>
      <BottomNavigation />
    </div>
  );
};

export default PageLayout;