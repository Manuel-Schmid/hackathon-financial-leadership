import type { AxisId } from '@/data/types';
import { AXIS_IDS } from './config';
import type { Weights } from './weighting';

export interface Point {
  x: number;
  y: number;
}

/**
 * Anordnung des Zieldreiecks, überall gleich (Profile und Vergleich):
 * Rentabilität oben, Sicherheit unten rechts, Liquidität unten links.
 * Reihenfolge im Uhrzeigersinn ab oben, so wie Recharts das Radar zeichnet.
 */
export const TRIANGLE_ORDER: AxisId[] = ['rentabilitaet', 'sicherheit', 'liquiditaet'];

/** Ecken des Zieldreiecks in SVG-Koordinaten: Je näher der Punkt an einer Ecke, desto mehr zählt diese Achse. */
export const CORNERS: Record<AxisId, Point> = {
  rentabilitaet: { x: 160, y: 30 },
  sicherheit: { x: 290, y: 255 },
  liquiditaet: { x: 30, y: 255 },
};

/** Ecken frei wählbar: Auch das Dreieck im Vergleich hat eigene Ecken und eine andere Anordnung. */
export function weightsToPoint(weights: Weights, corners: Record<AxisId, Point> = CORNERS): Point {
  const total = AXIS_IDS.reduce((sum, axis) => sum + weights[axis], 0) || 1;
  return AXIS_IDS.reduce(
    (p, axis) => ({
      x: p.x + (corners[axis].x * weights[axis]) / total,
      y: p.y + (corners[axis].y * weights[axis]) / total,
    }),
    { x: 0, y: 0 },
  );
}

/** Ganze Prozent, die immer genau 100 ergeben: Rest geht an die Achsen mit dem grössten Abgeschnittenen. */
export function toPercents(weights: Weights): Record<AxisId, number> {
  const total = AXIS_IDS.reduce((sum, axis) => sum + weights[axis], 0) || 1;
  const exact = AXIS_IDS.map((axis) => ({ axis, value: (weights[axis] / total) * 100 }));
  const result = Object.fromEntries(exact.map((e) => [e.axis, Math.floor(e.value)])) as Record<AxisId, number>;
  let rest = 100 - exact.reduce((sum, e) => sum + Math.floor(e.value), 0);
  for (const e of [...exact].sort((a, b) => b.value - Math.floor(b.value) - (a.value - Math.floor(a.value)))) {
    if (rest-- <= 0) break;
    result[e.axis] += 1;
  }
  return result;
}

function fromPercents(percents: Record<AxisId, number>): Weights {
  return Object.fromEntries(AXIS_IDS.map((axis) => [axis, percents[axis] / 100])) as Weights;
}

/** Punkt irgendwo im Bild -> Gewichte auf ganze Prozent. Ausserhalb bleibt der Punkt am Rand des Dreiecks. */
export function pointToWeights({ x, y }: Point): Weights {
  const { sicherheit: s, liquiditaet: l, rentabilitaet: r } = CORNERS;
  const det = (l.y - r.y) * (s.x - r.x) + (r.x - l.x) * (s.y - r.y);
  const raw: Weights = {
    sicherheit: ((r.y - l.y) * (x - r.x) + (l.x - r.x) * (y - r.y)) / -det,
    liquiditaet: ((r.y - s.y) * (x - r.x) + (s.x - r.x) * (y - r.y)) / det,
    rentabilitaet: 0,
  };
  raw.rentabilitaet = 1 - raw.sicherheit - raw.liquiditaet;
  const clamped = Object.fromEntries(AXIS_IDS.map((axis) => [axis, Math.max(0, raw[axis])])) as Weights;
  return fromPercents(toPercents(clamped));
}

/** Eine Achse direkt setzen: Die beiden anderen teilen sich den Rest im bisherigen Verhältnis. */
export function setAxisPercent(weights: Weights, axis: AxisId, percent: number): Weights {
  const value = Math.min(100, Math.max(0, Number.isFinite(percent) ? percent : 0));
  const others = AXIS_IDS.filter((a) => a !== axis);
  const otherSum = others.reduce((sum, a) => sum + weights[a], 0);
  const next = { [axis]: value / 100 } as Weights;
  for (const other of others) {
    const share = otherSum > 0 ? weights[other] / otherSum : 1 / others.length;
    next[other] = ((100 - value) / 100) * share;
  }
  const percents = toPercents(next);
  // Die eingegebene Zahl bleibt genau so stehen; gerundet wird nur bei den anderen.
  const drift = percents[axis] - value;
  percents[axis] = value;
  if (drift !== 0) {
    const biggest = others[percents[others[0]] >= percents[others[1]] ? 0 : 1];
    percents[biggest] += drift;
  }
  return fromPercents(percents);
}
