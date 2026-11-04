import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { projects } from '../../src/content/projects';
import { scrollLeft, settle } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

const roomPath = (id: string) => `/portfolio/projects/${id}/`;
const roomTitle = (page: Page) => page.locator('#room h1');

/** Scroll the main level so the card is on screen, remember the position, click it. */
async function openFromCard(page: Page, id: string): Promise<number> {
  await page.locator(`#card-${id} .frame`).scrollIntoViewIfNeeded();
  await settle(page);
  const before = await scrollLeft(page);
  await page.locator(`#card-${id} .frame`).click();
  await expect(page).toHaveURL(roomPath(id));
  return before;
}

test('card → room → exit block returns to the same scroll and focuses the card', async ({
  page,
}) => {
  await page.goto('./');
  const p = projects[2]!;
  const before = await openFromCard(page, p.id);
  await expect(roomTitle(page)).toHaveText(p.title);
  await expect(roomTitle(page)).toBeFocused();
  await expect(page).toHaveTitle(`${p.title}, Parsa Tashakkori`);
  await expect(page.locator('main:not([hidden])')).toHaveCount(1);

  await page.locator('#room [data-exit]').first().click();
  await expect(page).toHaveURL('/portfolio/');
  await expect(page.locator('#level')).toBeVisible();
  await expect.poll(() => scrollLeft(page)).toBeCloseTo(before, 0);
  await expect(page.locator(`#card-${p.id} .frame`)).toBeFocused();
});

test('browser back and Esc both leave the room at the same scroll', async ({ page }) => {
  await page.goto('./');
  const p = projects[4]!;
  const before = await openFromCard(page, p.id);
  await page.goBack();
  await expect(page).toHaveURL('/portfolio/');
  await expect.poll(() => scrollLeft(page)).toBeCloseTo(before, 0);

  await openFromCard(page, p.id);
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL('/portfolio/');
  await expect.poll(() => scrollLeft(page)).toBeCloseTo(before, 0);
});

test('Projects sign links open rooms and focus returns to the link', async ({ page }) => {
  await page.goto('./?at=projects');
  const p = projects[5]!;
  const link = page.locator(`.index a[data-room="${p.id}"]`);
  await link.click();
  await expect(roomTitle(page)).toHaveText(p.title);
  await page.keyboard.press('Escape');
  await expect(link).toBeFocused();
});

for (const p of projects) {
  test(`deep link to ${p.id} survives a refresh`, async ({ page }) => {
    await page.goto(roomPath(p.id));
    await expect(roomTitle(page)).toHaveText(p.title);
    await page.reload();
    await expect(roomTitle(page)).toHaveText(p.title);
    await expect(page.locator('#room .shot')).toHaveCount(p.screenshots.length);
  });
}

test('exiting a deep-linked room replaces the URL and shows its card', async ({ page }) => {
  const p = projects[6]!;
  await page.goto(roomPath(p.id));
  await page.locator('#room [data-exit]').last().click();
  await expect(page).toHaveURL('/portfolio/');
  await expect(page.locator(`#card-${p.id} .frame`)).toBeFocused();
  await expect(page.locator(`#card-${p.id}`)).toBeInViewport();
});

test('after next, the exit returns to the room on screen, not the one first entered', async ({
  page,
}) => {
  await page.goto('./');
  await openFromCard(page, projects[2]!.id);
  const p = projects[3]!;
  await page.locator('#room [data-go]').last().click();
  await expect(roomTitle(page)).toHaveText(p.title);
  await page.locator('#room [data-exit]').first().click();
  await expect(page).toHaveURL('/portfolio/');
  await expect(page.locator(`#card-${p.id}`)).toBeInViewport();
  await expect(page.locator(`#card-${p.id} .frame`)).toBeFocused();
});

test('prev / next replace the URL without adding history', async ({ page }) => {
  await page.goto('./');
  await openFromCard(page, projects[0]!.id);
  const len = await page.evaluate(() => history.length);
  await page.locator('#room [data-go]').last().click();
  await expect(page).toHaveURL(roomPath(projects[1]!.id));
  await expect(roomTitle(page)).toHaveText(projects[1]!.title);
  await page.locator('#room [data-go]').first().click();
  await page.locator('#room [data-go]').first().click();
  await expect(roomTitle(page)).toHaveText(projects.at(-1)!.title); // wraps around
  expect(await page.evaluate(() => history.length)).toBe(len);
  await page.goBack();
  await expect(page).toHaveURL('/portfolio/');
});

test('lightbox: arrows cycle, Esc closes, focus returns to the shot', async ({ page }) => {
  const p = projects[0]!;
  await page.goto(roomPath(p.id));
  const shot = page.locator('#room .shot').nth(1);
  await shot.scrollIntoViewIfNeeded();
  await shot.click();
  const dialog = page.locator('dialog.lightbox');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(`2 / ${p.screenshots.length}`);
  await expect(dialog.locator('img')).toHaveAttribute('alt', p.screenshots[1]!.alt);
  await page.keyboard.press('ArrowRight');
  await expect(dialog).toContainText(`3 / ${p.screenshots.length}`);
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await expect(dialog).toContainText(`1 / ${p.screenshots.length}`);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(shot).toBeFocused();
  await expect(page).toHaveURL(roomPath(p.id)); // Esc closed the lightbox, not the room
});

test('header links on a room exit first, then slide to the panel', async ({ page, isMobile }) => {
  await page.goto('./');
  await openFromCard(page, projects[1]!.id);
  const name = isMobile ? 'Projects' : 'About';
  await page.getByRole('navigation').getByRole('link', { name }).click();
  await expect(page.locator('#level')).toBeVisible();
  await expect(page.locator(`#${name.toLowerCase()}`)).toBeInViewport();
});

test('unknown paths fall back to the main level', async ({ page }) => {
  await page.goto('/portfolio/no-such-page/');
  await expect(page.locator('#level')).toBeVisible();
  await expect(page).toHaveURL('/portfolio/');
  await page.goto('/portfolio/projects/no-such-project/');
  await expect(page.locator('#level')).toBeVisible();
});

test('room pages are prerendered with their own title and Open Graph tags', async ({ request }) => {
  for (const p of projects) {
    const html = await (await request.get(roomPath(p.id))).text();
    expect(html).toContain(`<title>${p.title}, Parsa Tashakkori</title>`);
    expect(html).toContain(
      `og:url" content="https://theparsius.github.io/portfolio/projects/${p.id}/"`,
    );
    expect(html).toMatch(/og:image" content="https:\/\//);
  }
});

test('a room has no serious accessibility violations', async ({ page }) => {
  await page.goto(roomPath(projects[0]!.id));
  await settle(page);
  const { violations } = await new AxeBuilder({ page }).analyze();
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
});

test.describe('with motion', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  });

  test('fade transition: card → room → exit → room again', async ({ page }) => {
    await page.goto('./');
    const p = projects[3]!;
    const before = await openFromCard(page, p.id);
    await expect(roomTitle(page)).toHaveText(p.title);
    await expect(page.locator('.fade-veil')).toHaveCSS('opacity', '0');
    await page.locator('#room [data-exit]').first().click();
    await expect(page).toHaveURL('/portfolio/');
    await expect.poll(() => scrollLeft(page)).toBeCloseTo(before, 0);
    await expect(page.locator('.fade-veil')).toHaveCSS('opacity', '0'); // clicks mid-fade are ignored
    await page.locator(`#card-${p.id} .frame`).click();
    await expect(roomTitle(page)).toHaveText(p.title);
  });
});

test('screenshots float as a climb and show a plaque outside the image', async ({
  page,
  isMobile,
}) => {
  const p = projects[0]!;
  await page.emulateMedia({ reducedMotion: 'reduce' }); // no bob while measuring
  await page.goto(roomPath(p.id));
  await settle(page);
  const boxes = await page.evaluate(() => {
    const floor = document.querySelector('#room .floor')!.getBoundingClientRect().top;
    return [...document.querySelectorAll('#room .shot')].map((el) => {
      const r = el.getBoundingClientRect();
      return { top: Math.round(floor - r.top), bottom: Math.round(floor - r.bottom) };
    });
  });
  expect(new Set(boxes.map((b) => b.top)).size).toBeGreaterThan(2); // tops step up and down
  for (const b of boxes) expect(b.bottom).toBeGreaterThanOrEqual(50); // none rests on the grass
  test.skip(isMobile, 'no hover on touch');
  for (const n of [0, 1]) {
    const slot = page.locator('#room .shot-slot').nth(n);
    await slot.scrollIntoViewIfNeeded();
    const cap = slot.locator('.shot-cap');
    await expect(cap).toHaveCSS('opacity', '0');
    await slot.locator('.shot').hover();
    await expect(cap).toHaveCSS('opacity', '1');
    await expect(cap).toHaveText(p.screenshots[n]!.caption ?? p.screenshots[n]!.alt);
    const shot = (await slot.locator('.shot').boundingBox())!;
    const c = (await cap.boundingBox())!;
    const outside = c.y >= shot.y + shot.height || c.y + c.height <= shot.y;
    expect(outside, 'plaque sits above or below the image, not on it').toBe(true);
  }
});

test('the lightbox shows the screenshot caption', async ({ page }) => {
  const p = projects[2]!;
  await page.goto(roomPath(p.id));
  await page.locator('#room .shot').first().click();
  await expect(page.locator('dialog.lightbox .lb-cap')).toHaveText(
    p.screenshots[0]!.caption ?? p.screenshots[0]!.alt,
  );
});
