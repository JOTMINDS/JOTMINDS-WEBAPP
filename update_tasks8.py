with open('/Users/GRIM/.gemini/antigravity/brain/3eaacce2-3e5f-4da3-ac6d-e62c8e0664ab/task.md', 'r') as f:
    content = f.read()

content = content.replace('- `[ ]` Students: Review learning dimensions radar under view profile. Explore other ways to interpret graph to teachers', '- `[x]` Students: Review learning dimensions radar under view profile. Explore other ways to interpret graph to teachers')

with open('/Users/GRIM/.gemini/antigravity/brain/3eaacce2-3e5f-4da3-ac6d-e62c8e0664ab/task.md', 'w') as f:
    f.write(content)
