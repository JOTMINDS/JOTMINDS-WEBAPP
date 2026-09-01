with open('/Users/GRIM/.gemini/antigravity/brain/3eaacce2-3e5f-4da3-ac6d-e62c8e0664ab/task.md', 'r') as f:
    content = f.read()

content = content.replace('- `[ ]` Notifications button: Review notifications button. Buttons and redirects not working', '- `[x]` Notifications button: Review notifications button. Buttons and redirects not working')

with open('/Users/GRIM/.gemini/antigravity/brain/3eaacce2-3e5f-4da3-ac6d-e62c8e0664ab/task.md', 'w') as f:
    f.write(content)
