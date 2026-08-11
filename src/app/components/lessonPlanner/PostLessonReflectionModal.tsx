import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { CheckCircle2, XCircle, Star, MessageSquare, Save, Sparkles } from 'lucide-react';
import { PostLessonReflection, LessonPlan } from '../../types/lessonPlannerTypes';
import { savePostLessonReflection } from '../../utils/lessonPlannerStorage';
import { syncLessonReflectionToSupabase } from '../../utils/lessonPlannerApi';
import { toast } from 'sonner';

interface PostLessonReflectionModalProps {
  plan: LessonPlan;
  onClose: () => void;
  onSaved: (reflection: PostLessonReflection) => void;
}

export const PostLessonReflectionModal: React.FC<PostLessonReflectionModalProps> = ({
  plan,
  onClose,
  onSaved
}) => {
  const [completedAsPlanned, setCompletedAsPlanned] = useState<boolean>(true);
  const [understandingLevel, setUnderstandingLevel] = useState<'Excellent' | 'Good' | 'Average' | 'Poor'>('Good');
  const [whatWorkedWell, setWhatWorkedWell] = useState('Visual balance scale diagram engaged visual learners quickly.');
  const [areasForImprovement, setAreasForImprovement] = useState('Pacing during guided practice ran 3 minutes over.');
  const [followUpActions, setFollowUpActions] = useState('Provide 2 additional word problem scaffolds in next session.');

  const handleSubmit = async () => {
    const reflection: PostLessonReflection = {
      reflectionId: `refl-${Date.now()}`,
      lessonId: plan.id,
      teacherId: plan.teacherId || 'teacher-1',
      completedAsPlanned,
      studentUnderstandingLevel: understandingLevel,
      whatWorkedWell,
      areasForImprovement,
      followUpActions,
      reflectedAt: new Date().toISOString()
    };

    savePostLessonReflection(reflection);
    await syncLessonReflectionToSupabase(reflection);

    toast.success('Post-Lesson Reflection saved successfully!');
    onSaved(reflection);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-xl shadow-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <CardHeader className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-t-xl">
          <div className="flex items-center justify-between">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 text-xs">
              Module 6 • Post-Lesson Reflection
            </Badge>
            <span className="text-xs text-slate-300">{new Date().toLocaleDateString()}</span>
          </div>
          <CardTitle className="text-lg font-bold text-white mt-1">
            Reflect on: {plan.topic} ({plan.gradeClass})
          </CardTitle>
          <CardDescription className="text-xs text-slate-300">
            Log completion, student understanding, and follow-up teaching notes.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          {/* Was Lesson Completed as Planned? */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Was the lesson completed as planned?
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCompletedAsPlanned(true)}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  completedAsPlanned
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 ring-2 ring-emerald-500/30'
                    : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900 dark:text-slate-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Yes, as planned
              </button>
              <button
                type="button"
                onClick={() => setCompletedAsPlanned(false)}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  !completedAsPlanned
                    ? 'bg-amber-50 border-amber-500 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 ring-2 ring-amber-500/30'
                    : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900 dark:text-slate-300'
                }`}
              >
                <XCircle className="w-4 h-4 text-amber-600" /> Modified / Adjusted
              </button>
            </div>
          </div>

          {/* Student Understanding Level */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Student Overall Understanding Level
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {(['Excellent', 'Good', 'Average', 'Poor'] as const).map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setUnderstandingLevel(lvl)}
                  className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                    understandingLevel === lvl
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900 dark:text-slate-300'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Reflection Text Fields */}
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-semibold">What worked well?</Label>
              <textarea
                value={whatWorkedWell}
                onChange={(e) => setWhatWorkedWell(e.target.value)}
                rows={2}
                className="w-full p-2.5 text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Areas for improvement / Pacing notes</Label>
              <textarea
                value={areasForImprovement}
                onChange={(e) => setAreasForImprovement(e.target.value)}
                rows={2}
                className="w-full p-2.5 text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-1"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
              <Save className="w-4 h-4 mr-2" /> Save Reflection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
