import { PHYSICS as K } from './constants';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Player extends Rect {
  vx: number;
  vy: number;
  face: 1 | -1;
  ground: boolean;
  /** Standing on something solid (floor or block) rather than a one-way platform. */
  onSolid: boolean;
  coyote: number;
  buffer: number;
  drop: number;
}

export interface Input {
  left: boolean;
  right: boolean;
  jump: boolean; // held
  down: boolean; // held
  /** Set on keydown, consumed by the next step, so a tap shorter than a frame still counts. */
  jumpPressed: boolean;
  dropPressed: boolean;
}

/** A solid box (? block): land on it, blocked from the sides, head-bump from below. */
export type Block = Rect;

export interface World {
  plats: Rect[]; // one-way platforms: only their top edge matters
  blocks: Block[];
  floor: Rect;
  width: number;
}

export type StepEvent =
  { type: 'jump' } | { type: 'land'; speed: number } | { type: 'bump'; block: number };

export function createPlayer(x = 0, y = 0): Player {
  return {
    x,
    y,
    w: K.playerW,
    h: K.playerH,
    vx: 0,
    vy: 0,
    face: 1,
    ground: false,
    onSolid: false,
    coyote: 0,
    buffer: 0,
    drop: 0,
  };
}

export function createInput(): Input {
  return {
    left: false,
    right: false,
    jump: false,
    down: false,
    jumpPressed: false,
    dropPressed: false,
  };
}

export const overlaps = (a: Rect, b: Rect): boolean =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/** Advances the player by one fixed step. Mutates `p` and consumes the queued presses in `input`. */
export function step(p: Player, input: Input, world: World, dt: number): StepEvent[] {
  const events: StepEvent[] = [];

  // Horizontal: accelerate (doubled when reversing), else friction.
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  if (dir) {
    const acc = p.ground ? K.accelGround : K.accelAir;
    if (Math.sign(p.vx) === -dir) p.vx += dir * acc * dt;
    p.vx += dir * acc * dt;
    p.face = dir > 0 ? 1 : -1;
  } else {
    const f = (p.ground ? K.frictionGround : K.frictionAir) * dt;
    p.vx = Math.abs(p.vx) <= f ? 0 : p.vx - Math.sign(p.vx) * f;
  }
  p.vx = Math.max(-K.maxRun, Math.min(K.maxRun, p.vx));

  // Jump: coyote time after leaving a ledge, buffer before landing.
  p.coyote = p.ground ? K.coyote : p.coyote - dt;
  if (input.jumpPressed) {
    p.buffer = K.jumpBuffer;
    input.jumpPressed = false;
  } else p.buffer -= dt;
  if (p.buffer > 0 && p.coyote > 0) {
    p.vy = -K.jumpVelocity;
    events.push({ type: 'jump' });
    p.buffer = 0;
    p.coyote = 0;
    p.ground = false;
  }

  // Gravity: heavier when jump is released while rising, a little heavier falling.
  let g = K.gravity;
  if (p.vy < 0 && !input.jump) g *= K.jumpCutGravity;
  else if (p.vy > 0) g *= K.fallGravity;
  p.vy = Math.min(p.vy + g * dt, K.maxFall);

  // Drop through a one-way platform (never the floor or a block).
  if ((input.down || input.dropPressed) && p.ground && !p.onSolid && p.drop <= 0) {
    p.drop = K.dropThrough;
    p.ground = false;
    p.y += 2;
  }
  input.dropPressed = false;
  p.drop -= dt;

  // Move x, blocked by solid blocks; clamp to the level.
  p.x += p.vx * dt;
  for (const b of world.blocks) {
    if (overlaps(p, b)) {
      p.x = p.vx > 0 ? b.x - p.w : b.x + b.w;
      p.vx = 0;
    }
  }
  p.x = Math.max(0, Math.min(world.width - p.w, p.x));

  // Move y. Land only when falling and the feet were at or above the top last step.
  const prevBottom = p.y + p.h;
  const prevTop = p.y;
  const fallSpeed = p.vy;
  const wasGround = p.ground;
  p.y += p.vy * dt;
  p.ground = false;
  p.onSolid = false;
  if (p.y < -200) p.y = -200;

  if (p.vy >= 0) {
    let best: Rect | null = null;
    let solid = false;
    const test = (pl: Rect, isSolid: boolean) => {
      if (
        p.x + p.w > pl.x + 2 &&
        p.x < pl.x + pl.w - 2 &&
        prevBottom <= pl.y + 1 &&
        p.y + p.h >= pl.y &&
        (!best || pl.y < best.y)
      ) {
        best = pl;
        solid = isSolid;
      }
    };
    if (p.drop <= 0) for (const pl of world.plats) test(pl, false);
    for (const b of world.blocks) test(b, true);
    test(world.floor, true);
    const landed = best as Rect | null;
    if (landed) {
      p.y = landed.y - p.h;
      p.vy = 0;
      p.ground = true;
      p.onSolid = solid;
    } else if (p.y + p.h > world.floor.y) {
      p.y = world.floor.y - p.h;
      p.vy = 0;
      p.ground = true;
      p.onSolid = true;
    }
  } else {
    for (const [i, b] of world.blocks.entries()) {
      if (overlaps(p, b) && prevTop >= b.y + b.h - 1) {
        p.y = b.y + b.h;
        p.vy = 0;
        events.push({ type: 'bump', block: i });
        break;
      }
    }
  }

  if (p.ground && !wasGround) events.push({ type: 'land', speed: fallSpeed });
  return events;
}
