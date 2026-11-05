export interface Watchlist {
  id: string;
  name: string;
  clientName: string | null;
  /** id eines Anlegerprofils: Vorlage (config/kpis.json) oder eigenes Profil. */
  investorProfile: string;
  tickers: string[];
}

export interface NewWatchlist {
  name: string;
  clientName?: string | null;
  investorProfile?: string;
}

export type WatchlistPatch = Partial<Pick<Watchlist, 'name' | 'clientName' | 'investorProfile'>>;

/** Einziger Weg zu den Watchlists. Implementierungen: Supabase (Konto) und Local (Gastmodus). */
export interface WatchlistStore {
  list(): Promise<Watchlist[]>;
  create(input: NewWatchlist): Promise<Watchlist>;
  update(id: string, patch: WatchlistPatch): Promise<void>;
  remove(id: string): Promise<void>;
  addItem(id: string, ticker: string): Promise<void>;
  removeItem(id: string, ticker: string): Promise<void>;
}
