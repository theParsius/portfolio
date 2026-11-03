import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/level.css';
import './styles/room.css';
import { projectById } from './content/projects';
import { site } from './content/site';
import type { Project } from './content/types';
import { mainUrl, parse, roomUrl, isPanel } from './router';
import { arrowScroll, goTo, mapWheel, type Level } from './ui/sideways';
import { hideToast, mountToast, toast } from './ui/toast';
import { transition, until } from './ui/transition';
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
const lightbox = createLightbox(() => {
  /* M4: pause / resume play mode */
});
mapWheel(main.scroller);
mapWheel(room.scroller);

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
let busy = false;
const playing = () => document.body.classList.contains('playing');

function showRoom(id: string): void {
  const p = projectById(id);
  if (!p) return showMain();
  if (!viewing) savedScroll = main.scroller.scrollLeft;
  viewing = p;
  lightbox.close();
  hideToast();
  renderRoom(room, p);
  main.scroller.hidden = true;
  room.scroller.hidden = false;
  document.body.classList.add('viewing');
  room.scroller.scrollLeft = 0;
  active = room;
  document.title = `${p.title}, ${site.name}`;
  room.track.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
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
  const target = opener?.isConnected ? opener : card?.querySelector<HTMLElement>('.frame');
  target?.focus({ preventScroll: true });
  opener = null;
}

async function enterRoom(id: string, from?: HTMLElement): Promise<void> {
  if (busy || viewing?.id === id) return;
  busy = true;
  opener = from ?? null;
  await transition('fade', () => {
    history.pushState({ room: id }, '', roomUrl(id));
    enteredInPage = true;
    showRoom(id);
  });
  busy = false;
}

async function leaveRoom(): Promise<void> {
  if (!viewing || busy) return;
  busy = true;
  await transition('fade', async () => {
    if (enteredInPage) {
      enteredInPage = false;
      history.back(); // popstate → route() → showMain()
      await until(() => !viewing);
    }
    if (viewing) {
      history.replaceState(null, '', mainUrl());
      showMain();
    }
  });
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
    void enterRoom(roomLink.dataset.room, roomLink);
    return;
  }

  const go = t.closest<HTMLAnchorElement>('a[data-go]');
  if (go?.dataset.go && plainClick(e)) {
    e.preventDefault();
    switchRoom(go.dataset.go);
    return;
  }

  if (t.closest('[data-exit]')) {
    void leaveRoom();
    return;
  }

  const shot = t.closest<HTMLElement>('[data-shot]');
  if (shot && viewing) {
    lightbox.open(viewing, Number(shot.dataset.shot), shot);
    return;
  }

  if (t.closest('[data-play]')) toast('Play mode is coming in a later milestone.');
});

addEventListener(
  'keydown',
  (e) => {
    if (lightbox.isOpen || playing()) return; // the dialog handles its own keys
    const inField = (e.target as Element | null)?.closest(
      'input, textarea, select, [contenteditable]',
    );
    if (e.key === 'Escape' && viewing) {
      e.preventDefault();
      void leaveRoom();
      return;
    }
    if (
      (e.code === 'KeyP' || e.key.toLowerCase() === 'p') &&
      !e.repeat &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey
    ) {
      if (inField) return;
      toast('Play mode is coming in a later milestone.');
      return;
    }
    if (arrowScroll(active, e)) e.preventDefault();
  },
  { capture: true },
);

// ---------- Boot ----------

const heroCanvas = main.track.querySelector<HTMLCanvasElement>('.hero-sprite');
if (heroCanvas) mountHeroSprite(heroCanvas, playing);

const first = parse(location);
if (first.view === 'main') {
  // Unknown paths arrive here through 404.html: show the main level at its real URL.
  const canonical = mainUrl(first.at);
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
