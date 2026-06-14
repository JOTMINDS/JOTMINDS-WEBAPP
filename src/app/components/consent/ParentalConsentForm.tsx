import React, { useState } from 'react';
import { Shield, Mail, User, CheckCircle, AlertCircle } from 'lucide-react';
import { AgeCategory } from '../../types/age-consent-types';

interface ParentalConsentFormProps {
  childAge: number;
  childName: string;
  ageCategory: AgeCategory;
  onConsentGiven: (parentData: ParentConsentData) => void;
  onBack?: () => void;
}

export interface ParentConsentData {
  parentName: string;
  parentEmail: string;
  relationship: string;
  consentGiven: boolean;
  consentDate: string;
  signatureConfirmed: boolean;
}

export function ParentalConsentForm({ 
  childAge, 
  childName, 
  ageCategory,
  onConsentGiven, 
  onBack 
}: ParentalConsentFormProps) {
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [relationship, setRelationship] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [dataCollectionAccepted, setDataCollectionAccepted] = useState(false);
  const [signatureConfirmed, setSignatureConfirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEarlyLearner = ageCategory === AgeCategory.EARLY_LEARNER;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!parentName.trim()) {
      newErrors.parentName = 'Parent/guardian name is required';
    }

    if (!parentEmail.trim()) {
      newErrors.parentEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) {
      newErrors.parentEmail = 'Please enter a valid email address';
    }

    if (!relationship.trim()) {
      newErrors.relationship = 'Relationship is required';
    }

    if (!termsAccepted) {
      newErrors.terms = 'You must accept the Terms & Conditions';
    }

    if (!privacyAccepted) {
      newErrors.privacy = 'You must accept the Privacy Policy';
    }

    if (!dataCollectionAccepted) {
      newErrors.dataCollection = 'You must consent to data collection';
    }

    if (!signatureConfirmed) {
      newErrors.signature = 'You must confirm your electronic signature';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate processing
    setTimeout(() => {
      onConsentGiven({
        parentName,
        parentEmail,
        relationship,
        consentGiven: true,
        consentDate: new Date().toISOString(),
        signatureConfirmed: true
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900 mb-2">Parental Consent Required</h1>
          <p className="text-gray-600">
            {childName} is {childAge} years old and needs your consent to use JotMinds
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-blue-900">
              <p className="mb-2">
                <strong>Why we need your consent:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                {isEarlyLearner ? (
                  <>
                    <li>Your child requires full supervision while using JotMinds</li>
                    <li>All assessment results will only be visible to you</li>
                    <li>We collect minimal data for educational purposes only</li>
                    <li>Your child cannot create an account independently</li>
                  </>
                ) : (
                  <>
                    <li>Your child is {childAge} years old and requires guardian oversight</li>
                    <li>You'll have access to their results and progress</li>
                    <li>We collect standard data for personalized learning</li>
                    <li>Your consent ensures age-appropriate content</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Parent/Guardian Information */}
          <div className="space-y-4">
            <h2 className="text-gray-900">Parent/Guardian Information</h2>
            
            <div>
              <label htmlFor="parentName" className="block text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="parentName"
                  value={parentName}
                  onChange={(e) => {
                    setParentName(e.target.value);
                    setErrors({ ...errors, parentName: '' });
                  }}
                  placeholder="Enter your full name"
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow ${
                    errors.parentName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.parentName && (
                <p className="text-red-600 mt-1">{errors.parentName}</p>
              )}
            </div>

            <div>
              <label htmlFor="parentEmail" className="block text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
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
                  placeholder="your.email@example.com"
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow ${
                    errors.parentEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.parentEmail && (
                <p className="text-red-600 mt-1">{errors.parentEmail}</p>
              )}
            </div>

            <div>
              <label htmlFor="relationship" className="block text-gray-700 mb-2">
                Relationship to Child <span className="text-red-500">*</span>
              </label>
              <select
                id="relationship"
                value={relationship}
                onChange={(e) => {
                  setRelationship(e.target.value);
                  setErrors({ ...errors, relationship: '' });
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow ${
                  errors.relationship ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select relationship</option>
                <option value="parent">Parent</option>
                <option value="legal_guardian">Legal Guardian</option>
                <option value="foster_parent">Foster Parent</option>
                <option value="grandparent">Grandparent</option>
                <option value="other">Other Legal Guardian</option>
              </select>
              {errors.relationship && (
                <p className="text-red-600 mt-1">{errors.relationship}</p>
              )}
            </div>
          </div>

          {/* Consent Checkboxes */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="text-gray-900">Consent & Agreements</h3>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked);
                  setErrors({ ...errors, terms: '' });
                }}
                className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
              />
              <span className="text-gray-700 group-hover:text-gray-900">
                I accept the <a href="/terms" className="text-green-600 hover:underline">Terms & Conditions</a> on behalf of my child <span className="text-red-500">*</span>
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
                className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
              />
              <span className="text-gray-700 group-hover:text-gray-900">
                I accept the <a href="/privacy" className="text-green-600 hover:underline">Privacy Policy</a> and understand how my child's data will be used <span className="text-red-500">*</span>
              </span>
            </label>
            {errors.privacy && <p className="text-red-600 text-sm ml-8">{errors.privacy}</p>}

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={dataCollectionAccepted}
                onChange={(e) => {
                  setDataCollectionAccepted(e.target.checked);
                  setErrors({ ...errors, dataCollection: '' });
                }}
                className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
              />
              <span className="text-gray-700 group-hover:text-gray-900">
                I consent to the collection of {isEarlyLearner ? 'minimal' : 'standard'} educational data for my child's personalized learning experience <span className="text-red-500">*</span>
              </span>
            </label>
            {errors.dataCollection && <p className="text-red-600 text-sm ml-8">{errors.dataCollection}</p>}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={signatureConfirmed}
                  onChange={(e) => {
                    setSignatureConfirmed(e.target.checked);
                    setErrors({ ...errors, signature: '' });
                  }}
                  className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                />
                <div className="flex-1">
                  <p className="text-gray-700 group-hover:text-gray-900">
                    <strong>Electronic Signature:</strong> By checking this box, I confirm that I am the parent or legal guardian of {childName}, and this electronic signature has the same legal effect as a handwritten signature. <span className="text-red-500">*</span>
                  </p>
                  {signatureConfirmed && (
                    <div className="mt-2 flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Signed by: {parentName || '(Your name)'}</span>
                    </div>
                  )}
                </div>
              </label>
              {errors.signature && <p className="text-red-600 text-sm ml-8 mt-2">{errors.signature}</p>}
            </div>
          </div>

          {/* What Happens Next */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-900 mb-2">
              <strong>What happens next?</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-green-800">
              <li>You'll receive a confirmation email at {parentEmail || 'your email'}</li>
              <li>{isEarlyLearner ? "You'll have full access to your child's account and results" : "You'll have oversight access to monitor progress"}</li>
              <li>Your child can start using JotMinds immediately after consent</li>
              <li>You can revoke consent at any time from your parent dashboard</li>
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
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                'Give Consent & Continue'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
