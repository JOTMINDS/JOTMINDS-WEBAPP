/**
 * JotMinds AI-Powered Lesson Planner Data Types & Interfaces
 */

export type EducationLevelCategory = 'Nursery' | 'Primary' | 'JHS' | 'SHS' | 'University' | 'Tutor';

export interface LearningObjectives {
  knowledge: string[];
  skills: string[];
  applications: string[];
}

export interface LessonPhase {
  name: 'Introduction' | 'Main Lesson' | 'Guided Practice' | 'Assessment' | 'Conclusion';
  durationMinutes: number;
  activity: string;
  teachingNotes?: string;
  materialsNeeded?: string[];
}

export interface DifferentiatedInstruction {
  coreActivity: {
    title: string;
    description: string;
    targetGroup: string;
  };
  supportActivity: {
    title: string;
    description: string;
    targetGroup: string;
    scaffoldingNotes: string[];
  };
  advancedActivity: {
    title: string;
    description: string;
    targetGroup: string;
    extensionTasks: string[];
  };
  alternativeActivities?: Array<{
    title: string;
    description: string;
    targetGroup: string;
    type: string;
  }>;
}

export interface AssessmentQuestion {
  id: string;
  type: 'mcq' | 'short_answer' | 'discussion' | 'practical' | 'homework';
  question: string;
  options?: string[]; // For MCQ
  correctAnswer?: string;
  explanation?: string;
}

export interface GeneratedAssessment {
  id: string;
  lessonId?: string;
  title: string;
  mcqs: AssessmentQuestion[];
  shortAnswer: AssessmentQuestion[];
  discussion: AssessmentQuestion[];
  practicalExercises: AssessmentQuestion[];
  homework: AssessmentQuestion[];
}

export interface StudentCognitiveProfileSummary {
  studentId: string;
  studentName: string;
  learningStyle: 'Visual' | 'Auditory' | 'Kinesthetic' | 'Read/Write';
  cognitiveStrength: string;
  attentionSpan: 'High' | 'Moderate' | 'Low';
  reasoningScore: number; // 0 - 100
  needsAbstractSupport?: boolean;
  flaggedRiskReason?: string;
  recommendedTeacherAction?: string;
}

export interface ClassCognitiveSummary {
  classId: string;
  className: string;
  totalStudents: number;
  learningStylesBreakdown: {
    visualPct: number;
    auditoryPct: number;
    readWritePct: number;
    kinestheticPct: number;
  };
  topCognitiveStrengths: string[];
  riskAlerts: Array<{
    alertType: 'abstract_concepts' | 'attention_span' | 'collaboration' | 'reading_pace';
    message: string;
    affectedStudentCount: number;
    suggestedInterventions: string[];
  }>;
  flaggedStudents: StudentCognitiveProfileSummary[];
  recommendedTeachingStyle: {
    title: string;
    strategies: string[];
  };
}

export interface LessonPlan {
  id: string;
  teacherId: string;
  subject: string;
  gradeClass: string;
  topic: string;
  subtopic?: string;
  durationMinutes: number;
  date: string;
  curriculumFramework?: 'National' | 'Cambridge' | 'IB' | 'School Custom';
  curriculumTopicId?: string;
  objectives: LearningObjectives;
  phases: LessonPhase[];
  differentiatedInstruction?: DifferentiatedInstruction;
  assessment?: GeneratedAssessment;
  status: 'draft' | 'generated' | 'delivered' | 'reviewed';
  createdAt: string;
  updatedAt: string;
}

export interface LessonDeliverySession {
  sessionId: string;
  lessonId: string;
  currentPhaseIndex: number;
  phaseTimeRemainingSeconds: number;
  isTimerRunning: boolean;
  attendance: Array<{
    studentId: string;
    name: string;
    present: boolean;
  }>;
  studentEngagementScore: number; // 1 - 5 rating
  teacherLiveNotes: string;
  startedAt: string;
}

export interface PostLessonReflection {
  reflectionId: string;
  lessonId: string;
  teacherId: string;
  completedAsPlanned: boolean;
  studentUnderstandingLevel: 'Excellent' | 'Good' | 'Average' | 'Poor';
  whatWorkedWell: string;
  areasForImprovement: string;
  followUpActions: string;
  reflectedAt: string;
}

export interface CurriculumTopic {
  id: string;
  code: string;
  title: string;
  subject: string;
  grade: string;
  status: 'covered' | 'in_progress' | 'outstanding';
  mappedLessonId?: string;
}

export interface CurriculumTrack {
  frameworkName: string;
  subject: string;
  grade: string;
  totalTopics: number;
  coveredTopicsCount: number;
  completionPercentage: number;
  topics: CurriculumTopic[];
}

export interface TeacherPerformanceMetric {
  monthly: {
    monthName: string;
    lessonsPlanned: number;
    lessonsDelivered: number;
    assessmentsCreated: number;
    averageStudentEngagement: number; // 1 - 5 scale
  };
  annual: {
    curriculumCoveragePct: number;
    studentOutcomeTrendPct: number;
    teachingEffectivenessScore: number; // 0 - 100
  };
}

export interface CopilotChatMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  timestamp: string;
  actionPayload?: any; // E.g., generated lesson snippet or quiz
}
