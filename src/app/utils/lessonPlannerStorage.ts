import {
  LessonPlan,
  ClassCognitiveSummary,
  LessonDeliverySession,
  PostLessonReflection,
  CurriculumTrack,
  TeacherPerformanceMetric,
  GeneratedAssessment,
  CopilotChatMessage
} from '../types/lessonPlannerTypes';

const STORAGE_KEYS = {
  LESSON_PLANS: 'jm_lesson_plans',
  CLASS_COGNITIVE_SUMMARIES: 'jm_class_cognitive_summaries',
  DELIVERY_SESSIONS: 'jm_lesson_delivery_sessions',
  REFLECTIONS: 'jm_lesson_reflections',
  CURRICULUM_TRACKS: 'jm_curriculum_tracks',
  PERFORMANCE_METRICS: 'jm_teacher_performance_metrics',
  COPILOT_CHAT: 'jm_copilot_chat_history'
};

// ─── INITIAL MOCK DATA ──────────────────────────────────────────────────────────

export const initialMockClassSummary: ClassCognitiveSummary = {
  classId: 'all-students',
  className: 'My Students',
  totalStudents: 0,
  learningStylesBreakdown: {
    visualPct: 0,
    auditoryPct: 0,
    readWritePct: 0,
    kinestheticPct: 0
  },
  topCognitiveStrengths: [],
  riskAlerts: [],
  flaggedStudents: [],
  recommendedTeachingStyle: {
    title: 'Differentiated Guided Practice',
    strategies: [
      'Assess student learning styles to receive tailored recommendations.'
    ]
  }
};

export const initialMockLessonPlans: LessonPlan[] = [];

// No curriculum topics have been tracked yet - this starts empty rather
// than showing fabricated sample topics/percentages.
export const initialCurriculumTrack: CurriculumTrack = {
  frameworkName: 'National Curriculum (NaCCA / GES)',
  subject: '',
  grade: '',
  totalTopics: 0,
  coveredTopicsCount: 0,
  completionPercentage: 0,
  topics: []
};

// ─── STORAGE HELPER FUNCTIONS ──────────────────────────────────────────────────

export function getSavedLessonPlans(teacherId?: string): LessonPlan[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEYS.LESSON_PLANS);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Filter out legacy mock lesson plans if previously cached
      const plans = Array.isArray(parsed) ? parsed.filter((p: any) => p.id !== 'lp-001' && !p.id?.startsWith('mock-')) : [];
      if (teacherId) {
        return plans.filter((p: LessonPlan) => p.teacherId === teacherId);
      }
      return plans;
    } catch (e) {
      console.error('Failed to parse lesson plans from localStorage', e);
    }
  }
  return [];
}

export function saveLessonPlan(plan: LessonPlan): void {
  const plans = getSavedLessonPlans();
  const index = plans.findIndex(p => p.id === plan.id);
  if (index >= 0) {
    plans[index] = plan;
  } else {
    plans.unshift(plan);
  }
  localStorage.setItem(STORAGE_KEYS.LESSON_PLANS, JSON.stringify(plans));
}

export function deleteLessonPlan(planId: string): void {
  const plans = getSavedLessonPlans().filter(p => p.id !== planId);
  localStorage.setItem(STORAGE_KEYS.LESSON_PLANS, JSON.stringify(plans));
}

export function getClassCognitiveSummary(classId?: string): ClassCognitiveSummary {
  if (typeof window === 'undefined') return initialMockClassSummary;
  const saved = localStorage.getItem(STORAGE_KEYS.CLASS_COGNITIVE_SUMMARIES);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed[classId || 'all-students']) return parsed[classId || 'all-students'];
      const firstKey = Object.keys(parsed)[0];
      if (firstKey && parsed[firstKey]) return parsed[firstKey];
    } catch (e) {}
  }
  return initialMockClassSummary;
}

export function savePostLessonReflection(reflection: PostLessonReflection): void {
  if (typeof window === 'undefined') return;
  const saved = localStorage.getItem(STORAGE_KEYS.REFLECTIONS);
  let arr: PostLessonReflection[] = [];
  if (saved) {
    try {
      arr = JSON.parse(saved);
    } catch (e) {}
  }
  arr.unshift(reflection);
  localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(arr));
}

export function getPostLessonReflections(teacherId?: string): PostLessonReflection[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEYS.REFLECTIONS);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      const reflections = Array.isArray(parsed) ? parsed : [];
      if (teacherId) {
        return reflections.filter((r: PostLessonReflection) => r.teacherId === teacherId);
      }
      return reflections;
    } catch (e) {}
  }
  return [];
}

export function getCurriculumTrack(): CurriculumTrack {
  if (typeof window === 'undefined') return initialCurriculumTrack;
  const saved = localStorage.getItem(STORAGE_KEYS.CURRICULUM_TRACKS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  return initialCurriculumTrack;
}

export function saveCurriculumTrack(track: CurriculumTrack): void {
  localStorage.setItem(STORAGE_KEYS.CURRICULUM_TRACKS, JSON.stringify(track));
}

const DELIVERED_STATUSES = ['delivered', 'reviewed', 'completed'];
const UNDERSTANDING_TO_RATING: Record<string, number> = { Excellent: 5, Good: 4, Average: 3, Poor: 2 };

/**
 * Derives the teacher's planner analytics from their real lesson plans, reflections and
 * curriculum tracker. Nothing here is a stored or placeholder figure.
 */
export function getTeacherPerformanceMetrics(teacherId?: string): TeacherPerformanceMetric {
  const now = new Date();
  const plans = getSavedLessonPlans(teacherId);
  const reflections = getPostLessonReflections(teacherId);

  const inThisMonth = (iso?: string) => {
    if (!iso) return false;
    const d = new Date(iso);
    return !isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  const monthPlans = plans.filter(p => inThisMonth(p.createdAt));
  const monthReflections = reflections.filter(r => inThisMonth(r.reflectedAt));
  const ratings = monthReflections
    .map(r => UNDERSTANDING_TO_RATING[r.studentUnderstandingLevel])
    .filter((n): n is number => typeof n === 'number');

  const delivered = plans.filter(p => DELIVERED_STATUSES.includes(p.status)).length;
  const deliveryRate = plans.length ? delivered / plans.length : 0;
  const reflectionRate = delivered ? Math.min(1, reflections.length / delivered) : 0;
  const differentiatedRate = plans.length ? plans.filter(p => p.differentiatedInstruction).length / plans.length : 0;

  const track = getCurriculumTrack();
  const completedAsPlannedPct = reflections.length
    ? Math.round((reflections.filter(r => r.completedAsPlanned).length / reflections.length) * 100)
    : null;

  return {
    monthly: {
      monthName: now.toLocaleDateString('default', { month: 'long', year: 'numeric' }),
      lessonsPlanned: monthPlans.length,
      lessonsDelivered: monthPlans.filter(p => DELIVERED_STATUSES.includes(p.status)).length,
      assessmentsCreated: monthPlans.filter(p => p.assessment).length,
      reflectionsLogged: monthReflections.length,
      averageStudentEngagement: ratings.length
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : null,
    },
    annual: {
      curriculumCoveragePct: Math.min(100, Math.max(0, Math.round(track.completionPercentage || 0))),
      completedAsPlannedPct,
      // Usage score: 50% delivery, 25% reflection, 25% differentiation across all saved plans
      teachingEffectivenessScore: Math.round((deliveryRate * 0.5 + reflectionRate * 0.25 + differentiatedRate * 0.25) * 100),
    },
  };
}

export function getCopilotChatHistory(): CopilotChatMessage[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEYS.COPILOT_CHAT);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  return [
    {
      id: 'msg-1',
      sender: 'copilot',
      text: 'Hello Teacher! I am Jotti, your AI Lesson Copilot. How can I assist your lesson planning today? (e.g. "Create a 60-minute lesson on Photosynthesis for SHS 1" or "Generate 3 group activity ideas")',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];
}

export function saveCopilotChatHistory(history: CopilotChatMessage[]): void {
  localStorage.setItem(STORAGE_KEYS.COPILOT_CHAT, JSON.stringify(history));
}
