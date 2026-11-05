import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from '@/auth/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { LocalWatchlistStore } from './LocalWatchlistStore';
import { SupabaseWatchlistStore } from './SupabaseWatchlistStore';
import type { NewWatchlist, Watchlist, WatchlistPatch, WatchlistStore } from './WatchlistStore';

interface WatchlistState {
  lists: Watchlist[];
  active: Watchlist | null;
  activeTickers: Set<string>;
  error: string | null;
  isGuest: boolean;
  toggle(ticker: string): void;
  create(input: NewWatchlist): void;
  update(id: string, patch: WatchlistPatch): void;
  remove(id: string): void;
  setActive(id: string): void;
}

const Ctx = createContext<WatchlistState | null>(null);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const store = useMemo<WatchlistStore>(
    () => (supabase && user ? new SupabaseWatchlistStore(supabase, user.id) : new LocalWatchlistStore()),
    [user],
  );
  const [lists, setLists] = useState<Watchlist[]>([]);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    (action?: () => Promise<void>) => {
      (action ? action() : Promise.resolve())
        .then(() => store.list())
        .then((next) => {
          setLists(next);
          setError(null);
        })
        .catch((err: Error) => setError(err.message ?? 'Watchlist konnte nicht gespeichert werden'));
    },
    [store],
  );

  useEffect(() => run(), [run]);

  const value = useMemo<WatchlistState>(() => {
    const active = lists.find((l) => l.isActive) ?? lists[0] ?? null;
    return {
      lists,
      active,
      activeTickers: new Set(active?.tickers),
      error,
      isGuest: !user,
      toggle(ticker) {
        if (!active) return;
        run(() => (active.tickers.includes(ticker) ? store.removeItem(active.id, ticker) : store.addItem(active.id, ticker)));
      },
      create: (input) => run(() => store.create(input)),
      update: (id, patch) => run(() => store.update(id, patch)),
      remove: (id) => run(() => store.remove(id)),
      setActive: (id) => run(() => store.setActive(id)),
    };
  }, [lists, error, user, run, store]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWatchlists(): WatchlistState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useWatchlists ausserhalb von WatchlistProvider');
  return ctx;
}
