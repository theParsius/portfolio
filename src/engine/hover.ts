import { reducedMotion } from '../lib/motion';
import { FEEL } from './constants';

/**
 * Where hovering screenshot `n` sits at time `t` (seconds), relative to its laid-out spot: a small
 * wandering sway in x and y, out of phase with its neighbours. The room view draws it and the
 * engine moves the matching platform with the same function, so what you see is what you stand on.
 */
export function hoverOffset(n: number, t: number): { x: number; y: number } {
  if (reducedMotion()) return { x: 0, y: 0 };
  const tau = Math.PI * 2;
  return {
    x: FEEL.hoverX * Math.sin((tau * t) / FEEL.hoverPeriodX + n * 1.9),
    y: FEEL.hoverY * Math.sin((tau * t) / FEEL.hoverPeriodY + n * 2.4),
  };
}

/** The clock both sides use. */
export const hoverClock = (): number => performance.now() / 1000;

/** Moves every `.shot-slot` in `track` to its hover offset, every frame, while the track is shown. */
export function startShotHover(track: HTMLElement, shown: () => boolean): void {
  const frame = () => {
    if (shown() && !document.hidden) {
      const t = hoverClock();
      for (const sl of track.querySelectorAll<HTMLElement>('.shot-slot')) {
        const o = hoverOffset(Number(sl.dataset.n) || 0, t);
        sl.style.setProperty('--hx', `${o.x.toFixed(2)}px`);
        sl.style.setProperty('--hy', `${o.y.toFixed(2)}px`);
      }
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
