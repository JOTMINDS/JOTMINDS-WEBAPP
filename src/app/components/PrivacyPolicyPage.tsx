import React, { useState } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { PrivacyPolicyDisplay } from './legal/PrivacyPolicyDisplay';
import { AgeCategory } from '../types/age-consent-types';

interface PrivacyPolicyPageProps {
  onBack?: () => void;
  userAge?: number;
  isSchoolAccount?: boolean;
}

/**
 * Privacy Policy Page
 * Displays the complete JotMinds Privacy Policy
 */
export function PrivacyPolicyPage({ 
  onBack, 
  userAge,
  isSchoolAccount = false 
}: PrivacyPolicyPageProps) {
  // Determine age category from user age
  const getAgeCategory = (age?: number): AgeCategory => {
    if (!age) return AgeCategory.ADULT; // Default to adult if no age provided
    
    if (age >= 6 && age <= 10) return AgeCategory.EARLY_LEARNER;
    if (age >= 11 && age <= 15) return AgeCategory.JUNIOR_LEARNER;
    if (age >= 16 && age <= 18) return AgeCategory.SENIOR_ADOLESCENT;
    return AgeCategory.ADULT;
  };

  const ageCategory = getAgeCategory(userAge);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
            )}
            <div className="flex items-center gap-3 flex-1">
              <div className="bg-white/20 p-3 rounded-lg">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-white text-2xl">JotMinds Privacy Policy</h1>
                <p className="text-white/90 text-sm">
                  Effective December 1, 2025
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <PrivacyPolicyDisplay
          ageCategory={ageCategory}
          isSchoolAccount={isSchoolAccount}
          showFull={true}
        />
      </div>

      {/* Footer */}
      <div className="border-t bg-white/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              <strong>JotMinds Platform</strong>
            </p>
            <p className="text-sm">
              Operated by i2 Communications Ltd, Ghana
            </p>
            <p className="text-sm mt-2">
              Questions? Contact us at{' '}
              <a 
                href="mailto:privacy@jotminds.com" 
                className="text-indigo-600 hover:underline"
              >
                privacy@jotminds.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
