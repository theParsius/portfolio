import { FEEL } from './constants';

interface Particle {
  kind: 'coin' | 'dust';
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  el: HTMLElement;
}

/** Coins and dust: DOM nodes in the active track, simulated with the player. */
export class Fx {
  private items: Particle[] = [];

  constructor(private track: () => HTMLElement) {}

  private add(
    kind: Particle['kind'],
    x: number,
    y: number,
    vx: number,
    vy: number,
    life: number,
  ): void {
    const el = document.createElement('div');
    el.className = `fx ${kind}`;
    el.setAttribute('aria-hidden', 'true');
    this.track().append(el);
    this.items.push({ kind, x, y, vx, vy, life, max: life, el });
  }

  coin(x: number, y: number): void {
    this.add('coin', x, y, 0, -FEEL.coinSpeed, FEEL.coinLife);
  }

  dust(x: number, y: number): void {
    const n = FEEL.dustCount;
    for (let i = 0; i < n; i++) {
      const k = i - (n - 1) / 2;
      this.add('dust', x + k * 6, y - 2, k * 55, -40 - Math.random() * 60, FEEL.dustLife);
    }
  }

  update(dt: number): void {
    for (const f of this.items) {
      f.life -= dt;
      if (f.kind === 'coin') f.vy += FEEL.coinGravity * dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
    }
    this.items = this.items.filter((f) => f.life > 0 || (f.el.remove(), false));
  }

  render(): void {
    for (const f of this.items) {
      f.el.style.transform = `translate(${Math.round(f.x)}px,${Math.round(f.y)}px)`;
      if (f.kind === 'dust') f.el.style.opacity = String(Math.max(0, f.life / f.max));
    }
  }

  clear(): void {
    for (const f of this.items) f.el.remove();
    this.items = [];
  }
}
