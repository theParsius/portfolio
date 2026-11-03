import { site } from '../content/site';
import { projects } from '../content/projects';
import { esc } from '../lib/format';
import { linkAttrs } from '../lib/links';

export type PanelId = 'top' | 'projects' | 'about' | 'contact';

export interface Header {
  el: HTMLElement;
  found: HTMLElement;
  playButtons: HTMLElement[];
  stopButton: HTMLElement;
}

const base = import.meta.env.BASE_URL;

export function renderHeader(): Header {
  const el = document.createElement('header');
  el.className = 'site-header';
  el.innerHTML = `
    <div class="bar">
      <a class="logo" href="${base}" data-nav="top">${esc(site.handle)}</a>
      <nav class="nav-links" aria-label="Main">
        <a href="${base}?at=projects" data-nav="projects">Projects</a>
        <a class="opt" href="${base}?at=about" data-nav="about">About</a>
        <a class="opt" href="${base}?at=contact" data-nav="contact">Contact</a>
        <a ${linkAttrs(site.cv, 'CV', { download: true })}>CV</a>
      </nav>
      <div class="hud" aria-live="polite">
        <span>Projects found <b data-found>0</b>/${projects.length}</span>
        <button class="btn small ghost" type="button" data-stop>Stop</button>
      </div>
      <button class="btn small play-top" type="button" data-play><span class="tri" aria-hidden="true"></span>Play</button>
    </div>`;
  const q = <T extends HTMLElement>(s: string) => {
    const found = el.querySelector<T>(s);
    if (!found) throw new Error(`header: ${s} missing`);
    return found;
  };
  return {
    el,
    found: q('[data-found]'),
    playButtons: [q('[data-play]')],
    stopButton: q('[data-stop]'),
  };
}
