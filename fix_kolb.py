import re

with open("src/app/components/CombinedCognitiveProfile.tsx", "r") as f:
    content = f.read()

content = content.replace("const scoreObj = latestSternberg?.score || {};", "const scoreObj = (latestSternberg?.score as any) || {};")
content = content.replace("const kolbScores = latestKolb?.score || {", "const kolbScores = (latestKolb?.score as any) || {")

with open("src/app/components/CombinedCognitiveProfile.tsx", "w") as f:
    f.write(content)

