import { useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from 'react';

export interface Offset {
  x: number;
  y: number;
}

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const KEY_STEP = 24;
const KEYS: Record<string, Offset> = {
  ArrowLeft: { x: -KEY_STEP, y: 0 },
  ArrowRight: { x: KEY_STEP, y: 0 },
  ArrowUp: { x: 0, y: -KEY_STEP },
  ArrowDown: { x: 0, y: KEY_STEP },
};

/** So viel bleibt mindestens im Rahmen, damit man die Karte am Griff zurückholen kann. */
export const KEEP_VISIBLE = { x: 110, y: 52 };

/**
 * Begrenzt die Verschiebung: Seitlich und nach unten darf das Element aus dem Rahmen laufen und wird dort
 * abgeschnitten, ein Rest bleibt aber sichtbar. Nach oben nicht, weil dort der Griff sitzt.
 */
export function clampOffset(wanted: Offset, current: Offset, element: Rect, frame: Rect, keep: Offset = KEEP_VISIBLE): Offset {
  const height = element.bottom - element.top;
  const minX = current.x + frame.left - element.right + keep.x;
  const maxX = current.x + frame.right - element.left - keep.x;
  const minY = current.y + frame.top - element.top;
  const maxY = current.y + frame.bottom - element.top - Math.min(keep.y, height);
  return {
    x: Math.min(maxX, Math.max(minX, wanted.x)),
    y: Math.min(maxY, Math.max(minY, wanted.y)),
  };
}

/** Macht ein Element mit Griff verschiebbar, innerhalb seines positionierten Elternelements. */
export function useDragOffset<T extends HTMLElement>(ref: RefObject<T>) {
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const drag = useRef<{ pointerX: number; pointerY: number; origin: Offset; element: Rect; frame: Rect } | null>(null);

  const measure = () => {
    const element = ref.current?.getBoundingClientRect();
    const frame = (ref.current?.offsetParent ?? ref.current?.parentElement)?.getBoundingClientRect();
    return element && frame ? { element, frame } : null;
  };

  const handleProps = {
    onPointerDown(e: PointerEvent<HTMLElement>) {
      const box = measure();
      if (e.button !== 0 || !box) return;
      drag.current = { pointerX: e.clientX, pointerY: e.clientY, origin: offset, ...box };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove(e: PointerEvent<HTMLElement>) {
      const d = drag.current;
      if (!d) return;
      const wanted = { x: d.origin.x + e.clientX - d.pointerX, y: d.origin.y + e.clientY - d.pointerY };
      setOffset(clampOffset(wanted, d.origin, d.element, d.frame));
    },
    onPointerUp() {
      drag.current = null;
    },
    onPointerCancel() {
      drag.current = null;
    },
    onKeyDown(e: KeyboardEvent<HTMLElement>) {
      const step = KEYS[e.key];
      const box = measure();
      if (!step || !box) return;
      e.preventDefault();
      setOffset(clampOffset({ x: offset.x + step.x, y: offset.y + step.y }, offset, box.element, box.frame));
    },
  };

  return { offset, handleProps };
}
