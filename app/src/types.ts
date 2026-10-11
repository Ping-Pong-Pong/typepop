/* TypePop — per-type companion config.
 * Seven types have full v5 pose sets (posesReady: true): enfp, intj,
 * enfj, entj, entp, infj, infp. The remaining nine reuse the ENFP pose
 * set as a placeholder (posesReady: false) until their v5 pose sets land.
 */
export type PoseName = 'idle' | 'blink' | 'happy' | 'walk' | 'nap';
export type MoodKey = 'happy' | 'chill' | 'tired' | 'grumpy';

export interface TypePoses {
  idle: any;
  blink: any;
  happy: any;
  walk: any;
  nap: any;
}

export interface TypeConfig {
  key: string;
  name: string; // e.g. 'ENFP'
  nickname: string; // e.g. 'The Hype Machine'
  palName: string; // the companion's given name, e.g. 'Pip'
  color: string; // signature blob color
  prop: string;
  posesReady: boolean;
  poses: TypePoses;
  oneLiners: string[];
  checkinReact: Record<MoodKey, string[]>;
}

/* ---------- ENFP poses (already PNG, wired in run 1) ---------- */
const ENFP_POSES: TypePoses = {
  idle: require('../assets/blobs/pip-idle.png'),
  blink: require('../assets/blobs/pip-blink.png'),
  happy: require('../assets/blobs/pip-happy.png'),
  walk: require('../assets/blobs/pip-walk.png'),
  nap: require('../assets/blobs/pip-nap.png'),
};

/* ---------- run 2 pose sets (webp→PNG, iOS-safe) ---------- */
const INTJ_POSES: TypePoses = {
  idle: require('../assets/blobs/intj-idle.png'),
  blink: require('../assets/blobs/intj-blink.png'),
  happy: require('../assets/blobs/intj-happy.png'),
  walk: require('../assets/blobs/intj-walk.png'),
  nap: require('../assets/blobs/intj-nap.png'),
};
const ENFJ_POSES: TypePoses = {
  idle: require('../assets/blobs/enfj-idle.png'),
  blink: require('../assets/blobs/enfj-blink.png'),
  happy: require('../assets/blobs/enfj-happy.png'),
  walk: require('../assets/blobs/enfj-walk.png'),
  nap: require('../assets/blobs/enfj-nap.png'),
};
const ENTJ_POSES: TypePoses = {
  idle: require('../assets/blobs/entj-idle.png'),
  blink: require('../assets/blobs/entj-blink.png'),
  happy: require('../assets/blobs/entj-happy.png'),
  walk: require('../assets/blobs/entj-walk.png'),
  nap: require('../assets/blobs/entj-nap.png'),
};
const ENTP_POSES: TypePoses = {
  idle: require('../assets/blobs/entp-idle.png'),
  blink: require('../assets/blobs/entp-blink.png'),
  happy: require('../assets/blobs/entp-happy.png'),
  walk: require('../assets/blobs/entp-walk.png'),
  nap: require('../assets/blobs/entp-nap.png'),
};
const INFJ_POSES: TypePoses = {
  idle: require('../assets/blobs/infj-idle.png'),
  blink: require('../assets/blobs/infj-blink.png'),
  happy: require('../assets/blobs/infj-happy.png'),
  walk: require('../assets/blobs/infj-walk.png'),
  nap: require('../assets/blobs/infj-nap.png'),
};
const INFP_POSES: TypePoses = {
  idle: require('../assets/blobs/infp-idle.png'),
  blink: require('../assets/blobs/infp-blink.png'),
  happy: require('../assets/blobs/infp-happy.png'),
  walk: require('../assets/blobs/infp-walk.png'),
  nap: require('../assets/blobs/infp-nap.png'),
};

const ENFP_ONELINERS = [
  "I have seventeen plans today and I'm doing ALL of them!",
  'Wait, that cloud looks like a dragon. Anyway—',
  'New idea!! Okay hear me out—',
  'I reorganized my sock drawer into a theme park.',
  "Let's learn the trumpet. TODAY.",
  'I made friends with the dust bunnies. Great listeners.',
  "Nap? Never heard of her.",
  'Plot twist: the floor is lava. GO GO GO!',
  "I waved at a stranger and now we're best friends.",
  'What if we threw a party… for no reason?!',
];

const ENFP_CHECKIN: Record<MoodKey, string[]> = {
  happy: [
    "YESSS! Your energy is contagious! Let's bottle it!",
    'I KNEW today was going to be amazing!',
  ],
  chill: [
    'Chill is just excitement taking a snack break. Respect.',
    "Cozy mode: engaged. I'll match your vibe.",
  ],
  tired: [
    'Emergency fun protocol ACTIVATED. Confetti incoming!',
    "Rest up, I'll keep the party warm for you.",
  ],
  grumpy: [
    'Boo to grumpy! Prescribing one (1) dance break.',
    "Okay okay… want me to just sit with you? I'm good at that too.",
  ],
};

function cfg(
  key: string,
  nickname: string,
  palName: string,
  color: string,
  prop: string,
  poses: TypePoses,
  posesReady: boolean,
  oneLiners: string[],
  checkinReact?: Record<MoodKey, string[]>,
): TypeConfig {
  return {
    key,
    name: key.toUpperCase(),
    nickname,
    palName,
    color,
    prop,
    posesReady,
    poses,
    oneLiners,
    checkinReact: checkinReact ?? ENFP_CHECKIN,
  };
}

/* Placeholder for the 9 types whose pose sets have not landed yet. */
function stub(
  key: string,
  nickname: string,
  color: string,
  prop: string,
  oneLiners: string[],
): TypeConfig {
  return cfg(key, nickname, 'Pip', color, prop, ENFP_POSES, false, oneLiners);
}

export const TYPES: Record<string, TypeConfig> = {
  enfp: cfg('enfp', 'The Hype Machine', 'Pip', '#FF8C69', 'party popper',
    ENFP_POSES, true, ENFP_ONELINERS, ENFP_CHECKIN),

  intj: cfg('intj', 'The Chess Player', 'Nova', '#3B4A6B', 'chess piece',
    INTJ_POSES, true,
    [
      'I have already simulated this conversation. It went well.',
      'Efficiency is my love language.',
      'Your schedule has been optimized. I did not ask.',
      'Small talk detected. Deploying exit strategy.',
    ],
    {
      happy: ['Optimal outcome. As predicted.', 'Elevated mood detected. Excellent.'],
      chill: ['A rare, efficient use of downtime. Approved.', 'Rest is just compute time for the brain.'],
      tired: ['Energy reserves at 12%. Recharging advised.', 'I have scheduled you a nap. It was non-negotiable.'],
      grumpy: ['Irritation logged as a data point. Addressing now.', 'Prescribing one strategic retreat. You are welcome.'],
    }),

  enfj: cfg('enfj', 'The Cheerleader', 'Sunny', '#FF6B6B', 'megaphone',
    ENFJ_POSES, true,
    [
      'You did AMAZING today and I need you to know that.',
      'I noticed you looked great. It needed to be said.',
      'Group hug! Attendance is mandatory.',
      'You are the protagonist today. I make the rules.',
    ],
    {
      happy: ['YES! I can feel your joy from here!', 'This is the best timeline!'],
      chill: ['Rest is productive too, superstar.', 'Cozy you is my favorite you.'],
      tired: ['Emergency nap protocol! I will handle everything.', 'You give so much. Let me hold the vibe a while.'],
      grumpy: ['Boo! Sending the motivational squad immediately.', 'Your feelings are valid AND you are still amazing.'],
    }),

  entj: cfg('entj', 'The Commander', 'Rex', '#8B5CF6', 'scepter',
    ENTJ_POSES, true,
    [
      "I made a 5-year plan for us. You're welcome.",
      'Excuses: zero. Results: incoming.',
      'Lead, follow, or get out of the hallway.',
      'Nap efficiency is up 40%. Keep it up.',
    ],
    {
      happy: ['Excellent. Momentum favors the bold.', 'Victory looks good on you.'],
      chill: ['Strategic downtime. Smart.', 'Even commanders take shore leave.'],
      tired: ['Fatigue noted. Deploying rest protocol.', 'You have earned this nap. Dismissed.'],
      grumpy: ['Obstacles are just objectives in disguise.', 'Rerouting your mood. Stand by.'],
    }),

  entp: cfg('entp', 'The Debater', 'Zip', '#F59E0B', 'lightbulb',
    ENTP_POSES, true,
    [
      "Devil's advocate here: what if naps are a conspiracy?",
      'New invention idea! It is DEFINITELY safe.',
      'I can argue any side of this. Want a demo?',
      'What if the rug… was a trampoline?',
    ],
    {
      happy: ['Hypothesis: happiness! Confirmed by science (me).', 'YES! Let us bottle this energy and sell it.'],
      chill: ['Chill mode: accepted. I will sit here and scheme quietly.', 'Low-key scheming is still scheming.'],
      tired: ['Emergency: you need sugar and a debate.', 'Nap first, argue later. New rule.'],
      grumpy: ['Grumpy? Let me debate you out of it.', 'Counterpoint: snacks. I rest my case.'],
    }),

  infj: cfg('infj', 'The Counselor', 'Milo', '#6D9DC5', 'lantern',
    INFJ_POSES, true,
    [
      'I knew you were going to tap me. I always know.',
      'Tell me about your day. I will read between the lines.',
      'You seem quieter than yesterday. Talk to me.',
      'I have been saving you a spot by the window.',
    ],
    {
      happy: ['Your happiness feels like sunlight. Stay a while.', 'I am quietly celebrating you.'],
      chill: ['Peaceful. Let us just be.', 'Stillness suits you.'],
      tired: ['Rest, my friend. I will keep watch over the quiet.', 'Even candles need to rest their wicks.'],
      grumpy: ['I will sit with you. No fixing, just company.', 'Storms pass. I am not going anywhere.'],
    }),

  infp: cfg('infp', 'The Dreamer', 'Wisp', '#A8E6CF', 'flower',
    INFP_POSES, true,
    [
      'I wrote a poem about this rug. Want to hear it?',
      'That cloud told me a secret. Want to know?',
      'What if naps were a form of time travel?',
      'I named all the dust motes. This one is Gerald.',
    ],
    {
      happy: ['Your joy sounds like wind chimes!', 'Today feels like the good part of a story.'],
      chill: ['Dreaming together sounds perfect.', 'Let the afternoon be soft.'],
      tired: ['Rest, dreamer. The poems will wait.', 'Even fireflies dim sometimes.'],
      grumpy: ['Want me to sit quietly and hum?', 'Bad moods are just plot twists.'],
    }),

  intp: stub('intp', 'The Thinker', '#8B9BB4', 'beaker', [
    'Hypothesis: snacks improve everything. Testing now.',
  ]),
  esfp: stub('esfp', 'The Entertainer', '#FFD93D', 'maraca', [
    'Dance break! No arguments!',
  ]),
  esfj: stub('esfj', 'The Caregiver', '#FFB59E', 'gift box', [
    'I saved you the good cushion. Obviously.',
  ]),
  estp: stub('estp', 'The Daredevil', '#FF5A3C', 'lightning bolt', [
    'Bet I can hop higher than you. Watch.',
  ]),
  estj: stub('estj', 'The Executive', '#4A5F8A', 'clipboard', [
    "The nap schedule has been optimized. You're welcome.",
  ]),
  isfp: stub('isfp', 'The Artist', '#4ECDC4', 'paint palette', [
    'This wall needs more… everything. Hold my brush.',
  ]),
  istp: stub('istp', 'The Crafter', '#8A9A5B', 'wrench', [
    'I fixed the wobble in the table. You’re welcome.',
  ]),
  isfj: stub('isfj', 'The Defender', '#E8B84B', 'shield', [
    "I'll keep watch while you rest. It's what I do.",
  ]),
  istj: stub('istj', 'The Inspector', '#7B8BA3', 'wristwatch', [
    'Nap logged at 14:32. Duration: optimal.',
  ]),
};

/** Types with real v5 pose sets, in selector order. */
export const READY_TYPES: TypeConfig[] = [
  'enfp', 'enfj', 'entj', 'entp', 'infj', 'infp', 'intj',
].map((k) => TYPES[k]);

export const MOODS: { icon: string; key: MoodKey; label: string }[] = [
  { icon: '😄', key: 'happy', label: 'Happy' },
  { icon: '😌', key: 'chill', label: 'Chill' },
  { icon: '😴', key: 'tired', label: 'Tired' },
  { icon: '😤', key: 'grumpy', label: 'Grumpy' },
];

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function isNightNow(): boolean {
  const h = new Date().getHours();
  return h < 6 || h >= 19;
}
