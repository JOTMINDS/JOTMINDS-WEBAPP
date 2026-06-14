/**
 * Personalized Nudge & Smart Reminder System
 * Context-aware notifications based on user behavior and optimal timing
 */

import { EngagementMetrics, getEngagementMetrics } from './engagementTracking';
import { GamificationProfile, getGamificationProfile } from './gamification';

export interface Nudge {
  id: string;
  userId: string;
  type: 'reminder' | 'encouragement' | 'achievement' | 'suggestion' | 'streak' | 'challenge' | 'milestone';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  action?: {
    label: string;
    route: string;
  };
  icon?: string;
  color?: string;
  createdAt: string;
  scheduledFor?: string;
  expiresAt?: string;
  dismissed: boolean;
  dismissedAt?: string;
  interacted: boolean;
  interactedAt?: string;
}

export interface ReminderSchedule {
  userId: string;
  preferredTimes: {
    dayOfWeek: number; // 0 = Sunday, 6 = Saturday
    hour: number; // 0-23
  }[];
  frequency: 'daily' | 'every_other_day' | 'weekly' | 'biweekly';
  enabled: boolean;
  lastSent: string;
  nextScheduled: string;
}

export interface UserBehaviorPattern {
  userId: string;
  mostActiveHours: number[];
  mostActiveDays: number[];
  averageSessionDuration: number;
  preferredFeatures: string[];
  lastActive: string;
  activityTrend: 'increasing' | 'decreasing' | 'stable';
  engagementLevel: 'high' | 'medium' | 'low';
}

const NUDGES_STORAGE_KEY = 'jotminds_nudges';
const REMINDER_SCHEDULE_KEY = 'jotminds_reminder_schedule';

// Nudge Generation
export function generatePersonalizedNudges(userId: string): Nudge[] {
  const engagement = getEngagementMetrics(userId);
  const gamification = getGamificationProfile(userId);
  const behaviorPattern = analyzeUserBehavior(userId, engagement);
  const nudges: Nudge[] = [];

  // Streak reminder
  if (engagement.streakData.currentStreak > 0 && engagement.streakData.currentStreak >= 3) {
    const daysSinceActive = Math.floor(
      (new Date().getTime() - new Date(engagement.lastActive).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceActive === 0 && new Date().getHours() >= 18) {
      nudges.push({
        id: `nudge_streak_${userId}`,
        userId,
        type: 'streak',
        priority: 'high',
        title: `${engagement.streakData.currentStreak} Day Streak! 🔥`,
        message: `You're on fire! Keep your streak alive by completing an activity today.`,
        action: {
          label: 'Continue Learning',
          route: '/brain-gym',
        },
        icon: '🔥',
        color: '#f97316',
        createdAt: new Date().toISOString(),
        dismissed: false,
        interacted: false,
      });
    }
  }

  // Daily challenges reminder
  if (gamification.dailyChallenges && gamification.dailyChallenges.length > 0) {
    const incompleteChallenges = gamification.dailyChallenges.filter(c => c.progress < c.target);
    if (incompleteChallenges.length > 0) {
      nudges.push({
        id: `nudge_challenges_${userId}`,
        userId,
        type: 'challenge',
        priority: 'medium',
        title: 'Daily Challenges Available',
        message: `You have ${incompleteChallenges.length} challenges waiting. Complete them for bonus XP!`,
        action: {
          label: 'View Challenges',
          route: '/gamification',
        },
        icon: '🎯',
        color: '#5B7DB1',
        createdAt: new Date().toISOString(),
        dismissed: false,
        interacted: false,
      });
    }
  }

  // Re-engagement nudge
  const daysSinceActiveForLow = Math.floor(
    (new Date().getTime() - new Date(engagement.lastActive).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (behaviorPattern.engagementLevel === 'low' && daysSinceActiveForLow >= 7) {
    nudges.push({
      id: `nudge_wemissyou_${userId}`,
      userId,
      type: 'encouragement',
      priority: 'medium',
      title: 'Ready to continue?',
      message: 'Your cognitive growth journey is waiting for you. Dive into a new Brain Gym exercise today.',
      action: {
        label: 'Explore',
        route: '/brain-gym',
      },
      icon: '🧠',
      color: '#6B4C9A',
      createdAt: new Date().toISOString(),
      dismissed: false,
      interacted: false,
    });
  }

  // Achievement celebration
  if (gamification.badges.length > 0) {
    const recentBadges = gamification.badges.filter(b => {
      const earnedDate = new Date(b.earnedAt);
      const daysSince = Math.floor((new Date().getTime() - earnedDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysSince === 0;
    });

    if (recentBadges.length > 0) {
      nudges.push({
        id: `nudge_badge_${recentBadges[0].name.replace(/\s+/g, '')}_${userId}`,
        userId,
        type: 'achievement',
        priority: 'high',
        title: 'New Badge Unlocked! 🏆',
        message: `Congratulations! You earned the "${recentBadges[0].name}" badge.`,
        action: {
          label: 'View Badges',
          route: '/gamification',
        },
        icon: '🏆',
        color: '#f59e0b',
        createdAt: new Date().toISOString(),
        dismissed: false,
        interacted: false,
      });
    }
  }

  // Level up celebration
  if (gamification.level > 1) {
    const xpToNext = gamification.xpToNextLevel;
    const currentXP = gamification.totalXP - (gamification.level - 1) * 100;
    const percentToNext = (currentXP / xpToNext) * 100;

    if (percentToNext >= 90) {
      nudges.push({
        id: `nudge_level_${gamification.level}_${userId}`,
        userId,
        type: 'encouragement',
        priority: 'medium',
        title: 'Almost There!',
        message: `You're ${xpToNext - currentXP} XP away from Level ${gamification.level + 1}!`,
        action: {
          label: 'Earn XP',
          route: '/assessments',
        },
        icon: '⚡',
        color: '#3b82f6',
        createdAt: new Date().toISOString(),
        dismissed: false,
        interacted: false,
      });
    }
  }

  // Feature suggestion based on behavior
  const unusedFeatures = getUnusedFeatures(engagement);
  if (unusedFeatures.length > 0) {
    const feature = unusedFeatures[0];
    nudges.push({
      id: `nudge_feature_${feature.name.replace(/\s+/g, '')}_${userId}`,
      userId,
      type: 'suggestion',
      priority: 'low',
      title: `Try ${feature.name}`,
      message: feature.description,
      action: {
        label: 'Check it out',
        route: feature.route,
      },
      icon: feature.icon,
      color: '#10b981',
      createdAt: new Date().toISOString(),
      dismissed: false,
      interacted: false,
    });
  }

  // Profile improvement suggestion
  const daysSinceActive = Math.floor(
    (new Date().getTime() - new Date(engagement.lastActive).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceActive >= 7) {
    nudges.push({
      id: `nudge_progress_${userId}`,
      userId,
      type: 'reminder',
      priority: 'medium',
      title: 'Check Your Progress',
      message: "See how you've grown! Review your cognitive development journey.",
      action: {
        label: 'View Progress',
        route: '/profile-improvement',
      },
      icon: '📈',
      color: '#8b5cf6',
      createdAt: new Date().toISOString(),
      dismissed: false,
      interacted: false,
    });
  }

  return nudges;
}

function getUnusedFeatures(engagement: EngagementMetrics): { name: string; description: string; route: string; icon: string }[] {
  const features = [];

  if (engagement.featureUsage.assessments === 0) {
    features.push({
      name: 'Cognitive Assessments',
      description: 'Discover your unique cognitive profile through our comprehensive assessments.',
      route: '/assessments',
      icon: '🧪',
    });
  }

  if (engagement.featureUsage.brainGym === 0) {
    features.push({
      name: 'Brain Gym',
      description: 'Exercise your mind with engaging cognitive challenges and puzzles.',
      route: '/brain-gym',
      icon: '🧠',
    });
  }

  if (engagement.featureUsage.careerExploration === 0) {
    features.push({
      name: 'Career Exploration',
      description: 'Explore careers that match your cognitive strengths and interests.',
      route: '/career-exploration',
      icon: '🚀',
    });
  }

  if (engagement.featureUsage.profileViews === 0) {
    features.push({
      name: 'Profile Improvement Tracker',
      description: 'Track your cognitive growth and skill development over time.',
      route: '/profile-improvement',
      icon: '📊',
    });
  }

  return features;
}

// Behavior Analysis
export function analyzeUserBehavior(userId: string, engagement?: EngagementMetrics): UserBehaviorPattern {
  const metrics = engagement || getEngagementMetrics(userId);

  // Most active hours and days
  const mostActiveHours = metrics.peakActivityTimes.map(p => p.hour).slice(0, 3);
  const mostActiveDays = metrics.peakActivityTimes.map(p => p.dayOfWeek).slice(0, 3);

  // Preferred features
  const featureUsage = Object.entries(metrics.featureUsage)
    .sort((a, b) => b[1] - a[1])
    .map(([feature]) => feature)
    .slice(0, 3);

  // Activity trend
  const recentActivity = metrics.weeklyActivity.slice(-4);
  let activityTrend: UserBehaviorPattern['activityTrend'] = 'stable';

  if (recentActivity.length >= 2) {
    const recentAvg = recentActivity.slice(-2).reduce((sum, w) => sum + w.activities, 0) / 2;
    const olderAvg = recentActivity.slice(0, 2).reduce((sum, w) => sum + w.activities, 0) / 2;

    if (recentAvg > olderAvg * 1.2) {
      activityTrend = 'increasing';
    } else if (recentAvg < olderAvg * 0.8) {
      activityTrend = 'decreasing';
    }
  }

  // Engagement level
  let engagementLevel: UserBehaviorPattern['engagementLevel'];
  if (metrics.engagementScore >= 70) {
    engagementLevel = 'high';
  } else if (metrics.engagementScore >= 40) {
    engagementLevel = 'medium';
  } else {
    engagementLevel = 'low';
  }

  return {
    userId,
    mostActiveHours,
    mostActiveDays,
    averageSessionDuration: metrics.averageSessionDuration,
    preferredFeatures: featureUsage,
    lastActive: metrics.lastActive,
    activityTrend,
    engagementLevel,
  };
}

// Smart Reminder Scheduling
export function calculateOptimalReminderTime(userId: string): Date {
  const behavior = analyzeUserBehavior(userId);

  const now = new Date();
  const optimalDate = new Date(now);

  // Use most active hour, or default to 4 PM if no data
  const optimalHour = behavior.mostActiveHours.length > 0 ? behavior.mostActiveHours[0] : 16;

  // If we've passed the optimal hour today, schedule for tomorrow
  if (now.getHours() >= optimalHour) {
    optimalDate.setDate(optimalDate.getDate() + 1);
  }

  optimalDate.setHours(optimalHour, 0, 0, 0);

  return optimalDate;
}

export function getReminderSchedule(userId: string): ReminderSchedule {
  const data = localStorage.getItem(REMINDER_SCHEDULE_KEY);
  if (!data) {
    return createDefaultReminderSchedule(userId);
  }

  const allSchedules: ReminderSchedule[] = JSON.parse(data);
  const schedule = allSchedules.find(s => s.userId === userId);

  return schedule || createDefaultReminderSchedule(userId);
}

function createDefaultReminderSchedule(userId: string): ReminderSchedule {
  const behavior = analyzeUserBehavior(userId);
  const nextScheduled = calculateOptimalReminderTime(userId);

  // Use peak activity times or defaults
  const preferredTimes = behavior.mostActiveHours.length > 0
    ? behavior.mostActiveHours.map(hour => ({ dayOfWeek: 1, hour })) // Monday by default
    : [{ dayOfWeek: 1, hour: 16 }]; // Monday 4 PM default

  return {
    userId,
    preferredTimes,
    frequency: 'daily',
    enabled: true,
    lastSent: new Date().toISOString(),
    nextScheduled: nextScheduled.toISOString(),
  };
}

export function updateReminderSchedule(userId: string, updates: Partial<ReminderSchedule>): ReminderSchedule {
  const data = localStorage.getItem(REMINDER_SCHEDULE_KEY);
  const allSchedules: ReminderSchedule[] = data ? JSON.parse(data) : [];

  const existingIndex = allSchedules.findIndex(s => s.userId === userId);
  const currentSchedule = existingIndex >= 0 ? allSchedules[existingIndex] : createDefaultReminderSchedule(userId);

  const updatedSchedule: ReminderSchedule = {
    ...currentSchedule,
    ...updates,
  };

  if (existingIndex >= 0) {
    allSchedules[existingIndex] = updatedSchedule;
  } else {
    allSchedules.push(updatedSchedule);
  }

  localStorage.setItem(REMINDER_SCHEDULE_KEY, JSON.stringify(allSchedules));

  return updatedSchedule;
}

// Nudge Management
export function saveNudges(nudges: Nudge[]): void {
  const data = localStorage.getItem(NUDGES_STORAGE_KEY);
  const allNudges: Nudge[] = data ? JSON.parse(data) : [];

  nudges.forEach(nudge => {
    const existingIndex = allNudges.findIndex(n => n.id === nudge.id);
    if (existingIndex >= 0) {
      allNudges[existingIndex] = nudge;
    } else {
      allNudges.push(nudge);
    }
  });

  localStorage.setItem(NUDGES_STORAGE_KEY, JSON.stringify(allNudges));
}

export function getUserNudges(userId: string, includeExpired: boolean = false): Nudge[] {
  const data = localStorage.getItem(NUDGES_STORAGE_KEY);
  if (!data) return [];

  const allNudges: Nudge[] = JSON.parse(data);
  const now = new Date();

  return allNudges
    .filter(n => {
      if (n.userId !== userId) return false;
      if (n.dismissed) return false;
      if (!includeExpired && n.expiresAt && new Date(n.expiresAt) < now) return false;
      return true;
    })
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

export function dismissNudge(nudgeId: string): void {
  const data = localStorage.getItem(NUDGES_STORAGE_KEY);
  if (!data) return;

  const allNudges: Nudge[] = JSON.parse(data);
  const nudge = allNudges.find(n => n.id === nudgeId);

  if (nudge) {
    nudge.dismissed = true;
    nudge.dismissedAt = new Date().toISOString();
    localStorage.setItem(NUDGES_STORAGE_KEY, JSON.stringify(allNudges));
  }
}

export function interactWithNudge(nudgeId: string): void {
  const data = localStorage.getItem(NUDGES_STORAGE_KEY);
  if (!data) return;

  const allNudges: Nudge[] = JSON.parse(data);
  const nudge = allNudges.find(n => n.id === nudgeId);

  if (nudge) {
    nudge.interacted = true;
    nudge.interactedAt = new Date().toISOString();
    localStorage.setItem(NUDGES_STORAGE_KEY, JSON.stringify(allNudges));
  }
}

// Auto-generate nudges periodically
export function refreshNudges(userId: string): void {
  const nudges = generatePersonalizedNudges(userId);
  saveNudges(nudges);
}
