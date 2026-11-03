import { asset } from './asset';
import { esc } from './format';

/**
 * href + attributes for an outbound link. A missing URL becomes a placeholder
 * that shows a "coming soon" toast (see main.ts) instead of a dead link.
 */
export function linkAttrs(
  url: string | null,
  label: string,
  opts: { download?: boolean } = {},
): string {
  if (!url) return `href="#" data-todo="${esc(label)}"`;
  if (url.startsWith('/')) return `href="${asset(url)}"${opts.download ? ' download' : ''}`;
  if (url.startsWith('mailto:')) return `href="${esc(url)}"`;
  return `href="${esc(url)}" target="_blank" rel="noopener"`;
}
