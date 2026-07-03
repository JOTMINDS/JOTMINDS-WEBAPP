import { projectId, publicAnonKey } from './supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847`;

let authToken: string | null = null;

// Initialize auth token from localStorage synchronously on module load
const initializeToken = () => {
  try {
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      authToken = adminToken;
      console.log('[API] Initialized with admin token from localStorage:', adminToken.substring(0, 30) + '...');
    }
  } catch (error) {
    console.error('[API] Error initializing token from localStorage:', error);
  }
};

// Call initialization immediately
if (typeof window !== 'undefined') {
  initializeToken();
}

export const setAuthToken = (token: string | null) => {
  console.log('[API] setAuthToken called with:', token ? `${token.substring(0, 30)}...` : 'null');
  
  // CRITICAL: Don't allow clearing admin token unless explicitly done
  if (token === null) {
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      console.log('[API] ⚠️  Attempted to set token to null, but admin token exists in localStorage');
      console.log('[API] 🛡️  Protecting admin token from being cleared');
      console.log('[API] Stack trace:', new Error().stack);
      authToken = adminToken;
      return;
    }
  }
  
  authToken = token;
  console.log('[API] ✓ Token set to:', authToken ? `${authToken.substring(0, 30)}...` : 'null');
};

export const clearAuthToken = () => {
  console.log('[API] clearAuthToken called - forcing token clear');
  authToken = null;
  console.log('[API] ✓ Token cleared');
};

export const getAuthToken = () => {
  console.log('[API] getAuthToken called, current token:', authToken ? `${authToken.substring(0, 30)}...` : 'null');
  
  // If token is null, check localStorage as a fallback
  if (!authToken) {
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      console.log('[API] ⚙️ Token was null, but found admin token in localStorage, restoring...');
      authToken = adminToken;
      console.log('[API] ✓ Token restored from localStorage');
    }
  }
  
  return authToken;
};

const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
  // For admin endpoints, always re-check localStorage for admin token
  if (endpoint.startsWith('/admin/')) {
    const adminToken = localStorage.getItem('admin_token');
    console.log('[API] Admin endpoint detected, localStorage admin_token:', adminToken ? adminToken.substring(0, 30) + '...' : 'NOT FOUND');
    if (adminToken) {
      console.log('[API] Setting admin token from localStorage for admin endpoint');
      authToken = adminToken;
    } else {
      console.error('[API] ⚠️ CRITICAL: Admin endpoint accessed but no admin_token in localStorage!');
      console.error('[API] This will result in 401 Unauthorized error');
      console.error('[API] Stack trace:', new Error().stack);
    }
  }
  
  const token = authToken || publicAnonKey;
  const isAdminToken = token?.startsWith('admin-token-');
  const isAnonKey = token === publicAnonKey;
  
  console.log(`[API] Making request to ${endpoint}`);
  console.log(`[API] Current authToken variable:`, authToken ? authToken.substring(0, 30) + '...' : 'NULL');
  console.log(`[API] Token to use:`, token?.substring(0, 30) + '...');
  console.log(`[API] Token type: ${isAdminToken ? 'ADMIN TOKEN' : isAnonKey ? 'ANON KEY (FALLBACK)' : 'SUPABASE JWT'}`);
  
  // Use custom header for admin tokens to bypass Supabase JWT validation
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (isAdminToken) {
    // Admin token goes in custom header to bypass Supabase validation
    headers['X-Admin-Token'] = token;
    // Still send anon key in Authorization so Supabase lets the request through
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
    console.log('[API] Using X-Admin-Token header for admin authentication');
  } else {
    // Regular Supabase JWT in Authorization header
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    
    if (!response.ok) {
      // 401 on /session endpoint is expected for logged out users - don't log as error
      if (endpoint === '/session' && response.status === 401) {
        console.log(`[API] Session endpoint returned 401 (no active session - expected for logged out users)`);
      } else if (response.status >= 400 && response.status < 500) {
        // 4xx errors are client errors (validation, unauthorized, etc) - log as warning
        console.warn(`[API] Client error on ${endpoint}:`, data);
        console.warn(`[API] Response status: ${response.status}`);
      } else {
        // 5xx errors are server errors - log as error
        console.error(`[API] Error on ${endpoint}:`, data);
        console.error(`[API] Response status: ${response.status}`);
      }
      throw new Error(data.error || 'API request failed');
    }
    
    console.log(`[API] Success on ${endpoint}`);
    return data;
  } catch (error: any) {
    // Handle network errors specifically
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      console.error(`[API] Network error on ${endpoint} - server may not be ready`);
      throw new Error('Failed to fetch');
    }
    throw error;
  }
};

export interface Organization {
  code: string;
  name: string;
  type: string;
  industrySector?: string;
  createdAt: string;
  createdBy: string;
  logoUrl?: string;
  isActive?: boolean;
}

export const signup = async (userData: {
  email: string;
  password: string;
  name: string;
  role: string;
  organizationName?: string;
  organizationType?: string;
  position?: string;
  phone?: string;
  secondaryEmail?: string;
  secondaryPhone?: string;
  school?: string;
  educationLevel?: string;
  age?: number;
  organizationCode?: string;
  teacherId?: string;
  teacherName?: string;
  hasConsented?: boolean;
  consentType?: string;
  consentDate?: string;
  dateOfBirth?: string;
  inviteToken?: string;
}) => {
  return makeRequest('/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const signin = async (email: string, password: string) => {
  const response = await makeRequest('/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  // Store the session token if signin was successful
  if (response.session?.access_token) {
    console.log('[API] Signin successful, storing access token');
    setAuthToken(response.session.access_token);
  }
  
  return response;
};

export const getSession = async () => {
  return makeRequest('/session');
};

// User Profile APIs
export const updateUserProfile = async (updates: Partial<{
  parentPin: string;
  parentName: string;
  name: string;
  phone: string;
  school: string;
  dateOfBirth: string;
  secondaryEmail: string;
  secondaryPhone: string;
  classCode: string;
  avatarUrl: string;
}>) => {
  return makeRequest('/user/profile', {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
};

// Assessment APIs
export const saveProgress = async (assessmentType: string, currentQuestion: number, answers: any[], completed: boolean) => {
  return makeRequest('/assessment/progress', {
    method: 'POST',
    body: JSON.stringify({ assessmentType, currentQuestion, answers, completed }),
  });
};

export const getProgress = async (assessmentType: string) => {
  return makeRequest(`/assessment/progress/${assessmentType}`);
};

export const submitAssessment = async (
  assessmentType: string, 
  answers: any[], 
  results: any,
  strengths: string[],
  weaknesses: string[],
  recommendations: string[]
) => {
  console.log('[API] submitAssessment called:', { assessmentType, answersCount: answers.length, results });
  console.log('[API] Current auth token:', getAuthToken() ? getAuthToken()!.substring(0, 30) + '...' : 'NULL');
  return makeRequest('/assessment/submit', {
    method: 'POST',
    body: JSON.stringify({ assessmentType, answers, results, strengths, weaknesses, recommendations }),
  });
};

export const getAssessmentResults = async (assessmentType: string) => {
  return makeRequest(`/assessment/results/${assessmentType}`);
};

export const getAllAssessmentResults = async (userIds?: string[] | string) => {
  if (userIds) {
    const ids = Array.isArray(userIds) ? userIds.join(',') : userIds;
    return makeRequest(`/assessment/results?userIds=${encodeURIComponent(ids)}`);
  }
  return makeRequest('/assessment/results');
};

export const getGamificationProfileAPI = async (userId: string) => {
  return makeRequest(`/gamification/${userId}`);
};

export const updateGamificationProfileAPI = async (profile: any) => {
  return makeRequest('/gamification/update', {
    method: 'POST',
    body: JSON.stringify({ profile }),
  });
};

export const saveCognitiveProfile = async (profile: any) => {
  return makeRequest('/cognitive-profile', {
    method: 'POST',
    body: JSON.stringify({ profile }),
  });
};

// Admin APIs
export const getAllUsers = async () => {
  return makeRequest('/admin/users');
};

export const getAdminStats = async () => {
  return makeRequest('/teacher/students');
};

export const getUserData = async (userId: string) => {
  return makeRequest(`/admin/user/${userId}`);
};

export const getUserAssessmentResults = async (userId: string) => {
  return makeRequest(`/admin/user/${userId}/results`);
};

// Organization APIs
export const getOrganizationMembers = async () => {
  return makeRequest('/organization/members');
};

export const updateInstitutionProfile = async (data: Partial<Organization>) => {
  return makeRequest('/organization/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const assignInstitutionAdmin = async (email: string) => {
  return makeRequest('/organization/assign-admin', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export const getStudentsForTeacher = async () => {
  return makeRequest('/teacher/students');
};

export const getSchoolRosterAPI = async () => {
  return makeRequest('/school/roster');
};

export const getSupervisedEmployees = async (supervisorId?: string) => {
  const query = supervisorId ? `?supervisorId=${supervisorId}` : '';
  return makeRequest(`/supervisor/employees${query}`);
};

export const removeSupervisedEmployee = async (employeeId: string) => {
  return makeRequest('/supervisor/employees/remove', {
    method: 'POST',
    body: JSON.stringify({ employeeId }),
  });
};

export const getOrganizationCodeDetails = async () => {
  return makeRequest('/supervisor/organization-code');
};

export const regenerateOrganizationCode = async () => {
  return makeRequest('/supervisor/organization-code/regenerate', {
    method: 'POST'
  });
};

export const updateOrganizationCodeStatus = async (isActive: boolean) => {
  return makeRequest('/supervisor/organization-code/status', {
    method: 'POST',
    body: JSON.stringify({ isActive })
  });
};

export const updateOrganizationCodeExpiry = async (days: number | null) => {
  return makeRequest('/supervisor/organization-code/expiry', {
    method: 'POST',
    body: JSON.stringify({ days })
  });
};

// Parent APIs
export const getLinkedChildren = async () => {
  return makeRequest('/parent/children');
};

export const linkChildByEmail = async (childEmail: string) => {
  return makeRequest('/parent/link-child', {
    method: 'POST',
    body: JSON.stringify({ childEmail }),
  });
};

export const unlinkChild = async (childId: string) => {
  return makeRequest('/parent/unlink-child', {
    method: 'POST',
    body: JSON.stringify({ childId }),
  });
};

export const getChildrenAssessments = async () => {
  return makeRequest('/parent/children/assessments');
};

// Parent Observation APIs (Cross-device sync)
export const saveParentObservation = async (observation: any) => {
  return makeRequest('/observation', {
    method: 'POST',
    body: JSON.stringify(observation),
  });
};

export const getParentObservations = async (parentId: string) => {
  return makeRequest(`/observation/parent/${parentId}`);
};

export const getChildObservations = async (childId: string) => {
  return makeRequest(`/observation/child/${childId}`);
};

// Sharing Consent APIs (Cross-device sync)
export const saveSharingConsent = async (childId: string, parentId: string, consentGiven: boolean) => {
  return makeRequest('/consent', {
    method: 'POST',
    body: JSON.stringify({ childId, parentId, consentGiven }),
  });
};

export const getSharingConsent = async (childId: string, parentId: string) => {
  return makeRequest(`/consent/${childId}/${parentId}`);
};

export const getChildConsents = async (childId: string) => {
  return makeRequest(`/consent/child/${childId}`);
};

// Supervisor Review APIs (Cross-device sync)
export const saveSupervisorReview = async (review: any) => {
  return makeRequest('/review', {
    method: 'POST',
    body: JSON.stringify(review),
  });
};

export const getProfessionalReviews = async (professionalId: string) => {
  return makeRequest(`/review/professional/${professionalId}`);
};

export const getSupervisorReviews = async (supervisorId: string) => {
  return makeRequest(`/review/supervisor/${supervisorId}`);
};

// Access Request APIs
export const createAccessRequest = async (childEmail: string) => {
  return makeRequest('/access-request/create', {
    method: 'POST',
    body: JSON.stringify({ childEmail }),
  });
};

export const getPendingAccessRequests = async () => {
  return makeRequest('/access-request/pending');
};

export const getAllAccessRequests = async () => {
  return makeRequest('/access-request/all');
};

export const approveAccessRequest = async (requestId: string) => {
  return makeRequest('/access-request/approve', {
    method: 'POST',
    body: JSON.stringify({ requestId }),
  });
};

export const denyAccessRequest = async (requestId: string) => {
  return makeRequest('/access-request/deny', {
    method: 'POST',
    body: JSON.stringify({ requestId }),
  });
};

export const revokeParentAccess = async (parentId: string) => {
  return makeRequest('/access-request/revoke', {
    method: 'POST',
    body: JSON.stringify({ parentId }),
  });
};

export const getMyAccessRequests = async () => {
  return makeRequest('/access-request/my-requests');
};

// Get linked children with their assessments
export const getLinkedChildrenWithAssessments = async () => {
  return makeRequest('/parent/linked-children');
};

// Reflection APIs
export const saveReflection = async (content: string, assessmentResultId?: string) => {
  return makeRequest('/reflection', {
    method: 'POST',
    body: JSON.stringify({ content, assessmentResultId }),
  });
};

export const getReflections = async () => {
  return makeRequest('/reflection');
};

export const getUserReflections = async (userId: string) => {
  return makeRequest(`/admin/user/${userId}/reflections`);
};

export const sendEmail = async (recipientEmail: string, subject: string, htmlContent: string) => {
  return makeRequest('/send-email', {
    method: 'POST',
    body: JSON.stringify({ recipientEmail, subject, htmlContent }),
  });
};

// Role Profiles APIs (Cognitive Role Fit)
export const getRoleProfiles = async (institutionId?: string) => {
  const query = institutionId ? `?institutionId=${institutionId}` : '';
  return makeRequest(`/role-profiles${query}`);
};

export const createRoleProfile = async (profileData: any) => {
  return makeRequest('/role-profiles', {
    method: 'POST',
    body: JSON.stringify(profileData),
  });
};

export const updateRoleProfile = async (profileId: string, profileData: any) => {
  return makeRequest(`/role-profiles/${profileId}`, {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
};

export const deleteRoleProfile = async (profileId: string) => {
  return makeRequest(`/role-profiles/${profileId}`, {
    method: 'DELETE',
  });
};

export const getRoleFitScores = async (roleId: string) => {
  return makeRequest(`/role-profiles/${roleId}/fit-scores`);
};