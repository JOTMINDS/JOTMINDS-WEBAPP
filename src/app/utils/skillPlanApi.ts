import { projectId, publicAnonKey } from './supabase/info';
import { getAuthToken } from './api';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847/skill-plan`;

export interface SkillPlanActivity {
  day: number;
  gameId: string;
  promptId: string;
  challengeId: string;
  completed: boolean;
  completedAt: string | null;
}

export interface SkillPlan {
  planId: string;
  userId: string;
  dimensionId: string;
  tier: string;
  lengthDays: 7 | 14;
  currentDay: number;
  status: 'active' | 'completed' | 'abandoned';
  activities: SkillPlanActivity[];
  sourceResultId: string;
  sourceCareer?: string;
  createdAt: string;
  updatedAt: string;
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
  if (!res.ok) throw new Error(data.error || 'Skill plan API error');
  return data as T;
}

export const listSkillPlans = () =>
  request<{ plans: SkillPlan[] }>('/list').then(r => r.plans);

export const getSkillPlan = (planId: string) =>
  request<{ plan: SkillPlan }>(`/${planId}`).then(r => r.plan);

export const generateSkillPlan = (input: {
  dimensionId: string;
  tier: string;
  lengthDays: 7 | 14;
  sourceResultId: string;
  sourceCareer?: string;
}) =>
  request<{ plan: SkillPlan }>('/generate', {
    method: 'POST',
    body: JSON.stringify(input),
  }).then(r => r.plan);

export const completePlanDay = (planId: string, day: number) =>
  request<{ plan: SkillPlan }>(`/${planId}/complete-day`, {
    method: 'POST',
    body: JSON.stringify({ day }),
  }).then(r => r.plan);

export const deleteSkillPlan = (planId: string) =>
  request<{ ok: true }>(`/${planId}`, { method: 'DELETE' });
