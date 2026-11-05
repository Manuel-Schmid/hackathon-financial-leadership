import { PerspectiveCamera, Vector3 } from 'three';
import { HALF } from './geometry';

export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Freizuhaltende Ränder in Pixeln: oben Beschriftung Ideal-Ecke, unten Legende, seitlich Achsen-Namen. */
export const CUBE_INSETS: Insets = { top: 48, right: 30, bottom: 125, left: 150 };

const CORNERS = [-1, 1].flatMap((x) => [-1, 1].flatMap((y) => [-1, 1].map((z) => new Vector3(x * HALF, y * HALF, z * HALF))));

/** Passt der Würfel aus diesem Abstand in den freien Bereich? */
function fits(camera: PerspectiveCamera, direction: Vector3, distance: number, width: number, height: number, insets: Insets): boolean {
  camera.position.copy(direction).multiplyScalar(distance);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  const freeWidth = width - insets.left - insets.right;
  const freeHeight = height - insets.top - insets.bottom;
  return CORNERS.every((corner) => {
    const point = corner.clone().project(camera);
    return Math.abs((point.x * width) / 2) <= freeWidth / 2 && Math.abs((point.y * height) / 2) <= freeHeight / 2;
  });
}

/** Kleinster Kameraabstand, bei dem der ganze Würfel im freien Bereich liegt. */
export function fitDistance(cameraDirection: Vector3, fov: number, width: number, height: number, insets: Insets = CUBE_INSETS): number {
  const camera = new PerspectiveCamera(fov, width / Math.max(height, 1), 0.1, 1000);
  const direction = cameraDirection.clone().normalize();
  let near = 10;
  let far = 400;
  for (let i = 0; i < 30; i += 1) {
    const middle = (near + far) / 2;
    if (fits(camera, direction, middle, width, height, insets)) far = middle;
    else near = middle;
  }
  return far;
}

/** Verschiebt den Bildausschnitt so, dass die Würfelmitte in der Mitte des freien Bereichs liegt. */
export function viewOffset(insets: Insets = CUBE_INSETS): { x: number; y: number } {
  return { x: (insets.right - insets.left) / 2, y: (insets.bottom - insets.top) / 2 };
}
