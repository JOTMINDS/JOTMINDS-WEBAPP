import { projectId, publicAnonKey } from './supabase/info';
import { getAuthToken } from './api';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-fc8eb847/cognitive-profile`;

export interface CognitiveProfile {
  // Core Dimensions (0-100 scale)
  learningAgility: number;
  analyticalDepth: number;
  creativeCapacity: number;
  practicalExecution: number;
  intuitiveSpeed: number;
  reflectiveDepth: number;

  // Meta-Dimensions
  cognitiveFlexibility: number;
  innovationPotential: number;
  executionCapability: number;
  metacognitiveAwareness: number;

  // Summary
  completedAssessments: string[];
  profileCompleteness: number;
  dominantStyle: string;
  cognitiveArchetype: string;

  // Metadata
  generatedAt: string;
  sourceResults: {
    kolb: string | null;
    sternberg: string | null;
    dualProcess: string | null;
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token && token.startsWith('admin-token-')) {
    headers['X-Admin-Token'] = token;
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  } else if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || data.message || 'Cognitive profile API error');
  return data as T;
}

export const getCognitiveProfile = () =>
  request<{ profile: CognitiveProfile }>('/').then(r => r.profile);

export const generateCognitiveProfile = () =>
  request<{ profile: CognitiveProfile }>('/generate', { method: 'POST' }).then(r => r.profile);

export const deleteCognitiveProfile = () =>
  request<{ success: boolean }>('/', { method: 'DELETE' });

// Profile Evolution Tracking
export interface ProfileEvolution {
  firstSnapshot: {
    date: string;
    archetype: string;
  };
  latestSnapshot: {
    date: string;
    archetype: string;
  };
  dimensionChanges: Record<string, number>;
  improvements: Array<{ dimension: string; change: number }>;
  declines: Array<{ dimension: string; change: number }>;
  overallGrowth: number;
  snapshotCount: number;
  timeSpan: {
    days: number;
  };
}

export const getProfileHistory = () =>
  request<{ history: CognitiveProfile[]; count: number }>('/history');

export const getProfileEvolution = () =>
  request<{ evolution: ProfileEvolution | null }>('/evolution').then(r => r.evolution);

export const createShareLink = () =>
  request<{ shareToken: string }>('/share', { method: 'POST' });

export const getSharedProfile = (token: string) =>
  request<{ profile: any }>(`/shared/${token}`);
