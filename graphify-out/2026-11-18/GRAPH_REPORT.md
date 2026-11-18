# Graph Report - portfolio  (2026-11-04)

## Corpus Check
- 64 files · ~776,634 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 483 nodes · 975 edges · 20 communities (18 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `23c615f8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- game.ts
- main.ts
- projects.ts
- mainLevel.ts
- Game
- devDependencies
- 4. Milestones
- compilerOptions
- game-sprites.ts
- pixelate.ts
- theParsius Portfolio: Build Spec
- input.ts
- tunePanel.ts
- images.ts
- images.ts
- theParsius portfolio
- .prettierrc.json
- Fx

## God Nodes (most connected - your core abstractions)
1. `Game` - 30 edges
2. `compilerOptions` - 18 edges
3. `asset()` - 17 edges
4. `theParsius Portfolio: Build Spec` - 14 edges
5. `scripts` - 13 edges
6. `projects` - 13 edges
7. `showRoom()` - 13 edges
8. `Rect` - 12 edges
9. `esc()` - 12 edges
10. `renderRoom()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `run()` --indirect_call--> `s()`  [INFERRED]
  scripts/images.ts → src/ui/tunePanel.ts
- `planShots()` --indirect_call--> `w()`  [INFERRED]
  src/views/shotPlan.ts → tests/reach.spec.ts
- `pub()` --references--> `Project`  [EXTRACTED]
  scripts/validate-content.ts → src/content/types.ts
- `world()` --calls--> `planShots()`  [EXTRACTED]
  tests/shotPlan.spec.ts → src/views/shotPlan.ts
- `Snap` --references--> `Rect`  [EXTRACTED]
  tests/e2e/play.spec.ts → src/engine/physics.ts

## Import Cycles
- None detected.

## Communities (20 total, 2 thin omitted)

### Community 0 - "game.ts"
Cohesion: 0.06
Nodes (57): Actor, Anim, follow(), BlockInfo, collect(), Colliders, Npc, Star (+49 more)

### Community 1 - "main.ts"
Cohesion: 0.06
Nodes (61): projectById(), hoverClock(), hoverOffset(), startShotHover(), focusGame(), soundOn(), hit(), trackEvent() (+53 more)

### Community 2 - "projects.ts"
Cohesion: 0.08
Nodes (22): attr(), DIST, main, mainMeta, Meta, shell(), template, checkProject() (+14 more)

### Community 3 - "mainLevel.ts"
Cohesion: 0.13
Nodes (28): Orientation, Project, ProjectLink, Screenshot, Status, asset(), ENTITIES, esc() (+20 more)

### Community 4 - "Game"
Cohesion: 0.10
Nodes (12): coarse(), Game, GameHost, play(), tone(), setSound(), sfx, warmSound() (+4 more)

### Community 5 - "devDependencies"
Cohesion: 0.06
Nodes (35): dependencies, @fontsource/atkinson-hyperlegible, @fontsource/pixelify-sans, devDependencies, @axe-core/playwright, eslint, @eslint/js, @playwright/test (+27 more)

### Community 6 - "4. Milestones"
Cohesion: 0.10
Nodes (19): 1.1 What is there, 1.2 What must be preserved before deleting, 1.3 Links recovered from the old code, 1.4 Starter assets (zip) audit, 1.5 Prototype (`prototype.html`) audit, 1. Audit of the current repo, 2. Spec issues to resolve before or during the build, 3. Target architecture (+11 more)

### Community 7 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, exactOptionalPropertyTypes, isolatedModules, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 8 - "game-sprites.ts"
Cohesion: 0.11
Nodes (17): ANIMS, ARMS_UP, BLOCK_PAL, COIN, COIN_PAL, FRAMES, LEGS, MAP (+9 more)

### Community 9 - "pixelate.ts"
Cohesion: 0.18
Nodes (17): cell(), CONFIG, detect(), downsample(), grassTile(), load(), OUT, Raw (+9 more)

### Community 10 - "theParsius Portfolio: Build Spec"
Cohesion: 0.13
Nodes (14): Assets, Build plan, Claude Code setup, Content model, Known gaps and open decisions, Main level layout, Navigation, routing and accessibility, Overview (+6 more)

### Community 11 - "input.ts"
Cohesion: 0.27
Nodes (8): BY_CODE, BY_KEY, clearKeys(), Key, keyOf(), press(), release(), mountTouchPad()

### Community 12 - "tunePanel.ts"
Cohesion: 0.25
Nodes (10): apex(), asTs(), DEFAULTS, Group, GROUPS, load(), mountTunePanel(), save() (+2 more)

### Community 13 - "images.ts"
Cohesion: 0.07
Nodes (28): About, About, Agha Khan, Browser tab titles and search/share text, Changes from the snapshot, Contact, Contact, Developer only (`?tune`) (+20 more)

### Community 14 - "images.ts"
Cohesion: 0.27
Nodes (9): distance(), exportShot(), MANIFEST, OUT, ROOT, run(), ShotEntry, signature() (+1 more)

### Community 15 - "theParsius portfolio"
Cohesion: 0.50
Nodes (3): Commands, Rules, theParsius portfolio

## Knowledge Gaps
- **178 isolated node(s):** `singleQuote`, `printWidth`, `name`, `private`, `version` (+173 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Game` connect `Game` to `game.ts`, `main.ts`, `input.ts`, `Fx`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `s()` connect `mainLevel.ts` to `game.ts`, `Game`, `tunePanel.ts`, `images.ts`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `projects` connect `projects.ts` to `game.ts`, `main.ts`, `mainLevel.ts`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `singleQuote`, `printWidth`, `name` to the rest of the system?**
  _178 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `game.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.056962025316455694 - nodes in this community are weakly interconnected._
- **Should `main.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0579476861167002 - nodes in this community are weakly interconnected._
- **Should `projects.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08392603129445235 - nodes in this community are weakly interconnected._