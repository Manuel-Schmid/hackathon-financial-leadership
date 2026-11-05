import kpiConfig from '@config/kpis.json';
import sectorConfig from '@config/sectors.json';
import themeConfig from '@config/theme.json';
import type { AxisId, InvestorProfile } from '@/data/types';

/** Farben für Stellen ohne Tailwind (Würfel, Diagramme). Quelle: config/theme.json */
export const THEME = themeConfig;

export type KpiUnit = 'pct' | 'currency' | 'years' | 'factor';
export type Richtwert = { min?: number; max?: number; label: string };

export interface KpiDef {
  id: string;
  label: string;
  short: string;
  axis: AxisId;
  formula: string;
  direction: 'higher' | 'lower';
  inScore: boolean | string;
  richtwert: Richtwert | null;
  /** Branchen-Richtwerte (docs/BRANCHEN_RICHTWERTE.md), Schlüssel = Sektor englisch */
  richtwertBranche?: { quelle: string; werte: Record<string, Richtwert> };
  unit: KpiUnit;
  source: string;
}

export interface SectorDef {
  de: string;
  color: string;
  financial?: boolean;
}

export const KPIS = kpiConfig.kpis as KpiDef[];
export const KPI_BY_ID = new Map(KPIS.map((k) => [k.id, k]));
export const SECTORS = sectorConfig as Record<string, SectorDef>;
export const AXIS_IDS: AxisId[] = ['liquiditaet', 'rentabilitaet', 'sicherheit'];
export const AXES: Record<AxisId, { label: string; color: string }> = {
  liquiditaet: { label: kpiConfig.axes.liquiditaet.label, color: THEME.L.DEFAULT },
  rentabilitaet: { label: kpiConfig.axes.rentabilitaet.label, color: THEME.R.DEFAULT },
  sicherheit: { label: kpiConfig.axes.sicherheit.label, color: THEME.S.DEFAULT },
};
export const PROFILES = kpiConfig.profile as Record<InvestorProfile, Record<AxisId, number>>;
export const PROFILE_IDS = Object.keys(PROFILES) as InvestorProfile[];
export const FINANCIAL = kpiConfig.financialSector;

/** Tailwind-Klassen je Achse an einem Ort, damit jede Achse überall gleich aussieht. */
export const AXIS_STYLE: Record<AxisId, { text: string; bg: string; soft: string; short: string }> = {
  liquiditaet: { text: 'text-L', bg: 'bg-L', soft: 'bg-L-soft', short: 'L' },
  rentabilitaet: { text: 'text-R-text', bg: 'bg-R', soft: 'bg-R-soft', short: 'R' },
  sicherheit: { text: 'text-S', bg: 'bg-S', soft: 'bg-S-soft', short: 'S' },
};
