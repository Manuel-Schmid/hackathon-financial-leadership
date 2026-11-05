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
}

export interface MatrixRow {
  company: Company;
  cells: MatrixCell[];
  counts: Record<Ampel, number>;
}

/** Eine Zeile pro Firma; Ampel und Richtwert wie in der Vergleichstabelle (gleiche Branche -> Branchen-Richtwerte). */
export function ampelMatrix(companies: Company[], modus: RichtwertModus = compareMode(companies)): MatrixRow[] {
  return companies.map((company) => {
    const counts: Record<Ampel, number> = { green: 0, yellow: 0, red: 0, grey: 0 };
    const cells = MATRIX_KPIS.map((kpi) => {
      const k = company.kpis[kpi.id];
      const ampel = ampelFor(k, modus);
      counts[ampel] += 1;
      return { kpi, ampel, value: k?.value ?? null, richtwert: richtwertFor(kpi, company.sector, modus, k)?.label ?? null };
    });
    return { company, cells, counts };
  });
}
