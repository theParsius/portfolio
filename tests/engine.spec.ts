import { describe, expect, it } from 'vitest';
import { PHYSICS as K } from '../src/engine/constants';
import {
  createInput,
  createPlayer,
  step,
  type Input,
  type Player,
  type World,
} from '../src/engine/physics';

const DT = K.step;
const FLOOR_Y = 500;

function world(extra: Partial<World> = {}): World {
  return {
    plats: [],
    blocks: [],
    floor: { x: 0, y: FLOOR_Y, w: 4000, h: 48 },
    width: 4000,
    ...extra,
  };
}

/** Player standing on a surface whose top is `top`. */
function standing(top: number, x = 100): Player {
  const p = createPlayer(x, top - K.playerH);
  p.ground = true;
  return p;
}

function run(p: Player, input: Input, w: World, seconds: number, each?: (p: Player) => void) {
  const events = [];
  for (let t = 0; t < seconds - 1e-9; t += DT) {
    events.push(...step(p, input, w, DT));
    each?.(p);
  }
  return events;
}

function settle(p: Player, w: World): void {
  run(p, createInput(), w, 0.05);
}

describe('landing', () => {
  it('lands on a one-way platform when falling onto it from above', () => {
    const w = world({ plats: [{ x: 50, y: 300, w: 200, h: 20 }] });
    const p = createPlayer(100, 200);
    const events = run(p, createInput(), w, 1);
    expect(p.y + p.h).toBe(300);
    expect(p.ground).toBe(true);
    expect(p.onSolid).toBe(false);
    expect(events.filter((e) => e.type === 'land')).toHaveLength(1);
  });

  it('passes up through a one-way platform from below', () => {
    const w = world({ plats: [{ x: 50, y: 400, w: 200, h: 20 }] });
    const p = standing(FLOOR_Y);
    const input = createInput();
    input.jump = true;
    input.jumpPressed = true;
    let minBottom = Infinity;
    run(p, input, w, 0.2, (q) => (minBottom = Math.min(minBottom, q.y + q.h)));
    expect(minBottom).toBeLessThan(400); // feet rose above the platform top
    input.jump = false;
    run(p, input, w, 1.5);
    expect(p.y + p.h).toBe(400); // and then landed on it
  });

  it('never falls through the floor, even at max fall speed', () => {
    const p = createPlayer(100, -200);
    run(p, createInput(), world(), 3);
    expect(p.y + p.h).toBe(FLOOR_Y);
    expect(p.onSolid).toBe(true);
  });
});

describe('drop-through', () => {
  it('a single queued tap of down drops through a one-way platform', () => {
    const w = world({ plats: [{ x: 50, y: 300, w: 200, h: 20 }] });
    const p = standing(300);
    settle(p, w);
    expect(p.y + p.h).toBe(300);
    const input = createInput();
    input.dropPressed = true; // tap: down is not held
    run(p, input, w, 1);
    expect(p.y + p.h).toBe(FLOOR_Y);
  });

  it('does nothing on the floor or on a block', () => {
    const p = standing(FLOOR_Y);
    const input = createInput();
    input.down = true;
    run(p, input, world(), 0.5);
    expect(p.y + p.h).toBe(FLOOR_Y);

    const block = { x: 80, y: 400, w: 40, h: 40 };
    const q = createPlayer(85, 300);
    run(q, createInput(), world({ blocks: [block] }), 0.5);
    expect(q.y + q.h).toBe(400);
    run(q, input, world({ blocks: [block] }), 0.5);
    expect(q.y + q.h).toBe(400);
  });
});

describe('head-bump', () => {
  it('stops upward motion under a block and emits one bump', () => {
    const block = { x: 90, y: 340, w: 40, h: 40 }; // bottom 380, head at 446 standing
    const w = world({ blocks: [block] });
    const p = standing(FLOOR_Y, 99);
    const input = createInput();
    input.jump = true;
    input.jumpPressed = true;
    const events = run(p, input, w, 0.3);
    const bumps = events.filter((e) => e.type === 'bump');
    expect(bumps).toEqual([{ type: 'bump', block: 0 }]);
    expect(p.y).toBeGreaterThanOrEqual(380);
  });

  it('blocks are solid from the side', () => {
    const block = { x: 200, y: FLOOR_Y - 40, w: 40, h: 40 };
    const p = standing(FLOOR_Y, 100);
    const input = createInput();
    input.right = true;
    run(p, input, world({ blocks: [block] }), 1);
    expect(p.x + p.w).toBe(200);
  });
});

describe('coyote time and jump buffer', () => {
  /** Walk off the right edge of a ledge and press jump `late` seconds after leaving it. */
  function jumpAfterLedge(late: number): boolean {
    const ledge = { x: 0, y: 300, w: 200, h: 20 };
    const w = world({ plats: [ledge] });
    const p = standing(300, 200 - K.playerW - 2);
    settle(p, w);
    const input = createInput();
    input.right = true;
    let leftAt = -1;
    let t = 0;
    while (t < 2) {
      step(p, input, w, DT);
      t += DT;
      if (leftAt < 0 && !p.ground) leftAt = t;
      if (leftAt >= 0 && t - leftAt >= late - 1e-9) break;
    }
    input.jump = true;
    input.jumpPressed = true;
    step(p, input, w, DT);
    return p.vy < 0;
  }

  it('allows a jump 0.09 s after leaving a ledge', () => expect(jumpAfterLedge(0.09)).toBe(true));
  it('refuses a jump 0.11 s after leaving a ledge', () => expect(jumpAfterLedge(0.11)).toBe(false));

  it('a jump pressed 0.11 s before landing fires on landing', () => {
    const p = createPlayer(100, FLOOR_Y - K.playerH - 300);
    const input = createInput();
    const w = world();
    // Fall until about 0.11 s from the floor, then press jump.
    while (p.y + p.h + p.vy * 0.11 < FLOOR_Y) step(p, input, w, DT);
    input.jumpPressed = true;
    let jumped = false;
    for (let i = 0; i < 40 && !jumped; i++) {
      step(p, input, w, DT);
      jumped = p.vy < 0;
    }
    expect(jumped).toBe(true);
  });

  it('a jump pressed 0.2 s before landing is dropped', () => {
    const p = createPlayer(100, FLOOR_Y - K.playerH - 400);
    const input = createInput();
    const w = world();
    while (p.y + p.h + p.vy * 0.2 < FLOOR_Y) step(p, input, w, DT);
    input.jumpPressed = true;
    let jumped = false;
    for (let i = 0; i < 60; i++) {
      step(p, input, w, DT);
      if (p.vy < 0) jumped = true;
    }
    expect(jumped).toBe(false);
  });
});

describe('jump arc', () => {
  function apex(holdFor: number): number {
    const p = standing(FLOOR_Y);
    const input = createInput();
    input.jump = true;
    input.jumpPressed = true;
    let top = p.y;
    let t = 0;
    run(p, input, world(), 1.2, (q) => {
      t += DT;
      if (t >= holdFor) input.jump = false;
      top = Math.min(top, q.y);
    });
    return FLOOR_Y - K.playerH - top;
  }

  it('a held jump peaks near 177 px', () => expect(apex(10)).toBeCloseTo(177, -1));
  it('releasing early cuts the jump short', () => {
    expect(apex(0.05)).toBeLessThan(apex(10) * 0.6);
  });
  it('clears the 165 px climb the layout relies on', () => expect(apex(10)).toBeGreaterThan(165));
  it('emits exactly one jump event per jump', () => {
    const p = standing(FLOOR_Y);
    const input = createInput();
    input.jump = true;
    input.jumpPressed = true;
    const events = run(p, input, world(), 1.5);
    expect(events.filter((e) => e.type === 'jump')).toHaveLength(1);
  });
});

describe('running', () => {
  it('caps at max run speed and stops with friction', () => {
    const p = standing(FLOOR_Y);
    const input = createInput();
    input.right = true;
    run(p, input, world(), 1);
    expect(p.vx).toBe(K.maxRun);
    input.right = false;
    run(p, input, world(), 0.2);
    expect(p.vx).toBe(0);
  });
});
