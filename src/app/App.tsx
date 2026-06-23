import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { Assessment } from './components/Assessment';
import { AssessmentSummary } from './components/AssessmentSummary';
import { CognitiveProfile } from './components/CognitiveProfile';
import { AuthForm } from './components/AuthForm';
import { ForgotPasswordForm } from './components/ForgotPasswordForm';
import { ResetPasswordForm } from './components/ResetPasswordForm';
import { AdminPanel } from './components/AdminPanel';
import { TeacherDashboardNew as TeacherDashboard } from './components/TeacherDashboardNew';
import { StudentDashboard } from './components/StudentDashboard';
import { ParentDashboard } from './components/ParentDashboard';
import { ProfessionalDashboard } from './components/ProfessionalDashboard';
import { OrganizationApp } from './components/OrganizationApp';
import { KidsModeWrapper } from './components/kids/KidsModeWrapper';
import { AuthProvider, useAuth } from './components/AuthContext';
import { Toaster } from './components/ui/sonner';
import { createClient } from './utils/supabase/client';
import { setAuthToken, getUserData } from './utils/api';
import { UserConsentFlow } from './components/consent/UserConsentFlow';
import { OAuthConsentPage } from './components/OAuthConsentPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { TermsOfUsePage } from './components/TermsOfUsePage';
import { ContactPage } from './components/ContactPage';
import { SkillBuilder } from './components/SkillBuilder';
import { SharedProfileView } from './components/SharedProfileView';
import { GamificationDashboard } from './components/GamificationDashboard';
import { TeacherAnalyticsDashboard } from './components/TeacherAnalyticsDashboard';
import { HeadTeacherDashboard } from './components/HeadTeacherDashboard';
import { PrivacyDashboard } from './components/PrivacyDashboard';
import { EngagementDashboard } from './components/EngagementDashboard';
import { ProfileImprovementTracker } from './components/ProfileImprovementTracker';
import { NudgesPanel } from './components/NudgesPanel';
import { CognitiveWorkoutDashboard } from './components/CognitiveWorkoutDashboard';
import { DailyChallengeRunner } from './components/DailyChallengeRunner';
import { LessonViewer } from './components/LessonViewer';
import { AILearningCoach } from './components/AILearningCoach';
import { CognitiveGrowthDashboard } from './components/CognitiveGrowthDashboard';
import { TeacherIntelligenceDashboard } from './components/TeacherIntelligenceDashboard';
import { SchoolAnalyticsDashboard } from './components/SchoolAnalyticsDashboard';
import { PlatformEssentials } from './components/PlatformEssentials';
import { SchoolTeacherStylesView } from './components/SchoolTeacherStylesView';
import { InstitutionRegistration } from './components/InstitutionRegistration';
import { InstitutionDashboard } from './components/InstitutionDashboard';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { runAccountMigration } from './utils/accountMigration';
import { syncGamificationProfile } from './utils/gamification';
import { syncAllUsersFromSupabase } from './utils/supabaseSync';
import { validateInstitutionCode, addMember, validateInviteToken, joinInstitution } from './utils/institution';

import { Button } from './components/ui/button';
import { ArrowLeft } from 'lucide-react';

type ViewType =
  | 'landing'
  | 'consent'
  | 'oauth-consent'
  | 'privacy-policy'
  | 'terms-of-use'
  | 'contact'
  | 'auth'
  | 'forgot-password'
  | 'reset-password'
  | 'organization'
  | 'dashboard'
  | 'assessment'
  | 'summary'
  | 'profile'
  | 'skill-builder'
  | 'gamification'
  | 'shared-profile'
  | 'admin'
  | 'school-admin'
  | 'teacher-analytics'
  | 'privacy-dashboard'
  | 'engagement'
  | 'profile-improvement'
  | 'cognitive-workout'
  | 'lesson-viewer'
  | 'daily-challenge'
  | 'ai-coach'
  | 'cognitive-growth'
  | 'teacher-intelligence'
  | 'school-analytics'
  | 'platform-essentials'
  | 'school-teacher-styles'
  | 'institution-register'
  | 'institution-dashboard';

type AssessmentType = 'learning' | 'thinking' | 'decision';

function AppContent() {
  const { user, loading, refreshUser, impersonatedUser, setImpersonatedUser, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [currentAssessment, setCurrentAssessment] = useState<AssessmentType | null>(null);
  const [assessmentResults, setAssessmentResults] = useState<any>(null);
  const [consentData, setConsentData] = useState<any>(null);
  const [assessmentKey, setAssessmentKey] = useState(0); // Key to force Assessment remount on retake
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Set document title + run one-time account migrations + sync users
  useEffect(() => {
    document.title = 'JotMinds - Discover How You Think';
    runAccountMigration();
    syncAllUsersFromSupabase();
  }, []);

  // Handle Magic Link (already logged in)
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'school_admin' && !impersonatedUser) {
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      const roleParam = searchParams.get('role');
      const inviteToken = searchParams.get('token');
      
      if (code) {
        const processCode = async () => {
          const result = validateInstitutionCode(code);
          if (result.valid && result.institution) {
             const userRole = roleParam === 'teacher' ? 'teacher' : 'student';
             addMember(result.institution.id, user.id, userRole);
             
             // Update user's role if needed or wait for next refresh
             alert(`Success! You have been linked to ${result.institution.name} as an ${userRole === 'teacher' ? 'Educator' : 'Student'}.`);
             
             // Clean URL
             window.history.replaceState({}, document.title, window.location.pathname);
          } else if (result.error !== 'not_found') {
             alert(result.errorMessage);
             window.history.replaceState({}, document.title, window.location.pathname);
          }
        };
        processCode().catch(console.error);
      } else if (inviteToken) {
        const processToken = async () => {
          const result = await validateInviteToken(inviteToken);
          if (result.valid && result.institution) {
             const userRole = result.role || (roleParam === 'teacher' ? 'teacher' : 'student');
             await joinInstitution(result.institution.code, {
                userId: user.id,
                userName: user.name,
                userEmail: user.email,
                role: userRole as 'teacher' | 'student'
             });
             
             alert(`Success! You have been linked to ${result.institution.name} as an ${userRole === 'teacher' ? 'Educator' : 'Student'}.`);
             
             // Clean URL
             const newUrl = window.location.pathname;
             window.history.replaceState({}, document.title, newUrl);
          } else {
             alert(result.error || 'Failed to join institution via invitation link.');
          }
        };
        processToken().catch(console.error);
      }
    }
  }, [user, impersonatedUser]);

  useEffect(() => {
    // Set up auth token on mount
    console.log('[App] ===== MOUNT - Setting up auth =====');
    const setupAuth = async () => {
      // Check if this is a password reset callback
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check for password recovery in the URL hash or path
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      const path = window.location.pathname;

      if (type === 'recovery' || path === '/reset-password') {
        console.log('[App] Password recovery detected, showing reset password page');
        setCurrentView('reset-password');
        // If we want to clean the URL without refreshing
        if (path === '/reset-password') {
          window.history.replaceState({}, document.title, window.location.origin + window.location.hash);
        }
        return;
      }

      const searchParams = new URLSearchParams(window.location.search);
      const mode = searchParams.get('mode');
      
      if (mode === 'signup') {
        console.log('[App] Signup mode detected');
        setCurrentView('auth');
      }

      // Check for /shared/:token route
      const sharedMatch = path.match(/^\/shared\/([a-f0-9-]+)$/);
      if (sharedMatch) {
        console.log('[App] Shared profile view detected');
        setShareToken(sharedMatch[1]);
        setCurrentView('shared-profile');
        return;
      }

      // Check for OAuth consent
      if (path.includes('/oauth/consent')) {
        console.log('[App] OAuth consent flow detected');
        const state = searchParams.get('state');
        if (state) {
          setConsentData({ type: 'oauth', state });
          setCurrentView('oauth-consent');
          return;
        }
      }
      
      // Check for admin session first - don't override with Supabase session
      const adminToken = localStorage.getItem('admin_token');
      const adminUser = localStorage.getItem('admin_user');
      
      console.log('[App] Checking localStorage...');
      console.log('[App] admin_token:', adminToken ? adminToken.substring(0, 30) + '...' : 'NOT FOUND');
      console.log('[App] admin_user:', adminUser ? 'FOUND' : 'NOT FOUND');
      
      if (adminToken) {
        console.log('[App] ✓ Admin token found in localStorage, using it');
        setAuthToken(adminToken);
        return;
      }

      console.log('[App] No admin token, checking Supabase session...');
      console.log('[App] Supabase session:', session ? 'FOUND' : 'NOT FOUND');
      
      if (session?.access_token) {
        console.log('[App] ✓ Supabase session found, using access token');
        setAuthToken(session.access_token);
      } else {
        console.log('[App] No authentication found');
      }
    };
    setupAuth();
  }, []);

  // Check if user is admin and set correct view
  useEffect(() => {
    console.log('[App] useEffect - Checking user role:', user?.role, 'currentView:', currentView, 'impersonatedUser:', impersonatedUser?.id);
    
    if (user) {
      // Sync gamification profile when a user logs in
      syncGamificationProfile(user.id);
    }

    if (user?.role === 'admin' && (currentView === 'landing' || currentView === 'auth')) {
      console.log('[App] Admin detected, routing to admin panel');
      setCurrentView('admin');
    } else if (user?.role === 'admin' && currentView === 'dashboard' && !impersonatedUser) {
      // Force admins to admin panel if they somehow get to dashboard WITHOUT impersonation
      // BUT allow them to view dashboard when impersonating a user
      console.log('[App] ⚠️ Admin in dashboard view without impersonation! Redirecting to admin panel');
      setCurrentView('admin');
    } else if ((user?.role === 'school_admin' || (user?.role === 'organization' && (user?.organizationType === 'Educational Institution' || user?.industrySector === 'Educational Institutions'))) && (currentView === 'landing' || currentView === 'auth' || currentView === 'organization')) {
      console.log('[App] School admin/Educational Institution detected, routing to school admin dashboard');
      setCurrentView('institution-dashboard');
    } else if (user?.role === 'supervisor' || user?.role === 'Supervisor' || user?.role === 'organization' || user?.role === 'Organization') {
      // If it's an Educational Institution, don't force them into the supervisor portal
      if (user?.organizationType !== 'Educational Institution' && user?.industrySector !== 'Educational Institutions' && currentView !== 'organization') {
        console.log('[App] ⚠️ Supervisor detected in main app, redirecting to supervisor portal');
        setCurrentView('organization');
      }
    } else if (user && user.role !== 'admin' && user.role !== 'supervisor' && user.role !== 'Supervisor' && user.role !== 'organization' && user.role !== 'Organization' && (currentView === 'landing' || currentView === 'auth')) {
      console.log('[App] Regular user detected, routing to dashboard');
      setCurrentView('dashboard');
    }
  }, [user, currentView, impersonatedUser]);

  const handleAuthSuccess = async () => {
    console.log('[App] ===== handleAuthSuccess CALLED =====');
    
    // Check if admin user logged in FIRST, before refreshing
    const adminToken = localStorage.getItem('admin_token');
    const adminUser = localStorage.getItem('admin_user');
    
    console.log('[App] Checking admin credentials in handleAuthSuccess...');
    console.log('[App] admin_token:', adminToken ? adminToken.substring(0, 30) + '...' : 'NOT FOUND');
    console.log('[App] admin_user:', adminUser ? 'FOUND' : 'NOT FOUND');
    
    if (adminUser && adminToken) {
      const user = JSON.parse(adminUser);
      console.log('[App] Admin user detected:', user);
      if (user.role === 'admin') {
        console.log('[App] ✓ Setting auth token before navigating to admin panel...');
        setAuthToken(adminToken);
        console.log('[App] ✓ Refreshing user to load admin into state...');
        // Refresh user to ensure admin is loaded into state before navigating
        await refreshUser();
        console.log('[App] ✓ Navigating to admin panel...');
        setCurrentView('admin');
        console.log('[App] ===== Admin login flow complete =====');
        return;
      }
    }
    
    console.log('[App] Regular user login, refreshing user data...');
    // Refresh user first to get the latest user data
    const updatedUser = await refreshUser();

    console.log('[App] ===== Auth success complete, user loaded into context =====');
    
    if (updatedUser) {
      if (updatedUser.role === 'school_admin' || (updatedUser.role === 'organization' && (updatedUser.organizationType === 'Educational Institution' || updatedUser.industrySector === 'Educational Institutions'))) {
        console.log('[App] School admin/Educational Institution detected, routing to institution dashboard');
        setCurrentView('institution-dashboard');
      } else if (updatedUser.role === 'supervisor' || updatedUser.role === 'Supervisor' || updatedUser.role === 'organization' || updatedUser.role === 'Organization') {
        console.log('[App] Supervisor detected, routing to supervisor portal');
        setCurrentView('organization');
      } else {
        console.log('[App] Regular user detected, routing to dashboard');
        setCurrentView('dashboard');
      }
    } else {
      // Fallback
      setCurrentView('dashboard');
    }
  };

  const handleGetStarted = () => {
    setCurrentView('auth');
  };

  const handleSupervisorPortal = () => {
    setCurrentView('organization');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  const handleStartAssessment = (type: AssessmentType) => {
    setCurrentAssessment(type);
    setAssessmentResults(null);
    setAssessmentKey(prev => {
      const newKey = prev + 1;
      console.log(`[App] 🔄 Starting new assessment attempt - Key: ${newKey}, Type: ${type}`);
      return newKey;
    });
    setCurrentView('assessment');
  };

  const handleAssessmentComplete = (results: any) => {
    setAssessmentResults(results);
    setCurrentView('summary');
    // Refresh user data to get updated assessmentsCompleted array
    refreshUser();
  };

  const handleLogout = async () => {
    console.log('[App] Logout requested');
    await signOut();
    setCurrentView('landing');
    setCurrentAssessment(null);
    setAssessmentResults(null);
  };

  const handleBackToDashboard = () => {
    // Check if admin is viewing impersonated user
    if (user?.role === 'admin' && impersonatedUser) {
      // Return to admin panel
      setImpersonatedUser(null);
      setCurrentView('admin');
      return;
    }
    
    // For regular users, go to dashboard
    setCurrentView('dashboard');
    setCurrentAssessment(null);
    setAssessmentResults(null);
    
    // If we were viewing someone else's dashboard, clear impersonation
    if (impersonatedUser) {
      setImpersonatedUser(null);
    }
    refreshUser();
  };

  const handleStartNextAssessment = (type: AssessmentType) => {
    setCurrentAssessment(type);
    setAssessmentResults(null);
    setAssessmentKey(prev => prev + 1); // Increment key to force Assessment remount
    setCurrentView('assessment');
    // Refresh user data to ensure we have latest assessment status
    refreshUser();
  };

  const handleViewProfile = () => {
    setCurrentView('profile');
  };

  const handleViewGamification = () => {
    setCurrentView('gamification');
  };

  const handleViewTeacherAnalytics = () => {
    setCurrentView('teacher-analytics');
  };

  const handleViewSchoolAdmin = () => {
    setCurrentView('school-admin');
  };

  const handleViewPrivacyDashboard = () => {
    setCurrentView('privacy-dashboard');
  };

  const handleViewEngagement = () => {
    setCurrentView('engagement');
  };

  const handleViewProfileImprovement = () => {
    setCurrentView('profile-improvement');
  };

  const handleViewCognitiveWorkout = () => {
    setCurrentView('cognitive-workout');
  };

  const handleViewAICoach = () => {
    setCurrentView('ai-coach');
  };

  const handleViewCognitiveGrowth = () => {
    setCurrentView('cognitive-growth');
  };

  const handleViewTeacherIntelligence = () => {
    setCurrentView('teacher-intelligence');
  };

  const handleViewSchoolAnalytics = () => {
    setCurrentView('school-analytics');
  };

  const handleViewPlatformEssentials = () => {
    setCurrentView('platform-essentials');
  };

  const handleViewSchoolTeacherStyles = () => {
    setCurrentView('school-teacher-styles');
  };

  const handleViewInstitutionDashboard = () => {
    setCurrentView('institution-dashboard');
  };

  const handleViewInstitutionRegister = () => {
    setCurrentView('institution-register');
  };

  const handleStartLesson = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    setCurrentView('lesson-viewer');
  };

  const handleStartDailyChallenge = () => {
    setCurrentView('daily-challenge');
  };

  const handleLessonComplete = () => {
    setCurrentLessonId(null);
    setCurrentView('cognitive-workout');
  };

  // Helper to navigate from nudges
  const handleNudgeNavigate = (route: string) => {
    if (route === '/brain-gym') {
      setCurrentView('skill-builder');
    } else if (route === '/gamification') {
      setCurrentView('gamification');
    } else if (route === '/assessments') {
      setCurrentView('dashboard');
    } else if (route === '/career-exploration') {
      setCurrentView('dashboard');
    } else if (route === '/profile-improvement') {
      setCurrentView('profile-improvement');
    } else if (route === '/cognitive-workout') {
      setCurrentView('cognitive-workout');
    }
  };

  const handleViewAdmin = () => {
    // Ensure admin token is set before navigating to admin panel
    const adminToken = localStorage.getItem('admin_token');
    const adminUser = localStorage.getItem('admin_user');
    
    console.log('[App] handleViewAdmin called');
    console.log('[App] admin_token in localStorage:', adminToken ? adminToken.substring(0, 30) + '...' : 'NOT FOUND');
    console.log('[App] admin_user in localStorage:', adminUser ? 'FOUND' : 'NOT FOUND');
    
    if (adminToken) {
      console.log('[App] Setting admin token in API before navigating to admin panel');
      setAuthToken(adminToken);
    } else {
      console.error('[App] ⚠️  CRITICAL: No admin token found when trying to view admin panel!');
      console.error('[App] User should be logged in as admin first');
    }
    
    setCurrentView('admin');
  };

  const handleViewUserDashboard = async (userId: string) => {
    try {
      const { user: userData } = await getUserData(userId);
      setImpersonatedUser(userData);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error loading user data:', error);
      alert('Failed to load user dashboard');
    }
  };

  const handleViewChildProfile = async (childId: string) => {
    try {
      const { user: childData } = await getUserData(childId);
      setImpersonatedUser(childData);
      setCurrentView('profile');
    } catch (error) {
      console.error('Error loading child profile:', error);
      alert('Failed to load child profile');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#5B7DB1' }}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Handle password reset independently of user state so it displays correctly
  if (currentView === 'reset-password') {
    return <ResetPasswordForm onSuccess={() => setCurrentView('auth')} onBack={() => setCurrentView('auth')} />;
  }

  if (!user) {
    // Show landing page or auth form based on current view
    if (currentView === 'consent') {
      return (
        <UserConsentFlow
          onConsent={(data) => {
            console.log('[App] User consent collected:', data);
            setConsentData(data);
            // Store consent in localStorage (backend should also store it)
            localStorage.setItem('jotminds_consent', JSON.stringify(data));
            // Proceed to auth form
            setCurrentView('auth');
          }}
          onCancel={handleBackToLanding}
        />
      );
    }
    
    if (currentView === 'shared-profile' && shareToken) {
      return <SharedProfileView shareToken={shareToken} />;
    }

    if (currentView === 'privacy-policy') {
      return <PrivacyPolicyPage onBack={handleBackToLanding} />;
    }
    
    if (currentView === 'terms-of-use') {
      return <TermsOfUsePage onBack={handleBackToLanding} />;
    }
    
    if (currentView === 'contact') {
      return <ContactPage onBack={handleBackToLanding} />;
    }
    
    if (currentView === 'auth') {
      return <AuthForm onLogin={handleAuthSuccess} onBack={handleBackToLanding} onForgotPassword={() => setCurrentView('forgot-password')} />;
    }
    
    if (currentView === 'forgot-password') {
      return <ForgotPasswordForm onBack={() => setCurrentView('auth')} onVerified={() => setCurrentView('reset-password')} />;
    }

    if (currentView === 'oauth-consent' && consentData?.state) {
      return (
        <OAuthConsentPage
          state={consentData.state}
          onApprove={() => setCurrentView('landing')}
          onDeny={() => setCurrentView('landing')}
        />
      );
    }

    if (currentView === 'organization') {
      return <OrganizationApp onBackToMain={handleBackToLanding} initialUser={user} />;
    }
    
    return (
      <LandingPage 
        onGetStarted={handleGetStarted}
        onSupervisorPortal={handleSupervisorPortal}
        onViewPrivacyPolicy={() => setCurrentView('privacy-policy')}
        onViewTermsOfUse={() => setCurrentView('terms-of-use')}
        onViewContact={() => setCurrentView('contact')}
      />
    );
  }

  // Determine if we should show nudges (only for logged-in users, not on auth pages)
  const shouldShowNudges = user && !['landing', 'auth', 'forgot-password', 'reset-password', 'consent', 'oauth-consent', 'shared-profile'].includes(currentView);

  // Render based on current view
  const mainContent = (() => { switch (currentView) {
    case 'landing':
      return (
        <LandingPage 
          onGetStarted={handleGetStarted}
          onSupervisorPortal={handleSupervisorPortal}
          onViewPrivacyPolicy={() => setCurrentView('privacy-policy')}
          onViewTermsOfUse={() => setCurrentView('terms-of-use')}
          onViewContact={() => setCurrentView('contact')}
        />
      );

    case 'organization':
      return user ? (
        <OrganizationApp 
          onBackToMain={handleBackToLanding}
          initialUser={user}
          onLogout={handleLogout}
          onViewSettings={() => setIsSettingsOpen(true)}
          onAuthSuccess={handleAuthSuccess}
        />
      ) : (
        <OrganizationApp 
          onBackToMain={handleBackToLanding}
          onLogout={handleLogout}
          onAuthSuccess={handleAuthSuccess}
        />
      );

    case 'assessment':
      return currentAssessment ? (
        <Assessment
          key={assessmentKey}
          type={currentAssessment}
          onComplete={handleAssessmentComplete}
          onBack={handleBackToDashboard}
        />
      ) : null;

    case 'summary':
      return assessmentResults && currentAssessment ? (
        <AssessmentSummary
          type={currentAssessment}
          results={assessmentResults.results}
          insights={assessmentResults.insights}
          onBackToDashboard={handleBackToDashboard}
          onStartNextAssessment={handleStartNextAssessment}
        />
      ) : null;

    case 'profile':
      return (
        <CognitiveProfile onBack={handleBackToDashboard} />
      );

    case 'skill-builder':
      return <SkillBuilder onBack={handleBackToDashboard} />;

    case 'gamification':
      return user ? (
        <div className="min-h-screen bg-background">
          <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-4 py-3">
            <div className="max-w-6xl mx-auto flex items-center gap-3">
              <Button variant="ghost" onClick={handleBackToDashboard} className="flex items-center gap-2">
                <ArrowLeft className="h-5 w-5" />
                Back to Dashboard
              </Button>
              <div className="flex-1">
                <h1 className="font-semibold text-lg">Progress & Achievements</h1>
                <p className="text-xs text-muted-foreground">Track your journey and earn badges</p>
              </div>
            </div>
          </header>
          <main className="max-w-6xl mx-auto p-4">
            <GamificationDashboard userId={user.id} />
          </main>
        </div>
      ) : null;

    case 'admin':
      return (
        <AdminPanel
          onBack={handleBackToDashboard}
          onLogout={handleLogout}
          onViewUserDashboard={handleViewUserDashboard}
        />
      );

    case 'teacher-analytics':
      return user ? (
        <TeacherAnalyticsDashboard
          teacherId={user.id}
          onBack={handleBackToDashboard}
        />
      ) : null;

    case 'school-admin':
      return user ? (
        <HeadTeacherDashboard
          schoolId={user.school || 'school-001'}
          schoolName={user.school || 'Demo School'}
          students={[]}
          teachers={[]}
          classes={[]}
          onBack={handleBackToDashboard}
          user={impersonatedUser || user}
          onViewInstitutionDashboard={handleViewInstitutionDashboard}
        />
      ) : null;

    case 'privacy-dashboard':
      return user ? (
        <PrivacyDashboard
          userId={user.id}
          onBack={handleBackToDashboard}
        />
      ) : null;

    case 'engagement':
      return user ? (
        <EngagementDashboard
          userId={user.id}
          onBack={handleBackToDashboard}
        />
      ) : null;

    case 'profile-improvement':
      return user ? (
        <ProfileImprovementTracker
          userId={user.id}
          onBack={handleBackToDashboard}
        />
      ) : null;

    case 'cognitive-workout':
      return user ? (
        <CognitiveWorkoutDashboard
          userId={user.id}
          onBack={handleBackToDashboard}
          onStartLesson={handleStartLesson}
          onStartChallenge={handleStartDailyChallenge}
        />
      ) : null;

    case 'lesson-viewer':
      return user && currentLessonId ? (
        <LessonViewer
          userId={user.id}
          lessonId={currentLessonId}
          onComplete={handleLessonComplete}
          onBack={() => setCurrentView('cognitive-workout')}
        />
      ) : null;

    case 'daily-challenge':
      return user ? (
        <DailyChallengeRunner
          userId={user.id}
          onBack={handleBackToDashboard}
          onComplete={handleBackToDashboard}
        />
      ) : null;

    case 'ai-coach':
      return user ? (
        <AILearningCoach
          userId={user.id}
          onBack={handleBackToDashboard}
        />
      ) : null;

    case 'cognitive-growth':
      return user ? (
        <CognitiveGrowthDashboard
          user={impersonatedUser || user}
          onBack={handleBackToDashboard}
        />
      ) : null;

    case 'teacher-intelligence':
      return user ? (
        <TeacherIntelligenceDashboard
          user={impersonatedUser || user}
          onBack={handleBackToDashboard}
        />
      ) : null;

    case 'school-analytics':
      return user ? (
        <SchoolAnalyticsDashboard
          user={impersonatedUser || user}
          onBack={handleBackToDashboard}
        />
      ) : null;

    case 'platform-essentials':
      return user ? (
        <PlatformEssentials
          user={impersonatedUser || user}
          onBack={handleBackToDashboard}
          onNavigate={(view) => {
            const allowed: ViewType[] = ['dashboard', 'skill-builder', 'ai-coach', 'cognitive-growth', 'gamification', 'engagement', 'privacy-dashboard'];
            setCurrentView(allowed.includes(view as ViewType) ? (view as ViewType) : 'dashboard');
          }}
        />
      ) : null;

    case 'school-teacher-styles':
      return user ? (
        <SchoolTeacherStylesView
          admin={impersonatedUser || user}
          onBack={handleBackToDashboard}
        />
      ) : null;

    case 'institution-register':
      return user ? (
        <InstitutionRegistration
          user={impersonatedUser || user}
          onComplete={() => setCurrentView('institution-dashboard')}
          onBack={handleBackToDashboard}
        />
      ) : null;

    case 'institution-dashboard':
      return user ? (
        <InstitutionDashboard
          user={impersonatedUser || user}
          onLogout={handleBackToDashboard}
          onRegisterNew={handleViewInstitutionRegister}
        />
      ) : null;

    case 'dashboard':
    default:
      // Route to role-specific dashboards
      const displayUser = impersonatedUser || user;
      
      // Determine if we should logout or go back
      const logoutHandler = impersonatedUser ? handleBackToDashboard : handleLogout;
      
      // Normalize role to lowercase for comparison (handles old accounts with capitalized roles)
      const normalizedRole = displayUser.role?.toLowerCase();
      
      // Supervisors should not access dashboards - redirect to supervisor portal
      if (normalizedRole === 'supervisor' || normalizedRole === 'organization') {
        // Educational Institutions should see the Institution Dashboard
        if (displayUser?.organizationType === 'Educational Institution' || displayUser?.industrySector === 'Educational Institutions') {
          return (
            <InstitutionDashboard
              user={displayUser}
              onLogout={logoutHandler}
              onRegisterNew={handleViewInstitutionRegister}
            />
          );
        }
        
        console.log('[App] Supervisor trying to access dashboard, redirecting to supervisor portal');
        return (
          <OrganizationApp 
            onBackToMain={handleBackToLanding} 
            initialUser={displayUser} 
            onLogout={logoutHandler}
            onViewSettings={() => setIsSettingsOpen(true)}
            onAuthSuccess={handleAuthSuccess}
          />
        );
      }
      
      if (normalizedRole === 'school_admin') {
        return (
          <InstitutionDashboard
            user={displayUser}
            onLogout={logoutHandler}
            onRegisterNew={handleViewInstitutionRegister}
          />
        );
      }

      if (normalizedRole === 'teacher') {
        return (
          <TeacherDashboard
            user={displayUser}
            onLogout={logoutHandler}
            onViewAnalytics={handleViewTeacherAnalytics}
            onViewPrivacy={handleViewPrivacyDashboard}
            onViewEngagement={handleViewEngagement}
            onViewTeacherIntelligence={handleViewTeacherIntelligence}
            onViewSchoolAnalytics={handleViewSchoolAnalytics}
            onViewPlatformEssentials={handleViewPlatformEssentials}
            onStartAssessment={(type) => { handleStartAssessment(type); }}
            onViewSettings={() => setIsSettingsOpen(true)}
          />
        );
      }

      if (normalizedRole === 'student') {
        // Check if student should use Kids Mode (ages 6-10)
        // Calculate age if not already present
        let age = displayUser.age;
        if (!age && displayUser.dateOfBirth) {
          const birthDate = new Date(displayUser.dateOfBirth);
          const today = new Date();
          age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
        }
        
        const shouldUseKidsMode = age && age >= 6 && age <= 10;
        console.log('[App] Student age check:', { age, dateOfBirth: displayUser.dateOfBirth, shouldUseKidsMode });
        
        if (shouldUseKidsMode) {
          return (
            <KidsModeWrapper
              user={displayUser}
              onLogout={logoutHandler}
            />
          );
        }
        
        return (
          <StudentDashboard
            user={displayUser}
            onLogout={logoutHandler}
          />
        );
      }
      
      if (normalizedRole === 'parent') {
        return (
          <ParentDashboard
            user={displayUser}
            onLogout={logoutHandler}
          />
        );
      }
      
      if (normalizedRole === 'professional' || normalizedRole === 'professional/organization') {
        return (
          <ProfessionalDashboard
            user={displayUser}
            onLogout={logoutHandler}
          />
        );
      }
      
      // Fallback to general dashboard for other roles
      return (
        <Dashboard
          onStartAssessment={handleStartAssessment}
          onViewProfile={handleViewProfile}
          onViewAdmin={user.role === 'admin' ? handleViewAdmin : undefined}
          onViewChildProfile={handleViewChildProfile}
          onViewSkillBuilder={() => setCurrentView('skill-builder')}
          onViewGamification={handleViewGamification}
          onViewEngagement={handleViewEngagement}
          onViewPrivacyDashboard={handleViewPrivacyDashboard}
          onViewProfileImprovement={handleViewProfileImprovement}
          onViewCognitiveWorkout={handleViewCognitiveWorkout}
          onViewAICoach={handleViewAICoach}
          onViewSettings={() => setIsSettingsOpen(true)}
        />
      );
  }
  })();

  return (
    <>
      {mainContent}
      {shouldShowNudges && user && (
        <NudgesPanel userId={user.id} onNavigate={handleNudgeNavigate} />
      )}
      <ProfileSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onProfileUpdate={(updatedUser) => {
          // If we had a setUser function exposed via context, we'd call it here
          // For now, since user comes from auth state, we trigger a re-fetch or reload
          // The best way in this app structure is to reload window since it's an SPA
          window.location.reload();
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}