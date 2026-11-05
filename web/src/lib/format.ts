import type { Company } from '@/data/types';
import type { KpiUnit } from './config';

const NA = '–';

function fixed(value: number, digits: number): string {
  return value.toLocaleString('de-CH', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** 1.3e10 -> "13.0 Mrd.", 43e6 -> "43 Mio." */
export function formatCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '−' : '';
  if (abs >= 1e12) return `${sign}${fixed(abs / 1e12, 1)} Bio.`;
  if (abs >= 1e9) return `${sign}${fixed(abs / 1e9, 1)} Mrd.`;
  if (abs >= 1e6) return `${sign}${fixed(abs / 1e6, 0)} Mio.`;
  return `${sign}${fixed(abs, 0)}`;
}

export function formatKpi(value: number | null | undefined, unit: KpiUnit, currency = ''): string {
  if (value === null || value === undefined) return NA;
  switch (unit) {
    case 'pct': {
      const pct = value * 100;
      const text = fixed(Math.abs(pct), Math.abs(pct) >= 100 ? 0 : 1);
      return `${pct < 0 ? '−' : ''}${text} %`;
    }
    case 'currency':
      return `${value > 0 ? '+' : ''}${formatCompact(value)}${currency ? ` ${currency}` : ''}`;
    case 'years':
      return `${fixed(value, 1)} J.`;
    case 'factor':
      return `${fixed(value, 1)}×`;
  }
}

export function formatMarketCap(usd: number | null): string {
  return usd === null ? NA : `${formatCompact(usd)} USD`;
}

export function formatScore(score: number | null | undefined): string {
  return score === null || score === undefined ? NA : String(Math.round(score));
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return y && m && d ? `${d}.${m}.${y}` : iso;
}

/** «ADSK · Technologie»: Ticker und Branche, wie auf den Vergleichskarten und in der Hinzufügen-Liste. */
export function tickerAndSector(c: Pick<Company, 'ticker' | 'sectorDe'>): string {
  return `${c.ticker} · ${c.sectorDe}`;
}
