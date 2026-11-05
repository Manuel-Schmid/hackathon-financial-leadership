import { describe, expect, it } from 'vitest';
import { clampOffset, KEEP_VISIBLE } from './useDragOffset';

const FRAME = { left: 0, top: 0, right: 1000, bottom: 700 };
const CARD = { left: 670, top: 16, right: 980, bottom: 416 };
const NONE = { x: 0, y: 0 };

describe('clampOffset', () => {
  it('lässt freie Verschiebung im Rahmen zu', () => {
    expect(clampOffset({ x: -300, y: 100 }, NONE, CARD, FRAME)).toEqual({ x: -300, y: 100 });
  });
  it('erlaubt das Hinausschieben, ein Rest bleibt rechts und links sichtbar', () => {
    const right = clampOffset({ x: 5000, y: 0 }, NONE, CARD, FRAME);
    expect(CARD.left + right.x).toBe(FRAME.right - KEEP_VISIBLE.x);
    const left = clampOffset({ x: -5000, y: 0 }, NONE, CARD, FRAME);
    expect(CARD.right + left.x).toBe(FRAME.left + KEEP_VISIBLE.x);
  });
  it('erlaubt das Hinausschieben nach unten, der Griff bleibt sichtbar', () => {
    const down = clampOffset({ x: 0, y: 5000 }, NONE, CARD, FRAME);
    expect(CARD.top + down.y).toBe(FRAME.bottom - KEEP_VISIBLE.y);
  });
  it('lässt den Griff nicht oben hinaus', () => {
    expect(clampOffset({ x: 0, y: -500 }, NONE, CARD, FRAME).y).toBe(-16);
  });
  it('rechnet von der aktuellen Lage aus', () => {
    const moved = { left: 370, top: 116, right: 680, bottom: 516 };
    const result = clampOffset({ x: -5000, y: 5000 }, { x: -300, y: 100 }, moved, FRAME);
    expect(moved.right + (result.x + 300)).toBe(KEEP_VISIBLE.x);
    expect(moved.top + (result.y - 100)).toBe(FRAME.bottom - KEEP_VISIBLE.y);
  });
});
