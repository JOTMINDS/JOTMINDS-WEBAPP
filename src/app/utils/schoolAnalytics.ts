/**
 * School-Level Analytics System
 * Aggregate analytics across all students in a school
 */

import { EngagementMetrics, getEngagementMetrics } from './engagementTracking';
import { StudentCognitiveProfile } from './teacherIntelligence';
import { GamificationProfile, getGamificationProfile } from './gamification';

export interface SchoolMetrics {
  schoolId: string;
  schoolName: string;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  lastUpdated: string;

  // Engagement metrics
  averageEngagementScore: number;
  activeStudents: number; // Active in last 7 days
  totalSessions: number;
  totalTimeSpent: number; // in hours

  // Performance metrics
  averageCognitiveScore: number;
  performanceDistribution: {
    excellent: number; // > 80
    good: number; // 60-80
    average: number; // 40-60
    needsSupport: number; // < 40
  };

  // Growth metrics
  averageGrowthRate: number;
  studentsImproving: number;
  studentsStagnant: number;
  studentsRegressing: number;

  // Gamification metrics
  totalBadgesEarned: number;
  totalXPEarned: number;
  averageLevel: number;
  challengeCompletionRate: number;

  // Feature adoption
  featureAdoption: {
    assessments: number;
    brainGym: number;
    careerExploration: number;
    profileImprovement: number;
    gamification: number;
  };

  // Grade/Class breakdown
  gradeMetrics: {
    grade: string;
    studentCount: number;
    averageScore: number;
    engagementScore: number;
  }[];
}

export interface ClassMetrics {
  classId: string;
  className: string;
  grade: string;
  teacherId: string;
  teacherName: string;
  studentCount: number;
  averageEngagementScore: number;
  averageCognitiveScore: number;
  averageGrowthRate: number;
  activeStudentsPercentage: number;
  topPerformers: string[];
  needsAttention: string[];
  lastUpdated: string;
}

export interface TeacherPerformance {
  teacherId: string;
  teacherName: string;
  classesManaged: number;
  totalStudents: number;
  averageClassEngagement: number;
  averageStudentGrowth: number;
  studentsNeedingSupport: number;
  differentiatedLessonsCreated: number;
  lastActive: string;
  performanceRating: 'excellent' | 'good' | 'average' | 'needs_improvement';
}

export interface SchoolTrend {
  id: string;
  metric: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercent: number;
  timeframe: 'week' | 'month' | 'quarter';
  significance: 'high' | 'medium' | 'low';
  description: string;
}

export interface SchoolInsight {
  id: string;
  type: 'success' | 'warning' | 'alert' | 'info';
  title: string;
  description: string;
  affectedCount: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  actionItems: string[];
  category: 'engagement' | 'performance' | 'teacher' | 'feature' | 'growth';
}

const STORAGE_KEY = 'jotminds_school_analytics';

export function calculateSchoolMetrics(
  schoolId: string,
  schoolName: string,
  students: StudentCognitiveProfile[],
  teachers: { id: string; name: string; classIds: string[] }[],
  classes: { id: string; name: string; grade: string }[]
): SchoolMetrics {
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalClasses = classes.length;

  // Engagement metrics
  const engagementMetrics = students.map(s => getEngagementMetrics(s.userId));
  const averageEngagementScore =
    engagementMetrics.reduce((sum, m) => sum + m.engagementScore, 0) / totalStudents || 0;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const activeStudents = engagementMetrics.filter(
    m => new Date(m.lastActive) > sevenDaysAgo
  ).length;

  const totalSessions = engagementMetrics.reduce((sum, m) => sum + m.totalSessions, 0);
  const totalTimeSpent = engagementMetrics.reduce((sum, m) => sum + m.totalTimeSpent, 0) / 60; // convert to hours

  // Performance metrics
  const cognitiveScores = students.map(s => {
    const scores = Object.values(s.cognitiveScores);
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  });

  const averageCognitiveScore =
    cognitiveScores.reduce((sum, score) => sum + score, 0) / totalStudents || 0;

  const performanceDistribution = {
    excellent: cognitiveScores.filter(s => s > 80).length,
    good: cognitiveScores.filter(s => s >= 60 && s <= 80).length,
    average: cognitiveScores.filter(s => s >= 40 && s < 60).length,
    needsSupport: cognitiveScores.filter(s => s < 40).length,
  };

  // Growth metrics (mock calculation - would need historical data)
  const studentsImproving = Math.floor(totalStudents * 0.6);
  const studentsStagnant = Math.floor(totalStudents * 0.3);
  const studentsRegressing = totalStudents - studentsImproving - studentsStagnant;
  const averageGrowthRate = 12.5;

  // Gamification metrics
  const gamificationProfiles = students.map(s => getGamificationProfile(s.userId));
  const totalBadgesEarned = gamificationProfiles.reduce((sum, p) => sum + p.badges.length, 0);
  const totalXPEarned = gamificationProfiles.reduce((sum, p) => sum + ((p as any).totalXP || p.xp || 0), 0);
  const averageLevel =
    gamificationProfiles.reduce((sum, p) => sum + p.level, 0) / totalStudents || 0;

  const totalChallenges = gamificationProfiles.reduce(
    (sum, p) => sum + (p.dailyChallengesCompleted || 0) + (p.weeklyChallengesCompleted || 0),
    0
  );
  const challengeCompletionRate = (totalChallenges / (totalStudents * 10)) * 100; // Assuming 10 challenges per student

  // Feature adoption
  const featureAdoption = {
    assessments: engagementMetrics.filter(m => m.featureUsage.assessments > 0).length,
    brainGym: engagementMetrics.filter(m => m.featureUsage.brainGym > 0).length,
    careerExploration: engagementMetrics.filter(m => m.featureUsage.careerExploration > 0).length,
    profileImprovement: engagementMetrics.filter(m => m.featureUsage.profileViews > 0).length,
    gamification: engagementMetrics.filter(m => m.featureUsage.gamification > 0).length,
  };

  // Grade breakdown
  const gradeMap = new Map<string, { students: StudentCognitiveProfile[]; engagement: number[] }>();

  students.forEach((student, idx) => {
    if (!gradeMap.has(student.grade)) {
      gradeMap.set(student.grade, { students: [], engagement: [] });
    }
    gradeMap.get(student.grade)!.students.push(student);
    gradeMap.get(student.grade)!.engagement.push(engagementMetrics[idx].engagementScore);
  });

  const gradeMetrics = Array.from(gradeMap.entries()).map(([grade, data]) => {
    const avgScore =
      data.students.reduce((sum, s) => {
        const scores = Object.values(s.cognitiveScores);
        return sum + scores.reduce((a, b) => a + b, 0) / scores.length;
      }, 0) / data.students.length;

    const avgEngagement =
      data.engagement.reduce((sum, e) => sum + e, 0) / data.engagement.length;

    return {
      grade,
      studentCount: data.students.length,
      averageScore: Math.round(avgScore),
      engagementScore: Math.round(avgEngagement),
    };
  });

  return {
    schoolId,
    schoolName,
    totalStudents,
    totalTeachers,
    totalClasses,
    lastUpdated: new Date().toISOString(),
    averageEngagementScore: Math.round(averageEngagementScore),
    activeStudents,
    totalSessions,
    totalTimeSpent: Math.round(totalTimeSpent * 10) / 10,
    averageCognitiveScore: Math.round(averageCognitiveScore),
    performanceDistribution,
    averageGrowthRate,
    studentsImproving,
    studentsStagnant,
    studentsRegressing,
    totalBadgesEarned,
    totalXPEarned,
    averageLevel: Math.round(averageLevel * 10) / 10,
    challengeCompletionRate: Math.round(challengeCompletionRate),
    featureAdoption,
    gradeMetrics,
  };
}

export function generateSchoolInsights(metrics: SchoolMetrics): SchoolInsight[] {
  const insights: SchoolInsight[] = [];

  // Low engagement alert
  if (metrics.averageEngagementScore < 40) {
    insights.push({
      id: 'low_school_engagement',
      type: 'alert',
      title: 'Low School-Wide Engagement',
      description: `Average engagement score is ${metrics.averageEngagementScore}%, below the recommended 60% threshold.`,
      affectedCount: metrics.totalStudents,
      priority: 'critical',
      actionItems: [
        'Review teacher adoption and training needs',
        'Increase student awareness campaigns',
        'Implement incentive programs for active participation',
      ],
      category: 'engagement',
    });
  }

  // High performance success
  if (metrics.performanceDistribution.excellent > metrics.totalStudents * 0.3) {
    insights.push({
      id: 'high_performers',
      type: 'success',
      title: 'Strong Academic Performance',
      description: `${metrics.performanceDistribution.excellent} students (${Math.round((metrics.performanceDistribution.excellent / metrics.totalStudents) * 100)}%) are performing excellently.`,
      affectedCount: metrics.performanceDistribution.excellent,
      priority: 'medium',
      actionItems: [
        'Continue current teaching strategies',
        'Share best practices across classes',
        'Consider advanced enrichment programs',
      ],
      category: 'performance',
    });
  }

  // Students needing support
  if (metrics.performanceDistribution.needsSupport > metrics.totalStudents * 0.2) {
    insights.push({
      id: 'students_need_support',
      type: 'warning',
      title: 'Students Requiring Additional Support',
      description: `${metrics.performanceDistribution.needsSupport} students need additional academic support.`,
      affectedCount: metrics.performanceDistribution.needsSupport,
      priority: 'high',
      actionItems: [
        'Identify specific learning gaps',
        'Implement targeted intervention programs',
        'Increase teacher-student interaction time',
        'Consider peer tutoring programs',
      ],
      category: 'performance',
    });
  }

  // Low feature adoption
  const totalFeatureUsers = Object.values(metrics.featureAdoption).reduce((sum, v) => sum + v, 0) / 5;
  const adoptionRate = (totalFeatureUsers / metrics.totalStudents) * 100;

  if (adoptionRate < 50) {
    insights.push({
      id: 'low_feature_adoption',
      type: 'warning',
      title: 'Low Platform Feature Adoption',
      description: `Only ${Math.round(adoptionRate)}% of students are actively using platform features.`,
      affectedCount: metrics.totalStudents - Math.round(totalFeatureUsers),
      priority: 'high',
      actionItems: [
        'Provide feature walkthrough sessions',
        'Create student engagement challenges',
        'Ensure teacher integration in curriculum',
      ],
      category: 'feature',
    });
  }

  // Inactive students
  const inactiveStudents = metrics.totalStudents - metrics.activeStudents;
  if (inactiveStudents > metrics.totalStudents * 0.25) {
    insights.push({
      id: 'inactive_students',
      type: 'alert',
      title: 'High Inactive Student Count',
      description: `${inactiveStudents} students (${Math.round((inactiveStudents / metrics.totalStudents) * 100)}%) haven't been active in the last week.`,
      affectedCount: inactiveStudents,
      priority: 'high',
      actionItems: [
        'Conduct student outreach',
        'Investigate access or technical barriers',
        'Implement re-engagement campaigns',
      ],
      category: 'engagement',
    });
  }

  // Strong growth
  if (metrics.studentsImproving > metrics.totalStudents * 0.7) {
    insights.push({
      id: 'strong_growth',
      type: 'success',
      title: 'Excellent Student Growth',
      description: `${metrics.studentsImproving} students are showing consistent improvement.`,
      affectedCount: metrics.studentsImproving,
      priority: 'medium',
      actionItems: [
        'Document successful teaching strategies',
        'Celebrate student achievements',
        'Maintain current growth trajectory',
      ],
      category: 'growth',
    });
  }

  return insights.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

export function calculateTeacherPerformance(
  teacherId: string,
  teacherName: string,
  classes: ClassMetrics[]
): TeacherPerformance {
  const teacherClasses = classes.filter(c => c.teacherId === teacherId);
  const totalStudents = teacherClasses.reduce((sum, c) => c.studentCount, 0);

  const averageClassEngagement =
    teacherClasses.reduce((sum, c) => c.averageEngagementScore, 0) / teacherClasses.length || 0;

  const averageStudentGrowth =
    teacherClasses.reduce((sum, c) => c.averageGrowthRate, 0) / teacherClasses.length || 0;

  const studentsNeedingSupport = teacherClasses.reduce(
    (sum, c) => sum + c.needsAttention.length,
    0
  );

  const differentiatedLessonsCreated = Math.floor(Math.random() * 20) + 5; // Mock data

  const lastActive = new Date().toISOString();

  // Performance rating
  let performanceRating: TeacherPerformance['performanceRating'];
  if (averageClassEngagement >= 70 && averageStudentGrowth >= 15) {
    performanceRating = 'excellent';
  } else if (averageClassEngagement >= 50 && averageStudentGrowth >= 10) {
    performanceRating = 'good';
  } else if (averageClassEngagement >= 30 && averageStudentGrowth >= 5) {
    performanceRating = 'average';
  } else {
    performanceRating = 'needs_improvement';
  }

  return {
    teacherId,
    teacherName,
    classesManaged: teacherClasses.length,
    totalStudents,
    averageClassEngagement: Math.round(averageClassEngagement),
    averageStudentGrowth: Math.round(averageStudentGrowth * 10) / 10,
    studentsNeedingSupport,
    differentiatedLessonsCreated,
    lastActive,
    performanceRating,
  };
}

export function saveSchoolMetrics(metrics: SchoolMetrics): void {
  const data = localStorage.getItem(STORAGE_KEY);
  const allMetrics: SchoolMetrics[] = data ? JSON.parse(data) : [];

  const existingIndex = allMetrics.findIndex(m => m.schoolId === metrics.schoolId);
  if (existingIndex >= 0) {
    allMetrics[existingIndex] = metrics;
  } else {
    allMetrics.push(metrics);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(allMetrics));
}

export function getSchoolMetrics(schoolId: string): SchoolMetrics | null {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;

  const allMetrics: SchoolMetrics[] = JSON.parse(data);
  return allMetrics.find(m => m.schoolId === schoolId) || null;
}
