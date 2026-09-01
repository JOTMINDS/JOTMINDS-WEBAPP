import re

with open('src/app/components/lessonPlanner/LessonDocumentEditor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("interface LessonDocumentEditorProps {\n  plan?: LessonPlan;\n  onUpdate: (plan: LessonPlan) => void;\n}", "interface LessonDocumentEditorProps {\n  plan?: LessonPlan;\n  onUpdate: (plan: LessonPlan) => void;\n  onCompleteRequest?: () => void;\n}")
content = content.replace("export const LessonDocumentEditor: React.FC<LessonDocumentEditorProps> = ({ plan, onUpdate }) => {", "export const LessonDocumentEditor: React.FC<LessonDocumentEditorProps> = ({ plan, onUpdate, onCompleteRequest }) => {")

complete_func = """  const handleMarkCompleted = () => {
    if (onCompleteRequest) {
      onCompleteRequest();
    } else {
      const updatedPlan = { ...plan, status: 'completed' as const, updatedAt: new Date().toISOString() };
      saveLessonPlan(updatedPlan);
      onUpdate(updatedPlan);
      toast.success('Marked as Completed!');
    }
  };"""

content = re.sub(r'  const handleMarkCompleted = \(\) => \{.*?toast\.success\(\'Marked as Completed!\'\);\n  \};', complete_func, content, flags=re.DOTALL)

with open('src/app/components/lessonPlanner/LessonDocumentEditor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

with open('src/app/components/lessonPlanner/AILessonPlannerContainer.tsx', 'r', encoding='utf-8') as f:
    container = f.read()

container = container.replace("<LessonDocumentEditor plan={activePlan} onUpdate={handlePlanUpdate} />", "<LessonDocumentEditor plan={activePlan} onUpdate={handlePlanUpdate} onCompleteRequest={() => setShowReflectionModal(true)} />")
with open('src/app/components/lessonPlanner/AILessonPlannerContainer.tsx', 'w', encoding='utf-8') as f:
    f.write(container)
    
print("Linked Document Editor to Reflection Modal")
