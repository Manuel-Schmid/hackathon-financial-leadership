import { createContext, useContext } from 'react';
import type { InvestorProfile } from '@/data/types';

export interface AuthUser {
  id: string;
  email: string;
}

export interface UserProfile {
  displayName: string;
  investorProfile: InvestorProfile;
}

export interface AuthState {
  /** false: keine Supabase-Werte, die App läuft nur im Gastmodus. */
  available: boolean;
  user: AuthUser | null;
  profile: UserProfile;
  loading: boolean;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string, displayName: string): Promise<void>;
  signOut(): Promise<void>;
  updateProfile(patch: Partial<UserProfile>): Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth ausserhalb von AuthProvider');
  return ctx;
}
