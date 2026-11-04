import { site } from '../content/site';
import { SCORE } from '../engine/constants';
import { projects } from '../content/projects';
import { asset } from '../lib/asset';
import { esc } from '../lib/format';
import { linkAttrs } from '../lib/links';

export type PanelId = 'top' | 'projects' | 'about' | 'contact';

export interface Header {
  el: HTMLElement;
  found: HTMLElement;
  stars: HTMLElement;
  score: HTMLElement;
  playButtons: HTMLElement[];
  stopButton: HTMLElement;
  soundButton: HTMLElement;
}

const base = import.meta.env.BASE_URL;

export function renderHeader(): Header {
  const el = document.createElement('header');
  el.className = 'site-header';
  el.innerHTML = `
    <div class="bar">
      <a class="logo" href="${base}" data-nav="top"><img src="${asset('/sprites/logo.png')}" alt="" width="36" height="40"><span class="logo-text">${esc(site.handle)}</span></a>
      <nav class="nav-links" aria-label="Main">
        <a class="opt" href="${base}?at=about" data-nav="about">About</a>
        <a href="${base}?at=projects" data-nav="projects">Projects</a>
        <a class="opt" href="${base}?at=contact" data-nav="contact">Contact</a>
        <a ${linkAttrs(site.cv, 'CV', { download: true })}>CV</a>
      </nav>
      <div class="hud" aria-live="polite">
        <span><span class="hud-long">Projects found </span><span class="q-icon" aria-hidden="true"></span><b data-found>0</b>/${projects.length}</span>
        <span><span class="star-icon" aria-hidden="true"></span><span class="visually-hidden">Stars </span><b data-stars>0</b>/${projects.length * SCORE.starsPerRoom}</span>
        <span>Score <b data-score>0</b></span>
        <button class="btn small ghost sound" type="button" data-sound aria-pressed="false"><span class="spk" aria-hidden="true">♪</span><span class="lbl">Sound</span></button>
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
    stars: q('[data-stars]'),
    score: q('[data-score]'),
    playButtons: [q('[data-play]')],
    stopButton: q('[data-stop]'),
    soundButton: q('[data-sound]'),
  };
}
