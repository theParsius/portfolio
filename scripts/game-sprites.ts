/**
 * Play-mode sprites, written as 1× PNGs into public/sprites/:
 *   player.png   horizontal strip of 12 × 18 frames, map in src/content/player.json
 *   qblock.png   10 × 10: [? block, used block]
 *   coin.png     7 × 10
 *
 * The player art here is a placeholder in the avatar's palette. To use a real sheet, export
 * assets-src/sprites/player.png (same strip layout, any frame size) plus
 * assets-src/sprites/player.json ({ frameW, frameH, anims: { idle: [i…], run: […], jump, fall,
 * land, bump } }) and rerun `npm run sprites:game`: those files are copied instead.
 */
import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const OUT = resolve(ROOT, 'public/sprites');
const MAP = resolve(ROOT, 'src/content/player.json');

type Pal = Record<string, string>;

async function png(rows: string[][], pal: Pal, file: string): Promise<void> {
  // rows: one string[] per frame, frames laid side by side.
  const h = rows[0]?.length ?? 0;
  const fw = rows[0]?.[0]?.length ?? 0;
  const w = fw * rows.length;
  const buf = Buffer.alloc(w * h * 4);
  rows.forEach((frame, f) => {
    if (frame.length !== h) throw new Error(`${file}: frame ${f} has ${frame.length} rows`);
    frame.forEach((line, y) => {
      if (line.length !== fw)
        throw new Error(`${file}: frame ${f} row ${y} is ${line.length} wide`);
      [...line].forEach((ch, x) => {
        const hex = pal[ch];
        if (!hex) return;
        const i = (y * w + f * fw + x) * 4;
        buf[i] = parseInt(hex.slice(1, 3), 16);
        buf[i + 1] = parseInt(hex.slice(3, 5), 16);
        buf[i + 2] = parseInt(hex.slice(5, 7), 16);
        buf[i + 3] = 255;
      });
    });
  });
  await sharp(buf, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(resolve(OUT, file));
  console.log(`sprites: ${file} ${w}×${h}`);
}

// ---------- Player (placeholder) ----------

const PLAYER_PAL: Pal = {
  H: '#151a30', // hair
  S: '#b8723f', // skin
  E: '#130c0a', // eyes
  M: '#2b1a12', // beard
  W: '#f3efe4', // shirt
  P: '#34428a', // trousers
  B: '#efe9dc', // shoes
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
const blink = (rows: string[]) => rows.map((r) => r.replace(/E/g, 'S'));
const LEGS = {
  idle: ['...PPPPPP...', '...PP..PP...', '...PP..PP...', '...PP..PP...', '..BBB..BBB..'],
  run0: ['...PPPPPP...', '..PPP..PP...', '.PP.....PP..', '.PP......BB.', '.BB.........'],
  run1: ['...PPPPPP...', '...PPPPP....', '....PPP.....', '....PP.PP...', '...BBB.BB...'],
  run2: ['...PPPPPP...', '...PP..PPP..', '..PP.....PP.', '.BB......PP.', '.........BB.'],
  run3: ['...PPPPPP...', '....PPPP....', '....PPPP....', '....PP.PP...', '...BBB.BBB..'],
  jump: ['...PPPPPP...', '..PP...PP...', '.BB....PP...', '.......BB...', '............'],
  fall: ['...PPPPPP...', '..PP....PP..', '..PP....PP..', '.BB......BB.', '............'],
};
const ARMS_UP = [
  '.S.HHHHH....',
  '.SHHHHHHHH..',
  '.SHHHHHHHHH.',
  ...TOP.slice(3, 10),
  '.SWWWWWWWW..',
  '..WWWWWWWWS.',
  '..SWWWWWWSS.',
];
const FRAMES = {
  idle0: [...TOP, ...LEGS.idle],
  idle1: [...blink(TOP), ...LEGS.idle],
  run0: [...TOP, ...LEGS.run0],
  run1: [...TOP, ...LEGS.run1],
  run2: [...TOP, ...LEGS.run2],
  run3: [...TOP, ...LEGS.run3],
  jump: [...TOP, ...LEGS.jump],
  fall: [...TOP, ...LEGS.fall],
  land: ['............', ...TOP, '...PPPPPP...', '..PPPPPPPP..', '.PP......PP.', 'BBB......BBB'], // crouch
  bump: [...blink(ARMS_UP), ...LEGS.jump],
};
const ANIMS = {
  idle: ['idle0', 'idle1'],
  run: ['run0', 'run1', 'run2', 'run3'],
  jump: ['jump'],
  fall: ['fall'],
  land: ['land'],
  bump: ['bump'],
};

async function player(): Promise<void> {
  const src = resolve(ROOT, 'assets-src/sprites/player.png');
  const srcMap = resolve(ROOT, 'assets-src/sprites/player.json');
  if (existsSync(src) && existsSync(srcMap)) {
    copyFileSync(src, resolve(OUT, 'player.png'));
    copyFileSync(srcMap, MAP);
    console.log('sprites: player.png copied from assets-src/sprites/');
    return;
  }
  const names = Object.keys(FRAMES);
  await png(Object.values(FRAMES), PLAYER_PAL, 'player.png');
  const anims = Object.fromEntries(
    Object.entries(ANIMS).map(([k, v]) => [k, v.map((n) => names.indexOf(n))]),
  );
  const map = { frameW: 12, frameH: 18, placeholder: true, anims };
  writeFileSync(MAP, JSON.stringify(map, null, 2) + '\n');
}

// ---------- Blocks and coin ----------

const BLOCK_PAL: Pal = {
  K: '#000000',
  L: '#f7c85a',
  G: '#e8a317',
  D: '#8a4e12',
  W: '#ffffff',
  U: '#a8682a',
  R: '#5a3209',
};
const QBLOCK = [
  'KKKKKKKKKK',
  'KLLLLLLLLK',
  'KLGWWWWGDK',
  'KLWWGGWWDK',
  'KLGGGGWWDK',
  'KLGGGWWGDK',
  'KLGGWWGGDK',
  'KLGGGGGGDK',
  'KLGGWWGGDK',
  'KKKKKKKKKK',
];
const USED = [
  'KKKKKKKKKK',
  'KURUUUURUK',
  'KRUUUUUURK',
  'KUUUUUUUDK',
  'KUUUUUUUDK',
  'KUUUUUUUDK',
  'KUUUUUUUDK',
  'KRUUUUUURK',
  'KURDDDDRDK',
  'KKKKKKKKKK',
];
const COIN_PAL: Pal = { K: '#7a4a08', Y: '#f7c85a', L: '#fff3c4', D: '#b07418' };
const COIN = [
  '..KKK..',
  '.KLYYK.',
  'KLYYYDK',
  'KLYLYDK',
  'KLYLYDK',
  'KLYLYDK',
  'KLYLYDK',
  'KLYYYDK',
  '.KYYDK.',
  '..KKK..',
];

await player();
await png([QBLOCK, USED], BLOCK_PAL, 'qblock.png');
await png([COIN], COIN_PAL, 'coin.png');
