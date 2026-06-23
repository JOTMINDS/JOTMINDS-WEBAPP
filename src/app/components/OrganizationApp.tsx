import { useState, useEffect } from 'react';
import { User } from '../types';
import { getCurrentUser, saveCurrentUser } from '../utils/storage';
import { OrganizationAuthForm } from './OrganizationAuthForm';
import { SupervisorDashboard } from './SupervisorDashboard';
import { Toaster } from './ui/sonner';
import { createClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { setAuthToken, clearAuthToken } from '../utils/api';

interface OrganizationAppProps {
  onBackToMain: () => void;
  initialUser?: User | null;
  onLogout?: () => void;
  onViewSettings?: () => void;
  onAuthSuccess?: () => void;
}

function isSchoolAdmin(userData: any): boolean {
  const role = (userData?.role || '').toLowerCase();
  return (
    role === 'school_admin' ||
    userData?.organizationType === 'Educational Institution' ||
    userData?.industrySector === 'Educational Institutions'
  );
}

function isOrgOrSupervisor(userData: any): boolean {
  const role = (userData?.role || '').toLowerCase();
  return role === 'organization' || role === 'supervisor';
}

export function OrganizationApp({ onBackToMain, initialUser, onLogout, onViewSettings, onAuthSuccess }: OrganizationAppProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser || null);
  const [isLoading, setIsLoading] = useState(!initialUser);

  useEffect(() => {
    if (initialUser) {
      setCurrentUser(initialUser);
      setIsLoading(false);
      return;
    }
    // Check for existing organization session with Supabase
    checkSupabaseSession();
  }, [initialUser]);

  const checkSupabaseSession = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.log('[OrganizationApp] No active Supabase session');
        return;
      }

      console.log('[OrganizationApp] Found active Supabase session');

      // Fetch user profile from backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847/session`,
        {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        }
      );

      if (!response.ok) {
        console.log('[OrganizationApp] Failed to fetch user profile, clearing session');
        await supabase.auth.signOut();
        clearAuthToken();
        return;
      }

      const responseData = await response.json();
      const userData = responseData.user || responseData;
      console.log('[OrganizationApp] Session role:', userData.role);

      setAuthToken(session.access_token);

      // school_admin / Educational Institution → hand off to App.tsx
      if (isSchoolAdmin(userData)) {
        console.log('[OrganizationApp] school_admin detected, handing off to App.tsx');
        if (onAuthSuccess) {
          onAuthSuccess();
        }
        return;
      }

      // Regular org/supervisor
      if (isOrgOrSupervisor(userData)) {
        const user: User = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: 'organization',
          organizationName: userData.organizationName,
          organizationType: userData.organizationType,
          position: userData.position,
          phone: userData.phone || '',
          school: '',
          createdAt: userData.createdAt
        };
        setCurrentUser(user);
        saveCurrentUser(user);
        return;
      }

      // Unknown role — clear and show login form
      console.log('[OrganizationApp] Unrecognised role, clearing session:', userData.role);
      await supabase.auth.signOut();
      clearAuthToken();
    } catch (error) {
      console.error('[OrganizationApp] Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (user: User) => {
    // school_admin → immediately hand off to App.tsx; do NOT set currentUser
    if (user.role === 'school_admin' || isSchoolAdmin(user)) {
      saveCurrentUser(user);
      if (onAuthSuccess) {
        onAuthSuccess();
      }
      return;
    }

    // Regular org/supervisor
    setCurrentUser(user);
    saveCurrentUser(user);
  };

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
      return;
    }

    const supabase = createClient();
    await supabase.auth.signOut();
    saveCurrentUser(null);
    clearAuthToken();
    onBackToMain();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Organization Portal...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <OrganizationAuthForm onLogin={handleLogin} onBackToMain={onBackToMain} />
        <Toaster />
      </>
    );
  }

  // Routing spinner if school_admin somehow ended up here
  if (isSchoolAdmin(currentUser)) {
    if (onAuthSuccess) onAuthSuccess();
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Routing to Educational Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SupervisorDashboard user={currentUser} onLogout={handleLogout} onViewSettings={onViewSettings} />
      <Toaster />
    </>
  );
}