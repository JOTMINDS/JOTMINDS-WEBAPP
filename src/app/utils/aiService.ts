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
      temperature: 0.9,
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
      body: JSON.stringify(body),
      cache: 'no-store'
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
Scores and Profile: ${JSON.stringify({
    scores: payload.scores || (payload as any).scoresOrRequest,
    type: payload.type,
    role: payload.role,
    age: (payload as any).age
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
  "summary": "A 2-sentence professional summary."
}`;

    const res = await callOpenAI([
      { role: 'system', content: 'You are an expert cognitive psychologist. Always provide highly unique, creative phrasing. Vary your vocabulary and avoid repetitive or generic insights.' },
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
): Promise<JTIAAIRecommendations | null> {
  try {
    const prompt = `Generate Teaching Insights recommendations based on this report:
Report Data: ${JSON.stringify(report)}

Return JSON matching the JTIAAIRecommendations interface format precisely (executiveSummary, pedagogicalArchetype, personalizedStrategies, professionalDevelopment).

Crucial Instructions:
1. Personalization: Use empowering, highly personalized language (e.g., "Your unique strength in...", "You have a natural ability to...").
2. Local Context: When suggesting resources or strategies, use culturally relevant local references suited for the Ghanaian/African education market (e.g., GES curriculum context, local classroom realities, accessible low-cost materials).
3. Growth Mindset: Frame growth opportunities as exciting pathways for professional mastery rather than deficits.`;
    
    const res = await callOpenAI([
      { role: 'system', content: 'You are an expert teacher trainer and pedagogical coach. Ensure your phrasing is highly unique, creative, and personalized to the specific metrics.' },
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
    { role: 'system', content: 'You are a master cognitive psychologist synthesizing assessment results into professional narrative summaries. Be extremely creative and vary your vocabulary significantly to ensure each summary feels totally unique.' },
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
    const prompt = `Generate school-wide Teaching Insights Professional Development Priorities based on this data:
School Name: ${schoolName || 'The School'}
Data: ${JSON.stringify(schoolInsights)}

Crucial Instructions:
1. Ensure your phrasing is highly encouraging and acknowledges the collective strengths of the teaching staff.
2. Provide PD formats and themes that use local context suited for the Ghanaian/African education market (e.g. INSET trainings, GES curriculum alignment, low-cost scalable workshops).
3. Return strictly a JSON array of objects representing pdPriorities, each containing:
- theme (string)
- description (string)
- priority (number, 1-3)
- recommendedFormat (string)

Example: { "pdPriorities": [ { "theme": "...", "description": "...", "priority": 1, "recommendedFormat": "INSET Workshop" } ] }`;

    const res = await callOpenAI([
      { role: 'system', content: 'You are an expert educational consultant planning professional development. Ensure your phrasing is unique, creative, and avoids repetitive generic templates.' },
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
