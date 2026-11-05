import type { Company, KpiPoint } from '@/data/types';
import type { KpiUnit } from './config';
import { formatCompact } from './format';

const NICE_STEPS = [1, 2, 2.5, 5, 10];
const MAX_INTERVALS = 3;

/** Runde Achsenwerte, die immer die Null enthalten: Sonst sähen kleine Schwankungen wie grosse Bewegungen aus. */
export function axisTicks(values: number[]): number[] {
  const lo = Math.min(0, ...values);
  const hi = Math.max(0, ...values);
  if (lo === hi) return [0, 1];

  const rough = (hi - lo) / MAX_INTERVALS;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = (NICE_STEPS.find((s) => s * magnitude >= rough * (1 - 1e-9)) ?? 10) * magnitude;
  const first = Math.floor(lo / step + 1e-9);
  const last = Math.ceil(hi / step - 1e-9);

  const ticks: number[] = [];
  for (let i = first; i <= last; i += 1) ticks.push(Number((i * step).toPrecision(12)));
  return ticks;
}

function trimmed(value: number): string {
  return value.toLocaleString('de-CH', { maximumFractionDigits: 1 });
}

/** Kurze Beschriftung für die Werte-Achse, ohne Währung: Die steht beim Wert daneben. */
export function formatAxisTick(value: number, unit: KpiUnit): string {
  const sign = value < 0 ? '−' : '';
  const abs = Math.abs(value);
  switch (unit) {
    case 'pct':
      return `${sign}${trimmed(abs * 100)} %`;
    case 'currency':
      return value === 0 ? '0' : formatCompact(value).replace('.0 ', ' ');
    case 'years':
      return `${sign}${trimmed(abs)} J.`;
    case 'factor':
      return `${sign}${trimmed(abs)}×`;
  }
}

/** Jahre, in denen mindestens eine Kennzahl der Firma einen Wert hat: gleiche Jahresachse in allen Diagrammen. */
export function companyYears(company: Company): number[] {
  const years = new Set<number>();
  for (const kpi of Object.values(company.kpis)) {
    for (const point of kpi.history) {
      if (point.value !== null) years.add(point.year);
    }
  }
  return [...years].sort((a, b) => a - b);
}

export function historyForYears(history: KpiPoint[], years: number[]): KpiPoint[] {
  const byYear = new Map(history.map((p) => [p.year, p.value]));
  return years.map((year) => ({ year, value: byYear.get(year) ?? null }));
}
