import { User, Assessment, Reflection, AssessmentProgress, SupervisorReviewData, ParentObservationAssessment, ChildSharingConsent } from '../types';
import { createClient } from './supabase/client';
import { projectId } from './supabase/info';
import { calculateAge } from './dateUtils';

const STORAGE_KEYS = {
  CURRENT_USER: 'ts_current_user',
  USERS: 'ts_users',
  ASSESSMENTS: 'ts_assessments',
  REFLECTIONS: 'ts_reflections',
  ASSESSMENT_PROGRESS: 'ts_assessment_progress',
  SUPERVISOR_REVIEWS: 'ts_supervisor_reviews',
  PARENT_OBSERVATIONS: 'ts_parent_observations',
  SHARING_CONSENTS: 'ts_sharing_consents',
  JHS_RESULTS: 'ts_jhs_results',
  SHS_RESULTS: 'ts_shs_results',
  ADULT_RESULTS: 'ts_adult_results',
};

// Helper for safe JSON parsing
function safeParse<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error parsing localStorage key "${key}":`, error);
    return fallback;
  }
}

// User management
export function saveCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

export function getCurrentUser(): User | null {
  return safeParse<User | null>(STORAGE_KEYS.CURRENT_USER, null);
}

export function getAllUsers(): User[] {
  return safeParse<User[]>(STORAGE_KEYS.USERS, []);
}

export function saveUser(user: User) {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function findUserByEmail(email: string): User | undefined {
  const users = getAllUsers();
  return users.find(u => u.email === email);
}

// Admin authentication - Multi-admin support
const ADMIN_CREDENTIALS = [
  {
    email: 'Alex.Attachey@gmail.com',
    password: '0248838540',
    name: 'Alex Attachey',
    id: 'admin_001'
  },
  // Add more admins here as needed
  // {
  //   email: 'admin2@example.com',
  //   password: 'password2',
  //   name: 'Admin Name 2',
  //   id: 'admin_002'
  // }
];

export function authenticateAdmin(email: string, password: string): boolean {
  return ADMIN_CREDENTIALS.some(
    admin => admin.email === email && admin.password === password
  );
}

export function createAdminUser(email: string): User {
  const adminCred = ADMIN_CREDENTIALS.find(admin => admin.email === email);
  
  if (!adminCred) {
    throw new Error('Admin credentials not found');
  }
  
  return {
    id: adminCred.id,
    email: adminCred.email,
    name: adminCred.name,
    phone: '0248838540',
    role: 'admin' as any, // Cast to bypass type checking for admin role
    createdAt: new Date().toISOString(),
  };
}

// School mapping - Get all students from a specific school
export function getStudentsBySchool(schoolName: string): User[] {
  const users = getAllUsers();
  return users.filter(u => 
    u.role === 'student' && 
    u.school && 
    u.school.toLowerCase().trim() === schoolName.toLowerCase().trim()
  );
}

// School mapping - Get all teachers from a specific school
export function getTeachersBySchool(schoolName: string): User[] {
  const users = getAllUsers();
  return users.filter(u => 
    u.role === 'teacher' && 
    u.school && 
    u.school.toLowerCase().trim() === schoolName.toLowerCase().trim()
  );
}

// School mapping - Automatically map students to a teacher's school
export function mapStudentsToTeacher(teacherId: string): User {
  const users = getAllUsers();
  const teacher = users.find(u => u.id === teacherId);
  
  if (!teacher || teacher.role !== 'teacher' || !teacher.school) {
    throw new Error('Invalid teacher or school not found');
  }
  
  // Get all students from the same school
  const schoolStudents = getStudentsBySchool(teacher.school);
  
  // Update teacher's students list
  const updatedTeacher = {
    ...teacher,
    students: schoolStudents.map(s => s.id)
  };
  
  saveUser(updatedTeacher);
  return updatedTeacher;
}

// School mapping - Get all schools with student/teacher counts
export function getAllSchools(): { name: string; studentCount: number; teacherCount: number }[] {
  const users = getAllUsers();
  const schoolMap = new Map<string, { studentCount: number; teacherCount: number }>();
  
  users.forEach(user => {
    if (user.school && (user.role === 'student' || user.role === 'teacher')) {
      const normalizedSchool = user.school.toLowerCase().trim();
      const existing = schoolMap.get(normalizedSchool) || { studentCount: 0, teacherCount: 0 };
      
      if (user.role === 'student') {
        existing.studentCount++;
      } else if (user.role === 'teacher') {
        existing.teacherCount++;
      }
      
      schoolMap.set(normalizedSchool, existing);
    }
  });
  
  return Array.from(schoolMap.entries()).map(([name, counts]) => ({
    name,
    ...counts
  }));
}

// Parent-child linking - Add a child to parent's account
export function linkChildToParent(parentId: string, childEmail: string): { success: boolean; message: string; parent?: User } {
  const users = getAllUsers();
  const parent = users.find(u => u.id === parentId);
  const child = users.find(u => u.email.toLowerCase() === childEmail.toLowerCase());
  
  if (!parent || parent.role !== 'parent') {
    return { success: false, message: 'Invalid parent account' };
  }
  
  if (!child || child.role !== 'student') {
    return { success: false, message: 'Student not found. Please check the email address.' };
  }
  
  // Check if already linked
  if (parent.students?.includes(child.id)) {
    return { success: false, message: 'This child is already linked to your account.' };
  }
  
  // Add child to parent's students list
  const updatedParent = {
    ...parent,
    students: [...(parent.students || []), child.id]
  };
  
  saveUser(updatedParent);
  return { success: true, message: 'Child successfully linked!', parent: updatedParent };
}

// Parent-child linking - Remove a child from parent's account
export function unlinkChildFromParent(parentId: string, childId: string): User {
  const users = getAllUsers();
  const parent = users.find(u => u.id === parentId);
  
  if (!parent || parent.role !== 'parent') {
    throw new Error('Invalid parent account');
  }
  
  const updatedParent = {
    ...parent,
    students: (parent.students || []).filter(id => id !== childId)
  };
  
  saveUser(updatedParent);
  return updatedParent;
}

// Parent-child linking - Get all children linked to a parent
export function getLinkedChildren(parentId: string): User[] {
  const users = getAllUsers();
  const parent = users.find(u => u.id === parentId);
  
  if (!parent || parent.role !== 'parent' || !parent.students) {
    return [];
  }
  
  return users.filter(u => parent.students!.includes(u.id) && u.role === 'student');
}

// Assessment management
export function getAllAssessments(): Assessment[] {
  return safeParse<Assessment[]>(STORAGE_KEYS.ASSESSMENTS, []);
}

export function saveAssessment(assessment: Assessment) {
  const assessments = getAllAssessments();
  assessments.push(assessment);
  localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(assessments));
}

export function getUserAssessments(userId: string): Assessment[] {
  const assessments = getAllAssessments();
  return assessments.filter(a => a.userId === userId);
}

export function getAssessmentById(id: string): Assessment | undefined {
  const assessments = getAllAssessments();
  return assessments.find(a => a.id === id);
}

// Reflection management
export function getAllReflections(): Reflection[] {
  return safeParse<Reflection[]>(STORAGE_KEYS.REFLECTIONS, []);
}

export function saveReflection(reflection: Reflection) {
  const reflections = getAllReflections();
  reflections.push(reflection);
  localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(reflections));
}

export function getUserReflections(userId: string): Reflection[] {
  const reflections = getAllReflections();
  return reflections.filter(r => r.userId === userId);
}

export function getReflectionsByAssessment(assessmentId: string): Reflection[] {
  const reflections = getAllReflections();
  return reflections.filter(r => r.assessmentId === assessmentId);
}

// Assessment progress management
export function saveAssessmentProgress(progress: AssessmentProgress) {
  const key = `${STORAGE_KEYS.ASSESSMENT_PROGRESS}_${progress.userId}_${progress.assessmentType}_${progress.isOrganizational}`;
  try {
    const serialized = JSON.stringify(progress);
    localStorage.setItem(key, serialized);
    console.log('Saved progress to localStorage with key:', key);
    
    // Verify it was saved
    const verification = localStorage.getItem(key);
    if (!verification) {
      console.error('Failed to verify saved progress!');
    }
  } catch (error) {
    console.error('Error saving progress to localStorage:', error);
    throw error;
  }
}

export function getAssessmentProgress(
  userId: string, 
  assessmentType: 'kolb' | 'sternberg' | 'dual-process' | 'teaching-style',
  isOrganizational: boolean
): AssessmentProgress | null {
  const key = `${STORAGE_KEYS.ASSESSMENT_PROGRESS}_${userId}_${assessmentType}_${isOrganizational}`;
  return safeParse<AssessmentProgress | null>(key, null);
}

export function clearAssessmentProgress(
  userId: string, 
  assessmentType: 'kolb' | 'sternberg' | 'dual-process' | 'teaching-style',
  isOrganizational: boolean
) {
  const key = `${STORAGE_KEYS.ASSESSMENT_PROGRESS}_${userId}_${assessmentType}_${isOrganizational}`;
  localStorage.removeItem(key);
}

// Supervisor review management
export function getAllReviews(): SupervisorReviewData[] {
  return safeParse<SupervisorReviewData[]>(STORAGE_KEYS.SUPERVISOR_REVIEWS, []);
}

export function saveReview(reviewData: Omit<SupervisorReviewData, 'id' | 'createdAt'>) {
  const reviews = getAllReviews();
  const newReview: SupervisorReviewData = {
    ...reviewData,
    id: generateId(),
    createdAt: new Date().toISOString()
  };
  reviews.push(newReview);
  localStorage.setItem(STORAGE_KEYS.SUPERVISOR_REVIEWS, JSON.stringify(reviews));
  return newReview;
}

export function getReviewsByProfessional(professionalId: string): SupervisorReviewData[] {
  const reviews = getAllReviews();
  return reviews.filter(r => r.professionalId === professionalId);
}

export function getReviewsBySupervisor(supervisorId: string): SupervisorReviewData[] {
  const reviews = getAllReviews();
  return reviews.filter(r => r.supervisorId === supervisorId);
}

export function getAssessmentsByUserId(userId: string): Assessment[] {
  return getUserAssessments(userId);
}

// Parent observation management
export function getAllParentObservations(): ParentObservationAssessment[] {
  return safeParse<ParentObservationAssessment[]>(STORAGE_KEYS.PARENT_OBSERVATIONS, []);
}

export function saveParentObservation(observation: ParentObservationAssessment) {
  const observations = getAllParentObservations();
  observations.push(observation);
  localStorage.setItem(STORAGE_KEYS.PARENT_OBSERVATIONS, JSON.stringify(observations));
}

export function getParentObservationsByParent(parentId: string): ParentObservationAssessment[] {
  const observations = getAllParentObservations();
  return observations.filter(o => o.parentId === parentId);
}

export function getParentObservationsByChild(childId: string): ParentObservationAssessment[] {
  const observations = getAllParentObservations();
  return observations.filter(o => o.childId === childId);
}

export function getParentObservationById(id: string): ParentObservationAssessment | undefined {
  const observations = getAllParentObservations();
  return observations.find(o => o.id === id);
}

// Child sharing consent management
export function getAllSharingConsents(): ChildSharingConsent[] {
  return safeParse<ChildSharingConsent[]>(STORAGE_KEYS.SHARING_CONSENTS, []);
}

export function saveSharingConsent(consent: ChildSharingConsent) {
  const consents = getAllSharingConsents();
  // Remove existing consent for this child-parent pair
  const filtered = consents.filter(c => !(c.childId === consent.childId && c.parentId === consent.parentId));
  filtered.push(consent);
  localStorage.setItem(STORAGE_KEYS.SHARING_CONSENTS, JSON.stringify(filtered));
}

export function getSharingConsentForChild(childId: string, parentId: string): ChildSharingConsent | undefined {
  const consents = getAllSharingConsents();
  return consents.find(c => c.childId === childId && c.parentId === parentId);
}

export function hasChildGrantedAccess(childId: string, parentId: string): boolean {
  // Get child user to check age
  const users = getAllUsers();
  const child = users.find(u => u.id === childId);
  
  // If child is 10 or younger, parents automatically have access
  const age = child?.age ?? (child?.dateOfBirth ? calculateAge(child.dateOfBirth) : undefined);
  
  if (age !== undefined && age <= 10) {
    return true;
  }
  
  // For children 11 and older, check explicit consent
  const consent = getSharingConsentForChild(childId, parentId);
  return consent?.consentGiven === true;
}

// Helper to generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// JHS/SHS/Adult Result Management
export function getJHSResults(userId: string): any[] {
  const results = safeParse<any[]>(STORAGE_KEYS.JHS_RESULTS, []);
  return results.filter((r: any) => r.userId === userId);
}

export function saveJHSResult(result: any) {
  const results = safeParse<any[]>(STORAGE_KEYS.JHS_RESULTS, []);
  const index = results.findIndex((r: any) => r.id === result.id || (r.completedAt === result.completedAt && r.userId === result.userId));
  if (index >= 0) {
    results[index] = result;
  } else {
    results.push(result);
  }
  localStorage.setItem(STORAGE_KEYS.JHS_RESULTS, JSON.stringify(results));
}

export function getSHSResults(userId: string): any[] {
  const results = safeParse<any[]>(STORAGE_KEYS.SHS_RESULTS, []);
  return results.filter((r: any) => r.userId === userId);
}

export function saveSHSResult(result: any) {
  const results = safeParse<any[]>(STORAGE_KEYS.SHS_RESULTS, []);
  const index = results.findIndex((r: any) => r.id === result.id || (r.completedAt === result.completedAt && r.userId === result.userId));
  if (index >= 0) {
    results[index] = result;
  } else {
    results.push(result);
  }
  localStorage.setItem(STORAGE_KEYS.SHS_RESULTS, JSON.stringify(results));
}

export function getAdultResults(userId: string): any[] {
  const results = safeParse<any[]>(STORAGE_KEYS.ADULT_RESULTS, []);
  return results.filter((r: any) => r.userId === userId);
}

export function saveAdultResult(result: any) {
  const results = safeParse<any[]>(STORAGE_KEYS.ADULT_RESULTS, []);
  const index = results.findIndex((r: any) => r.id === result.id || (r.completedAt === result.completedAt && r.userId === result.userId));
  if (index >= 0) {
    results[index] = result;
  } else {
    results.push(result);
  }
  localStorage.setItem(STORAGE_KEYS.ADULT_RESULTS, JSON.stringify(results));
}

// Synchronization with Supabase
export async function syncDataWithServer() {
  try {
    console.log('Starting sync with server...');
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      console.log('No active session, skipping sync');
      return;
    }

    const token = session.access_token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-fc8eb847`;
    const user = session.user;

    // 1. Sync User Profile
    try {
        const response = await fetch(`${baseUrl}/session`, { headers });
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
                // Preserve local students/teacher mapping if needed, but server should be source of truth
                const localUser = getCurrentUser();
                const mergedUser = { ...localUser, ...data.user };
                saveCurrentUser(mergedUser);
                saveUser(mergedUser);
            }
        }
    } catch (e) {
        console.error('Error syncing user profile:', e);
    }

    // 2. Sync Reflections
    try {
        const response = await fetch(`${baseUrl}/reflection`, { headers });
        if (response.ok) {
            const data = await response.json();
            if (data.success && Array.isArray(data.reflections)) {
                const serverReflections = data.reflections;
                const localReflections = getAllReflections();
                let hasChanges = false;
                const mergedReflections = [...localReflections];
                
                serverReflections.forEach((srvRef: Reflection) => {
                    if (!localReflections.some(locRef => locRef.id === srvRef.id)) {
                        mergedReflections.push(srvRef);
                        hasChanges = true;
                    }
                });
                
                if (hasChanges) {
                    localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(mergedReflections));
                    console.log('Synced reflections from server');
                }
            }
        }
    } catch (e) {
        console.error('Error syncing reflections:', e);
    }

    // 3. Sync Assessment Results (Kolb, Sternberg, Dual-Process)
    try {
        const response = await fetch(`${baseUrl}/assessment/results`, { headers });
        if (response.ok) {
            const data = await response.json();
            if (data.success && Array.isArray(data.results)) {
                const serverResults = data.results;
                const localAssessments = getAllAssessments();
                let hasChanges = false;
                const mergedAssessments = [...localAssessments];
                
                serverResults.forEach((srvRes: any) => {
                    // Check if this assessment already exists locally by comparing ID or (type + completedAt)
                    const exists = localAssessments.some(local => 
                        local.id === srvRes.id || 
                        (local.type === srvRes.assessmentType && local.completedAt === srvRes.completedAt)
                    );
                    
                    if (!exists) {
                        const newAssessment: Assessment = {
                            id: srvRes.id || srvRes.key || generateId(),
                            userId: srvRes.userId || user.id,
                            type: srvRes.assessmentType,
                            responses: srvRes.answers || [],
                            score: srvRes.results,
                            completedAt: srvRes.completedAt || new Date().toISOString()
                        };
                        
                        if (['kolb', 'sternberg', 'dual-process'].includes(newAssessment.type)) {
                             mergedAssessments.push(newAssessment);
                             hasChanges = true;
                        }
                    }
                });
                
                if (hasChanges) {
                    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(mergedAssessments));
                    console.log('Synced assessments from server');
                }
            }
        }
    } catch (e) {
        console.error('Error syncing assessments:', e);
    }

    // 4. Sync JHS Thinking Results
    try {
        const response = await fetch(`${baseUrl}/jhs-thinking/results`, { headers });
        if (response.ok) {
            const data = await response.json();
            // The API might return a single object (latest) or null
             if (data && data.success && data.results) {
                saveJHSResult(data.results);
                console.log('Synced JHS results from server');
            } else if (data && !data.error && !data.success) {
                 // If it returns the result object directly
                 saveJHSResult(data);
                 console.log('Synced JHS results from server (direct)');
            }
        }
    } catch (e) {
        // Ignore 404 or fetch errors
    }

    // 5. Sync SHS Thinking Results
    try {
        const response = await fetch(`${baseUrl}/shs-thinking/results`, { headers });
        if (response.ok) {
            const data = await response.json();
            if (data && !data.error) {
                saveSHSResult(data);
                console.log('Synced SHS results from server');
            }
        }
    } catch (e) {}

    // 6. Sync Adult Thinking Results
    try {
        const response = await fetch(`${baseUrl}/adult-thinking/results`, { headers });
        if (response.ok) {
            const data = await response.json();
            if (data && !data.error) {
                saveAdultResult(data);
                console.log('Synced Adult results from server');
            }
        }
    } catch (e) {}

    console.log('Sync completed successfully');
  } catch (error) {
    console.error('Global sync failed:', error);
  }
}
