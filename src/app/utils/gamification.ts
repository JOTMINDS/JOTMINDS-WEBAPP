// JotMinds Gamification System - Ages 11-14
// Features: Badges, Levels, Weekly Challenges, XP Streak Insurance

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
  progress?: number;
  requirement: number;
}

export interface Level {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  rewards: string[];
  color: string;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'streak' | 'assessments' | 'brain-gym' | 'total-xp';
  target: number;
  reward: number;
  icon: string;
  progress: number;
  completed: boolean;
  expiresAt: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'assessment' | 'brain-gym' | 'profile' | 'career' | 'skill-plan' | 'login';
  target: number;
  reward: number;
  icon: string;
  progress: number;
  completed: boolean;
  expiresAt: string; // Midnight of next day
}

export interface StreakInsurance {
  available: number;
  total: number;
  lastUsed?: string;
}

export interface GamificationProfile {
  userId: string;
  xp: number;
  level: number;
  badges: Badge[];
  weekChallenges: WeeklyChallenge[];
  dailyChallenges: DailyChallenge[];
  streakInsurance: StreakInsurance;
  themesUnlocked: string[];
  totalAssessments: number;
  totalBrainGymChallenges: number;
  totalSkillPlans: number;
  profileViewedEvolution: boolean;
  profileShared: boolean;
  careerExplorationsCount: number;
  careerFavoritesCount: number;
  longestStreak: number;
  updatedAt: string;
  createdAt?: string; // Account creation date
  weeklyChallengesCompleted?: number; // Total weekly challenges completed
  dailyChallengesCompleted?: number; // Total daily challenges completed
  profileShareCount?: number; // Number of times profile has been shared
  currentStreak?: number; // Current active streak
  lastActiveDate?: string; // Last date user was active
}

export interface GamificationReward {
  xpEarned: number;
  newBadges: Badge[];
  leveledUp: boolean;
  newLevel?: number;
  levelTitle?: string;
  message: string;
}

// Badge Definitions
export const BADGE_LIBRARY: Omit<Badge, 'unlockedAt' | 'progress'>[] = [
  // Streak Badges
  {
    id: 'streak_3',
    name: 'Getting Started',
    description: 'Complete a 3-day streak',
    icon: '🔥',
    rarity: 'common',
    requirement: 3
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Complete a 7-day streak',
    icon: '⚡',
    rarity: 'rare',
    requirement: 7
  },
  {
    id: 'streak_14',
    name: 'Fortnight Fighter',
    description: 'Complete a 14-day streak',
    icon: '💎',
    rarity: 'epic',
    requirement: 14
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Complete a 30-day streak',
    icon: '👑',
    rarity: 'legendary',
    requirement: 30
  },
  
  // Assessment Badges
  {
    id: 'assessments_1',
    name: 'Self-Discoverer',
    description: 'Complete your first assessment',
    icon: '🌱',
    rarity: 'common',
    requirement: 1
  },
  {
    id: 'assessments_3',
    name: 'Profile Builder',
    description: 'Complete 3 assessments',
    icon: '🧩',
    rarity: 'rare',
    requirement: 3
  },
  {
    id: 'assessments_5',
    name: 'Mind Mapper',
    description: 'Complete 5 assessments',
    icon: '🧠',
    rarity: 'epic',
    requirement: 5
  },
  
  // Brain Gym Badges
  {
    id: 'brain_gym_10',
    name: 'Mental Athlete',
    description: 'Complete 10 Brain Gym challenges',
    icon: '💪',
    rarity: 'common',
    requirement: 10
  },
  {
    id: 'brain_gym_25',
    name: 'Cognitive Champion',
    description: 'Complete 25 Brain Gym challenges',
    icon: '🏅',
    rarity: 'rare',
    requirement: 25
  },
  {
    id: 'brain_gym_50',
    name: 'Brain Gym Legend',
    description: 'Complete 50 Brain Gym challenges',
    icon: '🏆',
    rarity: 'legendary',
    requirement: 50
  },
  
  // XP Badges
  {
    id: 'xp_500',
    name: 'Rising Star',
    description: 'Earn 500 XP',
    icon: '⭐',
    rarity: 'common',
    requirement: 500
  },
  {
    id: 'xp_1000',
    name: 'Shining Star',
    description: 'Earn 1,000 XP',
    icon: '🌟',
    rarity: 'rare',
    requirement: 1000
  },
  {
    id: 'xp_2500',
    name: 'Super Star',
    description: 'Earn 2,500 XP',
    icon: '💫',
    rarity: 'epic',
    requirement: 2500
  },
  {
    id: 'xp_5000',
    name: 'Mega Star',
    description: 'Earn 5,000 XP',
    icon: '✨',
    rarity: 'legendary',
    requirement: 5000
  },

  // Cognitive Profile Badges
  {
    id: 'profile_complete',
    name: 'Self-Aware',
    description: 'Complete your full cognitive profile (100%)',
    icon: '🧠',
    rarity: 'rare',
    requirement: 100
  },
  {
    id: 'profile_evolution_1',
    name: 'Growth Tracker',
    description: 'View your profile evolution for the first time',
    icon: '📈',
    rarity: 'common',
    requirement: 1
  },
  {
    id: 'profile_shared',
    name: 'Profile Pioneer',
    description: 'Share your cognitive profile',
    icon: '🔗',
    rarity: 'common',
    requirement: 1
  },

  // Skill Builder Badges
  {
    id: 'skill_plan_1',
    name: 'Skill Seeker',
    description: 'Complete your first skill plan',
    icon: '🎯',
    rarity: 'common',
    requirement: 1
  },
  {
    id: 'skill_plan_3',
    name: 'Skill Developer',
    description: 'Complete 3 skill plans',
    icon: '🚀',
    rarity: 'rare',
    requirement: 3
  },
  {
    id: 'skill_plan_7',
    name: 'Skill Master',
    description: 'Complete 7 skill plans',
    icon: '🎓',
    rarity: 'epic',
    requirement: 7
  },

  // Career Exploration Badges
  {
    id: 'career_explorer',
    name: 'Career Explorer',
    description: 'Explore your first career recommendation',
    icon: '💼',
    rarity: 'common',
    requirement: 1
  },
  {
    id: 'career_favorites_5',
    name: 'Career Collector',
    description: 'Favorite 5 different careers',
    icon: '⭐',
    rarity: 'rare',
    requirement: 5
  },
  {
    id: 'career_favorites_10',
    name: 'Career Enthusiast',
    description: 'Favorite 10 different careers',
    icon: '🌟',
    rarity: 'epic',
    requirement: 10
  },
  {
    id: 'career_favorites_20',
    name: 'Career Visionary',
    description: 'Favorite 20 different careers',
    icon: '🚀',
    rarity: 'legendary',
    requirement: 20
  },

  // Extended Streak Badges
  {
    id: 'streak_60',
    name: 'Two Month Master',
    description: 'Complete a 60-day streak',
    icon: '🏅',
    rarity: 'legendary',
    requirement: 60
  },
  {
    id: 'streak_100',
    name: 'Century Achiever',
    description: 'Complete a 100-day streak',
    icon: '💯',
    rarity: 'legendary',
    requirement: 100
  },
  {
    id: 'streak_365',
    name: 'Year Champion',
    description: 'Complete a 365-day streak',
    icon: '🎊',
    rarity: 'legendary',
    requirement: 365
  },

  // Assessment Mastery Badges
  {
    id: 'assessments_10',
    name: 'Assessment Pro',
    description: 'Complete 10 assessments',
    icon: '🎯',
    rarity: 'epic',
    requirement: 10
  },
  {
    id: 'assessments_20',
    name: 'Self-Discovery Master',
    description: 'Complete 20 assessments',
    icon: '🏆',
    rarity: 'legendary',
    requirement: 20
  },
  {
    id: 'assessments_perfect_score',
    name: 'Perfectionist',
    description: 'Score 100% on any assessment',
    icon: '💎',
    rarity: 'epic',
    requirement: 1
  },

  // Brain Gym Extended
  {
    id: 'brain_gym_100',
    name: 'Mental Marathon',
    description: 'Complete 100 Brain Gym challenges',
    icon: '🧠',
    rarity: 'legendary',
    requirement: 100
  },
  {
    id: 'brain_gym_250',
    name: 'Brain Gym Elite',
    description: 'Complete 250 Brain Gym challenges',
    icon: '👑',
    rarity: 'legendary',
    requirement: 250
  },
  {
    id: 'brain_gym_streak_7',
    name: 'Daily Brain Trainer',
    description: 'Complete Brain Gym challenges 7 days in a row',
    icon: '🧩',
    rarity: 'rare',
    requirement: 7
  },

  // XP Extended
  {
    id: 'xp_10000',
    name: 'XP Legend',
    description: 'Earn 10,000 XP',
    icon: '🌠',
    rarity: 'legendary',
    requirement: 10000
  },
  {
    id: 'xp_25000',
    name: 'XP Titan',
    description: 'Earn 25,000 XP',
    icon: '⚡',
    rarity: 'legendary',
    requirement: 25000
  },
  {
    id: 'xp_day_500',
    name: 'Daily Grinder',
    description: 'Earn 500 XP in a single day',
    icon: '📅',
    rarity: 'rare',
    requirement: 500
  },
  {
    id: 'xp_day_1000',
    name: 'Super Grinder',
    description: 'Earn 1,000 XP in a single day',
    icon: '💪',
    rarity: 'epic',
    requirement: 1000
  },

  // Skill Plan Extended
  {
    id: 'skill_plan_14',
    name: 'Skill Champion',
    description: 'Complete 14 skill plans',
    icon: '🌟',
    rarity: 'legendary',
    requirement: 14
  },
  {
    id: 'skill_plan_30',
    name: 'Skill Legend',
    description: 'Complete 30 skill plans',
    icon: '🏅',
    rarity: 'legendary',
    requirement: 30
  },
  {
    id: 'skill_plan_perfect',
    name: 'Flawless Growth',
    description: 'Complete a skill plan without missing a day',
    icon: '✨',
    rarity: 'epic',
    requirement: 1
  },

  // Social & Sharing Badges
  {
    id: 'profile_shared_5',
    name: 'Profile Ambassador',
    description: 'Share your profile 5 times',
    icon: '📢',
    rarity: 'rare',
    requirement: 5
  },
  {
    id: 'weekly_challenges_1',
    name: 'Challenge Starter',
    description: 'Complete your first weekly challenge',
    icon: '🎯',
    rarity: 'common',
    requirement: 1
  },
  {
    id: 'weekly_challenges_5',
    name: 'Challenge Warrior',
    description: 'Complete 5 weekly challenges',
    icon: '⚔️',
    rarity: 'rare',
    requirement: 5
  },
  {
    id: 'weekly_challenges_10',
    name: 'Challenge Master',
    description: 'Complete 10 weekly challenges',
    icon: '🛡️',
    rarity: 'epic',
    requirement: 10
  },
  {
    id: 'weekly_challenges_25',
    name: 'Challenge Legend',
    description: 'Complete 25 weekly challenges',
    icon: '👑',
    rarity: 'legendary',
    requirement: 25
  },

  // Time-Based Badges
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete challenges before 8 AM',
    icon: '🌅',
    rarity: 'rare',
    requirement: 1
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete challenges after 10 PM',
    icon: '🦉',
    rarity: 'rare',
    requirement: 1
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Complete 10 challenges on weekends',
    icon: '🏖️',
    rarity: 'rare',
    requirement: 10
  },

  // Consistency Badges
  {
    id: 'month_1_active',
    name: 'First Month',
    description: 'Active for 1 month',
    icon: '📆',
    rarity: 'common',
    requirement: 30
  },
  {
    id: 'month_3_active',
    name: 'Three Month Veteran',
    description: 'Active for 3 months',
    icon: '🗓️',
    rarity: 'rare',
    requirement: 90
  },
  {
    id: 'month_6_active',
    name: 'Half Year Hero',
    description: 'Active for 6 months',
    icon: '📅',
    rarity: 'epic',
    requirement: 180
  },
  {
    id: 'year_1_active',
    name: 'One Year Anniversary',
    description: 'Active for 1 full year',
    icon: '🎂',
    rarity: 'legendary',
    requirement: 365
  },

  // Cognitive Dimension Badges
  {
    id: 'learning_agility_high',
    name: 'Quick Learner',
    description: 'Score 80+ in Learning Agility',
    icon: '🚀',
    rarity: 'rare',
    requirement: 80
  },
  {
    id: 'analytical_high',
    name: 'Deep Thinker',
    description: 'Score 80+ in Analytical Depth',
    icon: '🔍',
    rarity: 'rare',
    requirement: 80
  },
  {
    id: 'creative_high',
    name: 'Creative Genius',
    description: 'Score 80+ in Creative Capacity',
    icon: '🎨',
    rarity: 'rare',
    requirement: 80
  },
  {
    id: 'practical_high',
    name: 'Action Taker',
    description: 'Score 80+ in Practical Execution',
    icon: '⚙️',
    rarity: 'rare',
    requirement: 80
  },
  {
    id: 'intuitive_high',
    name: 'Intuition Master',
    description: 'Score 80+ in Intuitive Speed',
    icon: '💡',
    rarity: 'rare',
    requirement: 80
  },
  {
    id: 'reflective_high',
    name: 'Deep Reflector',
    description: 'Score 80+ in Reflective Depth',
    icon: '🤔',
    rarity: 'rare',
    requirement: 80
  },
  {
    id: 'all_dimensions_balanced',
    name: 'Balanced Mind',
    description: 'Score 60+ in all cognitive dimensions',
    icon: '⚖️',
    rarity: 'epic',
    requirement: 1
  },
  {
    id: 'all_dimensions_high',
    name: 'Renaissance Mind',
    description: 'Score 80+ in all cognitive dimensions',
    icon: '🌟',
    rarity: 'legendary',
    requirement: 1
  },

  // Speed & Efficiency Badges
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete an assessment in under 5 minutes',
    icon: '⚡',
    rarity: 'rare',
    requirement: 1
  },
  {
    id: 'efficient_learner',
    name: 'Efficient Learner',
    description: 'Complete 3 assessments in one day',
    icon: '🏃',
    rarity: 'epic',
    requirement: 3
  },

  // Comeback & Recovery Badges
  {
    id: 'comeback_kid',
    name: 'Comeback Kid',
    description: 'Return after being inactive for 30 days',
    icon: '🔄',
    rarity: 'rare',
    requirement: 1
  },
  {
    id: 'streak_saver',
    name: 'Streak Saver',
    description: 'Use streak insurance to maintain your streak',
    icon: '🛡️',
    rarity: 'common',
    requirement: 1
  },

  // Exploration Badges
  {
    id: 'feature_explorer',
    name: 'Feature Explorer',
    description: 'Use 5 different features',
    icon: '🧭',
    rarity: 'common',
    requirement: 5
  },
  {
    id: 'dashboard_master',
    name: 'Dashboard Master',
    description: 'View all sections of your dashboard',
    icon: '📊',
    rarity: 'rare',
    requirement: 1
  },

  // Milestone Badges
  {
    id: 'first_week',
    name: 'First Week Complete',
    description: 'Complete your first week on JotMinds',
    icon: '🎉',
    rarity: 'common',
    requirement: 7
  },
  {
    id: 'level_5',
    name: 'Level 5 Achiever',
    description: 'Reach Level 5',
    icon: '5️⃣',
    rarity: 'rare',
    requirement: 5
  },
  {
    id: 'level_10',
    name: 'Level 10 Master',
    description: 'Reach Level 10',
    icon: '🔟',
    rarity: 'epic',
    requirement: 10
  },
  {
    id: 'level_15',
    name: 'Maximum Level',
    description: 'Reach the maximum level (15)',
    icon: '🏆',
    rarity: 'legendary',
    requirement: 15
  },
];

// Level System (15 levels)
export const LEVELS: Level[] = [
  { level: 1, title: 'Curious Beginner', minXP: 0, maxXP: 100, rewards: ['Profile customization'], color: '#94a3b8' },
  { level: 2, title: 'Eager Learner', minXP: 100, maxXP: 250, rewards: ['Ocean theme'], color: '#60a5fa' },
  { level: 3, title: 'Quick Thinker', minXP: 250, maxXP: 450, rewards: ['Streak insurance x1'], color: '#3b82f6' },
  { level: 4, title: 'Mind Explorer', minXP: 450, maxXP: 700, rewards: ['Forest theme'], color: '#10b981' },
  { level: 5, title: 'Pattern Finder', minXP: 700, maxXP: 1000, rewards: ['Streak insurance x2'], color: '#059669' },
  { level: 6, title: 'Problem Solver', minXP: 1000, maxXP: 1400, rewards: ['Sunset theme'], color: '#f59e0b' },
  { level: 7, title: 'Creative Thinker', minXP: 1400, maxXP: 1850, rewards: ['Streak insurance x3'], color: '#d97706' },
  { level: 8, title: 'Sharp Mind', minXP: 1850, maxXP: 2400, rewards: ['Galaxy theme'], color: '#8b5cf6' },
  { level: 9, title: 'Insight Seeker', minXP: 2400, maxXP: 3000, rewards: ['Streak insurance x4'], color: '#7c3aed' },
  { level: 10, title: 'Wisdom Builder', minXP: 3000, maxXP: 3700, rewards: ['Aurora theme'], color: '#ec4899' },
  { level: 11, title: 'Master Learner', minXP: 3700, maxXP: 4500, rewards: ['Streak insurance x5'], color: '#db2777' },
  { level: 12, title: 'Cognitive Expert', minXP: 4500, maxXP: 5400, rewards: ['Neon theme'], color: '#06b6d4' },
  { level: 13, title: 'Mental Olympian', minXP: 5400, maxXP: 6500, rewards: ['Streak insurance x6'], color: '#0891b2' },
  { level: 14, title: 'Mind Master', minXP: 6500, maxXP: 8000, rewards: ['Diamond theme'], color: '#6366f1' },
  { level: 15, title: 'Legendary Thinker', minXP: 8000, maxXP: 10000, rewards: ['All themes unlocked', 'Unlimited streak insurance'], color: '#f59e0b' },
];

// Theme Library
export const THEMES = {
  default: { name: 'Default', unlockLevel: 1, gradient: 'from-cyan-50 via-violet-50 to-indigo-50' },
  ocean: { name: 'Ocean', unlockLevel: 2, gradient: 'from-blue-100 via-cyan-100 to-teal-100' },
  forest: { name: 'Forest', unlockLevel: 4, gradient: 'from-green-100 via-emerald-100 to-teal-100' },
  sunset: { name: 'Sunset', unlockLevel: 6, gradient: 'from-orange-100 via-pink-100 to-purple-100' },
  galaxy: { name: 'Galaxy', unlockLevel: 8, gradient: 'from-purple-100 via-violet-100 to-indigo-100' },
  aurora: { name: 'Aurora', unlockLevel: 10, gradient: 'from-pink-100 via-purple-100 to-blue-100' },
  neon: { name: 'Neon', unlockLevel: 12, gradient: 'from-cyan-100 via-fuchsia-100 to-yellow-100' },
  diamond: { name: 'Diamond', unlockLevel: 14, gradient: 'from-gray-100 via-blue-100 to-purple-100' },
};

const STORAGE_KEY = 'jotminds_gamification';

// Get or create gamification profile
export function getGamificationProfile(userId: string): GamificationProfile {
  const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
  
  if (!stored) {
    const now = new Date().toISOString();
    const newProfile: GamificationProfile = {
      userId,
      xp: 0,
      level: 1,
      badges: [],
      weekChallenges: generateWeeklyChallenges(),
      dailyChallenges: generateDailyChallenges(),
      streakInsurance: { available: 0, total: 0 },
      themesUnlocked: ['default'],
      totalAssessments: 0,
      totalBrainGymChallenges: 0,
      totalSkillPlans: 0,
      profileViewedEvolution: false,
      profileShared: false,
      careerExplorationsCount: 0,
      careerFavoritesCount: 0,
      longestStreak: 0,
      updatedAt: now,
      createdAt: now,
      weeklyChallengesCompleted: 0,
      dailyChallengesCompleted: 0,
      profileShareCount: 0,
      currentStreak: 0,
      lastActiveDate: now,
    };
    saveGamificationProfile(newProfile);
    return newProfile;
  }

  const profile = JSON.parse(stored);

  // Ensure backward compatibility with new fields
  if (!profile.createdAt) profile.createdAt = profile.updatedAt;
  if (profile.weeklyChallengesCompleted === undefined) profile.weeklyChallengesCompleted = 0;
  if (profile.dailyChallengesCompleted === undefined) profile.dailyChallengesCompleted = 0;
  if (profile.profileShareCount === undefined) profile.profileShareCount = 0;
  if (profile.currentStreak === undefined) profile.currentStreak = 0;
  if (!profile.lastActiveDate) profile.lastActiveDate = profile.updatedAt;
  if (!profile.dailyChallenges) profile.dailyChallenges = generateDailyChallenges();
  
  // CRITICAL: Recalculate level from XP to ensure it's always correct
  const correctLevel = LEVELS.findIndex(l => profile.xp < l.maxXP) + 1 || LEVELS.length;
  if (profile.level !== correctLevel) {
    console.log(`[Gamification] Level mismatch detected! Stored: ${profile.level}, Calculated: ${correctLevel}. Fixing...`);
    profile.level = correctLevel;
    saveGamificationProfile(profile);
  }
  
  return profile;
}

import { updateGamificationProfileAPI, getGamificationProfileAPI } from './api';

// Sync gamification profile from the API
export async function syncGamificationProfile(userId: string): Promise<void> {
  try {
    const response = await getGamificationProfileAPI(userId);
    if (response && response.success && response.profile) {
      const serverProfile = response.profile;
      
      // Merge logic: ensure missing fields are populated
      if (!serverProfile.dailyChallenges) serverProfile.dailyChallenges = generateDailyChallenges();
      if (!serverProfile.weekChallenges) serverProfile.weekChallenges = generateWeeklyChallenges();
      
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(serverProfile));
      console.log('[Gamification] Profile synced from server');
    }
  } catch (error) {
    console.error('[Gamification] Failed to sync profile from server', error);
  }
}

// Save gamification profile
export function saveGamificationProfile(profile: GamificationProfile): void {
  profile.updatedAt = new Date().toISOString();
  localStorage.setItem(`${STORAGE_KEY}_${profile.userId}`, JSON.stringify(profile));
  
  // Fire and forget push to backend
  updateGamificationProfileAPI(profile).catch(err => {
    console.error('[Gamification] Failed to push profile to server', err);
  });
}

// Add XP and check for level up
export function addXP(userId: string, amount: number, reason: string): { 
  newXP: number; 
  leveledUp: boolean; 
  newLevel?: number;
  newBadges: Badge[];
  message: string;
} {
  const profile = getGamificationProfile(userId);
  const oldXP = profile.xp;
  const oldLevel = profile.level;
  
  profile.xp += amount;
  
  // Check for level up
  const newLevel = LEVELS.findIndex(l => profile.xp < l.maxXP) + 1 || LEVELS.length;
  const leveledUp = newLevel > oldLevel;
  
  if (leveledUp) {
    profile.level = newLevel;
    
    // Unlock new themes
    Object.entries(THEMES).forEach(([key, theme]) => {
      if (theme.unlockLevel === newLevel && !profile.themesUnlocked.includes(key)) {
        profile.themesUnlocked.push(key);
      }
    });
    
    // Add streak insurance based on level
    const levelInfo = LEVELS[newLevel - 1];
    if (levelInfo.rewards.some(r => r.includes('Streak insurance'))) {
      profile.streakInsurance.available += 1;
      profile.streakInsurance.total += 1;
    }
  }
  
  // Check for new badges
  const newBadges = checkForNewBadges(profile);
  
  saveGamificationProfile(profile);
  
  return {
    newXP: profile.xp,
    leveledUp,
    newLevel: leveledUp ? newLevel : undefined,
    newBadges,
    message: `+${amount} XP for ${reason}!`
  };
}

// Check for newly earned badges
function checkForNewBadges(profile: GamificationProfile): Badge[] {
  const newBadges: Badge[] = [];
  const earnedBadgeIds = profile.badges.map(b => b.id);

  BADGE_LIBRARY.forEach(badge => {
    if (earnedBadgeIds.includes(badge.id)) return;

    let earned = false;

    // Streak badges
    if (badge.id.startsWith('streak_') && profile.longestStreak >= badge.requirement) {
      earned = true;
    }

    // Assessment badges
    if (badge.id.startsWith('assessments_') && !badge.id.includes('perfect') && profile.totalAssessments >= badge.requirement) {
      earned = true;
    }

    // Brain Gym badges
    if (badge.id.startsWith('brain_gym_') && !badge.id.includes('streak') && profile.totalBrainGymChallenges >= badge.requirement) {
      earned = true;
    }

    // XP badges (standard)
    if (badge.id.startsWith('xp_') && !badge.id.includes('day') && profile.xp >= badge.requirement) {
      earned = true;
    }

    // Cognitive profile badges
    if (badge.id === 'profile_complete' && profile.totalAssessments >= 3) {
      earned = true;
    }
    if (badge.id === 'profile_evolution_1' && profile.profileViewedEvolution) {
      earned = true;
    }
    if (badge.id === 'profile_shared' && profile.profileShared) {
      earned = true;
    }

    // Skill builder badges (standard)
    if (badge.id.startsWith('skill_plan_') && !badge.id.includes('perfect') && profile.totalSkillPlans >= badge.requirement) {
      earned = true;
    }

    // Career exploration badges
    if (badge.id === 'career_explorer' && profile.careerExplorationsCount >= badge.requirement) {
      earned = true;
    }
    if (badge.id.startsWith('career_favorites_') && profile.careerFavoritesCount >= badge.requirement) {
      earned = true;
    }

    // Weekly challenge badges
    if (badge.id.startsWith('weekly_challenges_')) {
      const completedChallenges = profile.weekChallenges.filter(c => c.completed).length;
      if (completedChallenges >= badge.requirement) {
        earned = true;
      }
    }

    // Level milestone badges
    if (badge.id.startsWith('level_')) {
      const requiredLevel = parseInt(badge.id.split('_')[1]);
      if (profile.level >= requiredLevel) {
        earned = true;
      }
    }

    // Sharing badges
    if (badge.id === 'profile_shared_5' && (profile.profileShareCount || 0) >= 5) {
      earned = true;
    }

    // Time-based badges
    if (badge.id === 'early_bird') {
      const hour = new Date().getHours();
      if (hour < 8) earned = true;
    }
    if (badge.id === 'night_owl') {
      const hour = new Date().getHours();
      if (hour >= 22 || hour < 4) earned = true;
    }
    if (badge.id === 'weekend_warrior') {
      const day = new Date().getDay();
      if (day === 0 || day === 6) earned = true;
    }

    // Activity duration badges
    if (badge.id.startsWith('month_') && badge.id.includes('_active')) {
      const createdDate = profile.createdAt || profile.updatedAt;
      const accountAge = Math.floor((new Date().getTime() - new Date(createdDate).getTime()) / (1000 * 60 * 60 * 24));
      if (accountAge >= badge.requirement) {
        earned = true;
      }
    }

    // First week badge
    if (badge.id === 'first_week') {
      const createdDate = profile.createdAt || profile.updatedAt;
      const accountAge = Math.floor((new Date().getTime() - new Date(createdDate).getTime()) / (1000 * 60 * 60 * 24));
      if (accountAge >= 7) {
        earned = true;
      }
    }

    // Streak insurance badge
    if (badge.id === 'streak_saver' && profile.streakInsurance.lastUsed) {
      earned = true;
    }

    // Note: Some badges like cognitive dimension scores, speed challenges, etc.
    // will need additional tracking in the profile interface to be fully functional

    if (earned) {
      const earnedBadge: Badge = {
        ...badge,
        unlockedAt: new Date().toISOString(),
        progress: badge.requirement,
      };
      profile.badges.push(earnedBadge);
      newBadges.push(earnedBadge);
    }
  });

  return newBadges;
}

// Generate weekly challenges (resets every Monday)
// Weekly Challenge Pool - randomly select from these each week
const WEEKLY_CHALLENGE_POOL = [
  // Streak Challenges
  {
    id: 'week_streak_3',
    title: 'Mini Streak',
    description: 'Maintain a 3-day streak',
    type: 'streak' as const,
    target: 3,
    reward: 75,
    icon: '🔥'
  },
  {
    id: 'week_streak_5',
    title: 'Consistency Builder',
    description: 'Maintain a 5-day streak',
    type: 'streak' as const,
    target: 5,
    reward: 120,
    icon: '🔥'
  },
  {
    id: 'week_streak_7',
    title: 'Streak Champion',
    description: 'Maintain a 7-day streak',
    type: 'streak' as const,
    target: 7,
    reward: 150,
    icon: '🔥'
  },

  // Assessment Challenges
  {
    id: 'week_assessments_1',
    title: 'Self-Discovery',
    description: 'Complete 1 assessment this week',
    type: 'assessments' as const,
    target: 1,
    reward: 100,
    icon: '🧠'
  },
  {
    id: 'week_assessments_2',
    title: 'Self-Discovery Week',
    description: 'Complete 2 assessments this week',
    type: 'assessments' as const,
    target: 2,
    reward: 200,
    icon: '🧠'
  },
  {
    id: 'week_assessments_3',
    title: 'Assessment Master',
    description: 'Complete 3 assessments this week',
    type: 'assessments' as const,
    target: 3,
    reward: 350,
    icon: '🧠'
  },

  // Brain Gym Challenges
  {
    id: 'week_brain_gym_5',
    title: 'Mental Warm-up',
    description: 'Complete 5 Brain Gym challenges',
    type: 'brain-gym' as const,
    target: 5,
    reward: 125,
    icon: '💪'
  },
  {
    id: 'week_brain_gym_10',
    title: 'Mental Workout',
    description: 'Complete 10 Brain Gym challenges',
    type: 'brain-gym' as const,
    target: 10,
    reward: 250,
    icon: '💪'
  },
  {
    id: 'week_brain_gym_15',
    title: 'Mental Marathon',
    description: 'Complete 15 Brain Gym challenges',
    type: 'brain-gym' as const,
    target: 15,
    reward: 400,
    icon: '💪'
  },
  {
    id: 'week_brain_gym_20',
    title: 'Brain Gym Legend',
    description: 'Complete 20 Brain Gym challenges',
    type: 'brain-gym' as const,
    target: 20,
    reward: 550,
    icon: '💪'
  },

  // XP Challenges
  {
    id: 'week_xp_250',
    title: 'XP Starter',
    description: 'Earn 250 XP this week',
    type: 'total-xp' as const,
    target: 250,
    reward: 75,
    icon: '⭐'
  },
  {
    id: 'week_xp_500',
    title: 'XP Master',
    description: 'Earn 500 XP this week',
    type: 'total-xp' as const,
    target: 500,
    reward: 125,
    icon: '⭐'
  },
  {
    id: 'week_xp_750',
    title: 'XP Champion',
    description: 'Earn 750 XP this week',
    type: 'total-xp' as const,
    target: 750,
    reward: 200,
    icon: '⭐'
  },
  {
    id: 'week_xp_1000',
    title: 'XP Legend',
    description: 'Earn 1,000 XP this week',
    type: 'total-xp' as const,
    target: 1000,
    reward: 300,
    icon: '⭐'
  },
  {
    id: 'week_xp_1500',
    title: 'XP Titan',
    description: 'Earn 1,500 XP this week',
    type: 'total-xp' as const,
    target: 1500,
    reward: 500,
    icon: '⭐'
  },

  // Daily Engagement Challenges
  {
    id: 'week_daily_login_5',
    title: 'Regular Visitor',
    description: 'Log in 5 different days this week',
    type: 'streak' as const,
    target: 5,
    reward: 100,
    icon: '📅'
  },
  {
    id: 'week_daily_login_7',
    title: 'Daily Dedication',
    description: 'Log in every day this week',
    type: 'streak' as const,
    target: 7,
    reward: 175,
    icon: '📅'
  },

  // Skill Plan Challenges
  {
    id: 'week_skill_plan_1',
    title: 'Skill Builder',
    description: 'Complete 1 skill plan day this week',
    type: 'brain-gym' as const,
    target: 1,
    reward: 80,
    icon: '🎯'
  },
  {
    id: 'week_skill_plan_3',
    title: 'Skill Developer',
    description: 'Complete 3 skill plan days this week',
    type: 'brain-gym' as const,
    target: 3,
    reward: 200,
    icon: '🎯'
  },
  {
    id: 'week_skill_plan_5',
    title: 'Skill Enthusiast',
    description: 'Complete 5 skill plan days this week',
    type: 'brain-gym' as const,
    target: 5,
    reward: 350,
    icon: '🎯'
  },
  {
    id: 'week_skill_plan_7',
    title: 'Skill Master',
    description: 'Complete 7 skill plan days this week',
    type: 'brain-gym' as const,
    target: 7,
    reward: 500,
    icon: '🎯'
  },

  // Profile & Career Challenges
  {
    id: 'week_profile_view',
    title: 'Self-Reflection',
    description: 'View your cognitive profile',
    type: 'assessments' as const,
    target: 1,
    reward: 50,
    icon: '🔍'
  },
  {
    id: 'week_career_explore_3',
    title: 'Career Curious',
    description: 'Explore 3 different careers',
    type: 'brain-gym' as const,
    target: 3,
    reward: 100,
    icon: '💼'
  },
  {
    id: 'week_career_explore_5',
    title: 'Career Explorer',
    description: 'Explore 5 different careers',
    type: 'brain-gym' as const,
    target: 5,
    reward: 175,
    icon: '💼'
  },
  {
    id: 'week_career_favorite_3',
    title: 'Career Collector',
    description: 'Favorite 3 careers this week',
    type: 'brain-gym' as const,
    target: 3,
    reward: 125,
    icon: '⭐'
  },

  // Combo Challenges
  {
    id: 'week_combo_variety',
    title: 'All-Rounder',
    description: 'Complete 1 assessment, 5 Brain Gym, and view your profile',
    type: 'total-xp' as const,
    target: 300,
    reward: 250,
    icon: '🌟'
  },
  {
    id: 'week_combo_explorer',
    title: 'Full Explorer',
    description: 'Use all JotMinds features this week',
    type: 'total-xp' as const,
    target: 400,
    reward: 300,
    icon: '🧭'
  },

  // Progress Challenges
  {
    id: 'week_level_up',
    title: 'Level Up',
    description: 'Reach the next level this week',
    type: 'total-xp' as const,
    target: 1,
    reward: 200,
    icon: '⬆️'
  },
  {
    id: 'week_badge_unlock',
    title: 'Badge Hunter',
    description: 'Unlock a new badge this week',
    type: 'brain-gym' as const,
    target: 1,
    reward: 150,
    icon: '🏅'
  },

  // Weekend Challenges
  {
    id: 'week_weekend_warrior',
    title: 'Weekend Warrior',
    description: 'Complete 3 challenges on the weekend',
    type: 'brain-gym' as const,
    target: 3,
    reward: 100,
    icon: '🏖️'
  },

  // Morning/Evening Challenges
  {
    id: 'week_morning_person',
    title: 'Morning Person',
    description: 'Complete challenges before 9 AM on 3 days',
    type: 'brain-gym' as const,
    target: 3,
    reward: 125,
    icon: '🌅'
  },
  {
    id: 'week_night_owl',
    title: 'Night Owl',
    description: 'Complete challenges after 9 PM on 3 days',
    type: 'brain-gym' as const,
    target: 3,
    reward: 125,
    icon: '🌙'
  },

  // Consistency Challenges
  {
    id: 'week_no_skip',
    title: 'Perfect Week',
    description: 'Don\'t skip a single day this week',
    type: 'streak' as const,
    target: 7,
    reward: 200,
    icon: '✅'
  },
  {
    id: 'week_comeback',
    title: 'Strong Comeback',
    description: 'Complete 5 challenges after a break',
    type: 'brain-gym' as const,
    target: 5,
    reward: 150,
    icon: '🔄'
  },

  // Speed Challenges
  {
    id: 'week_quick_learner',
    title: 'Quick Learner',
    description: 'Complete an assessment in under 10 minutes',
    type: 'assessments' as const,
    target: 1,
    reward: 100,
    icon: '⚡'
  },
  {
    id: 'week_speed_demon',
    title: 'Speed Demon',
    description: 'Complete 3 Brain Gym challenges in under 15 minutes',
    type: 'brain-gym' as const,
    target: 3,
    reward: 150,
    icon: '💨'
  },

  // Social Challenges
  {
    id: 'week_share_profile',
    title: 'Show & Tell',
    description: 'Share your profile this week',
    type: 'brain-gym' as const,
    target: 1,
    reward: 100,
    icon: '📢'
  },

  // Reflection Challenges
  {
    id: 'week_view_evolution',
    title: 'Track Your Growth',
    description: 'View your profile evolution',
    type: 'assessments' as const,
    target: 1,
    reward: 75,
    icon: '📊'
  },
  {
    id: 'week_compare_profiles',
    title: 'Past vs Present',
    description: 'Compare your cognitive snapshots',
    type: 'assessments' as const,
    target: 1,
    reward: 100,
    icon: '🔄'
  },
];

export function generateWeeklyChallenges(): WeeklyChallenge[] {
  const nextMonday = getNextMonday();

  // Randomly select 4-6 challenges from the pool
  const numChallenges = 4 + Math.floor(Math.random() * 3); // 4, 5, or 6 challenges
  const shuffled = [...WEEKLY_CHALLENGE_POOL].sort(() => Math.random() - 0.5);
  const selectedChallenges = shuffled.slice(0, numChallenges);

  return selectedChallenges.map(challenge => ({
    ...challenge,
    progress: 0,
    completed: false,
    expiresAt: nextMonday.toISOString(),
  }));
}

// Get next Monday
function getNextMonday(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday;
}

// Get next midnight (for daily challenges)
function getNextMidnight(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

// Daily Challenge Pool - 3 challenges selected each day
const DAILY_CHALLENGE_POOL = [
  // Quick Wins (Easy, Low Effort)
  {
    id: 'daily_login',
    title: 'Good Morning!',
    description: 'Log in to JotMinds today',
    type: 'login' as const,
    target: 1,
    reward: 25,
    icon: '👋'
  },
  {
    id: 'daily_profile_view',
    title: 'Self-Reflection',
    description: 'View your cognitive profile',
    type: 'profile' as const,
    target: 1,
    reward: 30,
    icon: '🔍'
  },
  {
    id: 'daily_dashboard_visit',
    title: 'Dashboard Check',
    description: 'Visit your dashboard',
    type: 'login' as const,
    target: 1,
    reward: 20,
    icon: '📊'
  },

  // Brain Gym Challenges (Medium Effort)
  {
    id: 'daily_brain_gym_1',
    title: 'Quick Workout',
    description: 'Complete 1 Brain Gym challenge',
    type: 'brain-gym' as const,
    target: 1,
    reward: 40,
    icon: '💪'
  },
  {
    id: 'daily_brain_gym_3',
    title: 'Mental Training',
    description: 'Complete 3 Brain Gym challenges',
    type: 'brain-gym' as const,
    target: 3,
    reward: 100,
    icon: '🧠'
  },
  {
    id: 'daily_brain_gym_5',
    title: 'Brain Marathon',
    description: 'Complete 5 Brain Gym challenges',
    type: 'brain-gym' as const,
    target: 5,
    reward: 150,
    icon: '🏃'
  },

  // Assessment Challenges
  {
    id: 'daily_assessment',
    title: 'Know Yourself',
    description: 'Complete 1 assessment today',
    type: 'assessment' as const,
    target: 1,
    reward: 120,
    icon: '📝'
  },
  {
    id: 'daily_retake_assessment',
    title: 'Second Look',
    description: 'Retake an assessment',
    type: 'assessment' as const,
    target: 1,
    reward: 100,
    icon: '🔄'
  },

  // Career Exploration
  {
    id: 'daily_career_explore',
    title: 'Career Curious',
    description: 'Explore 1 career today',
    type: 'career' as const,
    target: 1,
    reward: 35,
    icon: '💼'
  },
  {
    id: 'daily_career_explore_3',
    title: 'Career Scout',
    description: 'Explore 3 different careers',
    type: 'career' as const,
    target: 3,
    reward: 80,
    icon: '🔭'
  },
  {
    id: 'daily_career_favorite',
    title: 'Dream Job',
    description: 'Favorite a career today',
    type: 'career' as const,
    target: 1,
    reward: 40,
    icon: '⭐'
  },

  // Skill Plan Challenges
  {
    id: 'daily_skill_plan',
    title: 'Skill Builder',
    description: 'Complete today\'s skill plan activity',
    type: 'skill-plan' as const,
    target: 1,
    reward: 75,
    icon: '🎯'
  },
  {
    id: 'daily_skill_plan_start',
    title: 'New Journey',
    description: 'Start a new skill plan',
    type: 'skill-plan' as const,
    target: 1,
    reward: 60,
    icon: '🚀'
  },

  // Profile Engagement
  {
    id: 'daily_evolution_view',
    title: 'Track Progress',
    description: 'View your profile evolution',
    type: 'profile' as const,
    target: 1,
    reward: 50,
    icon: '📈'
  },
  {
    id: 'daily_share_profile',
    title: 'Show & Tell',
    description: 'Share your profile today',
    type: 'profile' as const,
    target: 1,
    reward: 65,
    icon: '📢'
  },

  // XP Challenges
  {
    id: 'daily_xp_50',
    title: 'XP Starter',
    description: 'Earn 50 XP today',
    type: 'login' as const,
    target: 50,
    reward: 30,
    icon: '✨'
  },
  {
    id: 'daily_xp_100',
    title: 'XP Hunter',
    description: 'Earn 100 XP today',
    type: 'login' as const,
    target: 100,
    reward: 50,
    icon: '⭐'
  },
  {
    id: 'daily_xp_200',
    title: 'XP Champion',
    description: 'Earn 200 XP today',
    type: 'login' as const,
    target: 200,
    reward: 75,
    icon: '🌟'
  },

  // Time-Based Challenges
  {
    id: 'daily_morning_activity',
    title: 'Early Bird',
    description: 'Complete any activity before 10 AM',
    type: 'login' as const,
    target: 1,
    reward: 45,
    icon: '🌅'
  },
  {
    id: 'daily_evening_activity',
    title: 'Night Owl',
    description: 'Complete any activity after 6 PM',
    type: 'login' as const,
    target: 1,
    reward: 45,
    icon: '🌙'
  },

  // Combo Challenges
  {
    id: 'daily_combo_explore',
    title: 'Full Explorer',
    description: 'Use 3 different features today',
    type: 'login' as const,
    target: 3,
    reward: 90,
    icon: '🧭'
  },
  {
    id: 'daily_combo_complete',
    title: 'Productive Day',
    description: 'Complete 1 Brain Gym + view profile',
    type: 'login' as const,
    target: 2,
    reward: 70,
    icon: '✅'
  },

  // Streak Maintenance
  {
    id: 'daily_maintain_streak',
    title: 'Keep It Going',
    description: 'Maintain your daily streak',
    type: 'login' as const,
    target: 1,
    reward: 35,
    icon: '🔥'
  },

  // Social Challenges
  {
    id: 'daily_help_friend',
    title: 'Team Player',
    description: 'Invite a friend to JotMinds',
    type: 'login' as const,
    target: 1,
    reward: 100,
    icon: '🤝'
  },

  // Learning Challenges
  {
    id: 'daily_learn_feature',
    title: 'Discovery Mode',
    description: 'Try a feature you haven\'t used before',
    type: 'login' as const,
    target: 1,
    reward: 55,
    icon: '🔎'
  },
  {
    id: 'daily_gamification_view',
    title: 'Progress Check',
    description: 'View your badges and achievements',
    type: 'login' as const,
    target: 1,
    reward: 30,
    icon: '🏅'
  },
];

export function generateDailyChallenges(): DailyChallenge[] {
  const nextMidnight = getNextMidnight();

  // Select 3 random challenges - one easy, one medium, one hard
  const easyPool = DAILY_CHALLENGE_POOL.filter(c => c.reward <= 50);
  const mediumPool = DAILY_CHALLENGE_POOL.filter(c => c.reward > 50 && c.reward <= 100);
  const hardPool = DAILY_CHALLENGE_POOL.filter(c => c.reward > 100);

  const easy = easyPool[Math.floor(Math.random() * easyPool.length)];
  const medium = mediumPool[Math.floor(Math.random() * mediumPool.length)];
  const hard = hardPool[Math.floor(Math.random() * hardPool.length)];

  return [easy, medium, hard].map(challenge => ({
    ...challenge,
    progress: 0,
    completed: false,
    expiresAt: nextMidnight.toISOString(),
  }));
}

// Update weekly challenge progress
export function updateWeeklyChallengeProgress(
  userId: string,
  type: WeeklyChallenge['type'],
  increment: number = 1
): WeeklyChallenge | null {
  const profile = getGamificationProfile(userId);
  
  // Check if challenges need reset
  const now = new Date();
  const shouldReset = profile.weekChallenges.some(
    c => new Date(c.expiresAt) < now
  );
  
  if (shouldReset) {
    profile.weekChallenges = generateWeeklyChallenges();
  }
  
  const challenge = profile.weekChallenges.find(c => c.type === type && !c.completed);
  if (!challenge) return null;

  challenge.progress += increment;

  if (challenge.progress >= challenge.target) {
    challenge.completed = true;
    profile.weeklyChallengesCompleted = (profile.weeklyChallengesCompleted || 0) + 1;
    addXP(userId, challenge.reward, `completing "${challenge.title}"`);
  }

  saveGamificationProfile(profile);
  return challenge;
}

// Update daily challenge progress
export function updateDailyChallengeProgress(
  userId: string,
  type: DailyChallenge['type'],
  increment: number = 1
): DailyChallenge | null {
  const profile = getGamificationProfile(userId);

  // Check if challenges need reset (expired = past midnight)
  const now = new Date();
  const shouldReset = profile.dailyChallenges.some(
    c => new Date(c.expiresAt) < now
  );

  if (shouldReset) {
    profile.dailyChallenges = generateDailyChallenges();
  }

  const challenge = profile.dailyChallenges.find(c => c.type === type && !c.completed);
  if (!challenge) return null;

  challenge.progress += increment;

  if (challenge.progress >= challenge.target) {
    challenge.completed = true;
    profile.dailyChallengesCompleted = (profile.dailyChallengesCompleted || 0) + 1;
    addXP(userId, challenge.reward, `completing "${challenge.title}"`);
  }

  saveGamificationProfile(profile);
  return challenge;
}

// Use streak insurance
export function useStreakInsurance(userId: string): boolean {
  const profile = getGamificationProfile(userId);
  
  if (profile.streakInsurance.available <= 0) {
    return false;
  }
  
  profile.streakInsurance.available -= 1;
  profile.streakInsurance.lastUsed = new Date().toISOString();
  saveGamificationProfile(profile);
  
  return true;
}

// Get current level info
export function getCurrentLevel(xp: number): Level {
  const levelIndex = LEVELS.findIndex(l => xp < l.maxXP);
  return LEVELS[levelIndex !== -1 ? levelIndex : LEVELS.length - 1];
}

// Get XP progress to next level
export function getXPProgress(xp: number): { current: number; needed: number; percentage: number } {
  const currentLevel = getCurrentLevel(xp);
  const current = xp - currentLevel.minXP;
  const needed = currentLevel.maxXP - currentLevel.minXP;
  const percentage = (current / needed) * 100;
  
  return { current, needed, percentage };
}

// Record assessment completion
export function recordAssessmentCompletion(userId: string): void {
  const profile = getGamificationProfile(userId);
  profile.totalAssessments += 1;

  const xpReward = addXP(userId, 100, 'completing an assessment');
  updateWeeklyChallengeProgress(userId, 'assessments', 1);
  updateDailyChallengeProgress(userId, 'assessment', 1);

  saveGamificationProfile(profile);
}

// Record Brain Gym completion
export function recordBrainGymCompletion(userId: string, points: number): void {
  const profile = getGamificationProfile(userId);
  profile.totalBrainGymChallenges += 1;

  addXP(userId, points, 'Brain Gym challenge');
  updateWeeklyChallengeProgress(userId, 'brain-gym', 1);
  updateWeeklyChallengeProgress(userId, 'total-xp', points);
  updateDailyChallengeProgress(userId, 'brain-gym', 1);

  saveGamificationProfile(profile);
}

// Update streak
export function updateStreak(userId: string, currentStreak: number): void {
  const profile = getGamificationProfile(userId);

  if (currentStreak > profile.longestStreak) {
    profile.longestStreak = currentStreak;
  }

  updateWeeklyChallengeProgress(userId, 'streak', 0); // Just check, don't increment
  const challenge = profile.weekChallenges.find(c => c.type === 'streak');
  if (challenge) {
    challenge.progress = currentStreak;
  }

  saveGamificationProfile(profile);
}

// Record daily login
export function recordDailyLogin(userId: string): void {
  const profile = getGamificationProfile(userId);

  // Update daily login challenge
  updateDailyChallengeProgress(userId, 'login', 1);

  // Update last active date
  profile.lastActiveDate = new Date().toISOString();

  saveGamificationProfile(profile);
}

// Record cognitive profile completion
export function recordProfileCompletion(userId: string): GamificationReward | null {
  const profile = getGamificationProfile(userId);

  const result = addXP(userId, 150, 'completing your cognitive profile');
  const newBadges = checkForNewBadges(profile);

  saveGamificationProfile(profile);

  return {
    xpEarned: 150,
    newBadges,
    leveledUp: result.leveledUp,
    newLevel: result.newLevel,
    levelTitle: result.newLevel ? LEVELS[result.newLevel - 1].title : undefined,
    message: result.message
  };
}

// Record profile evolution view
export function recordProfileEvolutionView(userId: string): GamificationReward | null {
  const profile = getGamificationProfile(userId);

  // Update daily challenge for profile viewing
  updateDailyChallengeProgress(userId, 'profile', 1);

  if (!profile.profileViewedEvolution) {
    profile.profileViewedEvolution = true;
    const result = addXP(userId, 50, 'viewing your profile evolution');
    const newBadges = checkForNewBadges(profile);
    saveGamificationProfile(profile);

    return {
      xpEarned: 50,
      newBadges,
      leveledUp: result.leveledUp,
      newLevel: result.newLevel,
      levelTitle: result.newLevel ? LEVELS[result.newLevel - 1].title : undefined,
      message: result.message
    };
  }

  saveGamificationProfile(profile);
  return null;
}

// Record profile share
export function recordProfileShare(userId: string): GamificationReward | null {
  const profile = getGamificationProfile(userId);

  // Increment share count
  profile.profileShareCount = (profile.profileShareCount || 0) + 1;

  if (!profile.profileShared) {
    profile.profileShared = true;
    const result = addXP(userId, 75, 'sharing your profile');
    const newBadges = checkForNewBadges(profile);
    saveGamificationProfile(profile);

    return {
      xpEarned: 75,
      newBadges,
      leveledUp: result.leveledUp,
      newLevel: result.newLevel,
      levelTitle: result.newLevel ? LEVELS[result.newLevel - 1].title : undefined,
      message: result.message
    };
  }

  saveGamificationProfile(profile);
  return null;
}

// Record skill plan completion
export function recordSkillPlanCompletion(userId: string): GamificationReward | null {
  const profile = getGamificationProfile(userId);
  profile.totalSkillPlans += 1;

  // Update daily challenge for skill plan
  updateDailyChallengeProgress(userId, 'skill-plan', 1);

  const result = addXP(userId, 200, 'completing a skill plan');
  const newBadges = checkForNewBadges(profile);

  saveGamificationProfile(profile);

  return {
    xpEarned: 200,
    newBadges,
    leveledUp: result.leveledUp,
    newLevel: result.newLevel,
    levelTitle: result.newLevel ? LEVELS[result.newLevel - 1].title : undefined,
    message: result.message
  };
}

// Record career exploration
export function recordCareerExploration(userId: string): GamificationReward | null {
  const profile = getGamificationProfile(userId);
  profile.careerExplorationsCount += 1;

  // Update daily challenge for career exploration
  updateDailyChallengeProgress(userId, 'career', 1);

  if (profile.careerExplorationsCount === 1) {
    const result = addXP(userId, 25, 'exploring your first career');
    const newBadges = checkForNewBadges(profile);
    saveGamificationProfile(profile);

    return {
      xpEarned: 25,
      newBadges,
      leveledUp: result.leveledUp,
      newLevel: result.newLevel,
      levelTitle: result.newLevel ? LEVELS[result.newLevel - 1].title : undefined,
      message: result.message
    };
  }

  saveGamificationProfile(profile);
  return null;
}

// Record career favorite
export function recordCareerFavorite(userId: string, favoritesCount: number): GamificationReward | null {
  const profile = getGamificationProfile(userId);
  profile.careerFavoritesCount = favoritesCount;

  // Update daily challenge for career favoriting
  updateDailyChallengeProgress(userId, 'career', 1);

  if (favoritesCount === 1) {
    const result = addXP(userId, 10, 'favoriting your first career');
    const newBadges = checkForNewBadges(profile);
    saveGamificationProfile(profile);

    return {
      xpEarned: 10,
      newBadges,
      leveledUp: result.leveledUp,
      newLevel: result.newLevel,
      levelTitle: result.newLevel ? LEVELS[result.newLevel - 1].title : undefined,
      message: result.message
    };
  }

  const newBadges = checkForNewBadges(profile);
  saveGamificationProfile(profile);

  if (newBadges.length > 0) {
    return {
      xpEarned: 0,
      newBadges,
      leveledUp: false,
      message: 'Badge unlocked!'
    };
  }

  return null;
}
