import re

with open('src/app/components/lessonPlanner/AssessmentGeneratorView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update the call
content = content.replace("topic: plan?.topic || 'Topic',", "topic: plan?.topic || 'Topic',\n      uploadText,")

with open('src/app/components/lessonPlanner/AssessmentGeneratorView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Assessment call")
