import { describe, expect, it } from 'vitest';
import type { Company } from '@/data/types';
import { buildPoints } from './PointCloud';

function company(ticker: string): Company {
  return {
    ticker,
    name: ticker,
    sector: 'Industrials',
    sectorDe: 'Industrie',
    index: 'SP500',
    country: 'US',
    currency: 'USD',
    marketCapUsd: 20e9,
    sizeClass: 'Large',
    isFinancial: false,
    fiscalYear: 2025,
    scores: { liquiditaet: 70, rentabilitaet: 80, sicherheit: 90 },
    kpis: {},
  };
}

const list = [company('A'), company('B'), company('C')];
const visible = new Set(['A', 'B', 'C']);
const dimmed = (selected: string | null, spotlight: Set<string> | null) =>
  buildPoints(list, visible, selected, spotlight).filter((p) => p.dimmed).map((p) => p.company.ticker);

describe('Ausgrauen im Würfel', () => {
  it('ohne Auswahl und ohne Fokus bleibt alles farbig', () => {
    expect(dimmed(null, null)).toEqual([]);
  });
  it('«Nur diese» graut alle Firmen ausserhalb der Watchlist aus', () => {
    expect(dimmed(null, new Set(['A', 'B']))).toEqual(['C']);
  });
  it('eine leere Watchlist graut alles aus', () => {
    expect(dimmed(null, new Set())).toEqual(['A', 'B', 'C']);
  });
  it('eine angeklickte Firma geht vor: nur sie bleibt farbig', () => {
    expect(dimmed('C', new Set(['A', 'B']))).toEqual(['A', 'B']);
  });
});
