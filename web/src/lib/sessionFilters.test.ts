import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_FILTERS, restoreFilters, restoreSort } from './filters';
import { readSession, writeSession } from './storage';

/** Kleiner Ersatz für sessionStorage, weil Vitest ohne Browser läuft. */
function fakeStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() { return data.size; },
    clear: () => data.clear(),
    getItem: (k) => data.get(k) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (k) => { data.delete(k); },
    setItem: (k, v) => { data.set(k, String(v)); },
  };
}

const g = globalThis as { sessionStorage?: Storage };
afterEach(() => { delete g.sessionStorage; });

describe('readSession / writeSession', () => {
  it('speichert und liest JSON im sessionStorage', () => {
    g.sessionStorage = fakeStorage();
    writeSession('k', { a: 1 });
    expect(readSession('k', null)).toEqual({ a: 1 });
  });

  it('ohne oder mit blockiertem sessionStorage: Rückfallwert, kein Fehler', () => {
    expect(readSession('k', 'fallback')).toBe('fallback');
    expect(() => writeSession('k', 1)).not.toThrow();
    g.sessionStorage = { ...fakeStorage(), getItem: () => { throw new Error('blockiert'); } };
    expect(readSession('k', 'fallback')).toBe('fallback');
  });
});

describe('restoreFilters', () => {
  it('nichts gespeichert -> Standard', () => {
    expect(restoreFilters(null)).toEqual(DEFAULT_FILTERS);
  });

  it('gültiger Filter bleibt erhalten', () => {
    const f = { universes: ['SWISS'], sector: 'Utilities', capMin: 2e9, capMax: null, search: 'nes', includeFinancials: true, investorProfile: 'konservativ' };
    expect(restoreFilters(f)).toEqual(f);
  });

  it('das Anlegerprofil bleibt erhalten, ältere Werte ohne Profil gelten als ausgewogen', () => {
    expect(restoreFilters({ investorProfile: 'eigenes-profil-7' }).investorProfile).toBe('eigenes-profil-7');
    expect(restoreFilters({ search: 'ap' }).investorProfile).toBeNull();
    expect(restoreFilters({ investorProfile: 7 }).investorProfile).toBeNull();
  });

  it('fehlende oder unbrauchbare Felder fallen auf den Standard zurück (z. B. alte App-Version)', () => {
    const r = restoreFilters({ universes: ['SP500', 'XYZ'], sector: 7, capMin: 'viel', search: 'ap' });
    expect(r).toEqual({ ...DEFAULT_FILTERS, universes: ['SP500'], search: 'ap' });
    expect(restoreFilters('kaputt')).toEqual(DEFAULT_FILTERS);
  });
});

describe('restoreSort', () => {
  it('nur bekannte Sortierungen, sonst Gesamt-Score', () => {
    expect(restoreSort('name')).toBe('name');
    expect(restoreSort('quatsch')).toBe('total');
    expect(restoreSort(null)).toBe('total');
  });
});
