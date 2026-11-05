import type { Ampel, Company } from '@/data/types';
import { AXIS_IDS, KPIS, type KpiDef } from './config';
import { ampelFor, compareMode, richtwertFor, type RichtwertModus } from './richtwert';

/** Spalten der Ampel-Matrix: alle Kennzahlen mit Richtwert, nach Achse geordnet (ohne Richtwert wäre die Spalte immer grau). */
export const MATRIX_KPIS: KpiDef[] = AXIS_IDS.flatMap((axis) => KPIS.filter((k) => k.axis === axis && k.richtwert));

export interface MatrixCell {
  kpi: KpiDef;
  ampel: Ampel;
  value: number | null;
  richtwert: string | null;
  /** Platzierung in derselben Vergleichsgruppe wie die Ampel (Branche oder alle Firmen) */
  rank: Rank | null;
}

export interface MatrixRow {
  company: Company;
  cells: MatrixCell[];
  counts: Record<Ampel, number>;
}

/**
 * Eine Zeile pro Firma; Ampel und Richtwert wie in der Vergleichstabelle (gleiche Branche -> Branchen-Richtwerte).
 * Der Rang gilt in derselben Gruppe: im Branchenmodus innerhalb der Branche, sonst unter allen Firmen (all).
 */
export function ampelMatrix(companies: Company[], modus: RichtwertModus = compareMode(companies), all: Company[] = companies): MatrixRow[] {
  return companies.map((company) => {
    const counts: Record<Ampel, number> = { green: 0, yellow: 0, red: 0, grey: 0 };
    const cells = MATRIX_KPIS.map((kpi) => {
      const k = company.kpis[kpi.id];
      const ampel = ampelFor(k, modus);
      counts[ampel] += 1;
      const rank = rankFor(all, kpi, company.ticker, modus === 'branche' ? company.sector : undefined);
      return { kpi, ampel, value: k?.value ?? null, richtwert: richtwertFor(kpi, company.sector, modus, k)?.label ?? null, rank };
    });
    return { company, cells, counts };
  });
}

/** Negatives Eigenkapital wie in scoring.score_companies: EK-Quote <= 0 oder Verschuldungsgrad < 0. */
function negativeEquity(c: Company): boolean {
  const eq = c.kpis.equity_ratio?.value;
  const de = c.kpis.debt_equity?.value;
  return (eq !== null && eq !== undefined && eq <= 0) || (de !== null && de !== undefined && de < 0);
}

/** Höher = besser; dieselben Regeln wie scoring.percentile_ranks (Richtung, negatives Eigenkapital ganz hinten). */
function goodness(c: Company, kpi: KpiDef, v: number): number {
  if ((kpi.negativeIsWorst && v < 0) || (kpi.requiresPositiveEquity && negativeEquity(c))) return -Infinity;
  return kpi.direction === 'lower' ? -v : v;
}

export interface Rank {
  rank: number;
  n: number;
  /** «Top x %»: Anteil der Firmen, die gleich gut oder besser sind, aufgerundet (1–100) */
  top: number;
}

/** Platzierung einer Firma bei einer Kennzahl, unter allen Firmen mit Wert oder nur innerhalb einer Branche. */
export function rankFor(all: Company[], kpi: KpiDef, ticker: string, sector?: string): Rank | null {
  const group = all.filter((c) => (!sector || c.sector === sector) && c.kpis[kpi.id]?.value != null);
  const self = group.find((c) => c.ticker === ticker);
  if (!self) return null;
  const mine = goodness(self, kpi, self.kpis[kpi.id].value as number);
  const better = group.filter((c) => goodness(c, kpi, c.kpis[kpi.id].value as number) > mine).length;
  const rank = better + 1;
  return { rank, n: group.length, top: Math.max(1, Math.ceil((rank / group.length) * 100)) };
}
