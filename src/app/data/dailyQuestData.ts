/**
 * Content and helpers for the daily brain games (Today's Challenge) and the
 * games inside Skill Builder. Everything is deterministic from a seed so that
 * everyone gets the same game on the same day and a reload never changes it.
 */
import { JHS_PUZZLES, SHS_PUZZLES } from './brainBoostData';

export type GameId = 'quickfire' | 'memory-match' | 'pattern' | 'stroop' | 'riddle' | 'n-back';

export interface GameMeta {
  title: string;
  emoji: string;
  skill: string;
  tagline: string;
  howTo: string[];
  seconds: number;
  /** One practical line that links the game to school life. */
  useIt: string;
}

export const GAME_META: Record<GameId, GameMeta> = {
  quickfire: {
    title: 'Quick Fire',
    emoji: '⚡',
    skill: 'Quick thinking',
    tagline: 'Five fast questions. Think quick, answer sharp.',
    howTo: ['Pick the best answer before the bar runs out.', 'Wrong answer? You will see why. No stress.'],
    seconds: 90,
    useIt: "In class, try answering a question in your head before the teacher finishes asking it.",
  },
  'memory-match': {
    title: 'Memory Match',
    emoji: '🃏',
    skill: 'Memory',
    tagline: 'Find all the matching animal pairs.',
    howTo: ['Tap two cards to flip them.', 'Matching pair stays open. Fewer flips = more stars.'],
    seconds: 60,
    useIt: "Look at a page of notes for 30 seconds, close it, then write down what you remember.",
  },
  pattern: {
    title: 'Pattern Finder',
    emoji: '🔢',
    skill: 'Spotting patterns',
    tagline: 'Crack the rule. Find the next number.',
    howTo: ['Look at the number chain.', 'Work out the rule, then pick the number that comes next.'],
    seconds: 90,
    useIt: "Before you calculate a maths problem, look for a pattern first. It often saves time.",
  },
  stroop: {
    title: 'Color Clash',
    emoji: '🎨',
    skill: 'Focus',
    tagline: 'The word lies. Trust the ink.',
    howTo: ['Tap the COLOR the word is printed in.', 'Ignore what the word says. It is trickier than it sounds!'],
    seconds: 45,
    useIt: "When your phone buzzes while you study, finish your sentence before you look.",
  },
  riddle: {
    title: 'Brain Teaser',
    emoji: '🧩',
    skill: 'Creative logic',
    tagline: 'One puzzle. Two tries. Can you crack it?',
    howTo: ['Type your answer. You get two tries.', 'Stuck? A hint helps, but it costs a few points.'],
    seconds: 120,
    useIt: "When you are stuck, explain the problem out loud, even to yourself. New ideas show up.",
  },
  'n-back': {
    title: 'Spot the Repeat',
    emoji: '👀',
    skill: 'Working memory',
    tagline: 'Letters flash by. Catch the repeats.',
    howTo: ['One letter shows at a time.', 'Tap SAME when it matches the one right before it.'],
    seconds: 30,
    useIt: "Repeat what the teacher just said in your head before you write it down.",
  },
};

/** Order the daily games rotate in. */
export const QUEST_ORDER: GameId[] = ['quickfire', 'memory-match', 'pattern', 'stroop', 'riddle', 'n-back'];

// ---- Dates ---------------------------------------------------------------

/** UTC date key. Matches what the server stores in completedDays. */
export function utcDateKey(d: Date = new Date()): string {
  return d.toISOString().split('T')[0];
}

export function addDaysToKey(key: string, n: number): string {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return utcDateKey(d);
}

export function dayIndexOf(key: string): number {
  return Math.floor(Date.parse(`${key}T00:00:00Z`) / 86_400_000);
}

export function questFor(key: string): { gameId: GameId; seed: number } {
  const dayIndex = dayIndexOf(key);
  return {
    gameId: QUEST_ORDER[dayIndex % QUEST_ORDER.length],
    seed: dayIndex * 7919 + 13,
  };
}

// ---- Random --------------------------------------------------------------

export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffled<T>(items: T[], rnd: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ---- Quick Fire ----------------------------------------------------------

export interface QuickFireQuestion {
  q: string;
  options: string[];
  answer: number;
  why: string;
}

export const QUICKFIRE_BANK: QuickFireQuestion[] = [
  { q: 'Which number comes next? 2, 4, 8, 16, …', options: ['24', '30', '32'], answer: 2, why: 'Each number doubles: 16 × 2 = 32.' },
  { q: 'Today is Monday. What day is it 10 days from now?', options: ['Wednesday', 'Thursday', 'Friday'], answer: 1, why: '10 days = 1 week + 3 days. Monday + 3 = Thursday.' },
  { q: 'You have 3 apples and you take away 2. How many apples do YOU have?', options: ['1', '3', '2'], answer: 2, why: 'You took 2, so you are holding 2.' },
  { q: 'What is 15% of 200?', options: ['15', '30', '35'], answer: 1, why: '10% is 20 and 5% is 10. Together: 30.' },
  { q: 'Which one does NOT belong? Lion, Giraffe, Eagle, Elephant', options: ['Giraffe', 'Eagle', 'Lion'], answer: 1, why: 'An eagle is a bird. The others are mammals.' },
  { q: 'A bat and ball cost GH₵11 together. The bat costs GH₵10 more than the ball. How much is the ball?', options: ['GH₵1', '50 pesewas', '10 pesewas'], answer: 1, why: 'Ball 50p + bat GH₵10.50 = GH₵11. It is not GH₵1!' },
  { q: 'Which is the same as 3/4?', options: ['0.34', '0.8', '0.75'], answer: 2, why: '3 ÷ 4 = 0.75.' },
  { q: 'All roses are flowers. Some flowers fade quickly. What MUST be true?', options: ['All roses fade quickly', 'Roses are flowers', 'No flower lasts long'], answer: 1, why: 'Only the first sentence is certain. The rest are guesses.' },
  { q: 'How many minutes are in 2.5 hours?', options: ['120', '180', '150'], answer: 2, why: '2 hours = 120 min, plus 30 min = 150.' },
  { q: 'Mon, Wed, Fri, … what comes next?', options: ['Sat', 'Sun', 'Tue'], answer: 1, why: 'You skip one day each time: Fri, skip Sat, Sun.' },
  { q: 'Which is heavier: 1 kg of cocoa beans or 1 kg of feathers?', options: ['Cocoa beans', 'Feathers', 'They weigh the same'], answer: 2, why: '1 kg is 1 kg. Feathers just take up more space.' },
  { q: 'A farmer has 17 goats. All but 9 run away. How many are left?', options: ['8', '9', '17'], answer: 1, why: '"All but 9" means 9 stayed.' },
  { q: 'What comes next? A, C, E, G, …', options: ['H', 'J', 'I'], answer: 2, why: 'Every second letter: G, skip H, I.' },
  { q: '5 friends each shake hands once with every other friend. How many handshakes?', options: ['10', '15', '20'], answer: 0, why: '5 × 4 ÷ 2 = 10. Each handshake is counted twice otherwise.' },
  { q: 'Which number is prime?', options: ['21', '29', '33'], answer: 1, why: '29 can only be divided by 1 and itself. 21 = 3×7 and 33 = 3×11.' },
  { q: 'If you rearrange the letters "LEAP" you can make…', options: ['PLEA', 'PLATE', 'PEALS'], answer: 0, why: 'Same four letters: L, E, A, P.' },
];

export function pickQuickFire(seed: number, count = 5): QuickFireQuestion[] {
  const start = (Math.floor(seed / 7919) * count) % QUICKFIRE_BANK.length;
  return Array.from({ length: count }, (_, i) => QUICKFIRE_BANK[(start + i) % QUICKFIRE_BANK.length]);
}

// ---- Brain Teaser --------------------------------------------------------

export interface Riddle {
  id: string;
  title: string;
  prompt: string;
  hint: string;
  accept: string[];
  display: string;
  why: string;
}

const WORD_RIDDLES: Riddle[] = [
  { id: 'r-keyboard', title: 'What am I? ⌨️', prompt: 'I have keys but no locks. I have space but no room. You can enter, but you can never go inside. What am I?', hint: 'You are probably touching one right now.', accept: ['keyboard', 'a keyboard'], display: 'a keyboard', why: 'Keys, a space bar and an Enter key.' },
  { id: 'r-towel', title: 'What am I? 🧺', prompt: 'The more I dry, the wetter I get. What am I?', hint: 'You use me after a shower.', accept: ['towel', 'a towel'], display: 'a towel', why: 'A towel gets wetter as it dries you.' },
  { id: 'r-clock', title: 'What am I? ⏰', prompt: 'I have hands but I cannot clap. I have a face but no eyes. What am I?', hint: 'Look at the wall or your wrist.', accept: ['clock', 'a clock', 'watch', 'a watch'], display: 'a clock', why: 'The hands of a clock point to the time.' },
  { id: 'r-coin', title: 'What am I? 🪙', prompt: 'I have a head and a tail, but no body. What am I?', hint: 'You flip me to decide who goes first.', accept: ['coin', 'a coin'], display: 'a coin', why: 'Heads and tails, no body.' },
  { id: 'r-footsteps', title: 'What am I? 👣', prompt: 'The more of me you take, the more of me you leave behind. What am I?', hint: 'Think about walking on sand.', accept: ['footsteps', 'steps', 'footprints', 'footstep', 'step'], display: 'footsteps', why: 'Every step you take leaves one behind.' },
];

function fromPuzzle(p: (typeof SHS_PUZZLES)[number]): Riddle {
  return {
    id: p.id,
    title: p.title,
    prompt: p.description,
    hint: p.hint,
    accept: [p.answer.toLowerCase()],
    display: p.answer,
    why: p.explanation,
  };
}

const SHS_RIDDLES: Riddle[] = [...SHS_PUZZLES.map(fromPuzzle), ...WORD_RIDDLES];
const JHS_RIDDLES: Riddle[] = [...JHS_PUZZLES.map(fromPuzzle), ...WORD_RIDDLES];

/** Younger students (JHS) get the gentler puzzle set. */
export function pickRiddle(seed: number, young = false): Riddle {
  const pool = young ? JHS_RIDDLES : SHS_RIDDLES;
  return pool[Math.floor(seed / 7919) % pool.length];
}

/** Loose answer check: "5 minutes" matches "5", "Switch!" matches "switch". */
export function riddleAnswerMatches(input: string, riddle: Riddle): boolean {
  const cleaned = input.toLowerCase().trim().replace(/[^a-z0-9. ]/g, '').replace(/\s+/g, ' ');
  if (!cleaned) return false;
  const tokens = cleaned.split(' ');
  return riddle.accept.some((a) => {
    if (cleaned === a) return true;
    if (/^\d+(\.\d+)?$/.test(a)) return tokens.includes(a);
    return tokens[0] === a;
  });
}

// ---- Pattern Finder ------------------------------------------------------

export interface PatternRound {
  terms: number[];
  options: number[];
  answer: number;
  why: string;
}

export function makePatternRounds(seed: number, count = 5): PatternRound[] {
  const rnd = makeRng(seed);
  const int = (lo: number, hi: number) => lo + Math.floor(rnd() * (hi - lo + 1));
  const kinds = shuffled(['add', 'multiply', 'square', 'growing', 'alternate', 'subtract', 'fib'], rnd);
  const rounds: PatternRound[] = [];

  for (let r = 0; r < count; r++) {
    const kind = kinds[r % kinds.length];
    let seq: number[] = [];
    let why = '';
    if (kind === 'add') {
      const start = int(2, 15), step = int(3, 9);
      seq = Array.from({ length: 5 }, (_, i) => start + step * i);
      why = `Add ${step} each time.`;
    } else if (kind === 'subtract') {
      const step = int(3, 8), start = int(40, 70);
      seq = Array.from({ length: 5 }, (_, i) => start - step * i);
      why = `Take away ${step} each time.`;
    } else if (kind === 'multiply') {
      const start = int(1, 4), m = int(2, 3);
      seq = Array.from({ length: 5 }, (_, i) => start * m ** i);
      why = `Multiply by ${m} each time.`;
    } else if (kind === 'square') {
      const from = int(1, 4);
      seq = Array.from({ length: 5 }, (_, i) => (from + i) ** 2);
      why = 'These are square numbers (1×1, 2×2, 3×3…).';
    } else if (kind === 'growing') {
      const start = int(1, 6);
      seq = [start];
      for (let i = 1; i < 5; i++) seq.push(seq[i - 1] + i + 1);
      why = 'The jump grows by 1 each time: +2, +3, +4, +5…';
    } else if (kind === 'alternate') {
      const a = int(4, 9), b = int(1, 3), start = int(10, 20);
      seq = [start];
      for (let i = 1; i < 5; i++) seq.push(seq[i - 1] + (i % 2 === 1 ? a : -b));
      why = `Switch between +${a} and −${b}.`;
    } else {
      const a = int(1, 3), b = int(2, 4);
      seq = [a, b];
      for (let i = 2; i < 6; i++) seq.push(seq[i - 1] + seq[i - 2]);
      seq = seq.slice(0, 6);
      why = 'Add the two numbers before it to get the next one.';
    }
    const answer = seq[seq.length - 1];
    const terms = seq.slice(0, -1);
    const last = terms[terms.length - 1];
    const distractors = shuffled(
      Array.from(new Set([answer + 1, answer - 1, answer + 2, answer - 2, answer + 3, last * 2, answer + 10])).filter(
        (n) => n !== answer && n > 0,
      ),
      rnd,
    ).slice(0, 2);
    const options = shuffled([answer, ...distractors], rnd);
    rounds.push({ terms, options, answer: options.indexOf(answer), why });
  }
  return rounds;
}
