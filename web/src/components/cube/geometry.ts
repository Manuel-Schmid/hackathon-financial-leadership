import type { Company } from '@/data/types';
import { FINANCIAL } from '@/lib/config';

/** Halbe Kantenlänge des Würfels in Szenen-Einheiten. */
export const HALF = 5;

export type Vec3 = [number, number, number];

/** Score 0–100 -> Szene. x = Liquidität, y = Rentabilität, z = Sicherheit (hoch = hinten). */
export function toWorld(l: number, r: number, s: number): Vec3 {
  return [(l - 50) / 10, (r - 50) / 10, -(s - 50) / 10];
}

/** Firmen ohne vollständige Scores haben keinen Platz im Würfel. Finanzsektor: Liquidität in der Mitte. */
export function companyPosition(company: Company): Vec3 | null {
  const { liquiditaet, rentabilitaet, sicherheit } = company.scores;
  const l = company.isFinancial ? (liquiditaet ?? FINANCIAL.liquiditaetDefault) : liquiditaet;
  if (l === null || rentabilitaet === null || sicherheit === null) return null;
  return toWorld(l, rentabilitaet, sicherheit);
}

/** Radius nach Börsenwert; Wurzel, damit Apple kleinere Firmen nicht erdrückt. */
export function pointRadius(marketCapUsd: number | null): number {
  const billions = (marketCapUsd ?? 0) / 1e9;
  return Math.min(0.07 + 0.0035 * Math.sqrt(billions), 0.34);
}
