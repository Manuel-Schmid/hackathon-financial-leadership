import type { AxisId, Company } from '@/data/types';
import { KPIS } from './config';

const AXIS_SENTENCE: Record<AxisId, string> = {
  sicherheit: 'am sichersten',
  rentabilitaet: 'am rentabelsten',
  liquiditaet: 'am liquidesten',
};

/** Regelbasiertes Kurzfazit: beste Firma pro Achse, dann wer wo unter den Richtwerten liegt. */
export function buildFazit(companies: Company[]): string {
  if (companies.length < 2) return 'Für ein Fazit braucht es mindestens zwei Unternehmen.';
  const parts: string[] = [];

  for (const axis of Object.keys(AXIS_SENTENCE) as AxisId[]) {
    const scored = companies.filter((c) => c.scores[axis] !== null);
    if (!scored.length) continue;
    const best = scored.reduce((a, b) => ((b.scores[axis] as number) > (a.scores[axis] as number) ? b : a));
    parts.push(`${best.name} ist in dieser Auswahl ${AXIS_SENTENCE[axis]} (Score ${Math.round(best.scores[axis] as number)}).`);
  }

  const redCounts = companies.map((c) => ({
    company: c,
    red: KPIS.filter((k) => c.kpis[k.id]?.ampel === 'red').map((k) => k.short),
  }));
  const worst = redCounts.reduce((a, b) => (b.red.length > a.red.length ? b : a));
  if (worst.red.length) {
    parts.push(`${worst.company.name} verfehlt am meisten Richtwerte deutlich: ${worst.red.join(', ')}.`);
  }
  if (companies.some((c) => c.isFinancial)) {
    parts.push('Banken und Versicherungen sind nur eingeschränkt vergleichbar.');
  }
  return parts.join(' ');
}
