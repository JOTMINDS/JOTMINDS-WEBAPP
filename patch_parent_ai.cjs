const fs = require('fs');
let code = fs.readFileSync('src/app/utils/aiService.ts', 'utf8');

const parentAiFunc = `
export async function generateAIParentSupportTips(assessmentData: any): Promise<string[] | null> {
  const prompt = \`Analyze this child's assessment profile and generate 4 highly specific, actionable parenting support tips for home life:
Assessment Profile: \${JSON.stringify(assessmentData)}

Return ONLY JSON format:
{
  "tips": [
    "Specific parenting tip 1",
    "Specific parenting tip 2",
    "Specific parenting tip 3",
    "Specific parenting tip 4"
  ]
}\`;

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
`;

if (!code.includes('generateAIParentSupportTips')) {
  code += parentAiFunc;
  fs.writeFileSync('src/app/utils/aiService.ts', code);
  console.log("Added generateAIParentSupportTips to aiService.ts");
}
