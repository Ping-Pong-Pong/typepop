/* TypePop — per-type companion config.
 * ENFP is fully wired. The other 15 reuse the ENFP pose set as a
 * placeholder (posesReady: false) until their v5 pose sets land.
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
  color: string; // signature blob color
  prop: string;
  posesReady: boolean;
  poses: TypePoses;
  oneLiners: string[];
  checkinReact: Record<MoodKey, string[]>;
}

const ENFP_POSES: TypePoses = {
  idle: require('../assets/blobs/pip-idle.png'),
  blink: require('../assets/blobs/pip-blink.png'),
  happy: require('../assets/blobs/pip-happy.png'),
  walk: require('../assets/blobs/pip-walk.png'),
  nap: require('../assets/blobs/pip-nap.png'),
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
    'YESSS! Your energy is contagious! Let\'s bottle it!',
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

function stub(
  key: string,
  nickname: string,
  color: string,
  prop: string,
  oneLiners: string[],
): TypeConfig {
  return {
    key,
    name: key.toUpperCase(),
    nickname,
    color,
    prop,
    posesReady: false,
    poses: ENFP_POSES, // placeholder until the v5 pose set lands
    oneLiners,
    checkinReact: ENFP_CHECKIN, // placeholder voice
  };
}

export const TYPES: Record<string, TypeConfig> = {
  enfp: {
    key: 'enfp',
    name: 'ENFP',
    nickname: 'The Hype Machine',
    color: '#FF8C69',
    prop: 'party popper',
    posesReady: true,
    poses: ENFP_POSES,
    oneLiners: ENFP_ONELINERS,
    checkinReact: ENFP_CHECKIN,
  },
  intj: stub('intj', 'The Chess Player', '#3B4A6B', 'chess piece', [
    'I have already simulated this conversation. It went well.',
    'Efficiency is my love language.',
  ]),
  enfj: stub('enfj', 'The Cheerleader', '#FF6B6B', 'megaphone', [
    'You did AMAZING today and I need you to know that.',
  ]),
  entj: stub('entj', 'The Commander', '#8B5CF6', 'scepter', [
    'I made a 5-year plan for us. You\'re welcome.',
  ]),
  entp: stub('entp', 'The Debater', '#F59E0B', 'lightbulb', [
    'Devil\'s advocate here: what if naps are a conspiracy?',
  ]),
  infj: stub('infj', 'The Counselor', '#6D9DC5', 'lantern', [
    'I knew you were going to tap me. I always know.',
  ]),
  infp: stub('infp', 'The Dreamer', '#A8E6CF', 'flower', [
    'I wrote a poem about this rug. Want to hear it?',
  ]),
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
    'The nap schedule has been optimized. You\'re welcome.',
  ]),
  isfp: stub('isfp', 'The Artist', '#4ECDC4', 'paint palette', [
    'This wall needs more… everything. Hold my brush.',
  ]),
  istp: stub('istp', 'The Crafter', '#8A9A5B', 'wrench', [
    'I fixed the wobble in the table. You\'re welcome.',
  ]),
  isfj: stub('isfj', 'The Defender', '#E8B84B', 'shield', [
    'I\'ll keep watch while you rest. It\'s what I do.',
  ]),
  istj: stub('istj', 'The Inspector', '#7B8BA3', 'wristwatch', [
    'Nap logged at 14:32. Duration: optimal.',
  ]),
};

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
