# Graph Report - portfolio  (2026-11-18)

## Corpus Check
- 65 files · ~778,171 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 502 nodes · 993 edges · 22 communities (20 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e217608d`
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
- Replacements
- Fx
- shotPlan.ts

## God Nodes (most connected - your core abstractions)
1. `Game` - 30 edges
2. `compilerOptions` - 18 edges
3. `asset()` - 17 edges
4. `Replacements` - 16 edges
5. `theParsius Portfolio: Build Spec` - 14 edges
6. `scripts` - 13 edges
7. `projects` - 13 edges
8. `showRoom()` - 13 edges
9. `Rect` - 12 edges
10. `esc()` - 12 edges

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

## Communities (22 total, 2 thin omitted)

### Community 0 - "game.ts"
Cohesion: 0.07
Nodes (44): Actor, Anim, follow(), BlockInfo, collect(), Colliders, Npc, Star (+36 more)

### Community 1 - "main.ts"
Cohesion: 0.05
Nodes (62): projectById(), hoverClock(), hoverOffset(), startShotHover(), focusGame(), soundOn(), hit(), on (+54 more)

### Community 2 - "projects.ts"
Cohesion: 0.11
Nodes (18): attr(), DIST, main, mainMeta, Meta, shell(), template, checkProject() (+10 more)

### Community 3 - "mainLevel.ts"
Cohesion: 0.13
Nodes (30): site, Orientation, Project, ProjectLink, Screenshot, Site, Status, asset() (+22 more)

### Community 4 - "Game"
Cohesion: 0.11
Nodes (10): coarse(), Game, GameHost, play(), tone(), setSound(), sfx, warmSound() (+2 more)

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
Nodes (9): BY_CODE, BY_KEY, clearKeys(), Key, keyOf(), press(), release(), Input (+1 more)

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

### Community 19 - "Replacements"
Cohesion: 0.11
Nodes (18): 10. `src/content/projects.ts`, 11. `src/content/projects.ts`, 12. `src/content/projects.ts`, 13. `src/content/projects.ts`, 14. `src/content/site.ts`, 15. `src/content/site.ts`, 1. `index.html`, 2. `src/content/projects.ts` (+10 more)

### Community 21 - "shotPlan.ts"
Cohesion: 0.15
Nodes (15): relayout(), layoutRoom(), at(), clamp(), PLAN, PlanOptions, planShots(), planStars() (+7 more)

## Knowledge Gaps
- **194 isolated node(s):** `singleQuote`, `printWidth`, `name`, `private`, `version` (+189 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Game` connect `Game` to `game.ts`, `main.ts`, `input.ts`, `Fx`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `s()` connect `mainLevel.ts` to `shotPlan.ts`, `Game`, `tunePanel.ts`, `images.ts`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `projects` connect `projects.ts` to `game.ts`, `main.ts`, `mainLevel.ts`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `singleQuote`, `printWidth`, `name` to the rest of the system?**
  _194 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `game.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07272727272727272 - nodes in this community are weakly interconnected._
- **Should `main.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05333333333333334 - nodes in this community are weakly interconnected._
- **Should `projects.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10887096774193548 - nodes in this community are weakly interconnected._