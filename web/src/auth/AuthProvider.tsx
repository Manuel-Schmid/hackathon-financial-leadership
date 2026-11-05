import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { readJson, writeJson } from '@/lib/storage';
import { AuthContext, type AuthState, type AuthUser, type UserProfile } from './useAuth';

const GUEST_KEY = 'kubus.guestProfile';
const GUEST: UserProfile = { displayName: 'Gast', investorProfile: 'ausgewogen' };

function toAuthUser(user: User | null | undefined): AuthUser | null {
  return user ? { id: user.id, email: user.email ?? '' } : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile>(() => readJson(GUEST_KEY, GUEST));
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) return;
    supabase.auth
      .getSession()
      .then(({ data }) => setUser(toAuthUser(data.session?.user)))
      .catch(() => setUser(null)) // ohne Netz: Gastmodus
      .finally(() => setLoading(false));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(toAuthUser(session?.user)));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !user) {
      setProfile(readJson(GUEST_KEY, GUEST));
      return;
    }
    let active = true;
    supabase
      .from('profiles')
      .select('display_name, investor_profile')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (active && data) setProfile({ displayName: data.display_name ?? user.email, investorProfile: data.investor_profile });
      });
    return () => {
      active = false;
    };
  }, [user]);

  const updateProfile = useCallback(
    async (patch: Partial<UserProfile>) => {
      const next = { ...profile, ...patch };
      if (supabase && user) {
        const { error } = await supabase
          .from('profiles')
          .update({ display_name: next.displayName, investor_profile: next.investorProfile })
          .eq('id', user.id);
        if (error) throw error;
      } else {
        writeJson(GUEST_KEY, next);
      }
      setProfile(next);
    },
    [profile, user],
  );

  const value = useMemo<AuthState>(
    () => ({
      available: Boolean(supabase),
      user,
      profile,
      loading,
      updateProfile,
      async signIn(email, password) {
        if (!supabase) throw new Error('Login ist im Offline-Modus nicht verfügbar.');
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      async signUp(email, password, displayName) {
        if (!supabase) throw new Error('Registrieren ist im Offline-Modus nicht verfügbar.');
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName } },
        });
        if (error) throw error;
      },
      async signOut() {
        await supabase?.auth.signOut();
      },
    }),
    [user, profile, loading, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
