import re

with open('src/app/components/lessonPlanner/SchoolInsightsDashboardView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace hardcoded learning styles with actual summary data
new_student_insights = """          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Visual Learners</span>
                <span className="text-indigo-600">{Math.round((summary.learningStyles.Visual / summary.totalStudents) * 100) || 0}%</span>
              </div>
              <Progress value={Math.round((summary.learningStyles.Visual / summary.totalStudents) * 100) || 0} className="h-2 bg-indigo-100" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Auditory Learners</span>
                <span className="text-purple-600">{Math.round((summary.learningStyles.Auditory / summary.totalStudents) * 100) || 0}%</span>
              </div>
              <Progress value={Math.round((summary.learningStyles.Auditory / summary.totalStudents) * 100) || 0} className="h-2 bg-purple-100" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Kinesthetic Learners</span>
                <span className="text-amber-600">{Math.round((summary.learningStyles.Kinesthetic / summary.totalStudents) * 100) || 0}%</span>
              </div>
              <Progress value={Math.round((summary.learningStyles.Kinesthetic / summary.totalStudents) * 100) || 0} className="h-2 bg-amber-100" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Read/Write Learners</span>
                <span className="text-emerald-600">{Math.round((summary.learningStyles.ReadWrite / summary.totalStudents) * 100) || 0}%</span>
              </div>
              <Progress value={Math.round((summary.learningStyles.ReadWrite / summary.totalStudents) * 100) || 0} className="h-2 bg-emerald-100" />
            </div>
          </CardContent>"""

content = re.sub(r'<CardContent className="space-y-4">\n\s*<div className="space-y-2">\n\s*<div className="flex justify-between text-xs font-semibold">\n\s*<span>Visual Learners</span>.*?</CardContent>', new_student_insights, content, flags=re.DOTALL)


with open('src/app/components/lessonPlanner/SchoolInsightsDashboardView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Classroom Intelligence charts")
