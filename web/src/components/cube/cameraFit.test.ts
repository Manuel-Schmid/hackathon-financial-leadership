import { PerspectiveCamera, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { CUBE_INSETS, fitDistance, viewOffset } from './cameraFit';
import { HALF } from './geometry';

const DIRECTION = new Vector3(-14, 10, 34);
const FOV = 26;

/** Rechnet wie die App: Kamera einpassen, Bild verschieben, dann jede Würfelecke in Pixel umrechnen. */
function cornerPixels(width: number, height: number) {
  const distance = fitDistance(DIRECTION, FOV, width, height);
  const camera = new PerspectiveCamera(FOV, width / height, 0.1, 1000);
  const offset = viewOffset();
  camera.setViewOffset(width, height, offset.x, offset.y, width, height);
  camera.position.copy(DIRECTION).normalize().multiplyScalar(distance);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();
  const pixels: { x: number; y: number }[] = [];
  for (const x of [-1, 1]) {
    for (const y of [-1, 1]) {
      for (const z of [-1, 1]) {
        const p = new Vector3(x * HALF, y * HALF, z * HALF).project(camera);
        pixels.push({ x: ((p.x + 1) / 2) * width, y: ((1 - p.y) / 2) * height });
      }
    }
  }
  return pixels;
}

describe('Kamera einpassen', () => {
  // Typische Grössen der Würfel-Karte: grosses Fenster, 13-Zoll-Laptop, kleiner Laptop, schmale Karte
  it.each([[1006, 690], [788, 530], [700, 430], [560, 640]])('ganzer Würfel frei bei %i × %i', (width, height) => {
    for (const p of cornerPixels(width, height)) {
      expect(p.x).toBeGreaterThanOrEqual(CUBE_INSETS.left - 0.5);
      expect(p.x).toBeLessThanOrEqual(width - CUBE_INSETS.right + 0.5);
      expect(p.y).toBeGreaterThanOrEqual(CUBE_INSETS.top - 0.5);
      expect(p.y).toBeLessThanOrEqual(height - CUBE_INSETS.bottom + 0.5);
    }
  });

  it('geht bei kleinerem Fenster weiter weg', () => {
    expect(fitDistance(DIRECTION, FOV, 700, 430)).toBeGreaterThan(fitDistance(DIRECTION, FOV, 1006, 690));
  });
});
