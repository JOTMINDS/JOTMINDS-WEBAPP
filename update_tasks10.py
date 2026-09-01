with open('/Users/GRIM/.gemini/antigravity/brain/3eaacce2-3e5f-4da3-ac6d-e62c8e0664ab/task.md', 'r') as f:
    content = f.read()

content = content.replace('- `[ ]` Create Lesson Plan: Allow lesson plan to be generated in document form inside the platform. Allow for teachers to edit lesson plans, download and save. Allow school to view saved lesson plans and the ones that have been marked as completed or pending', '- `[x]` Create Lesson Plan: Allow lesson plan to be generated in document form inside the platform. Allow for teachers to edit lesson plans, download and save. Allow school to view saved lesson plans and the ones that have been marked as completed or pending')
content = content.replace('- `[ ]` Create Lesson Plan: Teachers should be able to upload their own existing lesson plans and have the lesson planner help them tailor to fit class demands and needs. AI recommendations etc..', '- `[x]` Create Lesson Plan: Teachers should be able to upload their own existing lesson plans and have the lesson planner help them tailor to fit class demands and needs. AI recommendations etc..')
content = content.replace('- `[ ]` Lesson Planner: Revise Classroom Intelligence tab. Data not accurate and also make much more personalized to teacher', '- `[x]` Lesson Planner: Revise Classroom Intelligence tab. Data not accurate and also make much more personalized to teacher')

with open('/Users/GRIM/.gemini/antigravity/brain/3eaacce2-3e5f-4da3-ac6d-e62c8e0664ab/task.md', 'w') as f:
    f.write(content)
