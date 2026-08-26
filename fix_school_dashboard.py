import re

with open("src/app/components/lessonPlanner/SchoolInsightsDashboardView.tsx", "r") as f:
    content = f.read()

content = content.replace("Provide visual algebra manipulative toolkits to your math classes to support the 14 flagged abstract-reasoning students.", "Provide visual manipulative toolkits to your classes to support the flagged abstract-reasoning students.")

with open("src/app/components/lessonPlanner/SchoolInsightsDashboardView.tsx", "w") as f:
    f.write(content)
