import re

with open('src/app/components/lessonPlanner/SchoolInsightsDashboardView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace hardcoded numbers
new_kpis = """      {/* Top Level School KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Students Assessed</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">{summary.totalStudents}</span>
            <p className="text-[10px] text-slate-500">In your current class context</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Unique Profiles</span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{Object.keys(summary.dominantStyles).length}</span>
            <p className="text-[10px] text-slate-500">Distinct learning types in class</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Class Harmony Index</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {summary.totalStudents > 0 ? 
                (Object.values(summary.dominantStyles)[0] || 0) / summary.totalStudents > 0.5 ? 'High' : 'Moderate'
               : 'N/A'}
            </span>
            <p className="text-[10px] text-slate-500">Based on style distribution</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Primary Approach</span>
            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 truncate">
              {Object.entries(summary.dominantStyles).sort((a,b) => b[1] - a[1])[0]?.[0] || 'Mixed'}
            </span>
            <p className="text-[10px] text-slate-500">Most effective strategy</p>
          </CardContent>
        </Card>
      </div>"""

content = re.sub(r'      \{/\* Top Level School KPIs \*/\}.*?</Card>\n      </div>', new_kpis, content, flags=re.DOTALL)

with open('src/app/components/lessonPlanner/SchoolInsightsDashboardView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated SchoolInsightsDashboardView")
