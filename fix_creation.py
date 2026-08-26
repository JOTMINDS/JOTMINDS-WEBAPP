import re

with open("src/app/components/lessonPlanner/LessonPlanCreation.tsx", "r") as f:
    content = f.read()

# 1. Fix default values
content = content.replace("useState('Mathematics')", "useState('')")
content = content.replace("useState('JHS 2')", "useState('')")
content = content.replace("useState('Linear Equations in One Variable')", "useState('')")
content = content.replace("useState('Solving Algebraic Equations & Word Problems')", "useState('')")

# 2. Fix fallback objectives
new_objectives = """      objectives: (Array.isArray(aiResult?.objectives) ? {
        knowledge: aiResult.objectives,
        skills: [],
        applications: []
      } : aiResult?.objectives) || {
        knowledge: [
          `Define key concepts of ${topic} in ${subject}.`,
          `Identify core principles and key variables.`
        ],
        skills: [
          `Execute step-by-step calculations and problem-solving methods for ${topic}.`,
          `Demonstrate accuracy in guided practice tasks.`
        ],
        applications: [
          `Apply ${topic} to solve practical real-life scenarios relevant to ${gradeClass} learners.`
        ]
      },"""

content = re.sub(
    r"objectives: aiResult\?\.objectives \|\| \{\s*knowledge: \[\s*`Define key concepts of \$\{topic\} in \$\{subject\}\.`,[\s\S]*?applications: \[\s*`Apply \$\{topic\} to solve practical real-life scenarios relevant to \$\{gradeClass\} learners\.`\s*\]\s*\},",
    new_objectives,
    content
)

with open("src/app/components/lessonPlanner/LessonPlanCreation.tsx", "w") as f:
    f.write(content)

