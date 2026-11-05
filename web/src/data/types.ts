export type AxisId = 'liquiditaet' | 'rentabilitaet' | 'sicherheit';
export type AxisScores = Record<AxisId, number | null>;
export type Ampel = 'green' | 'yellow' | 'red' | 'grey';
export type IndexId = 'SP500' | 'SMI' | 'SMIM';
export type SizeClass = 'Large' | 'Mid' | 'Small';
export type InvestorProfile = 'konservativ' | 'ausgewogen' | 'renditeorientiert';

export interface KpiPoint {
  year: number;
  value: number | null;
}

export interface CompanyKpi {
  value: number | null;
  ampel: Ampel;
  /** Ampel gegen den Branchen-Richtwert; ohne Branchen-Richtwert gleich ampel. null = nicht in den Daten (z. B. Supabase vor der Migration). */
  ampelBranche: Ampel | null;
  history: KpiPoint[];
}

export interface Company {
  ticker: string;
  name: string;
  sector: string;
  sectorDe: string;
  index: IndexId;
  country: string;
  currency: string;
  marketCapUsd: number | null;
  sizeClass: SizeClass | null;
  isFinancial: boolean;
  fiscalYear: number;
  scores: AxisScores;
  kpis: Record<string, CompanyKpi>;
}

export interface DataMeta {
  asOf: string;
  source: string;
  count: number;
}
