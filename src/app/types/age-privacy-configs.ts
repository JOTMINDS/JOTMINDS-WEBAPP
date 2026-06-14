/**
 * JotMinds Age-Specific Privacy Protection & Limitations
 * Based on COPPA, GDPR, and child protection regulations
 */

import { AgeCategory } from './age-consent-types';

// ============= PRIVACY PROTECTION LEVELS =============

export enum PrivacyLevel {
  MAXIMUM = 'MAXIMUM',       // Ages 6-10: Strictest protection
  HIGH = 'HIGH',             // Ages 11-15: High protection
  MODERATE = 'MODERATE',     // Ages 16-18: Moderate protection
  STANDARD = 'STANDARD'      // Ages 19+: Standard adult protection
}

// ============= DATA MINIMIZATION =============

export interface DataMinimization {
  level: 'strictest' | 'high' | 'moderate' | 'standard';
  collectPersonalInfo: boolean;
  collectBehavioralData: boolean;
  collectUsageAnalytics: boolean;
  collectLocationData: boolean;
  collectDeviceInfo: boolean;
  collectBiometricData: boolean;
  collectSocialConnections: boolean;
  retentionPeriodDays: number;
  anonymizeData: boolean;
}

// ============= PROHIBITED FEATURES FOR MINORS =============

export interface ProhibitedFeatures {
  // Advertising
  displayAds: boolean;
  targetedAdvertising: boolean;
  behavioralAds: boolean;
  thirdPartyAds: boolean;
  
  // Tracking
  locationTracking: boolean;
  preciseLocation: boolean;
  backgroundTracking: boolean;
  crossSiteTracking: boolean;
  
  // Social Features
  socialNetworking: boolean;
  peerMessaging: boolean;
  publicProfiles: boolean;
  userGeneratedContent: boolean;
  commenting: boolean;
  
  // Data Monetization
  dataSelling: boolean;
  dataSharing: boolean;
  commercialProfiling: boolean;
  marketingUse: boolean;
  
  // Other
  fileUploads: boolean;
  externalLinks: boolean;
  thirdPartyIntegrations: boolean;
}

// ============= INTERACTION RESTRICTIONS =============

export interface InteractionRestrictions {
  // Communication
  canSendMessages: boolean;
  canReceiveMessages: boolean;
  canComment: boolean;
  canShare: boolean;
  
  // Public Visibility
  hasPublicProfile: boolean;
  canBeSearched: boolean;
  canBeDiscovered: boolean;
  
  // Content
  canUploadFiles: boolean;
  canUploadImages: boolean;
  canUploadDocuments: boolean;
  canCreatePublicContent: boolean;
  
  // External
  canAccessExternalLinks: boolean;
  canConnectThirdParty: boolean;
}

// ============= ANALYTICS & TRACKING =============

export interface AnalyticsPermissions {
  basicUsageTracking: boolean;
  detailedAnalytics: boolean;
  behavioralTracking: boolean;
  crossSessionTracking: boolean;
  thirdPartyAnalytics: boolean;
  marketingAnalytics: boolean;
  
  anonymizationRequired: boolean;
  aggregationOnly: boolean;
}

// ============= GUARDIAN OVERSIGHT =============

export interface GuardianOversight {
  viewingRequired: boolean;
  viewingRecommended: boolean;
  viewingOptional: boolean;
  
  canViewAllActivity: boolean;
  canViewAssessments: boolean;
  canViewResults: boolean;
  canViewAnalytics: boolean;
  canModifySettings: boolean;
  canDeleteData: boolean;
  
  notificationLevel: 'all' | 'important' | 'minimal' | 'none';
}

// ============= COMPLETE PRIVACY CONFIGURATION =============

export interface AgePrivacyConfiguration {
  ageCategory: AgeCategory;
  privacyLevel: PrivacyLevel;
  
  dataMinimization: DataMinimization;
  prohibitedFeatures: ProhibitedFeatures;
  interactionRestrictions: InteractionRestrictions;
  analyticsPermissions: AnalyticsPermissions;
  guardianOversight: GuardianOversight;
  
  specialProtections: string[];
  complianceNotes: string[];
}

// ============= PRIVACY CONFIGURATIONS BY AGE =============

export const AGE_PRIVACY_CONFIGS: Record<AgeCategory, AgePrivacyConfiguration> = {
  // AGES 6-10: MAXIMUM PROTECTION
  [AgeCategory.EARLY_LEARNER]: {
    ageCategory: AgeCategory.EARLY_LEARNER,
    privacyLevel: PrivacyLevel.MAXIMUM,
    
    dataMinimization: {
      level: 'strictest',
      collectPersonalInfo: true,          // Name, age only
      collectBehavioralData: false,       // NO behavioral tracking
      collectUsageAnalytics: false,       // NO usage analytics
      collectLocationData: false,         // NO location ever
      collectDeviceInfo: false,           // NO device tracking
      collectBiometricData: false,        // NO biometric data
      collectSocialConnections: false,    // NO social data
      retentionPeriodDays: 365,           // 1 year max
      anonymizeData: true                 // Always anonymize
    },
    
    prohibitedFeatures: {
      // Advertising - ALL PROHIBITED
      displayAds: false,
      targetedAdvertising: false,
      behavioralAds: false,
      thirdPartyAds: false,
      
      // Tracking - ALL PROHIBITED
      locationTracking: false,
      preciseLocation: false,
      backgroundTracking: false,
      crossSiteTracking: false,
      
      // Social Features - ALL PROHIBITED
      socialNetworking: false,
      peerMessaging: false,
      publicProfiles: false,
      userGeneratedContent: false,
      commenting: false,
      
      // Data Monetization - ALL PROHIBITED
      dataSelling: false,
      dataSharing: false,
      commercialProfiling: false,
      marketingUse: false,
      
      // Other
      fileUploads: false,               // NO uploads
      externalLinks: false,             // NO external links
      thirdPartyIntegrations: false     // NO third-party services
    },
    
    interactionRestrictions: {
      // Communication - ALL BLOCKED
      canSendMessages: false,
      canReceiveMessages: false,
      canComment: false,
      canShare: false,
      
      // Public Visibility - ALL BLOCKED
      hasPublicProfile: false,
      canBeSearched: false,
      canBeDiscovered: false,
      
      // Content - ALL BLOCKED
      canUploadFiles: false,
      canUploadImages: false,
      canUploadDocuments: false,
      canCreatePublicContent: false,
      
      // External - ALL BLOCKED
      canAccessExternalLinks: false,
      canConnectThirdParty: false
    },
    
    analyticsPermissions: {
      basicUsageTracking: false,        // NO tracking
      detailedAnalytics: false,
      behavioralTracking: false,
      crossSessionTracking: false,
      thirdPartyAnalytics: false,
      marketingAnalytics: false,
      
      anonymizationRequired: true,      // If any data collected, anonymize
      aggregationOnly: true             // Only aggregate, never individual
    },
    
    guardianOversight: {
      viewingRequired: true,            // Parent MUST oversee
      viewingRecommended: false,
      viewingOptional: false,
      
      canViewAllActivity: true,
      canViewAssessments: true,
      canViewResults: true,
      canViewAnalytics: true,
      canModifySettings: true,
      canDeleteData: true,
      
      notificationLevel: 'all'          // Notify parent of everything
    },
    
    specialProtections: [
      'COPPA Full Compliance - Verifiable parental consent required',
      'No data collection beyond educational necessity',
      'No messaging or communication features',
      'No file uploads or user-generated content',
      'All activity logged for parent review',
      'Maximum data minimization enforced',
      'No third-party data sharing',
      'No cookies beyond essential session management'
    ],
    
    complianceNotes: [
      'COPPA: Full compliance for under-13',
      'GDPR: Maximum child protection measures',
      'All features designed for supervised use only',
      'Parents have complete visibility and control'
    ]
  },

  // AGES 11-15: HIGH PROTECTION
  [AgeCategory.JUNIOR_LEARNER]: {
    ageCategory: AgeCategory.JUNIOR_LEARNER,
    privacyLevel: PrivacyLevel.HIGH,
    
    dataMinimization: {
      level: 'high',
      collectPersonalInfo: true,          // Name, age, email
      collectBehavioralData: false,       // NO behavioral profiling
      collectUsageAnalytics: true,        // LIMITED analytics only
      collectLocationData: false,         // NO location
      collectDeviceInfo: true,            // Basic device info only
      collectBiometricData: false,        // NO biometric data
      collectSocialConnections: false,    // NO social data
      retentionPeriodDays: 730,           // 2 years max
      anonymizeData: true                 // Anonymize where possible
    },
    
    prohibitedFeatures: {
      // Advertising - ALL PROHIBITED
      displayAds: false,
      targetedAdvertising: false,
      behavioralAds: false,
      thirdPartyAds: false,
      
      // Tracking - ALL PROHIBITED
      locationTracking: false,
      preciseLocation: false,
      backgroundTracking: false,
      crossSiteTracking: false,
      
      // Social Features - ALL PROHIBITED
      socialNetworking: false,
      peerMessaging: false,              // NO peer messaging
      publicProfiles: false,             // NO public profiles
      userGeneratedContent: false,       // NO public content
      commenting: false,                 // NO commenting
      
      // Data Monetization - ALL PROHIBITED
      dataSelling: false,
      dataSharing: false,
      commercialProfiling: false,
      marketingUse: false,
      
      // Other
      fileUploads: false,                // NO uploads for safety
      externalLinks: false,              // NO external links
      thirdPartyIntegrations: false      // NO third-party services
    },
    
    interactionRestrictions: {
      // Communication - LIMITED
      canSendMessages: false,            // NO peer messaging
      canReceiveMessages: false,         // Can only receive from teacher/parent
      canComment: false,                 // NO public commenting
      canShare: true,                    // Can share results with parent approval
      
      // Public Visibility - ALL BLOCKED
      hasPublicProfile: false,
      canBeSearched: false,
      canBeDiscovered: false,
      
      // Content - RESTRICTED
      canUploadFiles: false,
      canUploadImages: false,
      canUploadDocuments: false,
      canCreatePublicContent: false,
      
      // External - BLOCKED
      canAccessExternalLinks: false,
      canConnectThirdParty: false
    },
    
    analyticsPermissions: {
      basicUsageTracking: true,          // LIMITED analytics only
      detailedAnalytics: false,          // NO detailed tracking
      behavioralTracking: false,         // NO behavioral profiling
      crossSessionTracking: true,        // Only for progress tracking
      thirdPartyAnalytics: false,        // NO third-party analytics
      marketingAnalytics: false,         // NO marketing analytics
      
      anonymizationRequired: true,       // Anonymize all analytics
      aggregationOnly: false             // Can track individual progress
    },
    
    guardianOversight: {
      viewingRequired: true,             // Ages 11-12: Required, 13-15: Recommended
      viewingRecommended: true,
      viewingOptional: false,
      
      canViewAllActivity: true,
      canViewAssessments: true,
      canViewResults: true,
      canViewAnalytics: true,
      canModifySettings: true,
      canDeleteData: true,
      
      notificationLevel: 'important'     // Important activities only
    },
    
    specialProtections: [
      'No public interactions or social features',
      'Limited analytics for educational purposes only',
      'Guardian/teacher-based oversight required',
      'No peer messaging or communication',
      'No advertising or commercial profiling',
      'No location tracking',
      'Strict data minimization',
      'Parent notification for sharing'
    ],
    
    complianceNotes: [
      'COPPA: Applies to ages 11-12 (under 13)',
      'GDPR: High child protection for all 11-15',
      'No public interactions permitted',
      'Guardian oversight strongly recommended for all'
    ]
  },

  // AGES 16-18: MODERATE PROTECTION
  [AgeCategory.SENIOR_ADOLESCENT]: {
    ageCategory: AgeCategory.SENIOR_ADOLESCENT,
    privacyLevel: PrivacyLevel.MODERATE,
    
    dataMinimization: {
      level: 'moderate',
      collectPersonalInfo: true,          // Standard personal info
      collectBehavioralData: false,       // Still NO behavioral profiling
      collectUsageAnalytics: true,        // More analytics permitted
      collectLocationData: false,         // Still NO location
      collectDeviceInfo: true,            // Device info OK
      collectBiometricData: false,        // NO biometric data
      collectSocialConnections: false,    // Still NO social connections
      retentionPeriodDays: 1095,          // 3 years
      anonymizeData: false                // No anonymization required
    },
    
    prohibitedFeatures: {
      // Advertising - ALL STILL PROHIBITED
      displayAds: false,
      targetedAdvertising: false,
      behavioralAds: false,
      thirdPartyAds: false,
      
      // Tracking - MOST PROHIBITED
      locationTracking: false,           // Still NO location
      preciseLocation: false,
      backgroundTracking: false,
      crossSiteTracking: false,
      
      // Social Features - MOSTLY PROHIBITED
      socialNetworking: false,           // NO social networking
      peerMessaging: false,              // NO peer messaging
      publicProfiles: false,             // NO public profiles
      userGeneratedContent: false,       // NO public content
      commenting: false,                 // NO public commenting
      
      // Data Monetization - ALL PROHIBITED
      dataSelling: false,
      dataSharing: false,
      commercialProfiling: false,
      marketingUse: false,
      
      // Other
      fileUploads: false,                // Still restricted
      externalLinks: true,               // Can access educational links
      thirdPartyIntegrations: false      // Still restricted
    },
    
    interactionRestrictions: {
      // Communication - LIMITED
      canSendMessages: false,            // Still NO peer messaging
      canReceiveMessages: true,          // Can receive from authorized sources
      canComment: false,                 // NO public commenting
      canShare: true,                    // Can share freely
      
      // Public Visibility - RESTRICTED
      hasPublicProfile: false,
      canBeSearched: false,
      canBeDiscovered: false,
      
      // Content - LIMITED
      canUploadFiles: false,
      canUploadImages: false,
      canUploadDocuments: false,
      canCreatePublicContent: false,
      
      // External - PARTIALLY ALLOWED
      canAccessExternalLinks: true,      // Educational links OK
      canConnectThirdParty: false        // Still restricted
    },
    
    analyticsPermissions: {
      basicUsageTracking: true,
      detailedAnalytics: true,           // More detailed analytics OK
      behavioralTracking: false,         // Still NO behavioral profiling
      crossSessionTracking: true,
      thirdPartyAnalytics: false,        // Still NO third-party
      marketingAnalytics: false,         // Still NO marketing
      
      anonymizationRequired: false,
      aggregationOnly: false
    },
    
    guardianOversight: {
      viewingRequired: false,
      viewingRecommended: false,
      viewingOptional: true,             // Optional guardian view
      
      canViewAllActivity: true,          // IF granted access
      canViewAssessments: true,
      canViewResults: true,
      canViewAnalytics: true,
      canModifySettings: false,          // Student controls
      canDeleteData: true,
      
      notificationLevel: 'minimal'       // Minimal notifications
    },
    
    specialProtections: [
      'Broader feature access but still minor-protected',
      'No advertising or commercial profiling',
      'No location tracking',
      'No peer messaging or social networking',
      'Optional guardian view',
      'Enhanced privacy controls',
      'No data selling or monetization',
      'Educational focus maintained'
    ],
    
    complianceNotes: [
      'GDPR: Moderate protection for minors 16-18',
      'Considered mature minors',
      'More autonomy but still protected',
      'No commercial exploitation permitted'
    ]
  },

  // AGES 19+: STANDARD PROTECTION
  [AgeCategory.ADULT]: {
    ageCategory: AgeCategory.ADULT,
    privacyLevel: PrivacyLevel.STANDARD,
    
    dataMinimization: {
      level: 'standard',
      collectPersonalInfo: true,          // Full personal info with consent
      collectBehavioralData: true,        // With explicit consent
      collectUsageAnalytics: true,        // With consent
      collectLocationData: true,          // With explicit consent
      collectDeviceInfo: true,            // Standard device info
      collectBiometricData: false,        // Not used by platform
      collectSocialConnections: true,     // If user opts in
      retentionPeriodDays: 1825,          // 5 years
      anonymizeData: false                // Not required (but available)
    },
    
    prohibitedFeatures: {
      // Advertising - ALLOWED WITH CONSENT
      displayAds: true,                  // With consent
      targetedAdvertising: true,         // With explicit consent
      behavioralAds: true,               // With explicit consent
      thirdPartyAds: true,               // With consent
      
      // Tracking - ALLOWED WITH CONSENT
      locationTracking: true,            // With explicit consent
      preciseLocation: true,             // With explicit consent
      backgroundTracking: false,         // Not used
      crossSiteTracking: true,           // With consent
      
      // Social Features - ALLOWED
      socialNetworking: true,            // If implemented
      peerMessaging: true,               // If implemented
      publicProfiles: true,              // User choice
      userGeneratedContent: true,        // With moderation
      commenting: true,                  // With moderation
      
      // Data Monetization - RESTRICTED
      dataSelling: false,                // Still not sold
      dataSharing: true,                 // With consent for partners
      commercialProfiling: true,         // With explicit consent
      marketingUse: true,                // With opt-in
      
      // Other
      fileUploads: true,                 // With limits
      externalLinks: true,               // User discretion
      thirdPartyIntegrations: true       // With consent
    },
    
    interactionRestrictions: {
      // Communication - FULL ACCESS
      canSendMessages: true,
      canReceiveMessages: true,
      canComment: true,
      canShare: true,
      
      // Public Visibility - USER CHOICE
      hasPublicProfile: true,            // User choice
      canBeSearched: true,               // User choice
      canBeDiscovered: true,             // User choice
      
      // Content - FULL ACCESS
      canUploadFiles: true,
      canUploadImages: true,
      canUploadDocuments: true,
      canCreatePublicContent: true,
      
      // External - FULL ACCESS
      canAccessExternalLinks: true,
      canConnectThirdParty: true
    },
    
    analyticsPermissions: {
      basicUsageTracking: true,
      detailedAnalytics: true,
      behavioralTracking: true,          // With consent
      crossSessionTracking: true,
      thirdPartyAnalytics: true,         // With consent
      marketingAnalytics: true,          // With opt-in
      
      anonymizationRequired: false,
      aggregationOnly: false
    },
    
    guardianOversight: {
      viewingRequired: false,
      viewingRecommended: false,
      viewingOptional: false,
      
      canViewAllActivity: false,
      canViewAssessments: false,
      canViewResults: false,
      canViewAnalytics: false,
      canModifySettings: false,
      canDeleteData: false,
      
      notificationLevel: 'none'
    },
    
    specialProtections: [
      'Full access with standard data protection',
      'User controls all privacy settings',
      'Consent required for all data collection',
      'Right to access, modify, delete data',
      'Can opt out of analytics and marketing',
      'Standard adult privacy protections',
      'GDPR and privacy law compliance'
    ],
    
    complianceNotes: [
      'GDPR: Standard adult protections',
      'Full consent-based data collection',
      'User has complete control',
      'No special child protections needed'
    ]
  }
};

// ============= PROHIBITED FOR ALL MINORS =============

export const PROHIBITED_FOR_MINORS = {
  // Advertising
  advertising: {
    display: 'No ads of any kind',
    targeted: 'No targeted advertising',
    behavioral: 'No behavioral ads',
    thirdParty: 'No third-party ads'
  },
  
  // Tracking
  tracking: {
    location: 'No location tracking',
    precise: 'No precise location',
    background: 'No background tracking',
    crossSite: 'No cross-site tracking'
  },
  
  // Social Features
  social: {
    networking: 'No social networking',
    messaging: 'No peer messaging',
    public: 'No public profiles',
    ugc: 'No user-generated content',
    comments: 'No commenting'
  },
  
  // Data Monetization
  monetization: {
    selling: 'No data selling',
    sharing: 'No commercial data sharing',
    profiling: 'No commercial profiling',
    marketing: 'No marketing use'
  }
};

// ============= UTILITY FUNCTIONS =============

/**
 * Get privacy configuration for age category
 */
export function getPrivacyConfig(ageCategory: AgeCategory): AgePrivacyConfiguration {
  return AGE_PRIVACY_CONFIGS[ageCategory];
}

/**
 * Check if feature is prohibited for age
 */
export function isFeatureProhibited(
  ageCategory: AgeCategory,
  feature: keyof ProhibitedFeatures
): boolean {
  const config = AGE_PRIVACY_CONFIGS[ageCategory];
  return !config.prohibitedFeatures[feature];
}

/**
 * Check if interaction is allowed
 */
export function canPerformInteraction(
  ageCategory: AgeCategory,
  interaction: keyof InteractionRestrictions
): boolean {
  const config = AGE_PRIVACY_CONFIGS[ageCategory];
  return config.interactionRestrictions[interaction];
}

/**
 * Check if analytics is permitted
 */
export function isAnalyticsPermitted(
  ageCategory: AgeCategory,
  analyticsType: keyof AnalyticsPermissions
): boolean {
  const config = AGE_PRIVACY_CONFIGS[ageCategory];
  return config.analyticsPermissions[analyticsType];
}

/**
 * Check if user is a minor (under 19)
 */
export function isMinor(ageCategory: AgeCategory): boolean {
  return ageCategory !== AgeCategory.ADULT;
}

/**
 * Get data retention period
 */
export function getDataRetentionDays(ageCategory: AgeCategory): number {
  return AGE_PRIVACY_CONFIGS[ageCategory].dataMinimization.retentionPeriodDays;
}

/**
 * Check if anonymization is required
 */
export function requiresAnonymization(ageCategory: AgeCategory): boolean {
  return AGE_PRIVACY_CONFIGS[ageCategory].dataMinimization.anonymizeData;
}

/**
 * Get guardian notification level
 */
export function getGuardianNotificationLevel(
  ageCategory: AgeCategory
): 'all' | 'important' | 'minimal' | 'none' {
  return AGE_PRIVACY_CONFIGS[ageCategory].guardianOversight.notificationLevel;
}

/**
 * Check if guardian viewing is required
 */
export function isGuardianViewingRequired(ageCategory: AgeCategory): boolean {
  return AGE_PRIVACY_CONFIGS[ageCategory].guardianOversight.viewingRequired;
}

/**
 * Get privacy level description
 */
export function getPrivacyLevelDescription(level: PrivacyLevel): string {
  const descriptions = {
    [PrivacyLevel.MAXIMUM]: 'Maximum protection - Strictest data minimization and no external interactions',
    [PrivacyLevel.HIGH]: 'High protection - No public interactions, limited analytics, strict oversight',
    [PrivacyLevel.MODERATE]: 'Moderate protection - Broader features but minor-protected, optional guardian view',
    [PrivacyLevel.STANDARD]: 'Standard protection - Full access with standard data protection laws'
  };
  
  return descriptions[level];
}

/**
 * Get all prohibited features for minors
 */
export function getMinorProhibitions(): typeof PROHIBITED_FOR_MINORS {
  return PROHIBITED_FOR_MINORS;
}

/**
 * Validate data collection against age policy
 */
export function validateDataCollection(
  ageCategory: AgeCategory,
  dataType: keyof DataMinimization
): boolean {
  const config = AGE_PRIVACY_CONFIGS[ageCategory];
  return config.dataMinimization[dataType] as boolean;
}
