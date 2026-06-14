import React, { useState } from 'react';
import { GraduationCap, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { AgeCategory } from '../../types/age-consent-types';

interface StudentConsentFormProps {
  studentAge: number;
  studentName: string;
  ageCategory: AgeCategory;
  onConsentGiven: (consentData: StudentConsentData) => void;
  onBack?: () => void;
}

export interface StudentConsentData {
  studentConsent: boolean;
  consentDate: string;
  parentEmail?: string;
  notifyParent: boolean;
  understandsOversight: boolean;
}

export function StudentConsentForm({ 
  studentAge, 
  studentName, 
  ageCategory,
  onConsentGiven, 
  onBack 
}: StudentConsentFormProps) {
  const [parentEmail, setParentEmail] = useState('');
  const [notifyParent, setNotifyParent] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [understandsOversight, setUnderstandsOversight] = useState(false);
  const [understandsData, setUnderstandsData] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (notifyParent && !parentEmail.trim()) {
      newErrors.parentEmail = 'Parent/guardian email is required';
    } else if (notifyParent && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) {
      newErrors.parentEmail = 'Please enter a valid email address';
    }

    if (!termsAccepted) {
      newErrors.terms = 'You must accept the Terms & Conditions';
    }

    if (!privacyAccepted) {
      newErrors.privacy = 'You must accept the Privacy Policy';
    }

    if (!understandsOversight) {
      newErrors.oversight = 'You must acknowledge parental oversight';
    }

    if (!understandsData) {
      newErrors.data = 'You must understand data collection';
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
        studentConsent: true,
        consentDate: new Date().toISOString(),
        parentEmail: notifyParent ? parentEmail : undefined,
        notifyParent,
        understandsOversight: true
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900 mb-2">Student Consent</h1>
          <p className="text-gray-600">
            Hi {studentName}! Let's set up your JotMinds account
          </p>
        </div>

        {/* Age-Appropriate Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-blue-900">
              <p className="mb-2">
                <strong>Important Information:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>You're {studentAge} years old, so you can give partial consent</li>
                <li>We recommend informing your parent/guardian</li>
                <li>Your parent/guardian may have oversight of your account</li>
                <li>You can view your own results and track your progress</li>
                <li>Your privacy is important to us - we only collect necessary data</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Parent Notification */}
          <div className="space-y-4">
            <h2 className="text-gray-900">Parent/Guardian Notification</h2>
            
            <label className="flex items-start gap-3 cursor-pointer group bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
              <input
                type="checkbox"
                checked={notifyParent}
                onChange={(e) => {
                  setNotifyParent(e.target.checked);
                  setErrors({ ...errors, parentEmail: '' });
                }}
                className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex-1">
                <p className="text-gray-900 mb-1">
                  <strong>Notify my parent/guardian</strong> (Recommended)
                </p>
                <p className="text-gray-600">
                  We'll send an email letting them know you've signed up and give them oversight access
                </p>
              </div>
            </label>

            {notifyParent && (
              <div className="ml-8">
                <label htmlFor="parentEmail" className="block text-gray-700 mb-2">
                  Parent/Guardian Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="parentEmail"
                    value={parentEmail}
                    onChange={(e) => {
                      setParentEmail(e.target.value);
                      setErrors({ ...errors, parentEmail: '' });
                    }}
                    placeholder="parent@example.com"
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${
                      errors.parentEmail ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.parentEmail && (
                  <p className="text-red-600 mt-1">{errors.parentEmail}</p>
                )}
              </div>
            )}
          </div>

          {/* Consent Checkboxes */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="text-gray-900">Your Consent & Understanding</h3>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked);
                  setErrors({ ...errors, terms: '' });
                }}
                className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700 group-hover:text-gray-900">
                I have read and accept the <a href="/terms" className="text-blue-600 hover:underline">Terms & Conditions</a> <span className="text-red-500">*</span>
              </span>
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
                className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700 group-hover:text-gray-900">
                I have read and accept the <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a> <span className="text-red-500">*</span>
              </span>
            </label>
            {errors.privacy && <p className="text-red-600 text-sm ml-8">{errors.privacy}</p>}

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={understandsOversight}
                onChange={(e) => {
                  setUnderstandsOversight(e.target.checked);
                  setErrors({ ...errors, oversight: '' });
                }}
                className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700 group-hover:text-gray-900">
                I understand that my parent/guardian may have access to my account and can view my assessment results and progress <span className="text-red-500">*</span>
              </span>
            </label>
            {errors.oversight && <p className="text-red-600 text-sm ml-8">{errors.oversight}</p>}

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={understandsData}
                onChange={(e) => {
                  setUnderstandsData(e.target.checked);
                  setErrors({ ...errors, data: '' });
                }}
                className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700 group-hover:text-gray-900">
                I understand that JotMinds will collect my assessment responses and progress data to personalize my learning experience <span className="text-red-500">*</span>
              </span>
            </label>
            {errors.data && <p className="text-red-600 text-sm ml-8">{errors.data}</p>}
          </div>

          {/* Your Rights */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-purple-900 mb-2">
              <strong>Your Rights:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-purple-800">
              <li>You can view all your assessment results and progress</li>
              <li>You can modify your profile settings</li>
              <li>You can access gamification features and challenges</li>
              <li>You can request your data be deleted (with parent approval)</li>
              <li>You can withdraw consent at any time</li>
            </ul>
          </div>

          {/* What Happens Next */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-900 mb-2">
              <strong>What happens next?</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-green-800">
              {notifyParent && parentEmail && (
                <li>We'll send a notification to {parentEmail}</li>
              )}
              <li>You can start taking assessments immediately</li>
              <li>You'll see your personalized cognitive profile</li>
              <li>You can earn badges and track your progress</li>
              <li>Your data is secure and private</li>
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
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                'Accept & Continue'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
