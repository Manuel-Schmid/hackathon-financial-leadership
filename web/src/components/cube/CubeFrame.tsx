import { Html, Line } from '@react-three/drei';
import { DoubleSide } from 'three';
import { AXES, THEME } from '@/lib/config';
import { HALF, toWorld, type Vec3 } from './geometry';

const GRID = THEME.line.DEFAULT;
const EDGE = THEME.line.strong;
const TICKS = [0, 50, 100];

function Label({ position, children, className }: { position: Vec3; children: React.ReactNode; className: string }) {
  return (
    <Html position={position} center zIndexRange={[5, 0]} className="pointer-events-none select-none">
      <span className={`whitespace-nowrap ${className}`}>{children}</span>
    </Html>
  );
}

function Grids() {
  const lines: [Vec3, Vec3][] = [];
  for (const v of [0, 25, 50, 75, 100]) {
    lines.push([toWorld(v, 0, 0), toWorld(v, 0, 100)]); // Boden
    lines.push([toWorld(0, 0, v), toWorld(100, 0, v)]);
    lines.push([toWorld(v, 0, 100), toWorld(v, 100, 100)]); // Rückwand
    lines.push([toWorld(0, v, 100), toWorld(100, v, 100)]);
    lines.push([toWorld(0, v, 0), toWorld(0, v, 100)]); // linke Wand
    lines.push([toWorld(0, 0, v), toWorld(0, 100, v)]);
  }
  return (
    <>
      {lines.map((points, i) => (
        <Line key={i} points={points} color={GRID} lineWidth={0.7} />
      ))}
    </>
  );
}

export function CubeFrame() {
  const dashed: [Vec3, Vec3][] = [
    [toWorld(100, 100, 100), toWorld(0, 100, 100)],
    [toWorld(100, 100, 100), toWorld(100, 0, 100)],
    [toWorld(100, 100, 100), toWorld(100, 100, 0)],
    [toWorld(100, 0, 0), toWorld(100, 100, 0)],
    [toWorld(100, 0, 0), toWorld(100, 0, 100)],
    [toWorld(0, 100, 0), toWorld(100, 100, 0)],
    [toWorld(0, 100, 0), toWorld(0, 100, 100)],
  ];
  const origin = toWorld(0, 0, 0);
  const ideal = toWorld(100, 100, 100);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -HALF - 0.01, 0]}>
        <planeGeometry args={[HALF * 2, HALF * 2]} />
        <meshBasicMaterial color={THEME.cube.floor} side={DoubleSide} />
      </mesh>
      <Grids />
      {dashed.map((points, i) => (
        <Line key={i} points={points} color={EDGE} lineWidth={1} dashed dashSize={0.2} gapSize={0.2} />
      ))}

      <Line points={[origin, toWorld(100, 0, 0)]} color={AXES.liquiditaet.color} lineWidth={3.5} />
      <Line points={[origin, toWorld(0, 100, 0)]} color={AXES.rentabilitaet.color} lineWidth={3.5} />
      <Line points={[origin, toWorld(0, 0, 100)]} color={AXES.sicherheit.color} lineWidth={3.5} />

      {/* Finanzsektor liegt fest auf Liquidität 50: gestrichelte Markierung am Boden */}
      <Line
        points={[toWorld(50, 0, 0), toWorld(50, 0, 100)]}
        color={THEME.cube.fallback}
        lineWidth={1.2}
        dashed
        dashSize={0.15}
        gapSize={0.15}
      />

      <Label position={[0, -HALF - 1, HALF + 0.3]} className="font-title text-sm font-bold text-L">
        LIQUIDITÄT
      </Label>
      <Label position={[-HALF - 1.2, 0, HALF]} className="font-title text-sm font-bold text-R-text">
        RENTABILITÄT
      </Label>
      <Label position={[-HALF - 1, -HALF - 0.5, 0]} className="font-title text-sm font-bold text-S">
        SICHERHEIT
      </Label>

      {TICKS.map((v) => (
        <group key={v}>
          <Label position={[(v - 50) / 10, -HALF - 0.45, HALF + 0.2]} className="font-mono text-[11px] text-muted">{v}</Label>
          <Label position={[-HALF - 0.4, (v - 50) / 10, HALF]} className="font-mono text-[11px] text-muted">{v}</Label>
          {v > 0 && (
            <Label position={[-HALF - 0.4, -HALF - 0.2, -(v - 50) / 10]} className="font-mono text-[11px] text-muted">{v}</Label>
          )}
        </group>
      ))}

      <mesh position={ideal}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshBasicMaterial color={THEME.accent.DEFAULT} transparent opacity={0.12} depthWrite={false} />
      </mesh>
      <Label position={[ideal[0], ideal[1] + 0.85, ideal[2]]} className="text-xs font-bold text-accent">
        Ideal-Ecke 100·100·100
      </Label>
    </group>
  );
}
