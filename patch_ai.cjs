const fs = require('fs');
let code = fs.readFileSync('src/app/utils/aiService.ts', 'utf8');

const newFunction = `
export interface AIStudentTeachingStrategies {
  quickInsights: { icon: string; text: string }[];
  teachingStrategies: string[];
  educationalResources: { type: 'Guide' | 'Article' | 'Video'; title: string; description: string; whyHelps: string }[];
}

export async function generateAITeachingStrategies(studentData: any): Promise<AIStudentTeachingStrategies | null> {
  const prompt = \`Analyze this student's cognitive profile and generate tailored teaching strategies:
Student Data: \${JSON.stringify(studentData)}

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
}\`;

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
`;

if (!code.includes('generateAITeachingStrategies')) {
  code += newFunction;
  fs.writeFileSync('src/app/utils/aiService.ts', code);
  console.log('Added generateAITeachingStrategies to aiService.ts');
} else {
  console.log('generateAITeachingStrategies already exists');
}
