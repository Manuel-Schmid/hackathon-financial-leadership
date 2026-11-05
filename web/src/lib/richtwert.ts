import type { Ampel, Company, CompanyKpi } from '@/data/types';
import type { KpiDef } from './config';

/** Buch: Richtwerte aus dem Buch (S. 292–293). Branche: Branchen-Richtwerte, wo vorhanden. */
export type RichtwertModus = 'buch' | 'branche';

/** Branchen-Richtwerte nur, wenn alle Firmen aus derselben Branche sind. */
export function compareMode(companies: Company[]): RichtwertModus {
  return new Set(companies.map((c) => c.sector)).size <= 1 ? 'branche' : 'buch';
}

/**
 * Anzuzeigender Richtwert und woher er stammt; ohne Branchen-Richtwert gilt das Buch.
 * Fehlt die Branchen-Ampel in den Daten (kpi.ampelBranche null), ebenfalls das Buch, damit Label und Ampel zusammenpassen.
 */
export function richtwertFor(
  def: KpiDef,
  sector: string,
  modus: RichtwertModus,
  kpi?: CompanyKpi,
): { label: string; source: 'buch' | 'branche' } | null {
  const hatAmpel = kpi?.ampelBranche !== null;
  const branche = modus === 'branche' && hatAmpel ? def.richtwertBranche?.werte[sector] : undefined;
  if (branche) return { label: branche.label, source: 'branche' };
  return def.richtwert ? { label: def.richtwert.label, source: 'buch' } : null;
}

export function ampelFor(kpi: CompanyKpi | undefined, modus: RichtwertModus): Ampel {
  if (!kpi) return 'grey';
  return modus === 'branche' ? (kpi.ampelBranche ?? kpi.ampel) : kpi.ampel;
}

/**
 * Branchen-Richtwert, wenn er etwas anderes sagt als der allgemeine (Detailseite zeigt dann zwei Zeilen).
 * null, wenn die Branche keinen eigenen Wert hat, er gleich dem allgemeinen ist oder die Branchen-Ampel in den Daten fehlt.
 */
export function eigenerBranchenwert(def: KpiDef, sector: string, kpi?: CompanyKpi): { label: string; source: 'branche' } | null {
  const rw = richtwertFor(def, sector, 'branche', kpi);
  const branche = def.richtwertBranche?.werte[sector];
  if (rw?.source !== 'branche' || !branche) return null;
  const gleich = branche.min === def.richtwert?.min && branche.max === def.richtwert?.max;
  return gleich ? null : { label: rw.label, source: 'branche' };
}
