# Site text

Every piece of text the portfolio shows, in page order. Snapshot of branch `rebuild` on 2026-11-04.
This is a copy for reading and editing: the site itself reads from the source files named in each section,
so a change here does nothing until it is made there too.

Sources: `src/content/site.ts`, `src/content/projects.ts`, `src/views/*.ts`, `src/lib/format.ts`,
`src/engine/game.ts`, `src/main.ts`, `index.html`, `scripts/prerender.ts`.

---

## Header (every page)

_src/views/header.ts_

- Logo: **theParsius**
- Nav: **About** · **Projects** · **Contact** · **CV**
- Play button: **Play**
- During play (HUD): **Projects found 0/8** · **★ 0/24** · **Score 0** · **♪ Sound** · **Stop**
  - Under 480px wide, "Projects found" becomes a ? block icon (still read by screen readers)

---

## Main level

_src/views/mainLevel.ts, text from src/content/site.ts_

### Hero

# Parsa Tashakkori

Game developer with a technical background and a deep passion for storytelling and design.

Buttons: **See projects** · **Play this page** · or press **P**

### About

## About

[Avatar image, alt: "Pixel portrait of Parsa waving"]

I’m Parsa Tashakkori, also known as theParsius. I got into game development by losing track of time while playing games and wondering how those experiences were made.

I started on the technical side and grew a real passion for game and narrative design. I want to make games that are technically solid and emotionally resonant.

Unity and C#, Golang backends, Solana.

### Projects sign

## Projects

Eight games from 2020 to now. Pick one, or keep walking right.

- Honeyland — 2022–2025
- WordFly — 2025–Now
- Dice Fight — 2025–Now
- The Last Ember — 2025–Now
- Line-Up — 2021
- Funtomime — 2022
- Saving Private Teddy — 2021
- Agha Khan — 2020

Scroll or swipe sideways to walk the level.

### Project cards

Each card shows title, years, role, status, the first metric (if any) and stack tags.
The speech bubble above the mascot shows the hook.

| Title | Years | Role | Status | Metric | Tags | Bubble (hook) |
|---|---|---|---|---|---|---|
| Honeyland | 2022–2025 | Unity developer, design input | Live | ~125k players at peak | Unity, C#, Solana, Web3 | Missions with NFT bees, built on Solana. |
| WordFly | 2025–Now | Contributed to the Unity client and Golang server | Live | | Unity, C#, Golang | Hidden-word puzzles that work online and offline. |
| Dice Fight | 2025–Now | Prototype and combat design | Prototype | | Unity, C#, Combat design | A fighting game where your dice hand is your moveset. |
| The Last Ember | 2025–Now | Sole developer and designer | In development | | Unity, C#, Game design | Tarot cards, a burning candle, and hope running out. |
| Line-Up | 2021 | Unity client and Golang server | Released | | Unity, C#, Golang, Real-time | Draft real footballers, then play them in real time. |
| Funtomime | 2022 | Unity client and Golang server | Released | | Unity, C#, Golang, UGC | Charades with video clues uploaded by players. |
| Saving Private Teddy | 2021 | Level design and tech support | Game jam | | Unity, C#, Level design | Light is the only thing keeping a scared kid safe. |
| Agha Khan | 2020 | Unity client and Golang server | Unreleased | | Unity, C#, Golang, Multiplayer | Online strategy where every hero carries two spells. |

### Contact

## Contact

Reach the flag, or just send an email.

Buttons: **Email** · **LinkedIn** · **itch.io** · **Download CV** · **Portfolio PDF**

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

**2022–2025 · Live**

In Honeyland, a game merging Web2 and Web3 technologies on the Solana blockchain, players embark on missions with their NFT bees to collect items and HXD. My role included technical development using Unity and C# and active involvement in design discussions, ensuring a smooth integration of blockchain elements.

~125k players at peak

Links: **Google Play** · **App Store**

- Role: Unity developer, design input
- Status: Live
- Platform: iOS, Android
- Stack: Unity, C#, Solana, Web3

Screenshot captions:
1. A hive interior where the player’s bees gather, with the main menu along the bottom.
2. The marketplace listing Gen 3 bees for sale, each with a mood and a price.
3. A story chapter, “The Honeycomb”, with bees performing on a stage.
4. The Earth overworld map, dotted with hives and lands.
5. The upgrade screen showing a bee’s stats next to the player’s bee collection.

More projects: ◀ Agha Khan · WordFly ▶

### WordFly

**2025–Now · Live**

WordFly is a mobile puzzle game where players uncover hidden words in engaging levels. I worked on both the Unity client and the Golang server, focusing on smooth gameplay across online and offline modes. My main challenge was keeping state consistent and performant, which I solved by carefully synchronizing client and server logic.

Links: **Google Play** · **App Store**

- Role: Contributed to the Unity client and Golang server
- Status: Live
- Platform: iOS, Android
- Stack: Unity, C#, Golang

Screenshot captions:
1. The home screen: a pelican mascot and a pilot flying over a map, with a big Play button.
2. The Bangkok city map, with levels pinned to landmarks.
3. A daily level listing secret-word lengths above a cluster of letter bubbles.
4. Level 2: two clues and letter-group bubbles to combine into words.
5. The album of collected city landmarks, including Wat Arun.

More projects: ◀ Honeyland · Dice Fight ▶

### Dice Fight

**2025–Now · Prototype**

Dice Fight is a fast-paced combat prototype that blends fighting mechanics with dice-based strategy, roguelike progression, and Web3 features for casual mobile play. I developed the prototype in Unity and designed the combat system, focusing on meaningful choices that balance randomness with skill.

Links: none

- Role: Prototype and combat design
- Status: Prototype
- Platform: Mobile
- Stack: Unity, C#, Combat design

Screenshot captions:
1. Two pixel-art fighters trading blows on a night street.
2. Fighter select, with item slots and the fighter’s health, defence and attack.
3. A turn in a fight: the rolled dice form a Pair beneath the two fighters.
4. The versus screen comparing the player’s stats with the opponent’s.
5. An item tooltip: multiplies attack by 1.25 when the hand is a Full House.

More projects: ◀ WordFly · The Last Ember ▶

### The Last Ember

**2025–Now · In development**

The Last Ember is a tarot card game about holding on to hope while a candle burns down. Each turn offers cards from a 22-card Major Arcana deck, and every card costs or restores Hope, pushes four spirals (Avoidance, Ambition, Control and Optimism) and can leave scars. It is a personal project, still in development: I am its sole developer and designer, building it in Unity and C#.

Links: none

- Role: Sole developer and designer
- Status: In development
- Platform: PC
- Stack: Unity, C#, Game design

Screenshot captions:
1. A burning candle at 70 Hope beside three tarot cards, The Emperor, The Moon and The Tower, under four spiral sliders.
2. A tooltip on The Tower: −25 Hope, Ambition −2, Optimism −1 and a 20% risk of a Fracture scar.
3. The deck viewer, listing the full deck, the draw pile and the discard pile.
4. An ending: “You were running on ember by the end. Ember was enough.”

The Screenshots sign here reads "4 shots. Hover for a note, click to enlarge. In play, they are platforms."

More projects: ◀ Dice Fight · Line-Up ▶

### Line-Up

**2021 · Released**

Line-Up is a real-time online football game where players draft real footballers to form teams for virtual matches. I built the frontend in Unity and C# and the backend in Golang, blending sports-management strategy with fast head-to-head play.

Links: **Cafe Bazaar**

- Role: Unity client and Golang server
- Status: Released
- Platform: Android
- Stack: Unity, C#, Golang, Real-time

Screenshot captions:
1. The formation editor: an empty pitch beside the player’s card bench.
2. A live match as Paulo Dybala scores a goal.
3. A head-to-head duel between a rival’s card and the player’s card mid-match.
4. The main menu with card packs, a Play button, and shop links.
5. The draft screen: picking players for each side, with their ratings.

More projects: ◀ The Last Ember · Funtomime ▶

### Funtomime

**2022 · Released**

Funtomime is a digital twist on charades, where players watch video clues to guess actions. We used Unity and C# for the client and Golang on the server. Its standout feature is user-generated content: players upload their own videos, so the game keeps growing.

Links: **Cafe Bazaar**

- Role: Unity client and Golang server
- Status: Released
- Platform: Android
- Stack: Unity, C#, Golang, UGC

Screenshot captions:
1. A player-uploaded video clue with four answer choices and power-ups below.
2. The topic picker, offering categories such as general knowledge and celebrities.
3. The match board tracking each round’s score against the opponent.
4. The avatar shop: a grid of characters with coin prices.
5. The home screen with new-game buttons and the list of turns.

More projects: ◀ Line-Up · Saving Private Teddy ▶

### Saving Private Teddy

**2021 · Game jam**

Made during a game jam with the theme “Delightful and Safe”, players guide a child through dark, eerie rooms to find his lost teddy bear. Our team built a puzzle game around the contrast between light and darkness. I designed the levels and provided technical support.

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

More projects: ◀ Funtomime · Agha Khan ▶

### Agha Khan

**2020 · Unreleased**

An online multiplayer project designed to put a new spin on familiar strategy games. Its standout feature was dual spells for each hero, controlled by players, adding a new layer of strategy. I built the Unity frontend and Golang backend, focusing on these mechanics in real-time play.

Links: none

- Role: Unity client and Golang server
- Status: Unreleased
- Platform: Mobile
- Stack: Unity, C#, Golang, Multiplayer

Screenshot captions:
1. Concept sketches of an old sorcerer holding fire in his hand.
2. Stylised statues of the game’s heroes and creatures.
3. A floating island arena with a board of units under a stormy sky.
4. The loading screen: warriors charging into battle above a progress bar.
5. The main menu, with the Play button among floating rocks.

More projects: ◀ Saving Private Teddy · Honeyland ▶

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
- Popup blocked when bumping a link block: "Your browser blocked the new tab. Click "<link name>" to open it."

On-screen pad (touch): **◀** · **▶** · **▼** · **Jump**

---

## Other messages

_src/main.ts, index.html_

- A link with no URL yet: "<Link name> link is coming soon."
- No JavaScript: "This portfolio needs JavaScript to show the level. Contact: https://www.linkedin.com/in/parsa-tashakkori-23b023a3/"

---

## Browser tab titles and search/share text

_index.html, src/main.ts, scripts/prerender.ts_

- Main page title: **Parsa Tashakkori, game developer**
- Project page title: **<Project>, Parsa Tashakkori** (e.g. "Honeyland, Parsa Tashakkori")
- Main page description (built site): "Parsa Tashakkori (theParsius): Game developer with a technical background and a deep passion for storytelling and design. 8 games, in a side-scrolling level you can play."
  - `index.html` in dev has a different one: "Parsa Tashakkori (theParsius): game developer. Eight games from 2020 to now, in a side-scrolling level you can play."
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
