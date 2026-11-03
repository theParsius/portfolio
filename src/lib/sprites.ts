import grids from '../content/sprites.json' with { type: 'json' };
import { asset } from './asset';

interface Grid {
  mode: 'pixel' | 'smooth';
  width: number;
  height: number;
}
const GRIDS = grids as Record<string, Grid>;

/**
 * <img> markup for a sprite from public/.
 * Pixel sprites get their 1× size as --w/--h; CSS multiplies by the integer scale --s.
 * Sprites without a uniform pixel grid get class "smooth" and are sized by CSS.
 * Decorative by default (empty alt).
 */
export function spriteImg(
  path: string,
  cls: string,
  { attrs = '', alt = '', style = '' }: { attrs?: string; alt?: string; style?: string } = {},
): string {
  const key = path.replace(/^\//, '');
  const g = GRIDS[key];
  if (!g) throw new Error(`unknown sprite ${path}; run scripts/pixelate.ts`);
  const size =
    g.mode === 'pixel'
      ? `class="sprite pixel ${cls}" style="--w:${g.width};--h:${g.height};${style}"`
      : `class="sprite smooth ${cls}" style="${style}"`;
  return `<img ${size} src="${asset(path)}" alt="${alt}" ${attrs}>`;
}
