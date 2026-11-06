import { describe, expect, it } from 'vitest';
import type { Company, CompanyKpi } from '@/data/types';
import { KPI_BY_ID } from './config';
import { missingReason } from './missingReason';

const ROE = KPI_BY_ID.get('roe')!;

function kpi(value: number | null, history: [number, number | null][] = []): CompanyKpi {
  return { value, ampel: 'grey', ampelBranche: 'grey', history: history.map(([year, v]) => ({ year, value: v })) };
}

function company(roe: number | null, equity: [number, number | null][]): Company {
  return {
    ticker: 'X', name: 'X', sector: 'Industrials', sectorDe: 'Industrie', index: 'SP500', country: 'US', currency: 'USD',
    marketCapUsd: 1e9, sizeClass: 'Small', isFinancial: false, fiscalYear: 2025,
    scores: { liquiditaet: 50, rentabilitaet: 50, sicherheit: 50 },
    kpis: { roe: kpi(roe), equity_ratio: kpi(equity[equity.length - 1]?.[1] ?? null, equity) },
  };
}

describe('Grund für leere Kennzahl', () => {
  it('ROE leer wegen negativem oder fast keinem Eigenkapital', () => {
    expect(missingReason(company(null, [[2024, 0.1], [2025, -0.03]]), ROE)).toBe('Nicht aussagekräftig: negatives Eigenkapital');
    expect(missingReason(company(null, [[2024, 0.1], [2025, 0.01]]), ROE)).toBe('Nicht aussagekräftig: EK-Quote unter 2 %');
    expect(missingReason(company(null, [[2024, -0.05], [2025, 0.2]]), ROE)).toBe('Nicht aussagekräftig: Eigenkapital im Vorjahr negativ');
  });
  it('kein Grund, wenn ein Wert da ist oder das Eigenkapital genügt', () => {
    expect(missingReason(company(0.2, [[2024, -0.05], [2025, -0.03]]), ROE)).toBeNull();
    expect(missingReason(company(null, [[2024, 0.3], [2025, 0.3]]), ROE)).toBeNull();
    expect(missingReason(company(null, [[2024, -0.05], [2025, -0.03]]), KPI_BY_ID.get('roa')!)).toBeNull();
  });
});
