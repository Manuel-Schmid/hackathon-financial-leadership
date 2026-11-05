import { describe, expect, it } from 'vitest';
import { normalizeKpi } from './normalize';

describe('normalizeKpi', () => {
  it('fällt ohne ampelBranche auf die Buch-Ampel zurück (alte Daten, Supabase ohne Spalte)', () => {
    expect(normalizeKpi({ value: 1, ampel: 'red', history: [] }).ampelBranche).toBe('red');
  });

  it('behält eine vorhandene Branchen-Ampel', () => {
    expect(normalizeKpi({ value: 1, ampel: 'red', ampelBranche: 'green', history: [] }).ampelBranche).toBe('green');
  });

  it('setzt fehlende Felder auf neutrale Werte', () => {
    expect(normalizeKpi({ value: null })).toEqual({ value: null, ampel: 'grey', ampelBranche: 'grey', history: [] });
  });
});
