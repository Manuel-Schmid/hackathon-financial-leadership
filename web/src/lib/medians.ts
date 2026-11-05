import type { Company } from '@/data/types';

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Median einer Kennzahl in einer Branche, für das letzte Geschäftsjahr jeder Firma. */
export function sectorMedian(companies: Company[], sector: string, kpiId: string): number | null {
  const values = companies
    .filter((c) => c.sector === sector)
    .map((c) => c.kpis[kpiId]?.value)
    .filter((v): v is number => v !== null && v !== undefined);
  return median(values);
}
