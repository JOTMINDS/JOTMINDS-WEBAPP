/**
 * INTEGRATION EXAMPLE: How to Use the Age-Based Consent System
 * 
 * This file shows how to integrate the consent system into your app.
 * This is for reference only - adapt to your specific routing/state management.
 */

import React, { useState } from 'react';
import { ConsentFlow } from './components/consent/ConsentFlow';
import { UserConsentStatus, AgeCategory, canPerformAction } from './types/age-consent-types';

// ============= EXAMPLE 1: SIGNUP FLOW =============

export function SignupFlow() {
  const [step, setStep] = useState<'name' | 'consent' | 'complete'>('name');
  const [userName, setUserName] = useState('');
  const [consentStatus, setConsentStatus] = useState<UserConsentStatus | null>(null);

  const handleNameSubmit = () => {
    setStep('consent');
  };

  const handleConsentComplete = (status: UserConsentStatus) => {
    setConsentStatus(status);
    
    // Save to your backend
    saveConsentToBackend(status);
    
    // Create user account
    createUserAccount({
      name: userName,
      dateOfBirth: status.dateOfBirth,
      ageCategory: status.ageCategory,
      consentStatus: status
    });
    
    setStep('complete');
  };

  if (step === 'name') {
    return (
      <div className="max-w-md mx-auto p-8">
        <h1>Welcome to JotMinds!</h1>
        <p className="text-gray-600 mb-4">What's your name?</p>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Enter your name"
          className="w-full px-4 py-2 border rounded-lg mb-4"
        />
        <button
          onClick={handleNameSubmit}
          disabled={!userName}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg"
        >
          Continue
        </button>
      </div>
    );
  }

  if (step === 'consent') {
    return (
      <ConsentFlow
        userName={userName}
        onComplete={handleConsentComplete}
        onCancel={() => setStep('name')}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <h1>Welcome, {userName}! 🎉</h1>
      <p className="text-gray-600 mb-4">
        Your account is {consentStatus?.accountFullyActivated ? 'active' : 'pending approval'}
      </p>
      {consentStatus?.pendingConsentFrom === 'parent' && (
        <p className="text-orange-600">
          We've sent an email to your parent/guardian for approval.
        </p>
      )}
      <button
        onClick={() => window.location.href = '/dashboard'}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg mt-4"
      >
        Go to Dashboard
      </button>
    </div>
  );
}

// ============= EXAMPLE 2: FEATURE GATING =============

export function ResultsPage({ userId }: { userId: string }) {
  const user = useUser(userId); // Your user hook
  
  // Check if user can view results based on age
  const canViewResults = canPerformAction(
    user.ageCategory,
    'canViewOwnResults'
  );

  if (!canViewResults) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-gray-900 mb-4">Results Not Available</h2>
        <p className="text-gray-600 mb-4">
          You're in our Early Learners program! Your parent or guardian can view 
          your results from their Parent Dashboard.
        </p>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1>Your Assessment Results</h1>
      {/* Show results */}
    </div>
  );
}

// ============= EXAMPLE 3: CONDITIONAL UI =============

export function DashboardHeader({ user }: { user: any }) {
  const canDeleteAccount = canPerformAction(
    user.ageCategory,
    'canDeleteAccount'
  );

  const canAccessPremium = canPerformAction(
    user.ageCategory,
    'canAccessPremiumFeatures'
  );

  return (
    <header className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <h1>Dashboard</h1>
        <div className="flex gap-2">
          {canAccessPremium && (
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg">
              Upgrade to Premium
            </button>
          )}
          
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg">
            Settings
          </button>
          
          {canDeleteAccount && (
            <button className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg">
              Delete Account
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

// ============= EXAMPLE 4: AGE CATEGORY BADGE =============

export function AgeCategoryBadge({ ageCategory }: { ageCategory: AgeCategory }) {
  const badges = {
    [AgeCategory.EARLY_LEARNER]: {
      label: 'Early Learner',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: '🌱'
    },
    [AgeCategory.JUNIOR_LEARNER]: {
      label: 'Junior Learner',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '📚'
    },
    [AgeCategory.SENIOR_ADOLESCENT]: {
      label: 'Senior Adolescent',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: '🎓'
    },
    [AgeCategory.ADULT]: {
      label: 'Adult Learner',
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: '✨'
    }
  };

  const badge = badges[ageCategory];

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${badge.color}`}>
      <span>{badge.icon}</span>
      <span>{badge.label}</span>
    </span>
  );
}

// ============= EXAMPLE 5: PARENT DASHBOARD CHECK =============

export function ParentDashboard({ parentUserId }: { parentUserId: string }) {
  const [linkedChildren, setLinkedChildren] = useState<any[]>([]);

  React.useEffect(() => {
    // Fetch children linked to this parent
    fetchLinkedChildren(parentUserId).then(setLinkedChildren);
  }, [parentUserId]);

  return (
    <div className="p-8">
      <h1 className="mb-6">Parent Dashboard</h1>
      
      <div className="grid gap-4">
        {linkedChildren.map(child => (
          <ChildAccountCard key={child.id} child={child} />
        ))}
      </div>

      <button
        onClick={() => window.location.href = '/link-child'}
        className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg"
      >
        Link Another Child
      </button>
    </div>
  );
}

function ChildAccountCard({ child }: { child: any }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-gray-900">{child.name}</h3>
          <p className="text-gray-600">Age {child.calculatedAge}</p>
        </div>
        <AgeCategoryBadge ageCategory={child.ageCategory} />
      </div>

      {child.ageCategory === AgeCategory.EARLY_LEARNER && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
          <p className="text-blue-900 text-sm">
            ℹ️ As an Early Learner, only you can view {child.name}'s results.
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <button className="flex-1 bg-indigo-600 text-white py-2 rounded-lg">
          View Results
        </button>
        <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg">
          Progress Report
        </button>
      </div>
    </div>
  );
}

// ============= EXAMPLE 6: BACKEND API INTEGRATION =============

// These would be actual API calls in your app

async function saveConsentToBackend(consentStatus: UserConsentStatus) {
  const response = await fetch('/api/consent/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(consentStatus)
  });
  return response.json();
}

async function createUserAccount(userData: any) {
  const response = await fetch('/api/users/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return response.json();
}

async function fetchLinkedChildren(parentUserId: string) {
  const response = await fetch(`/api/parents/${parentUserId}/children`);
  return response.json();
}

// Placeholder user hook
function useUser(userId: string) {
  // In real app, fetch from your state management
  return {
    id: userId,
    name: 'Student',
    ageCategory: AgeCategory.JUNIOR_LEARNER,
    calculatedAge: 13,
    consentStatus: {} as UserConsentStatus
  };
}

// ============= EXAMPLE 7: MIDDLEWARE FOR PROTECTED ROUTES =============

export function ProtectedRoute({ 
  children, 
  requiredPermission 
}: { 
  children: React.ReactNode;
  requiredPermission: keyof import('./types/age-consent-types').FeaturePermissions;
}) {
  const user = useUser('current'); // Get current user
  
  const hasPermission = canPerformAction(
    user.ageCategory,
    requiredPermission
  );

  if (!hasPermission) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-gray-900 mb-4">Access Restricted</h2>
        <p className="text-gray-600 mb-4">
          This feature is not available for your age group.
        </p>
        <AgeCategoryBadge ageCategory={user.ageCategory} />
        <div className="mt-6">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Usage:
export function AccountSettingsPage() {
  return (
    <ProtectedRoute requiredPermission="canModifyProfile">
      <div className="p-8">
        <h1>Account Settings</h1>
        {/* Settings content */}
      </div>
    </ProtectedRoute>
  );
}

// ============= EXAMPLE 8: DATA COLLECTION NOTICE =============

export function DataCollectionNotice({ ageCategory }: { ageCategory: AgeCategory }) {
  const levels = {
    [AgeCategory.EARLY_LEARNER]: {
      level: 'Minimal',
      description: 'We only collect your name, age, and assessment responses.',
      color: 'green'
    },
    [AgeCategory.JUNIOR_LEARNER]: {
      level: 'Standard',
      description: 'We collect your name, age, email, and progress to personalize your experience.',
      color: 'blue'
    },
    [AgeCategory.SENIOR_ADOLESCENT]: {
      level: 'Standard',
      description: 'We collect your name, age, email, and progress to personalize your experience.',
      color: 'purple'
    },
    [AgeCategory.ADULT]: {
      level: 'Full (Optional)',
      description: 'You can choose to enable advanced analytics for detailed insights.',
      color: 'indigo'
    }
  };

  const info = levels[ageCategory];

  return (
    <div className={`bg-${info.color}-50 border border-${info.color}-200 rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">🔒</span>
        <div>
          <h4 className={`text-${info.color}-900 mb-1`}>
            Data Collection: {info.level}
          </h4>
          <p className={`text-${info.color}-800 text-sm`}>
            {info.description}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============= EXAMPLE 9: CONSENT EXPIRATION CHECK =============

export function useConsentValidation(userId: string) {
  const [needsRevalidation, setNeedsRevalidation] = React.useState(false);

  React.useEffect(() => {
    checkConsentExpiration(userId).then(expired => {
      if (expired) {
        setNeedsRevalidation(true);
      }
    });
  }, [userId]);

  return { needsRevalidation };
}

async function checkConsentExpiration(userId: string): Promise<boolean> {
  // Check if consent was given more than 1 year ago
  // Check if terms version has been updated
  // Return true if re-consent is needed
  return false; // Placeholder
}

// ============= EXAMPLE 10: QUICK INTEGRATION CHECKLIST =============

/**
 * INTEGRATION CHECKLIST
 * 
 * [ ] 1. Import ConsentFlow into your signup process
 * [ ] 2. Store UserConsentStatus in your user database
 * [ ] 3. Add ageCategory field to user profile
 * [ ] 4. Implement permission checks using canPerformAction()
 * [ ] 5. Create parent dashboard for ages 6-12
 * [ ] 6. Add parent linking functionality
 * [ ] 7. Implement feature restrictions based on age
 * [ ] 8. Add age category badges to UI
 * [ ] 9. Create data collection notices
 * [ ] 10. Set up consent expiration checks
 * [ ] 11. Test all 4 age categories
 * [ ] 12. Verify COPPA/GDPR compliance
 * 
 * BACKEND REQUIREMENTS:
 * 
 * [ ] 1. Create consent_status table
 * [ ] 2. Add dateOfBirth, ageCategory to users table
 * [ ] 3. Create parent_child_links table
 * [ ] 4. Implement permission middleware
 * [ ] 5. Add consent version tracking
 * [ ] 6. Create parent notification emails
 * [ ] 7. Implement data export for GDPR
 * [ ] 8. Add account deletion with age checks
 * [ ] 9. Create audit logs for consent changes
 * [ ] 10. Set up automated consent expiration checks
 */

export default SignupFlow;
