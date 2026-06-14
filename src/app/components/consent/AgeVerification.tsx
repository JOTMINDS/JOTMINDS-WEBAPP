import React, { useState } from 'react';
import { Calendar, User, AlertCircle } from 'lucide-react';
import { calculateAge, getAgeCategory, MINIMUM_AGE, MAXIMUM_AGE, AgeCategory } from '../../types/age-consent-types';

interface AgeVerificationProps {
  onVerified: (dateOfBirth: string, age: number, category: AgeCategory) => void;
  onCancel?: () => void;
}

export function AgeVerification({ onVerified, onCancel }: AgeVerificationProps) {
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleVerify = () => {
    setError('');
    setIsValidating(true);

    // Validate date format
    if (!dateOfBirth) {
      setError('Please enter your date of birth');
      setIsValidating(false);
      return;
    }

    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    // Check if date is valid
    if (isNaN(birthDate.getTime())) {
      setError('Please enter a valid date');
      setIsValidating(false);
      return;
    }

    // Check if date is in the future
    if (birthDate > today) {
      setError('Date of birth cannot be in the future');
      setIsValidating(false);
      return;
    }

    // Calculate age
    const age = calculateAge(dateOfBirth);

    // Check minimum age
    if (age < MINIMUM_AGE) {
      setError(`You must be at least ${MINIMUM_AGE} years old to use JotMinds`);
      setIsValidating(false);
      return;
    }

    // Check maximum age (sanity check)
    if (age > MAXIMUM_AGE) {
      setError('Please enter a valid date of birth');
      setIsValidating(false);
      return;
    }

    // Get age category
    try {
      const category = getAgeCategory(age);
      
      // Success - proceed to consent flow
      setTimeout(() => {
        setIsValidating(false);
        onVerified(dateOfBirth, age, category);
      }, 500);
    } catch (err) {
      setError('Unable to determine age category. Please contact support.');
      setIsValidating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900 mb-2">Welcome to JotMinds</h1>
          <p className="text-gray-600">Let's verify your age to personalize your experience</p>
        </div>

        {/* Date of Birth Input */}
        <div className="space-y-6">
          <div>
            <label htmlFor="dob" className="block text-gray-700 mb-2">
              What's your date of birth?
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                id="dob"
                value={dateOfBirth}
                onChange={(e) => {
                  setDateOfBirth(e.target.value);
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                max={new Date().toISOString().split('T')[0]}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                disabled={isValidating}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-indigo-900">
              <strong>Privacy First:</strong> We collect your date of birth to ensure age-appropriate 
              content and comply with child protection regulations. Your information is secure and 
              will never be shared without consent.
            </p>
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={!dateOfBirth || isValidating}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            {isValidating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </span>
            ) : (
              'Continue'
            )}
          </button>

          {/* Cancel Button */}
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={isValidating}
              className="w-full bg-white text-gray-700 py-3 px-6 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Age Categories Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-500 text-center mb-3">JotMinds Age Categories:</p>
          <div className="space-y-2 text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span><strong>Ages 6-10:</strong> Early Learners (parental consent required)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span><strong>Ages 11-15:</strong> Junior Learners (guardian oversight)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span><strong>Ages 16-18:</strong> Senior Adolescents (independent consent)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span><strong>Ages 19+:</strong> Tertiary Students & Adults</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
