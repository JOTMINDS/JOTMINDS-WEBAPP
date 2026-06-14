// Institution Management — school registration, code generation, member management

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
  invitedAt: string;
}

export interface CodeValidationResult {
  valid: boolean;
  institution?: Institution;
  error?: 'not_found' | 'expired' | 'inactive';
  errorMessage?: string;
}

const INSTITUTIONS_KEY = 'jm_institutions';
const MEMBERS_KEY = (id: string) => `jm_inst_members_${id}`;
const INVITATIONS_KEY = 'jm_inst_invitations';

// ─── Storage ──────────────────────────────────────────────────────────────────

export function getAllInstitutions(): Institution[] {
  try { return JSON.parse(localStorage.getItem(INSTITUTIONS_KEY) ?? '[]'); } catch { return []; }
}

function saveAllInstitutions(list: Institution[]) {
  localStorage.setItem(INSTITUTIONS_KEY, JSON.stringify(list));
}

export function getInstitutionById(id: string): Institution | null {
  return getAllInstitutions().find(i => i.id === id) ?? null;
}

export function getInstitutionByCode(code: string): Institution | null {
  return getAllInstitutions().find(i => i.code === code.toUpperCase()) ?? null;
}

export function getInstitutionByAdminId(adminId: string): Institution | null {
  return getAllInstitutions().find(i => i.adminId === adminId) ?? null;
}

export function getInstitutionBySchoolName(name: string): Institution | null {
  const n = name.toLowerCase().trim();
  return getAllInstitutions().find(i => i.name.toLowerCase().trim() === n) ?? null;
}

export function saveInstitution(institution: Institution): void {
  const list = getAllInstitutions();
  const idx = list.findIndex(i => i.id === institution.id);
  if (idx >= 0) list[idx] = { ...institution, updatedAt: new Date().toISOString() };
  else list.push(institution);
  saveAllInstitutions(list);
}

export function deleteInstitution(id: string): void {
  saveAllInstitutions(getAllInstitutions().filter(i => i.id !== id));
  localStorage.removeItem(MEMBERS_KEY(id));
}

// ─── Code Generation ──────────────────────────────────────────────────────────

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateInstitutionCode(): string {
  let suffix = '';
  for (let i = 0; i < 6; i++) suffix += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return `JOTM-${suffix}`;
}

export function regenerateCode(institutionId: string, expiryDays: number | null): Institution | null {
  const inst = getInstitutionById(institutionId);
  if (!inst) return null;
  const updated = { ...inst, code: generateInstitutionCode(), codeGeneratedAt: new Date().toISOString(), codeExpiryDays: expiryDays, updatedAt: new Date().toISOString() };
  saveInstitution(updated);
  return updated;
}

export function isCodeExpired(institution: Institution): boolean {
  if (!institution.codeExpiryDays) return false;
  const generated = new Date(institution.codeGeneratedAt).getTime();
  const expiresAt = generated + institution.codeExpiryDays * 24 * 60 * 60 * 1000;
  return Date.now() > expiresAt;
}

export function getCodeExpiryDate(institution: Institution): Date | null {
  if (!institution.codeExpiryDays) return null;
  const generated = new Date(institution.codeGeneratedAt).getTime();
  return new Date(generated + institution.codeExpiryDays * 24 * 60 * 60 * 1000);
}

export function getDaysUntilExpiry(institution: Institution): number | null {
  const expiry = getCodeExpiryDate(institution);
  if (!expiry) return null;
  return Math.max(0, Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

// ─── Code Validation ──────────────────────────────────────────────────────────

export function validateInstitutionCode(code: string): CodeValidationResult {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return { valid: false, error: 'not_found', errorMessage: 'Please enter an institution code.' };

  const institution = getInstitutionByCode(trimmed);
  if (!institution) return { valid: false, error: 'not_found', errorMessage: 'Institution code not found. Please check the code and try again.' };
  if (!institution.isActive) return { valid: false, institution, error: 'inactive', errorMessage: 'This institution account is currently deactivated. Please contact your administrator.' };
  if (isCodeExpired(institution)) return { valid: false, institution, error: 'expired', errorMessage: `This institution code expired on ${getCodeExpiryDate(institution)?.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}. Please request a new code from your head teacher.` };

  return { valid: true, institution };
}

// ─── Member Management ────────────────────────────────────────────────────────

export function getInstitutionMembers(institutionId: string): InstitutionMember[] {
  try { return JSON.parse(localStorage.getItem(MEMBERS_KEY(institutionId)) ?? '[]'); } catch { return []; }
}

function saveMembers(institutionId: string, members: InstitutionMember[]) {
  localStorage.setItem(MEMBERS_KEY(institutionId), JSON.stringify(members));
}

export function addMember(institutionId: string, member: Omit<InstitutionMember, 'institutionId' | 'joinedAt'>): void {
  const members = getInstitutionMembers(institutionId);
  const existingIndex = members.findIndex(m => m.userId === member.userId);
  if (existingIndex >= 0) {
    // update if exists
    members[existingIndex] = { ...members[existingIndex], ...member, institutionId };
  } else {
    members.push({ ...member, institutionId, joinedAt: new Date().toISOString(), status: member.status || 'approved' });
  }
  saveMembers(institutionId, members);

  // Update member count on institution
  const inst = getInstitutionById(institutionId);
  if (inst) saveInstitution({ ...inst, updatedAt: new Date().toISOString() });
}

export function approveMember(institutionId: string, userId: string): void {
  const members = getInstitutionMembers(institutionId);
  const idx = members.findIndex(m => m.userId === userId);
  if (idx >= 0) {
    members[idx].status = 'approved';
    saveMembers(institutionId, members);
  }
}

export function rejectMember(institutionId: string, userId: string): void {
  const members = getInstitutionMembers(institutionId);
  const idx = members.findIndex(m => m.userId === userId);
  if (idx >= 0) {
    members[idx].status = 'rejected';
    saveMembers(institutionId, members);
  }
}

export function transferMember(userId: string, currentInstitutionId: string, newInstitutionCode: string): boolean {
  const newInst = getInstitutionByCode(newInstitutionCode);
  if (!newInst) return false;
  
  const currentMembers = getInstitutionMembers(currentInstitutionId);
  const member = currentMembers.find(m => m.userId === userId);
  if (!member) return false;

  // Remove from old
  removeMember(currentInstitutionId, userId);

  // Add to new (as pending or approved? Usually transfers by admin are approved, but pending is safer)
  addMember(newInst.id, { 
    userId: member.userId, 
    userName: member.userName, 
    userEmail: member.userEmail, 
    userPhone: member.userPhone, 
    role: member.role, 
    joinedViaCode: newInst.code,
    status: 'approved' // Automatically approved if transferred by an admin
  });

  return true;
}

export function getAllInvitations(): InstitutionInvitation[] {
  try { return JSON.parse(localStorage.getItem(INVITATIONS_KEY) ?? '[]'); } catch { return []; }
}

export function inviteTeacher(email: string, institutionId: string): InstitutionInvitation {
  const list = getAllInvitations();
  const invitation: InstitutionInvitation = {
    id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    email: email.trim().toLowerCase(),
    institutionId,
    invitedAt: new Date().toISOString()
  };
  list.push(invitation);
  localStorage.setItem(INVITATIONS_KEY, JSON.stringify(list));
  return invitation;
}

export function removeMember(institutionId: string, userId: string): void {
  const members = getInstitutionMembers(institutionId).filter(m => m.userId !== userId);
  saveMembers(institutionId, members);
}

export function getMemberCounts(institutionId: string): { total: number; teachers: number; students: number } {
  const members = getInstitutionMembers(institutionId);
  return {
    total: members.length,
    teachers: members.filter(m => m.role === 'teacher').length,
    students: members.filter(m => m.role === 'student').length,
  };
}

// ─── OTP Simulation ───────────────────────────────────────────────────────────

const OTP_KEY = (contact: string) => `jm_otp_${contact.replace(/\W/g, '')}`;

export function generateOTP(contact: string): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  localStorage.setItem(OTP_KEY(contact), JSON.stringify({ otp, createdAt: Date.now() }));
  return otp; // In production this would be sent via email/SMS
}

export function verifyOTP(contact: string, entered: string): boolean {
  try {
    const stored = JSON.parse(localStorage.getItem(OTP_KEY(contact)) ?? 'null');
    if (!stored) return false;
    const expired = Date.now() - stored.createdAt > 10 * 60 * 1000; // 10 min
    if (expired) { localStorage.removeItem(OTP_KEY(contact)); return false; }
    if (stored.otp === entered.trim()) { localStorage.removeItem(OTP_KEY(contact)); return true; }
    return false;
  } catch { return false; }
}

// ─── Registration ─────────────────────────────────────────────────────────────

export function createInstitution(data: Omit<Institution, 'id' | 'code' | 'codeGeneratedAt' | 'isActive' | 'createdAt' | 'updatedAt'>): Institution {
  const institution: Institution = {
    ...data,
    id: `inst_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    code: generateInstitutionCode(),
    codeGeneratedAt: new Date().toISOString(),
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveInstitution(institution);
  // Add admin as first member
  addMember(institution.id, { userId: data.adminId, userName: data.adminName, userEmail: data.adminEmail, userPhone: data.adminPhone, role: 'admin', joinedViaCode: institution.code });
  return institution;
}

export function activateInstitution(id: string): void {
  const inst = getInstitutionById(id);
  if (inst) saveInstitution({ ...inst, isActive: true });
}

export function deactivateInstitution(id: string): void {
  const inst = getInstitutionById(id);
  if (inst) saveInstitution({ ...inst, isActive: false });
}

export function assignAdmin(institutionId: string, adminId: string, adminName: string, adminEmail: string, adminPhone: string): void {
  const inst = getInstitutionById(institutionId);
  if (!inst) return;
  saveInstitution({ ...inst, adminId, adminName, adminEmail, adminPhone });
  addMember(institutionId, { userId: adminId, userName: adminName, userEmail: adminEmail, userPhone: adminPhone, role: 'admin', joinedViaCode: inst.code });
}

export const GHANA_REGIONS = [
  'Greater Accra', 'Ashanti', 'Central', 'Eastern', 'Western', 'Western North',
  'Volta', 'Oti', 'Bono', 'Bono East', 'Ahafo', 'Northern', 'Savannah',
  'North East', 'Upper East', 'Upper West',
];
