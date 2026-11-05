import { describe, expect, it } from 'vitest';
import type { Company, CompanyKpi } from '@/data/types';
import { KPI_BY_ID } from './config';
import { buildFazit } from './fazit';
import { ampelFor, compareMode, eigenerBranchenwert, richtwertFor } from './richtwert';

function firma(name: string, sector = 'Utilities', kpis: Record<string, CompanyKpi> = {}): Company {
  return {
    ticker: name, name, sector, sectorDe: sector, index: 'SP500', country: 'US', currency: 'USD',
    marketCapUsd: 20e9, sizeClass: 'Large', isFinancial: sector === 'Financials', fiscalYear: 2025,
    scores: { liquiditaet: 50, rentabilitaet: 50, sicherheit: 50 }, kpis,
  };
}
const kpi = (ampel: CompanyKpi['ampel'], ampelBranche: CompanyKpi['ampel']): CompanyKpi => ({ value: 0.05, ampel, ampelBranche, history: [] });
const def = (id: string) => KPI_BY_ID.get(id)!;

describe('compareMode', () => {
  it('gleiche Branche -> Branchen-Richtwerte', () => {
    expect(compareMode([firma('A'), firma('B')])).toBe('branche');
  });
  it('verschiedene Branchen (z. B. mit einer Bank) -> Buch', () => {
    expect(compareMode([firma('A'), firma('B', 'Financials')])).toBe('buch');
  });
  it('eine Firma gilt als gleiche Branche', () => {
    expect(compareMode([firma('A')])).toBe('branche');
  });
});

describe('richtwertFor', () => {
  it('Branchen-Richtwert, wenn vorhanden', () => {
    expect(richtwertFor(def('roic'), 'Utilities', 'branche')).toEqual({ label: '≥ 4 %', source: 'branche' });
  });
  it('ohne Branchen-Richtwert der Buch-Wert, gekennzeichnet', () => {
    expect(richtwertFor(def('cash_ratio'), 'Utilities', 'branche')).toEqual({ label: '80 %', source: 'buch' });
    expect(richtwertFor(def('equity_ratio'), 'Financials', 'branche')?.source).toBe('buch');
  });
  it('im Buch-Modus immer das Buch', () => {
    expect(richtwertFor(def('roic'), 'Utilities', 'buch')).toEqual({ label: '10 % (RONOA)', source: 'buch' });
  });
  it('Kennzahl ohne jeden Richtwert -> null', () => {
    expect(richtwertFor(def('ebit_margin'), 'Utilities', 'branche')).toBeNull();
  });
});

describe('ohne Branchen-Ampel in den Daten (Supabase vor der Migration)', () => {
  const ohne: CompanyKpi = { value: 0.05, ampel: 'red', ampelBranche: null, history: [] };
  it('zeigt Buch-Richtwert und Buch-Ampel, damit Label und Ampel zusammenpassen', () => {
    expect(richtwertFor(def('roic'), 'Utilities', 'branche', ohne)).toEqual({ label: '10 % (RONOA)', source: 'buch' });
    expect(ampelFor(ohne, 'branche')).toBe('red');
  });
  it('mit Branchen-Ampel bleibt der Branchen-Richtwert', () => {
    expect(richtwertFor(def('roic'), 'Utilities', 'branche', kpi('red', 'green'))?.source).toBe('branche');
  });
});

describe('ampelFor', () => {
  it('wählt die Ampel nach Modus', () => {
    expect(ampelFor(kpi('red', 'green'), 'branche')).toBe('green');
    expect(ampelFor(kpi('red', 'green'), 'buch')).toBe('red');
    expect(ampelFor(undefined, 'buch')).toBe('grey');
  });
});

describe('Fazit nach Modus', () => {
  it('gleiche Branche zählt rote Branchen-Ampeln, gemischt die Buch-Ampeln', () => {
    const a = firma('A', 'Utilities', { roic: kpi('red', 'green') });
    expect(buildFazit([a, firma('B')])).not.toContain('verfehlt');
    expect(buildFazit([a, firma('C', 'Energy')])).toContain('A verfehlt am meisten Richtwerte deutlich: ROIC');
  });
});

describe('eigenerBranchenwert (Detailseite: Branchen-Zeile nur, wenn sie etwas Neues sagt)', () => {
  it('Branchenwert, der vom allgemeinen abweicht -> anzeigen', () => {
    expect(eigenerBranchenwert(def('roic'), 'Utilities', kpi('red', 'green'))).toEqual({ label: '≥ 4 %', source: 'branche' });
  });
  it('Branchenwert gleich wie allgemein (Versorger EK-Quote 25–50 %) -> nur allgemein', () => {
    expect(eigenerBranchenwert(def('equity_ratio'), 'Utilities', kpi('red', 'red'))).toBeNull();
  });
  it('kein Branchenwert oder keine Branchen-Ampel in den Daten -> nur allgemein', () => {
    expect(eigenerBranchenwert(def('cash_ratio'), 'Utilities', kpi('red', 'red'))).toBeNull();
    expect(eigenerBranchenwert(def('roic'), 'Utilities', { value: 0.05, ampel: 'red', ampelBranche: null, history: [] })).toBeNull();
  });
});
