import re

with open('src/app/components/lessonPlanner/CurriculumTrackerView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
content = content.replace("import { getCurriculumTrack, saveCurriculumTrack } from '../../utils/lessonPlannerStorage';", "import { getCurriculumTrack, saveCurriculumTrack } from '../../utils/lessonPlannerStorage';\nimport { generateAICurriculumTopics } from '../../utils/aiService';\nimport { Loader, Sparkles } from 'lucide-react';")

# Add isGenerating state
content = content.replace("const [track, setTrack] = useState<CurriculumTrack>(getCurriculumTrack());", "const [track, setTrack] = useState<CurriculumTrack>(getCurriculumTrack());\n  const [isGenerating, setIsGenerating] = useState(false);")

auto_gen_func = """  const handleAutoGenerate = async () => {
    setIsGenerating(true);
    toast.info('Analyzing curriculum & generating topics...');
    
    try {
      const generated = await generateAICurriculumTopics(subject, grade, track.frameworkName, plan?.topic || 'General Overview');
      if (generated && generated.length > 0) {
        const newTopics = generated.map((t: any, i: number) => ({
          id: `topic-gen-${Date.now()}-${i}`,
          title: t.title,
          status: 'outstanding',
          estimatedHours: t.estimatedHours || 1
        }));
        
        const updatedTrack = {
          ...track,
          topics: [...track.topics, ...newTopics],
          totalTopicsCount: track.topics.length + newTopics.length,
          completionPercentage: Math.round((track.coveredTopicsCount / (track.topics.length + newTopics.length)) * 100) || 0
        };
        
        setTrack(updatedTrack);
        saveCurriculumTrack(updatedTrack);
        toast.success(`Generated ${newTopics.length} curriculum topics!`);
      } else {
        toast.error('Failed to generate topics.');
      }
    } catch (e) {
      toast.error('Error connecting to AI.');
    }
    setIsGenerating(false);
  };
"""

content = content.replace("  const toggleTopicStatus = (topicId: string) => {", auto_gen_func + "\n  const toggleTopicStatus = (topicId: string) => {")

button_ui = """        <div>
          <Button onClick={handleAutoGenerate} disabled={isGenerating} className="bg-indigo-600 hover:bg-indigo-700 text-white border-none text-xs">
            {isGenerating ? <><Loader className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4 mr-2" /> Auto-Generate Topics</>}
          </Button>
        </div>
      </div>"""

content = re.sub(r'          </p>\n        </div>\n      </div>', '          </p>\n        </div>\n' + button_ui, content, flags=re.DOTALL)

with open('src/app/components/lessonPlanner/CurriculumTrackerView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated CurriculumTrackerView")
