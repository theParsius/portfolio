import { FEEL } from './constants';
import type { Player } from './physics';
import { frames, SPRITE_H, SPRITE_W, type Pose } from './playerSprite';

/** The player sprite: a 12 × 18 canvas drawn at ×3, moved with transform inside the active track. */
export class Actor {
  readonly el: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private drawn: HTMLCanvasElement | null = null;
  private distance = 0;

  constructor() {
    this.el = document.createElement('canvas');
    this.el.className = 'actor';
    this.el.width = SPRITE_W;
    this.el.height = SPRITE_H;
    this.el.setAttribute('aria-hidden', 'true');
    this.ctx = this.el.getContext('2d');
  }

  advance(p: Player, dt: number): void {
    this.distance += Math.abs(p.vx) * dt;
  }

  render(p: Player): void {
    let pose: Pose = 'idle';
    if (!p.ground) pose = 'jump';
    else if (Math.abs(p.vx) > 25)
      pose = Math.floor(this.distance / FEEL.runFrameDistance) % 2 ? 'runA' : 'runB';
    const img = frames()[pose][p.face < 0 ? 1 : 0];
    if (img !== this.drawn && this.ctx) {
      this.ctx.clearRect(0, 0, SPRITE_W, SPRITE_H);
      this.ctx.drawImage(img, 0, 0);
      this.drawn = img;
    }
    this.el.style.transform = `translate(${Math.round(p.x + FEEL.spriteOffsetX)}px,${Math.round(p.y)}px)`;
  }

  reset(): void {
    this.drawn = null;
  }
}
