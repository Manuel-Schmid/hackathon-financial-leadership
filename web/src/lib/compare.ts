import type { Company } from '@/data/types';
import type { KpiDef } from './config';

/** Index des besten Werts einer Zeile, oder null wenn kein Vergleich sinnvoll ist. */
export function bestIndex(companies: Company[], kpi: KpiDef): number | null {
  // Beträge in verschiedenen Währungen (FCF: CHF vs. USD) sind nicht direkt vergleichbar.
  if (kpi.unit === 'currency' && new Set(companies.map((c) => c.currency)).size > 1) return null;

  let best: number | null = null;
  let bestValue = 0;
  companies.forEach((c, i) => {
    const value = c.kpis[kpi.id]?.value;
    if (value === null || value === undefined) return;
    // Negativer Verschuldungsgrad = negatives Eigenkapital, nie der beste Wert.
    if (c.kpis[kpi.id].ampel === 'red' && kpi.direction === 'lower' && value < 0) return;
    if (best === null || (kpi.direction === 'higher' ? value > bestValue : value < bestValue)) {
      best = i;
      bestValue = value;
    }
  });
  return best;
}

/** Eigene Farben im Vergleich, weil mehrere Firmen dieselbe Branche haben können. */
export const COMPARE_COLORS = ['#3B5BA9', '#0FA3A3', '#6A5AE0', '#D9822B'];
export const MAX_COMPARE = COMPARE_COLORS.length;

/** Reihenfolge wie im Mockup, gruppiert nach Achse. */
export const COMPARE_KPIS = [
  'current_ratio',
  'cash_ratio',
  'fcf',
  'roe',
  'ebit_margin',
  'ros',
  'equity_ratio',
  'debt_equity',
  'adg2',
];

export const QUICK_KPIS = ['current_ratio', 'roe', 'ebit_margin', 'equity_ratio', 'fcf'];
