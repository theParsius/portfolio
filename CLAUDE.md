# theParsius portfolio

Side-scrolling pixel-art portfolio with an optional platformer "play this page" mode.
Full spec: docs/SPEC.md. Behavioural reference: docs/prototype.html (open it in a browser).

## Rules

- Vite + TypeScript strict, plain DOM. No React, no game engine, no runtime CDN requests.
- All project content comes from src/content/projects.ts. Never hard-code project text in views.
- Engine works in track coordinates (element rect minus track rect). Never in viewport coordinates.
- Physics constants live in src/engine/constants.ts only. Changing one = update docs/SPEC.md too.
- Every layout change must keep the reachability test green (max climb 165px, max gap 230px).
- Content is reachable without play mode: mouse, keyboard, touch, screen reader.
- Respect prefers-reduced-motion. Pixel art at integer scales with image-rendering: pixelated.
- Work one milestone at a time from docs/SPEC.md "Build plan". Stop and report when its acceptance criteria pass.

- Keep the owner's to-do doc current: "theParsius Portfolio: What I Need to Provide" (Claude Doc, https://claude.ai/artifact/Enhry6GnVqgwYwxEDathiA). After each milestone or any new placeholder/TODO, update its Status table, add rows for new needs, and log received items.

## Commands

- `npm run dev`: local server
- `npm run test`: Vitest unit tests (includes content validation)
- `npm run validate`: check content against files in public/
- `npm run e2e`: Playwright (viewports 1280x800, 1366x640, 390x844)
- `npm run build`: typecheck + build + prerender project routes
- `npm run images`: screenshots from assets-src/ → public/ (3 sizes) + src/content/shots.json
- `npm run sprites`: 1× pixel sprites from assets-src/sprites-upscaled/ (`-- --detect` rescans grids, slow)
