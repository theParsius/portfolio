import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faGithub,
  faLinkedin,
  faReact,
} from "@fortawesome/free-brands-svg-icons";
import {
  faBagShopping,
  faBars,
  faDiceD6,
  faEnvelope,
  faWindowRestore,
  faX,
} from "@fortawesome/free-solid-svg-icons";

import {
  avatar,
  // technology icons
  unityIcon,
  csharpIcon,
  golangIcon,
  cIcon,
  javaIcon,
  gitIcon,
  githubIcon,
  psqlIcon,
  pyIcon,
  adobeXdIcon,
  restApiIcon,
  socketIoIcon,
  solanaIcon,
  reactIcon,
  // store icons
  appStoreIcon,
  googlePlayIcon,
  cafeBazaarIcon,
  itchIoIcon,
  // honeyland
  honeylandIcon,
  honeylandHive,
  honeylandUniverse,
  honeylandNpc,
  honeylandLand,
  honeylandMarketplace,
  honeylandUpgrade,
  // line-up
  lineUpIcon,
  lineUpLoading,
  lineUpMenu,
  lineUpPick,
  lineUpFormation,
  lineUpMatch,
  lineUpMatchGoal,
  // funtomime
  funtomimeIcon,
  funtomimeMenu,
  funtomimeAvatars,
  funtomimeMatchInfo,
  funtomimePickTopic,
  funtomimeMatch,
  // saving private teddy
  savingPrivateTeddyIcon, 
  // agha khan
  aghaKhanIcon,
  aghaKhanLoading,
  aghaKhanMenu,
  aghaKhanGame,
  aghaKhanConceptCharacter,
  aghaKhanAshou,
} from "../assets";

library.add(faX, faBars, faWindowRestore, faBagShopping, faDiceD6);

const media = {
  // skilss
  unityIcon,
  csharpIcon,
  golangIcon,
  cIcon,
  javaIcon,
  gitIcon,
  githubIcon,
  psqlIcon,
  pyIcon,
  adobeXdIcon,
  restApiIcon,
  socketIoIcon,
  solanaIcon,
  reactIcon,
  // avatar
  avatar,
  // stores
  appStoreIcon,
  googlePlayIcon,
  cafeBazaarIcon,
  itchIoIcon,
  // honeyland
  honeylandIcon,
  honeylandHive,
  honeylandUniverse,
  honeylandNpc,
  honeylandLand,
  honeylandMarketplace,
  honeylandUpgrade,
  // line-up
  lineUpIcon,
  lineUpLoading,
  lineUpMenu,
  lineUpPick,
  lineUpFormation,
  lineUpMatch,
  lineUpMatchGoal,
  // funtomime
  funtomimeIcon,
  funtomimeMenu,
  funtomimeAvatars,
  funtomimeMatchInfo,
  funtomimePickTopic,
  funtomimeMatch,
  // saving private teddy
  savingPrivateTeddyIcon,
  savingPrivateTeddyMenu,
  savingPrivateTeddyLevel1,
  savingPrivateTeddyLevel2,
  savingPrivateTeddyLevel6,
  // agha khan
  aghaKhanIcon,
  aghaKhanLoading,
  aghaKhanMenu,
  aghaKhanGame,
  aghaKhanConceptCharacter,
  aghaKhanAshou,
};

const icons = {
  faBars,
  faX,
  faWindowRestore,
  faBagShopping,
  faDiceD6,
  faReact,
  faGithub,
  faLinkedin,
  faEnvelope,
};

const introduction = {
  text: [
    "Hello there fellow traveler, I'm thrilled you’ve stopped by!",

    "I'm Parsa Tashakkori, also known as theParsius, a game developer with a technical background and a deep passion for storytelling and design. My journey into game development began with losing track of time while playing games and wondering how to create such experiences, leading me to a world where creativity and technical skills come together.",

    "I started with a focus on the technical side, but I have a growing passion for game design and narrative. Eager to dive deeper into these areas, I am fascinated by the potential to weave compelling stories and create immersive game experiences. I aspire to blend my technical skills with narrative and design elements in future projects.",
    "On a personal note, I enjoy taking on new adventures and experiences, which not only provide a refreshing break from the digital world but also inspire and influence my game development approach in surprising ways.",

    "As I look forward, I am excited about the opportunities to push boundaries in game development. My aim is to create games that are not only technically impressive but also emotionally resonant and thought-provoking, leveraging both my technical prowess and my creative aspirations.",

    "Welcome to my portfolio, a showcase of my journey, the games I've crafted, and the stories I'm eager to tell.",
  ],
};

export const navLinks = [
  {
    id: "about",
    title: "About",
  },
  {
    id: "projects",
    title: "Projects",
  },
  {
    id: "skills",
    title: "Skills",
  },
  {
    id: "contact",
    title: "Contact",
  },
];

const projects = [
  {
    name: "Honeyland",
    description:
      "In 'Honeyland,' a game merging Web2 and Web3 technologies on the Solana blockchain, players embark on missions with their NFT bees to collect items and HXD. My role included not only technical development using Unity and C# but also active involvement in design discussions, ensuring a smooth integration of blockchain elements. This project is a notable step in blending traditional gaming with innovative blockchain technology, offering players a unique global experience.",
    icon: honeylandIcon,
    images: [
      honeylandHive,
      honeylandUniverse,
      honeylandNpc,
      honeylandLand,
      honeylandMarketplace,
      honeylandUpgrade,
    ],
    store_data: [
      {
        name: "App Store",
        link: "https://apps.apple.com/ca/app/honeyland/id1639336677",
        icon: appStoreIcon,
      },
      {
        name: "Google Play",
        link: "https://play.google.com/store/apps/details?id=honey.land.game",
        icon: googlePlayIcon,
      },
    ],
  },
  {
    name: "Line-Up",
    description:
      "In the creation of “Line-Up” a real-time online football game, players were given the excitement of drafting real football players to form their teams for virtual matches. My role involved utilizing Unity and C# for the game's frontend development and Golang for the backend. I focused on blending sports management strategies with immersive gameplay, ensuring a seamless and engaging experience for players.",
    icon: lineUpIcon,
    images: [
      lineUpLoading,
      lineUpMenu,
      lineUpPick,
      lineUpFormation,
      lineUpMatch,
      lineUpMatchGoal,
    ],
    store_data: [
      {
        name: "Cafe Bazaar",
        link: "https://cafebazaar.ir/app/com.LuLuGames.LineUp?l=en",
        icon: cafeBazaarIcon,
      },
    ],
  },
  {
    name: "Funtomime",
    description:
      "“Funtomime” offers a digital twist on traditional charades, where players interact with video clues to guess actions. We used Unity and C# for the game's frontend, and Golang for server-side functionalities. The game stands out for its user-generated content, allowing players to upload videos, thereby continuously enriching and diversifying the gameplay.",
    icon: funtomimeIcon,
    images: [
      funtomimeMenu,
      funtomimeAvatars,
      funtomimeMatchInfo,
      funtomimePickTopic,
      funtomimeMatch,
    ],
    store_data: [
      {
        name: "Cafe Bazaar",
        link: "https://cafebazaar.ir/app/com.RobinGames.Funtomime?l=en",
        icon: cafeBazaarIcon,
      },
    ],
  },
  {
    name: "Saving Private Teddy",
    description:
      "In “Saving Private Teddy,” a game created during a game jam with the theme “Delightful and Safe,” players guide a child through dark, eerie environments to find his lost teddy bear. Using Unity and C#, our team developed a unique puzzle game that emphasizes the contrast between light and darkness. My role involved not only the intricate design of the levels but also providing technical support to ensure seamless gameplay. This project highlights the innovative use of light to evoke a sense of safety in a scary setting, offering players a delightful yet thrilling experience.",
    icon: savingPrivateTeddyIcon,
    images: [
      savingPrivateTeddyMenu,
      savingPrivateTeddyLevel1,
      savingPrivateTeddyLevel2,
      savingPrivateTeddyLevel6,
    ],
    store_data: [
      {
        name: "Itch.io",
        link: "https://theparsius.itch.io/saving-private-teddy",
        icon: itchIoIcon,
      },
    ],
  },
  {
    name: "Unnamed (Canceled)",
    description:
      "This innovative online multiplayer project was designed to add a unique spin to the dynamics of familiar strategy games. A standout feature was the integration of dual spells for each hero, controlled by players, which added a new layer of engagement and strategy. My contribution involved using Unity and C#, with Golang for backend development, focusing on crafting these complex game mechanics to enhance real-time player interaction.",
    icon: aghaKhanIcon,
    images: [
      aghaKhanLoading,
      aghaKhanMenu,
      aghaKhanGame,
      aghaKhanConceptCharacter,
      aghaKhanAshou,
    ],
    store_data: [],
  },
];

const memoji = {
  image: [avatar],
};

const skills = [
  {
    id: "unity",
    title: "Unity",
    icon: unityIcon,
    description:
      "I extensively use Unity for both offline and online game development, excelling in creating complex game mechanics and multiplayer experiences. This showcases my versatility and depth in game development platforms.",
  },
  {
    id: "c#",
    title: "C#",
    icon: csharpIcon,
    description:
      "C# is my daily driver in game development with Unity. My proficiency in C# is reflected in the complex game logic and features I've successfully implemented over the years, contributing to my solid grasp of this versatile programming language.",
  },
  {
    id: "golang",
    title: "Golang",
    icon: golangIcon,
    description:
      "I utilize Golang's efficiency for developing servers in online and real-time multiplayer games. Its performance and simplicity make it my preferred choice for backend solutions in demanding gaming environments.",
  },
  {
    id: "git",
    title: "Git",
    icon: gitIcon,
    description:
      "Git is an essential part of my daily workflow. I'm adept at using it for team collaboration, managing branches and commits effectively. My experience ensures smooth and efficient version control in all my development projects.",
  },
  {
    id: "adobeXd",
    title: "Adobe XD",
    icon: adobeXdIcon,
    description:
      "Adobe XD is my go-to tool for UI/UX design and prototyping in game development. With its intuitive interface and robust features, I create engaging and user-friendly game interfaces, ensuring that the player's experience is both visually appealing and seamless.",
  },
];

const markerSvg = `<svg viewBox="-4 0 36 36">
    <path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path>
    <circle fill="black" cx="14" cy="14" r="7"></circle>
  </svg>`;

export { icons, introduction, markerSvg, media, memoji, projects, skills };
