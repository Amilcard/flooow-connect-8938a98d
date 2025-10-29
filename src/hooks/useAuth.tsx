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

interface AuthSession {
  access_token: string;
  refresh_token: string;
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
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  

  useEffect(() => {
    // Check current session
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setSession(session);
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
        setSession(session);
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
        setSession(null);
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
      
      if (data.user && data.session) {
        setSession(data.session);
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
      
      if (data.user && data.session) {
        setSession(data.session);
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
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Toujours nettoyer l'état local et rediriger, même si signOut échoue
      setUser(null);
      setSession(null);
      window.location.assign('/auth');
    }
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
