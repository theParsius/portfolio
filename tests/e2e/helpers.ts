import type { Page } from '@playwright/test';

export const scrollLeft = (page: Page, sel = '#level'): Promise<number> =>
  page.locator(sel).evaluate((el) => el.scrollLeft);

/** Left edge of an element relative to the scroller's viewport. */
export const viewportX = (page: Page, sel: string): Promise<number> =>
  page.locator(sel).evaluate((el) => {
    const sc = el.closest('.scroller');
    return el.getBoundingClientRect().left - (sc?.getBoundingClientRect().left ?? 0);
  });

/** Fonts loaded and the level's scroll position at rest (smooth scrolls finished). */
export async function settle(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  let last = NaN;
  for (let i = 0; i < 40; i++) {
    const now = await page.evaluate(
      () => document.querySelector('.scroller:not([hidden])')?.scrollLeft ?? 0,
    );
    if (now === last) return;
    last = now;
    await page.waitForTimeout(50);
  }
}
