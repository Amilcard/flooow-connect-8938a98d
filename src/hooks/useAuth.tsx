import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  

  useEffect(() => {
    // Check current session
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            firstName: session.user.user_metadata?.firstName,
            lastName: session.user.user_metadata?.lastName,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
              `${session.user.user_metadata?.firstName || ''} ${session.user.user_metadata?.lastName || ''}`
            )}&background=6366f1&color=fff`
          });
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          firstName: session.user.user_metadata?.firstName,
          lastName: session.user.user_metadata?.lastName,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            `${session.user.user_metadata?.firstName || ''} ${session.user.user_metadata?.lastName || ''}`
          )}&background=6366f1&color=fff`
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          firstName: data.user.user_metadata?.firstName,
          lastName: data.user.user_metadata?.lastName,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            `${data.user.user_metadata?.firstName || ''} ${data.user.user_metadata?.lastName || ''}`
          )}&background=6366f1&color=fff`
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
          },
        },
      });
      
      if (error) throw error;
      
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            `${userData.firstName} ${userData.lastName}`
          )}&background=6366f1&color=fff`
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    // Nettoyer l'état AVANT l'appel API pour éviter boucle
    setUser(null);

    // Nettoyer TOUS les états persistés dans localStorage
    try {
      // 1. Nettoyer toutes les données de réservation d'activités
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('activity_booking_')) {
          localStorage.removeItem(key);
        }
      });
      
      // 2. Nettoyer toutes les données de profil utilisateur en cache
      Object.keys(localStorage).forEach(key => {
        if (key.includes('user') || key.includes('profile') || key.includes('child')) {
          localStorage.removeItem(key);
        }
      });

      // 3. Nettoyer les données de territoire
      localStorage.removeItem('userTerritoryId');
      localStorage.removeItem('userPostalCode');
      localStorage.removeItem('userTerritoryMode');
      // Ne pas supprimer hasSeenOnboarding pour ne pas relancer l'onboarding
      
      // 4. Nettoyer sessionStorage
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue quand même, l'état est déjà nettoyé
    }

    // Redirection vers home au lieu d'onboarding pour éviter de relancer l'onboarding
    window.location.href = '/home';
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
