/**
 * Auth Provider avec support OAuth
 * Les utilisateurs OAuth sont automatiquement mappés comme profils parent
 */
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  provider?: string; // OAuth provider si applicable
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
  

  /**
   * Extrait les infos utilisateur depuis la session Supabase
   * Gère à la fois les connexions email et OAuth
   */
  const extractUserFromSession = (sessionUser: any): AuthUser => {
    const metadata = sessionUser.user_metadata || {};

    // OAuth providers utilisent des champs différents pour le nom
    const firstName = metadata.firstName || metadata.first_name || metadata.given_name || metadata.name?.split(' ')[0] || '';
    const lastName = metadata.lastName || metadata.last_name || metadata.family_name || metadata.name?.split(' ').slice(1).join(' ') || '';

    // Déterminer le provider (OAuth ou email)
    const provider = sessionUser.app_metadata?.provider || 'email';

    // Avatar : utiliser celui du provider OAuth s'il existe
    const oauthAvatar = metadata.avatar_url || metadata.picture;
    const avatar = oauthAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(
      `${firstName} ${lastName}`.trim() || sessionUser.email
    )}&background=6366f1&color=fff`;

    return {
      id: sessionUser.id,
      email: sessionUser.email || '',
      firstName,
      lastName,
      avatar,
      provider,
    };
  };

  /**
   * Assure que l'utilisateur OAuth a un profil parent créé
   */
  const ensureOAuthProfile = async (sessionUser: any) => {
    const provider = sessionUser.app_metadata?.provider;

    // Si c'est un utilisateur OAuth (pas email), vérifier/créer le profil
    if (provider && provider !== 'email') {
      try {
        // Vérifier si le profil existe déjà
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', sessionUser.id)
          .single();

        // Si le profil n'existe pas, il sera créé par le trigger Supabase
        // On met juste à jour le statut pour indiquer que c'est un compte parent OAuth
        if (existingProfile) {
          // Mettre à jour avec les infos OAuth si nécessaires
          const metadata = sessionUser.user_metadata || {};
          const firstName = metadata.first_name || metadata.given_name || metadata.name?.split(' ')[0];
          const lastName = metadata.last_name || metadata.family_name || metadata.name?.split(' ').slice(1).join(' ');

          if (firstName || lastName) {
            await supabase
              .from('profiles')
              .update({
                first_name: firstName || existingProfile.first_name,
                last_name: lastName || existingProfile.last_name,
                // account_status reste 'active' pour OAuth (pas besoin de validation email)
              })
              .eq('id', sessionUser.id);
          }
        }
      } catch (error) {
        console.error('Error ensuring OAuth profile:', error);
      }
    }
  };

  useEffect(() => {
    // Check current session
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(extractUserFromSession(session.user));
          // Assurer que le profil OAuth existe
          await ensureOAuthProfile(session.user);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(extractUserFromSession(session.user));

        // Si c'est une nouvelle connexion OAuth, assurer que le profil existe
        if (event === 'SIGNED_IN') {
          await ensureOAuthProfile(session.user);
        }
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
