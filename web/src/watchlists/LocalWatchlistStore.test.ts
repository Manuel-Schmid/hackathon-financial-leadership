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

  it('startet mit einer Watchlist', async () => {
    expect(await store.list()).toHaveLength(1);
  });

  it('fügt Firmen nur einmal hinzu und entfernt sie', async () => {
    await store.addItem('local-1', 'AAPL');
    await store.addItem('local-1', 'AAPL');
    expect((await store.list())[0].tickers).toEqual(['AAPL']);
    await store.removeItem('local-1', 'AAPL');
    expect((await store.list())[0].tickers).toEqual([]);
  });

  it('eine Firma kann in mehreren Watchlists sein', async () => {
    const second = await store.create({ name: 'Kunde Müller' });
    await store.addItem('local-1', 'AAPL');
    await store.addItem(second.id, 'AAPL');
    expect((await store.list()).map((l) => l.tickers)).toEqual([['AAPL'], ['AAPL']]);
  });

  it('gibt die neue Watchlist zurück und merkt sich ihr Profil, auch ein eigenes', async () => {
    const created = await store.create({ name: 'Kunde Müller', investorProfile: 'local-profil-7' });
    expect((await store.list()).find((l) => l.id === created.id)?.investorProfile).toBe('local-profil-7');
    await store.update(created.id, { investorProfile: 'konservativ' });
    expect((await store.list()).find((l) => l.id === created.id)?.investorProfile).toBe('konservativ');
  });

  it('auch die letzte Watchlist lässt sich löschen und kommt nicht von selbst zurück', async () => {
    await store.remove('local-1');
    expect(await store.list()).toEqual([]);
  });
});
