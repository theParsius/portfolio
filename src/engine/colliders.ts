import type { Level } from '../ui/sideways';
import type { Rect, World } from './physics';

export interface BlockInfo {
  el: HTMLElement;
  /** card: a card's ? block · exit: a room's exit block · shot: a floating screenshot ·
   *  link: a room's store or prev / next button (bumping it follows the link) */
  kind: 'card' | 'exit' | 'shot' | 'link';
  /** Project id for card blocks; null for exit blocks. */
  id: string | null;
  exit: boolean;
  cool: number;
  /** Hovering screenshots: index for hoverOffset(), and the rect with no hover applied. */
  hover: number | null;
  base: Rect;
}

export interface Npc extends Rect {
  card: HTMLElement;
}

export interface Colliders extends World {
  blockInfo: BlockInfo[];
  npcs: Npc[];
  flag: Rect | null;
  height: number;
}

const visible = (el: Element) => el.getClientRects().length > 0;

/**
 * Reads every collider from the live DOM of a level.
 *   [data-solid]          the element's top edge is a one-way platform
 *   [data-solid="text"]   one platform per rendered line (top + 18% of the line height)
 *   [data-solid="kids"]   one platform per child
 *   .qblock               solid box that reports head-bumps
 *   .shot                 same (screenshots in rooms hover, and show their plaque when bumped)
 *   [data-bump]           same (room links: bumping one follows it)
 *   .floor                solid ground
 */
export function collect(level: Level, previous?: Colliders): Colliders {
  const t = level.track.getBoundingClientRect();
  const plats: Rect[] = [];
  const add = (r: { left: number; top: number; width: number; height: number }) => {
    if (r.width > 4 && r.height > 0)
      plats.push({ x: r.left - t.left, y: r.top - t.top, w: r.width, h: r.height });
  };

  for (const el of level.track.querySelectorAll<HTMLElement>('[data-solid]')) {
    if (!visible(el)) continue;
    const mode = el.dataset.solid;
    if (mode === 'text') {
      const range = document.createRange();
      range.selectNodeContents(el);
      const lines: { top: number; left: number; right: number; height: number }[] = [];
      for (const r of range.getClientRects()) {
        if (r.width === 0) continue;
        const line = lines.find((l) => Math.abs(l.top - r.top) < 4);
        if (line) {
          line.left = Math.min(line.left, r.left);
          line.right = Math.max(line.right, r.right);
        } else lines.push({ top: r.top, left: r.left, right: r.right, height: r.height });
      }
      for (const l of lines)
        add({
          left: l.left,
          top: l.top + l.height * 0.18,
          width: l.right - l.left,
          height: l.height,
        });
    } else if (mode === 'kids') {
      for (const c of el.children) if (visible(c)) add(c.getBoundingClientRect());
    } else add(el.getBoundingClientRect());
  }

  const floorEl = level.track.querySelector(':scope > .floor');
  const fr = floorEl?.getBoundingClientRect();
  const floor = fr
    ? { x: fr.left - t.left, y: fr.top - t.top, w: fr.width, h: fr.height }
    : { x: 0, y: t.height - 48, w: level.track.scrollWidth, h: 48 };

  const blockEls = [
    ...level.track.querySelectorAll<HTMLElement>('.qblock, .shot, [data-bump]'),
  ].filter(visible);
  const blocks: Rect[] = [];
  const blockInfo: BlockInfo[] = [];
  for (const el of blockEls) {
    const r = el.getBoundingClientRect();
    const rect = { x: r.left - t.left, y: r.top - t.top, w: r.width, h: r.height };
    blocks.push(rect);
    // Keep cooldowns across rebuilds.
    const prev = previous?.blockInfo.find((b) => b.el === el);
    const exit = el.hasAttribute('data-exit');
    const shot = el.classList.contains('shot');
    // A hovering shot is read wherever it is right now: take its hover offset back off.
    const slot = shot ? el.closest<HTMLElement>('.shot-slot') : null;
    const hx = parseFloat(slot?.style.getPropertyValue('--hx') ?? '') || 0;
    const hy = parseFloat(slot?.style.getPropertyValue('--hy') ?? '') || 0;
    blockInfo.push({
      el,
      kind: shot ? 'shot' : exit ? 'exit' : el.hasAttribute('data-bump') ? 'link' : 'card',
      id: el.closest<HTMLElement>('.card')?.dataset.id ?? null,
      exit,
      cool: prev?.cool ?? 0,
      hover: slot ? Number(slot.dataset.n) || 0 : null,
      base: { ...rect, x: rect.x - hx, y: rect.y - hy },
    });
  }

  const npcs: Npc[] = [...level.track.querySelectorAll<HTMLElement>('.card .mascot')]
    .filter(visible)
    .map((el) => {
      const r = el.getBoundingClientRect();
      return {
        x: r.left - t.left,
        y: r.top - t.top,
        w: r.width,
        h: r.height,
        card: el.closest('.card') as HTMLElement,
      };
    });

  const flagEl = level.kind === 'main' ? level.track.querySelector('[data-flag]') : null;
  const flr = flagEl && visible(flagEl) ? flagEl.getBoundingClientRect() : null;
  const flag = flr
    ? { x: flr.left - t.left, y: flr.top - t.top, w: flr.width, h: flr.height }
    : null;

  return {
    plats,
    blocks,
    blockInfo,
    floor,
    npcs,
    flag,
    width: level.track.scrollWidth,
    height: level.track.clientHeight,
  };
}
