# theParsius Portfolio: Build Spec

Nov 2, 2026 · @theParsius

## Overview

Build a side-scrolling, pixel-art portfolio for Parsa Tashakkori (theParsius) where every project is reachable in two clicks without playing, and an optional platformer mode turns the page itself into the level.

**Audience:** studio leads hiring for game designer and programmer roles. They skim for 30 to 90 seconds, so browsing must never depend on playing.

**Reference prototype:** [theParsius portfolio prototype](https://claude.ai/artifact/QRYCmdRADn5pC2wHKTJqpJ). It is a single self-contained HTML file and is the behavioural source of truth for this spec. Port its behaviour; do not copy its structure.

**Goals**

- Any project opens in at most 2 clicks from first load, with or without play mode.
- Play mode shows real game feel: tuned jump, collision, camera and feedback, not a gimmick.
- Each project has its own side-scrolling room with all screenshots visible at full size.
- Works on desktop (keyboard, mouse, trackpad) and phones (touch pad, swipe).
- Static site, hosted on GitHub Pages, no backend.

**Non-goals for v1**

- No CMS, accounts, comments or server code.
- No sound by default (see open decisions).
- No game engine (Unity WebGL, Phaser). The page is the level, so the engine must read the live DOM.

## Prototype feature inventory

Everything below works in the prototype and must survive the rebuild, except where the last column says otherwise.

| Feature | Prototype behaviour | v1 decision |
| --- | --- | --- |
| Horizontal main level | One track on a continuous ground: hero, About, Projects sign, 7 cards, Contact + flag | Keep |
| Sideways browsing | Wheel and trackpad vertical scroll mapped to horizontal; left/right arrows scroll 60% of a screen; swipe on touch | Keep |
| Header | Logo, About, Projects, Contact, CV, Play. In play mode: "Projects found x/7" + Stop | Keep |
| Projects sign | Lists all 7 titles + years as links; each opens that project's room | Keep, it is the fast path for leads |
| Project cards | Thumbnail (1 landscape or 3 portrait shots), icon, title, year, role with the status badge beside it (never over the thumbnail), stack tags, mascot on top | Keep |
| Play mode toggle | Play button or P; Esc or Stop exits | Keep |
| Page as level | Headings, each text line, cards, icons, tags, buttons, mascots, scenery are one-way platforms | Keep |
| ? blocks | Shown only in play mode above each card; head-bump pops a coin, marks found, opens the room | Keep |
| Mascot NPCs | Walking near a card's mascot shows a speech bubble with the one-line hook | Keep |
| Flag | Touching it shows "Level clear" and makes the contact buttons bounce | Keep |
| Project rooms | Own horizontal level: exit block + mascot, intro, Screenshots sign, all shots full height, More projects + second exit block | Keep |
| Room exit | Head-bump either exit block in play; click it otherwise; browser back and Esc (not playing) also exit | Keep |
| State on return | Player position, camera and found count restored exactly | Keep |
| Iris transition | Stepped circle wipe closing on the block or click point, opening on the new screen | Keep in play mode; decide for click navigation (see open decisions) |
| Lightbox | Click a screenshot to enlarge, with its caption under it; arrows cycle; Esc closes | Keep |
| Touch pad | Left, right, down, jump buttons in play mode | Shown only on touch screens (`pointer: coarse`); keyboard focus verified in Chromium and WebKit |
| Focus guard | If the page loses keyboard focus during play, a toast asks for a click | Keep |
| Placeholder links | Store links, Email, LinkedIn, itch.io, CV show a toast | Replace with real URLs |
| Assets | Base64-embedded in one HTML file | Replace with real files under /public |

## Tech stack and repo structure

Use Vite + TypeScript with plain DOM, no UI framework, deployed to GitHub Pages. The engine reads element positions every time layout changes, so a virtual-DOM framework adds cost without benefit.

| Concern | Choice | Why |
| --- | --- | --- |
| Build | Vite 5, TypeScript strict | Fast dev server, static output |
| UI | Plain DOM + template functions | Engine needs real element rects |
| Routing | History API, paths `/` and `/projects/<id>/` | Shareable, previewable links per project |
| Per-project pages | Build script writes `dist/projects/<id>/index.html` with its own title and Open Graph tags | Link previews and SEO; the app then hydrates the same room |
| Hosting | GitHub Pages via GitHub Actions; copy `index.html` to `404.html` | Deep links survive a refresh |
| Content | `src/content/projects.ts` typed data | One source for cards, rooms, index, meta tags |
| Tests | Vitest for engine maths, Playwright for flows and reachability | The prototype was verified this way |
| Fonts | Pixelify Sans (display), Atkinson Hyperlegible (body), self-hosted | No external requests at runtime |

```text
portfolio/
├─ CLAUDE.md
├─ index.html
├─ public/
│  ├─ fonts/
│  ├─ sprites/          player sheet, scenery, ? block, coin
│  ├─ projects/<id>/    icon.webp, mascot.png, shot-1.webp …
│  └─ cv.pdf
├─ scripts/
│  └─ prerender.ts      writes one HTML shell per project route
├─ src/
│  ├─ main.ts           boot, router
│  ├─ content/projects.ts, site.ts
│  ├─ views/            mainLevel.ts, room.ts, lightbox.ts, header.ts
│  ├─ engine/           physics.ts, colliders.ts, camera.ts, input.ts, actor.ts, fx.ts, game.ts
│  ├─ ui/               transition.ts (iris), toast.ts, touchPad.ts
│  └─ styles/           tokens.css, base.css, level.css, room.css
└─ tests/
   ├─ engine.spec.ts
   └─ e2e/              navigation, play-mode, reachability
```

## Content model

All project content lives in one typed array; cards, the Projects sign, rooms, page titles and meta tags are all generated from it. Copy is placeholder from the 2025 PDF and will be rewritten.

```ts
export type Status = 'live' | 'released' | 'prototype' | 'jam' | 'unreleased';
export type Orientation = 'portrait' | 'landscape';

export interface ProjectLink {
  label: string;            // "Google Play", "App Store", "Cafe Bazaar", "itch.io", "Trailer"
  url: string;
}

export interface Screenshot {
  src: string;              // /projects/<id>/shot-1.webp
  alt: string;              // describes what the shot shows, not "screenshot 1"
  width: number;            // intrinsic px, to reserve layout space
  height: number;
}

export interface Project {
  id: string;               // url slug: honeyland, wordfly, dice-fight …
  title: string;
  years: { start: number; end: number | 'now' };
  color: string;            // accent, e.g. '#E8B547'
  role: string;             // one line, what YOU did
  status: Status;
  platforms: string[];      // ['iOS', 'Android']
  stack: string[];          // tags on the card
  hook: string;             // mascot speech bubble, max ~60 chars
  description: string;      // room intro, 2–4 sentences
  metrics?: string[];       // e.g. ['~125k players at peak']
  links: ProjectLink[];
  orientation: Orientation; // drives thumbnail and room layout
  icon: string;
  mascot: string;           // pixel sprite, transparent PNG
  screenshots: Screenshot[];
  media?: { gif?: string; video?: string };  // optional gameplay loop for the card
}
```

Order in the array = order on the level. Prototype order: Honeyland, WordFly, Dice Fight, Line-Up, Funtomime, Saving Private Teddy, Agha Khan.

| id | Status | Orientation | Accent | Links |
| --- | --- | --- | --- | --- |
| honeyland | live | landscape | #E8B547 | Google Play, App Store |
| wordfly | live | portrait | #3B8EF5 | Google Play, App Store |
| dice-fight | prototype | portrait | #F5B055 | none |
| line-up | released | portrait | #58C23A | Cafe Bazaar |
| funtomime | released | portrait | #CC85E3 | Cafe Bazaar |
| saving-private-teddy | jam | landscape | #C9C9D2 | itch.io |
| agha-khan | unreleased | landscape | #E9DDAA | none |

Site-level config (`site.ts`): name, handle, one-line role, short bio paragraphs, stack line, email, LinkedIn, itch.io, GitHub, CV path.

## Main level layout

The main level is one horizontal track, `height = max(540px, 100svh − header)`, with a 48px grass floor (12px tile × 4) running its full width. Every panel is bottom-aligned to the floor, left to right (clouds: see the note below the list):

1. **Hero** (as wide as its text; 100vw on phones): name in large pixel type, one-line role, "See projects" and "Play this page" buttons, "or press P" hint (hidden on touch). Clouds drift across the top. The idle player sprite stands on the ground. The tower (129px, ×3) stands right after the name and doubles as a step.
2. **About** (\~1100px): a tree (148px, ×4; one half of the old trees strip, cut by `npm run sprites`) on each side, pixel avatar floating 48px above the grass with a pixel shadow, short bio, stack line. Tower and trees are hidden on phones.
3. **Projects sign** (\~470px): heading, one sentence, the list of all 7 projects with years. Each name opens that project's room.
4. **Cards** (380px each, 120px gaps; 320px and 90px on phones): each card floats `--hover-h` (132px) above the floor, with a pixel shadow on the grass and a 4px two-step bob (off while playing and under reduced motion). Underneath each card: the mascot standing on the grass (left; idle double hop with a squash every 3–4 s, staggered, off under reduced motion), its speech bubble beside it (play only, when the player is near), and the ? block 80px above the grass (right; hidden until play mode, bumped from the floor). The mascot and ? block are the first steps up onto the card.
5. **Contact** (\~820px): heading, Email, LinkedIn, itch.io, Download CV buttons, name line. The goal flag stands on the floor near the right end.

**Phones and short screens.** A phone browser shows far less than the screen (toolbars), so nothing may stack up past the top of the track. On phones (≤ 760px wide) tall content is laid out sideways, the way the level scrolls: the About text gets a column of its own with the avatar floating to its right, and a room's intro is two columns (title and facts; description, metric and links). Below 700px tall the About and room text get tighter, and below 620px the card thumbnails shrink to 120px. Tested at 375×548, 360×640 and 390×664 (no text above the track).

**Clouds.** `views/sky.ts` scatters the cloud sprite along the whole track of the main level and of every room, after layout and again on resize: every 400–900px (closer for small ones), at one of a few heights in the top 42% of the track, ×1 or ×2 (×1 only on phones), sometimes mirrored, each drifting 70px at its own speed (still under reduced motion). A spot is skipped where the cloud (plus its drift) would cover text, buttons, the avatar or scenery, or where less than 60% of its body (bottom half) would show past cards and screenshots. Seeded per level, so the sky is the same on every visit. Clouds sit behind everything (`.sky`, z-index −1 in an isolated track) and are not colliders.

**Geometry rules the engine depends on**

| Rule | Value | Reason |
| --- | --- | --- |
| Max vertical gap between reachable platforms | 165px | Jump apex is \~177px |
| Max horizontal gap between platforms on a climb | 230px | Running jump distance |
| ? block bottom above the card top | 64px | Player (54px) standing on the card can jump into it |
| ? block size | 40 × 40px | Easy head-bump target |
| Mascot height | 76px (smooth mascots); 72px for the Dice Fight pixel mascot (×2) | Also a step up to the block |
| Card thumbnail height | clamp(140px, 22vh, 190px) | Keeps the card + block + bubble inside short laptop screens |
| Track min height | 540px | Card stack + block + bubble fits |

Any layout change must keep every platform reachable from the floor. The e2e reachability test enforces this (see Build plan).

## Project rooms

Each project is its own horizontal level on the same floor, entered and exited through ? blocks. A room is built from the project's data, never hand-authored.

**Room layout, left to right**

1. **Entrance** (230px; 88px on phones): exit ? block 74px above the floor with an "Exit" label, the project mascot standing on the floor beside it (hidden on phones).
2. **Intro**: icon, title in the accent colour, years + status badge, description, store links, facts box (Role, Status, Platform, Stack). On phones the facts box drops under the text.
3. **Screenshots sign**: heading + "N shots. Hover for a note, click to enlarge." The sign is as wide as its heading, so it never runs into the first shot.
4. **Screenshot field**: the screenshots are the platforms, laid out by `src/views/shotPlan.ts` from the track height, the viewport width and the height of the "Screenshots" sign before it. No shot rests on the grass: every bottom is at least 64px up. Each shot hovers: a small wandering sway, ±5px in x and ±5px in y on different periods (`FEEL.hoverX/Y`, `hoverPeriodX/Y`), out of phase with its neighbours, computed by `hoverOffset()` in `src/engine/hover.ts`. The room view draws it every frame, and in play the engine moves each shot's platform with the same function, carrying a player who stands on it and pushing one it drifts into out the short way. Off under reduced motion. The climb starts from the sign's heading (its text is solid; the sign sits 84px higher than other panels to make a taller first step): the first top sits at most 135px above it, each later top at most 145px above the previous one (the jump's apex is ≈177px; the hardest step is simulated with the real physics), and horizontal gaps are 70–120px. Each project has its own shape (`VARIANTS`, picked by the project's position): stairs, wave, peak, overhang (a shot tucked 84px under the previous one's right end, which the player drops onto; only where the room is tall enough), sky, terraces and zigzag. Each shape sets where every top aims, the shot sizes, how high each floats and the gaps; wave, peak, overhang, sky and zigzag keep their dips off the bottom (`low`), so their shots stay big. Portrait shots are 200–520px tall within a taller band, and float at most 80px up; landscape shots are up to `min(640px, 80vw)` wide. Each shot has a caption plaque (its `caption`, else its alt text) drawn outside the image: below it when the shot floats 100px or more (left-aligned under a shot with another tucked beneath it), else above the head of a player standing on it. The plaque shows on hover or keyboard focus; in play, for as long as the player stands on the shot and for 2.5 s after head-bumping it. Unit tests run the reachability BFS over the layout for every project at four track sizes, check that the layouts differ from each other, and simulate the hardest jump with the real physics.
5. **More projects**: previous and next buttons, plus a second exit block so nobody walks back.

**Entry and exit rules**

| Event | Play mode | Not playing |
| --- | --- | --- |
| Enter a room | Head-bump a card's ? block | Click a card or a Projects sign name |
| Spawn | On the floor, 50px right of the entrance exit block | n/a |
| Exit a room | Head-bump either exit block | Click either exit block, browser back, or Esc |
| Prev / next | Button jumps straight to that room; player respawns at its entrance | Same, no transition |
| Return state | Restore player x/y, velocity reset, camera and found count | Restore scroll position and focus the card |
| Esc | Stops play mode (does not exit) | Exits the room |

Found count only increases from main-level blocks. Exit blocks never count.

## Play mode engine

The engine runs a fixed 120 Hz physics step against colliders read from the live DOM, in track coordinates (element rect minus track rect), so it works no matter how the page scrolls. The constants below are first-pass prototype values; tuning them is the main remaining design job.

**Physics constants (px, seconds)**

| Constant | Value |
| --- | --- |
| Fixed step | 1/120 s, frame dt clamped to 1/30 s, never negative |
| Gravity | 2600 |
| Jump velocity | 960 (apex \~177px) |
| Jump cut (jump released while rising) | gravity × 2.6 |
| Falling gravity | × 1.15 |
| Max fall speed | 1150 |
| Max run speed | 340 |
| Acceleration | 3800 ground, 2400 air; doubled when reversing |
| Friction | 3400 ground, 900 air |
| Coyote time | 0.10 s |
| Jump buffer | 0.12 s |
| Drop-through window | 0.22 s |
| Player hitbox | 22 × 54, sprite drawn 36 × 54 (12 × 18 frames at ×3) offset −7px, bottom-aligned |
| Run animation | 4 frames, one per 55px travelled (cycle 220px) |
| Land / bump frames | crouch shown 0.08 s after landing; bump frame 0.16 s after a head-bump |
| Idle blink | every 3 s |

**Colliders**, rebuilt on play start, resize, font load, room change and lightbox close (ResizeObserver on both tracks):

- `data-solid` → the element's top edge is a one-way platform.
- `data-solid="text"` → one platform per rendered text line (Range.getClientRects, merged per line, top offset 18% of line height). Paragraphs become stairs.
- `data-solid="kids"` → one platform per child (button rows, tag rows), so gaps between them are not walkable.
- `.qblock` → fully solid box: land on top, blocked from the sides, head-bump from below triggers it.
- `.shot` (rooms) → the same solid box; a head-bump shows its caption plaque instead of opening anything.
- `[data-bump]` (room store links and prev / next) → the same solid box; a head-bump follows the link: store links open in a new tab (a toast explains if the browser blocks it), prev / next switch rooms behind the iris and play continues. The intro and end panels sit 100px above the grass (84px on phones, where the facts box moves above the text) so the player can stand under these and jump into them.
- `.floor` → solid, cannot drop through.

**Rules**

- Land on a platform only when falling and the feet were at or above its top on the previous step.
- Down while standing on a one-way platform starts a drop-through; on a block or the floor it does nothing.
- Head-bump: block jolts up 12px, a coin pops (rises then falls, 0.55 s), then after \~320ms the transition starts. 600ms cooldown per block.
- Landing faster than 520 px/s spawns 5 dust particles.
- NPC talk zone = mascot rect grown 28px sideways and 20px vertically.

**Camera:** follows the player's centre to 40% of the viewport width, lerp factor `min(1, dt × 6)`, clamped to the track. A float `camX` is kept separately, because `scrollLeft` rounds to whole pixels and stalls a slow lerp. Wheel input during play moves the camera and updates `camX`. Any outside scroll (wheel, scrollbar, focus moving to an off-screen element) holds the view there until the player moves again.

**Input**

| Action | Keys | Touch |
| --- | --- | --- |
| Move | ← → or A D | ◀ ▶ |
| Jump (hold for higher) | ↑, W or Space | Jump |
| Drop through | ↓ or S | ▼ |
| Toggle play | P | Play / Stop buttons |
| Stop | Esc | Stop |

- Match `event.code` first, then fall back to `event.key`, so layouts and odd browsers still work.
- Listen in the capture phase; preventDefault only while playing.
- Queue jump and drop on keydown, so a tap shorter than a frame still registers.
- On play start and on any pointerdown during play, focus `window` and `body`. Every 0.5 s, if `document.hasFocus()` is false, show the focus toast.
- Clear all held keys on blur, on pause and when the lightbox opens.

**Rendering:** the player is a 12 × 18 canvas, absolutely positioned inside the active track and moved with `transform`, scaled ×3 with `image-rendering: pixelated`. Redraw only when the animation frame changes. Coins and dust are DOM nodes in the track. Frames: idle, run A/B (alternate by distance travelled), jump; mirrored for facing left.

## Navigation, routing and accessibility

Play mode is optional decoration; every piece of content must be reachable with a mouse, keyboard, touch or screen reader without playing.

**Routes**

| Path | View | Notes |
| --- | --- | --- |
| `/` | Main level | `?at=projects`, `about`, `contact` optional, to land on a panel |
| `/projects/<id>/` | Project room | Own title + Open Graph image (first screenshot) |
| anything else | Main level | via 404.html fallback |

- Entering a room pushes a history entry; exiting via a block or button calls `history.back()` when the room was entered in-page, otherwise replaces the URL with `/`.
- Prev/next inside a room replaces the URL (no history spam).
- Header links on a room first exit the room, then slide the main level to the panel.
- The iris transition never blocks routing: a 800ms timeout guarantees the new view is shown.

**Accessibility**

- Both scrollers are `<main>` landmarks with labels; the room title is an `<h1>` that receives focus on entry.
- Cards are single links with an `aria-label` of title, years, role and status. ? blocks are `aria-hidden` on the main level; exit blocks are real `<button>`s labelled "Back to the level".
- All decorative pixel art (`clouds`, trees, tower, flag, mascots, actor, fx) is `aria-hidden` or has empty alt.
- Screenshots have real alt text from content data.
- `prefers-reduced-motion`: no iris, no cloud drift, no block bob, no hover hops, instant scrolls.
- Visible focus ring: 3px pink outline, 3px offset.
- Body text at least 15px, contrast at least 4.5:1 on the black background (dim grey `#A9A3BC` passes).

## Visual design system

The identity comes straight from the 2025 PDF: pure black, pink pixel type with a periwinkle offset shadow, grass-and-dirt ground, per-project accent colours and mascots.

**Colour tokens**

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | #000000 | Page and track background |
| `--ink` | #F3EFF9 | Body text |
| `--dim` | #A9A3BC | Secondary text, facts labels |
| `--pink` | #F9B8E8 | Name, primary buttons, focus ring |
| `--peri` | #5B6CE0 | Offset shadows on type and buttons |
| `--panel` | #110F1A | Cards, facts box |
| `--line` | #25213A | Borders, ghost buttons, scrollbar |
| `--gold` | #E8A317 | ? block, found count, Exit label |
| `--gold-dark` | #8A4E12 | Used ? block, block shading |
| Status live/released | #5BE36A | Badge |
| Status prototype | #F5B055 | Badge |
| Status jam | #F9B8E8 | Badge |
| Status unreleased | #9C97AE | Badge |

**Type**

- Display: Pixelify Sans 600–700. Name `clamp(50px, min(9vw, 13vh), 124px)`, line-height 0.92, text-shadow 5px 5px 0 `--peri`. Section headings 36–52px, 3px shadow.
- Body: Atkinson Hyperlegible 400/700, 19px / 1.6.
- Small UI (badges, years, labels, bubbles): Pixelify Sans 13–15px.

**Components**

- **Primary button:** pink fill, black text, hard 4px offset shadow in `--peri`; pressing moves it 4px into the shadow.
- **Ghost button:** transparent, 2px inset `--line` border, white border on hover.
- **Card:** `--panel` fill, 6px stepped (pixel) corners via clip-path, 2px inset border in the accent at 38%, 3px full accent on hover or focus.
- **? block:** 40px gold square, 3px black outline, light top-left and dark bottom-right bevel, 2-step bob; "used" state is dark gold with no ?.
- **Speech bubble:** white, black text, 3px black outline, periwinkle offset shadow.
- **Toast:** black, 2px pink inset border, periwinkle shadow, fixed under the header.

**Pixel rules:** pixel art renders with `image-rendering: pixelated` at integer scales only. `scripts/pixelate.ts` recovers 1× sprites from the upscaled PDF art; sprites without a uniform grid (6 of 7 mascots, see `src/content/sprites.json`) are drawn smoothly until 1× versions exist. Photos and app icons keep smooth scaling. All motion uses `steps()` easing so it reads as sprite animation.

## Assets

All 55 images in the prototype were extracted from the PDF and ship in `portfolio-starter-assets.zip`, already laid out as `public/`; the main missing piece is a real player sprite sheet.

**Included in the starter zip**

| Path | What | Size / format |
| --- | --- | --- |
| `public/sprites/clouds.png` | Pink cloud bank (PDF cover) | 1451 × 343, transparent |
| `public/sprites/trees.png`, `tower.png`, `flag.png` | Scenery (PDF cover, intro page) | small PNGs, transparent |
| `public/sprites/grass-tile.png` | Ground tile | 98 × 12 at 1×, cut at the strip's exact repeat, seamless |
| `public/sprites/avatar.png` | Waving pixel portrait | 318 × 348 |
| `public/projects/<id>/icon.webp` | App icon | 160 × 160 |
| `public/projects/<id>/mascot.png` | Pixel mascot | ≤ 308px, transparent |
| `public/projects/<id>/shot-1…5.webp` | Screenshots | max 720px wide, WebP q80 |
| `prototype.html` | The working prototype, all assets embedded | 1.8 MB, open in a browser |

**Missing, needed for v1**

- [ ] Player sprite sheet: idle (2 frames), run (4–6), jump, fall, land, head-bump. Same palette as the avatar. A placeholder sheet in that layout (10 frames, 12 × 18) is generated by `npm run sprites:game`; a real sheet goes in `assets-src/sprites/player.png` + `player.json` and replaces it.
- [x] Seamless grass tile: cut from the strip at its exact 98px period (`grass-tile.png`).
- [x] ? block, used block and coin as sprites: `qblock.png` (10 × 10 ×2 frames, drawn ×4) and `coin.png` (7 × 10, drawn ×2), generated by `npm run sprites:game`.
- [ ] 10–15 s gameplay loop per shipped project (MP4/WebM, muted) for cards or rooms.
- [ ] Higher-resolution screenshots where originals exist (current ones are PDF-quality).
- [ ] Real store, itch.io, LinkedIn and email links; `cv.pdf`.
- [x] Favicon: the pixel "P" (assets-src/brand/logo-1x.png, 18 × 20, snapped from theParsiusLogo.png) as favicon.svg, a 40px PNG and a 180px Apple touch icon; also in the header at 2× (the P alone under 440px wide).
- [ ] Open Graph images (1200 × 630) per route.

**Pipeline rules:** keep sources in `assets-src/` (Aseprite files, originals). Export pixel art as PNG at 1× and scale in CSS at integer factors. Export photos and screenshots as WebP, max 1440px wide, with width and height recorded in content data. Budget: under 1.5 MB transferred before first interaction; screenshots lazy-load per room.

## Known gaps and open decisions

The two biggest risks are untuned game feel and stale copy; everything else is a contained decision.

| # | Issue | Why it matters | Proposed default |
| --- | --- | --- | --- |
| 1 | Physics constants are untested first-pass values | Leads who play judge feel within seconds | Add a hidden tuning panel (`?tune`) with live sliders; playtest with 3+ people |
| 2 | Copy is the 2025 PDF text | Generic phrasing, no metrics | Rewrite every description: what it is, what you built, a result |
| 3 | Stale dates and statuses | Honeyland shows 2022–2025, WordFly and Dice Fight show "Now" | Update before launch |
| 4 | Honeyland's strongest fact is missing | \~125k players at peak, lead role | Use the `metrics` field on the card and in the room |
| 5 | WordFly wording implies ownership | Leads check references | Say "contributed to client and server" |
| 6 | Exit block discoverability for non-players | A ? labelled "Exit" may not read as "back" | Watch first testers; if they get lost, add "◀ Back" text beside it |
| 7 | Rooms are 3–4 screens wide | Long walk past 5 full-height shots | Acceptable; the second exit block covers the far end |
| 8 | Iris adds \~0.8 s per room change | Costly when clicking through 7 projects | Keep in play mode; use a 150ms fade for clicks |
| 9 | Sound | Jump/coin sounds sell feel, but autoplay annoys | Done: off by default, Sound toggle in the play HUD, remembered in localStorage; synthesized with WebAudio (no files), synth loaded on first enable |
| 10 | Touch pad on desktop | Clutters the screen, overlaps cards | Done: shown only on `pointer: coarse`; the play suite passes on WebKit (`WEBKIT=1 npm run e2e`) |
| 11 | Horizontal scroll on some mice | Unfamiliar for some leads | Keep wheel mapping + Projects sign; add a thin progress bar under the header |
| 12 | Analytics | Want to know if leads play or open rooms | Done: GoatCounter (`site.analytics`, dashboard at theparsius.goatcounter.com), no cookies and no script: `src/lib/analytics.ts` sends one beacon per hit. Counts page views (main level once per load, each room shown) and events: `play: start`, `play: opened <id>`, `download: <label>`, `contact: email`, `link: <room> → <label>`. Off on localhost, in automated browsers and under Do Not Track / Global Privacy Control |

## Build plan

Six milestones, each shippable and testable on its own; give Claude Code one milestone at a time and check its acceptance criteria before moving on.

1. **Scaffold and content**
   - [ ] Vite + TS strict project, folder structure as above, assets from the starter zip in `public/`
   - [ ] `projects.ts` and `site.ts` typed and filled from the prototype
   - [ ] GitHub Actions deploy to Pages; `404.html` fallback
2. **Main level, no game**
   - [ ] All five panels render on one track with the floor
   - [ ] Wheel, arrow keys, swipe and header links move sideways
   - [ ] Matches the prototype at 1280×800, 1366×640 and 390×844
3. **Project rooms, no game**
   - [ ] `/projects/<id>/` renders the room from data; deep link works after refresh
   - [ ] Exit blocks, browser back and Esc return to the main level at the same scroll position
   - [ ] Lightbox with arrow keys; prev/next replace the URL
   - [ ] Prerender script writes per-project HTML with title and Open Graph tags
4. **Engine**
   - [ ] Physics, colliders, camera, input and actor as specified; unit tests for landing, drop-through, head-bump, coyote time and jump buffer
   - [ ] Play works on the main level and in rooms; entering and exiting rooms by head-bump restores state exactly
   - [ ] Keyboard works inside an iframe and after clicking the page; touch pad works on phones
5. **Feel and polish**
   - [ ] Real player sprite sheet with run, jump, fall, land
   - [ ] Tuning panel behind `?tune`; constants playtested and updated in this doc
   - [ ] Iris (play) and fade (click) transitions; reduced-motion respected
   - [ ] Optional sound with header toggle
6. **Launch**
   - [ ] Copy rewritten, real links and CV in place
   - [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95 on main and one room
   - [ ] Playwright suite green in CI

**Required automated tests**

- **Reachability:** for every level and room at the three viewports, a breadth-first search over colliders (max climb 165px, max horizontal gap 230px) must reach every ? block and every exit block from the floor. Fail the build if not.
- **Flows:** click a card → room → exit block → main level at the same scroll; play → head-bump a card block → room → head-bump an exit → player at the same x; found count increments once per project.
- **Input:** hold → for 400ms moves the player right; a single short tap of ↓ drops through a platform.

## Claude Code setup

Export this doc as Markdown to `docs/SPEC.md`, unzip the starter assets into the repo root, add the CLAUDE.md below, then run the kickoff prompt.

**CLAUDE.md**

```markdown
# theParsius portfolio

Side-scrolling pixel-art portfolio with an optional platformer "play this page" mode.
Full spec: docs/SPEC.md. Behavioural reference: prototype.html (open it in a browser).

## Rules
- Vite + TypeScript strict, plain DOM. No React, no game engine, no runtime CDN requests (the analytics beacon is the one outgoing request; it loads no code).
- All project content comes from src/content/projects.ts. Never hard-code project text in views.
- Engine works in track coordinates (element rect minus track rect). Never in viewport coordinates.
- Physics constants live in src/engine/constants.ts only. Changing one = update docs/SPEC.md too.
- Every layout change must keep the reachability test green (max climb 165px, max gap 230px).
- Content is reachable without play mode: mouse, keyboard, touch, screen reader.
- Respect prefers-reduced-motion. Pixel art at integer scales with image-rendering: pixelated.
- Work one milestone at a time from docs/SPEC.md "Build plan". Stop and report when its acceptance criteria pass.

## Commands
- npm run dev      local server
- npm run test     Vitest unit tests
- npm run e2e      Playwright (viewports 1280x800, 1366x640, 390x844)
- npm run build    build + prerender project routes
```

**Kickoff prompt**

```text
Read CLAUDE.md and docs/SPEC.md, then open prototype.html to see the behaviour we are rebuilding.
Start Milestone 1 (Scaffold and content) only.
Before writing code, list the files you will create and any spec point you think is wrong or underspecified.
When done, run the build and show me the acceptance checklist for Milestone 1 with each item marked.
```
