import re

with open("src/app/utils/lessonPlannerStorage.ts", "r") as f:
    content = f.read()

content = re.sub(
    r"title: '[^']+', subject: 'Sample Subject', grade: 'Grade Level'",
    "title: 'Topic placeholder', subject: 'Sample Subject', grade: 'Grade Level'",
    content
)

with open("src/app/utils/lessonPlannerStorage.ts", "w") as f:
    f.write(content)
