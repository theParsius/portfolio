import { projects } from '../content/projects';
import type { Project } from '../content/types';
import { asset } from '../lib/asset';
import { esc, STATUS_LABEL, yearsLabel } from '../lib/format';
import { captionOf, shotVariants } from '../lib/shots';
import { spriteImg } from '../lib/sprites';
import type { Level } from '../ui/sideways';
import { SCORE } from '../engine/constants';
import { planShots, planStars } from './shotPlan';

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
      const cap = captionOf(s);
      // The plaque repeats the alt text unless a separate caption is set; only then is it announced.
      const own = cap !== s.alt;
      return `<div class="shot-slot">
        <p class="shot-cap" id="cap-${n}"${own ? '' : ' aria-hidden="true"'}>${esc(cap)}</p>
        <button class="shot" type="button" data-shot="${n}"${own ? ` aria-describedby="cap-${n}"` : ''}>
          <span class="visually-hidden">Enlarge: </span>
          <img src="${v.room}" alt="${esc(s.alt)}" width="${s.width}" height="${s.height}" loading="lazy" decoding="async">
        </button>
      </div>`;
    })
    .join('');
  const links = p.links.length
    ? `<div class="r-links">${p.links
        .map(
          (l) =>
            `<a class="btn small" href="${esc(l.url)}" target="_blank" rel="noopener" data-bump>${esc(l.label)}</a>`,
        )
        .join('')}</div>`
    : '';
  const metrics = (p.metrics ?? [])
    .map((m) => `<p class="r-metric" data-solid="text">${esc(m)}</p>`)
    .join('');

  // Play mode only (hidden otherwise, and from screen readers): placed by layoutRoom().
  const stars = Array.from(
    { length: SCORE.starsPerRoom },
    (_, k) => `<span class="star" data-star="${k}" aria-hidden="true"></span>`,
  ).join('');

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
        <img data-solid src="${asset(p.icon)}" alt="" width="104" height="104">
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
      <p class="sub" data-solid="text">${p.screenshots.length} shots. Hover for a note, click to enlarge. In play, they are platforms.</p>
    </section>
    <div class="shots-field ${p.orientation}" role="group" aria-labelledby="shots-title">${shots}${stars}</div>
    <section class="panel r-end" aria-labelledby="more-title">
      <h2 id="more-title" data-solid="text">More projects</h2>
      <div class="r-nav">
        <a class="btn small ghost" href="${roomPath(prev.id)}" data-go="${prev.id}" data-bump>◀ ${esc(prev.title)}</a>
        <a class="btn small ghost" href="${roomPath(next.id)}" data-go="${next.id}" data-bump>${esc(next.title)} ▶</a>
      </div>
      ${exitBlock}
    </section>`;
}

const roomPath = (id: string) => `${import.meta.env.BASE_URL}projects/${id}/`;

/**
 * Positions the screenshots as a platformer field (see shotPlan.ts). Needs layout, so call it
 * after the room is visible, and again on resize.
 */
export function layoutRoom(level: Level): void {
  const field = level.track.querySelector<HTMLElement>('.shots-field');
  if (!field || !field.clientHeight) return;
  const ground = parseFloat(getComputedStyle(field).getPropertyValue('--ground-h')) || 48;
  const floorTop = field.getBoundingClientRect().bottom - ground;
  const slots = [...field.querySelectorAll<HTMLElement>('.shot-slot')];
  const sizes = slots.map((sl) => {
    const img = sl.querySelector('img');
    return {
      width: Number(img?.getAttribute('width')) || 16,
      height: Number(img?.getAttribute('height')) || 9,
    };
  });
  // The sign's heading is the step up to the first shot.
  const sign = level.track.querySelector('.r-sign h2');
  const entry = sign ? Math.round(floorTop - sign.getBoundingClientRect().top) : undefined;
  const variant = Math.max(
    0,
    projects.findIndex((p) => p.id === level.track.dataset.id),
  );
  const plan = planShots(sizes, field.clientHeight - ground, window.innerWidth, { variant, entry });
  field.style.width = `${plan.width}px`;
  for (const b of plan.shots) {
    const sl = slots[b.i];
    if (!sl) continue;
    sl.style.left = `${b.x}px`;
    sl.style.bottom = `calc(var(--ground-h) + ${b.y}px)`;
    sl.style.width = `${b.w}px`;
    sl.style.height = `${b.h}px`;
    sl.style.setProperty('--elev', `${b.y}px`);
    sl.dataset.n = String(b.i);
    sl.dataset.cap = b.cap;
  }
  const stars = planStars(plan, SCORE.starsPerRoom);
  field.querySelectorAll<HTMLElement>('.star').forEach((el, k) => {
    const s = stars[k];
    el.hidden = !s;
    if (!s) return;
    el.style.left = `${s.x}px`;
    el.style.bottom = `calc(var(--ground-h) + ${s.y}px)`;
  });
}
