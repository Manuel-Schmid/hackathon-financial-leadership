import { describe, expect, it } from 'vitest';
import { PROFILES } from './config';
import { CORNERS, pointToWeights, setAxisPercent, toPercents, weightsToPoint } from './triangle';
import type { Weights } from './weighting';

const sum = (w: Weights) => w.liquiditaet + w.rentabilitaet + w.sicherheit;

describe('Zieldreieck', () => {
  it('die Ecken stehen für 100 % einer Achse', () => {
    expect(pointToWeights(CORNERS.sicherheit)).toEqual({ liquiditaet: 0, rentabilitaet: 0, sicherheit: 1 });
    expect(pointToWeights(CORNERS.liquiditaet)).toEqual({ liquiditaet: 1, rentabilitaet: 0, sicherheit: 0 });
    expect(pointToWeights(CORNERS.rentabilitaet)).toEqual({ liquiditaet: 0, rentabilitaet: 1, sicherheit: 0 });
  });
  it('Gewichte und Punkt lassen sich hin und zurück rechnen', () => {
    const weights = { liquiditaet: 0.3, rentabilitaet: 0.5, sicherheit: 0.2 };
    const back = pointToWeights(weightsToPoint(weights));
    expect(back.liquiditaet).toBeCloseTo(0.3);
    expect(back.rentabilitaet).toBeCloseTo(0.5);
    expect(back.sicherheit).toBeCloseTo(0.2);
  });
  it('der Punkt folgt auch fremden Ecken, wie im Dreieck auf der Vergleichsseite', () => {
    const corners = {
      rentabilitaet: { x: 100, y: 0 },
      sicherheit: { x: 200, y: 150 },
      liquiditaet: { x: 0, y: 150 },
    };
    expect(weightsToPoint({ liquiditaet: 0, rentabilitaet: 1, sicherheit: 0 }, corners)).toEqual({ x: 100, y: 0 });
    expect(weightsToPoint({ liquiditaet: 0.5, rentabilitaet: 0, sicherheit: 0.5 }, corners)).toEqual({ x: 100, y: 150 });
    const middle = weightsToPoint({ liquiditaet: 1, rentabilitaet: 1, sicherheit: 1 }, corners);
    expect(middle.x).toBeCloseTo(100);
    expect(middle.y).toBeCloseTo(100);
  });
  it('ausserhalb des Dreiecks bleiben die Gewichte gültig', () => {
    for (const point of [{ x: -500, y: -500 }, { x: 900, y: 900 }, { x: 160, y: 900 }]) {
      const weights = pointToWeights(point);
      expect(sum(weights)).toBeCloseTo(1);
      expect(Math.min(...Object.values(weights))).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('Prozente', () => {
  it('ergeben immer genau 100', () => {
    expect(toPercents(PROFILES.ausgewogen)).toEqual({ liquiditaet: 34, rentabilitaet: 33, sicherheit: 33 });
    expect(toPercents({ liquiditaet: 1, rentabilitaet: 1, sicherheit: 1 })).toEqual({ liquiditaet: 34, rentabilitaet: 33, sicherheit: 33 });
  });
  it('eine Achse setzen: der Rest bleibt im Verhältnis', () => {
    const next = setAxisPercent({ liquiditaet: 0.2, rentabilitaet: 0.6, sicherheit: 0.2 }, 'sicherheit', 60);
    expect(next.sicherheit).toBeCloseTo(0.6);
    expect(next.liquiditaet).toBeCloseTo(0.1);
    expect(next.rentabilitaet).toBeCloseTo(0.3);
  });
  it('die eingegebene Zahl bleibt, auch wenn die anderen gerundet werden', () => {
    const next = setAxisPercent({ liquiditaet: 0.34, rentabilitaet: 0.33, sicherheit: 0.33 }, 'liquiditaet', 33);
    expect(toPercents(next).liquiditaet).toBe(33);
    expect(sum(next)).toBeCloseTo(1);
  });
  it('sind die anderen beide 0, teilen sie sich den Rest', () => {
    const next = setAxisPercent({ liquiditaet: 1, rentabilitaet: 0, sicherheit: 0 }, 'liquiditaet', 40);
    expect(next.rentabilitaet).toBeCloseTo(0.3);
    expect(next.sicherheit).toBeCloseTo(0.3);
  });
  it('unsinnige Eingaben werden begrenzt', () => {
    expect(setAxisPercent(PROFILES.ausgewogen, 'sicherheit', 300).sicherheit).toBe(1);
    expect(setAxisPercent(PROFILES.ausgewogen, 'sicherheit', Number.NaN).sicherheit).toBe(0);
  });
});
