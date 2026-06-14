/**
 * JotMinds Age-Specific Feature Configurations
 * Based on Terms & Conditions - App Functionality by Age Group
 */

import { AgeCategory } from './age-consent-types';

// ============= FEATURE CATEGORIES =============

export enum FeatureCategory {
  ASSESSMENTS = 'ASSESSMENTS',
  INSIGHTS = 'INSIGHTS',
  GAMIFICATION = 'GAMIFICATION',
  ANALYTICS = 'ANALYTICS',
  CAREER_TOOLS = 'CAREER_TOOLS',
  PRODUCTIVITY = 'PRODUCTIVITY',
  LEADERSHIP = 'LEADERSHIP'
}

// ============= ASSESSMENT COMPLEXITY LEVELS =============

export enum AssessmentLevel {
  BASIC = 'BASIC',                    // Ages 6-10
  BEGINNER = 'BEGINNER',              // Ages 11-15
  INTERMEDIATE = 'INTERMEDIATE',      // Ages 11-15
  ADVANCED = 'ADVANCED',              // Ages 16-18
  EXPERT = 'EXPERT'                   // Ages 19+
}

// ============= FEATURE AVAILABILITY =============

export interface AgeGroupFeatures {
  ageCategory: AgeCategory;
  displayName: string;
  description: string;
  
  // Assessment Features
  assessmentLevels: AssessmentLevel[];
  availableAssessments: string[];
  maxAssessmentLength: number; // Max questions per session
  
  // Insights & Results
  basicInsights: boolean;
  detailedInsights: boolean;
  careerMapping: boolean;
  decisionInsights: boolean;
  
  // Gamification
  badges: boolean;
  challenges: boolean;
  leaderboards: boolean;
  rewards: boolean;
  
  // Analytics
  basicProgress: boolean;
  schoolAnalytics: boolean;
  advancedAnalytics: boolean;
  comparativeAnalytics: boolean;
  
  // Career & Professional Tools
  careerRouting: boolean;
  strengthsAnalysis: boolean;
  skillDevelopment: boolean;
  
  // Productivity & Leadership
  productivityTools: boolean;
  leadershipAssessments: boolean;
  teamAnalytics: boolean;
  
  // Dashboard Features
  supervisedDashboard: boolean;
  studentDashboard: boolean;
  professionalDashboard: boolean;
  
  // Parent/Guardian Oversight
  parentalOversightRequired: boolean;
  parentalOversightRecommended: boolean;
  parentalOversightOptional: boolean;
}

// ============= AGE GROUP CONFIGURATIONS =============

export const AGE_GROUP_FEATURES: Record<AgeCategory, AgeGroupFeatures> = {
  // AGES 6-10: EARLY LEARNERS
  [AgeCategory.EARLY_LEARNER]: {
    ageCategory: AgeCategory.EARLY_LEARNER,
    displayName: 'Early Learners (6-10)',
    description: 'Basic learning assessments, gamified tasks, supervised dashboards',
    
    // Assessments: BASIC level only
    assessmentLevels: [AssessmentLevel.BASIC],
    availableAssessments: [
      'kids-learning-styles',      // Simple version of Kolb
      'kids-thinking-styles',      // Simple version of Sternberg
      'kids-decision-styles'       // Simple version of Dual-Process
    ],
    maxAssessmentLength: 25, // Max 25 questions per session
    
    // Insights: Very basic, parent-facing
    basicInsights: true,
    detailedInsights: false,
    careerMapping: false,
    decisionInsights: false,
    
    // Gamification: Full access (age-appropriate)
    badges: true,
    challenges: true,
    leaderboards: false, // No competition at this age
    rewards: true,
    
    // Analytics: Basic progress only
    basicProgress: true,
    schoolAnalytics: false,
    advancedAnalytics: false,
    comparativeAnalytics: false,
    
    // Career Tools: Not available
    careerRouting: false,
    strengthsAnalysis: false,
    skillDevelopment: false,
    
    // Productivity & Leadership: Not available
    productivityTools: false,
    leadershipAssessments: false,
    teamAnalytics: false,
    
    // Dashboard: Supervised only
    supervisedDashboard: true,
    studentDashboard: false,
    professionalDashboard: false,
    
    // Parent Oversight: REQUIRED
    parentalOversightRequired: true,
    parentalOversightRecommended: false,
    parentalOversightOptional: false
  },

  // AGES 11-15: JUNIOR LEARNERS
  [AgeCategory.JUNIOR_LEARNER]: {
    ageCategory: AgeCategory.JUNIOR_LEARNER,
    displayName: 'Junior Learners (11-15)',
    description: 'Beginner-intermediate assessments, insights, school analytics',
    
    // Assessments: BEGINNER to INTERMEDIATE
    assessmentLevels: [AssessmentLevel.BEGINNER, AssessmentLevel.INTERMEDIATE],
    availableAssessments: [
      'kolb-learning-styles',      // Full Kolb (100 questions)
      'sternberg-thinking-styles', // Full Sternberg (100 questions)
      'dual-process-decision',     // Full Dual-Process (100 questions)
      'junior-strengths',          // Age-appropriate strengths finder
      'study-habits'               // Study habits assessment
    ],
    maxAssessmentLength: 50, // Max 50 questions per session
    
    // Insights: Basic to moderate
    basicInsights: true,
    detailedInsights: true,
    careerMapping: false, // Too early for career mapping
    decisionInsights: true,
    
    // Gamification: Full access
    badges: true,
    challenges: true,
    leaderboards: true, // Age-appropriate competition
    rewards: true,
    
    // Analytics: Basic + School
    basicProgress: true,
    schoolAnalytics: true,
    advancedAnalytics: false,
    comparativeAnalytics: true, // Compare with peers
    
    // Career Tools: Limited
    careerRouting: false,
    strengthsAnalysis: true, // Basic strengths
    skillDevelopment: true,  // Age-appropriate skill building
    
    // Productivity & Leadership: Not available
    productivityTools: false,
    leadershipAssessments: false,
    teamAnalytics: false,
    
    // Dashboard: Student dashboard
    supervisedDashboard: false,
    studentDashboard: true,
    professionalDashboard: false,
    
    // Parent Oversight: REQUIRED for 11-12, RECOMMENDED for 13-15
    parentalOversightRequired: false, // Depends on specific age
    parentalOversightRecommended: true,
    parentalOversightOptional: false
  },

  // AGES 16-18: SENIOR ADOLESCENTS
  [AgeCategory.SENIOR_ADOLESCENT]: {
    ageCategory: AgeCategory.SENIOR_ADOLESCENT,
    displayName: 'Senior Adolescents (16-18)',
    description: 'Advanced assessments, career mapping, decision insights',
    
    // Assessments: ADVANCED level
    assessmentLevels: [AssessmentLevel.BEGINNER, AssessmentLevel.INTERMEDIATE, AssessmentLevel.ADVANCED],
    availableAssessments: [
      'kolb-learning-styles',
      'sternberg-thinking-styles',
      'dual-process-decision',
      'advanced-strengths',
      'career-aptitude',
      'decision-making-styles',
      'leadership-potential',
      'emotional-intelligence'
    ],
    maxAssessmentLength: 100, // Full assessments
    
    // Insights: Advanced
    basicInsights: true,
    detailedInsights: true,
    careerMapping: true,      // Career exploration
    decisionInsights: true,
    
    // Gamification: Full access
    badges: true,
    challenges: true,
    leaderboards: true,
    rewards: true,
    
    // Analytics: Advanced
    basicProgress: true,
    schoolAnalytics: true,
    advancedAnalytics: true,
    comparativeAnalytics: true,
    
    // Career Tools: Full access
    careerRouting: true,
    strengthsAnalysis: true,
    skillDevelopment: true,
    
    // Productivity & Leadership: Limited
    productivityTools: true,
    leadershipAssessments: true,
    teamAnalytics: false, // Not yet
    
    // Dashboard: Advanced student dashboard
    supervisedDashboard: false,
    studentDashboard: true,
    professionalDashboard: false,
    
    // Parent Oversight: OPTIONAL
    parentalOversightRequired: false,
    parentalOversightRecommended: false,
    parentalOversightOptional: true
  },

  // AGES 19+: ADULTS
  [AgeCategory.ADULT]: {
    ageCategory: AgeCategory.ADULT,
    displayName: 'Tertiary Students & Adults (19+)',
    description: 'Full suite including productivity, leadership, career routing',
    
    // Assessments: ALL levels
    assessmentLevels: [
      AssessmentLevel.BASIC,
      AssessmentLevel.BEGINNER,
      AssessmentLevel.INTERMEDIATE,
      AssessmentLevel.ADVANCED,
      AssessmentLevel.EXPERT
    ],
    availableAssessments: [
      'kolb-learning-styles',
      'sternberg-thinking-styles',
      'dual-process-decision',
      'advanced-strengths',
      'career-aptitude',
      'decision-making-styles',
      'leadership-assessment',
      'emotional-intelligence',
      'personality-insights',
      'productivity-profile',
      'team-dynamics',
      'conflict-resolution',
      'communication-styles'
    ],
    maxAssessmentLength: 200, // No limit
    
    // Insights: Full access
    basicInsights: true,
    detailedInsights: true,
    careerMapping: true,
    decisionInsights: true,
    
    // Gamification: Full access
    badges: true,
    challenges: true,
    leaderboards: true,
    rewards: true,
    
    // Analytics: Full access
    basicProgress: true,
    schoolAnalytics: true,
    advancedAnalytics: true,
    comparativeAnalytics: true,
    
    // Career Tools: Full access
    careerRouting: true,
    strengthsAnalysis: true,
    skillDevelopment: true,
    
    // Productivity & Leadership: Full access
    productivityTools: true,
    leadershipAssessments: true,
    teamAnalytics: true,
    
    // Dashboard: Professional dashboard
    supervisedDashboard: false,
    studentDashboard: false,
    professionalDashboard: true,
    
    // Parent Oversight: NOT APPLICABLE
    parentalOversightRequired: false,
    parentalOversightRecommended: false,
    parentalOversightOptional: false
  }
};

// ============= PARENT/GUARDIAN RESPONSIBILITIES =============

export interface ParentResponsibilities {
  required: boolean;
  recommended: boolean;
  optional: boolean;
  notApplicable: boolean;
  
  responsibilities: string[];
  monitoringLevel: 'full' | 'oversight' | 'optional' | 'none';
}

export const PARENT_RESPONSIBILITIES: Record<AgeCategory, ParentResponsibilities> = {
  [AgeCategory.EARLY_LEARNER]: {
    required: true,
    recommended: false,
    optional: false,
    notApplicable: false,
    
    responsibilities: [
      'Monitor all platform usage and activity',
      'Provide accurate child information during signup',
      'Supervise all assessment sessions',
      'Review all results and insights',
      'Support safe and appropriate engagement',
      'Request data deletion if needed',
      'Maintain account security',
      'Ensure child understands age-appropriate content'
    ],
    monitoringLevel: 'full'
  },

  [AgeCategory.JUNIOR_LEARNER]: {
    required: true, // For 11-12
    recommended: true, // For 13-15
    optional: false,
    notApplicable: false,
    
    responsibilities: [
      'Monitor platform usage regularly (11-12: required, 13-15: recommended)',
      'Provide accurate student information',
      'Review assessment results periodically',
      'Support safe engagement with platform',
      'Request data deletion if needed',
      'Maintain oversight of account security',
      'Discuss insights and results with student',
      'Approve sharing of results (11-12 only)'
    ],
    monitoringLevel: 'oversight'
  },

  [AgeCategory.SENIOR_ADOLESCENT]: {
    required: false,
    recommended: false,
    optional: true,
    notApplicable: false,
    
    responsibilities: [
      'Optional: Monitor platform usage if student grants access',
      'Optional: Review results if shared by student',
      'Optional: Discuss career insights with student',
      'Available if needed: Request data deletion',
      'Note: Student has independent account control'
    ],
    monitoringLevel: 'optional'
  },

  [AgeCategory.ADULT]: {
    required: false,
    recommended: false,
    optional: false,
    notApplicable: true,
    
    responsibilities: [
      'No parental involvement or oversight',
      'User has complete account independence'
    ],
    monitoringLevel: 'none'
  }
};

// ============= UTILITY FUNCTIONS =============

/**
 * Get features available for age category
 */
export function getAgeFeaturesConfig(ageCategory: AgeCategory): AgeGroupFeatures {
  return AGE_GROUP_FEATURES[ageCategory];
}

/**
 * Check if specific feature is available for age
 */
export function isFeatureAvailable(
  ageCategory: AgeCategory,
  feature: keyof AgeGroupFeatures
): boolean {
  const config = AGE_GROUP_FEATURES[ageCategory];
  return Boolean(config[feature]);
}

/**
 * Get available assessments for age
 */
export function getAvailableAssessments(ageCategory: AgeCategory): string[] {
  return AGE_GROUP_FEATURES[ageCategory].availableAssessments;
}

/**
 * Check if assessment is available for age
 */
export function canTakeAssessment(
  ageCategory: AgeCategory,
  assessmentId: string
): boolean {
  const available = getAvailableAssessments(ageCategory);
  return available.includes(assessmentId);
}

/**
 * Get assessment complexity levels for age
 */
export function getAssessmentLevels(ageCategory: AgeCategory): AssessmentLevel[] {
  return AGE_GROUP_FEATURES[ageCategory].assessmentLevels;
}

/**
 * Get max assessment length for age
 */
export function getMaxAssessmentLength(ageCategory: AgeCategory): number {
  return AGE_GROUP_FEATURES[ageCategory].maxAssessmentLength;
}

/**
 * Get parent responsibilities for age
 */
export function getParentResponsibilities(ageCategory: AgeCategory): ParentResponsibilities {
  return PARENT_RESPONSIBILITIES[ageCategory];
}

/**
 * Check if parental oversight is required
 */
export function isParentOversightRequired(ageCategory: AgeCategory, specificAge?: number): boolean {
  const responsibilities = PARENT_RESPONSIBILITIES[ageCategory];
  
  // Special handling for Junior Learners
  if (ageCategory === AgeCategory.JUNIOR_LEARNER && specificAge) {
    // Required for 11-12, recommended (not required) for 13-15
    return specificAge >= 11 && specificAge <= 12;
  }
  
  return responsibilities.required;
}

/**
 * Get monitoring level description
 */
export function getMonitoringLevelDescription(level: 'full' | 'oversight' | 'optional' | 'none'): string {
  const descriptions = {
    full: 'Parents/guardians must supervise all activities and have full account access',
    oversight: 'Parents/guardians should monitor usage and review results periodically',
    optional: 'Parents/guardians may request access but student controls account',
    none: 'No parental involvement - user has complete independence'
  };
  
  return descriptions[level];
}

/**
 * Get dashboard type for age category
 */
export function getDashboardType(ageCategory: AgeCategory): 'supervised' | 'student' | 'professional' {
  const config = AGE_GROUP_FEATURES[ageCategory];
  
  if (config.supervisedDashboard) return 'supervised';
  if (config.professionalDashboard) return 'professional';
  return 'student';
}

/**
 * Get feature summary for age category
 */
export function getFeatureSummary(ageCategory: AgeCategory): string {
  return AGE_GROUP_FEATURES[ageCategory].description;
}

// ============= FEATURE ACCESS MATRIX =============

export interface FeatureAccessMatrix {
  category: string;
  ages_6_10: boolean | string;
  ages_11_15: boolean | string;
  ages_16_18: boolean | string;
  ages_19_plus: boolean | string;
}

export const FEATURE_ACCESS_MATRIX: FeatureAccessMatrix[] = [
  {
    category: 'Basic Learning Assessments',
    ages_6_10: true,
    ages_11_15: true,
    ages_16_18: true,
    ages_19_plus: true
  },
  {
    category: 'Advanced Assessments',
    ages_6_10: false,
    ages_11_15: 'Intermediate only',
    ages_16_18: true,
    ages_19_plus: true
  },
  {
    category: 'Gamified Tasks',
    ages_6_10: true,
    ages_11_15: true,
    ages_16_18: true,
    ages_19_plus: true
  },
  {
    category: 'Basic Insights',
    ages_6_10: 'Parent only',
    ages_11_15: true,
    ages_16_18: true,
    ages_19_plus: true
  },
  {
    category: 'Detailed Insights',
    ages_6_10: false,
    ages_11_15: true,
    ages_16_18: true,
    ages_19_plus: true
  },
  {
    category: 'School Analytics',
    ages_6_10: false,
    ages_11_15: true,
    ages_16_18: true,
    ages_19_plus: true
  },
  {
    category: 'Career Mapping',
    ages_6_10: false,
    ages_11_15: false,
    ages_16_18: true,
    ages_19_plus: true
  },
  {
    category: 'Decision Insights',
    ages_6_10: false,
    ages_11_15: true,
    ages_16_18: true,
    ages_19_plus: true
  },
  {
    category: 'Productivity Tools',
    ages_6_10: false,
    ages_11_15: false,
    ages_16_18: true,
    ages_19_plus: true
  },
  {
    category: 'Leadership Assessments',
    ages_6_10: false,
    ages_11_15: false,
    ages_16_18: true,
    ages_19_plus: true
  },
  {
    category: 'Career Routing',
    ages_6_10: false,
    ages_11_15: false,
    ages_16_18: true,
    ages_19_plus: true
  },
  {
    category: 'Team Analytics',
    ages_6_10: false,
    ages_11_15: false,
    ages_16_18: false,
    ages_19_plus: true
  },
  {
    category: 'Supervised Dashboard',
    ages_6_10: true,
    ages_11_15: false,
    ages_16_18: false,
    ages_19_plus: false
  },
  {
    category: 'Student Dashboard',
    ages_6_10: false,
    ages_11_15: true,
    ages_16_18: true,
    ages_19_plus: false
  },
  {
    category: 'Professional Dashboard',
    ages_6_10: false,
    ages_11_15: false,
    ages_16_18: false,
    ages_19_plus: true
  }
];
