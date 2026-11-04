import type { Sfx } from './sound';

/** Tiny synthesized blips: no audio files. */
let ctx: AudioContext | null = null;

function tone(
  type: OscillatorType,
  from: number,
  to: number,
  start: number,
  dur: number,
  vol: number,
): void {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(from, start);
  o.frequency.exponentialRampToValueAtTime(to, start + dur);
  g.gain.setValueAtTime(vol, start);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g).connect(ctx.destination);
  o.start(start);
  o.stop(start + dur + 0.02);
}

export function play(name: Sfx): void {
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  const t = ctx.currentTime;
  switch (name) {
    case 'jump':
      tone('square', 260, 620, t, 0.13, 0.06);
      break;
    case 'coin':
      tone('square', 988, 988, t, 0.07, 0.05);
      tone('square', 1319, 1319, t + 0.07, 0.18, 0.05);
      break;
    case 'star':
      tone('square', 1047, 1047, t, 0.06, 0.045);
      tone('square', 1319, 1319, t + 0.06, 0.06, 0.045);
      tone('square', 1568, 1568, t + 0.12, 0.06, 0.045);
      tone('square', 2093, 2093, t + 0.18, 0.2, 0.045);
      break;
    case 'bump':
      tone('triangle', 180, 90, t, 0.1, 0.18);
      break;
    case 'land':
      tone('triangle', 110, 60, t, 0.06, 0.12);
      break;
  }
}
