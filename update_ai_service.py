with open('src/app/utils/aiService.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("${typeof subjectOrPayload === 'object' ? `Additional payload: ${JSON.stringify(subjectOrPayload)}` : ''}", 
"""${typeof subjectOrPayload === 'object' && subjectOrPayload.existingPlanText ? `CRITICAL INSTRUCTION: The teacher provided an EXISTING lesson plan. You MUST tailor and enhance this exact plan to fit the class demands (using the cognitive profile summary) and curriculum. Do not ignore the existing content, rebuild upon it!\nEXISTING PLAN CONTENT:\n${subjectOrPayload.existingPlanText}` : ''}
${typeof subjectOrPayload === 'object' ? `Class Summary Data: ${JSON.stringify(subjectOrPayload.classSummary)}` : ''}""")

with open('src/app/utils/aiService.ts', 'w', encoding='utf-8') as f:
    f.write(content)
