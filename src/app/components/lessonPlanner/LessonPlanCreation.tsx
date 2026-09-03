import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Sparkles, BookOpen, Clock, Calendar, CheckCircle2, FileText, Loader, ArrowRight, Search } from 'lucide-react';
import { LessonPlan, ClassCognitiveSummary } from '../../types/lessonPlannerTypes';
import { generateAILessonPlan } from '../../utils/aiService';
import { saveLessonPlan } from '../../utils/lessonPlannerStorage';
import { toast } from 'sonner';

interface LessonPlanCreationProps {
  classSummary?: ClassCognitiveSummary;
  onPlanCreated: (plan: LessonPlan) => void;
  user: any;
}

export const LessonPlanCreation: React.FC<LessonPlanCreationProps> = ({
  classSummary,
  onPlanCreated,
  user
}) => {
  const [mode, setMode] = useState<'ai' | 'manual' | 'upload'>('ai');
  const [subject, setSubject] = useState('');
  const [gradeClass, setGradeClass] = useState('');
  const [curriculumFramework, setCurriculumFramework] = useState<any>('National Curriculum');
  const [topic, setTopic] = useState('');
  const [subtopic, setSubtopic] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('09:15');
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto-calculate duration from date and time
  const handleDateOrTimeChange = (
    newDate: string,
    newEndDate: string,
    newStart: string,
    newEnd: string
  ) => {
    setDate(newDate);
    setEndDate(newEndDate);
    setStartTime(newStart);
    setEndTime(newEnd);

    try {
      const s = new Date(`${newDate}T${newStart || '08:00'}`);
      const e = new Date(`${newEndDate || newDate}T${newEnd || '08:45'}`);
      const diffMinutes = Math.round((e.getTime() - s.getTime()) / (1000 * 60));
      if (diffMinutes > 0 && diffMinutes <= 480) {
        setDurationMinutes(diffMinutes);
      }
    } catch {
      // Keep existing duration on invalid date strings
    }
  };

  // Manual mode state
  const [knowledgeObj, setKnowledgeObj] = useState('');
  const [skillsObj, setSkillsObj] = useState('');
  const [appObj, setAppObj] = useState('');
  const [existingPlanText, setExistingPlanText] = useState('');

  const handleGenerateAI = async () => {
    if (!subject || !topic || !gradeClass) {
      toast.error('Please enter Subject, Grade/Class, and Topic.');
      return;
    }
    if (mode === 'upload' && !existingPlanText.trim()) {
      toast.error('Please paste or upload your existing lesson plan first.');
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
      existingPlanText: mode === "upload" ? existingPlanText : undefined,
      classSummary
    });

    setIsGenerating(false);

    const newPlan: LessonPlan = {
      id: `lp-${Date.now()}`,
      teacherId: user?.id || 'unknown',
      subject,
      gradeClass,
      topic,
      subtopic,
      durationMinutes,
      existingPlanText: mode === "upload" ? existingPlanText : undefined,
      date,
      endDate,
      curriculumFramework: curriculumFramework as any,
            objectives: (Array.isArray(aiResult?.objectives) ? {
        knowledge: aiResult.objectives,
        skills: [],
        applications: []
      } : aiResult?.objectives) || {
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
      teacherId: user?.id || 'unknown',
      subject,
      gradeClass,
      topic,
      subtopic,
      durationMinutes,
      existingPlanText: mode === "upload" ? existingPlanText : undefined,
      date,
      endDate,
      curriculumFramework: curriculumFramework as any,
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
            Find official AI-powered Subject Specific Apps and easy access to NaCCA curriculum resources.
          </p>
        </div>
      </div>

      {/* 3 Prominent Visual Lesson Creation Modes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mode 1: AI Generated */}
        <div
          onClick={() => setMode('ai')}
          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
            mode === 'ai'
              ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 shadow-md ring-2 ring-indigo-500/30'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${mode === 'ai' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <Badge className={mode === 'ai' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'}>
              AI Accelerated
            </Badge>
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">1. AI Generated Lesson Plan</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Auto-generate curriculum-aligned lesson phases, differentiated tasks, and objectives using AI.
          </p>
        </div>

        {/* Mode 2: Manual Plan */}
        <div
          onClick={() => setMode('manual')}
          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
            mode === 'manual'
              ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 shadow-md ring-2 ring-emerald-500/30'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${mode === 'manual' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
              <FileText className="w-5 h-5" />
            </div>
            <Badge className={mode === 'manual' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'}>
              Full Control
            </Badge>
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">2. Manual Lesson Plan</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Type custom objectives, phases, pedagogical timings, and instructional resources manually.
          </p>
        </div>

        {/* Mode 3: Upload Existing */}
        <div
          onClick={() => setMode('upload')}
          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
            mode === 'upload'
              ? 'border-purple-600 bg-purple-50/80 dark:bg-purple-950/40 shadow-md ring-2 ring-purple-500/30'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${mode === 'upload' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <Badge className={mode === 'upload' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'}>
              AI Adaptation
            </Badge>
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">3. Upload Existing Plan</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Paste or upload your existing document to receive instant AI differentiation & recommendations.
          </p>
        </div>
      </div>

      {/* Main Input Form Card */}
      <Card className="shadow-md border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            Lesson Parameters & Target Class
          </CardTitle>
          <CardDescription className="text-xs">
            Specify the subject, topic, and duration for your target classroom. Duration is auto-calculated from schedule.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-semibold">Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. English Language"
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
              <Label className="text-xs font-semibold">Curriculum Framework</Label>
              <div className="mt-1">
                <Select value={curriculumFramework} onValueChange={(val) => setCurriculumFramework(val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select curriculum..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="National Curriculum">National Curriculum (NaCCA / GES)</SelectItem>
                    <SelectItem value="British Curriculum (Cambridge/Pearson Edexcel)">British Curriculum (Cambridge/Pearson Edexcel)</SelectItem>
                    <SelectItem value="Oxford International Curriculum">Oxford International Curriculum</SelectItem>
                    <SelectItem value="International Baccalaureate (IB)">International Baccalaureate (IB)</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Date, Time & Duration Scheduling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <Label className="text-[11px] font-semibold">Start Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => handleDateOrTimeChange(e.target.value, endDate, startTime, endTime)}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px] font-semibold">Start Time</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => handleDateOrTimeChange(date, endDate, e.target.value, endTime)}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px] font-semibold">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => handleDateOrTimeChange(date, e.target.value, startTime, endTime)}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px] font-semibold">End Time</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => handleDateOrTimeChange(date, endDate, startTime, e.target.value)}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px] font-semibold flex items-center justify-between">
                <span>Duration</span>
                <span className="text-[10px] text-indigo-600 font-normal">Auto-calculated</span>
              </Label>
              <div className="relative mt-1">
                <Input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  placeholder="45"
                  className="pr-12 text-xs font-bold"
                />
                <span className="absolute right-2.5 top-2 text-[11px] text-slate-400 font-medium">mins</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold">Topic / Strand</Label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Linear Equations in One Variable"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Subtopic / Sub-strand (Optional)</Label>
              <Input
                value={subtopic}
                onChange={(e) => setSubtopic(e.target.value)}
                placeholder="e.g. Balancing Equations with Inverse Operations"
                className="mt-1"
              />
            </div>
          </div>

          {/* Automated vs Upload vs Manual specific fields */}
          {mode === 'ai' && (
            <div className="bg-indigo-50/70 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 space-y-3">
              <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-semibold text-xs">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Cognitive Profile Integration</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                The system will automatically incorporate your class cognitive summary (e.g.{' '}
                <strong>{classSummary?.className || 'JHS 2A'}</strong>: {classSummary?.learningStylesBreakdown?.visualPct || 45}% Visual, {classSummary?.learningStylesBreakdown?.kinestheticPct || 20}% Kinesthetic, and students flagged for abstract support) to structure your lesson phases and differentiated activities.
              </p>
              <Button
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-md py-5 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Generating Cognitive-Aligned Lesson Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Lesson Plan
                  </>
                )}
              </Button>
            </div>
          )}

          {mode === 'upload' && (
            <div className="bg-purple-50/70 dark:bg-purple-950/30 p-5 rounded-xl border border-purple-200 dark:border-purple-900/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300 font-bold text-xs">
                  <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Upload or Paste Your Existing Lesson Plan</span>
                </div>
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-[10px]">
                  AI Adaptation Engine
                </Badge>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Have a lesson plan from past terms or external sources? Paste the text or upload your file below. JotMinds AI will analyze and tailor it to your class's specific cognitive profile and curriculum standards.
              </p>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs font-semibold">Existing Plan Content</Label>
                  <label className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1 font-semibold">
                    <input
                      type="file"
                      accept=".txt,.json,.md,.doc,.docx,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const txt = ev.target?.result as string;
                            if (txt) {
                              setExistingPlanText(txt);
                              toast.success(`Loaded "${file.name}"!`);
                            }
                          };
                          reader.readAsText(file);
                        }
                      }}
                    />
                    📂 Upload File (.txt, .md, etc.)
                  </label>
                </div>
                <textarea
                  value={existingPlanText}
                  onChange={(e) => setExistingPlanText(e.target.value)}
                  placeholder="Paste your existing lesson objectives, phases, teaching notes, or activities here..."
                  rows={6}
                  className="w-full p-3 text-xs rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 leading-relaxed font-mono focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <Button
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-md py-5 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Tailoring & Enhancing Lesson Plan with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Tailor & Generate Enhanced Plan
                  </>
                )}
              </Button>
            </div>
          )}

          {mode === 'manual' && (
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
              <Button onClick={handleManualSave} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 cursor-pointer">
                Save Manual Lesson Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
