import sheet from '../content/player.json' with { type: 'json' };
import { asset } from '../lib/asset';
import { FEEL } from './constants';
import type { Player } from './physics';

type Anim = keyof typeof sheet.anims;
const SCALE = 3;

/**
 * The player: one frame of public/sprites/player.png drawn into a small canvas at ×3,
 * moved with transform inside the active track. Run frames advance by distance travelled.
 */
export class Actor {
  readonly el: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private img = new Image();
  private drawn = '';
  private distance = 0;
  private idleClock = 0;
  private landClock = 0;
  private bumpClock = 0;

  constructor() {
    this.el = document.createElement('canvas');
    this.el.className = 'actor';
    this.el.width = sheet.frameW;
    this.el.height = sheet.frameH;
    this.el.style.width = `${sheet.frameW * SCALE}px`;
    this.el.style.height = `${sheet.frameH * SCALE}px`;
    this.el.setAttribute('aria-hidden', 'true');
    this.ctx = this.el.getContext('2d');
    this.img.src = asset('/sprites/player.png');
    this.img.onload = () => (this.drawn = '');
  }

  /** Called once per physics step. */
  advance(p: Player, dt: number): void {
    this.distance += Math.abs(p.vx) * dt;
    this.idleClock += dt;
    this.landClock = Math.max(0, this.landClock - dt);
    this.bumpClock = Math.max(0, this.bumpClock - dt);
  }

  landed(): void {
    this.landClock = FEEL.landFrameTime;
  }

  bumped(): void {
    this.bumpClock = FEEL.bumpFrameTime;
  }

  private frame(p: Player): number {
    const pick = (a: Anim, i = 0) => {
      const f = sheet.anims[a];
      return f[((i % f.length) + f.length) % f.length] ?? 0;
    };
    if (this.bumpClock > 0) return pick('bump');
    if (!p.ground) return pick(p.vy < 0 ? 'jump' : 'fall');
    if (this.landClock > 0) return pick('land');
    if (Math.abs(p.vx) > 25) {
      this.idleClock = 0;
      return pick('run', Math.floor(this.distance / FEEL.runFrameDistance));
    }
    // Idle: blink (second idle frame) briefly every few seconds.
    return pick('idle', this.idleClock % FEEL.blinkEvery > FEEL.blinkEvery - 0.14 ? 1 : 0);
  }

  render(p: Player): void {
    const f = this.frame(p);
    const key = `${f}:${p.face < 0 ? 'l' : 'r'}`;
    if (key !== this.drawn && this.ctx && this.img.complete && this.img.naturalWidth) {
      const { frameW: w, frameH: h } = sheet;
      this.ctx.setTransform(p.face < 0 ? -1 : 1, 0, 0, 1, p.face < 0 ? w : 0, 0);
      this.ctx.clearRect(0, 0, w, h);
      this.ctx.drawImage(this.img, f * w, 0, w, h, 0, 0, w, h);
      this.drawn = key;
    }
    this.el.style.transform = `translate(${Math.round(p.x + FEEL.spriteOffsetX)}px,${Math.round(p.y + p.h - sheet.frameH * SCALE)}px)`;
  }

  reset(): void {
    this.drawn = '';
    this.landClock = this.bumpClock = this.idleClock = 0;
  }
}
