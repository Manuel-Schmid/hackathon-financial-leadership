import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from '@/auth/useAuth';
import { EXPLORER_FILTERS_KEY, restoreFilters } from '@/lib/filters';
import { readSession } from '@/lib/storage';
import { supabase } from '@/lib/supabaseClient';
import { LocalProfileStore } from './LocalProfileStore';
import { TEMPLATES, type ProfileInput, type ProfileStore, type SavedProfile } from './ProfileStore';
import { SupabaseProfileStore } from './SupabaseProfileStore';

interface ProfileState {
  own: SavedProfile[];
  /** Eigene Profile und Vorlagen zusammen. */
  all: SavedProfile[];
  error: string | null;
  isGuest: boolean;
  /** Im Filter gewähltes Profil; bleibt beim Wechsel auf eine Detailseite erhalten. null = ausgewogen. */
  selected: SavedProfile | null;
  select(id: string | null): void;
  /** Profil zu einer id; unbekannt oder gelöscht: «ausgewogen». */
  resolve(id: string | null | undefined): SavedProfile;
  create(input: ProfileInput): Promise<SavedProfile>;
  update(id: string, input: ProfileInput): Promise<void>;
  remove(id: string): Promise<void>;
}

const Ctx = createContext<ProfileState | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const store = useMemo<ProfileStore>(
    () => (supabase && user ? new SupabaseProfileStore(supabase, user.id) : new LocalProfileStore()),
    [user],
  );
  const [own, setOwn] = useState<SavedProfile[]>([]);
  // Wie im Explorer-Filter: Auch die Detailseite zeigt nach dem Neuladen denselben Score.
  const [selectedId, setSelectedId] = useState<string | null>(
    () => restoreFilters(readSession<unknown>(EXPLORER_FILTERS_KEY, null)).investorProfile,
  );
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(
    () =>
      store
        .list()
        .then((next) => {
          setOwn(next);
          setError(null);
        })
        .catch((err: Error) => setError(err.message ?? 'Anlegerprofile konnten nicht geladen werden')),
    [store],
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  const value = useMemo<ProfileState>(() => {
    const all = [...own, ...TEMPLATES];
    return {
      own,
      all,
      error,
      isGuest: !user,
      selected: all.find((p) => p.id === selectedId) ?? null,
      select: setSelectedId,
      resolve: (id) => all.find((p) => p.id === id) ?? TEMPLATES[0],
      create: async (input) => {
        const created = await store.create(input);
        await reload();
        return created;
      },
      update: async (id, input) => {
        await store.update(id, input);
        await reload();
      },
      remove: async (id) => {
        await store.remove(id);
        await reload();
      },
    };
  }, [own, error, user, selectedId, store, reload]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProfiles(): ProfileState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProfiles ausserhalb von ProfileProvider');
  return ctx;
}
