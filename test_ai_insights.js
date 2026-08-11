const payload = {
  "scores": {
    "learning": 80,
    "thinking": 75,
    "decision": 90,
    "problemSolving": 85,
    "collaboration": 95,
    "communication": 80,
    "adaptability": 70,
    "emotionalIntelligence": 85
  },
  "role": "individual"
};

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

fetch("https://4b7ca5d9.jotminds.pages.dev/api/openai", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an expert cognitive psychologist.' },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 800
  })
}).then(r => r.json()).then(d => {
  const content = d.choices?.[0]?.message?.content;
  console.log("CONTENT:", content);
  try {
    const parsed = JSON.parse(content);
    console.log("PARSED SUCCESSFULLY");
  } catch (e) {
    console.log("PARSE ERROR:", e);
  }
}).catch(console.error);
