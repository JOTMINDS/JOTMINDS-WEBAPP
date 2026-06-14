/**
 * JotMinds Privacy Policy Configuration System
 * Based on official Privacy Policy dated November 30, 2025
 * Operator: i2 Communications Ltd, Ghana
 */

import { AgeCategory } from './age-consent-types';

// ============= PRIVACY POLICY METADATA =============

export const PRIVACY_POLICY_META = {
  lastUpdated: 'November 30, 2025',
  effectiveDate: 'December 1, 2025',
  version: '1.0',
  operator: {
    name: 'JotMinds',
    legalEntity: 'i2 Communications Ltd',
    country: 'Ghana',
    email: ['info@i2comms.org', 'info@jotminds.com'],
    phone: '+233-24-590-8668',
    website: 'www.JotMinds.com'
  }
};

// ============= DATA COLLECTION BY AGE =============

export interface DataCollectionConfig {
  ageCategory: AgeCategory;
  
  // Personal Information
  personalInfo: {
    fullName: boolean;
    nickname: boolean;
    dateOfBirth: boolean;
    ageGroup: boolean;
    email: boolean;
    phone: boolean;
    studentId: boolean;
  };
  
  // Academic Information
  academicInfo: {
    school: boolean;
    class: boolean;
    grade: boolean;
    academicRecords: boolean;
    learningObjectives: boolean;
  };
  
  // Parent/Guardian Information
  parentInfo: {
    required: boolean;
    parentContact: boolean;
    parentEmail: boolean;
    parentPhone: boolean;
  };
  
  // Assessment Data
  assessmentData: {
    responses: boolean;
    simplifiedResponses: boolean;
    careerPreferences: boolean;
    academicPreferences: boolean;
    professionalGoals: boolean;
  };
  
  // Automatically Collected
  automaticData: {
    deviceInfo: boolean;
    ipAddress: boolean;
    usagePatterns: boolean;
    activityLogs: boolean;
    crashReports: boolean;
  };
}

export const DATA_COLLECTION_CONFIGS: Record<AgeCategory, DataCollectionConfig> = {
  // AGES 6-10: MINIMAL COLLECTION
  [AgeCategory.EARLY_LEARNER]: {
    ageCategory: AgeCategory.EARLY_LEARNER,
    
    personalInfo: {
      fullName: false,              // ❌ Not collected
      nickname: true,               // ✅ First name or nickname only
      dateOfBirth: false,           // ❌ Not collected
      ageGroup: true,               // ✅ Age group only
      email: false,                 // ❌ Not collected
      phone: false,                 // ❌ Not collected
      studentId: false              // ❌ Not collected
    },
    
    academicInfo: {
      school: true,                 // ✅ If applicable
      class: true,                  // ✅ If applicable
      grade: false,                 // ❌ Not collected
      academicRecords: false,       // ❌ Not collected
      learningObjectives: false     // ❌ Not collected
    },
    
    parentInfo: {
      required: true,               // ✅ Always required
      parentContact: true,          // ✅ Required
      parentEmail: true,            // ✅ Required
      parentPhone: true             // ✅ Required
    },
    
    assessmentData: {
      responses: false,             // ❌ Regular responses not stored
      simplifiedResponses: true,    // ✅ Heavily simplified only
      careerPreferences: false,     // ❌ Not collected
      academicPreferences: false,   // ❌ Not collected
      professionalGoals: false      // ❌ Not collected
    },
    
    automaticData: {
      deviceInfo: true,             // ✅ For compatibility
      ipAddress: true,              // ✅ For security (not location)
      usagePatterns: true,          // ✅ For improvement
      activityLogs: true,           // ✅ For safety
      crashReports: true            // ✅ For stability
    }
  },

  // AGES 11-15: LIMITED COLLECTION
  [AgeCategory.JUNIOR_LEARNER]: {
    ageCategory: AgeCategory.JUNIOR_LEARNER,
    
    personalInfo: {
      fullName: true,               // ✅ Full name or student ID
      nickname: true,               // ✅ Optional
      dateOfBirth: true,            // ✅ Age/DOB
      ageGroup: true,               // ✅ Age group
      email: true,                  // ⚠️ Optional for 13-15
      phone: true,                  // ⚠️ Optional for 13-15
      studentId: true               // ✅ If school-based
    },
    
    academicInfo: {
      school: true,                 // ✅ School info
      class: true,                  // ✅ Class
      grade: true,                  // ✅ Grade
      academicRecords: false,       // ❌ Not collected
      learningObjectives: true      // ✅ Learning objectives
    },
    
    parentInfo: {
      required: true,               // ✅ Ages 11-12: required, 13-15: recommended
      parentContact: true,          // ✅ Parent contact
      parentEmail: true,            // ✅ Parent email
      parentPhone: true             // ✅ Parent phone
    },
    
    assessmentData: {
      responses: true,              // ✅ Assessment responses
      simplifiedResponses: false,   // ❌ Regular responses
      careerPreferences: false,     // ❌ Not yet
      academicPreferences: true,    // ✅ Academic preferences
      professionalGoals: false      // ❌ Not yet
    },
    
    automaticData: {
      deviceInfo: true,
      ipAddress: true,
      usagePatterns: true,
      activityLogs: true,
      crashReports: true
    }
  },

  // AGES 16-18: EXPANDED COLLECTION
  [AgeCategory.SENIOR_ADOLESCENT]: {
    ageCategory: AgeCategory.SENIOR_ADOLESCENT,
    
    personalInfo: {
      fullName: true,               // ✅ Full name
      nickname: true,               // ✅ Optional
      dateOfBirth: true,            // ✅ DOB
      ageGroup: true,               // ✅ Age group
      email: true,                  // ✅ Email
      phone: true,                  // ✅ Phone (optional)
      studentId: true               // ✅ If applicable
    },
    
    academicInfo: {
      school: true,                 // ✅ School
      class: true,                  // ✅ Class
      grade: true,                  // ✅ Grade
      academicRecords: true,        // ✅ Optional records
      learningObjectives: true      // ✅ Learning objectives
    },
    
    parentInfo: {
      required: false,              // ⚠️ Optional (notification recommended)
      parentContact: false,         // ⚠️ Optional
      parentEmail: false,           // ⚠️ Optional
      parentPhone: false            // ⚠️ Optional
    },
    
    assessmentData: {
      responses: true,              // ✅ Full responses
      simplifiedResponses: false,   // ❌ Not needed
      careerPreferences: true,      // ✅ Career preferences
      academicPreferences: true,    // ✅ Academic preferences
      professionalGoals: false      // ❌ Not yet
    },
    
    automaticData: {
      deviceInfo: true,
      ipAddress: true,
      usagePatterns: true,
      activityLogs: true,
      crashReports: true
    }
  },

  // AGES 19+: FULL COLLECTION
  [AgeCategory.ADULT]: {
    ageCategory: AgeCategory.ADULT,
    
    personalInfo: {
      fullName: true,               // ✅ Full personal profile
      nickname: true,               // ✅ Optional
      dateOfBirth: true,            // ✅ DOB
      ageGroup: true,               // ✅ Age
      email: true,                  // ✅ Email required
      phone: true,                  // ✅ Phone
      studentId: false              // ❌ N/A
    },
    
    academicInfo: {
      school: true,                 // ✅ Education details
      class: false,                 // ❌ N/A
      grade: false,                 // ❌ N/A
      academicRecords: true,        // ✅ Work/education history
      learningObjectives: true      // ✅ Professional goals
    },
    
    parentInfo: {
      required: false,              // ❌ Not applicable
      parentContact: false,         // ❌ Not applicable
      parentEmail: false,           // ❌ Not applicable
      parentPhone: false            // ❌ Not applicable
    },
    
    assessmentData: {
      responses: true,              // ✅ Full responses
      simplifiedResponses: false,   // ❌ Not needed
      careerPreferences: true,      // ✅ Career preferences
      academicPreferences: true,    // ✅ Academic preferences
      professionalGoals: true       // ✅ Professional goals
    },
    
    automaticData: {
      deviceInfo: true,
      ipAddress: true,
      usagePatterns: true,
      activityLogs: true,
      crashReports: true
    }
  }
};

// ============= DATA USAGE =============

export const DATA_USAGE = {
  permitted: [
    'Personalized insights and assessments',
    'Learning-path recommendations',
    'Cognitive analytics',
    'Age-appropriate content delivery',
    'Improved app functionality',
    'Reporting for parents and schools',
    'Safety and compliance',
    'User support'
  ],
  
  prohibited: [
    'Selling data to third parties',
    'Using data for advertising',
    'Enabling chat or social networking',
    'Tracking real-time physical location',
    'Behavioral advertising',
    'Sharing with data brokers',
    'Commercial profiling of minors',
    'Unverified third-party sharing'
  ]
};

// ============= DATA SHARING =============

export interface DataSharingConfig {
  ageCategory: AgeCategory;
  
  withParents: {
    allowed: boolean;
    requirement: 'always' | 'recommended' | 'optional' | 'not_applicable';
  };
  
  withSchools: {
    allowed: boolean;
    requiresAgreement: boolean;
    accessLogged: boolean;
    purposes: string[];
  };
  
  withThirdParties: {
    allowed: boolean;
    types: string[];
    restrictions: string[];
  };
  
  prohibited: string[];
}

export const DATA_SHARING_CONFIGS: Record<AgeCategory, DataSharingConfig> = {
  [AgeCategory.EARLY_LEARNER]: {
    ageCategory: AgeCategory.EARLY_LEARNER,
    
    withParents: {
      allowed: true,
      requirement: 'always'
    },
    
    withSchools: {
      allowed: true,
      requiresAgreement: true,
      accessLogged: true,
      purposes: ['Academic progress', 'Learning support', 'Safety monitoring']
    },
    
    withThirdParties: {
      allowed: true,
      types: ['Cloud hosting', 'Analytics (anonymized)', 'Security services'],
      restrictions: [
        'Cannot use for advertising',
        'Must comply with data protection standards',
        'Strict confidentiality required',
        'No re-sharing allowed'
      ]
    },
    
    prohibited: ['Advertisers', 'Social platforms', 'Data brokers', 'Unverified parties']
  },
  
  [AgeCategory.JUNIOR_LEARNER]: {
    ageCategory: AgeCategory.JUNIOR_LEARNER,
    
    withParents: {
      allowed: true,
      requirement: 'recommended'  // Ages 11-12: always, 13-15: recommended
    },
    
    withSchools: {
      allowed: true,
      requiresAgreement: true,
      accessLogged: true,
      purposes: ['Academic progress', 'Learning support', 'Career guidance']
    },
    
    withThirdParties: {
      allowed: true,
      types: ['Cloud hosting', 'Analytics (anonymized)', 'Security services'],
      restrictions: [
        'Cannot use for advertising',
        'Must comply with data protection standards',
        'Strict confidentiality required',
        'No re-sharing allowed'
      ]
    },
    
    prohibited: ['Advertisers', 'Social platforms', 'Data brokers', 'Unverified parties']
  },
  
  [AgeCategory.SENIOR_ADOLESCENT]: {
    ageCategory: AgeCategory.SENIOR_ADOLESCENT,
    
    withParents: {
      allowed: true,
      requirement: 'optional'
    },
    
    withSchools: {
      allowed: true,
      requiresAgreement: true,
      accessLogged: true,
      purposes: ['Academic progress', 'Career guidance', 'College preparation']
    },
    
    withThirdParties: {
      allowed: true,
      types: ['Cloud hosting', 'Analytics (anonymized)', 'Security services'],
      restrictions: [
        'Cannot use for advertising',
        'Must comply with data protection standards',
        'Strict confidentiality required'
      ]
    },
    
    prohibited: ['Advertisers', 'Social platforms', 'Data brokers', 'Unverified parties']
  },
  
  [AgeCategory.ADULT]: {
    ageCategory: AgeCategory.ADULT,
    
    withParents: {
      allowed: false,
      requirement: 'not_applicable'
    },
    
    withSchools: {
      allowed: true,
      requiresAgreement: true,
      accessLogged: true,
      purposes: ['Professional development', 'Career services', 'Educational support']
    },
    
    withThirdParties: {
      allowed: true,
      types: ['Cloud hosting', 'Analytics', 'Security services', 'Professional services'],
      restrictions: [
        'Cannot use for unsolicited marketing',
        'Must comply with data protection standards',
        'Confidentiality required'
      ]
    },
    
    prohibited: ['Unverified parties', 'Data brokers without consent']
  }
};

// ============= DATA RETENTION =============

export interface DataRetentionConfig {
  ageCategory: AgeCategory;
  
  activeRetention: string;
  inactivityPeriod: string;
  deletionOnRequest: boolean;
  deletionRequestedBy: string[];
  
  whatIsDeleted: string[];
}

export const DATA_RETENTION_CONFIGS: Record<AgeCategory, DataRetentionConfig> = {
  [AgeCategory.EARLY_LEARNER]: {
    ageCategory: AgeCategory.EARLY_LEARNER,
    activeRetention: 'Only for active use',
    inactivityPeriod: '6-12 months',
    deletionOnRequest: true,
    deletionRequestedBy: ['Parent', 'Guardian', 'School (if onboarded)'],
    whatIsDeleted: [
      'All assessments',
      'All insights',
      'Activity logs',
      'Account profile',
      'Parent data'
    ]
  },
  
  [AgeCategory.JUNIOR_LEARNER]: {
    ageCategory: AgeCategory.JUNIOR_LEARNER,
    activeRetention: 'Tied to school or personal use',
    inactivityPeriod: '12-24 months',
    deletionOnRequest: true,
    deletionRequestedBy: ['Parent', 'Guardian', 'Student (with approval)', 'School'],
    whatIsDeleted: [
      'All assessments',
      'All insights',
      'Activity logs',
      'Account profile',
      'Academic data'
    ]
  },
  
  [AgeCategory.SENIOR_ADOLESCENT]: {
    ageCategory: AgeCategory.SENIOR_ADOLESCENT,
    activeRetention: 'Tied to school or personal use',
    inactivityPeriod: '24-36 months',
    deletionOnRequest: true,
    deletionRequestedBy: ['Student', 'School (if school account)'],
    whatIsDeleted: [
      'All assessments',
      'All insights',
      'Activity logs',
      'Account profile',
      'Career preferences'
    ]
  },
  
  [AgeCategory.ADULT]: {
    ageCategory: AgeCategory.ADULT,
    activeRetention: 'User-controlled',
    inactivityPeriod: 'User-defined (default 36 months)',
    deletionOnRequest: true,
    deletionRequestedBy: ['User'],
    whatIsDeleted: [
      'All assessments',
      'All insights',
      'Activity logs',
      'Account profile',
      'Professional data'
    ]
  }
};

// ============= USER RIGHTS =============

export interface UserRights {
  ageCategory: AgeCategory;
  
  accessData: { allowed: boolean; requestedBy: string[] };
  correctData: { allowed: boolean; requestedBy: string[] };
  deleteData: { allowed: boolean; requestedBy: string[] };
  exportData: { allowed: boolean; requestedBy: string[] };
  withdrawConsent: { allowed: boolean; requestedBy: string[] };
  limitProcessing: { allowed: boolean; requestedBy: string[] };
  objectProcessing: { allowed: boolean; requestedBy: string[] };
}

export const USER_RIGHTS_CONFIGS: Record<AgeCategory, UserRights> = {
  [AgeCategory.EARLY_LEARNER]: {
    ageCategory: AgeCategory.EARLY_LEARNER,
    
    accessData: { allowed: true, requestedBy: ['Parent', 'Guardian'] },
    correctData: { allowed: true, requestedBy: ['Parent', 'Guardian'] },
    deleteData: { allowed: true, requestedBy: ['Parent', 'Guardian'] },
    exportData: { allowed: true, requestedBy: ['Parent', 'Guardian'] },
    withdrawConsent: { allowed: true, requestedBy: ['Parent', 'Guardian'] },
    limitProcessing: { allowed: true, requestedBy: ['Parent', 'Guardian'] },
    objectProcessing: { allowed: true, requestedBy: ['Parent', 'Guardian'] }
  },
  
  [AgeCategory.JUNIOR_LEARNER]: {
    ageCategory: AgeCategory.JUNIOR_LEARNER,
    
    accessData: { allowed: true, requestedBy: ['Parent', 'Guardian', 'Student (with approval)'] },
    correctData: { allowed: true, requestedBy: ['Parent', 'Guardian', 'Student (with approval)'] },
    deleteData: { allowed: true, requestedBy: ['Parent', 'Guardian'] },
    exportData: { allowed: true, requestedBy: ['Parent', 'Guardian', 'Student'] },
    withdrawConsent: { allowed: true, requestedBy: ['Parent', 'Guardian'] },
    limitProcessing: { allowed: true, requestedBy: ['Parent', 'Guardian'] },
    objectProcessing: { allowed: true, requestedBy: ['Parent', 'Guardian'] }
  },
  
  [AgeCategory.SENIOR_ADOLESCENT]: {
    ageCategory: AgeCategory.SENIOR_ADOLESCENT,
    
    accessData: { allowed: true, requestedBy: ['Student'] },
    correctData: { allowed: true, requestedBy: ['Student'] },
    deleteData: { allowed: true, requestedBy: ['Student'] },
    exportData: { allowed: true, requestedBy: ['Student'] },
    withdrawConsent: { allowed: true, requestedBy: ['Student'] },
    limitProcessing: { allowed: true, requestedBy: ['Student'] },
    objectProcessing: { allowed: true, requestedBy: ['Student'] }
  },
  
  [AgeCategory.ADULT]: {
    ageCategory: AgeCategory.ADULT,
    
    accessData: { allowed: true, requestedBy: ['User'] },
    correctData: { allowed: true, requestedBy: ['User'] },
    deleteData: { allowed: true, requestedBy: ['User'] },
    exportData: { allowed: true, requestedBy: ['User'] },
    withdrawConsent: { allowed: true, requestedBy: ['User'] },
    limitProcessing: { allowed: true, requestedBy: ['User'] },
    objectProcessing: { allowed: true, requestedBy: ['User'] }
  }
};

// ============= UTILITY FUNCTIONS =============

export function getDataCollectionConfig(ageCategory: AgeCategory): DataCollectionConfig {
  return DATA_COLLECTION_CONFIGS[ageCategory];
}

export function getDataSharingConfig(ageCategory: AgeCategory): DataSharingConfig {
  return DATA_SHARING_CONFIGS[ageCategory];
}

export function getDataRetentionConfig(ageCategory: AgeCategory): DataRetentionConfig {
  return DATA_RETENTION_CONFIGS[ageCategory];
}

export function getUserRights(ageCategory: AgeCategory): UserRights {
  return USER_RIGHTS_CONFIGS[ageCategory];
}

export function canShareWithParents(ageCategory: AgeCategory): boolean {
  return DATA_SHARING_CONFIGS[ageCategory].withParents.allowed;
}

export function getParentSharingRequirement(ageCategory: AgeCategory): string {
  return DATA_SHARING_CONFIGS[ageCategory].withParents.requirement;
}

export function getRetentionPeriod(ageCategory: AgeCategory): string {
  return DATA_RETENTION_CONFIGS[ageCategory].inactivityPeriod;
}

export function whoCanDeleteData(ageCategory: AgeCategory): string[] {
  return DATA_RETENTION_CONFIGS[ageCategory].deletionRequestedBy;
}

export function whoCanAccessData(ageCategory: AgeCategory): string[] {
  return USER_RIGHTS_CONFIGS[ageCategory].accessData.requestedBy;
}
