import type { Screenshot } from '../content/types';
import { asset } from './asset';

/** File names written by scripts/images.ts for one screenshot. */
export function shotVariants(s: Screenshot): { full: string; room: string; thumb: string } {
  const base = s.src.replace(/\.webp$/, '');
  return {
    full: asset(s.src),
    room: asset(`${base}-room.webp`),
    thumb: asset(`${base}-thumb.webp`),
  };
}
