import { describe, expect, it } from 'vitest';
import { projects } from '../src/content/projects';
import type { Rect, World } from '../src/engine/physics';
import { reach } from '../src/engine/reach';
import { planShots, PLAN, VARIANTS } from '../src/views/shotPlan';

/**
 * The engine's world (screen coords, y down) for a planned screenshot field plus the sign before
 * it: two text lines (sub at 100px, heading at PLAN.entry) ending 60px left of the first shot.
 */
function world(avail: number, viewW: number, variant: number, p: (typeof projects)[number]) {
  const plan = planShots(p.screenshots, avail, viewW, { variant });
  const blocks: Rect[] = plan.shots.map((s) => ({ x: s.x, y: avail - s.y - s.h, w: s.w, h: s.h }));
  const w: World = {
    plats: [
      { x: -360, y: avail - 100, w: 300, h: 20 },
      { x: -300, y: avail - PLAN.entry, w: 240, h: 30 },
    ],
    blocks,
    floor: { x: -500, y: avail, w: plan.width + 1000, h: 48 },
    width: plan.width,
  };
  return { plan, w };
}

const SIZES: [number, number][] = [
  [528, 1366], // laptop 1366 × 640
  [688, 1280], // desktop 1280 × 800
  [730, 390], // phone 390 × 844
  [492, 1024], // the shortest track (540px)
];

describe('screenshots as platforms', () => {
  projects.forEach((p, v) => {
    for (const [avail, viewW] of SIZES) {
      it(`${p.id} at ${avail}px tall, ${viewW}px wide: every shot floats and can be stood on`, () => {
        const { plan, w } = world(avail, viewW, v, p);
        expect(plan.shots.map((s) => s.i)).toEqual(p.screenshots.map((_, i) => i));
        expect(reach(w).standable.every(Boolean)).toBe(true);
        for (const s of plan.shots) {
          expect(s.y).toBeGreaterThanOrEqual(PLAN.hoverMin); // never on the grass
          expect(s.y + s.h).toBeLessThanOrEqual(avail - PLAN.headroom);
          // the plaque has room: below a high-floating shot, or above a low one
          if (s.cap !== 'above') expect(s.y).toBeGreaterThanOrEqual(PLAN.walkUnder);
          else expect(s.y + s.h).toBeLessThanOrEqual(PLAN.capAboveMaxTop);
        }
        for (let a = 1; a < plan.shots.length; a++) {
          const A = plan.shots[a - 1]!;
          const B = plan.shots[a]!;
          if (B.tucked) {
            // under A's right end, clear of it, sticking out far enough to land on
            expect(B.y + B.h).toBeLessThanOrEqual(A.y - PLAN.tuckClear);
            expect(B.x + B.w - (A.x + A.w)).toBeGreaterThanOrEqual(PLAN.tuckLand);
          } else {
            const right = Math.max(...plan.shots.slice(0, a).map((s) => s.x + s.w));
            expect(B.x - right).toBeGreaterThanOrEqual(PLAN.minGap); // a jumpable gap
            expect(B.x - (A.x + A.w)).toBeLessThanOrEqual(PLAN.maxGap);
          }
        }
      });
    }
  });

  it('is a climb, not a row: tops rise and fall', () => {
    projects.forEach((p, v) => {
      const { plan } = world(688, 1280, v, p);
      const tops = plan.shots.map((s) => s.y + s.h);
      expect(new Set(tops).size).toBeGreaterThan(2);
      expect(Math.max(...tops)).toBeGreaterThan(PLAN.entry + PLAN.rise);
    });
  });

  it('every project gets its own layout, visibly different', () => {
    // The 540px minimum track is too short for big shots to differ much; check the real screens.
    for (const [avail, viewW] of SIZES.slice(0, 3)) {
      const shapes = projects.map((p, v) => world(avail, viewW, v, p).plan.shots);
      for (let a = 0; a < shapes.length; a++)
        for (let b = a + 1; b < shapes.length; b++) {
          // tops or float heights differ by 60px+ somewhere
          const A = shapes[a]!;
          const B = shapes[b]!;
          const diff = A.some((s, k) => {
            const t = B[k];
            return !t || Math.abs(s.y + s.h - (t.y + t.h)) >= 60 || Math.abs(s.y - t.y) >= 60;
          });
          expect(diff, `${projects[a]!.id} vs ${projects[b]!.id} at ${avail}×${viewW}`).toBe(true);
        }
    }
  });

  it('the overhang layout tucks a shot when the room is tall enough', () => {
    const v = VARIANTS.findIndex((x) => x.name === 'overhang');
    const { plan } = world(688, 1280, v, projects[v]!);
    expect(plan.shots.some((s) => s.tucked)).toBe(true);
  });

  it('some shots float high enough to walk under', () => {
    projects.forEach((p, v) => {
      const { plan } = world(688, 1280, v, p);
      expect(plan.shots.some((s) => s.y >= PLAN.walkUnder)).toBe(true);
    });
  });
});

describe('the real jump makes the hardest step', () => {
  it('from a narrow shot, across the widest gap, up the biggest rise', async () => {
    const { createInput, createPlayer, step } = await import('../src/engine/physics');
    const { PHYSICS } = await import('../src/engine/constants');
    const floorY = 700;
    const gap = PLAN.maxGap;
    const A = { x: 0, y: floorY - 275, w: 84, h: 275 }; // narrowest portrait shot
    const B = { x: 84 + gap, y: floorY - 275 - PLAN.rise, w: 84, h: 275 + PLAN.rise };
    const w: World = {
      plats: [],
      blocks: [A, B],
      floor: { x: -100, y: floorY, w: 1000, h: 48 },
      width: 900,
    };
    const p = createPlayer(A.x + 4, A.y - PHYSICS.playerH);
    p.ground = true;
    const input = createInput();
    input.right = true;
    // Run along A's top, jump near its far edge, hold jump and right.
    for (let t = 0; t < 3; t += PHYSICS.step) {
      if (!input.jump && p.x + p.w > A.x + A.w - 6) {
        input.jump = true;
        input.jumpPressed = true;
      }
      step(p, input, w, PHYSICS.step);
      if (p.ground && p.x > B.x - p.w) break;
    }
    expect(p.y + p.h).toBe(B.y); // landed on B's top
  });
});
