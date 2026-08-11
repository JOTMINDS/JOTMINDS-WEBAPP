const fs = require('fs');
let code = fs.readFileSync('src/app/utils/aiService.ts', 'utf8');

const resourcesAiFunc = `
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
  const prompt = \`Generate 4 tailored educational resources and guides for a \${params.userType} working with a student profile:
Learning Style: \${params.learningStyle || 'General'}
Thinking Style: \${params.thinkingStyle || 'General'}
Decision Style: \${params.decisionStyle || 'General'}

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
}\`;

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
`;

if (!code.includes('generateAIEducationalResources')) {
  code += resourcesAiFunc;
  fs.writeFileSync('src/app/utils/aiService.ts', code);
  console.log("Added generateAIEducationalResources to aiService.ts");
}
