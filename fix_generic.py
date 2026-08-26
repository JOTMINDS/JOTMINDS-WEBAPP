import re

# Fix SchoolPortalTab.tsx
with open("src/app/components/StudentDashboardTabs/SchoolPortalTab.tsx", "r") as f:
    content = f.read()

content = content.replace("'Mathematics'", "'Course A'")
content = content.replace("'Quadratic Functions & Graphical Analysis'", "'Module 1: Advanced Concepts'")
content = content.replace("'Mr. Mensah'", "'Instructor A'")
content = content.replace("'Find the vertex and axis of symmetry for y = 2x² - 8x + 6.'", "'Review the core concepts from chapter 1.'")
content = content.replace("'How does changing coefficient A alter the width and direction of the graph?'", "'Explain how the primary variable affects the outcome.'")

content = content.replace("'Integrated Science'", "'Course B'")
content = content.replace("'Cellular Respiration & ATP Energy Cycle'", "'Module 2: Foundational Theory'")
content = content.replace("'Mrs. Appiah'", "'Instructor B'")
content = content.replace("'Explain why oxygen acts as the final electron acceptor in the electron transport chain.'", "'Analyze the relationship between the key components.'")
content = content.replace("'Calculate the net yield of ATP produced per glucose molecule under aerobic conditions.'", "'Calculate the expected outcome given the initial conditions.'")

with open("src/app/components/StudentDashboardTabs/SchoolPortalTab.tsx", "w") as f:
    f.write(content)

# Fix lessonPlannerStorage.ts
with open("src/app/utils/lessonPlannerStorage.ts", "r") as f:
    content = f.read()

content = content.replace("subject: 'Mathematics'", "subject: 'Sample Subject'")
content = content.replace("grade: 'JHS 2'", "grade: 'Grade Level'")

for i in range(1, 16):
    content = re.sub(
        rf"title: '[^']+', subject: 'Mathematics', grade: 'JHS 2'",
        f"title: 'Topic {i}', subject: 'Sample Subject', grade: 'Grade Level'",
        content
    )

with open("src/app/utils/lessonPlannerStorage.ts", "w") as f:
    f.write(content)

