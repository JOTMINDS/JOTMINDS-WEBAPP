import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import { setAuthToken, clearAuthToken, getSession } from '../utils/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationName?: string;
  assessmentsCompleted?: string[]; // Array of completed assessment types (e.g., ['kolb', 'sternberg'])
  assessments?: any[]; // Legacy full assessment objects
  cognitiveProfile?: any;
  dateOfBirth?: string;
  age?: number;
  teacherId?: string;
  teacherName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  impersonatedUser: User | null;
  setImpersonatedUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth: string): number => {
  if (!dateOfBirth) return 0;
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Helper to enrich user data with calculated age
const enrichUserWithAge = (userData: any): User => {
  if (userData.dateOfBirth && !userData.age) {
    userData.age = calculateAge(userData.dateOfBirth);
  }
  return userData;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async (): Promise<User | null> => {
    try {
      console.log('[AuthContext] ===== REFRESH USER STARTED =====');
      
      // Check for admin session first
      const adminUser = localStorage.getItem('admin_user');
      const adminToken = localStorage.getItem('admin_token');
      
      console.log('[AuthContext] Admin user in localStorage:', adminUser ? 'FOUND' : 'NOT FOUND');
      console.log('[AuthContext] Admin token in localStorage:', adminToken ? adminToken.substring(0, 30) + '...' : 'NOT FOUND');
      
      if (adminUser && adminToken) {
        const parsedUser = JSON.parse(adminUser);
        const enrichedUser = enrichUserWithAge(parsedUser);
        console.log('[AuthContext] ✓ Setting admin user:', enrichedUser);
        setUser(enrichedUser);
        
        console.log('[AuthContext] Calling setAuthToken with admin token...');
        setAuthToken(adminToken);
        console.log('[AuthContext] ✓ Admin user session established');
        
        setLoading(false);
        return enrichedUser;
      }

      console.log('[AuthContext] No admin session, checking Supabase...');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('[AuthContext] Supabase session:', session ? 'FOUND' : 'NOT FOUND');
      
      if (session?.access_token) {
        console.log('[AuthContext] Setting Supabase token...');
        setAuthToken(session.access_token);
        
        try {
          console.log('[AuthContext] Fetching user data from backend...');
          const userData = await getSession();
          console.log('[AuthContext] User data received:', userData.user);
          const enrichedUser = enrichUserWithAge(userData.user);
          console.log('[AuthContext] User data enriched with age:', enrichedUser.age);
          setUser(enrichedUser);
          return enrichedUser;
        } catch (sessionError: any) {
          // Handle all errors gracefully - could be network issues, 401, or server not ready
          console.log('[AuthContext] Could not fetch session from backend:', sessionError.message);
          
          // If it's just unauthorized, that's expected
          if (sessionError.message === 'Unauthorized' || sessionError.message?.includes('401')) {
            console.log('[AuthContext] Session fetch returned 401 - no active session (expected for logged out users)');
          } else if (sessionError.message === 'Failed to fetch' || sessionError.message?.includes('fetch')) {
            // Network error - server might not be ready yet, but don't sign out
            console.log('[AuthContext] Network error connecting to server - will retry later');
            // Don't sign out, just set user to null and keep trying
            setUser(null);
            setLoading(false);
            return;
          } else {
            console.error('[AuthContext] ✗ Error fetching session from backend:', sessionError);
          }
          
          if (!sessionError.message?.includes('fetch')) {
            console.log('[AuthContext] Clearing invalid session...');
            await supabase.auth.signOut();
          }
          
          console.log('[AuthContext] Clearing session due to error');
          setUser(null);
          return null;
        }
      } else {
        console.log('[AuthContext] No access token found');
        setUser(null);
        setAuthToken(null);
        return null;
      }
    } catch (error) {
      console.error('[AuthContext] Error refreshing user:', error);
      setUser(null);
      setAuthToken(null);
      return null;
    } finally {
      setLoading(false);
      console.log('[AuthContext] ===== REFRESH USER COMPLETE =====');
    }
  };

  useEffect(() => {
    refreshUser();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[AuthContext] ===== AUTH STATE CHANGE =====');
      console.log('[AuthContext] Event:', _event);
      console.log('[AuthContext] Session:', session ? 'EXISTS' : 'NULL');
      
      // Don't update if we have an admin session
      const adminUser = localStorage.getItem('admin_user');
      const adminToken = localStorage.getItem('admin_token');
      
      console.log('[AuthContext] Admin user in localStorage:', adminUser ? 'FOUND' : 'NOT FOUND');
      console.log('[AuthContext] Admin token in localStorage:', adminToken ? 'FOUND' : 'NOT FOUND');
      
      if (adminUser && adminToken) {
        console.log('[AuthContext] 🛡️  Admin session active - ignoring Supabase auth state change');
        // Keep admin session active - don't let Supabase override it
        return;
      }
      
      console.log('[AuthContext] No admin session, processing Supabase auth change...');
      if (session?.access_token) {
        console.log('[AuthContext] Setting Supabase token from auth change');
        setAuthToken(session.access_token);
        refreshUser();
      } else {
        console.log('[AuthContext] No session, clearing user');
        setUser(null);
        setAuthToken(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    // Clear admin user from localStorage
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
    
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setImpersonatedUser(null);
    clearAuthToken();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser, impersonatedUser, setImpersonatedUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};