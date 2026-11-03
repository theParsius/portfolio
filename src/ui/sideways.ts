import { scrollBehavior } from '../lib/motion';

export interface Level {
  kind: 'main' | 'room';
  scroller: HTMLElement;
  track: HTMLElement;
}

/** Vertical wheel / trackpad scroll moves the level sideways. */
export function mapWheel(scroller: HTMLElement, onScroll?: () => void): void {
  scroller.addEventListener(
    'wheel',
    (e) => {
      if (e.ctrlKey || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const unit = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? scroller.clientWidth : 1;
      scroller.scrollLeft += e.deltaY * unit;
      e.preventDefault();
      onScroll?.();
    },
    { passive: false },
  );
}

/** Left edge of an element in track coordinates. */
export function trackX(level: Level, el: Element): number {
  return el.getBoundingClientRect().left - level.track.getBoundingClientRect().left;
}

export function goTo(level: Level, el: Element, behavior = scrollBehavior()): void {
  level.scroller.scrollTo({ left: Math.max(0, trackX(level, el)), behavior });
}

/** ← / → scroll 60% of a screen. Returns true when handled. */
export function arrowScroll(level: Level, e: KeyboardEvent): boolean {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return false;
  if (e.metaKey || e.ctrlKey || e.altKey) return false;
  const t = e.target as Element | null;
  if (t?.closest('input, textarea, select, [contenteditable]')) return false;
  const dir = e.key === 'ArrowRight' ? 1 : -1;
  level.scroller.scrollBy({
    left: dir * level.scroller.clientWidth * 0.6,
    behavior: scrollBehavior(),
  });
  return true;
}
