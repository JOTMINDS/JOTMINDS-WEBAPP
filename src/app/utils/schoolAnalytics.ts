/**
 * School-Level Analytics
 * Aggregate figures for a school, calculated from the roster and server assessment results.
 */

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
