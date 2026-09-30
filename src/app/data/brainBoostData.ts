/**
 * Brain Boost & Cognitive Challenges Bank
 * Age-appropriate puzzles, lateral thinking riddles, and Kolb-aligned daily missions
 * for Junior High School (JHS, ages 11-14) and Senior High School (SHS, ages 15-18).
 */

export interface BrainBoostPuzzle {
  id: string;
  title: string;
  category: 'logic' | 'lateral' | 'pattern' | 'spatial' | 'critical';
  targetGroup: 'jhs' | 'shs' | 'both';
  difficulty: 'Starter' | 'Intermediate' | 'Mastery';
  description: string;
  hint: string;
  answer: string;
  explanation: string;
  kolbAlignment: 'Diverging' | 'Assimilating' | 'Converging' | 'Accommodating';
  points: number;
}

export interface KolbDailyMission {
  id: string;
  style: 'Diverging' | 'Assimilating' | 'Converging' | 'Accommodating';
  title: string;
  targetGroup: 'jhs' | 'shs' | 'both';
  objective: string;
  actionPrompt: string;
  estimatedMinutes: number;
  points: number;
}

export const JHS_PUZZLES: BrainBoostPuzzle[] = [
  {
    id: 'jhs-01',
    title: 'The Island Crossing Riddle 🏝️',
    category: 'logic',
    targetGroup: 'jhs',
    difficulty: 'Starter',
    description: 'A farmer must cross a river in a small boat with a fox, a goose, and a bag of grain. The boat can only carry the farmer and one item at a time. If left alone together, the fox eats the goose, and the goose eats the grain. What item must the farmer take across first?',
    hint: 'Think about which animal will cause trouble with both of the other items!',
    answer: 'goose',
    explanation: 'The farmer must take the goose first. The fox will not eat grain alone. Then he returns, takes the fox, brings the goose back, takes the grain across, and finally returns to get the goose!',
    kolbAlignment: 'Converging',
    points: 25
  },
  {
    id: 'jhs-02',
    title: 'Pattern Detective 🔍',
    category: 'pattern',
    targetGroup: 'jhs',
    difficulty: 'Starter',
    description: 'Find the next number in this sequence: 3, 6, 12, 24, 48, ___? What comes next?',
    hint: 'Each number is twice as big as the one before it.',
    answer: '96',
    explanation: 'Each term is multiplied by 2: 48 × 2 = 96.',
    kolbAlignment: 'Assimilating',
    points: 20
  },
  {
    id: 'jhs-03',
    title: 'The Broken Clock Dilemma ⏰',
    category: 'lateral',
    targetGroup: 'jhs',
    difficulty: 'Intermediate',
    description: 'A wall clock in the classroom stops completely at 3:15. How many times in a single 24-hour day does this broken clock show the exact correct time?',
    hint: 'Think about how time moves around a normal 12-hour clock face.',
    answer: '2',
    explanation: 'A completely stopped clock shows the exact correct time twice every 24 hours: once at 3:15 AM and once at 3:15 PM.',
    kolbAlignment: 'Diverging',
    points: 20
  },
  {
    id: 'jhs-04',
    title: 'Matchstick Geometry 📐',
    category: 'spatial',
    targetGroup: 'jhs',
    difficulty: 'Intermediate',
    description: 'You have 12 matchsticks arranged to form 4 small equal squares in a 2x2 grid. What is the minimum number of matchsticks you must remove so that no complete squares remain?',
    hint: 'Think about breaking the boundary of every single square.',
    answer: '4',
    explanation: 'Removing 4 internal matchsticks eliminates all 4 small squares and the 1 big outer square.',
    kolbAlignment: 'Accommodating',
    points: 25
  },
  {
    id: 'jhs-05',
    title: 'The Secret Code Word 🔐',
    category: 'logic',
    targetGroup: 'jhs',
    difficulty: 'Intermediate',
    description: 'Rearrange the letters in "LISTEN" to spell a word describing what you need to be to hear well:',
    hint: 'It starts with the letter S.',
    answer: 'silent',
    explanation: 'LISTEN and SILENT are exact anagrams of each other!',
    kolbAlignment: 'Diverging',
    points: 20
  }
];

export const SHS_PUZZLES: BrainBoostPuzzle[] = [
  {
    id: 'shs-01',
    title: 'The Widget Machine Conundrum ⚙️',
    category: 'critical',
    targetGroup: 'shs',
    difficulty: 'Intermediate',
    description: 'If it takes 5 machines 5 minutes to make 5 widgets, how many minutes does it take 100 identical machines to make 100 widgets?',
    hint: 'Focus on the rate of one single machine!',
    answer: '5',
    explanation: 'One machine takes 5 minutes to complete 1 widget. Therefore, 100 machines working in parallel will produce 100 widgets in exactly 5 minutes.',
    kolbAlignment: 'Converging',
    points: 25
  },
  {
    id: 'shs-02',
    title: 'The Monty Hall Probability Twist 🚪',
    category: 'logic',
    targetGroup: 'shs',
    difficulty: 'Mastery',
    description: 'You are on a game show with 3 doors: 1 has a scholarship prize, 2 have empty boxes. You pick Door 1. The host (who knows what is behind each door) opens Door 3, revealing an empty box. He asks: "Do you want to switch to Door 2?" To maximize your probability of winning, should you Switch, Stay, or does it make No Difference?',
    hint: 'What was the initial probability of Door 1 having the scholarship?',
    answer: 'switch',
    explanation: 'Switching gives you a 2/3 (66.7%) chance of winning, while staying keeps your initial 1/3 (33.3%) chance. Always switch!',
    kolbAlignment: 'Assimilating',
    points: 30
  },
  {
    id: 'shs-03',
    title: 'The Dual Water Jug Challenge 🧪',
    category: 'critical',
    targetGroup: 'shs',
    difficulty: 'Intermediate',
    description: 'You have an unmarked 5-liter jug, an unmarked 3-liter jug, and an unlimited tap of water. How can you measure out exactly 4 liters? What is the minimum number of water transfers required (between jugs or filling/emptying)?',
    hint: 'Fill the 5L jug first, pour into the 3L jug, empty the 3L, transfer the remainder...',
    answer: '6',
    explanation: '1. Fill 5L (5,0) → 2. Pour into 3L (2,3) → 3. Empty 3L (2,0) → 4. Pour remaining 2L into 3L (0,2) → 5. Fill 5L (5,2) → 6. Pour into 3L until full (4,3). Exactly 4L remains in the 5L jug!',
    kolbAlignment: 'Converging',
    points: 30
  },
  {
    id: 'shs-04',
    title: 'Perimeter Optimization 📐',
    category: 'spatial',
    targetGroup: 'shs',
    difficulty: 'Intermediate',
    description: 'You have exactly 120 meters of fencing to build a rectangular field against an existing straight stone wall (fencing is only needed on 3 sides). What length of the side perpendicular to the wall maximizes the enclosed area in meters?',
    hint: 'Area = x * (120 - 2x). Find the vertex of this quadratic equation.',
    answer: '30',
    explanation: 'Let width be x. Then length along the wall is 120 - 2x. Area A(x) = 120x - 2x². Maximum occurs at x = -b/(2a) = -120 / (2 * -2) = 30 meters.',
    kolbAlignment: 'Assimilating',
    points: 30
  },
  {
    id: 'shs-05',
    title: 'The Lateral False Coin 🪙',
    category: 'critical',
    targetGroup: 'shs',
    difficulty: 'Mastery',
    description: 'You have 9 identical-looking gold coins, but one is counterfeit and lighter than the others. Using a two-pan balance scale, what is the minimum number of weighings guaranteed to identify the fake coin?',
    hint: 'Divide the 9 coins into 3 groups of 3 instead of halves.',
    answer: '2',
    explanation: 'Weigh Group A (3 coins) against Group B (3 coins). If they balance, the fake is in Group C. If not, it is in the lighter pan. Second weighing: take the identified group of 3 and weigh 1 against 1. You find it in just 2 weighings!',
    kolbAlignment: 'Converging',
    points: 35
  }
];

export const KOLB_DAILY_MISSIONS: KolbDailyMission[] = [
  {
    id: 'mission-div-01',
    style: 'Diverging',
    title: 'Perspective Switch 🔄',
    targetGroup: 'both',
    objective: 'Practice viewing a current topic or school problem from 3 completely different perspectives.',
    actionPrompt: 'Pick a subject you studied today. Write down how a scientist, a creative artist, and an entrepreneur would explain it.',
    estimatedMinutes: 5,
    points: 20
  },
  {
    id: 'mission-ass-01',
    style: 'Assimilating',
    title: 'Concept Blueprint 🗺️',
    targetGroup: 'both',
    objective: 'Organize complex information into a clear theoretical framework or mind map.',
    actionPrompt: 'Summarize the core chapter or formula you learned this week into a 3-tier hierarchy or flow diagram.',
    estimatedMinutes: 7,
    points: 20
  },
  {
    id: 'mission-con-01',
    style: 'Converging',
    title: 'Hypothesis Tester 🎯',
    targetGroup: 'both',
    objective: 'Apply logical deduction to find the single most optimal solution to a practical challenge.',
    actionPrompt: 'Identify one friction point in your daily study routine. Design one specific rule or tweak to solve it immediately.',
    estimatedMinutes: 5,
    points: 20
  },
  {
    id: 'mission-acc-01',
    style: 'Accommodating',
    title: 'Hands-On Action Sprint ⚡',
    targetGroup: 'both',
    objective: 'Learn by immediate doing, quick experimentation, and adapting on the fly.',
    actionPrompt: 'Try explaining a tough academic concept to a classmate or family member using only real-world physical objects on your desk.',
    estimatedMinutes: 6,
    points: 20
  }
];

/**
 * Returns an age-appropriate puzzle for JHS or SHS
 */
export function getBrainBoostPuzzle(age: number, dayIndex: number): BrainBoostPuzzle {
  const isJHS = age >= 10 && age <= 14;
  const pool = isJHS ? JHS_PUZZLES : SHS_PUZZLES;
  return pool[dayIndex % pool.length];
}

/**
 * Returns the daily Kolb cognitive mission
 */
export function getKolbDailyMission(dayIndex: number): KolbDailyMission {
  return KOLB_DAILY_MISSIONS[dayIndex % KOLB_DAILY_MISSIONS.length];
}
