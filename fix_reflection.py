import re

with open('src/app/components/lessonPlanner/PostLessonReflectionModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add new state for school recommendations
content = content.replace("const [followUpActions, setFollowUpActions] = useState('Provide 2 additional word problem scaffolds in next session.');", "const [followUpActions, setFollowUpActions] = useState('Provide 2 additional word problem scaffolds in next session.');\n  const [schoolRecommendations, setSchoolRecommendations] = useState('');")

# Add to submit
content = content.replace("followUpActions,\n      reflectedAt: new Date().toISOString()", "followUpActions,\n      schoolRecommendations,\n      reflectedAt: new Date().toISOString()")

# Add UI for school recommendations
new_ui = """            <div>
              <Label className="text-xs font-semibold text-slate-700">Follow-Up Actions</Label>
              <textarea
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mt-1 resize-none"
                value={followUpActions}
                onChange={(e) => setFollowUpActions(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Recommendations for School Administration (Optional)</Label>
              <textarea
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mt-1 resize-none"
                placeholder="e.g. Need more visual aids for this topic, or projector in Room 4 is broken."
                value={schoolRecommendations}
                onChange={(e) => setSchoolRecommendations(e.target.value)}
              />
            </div>"""

content = re.sub(r'            <div>\n\s*<Label className="text-xs font-semibold text-slate-700">Follow-Up Actions</Label>.*?</div>', new_ui, content, flags=re.DOTALL)

# Make fields required
required_validation = """  const handleSubmit = async () => {
    if (!whatWorkedWell.trim() || !areasForImprovement.trim() || !followUpActions.trim()) {
      toast.error('Please fill out all compulsory reflection fields.');
      return;
    }"""
content = content.replace("  const handleSubmit = async () => {", required_validation)
content = content.replace("This reflection helps the AI continuously improve", "This compulsory reflection helps the AI continuously improve")

with open('src/app/components/lessonPlanner/PostLessonReflectionModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

with open('src/app/types/lessonPlannerTypes.ts', 'r', encoding='utf-8') as f:
    types = f.read()
if "schoolRecommendations?: string;" not in types:
    types = types.replace("followUpActions: string;", "followUpActions: string;\n  schoolRecommendations?: string;")
    with open('src/app/types/lessonPlannerTypes.ts', 'w', encoding='utf-8') as f:
        f.write(types)

print("Updated Reflection Modal")
