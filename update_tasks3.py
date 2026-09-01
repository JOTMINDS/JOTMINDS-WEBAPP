with open('/Users/GRIM/.gemini/antigravity/brain/3eaacce2-3e5f-4da3-ac6d-e62c8e0664ab/task.md', 'r') as f:
    content = f.read()

content = content.replace('- `[ ]` Teaching insights: Review development recommendations. Use local references, materials that relate to target market', '- `[x]` Teaching insights: Review development recommendations. Use local references, materials that relate to target market')
content = content.replace('- `[ ]` Teaching insights: Use language that make growth and strength opportunities more personalized to teacher', '- `[x]` Teaching insights: Use language that make growth and strength opportunities more personalized to teacher')
content = content.replace('- `[ ]` Teaching insights: Review 5 core domains page UI. Easy to understand and interpret at first glance', '- `[x]` Teaching insights: Review 5 core domains page UI. Easy to understand and interpret at first glance')

with open('/Users/GRIM/.gemini/antigravity/brain/3eaacce2-3e5f-4da3-ac6d-e62c8e0664ab/task.md', 'w') as f:
    f.write(content)
