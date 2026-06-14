/**
 * Cognitive Workout Engine
 * Bite-sized lessons, training exercises, and cognitive development
 */

export interface CognitiveLesson {
  id: string;
  title: string;
  category: 'learning' | 'thinking' | 'decision' | 'memory' | 'attention' | 'problem_solving';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedTime: number; // in minutes
  description: string;
  content: LessonContent;
  exercises: Exercise[];
  prerequisites?: string[]; // Lesson IDs
  unlockRequirement?: {
    type: 'level' | 'lessons_completed' | 'skill_level' | 'streak';
    value: number;
  };
  xpReward: number;
  skillPoints: {
    skill: string;
    points: number;
  }[];
}

export interface LessonContent {
  introduction: string;
  keyPoints: string[];
  examples: {
    scenario: string;
    explanation: string;
  }[];
  tips: string[];
  summary: string;
}

export interface Exercise {
  id: string;
  type: 'multiple_choice' | 'scenario' | 'reflection' | 'practice' | 'puzzle';
  question: string;
  options?: string[];
  correctAnswer?: number | string;
  explanation: string;
  timeLimit?: number; // in seconds
  points: number;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  lessonId: string;
  startedAt: string;
  completedAt?: string;
  exercises: {
    exerciseId: string;
    answer: any;
    correct: boolean;
    timeSpent: number;
  }[];
  score: number;
  perfectScore: boolean;
  totalXPEarned: number;
}

export interface DailyWorkout {
  date: string;
  lessons: string[]; // Lesson IDs recommended for today
  challenge: DailyCognitiveChallenge;
  bonusMultiplier: number; // e.g., 1.5x XP on weekends
  completed: boolean;
}

export interface DailyCognitiveChallenge {
  id: string;
  title: string;
  description: string;
  type: 'speed' | 'accuracy' | 'creativity' | 'endurance' | 'mixed';
  exercises: Exercise[];
  timeLimit: number;
  targetScore: number;
  rewards: {
    xp: number;
    badge?: string;
    unlocks?: string[];
  };
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string;
  milestones: {
    days: number;
    reward: string;
    claimed: boolean;
  }[];
}

const STORAGE_KEY = 'jotminds_cognitive_workout';
const SESSIONS_KEY = 'jotminds_workout_sessions';
const STREAK_KEY = 'jotminds_workout_streak';

// Lesson Library
const LESSON_LIBRARY: CognitiveLesson[] = [
  // Learning Style Lessons
  {
    id: 'visual-learning-basics',
    title: 'Visual Learning Mastery',
    category: 'learning',
    difficulty: 'beginner',
    estimatedTime: 5,
    description: 'Master the art of visual learning with diagrams, mind maps, and spatial techniques.',
    content: {
      introduction: 'Visual learning harnesses the power of images, diagrams, and spatial relationships to process information more effectively.',
      keyPoints: [
        'Visual learners process information best through images and spatial understanding',
        'Mind maps and diagrams help organize complex information',
        'Color coding enhances memory and recall',
        'Visualization techniques improve comprehension'
      ],
      examples: [
        {
          scenario: 'Studying for an exam',
          explanation: 'Create a mind map connecting main topics with branches, using different colors for each subject area.'
        },
        {
          scenario: 'Learning a new process',
          explanation: 'Draw a flowchart showing each step visually, making it easier to remember the sequence.'
        }
      ],
      tips: [
        'Use highlighters and colored pens when taking notes',
        'Convert text into diagrams whenever possible',
        'Watch videos and documentaries to supplement reading',
        'Create visual associations for abstract concepts'
      ],
      summary: 'Visual learning transforms information into memorable images and spatial patterns, making complex ideas easier to understand and recall.'
    },
    exercises: [
      {
        id: 'visual-ex-1',
        type: 'multiple_choice',
        question: 'Which technique is most effective for visual learners?',
        options: [
          'Reading text aloud',
          'Creating mind maps with colors',
          'Listening to audio recordings',
          'Writing detailed notes'
        ],
        correctAnswer: 1,
        explanation: 'Mind maps with colors leverage visual and spatial memory, perfect for visual learners.',
        points: 10
      },
      {
        id: 'visual-ex-2',
        type: 'reflection',
        question: 'Think of a recent topic you learned. How could you represent it visually?',
        explanation: 'Reflecting on how to visualize information strengthens your visual learning skills.',
        points: 15
      }
    ],
    xpReward: 50,
    skillPoints: [
      { skill: 'visual_learning', points: 25 }
    ]
  },
  {
    id: 'analytical-thinking-intro',
    title: 'Analytical Thinking Foundations',
    category: 'thinking',
    difficulty: 'beginner',
    estimatedTime: 7,
    description: 'Develop systematic problem-solving and logical analysis skills.',
    content: {
      introduction: 'Analytical thinking breaks down complex problems into manageable parts through logic and systematic analysis.',
      keyPoints: [
        'Break problems into smaller, manageable components',
        'Identify patterns and relationships',
        'Use data and evidence to support conclusions',
        'Question assumptions and verify facts'
      ],
      examples: [
        {
          scenario: 'Solving a math word problem',
          explanation: 'Identify known values, determine what you need to find, create equations, and solve step by step.'
        },
        {
          scenario: 'Debugging code',
          explanation: 'Isolate the error, check inputs/outputs, trace logic flow, and test hypotheses systematically.'
        }
      ],
      tips: [
        'Always define the problem clearly before solving',
        'Look for underlying patterns',
        'Use logic diagrams and flowcharts',
        'Verify each step of your reasoning'
      ],
      summary: 'Analytical thinking empowers you to solve complex problems through systematic breakdown and logical reasoning.'
    },
    exercises: [
      {
        id: 'analytical-ex-1',
        type: 'puzzle',
        question: 'If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops Lazzies?',
        options: ['Yes', 'No', 'Cannot be determined'],
        correctAnswer: 0,
        explanation: 'This is a syllogism. If A→B and B→C, then A→C. Therefore, all Bloops are Lazzies.',
        points: 20
      }
    ],
    xpReward: 75,
    skillPoints: [
      { skill: 'analytical_thinking', points: 30 }
    ]
  },
  {
    id: 'creative-problem-solving',
    title: 'Creative Problem Solving',
    category: 'thinking',
    difficulty: 'intermediate',
    estimatedTime: 8,
    description: 'Unlock innovative solutions through divergent thinking and creativity.',
    content: {
      introduction: 'Creative thinking generates novel solutions by breaking conventional patterns and exploring multiple possibilities.',
      keyPoints: [
        'Divergent thinking explores many possible solutions',
        'Brainstorming without judgment opens new possibilities',
        'Combining unrelated concepts sparks innovation',
        'Constraints can fuel creativity'
      ],
      examples: [
        {
          scenario: 'Designing a new product',
          explanation: 'Use SCAMPER technique: Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse.'
        },
        {
          scenario: 'Overcoming a roadblock',
          explanation: 'Ask "What if?" questions to explore unconventional approaches and perspectives.'
        }
      ],
      tips: [
        'Generate many ideas before evaluating any',
        'Look for connections between unrelated things',
        'Challenge assumptions and reverse problems',
        'Use analogies from different domains'
      ],
      summary: 'Creative problem solving transforms challenges into opportunities through innovative and unconventional thinking.'
    },
    exercises: [
      {
        id: 'creative-ex-1',
        type: 'scenario',
        question: 'List 5 unusual uses for a paper clip that have nothing to do with holding papers together.',
        explanation: 'This exercise builds divergent thinking - the ability to generate multiple creative solutions.',
        points: 25
      }
    ],
    unlockRequirement: {
      type: 'lessons_completed',
      value: 2
    },
    xpReward: 100,
    skillPoints: [
      { skill: 'creative_thinking', points: 35 }
    ]
  },
  {
    id: 'decision-making-speed',
    title: 'Intuitive Decision Making',
    category: 'decision',
    difficulty: 'intermediate',
    estimatedTime: 6,
    description: 'Develop fast, intuitive decision-making skills for time-sensitive situations.',
    content: {
      introduction: 'Intuitive decision making leverages pattern recognition and gut feelings for rapid choices.',
      keyPoints: [
        'Trust your instincts built from experience',
        'Recognize patterns quickly',
        'Don\'t overthink simple decisions',
        'Balance speed with accuracy'
      ],
      examples: [
        {
          scenario: 'Emergency situation',
          explanation: 'Rapid assessment based on pattern recognition and prior experience guides immediate action.'
        },
        {
          scenario: 'Simple daily choices',
          explanation: 'What to eat, wear, or do next - intuition handles routine decisions efficiently.'
        }
      ],
      tips: [
        'Build experience in your domain',
        'Practice making quick decisions on low-stakes items',
        'Notice patterns in outcomes',
        'Trust your gut on familiar situations'
      ],
      summary: 'Intuitive decision making enables fast, effective choices by leveraging experience and pattern recognition.'
    },
    exercises: [
      {
        id: 'decision-ex-1',
        type: 'multiple_choice',
        question: 'When should you rely on intuitive decision making?',
        options: [
          'Complex, unfamiliar problems',
          'Familiar situations with time pressure',
          'High-stakes strategic planning',
          'When you have unlimited time'
        ],
        correctAnswer: 1,
        explanation: 'Intuition works best in familiar domains where you need to decide quickly.',
        timeLimit: 10,
        points: 20
      }
    ],
    xpReward: 85,
    skillPoints: [
      { skill: 'intuitive_decision', points: 30 }
    ]
  },
  {
    id: 'memory-techniques',
    title: 'Memory Enhancement Strategies',
    category: 'memory',
    difficulty: 'beginner',
    estimatedTime: 6,
    description: 'Learn proven techniques to improve memory retention and recall.',
    content: {
      introduction: 'Memory techniques transform how you encode, store, and retrieve information.',
      keyPoints: [
        'Chunking breaks information into memorable groups',
        'Mnemonics create memorable associations',
        'Spaced repetition strengthens long-term memory',
        'Active recall beats passive review'
      ],
      examples: [
        {
          scenario: 'Remembering a phone number',
          explanation: 'Chunk digits into groups: 024-555-1234 is easier than 0245551234.'
        },
        {
          scenario: 'Learning vocabulary',
          explanation: 'Use spaced repetition: review after 1 day, 3 days, 1 week, 2 weeks, 1 month.'
        }
      ],
      tips: [
        'Create vivid mental images',
        'Link new information to what you know',
        'Test yourself regularly',
        'Sleep consolidates memories'
      ],
      summary: 'Memory techniques leverage how your brain naturally encodes information for better retention.'
    },
    exercises: [
      {
        id: 'memory-ex-1',
        type: 'practice',
        question: 'Memorize this list using chunking: Apple, Banana, Carrot, Dog, Elephant, Flower, Guitar, House, Ice cream',
        explanation: 'Group by category: Fruits (Apple, Banana), Nature (Carrot, Flower), Animals (Dog, Elephant), Objects (Guitar, House, Ice cream).',
        points: 15
      }
    ],
    xpReward: 60,
    skillPoints: [
      { skill: 'memory', points: 25 }
    ]
  },
  {
    id: 'attention-focus',
    title: 'Attention & Focus Mastery',
    category: 'attention',
    difficulty: 'intermediate',
    estimatedTime: 7,
    description: 'Develop laser-sharp focus and sustained attention in distracting environments.',
    content: {
      introduction: 'Attention is the gateway to learning - master it to maximize your cognitive potential.',
      keyPoints: [
        'Single-tasking beats multitasking for deep work',
        'Pomodoro Technique manages attention cycles',
        'Environment design reduces distractions',
        'Mindfulness strengthens attention control'
      ],
      examples: [
        {
          scenario: 'Studying complex material',
          explanation: '25 minutes of focused work, 5-minute break - the Pomodoro rhythm matches natural attention spans.'
        },
        {
          scenario: 'Open office work',
          explanation: 'Noise-canceling headphones, "do not disturb" signals, and scheduled focus blocks protect attention.'
        }
      ],
      tips: [
        'Remove digital distractions before starting',
        'Use timer-based work sessions',
        'Take regular breaks to recharge',
        'Practice meditation to strengthen focus'
      ],
      summary: 'Mastering attention allows you to direct your full cognitive power where it matters most.'
    },
    exercises: [
      {
        id: 'attention-ex-1',
        type: 'practice',
        question: 'Set a 5-minute timer and focus on counting your breaths. Note how many times your mind wanders.',
        explanation: 'Noticing when attention drifts is the first step to controlling it.',
        points: 20
      }
    ],
    unlockRequirement: {
      type: 'lessons_completed',
      value: 3
    },
    xpReward: 90,
    skillPoints: [
      { skill: 'attention', points: 30 }
    ]
  }
];

// Get all lessons
export function getAllLessons(): CognitiveLesson[] {
  return LESSON_LIBRARY;
}

// Get lessons by category
export function getLessonsByCategory(category: CognitiveLesson['category']): CognitiveLesson[] {
  return LESSON_LIBRARY.filter(lesson => lesson.category === category);
}

// Get available lessons for user (unlocked based on progress)
export function getAvailableLessons(userId: string): CognitiveLesson[] {
  const completedLessons = getCompletedLessonIds(userId);
  const userLevel = getUserLevel(userId);

  return LESSON_LIBRARY.filter(lesson => {
    // Check unlock requirements
    if (lesson.unlockRequirement) {
      switch (lesson.unlockRequirement.type) {
        case 'lessons_completed':
          return completedLessons.length >= lesson.unlockRequirement.value;
        case 'level':
          return userLevel >= lesson.unlockRequirement.value;
        default:
          return false;
      }
    }
    // No requirements = always available
    return true;
  });
}

// Get lesson by ID
export function getLesson(lessonId: string): CognitiveLesson | null {
  return LESSON_LIBRARY.find(l => l.id === lessonId) || null;
}

// Start workout session
export function startWorkoutSession(userId: string, lessonId: string): WorkoutSession {
  const session: WorkoutSession = {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    lessonId,
    startedAt: new Date().toISOString(),
    exercises: [],
    score: 0,
    perfectScore: false,
    totalXPEarned: 0
  };

  saveWorkoutSession(session);
  return session;
}

// Submit exercise answer
export function submitExercise(
  sessionId: string,
  exerciseId: string,
  answer: any,
  timeSpent: number
): { correct: boolean; points: number; explanation: string } {
  const sessions = getAllWorkoutSessions();
  const session = sessions.find(s => s.id === sessionId);

  if (!session) {
    throw new Error('Session not found');
  }

  const lesson = getLesson(session.lessonId);
  if (!lesson) {
    throw new Error('Lesson not found');
  }

  const exercise = lesson.exercises.find(e => e.id === exerciseId);
  if (!exercise) {
    throw new Error('Exercise not found');
  }

  let correct = false;

  if (exercise.type === 'multiple_choice' && exercise.correctAnswer !== undefined) {
    correct = answer === exercise.correctAnswer;
  } else {
    // For reflection, scenario, practice - always mark as correct if answered
    correct = answer && answer.toString().length > 0;
  }

  const points = correct ? exercise.points : 0;

  session.exercises.push({
    exerciseId,
    answer,
    correct,
    timeSpent
  });

  session.score += points;

  // Update session
  const updatedSessions = sessions.map(s => s.id === sessionId ? session : s);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));

  return {
    correct,
    points,
    explanation: exercise.explanation
  };
}

// Complete workout session
export function completeWorkoutSession(sessionId: string): WorkoutSession {
  const sessions = getAllWorkoutSessions();
  const session = sessions.find(s => s.id === sessionId);

  if (!session) {
    throw new Error('Session not found');
  }

  const lesson = getLesson(session.lessonId);
  if (!lesson) {
    throw new Error('Lesson not found');
  }

  session.completedAt = new Date().toISOString();

  const totalPossiblePoints = lesson.exercises.reduce((sum, ex) => sum + ex.points, 0);
  session.perfectScore = session.score === totalPossiblePoints;
  session.totalXPEarned = lesson.xpReward + (session.perfectScore ? lesson.xpReward * 0.5 : 0);

  // Update session
  const updatedSessions = sessions.map(s => s.id === sessionId ? session : s);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));

  // Update streak
  updateWorkoutStreak(session.userId);

  return session;
}

// Get workout sessions
function getAllWorkoutSessions(): WorkoutSession[] {
  const data = localStorage.getItem(SESSIONS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveWorkoutSession(session: WorkoutSession): void {
  const sessions = getAllWorkoutSessions();
  sessions.push(session);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function getUserWorkoutSessions(userId: string): WorkoutSession[] {
  return getAllWorkoutSessions().filter(s => s.userId === userId);
}

export function getCompletedLessonIds(userId: string): string[] {
  const sessions = getUserWorkoutSessions(userId);
  const completedSessions = sessions.filter(s => s.completedAt);
  return Array.from(new Set(completedSessions.map(s => s.lessonId)));
}

// Streak management
export function getWorkoutStreak(userId: string): StreakData {
  const data = localStorage.getItem(STREAK_KEY);
  const allStreaks: Record<string, StreakData> = data ? JSON.parse(data) : {};

  return allStreaks[userId] || {
    currentStreak: 0,
    longestStreak: 0,
    lastWorkoutDate: '',
    milestones: [
      { days: 7, reward: 'Week Warrior Badge', claimed: false },
      { days: 30, reward: 'Monthly Master Badge', claimed: false },
      { days: 100, reward: 'Century Champion Badge', claimed: false }
    ]
  };
}

function updateWorkoutStreak(userId: string): void {
  const data = localStorage.getItem(STREAK_KEY);
  const allStreaks: Record<string, StreakData> = data ? JSON.parse(data) : {};

  const today = new Date().toISOString().split('T')[0];
  const streak = allStreaks[userId] || {
    currentStreak: 0,
    longestStreak: 0,
    lastWorkoutDate: '',
    milestones: [
      { days: 7, reward: 'Week Warrior Badge', claimed: false },
      { days: 30, reward: 'Monthly Master Badge', claimed: false },
      { days: 100, reward: 'Century Champion Badge', claimed: false }
    ]
  };

  const lastDate = streak.lastWorkoutDate ? new Date(streak.lastWorkoutDate) : null;
  const todayDate = new Date(today);

  if (!lastDate) {
    // First workout
    streak.currentStreak = 1;
  } else {
    const daysSince = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSince === 1) {
      // Consecutive day
      streak.currentStreak++;
    } else if (daysSince === 0) {
      // Same day, no change
      return;
    } else {
      // Streak broken
      streak.currentStreak = 1;
    }
  }

  streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
  streak.lastWorkoutDate = today;

  allStreaks[userId] = streak;
  localStorage.setItem(STREAK_KEY, JSON.stringify(allStreaks));
}

// Helper functions
function getUserLevel(userId: string): number {
  // TODO: Get from gamification or profile system
  return 1;
}

// Generate daily workout
export function generateDailyWorkout(userId: string): DailyWorkout {
  const completedLessons = getCompletedLessonIds(userId);
  const availableLessons = getAvailableLessons(userId);

  // Recommend 3 lessons: 1 new, 2 review
  const newLessons = availableLessons.filter(l => !completedLessons.includes(l.id));
  const reviewLessons = availableLessons.filter(l => completedLessons.includes(l.id));

  const recommended: string[] = [];

  if (newLessons.length > 0) {
    recommended.push(newLessons[0].id);
  }

  if (reviewLessons.length > 0) {
    recommended.push(reviewLessons[0].id);
  }

  if (recommended.length < 3 && newLessons.length > 1) {
    recommended.push(newLessons[1].id);
  }

  const today = new Date().toISOString().split('T')[0];
  const dayOfWeek = new Date().getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  return {
    date: today,
    lessons: recommended,
    challenge: generateDailyChallenge(),
    bonusMultiplier: isWeekend ? 1.5 : 1.0,
    completed: false
  };
}

function generateDailyChallenge(): DailyCognitiveChallenge {
  return {
    id: `challenge_${Date.now()}`,
    title: 'Quick Cognitive Sprint',
    description: 'Complete 3 exercises in under 2 minutes!',
    type: 'speed',
    exercises: [
      {
        id: 'challenge-1',
        type: 'multiple_choice',
        question: 'Which is faster for familiar tasks?',
        options: ['Analytical thinking', 'Intuitive thinking'],
        correctAnswer: 1,
        explanation: 'Intuition uses pattern recognition for fast decisions in familiar contexts.',
        points: 10
      },
      {
        id: 'challenge-2',
        type: 'multiple_choice',
        question: 'Best way to chunk a 10-digit phone number?',
        options: ['1-2-3-4', '3-3-4', '10 individual digits', '5-5'],
        correctAnswer: 1,
        explanation: '3-3-4 (e.g., 555-123-4567) matches natural chunking patterns.',
        points: 10
      }
    ],
    timeLimit: 120,
    targetScore: 20,
    rewards: {
      xp: 50,
      badge: 'Speed Demon',
      unlocks: ['creative-problem-solving']
    }
  };
}
