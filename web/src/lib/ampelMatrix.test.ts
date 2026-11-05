import { describe, expect, it } from 'vitest';
import type { Company, CompanyKpi } from '@/data/types';
import { ampelMatrix, MATRIX_KPIS, rankFor } from './ampelMatrix';

function firma(name: string, sector: string, kpis: Record<string, CompanyKpi> = {}): Company {
  return {
    ticker: name, name, sector, sectorDe: sector, index: 'SP500', country: 'US', currency: 'USD',
    marketCapUsd: 20e9, sizeClass: 'Large', isFinancial: false, fiscalYear: 2025,
    scores: { liquiditaet: 50, rentabilitaet: 50, sicherheit: 50 }, kpis,
  };
}
const kpi = (ampel: CompanyKpi['ampel'], ampelBranche: CompanyKpi['ampel'], value = 0.05): CompanyKpi => ({ value, ampel, ampelBranche, history: [] });

describe('MATRIX_KPIS', () => {
  it('alle 12 Kennzahlen mit Richtwert, nach Achse geordnet', () => {
    expect(MATRIX_KPIS).toHaveLength(12);
    expect(MATRIX_KPIS.every((k) => k.richtwert)).toBe(true);
    const axes = MATRIX_KPIS.map((k) => k.axis);
    expect(axes.indexOf('rentabilitaet')).toBeGreaterThan(axes.lastIndexOf('liquiditaet'));
    expect(axes.indexOf('sicherheit')).toBeGreaterThan(axes.lastIndexOf('rentabilitaet'));
  });
});

describe('ampelMatrix', () => {
  it('gleiche Branche -> Branchen-Ampeln, mit Richtwert der Branche', () => {
    const [row] = ampelMatrix([firma('A', 'Utilities', { roic: kpi('red', 'green') }), firma('B', 'Utilities')]);
    const roic = row.cells.find((c) => c.kpi.id === 'roic')!;
    expect(roic.ampel).toBe('green');
    expect(roic.richtwert).toBe('≥ 4 %');
  });

  it('verschiedene Branchen -> allgemeine Ampeln', () => {
    const [row] = ampelMatrix([firma('A', 'Utilities', { roic: kpi('red', 'green') }), firma('B', 'Energy')]);
    const roic = row.cells.find((c) => c.kpi.id === 'roic')!;
    expect(roic.ampel).toBe('red');
    expect(roic.richtwert).toBe('10 % (RONOA)');
  });

  it('zählt die Ampeln pro Firma; fehlende Kennzahl ist grau', () => {
    const [row] = ampelMatrix([firma('A', 'Energy', { roe: kpi('green', 'green'), roa: kpi('red', 'red'), roic: kpi('yellow', 'yellow') }), firma('B', 'Utilities')]);
    expect(row.cells).toHaveLength(12);
    expect(row.counts).toEqual({ green: 1, yellow: 1, red: 1, grey: 9 });
  });
});

describe('rankFor (Platzierung wie scoring.percentile_ranks)', () => {
  const v = (value: number | null): CompanyKpi => ({ value, ampel: 'grey', ampelBranche: 'grey', history: [] });
  const def = (id: string) => MATRIX_KPIS.find((k) => k.id === id)!;
  const set = (id: string, values: (number | null)[], sector = 'Industrials') =>
    values.map((x, i) => firma(`T${i}`, sector, { [id]: v(x) }));

  it('höher besser: Rang 1 = bester Wert, leere Werte zählen nicht', () => {
    const all = set('roe', [0.1, 0.3, null, 0.2]);
    expect(rankFor(all, def('roe'), 'T1')).toEqual({ rank: 1, n: 3, top: 34 });
    expect(rankFor(all, def('roe'), 'T0')).toEqual({ rank: 3, n: 3, top: 100 });
    expect(rankFor(all, def('roe'), 'T2')).toBeNull();
  });

  it('tiefer besser und negativer Verschuldungsgrad ganz hinten', () => {
    const all = set('debt_equity', [2.0, 0.5, -3.0]);
    expect(rankFor(all, def('debt_equity'), 'T1')?.rank).toBe(1);
    expect(rankFor(all, def('debt_equity'), 'T2')?.rank).toBe(3);
  });

  it('negatives Eigenkapital ganz hinten bei Kennzahlen mit requiresPositiveEquity', () => {
    const k = MATRIX_KPIS.find((x) => x.requiresPositiveEquity)!;
    const all = [
      firma('GUT', 'Industrials', { [k.id]: v(1.2) }),
      firma('NEG', 'Industrials', { [k.id]: v(5.0), equity_ratio: v(-0.1) }),
    ];
    expect(rankFor(all, k, 'NEG')?.rank).toBe(2);
  });

  it('gleiche Werte teilen den besten Rang; Vergleichsgruppe nach Branche', () => {
    const all = [...set('roe', [0.2, 0.2, 0.1]), ...set('roe', [0.9], 'Energy').map((c) => ({ ...c, ticker: 'E0' }))];
    expect(rankFor(all, def('roe'), 'T1')?.rank).toBe(2);
    expect(rankFor(all, def('roe'), 'T1', 'Industrials')).toEqual({ rank: 1, n: 3, top: 34 });
  });
});

describe('ampelMatrix mit Rang', () => {
  const v = (value: number): CompanyKpi => ({ value, ampel: 'green', ampelBranche: 'green', history: [] });
  const universum = [
    firma('A', 'Utilities', { roe: v(0.1) }),
    firma('B', 'Utilities', { roe: v(0.2) }),
    firma('X', 'Energy', { roe: v(0.5) }),
  ];
  it('gleiche Branche: Rang innerhalb der Branche', () => {
    const [a] = ampelMatrix(universum.slice(0, 2), undefined, universum);
    expect(a.cells.find((c) => c.kpi.id === 'roe')!.rank).toEqual({ rank: 2, n: 2, top: 100 });
  });
  it('verschiedene Branchen: Rang unter allen Firmen', () => {
    const [a] = ampelMatrix([universum[0], universum[2]], undefined, universum);
    expect(a.cells.find((c) => c.kpi.id === 'roe')!.rank).toEqual({ rank: 3, n: 3, top: 100 });
  });
});
