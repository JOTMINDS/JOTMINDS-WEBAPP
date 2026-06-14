import React, { useState } from 'react';
import { Shield, Lock, Eye, Users, Database, Trash2, Download, FileText, Globe, AlertCircle } from 'lucide-react';
import { AgeCategory } from '../../types/age-consent-types';
import {
  PRIVACY_POLICY_META,
  DATA_USAGE,
  getDataCollectionConfig,
  getDataSharingConfig,
  getDataRetentionConfig,
  getUserRights
} from '../../types/privacy-policy-configs';

interface PrivacyPolicyDisplayProps {
  ageCategory: AgeCategory;
  isSchoolAccount?: boolean;
  showFull?: boolean;
}

/**
 * Complete Privacy Policy Display Component
 * Based on JotMinds Privacy Policy (Nov 30, 2025)
 */
export function PrivacyPolicyDisplay({
  ageCategory,
  isSchoolAccount = false,
  showFull = true
}: PrivacyPolicyDisplayProps) {
  const [activeSection, setActiveSection] = useState<string>('overview');
  
  const dataCollection = getDataCollectionConfig(ageCategory);
  const dataSharing = getDataSharingConfig(ageCategory);
  const dataRetention = getDataRetentionConfig(ageCategory);
  const userRights = getUserRights(ageCategory);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 p-3 rounded-lg">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-white mb-1">Privacy Policy</h1>
            <p className="text-white/90">
              Protecting your data and privacy rights
            </p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-white/80 mb-1">Last Updated</p>
            <p className="text-white">{PRIVACY_POLICY_META.lastUpdated}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-white/80 mb-1">Effective Date</p>
            <p className="text-white">{PRIVACY_POLICY_META.effectiveDate}</p>
          </div>
        </div>
      </div>

      {/* Who We Are */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
        <h2 className="text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          Who We Are
        </h2>
        
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
          <p className="text-gray-800 mb-2">
            <strong>JotMinds</strong> is an educational and cognitive-development mobile platform 
            operated by <strong>{PRIVACY_POLICY_META.operator.legalEntity}</strong>, {PRIVACY_POLICY_META.operator.country}.
          </p>
          <p className="text-gray-700">
            The platform supports learning-style discovery, thinking-style profiling, decision-style 
            understanding, academic guidance, and career alignment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <ContactInfo icon="📧" label="Email" value={PRIVACY_POLICY_META.operator.email.join(', ')} />
          <ContactInfo icon="📞" label="Phone" value={PRIVACY_POLICY_META.operator.phone} />
          <ContactInfo icon="🌐" label="Website" value={PRIVACY_POLICY_META.operator.website} />
          <ContactInfo icon="🏢" label="Company" value={PRIVACY_POLICY_META.operator.legalEntity} />
        </div>
      </div>

      {/* Age-Specific Protection Level */}
      <AgeProtectionLevel ageCategory={ageCategory} />

      {/* Information We Collect */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
        <h2 className="text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          Information We Collect
        </h2>
        
        <p className="text-gray-700 mb-4">
          We collect only what is necessary for learning insights and educational improvement.
        </p>

        <DataCollectionDisplay dataCollection={dataCollection} />
      </div>

      {/* How We Use Your Information */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
        <h2 className="text-gray-900 mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-green-600" />
          How We Use Your Information
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-gray-900 mb-3">✅ We DO:</h3>
            <div className="space-y-2">
              {DATA_USAGE.permitted.map((use, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">{use}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-gray-900 mb-3">❌ We DO NOT:</h3>
            <div className="space-y-2">
              {DATA_USAGE.prohibited.map((use, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">✗</span>
                  <span className="text-gray-700">{use}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Data Sharing */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
        <h2 className="text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Data Sharing
        </h2>

        <DataSharingDisplay 
          dataSharing={dataSharing} 
          isSchoolAccount={isSchoolAccount} 
        />
      </div>

      {/* Data Security */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
        <h2 className="text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-red-600" />
          Data Security
        </h2>

        <div className="grid md:grid-cols-2 gap-3">
          <SecurityMeasure icon="🔐" text="End-to-end encryption" />
          <SecurityMeasure icon="💾" text="Encrypted data storage" />
          <SecurityMeasure icon="☁️" text="Secure cloud servers" />
          <SecurityMeasure icon="🔒" text="Multi-level access control" />
          <SecurityMeasure icon="📝" text="Activity audit logging" />
          <SecurityMeasure icon="🔍" text="Regular security audits" />
          <SecurityMeasure icon="🚫" text="No unsafe external integrations" />
          <SecurityMeasure icon="🛡️" text="GDPR-equivalent safeguards" />
        </div>
      </div>

      {/* Data Retention */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
        <h2 className="text-gray-900 mb-4 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-orange-600" />
          Data Retention
        </h2>

        <DataRetentionDisplay dataRetention={dataRetention} />
      </div>

      {/* Your Rights */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
        <h2 className="text-gray-900 mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-teal-600" />
          Your Rights
        </h2>

        <UserRightsDisplay userRights={userRights} />
      </div>

      {/* Child Safety Compliance */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 mb-6">
        <h2 className="text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          Child Safety Compliance
        </h2>

        <p className="text-gray-700 mb-4">
          This policy works together with JotMinds' Child Online Safety Policy, including:
        </p>

        <div className="grid md:grid-cols-2 gap-3">
          <SafetyFeature text="No chat features" />
          <SafetyFeature text="No user-to-user interaction" />
          <SafetyFeature text="No contact with strangers" />
          <SafetyFeature text="No harmful content" />
          <SafetyFeature text="No public personal details" />
          <SafetyFeature text="Full parent/school oversight" />
        </div>
      </div>

      {/* International Data Transfer */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
        <h2 className="text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-600" />
          International Data Transfer
        </h2>

        <p className="text-gray-700 mb-3">
          Any international data transfer follows:
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-700">
            <span className="text-indigo-600">✓</span>
            <span>GDPR-equivalent safeguards</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <span className="text-indigo-600">✓</span>
            <span>Standard contractual clauses</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <span className="text-indigo-600">✓</span>
            <span>Secure encrypted channels</span>
          </div>
        </div>

        <div className="bg-indigo-50 rounded-lg p-4 mt-4 border border-indigo-200">
          <p className="text-gray-800">
            <strong>No data is transferred without protections.</strong>
          </p>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h2 className="text-gray-900 mb-4">Contact JotMinds Data Protection Office</h2>
        
        <div className="space-y-2 text-gray-700">
          <p>📧 Email: {PRIVACY_POLICY_META.operator.email.join(', ')}</p>
          <p>📞 Phone: {PRIVACY_POLICY_META.operator.phone}</p>
          <p>🌐 Website: {PRIVACY_POLICY_META.operator.website}</p>
        </div>
      </div>
    </div>
  );
}

function AgeProtectionLevel({ ageCategory }: { ageCategory: AgeCategory }) {
  const levels = {
    [AgeCategory.EARLY_LEARNER]: {
      title: 'Ages 6-10: Highest Protection',
      color: 'red',
      protections: [
        'No personal contact details required',
        'No external links, messaging, or social features',
        'Strong parental and school oversight',
        'No public profiles'
      ]
    },
    [AgeCategory.JUNIOR_LEARNER]: {
      title: 'Ages 11-15: High Protection',
      color: 'orange',
      protections: [
        'Limited personal identifiers',
        'No communication features',
        'Strict dashboard-based teacher oversight',
        'Safe, supervised learning environment'
      ]
    },
    [AgeCategory.SENIOR_ADOLESCENT]: {
      title: 'Ages 16-18: Moderate Protection',
      color: 'blue',
      protections: [
        'Expanded insights but still protected as minors',
        'May request data deletion',
        'May manage own profile',
        'Guardian notification recommended'
      ]
    },
    [AgeCategory.ADULT]: {
      title: 'Ages 19+: Standard Protection',
      color: 'green',
      protections: [
        'Full data rights',
        'Broad access to insights',
        'Eligible for premium offerings',
        'Complete account control'
      ]
    }
  };

  const level = levels[ageCategory];
  const colorClasses = {
    red: 'bg-red-50 border-red-200',
    orange: 'bg-orange-50 border-orange-200',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200'
  };

  return (
    <div className={`${colorClasses[level.color as keyof typeof colorClasses]} border-2 rounded-xl p-6 mb-6`}>
      <h2 className="text-gray-900 mb-4">{level.title}</h2>
      
      <div className="space-y-2">
        {level.protections.map((protection, index) => (
          <div key={index} className="flex items-start gap-2">
            <span className="text-lg">🛡️</span>
            <span className="text-gray-700">{protection}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DataCollectionDisplay({ dataCollection }: { dataCollection: any }) {
  return (
    <div className="space-y-4">
      {/* Personal Info */}
      {(dataCollection.personalInfo.fullName || dataCollection.personalInfo.nickname) && (
        <CollectionCategory
          title="Personal Information"
          items={[
            dataCollection.personalInfo.fullName && 'Full name',
            dataCollection.personalInfo.nickname && 'Nickname/First name',
            dataCollection.personalInfo.dateOfBirth && 'Date of birth',
            dataCollection.personalInfo.ageGroup && 'Age group',
            dataCollection.personalInfo.email && 'Email',
            dataCollection.personalInfo.phone && 'Phone',
            dataCollection.personalInfo.studentId && 'Student ID'
          ].filter(Boolean) as string[]}
        />
      )}

      {/* Assessment Data */}
      <CollectionCategory
        title="Assessment Data"
        items={[
          dataCollection.assessmentData.simplifiedResponses && 'Simplified assessment responses',
          dataCollection.assessmentData.responses && 'Assessment responses',
          dataCollection.assessmentData.academicPreferences && 'Academic preferences',
          dataCollection.assessmentData.careerPreferences && 'Career preferences',
          dataCollection.assessmentData.professionalGoals && 'Professional goals'
        ].filter(Boolean) as string[]}
      />

      {/* Automatic Data */}
      <CollectionCategory
        title="Automatically Collected"
        items={[
          'Device information',
          'IP address (not for location tracking)',
          'App usage patterns',
          'Activity logs',
          'Crash reports and diagnostics'
        ]}
      />
    </div>
  );
}

function CollectionCategory({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h4 className="text-gray-900 mb-2">{title}</h4>
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-gray-700 text-sm">
            <span className="text-blue-600">•</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DataSharingDisplay({ dataSharing, isSchoolAccount }: { dataSharing: any; isSchoolAccount: boolean }) {
  return (
    <div className="space-y-4">
      {/* Parent Sharing */}
      {dataSharing.withParents.allowed && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="text-gray-900 mb-2">📧 Sharing with Parents/Guardians</h4>
          <p className="text-gray-700 mb-2">
            <strong>Requirement:</strong> {dataSharing.withParents.requirement.replace('_', ' ').toUpperCase()}
          </p>
        </div>
      )}

      {/* School Sharing */}
      {dataSharing.withSchools.allowed && isSchoolAccount && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-gray-900 mb-2">🏫 Sharing with Schools</h4>
          <p className="text-gray-700 mb-2">
            Only for academic purposes. Requires School Data Sharing Agreement (SDSA).
          </p>
          <div className="space-y-1 text-sm text-gray-600">
            <p>✓ Access controlled and logged</p>
            {dataSharing.withSchools.purposes.map((purpose: string, index: number) => (
              <p key={index}>✓ {purpose}</p>
            ))}
          </div>
        </div>
      )}

      {/* Third Party */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-gray-900 mb-2">🔗 Third-Party Service Providers</h4>
        <p className="text-gray-700 mb-2">Limited to:</p>
        <div className="space-y-1 text-sm mb-3">
          {dataSharing.withThirdParties.types.map((type: string, index: number) => (
            <p key={index} className="text-gray-700">• {type}</p>
          ))}
        </div>
        <p className="text-gray-600 text-sm mb-2">All third parties must:</p>
        <div className="space-y-1 text-xs text-gray-600">
          {dataSharing.withThirdParties.restrictions.map((restriction: string, index: number) => (
            <p key={index}>✓ {restriction}</p>
          ))}
        </div>
      </div>

      {/* Prohibited */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="text-gray-900 mb-2">❌ We NEVER Share With:</h4>
        <div className="space-y-1">
          {dataSharing.prohibited.map((item: string, index: number) => (
            <p key={index} className="text-gray-700">✗ {item}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

function DataRetentionDisplay({ dataRetention }: { dataRetention: any }) {
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="text-gray-900 mb-2">⏱️ Retention Period</h4>
        <p className="text-gray-700 mb-1">
          <strong>Active:</strong> {dataRetention.activeRetention}
        </p>
        <p className="text-gray-700">
          <strong>Inactivity:</strong> Deleted after {dataRetention.inactivityPeriod} of inactivity
        </p>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h4 className="text-gray-900 mb-2">🗑️ Deletion on Request</h4>
        <p className="text-gray-700 mb-2">Can be requested by:</p>
        <div className="space-y-1">
          {dataRetention.deletionRequestedBy.map((who: string, index: number) => (
            <p key={index} className="text-gray-700">• {who}</p>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-gray-900 mb-2">📦 What Gets Deleted</h4>
        <div className="space-y-1">
          {dataRetention.whatIsDeleted.map((item: string, index: number) => (
            <p key={index} className="text-gray-700">✓ {item}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

function UserRightsDisplay({ userRights }: { userRights: any }) {
  const rights = [
    { key: 'accessData', label: 'Access Your Data', icon: '👁️' },
    { key: 'correctData', label: 'Request Correction', icon: '✏️' },
    { key: 'deleteData', label: 'Request Deletion', icon: '🗑️' },
    { key: 'exportData', label: 'Request Data Export', icon: '📥' },
    { key: 'withdrawConsent', label: 'Withdraw Consent', icon: '🚫' },
    { key: 'limitProcessing', label: 'Limit Processing', icon: '⏸️' },
    { key: 'objectProcessing', label: 'Object to Processing', icon: '✋' }
  ];

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {rights.map((right) => {
        const config = userRights[right.key];
        return (
          <div key={right.key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-gray-900 mb-2 flex items-center gap-2">
              <span>{right.icon}</span>
              <span>{right.label}</span>
            </h4>
            <p className="text-gray-600 text-sm">Requested by:</p>
            <div className="space-y-1 mt-1">
              {config.requestedBy.map((who: string, index: number) => (
                <p key={index} className="text-gray-700 text-sm">• {who}</p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ContactInfo({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div className="flex items-center gap-2 mb-1">
        <span>{icon}</span>
        <span className="text-gray-600 text-sm">{label}</span>
      </div>
      <p className="text-gray-900 text-sm">{value}</p>
    </div>
  );
}

function SecurityMeasure({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center gap-2">
      <span className="text-xl">{icon}</span>
      <span className="text-gray-700">{text}</span>
    </div>
  );
}

function SafetyFeature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-amber-200">
      <span className="text-green-600">✓</span>
      <span className="text-gray-700">{text}</span>
    </div>
  );
}

/**
 * Compact Privacy Notice (for footers)
 */
export function CompactPrivacyNotice() {
  return (
    <div className="bg-gray-50 border-t border-gray-200 p-4 text-center">
      <p className="text-gray-600 text-sm mb-1">
        Last Updated: {PRIVACY_POLICY_META.lastUpdated} | Effective: {PRIVACY_POLICY_META.effectiveDate}
      </p>
      <p className="text-gray-500 text-xs">
        Operated by {PRIVACY_POLICY_META.operator.legalEntity}, {PRIVACY_POLICY_META.operator.country}
      </p>
    </div>
  );
}
