with open('/Users/GRIM/.gemini/antigravity/brain/3eaacce2-3e5f-4da3-ac6d-e62c8e0664ab/task.md', 'r') as f:
    content = f.read()

content = content.replace('- `[ ]` Manage Students: Add option to generate individual code without having to add a student to a class first', '- `[x]` Manage Students: Add option to generate individual code without having to add a student to a class first')
content = content.replace('- `[ ]` Manage Students: Add CSV upload option. Verify and check the format of the CSV sheet. System only showed names and no DOBs when CSV was uploaded', '- `[x]` Manage Students: Add CSV upload option. Verify and check the format of the CSV sheet. System only showed names and no DOBs when CSV was uploaded')

with open('/Users/GRIM/.gemini/antigravity/brain/3eaacce2-3e5f-4da3-ac6d-e62c8e0664ab/task.md', 'w') as f:
    f.write(content)
