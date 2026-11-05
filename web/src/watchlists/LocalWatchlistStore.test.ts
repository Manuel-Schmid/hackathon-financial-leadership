import { beforeEach, describe, expect, it } from 'vitest';
import { LocalWatchlistStore, type JsonStorage } from './LocalWatchlistStore';
import type { Watchlist } from './WatchlistStore';

function memoryStorage(): JsonStorage {
  let data: Watchlist[] | null = null;
  return {
    read: (fallback) => data ?? fallback,
    write: (value) => {
      data = value;
    },
  };
}

describe('LocalWatchlistStore', () => {
  let store: LocalWatchlistStore;
  beforeEach(() => {
    store = new LocalWatchlistStore(memoryStorage());
  });

  it('startet mit einer aktiven Watchlist', async () => {
    const lists = await store.list();
    expect(lists).toHaveLength(1);
    expect(lists[0].isActive).toBe(true);
  });

  it('fügt Firmen nur einmal hinzu und entfernt sie', async () => {
    await store.addItem('local-1', 'AAPL');
    await store.addItem('local-1', 'AAPL');
    expect((await store.list())[0].tickers).toEqual(['AAPL']);
    await store.removeItem('local-1', 'AAPL');
    expect((await store.list())[0].tickers).toEqual([]);
  });

  it('hat immer genau eine aktive Watchlist', async () => {
    await store.create({ name: 'Kunde Müller', investorProfile: 'konservativ' });
    const second = (await store.list())[1];
    expect(second.isActive).toBe(false);
    await store.setActive(second.id);
    const lists = await store.list();
    expect(lists.filter((l) => l.isActive).map((l) => l.id)).toEqual([second.id]);
  });

  it('macht beim Löschen der aktiven eine andere aktiv', async () => {
    await store.create({ name: 'Zweite' });
    await store.remove('local-1');
    const lists = await store.list();
    expect(lists).toHaveLength(1);
    expect(lists[0].isActive).toBe(true);
  });
});
