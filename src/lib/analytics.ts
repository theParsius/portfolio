/**
 * Privacy-friendly page views and events through GoatCounter (no cookies, no script download):
 * each hit is one request to its /count endpoint. Off on localhost, in automated browsers
 * (tests) and when the visitor sends Do Not Track or Global Privacy Control.
 * Dashboard: https://<site.analytics>.goatcounter.com
 */
import { site } from '../content/site';

const endpoint = site.analytics ? `https://${site.analytics}.goatcounter.com/count` : null;

function enabled(): boolean {
  if (!endpoint || import.meta.env.DEV) return false;
  if (/^(localhost|127\.|\[::1\]|0\.0\.0\.0)/.test(location.hostname)) return false;
  if (navigator.webdriver) return false;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (navigator.doNotTrack === '1' || nav.globalPrivacyControl) return false;
  return true;
}

const on = enabled();

function hit(params: Record<string, string>): void {
  if (!on || !endpoint) return;
  const q = new URLSearchParams({
    ...params,
    s: `${screen.width},${screen.height},${devicePixelRatio || 1}`,
    rnd: Math.random().toString(36).slice(2),
  });
  const url = `${endpoint}?${q}`;
  // sendBeacon survives the page unloading (an outbound link opening in this tab).
  if (!navigator.sendBeacon?.(url)) void fetch(url, { mode: 'no-cors', keepalive: true });
}

let firstView = true;

/** A page view; `path` defaults to the current URL path. */
export function trackView(path = location.pathname): void {
  // The referrer only means something for the page the visitor landed on.
  hit({ p: path, t: document.title, r: firstView ? document.referrer : '' });
  firstView = false;
}

/** A named event, e.g. "play-start" or "download: CV". */
export function trackEvent(name: string): void {
  hit({ p: name, t: name, e: 'true' });
}
