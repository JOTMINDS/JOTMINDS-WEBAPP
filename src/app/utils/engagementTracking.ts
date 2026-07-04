/**
 * Engagement Tracking System
 * Tracks user activity, session duration, feature usage, and engagement patterns
 */

export interface ActivityLog {
  id: string;
  userId: string;
  activityType: 'assessment' | 'brain_gym' | 'career_exploration' | 'profile_view' | 'skill_plan' | 'gamification' | 'profile_improvement' | 'login' | 'logout';
  timestamp: string;
  duration?: number; // in seconds
  metadata?: Record<string, any>;
}

export interface EngagementMetrics {
  userId: string;
  totalSessions: number;
  totalTimeSpent: number; // in minutes
  averageSessionDuration: number; // in minutes
  lastActive: string;
  activeDays: number;
  engagementScore: number; // 0-100
  featureUsage: {
    assessments: number;
    brainGym: number;
    careerExploration: number;
    profileViews: number;
    skillPlans: number;
    gamification: number;
  };
  weeklyActivity: {
    week: string;
    sessions: number;
    timeSpent: number;
    activities: number;
  }[];
  peakActivityTimes: {
    hour: number;
    dayOfWeek: number;
    activityCount: number;
  }[];
  streakData: {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string;
  };
}

export interface EngagementInsight {
  id: string;
  type: 'positive' | 'warning' | 'suggestion';
  title: string;
  description: string;
  metric: string;
  value: number;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendation?: string;
}

import { safeParse } from './storage';

const STORAGE_KEY = 'jotminds_engagement_tracking';

function getActivityLogs(userId: string): ActivityLog[] {
  const allLogs = safeParse<ActivityLog[]>(STORAGE_KEY, []);
  return allLogs.filter(log => log.userId === userId);
}

function saveActivityLog(log: ActivityLog): void {
  const allLogs = safeParse<ActivityLog[]>(STORAGE_KEY, []);
  allLogs.push(log);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allLogs));
}

export function trackActivity(
  userId: string,
  activityType: ActivityLog['activityType'],
  duration?: number,
  metadata?: Record<string, any>
): void {
  const log: ActivityLog = {
    id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    activityType,
    timestamp: new Date().toISOString(),
    duration,
    metadata,
  };
  saveActivityLog(log);
}

export function getEngagementMetrics(userId: string): EngagementMetrics {
  const logs = getActivityLogs(userId);

  if (logs.length === 0) {
    return {
      userId,
      totalSessions: 0,
      totalTimeSpent: 0,
      averageSessionDuration: 0,
      lastActive: new Date().toISOString(),
      activeDays: 0,
      engagementScore: 0,
      featureUsage: {
        assessments: 0,
        brainGym: 0,
        careerExploration: 0,
        profileViews: 0,
        skillPlans: 0,
        gamification: 0,
      },
      weeklyActivity: [],
      peakActivityTimes: [],
      streakData: {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: new Date().toISOString(),
      },
    };
  }

  // Calculate sessions (login/logout pairs or activity clusters)
  const loginLogs = logs.filter(l => l.activityType === 'login');
  const totalSessions = Math.max(loginLogs.length, 1);

  // Calculate total time spent
  const totalTimeSpent = logs.reduce((sum, log) => sum + (log.duration || 0), 0) / 60; // convert to minutes

  // Average session duration
  const averageSessionDuration = totalTimeSpent / totalSessions;

  // Last active
  const lastActive = logs[logs.length - 1].timestamp;

  // Active days
  const uniqueDays = new Set(logs.map(log => log.timestamp.split('T')[0]));
  const activeDays = uniqueDays.size;

  // Feature usage
  const featureUsage = {
    assessments: logs.filter(l => l.activityType === 'assessment').length,
    brainGym: logs.filter(l => l.activityType === 'brain_gym').length,
    careerExploration: logs.filter(l => l.activityType === 'career_exploration').length,
    profileViews: logs.filter(l => l.activityType === 'profile_view').length,
    skillPlans: logs.filter(l => l.activityType === 'skill_plan').length,
    gamification: logs.filter(l => l.activityType === 'gamification').length,
  };

  // Weekly activity
  const weeklyActivity = calculateWeeklyActivity(logs);

  // Peak activity times
  const peakActivityTimes = calculatePeakActivityTimes(logs);

  // Streak data
  const streakData = calculateStreakData(logs);

  // Engagement score (0-100)
  const engagementScore = calculateEngagementScore({
    activeDays,
    totalSessions,
    averageSessionDuration,
    featureUsage,
    streakData,
  });

  return {
    userId,
    totalSessions,
    totalTimeSpent,
    averageSessionDuration,
    lastActive,
    activeDays,
    engagementScore,
    featureUsage,
    weeklyActivity,
    peakActivityTimes,
    streakData,
  };
}

function calculateWeeklyActivity(logs: ActivityLog[]): EngagementMetrics['weeklyActivity'] {
  const weekMap = new Map<string, { sessions: number; timeSpent: number; activities: number }>();

  logs.forEach(log => {
    const date = new Date(log.timestamp);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, { sessions: 0, timeSpent: 0, activities: 0 });
    }

    const weekData = weekMap.get(weekKey)!;
    weekData.activities++;
    weekData.timeSpent += (log.duration || 0) / 60;
    if (log.activityType === 'login') {
      weekData.sessions++;
    }
  });

  return Array.from(weekMap.entries())
    .map(([week, data]) => ({ week, ...data }))
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-12); // Last 12 weeks
}

function calculatePeakActivityTimes(logs: ActivityLog[]): EngagementMetrics['peakActivityTimes'] {
  const timeMap = new Map<string, number>();

  logs.forEach(log => {
    const date = new Date(log.timestamp);
    const hour = date.getHours();
    const dayOfWeek = date.getDay();
    const key = `${dayOfWeek}-${hour}`;

    timeMap.set(key, (timeMap.get(key) || 0) + 1);
  });

  return Array.from(timeMap.entries())
    .map(([key, count]) => {
      const [dayOfWeek, hour] = key.split('-').map(Number);
      return { hour, dayOfWeek, activityCount: count };
    })
    .sort((a, b) => b.activityCount - a.activityCount)
    .slice(0, 5);
}

function calculateStreakData(logs: ActivityLog[]): EngagementMetrics['streakData'] {
  const sortedDates = Array.from(
    new Set(logs.map(log => log.timestamp.split('T')[0]))
  ).sort();

  if (sortedDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: new Date().toISOString(),
    };
  }

  let currentStreak = 1;
  let longestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      tempStreak++;
      if (i === sortedDates.length - 1) {
        currentStreak = tempStreak;
      }
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
      if (i === sortedDates.length - 1) {
        currentStreak = 1;
      }
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  // Check if streak is still active (last activity within 1 day)
  const lastDate = new Date(sortedDates[sortedDates.length - 1]);
  const today = new Date();
  const daysSinceLastActivity = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceLastActivity > 1) {
    currentStreak = 0;
  }

  return {
    currentStreak,
    longestStreak,
    lastActivityDate: sortedDates[sortedDates.length - 1],
  };
}

function calculateEngagementScore(data: {
  activeDays: number;
  totalSessions: number;
  averageSessionDuration: number;
  featureUsage: EngagementMetrics['featureUsage'];
  streakData: EngagementMetrics['streakData'];
}): number {
  const { activeDays, totalSessions, averageSessionDuration, featureUsage, streakData } = data;

  // Component scores (each 0-25)
  const activityScore = Math.min((activeDays / 30) * 25, 25); // 30 days = max
  const sessionScore = Math.min((totalSessions / 50) * 25, 25); // 50 sessions = max
  const durationScore = Math.min((averageSessionDuration / 30) * 25, 25); // 30 min avg = max

  const featureCount = Object.values(featureUsage).filter(v => v > 0).length;
  const diversityScore = (featureCount / 6) * 25; // Using all 6 features = max

  const engagementScore = activityScore + sessionScore + durationScore + diversityScore;

  // Streak bonus (up to +10)
  const streakBonus = Math.min((streakData.currentStreak / 30) * 10, 10);

  return Math.min(Math.round(engagementScore + streakBonus), 100);
}

export function generateEngagementInsights(metrics: EngagementMetrics): EngagementInsight[] {
  const insights: EngagementInsight[] = [];

  // High engagement
  if (metrics.engagementScore >= 80) {
    insights.push({
      id: 'high_engagement',
      type: 'positive',
      title: 'Exceptional Engagement',
      description: 'You are highly engaged with the platform and making excellent progress!',
      metric: 'Engagement Score',
      value: metrics.engagementScore,
      priority: 'high',
      actionable: false,
    });
  }

  // Low engagement warning
  if (metrics.engagementScore < 30) {
    insights.push({
      id: 'low_engagement',
      type: 'warning',
      title: 'Engagement Opportunity',
      description: 'Increased platform usage can help accelerate your cognitive development.',
      metric: 'Engagement Score',
      value: metrics.engagementScore,
      priority: 'high',
      actionable: true,
      recommendation: 'Try completing at least one activity per day to build momentum.',
    });
  }

  // Active streak
  if (metrics.streakData.currentStreak >= 7) {
    insights.push({
      id: 'active_streak',
      type: 'positive',
      title: `${metrics.streakData.currentStreak}-Day Streak!`,
      description: 'Consistent daily practice is building strong learning habits.',
      metric: 'Current Streak',
      value: metrics.streakData.currentStreak,
      priority: 'medium',
      actionable: false,
    });
  }

  // Broken streak
  const daysSinceActive = Math.floor(
    (new Date().getTime() - new Date(metrics.lastActive).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceActive > 3 && metrics.streakData.longestStreak > 0) {
    insights.push({
      id: 'broken_streak',
      type: 'warning',
      title: 'Streak at Risk',
      description: `You haven't been active in ${daysSinceActive} days. Your longest streak was ${metrics.streakData.longestStreak} days!`,
      metric: 'Days Since Active',
      value: daysSinceActive,
      priority: 'medium',
      actionable: true,
      recommendation: 'Log in today to restart your learning streak.',
    });
  }

  // Feature diversity
  const featuresUsed = Object.values(metrics.featureUsage).filter(v => v > 0).length;
  if (featuresUsed <= 2) {
    insights.push({
      id: 'low_feature_diversity',
      type: 'suggestion',
      title: 'Explore More Features',
      description: `You've only used ${featuresUsed} out of 6 platform features.`,
      metric: 'Features Used',
      value: featuresUsed,
      priority: 'low',
      actionable: true,
      recommendation: 'Try the Career Exploration or Brain Gym features to diversify your learning.',
    });
  }

  // Session duration
  if (metrics.averageSessionDuration < 5 && metrics.totalSessions > 10) {
    insights.push({
      id: 'short_sessions',
      type: 'suggestion',
      title: 'Short Session Duration',
      description: 'Longer, focused sessions can lead to deeper learning.',
      metric: 'Avg Session Duration',
      value: Math.round(metrics.averageSessionDuration),
      priority: 'low',
      actionable: true,
      recommendation: 'Aim for at least 15-20 minute sessions for optimal learning.',
    });
  }

  return insights.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

export function getAllActivityLogs(): ActivityLog[] {
  return safeParse<ActivityLog[]>(STORAGE_KEY, []);
}
