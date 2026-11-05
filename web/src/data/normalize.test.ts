import { describe, expect, it } from 'vitest';
import { normalizeKpi } from './normalize';

describe('normalizeKpi', () => {
  it('ohne ampelBranche (alte Daten, Supabase ohne Spalte) ist die Branchen-Ampel unbekannt', () => {
    expect(normalizeKpi({ value: 1, ampel: 'red', history: [] }).ampelBranche).toBeNull();
  });

  it('behält eine vorhandene Branchen-Ampel', () => {
    expect(normalizeKpi({ value: 1, ampel: 'red', ampelBranche: 'green', history: [] }).ampelBranche).toBe('green');
  });

  it('setzt fehlende Felder auf neutrale Werte', () => {
    expect(normalizeKpi({ value: null })).toEqual({ value: null, ampel: 'grey', ampelBranche: null, history: [] });
  });
});
