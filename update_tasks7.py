with open('/Users/GRIM/.gemini/antigravity/brain/3eaacce2-3e5f-4da3-ac6d-e62c8e0664ab/task.md', 'r') as f:
    content = f.read()

content = content.replace('- `[ ]` Overview: change UI and add more options to view Learning Assessment graph', '- `[x]` Overview: change UI and add more options to view Learning Assessment graph')
content = content.replace('- `[ ]` Overview: review Class Insights section', '- `[x]` Overview: review Class Insights section')
content = content.replace('- `[ ]` Analytics: Review how to present learning, decision and thinking style. Make it easier to navigate between graphs and data presentation', '- `[x]` Analytics: Review how to present learning, decision and thinking style. Make it easier to navigate between graphs and data presentation')
content = content.replace('- `[ ]` Analytics: Alignment Analysis not showing', '- `[x]` Analytics: Alignment Analysis not showing')
content = content.replace('- `[ ]` Analytics: Class Insights. Review and change score system and presentation', '- `[x]` Analytics: Class Insights. Review and change score system and presentation')
content = content.replace('- `[ ]` Analytics: Review UI for analytics. Make it much easier to interpret by teachers', '- `[x]` Analytics: Review UI for analytics. Make it much easier to interpret by teachers')

with open('/Users/GRIM/.gemini/antigravity/brain/3eaacce2-3e5f-4da3-ac6d-e62c8e0664ab/task.md', 'w') as f:
    f.write(content)
