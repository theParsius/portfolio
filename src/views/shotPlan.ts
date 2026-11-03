/**
 * Lays a room's screenshots out as platforms: the player climbs the room by jumping from the top
 * of one screenshot to the next. Every shot floats above the grass; none rests on it. The climb
 * starts from the "Screenshots" sign (its text is solid), so the first shot only has to be one
 * jump above the sign. Each project gets its own shape (see VARIANTS).
 *
 * Pure: works in "elevation" coordinates (px above the floor's top edge, x from the field's left),
 * so it can be unit-tested against the reachability BFS without a DOM.
 */

export interface ShotBox {
  /** Index into the project's screenshots. */
  i: number;
  x: number;
  /** Bottom edge, px above the floor (always ≥ PLAN.hoverMin). */
  y: number;
  w: number;
  h: number;
  /** Where the caption plaque goes: under the shot, or (when it floats low) above the player's head. */
  cap: 'below' | 'above' | 'below-left';
  /** Tucked under the previous shot's right end (the player drops onto it). */
  tucked: boolean;
}

export interface ShotPlan {
  shots: ShotBox[];
  width: number;
}

/** Layout limits, kept well inside the engine's reach limits (climb 165, gap 230). */
export const PLAN = {
  entry: 190, // default top of the sign's text, the step up to the first shot
  firstRise: 135, // most the first shot's top sits above the entry step
  rise: 145, // most a top rises over the previous one
  headroom: 70, // space left above the highest top (the player stands there)
  hoverMin: 64, // lowest a shot's bottom ever is: always clearly off the grass
  walkUnder: 100, // a shot this high can be walked under, and its plaque fits below it
  capAboveMaxTop: 330, // a plaque above a shot needs room: low-floating shots stay below this top
  tuckClear: 84, // a tucked shot's top sits this far under the shot above (the player fits)
  tuckLand: 90, // at least this much of a tucked shot sticks out to land on
  portraitH: 520,
  minPortraitH: 200,
  landscapeW: 640,
  minLandscapeH: 140,
  portraitLift: 80, // portrait shots float at most this high (unless a shape forces a small one)
  minGap: 70,
  maxGap: 120,
  span: 380, // tops aim within this band above the lowest: tall rooms keep the shape, not a ladder
  portraitSpan: 480, // portrait shots get a taller band (they are narrow; height shows them)
};

/**
 * One shape per project, all arrays cycled over the shots:
 * - `tops`: where each top aims, 0 = lowest allowed, 1 = highest (then clamped to what one jump
 *   can reach from the previous shot)
 * - `sizes`: height as a share of the base size
 * - `lifts`: least float height (px above the grass) of each shot
 * - `gaps`: px to the next shot; `-1` tucks the next shot under this one's right end
 */
export const VARIANTS = [
  // a steady climb of growing shots
  {
    name: 'stairs',
    tops: [0, 0.4, 0.75, 1, 1, 0.7],
    sizes: [0.6, 0.75, 0.9, 1.05, 1],
    lifts: [64],
    gaps: [80, 90, 100, 110],
  },
  // high, low, high, low: big shots high up, small ones dipping near the grass
  {
    name: 'wave',
    low: 0.35,
    tops: [0, 1, 0.1, 1, 0.15, 1],
    sizes: [0.7, 1.1, 0.6, 1.1, 0.6, 1.1],
    lifts: [64, 200, 56, 200],
    gaps: [110, 110, 110, 110],
  },
  // a big centrepiece with small shots around it
  {
    name: 'peak',
    low: 0.35,
    tops: [0.1, 0.6, 1, 0.55, 0.15],
    sizes: [0.55, 0.7, 1.2, 0.7, 0.55],
    lifts: [120, 150, 56, 150, 120],
    gaps: [90, 80, 80, 90],
  },
  // a climb to the top, then a drop: the fifth shot is tucked under the fourth
  {
    name: 'overhang',
    low: 0.35,
    tops: [0, 1, 1, 1, 0, 0.6],
    sizes: [0.75, 0.8, 0.9, 0.7, 0.85, 0.9],
    lifts: [64, 56, 56, 600, 100],
    gaps: [100, 90, 90, -1, 110],
  },
  // small shots floating high, a row in the sky you can walk under
  {
    name: 'sky',
    low: 0.35,
    tops: [0, 0.65, 1, 0.9, 1, 0.85],
    sizes: [0.6, 0.6, 0.65, 0.6, 0.65],
    lifts: [64, 160, 200, 200, 200],
    gaps: [120, 100, 120, 100],
  },
  // wide flat landings in pairs
  {
    name: 'terraces',
    tops: [0, 0.3, 0.3, 0.65, 0.65, 0.3],
    sizes: [0.8, 1, 1, 1.1, 1.1],
    lifts: [64, 56, 100, 120, 120],
    gaps: [100, 70, 120, 70],
  },
  // tight zig-zag, then a tuck at the end
  {
    name: 'zigzag',
    low: 0.35,
    tops: [0, 0.7, 0.3, 1, 0.1, 0.8],
    sizes: [0.9, 1, 0.85, 1.05, 0.9],
    lifts: [64, 90, 64, 400, 64],
    gaps: [70, 75, 70, -1, 75],
  },
] as const;

interface Shot {
  width: number;
  height: number;
}

export interface PlanOptions {
  /** Which entry of VARIANTS (any integer; wrapped). */
  variant?: number | undefined;
  /** Elevation of the top of the step before the field (the sign's heading). */
  entry?: number | undefined;
}

const at = <T>(xs: readonly T[], i: number): T => xs[i % xs.length] as T;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * @param shots  intrinsic sizes, in order
 * @param avail  px between the floor's top and the top of the track
 * @param viewW  viewport width (landscape shots never exceed 80% of it)
 */
export function planShots(
  shots: Shot[],
  avail: number,
  viewW: number,
  opts: PlanOptions = {},
): ShotPlan {
  const P = PLAN;
  const V = at(VARIANTS, Math.abs(opts.variant ?? 0));
  const entry = opts.entry ?? P.entry;
  const maxTop = avail - P.headroom;
  const aspect = (s: Shot | undefined) => (s?.width || 16) / (s?.height || 9);
  const portrait = aspect(shots[0]) < 1;
  const baseH = portrait
    ? Math.min(P.portraitH, maxTop - P.walkUnder)
    : Math.round(Math.min(P.landscapeW, viewW * 0.8) / aspect(shots[0]));
  const minH = Math.min(portrait ? P.minPortraitH : P.minLandscapeH, Math.round(baseH * 0.6));
  const minTop = P.hoverMin + minH;
  const low = 'low' in V ? V.low : 0;
  const span = portrait ? P.portraitSpan : P.span;
  // `low` keeps a shape's dips off the bottom, so its shots stay big.
  const level = (t: number) =>
    Math.round(minTop + (low + (1 - low) * t) * Math.max(0, Math.min(span, maxTop - minTop)));

  const out: ShotBox[] = [];
  let x = 0;
  shots.forEach((s, i) => {
    const prev = out[i - 1];
    const prevTop = prev ? prev.y + prev.h : entry;
    const reachTop = prev ? prevTop + P.rise : entry + P.firstRise;
    // Portrait shots are narrow, so they shrink less and float lower: height is what shows them off.
    const size = at(V.sizes, i);
    const want = Math.round(baseH * (portrait ? Math.min(1.2, 0.7 + 0.6 * size) : size));
    const rawLift: number = at(V.lifts, i);
    const lift =
      i === 0
        ? P.hoverMin
        : portrait && rawLift < 400
          ? Math.min(rawLift, P.portraitLift)
          : rawLift;

    // Tuck under the previous shot when its gap says so and the room is tall enough.
    const tuckTop = prev ? prev.y - P.tuckClear : 0;
    const tuck = !!prev && at(V.gaps, i - 1) < 0 && tuckTop - P.walkUnder >= minH && prev.x >= 0;

    let top: number;
    let h: number;
    if (tuck) {
      top = tuckTop;
      h = clamp(want, minH, top - P.walkUnder);
    } else {
      top = clamp(level(at(V.tops, i)), minTop, Math.min(maxTop, reachTop));
      // Float at least `lift`, but never shrink below the minimum size to do it.
      h = clamp(Math.min(want, top - lift), minH, top - P.hoverMin);
      // A high shot keeps its plaque below it, so it must float high enough for one.
      if (top > P.capAboveMaxTop) h = Math.min(h, top - P.walkUnder);
    }
    const y = top - h;
    const w = Math.round(h * aspect(s));
    if (prev) {
      if (tuck) x = Math.max(prev.x + prev.w - (w - P.tuckLand), prev.x + P.tuckLand);
      else x = prev.x + prev.w + clamp(Math.abs(at(V.gaps, i - 1)), P.minGap, P.maxGap);
      // A tucked shot sticks out past the one above it; the next one starts after both.
      if (!tuck && prev.tucked) {
        const above = out[i - 2];
        if (above) x = Math.max(x, above.x + above.w + P.minGap);
      }
    }
    if (tuck && prev && prev.cap === 'below') prev.cap = 'below-left';
    out.push({
      i,
      x,
      y,
      w,
      h,
      cap: y >= P.walkUnder ? 'below' : 'above',
      tucked: tuck,
    });
  });
  const width = Math.max(0, ...out.map((b) => b.x + b.w));
  return { shots: out, width };
}
