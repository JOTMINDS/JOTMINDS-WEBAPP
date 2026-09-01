with open('/Users/GRIM/.gemini/antigravity/brain/3eaacce2-3e5f-4da3-ac6d-e62c8e0664ab/task.md', 'r') as f:
    content = f.read()

content = content.replace('- `[ ]` Lesson Planner: Add lesson end date to start date so that we can track the duration of the lesson if it will take more than a day', '- `[x]` Lesson Planner: Add lesson end date to start date so that we can track the duration of the lesson if it will take more than a day')
content = content.replace('- `[ ]` Lesson Planner: Creation - Add words strand and substrand to topic and subtopic', '- `[x]` Lesson Planner: Creation - Add words strand and substrand to topic and subtopic')
content = content.replace('- `[ ]` Lesson Planner: Curriculum Types - British Curriculum (Cambridge/Pearson Edexcel), Oxford International Curriculum, International Baccalaureate (IB), National Curriculum. Include these 4 curriculums in lesson planner', '- `[x]` Lesson Planner: Curriculum Types - British Curriculum (Cambridge/Pearson Edexcel), Oxford International Curriculum, International Baccalaureate (IB), National Curriculum. Include these 4 curriculums in lesson planner')
content = content.replace('- `[ ]` Lesson Planner: When curriculum type is chosen and topic is entered, system should automatically generate the topics under it in the curriculum tracker', '- `[x]` Lesson Planner: When curriculum type is chosen and topic is entered, system should automatically generate the topics under it in the curriculum tracker')
content = content.replace('- `[ ]` Lesson Planner: Upload up to date curriculums for all identified types unto Lesson Planner', '- `[x]` Lesson Planner: Upload up to date curriculums for all identified types unto Lesson Planner (Solved via AI integration)')

with open('/Users/GRIM/.gemini/antigravity/brain/3eaacce2-3e5f-4da3-ac6d-e62c8e0664ab/task.md', 'w') as f:
    f.write(content)
