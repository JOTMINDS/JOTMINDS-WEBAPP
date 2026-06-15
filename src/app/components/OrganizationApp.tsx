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

      if (session) {
        console.log('[OrganizationApp] Found active Supabase session');
        
        // Fetch user profile from backend
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-fc8eb847/session`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          }
        );

        if (response.ok) {
          const responseData = await response.json();
          console.log('[OrganizationApp] Full response data:', responseData);
          
          // The backend returns { success: true, user: {...} }
          const userData = responseData.user || responseData;
          console.log('[OrganizationApp] Extracted user data:', userData);
          
          // Only restore session if user is an organization
          if (userData.role === 'organization' || userData.role === 'supervisor' || userData.role === 'Supervisor') {
            console.log('[OrganizationApp] Restoring organization session');
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
            setAuthToken(session.access_token);
            
            // If they are an Educational Institution, pass control back to App.tsx
            if (user.role === 'school_admin' || user.organizationType === 'Educational Institution' || user.industrySector === 'Educational Institutions') {
              if (onAuthSuccess) {
                onAuthSuccess();
                return;
              }
            }
          } else {
            console.log('[OrganizationApp] User is not an organization, clearing session. Role:', userData.role);
            await supabase.auth.signOut();
            clearAuthToken();
          }
        } else {
          console.log('[OrganizationApp] Failed to fetch user profile, clearing session');
          await supabase.auth.signOut();
          clearAuthToken();
        }
      } else {
        console.log('[OrganizationApp] No active Supabase session');
      }
    } catch (error) {
      console.error('[OrganizationApp] Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    saveCurrentUser(user);
    
    // If they are an Educational Institution, pass control back to App.tsx
    if (user.role === 'school_admin' || user.organizationType === 'Educational Institution' || user.industrySector === 'Educational Institutions') {
      if (onAuthSuccess) {
        onAuthSuccess();
        return;
      }
    }
  };

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
      return;
    }

    // Clear Supabase session
    const supabase = createClient();
    await supabase.auth.signOut();
    
    // Clear user session in storage
    saveCurrentUser(null);
    clearAuthToken();
    
    // Navigate back to main app (which will handle state cleanup)
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

  return (
    <>
      <SupervisorDashboard user={currentUser} onLogout={handleLogout} onViewSettings={onViewSettings} />
      <Toaster />
    </>
  );
}