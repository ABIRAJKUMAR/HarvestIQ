import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, localAuthService } from '../services/supabase';
import type { UserProfile } from '../services/supabase';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isConfiguredWithSupabase: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: UserProfile['role']) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Pre-seed default user if none to show the "My Account" avatar right away or load from storage
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localAuthService.getStoredUser();
    if (saved) return saved;
    // Default initial demonstration user (can sign out anytime)
    return {
      id: 'usr_default_01',
      email: 'operator@harvestiq.io',
      fullName: 'Agronomy Operator',
      role: 'Procurement Officer',
      avatarInitial: 'A',
      createdAt: new Date().toISOString()
    };
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const u: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            role: session.user.user_metadata?.role || 'Procurement Officer',
            avatarInitial: (session.user.user_metadata?.full_name?.[0] || session.user.email?.[0] || 'U').toUpperCase(),
            createdAt: session.user.created_at
          };
          setUser(u);
          localAuthService.setStoredUser(u);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const u: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            role: session.user.user_metadata?.role || 'Procurement Officer',
            avatarInitial: (session.user.user_metadata?.full_name?.[0] || session.user.email?.[0] || 'U').toUpperCase(),
            createdAt: session.user.created_at
          };
          setUser(u);
          localAuthService.setStoredUser(u);
        } else {
          setUser(null);
          localAuthService.setStoredUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const signIn = async (email: string, password: string) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      if (data.user) {
        const u: UserProfile = {
          id: data.user.id,
          email: data.user.email || '',
          fullName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          role: data.user.user_metadata?.role || 'Procurement Officer',
          avatarInitial: (data.user.user_metadata?.full_name?.[0] || data.user.email?.[0] || 'U').toUpperCase(),
          createdAt: data.user.created_at
        };
        setUser(u);
        localAuthService.setStoredUser(u);
      }
    } else {
      // Local fallback auth
      const u = await localAuthService.mockSignIn(email, password);
      setUser(u);
    }
    closeAuthModal();
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserProfile['role']) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      });
      if (error) throw error;
      if (data.user) {
        const u: UserProfile = {
          id: data.user.id,
          email: data.user.email || '',
          fullName: fullName,
          role: role,
          avatarInitial: (fullName?.[0] || email?.[0] || 'U').toUpperCase(),
          createdAt: data.user.created_at
        };
        setUser(u);
        localAuthService.setStoredUser(u);
      }
    } else {
      // Local fallback auth
      const u = await localAuthService.mockSignUp(email, password, fullName, role);
      setUser(u);
    }
    closeAuthModal();
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    await localAuthService.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isConfiguredWithSupabase: isSupabaseConfigured,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signIn,
        signUp,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
