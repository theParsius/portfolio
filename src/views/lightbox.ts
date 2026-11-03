import type { Project } from '../content/types';
import { esc } from '../lib/format';
import { shotVariants } from '../lib/shots';

export interface Lightbox {
  el: HTMLDialogElement;
  open(p: Project, index: number, returnTo?: HTMLElement): void;
  step(delta: number): void;
  close(): void;
  readonly isOpen: boolean;
}

/** One screenshot at a time in a modal <dialog>. ← / → cycle, Esc or backdrop click closes. */
export function createLightbox(onToggle: (open: boolean) => void): Lightbox {
  const el = document.createElement('dialog');
  el.className = 'lightbox';
  el.setAttribute('aria-label', 'Screenshot');
  document.body.append(el);
  let project: Project | null = null;
  let index = 0;
  let returnTo: HTMLElement | undefined;

  const render = () => {
    if (!project) return;
    const n = project.screenshots.length;
    const s = project.screenshots[index];
    if (!s) return;
    el.style.setProperty('--c', project.color);
    el.innerHTML = `
      <div class="lb">
        <img src="${shotVariants(s).full}" alt="${esc(s.alt)}" width="${s.width}" height="${s.height}">
        <div class="row">
          <button class="btn small ghost" type="button" data-lb="-1" aria-label="Previous screenshot">◀</button>
          <span aria-live="polite">${index + 1} / ${n}</span>
          <button class="btn small ghost" type="button" data-lb="1" aria-label="Next screenshot">▶</button>
          <button class="btn small" type="button" data-lb="close">Close</button>
        </div>
      </div>`;
  };

  const api: Lightbox = {
    el,
    get isOpen() {
      return el.open;
    },
    open(p, i, from) {
      project = p;
      index = (i + p.screenshots.length) % p.screenshots.length;
      returnTo = from;
      render();
      if (!el.open) {
        el.showModal();
        onToggle(true);
      }
      el.querySelector<HTMLElement>('[data-lb="close"]')?.focus();
    },
    step(delta) {
      if (!project) return;
      const keep = (document.activeElement as HTMLElement | null)?.dataset.lb;
      index = (index + delta + project.screenshots.length) % project.screenshots.length;
      render();
      el.querySelector<HTMLElement>(`[data-lb="${keep ?? 'close'}"]`)?.focus();
    },
    close() {
      if (el.open) el.close();
    },
  };

  el.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLElement>('[data-lb]');
    if (e.target === el || b?.dataset.lb === 'close') api.close();
    else if (b) api.step(Number(b.dataset.lb));
  });
  el.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      e.stopPropagation();
      api.step(e.key === 'ArrowRight' ? 1 : -1);
    }
  });
  el.addEventListener('close', () => {
    returnTo?.focus({ preventScroll: true });
    onToggle(false);
  });
  return api;
}
