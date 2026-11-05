import { useId, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import type { AxisId } from '@/data/types';
import { AXES, AXIS_IDS, AXIS_STYLE } from '@/lib/config';
import { CORNERS, pointToWeights, toPercents, weightsToPoint, type Point } from '@/lib/triangle';
import type { Weights } from '@/lib/weighting';

const VIEW = { width: 320, height: 285 };
const OUTLINE = AXIS_IDS.map((axis) => `${CORNERS[axis].x},${CORNERS[axis].y}`).join(' ');
const KEY_STEP = 4;
const ARROWS: Record<string, Point> = {
  ArrowUp: { x: 0, y: -KEY_STEP },
  ArrowDown: { x: 0, y: KEY_STEP },
  ArrowLeft: { x: -KEY_STEP, y: 0 },
  ArrowRight: { x: KEY_STEP, y: 0 },
};

function middle(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/** Jede Ecke leuchtet in ihrer Achsenfarbe und läuft zur Gegenseite aus. */
function TriangleFill() {
  const prefix = useId().replace(/:/g, '');
  return (
    <>
      <defs>
        {AXIS_IDS.map((axis) => {
          const [a, b] = AXIS_IDS.filter((other) => other !== axis);
          const end = middle(CORNERS[a], CORNERS[b]);
          return (
            <linearGradient
              key={axis}
              id={`${prefix}-${axis}`}
              gradientUnits="userSpaceOnUse"
              x1={CORNERS[axis].x}
              y1={CORNERS[axis].y}
              x2={end.x}
              y2={end.y}
            >
              <stop offset="0" stopColor={AXES[axis].color} stopOpacity=".42" />
              <stop offset="1" stopColor={AXES[axis].color} stopOpacity="0" />
            </linearGradient>
          );
        })}
      </defs>
      <polygon points={OUTLINE} fill="#fff" />
      {AXIS_IDS.map((axis) => <polygon key={axis} points={OUTLINE} fill={`url(#${prefix}-${axis})`} />)}
    </>
  );
}

/** Kleines Dreieck für die Karten in der Galerie. */
export function MiniTriangle({ weights }: { weights: Weights }) {
  const point = weightsToPoint(weights);
  return (
    <svg aria-hidden="true" viewBox="20 20 280 245" className="h-[50px] w-[57px] shrink-0">
      <TriangleFill />
      <polygon points={OUTLINE} fill="none" stroke="currentColor" strokeOpacity=".22" strokeWidth="5" strokeLinejoin="round" />
      <circle cx={point.x} cy={point.y} r="26" fill="currentColor" stroke="#fff" strokeWidth="9" className="text-ink" />
    </svg>
  );
}

function CornerLabel({ axis, percent, x, y, anchor }: { axis: AxisId; percent: number; x: number; y: number; anchor: 'start' | 'middle' | 'end' }) {
  return (
    <text x={x} y={y} textAnchor={anchor} className={`fill-current text-[13px] font-bold ${AXIS_STYLE[axis].text}`}>
      {AXES[axis].label} {percent} %
    </text>
  );
}

interface Props {
  weights: Weights;
  onChange(next: Weights): void;
}

/** Punkt ziehen oder Pfeiltasten: Die Gewichte ergeben dadurch automatisch immer 100 %. */
export function WeightTriangle({ weights, onChange }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const point = weightsToPoint(weights);
  const percents = toPercents(weights);
  const { sicherheit: top, liquiditaet: left, rentabilitaet: right } = CORNERS;

  const moveTo = (e: PointerEvent<SVGSVGElement>) => {
    const rect = svg.current?.getBoundingClientRect();
    if (!rect) return;
    onChange(
      pointToWeights({
        x: ((e.clientX - rect.left) / rect.width) * VIEW.width,
        y: ((e.clientY - rect.top) / rect.height) * VIEW.height,
      }),
    );
  };

  const onKeyDown = (e: KeyboardEvent<SVGCircleElement>) => {
    const step = ARROWS[e.key];
    if (!step) return;
    e.preventDefault();
    onChange(pointToWeights({ x: point.x + step.x, y: point.y + step.y }));
  };

  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
      className="w-full cursor-crosshair touch-none select-none"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        moveTo(e);
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) moveTo(e);
      }}
    >
      <TriangleFill />
      {/* Hilfslinien: Innerhalb des mittleren Dreiecks hat keine Achse mehr als die Hälfte. */}
      <polygon
        points={[middle(top, left), middle(left, right), middle(top, right)].map((p) => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke="currentColor"
        strokeOpacity=".14"
        className="text-ink"
      />
      <polygon points={OUTLINE} fill="none" stroke="currentColor" strokeOpacity=".28" strokeWidth="1.5" strokeLinejoin="round" className="text-ink" />
      <CornerLabel axis="sicherheit" percent={percents.sicherheit} x={top.x} y={18} anchor="middle" />
      <CornerLabel axis="liquiditaet" percent={percents.liquiditaet} x={4} y={277} anchor="start" />
      <CornerLabel axis="rentabilitaet" percent={percents.rentabilitaet} x={316} y={277} anchor="end" />
      <circle
        role="slider"
        tabIndex={0}
        aria-label="Gewichtung im Zieldreieck, mit den Pfeiltasten verschieben"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percents.rentabilitaet}
        aria-valuetext={`Liquidität ${percents.liquiditaet} %, Rentabilität ${percents.rentabilitaet} %, Sicherheit ${percents.sicherheit} %`}
        cx={point.x}
        cy={point.y}
        r="11"
        stroke="#fff"
        strokeWidth="3.5"
        className="cursor-grab fill-ink outline-none drop-shadow active:cursor-grabbing"
        onKeyDown={onKeyDown}
      />
    </svg>
  );
}
