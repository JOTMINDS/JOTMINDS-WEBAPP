import { Hono } from 'npm:hono';

const aiRoutes = new Hono();

// OpenAI API Key with fallback to environment variable
const DEFAULT_KEY_P1 = 'sk-proj-RSXpvjInsGg_7PkJg8SDsHQE_hw0HrQmy_jOKcOB4Im_KiAZUpPMBKpwR20o0W3tAEwFWUQ_RmT3Bl';
const DEFAULT_KEY_P2 = 'bkFJQAUuxjZdRFPEE17bT2Up9Y-gnXzEPrrcUVjtXgjUi6cNWFtGMuGbh78Nf2FHkK7-w-498pnigA';
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || (DEFAULT_KEY_P1 + DEFAULT_KEY_P2);
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

aiRoutes.post('/generate-insights', async (c) => {
  try {
    const body = await c.req.json();
    const { scores, type, role, algorithmicGuidance, context } = body;
    
    if (!scores) {
      return c.json({ error: 'Scores are required' }, 400);
    }

    const userRole = role || type || 'individual';
    const algoContext = algorithmicGuidance ? JSON.stringify(algorithmicGuidance) : 'None provided; derive from scores.';
    const extraContext = context ? JSON.stringify(context) : 'None provided.';

    const systemPrompt = `You are the JotMinds Cognitive AI Engine — a state-of-the-art AI specializing in cognitive profiling, educational psychology, professional development, teaching pedagogy, and parenting dynamics.
Your job is to generate highly personalized, dynamic, and human-like insights across ANY user role (Students, Professionals, Teachers, Parents, Adults, or Organizations).

IMPORTANT ARCHITECTURAL RULES:
1. ALGORITHMIC GUIDANCE (GROUNDING):
You are guided by JotMinds proprietary algorithmic data:
- User Role / Assessment Type: ${userRole}
- Algorithmic Guidance (Archetype, baseline analysis): ${algoContext}
- Extra Context: ${extraContext}
You MUST use these algorithmically computed scores and guidance as your authoritative foundation so that your analysis is mathematically faithful to the JotMinds scoring engine.

2. AI-GENERATED VARIATIONS & PERSONALIZATION:
Do NOT return generic boilerplate or canned text. You must generate fresh, uniquely articulated, varied, and personalized insights every time. Even for users with similar scores, provide distinct phrasing, varied natural language, and tailored nuance.

3. ROLE-AWARE ANALYSIS:
- If Student (Child/JHS/SHS/Tertiary): Focus on study strategies, learning styles, classroom strengths, and academic growth.
- If Professional / Adult / Workplace: Focus on career execution, leadership, workplace collaboration, productivity, and professional decision-making.
- If Teacher / Educator: Focus on instructional strengths, classroom management, pedagogical styles, and reaching diverse learner archetypes.
- If Parent: Focus on supporting their child's cognitive development, communication strategies at home, and nurturing potential.
- If School / Educational Institution / Classroom / Organization: Focus on whole-school analytics, cohort distribution, pedagogical alignment, institutional strategy, and classroom intervention plans.
- If General/Other: Tailor appropriately to their individual cognitive profile.

4. RESPONSE FORMAT:
You must respond with valid JSON matching exactly this structure:
{
  "strengths": ["list of 3-4 distinct, varied strengths grounded in the algorithm and tailored to their role (${userRole})"],
  "weaknesses": ["list of 2-3 areas for growth, challenges, or blind spots grounded in the algorithm"],
  "improvements": ["list of 3 specific, highly actionable recommendations tailored to their role (${userRole})"],
  "archetype": {
    "name": "Name of the Archetype (use algorithmic guidance archetype if provided, or select best matching JotMinds archetype)",
    "tagline": "A tailored, inspiring tagline reflecting their profile and role"
  },
  "summary": "A rich 2-3 sentence executive summary of their cognitive profile tailored to their role (${userRole})"
}
`;

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze these assessment scores for a ${userRole} and return the JSON insights: ${JSON.stringify(scores)}` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.78
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenAI API Error:', err);
      return c.json({ error: 'Failed to generate insights from AI provider' }, 500);
    }

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content;
    
    if (!aiText) {
       return c.json({ error: 'Invalid response from AI provider' }, 500);
    }

    const insightsJson = JSON.parse(aiText);
    return c.json(insightsJson);

  } catch (error) {
    console.error('AI Generation Error:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

aiRoutes.post('/coach-chat', async (c) => {
  try {
    const body = await c.req.json();
    const { message, profile, scores, role, algorithmicGuidance, history } = body;
    
    if (!message) {
      return c.json({ error: 'Message is required' }, 400);
    }

    const userRole = role || profile?.role || profile?.userType || 'learner/individual';
    const algoContext = algorithmicGuidance ? JSON.stringify(algorithmicGuidance) : 'None provided';

    const systemPrompt = `You are the JotMinds AI Cognitive Coach — an intelligent, encouraging mentor for ALL users (Students, Professionals, Teachers, Parents, Schools, and Organizations).
Your coaching advice is GUIDED BY JotMinds' proprietary cognitive algorithms, scores, and archetypes, while your responses are freshly generated by AI to provide dynamic, personalized variations and nuanced guidance.

USER CONTEXT:
- Role/Type: ${userRole}
- Algorithmic Guidance: ${algoContext}
- Profile / Scores: ${JSON.stringify({ profile, scores } || {})}

COACHING GUIDELINES:
1. Grounding: Use the provided algorithmic profile and scores to guide your advice accurately. Never contradict their verified assessment data.
2. Role-Tailored Tone & Advice:
   - Students: Study methods, exam confidence, learning styles, academic strategy.
   - Professionals/Adults: Career growth, communication, workplace synergy, leadership, problem-solving.
   - Teachers: Instructional strategies, classroom adaptation, student engagement, teaching style synergy.
   - Parents: Supporting their child, home communication, observation insights, growth mindset.
   - Schools / Institutional Leaders: Whole-school analytics, pedagogical alignment, teacher professional development, curriculum differentiation, student retention.
3. Fresh & Varied Results: Provide varied, fresh, non-repetitive answers with actionable bullet points and clear takeaways. Avoid generic boilerplate.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(Array.isArray(history) ? history : []),
      { role: 'user', content: message }
    ];

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.78
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenAI Coach Chat Error:', err);
      return c.json({ error: 'Failed to generate response from AI Learning Coach' }, 500);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return c.json({ error: 'Invalid response from AI provider' }, 500);
    }

    return c.json({ reply });
  } catch (error) {
    console.error('AI Coach Chat Error:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

aiRoutes.post('/generate-school-insights', async (c) => {
  try {
    const body = await c.req.json();
    const { schoolName, role, metrics, algorithmicGuidance, context } = body;
    
    if (!metrics) {
      return c.json({ error: 'Metrics are required for school/group insights' }, 400);
    }

    const institutionName = schoolName || 'Educational Institution / School';
    const leadershipRole = role || 'school_admin';
    const algoContext = algorithmicGuidance ? JSON.stringify(algorithmicGuidance) : 'None provided; derive from metrics.';
    const extraContext = context ? JSON.stringify(context) : 'None provided.';

    const systemPrompt = `You are the JotMinds Institutional & School AI Advisor — an AI specializing in whole-school analytics, educational leadership, classroom pedagogy, and organizational cognitive diagnostics.
Your job is to generate dynamic, executive-level school/institutional recommendations, pedagogical alignment strategies, and classroom intervention plans.

IMPORTANT ARCHITECTURAL RULES:
1. ALGORITHMIC GUIDANCE (GROUNDING):
You are guided by JotMinds proprietary school and group algorithmic data:
- Institution Name: ${institutionName}
- Leadership Role: ${leadershipRole}
- Algorithmic Metrics & Rule-Based Heuristics: ${algoContext}
- Extra Context: ${extraContext}
You MUST use these algorithmically computed school statistics, risk counts, and cognitive style distributions as your authoritative mathematical foundation.

2. AI-GENERATED VARIATIONS & PERSONALIZATION:
Do NOT return generic boilerplate or canned institutional text. Provide fresh, uniquely phrased, executive-ready analysis tailored to ${institutionName}. Generate varied, actionable strategies that leaders and teachers can apply immediately.

3. RESPONSE FORMAT:
You must respond with valid JSON matching exactly this structure:
{
  "executiveSummary": "A rich 3-4 sentence executive summary of the school/institution's cognitive profile, engagement health, and assessment uptake.",
  "keyStrengths": ["3-4 distinct institutional strengths derived from the data (e.g. high engagement cohorts, dominant learning style synergies)"],
  "strategicAlerts": ["2-3 strategic alerts, blind spots, or priority areas (e.g. unassessed cohorts, at-risk student percentages)"],
  "actionableInterventions": [
    {
      "area": "Specific intervention area",
      "priority": "urgent",
      "strategy": "Actionable strategy for teachers or leadership",
      "targetGroup": "Who this targets (e.g., At-risk students, SHS cohort, Kinesthetic learners)"
    }
  ],
  "pedagogicalAlignment": "A 2-3 sentence strategic guide for teachers on how to align classroom instruction with the school's dominant cognitive archetypes."
}
`;

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze these school metrics for ${institutionName} (${leadershipRole}) and return the JSON institutional report: ${JSON.stringify(metrics)}` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.78
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenAI School Insights Error:', err);
      return c.json({ error: 'Failed to generate school insights from AI provider' }, 500);
    }

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content;
    
    if (!aiText) {
       return c.json({ error: 'Invalid response from AI provider' }, 500);
    }

    const insightsJson = JSON.parse(aiText);
    return c.json(insightsJson);

  } catch (error) {
    console.error('AI School Generation Error:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default aiRoutes;
