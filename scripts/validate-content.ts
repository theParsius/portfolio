/**
 * Checks src/content against the files in public/ and the spec's content rules.
 * Run directly (`npm run validate`) or through Vitest (tests/content.spec.ts).
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { projects } from '../src/content/projects';
import { site } from '../src/content/site';
import type { Project } from '../src/content/types';

export interface Report {
  errors: string[];
  warnings: string[];
}

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const pub = (p: string) => resolve(ROOT, 'public', p.replace(/^\//, ''));

const HOOK_MAX = 60;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX = /^#[0-9A-Fa-f]{6}$/;
const LAZY_ALT = /^(screenshot|image|shot)\s*\d*$/i;

async function checkProject(p: Project, r: Report): Promise<void> {
  const at = (msg: string) => `${p.id}: ${msg}`;
  if (!SLUG.test(p.id)) r.errors.push(at('id is not a lowercase slug'));
  if (!HEX.test(p.color)) r.errors.push(at(`color ${p.color} is not #RRGGBB`));
  if (p.hook.length > HOOK_MAX)
    r.errors.push(at(`hook is ${p.hook.length} chars (max ${HOOK_MAX})`));
  if (p.years.end !== 'now' && p.years.end < p.years.start)
    r.errors.push(at('years end before start'));
  if (p.screenshots.length === 0) r.errors.push(at('no screenshots'));
  for (const l of p.links)
    if (!l.url.startsWith('https://')) r.errors.push(at(`link ${l.label} is not https`));

  for (const [kind, path] of [
    ['icon', p.icon],
    ['mascot', p.mascot],
  ] as const) {
    if (!existsSync(pub(path))) r.errors.push(at(`${kind} missing: ${path}`));
  }
  if (existsSync(pub(p.icon))) {
    const m = await sharp(pub(p.icon)).metadata();
    if (m.width !== m.height) r.warnings.push(at(`icon is ${m.width}×${m.height}, not square`));
  }

  for (const s of p.screenshots) {
    if (LAZY_ALT.test(s.alt.trim()) || s.alt.trim().length < 10)
      r.errors.push(at(`weak alt text for ${s.src}`));
    if (!existsSync(pub(s.src))) {
      r.errors.push(at(`screenshot missing: ${s.src}`));
      continue;
    }
    const m = await sharp(pub(s.src)).metadata();
    if (m.width !== s.width || m.height !== s.height) {
      r.errors.push(at(`${s.src} is ${m.width}×${m.height}, content says ${s.width}×${s.height}`));
    }
    const shape = s.width >= s.height ? 'landscape' : 'portrait';
    if (shape !== p.orientation)
      r.errors.push(at(`${s.src} is ${shape}, project is ${p.orientation}`));
  }
}

export async function validateContent(): Promise<Report> {
  const r: Report = { errors: [], warnings: [] };
  const ids = projects.map((p) => p.id);
  for (const id of ids.filter((id, i) => ids.indexOf(id) !== i))
    r.errors.push(`duplicate id: ${id}`);
  for (const p of projects) await checkProject(p, r);

  if (!site.base.startsWith('/') || !site.base.endsWith('/'))
    r.errors.push('site.base must start and end with /');
  if (!site.url.endsWith(site.base)) r.errors.push('site.url must end with site.base');
  if (site.cv && !existsSync(pub(site.cv))) r.errors.push(`site.cv missing: ${site.cv}`);
  for (const k of ['email', 'cv'] as const) if (!site[k]) r.warnings.push(`site.${k} not set yet`);
  for (const p of projects) {
    if (p.links.length === 0 && (p.status === 'live' || p.status === 'released')) {
      r.warnings.push(`${p.id}: ${p.status} but has no store links`);
    }
  }
  return r;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { errors, warnings } = await validateContent();
  for (const w of warnings) console.warn(`warn  ${w}`);
  for (const e of errors) console.error(`error ${e}`);
  console.log(`${errors.length} errors, ${warnings.length} warnings`);
  process.exit(errors.length ? 1 : 0);
}
