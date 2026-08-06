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
  }
}

/**
 * Sends chat messages to OpenAI AI Coach.
 */
export async function sendAIChatMessage(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  userProfile?: any
): Promise<string | null> {
  const apiKey = (import.meta.env.VITE_OPENAI_API_KEY as string) || '';

  // 1. Try direct OpenAI API call if key is present
  if (apiKey) {
    try {
      const systemMsg = {
        role: 'system',
        content: `You are the JotMinds AI Learning Coach, an encouraging, empathetic, and expert educational AI assistant.
You provide personalized study strategies, learning advice, and cognitive guidance.
${userProfile ? `User Profile context: ${JSON.stringify(userProfile)}` : ''}

Keep answers concise (2-4 paragraphs), warm, structured, and practical. Use markdown formatting.`
      };

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [systemMsg, ...messages],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return content;
      }
    } catch (e) {
      console.warn('Direct OpenAI call failed, falling back to server route:', e);
    }
  }

  // 2. Fallback to Supabase Edge Function endpoint
  try {
    const response = await fetch(`${getBaseUrl()}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ messages, userProfile })
    });

    if (response.ok) {
      const data = await response.json();
      return data.reply || null;
    }
  } catch (error) {
    console.error('Failed to communicate with AI chat service:', error);
  }

  return null;
}

const OPENAI_KEY = (import.meta.env.VITE_OPENAI_API_KEY as string) || '';

async function callOpenAI(messages: any[], isJson = false, maxTokens = 800) {
  if (!OPENAI_KEY) return null;
  try {
    const body: any = {
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: maxTokens
    };
    if (isJson) {
      body.response_format = { type: 'json_object' };
    }
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (e) {
    console.error('OpenAI call error:', e);
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

/**
 * 1. AI Lesson Plan Generator
 */
export async function generateAILessonPlan(
  subjectOrPayload: string | { subject: string; gradeClass: string; topic: string; durationMinutes?: number; classSummary?: any },
  topic?: string,
  grade?: string,
  curriculum?: string,
  customQuestions?: string
): Promise<{
  objectives: string[];
  differentiationStrategies: { style: string; activity: string }[];
  assessmentQuestions: { question: string; answer: string }[];
  summary: string;
} | any | null> {
  if (typeof subjectOrPayload === 'object' && subjectOrPayload !== null) {
    try {
      const response = await fetch(`${getBaseUrl()}/ai/generate-lesson-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          ...subjectOrPayload,
          scientificPositioning: getScientificPositioningContext('lesson-planner')
        })
      });
      if (!response.ok) throw new Error(`Lesson Plan AI error: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error('Failed to generate AI Lesson Plan:', err);
    }
  }

  const subjectStr = typeof subjectOrPayload === 'string' ? subjectOrPayload : subjectOrPayload.subject;
  const topicStr = topic || (typeof subjectOrPayload === 'object' ? subjectOrPayload.topic : '');
  const gradeStr = grade || (typeof subjectOrPayload === 'object' ? subjectOrPayload.gradeClass : '');

  const prompt = `Generate a comprehensive differentiated lesson plan for:
Subject: ${subjectStr}
Topic: ${topicStr}
Grade/Level: ${gradeStr}
Curriculum Standard: ${curriculum || 'Standard'}
${customQuestions ? `Custom Assessment Questions requested by teacher: ${customQuestions}` : ''}

Respond strictly with valid JSON with this structure:
{
  "summary": "Brief 2-sentence overview of the lesson",
  "objectives": ["Objective 1", "Objective 2", "Objective 3"],
  "differentiationStrategies": [
    { "style": "Visual Learners", "activity": "Specific activity description" },
    { "style": "Auditory Learners", "activity": "Specific activity description" },
    { "style": "Kinesthetic Learners", "activity": "Specific activity description" },
    { "style": "Analytical Thinkers", "activity": "Specific activity description" }
  ],
  "assessmentQuestions": [
    { "question": "Question 1", "answer": "Answer 1" },
    { "question": "Question 2", "answer": "Answer 2" },
    { "question": "Question 3", "answer": "Answer 3" }
  ]
}`;

  const res = await callOpenAI([
    { role: 'system', content: 'You are an expert curriculum designer and educational consultant specializing in differentiated instruction and African/international curricula.' },
    { role: 'user', content: prompt }
  ], true, 1200);

  if (!res) return null;
  try {
    return JSON.parse(res);
  } catch {
    return null;
  }
}

/**
 * 2. AI Career Insights & Path Analysis
 */
export async function generateAICareerInsights(
  archetype: string,
  strengths: string[],
  scores?: any
): Promise<{
  careerMatches: { title: string; rationale: string; keySkills: string[] }[];
  advice: string;
} | null> {
  const prompt = `Analyze this student cognitive profile and generate tailored career recommendations:
Archetype: ${archetype}
Top Strengths: ${strengths.join(', ')}
${scores ? `Scores: ${JSON.stringify(scores)}` : ''}

Return JSON with format:
{
  "advice": "Encouraging 2-sentence overview of career direction",
  "careerMatches": [
    { "title": "Career Name 1", "rationale": "Why this aligns with their cognitive style", "keySkills": ["Skill 1", "Skill 2"] },
    { "title": "Career Name 2", "rationale": "Why this aligns with their cognitive style", "keySkills": ["Skill 1", "Skill 2"] },
    { "title": "Career Name 3", "rationale": "Why this aligns with their cognitive style", "keySkills": ["Skill 1", "Skill 2"] }
  ]
}`;

  const res = await callOpenAI([
    { role: 'system', content: 'You are an AI career counselor and educational psychologist specializing in cognitive talent matching.' },
    { role: 'user', content: prompt }
  ], true, 1000);

  if (!res) return null;
  try {
    return JSON.parse(res);
  } catch {
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

/**
 * 3. AI Guided Reflection Feedback
 */
export async function generateAIReflectionFeedback(
  reflectionText: string,
  promptTopic?: string
): Promise<{
  encouragement: string;
  insight: string;
  actionableStep: string;
} | null> {
  const prompt = `A student wrote this self-reflection journal entry:
${promptTopic ? `Prompt Topic: ${promptTopic}` : ''}
Student Writing: "${reflectionText}"

Provide empathetic, constructive coaching feedback in JSON format:
{
  "encouragement": "Warm 1-2 sentence praise acknowledging their effort and honesty",
  "insight": "Deeper psychological insight into what their reflection reveals about their growth mindset",
  "actionableStep": "One clear, concrete micro-action they can try tomorrow"
}`;

  const res = await callOpenAI([
    { role: 'system', content: 'You are a warm, supportive educational mentor helping students build metacognition and emotional intelligence.' },
    { role: 'user', content: prompt }
  ], true, 600);

  if (!res) return null;
  try {
    return JSON.parse(res);
  } catch {
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

/**
 * 4. AI Executive Cognitive Profile Summary
 */
export async function generateAICognitiveExecutiveSummary(
  userProfile: any
): Promise<{
  narrativeSummary: string;
  keyTakeaway: string;
  personalizedMantra: string;
} | null> {
  const prompt = `Generate a rich executive summary for this user cognitive profile:
Profile Data: ${JSON.stringify(userProfile)}

Return JSON format:
{
  "narrativeSummary": "A inspiring 3-sentence summary of who they are cognitively and how they learn/work best",
  "keyTakeaway": "Single most important insight for teachers/parents/managers",
  "personalizedMantra": "A motivating 1-line quote tailored to their cognitive strengths"
}`;

  const res = await callOpenAI([
    { role: 'system', content: 'You are a master cognitive psychologist synthesizing assessment results into professional narrative summaries.' },
    { role: 'user', content: prompt }
  ], true, 700);

  if (!res) return null;
  try {
    return JSON.parse(res);
  } catch {
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

/**
 * 5. AI Custom Study Strategy Generator
 */
export async function generateAIStudyStrategy(
  subject: string,
  learningStyle: string,
  examGoal?: string
): Promise<{
  techniques: { name: string; description: string; duration: string }[];
  weeklyRoutine: string;
} | null> {
  const prompt = `Create a custom study strategy for:
Subject: ${subject}
Learning Style: ${learningStyle}
${examGoal ? `Goal: ${examGoal}` : ''}

Return JSON format:
{
  "weeklyRoutine": "Overview of recommended study cadence",
  "techniques": [
    { "name": "Technique 1", "description": "How to apply it for ${subject}", "duration": "e.g. 25 mins daily" },
    { "name": "Technique 2", "description": "How to apply it for ${subject}", "duration": "e.g. 30 mins 3x/week" },
    { "name": "Technique 3", "description": "How to apply it for ${subject}", "duration": "e.g. 15 mins post-class" }
  ]
}`;

  const res = await callOpenAI([
    { role: 'system', content: 'You are an academic coach specializing in evidence-based study techniques (active recall, spaced repetition, Feynman technique).' },
    { role: 'user', content: prompt }
  ], true, 800);

  if (!res) return null;
  try {
    return JSON.parse(res);
  } catch {
    return null;
  }
}

/**
 * 6. AI Daily Discovery & Brain Challenge Generator
 */
export async function generateAIDailyDiscovery(
  category: string = 'Cognitive Science'
): Promise<{
  title: string;
  fact: string;
  challengeQuestion: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
} | null> {
  const prompt = `Generate a fun, fascinating daily brain discovery and challenge question for students in the category of "${category}".

Return JSON format:
{
  "title": "Catchy Discovery Title",
  "fact": "Fascinating 2-sentence educational fact",
  "challengeQuestion": "A fun multiple-choice question testing understanding of the fact",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswerIndex": 0,
  "explanation": "Why this answer is correct"
}`;

  const res = await callOpenAI([
    { role: 'system', content: 'You are a fun science communicator creating engaging daily learning snippets for youth.' },
    { role: 'user', content: prompt }
  ], true, 700);

  if (!res) return null;
  try {
    return JSON.parse(res);
  } catch {
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

