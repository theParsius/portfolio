/**
 * Clouds along a whole level (main level or a room), placed after layout so they never cover text:
 * every few hundred px a cloud tries a few heights in the upper part of the track and is skipped
 * where none clears the headings, paragraphs and buttons. Behind everything, decorative only.
 * Seeded per level, so a resize moves clouds only where the layout itself moved.
 */
import { spriteImg } from '../lib/sprites';

const CLOUD = { w: 252, h: 58 }; // clouds.png at 1×
/** What a cloud must not cover. */
const TEXT = 'h1, h2, h3, p, dl, .index, .btn, .cta, .r-meta, .r-title img, .avatar, .deco';
/**
 * Opaque things in front of the sky. A cloud may slip behind one from the side, but its body (the
 * bottom half of its box; the top half is mostly bumps and empty sky) must stay mostly visible.
 */
const OPAQUE = '.card .frame, .shot';
const MIN_VISIBLE = 0.6;
const DRIFT = 70; // px a cloud drifts left (see @keyframes drift)

interface Box {
  l: number;
  t: number;
  r: number;
  b: number;
}

/** Small deterministic PRNG (mulberry32) seeded from a string. */
function rng(seed: string): () => number {
  let a = [...seed].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 2654435761), 1779033703);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function placeClouds(track: HTMLElement, seed: string): void {
  let sky = track.querySelector<HTMLElement>(':scope > .sky');
  if (!sky) {
    sky = document.createElement('div');
    sky.className = 'sky';
    sky.setAttribute('aria-hidden', 'true');
    track.prepend(sky);
  }
  const width = track.scrollWidth;
  const height = track.clientHeight;
  if (!width || !height) return;
  const origin = track.getBoundingClientRect();
  const boxes = (sel: string): Box[] =>
    [...track.querySelectorAll(sel)]
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width && r.height)
      .map((r) => ({
        l: r.left - origin.left,
        t: r.top - origin.top,
        r: r.right - origin.left,
        b: r.bottom - origin.top,
      }));
  const blocked = boxes(TEXT);
  const opaque = boxes(OPAQUE);
  const overlap = (a: Box, o: Box) =>
    Math.max(0, Math.min(a.r, o.r) - Math.max(a.l, o.l)) *
    Math.max(0, Math.min(a.b, o.b) - Math.max(a.t, o.t));
  const hits = (c: Box) => blocked.some((o) => overlap(c, o) > 0);
  /** Share of a box left in view (opaque boxes rarely overlap each other, so a sum is close). */
  const visible = (c: Box) =>
    1 - opaque.reduce((a, o) => a + overlap(c, o), 0) / ((c.r - c.l) * (c.b - c.t));

  const rand = rng(seed);
  const phone = innerWidth <= 760;
  const html: string[] = [];
  for (let x = 40 + rand() * 160; x < width - 120;) {
    const s = !phone && rand() < 0.45 ? 2 : 1;
    const w = CLOUD.w * s;
    const h = CLOUD.h * s;
    const flip = rand() < 0.5;
    const dur = Math.round(50 + rand() * 50);
    const delay = Math.round(rand() * dur);
    // Candidate heights in the top third, in a shuffled order so rows don't line up.
    const tops = [0.03, 0.08, 0.14, 0.2, 0.27].sort(() => rand() - 0.5);
    const top = tops
      .map((f) => Math.round(f * height))
      .find(
        (t) =>
          t + h <= height * 0.42 &&
          !hits({ l: x - DRIFT - 12, t: t - 12, r: x + w + 12, b: t + h + 12 }) &&
          visible({ l: x, t: t + h / 2, r: x + w, b: t + h }) >= MIN_VISIBLE,
      );
    if (top !== undefined) {
      html.push(
        spriteImg('/sprites/clouds.png', `cloud move${flip ? ' flip' : ''}`, {
          style: `left:${Math.round(x)}px;top:${top}px;--s:${s};--dur:${dur}s;animation-delay:-${delay}s`,
        }),
      );
      x += w + 140 + rand() * 260;
    } else x += 120; // no clear spot here: try a little further on
  }
  sky.innerHTML = html.join('');
}
