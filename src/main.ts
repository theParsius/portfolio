import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/level.css';
import { mountHeroSprite } from './views/heroSprite';
import { renderHeader, type PanelId } from './views/header';
import { renderMainLevel } from './views/mainLevel';
import { arrowScroll, goTo, mapWheel, type Level } from './ui/sideways';
import { mountToast, toast } from './ui/toast';

const PANELS: readonly PanelId[] = ['top', 'projects', 'about', 'contact'];
const isPanel = (v: string | null | undefined): v is PanelId => PANELS.includes(v as PanelId);

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('#app missing');

const header = renderHeader();
const main = renderMainLevel();
app.replaceChildren(header.el, main.scroller);
mountToast();

/** The level currently on screen. Rooms (M3) swap this. */
const active: Level = main;
const playing = () => document.body.classList.contains('playing');

mapWheel(main.scroller);

function panel(id: PanelId): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`panel #${id} missing`);
  return el;
}

/** Slide to a panel and move focus to its heading (keyboard and screen-reader users land there too). */
function showPanel(id: PanelId, behavior?: ScrollBehavior): void {
  goTo(main, panel(id), behavior);
  panel(id).querySelector<HTMLElement>('h1, h2')?.focus({ preventScroll: true });
}

document.addEventListener('click', (e) => {
  const t = e.target as Element | null;
  const todo = t?.closest<HTMLElement>('[data-todo]');
  if (todo) {
    e.preventDefault();
    toast(`${todo.dataset.todo ?? 'That'} link is coming soon.`);
    return;
  }
  const nav = t?.closest<HTMLAnchorElement>('a[data-nav]');
  if (nav && isPanel(nav.dataset.nav)) {
    e.preventDefault();
    showPanel(nav.dataset.nav);
    history.replaceState(history.state, '', nav.href);
    return;
  }
  if (t?.closest('[data-play]')) toast('Play mode is coming in a later milestone.');
});

addEventListener(
  'keydown',
  (e) => {
    if (playing()) return;
    if (
      (e.code === 'KeyP' || e.key.toLowerCase() === 'p') &&
      !e.repeat &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey
    ) {
      const t = e.target as Element | null;
      if (t?.closest('input, textarea, [contenteditable]')) return;
      toast('Play mode is coming in a later milestone.');
      return;
    }
    if (arrowScroll(active, e)) e.preventDefault();
  },
  { capture: true },
);

const heroCanvas = main.track.querySelector<HTMLCanvasElement>('.hero-sprite');
if (heroCanvas) mountHeroSprite(heroCanvas, playing);

// ?at=projects|about|contact lands on that panel.
const at = new URLSearchParams(location.search).get('at');
if (isPanel(at) && at !== 'top') {
  const land = () => goTo(main, panel(at), 'auto');
  land();
  // Re-align once fonts settle, since text width shifts panel positions.
  void document.fonts?.ready.then(land);
}
