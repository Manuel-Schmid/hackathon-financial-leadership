import type { CompanyKpi } from './types';

/** Kennzahl in vollständiger Form. Ohne ampelBranche (alte Daten) ist sie null, dann zeigt die App das Buch. */
export function normalizeKpi(k: Partial<CompanyKpi> & { value: number | null }): CompanyKpi {
  const ampel = k.ampel ?? 'grey';
  return { value: k.value, ampel, ampelBranche: k.ampelBranche ?? null, history: k.history ?? [] };
}
