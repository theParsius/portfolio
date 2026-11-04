/**
 * Optional play-mode sound: off by default, remembered in localStorage. The synth (./sfx) is
 * only loaded the first time sound is switched on.
 */
export type Sfx = 'jump' | 'coin' | 'bump' | 'land' | 'star';

const KEY = 'theparsius:sound';
let on = false;
let synth: typeof import('./sfx') | null = null;

try {
  on = localStorage.getItem(KEY) === 'on';
} catch {
  /* storage blocked: stay off */
}

export const soundOn = (): boolean => on;

export async function setSound(v: boolean): Promise<void> {
  on = v;
  try {
    localStorage.setItem(KEY, v ? 'on' : 'off');
  } catch {
    /* not remembered, still works for this visit */
  }
  if (v) synth ??= await import('./sfx');
}

/** Loads the synth if sound was left on last visit. Call from a user gesture (play start). */
export function warmSound(): void {
  if (on && !synth) void setSound(true);
}

export function sfx(name: Sfx): void {
  if (on) synth?.play(name);
}
