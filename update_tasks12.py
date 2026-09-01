with open('/Users/GRIM/.gemini/antigravity/brain/3eaacce2-3e5f-4da3-ac6d-e62c8e0664ab/task.md', 'r') as f:
    content = f.read()

content = content.replace('- `[ ]` Lesson Planner: Curriculum Types - British Curriculum, Oxford International, IB, National Curriculum', '- `[x]` Lesson Planner: Curriculum Types - British Curriculum, Oxford International, IB, National Curriculum')
content = content.replace('- `[ ]` Create Lesson Plan: Allow lesson plan to be generated in document form inside the platform. Allow for teachers to edit, download, save, and mark completed/pending.', '- `[x]` Create Lesson Plan: Allow lesson plan to be generated in document form inside the platform. Allow for teachers to edit, download, save, and mark completed/pending.')
content = content.replace('- `[ ]` Create Lesson Plan: Teachers should be able to upload their own existing lesson plans and have the lesson planner help them tailor to fit class demands and needs.', '- `[x]` Create Lesson Plan: Teachers should be able to upload their own existing lesson plans and have the lesson planner help them tailor to fit class demands and needs.')
content = content.replace('- `[ ]` Lesson Planner: Make reflections compulsory. Teachers should share insights. School should be able to view recommendations that apply.', '- `[x]` Lesson Planner: Make reflections compulsory. Teachers should share insights. School should be able to view recommendations that apply.')

with open('/Users/GRIM/.gemini/antigravity/brain/3eaacce2-3e5f-4da3-ac6d-e62c8e0664ab/task.md', 'w') as f:
    f.write(content)
