import React from 'react';
import { BottomNavigation } from '@/components/BottomNavigation';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';

interface PageLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  className?: string;
}

const PageLayout = ({ 
  children, 
  showHeader = true, 
  className = '' 
}: PageLayoutProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
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
    <div className={`min-h-screen bg-background pb-20 px-4 sm:px-6 ${className}`}>
      {showHeader && <Header />}
      {children}
      <BottomNavigation />
    </div>
  );
};

export default PageLayout;