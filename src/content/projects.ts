import manifest from './shots.json' with { type: 'json' };
import type { Project, Screenshot } from './types';

/**
 * Order in this array = order on the main level.
 * Copy is placeholder from the 2025 PDF and will be rewritten before launch (SPEC: open decisions 2–5).
 */

/**
 * Builds shot-1…shot-N entries for a project. Sizes come from src/content/shots.json,
 * written by scripts/images.ts, so they always match the exported files.
 */
/** Each entry: the alt text, or { alt, caption } when the plaque should say something shorter. */
function shots(id: string, entries: (string | { alt: string; caption: string })[]): Screenshot[] {
  const sizes = (manifest as Record<string, { width: number; height: number }[]>)[id] ?? [];
  return entries.map((e, i) => ({
    src: `/projects/${id}/shot-${i + 1}.webp`,
    ...(typeof e === 'string' ? { alt: e } : e),
    width: sizes[i]?.width ?? 0,
    height: sizes[i]?.height ?? 0,
  }));
}

const art = (id: string) => ({
  icon: `/projects/${id}/icon.webp`,
  mascot: `/projects/${id}/mascot.png`,
});

export const projects: Project[] = [
  {
    id: 'honeyland',
    title: 'Honeyland',
    years: { start: 2022, end: 2025 }, // TODO(M6): confirm dates
    color: '#E8B547',
    role: 'Unity developer, design input',
    status: 'live',
    platforms: ['iOS', 'Android'],
    stack: ['Unity', 'C#', 'Solana', 'Web3'],
    hook: 'Missions with NFT bees, built on Solana.',
    description:
      'In Honeyland, a game merging Web2 and Web3 technologies on the Solana blockchain, players embark on missions with their NFT bees to collect items and HXD. My role included technical development using Unity and C# and active involvement in design discussions, ensuring a smooth integration of blockchain elements.',
    metrics: ['~125k players at peak'],
    links: [
      {
        label: 'Google Play',
        url: 'https://play.google.com/store/apps/details?id=honey.land.game',
      },
      { label: 'App Store', url: 'https://apps.apple.com/ca/app/honeyland/id1639336677' },
    ],
    orientation: 'landscape',
    ...art('honeyland'),
    screenshots: shots('honeyland', [
      'A hive interior where the player’s bees gather, with the main menu along the bottom.',
      'The marketplace listing Gen 3 bees for sale, each with a mood and a price.',
      'A story chapter, “The Honeycomb”, with bees performing on a stage.',
      'The Earth overworld map, dotted with hives and lands.',
      'The upgrade screen showing a bee’s stats next to the player’s bee collection.',
    ]),
  },
  {
    id: 'wordfly',
    title: 'WordFly',
    years: { start: 2025, end: 'now' }, // TODO(M6): confirm dates
    color: '#3B8EF5',
    // SPEC open decision 5: avoid implying sole ownership.
    role: 'Contributed to the Unity client and Golang server',
    status: 'live',
    platforms: ['iOS', 'Android'],
    stack: ['Unity', 'C#', 'Golang'],
    hook: 'Hidden-word puzzles that work online and offline.',
    description:
      'WordFly is a mobile puzzle game where players uncover hidden words in engaging levels. I worked on both the Unity client and the Golang server, focusing on smooth gameplay across online and offline modes. My main challenge was keeping state consistent and performant, which I solved by carefully synchronizing client and server logic.',
    links: [
      {
        label: 'Google Play',
        url: 'https://play.google.com/store/apps/details?id=com.pioneer.wordflyen',
      },
      {
        label: 'App Store',
        url: 'https://apps.apple.com/us/app/word-fly-find-the-words/id6749900883',
      },
    ],
    orientation: 'portrait',
    ...art('wordfly'),
    screenshots: shots('wordfly', [
      'The home screen: a pelican mascot and a pilot flying over a map, with a big Play button.',
      'The Bangkok city map, with levels pinned to landmarks.',
      'A daily level listing secret-word lengths above a cluster of letter bubbles.',
      'Level 2: two clues and letter-group bubbles to combine into words.',
      'The album of collected city landmarks, including Wat Arun.',
    ]),
  },
  {
    id: 'dice-fight',
    title: 'Dice Fight',
    years: { start: 2025, end: 'now' }, // TODO(M6): confirm dates
    color: '#F5B055',
    role: 'Prototype and combat design',
    status: 'prototype',
    platforms: ['Mobile'],
    stack: ['Unity', 'C#', 'Combat design'],
    hook: 'A fighting game where your dice hand is your moveset.',
    description:
      'Dice Fight is a fast-paced combat prototype that blends fighting mechanics with dice-based strategy, roguelike progression, and Web3 features for casual mobile play. I developed the prototype in Unity and designed the combat system, focusing on meaningful choices that balance randomness with skill.',
    links: [],
    orientation: 'portrait',
    ...art('dice-fight'),
    screenshots: shots('dice-fight', [
      'Two pixel-art fighters trading blows on a night street.',
      'Fighter select, with item slots and the fighter’s health, defence and attack.',
      'A turn in a fight: the rolled dice form a Pair beneath the two fighters.',
      'The versus screen comparing the player’s stats with the opponent’s.',
      'An item tooltip: multiplies attack by 1.25 when the hand is a Full House.',
    ]),
  },
  {
    id: 'the-last-ember',
    title: 'The Last Ember',
    years: { start: 2025, end: 'now' },
    color: '#ECE3CD',
    role: 'Sole developer and designer',
    status: 'development',
    platforms: ['PC'],
    stack: ['Unity', 'C#', 'Game design'],
    hook: 'Tarot cards, a burning candle, and hope running out.',
    description:
      'The Last Ember is a tarot card game about holding on to hope while a candle burns down. Each turn offers cards from a 22-card Major Arcana deck, and every card costs or restores Hope, pushes four spirals (Avoidance, Ambition, Control and Optimism) and can leave scars. It is a personal project, still in development: I am its sole developer and designer, building it in Unity and C#.',
    links: [],
    orientation: 'landscape',
    ...art('the-last-ember'),
    screenshots: shots('the-last-ember', [
      'A burning candle at 70 Hope beside three tarot cards, The Emperor, The Moon and The Tower, under four spiral sliders.',
      'A tooltip on The Tower: −25 Hope, Ambition −2, Optimism −1 and a 20% risk of a Fracture scar.',
      'The deck viewer, listing the full deck, the draw pile and the discard pile.',
      'An ending: “You were running on ember by the end. Ember was enough.”',
    ]),
  },
  {
    id: 'line-up',
    title: 'Line-Up',
    years: { start: 2021, end: 2021 },
    color: '#58C23A',
    role: 'Unity client and Golang server',
    status: 'released',
    platforms: ['Android'],
    stack: ['Unity', 'C#', 'Golang', 'Real-time'],
    hook: 'Draft real footballers, then play them in real time.',
    description:
      'Line-Up is a real-time online football game where players draft real footballers to form teams for virtual matches. I built the frontend in Unity and C# and the backend in Golang, blending sports-management strategy with fast head-to-head play.',
    links: [{ label: 'Cafe Bazaar', url: 'https://cafebazaar.ir/app/com.LuLuGames.LineUp?l=en' }],
    orientation: 'portrait',
    ...art('line-up'),
    screenshots: shots('line-up', [
      'The formation editor: an empty pitch beside the player’s card bench.',
      'A live match as Paulo Dybala scores a goal.',
      'A head-to-head duel between a rival’s card and the player’s card mid-match.',
      'The main menu with card packs, a Play button, and shop links.',
      'The draft screen: picking players for each side, with their ratings.',
    ]),
  },
  {
    id: 'funtomime',
    title: 'Funtomime',
    years: { start: 2022, end: 2022 },
    color: '#CC85E3',
    role: 'Unity client and Golang server',
    status: 'released',
    platforms: ['Android'],
    stack: ['Unity', 'C#', 'Golang', 'UGC'],
    hook: 'Charades with video clues uploaded by players.',
    description:
      'Funtomime is a digital twist on charades, where players watch video clues to guess actions. We used Unity and C# for the client and Golang on the server. Its standout feature is user-generated content: players upload their own videos, so the game keeps growing.',
    links: [
      { label: 'Cafe Bazaar', url: 'https://cafebazaar.ir/app/com.RobinGames.Funtomime?l=en' },
    ],
    orientation: 'portrait',
    ...art('funtomime'),
    screenshots: shots('funtomime', [
      'A player-uploaded video clue with four answer choices and power-ups below.',
      'The topic picker, offering categories such as general knowledge and celebrities.',
      'The match board tracking each round’s score against the opponent.',
      'The avatar shop: a grid of characters with coin prices.',
      'The home screen with new-game buttons and the list of turns.',
    ]),
  },
  {
    id: 'saving-private-teddy',
    title: 'Saving Private Teddy',
    years: { start: 2021, end: 2021 },
    color: '#C9C9D2',
    role: 'Level design and tech support',
    status: 'jam',
    platforms: ['PC'],
    stack: ['Unity', 'C#', 'Level design'],
    hook: 'Light is the only thing keeping a scared kid safe.',
    description:
      'Made during a game jam with the theme “Delightful and Safe”, players guide a child through dark, eerie rooms to find his lost teddy bear. Our team built a puzzle game around the contrast between light and darkness. I designed the levels and provided technical support.',
    links: [{ label: 'itch.io', url: 'https://theparsius.itch.io/saving-private-teddy' }],
    orientation: 'landscape',
    ...art('saving-private-teddy'),
    screenshots: shots('saving-private-teddy', [
      'A dark bedroom seen from above, lit only by a beam of light from the door.',
      'The path of light bends around a corner towards the teddy bear.',
      'A puzzle room where mirrors split the beam of light.',
      'The title screen: toy blocks spell Play, Credits and Exit beside a moonlit window and the teddy.',
      'A level where the light has to snake through the room to reach the teddy.',
    ]),
  },
  {
    id: 'agha-khan',
    title: 'Agha Khan',
    years: { start: 2020, end: 2020 },
    color: '#E9DDAA',
    role: 'Unity client and Golang server',
    status: 'unreleased',
    platforms: ['Mobile'],
    stack: ['Unity', 'C#', 'Golang', 'Multiplayer'],
    hook: 'Online strategy where every hero carries two spells.',
    description:
      'An online multiplayer project designed to put a new spin on familiar strategy games. Its standout feature was dual spells for each hero, controlled by players, adding a new layer of strategy. I built the Unity frontend and Golang backend, focusing on these mechanics in real-time play.',
    links: [],
    orientation: 'landscape',
    ...art('agha-khan'),
    screenshots: shots('agha-khan', [
      'Concept sketches of an old sorcerer holding fire in his hand.',
      'Stylised statues of the game’s heroes and creatures.',
      'A floating island arena with a board of units under a stormy sky.',
      'The loading screen: warriors charging into battle above a progress bar.',
      'The main menu, with the Play button among floating rocks.',
    ]),
  },
];

export const projectById = (id: string): Project | undefined => projects.find((p) => p.id === id);
