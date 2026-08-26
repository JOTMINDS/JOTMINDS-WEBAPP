import re

with open("src/app/components/CombinedCognitiveProfile.tsx", "r") as f:
    content = f.read()

# Fix 1: Add rawScores type casting
content = content.replace("const normalizedThinkingScores = {", "const rawScores = thinkingScores as Record<string, number>;\n  const normalizedThinkingScores = {")
content = content.replace("thinkingScores.Analytical", "rawScores.Analytical")
content = content.replace("thinkingScores.executive", "rawScores.executive")
content = content.replace("thinkingScores.Executive", "rawScores.Executive")
content = content.replace("thinkingScores.Creative", "rawScores.Creative")
content = content.replace("thinkingScores.legislative", "rawScores.legislative")
content = content.replace("thinkingScores.Legislative", "rawScores.Legislative")
content = content.replace("thinkingScores.Practical", "rawScores.Practical")
content = content.replace("thinkingScores.judicial", "rawScores.judicial")
content = content.replace("thinkingScores.Judicial", "rawScores.Judicial")
content = content.replace("thinkingScores.analytical", "rawScores.analytical")
content = content.replace("thinkingScores.creative", "rawScores.creative")
content = content.replace("thinkingScores.practical", "rawScores.practical")


# Fix 2: Property 'primaryStyle' does not exist
# line 105: const actualKolbStyle = (kolbScores?.primaryStyle || ...
content = content.replace("kolbScores?.primaryStyle", "(kolbScores as any)?.primaryStyle")

with open("src/app/components/CombinedCognitiveProfile.tsx", "w") as f:
    f.write(content)
