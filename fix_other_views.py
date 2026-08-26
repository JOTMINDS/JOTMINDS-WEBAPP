import os

files = [
    "src/app/components/lessonPlanner/AssessmentGeneratorView.tsx",
    "src/app/components/lessonPlanner/DifferentiatedInstructionView.tsx"
]

for file in files:
    with open(file, "r") as f:
        content = f.read()
    
    content = content.replace("plan?.subject || 'Mathematics'", "plan?.subject || ''")
    
    with open(file, "w") as f:
        f.write(content)

