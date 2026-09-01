with open('src/app/components/lessonPlanner/LessonCopilotDrawer.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import { chatWithLessonCopilot } from '../../utils/aiService';", "import { chatWithJotti } from '../../utils/aiService';")
content = content.replace("const replyText = await chatWithLessonCopilot(userMsg.text, updated.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })), context);",
                          "const replyText = await chatWithJotti(userMsg.text, updated.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })), context);")

content = content.replace('placeholder="Ask Jotti for lesson ideas or quizzes..."', 'placeholder={context === "lesson-planner" ? "Ask Jotti for lesson ideas..." : "Ask Jotti anything..."}')

quick_prompts_replacement = """        <div className="flex flex-wrap gap-1.5">
          {context === 'lesson-planner' ? (
            <>
              <button onClick={() => setInput('Create a 60-minute lesson on Photosynthesis for SHS 1.')} className="text-[11px] bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-colors">Photosynthesis Lesson</button>
              <button onClick={() => setInput('Generate a 3-question quiz on the current topic.')} className="text-[11px] bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-colors">Generate Quiz</button>
              <button onClick={() => setInput('Suggest a group activity for visual learners.')} className="text-[11px] bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-colors">Visual Group Activity</button>
            </>
          ) : context === 'analytics' ? (
            <>
              <button onClick={() => setInput('How can I better engage kinesthetic learners?')} className="text-[11px] bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-colors">Engage Kinesthetic Learners</button>
              <button onClick={() => setInput('Explain the Alignment Score.')} className="text-[11px] bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-colors">Explain Alignment</button>
            </>
          ) : (
            <>
              <button onClick={() => setInput('Help me analyze my teaching strengths.')} className="text-[11px] bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-colors">Analyze Strengths</button>
              <button onClick={() => setInput('Suggest a fun icebreaker activity.')} className="text-[11px] bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-colors">Icebreaker Activity</button>
            </>
          )}
        </div>"""

import re
content = re.sub(r'<div className="flex flex-wrap gap-1\.5">.*?</div>', quick_prompts_replacement, content, flags=re.DOTALL)

with open('src/app/components/lessonPlanner/LessonCopilotDrawer.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated drawer")
