/**
 * JotMinds Preschool Developmental Assessment Framework (JM-PDAF v1.0)
 * Type Definitions & Data Models
 * Ages 2–6 | 240 Developmental Indicators
 */

import { User } from './index';

// ── Age / Developmental Bands ──────────────────────────────────────────────────
export type DevelopmentalBand = 'P1' | 'P2' | 'P3' | 'P4';

export interface BandMetadata {
  band: DevelopmentalBand;
  code: string;
  ageRange: string;
  minAge: number;
  maxAge: number;
  title: string;
  primaryEmphasis: string;
  color: string;
}

export const DEVELOPMENTAL_BANDS: Record<DevelopmentalBand, BandMetadata> = {
  P1: {
    band: 'P1',
    code: 'JM-P1',
    ageRange: '2–3 years',
    minAge: 2,
    maxAge: 3.5,
    title: 'Early Explorers',
    primaryEmphasis: 'Early communication, sensory exploration, movement, relationships and routines',
    color: '#0284C7', // Sky Blue
  },
  P2: {
    band: 'P2',
    code: 'JM-P2',
    ageRange: '3–4 years',
    minAge: 3,
    maxAge: 4.5,
    title: 'Inquisitive Learners',
    primaryEmphasis: 'Language expansion, basic concepts, play, independence and social interaction',
    color: '#059669', // Emerald
  },
  P3: {
    band: 'P3',
    code: 'JM-P3',
    ageRange: '4–5 years',
    minAge: 4,
    maxAge: 5.5,
    title: 'Collaborative Thinkers',
    primaryEmphasis: 'Reasoning, early literacy/numeracy, communication, collaboration and fine motor development',
    color: '#7C3AED', // Violet
  },
  P4: {
    band: 'P4',
    code: 'JM-P4',
    ageRange: '5–6 years',
    minAge: 5,
    maxAge: 6.9,
    title: 'School Readiness Pioneers',
    primaryEmphasis: 'School readiness, problem-solving, literacy/numeracy foundations, independence and self-regulation',
    color: '#D97706', // Amber
  },
};

// ── Core Developmental Domains ─────────────────────────────────────────────────
export type DevelopmentalDomainCode =
  | 'JM-CD' // Cognitive Development
  | 'JM-LC' // Language & Communication
  | 'JM-EN' // Early Numeracy
  | 'JM-SE' // Social & Emotional Development
  | 'JM-PM' // Physical & Motor Development
  | 'JM-CE' // Creativity & Expression
  | 'JM-IL'; // Independence & Life Skills

export interface DomainMetadata {
  code: DevelopmentalDomainCode;
  name: string;
  shortName: string;
  indicatorCount: number;
  description: string;
  iconName: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
}

export const DEVELOPMENTAL_DOMAINS: Record<DevelopmentalDomainCode, DomainMetadata> = {
  'JM-CD': {
    code: 'JM-CD',
    name: 'Cognitive Development',
    shortName: 'Cognitive',
    indicatorCount: 35,
    description: 'Attention, recall, classification, sequencing, patterns, cause & effect, and cognitive problem-solving.',
    iconName: 'Brain',
    badgeBg: 'bg-purple-50 border-purple-200',
    badgeText: 'text-purple-700',
    accentColor: '#8B5CF6',
  },
  'JM-LC': {
    code: 'JM-LC',
    name: 'Language & Communication',
    shortName: 'Language',
    indicatorCount: 45,
    description: 'Listening, receptive/expressive vocabulary, dialogue, storytelling, phonology, print awareness, and early mark-making.',
    iconName: 'MessageSquare',
    badgeBg: 'bg-blue-50 border-blue-200',
    badgeText: 'text-blue-700',
    accentColor: '#3B82F6',
  },
  'JM-EN': {
    code: 'JM-EN',
    name: 'Early Numeracy',
    shortName: 'Numeracy',
    indicatorCount: 35,
    description: 'Number awareness, one-to-one counting, quantity comparisons, early addition/subtraction, shapes, and measurement.',
    iconName: 'Calculator',
    badgeBg: 'bg-emerald-50 border-emerald-200',
    badgeText: 'text-emerald-700',
    accentColor: '#10B981',
  },
  'JM-SE': {
    code: 'JM-SE',
    name: 'Social & Emotional Development',
    shortName: 'Social-Emotional',
    indicatorCount: 35,
    description: 'Self-awareness, emotional expression, self-regulation, peer cooperation, empathy, and classroom confidence.',
    iconName: 'HeartHandshake',
    badgeBg: 'bg-rose-50 border-rose-200',
    badgeText: 'text-rose-700',
    accentColor: '#F43F5E',
  },
  'JM-PM': {
    code: 'JM-PM',
    name: 'Physical & Motor Development',
    shortName: 'Physical & Motor',
    indicatorCount: 35,
    description: 'Gross motor balance, movement coordination, object control, fine hand-finger dexterity, and tool manipulation.',
    iconName: 'Activity',
    badgeBg: 'bg-amber-50 border-amber-200',
    badgeText: 'text-amber-700',
    accentColor: '#F59E0B',
  },
  'JM-CE': {
    code: 'JM-CE',
    name: 'Creativity & Expression',
    shortName: 'Creativity',
    indicatorCount: 25,
    description: 'Imaginative pretend play, visual mark-making, rhythm, music, construction design, and novel problem exploration.',
    iconName: 'Sparkles',
    badgeBg: 'bg-indigo-50 border-indigo-200',
    badgeText: 'text-indigo-700',
    accentColor: '#6366F1',
  },
  'JM-IL': {
    code: 'JM-IL',
    name: 'Independence & Life Skills',
    shortName: 'Independence',
    indicatorCount: 30,
    description: 'Self-care routines, classroom responsibility, following routines, independent decision-making, and safety practices.',
    iconName: 'Compass',
    badgeBg: 'bg-teal-50 border-teal-200',
    badgeText: 'text-teal-700',
    accentColor: '#14B8A6',
  },
};

// ── Assessment Methods ─────────────────────────────────────────────────────────
export type AssessmentMethodCode =
  | 'OBS' // Natural Observation
  | 'ACT' // Structured Activity
  | 'ORL' // Oral Interaction
  | 'CHK' // Developmental Checklist
  | 'PRT' // Portfolio Evidence
  | 'PAR'; // Parent/Caregiver Input

export interface AssessmentMethodMetadata {
  code: AssessmentMethodCode;
  label: string;
  purpose: string;
  badgeColor: string;
}

export const ASSESSMENT_METHODS: Record<AssessmentMethodCode, AssessmentMethodMetadata> = {
  OBS: {
    code: 'OBS',
    label: 'Natural Observation',
    purpose: 'Evidence from normal classroom routines, play and social interaction',
    badgeColor: 'bg-blue-100 text-blue-800',
  },
  ACT: {
    code: 'ACT',
    label: 'Structured Activity',
    purpose: 'Short age-appropriate activities designed to elicit competencies',
    badgeColor: 'bg-emerald-100 text-emerald-800',
  },
  ORL: {
    code: 'ORL',
    label: 'Oral Interaction',
    purpose: 'Conversation, storytelling and age-appropriate guided questioning',
    badgeColor: 'bg-purple-100 text-purple-800',
  },
  CHK: {
    code: 'CHK',
    label: 'Developmental Checklist',
    purpose: 'Periodic milestone review of observable competencies',
    badgeColor: 'bg-amber-100 text-amber-800',
  },
  PRT: {
    code: 'PRT',
    label: 'Portfolio Evidence',
    purpose: 'Drawings, mark-making attempts, photos and classroom work samples',
    badgeColor: 'bg-indigo-100 text-indigo-800',
  },
  PAR: {
    code: 'PAR',
    label: 'Parent/Caregiver Input',
    purpose: 'Structured contextual information and observations from home',
    badgeColor: 'bg-rose-100 text-rose-800',
  },
};

// ── Developmental Rating Scale ─────────────────────────────────────────────────
export type DevelopmentalRating = 0 | 1 | 2 | 3 | 4;

export interface RatingStageInfo {
  level: DevelopmentalRating;
  stage: string;
  interpretation: string;
  color: string;
  badgeBg: string;
  badgeText: string;
}

export const DEVELOPMENTAL_RATINGS: Record<DevelopmentalRating, RatingStageInfo> = {
  0: {
    level: 0,
    stage: 'Not Yet Observed',
    interpretation: 'Insufficient evidence to make a developmental judgement',
    color: '#94A3B8', // Slate 400
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-600',
  },
  1: {
    level: 1,
    stage: 'Emerging',
    interpretation: 'Beginning to demonstrate the competency; substantial support may be required',
    color: '#EF4444', // Red
    badgeBg: 'bg-red-50 border-red-200',
    badgeText: 'text-red-700',
  },
  2: {
    level: 2,
    stage: 'Developing',
    interpretation: 'Demonstrates partly or inconsistently, sometimes with support',
    color: '#F59E0B', // Amber
    badgeBg: 'bg-amber-50 border-amber-200',
    badgeText: 'text-amber-700',
  },
  3: {
    level: 3,
    stage: 'Achieving',
    interpretation: 'Demonstrates independently and consistently at the expected developmental level',
    color: '#10B981', // Emerald
    badgeBg: 'bg-emerald-50 border-emerald-200',
    badgeText: 'text-emerald-700',
  },
  4: {
    level: 4,
    stage: 'Extending',
    interpretation: 'Transfers the competency to new situations or demonstrates more complex application',
    color: '#6366F1', // Indigo
    badgeBg: 'bg-indigo-50 border-indigo-200',
    badgeText: 'text-indigo-700',
  },
};

// ── Evidence Confidence Model ──────────────────────────────────────────────────
export type EvidenceConfidence = 'low' | 'moderate' | 'high';

export interface ConfidenceRule {
  level: EvidenceConfidence;
  label: string;
  description: string;
  color: string;
}

export const CONFIDENCE_RULES: Record<EvidenceConfidence, ConfidenceRule> = {
  low: {
    level: 'low',
    label: 'Low Confidence',
    description: '1 evidence event — requires additional verification before final judgment',
    color: '#F59E0B',
  },
  moderate: {
    level: 'moderate',
    label: 'Moderate Confidence',
    description: '2 consistent evidence events',
    color: '#3B82F6',
  },
  high: {
    level: 'high',
    label: 'High Confidence',
    description: '3+ consistent evidence events, across different occasions or contexts',
    color: '#10B981',
  },
};

// ── Language of Evidence ───────────────────────────────────────────────────────
export type LanguageOfEvidence =
  | 'English'
  | 'Twi'
  | 'Ga'
  | 'Ewe'
  | 'French'
  | 'Other/Home Language';

export const SUPPORTED_LANGUAGES: LanguageOfEvidence[] = [
  'English',
  'Twi',
  'Ga',
  'Ewe',
  'French',
  'Other/Home Language',
];

// ── Evidence Event Record ──────────────────────────────────────────────────────
export interface EvidenceEvent {
  id: string;
  childId: string;
  childName: string;
  indicatorId: string;
  domainCode: DevelopmentalDomainCode;
  rating: DevelopmentalRating;
  method: AssessmentMethodCode;
  date: string; // ISO date YYYY-MM-DD
  timestamp: string; // ISO string
  observerId: string;
  observerName: string;
  observerRole: 'teacher' | 'assistant' | 'head_teacher' | 'parent';
  activityContext?: string; // e.g. "Build a Bridge", "Morning Circle", "Outdoor Free Play"
  languageOfEvidence?: LanguageOfEvidence;
  notes?: string;
  workSampleUrl?: string; // photo/work sample
  tags?: string[];
  classId?: string;
  institutionId?: string;
}

// ── Behavioral Anchors ─────────────────────────────────────────────────────────
export interface BehavioralAnchors {
  emerging: string;
  developing: string;
  achieving: string;
  extending: string;
}

// ── Master Developmental Indicator ─────────────────────────────────────────────
export interface DevelopmentalIndicator {
  id: string; // e.g. JM-CD-001
  domainCode: DevelopmentalDomainCode;
  clusterName: string; // e.g. "Attention & Engagement"
  band: DevelopmentalBand | 'P1/P2' | 'P2/P3' | 'P3/P4';
  title: string;
  primaryAssessment: string;
  defaultMethod: AssessmentMethodCode;
  behaviourToObserve?: string;
  exactTeacherInstruction?: string;
  anchors?: BehavioralAnchors;
  teacherIntervention?: string;
  homeActivity?: string;
  crossDomainLinks?: string[]; // e.g. ["JM-LC", "JM-PM"]
}

// ── Cross-Domain Developmental Activity ────────────────────────────────────────
export interface DevelopmentalActivity {
  id: string;
  title: string;
  ageBands: DevelopmentalBand[];
  durationMinutes: number;
  category: 'Construction & Math' | 'Story & Drama' | 'Sensory & Science' | 'Games & Movement' | 'Art & Expression';
  description: string;
  materialsNeeded: string[];
  teacherInstructions: string[];
  behaviourToObserve: string;
  mappedIndicatorIds: string[]; // 3-6 indicators from different domains
  culturalAdaptationNotes?: string;
}

// ── Evaluated Indicator Status for a Child ────────────────────────────────────
export interface ChildIndicatorEvaluation {
  indicator: DevelopmentalIndicator;
  events: EvidenceEvent[];
  currentRating: DevelopmentalRating;
  confidence: EvidenceConfidence;
  lastObservedDate: string | null;
  dominantLanguage?: LanguageOfEvidence;
}

// ── Domain Progress Breakdown ─────────────────────────────────────────────────
export interface DomainProgressSummary {
  domainCode: DevelopmentalDomainCode;
  domainName: string;
  shortName: string;
  accentColor: string;
  totalIndicators: number;
  observedCount: number;
  achievingOrExtendingCount: number;
  developingCount: number;
  emergingCount: number;
  averageStage: number; // 0.0 - 4.0
  stageLabel: string;
  confidenceDistribution: {
    high: number;
    moderate: number;
    low: number;
  };
  strengths: string[];
  growingCompetencies: string[];
  suggestedTeacherActions: string[];
  suggestedHomeActivities: string[];
}

// ── School Readiness Profile (for Band P4: 5–6 years) ───────────────────────────
export interface ReadinessDimensionScore {
  dimension:
    | 'Communication'
    | 'Early Literacy'
    | 'Early Numeracy'
    | 'Self-Regulation'
    | 'Social Interaction'
    | 'Motor Development'
    | 'Independence';
  score: number; // 0 - 100
  stageLabel: 'Emerging Support' | 'Developing' | 'Consolidating' | 'Advanced';
  keyEvidence: string;
  strengths: string[];
  supportAreas: string[];
}

export interface SchoolReadinessProfile {
  childId: string;
  evaluationDate: string;
  ageYears: number;
  overallReadinessSummary: string; // Non-binary, descriptive narrative
  dimensions: ReadinessDimensionScore[];
  classroomPreparationChecklist: {
    title: string;
    isConsolidated: boolean;
    domain: string;
  }[];
  transitionRecommendations: string[];
}

// ── Complete Multidimensional Child Profile ───────────────────────────────────
export interface ChildDevelopmentalProfile {
  child: User;
  ageYears: number;
  assignedBand: DevelopmentalBand;
  totalEvidenceEvents: number;
  firstObservationDate: string | null;
  lastObservationDate: string | null;
  dominantLanguageOfEvidence: LanguageOfEvidence;
  domains: Record<DevelopmentalDomainCode, DomainProgressSummary>;
  overallEmergingStrengths: string[];
  priorityDevelopmentAreas: string[];
  schoolReadiness?: SchoolReadinessProfile; // available if child is in P4 (5-6 years)
  parentSummary: {
    greeting: string;
    narrativeSummary: string;
    highlightStrengths: string[];
    whatWeArePracticing: string[];
    recommendedHomeActivities: {
      title: string;
      description: string;
      materials: string;
    }[];
  };
}

// ── Class-Level Developmental Intelligence ─────────────────────────────────────
export interface ClassDevelopmentIntelligence {
  classId: string;
  className: string;
  totalChildren: number;
  activeObservations: number;
  bandDistribution: Record<DevelopmentalBand, number>;
  domainAverages: {
    domainCode: DevelopmentalDomainCode;
    domainName: string;
    averageStage: number; // 0 - 4
    emergingCount: number;
    developingCount: number;
    achievingCount: number;
    extendingCount: number;
  }[];
  cohortStrengths: string[];
  cohortDevelopmentGaps: {
    domainCode: DevelopmentalDomainCode;
    clusterName: string;
    description: string;
    childrenNeedingSupport: number;
    recommendedClassroomFocus: string;
  }[];
  teachingInsightRecommendations: {
    title: string;
    instructionalStrategy: string;
    suggestedStationSetup: string;
    inServiceTrainingModule: string;
  }[];
  readinessSummary?: {
    evaluatedCount: number;
    highReadinessCount: number;
    moderateReadinessCount: number;
    supportRequiredCount: number;
  };
}
