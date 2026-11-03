import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { projects } from '../../src/content/projects';
import { scrollLeft, settle, viewportX } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); // instant scrolls keep assertions deterministic
});

test('renders all five panels in order on one track', async ({ page }) => {
  await page.goto('./');
  const ids = await page
    .locator('[data-track] > section, [data-track] > .cards')
    .evaluateAll((els) => els.map((e) => e.id || e.className));
  expect(ids).toEqual(['top', 'projects', 'cards', 'about', 'contact']);
  await expect(page.locator('.card')).toHaveCount(projects.length);
  await expect(page.locator('.index a')).toHaveCount(projects.length);
  await expect(page.locator('main:not([hidden])')).toHaveCount(1);
});

test('scenery stands on the floor and cards float above it', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); // no bob while measuring
  await page.goto('./');
  await settle(page);
  const gaps = await page.evaluate(() => {
    const floor = document.querySelector('.floor')?.getBoundingClientRect().top ?? NaN;
    const hover = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--hover-h'),
    );
    return [...document.querySelectorAll('.card .frame, .deco, .hero-sprite, .about .avatar')]
      .filter((el) => el.getClientRects().length > 0)
      .map((el) => ({
        el: el.className,
        off:
          Math.round(floor - el.getBoundingClientRect().bottom) -
          (el.matches('.frame') ? hover : 0),
      }));
  });
  expect(gaps.filter((g) => Math.abs(g.off) > 1)).toEqual([]);
});

test('header links slide to their panel', async ({ page, isMobile }) => {
  await page.goto('./');
  await settle(page);
  await page.getByRole('navigation').getByRole('link', { name: 'Projects' }).click();
  await expect.poll(() => viewportX(page, '#projects')).toBeLessThanOrEqual(1);
  await expect(page).toHaveURL(/\?at=projects$/);
  if (!isMobile) {
    await page.getByRole('navigation').getByRole('link', { name: 'Contact' }).click();
    await expect.poll(() => scrollLeft(page)).toBeGreaterThan(1000);
    await expect(page.locator('#contact-title')).toBeFocused();
  }
});

for (const at of ['projects', 'about', 'contact'] as const) {
  test(`?at=${at} lands on the ${at} panel`, async ({ page }) => {
    await page.goto(`./?at=${at}`);
    await settle(page);
    const max = await page.locator('#level').evaluate((el) => el.scrollWidth - el.clientWidth);
    const left = await scrollLeft(page);
    const x = await viewportX(page, `#${at}`);
    // At the far end the track can't scroll further, so the panel may sit right of the edge.
    if (left < max - 1) expect(Math.abs(x)).toBeLessThanOrEqual(1);
    else expect(x).toBeGreaterThanOrEqual(-1);
  });
}

test('arrow keys move 60% of a screen', async ({ page }) => {
  await page.goto('./');
  await settle(page);
  const width = await page.locator('#level').evaluate((el) => el.clientWidth);
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => scrollLeft(page)).toBeCloseTo(width * 0.6, -1);
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => scrollLeft(page)).toBe(0);
});

test('vertical wheel scrolls sideways', async ({ page, isMobile }) => {
  test.skip(isMobile, 'no wheel on phones; native swipe scrolls');
  await page.goto('./');
  await settle(page);
  await page.mouse.move(400, 300);
  await page.mouse.wheel(0, 500);
  await expect.poll(() => scrollLeft(page)).toBeGreaterThanOrEqual(450);
});

test('contact links are real: email, CV and portfolio PDF', async ({ page, request }) => {
  await page.goto('./?at=contact');
  const contact = page.locator('#contact');
  await expect(contact.getByRole('link', { name: 'Email' })).toHaveAttribute(
    'href',
    'mailto:theparsius@gmail.com',
  );
  for (const [name, file] of [
    ['Download CV', 'cv.pdf'],
    ['Portfolio PDF', 'portfolio.pdf'],
  ] as const) {
    const link = contact.getByRole('link', { name });
    await expect(link).toHaveAttribute('href', `/portfolio/${file}`);
    await expect(link).toHaveAttribute('download', '');
    const res = await request.get(`/portfolio/${file}`);
    expect(res.ok()).toBe(true);
    expect(res.headers()['content-type']).toContain('pdf');
  }
  await expect(page.locator('[data-todo]')).toHaveCount(0); // no placeholders left
});

test('cards are single links named by title, years, role and status', async ({ page }) => {
  await page.goto('./');
  for (const p of projects) {
    const card = page.locator(`#card-${p.id} a.frame`);
    await expect(card).toHaveAttribute('href', `/portfolio/projects/${p.id}/`);
    const name = await card.evaluate((el) => el.textContent?.replace(/\s+/g, ' ').trim() ?? '');
    expect(name.startsWith(p.title)).toBe(true);
    expect(name).toContain(p.role);
    expect(name).toMatch(/Status: \w/);
  }
});

test('pixel sprites render at integer scales', async ({ page }) => {
  await page.goto('./');
  await settle(page);
  const bad = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLImageElement>('img.sprite.pixel')]
      .filter((img) => img.getClientRects().length)
      .map((img) => ({ src: img.src, s: img.getBoundingClientRect().width / img.naturalWidth }))
      .filter(({ s }) => Math.abs(s - Math.round(s)) > 0.01),
  );
  expect(bad).toEqual([]);
});

test('has no serious accessibility violations', async ({ page }) => {
  await page.goto('./');
  await settle(page);
  const { violations } = await new AxeBuilder({ page }).analyze();
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
});
