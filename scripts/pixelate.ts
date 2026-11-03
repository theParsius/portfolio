/**
 * Recovers 1× pixel art from the upscaled sprites extracted from the PDF.
 *
 *   tsx scripts/pixelate.ts --detect   scan every sprite, write src/content/sprites.json (slow, run once)
 *   tsx scripts/pixelate.ts            apply sprites.json: write 1× PNGs into public/
 *
 * Sources are the upscaled originals in assets-src/sprites-upscaled/ (Git LFS).
 * A sprite whose grid is not uniform (reconstruction error above MAX_ERR) is marked "smooth":
 * it is copied unchanged and the site draws it with smooth scaling instead of pixelated.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const SRC = resolve(ROOT, 'assets-src/sprites-upscaled');
const OUT = resolve(ROOT, 'public');
const CONFIG = resolve(ROOT, 'src/content/sprites.json');
const MAX_ERR = 40;

/** Output path (relative to public/) → upscaled source (relative to SRC). */
export const SPRITES: Record<string, string> = {
  'sprites/trees.png': 'sprites/trees.png',
  'sprites/tower.png': 'sprites/tower.png',
  'sprites/flag.png': 'sprites/flag.png',
  'sprites/grass.png': 'sprites/grass.png',
  'sprites/clouds.png': 'sprites/clouds.png',
  'sprites/avatar.png': 'sprites/avatar.png',
  ...Object.fromEntries(
    [
      'honeyland',
      'wordfly',
      'dice-fight',
      'line-up',
      'funtomime',
      'saving-private-teddy',
      'agha-khan',
    ].map((id) => [`projects/${id}/mascot.png`, `projects/${id}/mascot.png`]),
  ),
};

/** 1× strips cut into one sprite per figure (split at fully transparent columns), left to right. */
const SPLITS: Record<string, string[]> = {
  'sprites/trees.png': ['sprites/tree-1.png', 'sprites/tree-2.png'],
};

export interface SpriteGrid {
  mode: 'pixel' | 'smooth';
  period: number;
  ox: number;
  oy: number;
  err: number;
  /** 1× size, or the source size for smooth sprites. */
  width: number;
  height: number;
}

interface Raw {
  data: Buffer;
  W: number;
  H: number;
}

async function load(file: string): Promise<Raw> {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, W: info.width, H: info.height };
}

const cell = (v: number, o: number, p: number, max: number) =>
  Math.min(max - 1, Math.max(0, Math.round(o + (Math.floor((v - o) / p) + 0.5) * p)));

/** Mean per-pixel difference between the image and its cell-centre reconstruction. */
function reconError({ data, W, H }: Raw, p: number, ox: number, oy: number): number {
  let e = 0;
  let n = 0;
  for (let y = 0; y < H; y++) {
    const cy = cell(y, oy, p, H);
    for (let x = 0; x < W; x++) {
      const a = (y * W + x) * 4;
      const b = (cy * W + cell(x, ox, p, W)) * 4;
      if ((data[a + 3] ?? 0) < 20 && (data[b + 3] ?? 0) < 20) continue;
      for (let c = 0; c < 4; c++) e += Math.abs((data[a + c] ?? 0) - (data[b + c] ?? 0));
      n++;
    }
  }
  return n ? e / n : Infinity;
}

function detect(img: Raw): Omit<SpriteGrid, 'mode' | 'width' | 'height'> {
  const scored: { period: number; ox: number; oy: number; err: number }[] = [];
  for (let p = 4; p <= 14; p += 0.05) {
    let best = { period: p, ox: 0, oy: 0, err: Infinity };
    for (let ox = 0; ox < p; ox += p / 8) {
      for (let oy = 0; oy < p; oy += p / 8) {
        const err = reconError(img, p, ox, oy);
        if (err < best.err) best = { period: p, ox, oy, err };
      }
    }
    scored.push(best);
  }
  // Half a period fits as well as the true one, so take the largest period close to the best error.
  const min = Math.min(...scored.map((s) => s.err));
  const ok = scored.filter((s) => s.err <= min * 1.25 + 2);
  return ok.reduce((a, b) => (b.period > a.period ? b : a));
}

async function downsample(src: string, g: SpriteGrid, out: string): Promise<void> {
  const { data, W, H } = await load(src);
  const small = Buffer.alloc(g.width * g.height * 4);
  for (let j = 0; j < g.height; j++) {
    for (let i = 0; i < g.width; i++) {
      // Mode colour of the inner half of the cell (robust to resampling fringes).
      const x0 = g.ox + i * g.period;
      const y0 = g.oy + j * g.period;
      const counts = new Map<number, number>();
      for (let y = Math.ceil(y0 + g.period * 0.25); y < y0 + g.period * 0.75; y++) {
        for (let x = Math.ceil(x0 + g.period * 0.25); x < x0 + g.period * 0.75; x++) {
          const k = (Math.min(H - 1, y) * W + Math.min(W - 1, x)) * 4;
          const key = data.readUInt32BE(k);
          counts.set(key, (counts.get(key) ?? 0) + 1);
        }
      }
      let best = 0;
      let bc = -1;
      for (const [k, c] of counts) if (c > bc) [bc, best] = [c, k];
      // Snap near-transparent pixels to fully transparent, opaque ones to fully opaque.
      const a = best & 0xff;
      small.writeUInt32BE(((best & ~0xff) | (a < 128 ? 0 : 255)) >>> 0, (j * g.width + i) * 4);
    }
  }
  mkdirSync(dirname(out), { recursive: true });
  await sharp(small, { raw: { width: g.width, height: g.height, channels: 4 } })
    .png({ compressionLevel: 9, palette: true })
    .toFile(out);
}

async function runDetect(): Promise<void> {
  const config: Record<string, SpriteGrid> = {};
  for (const [out, src] of Object.entries(SPRITES)) {
    const img = await load(resolve(SRC, src));
    const d = detect(img);
    const pixel = d.err <= MAX_ERR;
    config[out] = {
      mode: pixel ? 'pixel' : 'smooth',
      ...d,
      period: +d.period.toFixed(3),
      ox: +d.ox.toFixed(3),
      oy: +d.oy.toFixed(3),
      err: +d.err.toFixed(1),
      width: pixel ? Math.floor((img.W - d.ox) / d.period) : img.W,
      height: pixel ? Math.floor((img.H - d.oy) / d.period) : img.H,
    };
    console.log(out, config[out]);
  }
  writeFileSync(CONFIG, JSON.stringify(config, null, 2) + '\n');
}

async function runApply(): Promise<void> {
  const config = JSON.parse(readFileSync(CONFIG, 'utf8')) as Record<string, SpriteGrid>;
  for (const [out, g] of Object.entries(config)) {
    if (!SPRITES[out]) continue; // a piece cut by splitStrips()
    const src = resolve(SRC, SPRITES[out]);
    if (!existsSync(src)) throw new Error(`missing source ${src}`);
    if (g.mode === 'pixel') await downsample(src, g, resolve(OUT, out));
    else copyFileSync(src, resolve(OUT, out));
    console.log(`${g.mode.padEnd(6)} ${out} → ${g.width}×${g.height}`);
  }
  await grassTile();
  await splitStrips(config);
}

/** Cuts each strip in SPLITS at its empty columns and registers the pieces in sprites.json. */
async function splitStrips(config: Record<string, SpriteGrid>): Promise<void> {
  for (const [strip, pieces] of Object.entries(SPLITS)) {
    const g = config[strip];
    if (!g || g.mode !== 'pixel') throw new Error(`${strip}: split needs a pixel sprite`);
    const file = resolve(OUT, strip);
    const { data, W, H } = await load(file);
    const filled = (x: number) => {
      for (let y = 0; y < H; y++) if ((data[(y * W + x) * 4 + 3] ?? 0) > 0) return true;
      return false;
    };
    const runs: [number, number][] = [];
    for (let x = 0; x < W; x++) {
      if (!filled(x)) continue;
      const last = runs.at(-1);
      if (last && last[1] === x) last[1] = x + 1;
      else runs.push([x, x + 1]);
    }
    if (runs.length !== pieces.length)
      throw new Error(`${strip}: found ${runs.length} figures, expected ${pieces.length}`);
    for (const [i, [a, b]] of runs.entries()) {
      const out = pieces[i];
      if (!out) continue;
      await sharp(file)
        .extract({ left: a, top: 0, width: b - a, height: H }) // full height: feet stay on the ground line
        .png({ palette: true })
        .toFile(resolve(OUT, out));
      config[out] = { ...g, ox: 0, oy: 0, width: b - a, height: H };
      console.log(`split  ${out} → ${b - a}×${H}`);
    }
  }
  writeFileSync(CONFIG, JSON.stringify(config, null, 2) + '\n');
}

/**
 * The ground strip repeats horizontally; crop exactly one period so it tiles with no seam.
 * Writes public/sprites/grass-tile.png.
 */
async function grassTile(): Promise<void> {
  const file = resolve(OUT, 'sprites/grass.png');
  const { data, W, H } = await load(file);
  const px = (x: number, y: number) => data.readUInt32BE((y * W + x) * 4);
  for (let w = 16; w < W; w++) {
    let same = true;
    for (let x = 0; x + w < W && same; x++)
      for (let y = 0; y < H && same; y++) same = px(x, y) === px(x + w, y);
    if (same) {
      await sharp(file)
        .extract({ left: 0, top: 0, width: w, height: H })
        .png({ palette: true })
        .toFile(resolve(OUT, 'sprites/grass-tile.png'));
      console.log(`tile   sprites/grass-tile.png → ${w}×${H}`);
      return;
    }
  }
  throw new Error('grass strip has no exact horizontal period');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await (process.argv.includes('--detect') ? runDetect() : runApply());
}
