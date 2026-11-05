import type { AxisId, Company, InvestorProfile, SizeClass } from '@/data/types';
import { totalScore } from './weighting';

export type Universe = 'SP500' | 'SWISS';

export interface Filters {
  universes: Universe[];
  sector: string | null;
  sizes: SizeClass[];
  search: string;
  includeFinancials: boolean;
}

export const DEFAULT_FILTERS: Filters = {
  universes: ['SP500', 'SWISS'],
  sector: null,
  sizes: ['Large', 'Mid', 'Small'],
  search: '',
  includeFinancials: true,
};

export function matchesFilters(company: Company, filters: Filters): boolean {
  const universe: Universe = company.index === 'SP500' ? 'SP500' : 'SWISS';
  if (!filters.universes.includes(universe)) return false;
  if (filters.sector && company.sector !== filters.sector) return false;
  // Ohne Börsenwert ist keine Zuordnung möglich: bleibt sichtbar, statt still zu verschwinden.
  if (company.sizeClass && !filters.sizes.includes(company.sizeClass)) return false;
  if (!filters.includeFinancials && company.isFinancial) return false;
  const query = filters.search.trim().toLowerCase();
  return !query || company.name.toLowerCase().includes(query) || company.ticker.toLowerCase().includes(query);
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
