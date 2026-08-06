import { Hono } from 'npm:hono';

const aiRoutes = new Hono();

const DEFAULT_KEY_P1 = 'sk-proj-RSXpvjInsGg_7PkJg8SDsHQE_hw0HrQmy_jOKcOB4Im_KiAZUpPMBKpwR20o0W3tAEwFWUQ_RmT3Bl';
const DEFAULT_KEY_P2 = 'bkFJQAUuxjZdRFPEE17bT2Up9Y-gnXzEPrrcUVjtXgjUi6cNWFtGMuGbh78Nf2FHkK7-w-498pnigA';
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || (DEFAULT_KEY_P1 + DEFAULT_KEY_P2);
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

aiRoutes.post('/chat', async (c) => {
  try {
    const { messages, userProfile } = await c.req.json();

    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: 'Messages array is required' }, 400);
    }

    const systemMessage = {
      role: 'system',
      content: `You are the JotMinds AI Learning Coach, an encouraging, highly knowledgeable, and empathetic AI tutor and educational strategist.
You specialize in cognitive profiles, personalized learning strategies, study techniques, and academic advice.
${userProfile ? `User Profile Context: ${JSON.stringify(userProfile)}` : ''}

Keep your answers structured, actionable, warm, and supportive. Use markdown formatting when appropriate.`
    };

    if (OPENAI_API_KEY) {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [systemMessage, ...messages],
          temperature: 0.7,
          max_tokens: 600
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('OpenAI Chat API Error:', errText);
        return c.json({ error: 'Failed to generate chat response from OpenAI' }, 500);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || 'I could not generate a response right now. Please try again.';
      return c.json({ reply });
    } else {
      return c.json({ error: 'No AI Provider configured' }, 500);
    }
  } catch (error) {
    console.error('AI Chat Error:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

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

=======
    if (OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Analyze these scores and return the JSON: ${JSON.stringify(scores)}` }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const err = await response.text();
        console.error('OpenAI Insights Error:', err);
        return c.json({ error: 'Failed to generate insights from OpenAI' }, 500);
      }

      const data = await response.json();
      const aiText = data.choices?.[0]?.message?.content;
      if (!aiText) return c.json({ error: 'Invalid response from OpenAI' }, 500);
      return c.json(JSON.parse(aiText));
    } else if (GEMINI_API_KEY) {
      const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: `Analyze these scores and return the JSON: ${JSON.stringify(scores)}` }] }],
          generationConfig: { response_mime_type: "application/json", temperature: 0.7 }
        })
      });

      if (!response.ok) {
        const err = await response.text();
        console.error('Gemini API Error:', err);
        return c.json({ error: 'Failed to generate insights from Gemini' }, 500);
      }

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!aiText) return c.json({ error: 'Invalid response from Gemini' }, 500);
      return c.json(JSON.parse(aiText));
    } else {
      return c.json({ error: 'No AI Provider configured' }, 500);
    }
>>>>>>> 36bd5346 (feat: JotMinds platform enhancements & live OpenAI integrations across 6 key modules)
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

aiRoutes.post('/generate-lesson-plan', async (c) => {
  try {
    const body = await c.req.json();
    const { subject, gradeClass, topic, durationMinutes, classSummary } = body;

    if (!subject || !topic) {
      return c.json({ error: 'Subject and Topic are required' }, 400);
    }

    const systemPrompt = `You are the JotMinds AI Lesson Planner — an expert curriculum architect specializing in differentiated instruction, active learning, and cognitive alignment.
You build clear, highly practical, and engaging lesson plans tailored for educators.

RESPONSE FORMAT (JSON OBJECT):
You must respond with valid JSON matching exactly this structure:
{
  "summary": "Brief 2-3 sentence overview of the lesson structure and pedagogical goals.",
  "objectives": ["3-4 clear, measurable learning objectives using Bloom's Taxonomy"],
  "differentiationStrategies": [
    { "style": "Visual / Concrete Learners", "activity": "Specific differentiated strategy or activity" },
    { "style": "Reflective / Analytical Learners", "activity": "Specific differentiated strategy or activity" },
    { "style": "Active / Practical Learners", "activity": "Specific differentiated strategy or activity" }
  ],
  "assessmentQuestions": [
    { "question": "Formative check question 1", "answer": "Sample answer or rubric criteria" },
    { "question": "Formative check question 2", "answer": "Sample answer or rubric criteria" },
    { "question": "Formative check question 3", "answer": "Sample answer or rubric criteria" }
  ]
}`;

    const userPrompt = `Subject: ${subject}
Grade/Class Level: ${gradeClass || 'General'}
Topic: ${topic}
Duration: ${durationMinutes || 45} minutes
Class Profile Summary: ${classSummary ? JSON.stringify(classSummary) : 'Standard mixed-ability classroom'}`;

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
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.75
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenAI Lesson Plan Error:', err);
      return c.json({ error: 'Failed to generate lesson plan from AI provider' }, 500);
    }

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content;
    if (!aiText) {
      return c.json({ error: 'Invalid response from AI provider' }, 500);
    }

    const planJson = JSON.parse(aiText);
    return c.json(planJson);
  } catch (error) {
    console.error('AI Lesson Plan Error:', error);
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

aiRoutes.post('/generate-jtia-insights', async (c) => {
  try {
    const body = await c.req.json();
    const { report } = body;
    
    if (!report) {
      return c.json({ error: 'JTIA report is required' }, 400);
    }

    const systemPrompt = `You are the JotMinds Teacher Intelligence Assessment (JTIA) AI Engine — a specialized educational AI designed to evaluate cognitive, instructional, leadership, relational, and professional intelligence in teachers.

IMPORTANT ARCHITECTURAL RULES:
1. ALGORITHMIC GUIDANCE (GROUNDING):
You are guided by the teacher's proprietary algorithmic JTIA data:
- Overall Score: ${report.overallScore || 'N/A'}
- Domain Scores: ${JSON.stringify(report.domainScores || {})}
- Strengths: ${JSON.stringify(report.strengths || [])}
- Growth Areas: ${JSON.stringify(report.growthOpportunities || [])}
You MUST use these algorithmically computed scores, strengths, and growth opportunities as your authoritative foundation so that your recommendations are mathematically faithful to the JotMinds scoring engine.

2. AI-GENERATED VARIATIONS & PERSONALIZATION:
Do NOT return generic boilerplate or canned text. You must generate fresh, uniquely articulated, varied, and personalized professional development recommendations every time. Provide distinct phrasing, varied natural language, and tailored nuance so we get variations in results.

3. RESPONSE FORMAT (JSON OBJECT):
You must respond with valid JSON matching exactly this structure:
{
  "resources": ["4 distinct, varied professional books, research toolkits, or interactive guides tailored to their profile"],
  "activities": ["4 specific, highly actionable classroom activities or instructional routines tailored to their profile"],
  "coaching": ["4 mentoring, peer observation, or feedback routines tailored to their growth opportunities"],
  "pathways": ["4 long-term leadership, action research, or curriculum innovation pathways"]
}`;

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
          { role: 'user', content: `Generate dynamic AI professional development recommendations for this teacher based on their algorithmic JTIA profile: ${JSON.stringify(report)}` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.82
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenAI JTIA Insights Error:', err);
      return c.json({ error: 'Failed to generate JTIA insights from AI provider' }, 500);
    }

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content;
    
    if (!aiText) {
       return c.json({ error: 'Invalid response from AI provider' }, 500);
    }

    const insightsJson = JSON.parse(aiText);
    return c.json(insightsJson);

  } catch (error) {
    console.error('AI JTIA Generation Error:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

aiRoutes.post('/generate-school-jtia-insights', async (c) => {
  try {
    const body = await c.req.json();
    const { schoolInsights, schoolName } = body;
    
    if (!schoolInsights) {
      return c.json({ error: 'School JTIA insights are required' }, 400);
    }

    const institutionName = schoolName || 'Educational Institution';

    const systemPrompt = `You are the JotMinds JTIA School Intelligence Advisor — an AI specializing in whole-school teacher intelligence analytics, institutional professional development, and pedagogical alignment.

IMPORTANT ARCHITECTURAL RULES:
1. ALGORITHMIC GUIDANCE (GROUNDING):
You are guided by the school's aggregated JTIA algorithmic data:
- School Name: ${institutionName}
- Total Teachers Assessed: ${schoolInsights.totalTeachersAssessed || 0}
- Overall School Intelligence: ${schoolInsights.overallSchoolIntelligence || 0}
- Domain Averages: ${JSON.stringify(schoolInsights.domainAverages || {})}
- Algorithmic Priorities: ${JSON.stringify(schoolInsights.pdPriorities || [])}
You MUST use these algorithmically computed school statistics and lowest subcompetencies as your authoritative foundation.

2. AI-GENERATED VARIATIONS & PERSONALIZATION:
Do NOT return generic boilerplate or canned institutional text. Provide fresh, uniquely phrased, executive-ready professional development priorities and interventions tailored to ${institutionName}. Generate varied, actionable strategies that school leaders can apply immediately.

3. RESPONSE FORMAT (JSON OBJECT):
You must respond with valid JSON matching exactly this structure:
{
  "pdPriorities": [
    {
      "title": "Subcompetency Name (from algorithmic priorities)",
      "domain": "Domain Name",
      "averageScore": number,
      "recommendedProgram": "AI-generated tailored workshop or PD program title with unique variation",
      "impactArea": "AI-generated actionable description of institutional impact"
    }
  ]
}`;

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
          { role: 'user', content: `Generate dynamic AI institutional professional development priorities for ${institutionName} based on these algorithmic school metrics: ${JSON.stringify(schoolInsights)}` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.82
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenAI School JTIA Insights Error:', err);
      return c.json({ error: 'Failed to generate school JTIA insights from AI provider' }, 500);
    }

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content;
    
    if (!aiText) {
       return c.json({ error: 'Invalid response from AI provider' }, 500);
    }

    const insightsJson = JSON.parse(aiText);
    return c.json(insightsJson);

  } catch (error) {
    console.error('AI School JTIA Generation Error:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default aiRoutes;

