import { projectId, publicAnonKey } from './supabase/info';
import { AssessmentScore } from '../types';
import { JTIAAIRecommendations, JTIASchoolAggregatedInsights } from './jtiaScoring';

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
  scientificPositioning?: Record<string, any>;
}

export interface ScientificPositioningContext {
  frameworks: Array<{
    name: string;
    author: string;
    construct: string;
    relevance: string;
  }>;
  scientificGroundingSummary: string;
}

/**
 * Returns theoretical frameworks and scientific research grounding for AI positioning
 */
export function getScientificPositioningContext(assessmentType?: string): ScientificPositioningContext {
  return {
    frameworks: [
      {
        name: "Experiential Learning Theory",
        author: "David Kolb",
        construct: "Learning Modes (Concrete Experience, Reflective Observation, Abstract Conceptualization, Active Experimentation)",
        relevance: "Grounds individual learning cycle preferences and experiential absorption."
      },
      {
        name: "Triarchic Theory of Human Intelligence",
        author: "Robert Sternberg",
        construct: "Analytical, Creative, and Practical Intelligence",
        relevance: "Grounds cognitive problem-solving, innovation, and contextual application."
      },
      {
        name: "Dual-Process Theory of Cognition",
        author: "Daniel Kahneman & Amos Tversky",
        construct: "System 1 (Intuitive/Fast) vs. System 2 (Analytical/Deliberate) Decision Processing",
        relevance: "Grounds real-time classroom decision making under ambiguity and time pressure."
      },
      {
        name: "Pedagogical Content Knowledge (PCK)",
        author: "Lee Shulman",
        construct: "Intersection of Subject Matter Knowledge and Pedagogical Craft",
        relevance: "Grounds teacher intelligence domains in instructional strategy and content delivery."
      },
      {
        name: "Metacognition and Self-Regulation",
        author: "John Flavell",
        construct: "Metacognitive Knowledge & Regulation of Cognitive Activities",
        relevance: "Grounds reflective practice, adaptive decision-making, and professional growth."
      },
      {
        name: "Visible Learning & Evidence-Based Feedback",
        author: "John Hattie",
        construct: "Effect Sizes for Formative Evaluation, Active Learning, and Differentiated Instruction",
        relevance: "Grounds growth opportunities in empirical educational research."
      }
    ],
    scientificGroundingSummary: "JotMinds assessments are scientifically grounded in established cognitive psychology, experiential learning, dual-process decision theories, and evidence-based pedagogical frameworks."
  };
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
      ? { ...scoresOrRequest, scientificPositioning: getScientificPositioningContext((scoresOrRequest as any).type) }
      : { scores: scoresOrRequest as AssessmentScore, scientificPositioning: getScientificPositioningContext(options?.type), ...options };

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
        scores: options?.scores,
        scientificPositioning: getScientificPositioningContext(options?.role)
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

export async function generateJTIAAIRecommendations(
  report: any
): Promise<JTIAAIRecommendations | null> {
  try {
    const response = await fetch(`${getBaseUrl()}/ai/generate-jtia-insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        report,
        scientificPositioning: getScientificPositioningContext('jtia')
      })
    });

    if (!response.ok) {
      throw new Error(`JTIA AI API error: ${response.status}`);
    }

    const data: JTIAAIRecommendations = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to generate real JTIA AI recommendations:', error);
    return null;
  }
}

export async function generateSchoolJTIAAIInsights(
  schoolInsights: any,
  schoolName?: string
): Promise<JTIASchoolAggregatedInsights['pdPriorities'] | null> {
  try {
    const response = await fetch(`${getBaseUrl()}/ai/generate-school-jtia-insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        schoolInsights,
        schoolName,
        scientificPositioning: getScientificPositioningContext('school-jtia')
      })
    });

    if (!response.ok) {
      throw new Error(`School JTIA AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.pdPriorities || null;
  } catch (error) {
    console.error('Failed to generate real School JTIA AI insights:', error);
    return null;
  }
}

// ─── AI LESSON PLANNER PROXY FUNCTIONS ──────────────────────────────────────────

export async function generateAILessonPlan(payload: {
  subject: string;
  gradeClass: string;
  topic: string;
  durationMinutes: number;
  classSummary?: any;
}): Promise<any | null> {
  try {
    const response = await fetch(`${getBaseUrl()}/ai/generate-lesson-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        ...payload,
        scientificPositioning: getScientificPositioningContext('lesson-planner')
      })
    });
    if (!response.ok) throw new Error(`Lesson Plan AI error: ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error('Failed to generate AI Lesson Plan:', err);
    return null;
  }
}

export async function generateAIDifferentiatedInstruction(payload: {
  subject: string;
  topic: string;
  gradeClass: string;
  classSummary?: any;
}): Promise<any | null> {
  try {
    const response = await fetch(`${getBaseUrl()}/ai/generate-differentiated-instruction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        ...payload,
        scientificPositioning: getScientificPositioningContext('differentiated-instruction')
      })
    });
    if (!response.ok) throw new Error(`Differentiated Instruction AI error: ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error('Failed to generate Differentiated Instruction:', err);
    return null;
  }
}

export async function generateAILessonAssessment(payload: {
  subject: string;
  topic: string;
  gradeClass: string;
}): Promise<any | null> {
  try {
    const response = await fetch(`${getBaseUrl()}/ai/generate-lesson-assessment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        ...payload,
        scientificPositioning: getScientificPositioningContext('lesson-assessment')
      })
    });
    if (!response.ok) throw new Error(`Lesson Assessment AI error: ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error('Failed to generate Lesson Assessment:', err);
    return null;
  }
}

export async function chatWithLessonCopilot(message: string, history: any[], context?: any): Promise<string | null> {
  try {
    const response = await fetch(`${getBaseUrl()}/ai/lesson-copilot-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        message,
        history,
        context,
        scientificPositioning: getScientificPositioningContext('lesson-copilot')
      })
    });
    if (!response.ok) throw new Error(`Copilot AI error: ${response.status}`);
    const data = await response.json();
    return data.reply || null;
  } catch (err) {
    console.error('Failed to chat with Lesson Copilot:', err);
    return null;
  }
}




