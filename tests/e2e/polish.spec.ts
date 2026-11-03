import { expect, test } from '@playwright/test';
import { projects } from '../../src/content/projects';
import { settle } from './helpers';

test('sound is off by default, toggles from the HUD and is remembered', async ({ page }) => {
  await page.goto('./');
  await page.locator('#level [data-play]').first().click();
  const btn = page.locator('[data-sound]');
  await expect(btn).toBeVisible();
  await expect(btn).toHaveAttribute('aria-pressed', 'false');
  await expect(btn).toHaveAccessibleName(/Sound/);
  await btn.click();
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => localStorage.getItem('theparsius:sound'))).toBe('on');
  await page.reload();
  await expect(page.locator('[data-sound]')).toHaveAttribute('aria-pressed', 'true');
});

test('the touch pad shows only on touch screens', async ({ page, isMobile }) => {
  await page.goto('./');
  await page.locator('#level [data-play]').first().click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  if (isMobile) await expect(page.locator('.pad')).toBeVisible();
  else await expect(page.locator('.pad')).toBeHidden();
});

test('?tune shows the tuning panel and sliders change the live constants', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'desktop tool');
  await page.goto('./?tune');
  const panel = page.locator('.tune');
  await expect(panel).toBeVisible();
  const apex = panel.locator('.tune-apex');
  const before = await apex.textContent();
  await panel.locator('#tune-PHYSICS-jumpVelocity').fill('700');
  await expect(apex).not.toHaveText(before ?? '');
  await expect(apex).toHaveClass(/bad/); // 700² / 5200 ≈ 94 px: too low for the layout
  await page.reload();
  await expect(page.locator('#tune-PHYSICS-jumpVelocity')).toHaveValue('700'); // remembered
  await page.locator('.tune [data-t="reset"]').click();
  await expect(page.locator('.tune-apex')).not.toHaveClass(/bad/);
  await page.goto('./');
  await expect(page.locator('.tune')).toHaveCount(0); // absent without ?tune
});

test.describe('reduced motion', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('nothing animates on the main level, in play or in a room', async ({ page }) => {
    await page.goto('./');
    await settle(page);
    const running = () =>
      page.evaluate(() =>
        document
          .getAnimations()
          .filter((a) => a.playState === 'running')
          // Colour fades (hover outlines) are not motion; anything that moves or scales is.
          .filter(
            (a) =>
              !('transitionProperty' in a) ||
              !/color|shadow|opacity/.test(String((a as CSSTransition).transitionProperty)),
          )
          .map((a) => {
            const t = (a.effect as KeyframeEffect | null)?.target as Element | null;
            const name =
              (a as CSSAnimation).animationName ?? (a as CSSTransition).transitionProperty;
            return `${t?.className ?? '?'}: ${name}`;
          }),
      );
    expect(await running()).toEqual([]);
    await page.locator('#level [data-play]').first().click();
    await page.waitForTimeout(300);
    expect(await running()).toEqual([]); // ? blocks do not bob
    await page.keyboard.press('Escape');
    const card = page.locator(`#card-${projects[0]!.id}`);
    await card.scrollIntoViewIfNeeded();
    await card.hover();
    expect(await running()).toEqual([]); // no hover hop
    await card.locator('.frame').click();
    await expect(page.locator('#room h1')).toBeVisible();
    expect(await page.locator('.iris, .fade-veil.on').count()).toBe(0);
    expect(await running()).toEqual([]);
  });
});
