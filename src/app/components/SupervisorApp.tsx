import { useState, useEffect } from 'react';
import { User } from '../types';
import { getCurrentUser, saveCurrentUser } from '../utils/storage';
import { SupervisorAuthForm } from './SupervisorAuthForm';
import { SupervisorDashboard } from './SupervisorDashboard';
import { Toaster } from './ui/sonner';
import { createClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface SupervisorAppProps {
  onBackToMain: () => void;
}

export function SupervisorApp({ onBackToMain }: SupervisorAppProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing supervisor session with Supabase
    checkSupabaseSession();
  }, []);

  const checkSupabaseSession = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        console.log('[SupervisorApp] Found active Supabase session');
        
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
          console.log('[SupervisorApp] Full response data:', responseData);
          
          // The backend returns { success: true, user: {...} }
          const userData = responseData.user || responseData;
          console.log('[SupervisorApp] Extracted user data:', userData);
          
          // Only restore session if user is a supervisor
          if (userData.role === 'Supervisor' || userData.role === 'supervisor') {
            console.log('[SupervisorApp] Restoring supervisor session');
            const user: User = {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              role: userData.role,
              organizationName: userData.organizationName,
              organizationType: userData.organizationType,
              position: userData.position,
              phone: userData.phone || '',
              school: '',
              createdAt: userData.createdAt
            };
            setCurrentUser(user);
            saveCurrentUser(user);
          } else {
            console.log('[SupervisorApp] User is not a supervisor, clearing session');
            await supabase.auth.signOut();
          }
        } else {
          console.log('[SupervisorApp] Failed to fetch user profile, clearing session');
          await supabase.auth.signOut();
        }
      } else {
        console.log('[SupervisorApp] No active Supabase session');
      }
    } catch (error) {
      console.error('[SupervisorApp] Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    saveCurrentUser(user);
  };

  const handleLogout = async () => {
    // Clear Supabase session
    const supabase = createClient();
    await supabase.auth.signOut();
    
    // Clear user session in storage
    saveCurrentUser(null);
    
    // Navigate back to main app (which will handle state cleanup)
    onBackToMain();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading Supervisor Portal...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <SupervisorAuthForm onLogin={handleLogin} onBackToMain={onBackToMain} />;
  }

  return (
    <>
      <SupervisorDashboard user={currentUser} onLogout={handleLogout} />
      <Toaster />
    </>
  );
}