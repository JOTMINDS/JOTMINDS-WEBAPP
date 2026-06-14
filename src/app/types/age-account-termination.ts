/**
 * JotMinds Account Termination, Suspension, and Liability Framework
 * Age-appropriate account management and legal protections
 */

import { AgeCategory } from './age-consent-types';

// ============= TERMINATION AUTHORITY =============

export enum TerminationAuthority {
  PARENT = 'PARENT',                    // Parent/guardian can terminate
  SCHOOL = 'SCHOOL',                    // School can terminate (if onboarded)
  USER = 'USER',                        // User can self-terminate
  ADMIN = 'ADMIN',                      // Platform admin
  REGULATORY = 'REGULATORY'             // Regulatory requirement
}

export enum SuspensionReason {
  PARENT_REQUEST = 'PARENT_REQUEST',
  SCHOOL_REQUEST = 'SCHOOL_REQUEST',
  USER_REQUEST = 'USER_REQUEST',
  INACTIVITY = 'INACTIVITY',
  POLICY_VIOLATION = 'POLICY_VIOLATION',
  DATA_PROTECTION = 'DATA_PROTECTION',
  INVESTIGATION = 'INVESTIGATION'
}

// ============= ACCOUNT TERMINATION PERMISSIONS =============

export interface AccountTerminationPermissions {
  ageCategory: AgeCategory;
  
  // Who can terminate
  parentCanTerminate: boolean;
  guardianCanTerminate: boolean;
  schoolCanTerminate: boolean;
  userCanSelfTerminate: boolean;
  
  // Suspension permissions
  parentCanSuspend: boolean;
  schoolCanSuspend: boolean;
  userCanSelfSuspend: boolean;
  
  // Reactivation permissions
  parentCanReactivate: boolean;
  schoolCanReactivate: boolean;
  userCanReactivate: boolean;
  
  // Notice requirements
  noticeToParent: boolean;
  noticeToSchool: boolean;
  noticeToUser: boolean;
  noticePeriodDays: number;
  
  // Data handling after termination
  immediateDataDeletion: boolean;
  dataRetentionDays: number;
  parentCanExportBeforeDeletion: boolean;
  userCanExportBeforeDeletion: boolean;
}

// ============= LIABILITY FRAMEWORK =============

export interface LiabilityProtections {
  ageCategory: AgeCategory;
  
  // Platform liability limitations
  notLiableFor: string[];
  
  // User responsibilities
  userResponsibilities: string[];
  
  // Guardian responsibilities (if applicable)
  guardianResponsibilities: string[];
  
  // School responsibilities (if school-based)
  schoolResponsibilities: string[];
  
  // Warranty disclaimers
  warranties: {
    noGuaranteeOfOutcomes: boolean;
    noGuaranteeOfAccuracy: boolean;
    educationalPurposeOnly: boolean;
    notProfessionalAdvice: boolean;
    requiresSupervision: boolean;
  };
  
  // Indemnification
  indemnificationRequired: boolean;
  indemnificationParties: string[];
}

// ============= ACCOUNT TERMINATION CONFIGS BY AGE =============

export const TERMINATION_CONFIGS: Record<AgeCategory, AccountTerminationPermissions> = {
  // AGES 6-10: PARENT CONTROL ONLY
  [AgeCategory.EARLY_LEARNER]: {
    ageCategory: AgeCategory.EARLY_LEARNER,
    
    // Termination permissions
    parentCanTerminate: true,          // ✅ Parent can terminate anytime
    guardianCanTerminate: true,        // ✅ Guardian can terminate anytime
    schoolCanTerminate: true,          // ✅ School can terminate (if onboarded)
    userCanSelfTerminate: false,       // ❌ Child cannot self-terminate
    
    // Suspension permissions
    parentCanSuspend: true,            // ✅ Parent can suspend
    schoolCanSuspend: true,            // ✅ School can suspend (if onboarded)
    userCanSelfSuspend: false,         // ❌ Child cannot self-suspend
    
    // Reactivation permissions
    parentCanReactivate: true,         // ✅ Parent can reactivate
    schoolCanReactivate: true,         // ✅ School can reactivate (if they suspended)
    userCanReactivate: false,          // ❌ Child cannot reactivate
    
    // Notice requirements
    noticeToParent: true,              // ✅ Always notify parent
    noticeToSchool: true,              // ✅ Notify school if onboarded
    noticeToUser: false,               // Child doesn't receive direct notice
    noticePeriodDays: 0,               // Immediate termination available
    
    // Data handling
    immediateDataDeletion: false,      // Retention period before deletion
    dataRetentionDays: 30,             // 30 days to export/recover
    parentCanExportBeforeDeletion: true,
    userCanExportBeforeDeletion: false
  },

  // AGES 11-15: PARENT/GUARDIAN AUTHORITY
  [AgeCategory.JUNIOR_LEARNER]: {
    ageCategory: AgeCategory.JUNIOR_LEARNER,
    
    // Termination permissions
    parentCanTerminate: true,          // ✅ Parent can terminate
    guardianCanTerminate: true,        // ✅ Guardian can terminate
    schoolCanTerminate: true,          // ✅ School can terminate (if onboarded)
    userCanSelfTerminate: false,       // ❌ Student cannot self-terminate
    
    // Suspension permissions
    parentCanSuspend: true,            // ✅ Parent can suspend
    schoolCanSuspend: true,            // ✅ School can suspend
    userCanSelfSuspend: true,          // ✅ Student can request suspension
    
    // Reactivation permissions
    parentCanReactivate: true,         // ✅ Parent can reactivate
    schoolCanReactivate: true,         // ✅ School can reactivate
    userCanReactivate: false,          // ❌ Requires parent approval
    
    // Notice requirements
    noticeToParent: true,              // ✅ Always notify parent
    noticeToSchool: true,              // ✅ Notify school if onboarded
    noticeToUser: true,                // ✅ Notify student
    noticePeriodDays: 7,               // 7-day notice before deletion
    
    // Data handling
    immediateDataDeletion: false,
    dataRetentionDays: 30,
    parentCanExportBeforeDeletion: true,
    userCanExportBeforeDeletion: true
  },

  // AGES 16-18: PARTIAL INDEPENDENCE
  [AgeCategory.SENIOR_ADOLESCENT]: {
    ageCategory: AgeCategory.SENIOR_ADOLESCENT,
    
    // Termination permissions
    parentCanTerminate: false,         // ❌ Parent cannot force termination
    guardianCanTerminate: false,       // ❌ Guardian cannot force termination
    schoolCanTerminate: true,          // ✅ School can terminate (if onboarded)
    userCanSelfTerminate: true,        // ✅ User can self-terminate
    
    // Suspension permissions
    parentCanSuspend: false,           // ❌ Parent cannot suspend
    schoolCanSuspend: true,            // ✅ School can suspend
    userCanSelfSuspend: true,          // ✅ User can self-suspend
    
    // Reactivation permissions
    parentCanReactivate: false,        // ❌ Parent cannot reactivate
    schoolCanReactivate: true,         // ✅ School can reactivate
    userCanReactivate: true,           // ✅ User can reactivate
    
    // Notice requirements
    noticeToParent: false,             // Optional parent notification
    noticeToSchool: true,              // ✅ Notify school if onboarded
    noticeToUser: true,                // ✅ Always notify user
    noticePeriodDays: 14,              // 14-day notice before deletion
    
    // Data handling
    immediateDataDeletion: false,
    dataRetentionDays: 60,
    parentCanExportBeforeDeletion: false,
    userCanExportBeforeDeletion: true
  },

  // AGES 19+: FULL INDEPENDENCE
  [AgeCategory.ADULT]: {
    ageCategory: AgeCategory.ADULT,
    
    // Termination permissions
    parentCanTerminate: false,         // ❌ No parental authority
    guardianCanTerminate: false,       // ❌ No guardian authority
    schoolCanTerminate: false,         // ❌ School cannot terminate adult accounts
    userCanSelfTerminate: true,        // ✅ User has full control
    
    // Suspension permissions
    parentCanSuspend: false,           // ❌ No parental authority
    schoolCanSuspend: false,           // ❌ No school authority
    userCanSelfSuspend: true,          // ✅ User can self-suspend
    
    // Reactivation permissions
    parentCanReactivate: false,        // ❌ No parental authority
    schoolCanReactivate: false,        // ❌ No school authority
    userCanReactivate: true,           // ✅ User controls reactivation
    
    // Notice requirements
    noticeToParent: false,             // No parent notification
    noticeToSchool: false,             // No school notification
    noticeToUser: true,                // ✅ Only notify user
    noticePeriodDays: 30,              // 30-day notice before deletion
    
    // Data handling
    immediateDataDeletion: false,
    dataRetentionDays: 90,             // Longer retention for adults
    parentCanExportBeforeDeletion: false,
    userCanExportBeforeDeletion: true
  }
};

// ============= LIABILITY PROTECTIONS BY AGE =============

export const LIABILITY_PROTECTIONS: Record<AgeCategory, LiabilityProtections> = {
  // AGES 6-10
  [AgeCategory.EARLY_LEARNER]: {
    ageCategory: AgeCategory.EARLY_LEARNER,
    
    notLiableFor: [
      'Misuse of assessment insights by parent/guardian',
      'Misrepresentation of child\'s assessment results',
      'Lack of parental supervision during platform use',
      'School misuse of dashboard data',
      'Any use outside intended educational purpose',
      'Decisions made based on assessment results',
      'Educational outcomes or academic performance',
      'Developmental expectations or predictions',
      'Career recommendations or suggestions',
      'Third-party interpretation of results'
    ],
    
    userResponsibilities: [
      'N/A - Child not responsible for account management'
    ],
    
    guardianResponsibilities: [
      'Provide full supervision during all platform use',
      'Review and understand all assessment results',
      'Use insights for educational support only',
      'Do not use results for commercial purposes',
      'Do not share child\'s results without consent',
      'Maintain account security',
      'Monitor all activity',
      'Use age-appropriate interpretation'
    ],
    
    schoolResponsibilities: [
      'Use dashboard data for educational purposes only',
      'Maintain student data confidentiality',
      'Obtain parental consent before onboarding',
      'Notify parents of data access',
      'Do not use data for non-educational purposes',
      'Comply with FERPA requirements',
      'Provide teacher training on proper use'
    ],
    
    warranties: {
      noGuaranteeOfOutcomes: true,
      noGuaranteeOfAccuracy: true,
      educationalPurposeOnly: true,
      notProfessionalAdvice: true,
      requiresSupervision: true
    },
    
    indemnificationRequired: true,
    indemnificationParties: ['Parent/Guardian', 'School (if applicable)']
  },

  // AGES 11-15
  [AgeCategory.JUNIOR_LEARNER]: {
    ageCategory: AgeCategory.JUNIOR_LEARNER,
    
    notLiableFor: [
      'Misuse of assessment insights',
      'Misrepresentation of assessment results',
      'Lack of guardian supervision',
      'School misuse of dashboard data',
      'Any use outside intended educational purpose',
      'Decisions made based on assessment results',
      'Academic performance or outcomes',
      'Career path decisions',
      'College admissions outcomes',
      'Peer comparison interpretations',
      'Third-party use of shared results'
    ],
    
    userResponsibilities: [
      'Use platform responsibly for educational purposes',
      'Do not share account credentials',
      'Report any issues to parent/guardian',
      'Use insights with adult guidance',
      'Do not misrepresent results'
    ],
    
    guardianResponsibilities: [
      'Provide oversight and guidance',
      'Review assessment results regularly',
      'Help student interpret insights appropriately',
      'Monitor sharing of results',
      'Use insights for educational support only',
      'Do not use results for commercial purposes',
      'Maintain account security'
    ],
    
    schoolResponsibilities: [
      'Use dashboard data for educational purposes only',
      'Maintain student data confidentiality',
      'Obtain appropriate consent before onboarding',
      'Notify parents of data access',
      'Comply with FERPA requirements',
      'Provide appropriate staff training',
      'Do not misuse or misrepresent data'
    ],
    
    warranties: {
      noGuaranteeOfOutcomes: true,
      noGuaranteeOfAccuracy: true,
      educationalPurposeOnly: true,
      notProfessionalAdvice: true,
      requiresSupervision: true
    },
    
    indemnificationRequired: true,
    indemnificationParties: ['Parent/Guardian', 'School (if applicable)', 'Student (with guardian)']
  },

  // AGES 16-18
  [AgeCategory.SENIOR_ADOLESCENT]: {
    ageCategory: AgeCategory.SENIOR_ADOLESCENT,
    
    notLiableFor: [
      'Misuse of assessment insights',
      'Misrepresentation of assessment results',
      'Decisions made based on insights',
      'Career path choices',
      'College admissions outcomes',
      'Academic performance',
      'Use outside intended educational purpose',
      'Third-party interpretation of results',
      'Employment decisions based on insights',
      'Sharing of results with unauthorized parties'
    ],
    
    userResponsibilities: [
      'Use platform responsibly for educational purposes',
      'Maintain account security',
      'Interpret insights appropriately',
      'Seek adult guidance for major decisions',
      'Do not misrepresent results',
      'Use insights as guidance, not absolute truth',
      'Protect personal data'
    ],
    
    guardianResponsibilities: [
      'Provide guidance if student requests',
      'Support responsible use of insights',
      'Encourage educational application'
    ],
    
    schoolResponsibilities: [
      'Use dashboard data for educational purposes only',
      'Maintain student data confidentiality',
      'Comply with FERPA requirements',
      'Provide appropriate guidance on interpretation',
      'Do not misuse or misrepresent data',
      'Notify student of data access'
    ],
    
    warranties: {
      noGuaranteeOfOutcomes: true,
      noGuaranteeOfAccuracy: true,
      educationalPurposeOnly: true,
      notProfessionalAdvice: true,
      requiresSupervision: false        // Not required but recommended
    },
    
    indemnificationRequired: true,
    indemnificationParties: ['Student', 'School (if applicable)', 'Parent/Guardian (optional)']
  },

  // AGES 19+
  [AgeCategory.ADULT]: {
    ageCategory: AgeCategory.ADULT,
    
    notLiableFor: [
      'Misuse of assessment insights',
      'Misrepresentation of assessment results',
      'Career decisions based on insights',
      'Employment outcomes',
      'Academic performance',
      'Professional development choices',
      'Use outside intended educational purpose',
      'Third-party interpretation of results',
      'Financial decisions influenced by insights',
      'Relationship or personal decisions'
    ],
    
    userResponsibilities: [
      'Use platform responsibly',
      'Maintain account security',
      'Interpret insights with professional judgment',
      'Seek professional advice for important decisions',
      'Do not misrepresent results',
      'Use insights as guidance, not absolute truth',
      'Protect personal data',
      'Comply with terms of service'
    ],
    
    guardianResponsibilities: [],      // N/A for adults
    
    schoolResponsibilities: [],        // N/A for adult accounts
    
    warranties: {
      noGuaranteeOfOutcomes: true,
      noGuaranteeOfAccuracy: true,
      educationalPurposeOnly: true,
      notProfessionalAdvice: true,
      requiresSupervision: false
    },
    
    indemnificationRequired: true,
    indemnificationParties: ['User']
  }
};

// ============= UTILITY FUNCTIONS =============

/**
 * Get termination permissions for age category
 */
export function getTerminationPermissions(ageCategory: AgeCategory): AccountTerminationPermissions {
  return TERMINATION_CONFIGS[ageCategory];
}

/**
 * Get liability protections for age category
 */
export function getLiabilityProtections(ageCategory: AgeCategory): LiabilityProtections {
  return LIABILITY_PROTECTIONS[ageCategory];
}

/**
 * Check if parent can terminate account
 */
export function canParentTerminate(ageCategory: AgeCategory): boolean {
  return TERMINATION_CONFIGS[ageCategory].parentCanTerminate;
}

/**
 * Check if school can terminate account
 */
export function canSchoolTerminate(ageCategory: AgeCategory): boolean {
  return TERMINATION_CONFIGS[ageCategory].schoolCanTerminate;
}

/**
 * Check if user can self-terminate
 */
export function canUserSelfTerminate(ageCategory: AgeCategory): boolean {
  return TERMINATION_CONFIGS[ageCategory].userCanSelfTerminate;
}

/**
 * Get notice period in days
 */
export function getNoticePeriodDays(ageCategory: AgeCategory): number {
  return TERMINATION_CONFIGS[ageCategory].noticePeriodDays;
}

/**
 * Get data retention period after termination
 */
export function getDataRetentionAfterTermination(ageCategory: AgeCategory): number {
  return TERMINATION_CONFIGS[ageCategory].dataRetentionDays;
}

/**
 * Check if parent must be notified of termination
 */
export function requiresParentNotification(ageCategory: AgeCategory): boolean {
  return TERMINATION_CONFIGS[ageCategory].noticeToParent;
}

/**
 * Check if school must be notified of termination
 */
export function requiresSchoolNotification(ageCategory: AgeCategory, isSchoolAccount: boolean): boolean {
  return isSchoolAccount && TERMINATION_CONFIGS[ageCategory].noticeToSchool;
}

/**
 * Get warranty disclaimers for age
 */
export function getWarrantyDisclaimers(ageCategory: AgeCategory): string[] {
  const protections = LIABILITY_PROTECTIONS[ageCategory];
  const warranties = protections.warranties;
  const disclaimers: string[] = [];

  if (warranties.noGuaranteeOfOutcomes) {
    disclaimers.push('No guarantee of educational or career outcomes');
  }
  if (warranties.noGuaranteeOfAccuracy) {
    disclaimers.push('Assessment results are guidance, not absolute truth');
  }
  if (warranties.educationalPurposeOnly) {
    disclaimers.push('For educational purposes only');
  }
  if (warranties.notProfessionalAdvice) {
    disclaimers.push('Not a substitute for professional advice');
  }
  if (warranties.requiresSupervision) {
    disclaimers.push('Requires adult supervision');
  }

  return disclaimers;
}

/**
 * Get who is not liable for misuse
 */
export function getNotLiableFor(ageCategory: AgeCategory): string[] {
  return LIABILITY_PROTECTIONS[ageCategory].notLiableFor;
}

/**
 * Get user responsibilities
 */
export function getUserResponsibilities(ageCategory: AgeCategory): string[] {
  return LIABILITY_PROTECTIONS[ageCategory].userResponsibilities;
}

/**
 * Get guardian responsibilities
 */
export function getGuardianResponsibilities(ageCategory: AgeCategory): string[] {
  return LIABILITY_PROTECTIONS[ageCategory].guardianResponsibilities;
}

/**
 * Get school responsibilities
 */
export function getSchoolResponsibilities(ageCategory: AgeCategory): string[] {
  return LIABILITY_PROTECTIONS[ageCategory].schoolResponsibilities;
}

/**
 * Check if indemnification is required
 */
export function requiresIndemnification(ageCategory: AgeCategory): boolean {
  return LIABILITY_PROTECTIONS[ageCategory].indemnificationRequired;
}

/**
 * Get parties that must indemnify platform
 */
export function getIndemnificationParties(ageCategory: AgeCategory): string[] {
  return LIABILITY_PROTECTIONS[ageCategory].indemnificationParties;
}
