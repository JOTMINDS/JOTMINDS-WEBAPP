import { useState, useEffect } from 'react';
import { User } from '../../types/index';
import { KidsDashboard } from './KidsDashboard';
import { KidsAssessment } from './KidsAssessment';
import { KidsResults } from './KidsResults';
import { ParentPINGate } from './ParentPINGate';
import { ParentPINSetup } from './ParentPINSetup';
import { KidsCognitiveProfile } from './KidsCognitiveProfile';
import { useAuth } from '../AuthContext';
import { updateUserProfile } from '../../utils/api';

interface KidsModeWrapperProps {
  user: User;
  onLogout: () => void;
}

type KidsView = 'dashboard' | 'assessment' | 'results' | 'parent-profile';
type AssessmentType = 'learning' | 'thinking' | 'decision' | 'problem-solving' | 'social-thinking';

export function KidsModeWrapper({ user, onLogout }: KidsModeWrapperProps) {
  const [currentView, setCurrentView] = useState<KidsView>('dashboard');
  const [currentAssessment, setCurrentAssessment] = useState<AssessmentType | null>(null);
  const [assessmentResults, setAssessmentResults] = useState<any>(null);
  const [showParentGate, setShowParentGate] = useState(false);
  const [showParentGateForProfile, setShowParentGateForProfile] = useState(false);
  const [showPINSetup, setShowPINSetup] = useState(false);
  const { refreshUser } = useAuth();

  // Determine if user should see Kids Mode
  const isKidsMode = user.age && user.age >= 6 && user.age <= 10;

  // Check if user needs to set up a PIN on first load
  useEffect(() => {
    if (!user.parentPin) {
      // Show PIN setup for new users
      setShowPINSetup(true);
    }
  }, [user.parentPin]);

  // Force light mode for Kids Mode (remove dark class from html element)
  useEffect(() => {
    const htmlElement = document.documentElement;
    const hadDarkClass = htmlElement.classList.contains('dark');
    
    // Remove dark mode when entering Kids Mode
    htmlElement.classList.remove('dark');
    
    // Restore dark mode when leaving Kids Mode
    return () => {
      if (hadDarkClass) {
        htmlElement.classList.add('dark');
      }
    };
  }, []);

  const handleStartAssessment = (type: AssessmentType) => {
    setCurrentAssessment(type);
    setCurrentView('assessment');
  };

  const handleAssessmentComplete = (results: any) => {
    setAssessmentResults(results);
    setCurrentView('results');
  };

  const handleBackToDashboard = async () => {
    // Refresh user data to ensure assessmentsCompleted is up to date
    try {
      await refreshUser();
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
    
    setCurrentView('dashboard');
    setCurrentAssessment(null);
    setAssessmentResults(null);
  };

  const handleStartNextAssessment = (type: AssessmentType) => {
    setCurrentAssessment(type);
    setAssessmentResults(null);
    setCurrentView('assessment');
  };

  const handleLogoutAttempt = () => {
    // Show parent PIN gate before allowing logout
    setShowParentGate(true);
  };

  const handleParentAccessAttempt = () => {
    // Show parent PIN gate before showing profile
    setShowParentGateForProfile(true);
  };

  const handleParentUnlock = () => {
    setShowParentGate(false);
    onLogout();
  };

  const handleParentProfileUnlock = () => {
    setShowParentGateForProfile(false);
    setCurrentView('parent-profile');
  };

  const handlePINSetupComplete = (pin: string) => {
    // Update user profile with new PIN
    updateUserProfile({ parentPin: pin })
      .then(() => {
        // Refresh user data to reflect new PIN
        refreshUser();
        // Hide PIN setup
        setShowPINSetup(false);
      })
      .catch((error) => {
        console.error('Failed to set up PIN:', error);
      });
  };

  // Render based on current view
  const renderContent = () => {
    switch (currentView) {
      case 'assessment':
        return currentAssessment ? (
          <KidsAssessment
            type={currentAssessment}
            onComplete={handleAssessmentComplete}
            onBack={handleBackToDashboard}
          />
        ) : null;

      case 'results':
        return assessmentResults && currentAssessment ? (
          <KidsResults
            type={currentAssessment}
            results={assessmentResults.results}
            insights={assessmentResults.insights}
            onBackToDashboard={handleBackToDashboard}
            onStartNext={handleStartNextAssessment}
            user={user}
          />
        ) : null;

      case 'parent-profile':
        return (
          <KidsCognitiveProfile
            user={user}
            onClose={handleBackToDashboard}
            isParentView={false}
          />
        );

      case 'dashboard':
      default:
        return (
          <>
            <KidsDashboard
              user={user}
              onStartAssessment={handleStartAssessment}
              onLogout={handleLogoutAttempt}
              onParentAccess={handleParentAccessAttempt}
            />
            
            {/* Parent PIN Gate for Logout */}
            {showParentGate && (
              <ParentPINGate
                onUnlock={handleParentUnlock}
                onCancel={() => setShowParentGate(false)}
                title="Parent Verification"
                description="Enter parent PIN to exit Kids Mode"
                userPin={user.parentPin}
              />
            )}

            {/* Parent PIN Gate for Profile Access */}
            {showParentGateForProfile && (
              <ParentPINGate
                onUnlock={handleParentProfileUnlock}
                onCancel={() => setShowParentGateForProfile(false)}
                title="Parent Access"
                description="Enter parent PIN to view full cognitive profile"
                userPin={user.parentPin}
              />
            )}
            
            {/* Parent PIN Setup */}
            {showPINSetup && (
              <ParentPINSetup
                onComplete={handlePINSetupComplete}
                onSkip={() => setShowPINSetup(false)}
                title="Set Up Parent PIN"
                description="Create a 4-digit PIN to protect Kids Mode"
              />
            )}
          </>
        );
    }
  };

  // Wrap everything in a light-mode forced container
  return (
    <div className="kids-mode-wrapper" style={{ colorScheme: 'light' }}>
      {renderContent()}
    </div>
  );
}

// Helper function to determine if user should use Kids Mode
export function shouldUseKidsMode(user: User | null): boolean {
  if (!user) return false;
  
  // Students aged 6-10 should use Kids Mode
  if (user.role?.toLowerCase() === 'student' && user.age) {
    return user.age >= 6 && user.age <= 10;
  }
  
  return false;
}