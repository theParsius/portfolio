import { press, release, type Key } from '../engine/input';
import type { Input } from '../engine/physics';

/** On-screen ◀ ▶ ▼ Jump buttons, shown while playing. Pointer events, so mouse and touch both work. */
export function mountTouchPad(input: Input): HTMLElement {
  const pad = document.createElement('div');
  pad.className = 'pad';
  pad.setAttribute('aria-hidden', 'true');
  pad.innerHTML = `
    <div><button type="button" tabindex="-1" data-k="left">◀</button><button type="button" tabindex="-1" data-k="right">▶</button></div>
    <div><button type="button" tabindex="-1" data-k="down">▼</button><button type="button" tabindex="-1" class="jump" data-k="jump">Jump</button></div>`;
  for (const b of pad.querySelectorAll<HTMLButtonElement>('button')) {
    const k = b.dataset.k as Key;
    const down = (e: PointerEvent) => {
      e.preventDefault();
      b.setPointerCapture?.(e.pointerId);
      press(input, k);
    };
    const up = (e: PointerEvent) => {
      e.preventDefault();
      release(input, k);
    };
    b.addEventListener('pointerdown', down);
    for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture'] as const)
      b.addEventListener(ev, up);
    b.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  document.body.append(pad);
  return pad;
}
