import re

with open('src/app/components/lessonPlanner/LessonPlanCreation.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add mode
content = content.replace("useState<'ai' | 'manual'>('ai')", "useState<'ai' | 'manual' | 'upload'>('ai')")
content = content.replace("const [appObj, setAppObj] = useState('');", "const [appObj, setAppObj] = useState('');\n  const [existingPlanText, setExistingPlanText] = useState('');")

# Add upload button
buttons_old = """          <Button
            variant={mode === 'manual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('manual')}
            className={mode === 'manual' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-white/10 text-white border-white/20'}
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" /> Manual Form
          </Button>"""

buttons_new = """          <Button
            variant={mode === 'manual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('manual')}
            className={mode === 'manual' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-white/10 text-white border-white/20'}
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" /> Manual Form
          </Button>
          <Button
            variant={mode === 'upload' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('upload')}
            className={mode === 'upload' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-white/10 text-white border-white/20'}
          >
            <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Upload Existing
          </Button>"""

content = content.replace(buttons_old, buttons_new)

# Add Upload Mode UI
manual_form_start = """            {mode === 'manual' && ("""
upload_form = """            {mode === 'upload' && (
              <div className="md:col-span-2 md:col-start-1 mt-4 space-y-4 border-t pt-4">
                <h3 className="font-semibold text-sm">Upload or Paste Existing Lesson Plan</h3>
                <p className="text-xs text-slate-500">Paste your existing lesson plan text below, and Jotti AI will automatically tailor it to fit your class demands, cognitive profiles, and chosen curriculum.</p>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Paste your lesson plan here..."
                    className="min-h-[200px]"
                    value={existingPlanText}
                    onChange={(e) => setExistingPlanText(e.target.value)}
                  />
                  <div>
                    <input 
                      type="file" 
                      accept=".txt,.md,.csv"
                      className="hidden" 
                      id="lesson-file-upload" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => setExistingPlanText(event.target?.result as string);
                          reader.readAsText(file);
                        }
                      }}
                    />
                    <label htmlFor="lesson-file-upload" className="cursor-pointer text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                      Or upload a text file (.txt, .md)
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {mode === 'manual' && ("""

content = content.replace(manual_form_start, upload_form)

# Add Textarea import if not exists
if "Textarea" not in content:
    content = content.replace("import { Input } from '../ui/input';", "import { Input } from '../ui/input';\nimport { Textarea } from '../ui/textarea';")

# Add Upload logic to handleGenerateAI
generate_ai_old = """  const handleGenerateAI = async () => {
    if (!subject || !topic || !gradeClass) {
      toast.error('Please enter Subject, Grade/Class, and Topic.');
      return;
    }

    setIsGenerating(true);
    toast.info('Creating your lesson structure...');"""

generate_ai_new = """  const handleGenerateAI = async () => {
    if (!subject || !topic || !gradeClass) {
      toast.error('Please enter Subject, Grade/Class, and Topic.');
      return;
    }
    if (mode === 'upload' && !existingPlanText.trim()) {
      toast.error('Please paste or upload your existing lesson plan first.');
      return;
    }

    setIsGenerating(true);
    toast.info('Creating your lesson structure...');"""

content = content.replace(generate_ai_old, generate_ai_new)

with open('src/app/components/lessonPlanner/LessonPlanCreation.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated LessonPlanCreation with Upload mode")
