import type { AxisId, Company, InvestorProfile } from '@/data/types';
import { SECTORS } from './config';
import { formatCompact } from './format';
import { totalScore } from './weighting';

export type Universe = 'SP500' | 'SWISS';

export interface Filters {
  universes: Universe[];
  sector: string | null;
  /** Börsenwert in USD; null = keine Grenze. */
  capMin: number | null;
  capMax: number | null;
  search: string;
  includeFinancials: boolean;
}

export const DEFAULT_FILTERS: Filters = {
  universes: ['SP500', 'SWISS'],
  sector: null,
  capMin: null,
  capMax: null,
  search: '',
  // Banken und Versicherungen sind nur eingeschränkt vergleichbar: beim Start aus, per Filter einschaltbar.
  includeFinancials: false,
};

export function matchesSearch(company: Company, query: string): boolean {
  const q = query.trim().toLowerCase();
  return !q || company.name.toLowerCase().includes(q) || company.ticker.toLowerCase().includes(q);
}

export function matchesFilters(company: Company, filters: Filters): boolean {
  const universe: Universe = company.index === 'SP500' ? 'SP500' : 'SWISS';
  if (!filters.universes.includes(universe)) return false;
  if (filters.sector && company.sector !== filters.sector) return false;
  // Ohne Börsenwert ist keine Zuordnung möglich: bleibt sichtbar, statt still zu verschwinden.
  const cap = company.marketCapUsd;
  if (cap !== null) {
    if (filters.capMin !== null && cap < filters.capMin) return false;
    if (filters.capMax !== null && cap > filters.capMax) return false;
  }
  // Wer gezielt sucht, findet auch Banken, sonst sähe es aus, als fehlten sie in der Datenbank.
  if (!filters.includeFinancials && company.isFinancial && !filters.search.trim()) return false;
  return matchesSearch(company, filters.search);
}

/** Vorschläge unter dem Suchbalken: Treffer am Wortanfang zuerst, dann der Grösse nach. */
export function searchSuggestions(companies: Company[], query: string, limit = 6): Company[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const startsWith = (c: Company) => c.name.toLowerCase().startsWith(q) || c.ticker.toLowerCase().startsWith(q);
  return companies
    .filter((c) => matchesSearch(c, q))
    .sort((a, b) => Number(startsWith(b)) - Number(startsWith(a)) || (b.marketCapUsd ?? 0) - (a.marketCapUsd ?? 0))
    .slice(0, limit);
}

export interface ActiveFilter {
  id: string;
  label: string;
  clear(filters: Filters): Filters;
}

export function formatCapRange(capMin: number | null, capMax: number | null): string {
  const short = (value: number) => formatCompact(value).replace('.0 ', ' ');
  if (capMin !== null && capMax !== null) {
    const [from, to] = [short(capMin), short(capMax)];
    const [fromNumber, fromUnit] = from.split(' ');
    // Gleiche Einheit nur einmal: «32 bis 620 Mrd. USD»
    return to.endsWith(fromUnit) ? `${fromNumber} bis ${to} USD` : `${from} bis ${to} USD`;
  }
  if (capMin !== null) return `Ab ${short(capMin)} USD`;
  return `Bis ${short(capMax ?? 0)} USD`;
}

/** Gesetzte Filter als Chips; die Suche zählt nicht dazu, sie steht im Suchbalken. */
export function activeFilters(filters: Filters): ActiveFilter[] {
  const active: ActiveFilter[] = [];
  if (filters.universes.length < DEFAULT_FILTERS.universes.length) {
    const only = filters.universes[0];
    active.push({
      id: 'universes',
      label: only ? `Nur ${only === 'SP500' ? 'S&P 500' : 'SMI und SMIM'}` : 'Keine Datenbank',
      clear: (f) => ({ ...f, universes: DEFAULT_FILTERS.universes }),
    });
  }
  if (filters.sector) {
    active.push({
      id: 'sector',
      label: SECTORS[filters.sector]?.de ?? filters.sector,
      clear: (f) => ({ ...f, sector: null }),
    });
  }
  if (filters.capMin !== null || filters.capMax !== null) {
    active.push({
      id: 'cap',
      label: formatCapRange(filters.capMin, filters.capMax),
      clear: (f) => ({ ...f, capMin: null, capMax: null }),
    });
  }
  if (filters.includeFinancials) {
    active.push({ id: 'financials', label: 'Mit Finanzsektor', clear: (f) => ({ ...f, includeFinancials: false }) });
  }
  return active;
}

export type SortKey = 'total' | AxisId | 'name' | 'marketCap';

export const SORT_LABELS: Record<SortKey, string> = {
  total: 'Gesamt-Score',
  liquiditaet: 'Liquidität',
  rentabilitaet: 'Rentabilität',
  sicherheit: 'Sicherheit',
  name: 'Name',
  marketCap: 'Börsenwert',
};

/** Sortiert absteigend (Name aufsteigend); fehlende Werte immer ans Ende. */
export function sortCompanies(companies: Company[], key: SortKey, profile: InvestorProfile = 'ausgewogen'): Company[] {
  if (key === 'name') return [...companies].sort((a, b) => a.name.localeCompare(b.name, 'de'));
  const value = (c: Company): number | null => {
    if (key === 'total') return totalScore(c.scores, profile);
    if (key === 'marketCap') return c.marketCapUsd;
    return c.scores[key];
  };
  return [...companies].sort((a, b) => {
    const [x, y] = [value(a), value(b)];
    if (x === null) return y === null ? 0 : 1;
    if (y === null) return -1;
    return y - x;
  });
}

const UNIVERSES: Universe[] = ['SP500', 'SWISS'];
const numOrNull = (v: unknown): v is number | null => v === null || (typeof v === 'number' && Number.isFinite(v));

/** Gespeicherten Filter Feld für Feld prüfen; Unbrauchbares (z. B. aus einer älteren App-Version) fällt auf den Standard. */
export function restoreFilters(raw: unknown): Filters {
  if (!raw || typeof raw !== 'object') return DEFAULT_FILTERS;
  const r = raw as Record<string, unknown>;
  const d = DEFAULT_FILTERS;
  return {
    universes: Array.isArray(r.universes) ? r.universes.filter((u): u is Universe => UNIVERSES.includes(u as Universe)) : d.universes,
    sector: typeof r.sector === 'string' || r.sector === null ? r.sector : d.sector,
    capMin: numOrNull(r.capMin) ? r.capMin : d.capMin,
    capMax: numOrNull(r.capMax) ? r.capMax : d.capMax,
    search: typeof r.search === 'string' ? r.search : d.search,
    includeFinancials: typeof r.includeFinancials === 'boolean' ? r.includeFinancials : d.includeFinancials,
  };
}

export function restoreSort(raw: unknown): SortKey {
  return typeof raw === 'string' && raw in SORT_LABELS ? (raw as SortKey) : 'total';
}
