import React, { useState } from 'react';
import { AgeVerification } from './AgeVerification';
import { ParentalConsentForm, ParentConsentData } from './ParentalConsentForm';
import { StudentConsentForm, StudentConsentData } from './StudentConsentForm';
import { IndependentConsentForm, IndependentConsentData } from './IndependentConsentForm';
import { 
  AgeCategory, 
  getConsentRequirements, 
  ConsentType,
  UserConsentStatus,
  CURRENT_TERMS_VERSION,
  CURRENT_PRIVACY_VERSION
} from '../../types/age-consent-types';

type ConsentStep = 'age_verification' | 'parental_consent' | 'student_consent' | 'independent_consent' | 'complete';

interface ConsentFlowProps {
  userName?: string;
  onComplete: (consentStatus: UserConsentStatus) => void;
  onCancel?: () => void;
}

export function ConsentFlow({ userName = 'Student', onComplete, onCancel }: ConsentFlowProps) {
  const [currentStep, setCurrentStep] = useState<ConsentStep>('age_verification');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [age, setAge] = useState(0);
  const [ageCategory, setAgeCategory] = useState<AgeCategory | null>(null);

  const handleAgeVerified = (dob: string, calculatedAge: number, category: AgeCategory) => {
    setDateOfBirth(dob);
    setAge(calculatedAge);
    setAgeCategory(category);

    // Route to appropriate consent form based on age category
    const requirements = getConsentRequirements(category);

    switch (requirements.type) {
      case ConsentType.FULL_PARENTAL:
        // Ages 6-10 or 11-12 with full parental consent
        setCurrentStep('parental_consent');
        break;

      case ConsentType.PARTIAL_PARENTAL:
        // Ages 13-15 with partial consent
        if (calculatedAge >= 11 && calculatedAge <= 12) {
          // 11-12 year olds need parental consent
          setCurrentStep('parental_consent');
        } else {
          // 13-15 year olds can give partial consent
          setCurrentStep('student_consent');
        }
        break;

      case ConsentType.INDEPENDENT_SUPERVISED:
        // Ages 16-18
        setCurrentStep('independent_consent');
        break;

      case ConsentType.FULL_INDEPENDENT:
        // Ages 19+
        setCurrentStep('independent_consent');
        break;

      default:
        console.error('Unknown consent type');
        break;
    }
  };

  const handleParentalConsent = (parentData: ParentConsentData) => {
    // Build consent status
    const consentStatus: UserConsentStatus = {
      userId: '', // Will be set by parent component
      ageCategory: ageCategory!,
      dateOfBirth,
      calculatedAge: age,
      
      termsAccepted: true,
      termsAcceptedDate: new Date().toISOString(),
      termsVersion: CURRENT_TERMS_VERSION,
      
      privacyPolicyAccepted: true,
      privacyPolicyDate: new Date().toISOString(),
      privacyPolicyVersion: CURRENT_PRIVACY_VERSION,
      
      parentalConsentRequired: true,
      parentalConsentGiven: true,
      parentalConsentDate: parentData.consentDate,
      parentGuardianEmail: parentData.parentEmail,
      parentGuardianName: parentData.parentName,
      
      schoolVerificationRequired: false,
      schoolVerified: false,
      
      accountFullyActivated: true,
      pendingConsentFrom: null
    };

    onComplete(consentStatus);
  };

  const handleStudentConsent = (consentData: StudentConsentData) => {
    // Build consent status
    const consentStatus: UserConsentStatus = {
      userId: '', // Will be set by parent component
      ageCategory: ageCategory!,
      dateOfBirth,
      calculatedAge: age,
      
      termsAccepted: true,
      termsAcceptedDate: new Date().toISOString(),
      termsVersion: CURRENT_TERMS_VERSION,
      
      privacyPolicyAccepted: true,
      privacyPolicyDate: new Date().toISOString(),
      privacyPolicyVersion: CURRENT_PRIVACY_VERSION,
      
      parentalConsentRequired: consentData.notifyParent,
      parentalConsentGiven: false, // Pending if notification was requested
      parentGuardianEmail: consentData.parentEmail,
      
      schoolVerificationRequired: false,
      schoolVerified: false,
      
      accountFullyActivated: !consentData.notifyParent, // Activated if no parent notification needed
      pendingConsentFrom: consentData.notifyParent ? 'parent' : null
    };

    onComplete(consentStatus);
  };

  const handleIndependentConsent = (consentData: IndependentConsentData) => {
    // Build consent status
    const consentStatus: UserConsentStatus = {
      userId: '', // Will be set by parent component
      ageCategory: ageCategory!,
      dateOfBirth,
      calculatedAge: age,
      
      termsAccepted: true,
      termsAcceptedDate: new Date().toISOString(),
      termsVersion: CURRENT_TERMS_VERSION,
      
      privacyPolicyAccepted: true,
      privacyPolicyDate: new Date().toISOString(),
      privacyPolicyVersion: CURRENT_PRIVACY_VERSION,
      
      parentalConsentRequired: false,
      parentalConsentGiven: false,
      
      schoolVerificationRequired: false,
      schoolVerified: false,
      
      accountFullyActivated: true,
      pendingConsentFrom: null
    };

    onComplete(consentStatus);
  };

  const handleBack = () => {
    // Go back to age verification
    setCurrentStep('age_verification');
    setAgeCategory(null);
    setAge(0);
    setDateOfBirth('');
  };

  // Render current step
  switch (currentStep) {
    case 'age_verification':
      return (
        <AgeVerification
          onVerified={handleAgeVerified}
          onCancel={onCancel}
        />
      );

    case 'parental_consent':
      return (
        <ParentalConsentForm
          childAge={age}
          childName={userName}
          ageCategory={ageCategory!}
          onConsentGiven={handleParentalConsent}
          onBack={handleBack}
        />
      );

    case 'student_consent':
      return (
        <StudentConsentForm
          studentAge={age}
          studentName={userName}
          ageCategory={ageCategory!}
          onConsentGiven={handleStudentConsent}
          onBack={handleBack}
        />
      );

    case 'independent_consent':
      return (
        <IndependentConsentForm
          userAge={age}
          userName={userName}
          ageCategory={ageCategory!}
          onConsentGiven={handleIndependentConsent}
          onBack={handleBack}
        />
      );

    default:
      return null;
  }
}
