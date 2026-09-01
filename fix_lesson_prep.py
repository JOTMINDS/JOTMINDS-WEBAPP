import re

with open('src/app/components/lessonPlanner/LessonDeliveryMode.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add Pre-Flight checklist UI
checklist_ui = """      {/* Pre-Flight Warning Banner */}
      <div className="bg-amber-100/50 border border-amber-300 rounded-xl p-4 flex gap-3 text-amber-900 shadow-sm animate-in fade-in">
        <CheckCircle2 className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <h4 className="font-bold text-sm">Crucial Pre-Class Review</h4>
          <p className="text-xs text-amber-800 mt-1">Reviewing this Lesson Prep is strongly recommended before entering the classroom. It aligns your teaching strategy with the current cognitive dynamics of your students, ensuring you are prepared for potential bottlenecks.</p>
        </div>
      </div>
"""

content = re.sub(r'      \{/\* Top Bar \*/\}', f'{checklist_ui}\n      {{/* Top Bar */}}', content)

with open('src/app/components/lessonPlanner/LessonDeliveryMode.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Lesson Prep Tool")
