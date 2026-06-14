import React, { useState } from 'react';
import { Shield, Check, AlertCircle, Users, FileText } from 'lucide-react';
import { AgeCategory } from '../../types/age-consent-types';
import { PRIVACY_POLICY_META } from '../../types/privacy-policy-configs';

interface UserConsentData {
  // User Confirmations
  acceptedPrivacyPolicy: boolean;
  acceptedTermsConditions: boolean;
  understandsDataCollection: boolean;
  understandsNoDataSelling: boolean;
  
  // Age Selection
  ageCategory: AgeCategory | null;
  
  // Parental Consent (for ages 6-12)
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

interface UserConsentFlowProps {
  onConsent: (consentData: UserConsentData) => void;
  onCancel?: () => void;
}

/**
 * JotMinds User Consent Flow
 * Complete consent collection before app use
 */
export function UserConsentFlow({ onConsent, onCancel }: UserConsentFlowProps) {
  // User Confirmations
  const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(false);
  const [understandsDataCollection, setUnderstandsDataCollection] = useState(false);
  const [understandsNoDataSelling, setUnderstandsNoDataSelling] = useState(false);
  
  // Age Selection
  const [selectedAge, setSelectedAge] = useState<AgeCategory | null>(null);
  
  // Parental Consent
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentConfirmation, setParentConfirmation] = useState(false);

  // Check if parental consent is required
  const requiresParentalConsent = 
    selectedAge === AgeCategory.EARLY_LEARNER || 
    selectedAge === AgeCategory.JUNIOR_LEARNER;

  // Validation
  const canProceed = () => {
    // Check basic consents
    if (!acceptedPrivacyPolicy || !understandsDataCollection || !understandsNoDataSelling) {
      return false;
    }
    
    // Check age selection
    if (!selectedAge) {
      return false;
    }
    
    // Check parental consent if required
    if (requiresParentalConsent) {
      if (!parentName.trim() || !parentEmail.trim() || !parentConfirmation) {
        return false;
      }
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(parentEmail)) {
        return false;
      }
    }
    
    return true;
  };

  const handleContinue = () => {
    if (!canProceed()) return;

    const consentData: UserConsentData = {
      acceptedPrivacyPolicy,
      acceptedTermsConditions: acceptedPrivacyPolicy, // Combined in checkbox 1
      understandsDataCollection,
      understandsNoDataSelling,
      ageCategory: selectedAge,
      consentedAt: new Date(),
      ipAddress: 'CAPTURED_ON_BACKEND',
      userAgent: navigator.userAgent
    };

    // Add parental consent if required
    if (requiresParentalConsent && selectedAge) {
      consentData.parentalConsent = {
        parentName,
        parentEmail,
        parentConfirmation
      };
    }

    onConsent(consentData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-6 mb-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-white mb-1">JotMinds User Consent</h1>
              <p className="text-white/90">
                Before using JotMinds, please confirm the following:
              </p>
            </div>
          </div>
        </div>

        {/* Consent Checkboxes */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
          <h2 className="text-gray-900 mb-4">User Agreements</h2>
          
          <div className="space-y-4">
            {/* 1. Privacy Policy & Terms */}
            <ConsentCheckbox
              checked={acceptedPrivacyPolicy}
              onChange={setAcceptedPrivacyPolicy}
              number={1}
              label={
                <>
                  I have read and agree to the{' '}
                  <a href="/privacy-policy" target="_blank" className="text-indigo-600 hover:underline">
                    JotMinds Privacy Policy
                  </a>
                  {' '}and{' '}
                  <a href="/terms" target="_blank" className="text-indigo-600 hover:underline">
                    Terms & Conditions
                  </a>
                  .
                </>
              }
            />

            {/* 2. Educational Data */}
            <ConsentCheckbox
              checked={understandsDataCollection}
              onChange={setUnderstandsDataCollection}
              number={2}
              label="I understand that JotMinds collects only educational and non-commercial data."
            />

            {/* 3. No Data Selling */}
            <ConsentCheckbox
              checked={understandsNoDataSelling}
              onChange={setUnderstandsNoDataSelling}
              number={3}
              label="I understand that no data will be sold or used for advertising."
            />
          </div>
        </div>

        {/* Age Confirmation */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
          <h2 className="text-gray-900 mb-4">Age Confirmation</h2>
          <p className="text-gray-600 mb-4">Select One:</p>

          <div className="space-y-3">
            {/* Ages 6-10 */}
            <AgeOption
              selected={selectedAge === AgeCategory.EARLY_LEARNER}
              onChange={() => setSelectedAge(AgeCategory.EARLY_LEARNER)}
              label="I am 6–10 years old and I am using the app with parent/guardian consent."
              ageCategory={AgeCategory.EARLY_LEARNER}
              badge="Parent Consent Required"
              badgeColor="red"
            />

            {/* Ages 11-12 */}
            <AgeOption
              selected={selectedAge === AgeCategory.JUNIOR_LEARNER}
              onChange={() => setSelectedAge(AgeCategory.JUNIOR_LEARNER)}
              label="I am 11–12 years old and I have parent/guardian consent to continue."
              ageCategory={AgeCategory.JUNIOR_LEARNER}
              badge="Parent Consent Required"
              badgeColor="orange"
            />

            {/* Ages 13-15 */}
            <AgeOption
              selected={selectedAge === AgeCategory.JUNIOR_LEARNER}
              onChange={() => setSelectedAge(AgeCategory.JUNIOR_LEARNER)}
              label="I am 13–15 years old and I consent to use the app (parental guidance recommended)."
              ageCategory={AgeCategory.JUNIOR_LEARNER}
              badge="Parental Guidance Recommended"
              badgeColor="yellow"
              isAlternate
            />

            {/* Ages 16-18 */}
            <AgeOption
              selected={selectedAge === AgeCategory.SENIOR_ADOLESCENT}
              onChange={() => setSelectedAge(AgeCategory.SENIOR_ADOLESCENT)}
              label="I am 16–18 years old and I consent independently to use the app."
              ageCategory={AgeCategory.SENIOR_ADOLESCENT}
              badge="Independent Minor"
              badgeColor="blue"
            />

            {/* Ages 19+ */}
            <AgeOption
              selected={selectedAge === AgeCategory.ADULT}
              onChange={() => setSelectedAge(AgeCategory.ADULT)}
              label="I am 19+ years old and fully consent to the terms."
              ageCategory={AgeCategory.ADULT}
              badge="Adult Account"
              badgeColor="green"
            />
          </div>
        </div>

        {/* Parental Consent Section (auto-visible for 6-12) */}
        {requiresParentalConsent && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 mb-6 animate-fadeIn">
            <div className="flex items-start gap-3 mb-4">
              <Users className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-gray-900 mb-1">Parental Consent Section</h2>
                <p className="text-gray-700 text-sm">
                  Parent or guardian consent is required for users ages {selectedAge === AgeCategory.EARLY_LEARNER ? '6-10' : '11-12'}.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Parent Name */}
              <div>
                <label className="block text-gray-700 mb-2">
                  Parent/Guardian Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-900"
                  placeholder="Enter parent/guardian full name"
                  required
                />
              </div>

              {/* Parent Email */}
              <div>
                <label className="block text-gray-700 mb-2">
                  Parent/Guardian Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-900"
                  placeholder="parent@example.com"
                  required
                />
              </div>

              {/* Parent Confirmation */}
              <label className="flex items-start gap-3 cursor-pointer group bg-white rounded-lg p-4 border-2 border-amber-200 hover:border-amber-400 transition-colors">
                <input
                  type="checkbox"
                  checked={parentConfirmation}
                  onChange={(e) => setParentConfirmation(e.target.checked)}
                  className="mt-1 w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <div className="flex-1">
                  <p className="text-gray-900 group-hover:text-gray-900">
                    I confirm that I consent to my child using the JotMinds App.
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    By checking this box, I acknowledge that I am the parent or legal guardian 
                    and have the authority to provide consent on behalf of my child.
                  </p>
                </div>
                {parentConfirmation && (
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                )}
              </label>
            </div>
          </div>
        )}

        {/* Policy Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-gray-800 mb-2">
                <strong>Privacy Policy Version:</strong> {PRIVACY_POLICY_META.version}<br />
                <strong>Last Updated:</strong> {PRIVACY_POLICY_META.lastUpdated}<br />
                <strong>Operator:</strong> {PRIVACY_POLICY_META.operator.legalEntity}, {PRIVACY_POLICY_META.operator.country}
              </p>
              <p className="text-gray-700">
                By continuing, you agree to our data protection practices and confirm that all 
                information provided is accurate.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleContinue}
            disabled={!canProceed()}
            className="flex-1 bg-indigo-600 text-white py-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            <span>I Agree & Continue</span>
          </button>
        </div>

        {/* Validation Messages */}
        {!canProceed() && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-gray-800 mb-2">
                  <strong>Please complete the following:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {!acceptedPrivacyPolicy && (
                    <li>Accept the Privacy Policy and Terms & Conditions</li>
                  )}
                  {!understandsDataCollection && (
                    <li>Confirm understanding of data collection</li>
                  )}
                  {!understandsNoDataSelling && (
                    <li>Confirm understanding of no data selling policy</li>
                  )}
                  {!selectedAge && (
                    <li>Select your age group</li>
                  )}
                  {requiresParentalConsent && !parentName.trim() && (
                    <li>Enter parent/guardian name</li>
                  )}
                  {requiresParentalConsent && !parentEmail.trim() && (
                    <li>Enter parent/guardian email</li>
                  )}
                  {requiresParentalConsent && parentEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail) && (
                    <li>Enter a valid email address</li>
                  )}
                  {requiresParentalConsent && !parentConfirmation && (
                    <li>Parent/guardian must confirm consent</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

function ConsentCheckbox({
  checked,
  onChange,
  number,
  label
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  number: number;
  label: React.ReactNode;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="flex items-start gap-2 mt-1">
        <span className="text-gray-500 font-medium">{number}.</span>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
      </div>
      <span className="text-gray-700 group-hover:text-gray-900 flex-1">
        {label}
      </span>
      {checked && (
        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
      )}
    </label>
  );
}

function AgeOption({
  selected,
  onChange,
  label,
  ageCategory,
  badge,
  badgeColor,
  isAlternate = false
}: {
  selected: boolean;
  onChange: () => void;
  label: string;
  ageCategory: AgeCategory;
  badge: string;
  badgeColor: 'red' | 'orange' | 'yellow' | 'blue' | 'green';
  isAlternate?: boolean;
}) {
  const borderColors = {
    red: 'border-red-200 hover:border-red-400',
    orange: 'border-orange-200 hover:border-orange-400',
    yellow: 'border-yellow-200 hover:border-yellow-400',
    blue: 'border-blue-200 hover:border-blue-400',
    green: 'border-green-200 hover:border-green-400'
  };

  const selectedBorderColors = {
    red: 'border-red-500',
    orange: 'border-orange-500',
    yellow: 'border-yellow-500',
    blue: 'border-blue-500',
    green: 'border-green-500'
  };

  const badgeColors = {
    red: 'bg-red-100 text-red-800',
    orange: 'bg-orange-100 text-orange-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800'
  };

  return (
    <label
      className={`flex items-start gap-3 cursor-pointer group p-4 rounded-lg border-2 transition-all ${
        selected
          ? `${selectedBorderColors[badgeColor]} bg-white shadow-md`
          : `${borderColors[badgeColor]} bg-gray-50 hover:bg-white`
      }`}
    >
      <input
        type="radio"
        checked={selected}
        onChange={onChange}
        className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
      />
      <div className="flex-1">
        <p className={`text-gray-900 ${selected ? 'font-medium' : ''}`}>
          {label}
        </p>
        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs ${badgeColors[badgeColor]}`}>
          {badge}
        </span>
      </div>
      {selected && (
        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
      )}
    </label>
  );
}
