with open('src/app/utils/aiService.ts', 'r', encoding='utf-8') as f:
    content = f.read()

old_prompt = """`Generate school-wide JTIA PD Priorities based on this data:
School Name: ${schoolName || 'The School'}
Data: ${JSON.stringify(schoolInsights)}

Return strictly a JSON array of objects representing pdPriorities, each containing:
- theme (string)
- description (string)
- priority (number, 1-3)
- recommendedFormat (string)

Example: { "pdPriorities": [ { "theme": "...", "description": "...", "priority": 1, "recommendedFormat": "Workshop" } ] }`;"""

new_prompt = """`Generate school-wide Teaching Insights Professional Development Priorities based on this data:
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

Example: { "pdPriorities": [ { "theme": "...", "description": "...", "priority": 1, "recommendedFormat": "INSET Workshop" } ] }`;"""

content = content.replace(old_prompt, new_prompt)

with open('src/app/utils/aiService.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated School AI Prompt")
