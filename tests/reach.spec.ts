import { describe, expect, it } from 'vitest';
import type { World } from '../src/engine/physics';
import { reach } from '../src/engine/reach';

const floor = { x: 0, y: 500, w: 3000, h: 48 };
const w = (extra: Partial<World>): World => ({
  plats: [],
  blocks: [],
  floor,
  width: 3000,
  ...extra,
});

describe('reach', () => {
  it('reaches a block 64 px above a card standing on the floor', () => {
    const card = { x: 100, y: 200, w: 340, h: 300 }; // top 300 above floor: too high to climb directly
    const mascot = { x: 118, y: 124, w: 60, h: 76 };
    const step1 = { x: 450, y: 360, w: 100, h: 10 }; // stairs up to the card
    const step2 = { x: 300, y: 210, w: 120, h: 10 };
    const block = { x: 376, y: 96, w: 40, h: 40 }; // bottom 136 = card top − 64
    const r = reach(w({ plats: [card, mascot, step1, step2], blocks: [block] }));
    expect(r.unreachedBlocks).toEqual([]);
  });

  it('reports a block with no surface close enough underneath', () => {
    const block = { x: 200, y: 100, w: 40, h: 40 }; // bottom 360 above the floor
    expect(reach(w({ blocks: [block] })).unreachedBlocks).toEqual([0]);
  });

  it('does not climb more than 165 px or cross gaps wider than 230 px', () => {
    const tooHigh = { x: 100, y: 500 - 170, w: 100, h: 10 };
    const r = reach(w({ plats: [tooHigh] }));
    expect(r.reachedSurfaces).toBe(1);
    const ledge = { x: 100, y: 400, w: 100, h: 10 };
    const far = { x: 200 + 231, y: 260, w: 100, h: 10 };
    expect(reach(w({ plats: [ledge, far] })).reachedSurfaces).toBe(2);
  });
});
