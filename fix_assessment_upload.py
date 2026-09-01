import re

with open('src/app/components/lessonPlanner/AssessmentGeneratorView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add state for upload text
content = content.replace("const [isGenerating, setIsGenerating] = useState(false);", "const [isGenerating, setIsGenerating] = useState(false);\n  const [uploadText, setUploadText] = useState('');\n  const [showUpload, setShowUpload] = useState(false);")

# Ensure Textarea and Label are imported
if "Textarea" not in content:
    content = content.replace("import { Button } from '../ui/button';", "import { Button } from '../ui/button';\nimport { Textarea } from '../ui/textarea';\nimport { Label } from '../ui/label';\nimport { Upload } from 'lucide-react';")
elif "Upload" not in content:
    content = content.replace("import { FileCheck, Sparkles", "import { FileCheck, Sparkles, Upload")

# Add upload UI and logic
upload_ui = """      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-800/30 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 px-3 py-0.5 text-xs">
              Module 4 • Assessment Generation
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-400" /> Cognitive Assessment Suite
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Generate or upload formative and summative evaluations aligned with learning styles.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowUpload(!showUpload)} variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs">
            <Upload className="w-4 h-4 mr-2" /> Upload Materials
          </Button>
          <Button onClick={handleGenerateAssessment} disabled={isGenerating} className="bg-indigo-600 hover:bg-indigo-700 text-white border-none text-xs">
            {isGenerating ? <><Loader className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4 mr-2" /> Auto-Generate</>}
          </Button>
        </div>
      </div>

      {showUpload && (
        <Card className="border-indigo-200 bg-indigo-50/50 shadow-sm">
          <CardContent className="p-4 space-y-4">
            <Label className="text-sm font-bold text-indigo-900">Upload or Paste Your Assessment Materials</Label>
            <p className="text-xs text-indigo-700">Paste your own quiz, test, or questions here. AI will format it and align it with the cognitive assessment suite.</p>
            <Textarea
              value={uploadText}
              onChange={(e) => setUploadText(e.target.value)}
              placeholder="Paste questions here..."
              className="min-h-[120px] bg-white"
            />
            <Button size="sm" onClick={handleGenerateAssessment} disabled={isGenerating || !uploadText.trim()} className="bg-indigo-600 text-white hover:bg-indigo-700 w-full">
              Process Uploaded Materials
            </Button>
          </CardContent>
        </Card>
      )}"""

content = re.sub(r'      \{/\* Header Banner \*/\}.*?Auto-Generate</>\}\n          </Button>\n        </div>\n      </div>', upload_ui, content, flags=re.DOTALL)

with open('src/app/components/lessonPlanner/AssessmentGeneratorView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

# Update aiService.ts signature to handle the new field
with open('src/app/utils/aiService.ts', 'r', encoding='utf-8') as f:
    ai_content = f.read()
if "uploadText: string" not in ai_content:
    ai_content = ai_content.replace(
        "subject: string; topic: string; gradeClass: string; durationMinutes?: number; classSummary?: any",
        "subject: string; topic: string; gradeClass: string; durationMinutes?: number; classSummary?: any; uploadText?: string"
    )
    ai_content = ai_content.replace(
        "${payload.classSummary ? `Class Summary: ${JSON.stringify(payload.classSummary)}` : ''}",
        "${payload.classSummary ? `Class Summary: ${JSON.stringify(payload.classSummary)}` : ''}\n${payload.uploadText ? `CRITICAL INSTRUCTION: The teacher provided their own assessment material below. YOU MUST USE IT and format it correctly instead of generating from scratch.\nUPLOADED MATERIAL:\n${payload.uploadText}` : ''}"
    )
    with open('src/app/utils/aiService.ts', 'w', encoding='utf-8') as f:
        f.write(ai_content)

print("Updated AssessmentGeneratorView")
