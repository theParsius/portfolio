import { CAMERA } from './constants';

/**
 * Next camera position. The float camX is kept separately from scrollLeft, which rounds to whole
 * pixels and would stall a slow lerp.
 */
export function follow(
  camX: number,
  playerCenter: number,
  viewW: number,
  maxX: number,
  dt: number,
): number {
  const target = Math.max(0, Math.min(maxX, playerCenter - viewW * CAMERA.anchor));
  return camX + (target - camX) * Math.min(1, dt * CAMERA.lerp);
}
