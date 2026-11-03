import { PHYSICS, REACH } from './constants';
import type { Rect, World } from './physics';

export interface ReachResult {
  /** Indices into world.blocks that cannot be head-bumped from any reachable surface. */
  unreachedBlocks: number[];
  reachedSurfaces: number;
  totalSurfaces: number;
}

const hGap = (a: Rect, b: Rect) => Math.max(0, Math.max(a.x, b.x) - Math.min(a.x + a.w, b.x + b.w));

/**
 * Breadth-first search over standable surfaces, starting from the floor.
 * From surface A the player reaches B when the horizontal gap is ≤ maxGap and B is at most
 * maxClimb above A (any drop is fine). A block is hit when a reached surface sits under it
 * and its bottom is within maxClimb + player height above that surface.
 */
export function reach(world: World, limits = REACH): ReachResult {
  const surfaces: Rect[] = [world.floor, ...world.plats, ...world.blocks];
  const seen = new Set<number>([0]);
  const queue = [0];
  while (queue.length) {
    const a = surfaces[queue.shift() ?? 0];
    if (!a) continue;
    surfaces.forEach((b, j) => {
      if (seen.has(j)) return;
      if (hGap(a, b) <= limits.maxGap && a.y - b.y <= limits.maxClimb) {
        seen.add(j);
        queue.push(j);
      }
    });
  }
  const reached = [...seen].map((i) => surfaces[i]).filter((s): s is Rect => !!s);
  const headroom = limits.maxClimb + PHYSICS.playerH;
  const unreachedBlocks = world.blocks
    .map((b, i) => ({ b, i }))
    .filter(
      ({ b }) =>
        !reached.some((s) => {
          const under = s.x < b.x + b.w - 2 && s.x + s.w > b.x + 2;
          const rise = s.y - (b.y + b.h);
          return under && rise > 0 && rise <= headroom;
        }),
    )
    .map(({ i }) => i);
  return { unreachedBlocks, reachedSurfaces: seen.size, totalSurfaces: surfaces.length };
}
