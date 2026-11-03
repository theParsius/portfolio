/**
 * Every tunable of the play mode. Units: px and seconds.
 * Changing a value here means updating docs/SPEC.md ("Physics constants") too.
 */
export const PHYSICS = {
  step: 1 / 120, // fixed simulation step
  maxFrame: 1 / 30, // frame dt clamp
  gravity: 2600,
  jumpVelocity: 960, // apex ≈ v² / 2g ≈ 177 px
  jumpCutGravity: 2.6, // gravity multiplier while rising with jump released
  fallGravity: 1.15, // gravity multiplier while falling
  maxFall: 1150,
  maxRun: 340,
  accelGround: 3800,
  accelAir: 2400,
  frictionGround: 3400,
  frictionAir: 900,
  coyote: 0.1,
  jumpBuffer: 0.12,
  dropThrough: 0.22,
  playerW: 22,
  playerH: 54,
};

export const FEEL = {
  spriteW: 36, // 12 px sprite × 3
  spriteH: 54,
  spriteOffsetX: -7, // sprite drawn left of the hitbox
  runFrameDistance: 110, // px of travel per half run cycle
  dustSpeed: 520, // landing faster than this spawns dust
  dustCount: 5,
  dustLife: 0.32,
  coinSpeed: 520,
  coinGravity: 1800,
  coinLife: 0.55,
  bumpCooldownMs: 600,
  bumpToRoomMs: 320, // delay between head-bump and the transition (card block)
  bumpToExitMs: 300, // same for exit blocks
  npcPadX: 28, // talk zone = mascot rect grown by these
  npcPadY: 20,
};

export const CAMERA = {
  anchor: 0.4, // player centre sits at 40% of the viewport width
  lerp: 6, // per second; factor = min(1, dt × lerp)
};

/** Reachability limits used by the layout test (from the jump above, with margin). */
export const REACH = {
  maxClimb: 165,
  maxGap: 230,
};
