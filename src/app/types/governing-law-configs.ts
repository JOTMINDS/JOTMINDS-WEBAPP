/**
 * JotMinds Governing Law & Jurisdiction Framework
 * Primary: Ghana (Act 843) with international protections
 */

import { AgeCategory } from './age-consent-types';

// ============= JURISDICTIONS =============

export enum Jurisdiction {
  GHANA = 'GHANA',                    // Primary jurisdiction
  EUROPEAN_UNION = 'EU',              // GDPR region
  UNITED_STATES = 'US',               // COPPA region
  UNITED_KINGDOM = 'UK',              // UK GDPR
  CANADA = 'CA',                      // PIPEDA
  AUSTRALIA = 'AU',                   // Privacy Act
  OTHER = 'OTHER'                     // Other international
}

// ============= GHANA ACT 843 - CHILDREN'S ACT =============

export interface GhanaAct843Protections {
  actName: string;
  actNumber: string;
  year: number;
  jurisdiction: string;
  
  // Key Provisions for Minors
  minorDefinition: string;
  consentAge: number;
  parentalConsentRequired: boolean;
  
  // Child Protection Provisions
  protections: {
    rightToPrivacy: boolean;
    rightToEducation: boolean;
    protectionFromExploitation: boolean;
    bestInterestOfChild: boolean;
    rightToInformation: boolean;
  };
  
  // Relevant Sections
  relevantSections: Array<{
    section: string;
    title: string;
    description: string;
    applicability: string;
  }>;
}

export const GHANA_ACT_843: GhanaAct843Protections = {
  actName: 'Children\'s Act',
  actNumber: 'Act 843',
  year: 1998,
  jurisdiction: 'Republic of Ghana',
  
  minorDefinition: 'A person below the age of eighteen years',
  consentAge: 18,
  parentalConsentRequired: true,
  
  protections: {
    rightToPrivacy: true,
    rightToEducation: true,
    protectionFromExploitation: true,
    bestInterestOfChild: true,
    rightToInformation: true
  },
  
  relevantSections: [
    {
      section: 'Section 1',
      title: 'Definition of Child',
      description: 'A child means a person below the age of eighteen years',
      applicability: 'All users under 18 in Ghana jurisdiction'
    },
    {
      section: 'Section 4',
      title: 'Best Interest of the Child',
      description: 'In all actions concerning a child, the best interest of the child shall be paramount',
      applicability: 'All platform decisions affecting minors'
    },
    {
      section: 'Section 6',
      title: 'Parental Duty and Responsibility',
      description: 'Parents have the duty to maintain, protect and provide for their children',
      applicability: 'Parental consent and oversight requirements'
    },
    {
      section: 'Section 11',
      title: 'Right to Privacy',
      description: 'Every child has the right to privacy and protection of personal information',
      applicability: 'Data protection and privacy controls'
    },
    {
      section: 'Section 13',
      title: 'Right to Education',
      description: 'Every child has the right to education',
      applicability: 'Educational purpose of platform'
    },
    {
      section: 'Section 28',
      title: 'Protection from Exploitation',
      description: 'A child shall not be subjected to exploitative labor or practices',
      applicability: 'No commercial exploitation of child data'
    }
  ]
};

// ============= INTERNATIONAL PROTECTIONS =============

export interface InternationalProtection {
  jurisdiction: Jurisdiction;
  regulationName: string;
  applicableAge: number;
  
  // Key Requirements
  requirements: {
    parentalConsent: boolean;
    dataMinimization: boolean;
    rightToErasure: boolean;
    rightToAccess: boolean;
    rightToPortability: boolean;
  };
  
  // Specific Provisions
  provisions: string[];
}

export const INTERNATIONAL_PROTECTIONS: Record<Jurisdiction, InternationalProtection> = {
  [Jurisdiction.GHANA]: {
    jurisdiction: Jurisdiction.GHANA,
    regulationName: 'Children\'s Act (Act 843) & Data Protection Act',
    applicableAge: 18,
    
    requirements: {
      parentalConsent: true,
      dataMinimization: true,
      rightToErasure: true,
      rightToAccess: true,
      rightToPortability: true
    },
    
    provisions: [
      'Best interest of child paramount (Act 843, Section 4)',
      'Right to privacy and data protection (Act 843, Section 11)',
      'Protection from commercial exploitation (Act 843, Section 28)',
      'Parental consent required under 18 (Act 843)',
      'Data Protection Act compliance',
      'Educational purpose requirement'
    ]
  },
  
  [Jurisdiction.EUROPEAN_UNION]: {
    jurisdiction: Jurisdiction.EUROPEAN_UNION,
    regulationName: 'GDPR (General Data Protection Regulation)',
    applicableAge: 16, // Can be lowered to 13 by member states
    
    requirements: {
      parentalConsent: true,
      dataMinimization: true,
      rightToErasure: true,
      rightToAccess: true,
      rightToPortability: true
    },
    
    provisions: [
      'Parental consent required under 16 (or member state age)',
      'Enhanced protection for children (Article 8)',
      'Right to erasure / "Right to be forgotten" (Article 17)',
      'Data portability (Article 20)',
      'Privacy by design and by default (Article 25)',
      'Data protection impact assessments for children\'s services',
      'Clear, plain language for children'
    ]
  },
  
  [Jurisdiction.UNITED_STATES]: {
    jurisdiction: Jurisdiction.UNITED_STATES,
    regulationName: 'COPPA (Children\'s Online Privacy Protection Act)',
    applicableAge: 13,
    
    requirements: {
      parentalConsent: true,
      dataMinimization: true,
      rightToErasure: true,
      rightToAccess: true,
      rightToPortability: false
    },
    
    provisions: [
      'Verifiable parental consent required under 13',
      'Direct notice to parents of data practices',
      'Parent can review child\'s information',
      'Parent can request deletion of child\'s data',
      'No behavioral advertising to children under 13',
      'Reasonable data security measures',
      'Data retention and deletion requirements'
    ]
  },
  
  [Jurisdiction.UNITED_KINGDOM]: {
    jurisdiction: Jurisdiction.UNITED_KINGDOM,
    regulationName: 'UK GDPR & Age Appropriate Design Code',
    applicableAge: 13,
    
    requirements: {
      parentalConsent: true,
      dataMinimization: true,
      rightToErasure: true,
      rightToAccess: true,
      rightToPortability: true
    },
    
    provisions: [
      'Age Appropriate Design Code (15 standards)',
      'Best interests of child consideration',
      'Parental consent under 13',
      'Privacy settings "high" by default',
      'Minimal data collection',
      'No behavioral advertising to minors',
      'Clear, age-appropriate language',
      'Geolocation off by default'
    ]
  },
  
  [Jurisdiction.CANADA]: {
    jurisdiction: Jurisdiction.CANADA,
    regulationName: 'PIPEDA & Provincial Privacy Laws',
    applicableAge: 13, // Varies by province
    
    requirements: {
      parentalConsent: true,
      dataMinimization: true,
      rightToErasure: true,
      rightToAccess: true,
      rightToPortability: false
    },
    
    provisions: [
      'Parental consent for minors (age varies by province)',
      'Meaningful consent requirement',
      'Limited collection of personal information',
      'Right to access and correct information',
      'Safeguards for personal information',
      'Accountability principle'
    ]
  },
  
  [Jurisdiction.AUSTRALIA]: {
    jurisdiction: Jurisdiction.AUSTRALIA,
    regulationName: 'Privacy Act & Children\'s eSafety Code',
    applicableAge: 18,
    
    requirements: {
      parentalConsent: true,
      dataMinimization: true,
      rightToErasure: true,
      rightToAccess: true,
      rightToPortability: false
    },
    
    provisions: [
      'Parental consent for children under 18',
      'eSafety Commissioner standards',
      'Protection from harmful content',
      'Privacy by design',
      'Age verification measures',
      'Complaint mechanisms'
    ]
  },
  
  [Jurisdiction.OTHER]: {
    jurisdiction: Jurisdiction.OTHER,
    regulationName: 'International Best Practices',
    applicableAge: 18,
    
    requirements: {
      parentalConsent: true,
      dataMinimization: true,
      rightToErasure: true,
      rightToAccess: true,
      rightToPortability: true
    },
    
    provisions: [
      'UN Convention on the Rights of the Child',
      'Best interest of child principle',
      'Parental consent for minors',
      'Data protection best practices',
      'Privacy by design',
      'Age-appropriate safeguards'
    ]
  }
};

// ============= GOVERNING LAW CONFIGURATION =============

export interface GoverningLawConfig {
  primaryJurisdiction: Jurisdiction;
  primaryLaw: string;
  primaryAct: string;
  
  // Applicable Laws
  applicableLaws: string[];
  
  // Dispute Resolution
  disputeResolution: {
    primaryVenue: string;
    alternativeResolution: string;
    arbitrationClause: boolean;
  };
  
  // International Application
  internationalProtections: boolean;
  additionalJurisdictions: Jurisdiction[];
  
  // Age-Specific Provisions
  minorProtections: {
    ageOfMajority: number;
    parentalConsentAge: number;
    dataProtectionAge: number;
  };
}

export const GOVERNING_LAW: GoverningLawConfig = {
  primaryJurisdiction: Jurisdiction.GHANA,
  primaryLaw: 'Laws of the Republic of Ghana',
  primaryAct: 'Children\'s Act, 1998 (Act 843)',
  
  applicableLaws: [
    'Children\'s Act, 1998 (Act 843)',
    'Data Protection Act, 2012 (Act 843)',
    'Electronic Communications Act, 2008 (Act 775)',
    'Constitution of the Republic of Ghana, 1992'
  ],
  
  disputeResolution: {
    primaryVenue: 'Courts of the Republic of Ghana',
    alternativeResolution: 'Arbitration in accordance with Ghana Arbitration Act',
    arbitrationClause: true
  },
  
  internationalProtections: true,
  additionalJurisdictions: [
    Jurisdiction.EUROPEAN_UNION,
    Jurisdiction.UNITED_STATES,
    Jurisdiction.UNITED_KINGDOM,
    Jurisdiction.CANADA,
    Jurisdiction.AUSTRALIA
  ],
  
  minorProtections: {
    ageOfMajority: 18,          // Act 843 definition
    parentalConsentAge: 18,     // Required under 18
    dataProtectionAge: 18       // Enhanced protection under 18
  }
};

// ============= JURISDICTION-SPECIFIC RULES =============

export interface JurisdictionRules {
  jurisdiction: Jurisdiction;
  ageOfConsent: number;
  parentalConsentRequired: boolean;
  additionalRequirements: string[];
}

export function getJurisdictionRules(jurisdiction: Jurisdiction): JurisdictionRules {
  const protection = INTERNATIONAL_PROTECTIONS[jurisdiction];
  
  return {
    jurisdiction,
    ageOfConsent: protection.applicableAge,
    parentalConsentRequired: protection.requirements.parentalConsent,
    additionalRequirements: protection.provisions
  };
}

/**
 * Get applicable laws for user based on location
 */
export function getApplicableLaws(userLocation: Jurisdiction): string[] {
  const laws = [
    'Terms governed by Laws of the Republic of Ghana',
    `Children's Act, 1998 (Act 843) - Primary child protection law`,
    'Data Protection Act, 2012 - Data privacy requirements'
  ];
  
  // Add location-specific laws
  if (userLocation !== Jurisdiction.GHANA) {
    const protection = INTERNATIONAL_PROTECTIONS[userLocation];
    laws.push(`Additional protections: ${protection.regulationName}`);
    laws.push(...protection.provisions);
  }
  
  return laws;
}

/**
 * Get consent age for jurisdiction
 */
export function getConsentAge(jurisdiction: Jurisdiction): number {
  // Ghana is always primary, but respect stricter international requirements
  const ghanaAge = GOVERNING_LAW.minorProtections.parentalConsentAge;
  const localAge = INTERNATIONAL_PROTECTIONS[jurisdiction].applicableAge;
  
  // Use the higher (more protective) age
  return Math.max(ghanaAge, localAge);
}

/**
 * Check if parental consent required
 */
export function requiresParentalConsent(age: number, jurisdiction: Jurisdiction): boolean {
  const consentAge = getConsentAge(jurisdiction);
  return age < consentAge;
}

/**
 * Get Ghana Act 843 protections
 */
export function getAct843Protections(): GhanaAct843Protections {
  return GHANA_ACT_843;
}

/**
 * Get international protections for jurisdiction
 */
export function getInternationalProtection(jurisdiction: Jurisdiction): InternationalProtection {
  return INTERNATIONAL_PROTECTIONS[jurisdiction];
}

/**
 * Get all applicable protections for user
 */
export function getAllApplicableProtections(
  userAge: number,
  userJurisdiction: Jurisdiction
): {
  ghanaProtections: GhanaAct843Protections;
  internationalProtections: InternationalProtection;
  applicableLaws: string[];
  requiresParentalConsent: boolean;
} {
  return {
    ghanaProtections: GHANA_ACT_843,
    internationalProtections: INTERNATIONAL_PROTECTIONS[userJurisdiction],
    applicableLaws: getApplicableLaws(userJurisdiction),
    requiresParentalConsent: requiresParentalConsent(userAge, userJurisdiction)
  };
}

/**
 * Get dispute resolution venue
 */
export function getDisputeResolutionVenue(): string {
  return GOVERNING_LAW.disputeResolution.primaryVenue;
}

/**
 * Check if arbitration applies
 */
export function hasArbitrationClause(): boolean {
  return GOVERNING_LAW.disputeResolution.arbitrationClause;
}

/**
 * Get age of majority
 */
export function getAgeOfMajority(): number {
  return GOVERNING_LAW.minorProtections.ageOfMajority;
}
