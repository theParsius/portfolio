import { expect, test, type Page } from '@playwright/test';
import { projects } from '../../src/content/projects';
import { PHYSICS } from '../../src/engine/constants';
import type { Rect, World } from '../../src/engine/physics';
import { reach } from '../../src/engine/reach';
import { settle } from './helpers';

interface Snap extends World {
  ids: string[];
}
interface Hook {
  state(): {
    on: boolean;
    paused: boolean;
    level: string;
    found: string[];
    player: Rect & { vx: number; vy: number; ground: boolean };
    camX: number;
  };
  colliders(): Snap;
  place(x: number, y: number, vy?: number): void;
}
declare global {
  interface Window {
    __game: Hook;
  }
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

const state = (page: Page) => page.evaluate(() => window.__game.state());
const colliders = (page: Page) => page.evaluate(() => window.__game.colliders());

/** Fail with the ids of any ? block the BFS cannot reach from the floor. */
async function expectReachable(page: Page, where: string) {
  const w = await colliders(page);
  expect(w.blocks.length, `${where}: no ? blocks found`).toBeGreaterThan(0);
  const r = reach(w);
  expect(
    r.unreachedBlocks.map((i) => w.ids[i]),
    `${where}: unreachable blocks`,
  ).toEqual([]);
}

/** Put the player under block `i` moving up fast enough to hit it. */
async function bump(page: Page, b: Rect) {
  await page.evaluate(
    ({ b, w }) => window.__game.place(b.x + b.w / 2 - w / 2, b.y + b.h + 4, -600),
    { b, w: PHYSICS.playerW },
  );
}

async function startPlay(page: Page) {
  await page.locator('body').click({ position: { x: 5, y: 300 } });
  await page.keyboard.press('p');
  await expect(page.locator('body')).toHaveClass(/playing/);
  await expect.poll(async () => (await state(page)).on).toBe(true);
}

test('every ? block on the main level is reachable', async ({ page }) => {
  await page.goto('./?test');
  await settle(page);
  await expectReachable(page, 'main');
});

for (const p of projects) {
  test(`room ${p.id}: exit blocks are reachable`, async ({ page }) => {
    await page.goto(`./projects/${p.id}/?test`);
    await settle(page);
    await expectReachable(page, p.id);
  });
}

test('P starts play, arrows move the player, Esc stops', async ({ page }) => {
  await page.goto('./?test');
  await settle(page);
  await startPlay(page);
  await expect(page.locator('.actor')).toBeVisible();
  await page.waitForTimeout(400); // land
  const x0 = (await state(page)).player.x;
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(500);
  await page.keyboard.up('ArrowRight');
  expect((await state(page)).player.x).toBeGreaterThan(x0 + 60);
  await page.keyboard.press('Escape');
  await expect(page.locator('body')).not.toHaveClass(/playing/);
  await expect(page.locator('.actor')).toBeHidden();
  await expect(page).toHaveURL(/\/portfolio\/(\?test)?$/); // Esc stopped play, nothing else
});

test('the Play buttons start play and Stop ends it', async ({ page }) => {
  await page.goto('./?test');
  await page.locator('#level [data-play]').first().click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.locator('[data-stop]').click();
  await expect(page.locator('body')).not.toHaveClass(/playing/);
});

test('bumping a card block opens its room; the exit block returns to the same spot', async ({
  page,
}) => {
  await page.goto('./?test');
  await settle(page);
  await startPlay(page);
  const w = await colliders(page);
  const id = projects[1]!.id;
  const i = w.ids.indexOf(id);
  const b = w.blocks[i]!;
  await page.locator(`#card-${id}`).scrollIntoViewIfNeeded();
  await bump(page, b);
  await expect(page).toHaveURL(new RegExp(`/projects/${id}/`));
  await expect(page.locator('[data-found]')).toHaveText('1');
  const s = await state(page);
  expect(s.level).toBe('room');
  expect(s.on).toBe(true);

  const rw = await colliders(page);
  const exit = rw.blocks[rw.ids.indexOf('exit')]!;
  await bump(page, exit);
  await expect(page).toHaveURL(/\/portfolio\/(\?test)?$/);
  const back = await state(page);
  expect(back.level).toBe('main');
  expect(back.on).toBe(true);
  expect(Math.abs(back.player.x - (b.x + b.w / 2 - PHYSICS.playerW / 2))).toBeLessThanOrEqual(1);
  await expect(page.locator(`#card-${id} .qblock`)).toHaveClass(/used/);

  // Bumping the same block again opens the room again but does not count twice.
  await page.waitForTimeout(400); // bump cooldown
  await bump(page, b);
  await expect(page).toHaveURL(new RegExp(`/projects/${id}/`));
  await expect(page.locator('[data-found]')).toHaveText('1');
});

test('a short tap of down drops through a one-way platform', async ({ page }) => {
  await page.goto('./?test');
  await settle(page);
  await startPlay(page);
  const w = await colliders(page);
  // A wide platform well above the floor (the camera follows the player there).
  const plat = w.plats.find((p) => p.w > 80 && p.y < w.floor.y - 120)!;
  expect(plat, 'no on-screen platform to stand on').toBeTruthy();
  await page.evaluate(({ x, y }) => window.__game.place(x, y), {
    x: plat.x + plat.w / 2 - PHYSICS.playerW / 2,
    y: plat.y - PHYSICS.playerH - 2,
  });
  await expect.poll(async () => (await state(page)).player.ground).toBe(true);
  expect((await state(page)).player.y + PHYSICS.playerH).toBeCloseTo(plat.y, 0);
  await page.keyboard.press('ArrowDown'); // a tap, not a hold
  await expect
    .poll(async () => (await state(page)).player.y + PHYSICS.playerH)
    .toBeGreaterThan(plat.y + 20);
});

test('opening a screenshot pauses play; closing resumes', async ({ page }) => {
  await page.goto(`./projects/${projects[0]!.id}/?test`);
  await settle(page);
  await startPlay(page);
  await page.locator('#room .shot').first().click();
  await expect(page.locator('dialog.lightbox')).toBeVisible();
  await expect.poll(async () => (await state(page)).paused).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog.lightbox')).toBeHidden();
  await expect.poll(async () => (await state(page)).paused).toBe(false);
  expect((await state(page)).on).toBe(true); // Esc closed the dialog, not the game
});

test('P inside a text field does not toggle play', async ({ page }) => {
  await page.goto('./?test');
  await page.evaluate(() => {
    const i = document.createElement('input');
    i.id = 'probe';
    document.body.append(i);
  });
  await page.locator('#probe').focus();
  await page.keyboard.press('p');
  expect((await state(page)).on).toBe(false);
});

test('the touch pad moves the player', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone only');
  await page.goto('./?test');
  await settle(page);
  await page.locator('#level [data-play]').first().tap();
  await expect(page.locator('.pad')).toBeVisible();
  await page.waitForTimeout(400);
  const x0 = (await state(page)).player.x;
  const right = page.locator('.pad [data-k="right"]');
  const box = (await right.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(400);
  await page.mouse.up();
  expect((await state(page)).player.x).toBeGreaterThan(x0 + 40);
});

test('keyboard works when the page is embedded in an iframe', async ({
  page,
  baseURL,
  isMobile,
}) => {
  test.skip(isMobile, 'desktop only');
  await page.setContent(
    `<iframe src="${baseURL}?test" style="width:1200px;height:700px;border:0"></iframe>`,
  );
  const frame = page.frameLocator('iframe');
  await expect(frame.locator('#level')).toBeVisible();
  await frame.locator('#level').click({ position: { x: 10, y: 300 } });
  await page.keyboard.press('p');
  await expect(frame.locator('body')).toHaveClass(/playing/);
  const f = page.frames().find((x) => x !== page.mainFrame())!;
  await page.waitForTimeout(400);
  const x0 = await f.evaluate(() => window.__game.state().player.x);
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(500);
  await page.keyboard.up('ArrowRight');
  expect(await f.evaluate(() => window.__game.state().player.x)).toBeGreaterThan(x0 + 60);
});

test('scrolling away during play holds the view until the player moves', async ({ page }) => {
  await page.goto('./?test');
  await settle(page);
  await startPlay(page);
  await page.waitForTimeout(400); // land, camera settles
  const sc = page.locator('#level');
  const home = await sc.evaluate((el) => el.scrollLeft);
  await sc.evaluate((el) => (el.scrollLeft += 900));
  await page.waitForTimeout(500);
  expect(await sc.evaluate((el) => el.scrollLeft)).toBeCloseTo(home + 900, -1);
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(150);
  await page.keyboard.up('ArrowRight');
  await expect.poll(() => sc.evaluate((el) => el.scrollLeft)).toBeLessThan(home + 300);
});
