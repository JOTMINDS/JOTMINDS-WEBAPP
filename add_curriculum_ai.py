with open('src/app/utils/aiService.ts', 'r', encoding='utf-8') as f:
    content = f.read()

new_func = """
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
"""

if "generateAICurriculumTopics" not in content:
    content += new_func
    with open('src/app/utils/aiService.ts', 'w', encoding='utf-8') as f:
        f.write(content)
print("Added generateAICurriculumTopics to aiService")
