import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { CheckCircle2, XCircle, Star, MessageSquare, Save, Sparkles } from 'lucide-react';
import { PostLessonReflection, LessonPlan } from '../../types/lessonPlannerTypes';
import { savePostLessonReflection, saveLessonPlan } from '../../utils/lessonPlannerStorage';
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
  const [observations, setObservations] = useState('');
  const [feedback, setFeedback] = useState('');
  const [insights, setInsights] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [whatWorkedWell, setWhatWorkedWell] = useState('Visual diagrams and interactive examples engaged visual and auditory learners quickly.');
  const [areasForImprovement, setAreasForImprovement] = useState('Pacing during guided practice required additional scaffolding for abstract concepts.');
  const [followUpActions, setFollowUpActions] = useState('Provide differentiated exit slip review in subsequent session.');
  const [schoolRecommendations, setSchoolRecommendations] = useState('');

  const handleSubmit = async () => {
    if (!observations.trim() && !whatWorkedWell.trim()) {
      toast.error('Please enter your lesson observations.');
      return;
    }
    if (!feedback.trim() && !areasForImprovement.trim()) {
      toast.error('Please enter student feedback or engagement response.');
      return;
    }
    if (!insights.trim() && !followUpActions.trim()) {
      toast.error('Please enter pedagogical insights.');
      return;
    }
    if (!recommendations.trim() && !schoolRecommendations.trim()) {
      toast.error('Please enter actionable next steps or recommendations.');
      return;
    }

    const reflection: PostLessonReflection = {
      reflectionId: `refl-${Date.now()}`,
      lessonId: plan.id,
      teacherId: plan.teacherId || 'teacher-1',
      completedAsPlanned,
      studentUnderstandingLevel: understandingLevel,
      observations: observations.trim() || whatWorkedWell.trim(),
      feedback: feedback.trim() || areasForImprovement.trim(),
      insights: insights.trim() || followUpActions.trim(),
      recommendations: recommendations.trim() || schoolRecommendations.trim(),
      whatWorkedWell: whatWorkedWell.trim() || observations.trim(),
      areasForImprovement: areasForImprovement.trim() || feedback.trim(),
      followUpActions: followUpActions.trim() || insights.trim(),
      schoolRecommendations: schoolRecommendations.trim() || recommendations.trim(),
      reflectedAt: new Date().toISOString()
    };

    savePostLessonReflection(reflection);
    await syncLessonReflectionToSupabase(reflection);

    // Auto-mark lesson as completed
    const updatedPlan: LessonPlan = {
      ...plan,
      status: 'completed',
      updatedAt: new Date().toISOString()
    };
    saveLessonPlan(updatedPlan);

    toast.success('Post-Lesson Reflection recorded & Lesson marked as Completed!');
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

          {/* 4 Compulsory Structured Reflection Sections */}
          <div className="space-y-3.5">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <Label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>1. Classroom Observations</span>
                <span className="text-[10px] text-indigo-600 font-normal">Compulsory</span>
              </Label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="What did you observe regarding learner dynamics, visual attention, and participation?"
                rows={2}
                className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mt-1.5"
              />
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <Label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>2. Student Feedback & Responses</span>
                <span className="text-[10px] text-indigo-600 font-normal">Compulsory</span>
              </Label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="How did students receive activities, task cards, and questions? Note verbal feedback or confusion."
                rows={2}
                className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mt-1.5"
              />
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <Label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>3. Pedagogical Insights & Pacing</span>
                <span className="text-[10px] text-indigo-600 font-normal">Compulsory</span>
              </Label>
              <textarea
                value={insights}
                onChange={(e) => setInsights(e.target.value)}
                placeholder="What did you learn about lesson timing, differentiation effectiveness, and teaching notes?"
                rows={2}
                className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mt-1.5"
              />
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <Label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>4. Next Steps & Recommendations</span>
                <span className="text-[10px] text-indigo-600 font-normal">Compulsory</span>
              </Label>
              <textarea
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                placeholder="Actionable follow-up steps for the next lesson or resource requests for school administration."
                rows={2}
                className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mt-1.5"
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
