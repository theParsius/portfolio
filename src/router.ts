import { projectById } from './content/projects';
import type { PanelId } from './views/header';

/** Paths are relative to the Vite base (/portfolio/): "" = main level, "projects/<id>/" = a room. */
export type Route = { view: 'main'; at: PanelId | null } | { view: 'room'; id: string };

const BASE = import.meta.env.BASE_URL;
const PANELS: readonly PanelId[] = ['top', 'projects', 'about', 'contact'];
export const isPanel = (v: string | null | undefined): v is PanelId =>
  PANELS.includes(v as PanelId);

export function parse(loc: Pick<Location, 'pathname' | 'search'>): Route {
  const path = loc.pathname.startsWith(BASE)
    ? loc.pathname.slice(BASE.length)
    : loc.pathname.replace(/^\//, '');
  const m = /^projects\/([a-z0-9-]+)\/?(?:index\.html)?$/.exec(path);
  if (m?.[1] && projectById(m[1])) return { view: 'room', id: m[1] };
  const at = new URLSearchParams(loc.search).get('at');
  return { view: 'main', at: isPanel(at) ? at : null };
}

export const roomUrl = (id: string): string => `${BASE}projects/${id}/`;
export const mainUrl = (at?: PanelId | null): string =>
  at && at !== 'top' ? `${BASE}?at=${at}` : BASE;
