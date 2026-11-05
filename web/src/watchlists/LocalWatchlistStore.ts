import { readJson, writeJson } from '@/lib/storage';
import type { NewWatchlist, Watchlist, WatchlistPatch, WatchlistStore } from './WatchlistStore';

const KEY = 'kubus.guestWatchlists';

export interface JsonStorage {
  read(fallback: Watchlist[]): Watchlist[];
  write(value: Watchlist[]): void;
}

const browserStorage: JsonStorage = {
  read: (fallback) => readJson(KEY, fallback),
  write: (value) => writeJson(KEY, value),
};

const initial = (): Watchlist[] => [
  { id: 'local-1', name: 'Meine Favoriten', clientName: null, investorProfile: 'ausgewogen', isActive: true, tickers: [] },
];

/** Gastmodus und Offline-Modus: Watchlists liegen nur in diesem Browser. */
export class LocalWatchlistStore implements WatchlistStore {
  constructor(private storage: JsonStorage = browserStorage) {}

  private change(fn: (lists: Watchlist[]) => Watchlist[]): void {
    this.storage.write(fn(this.storage.read(initial())));
  }

  private patch(id: string, fn: (list: Watchlist) => Watchlist): void {
    this.change((lists) => lists.map((l) => (l.id === id ? fn(l) : l)));
  }

  async list(): Promise<Watchlist[]> {
    return this.storage.read(initial());
  }

  async create(input: NewWatchlist): Promise<void> {
    this.change((lists) => [
      ...lists,
      {
        id: `local-${Date.now()}-${lists.length}`,
        name: input.name,
        clientName: input.clientName ?? null,
        investorProfile: input.investorProfile ?? 'ausgewogen',
        isActive: lists.length === 0,
        tickers: [],
      },
    ]);
  }

  async update(id: string, patch: WatchlistPatch): Promise<void> {
    this.patch(id, (l) => ({ ...l, ...patch }));
  }

  async remove(id: string): Promise<void> {
    this.change((lists) => {
      const rest = lists.filter((l) => l.id !== id);
      // Die aktive gelöscht: die erste übrige wird aktiv, damit der Stern weiter funktioniert.
      if (rest.length && !rest.some((l) => l.isActive)) rest[0] = { ...rest[0], isActive: true };
      return rest;
    });
  }

  async addItem(id: string, ticker: string): Promise<void> {
    this.patch(id, (l) => (l.tickers.includes(ticker) ? l : { ...l, tickers: [...l.tickers, ticker] }));
  }

  async removeItem(id: string, ticker: string): Promise<void> {
    this.patch(id, (l) => ({ ...l, tickers: l.tickers.filter((t) => t !== ticker) }));
  }

  async setActive(id: string): Promise<void> {
    this.change((lists) => lists.map((l) => ({ ...l, isActive: l.id === id })));
  }
}
