import { projectId, publicAnonKey } from './supabase/info';
import { AssessmentScore } from '../types';

// Use same BASE_URL strategy as api.ts
const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-fc8eb847`;
const LOCAL_URL = 'http://localhost:54321/functions/v1/make-server-fc8eb847';

// Determine if we're running locally with Supabase CLI
const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const getBaseUrl = () => {
  // If we're strictly local and there's a local edge function runner, we could use LOCAL_URL
  // But generally sticking to production or configured proxy is safer
  // For this JotMinds setup, we'll use BASE_URL and fallback if needed
  return BASE_URL;
};

export interface AIInsightsResponse {
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  archetype: {
    name: string;
    tagline: string;
  };
}

/**
 * Calls the backend Gemini AI proxy to generate customized insights.
 */
export async function generateAIInsights(scores: AssessmentScore): Promise<AIInsightsResponse | null> {
  try {
    const response = await fetch(`${getBaseUrl()}/ai/generate-insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ scores })
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
