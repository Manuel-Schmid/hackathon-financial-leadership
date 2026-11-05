import type { Ampel } from '@/data/types';

/** Die Ampel berechnet die Pipeline (scoring.py). Hier steht nur, wie sie aussieht. */
export const AMPEL_STYLE: Record<Ampel, { dot: string; label: string }> = {
  green: { dot: 'bg-good', label: 'Richtwert erfüllt' },
  yellow: { dot: 'bg-warn', label: 'bis 20 % neben dem Richtwert' },
  red: { dot: 'bg-bad', label: 'deutlich neben dem Richtwert' },
  grey: { dot: 'bg-line', label: 'kein Richtwert oder keine Daten' },
};
