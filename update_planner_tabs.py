import re

with open('src/app/components/lessonPlanner/AILessonPlannerContainer.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Import the new component
content = content.replace("import { LessonCopilotDrawer } from './LessonCopilotDrawer';", "import { LessonCopilotDrawer } from './LessonCopilotDrawer';\nimport { LessonDocumentEditor } from './LessonDocumentEditor';")

# Add the tab trigger
tab_trigger_old = """            <TabsTrigger value="insights" className="rounded-xl px-3.5 py-2 text-xs font-semibold data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" /> Insights
            </TabsTrigger>"""

tab_trigger_new = """            <TabsTrigger value="document" className="rounded-xl px-3.5 py-2 text-xs font-semibold data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Document
            </TabsTrigger>
            <TabsTrigger value="insights" className="rounded-xl px-3.5 py-2 text-xs font-semibold data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" /> Insights
            </TabsTrigger>"""

content = content.replace(tab_trigger_old, tab_trigger_new)

# Add the tab content
tab_content_old = """        <TabsContent value="insights" className="mt-0 outline-none">"""
tab_content_new = """        <TabsContent value="document" className="mt-0 outline-none">
          <LessonDocumentEditor plan={activePlan} onUpdate={setActivePlan} />
        </TabsContent>
        <TabsContent value="insights" className="mt-0 outline-none">"""

content = content.replace(tab_content_old, tab_content_new)

# Ensure setActivePlan correctly updates the list of plans
# Wait, setActivePlan just updates the active plan, but what if they save?
# The saving is handled inside the component via saveLessonPlan, but we should update local state 'plans' array if needed.
# Since it's passed as onUpdate, let's make a wrapper function.
wrapper = """  const handlePlanUpdate = (updatedPlan: LessonPlan) => {
    setActivePlan(updatedPlan);
    setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
  };"""

content = content.replace("const computeClassSummary = (): ClassCognitiveSummary => {", wrapper + "\n\n  const computeClassSummary = (): ClassCognitiveSummary => {")
content = content.replace("<LessonDocumentEditor plan={activePlan} onUpdate={setActivePlan} />", "<LessonDocumentEditor plan={activePlan} onUpdate={handlePlanUpdate} />")

with open('src/app/components/lessonPlanner/AILessonPlannerContainer.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated AILessonPlannerContainer with Document tab")
