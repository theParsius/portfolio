/**
 * Post-build step.
 * M1: 404.html fallback so unknown paths under /portfolio/ still boot the app (GitHub Pages).
 * M3: also writes dist/projects/<id>/index.html with per-project title, canonical and Open Graph tags.
 */
import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = resolve(fileURLToPath(import.meta.url), '../../dist');
const index = resolve(DIST, 'index.html');
if (!existsSync(index)) throw new Error('dist/index.html not found; run vite build first');

copyFileSync(index, resolve(DIST, '404.html'));
console.log('prerender: wrote 404.html');
