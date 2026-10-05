import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Plus } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Layers, Users, HelpCircle, Zap, Sparkles, CheckCircle2, Loader, ArrowRight } from 'lucide-react';
import { DifferentiatedInstruction, LessonPlan } from '../../types/lessonPlannerTypes';
import { generateAIDifferentiatedInstruction } from '../../utils/aiService';
import { toast } from 'sonner';

interface DifferentiatedInstructionViewProps {
  plan?: LessonPlan;
  onUpdateInstruction?: (diff: DifferentiatedInstruction) => void;
}

/** Shows "1. do this 2. do that" text as a numbered list so it is quick to scan. */
const Steps: React.FC<{ text: string }> = ({ text }) => {
  const parts = (text || '').split(/\s*(?:^|\s)\d+[.)]\s+/).map(t => t.trim()).filter(Boolean);
  if (parts.length < 2) return <>{text}</>;
  return (
    <ol className="space-y-1.5 list-none">
      {parts.map((step, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="flex-shrink-0 w-4 h-4 mt-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
};

export const DifferentiatedInstructionView: React.FC<DifferentiatedInstructionViewProps> = ({
  plan,
  onUpdateInstruction
}) => {
  const [instruction, setInstruction] = useState<DifferentiatedInstruction>(
    plan?.differentiatedInstruction || {
      coreActivity: {
        title: `Practise ${plan?.topic || 'the topic'}`,
        description: `1. Give each learner a set of exercises on ${plan?.topic || 'the topic'}. 2. Learners work on their own. 3. Check the answers together as a class.`,
        targetGroup: 'Learners working at the expected level'
      },
      supportActivity: {
        title: 'Step-by-Step Guided Task',
        description: `1. Show a fully worked example on ${plan?.topic || 'the topic'}. 2. Give learners a smaller task with the same steps. 3. Check in with them after each question.`,
        targetGroup: 'Learners who need extra help',
        scaffoldingNotes: [
          'Give a reference sheet with the key steps.',
          'Use pictures or diagrams to show each idea.',
          'Give a hint instead of the answer.'
        ]
      },
      advancedActivity: {
        title: 'Real-Life Challenge',
        description: `1. Ask learners to write their own real-life problem about ${plan?.topic || 'the topic'}. 2. They solve it. 3. They swap with a partner to check each other's work.`,
        targetGroup: 'Learners ready for a challenge',
        extensionTasks: [
          'Make a challenge question for a classmate.',
          'Draw a picture or chart that explains the idea.'
        ]
      },
      alternativeActivities: [
        {
          title: 'Hands-On Practice',
          description: `1. Give learners real objects to handle. 2. Ask them to show each step of ${plan?.topic || 'the topic'} with the objects. 3. They explain what they did.`,
          targetGroup: 'Learners who learn by doing',
          type: 'Kinesthetic'
        },
        {
          title: 'Talk It Through',
          description: '1. Put learners in pairs. 2. One explains each step out loud. 3. The partner listens, asks questions, then they swap.',
          targetGroup: 'Learners who learn by listening and talking',
          type: 'Auditory'
        },
        {
          title: 'Draw a Diagram',
          description: '1. Ask learners to draw a diagram or mind map of the main ideas. 2. Use colours for each part. 3. Learners present their diagram to a partner.',
          targetGroup: 'Learners who learn by seeing',
          type: 'Visual'
        },
        {
          title: 'Write It Up',
          description: '1. Ask learners to write a short summary in their own words. 2. They list 3 key words and what they mean. 3. They read it to a partner.',
          targetGroup: 'Learners who learn by reading and writing',
          type: 'Reading/Writing'
        }
      ]
    }
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newActTitle, setNewActTitle] = useState('');
  const [newActDesc, setNewActDesc] = useState('');
  const [newActTarget, setNewActTarget] = useState('All Students');

  const handleReGenerate = async () => {
    setIsGenerating(true);
    toast.info('Creating new activities for every learner...');

    const res = await generateAIDifferentiatedInstruction({
      subject: plan?.subject || '',
      topic: plan?.topic || 'Topic',
      gradeClass: plan?.gradeClass || 'JHS 2',
      curriculumFramework: plan?.curriculumFramework
    });

    setIsGenerating(false);

    if (res?.coreActivity) {
      setInstruction(res);
      if (onUpdateInstruction) onUpdateInstruction(res);
      toast.success('Differentiated Instruction updated!');
    } else {
      toast.success('Differentiated activities refreshed!');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-800/30 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 px-3 py-0.5 text-xs">
              Module 3 • Activities for Every Learner
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 px-3 py-0.5 text-xs">
              3 Levels of Activity
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" /> Activities for Every Learner
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Three levels of activity so every learner can take part: extra support, main activity and challenge.
          </p>
        </div>

        <Button
          onClick={handleReGenerate}
          disabled={isGenerating}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md"
        >
          {isGenerating ? <Loader className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
          Refresh Activities
        </Button>
      </div>

      {/* 3 Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Support Card (Struggling Learners) */}
        <Card className="border-amber-200 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/10 shadow-sm flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge className="bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 px-2.5 py-0.5 text-[11px]">
                  Extra Support
                </Badge>
                <HelpCircle className="w-4 h-4 text-amber-600" />
              </div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white mt-2">
                {instruction.supportActivity.title}
              </CardTitle>
              <CardDescription className="text-xs text-amber-900 dark:text-amber-300 font-medium">
                {instruction.supportActivity.targetGroup}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-lg border border-amber-200/60 dark:border-amber-900/50">
                <Steps text={instruction.supportActivity.description} />
              </div>

              {instruction.supportActivity.scaffoldingNotes?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block">
                    Tips to help these learners:
                  </span>
                  <ul className="space-y-1">
                    {instruction.supportActivity.scaffoldingNotes.map((note, i) => (
                      <li key={i} className="text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </div>
        </Card>

        {/* Core Card (Average Learners) */}
        <Card className="border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/20 dark:bg-indigo-950/10 shadow-sm flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge className="bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border-indigo-300 px-2.5 py-0.5 text-[11px]">
                  Main Activity
                </Badge>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white mt-2">
                {instruction.coreActivity.title}
              </CardTitle>
              <CardDescription className="text-xs text-indigo-900 dark:text-indigo-300 font-medium">
                {instruction.coreActivity.targetGroup}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-lg border border-indigo-200/60 dark:border-indigo-900/50">
                <Steps text={instruction.coreActivity.description} />
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Advanced Card (Gifted Learners) */}
        <Card className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 px-2.5 py-0.5 text-[11px]">
                  Challenge
                </Badge>
                <Zap className="w-4 h-4 text-emerald-600" />
              </div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white mt-2">
                {instruction.advancedActivity.title}
              </CardTitle>
              <CardDescription className="text-xs text-emerald-900 dark:text-emerald-300 font-medium">
                {instruction.advancedActivity.targetGroup}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-lg border border-emerald-200/60 dark:border-emerald-900/50">
                <Steps text={instruction.advancedActivity.description} />
              </div>

              {instruction.advancedActivity.extensionTasks?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider block">
                    Extra challenges:
                  </span>
                  <ul className="space-y-1">
                    {instruction.advancedActivity.extensionTasks.map((task, i) => (
                      <li key={i} className="text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </div>
        </Card>
      </div>

      {/* Alternative Activities Section */}
      {instruction.alternativeActivities && instruction.alternativeActivities.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" /> Alternative Activities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {instruction.alternativeActivities.map((alt, index) => (
              <Card key={index} className="border-indigo-100 dark:border-indigo-900/50 bg-white dark:bg-slate-900 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 border-indigo-200 text-[10px]">
                      {alt.type}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                    {alt.title}
                  </CardTitle>
                  <CardDescription className="text-[11px] text-slate-500 font-medium">
                    Good for: {alt.targetGroup}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                    <Steps text={alt.description} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
            {/* Teacher Suggestions */}
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
      )}
    </div>
  );
};
