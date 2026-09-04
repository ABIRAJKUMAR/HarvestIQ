import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase Environment Configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'Procurement Officer' | 'Farm Producer / Grower' | 'Packhouse Manager' | 'Quality Auditor';
  avatarInitial: string;
  createdAt: string;
}

const LOCAL_STORAGE_USER_KEY = 'harvestiq_auth_user';

export const localAuthService = {
  getStoredUser(): UserProfile | null {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setStoredUser(user: UserProfile | null) {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
  },

  // Simulated authentication when Supabase keys are pending
  async mockSignIn(email: string, _password: string): Promise<UserProfile> {
    const namePart = email.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const user: UserProfile = {
      id: `usr_${Date.now()}`,
      email,
      fullName: formattedName || 'Enterprise Operator',
      role: 'Procurement Officer',
      avatarInitial: (formattedName.charAt(0) || 'A').toUpperCase(),
      createdAt: new Date().toISOString()
    };
    this.setStoredUser(user);
    return user;
  },

  async mockSignUp(email: string, _password: string, fullName: string, role: UserProfile['role']): Promise<UserProfile> {
    const user: UserProfile = {
      id: `usr_${Date.now()}`,
      email,
      fullName: fullName || email.split('@')[0],
      role: role || 'Procurement Officer',
      avatarInitial: (fullName ? fullName.charAt(0) : email.charAt(0)).toUpperCase(),
      createdAt: new Date().toISOString()
    };
    this.setStoredUser(user);
    return user;
  },

  async signOut() {
    this.setStoredUser(null);
  }
};
