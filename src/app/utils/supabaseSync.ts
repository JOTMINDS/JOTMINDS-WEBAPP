import { createClient } from './supabase/client';
import { User, Assessment, Class, TeacherClassAssignment } from '../types';

/**
 * Maps a local User object to the Supabase public.users table format.
 */
function mapUserToSupabase(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone || null,
    school: user.school || null,
    role: user.role,
    education_level: user.educationLevel || null,
    date_of_birth: user.dateOfBirth || null,
    parent_id: user.parentId || null,
    teacher_id: user.teacherId || null,
    teacher_name: user.teacherName || null,
    class_id: user.classId || null,
    students: user.students || [],
    organization_name: user.organizationName || null,
    organization_type: user.organizationType || null,
    industry_sector: user.industrySector || null,
    position: user.position || null,
    parent_pin: user.parentPin || null,
    assessments_completed: user.assessmentsCompleted || [],
    created_at: user.createdAt,
  };
}

/**
 * Maps a Supabase public.users row back to the local User object format.
 */
function mapSupabaseToUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone || '',
    school: row.school || undefined,
    role: row.role as any,
    educationLevel: row.education_level || undefined,
    dateOfBirth: row.date_of_birth || undefined,
    parentId: row.parent_id || undefined,
    teacherId: row.teacher_id || undefined,
    teacherName: row.teacher_name || undefined,
    classId: row.class_id || undefined,
    students: row.students || undefined,
    organizationName: row.organization_name || undefined,
    organizationType: row.organization_type || undefined,
    industrySector: row.industry_sector || undefined,
    position: row.position || undefined,
    parentPin: row.parent_pin || undefined,
    assessmentsCompleted: row.assessments_completed || undefined,
    createdAt: row.created_at,
    // Keep local assessments array if they exist locally, otherwise undefined
    assessments: undefined,
  };
}

/**
 * Asynchronously pushes a user update to Supabase.
 * This is called in a "fire-and-forget" manner after local storage is updated.
 */
export async function syncUserToSupabase(user: User) {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('users')
      .upsert(mapUserToSupabase(user) as any);
      
    if (error) {
      console.error('[Supabase Sync] Error syncing user to Supabase:', error);
    } else {
      console.log('[Supabase Sync] Successfully synced user:', user.email);
    }
  } catch (error) {
    console.error('[Supabase Sync] Exception syncing user:', error);
  }
}

/**
 * Asynchronously deletes a user from Supabase.
 */
export async function deleteUserFromSupabase(userId: string) {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
      
    if (error) {
      console.error('[Supabase Sync] Error deleting user from Supabase:', error);
    } else {
      console.log('[Supabase Sync] Successfully deleted user:', userId);
    }
  } catch (error) {
    console.error('[Supabase Sync] Exception deleting user:', error);
  }
}

/**
 * Asynchronously pulls down all relevant users from Supabase 
 * and merges them into the local storage.
 * Call this on app initialization.
 */
export async function syncAllUsersFromSupabase() {
  try {
    const supabase = createClient();
    // For now, in our hybrid model, we pull all users to populate the local cache.
    // In a fully scaled app, this would be scoped to the logged-in user's context.
    const { data, error } = (await supabase
      .from('users')
      .select('*')) as { data: any[] | null, error: any };
      
    if (error) {
      console.error('[Supabase Sync] Error fetching users from Supabase:', error);
      return;
    }
    
    if (data && data.length > 0) {
      const localUsersStr = localStorage.getItem('ts_users');
      const localUsers: User[] = localUsersStr ? JSON.parse(localUsersStr) : [];
      
      // Create a map for easy merging
      const localUsersMap = new Map(localUsers.map(u => [u.id, u]));
      
      // Merge Supabase data into local data (Supabase wins on shared fields)
      data.forEach(row => {
        const mappedUser = mapSupabaseToUser(row);
        const existingLocalUser = localUsersMap.get(row.id);
        
        if (existingLocalUser) {
          // Preserve local-only fields like 'assessments' (the legacy full objects)
          mappedUser.assessments = existingLocalUser.assessments;
          mappedUser.reviews = existingLocalUser.reviews;
        }
        
        localUsersMap.set(row.id, mappedUser);
      });
      
      // Save back to local storage
      const mergedUsers = Array.from(localUsersMap.values());
      localStorage.setItem('ts_users', JSON.stringify(mergedUsers));
      console.log('[Supabase Sync] Successfully merged', data.length, 'users from Supabase into local storage');
    }
  } catch (error) {
    console.error('[Supabase Sync] Exception syncing users from Supabase:', error);
  }
}

/**
 * Asynchronously pushes an assessment to Supabase.
 */
export async function syncAssessmentToSupabase(assessment: Assessment) {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('assessments')
      .upsert({
        id: assessment.id,
        user_id: assessment.userId,
        type: assessment.type,
        responses: assessment.responses,
        score: assessment.score,
        completed: assessment.completed || true,
        completed_at: assessment.completedAt || new Date().toISOString()
      } as any);
      
    if (error) {
      console.error('[Supabase Sync] Error syncing assessment to Supabase:', error);
    }
  } catch (error) {
    console.error('[Supabase Sync] Exception syncing assessment:', error);
  }
}

/**
 * Asynchronously pushes a class update to Supabase.
 */
export async function syncClassToSupabase(cls: Class) {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('classes')
      .upsert({
        id: cls.id,
        name: cls.name,
        academic_year: cls.academicYear,
        class_teacher_id: cls.classTeacherId || null,
        institution_id: cls.institutionId || null,
        student_count: cls.studentCount || 0,
        created_at: cls.createdAt || new Date().toISOString()
      } as any);
      
    if (error) {
      console.error('[Supabase Sync] Error syncing class to Supabase:', error);
    } else {
      console.log('[Supabase Sync] Successfully synced class:', cls.name);
    }
  } catch (error) {
    console.error('[Supabase Sync] Exception syncing class:', error);
  }
}

/**
 * Asynchronously deletes a class from Supabase.
 */
export async function deleteClassFromSupabase(classId: string) {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId);
      
    if (error) {
      console.error('[Supabase Sync] Error deleting class from Supabase:', error);
    } else {
      console.log('[Supabase Sync] Successfully deleted class:', classId);
    }
  } catch (error) {
    console.error('[Supabase Sync] Exception deleting class:', error);
  }
}

/**
 * Asynchronously pushes a teacher class assignment to Supabase.
 */
export async function syncTeacherAssignmentToSupabase(assignment: TeacherClassAssignment) {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('teacher_class_assignments')
      .upsert({
        id: assignment.id,
        teacher_id: assignment.teacherId,
        class_id: assignment.classId,
        subject_id: assignment.subjectId || null,
        role: assignment.role,
      } as any);
      
    if (error) {
      console.error('[Supabase Sync] Error syncing teacher assignment to Supabase:', error);
    } else {
      console.log('[Supabase Sync] Successfully synced teacher assignment:', assignment.id);
    }
  } catch (error) {
    console.error('[Supabase Sync] Exception syncing teacher assignment:', error);
  }
}

/**
 * Asynchronously deletes a teacher class assignment from Supabase.
 */
export async function deleteTeacherAssignmentFromSupabase(assignmentId: string) {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('teacher_class_assignments')
      .delete()
      .eq('id', assignmentId);
      
    if (error) {
      console.error('[Supabase Sync] Error deleting teacher assignment from Supabase:', error);
    } else {
      console.log('[Supabase Sync] Successfully deleted teacher assignment:', assignmentId);
    }
  } catch (error) {
    console.error('[Supabase Sync] Exception deleting teacher assignment:', error);
  }
}
