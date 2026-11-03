import type { Level } from '../ui/sideways';
import type { Rect, World } from './physics';

export interface BlockInfo {
  el: HTMLElement;
  /** Project id for card blocks; null for exit blocks. */
  id: string | null;
  exit: boolean;
  cool: number;
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
 *   .qblock               solid box
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

  const blockEls = [...level.track.querySelectorAll<HTMLElement>('.qblock')].filter(visible);
  const blocks: Rect[] = [];
  const blockInfo: BlockInfo[] = [];
  for (const el of blockEls) {
    const r = el.getBoundingClientRect();
    blocks.push({ x: r.left - t.left, y: r.top - t.top, w: r.width, h: r.height });
    // Keep cooldowns across rebuilds.
    const prev = previous?.blockInfo.find((b) => b.el === el);
    blockInfo.push({
      el,
      id: el.closest<HTMLElement>('.card')?.dataset.id ?? null,
      exit: el.hasAttribute('data-exit'),
      cool: prev?.cool ?? 0,
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
