import type { CompanyKpi } from './types';

/** Kennzahl in vollständiger Form. Ohne ampelBranche (alte Daten) gilt die Buch-Ampel. */
export function normalizeKpi(k: Partial<CompanyKpi> & { value: number | null }): CompanyKpi {
  const ampel = k.ampel ?? 'grey';
  return { value: k.value, ampel, ampelBranche: k.ampelBranche ?? ampel, history: k.history ?? [] };
}
