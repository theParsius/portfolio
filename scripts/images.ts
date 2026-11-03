/**
 * Screenshot pipeline: assets-src/projects/<id>/{originals,starter}/ → public/projects/<id>/.
 *
 *   tsx scripts/images.ts
 *
 * For each starter shot (PDF crop, shot-N.webp) the visually closest full-size original is found
 * by comparing tiny greyscale thumbnails. If it is close enough, it replaces the starter shot.
 * Every shot is exported in three sizes (names derived by shotVariants() in src/lib/shots.ts):
 *   shot-N.webp        ≤ 1440px wide, lightbox
 *   shot-N-room.webp   room row (portrait 1080px tall, landscape 1280px wide; 2× of the CSS size)
 *   shot-N-thumb.webp  card thumbnail (2× of the card's thumbnail slot)
 * Sizes and the chosen source are written to src/content/shots.json.
 */
import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const SRC = resolve(ROOT, 'assets-src/projects');
const OUT = resolve(ROOT, 'public/projects');
const MANIFEST = resolve(ROOT, 'src/content/shots.json');

const MAX_W = 1440;
const MATCH_MAX = 22; // mean abs grey difference (0–255) on a 24 × 24 thumbnail
const QUALITY = 80;

export interface ShotEntry {
  width: number;
  height: number;
  source: string; // relative to assets-src/projects/<id>/
}

async function signature(file: string): Promise<{ grey: Buffer; ratio: number }> {
  const m = await sharp(file).metadata();
  const grey = await sharp(file).resize(24, 24, { fit: 'fill' }).greyscale().raw().toBuffer();
  return { grey, ratio: (m.width ?? 1) / (m.height ?? 1) };
}

function distance(a: Buffer, b: Buffer): number {
  let d = 0;
  for (let i = 0; i < a.length; i++) d += Math.abs((a[i] ?? 0) - (b[i] ?? 0));
  return d / a.length;
}

async function exportShot(
  src: string,
  dir: string,
  n: number,
): Promise<{ width: number; height: number }> {
  const meta = await sharp(src).metadata();
  const portrait = (meta.height ?? 0) > (meta.width ?? 0);
  const full = await sharp(src)
    .resize({ width: MAX_W, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(resolve(dir, `shot-${n}.webp`));
  await sharp(src)
    .resize(
      portrait
        ? { height: 1080, withoutEnlargement: true }
        : { width: 1280, withoutEnlargement: true },
    )
    .webp({ quality: QUALITY })
    .toFile(resolve(dir, `shot-${n}-room.webp`));
  // Card thumbnails: 3 portrait shots side by side (~110px each) or 1 landscape (~336px), 190px tall max.
  await sharp(src)
    .resize(
      portrait
        ? { height: 380, withoutEnlargement: true }
        : { width: 680, withoutEnlargement: true },
    )
    .webp({ quality: 75 })
    .toFile(resolve(dir, `shot-${n}-thumb.webp`));
  return { width: full.width, height: full.height };
}

async function run(): Promise<void> {
  const manifest: Record<string, ShotEntry[]> = {};
  for (const id of readdirSync(SRC).sort()) {
    const starterDir = resolve(SRC, id, 'starter');
    if (!existsSync(starterDir)) continue;
    const starters = readdirSync(starterDir)
      .filter((f) => /^shot-\d+\.webp$/.test(f))
      .sort((a, b) => parseInt(a.slice(5)) - parseInt(b.slice(5)));
    const origDir = resolve(SRC, id, 'originals');
    const originals = existsSync(origDir)
      ? readdirSync(origDir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f) && !/^icon\./.test(f))
      : [];
    const sigs = await Promise.all(
      originals.map(async (f) => ({ f, ...(await signature(resolve(origDir, f))) })),
    );
    const used = new Set<string>();
    manifest[id] = [];

    for (const [i, s] of starters.entries()) {
      const n = i + 1;
      const target = await signature(resolve(starterDir, s));
      let best: { f: string; d: number } | null = null;
      for (const o of sigs) {
        if (used.has(o.f) || Math.abs(o.ratio - target.ratio) > 0.08) continue;
        const d = distance(o.grey, target.grey);
        if (!best || d < best.d) best = { f: o.f, d };
      }
      const match = best && best.d <= MATCH_MAX ? best : null;
      if (match) used.add(match.f);
      const source = match ? `originals/${match.f}` : `starter/${s}`;
      const dims = await exportShot(resolve(SRC, id, source), resolve(OUT, id), n);
      manifest[id].push({ ...dims, source });
      console.log(
        `${id} shot-${n}: ${source} ${dims.width}×${dims.height}` +
          (best ? ` (closest ${best.f} d=${best.d.toFixed(1)})` : ''),
      );
    }
  }
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await run();
