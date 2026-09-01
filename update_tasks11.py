with open('/Users/GRIM/.gemini/antigravity/brain/3eaacce2-3e5f-4da3-ac6d-e62c8e0664ab/task.md', 'r') as f:
    content = f.read()

content = content.replace('- `[ ]` Lesson Planner: Make reflections compulsory. Teachers should share insights on how lessons went, feedback, observations and recommendations. School should be able to view recommendations that apply', '- `[x]` Lesson Planner: Make reflections compulsory. Teachers should share insights on how lessons went, feedback, observations and recommendations. School should be able to view recommendations that apply')
content = content.replace('- `[ ]` Lesson Planner: Under assessments, allow teacher to upload their own assessment materials', '- `[x]` Lesson Planner: Under assessments, allow teacher to upload their own assessment materials')
content = content.replace('- `[ ]` Lesson Planner: Under differentiated activities, allow teachers to suggest their activities alongside the system generated', '- `[x]` Lesson Planner: Under differentiated activities, allow teachers to suggest their activities alongside the system generated')
content = content.replace('- `[ ]` Lesson Planner: Revise Lesson Prep tool such that it is extremely important to use before teacher goes to class', '- `[x]` Lesson Planner: Revise Lesson Prep tool such that it is extremely important to use before teacher goes to class')

with open('/Users/GRIM/.gemini/antigravity/brain/3eaacce2-3e5f-4da3-ac6d-e62c8e0664ab/task.md', 'w') as f:
    f.write(content)
