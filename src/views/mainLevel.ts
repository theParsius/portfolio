import { projects } from '../content/projects';
import { site } from '../content/site';
import type { Project } from '../content/types';
import { asset } from '../lib/asset';
import { esc, STATUS_LABEL, yearsLabel } from '../lib/format';
import { linkAttrs } from '../lib/links';
import { shotVariants } from '../lib/shots';
import { spriteImg } from '../lib/sprites';
import { roomUrl } from '../router';
import type { Level } from '../ui/sideways';

const base = import.meta.env.BASE_URL;

function card(p: Project): string {
  const shots =
    p.orientation === 'portrait' ? p.screenshots.slice(0, 3) : p.screenshots.slice(0, 1);
  const thumbs = shots
    .map(
      (s) =>
        `<img src="${shotVariants(s).thumb}" alt="" width="${s.width}" height="${s.height}" loading="lazy" decoding="async">`,
    )
    .join('');
  const metric = p.metrics?.[0] ? `<p class="metric">${esc(p.metrics[0])}</p>` : '';
  return `
    <article class="card" role="listitem" id="card-${p.id}" data-id="${p.id}" style="--c:${p.color}">
      <a class="frame" href="${roomUrl(p.id)}" data-room="${p.id}" data-solid>
        <div class="thumb ${p.orientation}">${thumbs}</div>
        <img class="icon" data-solid src="${asset(p.icon)}" alt="" width="64" height="64" loading="lazy">
        <div class="body">
          <div class="titlerow" data-solid="kids"><h3>${esc(p.title)}</h3><span class="year">${yearsLabel(p)}</span></div>
          <div class="subrow"><p class="role">${esc(p.role)}</p><span class="status s-${p.status}"><span class="visually-hidden">Status: </span>${STATUS_LABEL[p.status]}</span></div>
          ${metric}
          <ul class="tags" data-solid="kids">${p.stack.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        </div>
      </a>
      <div class="under">
        ${spriteImg(p.mascot, 'mascot', { attrs: 'data-solid aria-hidden="true"' })}
        <div class="bubble" aria-hidden="true">${esc(p.hook)}</div>
        <div class="qblock" aria-hidden="true">?</div>
      </div>
    </article>`;
}

export function renderMainLevel(): Level {
  const scroller = document.createElement('main');
  scroller.id = 'level';
  scroller.className = 'scroller level';
  scroller.tabIndex = -1;
  scroller.setAttribute('aria-label', 'Portfolio, scrolls sideways');
  scroller.innerHTML = `
    <div class="track" data-track>
      <div class="floor" aria-hidden="true"></div>

      <section class="panel hero" id="top" aria-labelledby="hero-title">
        ${spriteImg('/sprites/tower.png', 'deco tower', { attrs: 'data-solid aria-hidden="true"' })}
        <canvas class="hero-sprite" aria-hidden="true"></canvas>
        <h1 id="hero-title" data-solid="text" tabindex="-1">${esc(site.name)}</h1>
        <p class="lede" data-solid="text">${esc(site.role)}</p>
        <div class="cta" data-solid="kids">
          <a class="btn ghost" href="${base}?at=projects" data-nav="projects">See projects</a>
          <button class="btn" type="button" data-play><span class="tri" aria-hidden="true"></span>Play this page</button>
          <span class="hint">or press <kbd>P</kbd></span>
        </div>
      </section>

      <section class="panel about" id="about" aria-labelledby="about-title">
        ${spriteImg('/sprites/tree-1.png', 'deco tree tree-l', { attrs: 'data-solid aria-hidden="true"' })}
        ${spriteImg('/sprites/tree-2.png', 'deco tree tree-r', { attrs: 'data-solid aria-hidden="true"' })}
        <h2 id="about-title" data-solid="text" tabindex="-1">About</h2>
        <div class="cols">
          <div class="avatar-slot">
            ${spriteImg('/sprites/avatar.png', 'avatar', { attrs: 'data-solid', alt: `Pixel portrait of ${esc(site.name.split(' ')[0] ?? '')} waving` })}
          </div>
          <div class="text">
            ${site.bio.map((b) => `<p data-solid="text">${esc(b)}</p>`).join('')}
          </div>
        </div>
      </section>

      <section class="panel sign" id="projects" aria-labelledby="projects-title">
        <h2 id="projects-title" data-solid="text" tabindex="-1">Projects</h2>
        <p class="sub" data-solid="text">${projects.length} games from ${Math.min(...projects.map((p) => p.years.start))} to now. Pick one, or keep walking right.</p>
        <ul class="index" data-solid="kids">
          ${projects
            .map(
              (p) =>
                `<li><a href="${roomUrl(p.id)}" data-room="${p.id}" style="--c:${p.color}">${esc(p.title)}</a><span class="yr">${yearsLabel(p)}</span></li>`,
            )
            .join('')}
        </ul>
        <p class="go" data-solid="text">Scroll or swipe sideways to walk the level.</p>
      </section>

      <div class="cards" aria-label="Project cards" role="list">
        ${projects.map(card).join('')}
      </div>

      <section class="panel contact" id="contact" aria-labelledby="contact-title">
        <h2 id="contact-title" data-solid="text" tabindex="-1">Contact</h2>
        <p class="sub" data-solid="text">Reach the flag, or just send an email.</p>
        <div class="row" data-solid="kids">
          <a class="btn" ${linkAttrs(site.email ? `mailto:${site.email}` : null, 'Email')}>Email</a>
          <a class="btn ghost" ${linkAttrs(site.linkedin, 'LinkedIn')}>LinkedIn</a>
          <a class="btn ghost" ${linkAttrs(site.itch, 'itch.io')}>itch.io</a>
          <a class="btn ghost" ${linkAttrs(site.cv, 'CV', { download: true })}>Download CV</a>
          <a class="btn ghost" ${linkAttrs(site.portfolioPdf, 'Portfolio PDF', { download: true })}>Portfolio PDF</a>
        </div>
        <p class="credit" data-solid="text">${esc(site.name)}</p>
        ${spriteImg('/sprites/flag.png', 'deco flag', { attrs: 'data-flag aria-hidden="true"' })}
      </section>
    </div>`;
  const track = scroller.querySelector<HTMLElement>('[data-track]');
  if (!track) throw new Error('main level: track missing');
  return { kind: 'main', scroller, track };
}
