import type { AxisId, AxisScores, InvestorProfile } from '@/data/types';
import { AXIS_IDS, PROFILES } from './config';

export type Weights = Record<AxisId, number>;
/** Feste Vorlage (id aus config/kpis.json) oder frei gewählte Gewichte eines eigenen Profils. */
export type ProfileRef = InvestorProfile | Weights;

function weightsOf(profile: ProfileRef): Weights {
  return typeof profile === 'string' ? PROFILES[profile] : profile;
}

/**
 * Gesamt-Score = gewichteter Durchschnitt der vorhandenen Achsen.
 * Fehlt eine Achse (Finanzsektor: Liquidität), wird die Gewichtung auf die übrigen verteilt.
 */
export function totalScore(scores: AxisScores, profile: ProfileRef = 'ausgewogen'): number | null {
  const weights = weightsOf(profile);
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

export function profileLabel(profile: ProfileRef): string {
  const weights = weightsOf(profile);
  const part = (axis: AxisId, short: string) => `${short} ${Math.round(weights[axis] * 100)}`;
  return `${part('liquiditaet', 'L')} / ${part('rentabilitaet', 'R')} / ${part('sicherheit', 'S')}`;
}
