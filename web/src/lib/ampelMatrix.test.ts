import { describe, expect, it } from 'vitest';
import type { Company, CompanyKpi } from '@/data/types';
import { ampelMatrix, MATRIX_KPIS } from './ampelMatrix';

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
