import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Sparkles, BookOpen, Clock, Calendar, CheckCircle2, FileText, Loader, ArrowRight, Search } from 'lucide-react';
import { LessonPlan, ClassCognitiveSummary } from '../../types/lessonPlannerTypes';
import { generateAILessonPlan } from '../../utils/aiService';
import { saveLessonPlan } from '../../utils/lessonPlannerStorage';
import { toast } from 'sonner';

interface LessonPlanCreationProps {
  classSummary?: ClassCognitiveSummary;
  onPlanCreated: (plan: LessonPlan) => void;
}

export const LessonPlanCreation: React.FC<LessonPlanCreationProps> = ({
  classSummary,
  onPlanCreated
}) => {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [subject, setSubject] = useState('Mathematics');
  const [gradeClass, setGradeClass] = useState('JHS 2');
  const [curriculumFramework, setCurriculumFramework] = useState('National');
  const [topic, setTopic] = useState('Linear Equations in One Variable');
  const [subtopic, setSubtopic] = useState('Solving Algebraic Equations & Word Problems');
  const [durationMinutes, setDurationMinutes] = useState(40);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Manual mode state
  const [knowledgeObj, setKnowledgeObj] = useState('Define a linear equation in one variable.\nIdentify variables, coefficients, and constants.');
  const [skillsObj, setSkillsObj] = useState('Solve simple linear equations involving addition and subtraction.');
  const [appObj, setAppObj] = useState('Apply linear equations to calculate simple real-life budgeting scenarios.');

  const handleGenerateAI = async () => {
    if (!subject || !topic || !gradeClass) {
      toast.error('Please enter Subject, Grade/Class, and Topic.');
      return;
    }

    setIsGenerating(true);
    toast.info('Creating your lesson structure...');

    // Call real AI proxy or generate structured response
    const aiResult = await generateAILessonPlan({
      subject,
      gradeClass,
      topic,
      durationMinutes,
      classSummary
    });

    setIsGenerating(false);

    const newPlan: LessonPlan = {
      id: `lp-${Date.now()}`,
      teacherId: 'teacher-1',
      subject,
      gradeClass,
      topic,
      subtopic,
      durationMinutes,
      date,
      curriculumFramework,
      objectives: aiResult?.objectives || {
        knowledge: [
          `Define key concepts of ${topic} in ${subject}.`,
          `Identify core principles and key variables.`
        ],
        skills: [
          `Execute step-by-step calculations and problem-solving methods for ${topic}.`,
          `Demonstrate accuracy in guided practice tasks.`
        ],
        applications: [
          `Apply ${topic} to solve practical real-life scenarios relevant to ${gradeClass} learners.`
        ]
      },
      phases: aiResult?.phases || [
        {
          name: 'Introduction',
          durationMinutes: 5,
          activity: `Hook & Prior Knowledge Check: Present a visual real-world problem statement on ${topic}.`,
          teachingNotes: 'Engage visual learners by drawing diagrams or showing real objects.',
          materialsNeeded: ['Whiteboard', 'Visual diagram']
        },
        {
          name: 'Main Lesson',
          durationMinutes: 15,
          activity: `Direct Instruction: Step-by-step breakdown of ${topic} with worked examples.`,
          teachingNotes: 'Break down complex steps into color-coded stages.',
          materialsNeeded: ['Instructional handout']
        },
        {
          name: 'Guided Practice',
          durationMinutes: 10,
          activity: `Peer Pair Work: Differentiated task cards addressing core, support, and extension groups.`,
          teachingNotes: 'Rove and assist the 5 students flagged for abstract concept support.',
          materialsNeeded: ['Task cards']
        },
        {
          name: 'Assessment',
          durationMinutes: 5,
          activity: `Exit Ticket: 2 quick check questions to evaluate lesson objective mastery.`,
          teachingNotes: 'Collect exit slips to evaluate understanding levels.',
          materialsNeeded: ['Exit tickets']
        },
        {
          name: 'Conclusion',
          durationMinutes: 5,
          activity: `Lesson Wrap-up: Summarize 3 core takeaways and preview next topic connection.`,
          teachingNotes: 'Encourage student verbal recap.',
          materialsNeeded: []
        }
      ],
      differentiatedInstruction: {
        coreActivity: {
          title: `Standard ${topic} Problem Solving`,
          description: `Solve 4 standard ${topic} exercises independently.`,
          targetGroup: 'Average Proficiency Learners (60% of class)'
        },
        supportActivity: {
          title: `Visual Step-by-Step Guided Task`,
          description: `Solve 2 scaffolded ${topic} problems using visual templates and formula cards.`,
          targetGroup: 'Learners needing abstract support (5 students)',
          scaffoldingNotes: ['Provide formula reference sheet', 'Color-code variables']
        },
        advancedActivity: {
          title: `Real-World Application & Modeling`,
          description: `Formulate a real-life word problem statement representing ${topic} and solve it.`,
          targetGroup: 'High Achievers & Fast Finishers (6 students)',
          extensionTasks: ['Create challenge problem for a classmate']
        }
      },
      status: 'generated',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveLessonPlan(newPlan);
    toast.success('Lesson Plan generated and saved successfully!');
    onPlanCreated(newPlan);
  };

  const handleManualSave = () => {
    if (!subject || !topic || !gradeClass) {
      toast.error('Please fill in Subject, Grade/Class, and Topic.');
      return;
    }

    const newPlan: LessonPlan = {
      id: `lp-m-${Date.now()}`,
      teacherId: 'teacher-1',
      subject,
      gradeClass,
      topic,
      subtopic,
      durationMinutes,
      date,
      curriculumFramework,
      objectives: {
        knowledge: knowledgeObj.split('\n').filter(Boolean),
        skills: skillsObj.split('\n').filter(Boolean),
        applications: appObj.split('\n').filter(Boolean)
      },
      phases: [
        { name: 'Introduction', durationMinutes: 5, activity: 'Lesson introduction and objectives review.' },
        { name: 'Main Lesson', durationMinutes: 15, activity: 'Direct teacher explanation of topic.' },
        { name: 'Guided Practice', durationMinutes: 10, activity: 'Student practice exercises.' },
        { name: 'Assessment', durationMinutes: 5, activity: 'Quick check quiz.' },
        { name: 'Conclusion', durationMinutes: 5, activity: 'Summary and homework assignment.' }
      ],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveLessonPlan(newPlan);
    toast.success('Manual Lesson Plan saved successfully!');
    onPlanCreated(newPlan);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-800/30 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 px-3 py-0.5 text-xs">
              Module 1 • Lesson Creation
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 px-3 py-0.5 text-xs">
              Save Planning Time
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" /> Lesson Plan Generator
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Generate customized lesson plans to support diverse learners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={mode === 'ai' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('ai')}
            className={mode === 'ai' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-white/10 text-white border-white/20'}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Auto Generator
          </Button>
          <Button
            variant={mode === 'manual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('manual')}
            className={mode === 'manual' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-white/10 text-white border-white/20'}
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" /> Manual Form
          </Button>
        </div>
      </div>

      {/* Main Input Form Card */}
      <Card className="shadow-md border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            Lesson Parameters & Target Class
          </CardTitle>
          <CardDescription className="text-xs">
            Specify the subject, topic, and duration for your target classroom.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-semibold">Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Mathematics"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Grade / Class</Label>
              <Input
                value={gradeClass}
                onChange={(e) => setGradeClass(e.target.value)}
                placeholder="e.g. JHS 2"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Curriculum Type</Label>
              <div className="relative mt-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  value={curriculumFramework}
                  onChange={(e) => setCurriculumFramework(e.target.value)}
                  placeholder="Search curriculum... (e.g. National, Cambridge)"
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold">Lesson Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label className="text-xs font-semibold">Topic</Label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Linear Equations in One Variable"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Duration (Minutes)</Label>
              <Input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                placeholder="40"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Subtopic (Optional)</Label>
            <Input
              value={subtopic}
              onChange={(e) => setSubtopic(e.target.value)}
              placeholder="e.g. Solving Algebraic Equations & Word Problems"
              className="mt-1"
            />
          </div>

          {/* AI vs Manual specific fields */}
          {mode === 'ai' ? (
            <div className="bg-indigo-50/70 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 space-y-3">
              <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-semibold text-xs">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>AI Cognitive Profile Integration</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                The AI will automatically incorporate your class cognitive summary (e.g.{' '}
                <strong>{classSummary?.className || 'JHS 2A'}</strong>: {classSummary?.learningStylesBreakdown?.visualPct || 45}% Visual, {classSummary?.learningStylesBreakdown?.kinestheticPct || 20}% Kinesthetic, and 5 students flagged for abstract support) to structure your lesson phases and differentiated activities.
              </p>
              <Button
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-md py-5"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Generating Cognitive-Aligned Lesson Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate AI Lesson Plan
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Manual Learning Objectives
              </h4>
              <div>
                <Label className="text-xs font-medium">Knowledge Objectives (1 per line)</Label>
                <textarea
                  value={knowledgeObj}
                  onChange={(e) => setKnowledgeObj(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Skills Objectives (1 per line)</Label>
                <textarea
                  value={skillsObj}
                  onChange={(e) => setSkillsObj(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Application Objectives (1 per line)</Label>
                <textarea
                  value={appObj}
                  onChange={(e) => setAppObj(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-1"
                />
              </div>
              <Button onClick={handleManualSave} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4">
                Save Manual Lesson Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
