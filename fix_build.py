import re

# Fix LessonPlanCreation.tsx
with open('src/app/components/lessonPlanner/LessonPlanCreation.tsx', 'r', encoding='utf-8') as f:
    l_content = f.read()

# Fix the useState mess
l_content = l_content.replace(
"""  const [durationMinutes,
      existingPlanText: mode === "upload" ? existingPlanText : undefined, setDurationMinutes] = useState(40);""",
"  const [durationMinutes, setDurationMinutes] = useState(40);"
)

with open('src/app/components/lessonPlanner/LessonPlanCreation.tsx', 'w', encoding='utf-8') as f:
    f.write(l_content)

# Fix the CSV splits
for file in [
    'src/app/components/OrganizationBulkUploadModal.tsx',
    'src/app/components/InstitutionDashboard/GenerateStudentCodesModal.tsx',
    'src/app/components/InstitutionDashboard/BulkUploadModal.tsx'
]:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Python replacement probably turned \r?\n into actual newline or broke it
    content = re.sub(r'const lines = csv\.split\(\/\s*', r'const lines = csv.split(/\\r?\\n/);', content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

