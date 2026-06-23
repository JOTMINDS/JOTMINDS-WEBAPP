import { projectId, publicAnonKey } from './supabase/info';
import { getAuthToken } from './api';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847/career`;

export interface CareerMatch {
  career: {
    id: string;
    title: string;
    category: string;
    description: string;
    typicalPersona: string;
    growthPath: string[];
  };
  matchScore: number;
  matchLevel: 'Excellent' | 'Strong' | 'Good' | 'Moderate';
  gaps: Array<{
    dimension: string;
    dimensionKey: string;
    gap: number;
    userValue: number;
    careerValue: number;
    percentage: number;
  }>;
  skillBuilderRecommendations: Array<{
    skillDimension: string;
    reason: string;
    priority: 'High' | 'Medium' | 'Low';
  }>;
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

  if (!res.ok) throw new Error(data.error || data.message || 'Career API error');
  return data as T;
}

export const generateCareerMatches = () =>
  request<{ matches: CareerMatch[] }>('/match', { method: 'POST' }).then(r => r.matches);

export const getCareerMatches = () =>
  request<{ matches: CareerMatch[] }>('/matches').then(r => r.matches);

export const getCareerById = (careerId: string) =>
  request<{ career: any }>(`/${careerId}`).then(r => r.career);

export const getAllCareers = () =>
  request<{ totalCareers: number; categories: string[]; careers: any[] }>('/');
