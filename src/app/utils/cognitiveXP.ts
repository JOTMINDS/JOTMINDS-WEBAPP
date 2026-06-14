// Cognitive XP Engine — tracks cognitive-focused growth separate from gamification

export interface CognitiveLevel {
  level: number;
  title: string;
  subtitle: string;
  minXP: number;
  maxXP: number;
  color: string;
  icon: string;
  perks: string[];
}

export interface XPActivity {
  id: string;
  type: string;
  description: string;
  xp: number;
  timestamp: string;
  category: 'assessment' | 'improvement' | 'streak' | 'challenge' | 'exploration';
}

export interface MilestoneDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  category: 'assessment' | 'streak' | 'improvement' | 'exploration' | 'mastery';
  requirement: number;
}

export interface Milestone extends MilestoneDefinition {
  current: number;
  progress: number; // 0-100
  achievedAt?: string;
}

export interface CognitiveXPProfile {
  userId: string;
  totalXP: number;
  level: number;
  activities: XPActivity[];
  milestonesAchieved: string[];
  updatedAt: string;
}

export const COGNITIVE_LEVELS: CognitiveLevel[] = [
  { level: 1, title: 'Cognitive Seedling', subtitle: 'Just sprouting', minXP: 0, maxXP: 500, color: '#10b981', icon: '🌱', perks: ['Assessments', 'Daily challenges'] },
  { level: 2, title: 'Curious Thinker', subtitle: 'Questions everything', minXP: 500, maxXP: 1200, color: '#3b82f6', icon: '🔍', perks: ['Brain Gym', 'Profile sharing'] },
  { level: 3, title: 'Pattern Seeker', subtitle: 'Connects the dots', minXP: 1200, maxXP: 2200, color: '#8b5cf6', icon: '🧩', perks: ['Advanced profile', 'Skill builder'] },
  { level: 4, title: 'Mind Mapper', subtitle: 'Charts new territory', minXP: 2200, maxXP: 3500, color: '#f59e0b', icon: '🗺️', perks: ['Weekly challenges', 'Career recs'] },
  { level: 5, title: 'Strategy Builder', subtitle: 'Plans with precision', minXP: 3500, maxXP: 5000, color: '#ef4444', icon: '⚡', perks: ['AI Coach', 'Study planner'] },
  { level: 6, title: 'Insight Architect', subtitle: 'Designs understanding', minXP: 5000, maxXP: 7000, color: '#06b6d4', icon: '🏛️', perks: ['Analytics', 'Peer compare'] },
  { level: 7, title: 'Neural Navigator', subtitle: 'Masters complexity', minXP: 7000, maxXP: 9500, color: '#ec4899', icon: '🧭', perks: ['Expert challenges', 'Mentor match'] },
  { level: 8, title: 'Cognitive Catalyst', subtitle: 'Sparks transformation', minXP: 9500, maxXP: 12500, color: '#f97316', icon: '💎', perks: ['Leaderboard', 'Teacher insights'] },
  { level: 9, title: 'Wisdom Weaver', subtitle: 'Synthesizes mastery', minXP: 12500, maxXP: 16000, color: '#a855f7', icon: '🌟', perks: ['Legend badge', 'Exclusive themes'] },
  { level: 10, title: 'Cognitive Sage', subtitle: 'The pinnacle of growth', minXP: 16000, maxXP: Infinity, color: '#fbbf24', icon: '👑', perks: ['All perks unlocked', 'Sage status'] },
];

export const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  // Assessment
  { id: 'first_assessment', title: 'First Step', description: 'Complete your very first assessment', icon: '🎯', xpReward: 50, category: 'assessment', requirement: 1 },
  { id: 'triple_thinker', title: 'Triple Thinker', description: 'Complete all 3 assessment types', icon: '🧠', xpReward: 200, category: 'assessment', requirement: 3 },
  { id: 'five_assessments', title: 'Deep Diver', description: 'Complete 5 total assessments', icon: '🏊', xpReward: 100, category: 'assessment', requirement: 5 },
  { id: 'ten_assessments', title: 'Assessment Master', description: 'Complete 10 total assessments', icon: '🏆', xpReward: 300, category: 'assessment', requirement: 10 },
  // Improvement
  { id: 'score_improve_5', title: 'Getting Better', description: 'Improve any dimension score by 5+ points', icon: '📈', xpReward: 100, category: 'improvement', requirement: 5 },
  { id: 'score_improve_15', title: 'Growth Spurt', description: 'Improve any dimension score by 15+ points', icon: '🚀', xpReward: 200, category: 'improvement', requirement: 15 },
  { id: 'score_80', title: 'High Achiever', description: 'Score 80%+ in any cognitive dimension', icon: '⭐', xpReward: 250, category: 'improvement', requirement: 1 },
  { id: 'balanced_mind', title: 'Balanced Mind', description: 'All key dimensions within 20 points', icon: '⚖️', xpReward: 300, category: 'improvement', requirement: 1 },
  // Streak
  { id: 'streak_3', title: 'Spark', description: 'Maintain a 3-day learning streak', icon: '✨', xpReward: 50, category: 'streak', requirement: 3 },
  { id: 'streak_7', title: 'On Fire', description: 'Maintain a 7-day learning streak', icon: '🔥', xpReward: 150, category: 'streak', requirement: 7 },
  { id: 'streak_14', title: 'Unstoppable', description: 'Maintain a 14-day learning streak', icon: '💪', xpReward: 300, category: 'streak', requirement: 14 },
  { id: 'streak_30', title: 'Legend', description: 'Maintain a 30-day learning streak', icon: '👑', xpReward: 500, category: 'streak', requirement: 30 },
  // Exploration
  { id: 'brain_gym_10', title: 'Brain Trainer', description: 'Complete 10 Brain Gym sessions', icon: '🏋️', xpReward: 100, category: 'exploration', requirement: 10 },
  { id: 'daily_challenges_7', title: 'Challenge Chaser', description: 'Complete 7 daily challenges', icon: '🎮', xpReward: 75, category: 'exploration', requirement: 7 },
  { id: 'level_3', title: 'Rising Star', description: 'Reach Cognitive Level 3', icon: '🌠', xpReward: 150, category: 'exploration', requirement: 3 },
  { id: 'level_5', title: 'Halfway There', description: 'Reach Cognitive Level 5', icon: '🎗️', xpReward: 300, category: 'exploration', requirement: 5 },
  // Mastery
  { id: 'self_aware', title: 'Self-Aware', description: 'View your cognitive profile 3 times', icon: '🪞', xpReward: 50, category: 'mastery', requirement: 3 },
  { id: 'five_badges', title: 'Badge Collector', description: 'Earn 5 gamification badges', icon: '🎖️', xpReward: 200, category: 'mastery', requirement: 5 },
  { id: 'level_7', title: 'JotMinds Scholar', description: 'Reach Cognitive Level 7', icon: '📚', xpReward: 500, category: 'mastery', requirement: 7 },
  { id: 'ai_coach_5', title: 'Coached to Excel', description: 'Use the AI Learning Coach 5 times', icon: '🤖', xpReward: 100, category: 'mastery', requirement: 5 },
];

const storageKey = (userId: string) => `jotminds_cxp_${userId}`;

export function getCognitiveXPProfile(userId: string): CognitiveXPProfile {
  try {
    const stored = localStorage.getItem(storageKey(userId));
    if (stored) return JSON.parse(stored);
  } catch {}
  return { userId, totalXP: 0, level: 1, activities: [], milestonesAchieved: [], updatedAt: new Date().toISOString() };
}

export function saveCognitiveXPProfile(profile: CognitiveXPProfile): void {
  localStorage.setItem(storageKey(profile.userId), JSON.stringify(profile));
}

export function getCognitiveLevel(xp: number): CognitiveLevel {
  for (let i = COGNITIVE_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= COGNITIVE_LEVELS[i].minXP) return COGNITIVE_LEVELS[i];
  }
  return COGNITIVE_LEVELS[0];
}

export function getLevelProgress(xp: number): { level: CognitiveLevel; pct: number; xpToNext: number } {
  const level = getCognitiveLevel(xp);
  if (level.level === 10) return { level, pct: 100, xpToNext: 0 };
  const pct = ((xp - level.minXP) / (level.maxXP - level.minXP)) * 100;
  return { level, pct: Math.min(99, pct), xpToNext: level.maxXP - xp };
}

export type XPActivityType =
  | 'assessment_complete' | 'assessment_improve' | 'daily_login'
  | 'streak_bonus' | 'brain_gym' | 'daily_challenge' | 'weekly_challenge'
  | 'badge_earned' | 'profile_view' | 'ai_coach_session' | 'milestone_achieved';

const XP_RATES: Record<XPActivityType, number> = {
  assessment_complete: 150,
  assessment_improve: 75,
  daily_login: 25,
  streak_bonus: 50,
  brain_gym: 50,
  daily_challenge: 30,
  weekly_challenge: 100,
  badge_earned: 25,
  profile_view: 10,
  ai_coach_session: 40,
  milestone_achieved: 0,
};

const ACTIVITY_LABELS: Record<XPActivityType, string> = {
  assessment_complete: 'Completed an assessment',
  assessment_improve: 'Score improved!',
  daily_login: 'Daily login',
  streak_bonus: 'Streak bonus',
  brain_gym: 'Brain Gym session',
  daily_challenge: 'Daily challenge',
  weekly_challenge: 'Weekly challenge',
  badge_earned: 'Earned a badge',
  profile_view: 'Viewed cognitive profile',
  ai_coach_session: 'AI Coach session',
  milestone_achieved: 'Milestone unlocked!',
};

const CATEGORY_MAP: Record<XPActivityType, XPActivity['category']> = {
  assessment_complete: 'assessment',
  assessment_improve: 'improvement',
  daily_login: 'streak',
  streak_bonus: 'streak',
  brain_gym: 'challenge',
  daily_challenge: 'challenge',
  weekly_challenge: 'challenge',
  badge_earned: 'exploration',
  profile_view: 'exploration',
  ai_coach_session: 'exploration',
  milestone_achieved: 'exploration',
};

export function awardCognitiveXP(
  userId: string,
  activityType: XPActivityType,
  customXP?: number,
  description?: string
): { profile: CognitiveXPProfile; leveledUp: boolean; newLevel?: CognitiveLevel } {
  const profile = getCognitiveXPProfile(userId);
  const xp = customXP ?? XP_RATES[activityType];
  const prevLevel = getCognitiveLevel(profile.totalXP);
  profile.totalXP += xp;
  const newLevel = getCognitiveLevel(profile.totalXP);
  const leveledUp = newLevel.level > prevLevel.level;
  if (leveledUp) profile.level = newLevel.level;
  profile.activities.unshift({
    id: `${activityType}_${Date.now()}`,
    type: activityType,
    description: description ?? ACTIVITY_LABELS[activityType],
    xp,
    timestamp: new Date().toISOString(),
    category: CATEGORY_MAP[activityType],
  });
  profile.activities = profile.activities.slice(0, 100);
  profile.updatedAt = new Date().toISOString();
  saveCognitiveXPProfile(profile);
  return { profile, leveledUp, newLevel: leveledUp ? newLevel : undefined };
}

export function extractDimensionScores(assessment: any): { name: string; score: number }[] {
  const result: { name: string; score: number }[] = [];
  const s = assessment?.score;
  if (!s) return result;
  if (s.kolb?.scores) {
    const k = s.kolb.scores;
    if (k.CE != null) result.push({ name: 'CE', score: k.CE });
    if (k.RO != null) result.push({ name: 'RO', score: k.RO });
    if (k.AC != null) result.push({ name: 'AC', score: k.AC });
    if (k.AE != null) result.push({ name: 'AE', score: k.AE });
  }
  if (s.sternberg?.scores) {
    const st = s.sternberg.scores;
    if (st.analytical != null) result.push({ name: 'Analytical', score: st.analytical });
    if (st.creative != null) result.push({ name: 'Creative', score: st.creative });
    if (st.practical != null) result.push({ name: 'Practical', score: st.practical });
  }
  if (s.dualProcess?.scores) {
    const d = s.dualProcess.scores;
    if (d.intuitive != null) result.push({ name: 'Intuitive', score: d.intuitive });
    if (d.reflective != null) result.push({ name: 'Reflective', score: d.reflective });
  }
  return result;
}

// Synthesize XP from existing assessment history (idempotent bootstrap)
export function bootstrapXPFromAssessments(userId: string, assessments: any[], gamProfile?: any): CognitiveXPProfile {
  const profile = getCognitiveXPProfile(userId);
  // Already bootstrapped if there are activities
  if (profile.activities.length > 0) return profile;

  const completed = assessments.filter(a => a.completedAt);
  const sorted = [...completed].sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());

  let syntheticXP = 0;
  const activities: XPActivity[] = [];

  // Award XP per completed assessment
  sorted.forEach((a, i) => {
    const xp = XP_RATES.assessment_complete;
    syntheticXP += xp;
    activities.push({
      id: `assessment_complete_${i}`,
      type: 'assessment_complete',
      description: `Completed ${a.type} assessment`,
      xp,
      timestamp: a.completedAt,
      category: 'assessment',
    });

    // Check improvement vs previous same-type
    if (i > 0) {
      const prev = sorted.slice(0, i).reverse().find(p => p.type === a.type);
      if (prev) {
        const prevScores = extractDimensionScores(prev).map(d => d.score);
        const curScores = extractDimensionScores(a).map(d => d.score);
        const avgPrev = prevScores.length ? prevScores.reduce((s, v) => s + v, 0) / prevScores.length : 0;
        const avgCur = curScores.length ? curScores.reduce((s, v) => s + v, 0) / curScores.length : 0;
        if (avgCur > avgPrev + 2) {
          const xpI = XP_RATES.assessment_improve;
          syntheticXP += xpI;
          activities.push({
            id: `assessment_improve_${i}`,
            type: 'assessment_improve',
            description: 'Score improved vs previous attempt',
            xp: xpI,
            timestamp: a.completedAt,
            category: 'improvement',
          });
        }
      }
    }
  });

  // Brain gym sessions
  const gymSessions = gamProfile?.totalBrainGymChallenges ?? 0;
  if (gymSessions > 0) {
    const xp = gymSessions * XP_RATES.brain_gym;
    syntheticXP += xp;
    activities.push({ id: 'brain_gym_bootstrap', type: 'brain_gym', description: `${gymSessions} Brain Gym sessions completed`, xp, timestamp: new Date().toISOString(), category: 'challenge' });
  }

  // Daily challenges
  const dailyChallenges = gamProfile?.dailyChallengesCompleted ?? 0;
  if (dailyChallenges > 0) {
    const xp = dailyChallenges * XP_RATES.daily_challenge;
    syntheticXP += xp;
    activities.push({ id: 'daily_challenge_bootstrap', type: 'daily_challenge', description: `${dailyChallenges} daily challenges completed`, xp, timestamp: new Date().toISOString(), category: 'challenge' });
  }

  profile.totalXP = syntheticXP;
  profile.level = getCognitiveLevel(syntheticXP).level;
  profile.activities = activities.reverse(); // oldest first then unshift makes newest first
  profile.updatedAt = new Date().toISOString();
  saveCognitiveXPProfile(profile);
  return profile;
}

export function computeMilestones(userId: string, assessments: any[], gamProfile?: any): Milestone[] {
  const cxp = getCognitiveXPProfile(userId);
  const achieved = new Set(cxp.milestonesAchieved);

  const completed = assessments.filter(a => a.completedAt);
  const completedTypes = new Set(completed.map((a: any) => {
    if (['kolb', 'vark'].includes(a.type)) return 'learning';
    if (['sternberg', 'jhs-thinking', 'shs-thinking', 'adult-thinking', 'child-thinking'].includes(a.type)) return 'thinking';
    if (a.type === 'dual-process') return 'decision';
    return a.type;
  }));

  const streak = gamProfile?.currentStreak ?? gamProfile?.longestStreak ?? 0;
  const brainGym = gamProfile?.totalBrainGymChallenges ?? 0;
  const dailyDone = gamProfile?.dailyChallengesCompleted ?? 0;
  const badgeCount = (gamProfile?.badges ?? []).filter((b: any) => b.unlockedAt).length;
  const profileViews = parseInt(localStorage.getItem(`jm_profile_views_${userId}`) ?? '0');
  const aiCoachSessions = parseInt(localStorage.getItem(`jm_ai_coach_sessions_${userId}`) ?? '0');
  const currentLevel = getCognitiveLevel(cxp.totalXP).level;

  // Improvement tracking
  let maxImprovement = 0;
  let maxScore = 0;
  const byType: Record<string, any[]> = {};
  completed.filter(a => a.score).forEach((a: any) => {
    if (!byType[a.type]) byType[a.type] = [];
    byType[a.type].push(a);
  });
  Object.values(byType).forEach(group => {
    if (group.length < 2) return;
    const s = [...group].sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
    const firstScores = extractDimensionScores(s[0]).map(d => d.score);
    const lastScores = extractDimensionScores(s[s.length - 1]).map(d => d.score);
    firstScores.forEach((fs, i) => {
      const imp = (lastScores[i] ?? 0) - fs;
      if (imp > maxImprovement) maxImprovement = imp;
    });
    lastScores.forEach(sc => { if (sc > maxScore) maxScore = sc; });
  });

  const allScores = completed.flatMap(a => extractDimensionScores(a).map(d => d.score));
  const isBalanced = allScores.length >= 4 && (Math.max(...allScores) - Math.min(...allScores)) <= 20;

  const countFor: Record<string, number> = {
    first_assessment: Math.min(completed.length, 1),
    triple_thinker: completedTypes.size,
    five_assessments: completed.length,
    ten_assessments: completed.length,
    score_improve_5: Math.round(maxImprovement),
    score_improve_15: Math.round(maxImprovement),
    score_80: maxScore >= 80 ? 1 : 0,
    balanced_mind: isBalanced ? 1 : 0,
    streak_3: streak,
    streak_7: streak,
    streak_14: streak,
    streak_30: streak,
    brain_gym_10: brainGym,
    daily_challenges_7: dailyDone,
    level_3: currentLevel,
    level_5: currentLevel,
    self_aware: profileViews,
    five_badges: badgeCount,
    level_7: currentLevel,
    ai_coach_5: aiCoachSessions,
  };

  return MILESTONE_DEFINITIONS.map(m => {
    const current = Math.min(countFor[m.id] ?? 0, m.requirement);
    const progress = m.requirement > 0 ? Math.min(100, (current / m.requirement) * 100) : 0;
    const isAchieved = achieved.has(m.id) || current >= m.requirement;
    return { ...m, current, progress, achievedAt: isAchieved ? new Date().toISOString() : undefined };
  });
}

export function getXPCategoryBreakdown(activities: XPActivity[]): { name: string; xp: number; color: string }[] {
  const cats: Record<string, number> = {};
  activities.forEach(a => { cats[a.category] = (cats[a.category] ?? 0) + a.xp; });
  const colorMap: Record<string, string> = {
    assessment: '#5B7DB1',
    improvement: '#1E8A6E',
    streak: '#E0A020',
    challenge: '#6B4C9A',
    exploration: '#EC4899',
  };
  return Object.entries(cats).map(([name, xp]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), xp, color: colorMap[name] ?? '#9ca3af' }));
}
