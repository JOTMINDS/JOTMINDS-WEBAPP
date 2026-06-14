import { Hono } from 'npm:hono';

const aiRoutes = new Hono();

// We will use the API key provided by the user, but we'll also allow fallback to an env var
// Ideally this should be stored securely in Supabase secrets
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') ;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

aiRoutes.post('/generate-insights', async (c) => {
  try {
    const { scores, type } = await c.req.json();
    
    if (!scores) {
      return c.json({ error: 'Scores are required' }, 400);
    }

    const systemPrompt = `You are the JotMinds Cognitive AI, an expert in educational psychology and cognitive profiling.
Your job is to analyze a student's assessment scores and generate highly personalized, actionable insights.

RULES:
1. You must respond with valid JSON matching exactly this structure:
{
  "strengths": ["list of 3-4 strengths"],
  "weaknesses": ["list of 2-3 weaknesses or areas to watch"],
  "improvements": ["list of 3 specific, actionable recommendations"],
  "archetype": {
    "name": "Creative Communicator",
    "tagline": "You learn through stories, sound, and expression"
  }
}

2. The archetype MUST be chosen from one of these JotMinds Archetypes, based on their scores:
- "Analytical Architect" (Analytical > 65, Visual > 60)
- "Creative Communicator" (Creative > 65, Auditory > 60)
- "Intuitive Practitioner" (Kinesthetic > 60, Intuitive > 60)
- "Strategic Planner" (Analytical > 60, but not highly visual)
- "Adaptive Learner" (Default if no strong spikes)

3. Base your strengths and weaknesses on the exact numbers provided in the user's score profile.
4. Keep the tone encouraging, professional, and directly addressed to the student (e.g. "You excel at...").
`;

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [{
          role: "user",
          parts: [{ text: `Analyze these scores and return the JSON: ${JSON.stringify(scores)}` }]
        }],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini API Error:', err);
      return c.json({ error: 'Failed to generate insights from AI provider' }, 500);
    }

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
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

export default aiRoutes;
