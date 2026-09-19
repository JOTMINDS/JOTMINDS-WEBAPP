import { AssessmentScore } from '../types';
import { JTIAAIRecommendations, JTIASchoolAggregatedInsights, generatePersonalizedRecommendations } from './jtiaScoring';

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
  organizationalFit?: string[];
  continuousReview?: string[];
  organizationalApplications?: string[];
  professionalDevelopmentTip?: string;
}

/**
 * Helper to call our Cloudflare Pages proxy
 */
async function callOpenAI(messages: any[], isJson = false, maxTokens = 1200) {
  const body: any = {
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.9,
    max_tokens: maxTokens
  };
  if (isJson) {
    body.response_format = { type: 'json_object' };
  }

  const makeCall = async (url: string) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`OpenAI proxy error (${res.status}): ${errText}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(`Expected JSON response but received ${contentType}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  };

  try {
    return await makeCall(`${getBaseUrl()}/openai`);
  } catch (primaryErr) {
    console.warn('Primary OpenAI proxy call failed, attempting fallback:', primaryErr);
    if (typeof window !== 'undefined' && !window.location.hostname.includes('jotminds.pages.dev')) {
      try {
        return await makeCall('https://jotminds.pages.dev/api/openai');
      } catch (fallbackErr) {
        console.error('OpenAI fallback proxy also failed:', fallbackErr);
      }
    }
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

    const isOrganizational = !!(payload as any).context?.isOrganizational;

    const prompt = `Analyze this cognitive assessment data and generate professional insights:
Scores and Profile: ${JSON.stringify({
    scores: payload.scores || (payload as any).scoresOrRequest,
    type: payload.type,
    role: payload.role,
    age: (payload as any).age,
    context: (payload as any).context
  })}

Return strictly valid JSON matching this schema:
{
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Growth area 1", "Growth area 2", "Growth area 3"],
  "improvements": ["Action 1", "Action 2"],
  "archetype": {
    "name": "E.g. The Analytical Architect",
    "tagline": "A short inspiring tagline"
  },
  "summary": "A 2-sentence professional summary."${isOrganizational ? `,
  "organizationalFit": ["Ideal for: <specific roles/functions>", "Team contribution: <specific contribution>", "Leadership style: <specific style>"],
  "continuousReview": ["Monitor: <specific thing to track>", "Develop: <specific skill/area>", "Leverage: <specific strength to apply>"],
  "organizationalApplications": ["<specific workplace application 1 tailored to this exact framework and style>", "<application 2>", "<application 3>"],
  "professionalDevelopmentTip": "A 2-3 sentence tailored professional development tip specific to this person's cognitive profile and workplace context."` : ''}
}`;

    const res = await callOpenAI([
      { role: 'system', content: `You are an expert cognitive psychologist${isOrganizational ? ' and organizational development consultant' : ''}. Always provide highly unique, creative phrasing tailored to the exact scores and framework given. Vary your vocabulary and avoid repetitive or generic insights. Never reuse boilerplate phrasing across different profiles.` },
      { role: 'user', content: prompt }
    ], true, isOrganizational ? 1200 : 800);

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
  subjectOrPayload: string | { subject: string; gradeClass: string; topic: string; durationMinutes?: number; classSummary?: any; existingPlanText?: string },
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
${typeof subjectOrPayload === 'object' && subjectOrPayload.existingPlanText ? `CRITICAL INSTRUCTION: The teacher provided an EXISTING lesson plan. You MUST tailor and enhance this exact plan to fit the class demands (using the cognitive profile summary) and curriculum. Do not ignore the existing content, rebuild upon it!
EXISTING PLAN CONTENT:
${subjectOrPayload.existingPlanText}` : ''}
${typeof subjectOrPayload === 'object' ? `Class Summary Data: ${JSON.stringify(subjectOrPayload.classSummary)}` : ''}

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
): Promise<JTIAAIRecommendations> {
  const fallback = generatePersonalizedRecommendations(
    report?.domainScores || { cognitive: 80, instructional: 85, leadership: 78, relationship: 82, professional: 84 },
    report?.strengths || [],
    report?.growthOpportunities || []
  );

  try {
    const prompt = `Generate Teaching Insights recommendations based on this teacher assessment report:
Report Data: ${JSON.stringify(report)}

Return strictly valid JSON with this exact schema:
{
  "resources": ["4 specific locally grounded teaching and learning resources (mentioning NaCCA, GES curriculum, or accessible African classroom TLMs)"],
  "activities": ["4 highly actionable classroom activities tailored to this teacher's strengths and growth areas"],
  "coaching": ["4 peer observation, coaching, or school PLC exercises"],
  "pathways": ["4 career growth pathways or leadership opportunities"],
  "executiveSummary": "A 2-3 sentence inspiring synthesis of the teacher's cognitive and pedagogical strengths",
  "pedagogicalArchetype": "e.g. Socratic Facilitator / Inquisitive Synthesizer"
}

Crucial Instructions:
1. Personalization: Address the teacher's specific score profile and growth areas.
2. Local Context: Include culturally relevant West African / Ghanaian education context (e.g. GES standards, low-cost local TLMs, school-based INSET / PLC).
3. Professionalism: Frame growth areas positively as mastery pathways.`;
    
    const res = await callOpenAI([
      { role: 'system', content: 'You are an expert teacher educator and pedagogical coach. Always return valid JSON with resources, activities, coaching, pathways.' },
      { role: 'user', content: prompt }
    ], true, 1200);

    if (res) {
      const parsed = JSON.parse(res);
      if (Array.isArray(parsed.resources) && parsed.resources.length > 0) {
        return {
          ...fallback,
          ...parsed,
          resources: parsed.resources || fallback.resources,
          activities: parsed.activities || fallback.activities,
          coaching: parsed.coaching || fallback.coaching,
          pathways: parsed.pathways || fallback.pathways,
        };
      }
    }
  } catch (error) {
    console.warn('Using personalized local recommendations fallback:', error);
  }
  return fallback;
}

function getLocalExecutiveSummaryFallback(userProfile: any): {
  narrativeSummary: string;
  keyTakeaway: string;
  personalizedMantra: string;
} {
  const name = userProfile?.name || 'This professional';
  const role = userProfile?.position || userProfile?.organization || 'educator and professional';
  
  const learning = userProfile?.learning || userProfile?.results?.learning?.style || 'Adaptive';
  const thinking = userProfile?.thinking || userProfile?.results?.thinking?.style || 'Strategic';
  const decision = userProfile?.decision || userProfile?.results?.decision?.style || 'Balanced';
  const motivation = userProfile?.motivation || 'Intrinsic';

  return {
    narrativeSummary: `${name} exhibits a distinguished cognitive profile combining ${learning} learning preferences with strong ${thinking} problem-solving capabilities. Approaching complex scenarios with a ${decision} mindset and anchored by ${motivation.toLowerCase()} drivers, they synthesize insights systematically and excel at translating conceptual models into practical outcomes in their role as an ${role}.`,
    keyTakeaway: `Thrives when provided autonomy to apply ${thinking.toLowerCase()} problem-solving techniques aligned with ${learning.toLowerCase()} experiential learning cycles.`,
    personalizedMantra: `Transform cognitive insight into practical excellence through purposeful inquiry and continuous growth.`
  };
}

export async function generateAICognitiveExecutiveSummary(
  userProfile: any
): Promise<{
  narrativeSummary: string;
  keyTakeaway: string;
  personalizedMantra: string;
}> {
  const fallback = getLocalExecutiveSummaryFallback(userProfile);
  try {
    const prompt = `Generate a rich executive summary for this user cognitive profile:
Profile Data: ${JSON.stringify(userProfile)}

Return JSON format:
{
  "narrativeSummary": "A inspiring 3-sentence summary of who they are cognitively and how they learn/work best",
  "keyTakeaway": "Single most important insight for teachers/parents/managers",
  "personalizedMantra": "A motivating 1-line quote tailored to their cognitive strengths"
}`;

    const res = await callOpenAI([
      { role: 'system', content: 'You are a master cognitive psychologist synthesizing assessment results into professional narrative summaries. Be extremely creative and vary your vocabulary significantly to ensure each summary feels totally unique.' },
      { role: 'user', content: prompt }
    ], true, 700);

    if (!res) return fallback;
    const parsed = JSON.parse(res);
    if (parsed.narrativeSummary && parsed.keyTakeaway && parsed.personalizedMantra) {
      return parsed;
    }
    return fallback;
  } catch (error) {
    console.warn('Using local executive summary fallback:', error);
    return fallback;
  }
}

export async function generateSchoolJTIAAIInsights(
  schoolInsights: any,
  schoolName?: string
): Promise<JTIASchoolAggregatedInsights['pdPriorities'] | null> {
  const cacheKey = `school_jtia_${schoolName || 'school'}_${schoolInsights?.totalTeachersAssessed || 0}`;
  const cached = getCachedAIResult<JTIASchoolAggregatedInsights['pdPriorities']>(cacheKey);
  if (cached) return cached;

  try {
    const prompt = `Generate school-wide Teaching Insights Professional Development Priorities based on this assessment data:
School Name: ${schoolName || 'The School'}
Data: ${JSON.stringify(schoolInsights)}

Crucial Instructions:
1. Ensure your phrasing is highly encouraging and acknowledges the collective strengths of the teaching staff.
2. Provide PD formats and themes that use practical context suited for modern educational excellence (e.g., INSET workshops, collaborative peer-learning cycles, low-cost scalable interventions).
3. Return strictly a JSON array of objects representing pdPriorities, each containing:
- title (string): Clear thematic title of the priority
- domain (string): One of the 5 JTIA domains (e.g. Cognitive Intelligence, Instructional Intelligence, Classroom Leadership, Relationship Intelligence, Professional Intelligence)
- averageScore (number): Current estimated score benchmark between 2.0 and 4.5
- recommendedProgram (string): Actionable program name and format (e.g. "INSET Workshop: Differentiated Pedagogy & Active Learning")
- impactArea (string): Concrete expected classroom impact and student learning outcome

Example:
{
  "pdPriorities": [
    {
      "title": "Differentiated Instruction Mastery",
      "domain": "Instructional Intelligence",
      "averageScore": 3.2,
      "recommendedProgram": "INSET Workshop: Multi-tiered Adaptive Learning Strategies",
      "impactArea": "Accelerates engagement and comprehension across diverse cognitive cohorts"
    }
  ]
}`;

    const res = await callOpenAI([
      { role: 'system', content: 'You are an expert educational consultant and school leadership strategist. Ensure your phrasing is unique, creative, and actionable.' },
      { role: 'user', content: prompt }
    ], true, 1000);

    if (res) {
      const parsed = JSON.parse(res);
      const rawList = parsed.pdPriorities || (Array.isArray(parsed) ? parsed : null);
      if (Array.isArray(rawList) && rawList.length > 0) {
        const normalized: JTIASchoolAggregatedInsights['pdPriorities'] = rawList.map((item: any, idx: number) => ({
          title: item.title || item.theme || `PD Priority ${idx + 1}`,
          domain: item.domain || 'Instructional Intelligence',
          averageScore: typeof item.averageScore === 'number' ? item.averageScore : 3.4,
          recommendedProgram: item.recommendedProgram || item.recommendedFormat || item.theme || 'INSET Collaborative Workshop',
          impactArea: item.impactArea || item.description || 'Targeted capability uplift across teacher cohort'
        }));
        setCachedAIResult(cacheKey, normalized);
        return normalized;
      }
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
  uploadText?: string;
}): Promise<any | null> {
  try {
    const prompt = `Generate a multi-format lesson assessment suite for:
Subject: ${payload.subject}
Topic: ${payload.topic}
Grade/Class: ${payload.gradeClass}
${payload.uploadText ? `Teacher Uploaded Reference Materials / Custom Assessment Base:
${payload.uploadText}
Please adapt, organize, and expand upon the teacher's uploaded assessment materials to create structured MCQs, short answers, discussion items, practical exercises, and homework.` : ''}

Return JSON with this structure:
{
  "title": "${payload.topic} Assessment Suite",
  "mcqs": [{ "id": "m1", "type": "mcq", "question": "Question text", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "Why A is correct" }],
  "shortAnswer": [{ "id": "s1", "type": "short_answer", "question": "Question text", "correctAnswer": "Model answer", "explanation": "Marking scheme note" }],
  "discussion": [{ "id": "d1", "type": "discussion", "question": "Deep thinking prompt", "explanation": "Facilitation guide" }],
  "practicalExercises": [{ "id": "p1", "type": "practical", "question": "Hands-on activity task", "explanation": "Success criteria" }],
  "homework": [{ "id": "h1", "type": "homework", "question": "Take-home extension problem", "explanation": "Target completion time: 20 mins" }]
}`;
    const res = await callOpenAI([
      { role: 'system', content: 'You are an expert assessment designer creating differentiated quizzes and homework aligned to national and international curricula.' },
      { role: 'user', content: prompt }
    ], true, 1200);
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
      content: `You are the Lesson Copilot, an expert instructional design assistant. Use this context if provided: ${JSON.stringify(context)}.
If the user explicitly asks you to create, generate, or make a lesson plan, you must output a friendly acknowledgement, and at the very end of your message on a new line, include this exact format:
[ACTION_CREATE_PLAN] Subject | Topic | Grade
Where Subject, Topic, and Grade are the variables you extract from their request. Default to "General", "General Topic", and "Any Grade" if not provided.`
    };
    const messages = [systemMsg, ...history, { role: 'user', content: message }];
    return await callOpenAI(messages, false, 800);
  } catch (err) {
    console.error('Failed to chat with Lesson Copilot:', err);
    return null;
  }
}

export interface AIStudentTeachingStrategies {
  quickInsights: { icon: string; text: string }[];
  teachingStrategies: string[];
  educationalResources: { type: 'Guide' | 'Article' | 'Video'; title: string; description: string; whyHelps: string }[];
}

export async function generateAITeachingStrategies(studentData: any): Promise<AIStudentTeachingStrategies | null> {
  const prompt = `Analyze this student's cognitive profile and generate tailored teaching strategies:
Student Data: ${JSON.stringify(studentData)}

Return ONLY JSON with this exact format:
{
  "quickInsights": [
    { "icon": "🧠", "text": "Insight about their learning style" },
    { "icon": "💡", "text": "Insight about their problem solving" },
    { "icon": "🛠️", "text": "Insight about their practical application" }
  ],
  "teachingStrategies": [
    "Specific, actionable strategy 1",
    "Specific, actionable strategy 2",
    "Specific, actionable strategy 3"
  ],
  "educationalResources": [
    { "type": "Guide", "title": "Resource Name", "description": "What it is", "whyHelps": "Why it helps this student" },
    { "type": "Video", "title": "Resource Name", "description": "What it is", "whyHelps": "Why it helps this student" },
    { "type": "Article", "title": "Resource Name", "description": "What it is", "whyHelps": "Why it helps this student" }
  ]
}`;

  const systemMsg = { 
    role: 'system', 
    content: 'You are an expert educational psychologist. ALWAYS output unique, highly creative insights tailored to the exact student metrics provided. Avoid generic phrases like "Incorporate hands-on activities" unless specifically warranted, and phrase them creatively.' 
  };

  const res = await callOpenAI([systemMsg, { role: 'user', content: prompt }], true, 1000);
  
  if (!res) return null;
  try {
    return JSON.parse(res);
  } catch {
    return null;
  }
}

export async function generateAIParentSupportTips(assessmentData: any): Promise<string[] | null> {
  const prompt = `Analyze this child's assessment profile and generate 4 highly specific, actionable parenting support tips for home life:
Assessment Profile: ${JSON.stringify(assessmentData)}

Return ONLY JSON format:
{
  "tips": [
    "Specific parenting tip 1",
    "Specific parenting tip 2",
    "Specific parenting tip 3",
    "Specific parenting tip 4"
  ]
}`;

  const systemMsg = { 
    role: 'system', 
    content: 'You are an expert child psychologist and family learning advisor. Always provide highly creative, non-repeating tips for parents.' 
  };

  const res = await callOpenAI([systemMsg, { role: 'user', content: prompt }], true, 600);
  if (!res) return null;
  try {
    const parsed = JSON.parse(res);
    return parsed.tips || null;
  } catch {
    return null;
  }
}

export interface AIEducationalResource {
  title: string;
  description: string;
  type: 'article' | 'video' | 'guide' | 'tip';
  url: string;
  relevance: string;
}

export async function generateAIEducationalResources(params: {
  learningStyle?: string;
  thinkingStyle?: string;
  decisionStyle?: string;
  userType: 'parent' | 'teacher';
}): Promise<AIEducationalResource[] | null> {
  const prompt = `Generate 4 tailored educational resources and guides for a ${params.userType} working with a student profile:
Learning Style: ${params.learningStyle || 'General'}
Thinking Style: ${params.thinkingStyle || 'General'}
Decision Style: ${params.decisionStyle || 'General'}

Return ONLY valid JSON matching this schema:
{
  "resources": [
    {
      "title": "Specific resource title",
      "description": "2-sentence practical description",
      "type": "guide",
      "url": "#",
      "relevance": "Why this aligns with their cognitive profile"
    }
  ]
}`;

  const systemMsg = { 
    role: 'system', 
    content: 'You are an educational resource specialist. Create highly inspiring, custom resource recommendations tailored specifically to the given student styles.' 
  };

  const res = await callOpenAI([systemMsg, { role: 'user', content: prompt }], true, 800);
  if (!res) return null;
  try {
    const parsed = JSON.parse(res);
    return parsed.resources || null;
  } catch {
    return null;
  }
}

export async function chatWithJotti(message: string, history: any[], context?: string, contextData?: any): Promise<string | null> {
  try {
    let contextInstructions = "";
    
    if (context === "lesson-planner") {
      contextInstructions = `You are in the Lesson Planner. If the user asks you to create a lesson plan, include this at the very end of your message on a new line: [ACTION_CREATE_PLAN] Subject | Topic | Grade.`;
    } else if (context === "analytics") {
      contextInstructions = `You are helping the teacher analyze class data and student insights. Use the provided context data to answer questions about student performance, cognitive styles, and classroom synergy.`;
    } else if (context === "students") {
      contextInstructions = `You are helping the teacher manage students. Offer advice on engaging students based on cognitive profiles, generating codes, or differentiated activities.`;
    } else if (context === "jtia") {
      contextInstructions = `You are helping the teacher interpret their Teaching Insights Assessment results. Give them empowering advice on professional development and growth.`;
    } else {
      contextInstructions = `You are a general teaching assistant on the JotMinds platform.`;
    }

    const systemMsg = {
      role: 'system',
      content: `You are Jotti, an expert, friendly AI Teaching Assistant for the JotMinds platform. 
${contextInstructions}
Context Data: ${JSON.stringify(contextData || {})}`
    };
    const messages = [systemMsg, ...history, { role: 'user', content: message }];
    return await callOpenAI(messages, false, 800);
  } catch (err) {
    console.error('Failed to chat with Jotti:', err);
    return null;
  }
}

export async function generateAICurriculumTopics(subject: string, grade: string, curriculum: string, mainTopic: string): Promise<any[] | null> {
  const prompt = `Generate a structured list of sub-topics or strands for a curriculum tracker based on the following:
Subject: ${subject}
Grade/Class: ${grade}
Curriculum Type: ${curriculum}
Main Topic/Strand: ${mainTopic}

Return ONLY a JSON array of objects, where each object has:
- title (string): The subtopic or specific lesson goal
- status (string): Must be exactly "outstanding"
- estimatedHours (number): Estimated hours to teach this subtopic (usually 1-3)

Example: [ { "title": "Introduction to Photosynthesis", "status": "outstanding", "estimatedHours": 1 } ]`;

  try {
    const res = await callOpenAI([
      { role: 'system', content: 'You are an expert curriculum designer. Output strict JSON array only.' },
      { role: 'user', content: prompt }
    ], true, 600);
    if (res) return JSON.parse(res);
  } catch (error) {
    console.error('Failed to generate curriculum topics', error);
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// Caching Helpers
// ─────────────────────────────────────────────────────────────

export function getCachedAIResult<T>(key: string): T | null {
  try {
    if (typeof window === 'undefined') return null;
    const item = sessionStorage.getItem(`jm_ai_${key}`);
    if (!item) return null;
    const parsed = JSON.parse(item);
    return parsed.data as T;
  } catch {
    return null;
  }
}

export function setCachedAIResult<T>(key: string, data: T): void {
  try {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(`jm_ai_${key}`, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // Ignore storage quota
  }
}

// ─────────────────────────────────────────────────────────────
// Student Account: Live AI Study & Exam Recommendations
// ─────────────────────────────────────────────────────────────

export interface AIStudentRecommendationItem {
  id: number;
  category: 'learning' | 'exam' | 'career';
  title: string;
  description: string;
  tag: string;
}

export async function generateAIStudentRecommendations(params: {
  userId?: string;
  name?: string;
  learningStyle: string;
  thinkingStyle: string;
  decisionStyle: string;
  educationLevel?: string;
}): Promise<AIStudentRecommendationItem[]> {
  const cacheKey = `student_recs_${params.userId || ''}_${params.learningStyle}_${params.thinkingStyle}_${params.decisionStyle}`;
  const cached = getCachedAIResult<AIStudentRecommendationItem[]>(cacheKey);
  if (cached && cached.length > 0) return cached;

  const fallback: AIStudentRecommendationItem[] = [
    {
      id: 1,
      category: 'learning',
      title: 'Active Concept Synthesis',
      description: `Based on your ${params.learningStyle} learning style, convert theoretical reading into structured visual mind maps or flowcharts to maximize retention.`,
      tag: 'Study Strategy'
    },
    {
      id: 2,
      category: 'exam',
      title: 'Timed Revision Sprints',
      description: `Leverage your ${params.thinkingStyle} thinking preference by practicing problem-solving under timed 25-minute Pomodoro intervals.`,
      tag: 'Exam Prep'
    },
    {
      id: 3,
      category: 'learning',
      title: 'Peer Teaching & Discussion',
      description: `Explain difficult concepts to a study partner in your own words to solidify comprehension and reveal subtle gaps.`,
      tag: 'Collaboration'
    },
    {
      id: 4,
      category: 'exam',
      title: 'Reflective Decision Pause',
      description: `With your ${params.decisionStyle} decision style, avoid rushing multiple-choice questions. Re-read the question stems carefully and eliminate two obviously incorrect choices first.`,
      tag: 'Exam Technique'
    },
    {
      id: 5,
      category: 'career',
      title: 'Subject & Career Alignment',
      description: `Your combination of ${params.thinkingStyle} thinking and ${params.learningStyle} learning thrives in technical and creative problem-solving fields.`,
      tag: 'Future Readiness'
    },
    {
      id: 6,
      category: 'learning',
      title: 'Interleaved Practice Sessions',
      description: `Switch between related subjects during a single study session rather than spending hours on one subject to keep your cognitive pathways agile.`,
      tag: 'Brain Efficiency'
    }
  ];

  try {
    const prompt = `Generate 6 highly personalized, creative, and actionable study and exam preparation recommendations for a student:
Student: ${params.name || 'Student'}
Learning Style: ${params.learningStyle}
Thinking Style: ${params.thinkingStyle}
Decision Style: ${params.decisionStyle}
Education Level: ${params.educationLevel || 'General'}

Return strictly JSON in this format:
{
  "recommendations": [
    {
      "id": 1,
      "category": "learning",
      "title": "Specific Strategy Name",
      "description": "2-sentence practical technique tailored to their exact style.",
      "tag": "Study Strategy"
    },
    {
      "id": 2,
      "category": "exam",
      "title": "Specific Technique Name",
      "description": "2-sentence practical exam technique tailored to their decision & thinking styles.",
      "tag": "Exam Prep"
    },
    {
      "id": 3,
      "category": "learning",
      "title": "Specific Strategy Name",
      "description": "2-sentence practical collaboration or memory tip.",
      "tag": "Collaboration"
    },
    {
      "id": 4,
      "category": "exam",
      "title": "Specific Technique Name",
      "description": "2-sentence practical decision-making strategy under exam pressure.",
      "tag": "Exam Technique"
    },
    {
      "id": 5,
      "category": "career",
      "title": "Specific Alignment Name",
      "description": "2-sentence future skills or subject alignment suggestion.",
      "tag": "Future Readiness"
    },
    {
      "id": 6,
      "category": "learning",
      "title": "Specific Habit Name",
      "description": "2-sentence mental agility or deep focus habit.",
      "tag": "Brain Efficiency"
    }
  ]
}`;

    const res = await callOpenAI([
      { role: 'system', content: 'You are an elite cognitive learning specialist for young minds. Generate encouraging, non-repetitive, evidence-based study guidance.' },
      { role: 'user', content: prompt }
    ], true, 850);

    if (res) {
      const parsed = JSON.parse(res);
      if (Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
        setCachedAIResult(cacheKey, parsed.recommendations);
        return parsed.recommendations;
      }
    }
  } catch (err) {
    console.warn('Using local fallback for student recommendations:', err);
  }

  return fallback;
}

// ─────────────────────────────────────────────────────────────
// Professional Account: Live AI Insights & Career Archetype
// ─────────────────────────────────────────────────────────────

export interface AIProfessionalProfileInsights {
  strengths: string[];
  developmentAreas: string[];
  recommendations: string[];
  idealRoles: string[];
  leadershipInsight: string;
}

export async function generateAIProfessionalProfile(profile: any): Promise<AIProfessionalProfileInsights> {
  const cacheKey = `prof_profile_${JSON.stringify(profile)}`;
  const cached = getCachedAIResult<AIProfessionalProfileInsights>(cacheKey);
  if (cached) return cached;

  const learning = profile?.learning?.style || 'Analytical Learner';
  const thinking = profile?.thinking?.style || 'Creative-Analytical';
  const decision = profile?.decisionMaking?.style || 'Balanced Decision Maker';

  const fallback: AIProfessionalProfileInsights = {
    strengths: [
      `High adaptability through ${learning.toLowerCase()} approach`,
      `Synthesizes complexity with ${thinking.toLowerCase()} methodology`,
      `Contextual precision driven by ${decision.toLowerCase()} framework`
    ],
    developmentAreas: [
      'Expand cross-functional experimentation across contrasting cognitive modes',
      'Codify intuitive insights into repeatable operational frameworks'
    ],
    recommendations: [
      'Pair with contrasting cognitive profiles for high-stakes strategic reviews',
      'Document decision patterns to continually refine mental models and intuition'
    ],
    idealRoles: [
      'Strategic Operations Lead',
      'Product & Innovation Manager',
      'Organizational Development Consultant'
    ],
    leadershipInsight: `As a professional combining ${learning.toLowerCase()} and ${thinking.toLowerCase()} competencies, your ${decision.toLowerCase()} approach empowers strategic adaptability, constructive cross-functional alignment, and contextual problem-solving across complex team challenges.`
  };

  try {
    const prompt = `Analyze this professional's cognitive assessment profile and generate executive career insights:
Profile Data: ${JSON.stringify(profile)}

Return strictly JSON in this format:
{
  "strengths": [
    "Compelling strength 1 grounded in their cognitive styles",
    "Compelling strength 2 grounded in their cognitive styles",
    "Compelling strength 3 grounded in their cognitive styles"
  ],
  "developmentAreas": [
    "Targeted growth area 1",
    "Targeted growth area 2"
  ],
  "recommendations": [
    "Actionable executive recommendation 1",
    "Actionable executive recommendation 2"
  ],
  "idealRoles": [
    "High-impact organizational role 1",
    "High-impact organizational role 2",
    "High-impact organizational role 3",
    "High-impact organizational role 4"
  ],
  "leadershipInsight": "A 2-3 sentence executive synthesis explaining how their cognitive balance drives educational, organizational, and team leadership."
}`;

    const res = await callOpenAI([
      { role: 'system', content: 'You are an executive talent strategist and industrial psychologist. Provide insightful, non-generic, high-caliber professional feedback.' },
      { role: 'user', content: prompt }
    ], true, 900);

    if (res) {
      const parsed = JSON.parse(res);
      if (parsed.strengths && parsed.recommendations && parsed.idealRoles) {
        const result: AIProfessionalProfileInsights = {
          strengths: parsed.strengths,
          developmentAreas: parsed.developmentAreas || fallback.developmentAreas,
          recommendations: parsed.recommendations,
          idealRoles: parsed.idealRoles,
          leadershipInsight: parsed.leadershipInsight || fallback.leadershipInsight
        };
        setCachedAIResult(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    console.warn('Using local fallback for professional profile insights:', err);
  }

  return fallback;
}

// ─────────────────────────────────────────────────────────────
// Teacher Account: Live AI Classroom Overview & Pedagogical Banner
// ─────────────────────────────────────────────────────────────

export interface AIClassroomOverviewInsights {
  learningInsight: string;
  thinkingInsight: string;
  decisionInsight: string;
  synergySummary: string;
}

export async function generateAIClassroomOverview(params: {
  className: string;
  studentCount: number;
  dominantLearning: string;
  dominantThinking: string;
  dominantDecision?: string;
}): Promise<AIClassroomOverviewInsights> {
  const cacheKey = `class_overview_${params.className}_${params.dominantLearning}_${params.dominantThinking}`;
  const cached = getCachedAIResult<AIClassroomOverviewInsights>(cacheKey);
  if (cached) return cached;

  const fallback: AIClassroomOverviewInsights = {
    learningInsight: `With ${params.dominantLearning} learning dominating, organize multi-sensory lessons that balance visual models with experiential peer problem-solving.`,
    thinkingInsight: `Leverage their ${params.dominantThinking} orientation by presenting open inquiry challenges supported by clear evaluative criteria.`,
    decisionInsight: `Support student decisions by allowing a 2-minute reflective pause before group presentations and tests.`,
    synergySummary: `A versatile cohort that excels when theoretical concepts are linked directly to real-world Ghanaian and global applications.`
  };

  try {
    const prompt = `Generate tailored pedagogical classroom strategies for a teacher managing this class:
Class: ${params.className}
Student Count: ${params.studentCount}
Dominant Learning Style: ${params.dominantLearning}
Dominant Thinking Style: ${params.dominantThinking}
Dominant Decision Style: ${params.dominantDecision || 'Balanced'}

Return strictly JSON:
{
  "learningInsight": "2-sentence practical instructional strategy tailored to their dominant learning style.",
  "thinkingInsight": "2-sentence practical thinking exercise tailored to their dominant thinking style.",
  "decisionInsight": "2-sentence practical decision-making and test-taking technique.",
  "synergySummary": "1-sentence overarching classroom synergy takeaway."
}`;

    const res = await callOpenAI([
      { role: 'system', content: 'You are a master pedagogical coach helping teachers differentiate instruction in diverse classrooms.' },
      { role: 'user', content: prompt }
    ], true, 600);

    if (res) {
      const parsed = JSON.parse(res);
      if (parsed.learningInsight && parsed.thinkingInsight) {
        setCachedAIResult(cacheKey, parsed);
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Using fallback for classroom overview insights:', err);
  }

  return fallback;
}

// ─────────────────────────────────────────────────────────────
// Teacher Account: Live AI Student Intervention Generator
// ─────────────────────────────────────────────────────────────

export interface AITeacherInterventionPlan {
  priority: 'urgent' | 'normal' | 'optional';
  focus: string;
  suggestions: string[];
}

export async function generateAITeacherIntervention(params: {
  studentName: string;
  riskLevel: string;
  strengths: string[];
  gaps: string[];
  dominantStyle: string;
}): Promise<AITeacherInterventionPlan> {
  const cacheKey = `intervention_${params.studentName}_${params.riskLevel}_${params.dominantStyle}`;
  const cached = getCachedAIResult<AITeacherInterventionPlan>(cacheKey);
  if (cached) return cached;

  const fallback: AITeacherInterventionPlan = {
    priority: params.riskLevel === 'high' ? 'urgent' : params.riskLevel === 'medium' ? 'normal' : 'optional',
    focus: params.riskLevel === 'high' ? `Targeted support for ${params.gaps[0] || 'foundational skills'}` : `Extending ${params.strengths[0] || 'cognitive strengths'}`,
    suggestions: [
      `Use concrete, hands-on activities to ground challenging concepts in ${params.dominantStyle} style`,
      `Pair with a supportive peer partner strong in ${params.strengths[0] || 'complementary areas'}`,
      `Offer multi-modal check-ins to monitor understanding before summative tests`
    ]
  };

  try {
    const prompt = `Generate a 3-step targeted instructional intervention plan for a teacher working with this student:
Student: ${params.studentName}
Academic/Cognitive Risk: ${params.riskLevel}
Cognitive Strengths: ${params.strengths.join(', ') || 'Emerging'}
Identified Gaps: ${params.gaps.join(', ') || 'General support needed'}
Dominant Learning Style: ${params.dominantStyle}

Return strictly JSON:
{
  "priority": "${params.riskLevel === 'high' ? 'urgent' : params.riskLevel === 'medium' ? 'normal' : 'optional'}",
  "focus": "Brief 1-sentence targeted focal goal",
  "suggestions": [
    "Specific differentiated teaching action 1",
    "Specific differentiated teaching action 2",
    "Specific differentiated teaching action 3"
  ]
}`;

    const res = await callOpenAI([
      { role: 'system', content: 'You are an educational intervention specialist. Generate practical, highly specific classroom differentiation tips.' },
      { role: 'user', content: prompt }
    ], true, 500);

    if (res) {
      const parsed = JSON.parse(res);
      if (parsed.suggestions && parsed.suggestions.length > 0) {
        setCachedAIResult(cacheKey, parsed);
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Using local fallback for teacher intervention:', err);
  }

  return fallback;
}

// ─────────────────────────────────────────────────────────────
// Student Account: Unified Tri-Framework Combined Profile Insights
// ─────────────────────────────────────────────────────────────

export interface AICombinedProfileInsights {
  strengths: string[];
  growthAreas: string[];
  recommendations: string[];
}

export async function generateAICombinedProfileInsights(params: {
  userName?: string;
  kolbStyle?: string;
  sternbergStyle?: string;
  dualProcessStyle?: string;
  scores?: any;
}): Promise<AICombinedProfileInsights> {
  const cacheKey = `combined_profile_${params.kolbStyle || ''}_${params.sternbergStyle || ''}_${params.dualProcessStyle || ''}`;
  const cached = getCachedAIResult<AICombinedProfileInsights>(cacheKey);
  if (cached) return cached;

  const fallback: AICombinedProfileInsights = {
    strengths: [
      `Synthesizes concepts quickly leveraging ${params.kolbStyle || 'experiential'} learning strategies.`,
      `Demonstrates strong ${params.sternbergStyle || 'analytical'} thinking when diagnosing complex problems.`,
      `Maintains dynamic cognitive agility across both intuitive and systematic decision domains.`
    ],
    growthAreas: [
      'Balance fast intuitive assessments with rigorous evidence cross-checks in high-stakes settings.',
      'Actively cultivate reflective learning intervals between active project sprints.'
    ],
    recommendations: [
      'Adopt interleaved learning blocks to connect theoretical insights with active experimentation.',
      'Maintain an active decision journal to calibrate intuition with measurable outcomes.',
      'Engage in peer discussion to articulate reasoning pathways and reinforce memory consolidation.'
    ]
  };

  try {
    const prompt = `Synthesize a unified tri-framework cognitive analysis for this student:
Student: ${params.userName || 'Student'}
Learning Style (Kolb): ${params.kolbStyle || 'Adaptive'}
Thinking Style (Sternberg): ${params.sternbergStyle || 'Analytical-Creative'}
Decision-Making Style (Dual Process): ${params.dualProcessStyle || 'Balanced System 1 & 2'}
Detailed Scores: ${JSON.stringify(params.scores || {})}

Return strictly a JSON object with:
{
  "strengths": [
    "Compelling strength 1 grounded in their 3 styles",
    "Compelling strength 2 grounded in their 3 styles",
    "Compelling strength 3 grounded in their 3 styles"
  ],
  "growthAreas": [
    "Constructive growth focus area 1",
    "Constructive growth focus area 2"
  ],
  "recommendations": [
    "Practical, actionable study recommendation 1",
    "Practical, actionable study recommendation 2",
    "Practical, actionable study recommendation 3"
  ]
}`;

    const res = await callOpenAI([
      { role: 'system', content: 'You are an elite educational neuroscientist and student cognitive advisor. Provide inspiring, non-generic, high-utility feedback.' },
      { role: 'user', content: prompt }
    ], true, 800);

    if (res) {
      const parsed = JSON.parse(res);
      if (parsed.strengths && parsed.recommendations) {
        const result: AICombinedProfileInsights = {
          strengths: parsed.strengths,
          growthAreas: parsed.growthAreas || fallback.growthAreas,
          recommendations: parsed.recommendations
        };
        setCachedAIResult(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    console.warn('Using local fallback for combined profile insights:', err);
  }

  return fallback;
}

