import type { AxisId, AxisScores, InvestorProfile } from '@/data/types';
import { AXIS_IDS, PROFILES } from './config';

/**
 * Gesamt-Score = gewichteter Durchschnitt der vorhandenen Achsen.
 * Fehlt eine Achse (Finanzsektor: Liquidität), wird die Gewichtung auf die übrigen verteilt.
 */
export function totalScore(scores: AxisScores, profile: InvestorProfile = 'ausgewogen'): number | null {
  const weights = PROFILES[profile];
  let sum = 0;
  let weight = 0;
  for (const axis of AXIS_IDS) {
    const score = scores[axis];
    if (score !== null) {
      sum += score * weights[axis];
      weight += weights[axis];
    }
  }
  return weight > 0 ? sum / weight : null;
}

export function profileLabel(profile: InvestorProfile): string {
  const weights = PROFILES[profile];
  const part = (axis: AxisId, short: string) => `${short} ${Math.round(weights[axis] * 100)}`;
  return `${part('liquiditaet', 'L')} / ${part('rentabilitaet', 'R')} / ${part('sicherheit', 'S')}`;
}
