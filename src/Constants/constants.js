import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faGithub,
  faLinkedin,
  faReact,
} from '@fortawesome/free-brands-svg-icons';
import {
  faBagShopping,
  faBars,
  faDiceD6,
  faEnvelope,
  faWindowRestore,
  faX,
} from '@fortawesome/free-solid-svg-icons';

import {
  avatar,
  calculator,
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
  memoryGame,
  pawsitivePrototype,
} from '../assets';

library.add(faX, faBars, faWindowRestore, faBagShopping, faDiceD6);

const media = {
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
  avatar,
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
    'Hello there fellow traveler, I\'m so happy you are here!',

    'I\'m Parsa Tashakkori, also known as theParsius, a game developer with a technical background and a deep passion for storytelling and design. My journey into game development began with losing track of time while playing games and wondering how to create such experiences, leading me down a thrilling path of creativity and technical challenge.',

    'My foundation lies in technical development, but I have a growing passion for game design and narrative. Eager to dive deeper into these areas, I am fascinated by the potential to weave compelling stories and create immersive game experiences. My aspiration is to blend my technical skills with narrative and design elements in future projects.',
    'On a personal note, I enjoy taking on new adventures and experiences, which not only provide a refreshing break from the digital world but also inspire and influence my game development approach in surprising ways.',

    'As I look forward, I am excited about the opportunities to push boundaries in game development. My aim is to create games that are not only technically impressive but also emotionally resonant and thought-provoking, leveraging both my technical prowess and my creative aspirations.',

    'Welcome to my portfolio, a showcase of my journey, the games I\'ve crafted, and the stories I\'m eager to tell.',
  ],
};

export const navLinks = [
  {
    id: 'about',
    title: 'About',
  },
  {
    id: 'projects',
    title: 'Projects',
  },
  {
    id: 'skills',
    title: 'Skills',
  },
  {
    id: 'contact',
    title: 'Contact',
  },
];

const projects = [

  {
    name: 'Arasartara\'s Gallery',
    description:
      'A memory game with an art theme implemented with React. Test your memory skills and enjoy beautiful artwork as you match pairs of cards in this engaging game.',
    image: memoryGame,
    source_code_link: 'https://github.com/bl33h/artMemoryGame',
    demo_link: 'https://arasarmemory.netlify.app/',
  },
  {
    name: 'Pawsitive',
    description:
      'Explore a user-friendly Figma prototype for an adoption and sterilization awareness website. Experience the sleek design and contribute to a noble cause.',
    image: pawsitivePrototype,
    source_code_link: 'https://github.com/bl33h/pawsitive',
    demo_link:
      'https://www.figma.com/proto/zhK8DMa7uPyQIcHxkemIcx/Pawsitive?type=design&node-id=40-2&scaling=min-zoom&page-id=0%3A1&starting-point-node-id=40%3A2',
  },
  {
    name: 'Basic Calculator',
    description:
      'A completely functional basic calculator website created with React. It allows you to perform mathematical calculations effortlessly. With testing implemented, the results are accurate.',
    image: calculator,
    source_code_link: 'https://github.com/bl33h/calculator',
    demo_link: 'https://bl33hscalculator.netlify.app/',
  },
];

const memoji = {
  image: [avatar],
};

const skills = [
  {
    id: 'unity',
    title: 'Unity',
    icon: unityIcon,
    description:
      'I extensively use Unity for both offline and online game development, excelling in creating complex game mechanics and multiplayer experiences. This showcases my versatility and depth in game development platforms.',
  },
  {
    id: 'c#',
    title: 'C#',
    icon: csharpIcon,
    description:
      'C# is my daily driver in game development with Unity. My proficiency in C# is reflected in the complex game logic and features I\'ve successfully implemented over the years, contributing to my solid grasp of this versatile programming language.',
  },
  {
    id: 'git',
    title: 'Git',
    icon: gitIcon,
    description:
      'Git is an essential part of my daily workflow. I\'m adept at using it for team collaboration, managing branches and commits effectively. My experience ensures smooth and efficient version control in all my development projects.',
  },
  {
    id: 'golang',
    title: 'Golang',
    icon: golangIcon,
    description:
      'I utilize Golang\'s efficiency for developing servers in online and real-time multiplayer games. Its performance and simplicity make it my preferred choice for backend solutions in demanding gaming environments.',
  },
  {
    id: 'psql',
    title: 'Postgresql',
    icon: psqlIcon,
    description:
      'Postgres SQL is my go-to database platform for managing user and game data. With this powerful database system, I efficiently handle complex data structures and queries, ensuring optimal data integrity and performance.',
  },
  {
    id: 'java',
    title: 'Java',
    icon: javaIcon,
    description:
      'My experience with Java spans creating offline games and applications. I value Java for its versatility and reliability, applying it in scenarios where cross-platform compatibility and robust performance are key.',
  },
  {
    id: 'py',
    title: 'Python',
    icon: pyIcon,
    description:
      'Python is my go-to for quickly developing lightweight and simple projects. Its readability and versatility make it ideal for scripting, automation, and prototyping in my development process.',
  },
  {
    id: 'c',
    title: 'C++',
    icon: cIcon,
    description:
      'C++ is my language of choice for programming contests, prized for its speed and efficiency. My experience with C++ has sharpened my problem-solving skills and understanding of system-level programming.',
  },
  {
    id: 'restApi',
    title: 'Rest API',
    icon: restApiIcon,
    description:
      'I frequently employ REST APIs for client-server communication in games. My skill in REST API design and integration ensures seamless data exchange and enhances the overall gaming experience.',
  },
  {
    id: 'socketIO',
    title: 'Socket IO',
    icon: socketIoIcon,
    description:
      'I use Socket IO for creating real-time, multiplayer game experiences. My proficiency in this technology enables me to build responsive and dynamic games where real-time interaction is pivotal.',
  },
  {
    id: 'adobeXd',
    title: 'Adobe XD',
    icon: adobeXdIcon,
    description:
      'Adobe XD is my go-to tool for UI/UX design and prototyping in game development. With its intuitive interface and robust features, I create engaging and user-friendly game interfaces, ensuring that the player\'s experience is both visually appealing and seamless.',
  },
  {
    id: 'solana',
    title: 'Solana',
    icon: solanaIcon,
    description:
      'My experience with Solana involves building transactions for blockchain communication, particularly within Unity environments. I leverage Solana\'s fast and secure blockchain platform to integrate advanced decentralized functionalities into my game projects.',
  },
];

const markerSvg = `<svg viewBox="-4 0 36 36">
    <path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path>
    <circle fill="black" cx="14" cy="14" r="7"></circle>
  </svg>`;

export {
  icons, introduction, markerSvg, media, memoji, projects, skills,
};
