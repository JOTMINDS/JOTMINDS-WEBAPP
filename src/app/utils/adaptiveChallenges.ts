/**
 * Adaptive Cognitive Challenges
 * Dynamic difficulty adjustment based on user performance
 */

export interface AdaptiveChallenge {
  id: string;
  userId: string;
  challengeType: 'speed' | 'accuracy' | 'endurance' | 'creativity' | 'logic';
  difficulty: number; // 1-10 scale
  exercises: AdaptiveExercise[];
  createdAt: string;
  completedAt?: string;
  performance: ChallengePerformance;
}

export interface AdaptiveExercise {
  id: string;
  type: 'pattern' | 'sequence' | 'logic' | 'memory' | 'spatial' | 'verbal';
  difficulty: number;
  question: string;
  options?: string[];
  correctAnswer: any;
  timeLimit: number;
  adaptiveHints?: string[];
}

export interface ChallengePerformance {
  score: number;
  accuracy: number; // 0-100%
  averageResponseTime: number; // in seconds
  consistencyScore: number; // 0-100%
  difficultyRating: 'too_easy' | 'just_right' | 'too_hard';
  recommendedNextDifficulty: number;
}

export interface UserChallengeProfile {
  userId: string;
  currentDifficulty: {
    speed: number;
    accuracy: number;
    endurance: number;
    creativity: number;
    logic: number;
  };
  performanceHistory: {
    challengeId: string;
    difficulty: number;
    performance: ChallengePerformance;
    timestamp: string;
  }[];
  adaptationRate: number; // How quickly difficulty adjusts (0.1 - 0.5)
  preferences: {
    preferredTypes: string[];
    avoidTypes: string[];
  };
}

export interface UnlockableLevel {
  id: string;
  level: number;
  name: string;
  description: string;
  requirement: {
    type: 'challenges_completed' | 'difficulty_reached' | 'accuracy_threshold' | 'streak';
    value: number;
  };
  rewards: {
    xp: number;
    badges: string[];
    unlockedChallenges: string[];
  };
  unlocked: boolean;
}

const STORAGE_KEY = 'jotminds_adaptive_challenges';
const PROFILE_KEY = 'jotminds_challenge_profile';
const LEVELS_KEY = 'jotminds_unlockable_levels';

// Challenge generation based on difficulty
export function generateAdaptiveChallenge(
  userId: string,
  challengeType: AdaptiveChallenge['challengeType']
): AdaptiveChallenge {
  const profile = getUserChallengeProfile(userId);
  const difficulty = profile.currentDifficulty[challengeType];

  const challenge: AdaptiveChallenge = {
    id: `adaptive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    challengeType,
    difficulty,
    exercises: generateExercisesForDifficulty(challengeType, difficulty),
    createdAt: new Date().toISOString(),
    performance: {
      score: 0,
      accuracy: 0,
      averageResponseTime: 0,
      consistencyScore: 0,
      difficultyRating: 'just_right',
      recommendedNextDifficulty: difficulty
    }
  };

  saveChallenge(challenge);
  return challenge;
}

function generateExercisesForDifficulty(
  type: AdaptiveChallenge['challengeType'],
  difficulty: number
): AdaptiveExercise[] {
  const exercises: AdaptiveExercise[] = [];

  switch (type) {
    case 'speed':
      exercises.push(...generateSpeedExercises(difficulty));
      break;
    case 'accuracy':
      exercises.push(...generateAccuracyExercises(difficulty));
      break;
    case 'logic':
      exercises.push(...generateLogicExercises(difficulty));
      break;
    case 'memory':
      exercises.push(...generateMemoryExercises(difficulty));
      break;
    default:
      exercises.push(...generateMixedExercises(difficulty));
  }

  return exercises;
}

function generateSpeedExercises(difficulty: number): AdaptiveExercise[] {
  const timeLimit = Math.max(5, 30 - difficulty * 2);

  return [
    {
      id: `speed_${Date.now()}_1`,
      type: 'pattern',
      difficulty,
      question: 'What comes next in the sequence: 2, 4, 8, 16, __?',
      options: ['24', '32', '20', '28'],
      correctAnswer: '32',
      timeLimit,
      adaptiveHints: [
        'Look for a pattern',
        'Try doubling each number'
      ]
    },
    {
      id: `speed_${Date.now()}_2`,
      type: 'logic',
      difficulty,
      question: 'If A > B and B > C, then:',
      options: ['A < C', 'A > C', 'A = C', 'Cannot determine'],
      correctAnswer: 'A > C',
      timeLimit,
      adaptiveHints: ['Use transitive property']
    }
  ];
}

function generateAccuracyExercises(difficulty: number): AdaptiveExercise[] {
  return [
    {
      id: `accuracy_${Date.now()}_1`,
      type: 'spatial',
      difficulty,
      question: 'How many triangles are in this shape? [Imagine a complex geometric figure]',
      options: ['5', '7', '9', '11'],
      correctAnswer: '9',
      timeLimit: 60,
      adaptiveHints: [
        'Count small triangles first',
        'Then count overlapping triangles'
      ]
    }
  ];
}

function generateLogicExercises(difficulty: number): AdaptiveExercise[] {
  return [
    {
      id: `logic_${Date.now()}_1`,
      type: 'logic',
      difficulty,
      question: 'All roses are flowers. Some flowers fade quickly. Therefore:',
      options: [
        'All roses fade quickly',
        'Some roses fade quickly',
        'No roses fade quickly',
        'Cannot be determined'
      ],
      correctAnswer: 'Cannot be determined',
      timeLimit: 45,
      adaptiveHints: [
        'Check if the conclusion logically follows',
        'Some ≠ All'
      ]
    }
  ];
}

function generateMemoryExercises(difficulty: number): AdaptiveExercise[] {
  const itemCount = Math.min(3 + difficulty, 12);

  return [
    {
      id: `memory_${Date.now()}_1`,
      type: 'memory',
      difficulty,
      question: `Memorize these ${itemCount} items (you'll have 10 seconds): Apple, Dog, Blue, 7, Tree, Car...`,
      correctAnswer: ['Apple', 'Dog', 'Blue', '7', 'Tree', 'Car'],
      timeLimit: 10 + difficulty * 2
    }
  ];
}

function generateMixedExercises(difficulty: number): AdaptiveExercise[] {
  return [
    ...generateSpeedExercises(difficulty).slice(0, 1),
    ...generateLogicExercises(difficulty).slice(0, 1)
  ];
}

// Complete challenge and calculate performance
export function completeAdaptiveChallenge(
  challengeId: string,
  results: {
    exerciseId: string;
    correct: boolean;
    timeSpent: number;
  }[]
): ChallengePerformance {
  const challenges = getAllChallenges();
  const challenge = challenges.find(c => c.id === challengeId);

  if (!challenge) {
    throw new Error('Challenge not found');
  }

  const totalExercises = challenge.exercises.length;
  const correctCount = results.filter(r => r.correct).length;
  const accuracy = (correctCount / totalExercises) * 100;

  const times = results.map(r => r.timeSpent);
  const averageResponseTime = times.reduce((sum, t) => sum + t, 0) / times.length;

  // Calculate consistency (lower std deviation = more consistent)
  const mean = averageResponseTime;
  const variance = times.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / times.length;
  const stdDev = Math.sqrt(variance);
  const consistencyScore = Math.max(0, 100 - (stdDev / mean) * 100);

  // Determine difficulty rating
  let difficultyRating: ChallengePerformance['difficultyRating'];
  if (accuracy >= 90 && averageResponseTime < challenge.exercises[0].timeLimit * 0.5) {
    difficultyRating = 'too_easy';
  } else if (accuracy < 60 || averageResponseTime > challenge.exercises[0].timeLimit * 0.9) {
    difficultyRating = 'too_hard';
  } else {
    difficultyRating = 'just_right';
  }

  // Calculate recommended next difficulty
  let recommendedNextDifficulty = challenge.difficulty;
  if (difficultyRating === 'too_easy') {
    recommendedNextDifficulty = Math.min(10, challenge.difficulty + 1);
  } else if (difficultyRating === 'too_hard') {
    recommendedNextDifficulty = Math.max(1, challenge.difficulty - 1);
  }

  const performance: ChallengePerformance = {
    score: correctCount * 10,
    accuracy,
    averageResponseTime,
    consistencyScore,
    difficultyRating,
    recommendedNextDifficulty
  };

  challenge.completedAt = new Date().toISOString();
  challenge.performance = performance;

  // Update challenge
  const updatedChallenges = challenges.map(c => c.id === challengeId ? challenge : c);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChallenges));

  // Update user profile
  updateUserChallengeProfile(challenge.userId, challenge.challengeType, performance);

  return performance;
}

// User challenge profile management
export function getUserChallengeProfile(userId: string): UserChallengeProfile {
  const data = localStorage.getItem(PROFILE_KEY);
  const allProfiles: Record<string, UserChallengeProfile> = data ? JSON.parse(data) : {};

  return allProfiles[userId] || {
    userId,
    currentDifficulty: {
      speed: 3,
      accuracy: 3,
      endurance: 3,
      creativity: 3,
      logic: 3
    },
    performanceHistory: [],
    adaptationRate: 0.3,
    preferences: {
      preferredTypes: [],
      avoidTypes: []
    }
  };
}

function updateUserChallengeProfile(
  userId: string,
  challengeType: AdaptiveChallenge['challengeType'],
  performance: ChallengePerformance
): void {
  const data = localStorage.getItem(PROFILE_KEY);
  const allProfiles: Record<string, UserChallengeProfile> = data ? JSON.parse(data) : {};

  const profile = allProfiles[userId] || getUserChallengeProfile(userId);

  // Update difficulty with adaptive rate
  const currentDiff = profile.currentDifficulty[challengeType];
  const recommendedDiff = performance.recommendedNextDifficulty;
  const adaptationRate = profile.adaptationRate;

  profile.currentDifficulty[challengeType] = Math.round(
    currentDiff + (recommendedDiff - currentDiff) * adaptationRate
  );

  // Add to history
  profile.performanceHistory.push({
    challengeId: `challenge_${Date.now()}`,
    difficulty: currentDiff,
    performance,
    timestamp: new Date().toISOString()
  });

  // Keep only last 50 performances
  if (profile.performanceHistory.length > 50) {
    profile.performanceHistory = profile.performanceHistory.slice(-50);
  }

  allProfiles[userId] = profile;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(allProfiles));
}

// Unlockable levels
const UNLOCKABLE_LEVELS: UnlockableLevel[] = [
  {
    id: 'level-1',
    level: 1,
    name: 'Cognitive Explorer',
    description: 'Begin your cognitive journey',
    requirement: { type: 'challenges_completed', value: 1 },
    rewards: { xp: 100, badges: ['Explorer'], unlockedChallenges: [] },
    unlocked: true
  },
  {
    id: 'level-2',
    level: 2,
    name: 'Mental Athlete',
    description: 'Complete 10 challenges',
    requirement: { type: 'challenges_completed', value: 10 },
    rewards: { xp: 250, badges: ['Athlete'], unlockedChallenges: ['advanced-logic'] },
    unlocked: false
  },
  {
    id: 'level-3',
    level: 3,
    name: 'Cognitive Master',
    description: 'Reach difficulty 7 in any challenge type',
    requirement: { type: 'difficulty_reached', value: 7 },
    rewards: { xp: 500, badges: ['Master'], unlockedChallenges: ['expert-speed', 'expert-accuracy'] },
    unlocked: false
  },
  {
    id: 'level-4',
    level: 4,
    name: 'Accuracy Expert',
    description: 'Maintain 90% accuracy over 20 challenges',
    requirement: { type: 'accuracy_threshold', value: 90 },
    rewards: { xp: 750, badges: ['Precision Master'], unlockedChallenges: ['precision-challenges'] },
    unlocked: false
  },
  {
    id: 'level-5',
    level: 5,
    name: 'Streak Champion',
    description: 'Complete challenges for 30 consecutive days',
    requirement: { type: 'streak', value: 30 },
    rewards: { xp: 1000, badges: ['Unstoppable'], unlockedChallenges: ['elite-challenges'] },
    unlocked: false
  }
];

import { getGamificationProfile } from './gamification';

export function getUnlockableLevels(userId: string): UnlockableLevel[] {
  const challenges = getUserChallenges(userId);
  const completedCount = challenges.filter(c => c.completedAt).length;
  const profile = getUserChallengeProfile(userId);

  const maxDifficulty = Math.max(...Object.values(profile.currentDifficulty));

  const recentChallenges = profile.performanceHistory.slice(-20);
  const averageAccuracy = recentChallenges.length > 0
    ? recentChallenges.reduce((sum, p) => sum + p.performance.accuracy, 0) / recentChallenges.length
    : 0;

  const gamificationProfile = getGamificationProfile(userId);
  const streak = gamificationProfile.currentStreak || 0;

  return UNLOCKABLE_LEVELS.map(level => {
    let unlocked = level.unlocked;

    switch (level.requirement.type) {
      case 'challenges_completed':
        unlocked = completedCount >= level.requirement.value;
        break;
      case 'difficulty_reached':
        unlocked = maxDifficulty >= level.requirement.value;
        break;
      case 'accuracy_threshold':
        unlocked = averageAccuracy >= level.requirement.value;
        break;
      case 'streak':
        unlocked = streak >= level.requirement.value;
        break;
    }

    return { ...level, unlocked };
  });
}

// Helper functions
function getAllChallenges(): AdaptiveChallenge[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveChallenge(challenge: AdaptiveChallenge): void {
  const challenges = getAllChallenges();
  challenges.push(challenge);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
}

export function getUserChallenges(userId: string): AdaptiveChallenge[] {
  return getAllChallenges().filter(c => c.userId === userId);
}

export function getActiveChallenge(userId: string): AdaptiveChallenge | null {
  const challenges = getUserChallenges(userId);
  return challenges.find(c => !c.completedAt) || null;
}
