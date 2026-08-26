with open("src/app/components/lessonPlanner/LessonCopilotDrawer.tsx", "r") as f:
    content = f.read()

content = content.replace("Generate a 3-question quiz on linear equations.", "Generate a 3-question quiz on the current topic.")

with open("src/app/components/lessonPlanner/LessonCopilotDrawer.tsx", "w") as f:
    f.write(content)
