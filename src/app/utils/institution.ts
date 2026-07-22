import { createClient } from './supabase/client';
import { projectId, publicAnonKey } from './supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847`;

export type InstitutionType = 'Primary' | 'JHS' | 'SHS' | 'Tertiary' | 'Vocational' | 'Other';

export interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  address: string;
  region: string;
  district: string;
  email: string;
  phone: string;
  website?: string;
  logo?: string; // base64 data URL
  tagline?: string;
  teacherSize?: string;
  studentSize?: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  code: string; // JOTM-XXXXXX
  codeGeneratedAt: string;
  codeExpiryDays: number | null; // null = never expires
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  coAdminIds?: string[];
}

export interface InstitutionMember {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  role: 'admin' | 'teacher' | 'student';
  institutionId: string;
  joinedAt: string;
  joinedViaCode: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface InstitutionInvitation {
  id: string;
  email: string;
  institutionId: string;
  role?: 'teacher' | 'student';
  invitedAt: string;
}

export interface CodeValidationResult {
  valid: boolean;
  institution?: Institution;
  error?: 'not_found' | 'expired' | 'inactive';
  errorMessage?: string;
}

const supabase = createClient();

// Helper to map DB columns (snake_case) to Frontend model (camelCase)
export function mapDBInstitutionToLocal(db: any): Institution {
  return {
    id: db.id,
    name: db.name,
    type: db.type as any,
    address: db.address || '',
    region: db.region || '',
    district: db.district || '',
    email: db.email || '',
    phone: db.phone || '',
    website: db.website || '',
    logo: db.logo || '',
    tagline: db.tagline || '',
    teacherSize: db.teacher_size || '',
    studentSize: db.student_size || '',
    adminId: db.admin_id,
    adminName: db.admin_name || '',
    adminEmail: db.admin_email || '',
    adminPhone: db.admin_phone || '',
    code: db.code,
    codeGeneratedAt: db.code_generated_at,
    codeExpiryDays: db.code_expiry_days,
    isActive: db.is_active,
    emailVerified: db.email_verified,
    phoneVerified: db.phone_verified,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    coAdminIds: db.co_admin_ids || [],
  };
}

export function mapDBMemberToLocal(db: any): InstitutionMember {
  return {
    userId: db.user_id,
    userName: db.user_name,
    userEmail: db.user_email,
    userPhone: db.user_phone || '',
    role: db.role,
    institutionId: db.institution_id,
    joinedAt: db.joined_at,
    joinedViaCode: db.joined_via_code,
    status: db.status
  };
}

export function mapDBInvitationToLocal(db: any): InstitutionInvitation {
  return {
    id: db.token, // Use invitation token as ID on the client
    email: db.email,
    institutionId: db.institution_id,
    role: db.role,
    invitedAt: db.invited_at
  };
}

// Get Auth session token
async function getAuthToken(): Promise<string> {
  const session = (await (supabase as any).auth.getSession()).data.session;
  return session?.access_token || '';
}

// ─── Storage (Supabase Backend Integrations) ───────────────────────────────────

export async function getInstitutionById(id: string): Promise<Institution | null> {
  const { data, error } = await (supabase as any)
    .from('institutions')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  return mapDBInstitutionToLocal(data);
}

export async function getInstitutionByCode(code: string): Promise<Institution | null> {
  const { data, error } = await (supabase as any)
    .from('institutions')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .maybeSingle();

  if (error || !data) return null;
  return mapDBInstitutionToLocal(data);
}

export async function getInstitutionByAdminId(adminId: string): Promise<Institution | null> {
  const { data, error } = await (supabase as any)
    .from('institutions')
    .select('*')
    .eq('admin_id', adminId)
    .maybeSingle();

  if (error || !data) return null;
  return mapDBInstitutionToLocal(data);
}

export async function getInstitutionBySchoolName(name: string): Promise<Institution | null> {
  const { data, error } = await (supabase as any)
    .from('institutions')
    .select('*')
    .eq('name', name.trim())
    .maybeSingle();

  if (error || !data) return null;
  return mapDBInstitutionToLocal(data);
}

export async function saveInstitution(institution: Institution): Promise<void> {
  const dbRecord = {
    name: institution.name,
    type: institution.type,
    address: institution.address,
    region: institution.region,
    district: institution.district,
    email: institution.email,
    phone: institution.phone,
    website: institution.website || null,
    logo: institution.logo || null,
    tagline: institution.tagline || null,
    teacher_size: institution.teacherSize || null,
    student_size: institution.studentSize || null,
    admin_id: institution.adminId,
    admin_name: institution.adminName,
    admin_email: institution.adminEmail,
    admin_phone: institution.adminPhone,
    code: institution.code,
    code_generated_at: institution.codeGeneratedAt,
    code_expiry_days: institution.codeExpiryDays,
    is_active: institution.isActive,
    email_verified: institution.emailVerified,
    phone_verified: institution.phoneVerified,
    updated_at: new Date().toISOString()
  };

  const { error } = await (supabase as any)
    .from('institutions')
    .update(dbRecord as any)
    .eq('id', institution.id);

  if (error) {
    console.error('saveInstitution error:', error);
    throw error;
  }
}

export async function deleteInstitution(id: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('institutions')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function promoteMember(institutionId: string, userId: string): Promise<void> {
  const token = await getAuthToken();
  const response = await fetch(BASE_URL + '/institutions/promote-member', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || publicAnonKey}` 
    },
    body: JSON.stringify({ institutionId, targetUserId: userId })
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to promote member');
  }
}

export async function demoteMember(institutionId: string, userId: string): Promise<void> {
  const token = await getAuthToken();
  const response = await fetch(BASE_URL + '/institutions/demote-member', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || publicAnonKey}` 
    },
    body: JSON.stringify({ institutionId, targetUserId: userId })
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to demote member');
  }
}

// ─── Code Generation ──────────────────────────────────────────────────────────

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateInstitutionCode(): string {
  let suffix = '';
  for (let i = 0; i < 6; i++) suffix += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return `JOTM-${suffix}`;
}

export async function regenerateCode(institutionId: string, expiryDays: number | null): Promise<Institution | null> {
  const newCode = generateInstitutionCode();
  const timestamp = new Date().toISOString();

  const { data, error } = await (supabase as any)
    .from('institutions')
    .update({
      code: newCode,
      code_generated_at: timestamp,
      code_expiry_days: expiryDays,
      updated_at: timestamp
    } as any)
    .eq('id', institutionId)
    .select()
    .maybeSingle();

  if (error || !data) return null;
  return mapDBInstitutionToLocal(data);
}

export function isCodeExpired(institution?: Partial<Institution> | null): boolean {
  if (!institution || !institution.codeExpiryDays || !institution.codeGeneratedAt) return false;
  const generated = new Date(institution.codeGeneratedAt).getTime();
  if (isNaN(generated)) return false;
  const expiresAt = generated + institution.codeExpiryDays * 24 * 60 * 60 * 1000;
  return Date.now() > expiresAt;
}

export function getCodeExpiryDate(institution?: Partial<Institution> | null): Date | null {
  if (!institution || !institution.codeExpiryDays || !institution.codeGeneratedAt) return null;
  const generated = new Date(institution.codeGeneratedAt).getTime();
  if (isNaN(generated)) return null;
  return new Date(generated + institution.codeExpiryDays * 24 * 60 * 60 * 1000);
}

export function getDaysUntilExpiry(institution?: Partial<Institution> | null): number | null {
  if (!institution) return null;
  const expiry = getCodeExpiryDate(institution);
  if (!expiry) return null;
  return Math.max(0, Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

// ─── Code Validation (Secure endpoint wrapper) ───────────────────────────────

export async function validateInstitutionCode(code: string): Promise<CodeValidationResult> {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) {
    return { valid: false, error: 'not_found', errorMessage: 'Please enter an institution code.' };
  }

  try {
    const response = await fetch(`${BASE_URL}/institutions/validate-code`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ code: trimmed })
    });
    
    if (!response.ok) {
      throw new Error('Server error');
    }
    
    const result = await response.json();
    if (result.institution) {
      result.institution = mapDBInstitutionToLocal(result.institution);
    }
    return result;
  } catch (error) {
    console.error('[validateInstitutionCode] Error:', error);
    return { valid: false, error: 'not_found', errorMessage: 'Error communicating with validation server.' };
  }
}

// Validate invite token
export async function validateInviteToken(token: string): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}/institutions/validate-invite-token`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ token })
    });
    
    if (!response.ok) {
      throw new Error('Server error');
    }
    
    const result = await response.json();
    if (result.institution) {
      result.institution = mapDBInstitutionToLocal(result.institution);
    }
    return result;
  } catch (error) {
    console.error('[validateInviteToken] Error:', error);
    return { valid: false, error: 'Connection failed' };
  }
}

// ─── Member Management ────────────────────────────────────────────────────────

export async function getInstitutionMembers(institutionId: string): Promise<{ members: InstitutionMember[], profiles: any[] }> {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${BASE_URL}/institutions/members?id=${institutionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch institution members', await response.text());
      return { members: [], profiles: [] };
    }

    const result = await response.json();
    if (result.success && result.members) {
      return {
        members: result.members.map(mapDBMemberToLocal),
        profiles: result.profiles || []
      };
    }
    return { members: [], profiles: [] };
  } catch (error) {
    console.error('Error fetching institution members:', error);
    return { members: [], profiles: [] };
  }
}

export async function addMember(institutionId: string, member: Omit<InstitutionMember, 'institutionId' | 'joinedAt'>): Promise<void> {
  const { error } = await (supabase as any)
    .from('institution_members')
    .upsert({
      user_id: member.userId,
      user_name: member.userName,
      user_email: member.userEmail,
      user_phone: member.userPhone || null,
      role: member.role,
      institution_id: institutionId,
      joined_via_code: member.joinedViaCode,
      status: member.status || 'approved'
    } as any, { onConflict: 'user_id, institution_id' });

  if (error) throw error;
}

export async function joinInstitution(code: string, member: { userId: string; userName: string; userEmail: string; userPhone?: string; role: 'teacher' | 'student' }): Promise<void> {
  const response = await fetch(`${BASE_URL}/institutions/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    },
    body: JSON.stringify({
      code,
      userId: member.userId,
      userName: member.userName,
      userEmail: member.userEmail,
      userPhone: member.userPhone,
      role: member.role
    })
  });

  if (!response.ok) {
    throw new Error('Failed to join institution');
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to join institution');
  }
}

export async function approveMember(institutionId: string, userId: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('institution_members')
    .update({ status: 'approved' } as any)
    .eq('institution_id', institutionId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function rejectMember(institutionId: string, userId: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('institution_members')
    .update({ status: 'rejected' } as any)
    .eq('institution_id', institutionId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function removeMember(institutionId: string, userId: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('institution_members')
    .delete()
    .eq('institution_id', institutionId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function transferMember(userId: string, currentInstitutionId: string, newInstitutionCode: string): Promise<boolean> {
  const newInst = await getInstitutionByCode(newInstitutionCode);
  if (!newInst) return false;

  const { data: member, error } = await (supabase as any)
    .from('institution_members')
    .select('*')
    .eq('institution_id', currentInstitutionId)
    .eq('user_id', userId)
    .maybeSingle() as { data: any, error: any };

  if (error || !member) return false;

  // Remove from old
  await removeMember(currentInstitutionId, userId);

  // Add to new
  await addMember(newInst.id, {
    userId: member.user_id,
    userName: member.user_name,
    userEmail: member.user_email,
    userPhone: member.user_phone || undefined,
    role: member.role,
    joinedViaCode: newInst.code,
    status: 'approved'
  });

  return true;
}

export async function transferStudent(studentId: string, institutionId: string, newTeacherId: string, newTeacherName: string): Promise<boolean> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${BASE_URL}/institutions/transfer-student`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ studentId, institutionId, newTeacherId, newTeacherName }),
    });
    const data = await res.json();
    return data.success === true;
  } catch (error) {
    console.error('Failed to transfer student:', error);
    return false;
  }
}

export async function updateMemberDetails(institutionId: string, userId: string, details: { userName: string; userPhone: string; role?: 'teacher' | 'student' | 'admin' }): Promise<void> {
  const { error } = await (supabase as any)
    .from('institution_members')
    .update({
      user_name: details.userName,
      user_phone: details.userPhone,
      ...(details.role ? { role: details.role } : {})
    } as any)
    .eq('institution_id', institutionId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function getAllInvitations(institutionId: string): Promise<InstitutionInvitation[]> {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${BASE_URL}/institutions/members?id=${institutionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch institution invitations', await response.text());
      return [];
    }

    const result = await response.json();
    if (result.success && result.invitations) {
      return result.invitations.map(mapDBInvitationToLocal);
    }
    return [];
  } catch (error) {
    console.error('Error fetching institution invitations:', error);
    return [];
  }
}

export async function inviteMember(email: string, role: 'teacher' | 'student', institutionId: string): Promise<InstitutionInvitation> {
  const inst = await getInstitutionById(institutionId);
  if (!inst) throw new Error('Institution not found');

  const token = await getAuthToken();
  const response = await fetch(`${BASE_URL}/send-${role}-invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      institutionName: inst.name,
      institutionCode: inst.code,
      institutionId: inst.id,
      teacherName: inst.adminName, // Admin is fallback sender name
      schoolName: inst.name
    })
  });

  const res = await response.json();
  if (!response.ok || res.error) {
    throw new Error(res.error || 'Failed to send invite');
  }

  return {
    id: res.token,
    email: email.trim().toLowerCase(),
    institutionId,
    role,
    invitedAt: new Date().toISOString()
  };
}

export async function cancelInvitation(inviteToken: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('institution_invitations')
    .update({ status: 'revoked' } as any)
    .eq('token', inviteToken);

  if (error) throw error;
}

export function getMemberCounts(members: InstitutionMember[]): { total: number; teachers: number; students: number } {
  const approved = members.filter(m => m.status === 'approved');
  return {
    total: approved.length,
    teachers: approved.filter(m => m.role === 'teacher').length,
    students: approved.filter(m => m.role === 'student').length,
  };
}

export function getMemberCountsByStatus(members: InstitutionMember[]): { total: number; approved: number; pending: number; rejected: number; teachers: number; students: number } {
  const approved = members.filter(m => m.status === 'approved');
  return {
    total: members.length,
    approved: approved.length,
    pending: members.filter(m => m.status === 'pending' || !m.status).length,
    rejected: members.filter(m => m.status === 'rejected').length,
    teachers: approved.filter(m => m.role === 'teacher').length,
    students: approved.filter(m => m.role === 'student').length,
  };
}

// ─── OTP (Backend OTP Verification Integrations) ──────────────────────────────

export async function generateOTP(contact: string): Promise<string> {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  const token = await getAuthToken();
  // Call server to securely record OTP (and dispatch if email)
  try {
    const response = await fetch(`${BASE_URL}/send-otp`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || publicAnonKey}` 
      },
      body: JSON.stringify({ email: contact, otp })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to send verification code');
    }
    return otp;
  } catch (error: any) {
    throw new Error(error.message || 'Network error while sending verification code');
  }
}

export async function verifyOTP(contact: string, entered: string): Promise<boolean> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${BASE_URL}/verify-otp`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || publicAnonKey}` 
      },
      body: JSON.stringify({ email: contact, otp: entered })
    });
    
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.verified;
  } catch {
    return false;
  }
}

// ─── Registration ─────────────────────────────────────────────────────────────

export async function createInstitution(data: Omit<Institution, 'id' | 'code' | 'codeGeneratedAt' | 'isActive' | 'createdAt' | 'updatedAt'>): Promise<Institution> {
  const code = generateInstitutionCode();
  const timestamp = new Date().toISOString();
  
  const dbRecord = {
    name: data.name,
    type: data.type,
    address: data.address,
    region: data.region,
    district: data.district,
    email: data.email,
    phone: data.phone,
    website: data.website || null,
    logo: data.logo || null,
    tagline: data.tagline || null,
    teacher_size: data.teacherSize || null,
    student_size: data.studentSize || null,
    admin_id: data.adminId,
    admin_name: data.adminName,
    admin_email: data.adminEmail,
    admin_phone: data.adminPhone,
    code,
    code_generated_at: timestamp,
    code_expiry_days: data.codeExpiryDays || null,
    is_active: true,
    email_verified: data.emailVerified || false,
    phone_verified: data.phoneVerified || false
  };

  const { data: inst, error } = await (supabase as any)
    .from('institutions')
    .insert(dbRecord as any)
    .select()
    .single();

  if (error || !inst) throw error;
  
  const result = mapDBInstitutionToLocal(inst);
  
  // Add admin as first member
  await addMember(result.id, {
    userId: result.adminId,
    userName: result.adminName,
    userEmail: result.adminEmail,
    userPhone: result.adminPhone,
    role: 'admin',
    joinedViaCode: result.code,
    status: 'approved'
  });
  
  return result;
}

export async function activateInstitution(id: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('institutions')
    .update({ is_active: true } as any)
    .eq('id', id);

  if (error) throw error;
}

export async function deactivateInstitution(id: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('institutions')
    .update({ is_active: false } as any)
    .eq('id', id);

  if (error) throw error;
}

export async function assignAdmin(institutionId: string, adminId: string, adminName: string, adminEmail: string, adminPhone: string): Promise<void> {
  const inst = await getInstitutionById(institutionId);
  if (!inst) return;
  
  const { error } = await (supabase as any)
    .from('institutions')
    .update({
      admin_id: adminId,
      admin_name: adminName,
      admin_email: adminEmail,
      admin_phone: adminPhone
    } as any)
    .eq('id', institutionId);

  if (error) throw error;
  
  await addMember(institutionId, {
    userId: adminId,
    userName: adminName,
    userEmail: adminEmail,
    userPhone: adminPhone,
    role: 'admin',
    joinedViaCode: inst.code
  });
}

export async function getInstitutionForMember(userId: string): Promise<Institution | null> {
  const { data: member, error: memberError } = await (supabase as any)
    .from('institution_members')
    .select('institution_id, status')
    .eq('user_id', userId)
    .maybeSingle() as { data: any, error: any };

  if (memberError || !member || member.status !== 'approved') return null;

  return getInstitutionById(member.institution_id);
}

export const GHANA_REGIONS = [
  'Greater Accra', 'Ashanti', 'Central', 'Eastern', 'Western', 'Western North',
  'Volta', 'Oti', 'Bono', 'Bono East', 'Ahafo', 'Northern', 'Savannah',
  'North East', 'Upper East', 'Upper West',
];

// -----------------------------------------
// Class Management API (Supabase)
// -----------------------------------------

import { Class } from '../types';

export async function getInstitutionClasses(institutionId: string): Promise<Class[]> {
  const { data, error } = await (supabase as any)
    .from('classes')
    .select('*')
    .eq('institution_id', institutionId);

  if (error) {
    console.error('Error fetching classes:', error);
    return [];
  }

  return (data || []).map((dbClass: any) => ({
    id: dbClass.id,
    name: dbClass.name,
    academicYear: dbClass.academic_year,
    classTeacherId: dbClass.class_teacher_id || undefined,
    institutionId: dbClass.institution_id,
    studentCount: dbClass.student_count || 0,
    classCode: dbClass.class_code,
    createdAt: dbClass.created_at
  }));
}

export async function createInstitutionClass(classData: Class): Promise<Class> {
  // Use existing ID or let DB generate it (if it was uuid, but here it's text)
  const classId = classData.id || `cls_${Date.now()}`;
  const classCode = classData.classCode || generateInstitutionCode().replace('JOTM-', 'CLS-');

  let result = await (supabase as any)
    .from('classes')
    .upsert({
      id: classId,
      name: classData.name,
      academic_year: classData.academicYear,
      class_teacher_id: classData.classTeacherId || null,
      institution_id: classData.institutionId,
      student_count: classData.studentCount || 0,
      class_code: classCode,
      created_at: classData.createdAt || new Date().toISOString()
    })
    .select()
    .single();

  // If the remote database hasn't had the class_code migration applied, it will throw an error (PGRST204)
  if (result.error && result.error.message?.includes("class_code")) {
    console.warn("Retrying class creation without class_code due to missing database column");
    result = await (supabase as any)
      .from('classes')
      .upsert({
        id: classId,
        name: classData.name,
        academic_year: classData.academicYear,
        class_teacher_id: classData.classTeacherId || null,
        institution_id: classData.institutionId,
        student_count: classData.studentCount || 0,
        created_at: classData.createdAt || new Date().toISOString()
      })
      .select()
      .single();
  }

  if (result.error) {
    alert("Failed to save class: " + result.error.message);
    throw result.error;
  }

  return {
    id: result.data.id,
    name: result.data.name,
    academicYear: result.data.academic_year,
    classTeacherId: result.data.class_teacher_id || undefined,
    institutionId: result.data.institution_id,
    studentCount: result.data.student_count || 0,
    classCode: result.data.class_code || classCode, // Provide fallback classCode if DB doesn't have it
    createdAt: result.data.created_at
  };
}

export async function deleteInstitutionClass(classId: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('classes')
    .delete()
    .eq('id', classId);

  if (error) throw error;
}

export async function generateNewClassCode(classId: string): Promise<string> {
  const classCode = generateInstitutionCode().replace('JOTM-', 'CLS-');
  const { error } = await (supabase as any)
    .from('classes')
    .update({ class_code: classCode })
    .eq('id', classId);

  if (error) throw error;
  
  return classCode;
}
