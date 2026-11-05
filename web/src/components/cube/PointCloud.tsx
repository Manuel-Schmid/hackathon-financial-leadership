import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { Color, Object3D, type InstancedMesh } from 'three';
import type { Company } from '@/data/types';
import { SECTORS } from '@/lib/config';
import { companyPosition, pointRadius, type Vec3 } from './geometry';

const DIMMED = new Color('#E3E8EF');
const WHITE = new Color('#FFFFFF');
const dummy = new Object3D();

export interface CubePoint {
  company: Company;
  position: Vec3;
  radius: number;
  visible: boolean;
}

export function buildPoints(companies: Company[], visible: Set<string>): CubePoint[] {
  const points: CubePoint[] = [];
  for (const company of companies) {
    const position = companyPosition(company);
    if (position) {
      points.push({ company, position, radius: pointRadius(company.marketCapUsd), visible: visible.has(company.ticker) });
    }
  }
  return points;
}

interface Props {
  points: CubePoint[];
  onHover(point: CubePoint | null): void;
  onSelect(ticker: string): void;
}

/** Alle Punkte in einem InstancedMesh: 550 Firmen bleiben so flüssig. */
export function PointCloud({ points, onHover, onSelect }: Props) {
  const ref = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    points.forEach((p, i) => {
      dummy.position.set(...p.position);
      dummy.quaternion.identity();
      dummy.scale.setScalar(p.visible ? p.radius : p.radius * 0.5);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      const color = !p.visible
        ? DIMMED
        : p.company.isFinancial
          ? WHITE
          : new Color(SECTORS[p.company.sector]?.color ?? '#7C8799');
      mesh.setColorAt(i, color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [points]);

  const pointAt = (e: ThreeEvent<PointerEvent | MouseEvent>): CubePoint | null => {
    const point = e.instanceId === undefined ? null : points[e.instanceId];
    return point?.visible ? point : null;
  };

  return (
    <instancedMesh
      // Anzahl ist beim Erzeugen fix, darum neues Mesh bei anderer Anzahl
      key={points.length}
      ref={ref}
      args={[undefined, undefined, points.length]}
      onPointerMove={(e) => {
        const point = pointAt(e);
        if (point) {
          e.stopPropagation();
          onHover(point);
        }
      }}
      onPointerOut={() => onHover(null)}
      onClick={(e) => {
        const point = pointAt(e);
        // delta: Maus zwischen Drücken und Loslassen bewegt = Drehen, kein Klick
        if (point && e.delta < 5) {
          e.stopPropagation();
          onSelect(point.company.ticker);
        }
      }}
    >
      <sphereGeometry args={[1, 14, 14]} />
      <meshStandardMaterial roughness={0.55} />
    </instancedMesh>
  );
}

/** Ringe um den Finanzsektor (hohle Punkte); drehen sich immer zur Kamera. */
export function FinancialRings({ points }: { points: CubePoint[] }) {
  const ref = useRef<InstancedMesh>(null);
  const rings = useMemo(() => points.filter((p) => p.company.isFinancial && p.visible), [points]);
  const color = SECTORS.Financials?.color ?? '#7C8799';

  useFrame(({ camera }) => {
    const mesh = ref.current;
    if (!mesh) return;
    rings.forEach((p, i) => {
      dummy.position.set(...p.position);
      dummy.quaternion.copy(camera.quaternion);
      dummy.scale.setScalar(p.radius * 1.05);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  if (!rings.length) return null;
  return (
    <instancedMesh key={rings.length} ref={ref} args={[undefined, undefined, rings.length]} raycast={() => null}>
      <torusGeometry args={[1, 0.2, 8, 28]} />
      <meshBasicMaterial color={color} />
    </instancedMesh>
  );
}
