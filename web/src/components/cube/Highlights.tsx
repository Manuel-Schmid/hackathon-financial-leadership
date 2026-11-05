import { Html, Line } from '@react-three/drei';
import type { Company } from '@/data/types';
import { AXES, AXIS_IDS, SECTORS, THEME } from '@/lib/config';
import { formatScore } from '@/lib/format';
import { HALF } from './geometry';
import type { CubePoint } from './PointCloud';

/** Lot-Linien zum Boden und Namen: nur ausgewählte und Watchlist-Firmen, sonst wird es unlesbar. */
export function Highlights({ points, selected }: { points: CubePoint[]; selected: string | null }) {
  return (
    <>
      {points.map((p) => {
        const color = SECTORS[p.company.sector]?.color ?? THEME.cube.fallback;
        const isSelected = p.company.ticker === selected;
        const [x, y, z] = p.position;
        return (
          <group key={p.company.ticker}>
            <Line points={[p.position, [x, -HALF, z]]} color={color} lineWidth={1} dashed dashSize={0.1} gapSize={0.12} transparent opacity={0.6} />
            <mesh position={[x, -HALF, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.06, 12]} />
              <meshBasicMaterial color={color} transparent opacity={0.6} />
            </mesh>
            {isSelected && (
              <mesh position={p.position}>
                <sphereGeometry args={[p.radius + 0.14, 20, 20]} />
                <meshBasicMaterial color={THEME.accent.DEFAULT} transparent opacity={0.22} depthWrite={false} />
              </mesh>
            )}
            <Html position={[x + p.radius + 0.1, y, z]} zIndexRange={[8, 6]} className="pointer-events-none select-none" style={{ transform: 'translateY(-50%)' }}>
              <span
                className="whitespace-nowrap text-[12.5px] font-bold text-text"
                style={{ textShadow: '0 0 3px #fff, 0 0 3px #fff, 0 0 3px #fff' }}
              >
                {p.company.name}
              </span>
            </Html>
          </group>
        );
      })}
    </>
  );
}

export function HoverTip({ point }: { point: CubePoint }) {
  const company: Company = point.company;
  return (
    <Html position={point.position} zIndexRange={[20, 10]} className="pointer-events-none select-none" style={{ transform: 'translate(12px, -110%)' }}>
      <div className="card whitespace-nowrap px-3 py-2 text-xs shadow-pop">
        <b className="block text-[13px]">{company.name}</b>
        <div className="mt-1 flex gap-3 font-mono">
          {AXIS_IDS.map((axis) => (
            <span key={axis} style={{ color: AXES[axis].color }}>
              {AXES[axis].label[0]} {formatScore(company.scores[axis])}
            </span>
          ))}
        </div>
      </div>
    </Html>
  );
}
