import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from '@/auth/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { LocalWatchlistStore } from './LocalWatchlistStore';
import { SupabaseWatchlistStore } from './SupabaseWatchlistStore';
import type { NewWatchlist, Watchlist, WatchlistPatch, WatchlistStore } from './WatchlistStore';

interface WatchlistState {
  lists: Watchlist[];
  /** Alle Firmen, die in mindestens einer Watchlist sind. */
  allTickers: Set<string>;
  /** Firmen, die im Würfel mit Namen hervorgehoben sind. */
  shownTickers: Set<string>;
  /** «Nur diese»: gesetzt, wenn alle anderen Punkte grau sein sollen. */
  spotlight: Set<string> | null;
  focusId: string | null;
  isShown(id: string): boolean;
  setShown(id: string, shown: boolean): void;
  setFocus(id: string | null): void;
  /** Alle Watchlists wieder normal zeigen. */
  resetShown(): void;
  error: string | null;
  isGuest: boolean;
  addItem(id: string, ticker: string): void;
  removeItem(id: string, ticker: string): void;
  create(input: NewWatchlist): Promise<Watchlist>;
  update(id: string, patch: WatchlistPatch): void;
  remove(id: string): void;
}

const Ctx = createContext<WatchlistState | null>(null);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const store = useMemo<WatchlistStore>(
    () => (supabase && user ? new SupabaseWatchlistStore(supabase, user.id) : new LocalWatchlistStore()),
    [user],
  );
  const [lists, setLists] = useState<Watchlist[]>([]);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [focus, setFocusId] = useState<string | null>(null);
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
    // Gelöschte Watchlist: «Nur diese» endet von selbst.
    const focused = lists.find((l) => l.id === focus) ?? null;
    const spotlight = focused ? new Set(focused.tickers) : null;
    return {
      lists,
      allTickers: new Set(lists.flatMap((l) => l.tickers)),
      shownTickers: spotlight ?? new Set(lists.filter((l) => !hidden.has(l.id)).flatMap((l) => l.tickers)),
      spotlight,
      focusId: focused?.id ?? null,
      isShown: (id) => !hidden.has(id),
      setShown: (id, shown) => {
        if (!shown && id === focus) setFocusId(null);
        setHidden((current) => {
          const next = new Set(current);
          if (shown) next.delete(id);
          else next.add(id);
          return next;
        });
      },
      setFocus: (id) => {
        setFocusId(id);
        if (id) {
          setHidden((current) => {
            const next = new Set(current);
            next.delete(id);
            return next;
          });
        }
      },
      resetShown: () => {
        setFocusId(null);
        setHidden(new Set());
      },
      error,
      isGuest: !user,
      addItem: (id, ticker) => run(() => store.addItem(id, ticker)),
      removeItem: (id, ticker) => run(() => store.removeItem(id, ticker)),
      create: async (input) => {
        const created = await store.create(input);
        setLists(await store.list());
        return created;
      },
      update: (id, patch) => run(() => store.update(id, patch)),
      remove: (id) => run(() => store.remove(id)),
    };
  }, [lists, hidden, focus, error, user, run, store]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWatchlists(): WatchlistState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useWatchlists ausserhalb von WatchlistProvider');
  return ctx;
}
