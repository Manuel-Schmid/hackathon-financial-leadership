import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useMemo, useState } from 'react';
import type { Company } from '@/data/types';
import { CubeFrame } from './CubeFrame';
import { Highlights, HoverTip } from './Highlights';
import { buildPoints, FinancialRings, PointCloud, type CubePoint } from './PointCloud';

interface Props {
  companies: Company[];
  visible: Set<string>;
  selected: string | null;
  highlighted: Set<string>;
  onSelect(ticker: string): void;
}

export function CubeCanvas({ companies, visible, selected, highlighted, onSelect }: Props) {
  const [hovered, setHovered] = useState<CubePoint | null>(null);
  const points = useMemo(() => buildPoints(companies, visible), [companies, visible]);
  const labelled = useMemo(
    () => points.filter((p) => p.company.ticker === selected || highlighted.has(p.company.ticker)),
    [points, selected, highlighted],
  );

  return (
    <Canvas
      camera={{ position: [-14, 10, 34], fov: 26 }}
      dpr={[1, 2]}
      flat // ohne Tone-Mapping: Branding- und Branchenfarben bleiben exakt
      style={{ cursor: hovered ? 'pointer' : 'grab' }}
      gl={{ antialias: true }}
    >
      <ambientLight intensity={2.2} />
      <directionalLight position={[6, 12, 10]} intensity={1.1} />
      <CubeFrame />
      <PointCloud points={points} onHover={setHovered} onSelect={onSelect} />
      <FinancialRings points={points} />
      <Highlights points={labelled} selected={selected} />
      {hovered && <HoverTip point={hovered} />}
      <OrbitControls enablePan={false} minDistance={12} maxDistance={70} target={[0, -1.8, 0]} />
    </Canvas>
  );
}
