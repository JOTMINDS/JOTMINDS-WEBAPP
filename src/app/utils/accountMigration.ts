// Account migration — runs once on app startup to backfill new fields
// onto all existing localStorage accounts. Idempotent and safe to re-run.

import { getAllUsers, saveUser, getCurrentUser } from './storage';
import { User } from '../types';
import { bootstrapXPFromAssessments } from './cognitiveXP';
import { getAssessmentsByUserId } from './storage';
import { getGamificationProfile } from './gamification';

const MIGRATION_VERSION = 3;
const MIGRATION_KEY = 'jotminds_migration_v';

function alreadyRan(version: number): boolean {
  return localStorage.getItem(`${MIGRATION_KEY}${version}`) === 'done';
}

function markDone(version: number): void {
  localStorage.setItem(`${MIGRATION_KEY}${version}`, 'done');
}

// Derive a stable JOTM-style org code from a school name
function deriveOrgCode(schoolName: string): string {
  const prefix = schoolName.replace(/[^A-Za-z]/g, '').toUpperCase().padEnd(4, 'X').slice(0, 4);
  let h = 5381;
  for (let i = 0; i < schoolName.length; i++) h = ((h << 5) + h + schoolName.charCodeAt(i)) | 0;
  const suffix = Math.abs(h % 10000).toString().padStart(4, '0');
  return `JOTM-${prefix}${suffix}`;
}

// ── Migration 1: Link teachers & school_admins by school name ──────────────────
function migrateOrgCodes(users: User[]): User[] {
  // Group by normalised school name
  const schoolMap: Record<string, User[]> = {};
  users.forEach(u => {
    if (!u.school) return;
    const key = u.school.toLowerCase().trim();
    if (!schoolMap[key]) schoolMap[key] = [];
    schoolMap[key].push(u);
  });

  const updates: Record<string, Partial<User>> = {};

  Object.values(schoolMap).forEach(group => {
    // Pick the authoritative code: prefer one from a school_admin, then any user, else derive
    const adminCode = group.find(u => u.role === 'school_admin' && u.organizationCode)?.organizationCode;
    const anyCode = group.find(u => u.organizationCode)?.organizationCode;
    const code = adminCode ?? anyCode ?? deriveOrgCode(group[0].school!);

    const orgName = group.find(u => u.organizationName)?.organizationName
      ?? group.find(u => u.school)?.school
      ?? '';

    group.forEach(u => {
      if (u.role === 'teacher' || u.role === 'school_admin') {
        const patch: Partial<User> = {};
        if (!u.organizationCode) patch.organizationCode = code;
        if (!u.organizationName && orgName) patch.organizationName = orgName;
        if (Object.keys(patch).length > 0) updates[u.id] = patch;
      }
    });
  });

  return users.map(u => updates[u.id] ? { ...u, ...updates[u.id] } : u);
}

// ── Migration 2: Backfill educationLevel for students ────────────────────────
function migrateEducationLevel(users: User[]): User[] {
  return users.map(u => {
    if (u.role !== 'student' || u.educationLevel) return u;
    let level: User['educationLevel'] | undefined;
    const age = u.age ?? (u.dateOfBirth
      ? Math.floor((Date.now() - new Date(u.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000))
      : undefined);
    if (age !== undefined) {
      if (age <= 10) level = 'Elementary';
      else if (age <= 14) level = 'JHS';
      else if (age <= 18) level = 'SHS';
      else level = 'Tertiary';
    }
    return level ? { ...u, educationLevel: level } : u;
  });
}

// ── Migration 3: Bootstrap Cognitive XP for active students ──────────────────
function migrateXP(users: User[]): void {
  users
    .filter(u => u.role === 'student')
    .forEach(u => {
      try {
        const assessments = getAssessmentsByUserId(u.id);
        const gam = getGamificationProfile(u.id);
        bootstrapXPFromAssessments(u.id, assessments, gam);
      } catch {
        // non-fatal — skip silently
      }
    });
}

// ── Main entry point ──────────────────────────────────────────────────────────
export function runAccountMigration(): void {
  try {
    if (alreadyRan(MIGRATION_VERSION)) return;

    const users = getAllUsers();
    if (users.length === 0) {
      markDone(MIGRATION_VERSION);
      return;
    }

    // Apply structural migrations and persist
    let updated = migrateOrgCodes(users);
    updated = migrateEducationLevel(updated);
    updated.forEach(saveUser);

    // Async-safe XP bootstrap (doesn't need to block)
    migrateXP(updated);

    markDone(MIGRATION_VERSION);
    console.log(`[JotMinds] Account migration v${MIGRATION_VERSION} complete — ${updated.length} accounts processed.`);
  } catch (err) {
    // Never crash the app on migration failure
    console.warn('[JotMinds] Account migration encountered an error:', err);
  }
}

// Force re-run the current migration (for manual use in dev/admin)
export function forceRerunMigration(): void {
  localStorage.removeItem(`${MIGRATION_KEY}${MIGRATION_VERSION}`);
  runAccountMigration();
}

// Returns a human-readable summary of what the migration would do
export function getMigrationPreview(): { total: number; needsOrgCode: number; needsEducationLevel: number } {
  const users = getAllUsers();
  const needsOrgCode = users.filter(u =>
    (u.role === 'teacher' || u.role === 'school_admin') && u.school && !u.organizationCode
  ).length;
  const needsEducationLevel = users.filter(u =>
    u.role === 'student' && !u.educationLevel
  ).length;
  return { total: users.length, needsOrgCode, needsEducationLevel };
}
