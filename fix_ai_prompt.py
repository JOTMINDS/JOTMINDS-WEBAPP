with open('src/app/utils/aiService.ts', 'r', encoding='utf-8') as f:
    content = f.read()

old_prompt = "`Generate JTIA teaching insights recommendations based on this report:\nReport Data: ${JSON.stringify(report)}\n\nReturn JSON matching the JTIAAIRecommendations interface format precisely, which includes executiveSummary, pedagogicalArchetype (name, description, cognitiveAlignment), personalizedStrategies (array of domain, strategies, implementation), and professionalDevelopment (focusAreas, suggestedResources).`;"

new_prompt = """`Generate Teaching Insights recommendations based on this report:
Report Data: ${JSON.stringify(report)}

Return JSON matching the JTIAAIRecommendations interface format precisely (executiveSummary, pedagogicalArchetype, personalizedStrategies, professionalDevelopment).

Crucial Instructions:
1. Personalization: Use empowering, highly personalized language (e.g., "Your unique strength in...", "You have a natural ability to...").
2. Local Context: When suggesting resources or strategies, use culturally relevant local references suited for the Ghanaian/African education market (e.g., GES curriculum context, local classroom realities, accessible low-cost materials).
3. Growth Mindset: Frame growth opportunities as exciting pathways for professional mastery rather than deficits.`;"""

content = content.replace(old_prompt, new_prompt)

with open('src/app/utils/aiService.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated AI Prompt")
