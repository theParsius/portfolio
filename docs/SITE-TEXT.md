# Site text

Every piece of text the portfolio shows, in page order. Based on the snapshot of branch `rebuild` on 2026-11-04, with the approved copy edits applied.
This is a copy for reading and editing: the site itself reads from the source files named in each section,
so a change here does nothing until it is made there too.

Sources: `src/content/site.ts`, `src/content/projects.ts`, `src/views/*.ts`, `src/lib/format.ts`,
`src/engine/game.ts`, `src/main.ts`, `index.html`, `scripts/prerender.ts`.

## Changes from the snapshot

- Hero, About, page title and meta description rewritten for designer/developer positioning
- Project order changed: Honeyland, The Last Ember, Dice Fight, Saving Private Teddy, Line-Up, WordFly, Funtomime, Agha Khan (room ◀/▶ links updated to match)
- Years fixed: Honeyland 2022–2026, WordFly 2025, Dice Fight 2025
- Roles updated: Honeyland, WordFly, Line-Up, Funtomime
- Descriptions rewritten: Honeyland, WordFly, Dice Fight, Line-Up, Funtomime, Saving Private Teddy, Agha Khan
- Honeyland bubble changed
- "Eight games" → "8 games"; curly quotes in the popup toast; email added to the no-JS message
- 2026-11-18 consistency pass with the CVs and PDF portfolio

---

## Header (every page)

_src/views/header.ts_

- Logo: **theParsius**
- Nav: **About** · **Projects** · **Contact** · **CV** (downloads the designer CV)
- Play button: **Play**
- During play (HUD): **Projects found 0/8** · **★ 0/24** · **Score 0** · **♪ Sound** · **Stop**
  - Under 480px wide, "Projects found" becomes a ? block icon (still read by screen readers)

---

## Main level

_src/views/mainLevel.ts, text from src/content/site.ts_

### Hero

# Parsa Tashakkori

Game designer and developer. Six years building games in Unity and Go, focused on systems and level design, with a passion for narrative and storytelling.

Buttons: **See projects** · **Play this page** · or press **P**

### About

## About

[Avatar image, alt: "Pixel portrait of Parsa waving"]

I’m Parsa Tashakkori, also known as theParsius. I started as an intern at a small Tehran studio, went from junior to senior developer in nine months at Hexagon Studios, and spent four years on Honeyland, a Web3 mobile game that peaked at ~125k players. After its 2025 sale to Bravo Ready, I was its lead developer and game designer.

Engineering got me in; design is where I’m going: systems and level design, with a passion for narrative and storytelling. I want to build games that are technically solid and make players feel something. I’m studying for an MFA in Game Design at Kingston University in London.

### Projects sign

## Projects

8 games from 2020 to now. Pick one, or keep walking right.

- Honeyland — 2022–2026
- The Last Ember — 2025–Now
- Dice Fight — 2025
- Saving Private Teddy — 2021
- Line-Up — 2021
- WordFly — 2025
- Funtomime — 2022
- Agha Khan — 2020

Scroll or swipe sideways to walk the level.

### Project cards

Each card shows title, years, role, status, the first metric (if any) and stack tags.
The speech bubble above the mascot shows the hook.

| Title | Years | Role | Status | Metric | Tags | Bubble (hook) |
|---|---|---|---|---|---|---|
| Honeyland | 2022–2026 | Developer and designer across the IP; lead after the 2025 sale | Released | ~125k players at peak | Unity, C#, Solana, Web3 | Bee squads, missions, and a player marketplace. |
| The Last Ember | 2025–Now | Sole designer and developer | In development | | Unity, C#, Game design, Roguelite | Tarot cards, a burning candle, and hope running out. |
| Dice Fight | 2025 | Combat design and prototype (Hexagon Studios) | Prototype | | Unity, C#, Combat design, Roguelite | A fighting game where your dice hand is your moveset. |
| Saving Private Teddy | 2021 | Level design and tech support | Game jam | | Unity, C#, Level design | Light is the only thing keeping a scared kid safe. |
| Line-Up | 2021 | Game design, Unity client and Golang server | Released | | Unity, C#, Golang, Real-time | Draft real footballers, then play them in real time. |
| WordFly | 2025 | Unity client and Golang server (contributor) | Live | | Unity, C#, Golang | Hidden-word puzzles that work online and offline. |
| Funtomime | 2022 | Unity client and Golang server (contributor) | Released | | Unity, C#, Golang, UGC | Charades with video clues uploaded by players. |
| Agha Khan | 2020 | Game design, Unity client and Golang server | Unreleased | | Unity, C#, Golang, Game design, Multiplayer | Online strategy where every hero carries two spells. |

### Contact

## Contact

Reach the flag, or just send an email.

Buttons: **Email** · **LinkedIn** · **itch.io**

Downloads (second row): **Designer CV** · **Developer CV** · **Portfolio PDF**

Parsa Tashakkori

---

## Project rooms

_src/views/room.ts, text from src/content/projects.ts_

Every room has the same frame:

- Entrance: **Exit** label over a **?** block
- Title, years and status
- Description, metrics, store links
- Facts list: **Role** · **Status** · **Platform** · **Stack**
- Sign: **Screenshots** / "5 shots. Hover for a note, click to enlarge. In play, they are platforms."
- Each screenshot has a caption plaque (same text as its alt text)
- End: **More projects**, with **◀ previous** and **next ▶** buttons, then another **Exit** block

### Honeyland

**2022–2026 · Released**

Honeyland is a Web3 mobile game on Solana where players send NFT bee squads on missions to collect items and HXD, and trade them on a player marketplace. I joined as a junior developer and was promoted to senior within nine months. I built the gameplay, UI and Solana transaction flow, and designed for the game itself, its live events and spin-off games in the IP. After the 2025 sale to Bravo Ready, I became its lead developer and game designer.

~125k players at peak

Links: **Google Play** · **App Store**

- Role: Developer and designer across the IP; lead after the 2025 sale
- Status: Released
- Platform: iOS, Android
- Stack: Unity, C#, Solana, Web3

Screenshot captions:
1. A hive interior where the player’s bees gather, with the main menu along the bottom.
2. The marketplace listing Gen 3 bees for sale, each with a mood and a price.
3. A story chapter, “The Honeycomb”, with bees performing on a stage.
4. The Earth overworld map, dotted with hives and lands.
5. The upgrade screen showing a bee’s stats next to the player’s bee collection.

More projects: ◀ Agha Khan · The Last Ember ▶

### The Last Ember

**2025–Now · In development**

The Last Ember is a roguelite psychological horror card game about holding on to hope while a candle burns down. On every turn of a run you choose a tarot card from a 22-card Major Arcana deck and face the consequences: every card costs or restores Hope, pushes four spirals (Avoidance, Ambition, Control and Optimism) and can leave scars. It is a personal project, still in development: I am its sole designer and developer, building it in Unity and C#.

Links: none

- Role: Sole designer and developer
- Status: In development
- Platform: PC
- Stack: Unity, C#, Game design, Roguelite

Screenshot captions:
1. A burning candle at 70 Hope beside three tarot cards, The Emperor, The Moon and The Tower, under four spiral sliders.
2. A tooltip on The Tower: −25 Hope, Ambition −2, Optimism −1 and a 20% risk of a Fracture scar.
3. The deck viewer, listing the full deck, the draw pile and the discard pile.
4. An ending: “You were running on ember by the end. Ember was enough.”

The Screenshots sign here reads "4 shots. Hover for a note, click to enlarge. In play, they are platforms."

More projects: ◀ Honeyland · Dice Fight ▶

### Dice Fight

**2025 · Prototype**

A mobile fighting prototype made at Hexagon Studios: your rolled dice hand (pairs, full houses) is your moveset, with roguelite item builds and Web3 features on top. I designed the combat and built the prototype in Unity. The core problem was making fights feel like more than luck. Rerolls, freezing a die and power-ups turned each roll into a decision. I then iterated on visuals and hit effects, including several versions in 3D.

Links: none

- Role: Combat design and prototype (Hexagon Studios)
- Status: Prototype
- Platform: Mobile
- Stack: Unity, C#, Combat design, Roguelite

Screenshot captions:
1. Two pixel-art fighters trading blows on a night street.
2. Fighter select, with item slots and the fighter’s health, defence and attack.
3. A turn in a fight: the rolled dice form a Pair beneath the two fighters.
4. The versus screen comparing the player’s stats with the opponent’s.
5. An item tooltip: multiplies attack by 1.25 when the hand is a Full House.

More projects: ◀ The Last Ember · Saving Private Teddy ▶

### Saving Private Teddy

**2021 · Game jam**

A puzzle game made at a game jam (theme: “Delightful and Safe”). A scared child crosses dark rooms to find his teddy, and light is the only safe path. I designed the levels, bending and splitting the beam with mirrors, and handled tech support.

Links: **itch.io**

- Role: Level design and tech support
- Status: Game jam
- Platform: PC
- Stack: Unity, C#, Level design

Screenshot captions:
1. A dark bedroom seen from above, lit only by a beam of light from the door.
2. The path of light bends around a corner towards the teddy bear.
3. A puzzle room where mirrors split the beam of light.
4. The title screen: toy blocks spell Play, Credits and Exit beside a moonlit window and the teddy.
5. A level where the light has to snake through the room to reach the teddy.

More projects: ◀ Dice Fight · Line-Up ▶

### Line-Up

**2021 · Released**

A real-time online football game: draft real footballers, then play them head-to-head. I designed the whole game from scratch and built the Unity client and Golang server.

Links: **Cafe Bazaar**

- Role: Game design, Unity client and Golang server
- Status: Released
- Platform: Android
- Stack: Unity, C#, Golang, Real-time

Screenshot captions:
1. The formation editor: an empty pitch beside the player’s card bench.
2. A live match as Paulo Dybala scores a goal.
3. A head-to-head duel between a rival’s card and the player’s card mid-match.
4. The main menu with card packs, a Play button, and shop links.
5. The draft screen: picking players for each side, with their ratings.

More projects: ◀ Saving Private Teddy · WordFly ▶

### WordFly

**2025 · Live**

WordFly is a mobile word puzzle game set across city maps, playable online or offline. I worked on the Unity client and Golang server alongside the project lead: I designed and developed a roguelite mini-game, built social features and worked on client–server state sync.

Links: **Google Play** · **App Store**

- Role: Unity client and Golang server (contributor)
- Status: Live
- Platform: iOS, Android
- Stack: Unity, C#, Golang

Screenshot captions:
1. The home screen: a pelican mascot and a pilot flying over a map, with a big Play button.
2. The Bangkok city map, with levels pinned to landmarks.
3. A daily level listing secret-word lengths above a cluster of letter bubbles.
4. Level 2: two clues and letter-group bubbles to combine into words.
5. The album of collected city landmarks, including Wat Arun.

More projects: ◀ Line-Up · Funtomime ▶

### Funtomime

**2022 · Released**

Funtomime is charades with video: players upload clips acting out a word, and others guess. I was one of the developers on the Unity client and Golang server, working on social features and core game mechanics.

Links: **Cafe Bazaar**

- Role: Unity client and Golang server (contributor)
- Status: Released
- Platform: Android
- Stack: Unity, C#, Golang, UGC

Screenshot captions:
1. A player-uploaded video clue with four answer choices and power-ups below.
2. The topic picker, offering categories such as general knowledge and celebrities.
3. The match board tracking each round’s score against the opponent.
4. The avatar shop: a grid of characters with coin prices.
5. The home screen with new-game buttons and the list of turns.

More projects: ◀ WordFly · Agha Khan ▶

### Agha Khan

**2020 · Unreleased**

An online multiplayer strategy game where every hero carries two player-controlled spells. I worked on its game design and built the Unity client and the Golang server for real-time matches. It was shelved before release.

Links: none

- Role: Game design, Unity client and Golang server
- Status: Unreleased
- Platform: Mobile
- Stack: Unity, C#, Golang, Game design, Multiplayer

Screenshot captions:
1. Concept sketches of an old sorcerer holding fire in his hand.
2. Stylised statues of the game’s heroes and creatures.
3. A floating island arena with a board of units under a stormy sky.
4. The loading screen: warriors charging into battle above a progress bar.
5. The main menu, with the Play button among floating rocks.

More projects: ◀ Funtomime · Honeyland ▶

---

## Screenshot viewer (lightbox)

_src/views/lightbox.ts_

- The screenshot caption (as above)
- Counter: **1 / 5**
- Buttons: **◀** · **▶** · **Close**

---

## Play mode

_src/engine/game.ts, src/ui/touchPad.ts, src/main.ts_

Toasts:

- On start (keyboard): "Arrows or WASD to move. Up or Space to jump. Down to drop through. Esc to stop."
- On start (touch): "Use the pad to move and jump. Down drops through. Tap Stop to exit."
- When the page lost focus: "Click anywhere on the page so it can hear your keys, or use the on-screen pad."
- Reaching the flag: "Level clear. You found N of 8 projects and S of 24 stars. Score X."
- Taking a room's third star: "All 3 stars in this room. +200 bonus."
- Taking the last of all 24 stars: "Every star found. Final score X."
- Finding every project: "All 8 projects found."
- Popup blocked when bumping a link block: "Your browser blocked the new tab. Click “<link name>” to open it."

On-screen pad (touch): **◀** · **▶** · **▼** · **Jump**

---

## Other messages

_src/main.ts, index.html_

- A link with no URL yet: "<Link name> link is coming soon."
- No JavaScript: "This portfolio needs JavaScript to show the level. Contact: theparsius@gmail.com · https://www.linkedin.com/in/parsa-tashakkori-23b023a3/"

---

## Browser tab titles and search/share text

_index.html, src/main.ts, scripts/prerender.ts_

- Main page title: **Parsa Tashakkori, game designer and developer**
- Project page title: **<Project>, Parsa Tashakkori** (e.g. "Honeyland, Parsa Tashakkori")
- Main page description (same in `index.html` and the built site): "Parsa Tashakkori (theParsius): game designer and developer. Six years building games in Unity and Go, focused on systems and level design, with a passion for narrative and storytelling. 8 games, in a side-scrolling level you can play."
- Project page description: the first sentence of the project's description.
- Share image alt: the first landscape screenshot's caption, or "<Project> app icon".

---

## Screen-reader-only text

Not visible on screen, but read aloud by screen readers.

- Main level region: "Portfolio, scrolls sideways"
- Project room region: "Project, scrolls sideways"
- Header nav: "Main"
- Card list: "Project cards"
- Before each card's status: "Status: "
- HUD star count: "Stars "
- Room entrance: "Entrance"
- Exit block: "Back to the level"
- Before each room screenshot: "Enlarge: " followed by its alt text
- Lightbox: "Screenshot", "Previous screenshot", "Next screenshot"
- Screenshot alt text: same as the captions listed per project

---

## Developer only (`?tune`)

_src/ui/tunePanel.ts_ — not seen by visitors.

**Tune** · **Copy as TS** / **Copied** · **Reset** · "Jump apex ≈ N px (layout needs > 165)"
