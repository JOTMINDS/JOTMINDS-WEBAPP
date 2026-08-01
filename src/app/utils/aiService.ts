import { projectId, publicAnonKey } from './supabase/info';
import { AssessmentScore } from '../types';

// Use same BASE_URL strategy as api.ts
const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847`;
const LOCAL_URL = 'http://localhost:54321/functions/v1/server/make-server-fc8eb847';

// Determine if we're running locally with Supabase CLI
const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const getBaseUrl = () => {
  // If we're strictly local and there's a local edge function runner, we could use LOCAL_URL
  // But generally sticking to production or configured proxy is safer
  // For this JotMinds setup, we'll use BASE_URL and fallback if needed
  return BASE_URL;
};

export interface AIInsightsRequest {
  scores: AssessmentScore;
  role?: string;
  type?: string;
  algorithmicGuidance?: Record<string, any>;
  context?: Record<string, any>;
}

export interface AIInsightsResponse {
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  archetype: {
    name: string;
    tagline: string;
  };
  summary?: string;
}

/**
 * Calls the backend OpenAI AI proxy to generate customized insights.
 * Supports algorithmic guidance so OpenAI responses are grounded in JotMinds algorithms while providing rich variations.
 */
export async function generateAIInsights(
  scoresOrRequest: AssessmentScore | AIInsightsRequest,
  options?: Omit<AIInsightsRequest, 'scores'>
): Promise<AIInsightsResponse | null> {
  try {
    const isRequestObject = scoresOrRequest && 
      typeof scoresOrRequest === 'object' && 
      'scores' in scoresOrRequest && 
      !('kolb' in scoresOrRequest) && 
      !('sternberg' in scoresOrRequest);

    const payload = isRequestObject
      ? scoresOrRequest
      : { scores: scoresOrRequest as AssessmentScore, ...options };

    const response = await fetch(`${getBaseUrl()}/ai/generate-insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data: AIInsightsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to generate real AI insights:', error);
    return null;
  }
}

export interface AICoachChatResponse {
  reply: string;
}

/**
 * Calls the backend OpenAI proxy to chat with the AI Learning Coach.
 */
export async function askAICoach(
  message: string,
  profile?: any,
  history?: Array<{ role: string; content: string }>,
  options?: {
    role?: string;
    algorithmicGuidance?: Record<string, any>;
    scores?: AssessmentScore;
  }
): Promise<string | null> {
  try {
    const response = await fetch(`${getBaseUrl()}/ai/coach-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        message,
        profile,
        history,
        role: options?.role || profile?.role || profile?.userType,
        algorithmicGuidance: options?.algorithmicGuidance,
        scores: options?.scores
      })
    });

    if (!response.ok) {
      throw new Error(`AI Coach API error: ${response.status}`);
    }

    const data: AICoachChatResponse = await response.json();
    return data.reply;
  } catch (error) {
    console.error('Failed to communicate with AI Coach:', error);
    return null;
  }
}

export interface SchoolAIInsightsRequest {
  schoolName?: string;
  role?: string;
  metrics: Record<string, any>;
  algorithmicGuidance?: Record<string, any>;
  context?: Record<string, any>;
}

export interface SchoolAIInsightsResponse {
  executiveSummary: string;
  keyStrengths: string[];
  strategicAlerts: string[];
  actionableInterventions: {
    area: string;
    priority: 'urgent' | 'high' | 'normal';
    strategy: string;
    targetGroup: string;
  }[];
  pedagogicalAlignment?: string;
}

/**
 * Calls the backend OpenAI AI proxy to generate institutional, school-level, or classroom-level insights.
 * Guided by JotMinds proprietary group/school algorithms while producing dynamic, executive-ready variations.
 */
export async function generateSchoolAIInsights(
  request: SchoolAIInsightsRequest
): Promise<SchoolAIInsightsResponse | null> {
  try {
    const response = await fetch(`${getBaseUrl()}/ai/generate-school-insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`School AI API error: ${response.status}`);
    }

    const data: SchoolAIInsightsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to generate real School AI insights:', error);
    return null;
  }
}



