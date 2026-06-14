import React, { useState } from 'react';
import { Sparkles, CheckCircle } from 'lucide-react';
import { AgeCategory } from '../../types/age-consent-types';

interface IndependentConsentFormProps {
  userAge: number;
  userName: string;
  ageCategory: AgeCategory;
  onConsentGiven: (consentData: IndependentConsentData) => void;
  onBack?: () => void;
}

export interface IndependentConsentData {
  userConsent: boolean;
  consentDate: string;
  marketingOptIn: boolean;
  dataAnalyticsOptIn: boolean;
}

export function IndependentConsentForm({ 
  userAge, 
  userName, 
  ageCategory,
  onConsentGiven, 
  onBack 
}: IndependentConsentFormProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [dataAnalyticsOptIn, setDataAnalyticsOptIn] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSeniorAdolescent = ageCategory === AgeCategory.SENIOR_ADOLESCENT;
  const isAdult = ageCategory === AgeCategory.ADULT;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!termsAccepted) {
      newErrors.terms = 'You must accept the Terms & Conditions';
    }

    if (!privacyAccepted) {
      newErrors.privacy = 'You must accept the Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      onConsentGiven({
        userConsent: true,
        consentDate: new Date().toISOString(),
        marketingOptIn,
        dataAnalyticsOptIn
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900 mb-2">
            {isAdult ? 'Welcome to JotMinds' : 'Independent Account Setup'}
          </h1>
          <p className="text-gray-600">
            {isSeniorAdolescent 
              ? `Hi ${userName}! You can create your account independently as a mature minor.`
              : `Hi ${userName}! Complete your account setup to get started.`
            }
          </p>
        </div>

        {/* Age Category Message */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-purple-900">
              <p className="mb-2">
                <strong>{isAdult ? 'Full Independent Access:' : 'Independent Consent Available:'}</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-purple-800">
                {isSeniorAdolescent ? (
                  <>
                    <li>You're {userAge} years old and can provide independent consent</li>
                    <li>No parental approval required for educational use</li>
                    <li>Guardian oversight is optional but recommended</li>
                    <li>If using through school, they'll inform your guardians</li>
                    <li>You have full control over your account and data</li>
                  </>
                ) : (
                  <>
                    <li>You're {userAge} years old with full legal consent</li>
                    <li>Complete independence - no parental involvement needed</li>
                    <li>Full access to all premium and advanced features</li>
                    <li>Complete control over your data and privacy</li>
                    <li>You can delete your account at any time</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Required Consents */}
          <div className="space-y-4">
            <h2 className="text-gray-900">Required Agreements</h2>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked);
                  setErrors({ ...errors, terms: '' });
                }}
                className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex-1">
                <span className="text-gray-700 group-hover:text-gray-900">
                  I have read and accept the <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Terms & Conditions</a> <span className="text-red-500">*</span>
                </span>
                <p className="text-gray-500 mt-1">Last updated: 30th November 2025</p>
              </div>
            </label>
            {errors.terms && <p className="text-red-600 text-sm ml-8">{errors.terms}</p>}

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => {
                  setPrivacyAccepted(e.target.checked);
                  setErrors({ ...errors, privacy: '' });
                }}
                className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex-1">
                <span className="text-gray-700 group-hover:text-gray-900">
                  I have read and accept the <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Privacy Policy</a> <span className="text-red-500">*</span>
                </span>
                <p className="text-gray-500 mt-1">
                  Learn how we protect your data and respect your privacy
                </p>
              </div>
            </label>
            {errors.privacy && <p className="text-red-600 text-sm ml-8">{errors.privacy}</p>}
          </div>

          {/* Optional Preferences */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="text-gray-900">Optional Preferences</h3>

            <label className="flex items-start gap-3 cursor-pointer group bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
              <input
                type="checkbox"
                checked={dataAnalyticsOptIn}
                onChange={(e) => setDataAnalyticsOptIn(e.target.checked)}
                className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex-1">
                <p className="text-gray-900 mb-1">
                  <strong>Enhanced Analytics</strong> (Recommended)
                </p>
                <p className="text-gray-600">
                  Allow {isAdult ? 'full' : 'standard'} data collection to personalize your learning experience, 
                  improve recommendations, and provide detailed insights about your cognitive profile.
                </p>
              </div>
            </label>

            {isAdult && (
              <label className="flex items-start gap-3 cursor-pointer group bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={(e) => setMarketingOptIn(e.target.checked)}
                  className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex-1">
                  <p className="text-gray-900 mb-1">
                    <strong>Product Updates & Tips</strong>
                  </p>
                  <p className="text-gray-600">
                    Receive occasional emails about new features, learning tips, and educational 
                    resources. You can unsubscribe anytime.
                  </p>
                </div>
              </label>
            )}
          </div>

          {/* Your Features */}
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
            <p className="text-pink-900 mb-2">
              <strong>What you can do with JotMinds:</strong>
            </p>
            <div className="grid md:grid-cols-2 gap-2 text-pink-800">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                <span>Take all cognitive assessments</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                <span>View detailed results & insights</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                <span>Share results with others</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                <span>Access gamification features</span>
              </div>
              {isAdult && (
                <>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                    <span>Access premium features</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                    <span>Advanced analytics & reports</span>
                  </div>
                </>
              )}
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                <span>Modify your profile anytime</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                <span>Delete your account if needed</span>
              </div>
            </div>
          </div>

          {/* Data Protection */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 mb-2">
              <strong>Your data is protected:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Industry-standard encryption for all data</li>
              <li>Your results are private by default</li>
              <li>You control who sees your information</li>
              <li>We never sell your data to third parties</li>
              <li>You can export or delete your data anytime</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {onBack && (
              <button
                onClick={onBack}
                disabled={isSubmitting}
                className="flex-1 bg-white text-gray-700 py-3 px-6 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : (
                'Accept & Create Account'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
