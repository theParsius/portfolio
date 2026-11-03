import { projects } from '../content/projects';
import type { Project } from '../content/types';
import { asset } from '../lib/asset';
import { esc, STATUS_LABEL, yearsLabel } from '../lib/format';
import { shotVariants } from '../lib/shots';
import { spriteImg } from '../lib/sprites';
import type { Level } from '../ui/sideways';

export function createRoomLevel(): Level {
  const scroller = document.createElement('main');
  scroller.id = 'room';
  scroller.className = 'scroller level room-level';
  scroller.hidden = true;
  scroller.tabIndex = -1;
  scroller.setAttribute('aria-label', 'Project, scrolls sideways');
  const track = document.createElement('div');
  track.className = 'track room';
  track.dataset.track = '';
  scroller.append(track);
  return { kind: 'room', scroller, track };
}

export function neighbours(p: Project): { prev: Project; next: Project } {
  const i = projects.indexOf(p);
  const n = projects.length;
  return { prev: projects[(i + n - 1) % n] ?? p, next: projects[(i + 1) % n] ?? p };
}

const exitBlock = `
  <span class="exit-label" aria-hidden="true">Exit</span>
  <button class="qblock exit" type="button" data-exit aria-label="Back to the level">?</button>`;

/** Builds the room for `p` into the room track. Rebuilt on every visit; built from data only. */
export function renderRoom(level: Level, p: Project): void {
  const { prev, next } = neighbours(p);
  const shots = p.screenshots
    .map((s, n) => {
      const v = shotVariants(s);
      return `<button class="shot" type="button" data-shot="${n}" data-solid>
        <span class="visually-hidden">Enlarge: </span>
        <img src="${v.room}" alt="${esc(s.alt)}" width="${s.width}" height="${s.height}" loading="lazy" decoding="async">
      </button>`;
    })
    .join('');
  const links = p.links.length
    ? `<div class="r-links" data-solid="kids">${p.links
        .map(
          (l) =>
            `<a class="btn small" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`,
        )
        .join('')}</div>`
    : '';
  const metrics = (p.metrics ?? [])
    .map((m) => `<p class="r-metric" data-solid="text">${esc(m)}</p>`)
    .join('');

  level.track.style.setProperty('--c', p.color);
  level.track.dataset.id = p.id;
  level.track.innerHTML = `
    <div class="floor" aria-hidden="true"></div>
    <section class="panel r-exit" aria-label="Entrance">
      ${spriteImg(p.mascot, 'r-mascot', { attrs: 'data-solid aria-hidden="true"' })}
      ${exitBlock}
    </section>
    <section class="panel r-intro" aria-labelledby="room-title">
      <div class="r-title">
        <img data-solid src="${asset(p.icon)}" alt="" width="88" height="88">
        <div>
          <h1 id="room-title" data-solid="text" tabindex="-1">${esc(p.title)}</h1>
          <div class="r-meta" data-solid="kids"><span>${yearsLabel(p)}</span><span class="status s-${p.status}">${STATUS_LABEL[p.status]}</span></div>
        </div>
      </div>
      <div class="r-info">
        <div>
          <p data-solid="text">${esc(p.description)}</p>
          ${metrics}
          ${links}
        </div>
        <dl class="facts" data-solid>
          <dt>Role</dt><dd>${esc(p.role)}</dd>
          <dt>Status</dt><dd>${STATUS_LABEL[p.status]}</dd>
          <dt>Platform</dt><dd>${esc(p.platforms.join(', '))}</dd>
          <dt>Stack</dt><dd>${esc(p.stack.join(', '))}</dd>
        </dl>
      </div>
    </section>
    <section class="panel r-sign" aria-labelledby="shots-title">
      <h2 id="shots-title" data-solid="text">Screenshots</h2>
      <p class="sub" data-solid="text">${p.screenshots.length} shots. Click any to enlarge.</p>
    </section>
    <div class="shots-row ${p.orientation}" role="group" aria-labelledby="shots-title">${shots}</div>
    <section class="panel r-end" aria-labelledby="more-title">
      <h2 id="more-title" data-solid="text">More projects</h2>
      <div class="r-nav" data-solid="kids">
        <a class="btn small ghost" href="${roomPath(prev.id)}" data-go="${prev.id}">◀ ${esc(prev.title)}</a>
        <a class="btn small ghost" href="${roomPath(next.id)}" data-go="${next.id}">${esc(next.title)} ▶</a>
      </div>
      ${exitBlock}
    </section>`;
}

const roomPath = (id: string) => `${import.meta.env.BASE_URL}projects/${id}/`;
