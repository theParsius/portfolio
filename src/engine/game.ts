import type { Level } from '../ui/sideways';
import { toast } from '../ui/toast';
import { Actor } from './actor';
import { follow } from './camera';
import { collect, type Colliders } from './colliders';
import { FEEL, PHYSICS } from './constants';
import { Fx } from './fx';
import { clearKeys, focusGame, keyOf, press, release } from './input';
import { createInput, createPlayer, overlaps, step, type Player } from './physics';

export interface GameHost {
  /** Header "found" counter element. */
  foundEl: HTMLElement;
  totalProjects: number;
  heroSprite: HTMLElement | null;
  /** True while a room transition runs or the lightbox is open (no focus nagging, no bumps). */
  blocked(): boolean;
  /** Called after a card's ? block is head-bumped. */
  onCardBlock(id: string, el: HTMLElement): void;
  /** Called after a room's exit block is head-bumped. */
  onExitBlock(el: HTMLElement): void;
  /** Called when the flag is touched. */
  onFlag(): void;
}

export interface Snapshot {
  p: Player;
  camX: number;
}

const coarse = () => matchMedia('(pointer: coarse)').matches;

export class Game {
  on = false;
  paused = false;
  readonly found = new Set<string>();
  readonly p = createPlayer();
  readonly input = createInput();
  level: Level;
  world: Colliders | null = null;
  camX = 0;

  private actor = new Actor();
  private fx: Fx;
  private raf = 0;
  private last = 0;
  private acc = 0;
  private focusClock = 0;
  private talking: HTMLElement | null = null;
  private cleared = false;
  private timers: number[] = [];

  constructor(
    private host: GameHost,
    initial: Level,
  ) {
    this.level = initial;
    this.fx = new Fx(() => this.level.track);
    initial.track.append(this.actor.el);
  }

  // ---------- Lifecycle ----------

  start(): void {
    if (this.on) return;
    this.on = true;
    this.paused = false;
    document.body.classList.add('playing');
    if (this.host.heroSprite) this.host.heroSprite.style.visibility = 'hidden';
    focusGame();
    // Wait a frame so the ? blocks (shown by body.playing) have layout.
    requestAnimationFrame(() => {
      this.rebuild();
      this.spawn();
      this.last = performance.now();
      this.acc = 0;
      toast(
        coarse()
          ? 'Use the pad to move and jump. Down drops through. Tap Stop to exit.'
          : 'Arrows or WASD to move. Up or Space to jump. Down to drop through. Esc to stop.',
        5200,
      );
      this.raf = requestAnimationFrame(this.loop);
    });
  }

  stop(): void {
    if (!this.on) return;
    this.on = false;
    cancelAnimationFrame(this.raf);
    for (const t of this.timers) clearTimeout(t);
    this.timers = [];
    document.body.classList.remove('playing');
    if (this.host.heroSprite) this.host.heroSprite.style.visibility = '';
    this.fx.clear();
    this.actor.reset();
    this.setTalking(null);
    clearKeys(this.input);
  }

  toggle(): void {
    if (this.on) this.stop();
    else this.start();
  }

  pause(v: boolean): void {
    this.paused = v;
    clearKeys(this.input);
    if (!v && this.on) {
      this.last = performance.now();
      this.rebuild();
      focusGame();
    }
  }

  // ---------- Levels ----------

  /** Moves the actor out of a track that is about to be rebuilt. */
  park(level: Level): void {
    this.fx.clear();
    this.setTalking(null);
    level.track.append(this.actor.el);
    this.level = level;
  }

  /**
   * Makes `level` the active one. With a snapshot the player and camera are restored exactly
   * (velocity reset); otherwise the player spawns (room entrance, or the hero on the main level).
   */
  setLevel(level: Level, restore?: Snapshot | null): void {
    this.park(level);
    if (!this.on) return;
    this.rebuild();
    if (restore) {
      Object.assign(this.p, restore.p, { vx: 0, vy: 0 });
      this.camX = restore.camX;
      level.scroller.scrollLeft = this.camX;
    } else this.spawn();
    clearKeys(this.input);
  }

  snapshot(): Snapshot {
    return { p: { ...this.p }, camX: this.camX };
  }

  rebuild(): void {
    this.world = collect(this.level, this.world ?? undefined);
  }

  /** Wheel or scrollbar moved the view during play: keep the float camera in sync. */
  syncCamera(): void {
    if (this.on) this.camX = this.level.scroller.scrollLeft;
  }

  private spawn(): void {
    const sc = this.level.scroller;
    const viewL = sc.scrollLeft;
    const viewR = viewL + sc.clientWidth;
    const p = this.p;
    p.x = viewL + sc.clientWidth * 0.35;
    p.y = 40;
    const t = this.level.track.getBoundingClientRect();
    if (this.level.kind === 'main' && this.host.heroSprite) {
      const r = this.host.heroSprite.getBoundingClientRect();
      const x = r.left - t.left;
      if (x > viewL - 20 && x < viewR) {
        p.x = x - FEEL.spriteOffsetX;
        p.y = r.top - t.top;
      }
    } else if (this.level.kind === 'room' && viewL < 40 && this.world) {
      // Step out on the floor, 50 px right of the entrance exit block.
      const i = this.world.blockInfo.findIndex((b) => b.exit);
      const ex = this.world.blocks[i];
      if (ex) {
        p.x = ex.x + ex.w + 50;
        p.y = this.world.floor.y - p.h;
      }
    }
    Object.assign(p, { vx: 0, vy: 0, ground: false, coyote: 0, buffer: 0, drop: 0, face: 1 });
    this.camX = sc.scrollLeft;
  }

  // ---------- Input ----------

  /** Returns true when the key was handled (caller should stop there). */
  keyDown(e: KeyboardEvent): boolean {
    if (!this.on) return false;
    if (e.key === 'Escape' || e.code === 'Escape') {
      this.stop();
      return true;
    }
    const k = keyOf(e);
    if (!k) return false;
    e.preventDefault();
    e.stopPropagation();
    if (!e.repeat) press(this.input, k);
    else this.input[k] = true;
    return true;
  }

  keyUp(e: KeyboardEvent): void {
    const k = keyOf(e);
    if (!k) return;
    release(this.input, k);
    if (this.on) e.preventDefault();
  }

  clearKeys(): void {
    clearKeys(this.input);
  }

  // ---------- Loop ----------

  private loop = (now: number): void => {
    if (!this.on) return;
    const dt = Math.max(0, Math.min(PHYSICS.maxFrame, (now - this.last) / 1000 || 0));
    this.last = now;

    this.focusClock += dt;
    if (this.focusClock > 0.5) {
      this.focusClock = 0;
      if (!document.hasFocus() && !this.host.blocked()) {
        toast(
          'Click anywhere on the page so it can hear your keys, or use the on-screen pad.',
          1200,
        );
      }
    }

    if (!this.paused && this.world) {
      this.acc += dt;
      while (this.acc >= PHYSICS.step) {
        this.tick(PHYSICS.step);
        this.acc -= PHYSICS.step;
      }
      const sc = this.level.scroller;
      this.camX = follow(
        this.camX,
        this.p.x + this.p.w / 2,
        sc.clientWidth,
        sc.scrollWidth - sc.clientWidth,
        dt,
      );
      sc.scrollLeft = this.camX;
    }
    this.fx.render();
    this.actor.render(this.p);
    this.raf = requestAnimationFrame(this.loop);
  };

  private tick(dt: number): void {
    const world = this.world;
    if (!world) return;
    const p = this.p;
    for (const ev of step(p, this.input, world, dt)) {
      if (ev.type === 'bump') this.bump(ev.block);
      else if (ev.speed > FEEL.dustSpeed) this.fx.dust(p.x + p.w / 2, p.y + p.h);
    }
    this.actor.advance(p, dt);
    this.fx.update(dt);

    let talk: HTMLElement | null = null;
    for (const n of world.npcs) {
      const zone = {
        x: n.x - FEEL.npcPadX,
        y: n.y - FEEL.npcPadY,
        w: n.w + 2 * FEEL.npcPadX,
        h: n.h + 2 * FEEL.npcPadY,
      };
      if (overlaps(p, zone)) {
        talk = n.card;
        break;
      }
    }
    this.setTalking(talk);

    if (world.flag && !this.cleared && overlaps(p, world.flag)) {
      this.cleared = true;
      toast(
        `Level clear. You found ${this.found.size} of ${this.host.totalProjects} projects.`,
        3600,
      );
      this.host.onFlag();
    }
  }

  private bump(index: number): void {
    const info = this.world?.blockInfo[index];
    const b = this.world?.blocks[index];
    if (!info || !b) return;
    const now = performance.now();
    if (info.cool > now || this.host.blocked()) return;
    info.cool = now + FEEL.bumpCooldownMs;
    info.el.classList.remove('hit');
    void info.el.offsetWidth; // restart the animation
    info.el.classList.add('hit');
    this.fx.coin(b.x + b.w / 2, b.y - 4);

    if (info.exit) {
      this.later(FEEL.bumpToExitMs, () => this.host.onExitBlock(info.el));
      return;
    }
    if (!info.id) return;
    if (!this.found.has(info.id)) {
      this.found.add(info.id);
      info.el.classList.add('used');
      this.host.foundEl.textContent = String(this.found.size);
      if (this.found.size === this.host.totalProjects) {
        this.later(900, () => toast(`All ${this.host.totalProjects} projects found.`));
      }
    }
    const id = info.id;
    this.later(FEEL.bumpToRoomMs, () => this.host.onCardBlock(id, info.el));
  }

  private later(ms: number, fn: () => void): void {
    const t = window.setTimeout(() => {
      this.timers = this.timers.filter((x) => x !== t);
      if (this.on) fn();
    }, ms);
    this.timers.push(t);
  }

  private setTalking(card: HTMLElement | null): void {
    if (card === this.talking) return;
    this.talking?.classList.remove('talk');
    card?.classList.add('talk');
    this.talking = card;
  }

  // ---------- Test hook ----------

  debug() {
    return {
      on: this.on,
      paused: this.paused,
      level: this.level.kind,
      found: [...this.found],
      player: { ...this.p },
      camX: this.camX,
    };
  }
}
