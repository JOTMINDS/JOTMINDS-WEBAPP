import { AssessmentScore } from '../types';
import { JTIAAIRecommendations, JTIASchoolAggregatedInsights } from './jtiaScoring';

// We now securely proxy through our Cloudflare Pages Function
const getBaseUrl = () => {
  return '/api';
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
        relevance: "Grounds teaching insights domains in instructional strategy and content delivery."
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
 * Helper to call our Cloudflare Pages proxy
 */
async function callOpenAI(messages: any[], isJson = false, maxTokens = 1200) {
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
    const res = await fetch(`${getBaseUrl()}/openai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      console.error('OpenAI proxy error:', res.statusText);
      return null;
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (e) {
    console.error('OpenAI proxy call error:', e);
    return null;
  }
}

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

    const prompt = `Analyze this cognitive assessment data and generate professional insights:
Payload: ${JSON.stringify(payload)}

Return strictly valid JSON matching this schema:
{
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Growth area 1", "Growth area 2", "Growth area 3"],
  "improvements": ["Action 1", "Action 2"],
  "archetype": {
    "name": "E.g. The Analytical Architect",
    "tagline": "A short inspiring tagline"
  },
  "summary": "A 2-sentence professional summary."
}`;

    const res = await callOpenAI([
      { role: 'system', content: 'You are an expert cognitive psychologist.' },
      { role: 'user', content: prompt }
    ], true, 800);

    if (res) return JSON.parse(res);
  } catch (error) {
    console.error('Failed to generate AI insights:', error);
  }
  return null;
}

export async function sendAIChatMessage(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  userProfile?: any
): Promise<string | null> {
  try {
    const systemMsg = {
      role: 'system',
      content: `You are the JotMinds AI Learning Coach, an encouraging, empathetic, and expert educational AI assistant.
You provide personalized study strategies, learning advice, and cognitive guidance.
${userProfile ? `User Profile context: ${JSON.stringify(userProfile)}` : ''}

Keep answers concise (2-4 paragraphs), warm, structured, and practical. Use markdown formatting.`
    };

    const res = await callOpenAI([systemMsg, ...messages], false, 800);
    return res;
  } catch (error) {
    console.error('Failed to communicate with AI chat service:', error);
    return null;
  }
}

export interface AICoachChatResponse {
  reply: string;
}

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
    const systemMsg = {
      role: 'system',
      content: `You are an expert educational AI coach. Use this profile context to personalize your advice:
Profile: ${JSON.stringify(profile)}
Options: ${JSON.stringify(options)}
Keep answers concise, warm, structured, and highly practical. Use markdown.`
    };

    const messages = [systemMsg];
    if (history) {
      messages.push(...history);
    }
    messages.push({ role: 'user', content: message });

    const res = await callOpenAI(messages, false, 800);
    return res;
  } catch (error) {
    console.error('Failed to communicate with AI Coach:', error);
    return null;
  }
}

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
  const subjectStr = typeof subjectOrPayload === 'string' ? subjectOrPayload : subjectOrPayload.subject;
  const topicStr = topic || (typeof subjectOrPayload === 'object' ? subjectOrPayload.topic : '');
  const gradeStr = grade || (typeof subjectOrPayload === 'object' ? subjectOrPayload.gradeClass : '');

  const prompt = `Generate a comprehensive differentiated lesson plan for:
Subject: ${subjectStr}
Topic: ${topicStr}
Grade/Level: ${gradeStr}
Curriculum Standard: ${curriculum || 'Standard'}
${customQuestions ? `Custom Assessment Questions requested by teacher: ${customQuestions}` : ''}
${typeof subjectOrPayload === 'object' ? `Additional payload: ${JSON.stringify(subjectOrPayload)}` : ''}

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
    const prompt = `Generate institutional insights based on this school data:
Payload: ${JSON.stringify(request)}

Return JSON with format:
{
  "executiveSummary": "A 2-3 sentence overview.",
  "keyStrengths": ["Strength 1", "Strength 2"],
  "strategicAlerts": ["Alert 1", "Alert 2"],
  "actionableInterventions": [
    { "area": "E.g. Mathematics", "priority": "high", "strategy": "Describe strategy", "targetGroup": "E.g. Grade 10" }
  ],
  "pedagogicalAlignment": "Brief description of pedagogical alignment."
}`;
    const res = await callOpenAI([
      { role: 'system', content: 'You are an expert school administrator and educational data analyst.' },
      { role: 'user', content: prompt }
    ], true, 1000);

    if (res) return JSON.parse(res);
  } catch (error) {
    console.error('Failed to generate School AI insights:', error);
  }
  return null;
}

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
    const prompt = `Generate JTIA teaching insights recommendations based on this report:
Report Data: ${JSON.stringify(report)}

Return JSON matching the JTIAAIRecommendations interface format precisely, which includes executiveSummary, pedagogicalArchetype (name, description, cognitiveAlignment), personalizedStrategies (array of domain, strategies, implementation), and professionalDevelopment (focusAreas, suggestedResources).`;
    
    const res = await callOpenAI([
      { role: 'system', content: 'You are an expert teacher trainer and pedagogical coach.' },
      { role: 'user', content: prompt }
    ], true, 1200);

    if (res) return JSON.parse(res);
  } catch (error) {
    console.error('Failed to generate JTIA AI recommendations:', error);
  }
  return null;
}

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
    const prompt = `Generate school-wide JTIA PD Priorities based on this data:
School Name: ${schoolName || 'The School'}
Data: ${JSON.stringify(schoolInsights)}

Return strictly a JSON array of objects representing pdPriorities, each containing:
- theme (string)
- description (string)
- priority (number, 1-3)
- recommendedFormat (string)

Example: { "pdPriorities": [ { "theme": "...", "description": "...", "priority": 1, "recommendedFormat": "Workshop" } ] }`;

    const res = await callOpenAI([
      { role: 'system', content: 'You are an expert educational consultant planning professional development for a whole school.' },
      { role: 'user', content: prompt }
    ], true, 1000);

    if (res) {
      const parsed = JSON.parse(res);
      return parsed.pdPriorities || parsed;
    }
  } catch (error) {
    console.error('Failed to generate School JTIA AI insights:', error);
  }
  return null;
}

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
    const prompt = `Generate differentiated instruction strategies:
Payload: ${JSON.stringify(payload)}
Return JSON with structured strategies.`;
    const res = await callOpenAI([
      { role: 'system', content: 'You are an expert in differentiated instruction.' },
      { role: 'user', content: prompt }
    ], true, 800);
    if (res) return JSON.parse(res);
  } catch (err) {
    console.error('Failed to generate Differentiated Instruction:', err);
  }
  return null;
}

export async function generateAILessonAssessment(payload: {
  subject: string;
  topic: string;
  gradeClass: string;
}): Promise<any | null> {
  try {
    const prompt = `Generate a lesson assessment format:
Payload: ${JSON.stringify(payload)}
Return JSON with assessment questions, answers, and rubrics.`;
    const res = await callOpenAI([
      { role: 'system', content: 'You are an expert assessment designer.' },
      { role: 'user', content: prompt }
    ], true, 800);
    if (res) return JSON.parse(res);
  } catch (err) {
    console.error('Failed to generate Lesson Assessment:', err);
  }
  return null;
}

export async function chatWithLessonCopilot(message: string, history: any[], context?: any): Promise<string | null> {
  try {
    const systemMsg = {
      role: 'system',
      content: `You are the Lesson Copilot, an expert instructional design assistant. Use this context if provided: ${JSON.stringify(context)}`
    };
    const messages = [systemMsg, ...history, { role: 'user', content: message }];
    return await callOpenAI(messages, false, 800);
  } catch (err) {
    console.error('Failed to chat with Lesson Copilot:', err);
    return null;
  }
}
