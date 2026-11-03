# theParsius Portfolio: Audit and Implementation Plan

Nov 3, 2026. Companion to `document/theParsius Portfolio Build Spec.md` (to become `docs/SPEC.md`).

---

## 1. Audit of the current repo

### 1.1 What is there

| Area | State |
| --- | --- |
| Stack | React 18, Vite 4, Tailwind 3, framer-motion, GSAP, tsparticles, react-slick, react-router 6, EmailJS. Plain JSX, no TypeScript, no tests. |
| Size | ~1,400 LOC across 26 JSX/JS files (`src/Pages`, `src/Components`, `src/Constants/constants.js`). |
| Dependencies | 42 runtime deps. Many are unused or duplicated: `emailjs` and `@emailjs/browser`, `font-awesome` (npm) plus FontAwesome via a CDN kit, three particle packages, `react-globe.gl`, `match-sorter`, `sort-by`, `localforage`, `lodash-move`, `pathseg`. Build tools (`vite`, `tailwindcss`, `autoprefixer`, `@vitejs/plugin-react`) sit in `dependencies`. |
| Runtime network | FontAwesome kit script, Google Fonts, `cdn.rawgit.com/.../pathseg.js` (rawgit shut down in 2019, so this request fails on every load), Webflow-hosted noise PNG. All of these break the spec's no-runtime-CDN rule. |
| Lockfiles | Both `package-lock.json` and `pnpm-lock.yaml` are committed. |
| Deploy | `npm run deploy` → `gh-pages -d dist` (pushes to a `gh-pages` branch). Vite `base: "/portfolio/"`. No GitHub Actions. |
| Hosting URL | `https://theparsius.github.io/portfolio/`: a project site, so every route lives under `/portfolio/`. |
| Casing bug | Git tracks `src/Components/...` but the working tree has `src/components/...`. This works on macOS (case-insensitive) and breaks on Linux CI. It doesn't matter once the code is deleted. |
| Env | `vite.config.js` loads `dotenv` for EmailJS keys. No contact form in the new design, so this goes away. |
| Last real change | May 2024 (Dec 2024 commits only touch lockfile/constants). |

**Verdict:** you're right that nothing in the code carries over. The new design is plain DOM + TypeScript, and the React tree, Tailwind, the animation libraries and the routing are all replaced. **The assets and data are worth keeping, though, so preserve them before you delete anything:**

### 1.2 What must be preserved before deleting

| Item | Where | Why |
| --- | --- | --- |
| **Full-resolution screenshots** | `src/assets/projects/{honeyland,lineUp,funtomime,savingPrivateTeddy,aghaKhan}/` | 1920×1080 / 1080×1920 / 1850×900 originals. The starter zip only has 324–576px PDF crops. The spec lists "higher-resolution screenshots" as **missing**, but 5 of the 7 projects already have them here. WordFly and Dice Fight have no originals. |
| Hi-res icons | same folders (`icon.png`, 320–600px) | Better source than the 160px starter WebPs. Agha Khan's starter icon is **160×175 (not square)**, so re-export it from the 600×655 original with a square crop. |
| Logo | `src/assets/logo/theParsiusLogo.png` | Candidate favicon (the spec lists the favicon as missing). |
| Real links | `src/Constants/constants.js`, `SocialLinks.jsx` | See 1.3. |

Everything else (`tech/*.png` skill icons, `stores/*.png` badges, fonts in `public/Fonts`: Mario, Morganite, Permanent Marker) is not used by the new design. The Mario font in particular should not ship.

### 1.3 Links recovered from the old code

| Link | URL |
| --- | --- |
| Honeyland, App Store | https://apps.apple.com/ca/app/honeyland/id1639336677 |
| Honeyland, Google Play | https://play.google.com/store/apps/details?id=honey.land.game |
| Line-Up, Cafe Bazaar | https://cafebazaar.ir/app/com.LuLuGames.LineUp?l=en |
| Funtomime, Cafe Bazaar | https://cafebazaar.ir/app/com.RobinGames.Funtomime?l=en |
| Saving Private Teddy, itch.io | https://theparsius.itch.io/saving-private-teddy |
| LinkedIn | https://www.linkedin.com/in/parsa-tashakkori-23b023a3/ |
| GitHub | https://github.com/theParsius |

**Still missing:** WordFly Google Play + App Store URLs, contact email, itch.io profile URL (presumably `https://theparsius.itch.io`), `cv.pdf`.

### 1.4 Starter assets (zip) audit

- 55 images, laid out as `public/` as described. `prototype.html` is included (1.8 MB).
- **No fonts are included**, although the spec's tree shows `public/fonts/`, so they have to be sourced (see M1).
- Screenshots: 5 per project, sized 324×576 to 576×324 (WordFly 396×861, Dice Fight 362×790). Fine for v1, but blurry in the lightbox at 94vw.
- **Pixel art is pre-upscaled at non-integer factors.** Mascots are ~10× upscaled (Honeyland bee 276×242 for roughly 28×24 art pixels); grass cells are ~9–10px; avatar 318×348; clouds 1451×343. Drawn at the spec's sizes (mascot 76px tall, avatar 200px, clouds 640px), they are **downscaled by non-integer ratios**, which breaks the spec's own "integer scales only" rule and causes uneven pixels. Fix: recover 1× sources (see M2.1).
- `grass.png` is a 900px crop with a visible seam (the spec already flags this).

### 1.5 Prototype (`prototype.html`) audit

Read in full (base64 stripped). It matches the spec closely. These differences matter for the port:

| Prototype | Spec / rebuild |
| --- | --- |
| Hash routing (`#honeyland`) | History API `/projects/<id>/` |
| Ids `dicefight`, `lineup`, `teddy`, `aghakhan` | Spec ids `dice-fight`, `line-up`, `saving-private-teddy`, `agha-khan` (these match the asset folders, so use them) |
| `years` is a string, `sk` status key | Typed `years: {start, end}`, `Status` union |
| Google Fonts link | Self-hosted |
| Screenshot alt = "X screenshot n" | Real alt text from content |
| Physics constants inlined in `step()` | `src/engine/constants.ts` |
| One 400-line script with globals (`G`, `LV`, `K`, `viewing`, `busy`) | Split into the spec's modules (see section 3) |
| No swipe code: touch relies on native overflow scrolling | Keep native. **Don't build a custom swipe handler.** The spec's "swipe" means native scrolling. |
| Room mascot drawn at 84px, card mascot at 76px | Pick one integer-scale size per mascot (M2.1) |

Behaviours the prototype gets right and that must be kept exactly: `camX` float separate from `scrollLeft`; `jumpQueued` / `dropQueued` set on keydown; `prevB <= pl.y + 1` landing test; parking the actor in the main track before rebuilding the room; the 800ms `untilView` timeout; restoring `savedPlayer` on room exit.

---

## 2. Spec issues to resolve before or during the build

Sorted by how soon they block work. **Items 1–3 need your decision before M1.**

| # | Issue | Recommendation |
| --- | --- | --- |
| 1 | **Base path.** Spec routes are `/` and `/projects/<id>/`, but the site is served at `/portfolio/`. Prerender output, OG URLs, `404.html` asset paths and the router all depend on this. | Make it config: `site.base` = `/portfolio/` and Vite `base` reads from it. The router strips `import.meta.env.BASE_URL`, and all asset paths go through an `asset()` helper. That way a later move to a custom domain or a `theparsius.github.io` user repo is a one-line change. |
| 2 | **Pages source.** The repo currently deploys via a `gh-pages` branch. The spec wants Actions. | Switch to Actions (`actions/deploy-pages`). **You must change Settings → Pages → Source to "GitHub Actions"** after the first workflow lands. Delete the `gh-pages` branch afterwards. |
| 3 | **What to commit from `document/`.** 5.9 MB PDF, 2.5 MB zip, 1.8 MB prototype. | Commit `docs/SPEC.md` and `docs/prototype.html` (the CLAUDE.md references it as the behavioural reference). Keep the PDF and zip out of git (add `document/` to `.gitignore`). Put hi-res originals in `assets-src/`, which is committed; it's around 15 MB. If that's too big, use Git LFS. |
| 4 | Fonts aren't in the zip. | Use `@fontsource/pixelify-sans` and `@fontsource/atkinson-hyperlegible` (both OFL), imported from CSS. Vite bundles the woff2 files, so there are no runtime requests. Latin subset only. (This differs slightly from the spec's `public/fonts/`.) |
| 5 | "Vite 5". It's Nov 2026, so Vite 5 is two majors old. | Use the current stable Vite and TS. The spec only cares about "fast dev server + static output". |
| 6 | Integer-scale rule vs fixed geometry (mascot 76px, avatar 200px). | Once 1× sources exist, size each sprite at the nearest integer multiple (for example a 26px-tall mascot at ×3 is 78px). Make the reachability test, not the exact px values, the source of truth. Update the spec table. |
| 7 | OG image = first screenshot. Portrait shots (324×576) make poor 1200×630 cards and get cropped badly. | M3: use the first landscape shot or the icon. M6: generate 1200×630 cards at build time with `sharp` (accent background + mascot + title + shot). |
| 8 | OG/canonical tags need absolute URLs. | Add `site.url` (`https://theparsius.github.io/portfolio/`) to `site.ts`. |
| 9 | The reachability test needs real layout. | Collider building (`colliders.ts`) is a pure function from DOM to rects. The BFS (`reach.ts`) is pure and unit-tested. Playwright calls a debug hook (`window.__level.colliders()`, only exposed when `?test` or in dev) and runs the BFS in Node. |
| 10 | `404.html` comes back with HTTP 404. | Prerendered `projects/<id>/index.html` files make deep links return 200, so the 404 fallback only handles unknown paths, which correctly fall back to the main level. Also emit `/portfolio/index.html` for `?at=` links. |
| 11 | Two `<main>` elements. | Fine as long as exactly one is not `hidden` at any time. Add an assertion in the e2e tests. |
| 12 | Content gaps (copy, alt text, metrics, dates, WordFly wording). | Not a code blocker. M1 ships prototype copy plus `TODO` alt text. You own the rewrite before M6 (spec items 2–5). |

---

## 3. Target architecture

Matches the spec's tree, with these additions marked `+`:

```text
portfolio/
├─ CLAUDE.md                     (from spec)
├─ index.html
├─ vite.config.ts
├─ tsconfig.json                 strict, noUncheckedIndexedAccess
├─ playwright.config.ts          3 projects: 1280x800, 1366x640, 390x844 (+ touch)
├─ .github/workflows/deploy.yml  + build, test, e2e, deploy-pages
├─ docs/  SPEC.md, prototype.html, IMPLEMENTATION_PLAN.md
├─ assets-src/                   + hi-res originals, upscaled PDF pixel art, Aseprite files
├─ public/
│  ├─ sprites/  projects/<id>/  cv.pdf  favicon.png
├─ scripts/
│  ├─ prerender.ts               per-route HTML with title/OG/canonical; copies 404.html
│  ├─ pixelate.ts              + detect pixel grid, emit 1× PNGs (sharp)
│  └─ images.ts                + originals → WebP ≤1440w q80, writes dims to a JSON manifest
├─ src/
│  ├─ main.ts                    boot, wires router ↔ views ↔ game
│  ├─ router.ts                + base-aware History router, enteredInPage flag
│  ├─ content/ projects.ts, site.ts, types.ts
│  ├─ views/   mainLevel.ts, room.ts, lightbox.ts, header.ts
│  ├─ engine/
│  │  ├─ constants.ts          + all tunables (single source)
│  │  ├─ physics.ts              pure step(player, input, world, dt) → events
│  │  ├─ colliders.ts            DOM → {plats, blocks, floor, npcs, flag} in track coords
│  │  ├─ reach.ts              + BFS reachability (pure)
│  │  ├─ camera.ts, input.ts, actor.ts, fx.ts
│  │  └─ game.ts                 loop, start/stop/pause, level switching, save/restore
│  ├─ ui/      transition.ts (iris + fade), toast.ts, touchPad.ts, tune.ts (+ ?tune panel)
│  └─ styles/  tokens.css, base.css, level.css, room.css
└─ tests/
   ├─ engine.spec.ts, reach.spec.ts
   └─ e2e/ navigation.spec.ts, play-mode.spec.ts, reachability.spec.ts
```

**Key boundary:** `physics.ts` never touches the DOM. It takes `{player, input, world}` and returns the new player plus events (`land{speed}`, `bump{blockId}`, `talk{npcId}`, `flag`). `game.ts` turns the events into DOM effects. That keeps the spec's required unit tests (landing, drop-through, head-bump, coyote, buffer) cheap and deterministic.

**Level abstraction:** `type Level = { kind: 'main' | 'room'; scroller: HTMLElement; track: HTMLElement }`. The game holds one active level, and `setLevel()` moves the actor canvas and clears fx, as the prototype does.

---

## 4. Milestones

Each milestone ends with its acceptance list from the spec plus the extras below. One milestone per Claude Code session, and stop for review after each.

### M0. Clean slate and preserve (½ day)

1. Create a branch `rebuild`.
2. Move originals into `assets-src/`: `src/assets/projects/*` → `assets-src/projects/<spec-id>/originals/`, plus the logo.
3. Delete: `src/`, `public/Fonts/`, `index.html`, `tailwind.config.js`, `postcss.config.js`, `.eslintrc.cjs`, `vite.config.js`, `pnpm-lock.yaml`, `package-lock.json`, `dist/`, `node_modules/`.
4. Add `docs/SPEC.md` (the spec, renamed), `docs/prototype.html`, root `CLAUDE.md` (from the spec, with the path updated to `docs/prototype.html`), and `document/` in `.gitignore`.
5. Unzip `public/` from the starter zip.

**Done when:** the repo has only docs, `assets-src/`, `public/`, and config. Old originals are reachable in `assets-src/`.

### M1. Scaffold and content (1 day)

- `npm create vite` (vanilla-ts), TS strict, ESLint (typescript-eslint) + Prettier.
- Scripts: `dev`, `build` (= `tsc --noEmit && vite build && tsx scripts/prerender.ts`), `test` (Vitest), `e2e` (Playwright), `preview`.
- Fonts via @fontsource (section 2, item 4).
- `content/types.ts` exactly as in the spec. `projects.ts` filled from the prototype's `P` array, mapped to spec ids, `years` split into `{start, end}`, the links from section 1.3, and screenshot `width`/`height` from the real files. Each screenshot gets a descriptive alt (a draft is fine).
- `site.ts`: name, handle, role, bio, stack line, email, LinkedIn, itch, GitHub, CV path, `url`, `base`.
- A build-time assertion (`scripts/validate-content.ts`, also run in Vitest): every referenced asset exists, `hook.length ≤ 60`, ids are unique and slug-safe, landscape/portrait orientation matches the image dimensions.
- `.github/workflows/deploy.yml`: Node LTS, `npm ci`, `npm test`, `npm run build`, upload `dist`, `deploy-pages`. Add the e2e job in M2, once there's something to test.
- `prerender.ts` stub: copy `dist/index.html` → `dist/404.html`.

**Accept:** `npm run build` is green; the deploy workflow publishes a placeholder page at `/portfolio/`; a refresh on `/portfolio/anything` serves the app.

### M2. Main level, no game (2–3 days)

**M2.1 Pixel asset pass (do first, because the layout depends on it).**
`scripts/pixelate.ts` detects each upscaled sprite's cell size (GCD of run lengths, or the mode of the step between colour changes) and writes nearest-neighbour 1× PNGs. Move the upscaled originals to `assets-src/sprites/`. Make a seamless grass tile by cropping one period from the 1× strip; if it doesn't tile cleanly, keep the strip and flag it for a hand-drawn tile in M5. Then pick each sprite's integer CSS scale.

**M2.2 Views.**
- `styles/tokens.css`: colours, type and spacing straight from the spec's tables. `--trackH: max(540px, 100svh − header − safe-area)`.
- `header.ts`: logo, Projects/About/Contact/CV, Play. The HUD (found x/7 + Stop) stays hidden for now.
- `mainLevel.ts`: hero (h1, lede, CTAs, P hint hidden on `pointer: coarse`, clouds, idle sprite canvas, trees, tower), Projects sign generated from `projects`, cards, About, Contact + flag. All `data-solid` attributes are placed now, even though nothing reads them yet, so M4 doesn't have to revisit markup. ? blocks render but stay `display:none` with `aria-hidden`.
- Sideways nav: wheel→horizontal (respect `deltaMode`), ←/→ = 60% viewport (smooth unless reduced motion), header links → `goTo(panel)`, `?at=projects|about|contact` on load.
- Images: `width`/`height` attributes from content; card thumbs use `loading="lazy"` (works for horizontal overflow in Chromium and Safari 16.4+); `decoding="async"`.

**Accept:** the spec's M2 list plus axe-core in Playwright with zero serious violations, body text ≥ 15px, focus ring visible on every interactive element, and screenshots at the 3 viewports compared by eye against the prototype. Save them as Playwright baselines.

### M3. Project rooms, no game (2 days)

- `router.ts`: `parse(location) → {view:'main', at?} | {view:'room', id}`, `push/replace/back`, `enteredInPage`. Handles `popstate`.
- `room.ts`: built from `Project` alone (entrance with the exit block + mascot, intro with the facts `<dl>` and store links as real `<a target="_blank" rel="noopener">`, Screenshots sign, shots row with portrait/landscape sizing from the spec, More projects prev/next, second exit block). `<h1 tabindex="-1">` focused on entry; `document.title` updated.
- Return state: save `scrollLeft` on entry; on exit restore it and focus `#card-<id> .frame`.
- Esc (not playing) and both exit blocks exit; prev/next use `replaceState`.
- `lightbox.ts`: `<dialog>`, ←/→ cycle, Esc closes, focus returns to the clicked shot. Screenshots lazy-load per room. Use `srcset` if you export two widths.
- `ui/transition.ts`: 150ms fade for click navigation (spec open decision #8 default). The iris is built here but only used by play mode in M4. Both resolve after at most 800ms no matter what.
- `prerender.ts`: for each project, write `dist/projects/<id>/index.html` from the built `index.html` with `<title>`, meta description (first sentence), canonical, `og:title/description/image/url`, `twitter:card`. Absolute URLs from `site.url`.
- `images.ts`: originals in `assets-src/` → WebP ≤1440w q80 for the 5 projects that have them. Update dims in content. Also map the old filenames to shot order (for example `honeyland/hive.jpg` → `shot-?`), which needs a visual match, so do it by hand or with a perceptual hash.

**Accept:** the spec's M3 list, plus Playwright: deep link + refresh for all 7 rooms; card → room → exit restores `scrollLeft` within 1px; back button behaves the same; `view-source` of a room route shows the project's own title/OG.

### M4. Engine (3–4 days)

Port the prototype's game section into modules. Don't re-tune anything here; just reproduce the prototype's behaviour.

1. `constants.ts`: every number from the spec's physics table, plus coin/dust/bump timings.
2. `physics.ts` (pure), then **write the unit tests first**: landing only when falling and `prevBottom ≤ top+1`; one-way pass-through from below; drop-through ignores plats for 0.22s but never the floor/blocks; head-bump from below sets `vy=0` and emits `bump`; coyote lets a jump fire 0.09s after leaving a ledge but not at 0.11s; a jump buffered 0.11s before landing fires on landing; jump-cut gravity; apex ≈ 177px ±2.
3. `colliders.ts`: `text` mode via `Range.getClientRects` merged per line (top + 18% of line height), `kids`, plain, `.qblock`, `.floor`. Rebuilt on play start, `ResizeObserver` on both tracks, `document.fonts.ready`, level change, lightbox close.
4. `reach.ts` + `tests/e2e/reachability.spec.ts`: BFS from the floor (climb ≤165, gap ≤230), asserting every main ? block and both exit blocks per room are reachable at all 3 viewports. This test gates CI.
5. `input.ts`: `code` then `key` fallback, capture phase, preventDefault only while playing, queued jump/drop, clear on blur/pause/lightbox, focus `window`+`body` on start and pointerdown, a 0.5s `hasFocus` check → toast.
6. `camera.ts` (float `camX`, lerp `min(1, dt·6)` to 40%, wheel during play updates `camX`); `actor.ts` (12×18 canvas ×3, redraw only on frame change, the prototype's placeholder frames); `fx.ts` (coin, dust as DOM nodes).
7. `game.ts`: fixed 120Hz accumulator, dt clamp [0, 1/30], start/stop/pause, `setLevel`, save/restore `{p, camX}` across rooms, found set (main blocks only), flag → "Level clear" + contact bounce, NPC talk zones, iris on block-triggered navigation, HUD.
8. `touchPad.ts`: pointer events, `touch-action:none`, shown on `body.playing`. Show it everywhere for now; restricting it to `pointer: coarse` is M5.
9. Debug hook `window.__game` (dev / `?test` only) to read the player state for e2e.

**Accept:** the spec's M4 list plus the spec's flow and input tests: play → bump a card block → room → bump the exit → player x restored ±1px and found=1, bumping it again keeps found=1; holding → for 400ms increases x; a short ↓ tap drops through. Keyboard works inside an `<iframe>` harness page (Playwright fixture).

### M5. Feel and polish (open-ended; timebox to 3 days + playtests)

- `?tune` panel: sliders bound to a mutable copy of `constants`, "copy as TS" button. Run 3+ playtests, then commit the constants **and update docs/SPEC.md** (CLAUDE.md rule).
- Real player sheet (idle×2, run×4–6, jump, fall, land, bump) in `assets-src/player.aseprite` → `public/sprites/player.png` + a JSON frame map. Swap `actor.ts` from code-drawn to sheet-driven. Run frames advance by distance, as in the prototype.
- ? block, used block and coin as sprites; seamless grass tile.
- Fade on click vs iris in play is final. Under reduced motion: no iris, no cloud drift, no bob, no hover hop, instant scrolls (audit with Playwright `reducedMotion: 'reduce'`).
- Sound (open decision #9): WebAudio with tiny files for jump/coin/bump/land, off by default, header speaker toggle, `localStorage`. Lazy-load the audio on first enable.
- Touch pad only on `pointer: coarse` once focus handling is verified on desktop Safari.
- Optional: a thin progress bar under the header (open decision #11).

### M6. Launch (1–2 days)

- Copy rewrite (you), real WordFly links, email, `cv.pdf`, favicon from the logo, 1200×630 OG cards (`scripts/og.ts` with sharp).
- Budget check: < 1.5 MB transferred before first interaction (fonts ~60 KB, 1× sprites a few KB, card thumbs lazy). Add a Playwright test that sums transferred bytes on `/`.
- Lighthouse CI (`treosh/lighthouse-ci-action`) on `/` and one room: Performance ≥ 90, Accessibility ≥ 95.
- Optional Plausible (no cookies).
- Merge `rebuild` → `main`, switch the Pages source, delete the `gh-pages` branch.

---

## 5. Risks

| Risk | Mitigation |
| --- | --- |
| Layout changes silently break reachability | The BFS test gates CI from M4 onward. In M2/M3, run it manually from a dev console hook. |
| Text-line colliders move with font loading | Rebuild on `document.fonts.ready`. Fonts are self-hosted with `font-display: block` for Pixelify (short, avoids a mid-play reflow). |
| Safari focus and keyboard quirks inside iframes or after a click | Already handled by the prototype's focus pattern. Add a WebKit project to Playwright. |
| `scrollLeft` rounding stalls the camera | Keep the float `camX` (prototype pattern). Unit-test the camera convergence. |
| Hi-res originals bloat the repo | `assets-src/` ≈ 15 MB. Acceptable, or use Git LFS. |
| Feel is subjective | `?tune` + playtests in M5, and constants are versioned in the spec. |

---

## 6. Needed from you

**Decided (Nov 3, 2026):**
1. Base path: keep `theparsius.github.io/portfolio/`. Routes are `/portfolio/` and `/portfolio/projects/<id>/`.
2. `assets-src/**` is stored in Git LFS (see `.gitattributes`). Actual size is 7 MB.

3. Deploy only once the full implementation is done (merge `rebuild` → `main`). The workflow deploys from `main` only; other branches run lint, test and build.

**Status:** M0 done. M1 done, except that the live deploy is deferred per decision 3.

**Before M6:**
3. WordFly store URLs, contact email, itch.io profile URL, `cv.pdf`.
4. Rewritten copy and screenshot alt text.
