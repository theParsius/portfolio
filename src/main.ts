import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/level.css';
import './styles/room.css';
import './styles/game.css';
import { projectById, projects } from './content/projects';
import { site } from './content/site';
import type { Project } from './content/types';
import { Game, type Snapshot } from './engine/game';
import { collect } from './engine/colliders';
import { focusGame } from './engine/input';
import { setSound, sfx, soundOn } from './engine/sound';
import { mainUrl, parse, roomUrl, isPanel } from './router';
import { arrowScroll, goTo, mapWheel, type Level } from './ui/sideways';
import { hideToast, mountToast, toast } from './ui/toast';
import { mountTouchPad } from './ui/touchPad';
import { pointOf, transition, until, type Point } from './ui/transition';
import { renderHeader, type PanelId } from './views/header';
import { mountHeroSprite } from './views/heroSprite';
import { createLightbox } from './views/lightbox';
import { renderMainLevel } from './views/mainLevel';
import { createRoomLevel, renderRoom } from './views/room';

const TITLE_MAIN = `${site.name}, game developer`;

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('#app missing');

const header = renderHeader();
const main = renderMainLevel();
const room = createRoomLevel();
app.replaceChildren(header.el, main.scroller, room.scroller);
mountToast();
const lightbox = createLightbox((open) => {
  if (game.on && !busy) game.pause(open);
});

const game = new Game(
  {
    foundEl: header.found,
    totalProjects: projects.length,
    heroSprite: main.track.querySelector<HTMLElement>('.hero-sprite'),
    blocked: () => busy || lightbox.isOpen,
    onCardBlock: (id, el) => {
      if (!viewing)
        void enterRoom(id, el.closest('.card')?.querySelector<HTMLElement>('.frame'), pointOf(el));
    },
    onExitBlock: (el) => {
      if (viewing) void leaveRoom(pointOf(el));
    },
    onFlag: () => document.getElementById('contact')?.classList.add('cleared'),
  },
  main,
);
mountTouchPad(game.input);
mapWheel(main.scroller, () => game.syncCamera());
mapWheel(room.scroller, () => game.syncCamera());

// ---------- View state ----------

/** The level on screen. */
let active: Level = main;
/** The project whose room is open, or null on the main level. */
let viewing: Project | null = null;
/** True when the current room was entered from the main level in this page (so Back returns there). */
let enteredInPage = false;
/** Main-level scroll position to restore on exit; null after a deep link. */
let savedScroll: number | null = null;
/** Element to focus on returning to the main level (the card or index link that opened the room). */
let opener: HTMLElement | null = null;
/** Player and camera on the main level when a room was entered during play. */
let savedPlayer: Snapshot | null = null;
let busy = false;
const playing = () => game.on;
const navKind = () => (game.on ? 'iris' : 'fade');

function showRoom(id: string): void {
  const p = projectById(id);
  if (!p) return showMain();
  if (!viewing) {
    savedScroll = main.scroller.scrollLeft;
    savedPlayer = game.on ? game.snapshot() : null;
  }
  viewing = p;
  lightbox.close();
  hideToast();
  game.park(main); // the room track is about to be rebuilt
  renderRoom(room, p);
  main.scroller.hidden = true;
  room.scroller.hidden = false;
  document.body.classList.add('viewing');
  room.scroller.scrollLeft = 0;
  active = room;
  document.title = `${p.title}, ${site.name}`;
  room.track.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
  game.setLevel(room); // in play: spawn at the entrance
  if (game.on) focusGame();
}

function showMain(): void {
  if (!viewing) return;
  const id = viewing.id;
  viewing = null;
  lightbox.close();
  room.scroller.hidden = true;
  room.track.replaceChildren();
  main.scroller.hidden = false;
  document.body.classList.remove('viewing');
  active = main;
  document.title = TITLE_MAIN;
  const card = document.querySelector<HTMLElement>(`#card-${id}`);
  if (savedScroll !== null) main.scroller.scrollLeft = savedScroll;
  else if (card) goTo(main, card, 'auto'); // deep link: no position to restore, so show the card
  savedScroll = null;
  // In play: restore the player and camera exactly (or spawn after a deep link).
  game.setLevel(main, savedPlayer);
  savedPlayer = null;
  if (game.on) focusGame();
  else {
    const target = opener?.isConnected ? opener : card?.querySelector<HTMLElement>('.frame');
    target?.focus({ preventScroll: true });
  }
  opener = null;
}

async function enterRoom(id: string, from?: HTMLElement | null, at?: Point): Promise<void> {
  if (busy || viewing?.id === id) return;
  busy = true;
  opener = from ?? null;
  if (game.on) game.pause(true);
  await transition(
    navKind(),
    () => {
      history.pushState({ room: id }, '', roomUrl(id));
      enteredInPage = true;
      showRoom(id);
    },
    at ?? (from ? pointOf(from) : undefined),
  );
  if (game.on) game.pause(false);
  busy = false;
}

async function leaveRoom(at?: Point): Promise<void> {
  if (!viewing || busy) return;
  busy = true;
  if (game.on) game.pause(true);
  await transition(
    navKind(),
    async () => {
      if (enteredInPage) {
        enteredInPage = false;
        history.back(); // popstate → route() → showMain()
        await until(() => !viewing);
      }
      if (viewing) {
        history.replaceState(null, '', mainUrl());
        showMain();
      }
    },
    at,
  );
  if (game.on) game.pause(false);
  busy = false;
}

function switchRoom(id: string): void {
  // Prev / next: no history entry, no transition. Return focus to this room's card later.
  history.replaceState(history.state, '', roomUrl(id));
  opener = null;
  showRoom(id);
}

function route(): void {
  const r = parse(location);
  if (r.view === 'room') {
    showRoom(r.id);
    return;
  }
  showMain();
  if (r.at) goTo(main, panel(r.at), 'auto');
}

addEventListener('popstate', () => {
  const r = parse(location);
  if (r.view === 'room') enteredInPage = true; // forward into a room: Back leads to the main level
  route();
});

// ---------- Panels ----------

function panel(id: PanelId): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`panel #${id} missing`);
  return el;
}

/** Slide to a panel and move focus to its heading. */
function showPanel(id: PanelId, behavior?: ScrollBehavior): void {
  goTo(main, panel(id), behavior);
  panel(id).querySelector<HTMLElement>('h1, h2')?.focus({ preventScroll: true });
}

function syncSound(): void {
  header.soundButton.setAttribute('aria-pressed', String(soundOn()));
}
syncSound();

// ---------- Input ----------

const plainClick = (e: MouseEvent) =>
  e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

document.addEventListener('click', async (e) => {
  const t = e.target as Element | null;
  if (!t) return;

  const todo = t.closest<HTMLElement>('[data-todo]');
  if (todo) {
    e.preventDefault();
    toast(`${todo.dataset.todo ?? 'That'} link is coming soon.`);
    return;
  }

  const nav = t.closest<HTMLAnchorElement>('a[data-nav]');
  if (nav && isPanel(nav.dataset.nav) && plainClick(e)) {
    e.preventDefault();
    const id = nav.dataset.nav;
    if (viewing) await leaveRoom();
    showPanel(id);
    history.replaceState(history.state, '', mainUrl(id));
    return;
  }

  const roomLink = t.closest<HTMLAnchorElement>('a[data-room]');
  if (roomLink?.dataset.room && plainClick(e)) {
    e.preventDefault();
    const at = e.clientX || e.clientY ? { x: e.clientX, y: e.clientY } : undefined;
    void enterRoom(roomLink.dataset.room, roomLink, at);
    return;
  }

  const go = t.closest<HTMLAnchorElement>('a[data-go]');
  if (go?.dataset.go && plainClick(e)) {
    e.preventDefault();
    switchRoom(go.dataset.go);
    return;
  }

  const exit = t.closest<HTMLElement>('[data-exit]');
  if (exit) {
    void leaveRoom(pointOf(exit));
    return;
  }

  const shot = t.closest<HTMLElement>('[data-shot]');
  if (shot && viewing) {
    lightbox.open(viewing, Number(shot.dataset.shot), shot);
    return;
  }

  if (t.closest('[data-sound]')) {
    await setSound(!soundOn());
    syncSound();
    sfx('coin');
    if (game.on) focusGame();
    return;
  }
  if (t.closest('[data-play]')) game.start();
  else if (t.closest('[data-stop]')) game.stop();
});

addEventListener(
  'keydown',
  (e) => {
    if (lightbox.isOpen) return; // the dialog handles its own keys
    if ((e.target as Element | null)?.closest?.('.tune')) return; // sliders keep their arrows
    const inField = (e.target as Element | null)?.closest(
      'input, textarea, select, [contenteditable]',
    );
    const isP =
      (e.code === 'KeyP' || e.key.toLowerCase() === 'p') && !e.metaKey && !e.ctrlKey && !e.altKey;
    if (isP && !inField) {
      e.preventDefault();
      if (!e.repeat) game.toggle();
      return;
    }
    if (game.keyDown(e)) return; // movement, jump, drop; Esc stops play (does not exit)
    if (e.key === 'Escape' && viewing) {
      e.preventDefault();
      void leaveRoom();
      return;
    }
    if (!playing() && arrowScroll(active, e)) e.preventDefault();
  },
  { capture: true },
);
addEventListener('keyup', (e) => game.keyUp(e), { capture: true });
addEventListener('blur', () => game.clearKeys());
addEventListener(
  'pointerdown',
  (e) => {
    if (game.on && !(e.target as Element | null)?.closest('a, button, dialog')) focusGame();
  },
  { capture: true },
);

// Colliders follow layout: rebuild on resize, font load and any track size change.
const relayout = () => {
  if (game.on) game.rebuild();
};
addEventListener('resize', relayout);
void document.fonts?.ready.then(relayout);
const ro = new ResizeObserver(relayout);
ro.observe(main.track);
ro.observe(room.track);

// ---------- Boot ----------

const heroCanvas = main.track.querySelector<HTMLCanvasElement>('.hero-sprite');
if (heroCanvas) mountHeroSprite(heroCanvas, playing);

const first = parse(location);
if (new URLSearchParams(location.search).has('tune'))
  void import('./ui/tunePanel').then((m) => m.mountTunePanel());
// Test hook for Playwright (dev server, or any page opened with ?test).
if (import.meta.env.DEV || new URLSearchParams(location.search).has('test')) {
  Object.assign(window, {
    __game: {
      state: () => game.debug(),
      /** Serializable colliders of the active level (forces body.playing so ? blocks have layout). */
      colliders: () => {
        const was = document.body.classList.contains('playing');
        document.body.classList.add('playing');
        const w = collect(active);
        if (!was) document.body.classList.remove('playing');
        const { plats, blocks, floor, width } = w;
        return {
          plats,
          blocks,
          floor,
          width,
          ids: w.blockInfo.map((b) => b.id ?? (b.exit ? 'exit' : '')),
        };
      },
      place: (x: number, y: number, vy = 0) => {
        Object.assign(game.p, { x, y, vx: 0, vy, ground: false });
        game.syncCamera();
      },
    },
  });
}
if (first.view === 'main') {
  // Unknown paths arrive here through 404.html: show the main level at its real URL.
  // Keep the playtest flags (?tune, ?test) so a reload keeps them.
  const flags = [...new URLSearchParams(location.search).keys()].filter(
    (k) => k === 'tune' || k === 'test',
  );
  const url = new URL(mainUrl(first.at), location.origin);
  for (const k of flags) url.searchParams.set(k, '');
  const canonical = url.pathname + url.search.replace(/=(?=&|$)/g, '');
  if (location.pathname + location.search !== canonical) history.replaceState(null, '', canonical);
}
route();
// A deep-linked room has no main-level position to return to; exiting shows its card instead.
if (first.view === 'room') savedScroll = null;
// Text width shifts panel positions once fonts load; re-align a ?at= landing.
if (first.view === 'main' && first.at) {
  const at = first.at;
  void document.fonts?.ready.then(() => {
    if (!viewing) goTo(main, panel(at), 'auto');
  });
}
