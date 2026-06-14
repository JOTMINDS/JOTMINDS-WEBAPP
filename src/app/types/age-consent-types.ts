/**
 * JotMinds Age-Based Consent System
 * Based on Terms & Conditions - Last Updated: 30th November 2025
 */

// ============= AGE CATEGORIES =============

export enum AgeCategory {
  EARLY_LEARNER = 'EARLY_LEARNER',       // Ages 6-10
  JUNIOR_LEARNER = 'JUNIOR_LEARNER',     // Ages 11-15
  SENIOR_ADOLESCENT = 'SENIOR_ADOLESCENT', // Ages 16-18
  ADULT = 'ADULT'                        // Ages 19+
}

export interface AgeCategoryDefinition {
  category: AgeCategory;
  minAge: number;
  maxAge: number | null; // null means no upper limit
  label: string;
  description: string;
  consentRequirements: ConsentRequirement;
  features: FeaturePermissions;
}

// ============= CONSENT REQUIREMENTS =============

export enum ConsentType {
  FULL_PARENTAL = 'FULL_PARENTAL',           // Parent/guardian must consent
  PARTIAL_PARENTAL = 'PARTIAL_PARENTAL',     // Student can consent with guardian oversight
  INDEPENDENT_SUPERVISED = 'INDEPENDENT_SUPERVISED', // Independent but school notifies guardians
  FULL_INDEPENDENT = 'FULL_INDEPENDENT'      // Complete independence
}

export interface ConsentRequirement {
  type: ConsentType;
  requiresParentEmail: boolean;
  requiresParentSignature: boolean;
  requiresSchoolVerification: boolean;
  canCreateAccountIndependently: boolean;
  requiresSupervision: boolean;
  guardianOversightRecommended: boolean;
}

// ============= FEATURE PERMISSIONS =============

export interface FeaturePermissions {
  canTakeAssessments: boolean;
  canViewOwnResults: boolean;
  canShareResults: boolean;
  canAccessGamification: boolean;
  canAccessPremiumFeatures: boolean;
  canModifyProfile: boolean;
  canDeleteAccount: boolean;
  requiresParentApprovalForSharing: boolean;
  dataCollectionLevel: 'minimal' | 'standard' | 'full';
}

// ============= USER CONSENT STATUS =============

export interface UserConsentStatus {
  userId: string;
  ageCategory: AgeCategory;
  dateOfBirth: string; // ISO date string
  calculatedAge: number;
  
  // Consent tracking
  termsAccepted: boolean;
  termsAcceptedDate?: string;
  termsVersion: string; // e.g., "2025-11-30"
  
  privacyPolicyAccepted: boolean;
  privacyPolicyDate?: string;
  privacyPolicyVersion: string;
  
  // Parental/Guardian consent
  parentalConsentRequired: boolean;
  parentalConsentGiven: boolean;
  parentalConsentDate?: string;
  parentGuardianEmail?: string;
  parentGuardianName?: string;
  
  // School verification
  schoolVerificationRequired: boolean;
  schoolVerified: boolean;
  schoolVerificationDate?: string;
  schoolName?: string;
  schoolEmail?: string;
  
  // Status
  accountFullyActivated: boolean;
  pendingConsentFrom?: 'parent' | 'school' | null;
}

// ============= AGE CATEGORY CONFIGURATIONS =============

export const AGE_CATEGORY_CONFIGS: Record<AgeCategory, AgeCategoryDefinition> = {
  [AgeCategory.EARLY_LEARNER]: {
    category: AgeCategory.EARLY_LEARNER,
    minAge: 6,
    maxAge: 10,
    label: 'Early Learners',
    description: 'Ages 6-10: Requires full parental or guardian consent',
    consentRequirements: {
      type: ConsentType.FULL_PARENTAL,
      requiresParentEmail: true,
      requiresParentSignature: true,
      requiresSchoolVerification: false, // Can be home or school
      canCreateAccountIndependently: false,
      requiresSupervision: true,
      guardianOversightRecommended: true
    },
    features: {
      canTakeAssessments: true,
      canViewOwnResults: false, // Only parents see results
      canShareResults: false,
      canAccessGamification: true,
      canAccessPremiumFeatures: false,
      canModifyProfile: false,
      canDeleteAccount: false,
      requiresParentApprovalForSharing: true,
      dataCollectionLevel: 'minimal'
    }
  },

  [AgeCategory.JUNIOR_LEARNER]: {
    category: AgeCategory.JUNIOR_LEARNER,
    minAge: 11,
    maxAge: 15,
    label: 'Junior Learners',
    description: 'Ages 11-15: Parental consent required for 11-12, partial consent for 13-15',
    consentRequirements: {
      type: ConsentType.PARTIAL_PARENTAL,
      requiresParentEmail: true,
      requiresParentSignature: true, // For ages 11-12
      requiresSchoolVerification: true, // If enrolled through school
      canCreateAccountIndependently: false, // For 11-12, true for 13-15
      requiresSupervision: false,
      guardianOversightRecommended: true
    },
    features: {
      canTakeAssessments: true,
      canViewOwnResults: true,
      canShareResults: true,
      canAccessGamification: true,
      canAccessPremiumFeatures: true,
      canModifyProfile: true,
      canDeleteAccount: false, // Parent must approve deletion
      requiresParentApprovalForSharing: true, // For ages 11-12
      dataCollectionLevel: 'standard'
    }
  },

  [AgeCategory.SENIOR_ADOLESCENT]: {
    category: AgeCategory.SENIOR_ADOLESCENT,
    minAge: 16,
    maxAge: 18,
    label: 'Senior Adolescents',
    description: 'Ages 16-18: Considered mature minors, may provide independent consent',
    consentRequirements: {
      type: ConsentType.INDEPENDENT_SUPERVISED,
      requiresParentEmail: false,
      requiresParentSignature: false,
      requiresSchoolVerification: true, // If school use
      canCreateAccountIndependently: true,
      requiresSupervision: false,
      guardianOversightRecommended: true
    },
    features: {
      canTakeAssessments: true,
      canViewOwnResults: true,
      canShareResults: true,
      canAccessGamification: true,
      canAccessPremiumFeatures: true,
      canModifyProfile: true,
      canDeleteAccount: true, // With confirmation
      requiresParentApprovalForSharing: false,
      dataCollectionLevel: 'standard'
    }
  },

  [AgeCategory.ADULT]: {
    category: AgeCategory.ADULT,
    minAge: 19,
    maxAge: null,
    label: 'Tertiary Students & Adults',
    description: 'Ages 19+: Full legal consent, independent users',
    consentRequirements: {
      type: ConsentType.FULL_INDEPENDENT,
      requiresParentEmail: false,
      requiresParentSignature: false,
      requiresSchoolVerification: false,
      canCreateAccountIndependently: true,
      requiresSupervision: false,
      guardianOversightRecommended: false
    },
    features: {
      canTakeAssessments: true,
      canViewOwnResults: true,
      canShareResults: true,
      canAccessGamification: true,
      canAccessPremiumFeatures: true,
      canModifyProfile: true,
      canDeleteAccount: true,
      requiresParentApprovalForSharing: false,
      dataCollectionLevel: 'full'
    }
  }
};

// ============= UTILITY FUNCTIONS =============

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Determine age category from age
 */
export function getAgeCategory(age: number): AgeCategory {
  if (age >= 6 && age <= 10) return AgeCategory.EARLY_LEARNER;
  if (age >= 11 && age <= 15) return AgeCategory.JUNIOR_LEARNER;
  if (age >= 16 && age <= 18) return AgeCategory.SENIOR_ADOLESCENT;
  if (age >= 19) return AgeCategory.ADULT;
  
  throw new Error(`Invalid age: ${age}. Must be between 6 and 120.`);
}

/**
 * Get age category from date of birth
 */
export function getAgeCategoryFromDOB(dateOfBirth: string): AgeCategory {
  const age = calculateAge(dateOfBirth);
  return getAgeCategory(age);
}

/**
 * Check if user can perform action based on age
 */
export function canPerformAction(
  ageCategory: AgeCategory,
  action: keyof FeaturePermissions
): boolean {
  const config = AGE_CATEGORY_CONFIGS[ageCategory];
  return config.features[action] as boolean;
}

/**
 * Get consent requirements for age category
 */
export function getConsentRequirements(ageCategory: AgeCategory): ConsentRequirement {
  return AGE_CATEGORY_CONFIGS[ageCategory].consentRequirements;
}

/**
 * Check if parental consent is required
 */
export function requiresParentalConsent(age: number): boolean {
  const category = getAgeCategory(age);
  const requirements = getConsentRequirements(category);
  return requirements.type === ConsentType.FULL_PARENTAL || 
         requirements.type === ConsentType.PARTIAL_PARENTAL;
}

/**
 * Check if account is fully activated
 */
export function isAccountFullyActivated(consentStatus: UserConsentStatus): boolean {
  // Terms must be accepted
  if (!consentStatus.termsAccepted || !consentStatus.privacyPolicyAccepted) {
    return false;
  }
  
  // If parental consent required, it must be given
  if (consentStatus.parentalConsentRequired && !consentStatus.parentalConsentGiven) {
    return false;
  }
  
  // If school verification required, it must be verified
  if (consentStatus.schoolVerificationRequired && !consentStatus.schoolVerified) {
    return false;
  }
  
  return true;
}

/**
 * Get pending consent type
 */
export function getPendingConsent(consentStatus: UserConsentStatus): 'parent' | 'school' | null {
  if (consentStatus.parentalConsentRequired && !consentStatus.parentalConsentGiven) {
    return 'parent';
  }
  
  if (consentStatus.schoolVerificationRequired && !consentStatus.schoolVerified) {
    return 'school';
  }
  
  return null;
}

// ============= CONSTANTS =============

export const CURRENT_TERMS_VERSION = '2025-11-30';
export const CURRENT_PRIVACY_VERSION = '2025-11-30';

export const MINIMUM_AGE = 6;
export const MAXIMUM_AGE = 120;

export const AGE_VERIFICATION_METHODS = {
  DATE_OF_BIRTH: 'date_of_birth',
  AGE_INPUT: 'age_input',
  SCHOOL_VERIFICATION: 'school_verification'
} as const;
