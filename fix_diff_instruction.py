import re

# Update types
with open('src/app/types/lessonPlannerTypes.ts', 'r', encoding='utf-8') as f:
    types = f.read()

types = types.replace(
    "extensionTasks?: string[];\n  };",
    "extensionTasks?: string[];\n  };\n  teacherSuggestedActivities?: { title: string; description: string; targetGroup: string; }[];"
)

with open('src/app/types/lessonPlannerTypes.ts', 'w', encoding='utf-8') as f:
    f.write(types)

# Update View
with open('src/app/components/lessonPlanner/DifferentiatedInstructionView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("const [isGenerating, setIsGenerating] = useState(false);", "const [isGenerating, setIsGenerating] = useState(false);\n  const [showAddForm, setShowAddForm] = useState(false);\n  const [newActTitle, setNewActTitle] = useState('');\n  const [newActDesc, setNewActDesc] = useState('');\n  const [newActTarget, setNewActTarget] = useState('All Students');")
if "Input" not in content:
    content = content.replace("import { Button } from '../ui/button';", "import { Button } from '../ui/button';\nimport { Input } from '../ui/input';\nimport { Textarea } from '../ui/textarea';\nimport { Label } from '../ui/label';\nimport { Plus } from 'lucide-react';")

ui_add = """      {/* Teacher Suggestions */}
      {instruction.teacherSuggestedActivities && instruction.teacherSuggestedActivities.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b pb-2">Teacher Suggested Activities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {instruction.teacherSuggestedActivities.map((act, i) => (
              <Card key={i} className="border-indigo-200 shadow-sm bg-white">
                <CardHeader className="bg-indigo-50/50 pb-4">
                  <Badge className="w-fit bg-indigo-100 text-indigo-700 hover:bg-indigo-200 mb-2">{act.targetGroup}</Badge>
                  <CardTitle className="text-md text-indigo-900">{act.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{act.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {showAddForm ? (
        <Card className="border-indigo-200 shadow-sm bg-indigo-50/30">
          <CardHeader>
            <CardTitle className="text-sm">Suggest an Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Activity Title</Label>
              <Input value={newActTitle} onChange={e => setNewActTitle(e.target.value)} placeholder="e.g. Peer Teaching Exercise" />
            </div>
            <div>
              <Label className="text-xs">Target Group</Label>
              <Input value={newActTarget} onChange={e => setNewActTarget(e.target.value)} placeholder="e.g. Visual Learners, Fast Finishers" />
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Textarea value={newActDesc} onChange={e => setNewActDesc(e.target.value)} placeholder="Describe the activity..." />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => {
                if(!newActTitle.trim()) return;
                const updated = { ...instruction, teacherSuggestedActivities: [...(instruction.teacherSuggestedActivities || []), { title: newActTitle, description: newActDesc, targetGroup: newActTarget }] };
                setInstruction(updated);
                if (onUpdateInstruction) onUpdateInstruction(updated);
                setShowAddForm(false);
                setNewActTitle(''); setNewActDesc(''); setNewActTarget('All Students');
              }} className="bg-indigo-600 text-white">Save Suggestion</Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" onClick={() => setShowAddForm(true)} className="w-full border-dashed text-slate-500">
          <Plus className="w-4 h-4 mr-2" /> Suggest an Activity
        </Button>
      )}"""

# Insert before final div
content = re.sub(r'    </div>\n  \);\n};\n', f'      {ui_add}\n    </div>\n  );\n}};\n', content)

with open('src/app/components/lessonPlanner/DifferentiatedInstructionView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated DifferentiatedInstructionView")
