import { reducedMotion } from '../lib/motion';

export type Point = { x: number; y: number };
const MAX_MS = 800; // the transition never blocks routing longer than this

const center = (): Point => ({ x: innerWidth / 2, y: innerHeight / 2 });
export const pointOf = (el: Element): Point => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

let veil: HTMLElement | null = null;
let iris: HTMLElement | null = null;
function layer(cls: string): HTMLElement {
  const el = document.createElement('div');
  el.className = cls;
  el.setAttribute('aria-hidden', 'true');
  document.body.append(el);
  return el;
}

/** Resolves when the animation ends or after `ms`, whichever is first. */
function settle(a: Animation, ms: number): Promise<void> {
  return Promise.race([
    a.finished.then(
      () => undefined,
      () => undefined,
    ),
    new Promise<void>((r) => setTimeout(r, ms)),
  ]);
}

async function fade(swap: () => void | Promise<void>): Promise<void> {
  veil ??= layer('fade-veil');
  const out = veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 75, fill: 'forwards' });
  await settle(out, 200);
  await swap();
  const back = veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 75, fill: 'forwards' });
  await settle(back, 200);
  veil.getAnimations().forEach((a) => a.cancel());
}

/** Stepped circle wipe closing on `from`, opening on the centre of the new screen. */
async function irisWipe(swap: () => void | Promise<void>, from: Point): Promise<void> {
  iris ??= layer('iris');
  const el = iris;
  const big = `${Math.hypot(innerWidth, innerHeight) * 2}px`;
  const place = (p: Point) => {
    el.style.left = `${p.x}px`;
    el.style.top = `${p.y}px`;
  };
  place(from);
  el.style.display = 'block';
  await settle(
    el.animate(
      [
        { width: big, height: big },
        { width: '0px', height: '0px' },
      ],
      {
        duration: 380,
        easing: 'steps(10, end)',
        fill: 'forwards',
      },
    ),
    MAX_MS / 2,
  );
  await swap();
  place(center());
  await settle(
    el.animate(
      [
        { width: '0px', height: '0px' },
        { width: big, height: big },
      ],
      {
        duration: 420,
        easing: 'steps(12, end)',
        fill: 'forwards',
      },
    ),
    MAX_MS / 2,
  );
  el.style.display = 'none';
  el.getAnimations().forEach((a) => a.cancel());
}

/**
 * Runs `swap` (the actual view change) inside a transition.
 * 'fade' = 150 ms, for clicks; 'iris' for play mode. Reduced motion: no animation at all.
 */
export async function transition(
  kind: 'fade' | 'iris',
  swap: () => void | Promise<void>,
  from: Point = center(),
): Promise<void> {
  if (reducedMotion()) return void (await swap());
  return kind === 'iris' ? irisWipe(swap, from) : fade(swap);
}

/** Resolves when `done()` is true, or after MAX_MS. */
export function until(done: () => boolean): Promise<void> {
  return new Promise((res) => {
    const t0 = performance.now();
    const tick = () =>
      done() || performance.now() - t0 > MAX_MS ? res() : requestAnimationFrame(tick);
    tick();
  });
}
