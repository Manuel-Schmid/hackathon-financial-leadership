import type { Company } from '@/data/types';
import type { KpiDef } from './config';

/**
 * Warum eine Kennzahl leer ist, wenn sie bewusst unterdrückt wurde (wie kpis.py):
 * ROE braucht mindestens 2 % EK-Quote im aktuellen und im Vorjahr, sonst verzerrt der Nenner extrem.
 */
export function missingReason(company: Company, def: KpiDef): string | null {
  const min = def.minEquityRatio;
  if (min === undefined || company.kpis[def.id]?.value != null) return null;
  const history = company.kpis.equity_ratio?.history ?? [];
  const ratioIn = (year: number) => history.find((p) => p.year === year)?.value ?? null;
  const limit = `${Math.round(min * 100)} %`;
  const now = ratioIn(company.fiscalYear);
  if (now !== null && now < min) return now < 0 ? 'Nicht aussagekräftig: negatives Eigenkapital' : `Nicht aussagekräftig: EK-Quote unter ${limit}`;
  const before = ratioIn(company.fiscalYear - 1);
  if (before !== null && before < min) return before < 0 ? 'Nicht aussagekräftig: Eigenkapital im Vorjahr negativ' : `Nicht aussagekräftig: EK-Quote im Vorjahr unter ${limit}`;
  return null;
}
