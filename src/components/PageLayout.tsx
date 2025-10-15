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
  const { isAuthenticated } = useAuth();

  return (
    <div className={`min-h-screen bg-background ${isAuthenticated ? 'pb-20' : ''} ${className}`}>
      {showHeader && <Header />}
      {children}
      {isAuthenticated && <BottomNavigation />}
    </div>
  );
};

export default PageLayout;