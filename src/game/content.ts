export const WELCOME =
  "Welcome to Grok Manor. You have three minutes to escape. Three rooms. Three secrets. One way out. And whatever you do… don't trust the ghost.";

export const LINES = {
  clever: "Oh, another human who thinks they're clever.",
  died: "I died here in 1847. But don't let that distract you.",
  blueBeforeRed: "Blue before red. You humans really do need everything explained.",
  oneMinute: "One minute left. I have already picked out your haunting name.",
  thirty: "Thirty seconds left. I've already prepared your room.",
  escaped: "You escaped? That's embarrassing for the management.",
  key: "A key. How antique. Room two smells like bad decisions and sulfur.",
  cabinet: "The cabinet remains unimpressed. As do I.",
  smoke: "Congratulations. You invented smoke.",
  unlocked: "A door unlocks. Try not to look proud.",
  defeat: "The manor claims another soul. I already put your name on the good towel.",
  labArrive: "Do not drink the green one. Or do. I'm already dead, so it's funny for me.",
  cryptArrive: "Three doors. I have a favorite outcome. It is not yours.",
  shadows: "The shadows had a hunter. I mentioned the hunter. There was a whole inscription.",
  flames: "The flames consume all who enter. 'All' included you. Briefly.",
};

export const WRONG_CODE = [
  LINES.cabinet,
  "That combination wouldn't open a diary.",
  "Incorrect. The tumblers are laughing. I taught them.",
];

export const WRONG_BREW = [
  LINES.smoke,
  "The cauldron hated that. I loved it.",
  "A bold mixture. A worse life expectancy.",
];

export const BOOKS = {
  book1: {
    title: "A History of Ashwood",
    spine: "Ashwood",
    body: "The founder stopped signing his name the night the east wing burned. After that, he signed only the year. This volume, annoyingly, omits it. The year is still in the house. Look up. The wall is staring back.",
  },
  book2: {
    title: "Faces in Oil",
    spine: "Faces",
    body: "Stop sniffing the paper. The cabinet's secret is not in a book. It is watching you from a gilded frame. Read the brass plaque, not the eyes. The eyes are rude, and they have practice.",
  },
  book3: {
    title: "Inventory of Keys",
    spine: "Keys",
    body: "The cabinet takes four digits. It has refused every guess since the fire. The fire's year hangs in brass beneath a very judgmental face. When you have it, turn the wheels like you mean it.",
  },
} as const;

export const PORTRAIT = {
  name: "Lord Alistair Grok",
  epitaph: "The east wing took him on a winter night. The house kept the year, and the cabinet kept everything else.",
  year: "1847",
};

export const RECIPE = {
  title: "The Alchemist's Hand",
  line: "First, choose the color of the midnight sky. Then choose the color of a beating heart.",
  note: "Pour only two. Order is the difference between a door and a cloud of regret.",
};

export const INSCRIPTION =
  "The shadows conceal a hunter. The flames consume all who enter. Only where the dead make no sound shall the living walk free.";

export const ROOM_TITLES = {
  1: "The Haunted Library",
  2: "The Alchemist's Laboratory",
  3: "The Cursed Crypt",
} as const;

export const TRANSITIONS = {
  1: {
    kicker: "Room I of III",
    title: "The Haunted Library",
    detail: "Dust, portraits, and a cabinet that remembers a year.",
  },
  2: {
    kicker: "Room II of III",
    title: "The Alchemist's Laboratory",
    detail: "The cabinet yields an iron key. Somewhere ahead, glass begins to sing.",
  },
  3: {
    kicker: "Room III of III",
    title: "The Cursed Crypt",
    detail: "The potion stills. Three stone doors wake. Only one of them is quiet.",
  },
} as const;

export const QUIPS = {
  1: [
    "I would help, but I'm on a spectral union break.",
    "If you die, I call the top bunk.",
    "This mansion has terrible reviews. One star. Too many exits.",
  ],
  2: [
    "Green is parsley for people who hate living.",
    "I once dated a cauldron. It was volatile.",
    "The recipe is right there. I believe in you. That's a lie. I believe in the cauldron.",
  ],
  3: [
    "Eenie, meenie, death, escape.",
    "I won't say which door. I will say I enjoy being right.",
    "This is the part where a braver ghost would be helpful.",
  ],
} as const;

export const DEFEAT_JIBE =
  "Your room is ready. We turned down the shroud and fluffed the existential dread. Most guests scream in the library. You may still make the guestbook.";

export const RANKS = [
  {
    min: 150,
    title: "The Manor's Worst Nightmare",
    blurb: "Management is filing a complaint.",
  },
  {
    min: 100,
    title: "Professional Trespasser",
    blurb: "You made the locks look lazy.",
  },
  {
    min: 60,
    title: "Moderately Haunted",
    blurb: "A respectable amount of sweating.",
  },
  {
    min: 30,
    title: "Sweaty Survivor",
    blurb: "The ghost is taking this personally.",
  },
  {
    min: 0,
    title: "Fashionably Late to Living",
    blurb: "You escaped with your soul and very little dignity.",
  },
] as const;
