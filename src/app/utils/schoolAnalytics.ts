/**
 * School-Level Analytics System
 * Aggregate analytics across all students in a school
 */

import { EngagementMetrics, getEngagementMetrics } from './engagementTracking';
import { StudentCognitiveProfile } from './teacherIntelligence';
import { GamificationProfile, getGamificationProfile } from './gamification';
import { getSavedLessonPlans } from './lessonPlannerStorage';

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

  // Growth metrics (real default until historical growth tracking is accumulated)
  const studentsImproving = 0;
  const studentsStagnant = totalStudents;
  const studentsRegressing = 0;
  const averageGrowthRate = 0;

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

/**
 * School overview calculated only from data the school admin can actually see: the school
 * roster and the assessment results fetched from the server. Nothing here is read from the
 * admin's own browser storage and nothing is a placeholder.
 */
export interface RealSchoolMetrics {
  schoolId: string;
  schoolName: string;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  assessedStudents: number;
  fullyAssessedStudents: number;
  activeStudents30: number; // completed at least one assessment in the last 30 days
  averageEngagementScore: number | null; // among assessed students
  riskCounts: { high: number; medium: number; low: number; unassessed: number };
  totalAssessments: number;
  assessmentsLast30: number;
  assessmentsPrev30: number;
  completion: { learning: number; thinking: number; decision: number }; // students who finished each
  styles: {
    learning: Record<string, number>;
    thinking: Record<string, number>;
    decision: Record<string, number>;
  };
}

type RiskResult = { engagementScore: number; risk: 'high' | 'medium' | 'low' | 'unassessed' };

const LEARNING_TYPES = ['kolb', 'vark', 'learning'];
const THINKING_TYPES = ['sternberg', 'jhs-thinking', 'shs-thinking', 'adult-thinking', 'child-thinking', 'thinking'];
const DECISION_TYPES = ['dual-process', 'decision'];

export function assessmentGroup(type: string): string {
  if (LEARNING_TYPES.includes(type)) return 'learning';
  if (THINKING_TYPES.includes(type)) return 'thinking';
  if (DECISION_TYPES.includes(type)) return 'decision';
  return type;
}

export function calculateRealSchoolMetrics(args: {
  schoolId: string;
  schoolName: string;
  students: any[];
  teachers: any[];
  classes: any[];
  assessments: any[];
  scoreStudent: (student: any, assessments: any[], completedTypes: string[]) => RiskResult;
  getStyles: (assessments: any[]) => { learningStyle: string; thinkingStyle: string; decisionStyle: string };
}): RealSchoolMetrics {
  const { students, teachers, classes, assessments, scoreStudent, getStyles } = args;
  const DAY = 24 * 60 * 60 * 1000;
  const now = Date.now();

  const byStudent = new Map<string, any[]>();
  assessments.forEach(a => {
    if (!a?.userId || !a.completedAt) return;
    if (!byStudent.has(a.userId)) byStudent.set(a.userId, []);
    byStudent.get(a.userId)!.push(a);
  });

  const riskCounts = { high: 0, medium: 0, low: 0, unassessed: 0 };
  const completion = { learning: 0, thinking: 0, decision: 0 };
  const styles = { learning: {} as Record<string, number>, thinking: {} as Record<string, number>, decision: {} as Record<string, number> };
  let engagementSum = 0;
  let assessedStudents = 0;
  let fullyAssessedStudents = 0;
  let activeStudents30 = 0;
  let totalAssessments = 0;
  let assessmentsLast30 = 0;
  let assessmentsPrev30 = 0;

  const bump = (map: Record<string, number>, key: string) => {
    if (!key || key === 'Pending' || key === 'Unknown') return;
    map[key] = (map[key] || 0) + 1;
  };

  students.forEach(student => {
    const mine = byStudent.get(student.id) || [];
    if (mine.length === 0) { riskCounts.unassessed++; return; }

    assessedStudents++;
    totalAssessments += mine.length;
    const types = [...new Set(mine.map(a => assessmentGroup(a.type)))];
    if (types.includes('learning')) completion.learning++;
    if (types.includes('thinking')) completion.thinking++;
    if (types.includes('decision')) completion.decision++;
    if (types.includes('learning') && types.includes('thinking') && types.includes('decision')) fullyAssessedStudents++;

    let recent = false;
    mine.forEach(a => {
      const age = now - new Date(a.completedAt).getTime();
      if (age >= 0 && age < 30 * DAY) { assessmentsLast30++; recent = true; }
      else if (age >= 30 * DAY && age < 60 * DAY) assessmentsPrev30++;
    });
    if (recent) activeStudents30++;

    const { engagementScore, risk } = scoreStudent(student, mine, types);
    engagementSum += engagementScore;
    riskCounts[risk]++;

    const st = getStyles(mine);
    bump(styles.learning, st.learningStyle);
    bump(styles.thinking, st.thinkingStyle);
    bump(styles.decision, st.decisionStyle);
  });

  return {
    schoolId: args.schoolId,
    schoolName: args.schoolName,
    totalStudents: students.length,
    totalTeachers: teachers.length,
    totalClasses: classes.length,
    assessedStudents,
    fullyAssessedStudents,
    activeStudents30,
    averageEngagementScore: assessedStudents ? Math.round(engagementSum / assessedStudents) : null,
    riskCounts,
    totalAssessments,
    assessmentsLast30,
    assessmentsPrev30,
    completion,
    styles,
  };
}

export function generateRealSchoolInsights(m: RealSchoolMetrics): SchoolInsight[] {
  const insights: SchoolInsight[] = [];
  if (m.totalStudents === 0) return insights;
  const pct = (n: number) => Math.round((n / m.totalStudents) * 100);

  if (m.riskCounts.unassessed > 0) {
    const share = pct(m.riskCounts.unassessed);
    insights.push({
      id: 'unassessed_students',
      type: share >= 50 ? 'alert' : 'warning',
      title: `${m.riskCounts.unassessed} student${m.riskCounts.unassessed === 1 ? ' has' : 's have'} not started assessments`,
      description: `${share}% of students have not completed any assessment yet, so there is no profile for them.`,
      affectedCount: m.riskCounts.unassessed,
      priority: share >= 50 ? 'high' : 'medium',
      actionItems: ['Share student codes and sign-in steps with these students', 'Set aside class time for the first assessment', 'Ask teachers to remind their classes'],
      category: 'engagement',
    });
  }

  if (m.riskCounts.high > 0) {
    insights.push({
      id: 'at_risk_students',
      type: 'alert',
      title: `${m.riskCounts.high} student${m.riskCounts.high === 1 ? ' is' : 's are'} at risk`,
      description: 'These students have very low engagement or have been inactive for a long time. This is based on participation, not on their style results.',
      affectedCount: m.riskCounts.high,
      priority: 'critical',
      actionItems: ['Check in with each student one to one', 'Ask their teacher about attendance and participation', 'Invite them to retake or finish their assessments'],
      category: 'engagement',
    });
  }

  if (m.riskCounts.medium > 0) {
    insights.push({
      id: 'needs_support_students',
      type: 'warning',
      title: `${m.riskCounts.medium} student${m.riskCounts.medium === 1 ? ' needs' : 's need'} support`,
      description: 'These students have finished only part of the assessments or their activity is slowing down.',
      affectedCount: m.riskCounts.medium,
      priority: 'medium',
      actionItems: ['Prompt them to finish the remaining assessments', 'Review progress again in two weeks'],
      category: 'engagement',
    });
  }

  if (m.assessedStudents > 0 && m.assessmentsPrev30 > 0 && m.assessmentsLast30 < m.assessmentsPrev30 / 2) {
    insights.push({
      id: 'activity_drop',
      type: 'warning',
      title: 'Assessment activity has dropped',
      description: `${m.assessmentsLast30} assessments were completed in the last 30 days, down from ${m.assessmentsPrev30} in the 30 days before.`,
      affectedCount: m.assessedStudents,
      priority: 'high',
      actionItems: ['Find out whether something changed, such as exams or holidays', 'Plan a short class activity to restart momentum'],
      category: 'engagement',
    });
  }

  if (m.riskCounts.unassessed === 0 && m.riskCounts.high === 0 && m.totalStudents > 0) {
    insights.push({
      id: 'healthy_participation',
      type: 'success',
      title: 'Every student has started and none are at risk',
      description: `${pct(m.fullyAssessedStudents)}% of students have finished all three core assessments.`,
      affectedCount: m.totalStudents,
      priority: 'low',
      actionItems: ['Use the Styles tab to plan teaching that suits the most common styles'],
      category: 'engagement',
    });
  }

  const order = { critical: 0, high: 1, medium: 2, low: 3 } as const;
  return insights.sort((a, b) => order[a.priority] - order[b.priority]);
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
  const totalStudents = teacherClasses.reduce((sum, c) => sum + c.studentCount, 0);

  const averageClassEngagement =
    teacherClasses.reduce((sum, c) => c.averageEngagementScore, 0) / teacherClasses.length || 0;

  const averageStudentGrowth =
    teacherClasses.reduce((sum, c) => c.averageGrowthRate, 0) / teacherClasses.length || 0;

  const studentsNeedingSupport = teacherClasses.reduce(
    (sum, c) => sum + c.needsAttention.length,
    0
  );

  const differentiatedLessonsCreated = getSavedLessonPlans().filter(p => p.teacherId === teacherId).length;

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
