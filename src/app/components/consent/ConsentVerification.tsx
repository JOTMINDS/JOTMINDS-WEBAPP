import React from 'react';
import { Shield, Check, Calendar, User, Mail, AlertCircle } from 'lucide-react';
import { AgeCategory } from '../../types/age-consent-types';
import { formatDateTime } from '../../utils/dateFormat';

interface ConsentRecord {
  // User Confirmations
  acceptedPrivacyPolicy: boolean;
  acceptedTermsConditions: boolean;
  understandsDataCollection: boolean;
  understandsNoDataSelling: boolean;
  
  // Age Information
  ageCategory: AgeCategory;
  
  // Parental Consent (if applicable)
  parentalConsent?: {
    parentName: string;
    parentEmail: string;
    parentConfirmation: boolean;
  };
  
  // Metadata
  consentedAt: Date;
  ipAddress: string;
  userAgent: string;
}

interface ConsentVerificationProps {
  consentRecord: ConsentRecord;
  showFull?: boolean;
}

/**
 * Consent Verification Component
 * Displays user's consent record for verification
 */
export function ConsentVerification({
  consentRecord,
  showFull = true
}: ConsentVerificationProps) {
  const hasParentalConsent = !!consentRecord.parentalConsent;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-lg">
            <Check className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-white mb-1">Consent Verified</h1>
            <p className="text-white/90">
              Your consent has been successfully recorded
            </p>
          </div>
        </div>
      </div>

      {/* Consent Status */}
      <div className="bg-white rounded-xl shadow-md p-6 border-2 border-green-200 mb-6">
        <h2 className="text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
          Consent Status
        </h2>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <StatusItem
            icon={<Check className="w-5 h-5 text-green-600" />}
            label="Privacy Policy"
            status={consentRecord.acceptedPrivacyPolicy ? 'Accepted' : 'Not Accepted'}
            verified={consentRecord.acceptedPrivacyPolicy}
          />
          <StatusItem
            icon={<Check className="w-5 h-5 text-green-600" />}
            label="Terms & Conditions"
            status={consentRecord.acceptedTermsConditions ? 'Accepted' : 'Not Accepted'}
            verified={consentRecord.acceptedTermsConditions}
          />
          <StatusItem
            icon={<Check className="w-5 h-5 text-green-600" />}
            label="Data Collection"
            status={consentRecord.understandsDataCollection ? 'Understood' : 'Not Confirmed'}
            verified={consentRecord.understandsDataCollection}
          />
          <StatusItem
            icon={<Check className="w-5 h-5 text-green-600" />}
            label="No Data Selling"
            status={consentRecord.understandsNoDataSelling ? 'Understood' : 'Not Confirmed'}
            verified={consentRecord.understandsNoDataSelling}
          />
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">
            <strong>✓ All required consents have been verified</strong>
          </p>
        </div>
      </div>

      {/* Age Category */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
        <h2 className="text-gray-900 mb-4">Age Category</h2>
        
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <p className="text-gray-900 mb-1">
            <strong>{getAgeCategoryLabel(consentRecord.ageCategory)}</strong>
          </p>
          <p className="text-gray-700 text-sm">
            {getAgeCategoryDescription(consentRecord.ageCategory)}
          </p>
        </div>
      </div>

      {/* Parental Consent */}
      {hasParentalConsent && consentRecord.parentalConsent && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
          <h2 className="text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" />
            Parental Consent
          </h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-gray-600 text-sm">Parent/Guardian Name</p>
                <p className="text-gray-900">{consentRecord.parentalConsent.parentName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-gray-600 text-sm">Parent/Guardian Email</p>
                <p className="text-gray-900">{consentRecord.parentalConsent.parentEmail}</p>
              </div>
            </div>

            {consentRecord.parentalConsent.parentConfirmation && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <p className="text-green-800">
                  Parent/guardian has confirmed consent
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Consent Metadata */}
      {showFull && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
          <h2 className="text-gray-900 mb-4">Consent Details</h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-gray-600 text-sm">Consent Date & Time</p>
                <p className="text-gray-900">
                  {formatDateTime(consentRecord.consentedAt)}
                </p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm mb-1">IP Address</p>
              <p className="text-gray-900 font-mono text-sm">{consentRecord.ipAddress}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm mb-1">User Agent</p>
              <p className="text-gray-700 text-xs break-all">{consentRecord.userAgent}</p>
            </div>
          </div>
        </div>
      )}

      {/* Important Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-gray-800 mb-2">
              <strong>Important:</strong> This consent record is stored securely and can be 
              reviewed or withdrawn at any time.
            </p>
            <p className="text-gray-700">
              {hasParentalConsent 
                ? 'Parent/guardian can manage consent and account settings from the Parent Dashboard.'
                : 'You can manage your consent and account settings from your Account Settings.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusItem({
  icon,
  label,
  status,
  verified
}: {
  icon: React.ReactNode;
  label: string;
  status: string;
  verified: boolean;
}) {
  return (
    <div className={`p-3 rounded-lg border ${
      verified 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-gray-900 text-sm">{label}</span>
      </div>
      <p className={`text-sm ${verified ? 'text-green-700' : 'text-red-700'}`}>
        {status}
      </p>
    </div>
  );
}

function getAgeCategoryLabel(category: AgeCategory): string {
  switch (category) {
    case AgeCategory.EARLY_LEARNER:
      return 'Ages 6-10 (Early Learner)';
    case AgeCategory.JUNIOR_LEARNER:
      return 'Ages 11-15 (Junior Learner)';
    case AgeCategory.SENIOR_ADOLESCENT:
      return 'Ages 16-18 (Senior Adolescent)';
    case AgeCategory.ADULT:
      return 'Ages 19+ (Adult)';
  }
}

function getAgeCategoryDescription(category: AgeCategory): string {
  switch (category) {
    case AgeCategory.EARLY_LEARNER:
      return 'Full parental consent and oversight required. Highest protection level.';
    case AgeCategory.JUNIOR_LEARNER:
      return 'Parental consent required (ages 11-12) or recommended (ages 13-15). High protection level.';
    case AgeCategory.SENIOR_ADOLESCENT:
      return 'Independent minor consent. Moderate protection level. Guardian notification recommended.';
    case AgeCategory.ADULT:
      return 'Full adult consent. Standard protection level. Complete account control.';
  }
}

/**
 * Compact Consent Badge
 * Shows consent status in compact form
 */
export function CompactConsentBadge({ verified }: { verified: boolean }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
      verified 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      {verified ? (
        <>
          <Check className="w-4 h-4" />
          <span>Consent Verified</span>
        </>
      ) : (
        <>
          <AlertCircle className="w-4 h-4" />
          <span>Consent Required</span>
        </>
      )}
    </div>
  );
}
