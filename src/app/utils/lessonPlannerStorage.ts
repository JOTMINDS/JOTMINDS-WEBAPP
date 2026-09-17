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

export const initialPerformanceMetric: TeacherPerformanceMetric = {
  monthly: {
    monthName: 'August 2026',
    lessonsPlanned: 24,
    lessonsDelivered: 22,
    assessmentsCreated: 18,
    averageStudentEngagement: 4.4
  },
  annual: {
    curriculumCoveragePct: 82,
    studentOutcomeTrendPct: 14,
    teachingEffectivenessScore: 91
  }
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

export function getTeacherPerformanceMetrics(): TeacherPerformanceMetric {
  if (typeof window === 'undefined') return initialPerformanceMetric;
  const saved = localStorage.getItem(STORAGE_KEYS.PERFORMANCE_METRICS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  return initialPerformanceMetric;
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
