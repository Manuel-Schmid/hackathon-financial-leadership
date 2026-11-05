import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { PerspectiveCamera, Vector3 } from 'three';
import type { Company } from '@/data/types';
import { CUBE_INSETS, fitDistance, viewOffset } from './cameraFit';
import { CubeFrame } from './CubeFrame';
import { Highlights, HoverTip } from './Highlights';
import { buildPoints, FinancialRings, PointCloud, type CubePoint } from './PointCloud';

interface Props {
  companies: Company[];
  visible: Set<string>;
  selected: string | null;
  highlighted: Set<string>;
  onSelect(ticker: string): void;
  onDeselect(): void;
}

const CAMERA_DIRECTION = new Vector3(-14, 10, 34);
const FOV = 26;

/** Passt den Würfel in den Bereich zwischen Titel und Legende, solange niemand selbst gedreht oder gezoomt hat. */
function FitCamera({ userMoved }: { userMoved: MutableRefObject<boolean> }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as { update(): void } | null;
  const { width, height } = useThree((s) => s.size);

  useLayoutEffect(() => {
    if (!(camera instanceof PerspectiveCamera) || width === 0 || height === 0) return;
    const offset = viewOffset();
    camera.setViewOffset(width, height, offset.x, offset.y, width, height);
    if (!userMoved.current) {
      const distance = fitDistance(CAMERA_DIRECTION, FOV, width, height, CUBE_INSETS);
      camera.position.copy(CAMERA_DIRECTION).normalize().multiplyScalar(distance);
      camera.lookAt(0, 0, 0);
      controls?.update();
    }
    camera.updateProjectionMatrix();
  }, [camera, controls, width, height, userMoved]);

  return null;
}

export function CubeCanvas({ companies, visible, selected, highlighted, onSelect, onDeselect }: Props) {
  const [hovered, setHovered] = useState<CubePoint | null>(null);
  const userMoved = useRef(false);
  const points = useMemo(() => buildPoints(companies, visible, selected), [companies, visible, selected]);
  const hasSelection = points.some((p) => p.company.ticker === selected);
  const labelled = useMemo(
    // Mit Auswahl zählt nur sie: Namen der Watchlist würden das Ausgrauen wieder aufheben.
    () => points.filter((p) => (hasSelection ? p.company.ticker === selected : highlighted.has(p.company.ticker))),
    [points, selected, highlighted, hasSelection],
  );

  return (
    <Canvas
      camera={{ position: [CAMERA_DIRECTION.x, CAMERA_DIRECTION.y, CAMERA_DIRECTION.z], fov: FOV }}
      dpr={[1, 2]}
      flat // ohne Tone-Mapping: Branding- und Branchenfarben bleiben exakt
      style={{ cursor: hovered ? 'pointer' : 'grab' }}
      gl={{ antialias: true }}
      onPointerMissed={onDeselect}
    >
      <ambientLight intensity={2.2} />
      <directionalLight position={[6, 12, 10]} intensity={1.1} />
      <CubeFrame />
      <PointCloud points={points} onHover={setHovered} onSelect={onSelect} />
      <FinancialRings points={points} />
      <Highlights points={labelled} selected={selected} />
      {hovered && <HoverTip point={hovered} />}
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={12}
        maxDistance={150}
        target={[0, 0, 0]}
        onStart={() => {
          userMoved.current = true;
        }}
      />
      <FitCamera userMoved={userMoved} />
    </Canvas>
  );
}
