import { describe, expect, it } from 'vitest';
import type { Company } from '@/data/types';
import { axisTicks, companyYears, formatAxisTick, historyForYears } from './chartAxis';

describe('axisTicks', () => {
  it('beginnt bei positiven Werten immer bei null', () => {
    expect(axisTicks([0.58, 0.63])).toEqual([0, 0.25, 0.5, 0.75]);
  });
  it('umfasst den höchsten und tiefsten Wert', () => {
    for (const values of [[1.31, 0.9], [38.2, 171], [0.0021, 0.0034], [43e6, 300e6], [1200e9]]) {
      const ticks = axisTicks(values);
      expect(ticks[0]).toBeLessThanOrEqual(Math.min(0, ...values));
      expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(Math.max(...values));
      expect(ticks.length).toBeLessThanOrEqual(5);
    }
  });
  it('zeigt negative Werte und die Null', () => {
    const ticks = axisTicks([-34, 3]);
    expect(ticks[0]).toBeLessThanOrEqual(-34);
    expect(ticks).toContain(0);
    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(3);
  });
  it('kommt mit lauter Nullen und ohne Werte zurecht', () => {
    expect(axisTicks([0, 0])).toEqual([0, 1]);
    expect(axisTicks([])).toEqual([0, 1]);
  });
  it('liefert keine Rundungsreste', () => {
    expect(axisTicks([0.3])).toEqual([0, 0.1, 0.2, 0.3]);
  });
});

describe('formatAxisTick', () => {
  it('kürzt je nach Einheit', () => {
    expect(formatAxisTick(0.25, 'pct')).toBe('25 %');
    expect(formatAxisTick(0.025, 'pct')).toBe('2.5 %');
    expect(formatAxisTick(-1, 'pct')).toBe('−100 %');
    expect(formatAxisTick(300e6, 'currency')).toBe('300 Mio.');
    expect(formatAxisTick(2e9, 'currency')).toBe('2 Mrd.');
    expect(formatAxisTick(0, 'currency')).toBe('0');
    expect(formatAxisTick(5, 'years')).toBe('5 J.');
    expect(formatAxisTick(80, 'factor')).toBe('80×');
  });
});

describe('Jahresachse', () => {
  const company = {
    kpis: {
      a: { value: 1, ampel: 'grey', history: [{ year: 2021, value: null }, { year: 2022, value: 1 }, { year: 2023, value: 2 }] },
      b: { value: 1, ampel: 'grey', history: [{ year: 2021, value: null }, { year: 2022, value: null }, { year: 2023, value: 3 }] },
    },
  } as unknown as Company;

  it('lässt Jahre ohne jeden Wert weg', () => {
    expect(companyYears(company)).toEqual([2022, 2023]);
  });
  it('gibt jeder Kennzahl dieselben Jahre, Lücken bleiben leer', () => {
    expect(historyForYears(company.kpis.b.history, [2022, 2023])).toEqual([
      { year: 2022, value: null },
      { year: 2023, value: 3 },
    ]);
  });
});
