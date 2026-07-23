export type UserRole = 'student' | 'teacher' | 'parent' | 'professional' | 'organization' | 'school_admin' | 'admin';

export type EducationLevel = 'Elementary' | 'JHS' | 'SHS' | 'Tertiary';

export type OrganizationType = 'Corporate' | 'NGO' | 'Government' | 'Startup' | 'Educational Institution' | 'Other';

export type IndustrySector = 
  | 'Healthcare'
  | 'Educational Institutions'
  | 'Agriculture'
  | 'Manufacturing'
  | 'Financial Services'
  | 'Technology'
  | 'Telecommunications'
  | 'Retail & Distribution'
  | 'Logistics & Transport'
  | 'Hospitality & Tourism'
  | 'Energy & Utilities'
  | 'Other';

export type KolbStyle = 'Diverging' | 'Assimilating' | 'Converging' | 'Accommodating';
export type SternbergStyle = 'Analytical' | 'Creative' | 'Practical';
export type DualProcessStyle = 'Intuitive' | 'Reflective' | 'Balanced';

export interface OrganizationCodeDetails {
  organizationCode: string;
  codeGeneratedAt: string;
  codeExpiryDays: number | null;
  isActive: boolean;
}

export interface Class {
  id: string;
  name: string;
  academicYear: string;
  classTeacherId?: string; // Optional primary teacher
  studentCount?: number;
  institutionId?: string;
  classCode?: string;
  createdAt: string;
}

export interface TeacherClassAssignment {
  id: string;
  teacherId: string;
  classId: string;
  subjectId?: string; // Can be a custom string for subject names
  role: 'class_teacher' | 'subject_teacher' | 'both';
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  school?: string; // Optional - not applicable for supervisors
  role: UserRole;
  educationLevel?: EducationLevel;
  dateOfBirth?: string; // Changed from age to dateOfBirth (ISO format: YYYY-MM-DD)
  age?: number; // Computed property - calculated from dateOfBirth
  parentId?: string;
  classId?: string; // The primary class this student belongs to
  /** @deprecated use classId instead */
  teacherId?: string;
  /** @deprecated assigned teachers are resolved through classId */
  teacherName?: string; // Stored name of their assigned teacher for immediate rendering
  /** @deprecated assigned teachers are resolved through classId */
  linkedTeachers?: string[]; // Multiple linked teachers (for students joining via Class Code or Magic Link)
  students?: string[]; // For teachers and parents
  classCode?: string; // For teachers: uniquely identifies their class
  organizationName?: string; // For professionals and supervisors
  organizationType?: OrganizationType; // For professionals and supervisors
  industrySector?: IndustrySector; // For organizations/supervisors only
  position?: string; // For professionals and supervisors
  department?: string; // For professionals within organizations
  parentPin?: string; // PIN for Kids Mode parental controls (hashed)
  jotsCode?: string; // legacy alias — use organizationCode instead
  organizationCode?: string; // the actual code the user registered with
  organizationId?: string; // Added to resolve TS errors
  uid?: string; // Added to resolve TS errors
  isVerified?: boolean; // Tracking if email has been verified
  firstName?: string; // Added to resolve TS errors
  lastName?: string; // Added to resolve TS errors
  className?: string; // Added to resolve TS errors
  createdAt?: string;
  consentVersion?: string;
  assessments?: Assessment[]; // Full assessment objects (legacy)
  assessmentsCompleted?: string[]; // Array of completed assessment types (backend standard)
  cognitiveProfile?: any; // The users computed cognitive profile
  reviews?: SupervisorReviewData[];
  avatarUrl?: string; // Profile photo (data URL) — shown to the user and their linked parent
}


export interface Assessment {
  id: string;
  userId: string;
  type: 'kolb' | 'sternberg' | 'dual-process' | 'jhs-thinking' | 'shs-thinking' | 'adult-thinking' | 'child-thinking' | 'teaching-style';
  responses: number[];
  questions?: Question[]; // Store the specific questions used for this assessment
  score: AssessmentScore;
  completed?: boolean; // Added by backend to indicate completion status
  completedAt?: string; // ISO date string when assessment was completed
}

export interface AssessmentScore {
  kolb?: {
    style: KolbStyle;
    scores: {
      CE: number; // Concrete Experience
      RO: number; // Reflective Observation
      AC: number; // Abstract Conceptualization
      AE: number; // Active Experimentation
      // Legacy full-name properties (for backwards compatibility)
      concreteExperience?: number;
      reflectiveObservation?: number;
      abstractConceptualization?: number;
      activeExperimentation?: number;
    };
  };
  sternberg?: {
    style: SternbergStyle;
    scores: {
      analytical: number;
      creative: number;
      practical: number;
    };
  };
  dualProcess?: {
    style: DualProcessStyle;
    scores: {
      system1: number; // Intuitive/Fast
      system2: number; // Reflective/Slow
    };
  };
  'teaching-style'?: {
    primaryStyle: string;
    secondaryStyle: string;
    scores: {
      authority: number;
      facilitation: number;
      transmission: number;
      construction: number;
      extrinsic: number;
      intrinsic: number;
      judgment: number;
      growth: number;
      fixed: number;
      adaptive: number;
      fearBased: number;
      safe: number;
      // Axis scores (0-100)
      axisAuthority: number;
      axisKnowledge: number;
      axisMotivation: number;
      axisAssessment: number;
      axisAdaptability: number;
      axisClimate: number;
    };
  };
  'jhs-thinking'?: {
    personalityType: string;
    primaryStyle: string;
    secondaryStyle: string;
    profileType: 'single' | 'dual' | 'balanced';
    scores: Record<string, number>;
  };
  'shs-thinking'?: {
    personalityType: string;
    primaryStyle: string;
    secondaryStyle: string;
    profileType: 'single' | 'dual' | 'balanced';
    scores: Record<string, number>;
  };
  'adult-thinking'?: {
    dominantStyle: string;
    scores: Record<string, number>;
  };
  'child-thinking'?: {
    personalityType: string;
    primaryStyle: string;
    scores: Record<string, number>;
  };
}

export interface GhanaMapping {
  shsTrack: string[];
  tertiaryFocus: string[];
  decisionTip: string;
  careerSuggestions: string[];
}

export interface Reflection {
  id: string;
  userId: string;
  assessmentId: string;
  content: string;
  createdAt: string;
}

export interface Question {
  id: number;
  text: string;
  dimension: string;
}

export interface AssessmentProgress {
  userId: string;
  assessmentType: 'kolb' | 'sternberg' | 'dual-process' | 'teaching-style';
  isOrganizational: boolean;
  currentQuestion: number;
  responses: number[];
  questions: Question[]; // Store the specific questions shown to this user
  lastSaved: string;
}

export interface SupervisorReviewData {
  id: string;
  supervisorId: string;
  professionalId: string;
  roleAlignment: string;
  performanceRating: string;
  strengths: string;
  developmentAreas: string;
  recommendedActions: string;
  goals: string;
  supervisorComments: string;
  reviewDate: string;
  createdAt: string;
}

export interface ParentObservationAssessment {
  id: string;
  parentId: string;
  childId: string;
  responses: number[];
  score: {
    sectionA: {
      total: number;
      style: string;
      interpretation: string;
      insights: string;
      tags: string[];
    };
    sectionB: {
      total: number;
      style: string;
      interpretation: string;
      insights: string;
      tags: string[];
    };
    sectionC: {
      total: number;
      style: string;
      interpretation: string;
      insights: string;
      tags: string[];
    };
    sectionD: {
      total: number;
      style: string;
      interpretation: string;
      insights: string;
      tags: string[];
    };
    overallSummary: string;
    harmonyScore?: number;
  };
  completedAt: string;
}

export interface ChildSharingConsent {
  childId: string;
  parentId: string;
  consentGiven: boolean;
  consentDate: string;
}

export interface AccessRequest {
  id: string;
  parentId: string;
  parentName: string;
  parentEmail: string;
  childId: string;
  childName: string;
  childEmail: string;
  status: 'pending' | 'approved' | 'denied';
  requestedAt: string;
  respondedAt?: string;
}