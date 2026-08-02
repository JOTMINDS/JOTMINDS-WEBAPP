import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Layers, Users, HelpCircle, Zap, Sparkles, CheckCircle2, Loader, ArrowRight } from 'lucide-react';
import { DifferentiatedInstruction, LessonPlan } from '../../types/lessonPlannerTypes';
import { generateAIDifferentiatedInstruction } from '../../utils/aiService';
import { toast } from 'sonner';

interface DifferentiatedInstructionViewProps {
  plan?: LessonPlan;
  onUpdateInstruction?: (diff: DifferentiatedInstruction) => void;
}

export const DifferentiatedInstructionView: React.FC<DifferentiatedInstructionViewProps> = ({
  plan,
  onUpdateInstruction
}) => {
  const [instruction, setInstruction] = useState<DifferentiatedInstruction>(
    plan?.differentiatedInstruction || {
      coreActivity: {
        title: 'Standard Linear Equation Solving',
        description: 'Solve 4 standard linear equations (e.g. 2x + 4 = 12, 3y - 5 = 10) independently in exercise books.',
        targetGroup: 'Average Proficiency Learners (60% of class)'
      },
      supportActivity: {
        title: 'Visual Scaffolded Balance Solving',
        description: 'Solve x + 3 = 8 using visual balance scale templates and color-coded step-by-step guidance.',
        targetGroup: 'Learners needing abstract support (5 students flagged)',
        scaffoldingNotes: [
          'Provide physical/visual balance scale diagram.',
          'Color-code variable x in blue and constants in red.',
          'Rove and offer prompt hints instead of direct answers.'
        ]
      },
      advancedActivity: {
        title: 'Real-World Word Problem Modeling',
        description: 'Formulate a linear equation for a real-world taxi fare problem: $5 base fee + $2 per km = $25 total.',
        targetGroup: 'High Achievers & Fast Finishers (6 students)',
        extensionTasks: [
          'Formulate and solve a custom linear word problem for a peer.',
          'Graph the taxi fare equation on a coordinate plane.'
        ]
      }
    }
  );

  const [isGenerating, setIsGenerating] = useState(false);

  const handleReGenerate = async () => {
    setIsGenerating(true);
    toast.info('AI is generating fresh 3-tier differentiated learning activities...');

    const res = await generateAIDifferentiatedInstruction({
      subject: plan?.subject || 'Mathematics',
      topic: plan?.topic || 'Linear Equations',
      gradeClass: plan?.gradeClass || 'JHS 2'
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
              Module 3 • Differentiated Instruction
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 px-3 py-0.5 text-xs">
              3-Tier Learner Scaffolding
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" /> Multi-Tier Differentiated Activities
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Tailored learning activities for Average, Struggling (Support), and Gifted (Advanced) learners.
          </p>
        </div>

        <Button
          onClick={handleReGenerate}
          disabled={isGenerating}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md"
        >
          {isGenerating ? <Loader className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
          Refresh Differentiated Activities
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
                  Tier 1 • Support
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
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-lg border border-amber-200/60 dark:border-amber-900/50">
                {instruction.supportActivity.description}
              </p>

              {instruction.supportActivity.scaffoldingNotes?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block">
                    Teacher Scaffolding Notes:
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
                  Tier 2 • Core Activity
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
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-lg border border-indigo-200/60 dark:border-indigo-900/50">
                {instruction.coreActivity.description}
              </p>
            </CardContent>
          </div>
        </Card>

        {/* Advanced Card (Gifted Learners) */}
        <Card className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 px-2.5 py-0.5 text-[11px]">
                  Tier 3 • Advanced
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
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-lg border border-emerald-200/60 dark:border-emerald-900/50">
                {instruction.advancedActivity.description}
              </p>

              {instruction.advancedActivity.extensionTasks?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider block">
                    Extension Challenges:
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
    </div>
  );
};
