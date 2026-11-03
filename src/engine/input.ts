import type { Input } from './physics';

type Key = 'left' | 'right' | 'jump' | 'down';

const BY_CODE: Record<string, Key> = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  ArrowUp: 'jump',
  KeyW: 'jump',
  Space: 'jump',
  ArrowDown: 'down',
  KeyS: 'down',
};
const BY_KEY: Record<string, Key> = {
  ArrowLeft: 'left',
  Left: 'left',
  a: 'left',
  A: 'left',
  ArrowRight: 'right',
  Right: 'right',
  d: 'right',
  D: 'right',
  ArrowUp: 'jump',
  Up: 'jump',
  w: 'jump',
  W: 'jump',
  ' ': 'jump',
  Spacebar: 'jump',
  ArrowDown: 'down',
  Down: 'down',
  s: 'down',
  S: 'down',
};

/** event.code first (layout independent), then event.key for odd browsers and layouts. */
export const keyOf = (e: KeyboardEvent): Key | undefined => BY_CODE[e.code] ?? BY_KEY[e.key];

export function press(input: Input, k: Key): void {
  if (k === 'jump' && !input.jump) input.jumpPressed = true;
  if (k === 'down') input.dropPressed = true;
  input[k] = true;
}

export function release(input: Input, k: Key): void {
  input[k] = false;
}

export function clearKeys(input: Input): void {
  input.left = input.right = input.jump = input.down = false;
  input.jumpPressed = input.dropPressed = false;
}

/** Puts keyboard focus back on the page so keys reach us (e.g. after a click inside an iframe). */
export function focusGame(): void {
  try {
    window.focus();
  } catch {
    /* cross-origin parent */
  }
  document.body.focus({ preventScroll: true });
}

export type { Key };
