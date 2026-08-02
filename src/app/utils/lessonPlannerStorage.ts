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
  classId: 'jhs-2a',
  className: 'JHS 2A (Mathematics & Science)',
  totalStudents: 32,
  learningStylesBreakdown: {
    visualPct: 45,
    auditoryPct: 20,
    readWritePct: 15,
    kinestheticPct: 20
  },
  topCognitiveStrengths: [
    'Pattern Recognition & Spatial Visualization',
    'Practical Application in Real-World Scenarios',
    'Collaborative Group Problem Solving'
  ],
  riskAlerts: [
    {
      alertType: 'abstract_concepts',
      message: '5 students struggle with pure abstract algebraic formulas without visual aids.',
      affectedStudentCount: 5,
      suggestedInterventions: [
        'Use geometric diagrams and algebra tiles during main instruction.',
        'Pair abstract equations with real-world financial/distance scenarios.'
      ]
    },
    {
      alertType: 'attention_span',
      message: '3 students exhibit low concentration patterns after 15 minutes of continuous lecture.',
      affectedStudentCount: 3,
      suggestedInterventions: [
        'Incorporate 2-minute quick-check brain breaks or active peer discussions.',
        'Provide structured fill-in notes during introduction.'
      ]
    }
  ],
  flaggedStudents: [
    {
      studentId: 'st-01',
      studentName: 'Kwame Mensah',
      learningStyle: 'Visual',
      cognitiveStrength: 'Spatial & Diagrammatic Visualization',
      attentionSpan: 'Moderate',
      reasoningScore: 58,
      needsAbstractSupport: true,
      flaggedRiskReason: 'Struggles with abstract algebraic formulas without visual balance scale diagrams.',
      recommendedTeacherAction: 'Provide visual balance scale template and algebra tiles during Tier 1 guided practice.'
    },
    {
      studentId: 'st-02',
      studentName: 'Yaw Addo',
      learningStyle: 'Kinesthetic',
      cognitiveStrength: 'Hands-on Manipulatives & Group Work',
      attentionSpan: 'Low',
      reasoningScore: 62,
      needsAbstractSupport: true,
      flaggedRiskReason: 'Concentration drops after 15 minutes of lecture.',
      recommendedTeacherAction: 'Seat in front row; engage with 2-minute quick-check questions during main instruction.'
    },
    {
      studentId: 'st-03',
      studentName: 'Ama Osei',
      learningStyle: 'Auditory',
      cognitiveStrength: 'Verbal Communication & Peer Recap',
      attentionSpan: 'High',
      reasoningScore: 65,
      needsAbstractSupport: true,
      flaggedRiskReason: 'Benefits from verbal peer explanation before writing algebraic solutions.',
      recommendedTeacherAction: 'Pair with a peer study buddy during guided group exercises.'
    },
    {
      studentId: 'st-04',
      studentName: 'Esi Boateng',
      learningStyle: 'Read/Write',
      cognitiveStrength: 'Structured Notes & Formulas',
      attentionSpan: 'Moderate',
      reasoningScore: 54,
      needsAbstractSupport: true,
      flaggedRiskReason: 'Requires step-by-step formula reference sheet for multi-step equations.',
      recommendedTeacherAction: 'Hand out color-coded step-by-step equation solving checklist.'
    }
  ],
  recommendedTeachingStyle: {
    title: 'Visual-Interactive & Differentiated Guided Practice',
    strategies: [
      'Begin with visual diagrams or physical demonstrations.',
      'Use interactive group discussions for auditory reinforcement.',
      'Provide 3-tier differentiated practice tasks (Core, Support, Advanced).'
    ]
  }
};

export const initialMockLessonPlans: LessonPlan[] = [
  {
    id: 'lp-001',
    teacherId: 'teacher-1',
    subject: 'Mathematics',
    gradeClass: 'JHS 2',
    topic: 'Linear Equations in One Variable',
    subtopic: 'Solving Algebraic Equations & Word Problems',
    durationMinutes: 40,
    date: new Date().toISOString().split('T')[0],
    curriculumFramework: 'National',
    curriculumTopicId: 'curr-math-04',
    objectives: {
      knowledge: [
        'Define a linear equation in one variable.',
        'Identify variables, coefficients, and constants.'
      ],
      skills: [
        'Solve simple linear equations involving addition, subtraction, and multiplication.',
        'Isolate the variable on one side of an equation.'
      ],
      applications: [
        'Apply linear equations to calculate simple real-life budgeting and distance scenarios.'
      ]
    },
    phases: [
      {
        name: 'Introduction',
        durationMinutes: 5,
        activity: 'Visual balance scale demonstration comparing equal weights on both sides of an equation.',
        teachingNotes: 'Engage visual learners by drawing a balance scale on the board.',
        materialsNeeded: ['Whiteboard markers', 'Balance scale diagram']
      },
      {
        name: 'Main Lesson',
        durationMinutes: 15,
        activity: 'Direct instruction on inverse operations (adding/subtracting same number on both sides).',
        teachingNotes: 'Break down steps: 1. Identify constant, 2. Apply inverse operation, 3. Simplify.',
        materialsNeeded: ['Step-by-step handout']
      },
      {
        name: 'Guided Practice',
        durationMinutes: 10,
        activity: 'Pairs work on 3 tiered linear equation problems with teacher roving and support.',
        teachingNotes: 'Provide algebra tiles to the 5 students flagged for abstract support.',
        materialsNeeded: ['Differentiated task cards']
      },
      {
        name: 'Assessment',
        durationMinutes: 5,
        activity: 'Exit ticket with 2 quick linear equation check questions.',
        teachingNotes: 'Collect exit tickets immediately to evaluate understanding.',
        materialsNeeded: ['Exit ticket slips']
      },
      {
        name: 'Conclusion',
        durationMinutes: 5,
        activity: 'Summary of key takeaway steps and real-world connection preview.',
        teachingNotes: 'Reinforce that equations are balance statements.',
        materialsNeeded: []
      }
    ],
    differentiatedInstruction: {
      coreActivity: {
        title: 'Standard Equation Solving',
        description: 'Solve 2x + 4 = 12 and 3y - 5 = 10 independently in exercise books.',
        targetGroup: 'Average Proficiency Learners (60% of class)'
      },
      supportActivity: {
        title: 'Visual Guided Balance Solving',
        description: 'Solve x + 3 = 8 using visual balance diagrams and step-by-step guidance.',
        targetGroup: 'Learners needing abstract support (5 students)',
        scaffoldingNotes: [
          'Use color-coded markers for variables vs constants.',
          'Provide worked-out example sheet.'
        ]
      },
      advancedActivity: {
        title: 'Real-Life Word Problem Modeling',
        description: 'Formulate and solve a linear equation for a taxi fare scenario: $5 base fee + $2 per km = $25.',
        targetGroup: 'High Achievers & Fast Finishers (6 students)',
        extensionTasks: [
          'Create a custom word problem for a classmate to solve.'
        ]
      }
    },
    assessment: {
      id: 'assmt-lp-001',
      title: 'Linear Equations Checkpoint Quiz',
      mcqs: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'What is the first step to solve x + 7 = 15?',
          options: ['Add 7 to both sides', 'Subtract 7 from both sides', 'Multiply by 7', 'Divide by 15'],
          correctAnswer: 'Subtract 7 from both sides',
          explanation: 'Subtracting 7 isolates variable x.'
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'If 3x = 18, what is the value of x?',
          options: ['3', '6', '15', '21'],
          correctAnswer: '6',
          explanation: 'Divide both sides by 3: 18 / 3 = 6.'
        }
      ],
      shortAnswer: [
        {
          id: 'q3',
          type: 'short_answer',
          question: 'Solve for y: 2y - 4 = 10. Show your working.',
          correctAnswer: '2y = 14, y = 7'
        }
      ],
      discussion: [
        {
          id: 'q4',
          type: 'discussion',
          question: 'Why must whatever operation you do to one side of an equation also be done to the other side?'
        }
      ],
      practicalExercises: [],
      homework: [
        {
          id: 'q5',
          type: 'homework',
          question: 'Complete textbook page 42, questions 1 through 6 on linear equation word problems.'
        }
      ]
    },
    status: 'generated',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const initialCurriculumTrack: CurriculumTrack = {
  frameworkName: 'National Curriculum (NaCCA / GES)',
  subject: 'Mathematics',
  grade: 'JHS 2',
  totalTopics: 12,
  coveredTopicsCount: 8,
  completionPercentage: 67,
  topics: [
    { id: 'curr-math-01', code: 'MATH-JHS2-01', title: 'Number Systems & Real Numbers', subject: 'Mathematics', grade: 'JHS 2', status: 'covered' },
    { id: 'curr-math-02', code: 'MATH-JHS2-02', title: 'Fractions, Decimals & Percentages', subject: 'Mathematics', grade: 'JHS 2', status: 'covered' },
    { id: 'curr-math-03', code: 'MATH-JHS2-03', title: 'Algebraic Expressions', subject: 'Mathematics', grade: 'JHS 2', status: 'covered' },
    { id: 'curr-math-04', code: 'MATH-JHS2-04', title: 'Linear Equations in One Variable', subject: 'Mathematics', grade: 'JHS 2', status: 'in_progress', mappedLessonId: 'lp-001' },
    { id: 'curr-math-05', code: 'MATH-JHS2-05', title: 'Linear Inequalities', subject: 'Mathematics', grade: 'JHS 2', status: 'outstanding' },
    { id: 'curr-math-06', code: 'MATH-JHS2-06', title: 'Angles & Geometric Shapes', subject: 'Mathematics', grade: 'JHS 2', status: 'covered' },
    { id: 'curr-math-07', code: 'MATH-JHS2-07', title: 'Perimeter and Area of Plane Figures', subject: 'Mathematics', grade: 'JHS 2', status: 'covered' },
    { id: 'curr-math-08', code: 'MATH-JHS2-08', title: 'Surface Area & Volume of Solids', subject: 'Mathematics', grade: 'JHS 2', status: 'covered' },
    { id: 'curr-math-09', code: 'MATH-JHS2-09', title: 'Data Collection & Organization', subject: 'Mathematics', grade: 'JHS 2', status: 'covered' },
    { id: 'curr-math-10', code: 'MATH-JHS2-10', title: 'Bar Charts & Pie Charts', subject: 'Mathematics', grade: 'JHS 2', status: 'covered' },
    { id: 'curr-math-11', code: 'MATH-JHS2-11', title: 'Probability Basics', subject: 'Mathematics', grade: 'JHS 2', status: 'outstanding' },
    { id: 'curr-math-12', code: 'MATH-JHS2-12', title: 'Transformation Geometry', subject: 'Mathematics', grade: 'JHS 2', status: 'outstanding' }
  ]
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

export function getSavedLessonPlans(): LessonPlan[] {
  if (typeof window === 'undefined') return initialMockLessonPlans;
  const saved = localStorage.getItem(STORAGE_KEYS.LESSON_PLANS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse lesson plans from localStorage', e);
    }
  }
  localStorage.setItem(STORAGE_KEYS.LESSON_PLANS, JSON.stringify(initialMockLessonPlans));
  return initialMockLessonPlans;
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
      if (parsed[classId || 'jhs-2a']) return parsed[classId || 'jhs-2a'];
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
      text: 'Hello Teacher! I am your AI Lesson Copilot. How can I assist your lesson planning today? (e.g. "Create a 60-minute lesson on Photosynthesis for SHS 1" or "Generate 3 group activity ideas")',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];
}

export function saveCopilotChatHistory(history: CopilotChatMessage[]): void {
  localStorage.setItem(STORAGE_KEYS.COPILOT_CHAT, JSON.stringify(history));
}
