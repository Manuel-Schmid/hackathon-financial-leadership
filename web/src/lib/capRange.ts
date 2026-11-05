import type { Company } from '@/data/types';

/**
 * Börsenwert-Regler auf logarithmischer Skala: Die Werte reichen von wenigen Milliarden bis zu
 * Billionen, linear stünde fast alles in einem einzigen Balken. Position 0–1, Werte in USD.
 */
export interface CapBounds {
  lo: number;
  hi: number;
}

export const HISTOGRAM_BINS = 24;

function caps(companies: Company[]): number[] {
  return companies.map((c) => c.marketCapUsd).filter((v): v is number => v !== null && v > 0);
}

export function capBounds(companies: Company[]): CapBounds | null {
  const values = caps(companies);
  if (!values.length) return null;
  return { lo: Math.min(...values), hi: Math.max(...values) };
}

export function capToPosition(value: number, { lo, hi }: CapBounds): number {
  if (hi <= lo) return 0;
  const position = (Math.log10(value) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo));
  return Math.min(1, Math.max(0, position));
}

/** Auf zwei gültige Stellen gerundet: 13.4 Mrd. liest sich besser als 13'417'882'112. */
export function positionToCap(position: number, { lo, hi }: CapBounds): number {
  const value = 10 ** (Math.log10(lo) + position * (Math.log10(hi) - Math.log10(lo)));
  return Number(value.toPrecision(2));
}

export function capHistogram(companies: Company[], bounds: CapBounds, bins = HISTOGRAM_BINS): number[] {
  const counts = new Array<number>(bins).fill(0);
  for (const value of caps(companies)) {
    counts[Math.min(bins - 1, Math.floor(capToPosition(value, bounds) * bins))] += 1;
  }
  return counts;
}
