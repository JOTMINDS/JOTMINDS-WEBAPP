// Jots Code — the existing organizationCode IS the Jots Code.
// This module provides helpers that work with organizationCode for school linking.

import { getAllUsers } from './storage';
import { User } from '../types';

// Display the user's Jots Code — same as their organizationCode, falling back to school name derivation.
export function getUserJotsCode(user: User): string {
  if (user.organizationCode) return user.organizationCode;
  if (user.jotsCode) return user.jotsCode; // legacy field
  if (user.school) return deriveCodeFromSchool(user.school);
  return '';
}

// Deterministic fallback code from school name when no organizationCode is set.
// Used so school admins without a server-issued code still get a displayable code.
function deriveCodeFromSchool(name: string): string {
  const prefix = name.replace(/[^A-Za-z]/g, '').toUpperCase().padEnd(4, 'X').slice(0, 4);
  let h = 5381;
  for (let i = 0; i < name.length; i++) h = ((h << 5) + h + name.charCodeAt(i)) | 0;
  return `JOTM-${prefix}${Math.abs(h % 10000).toString().padStart(4, '0')}`;
}

// Register is a no-op now — codes come from the existing org code system.
export function registerSchoolJotsCode(_admin: User): string {
  return getUserJotsCode(_admin);
}

// Get all teachers that belong to the same school as the given admin.
// Matching priority:
//  1. Same organizationCode (exact match — both admin and teacher joined with the same code)
//  2. Same organizationName (verified institution name set during signup)
//  3. Same school string (plain name match, case-insensitive)
export function getSchoolTeachers(admin: User): User[] {
  const allUsers = getAllUsers();
  const adminCode = admin.organizationCode || admin.jotsCode;
  const adminOrgName = admin.organizationName?.toLowerCase().trim();
  const adminSchool = admin.school?.toLowerCase().trim();

  return allUsers.filter(u => {
    if (u.role !== 'teacher') return false;
    if (adminCode && u.organizationCode && u.organizationCode === adminCode) return true;
    if (adminOrgName && u.organizationName && u.organizationName.toLowerCase().trim() === adminOrgName) return true;
    if (adminSchool && u.school && u.school.toLowerCase().trim() === adminSchool) return true;
    return false;
  });
}

// Resolve a code to the school name it represents (scans all users).
export function resolveJotsCode(code: string): string | null {
  const c = code.trim().toUpperCase();
  const allUsers = getAllUsers();
  const match = allUsers.find(u => u.organizationCode === c && (u.organizationName || u.school));
  return match ? (match.organizationName || match.school || null) : null;
}
