/**
 * Placeholder player sprite from the prototype: 12 × 18 px, drawn in code.
 * Replaced by a sprite sheet in M5.
 */
const PAL: Record<string, string> = {
  H: '#151a30',
  S: '#b8723f',
  E: '#130c0a',
  M: '#2b1a12',
  W: '#f3efe4',
  P: '#34428a',
  B: '#efe9dc',
};
const TOP = [
  '...HHHHH....',
  '..HHHHHHHH..',
  '.HHHHHHHHHH.',
  '.HHSSSSSSSH.',
  '.HSSSESSSES.',
  '.HSSSSSSSSS.',
  '..SSMMMMMMS.',
  '..SMMMMMMMS.',
  '...SMMMMMS..',
  '..WWWWWWWW..',
  '.SWWWWWWWWS.',
  '.SWWWWWWWWS.',
  '.SSWWWWWWSS.',
];
const LEGS = {
  idle: ['...PPPPPP...', '...PP..PP...', '...PP..PP...', '...PP..PP...', '..BBB..BBB..'],
  runA: ['...PPPPPP...', '..PPP..PP...', '.PP.....PP..', '.PP......BB.', '.BB.........'],
  runB: ['...PPPPPP...', '....PPPP....', '....PPPP....', '....PP.PP...', '...BBB.BBB..'],
  jump: ['...PPPPPP...', '..PP...PP...', '.BB....PP...', '.......BB...', '............'],
};
export type Pose = keyof typeof LEGS | 'blink';
export const SPRITE_W = 12;
export const SPRITE_H = 18;

function draw(legs: keyof typeof LEGS, blink: boolean, flip: boolean): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = SPRITE_W;
  c.height = SPRITE_H;
  const x = c.getContext('2d');
  if (!x) return c;
  const rows = [...TOP.map((r) => (blink ? r.replace(/E/g, 'S') : r)), ...LEGS[legs]];
  rows.forEach((row, y) => {
    [...row].forEach((ch, i) => {
      const color = PAL[ch];
      if (!color) return;
      x.fillStyle = color;
      x.fillRect(flip ? SPRITE_W - 1 - i : i, y, 1, 1);
    });
  });
  return c;
}

let cache: Record<Pose, [HTMLCanvasElement, HTMLCanvasElement]> | null = null;
/** Frames per pose: [facing right, facing left]. Built lazily (needs a DOM). */
export function frames(): Record<Pose, [HTMLCanvasElement, HTMLCanvasElement]> {
  if (cache) return cache;
  const out = {} as Record<Pose, [HTMLCanvasElement, HTMLCanvasElement]>;
  for (const k of Object.keys(LEGS) as (keyof typeof LEGS)[]) {
    out[k] = [draw(k, false, false), draw(k, false, true)];
  }
  out.blink = [draw('idle', true, false), draw('idle', true, true)];
  return (cache = out);
}
