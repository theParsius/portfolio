/**
 * Hidden tuning panel, loaded only with `?tune` in the URL. Sliders edit the live constant
 * objects (the engine reads them every step), values persist in localStorage between reloads,
 * and "Copy as TS" puts the edited objects on the clipboard to paste into constants.ts.
 */
import { CAMERA, FEEL, PHYSICS, REACH } from '../engine/constants';

type Group = Record<string, number>;
interface Spec {
  group: 'PHYSICS' | 'FEEL' | 'CAMERA';
  key: string;
  min: number;
  max: number;
  step: number;
}

const GROUPS: Record<Spec['group'], Group> = { PHYSICS, FEEL, CAMERA };
const DEFAULTS = structuredClone(GROUPS);
const STORE = 'theparsius:tune';

const s = (group: Spec['group'], key: string, min: number, max: number, step: number): Spec => ({
  group,
  key,
  min,
  max,
  step,
});
const SPECS: Spec[] = [
  s('PHYSICS', 'gravity', 1200, 4000, 50),
  s('PHYSICS', 'jumpVelocity', 600, 1300, 10),
  s('PHYSICS', 'jumpCutGravity', 1, 5, 0.05),
  s('PHYSICS', 'fallGravity', 0.8, 2, 0.05),
  s('PHYSICS', 'maxFall', 600, 2000, 25),
  s('PHYSICS', 'maxRun', 150, 600, 5),
  s('PHYSICS', 'accelGround', 800, 8000, 100),
  s('PHYSICS', 'accelAir', 400, 6000, 100),
  s('PHYSICS', 'frictionGround', 800, 8000, 100),
  s('PHYSICS', 'frictionAir', 0, 3000, 50),
  s('PHYSICS', 'coyote', 0, 0.25, 0.01),
  s('PHYSICS', 'jumpBuffer', 0, 0.25, 0.01),
  s('PHYSICS', 'dropThrough', 0.05, 0.5, 0.01),
  s('CAMERA', 'anchor', 0.2, 0.6, 0.01),
  s('CAMERA', 'lerp', 1, 20, 0.5),
  s('FEEL', 'runFrameDistance', 20, 120, 1),
  s('FEEL', 'dustSpeed', 200, 1000, 10),
  s('FEEL', 'coinSpeed', 200, 900, 10),
  s('FEEL', 'bumpToRoomMs', 0, 800, 10),
];

/** Apex of a held jump: v² / 2g (rising gravity is the plain value while jump is held). */
const apex = () => (PHYSICS.jumpVelocity ** 2 / (2 * PHYSICS.gravity)).toFixed(0);

function load(): void {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) ?? '{}') as Partial<
      Record<Spec['group'], Group>
    >;
    for (const g of Object.keys(GROUPS) as Spec['group'][]) Object.assign(GROUPS[g], saved[g]);
  } catch {
    /* ignore a corrupt entry */
  }
}

function save(): void {
  const changed: Partial<Record<Spec['group'], Group>> = {};
  for (const { group, key } of SPECS) {
    const v = GROUPS[group][key];
    if (v !== undefined && v !== DEFAULTS[group][key]) (changed[group] ??= {})[key] = v;
  }
  localStorage.setItem(STORE, JSON.stringify(changed));
}

function asTs(): string {
  const block = (name: string, g: Group) =>
    `export const ${name} = {\n${Object.entries(g)
      .map(([k, v]) => `  ${k}: ${Number(v.toFixed(4))},`)
      .join('\n')}\n};`;
  return [block('PHYSICS', PHYSICS), block('FEEL', FEEL), block('CAMERA', CAMERA)].join('\n\n');
}

export function mountTunePanel(): void {
  load();
  const el = document.createElement('aside');
  el.className = 'tune';
  el.setAttribute('aria-label', 'Tuning panel');
  el.innerHTML = `
    <details open>
      <summary>Tune</summary>
      <p class="tune-apex"></p>
      <div class="tune-rows"></div>
      <div class="tune-actions">
        <button type="button" data-t="copy">Copy as TS</button>
        <button type="button" data-t="reset">Reset</button>
      </div>
    </details>`;
  const rows = el.querySelector<HTMLElement>('.tune-rows');
  const apexEl = el.querySelector<HTMLElement>('.tune-apex');
  const showApex = () => {
    if (!apexEl) return;
    const a = Number(apex());
    apexEl.textContent = `Jump apex ≈ ${a} px (layout needs > ${REACH.maxClimb})`;
    apexEl.classList.toggle('bad', a <= REACH.maxClimb);
  };

  const inputs: [Spec, HTMLInputElement, HTMLOutputElement][] = [];
  for (const sp of SPECS) {
    const id = `tune-${sp.group}-${sp.key}`;
    const row = document.createElement('div');
    row.className = 'tune-row';
    row.innerHTML = `<label for="${id}">${sp.key}</label><input id="${id}" type="range" min="${sp.min}" max="${sp.max}" step="${sp.step}"><output for="${id}"></output>`;
    const input = row.querySelector('input');
    const out = row.querySelector('output');
    if (!input || !out) continue;
    const sync = () => {
      input.value = String(GROUPS[sp.group][sp.key]);
      out.textContent = String(GROUPS[sp.group][sp.key]);
      out.classList.toggle('changed', GROUPS[sp.group][sp.key] !== DEFAULTS[sp.group][sp.key]);
    };
    input.addEventListener('input', () => {
      GROUPS[sp.group][sp.key] = Number(input.value);
      sync();
      showApex();
      save();
    });
    sync();
    inputs.push([sp, input, out]);
    rows?.append(row);
  }
  showApex();

  el.addEventListener('click', (e) => {
    const t = (e.target as Element).closest<HTMLButtonElement>('[data-t]');
    if (t?.dataset.t === 'copy') {
      void navigator.clipboard?.writeText(asTs()).then(
        () => (t.textContent = 'Copied'),
        () => console.log(asTs()),
      );
      setTimeout(() => (t.textContent = 'Copy as TS'), 1500);
    } else if (t?.dataset.t === 'reset') {
      for (const g of Object.keys(GROUPS) as Spec['group'][]) Object.assign(GROUPS[g], DEFAULTS[g]);
      localStorage.removeItem(STORE);
      for (const [sp, input, out] of inputs) {
        input.value = out.textContent = String(GROUPS[sp.group][sp.key]);
        out.classList.remove('changed');
      }
      showApex();
    }
  });
  document.body.append(el);
}
