import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/** Loads the module fresh with a fake browser; returns it and the URLs it sent. */
async function load(
  opts: { host?: string; dnt?: string; gpc?: boolean; webdriver?: boolean } = {},
) {
  vi.resetModules();
  const sent: string[] = [];
  vi.stubEnv('DEV', false);
  vi.stubGlobal('location', {
    hostname: opts.host ?? 'theparsius.github.io',
    pathname: '/portfolio/',
  });
  vi.stubGlobal('navigator', {
    webdriver: opts.webdriver ?? false,
    doNotTrack: opts.dnt ?? null,
    globalPrivacyControl: opts.gpc ?? false,
    sendBeacon: (url: string) => (sent.push(url), true),
  });
  vi.stubGlobal('document', {
    title: 'Parsa Tashakkori, game designer and developer',
    referrer: 'https://www.linkedin.com/',
  });
  vi.stubGlobal('screen', { width: 1440, height: 900 });
  vi.stubGlobal('devicePixelRatio', 2);
  const mod = await import('../src/lib/analytics');
  return { ...mod, sent, params: (i: number) => new URL(sent[i]!).searchParams };
}

describe('analytics', () => {
  beforeEach(() => vi.unstubAllGlobals());
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('sends a page view to GoatCounter, with the referrer only on the first view', async () => {
    const a = await load();
    a.trackView();
    a.trackView('/portfolio/projects/wordfly/');
    expect(a.sent).toHaveLength(2);
    expect(a.sent[0]).toMatch(/^https:\/\/theparsius\.goatcounter\.com\/count\?/);
    expect(a.params(0).get('p')).toBe('/portfolio/');
    expect(a.params(0).get('r')).toBe('https://www.linkedin.com/');
    expect(a.params(0).get('s')).toBe('1440,900,2');
    expect(a.params(1).get('p')).toBe('/portfolio/projects/wordfly/');
    expect(a.params(1).get('r')).toBe('');
  });

  it('marks events as events', async () => {
    const a = await load();
    a.trackEvent('play: start');
    expect(a.params(0).get('p')).toBe('play: start');
    expect(a.params(0).get('e')).toBe('true');
  });

  it.each([
    ['localhost', { host: 'localhost' }],
    ['an automated browser', { webdriver: true }],
    ['Do Not Track', { dnt: '1' }],
    ['Global Privacy Control', { gpc: true }],
  ])('sends nothing on %s', async (_, opts) => {
    const a = await load(opts);
    a.trackView();
    a.trackEvent('play: start');
    expect(a.sent).toEqual([]);
  });
});
