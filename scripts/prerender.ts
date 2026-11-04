/**
 * Post-build step: per-route HTML shells so links preview well and deep links return 200.
 *   dist/index.html                    site-level meta + Open Graph
 *   dist/projects/<id>/index.html      the project's own title, description, canonical, Open Graph
 *   dist/404.html                      fallback for unknown paths (the app shows the main level)
 * Every shell loads the same app, which reads the URL and opens the right view.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects } from '../src/content/projects';
import { site } from '../src/content/site';
import type { Project } from '../src/content/types';

const DIST = resolve(fileURLToPath(import.meta.url), '../../dist');
const MARK = '<!-- prerender:head -->';
const template = readFileSync(resolve(DIST, 'index.html'), 'utf8');
if (!template.includes(MARK)) throw new Error(`dist/index.html is missing ${MARK}`);

const attr = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const abs = (path: string) => new URL(path.replace(/^\//, ''), site.url).href;
const firstSentence = (s: string) => /^.*?[.!?](?=\s|$)/.exec(s)?.[0] ?? s;

interface Meta {
  title: string;
  description: string;
  url: string;
  image?: { src: string; width: number; height: number; alt: string };
}

function shell(m: Meta): string {
  const tags = [
    `<link rel="canonical" href="${attr(m.url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${attr(site.name)}" />`,
    `<meta property="og:title" content="${attr(m.title)}" />`,
    `<meta property="og:description" content="${attr(m.description)}" />`,
    `<meta property="og:url" content="${attr(m.url)}" />`,
    `<meta name="twitter:card" content="${m.image && m.image.width > m.image.height ? 'summary_large_image' : 'summary'}" />`,
  ];
  if (m.image) {
    tags.push(
      `<meta property="og:image" content="${attr(m.image.src)}" />`,
      `<meta property="og:image:width" content="${m.image.width}" />`,
      `<meta property="og:image:height" content="${m.image.height}" />`,
      `<meta property="og:image:alt" content="${attr(m.image.alt)}" />`,
    );
  }
  return template
    .replace(/<title>[^<]*<\/title>/, `<title>${attr(m.title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
      `<meta name="description" content="${attr(m.description)}" />`,
    )
    .replace(MARK, tags.join('\n    '));
}

/** Open Graph image until M6 generates 1200 × 630 cards: the first landscape shot, else the icon. */
function ogImage(p: Project): Meta['image'] {
  const shot = p.screenshots.find((s) => s.width > s.height);
  if (shot) return { src: abs(shot.src), width: shot.width, height: shot.height, alt: shot.alt };
  return { src: abs(p.icon), width: 160, height: 160, alt: `${p.title} app icon` };
}

const mainMeta: Meta = {
  title: `${site.name}, ${site.title}`,
  description: `${site.name} (${site.handle}): ${site.role.charAt(0).toLowerCase()}${site.role.slice(1)} ${projects.length} games, in a side-scrolling level you can play.`,
  url: site.url,
};
const main = shell(mainMeta);
writeFileSync(resolve(DIST, 'index.html'), main);
writeFileSync(resolve(DIST, '404.html'), main);

for (const p of projects) {
  const dir = resolve(DIST, 'projects', p.id);
  mkdirSync(dir, { recursive: true });
  const meta: Meta = {
    title: `${p.title}, ${site.name}`,
    description: firstSentence(p.description),
    url: abs(`/projects/${p.id}/`),
  };
  const image = ogImage(p);
  if (image) meta.image = image;
  const html = shell(meta);
  if (!html.includes(`content="${attr(meta.description)}"`))
    throw new Error(`${p.id}: description not set`);
  writeFileSync(resolve(dir, 'index.html'), html);
}
console.log(`prerender: index.html, 404.html and ${projects.length} project pages`);
