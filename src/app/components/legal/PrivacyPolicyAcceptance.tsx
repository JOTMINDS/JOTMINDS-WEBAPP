import React, { useState } from 'react';
import { Shield, Check, FileText, AlertCircle } from 'lucide-react';
import { AgeCategory } from '../../types/age-consent-types';
import { PRIVACY_POLICY_META } from '../../types/privacy-policy-configs';

interface PrivacyPolicyAcceptanceProps {
  ageCategory: AgeCategory;
  userType: 'parent' | 'guardian' | 'student' | 'user';
  onAccept: (acceptance: PrivacyAcceptance) => void;
  onDecline: () => void;
}

export interface PrivacyAcceptance {
  accepted: boolean;
  acceptedBy: string;
  acceptedAt: Date;
  ipAddress: string;
  userAgent: string;
  ageCategory: AgeCategory;
  policyVersion: string;
}

/**
 * Privacy Policy Acceptance Component
 * Captures user consent to privacy policy
 */
export function PrivacyPolicyAcceptance({
  ageCategory,
  userType,
  onAccept,
  onDecline
}: PrivacyPolicyAcceptanceProps) {
  const [hasRead, setHasRead] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [dataUsageConsent, setDataUsageConsent] = useState(false);

  const canAccept = hasRead && understood && dataUsageConsent;

  const handleAccept = () => {
    if (!canAccept) return;

    const acceptance: PrivacyAcceptance = {
      accepted: true,
      acceptedBy: userType,
      acceptedAt: new Date(),
      ipAddress: 'CAPTURED_ON_BACKEND',
      userAgent: navigator.userAgent,
      ageCategory,
      policyVersion: PRIVACY_POLICY_META.version
    };

    onAccept(acceptance);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-lg">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-white mb-1">Privacy Policy Agreement</h1>
            <p className="text-white/90">
              Please review and accept our privacy policy
            </p>
          </div>
        </div>
      </div>

      {/* Policy Summary */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
        <h2 className="text-gray-900 mb-4">Privacy Policy Summary</h2>
        
        <div className="space-y-3 mb-4">
          <PolicyPoint 
            icon="🔒"
            text="We protect your data with industry-leading security measures"
          />
          <PolicyPoint 
            icon="📊"
            text="We collect only necessary data for educational insights"
          />
          <PolicyPoint 
            icon="🚫"
            text="We NEVER sell your data or use it for advertising"
          />
          <PolicyPoint 
            icon="👨‍👩‍👧"
            text={getParentAccessText(ageCategory)}
          />
          <PolicyPoint 
            icon="🗑️"
            text={`You can request data deletion at any time (${getRetentionText(ageCategory)})`}
          />
          <PolicyPoint 
            icon="🌍"
            text="International data transfers use GDPR-equivalent protections"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-gray-800 text-sm">
            <strong>Policy Version:</strong> {PRIVACY_POLICY_META.version}<br />
            <strong>Last Updated:</strong> {PRIVACY_POLICY_META.lastUpdated}<br />
            <strong>Effective Date:</strong> {PRIVACY_POLICY_META.effectiveDate}
          </p>
        </div>
      </div>

      {/* Consent Checkboxes */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
        <h2 className="text-gray-900 mb-4">Required Consents</h2>

        <div className="space-y-4">
          {/* Read Policy */}
          <ConsentCheckbox
            checked={hasRead}
            onChange={setHasRead}
            label="I have read and reviewed the full Privacy Policy"
            required
          />

          {/* Understand Policy */}
          <ConsentCheckbox
            checked={understood}
            onChange={setUnderstood}
            label={getUnderstandingText(ageCategory, userType)}
            required
          />

          {/* Data Usage Consent */}
          <ConsentCheckbox
            checked={dataUsageConsent}
            onChange={setDataUsageConsent}
            label="I consent to the collection, use, and storage of data as described in the Privacy Policy"
            required
          />
        </div>

        {/* Age-Specific Notice */}
        <AgeSpecificNotice ageCategory={ageCategory} userType={userType} />
      </div>

      {/* Full Policy Link */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-gray-900 mb-2">Read Full Privacy Policy</h3>
            <p className="text-gray-700 mb-3 text-sm">
              Before accepting, please read our complete Privacy Policy to understand how we 
              protect and use your data.
            </p>
            <a
              href="/privacy-policy"
              target="_blank"
              className="text-indigo-600 hover:underline"
            >
              View Full Privacy Policy →
            </a>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onDecline}
          className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Decline
        </button>
        <button
          onClick={handleAccept}
          disabled={!canAccept}
          className="flex-1 bg-indigo-600 text-white py-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          <span>Accept Privacy Policy</span>
        </button>
      </div>

      {!canAccept && (
        <p className="text-center text-gray-600 text-sm mt-4">
          Please check all required boxes to continue
        </p>
      )}
    </div>
  );
}

function PolicyPoint({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <p className="text-gray-700">{text}</p>
    </div>
  );
}

function ConsentCheckbox({
  checked,
  onChange,
  label,
  required
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
      />
      <span className="text-gray-700 group-hover:text-gray-900">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </span>
    </label>
  );
}

function AgeSpecificNotice({ ageCategory, userType }: { ageCategory: AgeCategory; userType: string }) {
  const notices = {
    [AgeCategory.EARLY_LEARNER]: {
      title: 'Parent/Guardian Consent Required',
      message: 'By accepting, you confirm that you are the parent or legal guardian of the child (ages 6-10) and have the authority to provide consent on their behalf. You understand that you are responsible for all account activity and data management.'
    },
    [AgeCategory.JUNIOR_LEARNER]: {
      title: 'Parental Oversight Required',
      message: userType === 'parent' || userType === 'guardian'
        ? 'By accepting, you confirm that you are the parent or legal guardian and will provide appropriate oversight of the account. For users ages 13-15, while they may use the platform, parental oversight is strongly recommended.'
        : 'By accepting, you confirm that your parent or guardian has been notified and you understand that they may access your data and activity.'
    },
    [AgeCategory.SENIOR_ADOLESCENT]: {
      title: 'Minor Account Notice',
      message: 'By accepting, you confirm that you are between ages 16-18 and understand your rights. While you can manage your account independently, guardian notification is recommended. You can request data deletion at any time.'
    },
    [AgeCategory.ADULT]: {
      title: 'Adult Account',
      message: 'By accepting, you confirm that you are 19 years or older and have full authority to consent to this privacy policy. You understand your data rights and responsibilities.'
    }
  };

  const notice = notices[ageCategory];

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-gray-900 mb-2">{notice.title}</h4>
          <p className="text-gray-700 text-sm">{notice.message}</p>
        </div>
      </div>
    </div>
  );
}

function getParentAccessText(ageCategory: AgeCategory): string {
  switch (ageCategory) {
    case AgeCategory.EARLY_LEARNER:
      return 'Parents always have full access to child data';
    case AgeCategory.JUNIOR_LEARNER:
      return 'Parents have access and oversight of account data';
    case AgeCategory.SENIOR_ADOLESCENT:
      return 'Parent notification recommended (optional access)';
    case AgeCategory.ADULT:
      return 'You have complete control over your data';
  }
}

function getRetentionText(ageCategory: AgeCategory): string {
  switch (ageCategory) {
    case AgeCategory.EARLY_LEARNER:
      return 'deleted after 6-12 months inactivity';
    case AgeCategory.JUNIOR_LEARNER:
      return 'deleted after 12-24 months inactivity';
    case AgeCategory.SENIOR_ADOLESCENT:
      return 'deleted after 24-36 months inactivity';
    case AgeCategory.ADULT:
      return 'user-defined retention period';
  }
}

function getUnderstandingText(ageCategory: AgeCategory, userType: string): string {
  if (userType === 'parent' || userType === 'guardian') {
    return 'I understand how my child\'s data will be collected, used, and protected';
  }
  
  if (ageCategory === AgeCategory.EARLY_LEARNER) {
    return 'I understand how data will be collected and used (parent/guardian)';
  }
  
  return 'I understand how my data will be collected, used, and protected';
}
