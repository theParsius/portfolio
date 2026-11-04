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
  spriteOffsetX: -7, // sprite drawn left of the hitbox (sprite is 12 px × 3 = 36 px wide)
  runFrameDistance: 55, // px of travel per run frame (4 frames: one cycle = 220 px, as before)
  landFrameTime: 0.08, // s the crouch frame shows after landing
  bumpFrameTime: 0.16, // s the head-bump frame shows
  blinkEvery: 3, // s between idle blinks
  dustSpeed: 520, // landing faster than this spawns dust
  dustCount: 5,
  dustLife: 0.32,
  coinSpeed: 520,
  coinGravity: 1800,
  coinLife: 0.55,
  bumpCooldownMs: 600,
  bumpToRoomMs: 320, // delay between head-bump and the transition (card block)
  bumpToExitMs: 300, // same for exit blocks
  captionTime: 2.5, // s a screenshot's plaque stays up after a head-bump
  npcPadX: 28, // talk zone = mascot rect grown by these
  npcPadY: 20,
  // Screenshots hover in place (also in play, carrying a player who stands on them)
  hoverX: 5, // px each way, side to side
  hoverY: 5, // px each way, up and down
  hoverPeriodX: 4.4, // s per side-to-side sway
  hoverPeriodY: 3.1, // s per bob (different from X, so the path wanders)
};

export const CAMERA = {
  anchor: 0.4, // player centre sits at 40% of the viewport width
  lerp: 6, // per second; factor = min(1, dt × lerp)
};

/** Stars in project rooms and the score they add up to. */
export const SCORE = {
  starsPerRoom: 3,
  star: 100, // points per star
  roomBonus: 200, // extra points for taking every star in a room
};

/** Reachability limits used by the layout test (from the jump above, with margin). */
export const REACH = {
  maxClimb: 165,
  maxGap: 230,
};
