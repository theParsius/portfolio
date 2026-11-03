export type Status = 'live' | 'released' | 'prototype' | 'jam' | 'unreleased';
export type Orientation = 'portrait' | 'landscape';

export interface ProjectLink {
  label: string; // "Google Play", "App Store", "Cafe Bazaar", "itch.io", "Trailer"
  url: string;
}

export interface Screenshot {
  src: string; // /projects/<id>/shot-1.webp (base-relative, resolve with asset())
  alt: string; // describes what the shot shows, not "screenshot 1"
  caption?: string; // short line shown on the plaque above the shot; falls back to alt
  width: number; // intrinsic px, to reserve layout space
  height: number;
}

export interface Project {
  id: string; // url slug
  title: string;
  years: { start: number; end: number | 'now' };
  color: string; // accent
  role: string; // one line, what YOU did
  status: Status;
  platforms: string[];
  stack: string[];
  hook: string; // mascot speech bubble, max ~60 chars
  description: string; // room intro, 2–4 sentences
  metrics?: string[];
  links: ProjectLink[];
  orientation: Orientation;
  icon: string;
  mascot: string; // pixel sprite, transparent PNG
  screenshots: Screenshot[];
  media?: { gif?: string; video?: string };
}

export interface Site {
  name: string;
  handle: string;
  role: string;
  bio: string[];
  stackLine: string;
  /** Public origin + base, used for canonical and Open Graph URLs. */
  url: string;
  /** Vite base path; the site is served from GitHub Pages at /portfolio/. */
  base: string;
  /** null = not provided yet; views show a "coming soon" toast instead of a link. */
  email: string | null;
  linkedin: string | null;
  itch: string | null;
  github: string | null;
  cv: string | null;
  /** The printable portfolio, base-relative (public/). */
  portfolioPdf: string | null;
}
