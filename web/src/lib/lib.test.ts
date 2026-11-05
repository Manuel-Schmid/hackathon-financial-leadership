import { describe, expect, it } from 'vitest';
import type { AxisScores, Company } from '@/data/types';
import { KPIS, PROFILES } from './config';
import { buildFazit } from './fazit';
import { capBounds, capHistogram, capToPosition, positionToCap } from './capRange';
import { activeFilters, DEFAULT_FILTERS, formatCapRange, matchesFilters, searchSuggestions, sortCompanies } from './filters';
import { formatKpi, formatMarketCap, formatScore, tickerAndSector } from './format';
import { median, sectorMedian } from './medians';
import { totalScore } from './weighting';

function company(over: Partial<Company> & { scores?: AxisScores } = {}): Company {
  return {
    ticker: 'VACN.SW',
    name: 'VAT Group',
    sector: 'Industrials',
    sectorDe: 'Industrie',
    index: 'SMIM',
    country: 'CH',
    currency: 'CHF',
    marketCapUsd: 20e9,
    sizeClass: 'Large',
    isFinancial: false,
    fiscalYear: 2025,
    scores: { liquiditaet: 70, rentabilitaet: 80, sicherheit: 90 },
    kpis: {},
    ...over,
  };
}

describe('Gewichtung', () => {
  it('konservativ gewichtet Sicherheit 50 %', () => {
    expect(totalScore({ liquiditaet: 40, rentabilitaet: 40, sicherheit: 100 }, 'konservativ')).toBeCloseTo(70);
  });
  it('Profil ändert den Gesamt-Score', () => {
    const scores = { liquiditaet: 10, rentabilitaet: 90, sicherheit: 10 };
    expect(totalScore(scores, 'renditeorientiert')!).toBeGreaterThan(totalScore(scores, 'konservativ')!);
  });
  it('verteilt das Gewicht einer fehlenden Achse', () => {
    expect(totalScore({ liquiditaet: null, rentabilitaet: 60, sicherheit: 60 }, 'konservativ')).toBeCloseTo(60);
  });
  it('ohne Scores kein Gesamt-Score', () => {
    expect(totalScore({ liquiditaet: null, rentabilitaet: null, sicherheit: null })).toBeNull();
  });
  it('alle Profile summieren auf 1', () => {
    for (const weights of Object.values(PROFILES)) {
      expect(Object.values(weights).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 3);
    }
  });
});

describe('Filter', () => {
  it('Standard zeigt alles', () => {
    expect(matchesFilters(company(), DEFAULT_FILTERS)).toBe(true);
  });
  it('Datenbank SMI/SMIM aus blendet Schweizer Titel aus', () => {
    expect(matchesFilters(company(), { ...DEFAULT_FILTERS, universes: ['SP500'] })).toBe(false);
  });
  it('Suche findet Name und Ticker, ohne Gross-/Kleinschreibung', () => {
    expect(matchesFilters(company(), { ...DEFAULT_FILTERS, search: 'vacn' })).toBe(true);
    expect(matchesFilters(company(), { ...DEFAULT_FILTERS, search: 'vat g' })).toBe(true);
    expect(matchesFilters(company(), { ...DEFAULT_FILTERS, search: 'apple' })).toBe(false);
  });
  it('Finanzsektor ist beim Start aus und lässt sich einschalten', () => {
    expect(matchesFilters(company({ isFinancial: true }), DEFAULT_FILTERS)).toBe(false);
    expect(matchesFilters(company({ isFinancial: true }), { ...DEFAULT_FILTERS, includeFinancials: true })).toBe(true);
  });
  it('Suche findet Banken auch bei ausgeschaltetem Finanzsektor', () => {
    const bank = company({ isFinancial: true, name: 'UBS', ticker: 'UBSG.SW' });
    expect(matchesFilters(bank, { ...DEFAULT_FILTERS, search: 'ubs' })).toBe(true);
    expect(matchesFilters(bank, { ...DEFAULT_FILTERS, search: 'nestle' })).toBe(false);
  });
  it('Börsenwert-Bereich und Branche wirken', () => {
    expect(matchesFilters(company(), { ...DEFAULT_FILTERS, capMin: 25e9 })).toBe(false);
    expect(matchesFilters(company(), { ...DEFAULT_FILTERS, capMax: 15e9 })).toBe(false);
    expect(matchesFilters(company(), { ...DEFAULT_FILTERS, capMin: 10e9, capMax: 25e9 })).toBe(true);
    expect(matchesFilters(company(), { ...DEFAULT_FILTERS, sector: 'Energy' })).toBe(false);
  });
  it('Firma ohne Börsenwert bleibt beim Grössen-Filter sichtbar', () => {
    expect(matchesFilters(company({ marketCapUsd: null, sizeClass: null }), { ...DEFAULT_FILTERS, capMin: 25e9 })).toBe(true);
  });
  it('Vorschläge: Wortanfang vor Treffer im Wort, dann nach Grösse', () => {
    const list = [
      company({ ticker: 'A', name: 'Innovat', marketCapUsd: 900e9 }),
      company({ ticker: 'B', name: 'Vat Klein', marketCapUsd: 1e9 }),
      company({ ticker: 'C', name: 'Vat Gross', marketCapUsd: 50e9 }),
    ];
    expect(searchSuggestions(list, 'vat').map((c) => c.ticker)).toEqual(['C', 'B', 'A']);
    expect(searchSuggestions(list, '  ')).toEqual([]);
  });
  it('Börsenwert-Bereich liest sich kurz', () => {
    expect(formatCapRange(32e9, 620e9)).toBe('32 bis 620 Mrd. USD');
    expect(formatCapRange(32e9, 1.2e12)).toBe('32 Mrd. bis 1.2 Bio. USD');
    expect(formatCapRange(null, 620e9)).toBe('Bis 620 Mrd. USD');
  });
  it('gesetzte Filter werden als Chips gezählt und einzeln entfernt', () => {
    const filters = { ...DEFAULT_FILTERS, sector: 'Energy', capMin: 10e9, universes: ['SP500' as const], includeFinancials: true };
    const chips = activeFilters(filters);
    expect(chips.map((c) => c.label)).toEqual(['Nur S&P 500', 'Energie', 'Ab 10 Mrd. USD', 'Mit Finanzsektor']);
    expect(activeFilters(chips[1].clear(filters))).toHaveLength(3);
    expect(activeFilters(DEFAULT_FILTERS)).toEqual([]);
  });
  it('das Anlegerprofil bestimmt die Reihenfolge, auch ein eigenes', () => {
    const safe = company({ ticker: 'SAFE', scores: { liquiditaet: 50, rentabilitaet: 20, sicherheit: 95 } });
    const yieldy = company({ ticker: 'YIELD', scores: { liquiditaet: 50, rentabilitaet: 95, sicherheit: 20 } });
    expect(sortCompanies([yieldy, safe], 'total', 'konservativ')[0].ticker).toBe('SAFE');
    expect(sortCompanies([safe, yieldy], 'total', 'renditeorientiert')[0].ticker).toBe('YIELD');
    const own = { liquiditaet: 0, rentabilitaet: 0, sicherheit: 1 };
    expect(sortCompanies([yieldy, safe], 'total', own)[0].ticker).toBe('SAFE');
  });
  it('das Anlegerprofil ist ein Filter-Chip und lässt sich entfernen', () => {
    const filters = { ...DEFAULT_FILTERS, investorProfile: 'konservativ' };
    const [chip] = activeFilters(filters, 'Konservativ');
    expect(chip.label).toBe('Profil Konservativ');
    expect(chip.clear(filters).investorProfile).toBeNull();
    // Gelöschtes Profil: kein Chip ohne Namen
    expect(activeFilters(filters)).toEqual([]);
  });
  it('sortiert fehlende Werte ans Ende', () => {
    const a = company({ ticker: 'A', scores: { liquiditaet: null, rentabilitaet: null, sicherheit: null } });
    const b = company({ ticker: 'B' });
    expect(sortCompanies([a, b], 'total').map((c) => c.ticker)).toEqual(['B', 'A']);
  });
});

describe('Börsenwert-Regler', () => {
  const list = [1e9, 10e9, 100e9, 1000e9].map((marketCapUsd, i) => company({ ticker: String(i), marketCapUsd }));
  const bounds = capBounds(list)!;

  it('ist logarithmisch: jede Zehnerstufe gleich breit', () => {
    expect(capToPosition(10e9, bounds)).toBeCloseTo(1 / 3);
    expect(capToPosition(100e9, bounds)).toBeCloseTo(2 / 3);
  });
  it('rundet Positionen auf zwei Stellen', () => {
    expect(positionToCap(1 / 3, bounds)).toBe(10e9);
    expect(positionToCap(0.5, bounds)).toBe(32e9);
  });
  it('Histogramm zählt jede Firma genau einmal, auch die grösste', () => {
    const bars = capHistogram(list, bounds, 3);
    expect(bars.reduce((a, b) => a + b, 0)).toBe(4);
    expect(bars[2]).toBe(2);
  });
  it('ignoriert fehlende Börsenwerte', () => {
    expect(capBounds([company({ marketCapUsd: null })])).toBeNull();
  });
});

describe('Format', () => {
  it('Kennzahlen', () => {
    expect(formatKpi(0.628, 'pct')).toBe('62.8 %');
    expect(formatKpi(1.314, 'pct')).toBe('131 %');
    expect(formatKpi(43_024_000, 'currency', 'CHF')).toBe('+43 Mio. CHF');
    expect(formatKpi(-1.1e9, 'currency')).toBe('−1.1 Mrd.');
    expect(formatKpi(null, 'pct')).toBe('–');
  });
  it('Börsenwert und Score', () => {
    expect(formatMarketCap(13.1e9)).toBe('13.1 Mrd. USD');
    expect(formatScore(70.6)).toBe('71');
    expect(formatScore(null)).toBe('–');
  });
});

describe('Median', () => {
  it('gerade und ungerade Anzahl', () => {
    expect(median([1, 3, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(median([])).toBeNull();
  });
  it('rechnet nur innerhalb der Branche und ignoriert null', () => {
    const kpi = (value: number | null) => ({ roe: { value, ampel: 'grey' as const, ampelBranche: 'grey' as const, history: [] } });
    const list = [
      company({ kpis: kpi(0.1) }),
      company({ kpis: kpi(0.3) }),
      company({ kpis: kpi(null) }),
      company({ sector: 'Energy', kpis: kpi(9) }),
    ];
    expect(sectorMedian(list, 'Industrials', 'roe')).toBeCloseTo(0.2);
  });
});

describe('Kurzfazit', () => {
  it('nennt die Beste pro Achse und Richtwert-Verfehlungen', () => {
    const red = { value: 0.1, ampel: 'red' as const, ampelBranche: 'red' as const, history: [] };
    const text = buildFazit([
      company({ name: 'A', scores: { liquiditaet: 10, rentabilitaet: 90, sicherheit: 20 }, kpis: { cash_ratio: red } }),
      company({ name: 'B', scores: { liquiditaet: 80, rentabilitaet: 30, sicherheit: 95 } }),
    ]);
    expect(text).toContain('B ist in dieser Auswahl am sichersten');
    expect(text).toContain('A ist in dieser Auswahl am rentabelsten');
    expect(text).toContain('A verfehlt am meisten Richtwerte deutlich: Cash Ratio');
  });
  it('braucht zwei Firmen', () => {
    expect(buildFazit([company()])).toContain('mindestens zwei');
  });
});

describe('Konfiguration', () => {
  it('hat alle 17 Kennzahlen', () => {
    expect(KPIS).toHaveLength(17);
  });
});

describe('tickerAndSector', () => {
  it('Ticker und Branche wie auf den Vergleichskarten', () => {
    expect(tickerAndSector(company({ ticker: 'ADSK', sectorDe: 'Technologie' }))).toBe('ADSK · Technologie');
  });
});
