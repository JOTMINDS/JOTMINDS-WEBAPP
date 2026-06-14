/**
 * Privacy Dashboard & Consent Management System
 * Ghana Data Protection Compliance
 */

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: 'terms_of_service' | 'privacy_policy' | 'data_processing' | 'parental_consent' | 'marketing' | 'analytics' | 'third_party_sharing';
  granted: boolean;
  timestamp: string;
  version: string; // Version of the policy/terms
  ipAddress?: string;
  userAgent?: string;
  expiresAt?: string; // For time-limited consents
  revokedAt?: string;
}

export interface DataExportRequest {
  id: string;
  userId: string;
  requestedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  completedAt?: string;
  downloadUrl?: string;
  expiresAt?: string; // Download link expiration
  format: 'json' | 'csv' | 'pdf';
}

export interface DataDeletionRequest {
  id: string;
  userId: string;
  requestedAt: string;
  status: 'pending' | 'under_review' | 'approved' | 'completed' | 'rejected';
  reviewedAt?: string;
  reviewedBy?: string;
  completedAt?: string;
  reason?: string;
  retentionPeriod?: number; // Days to retain data before permanent deletion
}

export interface PrivacySettings {
  userId: string;
  profileVisibility: 'public' | 'school_only' | 'private';
  shareProgressWithTeachers: boolean;
  shareProgressWithParents: boolean;
  allowPeerComparison: boolean;
  allowResearchData: boolean;
  analyticsTracking: boolean;
  marketingCommunications: boolean;
  thirdPartyIntegrations: boolean;
  dataRetentionPeriod: number; // in days, 0 = indefinite
  lastUpdated: string;
}

export interface DataAccessLog {
  id: string;
  userId: string;
  accessedBy: string;
  accessedByRole: 'student' | 'teacher' | 'parent' | 'admin' | 'system';
  dataType: 'profile' | 'assessment' | 'cognitive_scores' | 'engagement' | 'gamification' | 'all';
  action: 'view' | 'edit' | 'export' | 'delete';
  timestamp: string;
  ipAddress?: string;
  purpose?: string;
}

export interface DataInventory {
  userId: string;
  lastUpdated: string;
  categories: {
    category: string;
    description: string;
    dataPoints: number;
    storage: 'local' | 'cloud' | 'both';
    retention: number; // in days
    canExport: boolean;
    canDelete: boolean;
  }[];
}

export interface ParentalConsent {
  id: string;
  studentUserId: string;
  studentName: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  relationship: 'mother' | 'father' | 'guardian' | 'other';
  consentGiven: boolean;
  consentDate: string;
  consentMethod: 'digital_signature' | 'email_verification' | 'in_person' | 'phone';
  expiresAt: string;
  verificationCode?: string;
  verified: boolean;
}

const CONSENT_STORAGE_KEY = 'jotminds_consent_records';
const PRIVACY_SETTINGS_KEY = 'jotminds_privacy_settings';
const ACCESS_LOG_KEY = 'jotminds_access_logs';
const EXPORT_REQUEST_KEY = 'jotminds_export_requests';
const DELETION_REQUEST_KEY = 'jotminds_deletion_requests';
const PARENTAL_CONSENT_KEY = 'jotminds_parental_consent';

// Consent Management
export function recordConsent(
  userId: string,
  consentType: ConsentRecord['consentType'],
  granted: boolean,
  version: string,
  expiresAt?: string
): ConsentRecord {
  const consent: ConsentRecord = {
    id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    consentType,
    granted,
    timestamp: new Date().toISOString(),
    version,
    expiresAt,
    ipAddress: '0.0.0.0', // Would be actual IP in production
    userAgent: navigator.userAgent,
  };

  const data = localStorage.getItem(CONSENT_STORAGE_KEY);
  const allConsents: ConsentRecord[] = data ? JSON.parse(data) : [];
  allConsents.push(consent);
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(allConsents));

  return consent;
}

export function revokeConsent(userId: string, consentType: ConsentRecord['consentType']): void {
  const data = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (!data) return;

  const allConsents: ConsentRecord[] = JSON.parse(data);
  const userConsents = allConsents.filter(c => c.userId === userId && c.consentType === consentType);

  userConsents.forEach(consent => {
    consent.granted = false;
    consent.revokedAt = new Date().toISOString();
  });

  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(allConsents));
}

export function getConsentStatus(userId: string, consentType: ConsentRecord['consentType']): boolean {
  const data = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (!data) return false;

  const allConsents: ConsentRecord[] = JSON.parse(data);
  const latestConsent = allConsents
    .filter(c => c.userId === userId && c.consentType === consentType)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  if (!latestConsent) return false;

  // Check expiration
  if (latestConsent.expiresAt && new Date(latestConsent.expiresAt) < new Date()) {
    return false;
  }

  return latestConsent.granted && !latestConsent.revokedAt;
}

export function getUserConsents(userId: string): ConsentRecord[] {
  const data = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (!data) return [];

  const allConsents: ConsentRecord[] = JSON.parse(data);
  return allConsents.filter(c => c.userId === userId);
}

// Privacy Settings
export function getPrivacySettings(userId: string): PrivacySettings {
  const data = localStorage.getItem(PRIVACY_SETTINGS_KEY);
  if (!data) {
    return createDefaultPrivacySettings(userId);
  }

  const allSettings: PrivacySettings[] = JSON.parse(data);
  const userSettings = allSettings.find(s => s.userId === userId);

  return userSettings || createDefaultPrivacySettings(userId);
}

function createDefaultPrivacySettings(userId: string): PrivacySettings {
  return {
    userId,
    profileVisibility: 'school_only',
    shareProgressWithTeachers: true,
    shareProgressWithParents: true,
    allowPeerComparison: true,
    allowResearchData: false,
    analyticsTracking: true,
    marketingCommunications: false,
    thirdPartyIntegrations: false,
    dataRetentionPeriod: 0,
    lastUpdated: new Date().toISOString(),
  };
}

export function updatePrivacySettings(userId: string, updates: Partial<PrivacySettings>): PrivacySettings {
  const data = localStorage.getItem(PRIVACY_SETTINGS_KEY);
  const allSettings: PrivacySettings[] = data ? JSON.parse(data) : [];

  const existingIndex = allSettings.findIndex(s => s.userId === userId);
  const currentSettings = existingIndex >= 0 ? allSettings[existingIndex] : createDefaultPrivacySettings(userId);

  const updatedSettings: PrivacySettings = {
    ...currentSettings,
    ...updates,
    userId,
    lastUpdated: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    allSettings[existingIndex] = updatedSettings;
  } else {
    allSettings.push(updatedSettings);
  }

  localStorage.setItem(PRIVACY_SETTINGS_KEY, JSON.stringify(allSettings));

  // Log the settings change
  logDataAccess(userId, userId, 'student', 'profile', 'edit', 'Privacy settings updated');

  return updatedSettings;
}

// Data Access Logging
export function logDataAccess(
  userId: string,
  accessedBy: string,
  accessedByRole: DataAccessLog['accessedByRole'],
  dataType: DataAccessLog['dataType'],
  action: DataAccessLog['action'],
  purpose?: string
): void {
  const log: DataAccessLog = {
    id: `access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    accessedBy,
    accessedByRole,
    dataType,
    action,
    timestamp: new Date().toISOString(),
    ipAddress: '0.0.0.0',
    purpose,
  };

  const data = localStorage.getItem(ACCESS_LOG_KEY);
  const allLogs: DataAccessLog[] = data ? JSON.parse(data) : [];
  allLogs.push(log);

  // Keep only last 1000 logs per user
  const userLogs = allLogs.filter(l => l.userId === userId);
  if (userLogs.length > 1000) {
    const logsToKeep = allLogs.filter(l => l.userId !== userId);
    const recentUserLogs = userLogs.slice(-1000);
    localStorage.setItem(ACCESS_LOG_KEY, JSON.stringify([...logsToKeep, ...recentUserLogs]));
  } else {
    localStorage.setItem(ACCESS_LOG_KEY, JSON.stringify(allLogs));
  }
}

export function getDataAccessLogs(userId: string, limit: number = 50): DataAccessLog[] {
  const data = localStorage.getItem(ACCESS_LOG_KEY);
  if (!data) return [];

  const allLogs: DataAccessLog[] = JSON.parse(data);
  return allLogs
    .filter(l => l.userId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

// Data Export
export function requestDataExport(
  userId: string,
  format: DataExportRequest['format'] = 'json'
): DataExportRequest {
  const request: DataExportRequest = {
    id: `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    requestedAt: new Date().toISOString(),
    status: 'pending',
    format,
  };

  const data = localStorage.getItem(EXPORT_REQUEST_KEY);
  const allRequests: DataExportRequest[] = data ? JSON.parse(data) : [];
  allRequests.push(request);
  localStorage.setItem(EXPORT_REQUEST_KEY, JSON.stringify(allRequests));

  // Log the export request
  logDataAccess(userId, userId, 'student', 'all', 'export', 'Data export requested');

  // Simulate processing (in production, this would be async)
  setTimeout(() => processDataExport(request.id), 0);

  return request;
}

function processDataExport(requestId: string): void {
  const data = localStorage.getItem(EXPORT_REQUEST_KEY);
  if (!data) return;

  const allRequests: DataExportRequest[] = JSON.parse(data);
  const request = allRequests.find(r => r.id === requestId);

  if (!request) return;

  request.status = 'completed';
  request.completedAt = new Date().toISOString();
  request.downloadUrl = `#download/${requestId}`;

  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7);
  request.expiresAt = expirationDate.toISOString();

  localStorage.setItem(EXPORT_REQUEST_KEY, JSON.stringify(allRequests));
}

export function getDataExportRequests(userId: string): DataExportRequest[] {
  const data = localStorage.getItem(EXPORT_REQUEST_KEY);
  if (!data) return [];

  const allRequests: DataExportRequest[] = JSON.parse(data);
  return allRequests.filter(r => r.userId === userId);
}

// Data Deletion
export function requestDataDeletion(userId: string, reason?: string): DataDeletionRequest {
  const request: DataDeletionRequest = {
    id: `deletion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    requestedAt: new Date().toISOString(),
    status: 'pending',
    reason,
    retentionPeriod: 30, // 30 days before permanent deletion
  };

  const data = localStorage.getItem(DELETION_REQUEST_KEY);
  const allRequests: DataDeletionRequest[] = data ? JSON.parse(data) : [];
  allRequests.push(request);
  localStorage.setItem(DELETION_REQUEST_KEY, JSON.stringify(allRequests));

  logDataAccess(userId, userId, 'student', 'all', 'delete', 'Data deletion requested');

  return request;
}

export function getDataDeletionRequests(userId: string): DataDeletionRequest[] {
  const data = localStorage.getItem(DELETION_REQUEST_KEY);
  if (!data) return [];

  const allRequests: DataDeletionRequest[] = JSON.parse(data);
  return allRequests.filter(r => r.userId === userId);
}

// Data Inventory
export function getDataInventory(userId: string): DataInventory {
  return {
    userId,
    lastUpdated: new Date().toISOString(),
    categories: [
      {
        category: 'Personal Information',
        description: 'Name, email, age, grade, school details',
        dataPoints: 8,
        storage: 'local',
        retention: 0,
        canExport: true,
        canDelete: true,
      },
      {
        category: 'Cognitive Assessments',
        description: 'Assessment responses, cognitive scores, archetypes',
        dataPoints: 150,
        storage: 'local',
        retention: 0,
        canExport: true,
        canDelete: true,
      },
      {
        category: 'Engagement Data',
        description: 'Activity logs, session data, feature usage',
        dataPoints: 500,
        storage: 'local',
        retention: 365,
        canExport: true,
        canDelete: true,
      },
      {
        category: 'Gamification Progress',
        description: 'XP, badges, levels, challenges completed',
        dataPoints: 75,
        storage: 'local',
        retention: 0,
        canExport: true,
        canDelete: true,
      },
      {
        category: 'Career Preferences',
        description: 'Career interests, favorites, exploration history',
        dataPoints: 30,
        storage: 'local',
        retention: 0,
        canExport: true,
        canDelete: true,
      },
      {
        category: 'Profile Improvement',
        description: 'Skill progression, milestones, progress snapshots',
        dataPoints: 100,
        storage: 'local',
        retention: 0,
        canExport: true,
        canDelete: true,
      },
    ],
  };
}

// Parental Consent
export function recordParentalConsent(consent: Omit<ParentalConsent, 'id'>): ParentalConsent {
  const record: ParentalConsent = {
    id: `parental_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...consent,
  };

  const data = localStorage.getItem(PARENTAL_CONSENT_KEY);
  const allConsents: ParentalConsent[] = data ? JSON.parse(data) : [];
  allConsents.push(record);
  localStorage.setItem(PARENTAL_CONSENT_KEY, JSON.stringify(allConsents));

  return record;
}

export function getParentalConsent(studentUserId: string): ParentalConsent | null {
  const data = localStorage.getItem(PARENTAL_CONSENT_KEY);
  if (!data) return null;

  const allConsents: ParentalConsent[] = JSON.parse(data);
  const latestConsent = allConsents
    .filter(c => c.studentUserId === studentUserId)
    .sort((a, b) => new Date(b.consentDate).getTime() - new Date(a.consentDate).getTime())[0];

  return latestConsent || null;
}

export function verifyParentalConsent(consentId: string, verificationCode: string): boolean {
  const data = localStorage.getItem(PARENTAL_CONSENT_KEY);
  if (!data) return false;

  const allConsents: ParentalConsent[] = JSON.parse(data);
  const consent = allConsents.find(c => c.id === consentId);

  if (!consent || consent.verificationCode !== verificationCode) {
    return false;
  }

  consent.verified = true;
  localStorage.setItem(PARENTAL_CONSENT_KEY, JSON.stringify(allConsents));

  return true;
}

export function checkMinorConsentRequired(age: number): boolean {
  return age < 18; // Ghana: Minors are under 18
}
