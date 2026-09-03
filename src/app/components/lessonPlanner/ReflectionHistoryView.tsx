import { formatDateTime } from '../../utils/dateFormat';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Clock, BookOpen, Star, CheckCircle2, MessageSquare, AlertCircle, FileText, Calendar } from 'lucide-react';
import { PostLessonReflection, LessonPlan } from '../../types/lessonPlannerTypes';
import { getPostLessonReflections, getSavedLessonPlans } from '../../utils/lessonPlannerStorage';

interface ReflectionHistoryViewProps {
  user?: any;
  onSelectPlan?: (plan: LessonPlan) => void;
}

export const ReflectionHistoryView: React.FC<ReflectionHistoryViewProps> = ({ user, onSelectPlan }) => {
  const [reflections, setReflections] = useState<PostLessonReflection[]>([]);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);

  useEffect(() => {
    setReflections(getPostLessonReflections(user?.id));
    setLessonPlans(getSavedLessonPlans(user?.id));
  }, [user]);

  if (lessonPlans.length === 0 && reflections.length === 0) {
    return (
      <Card className="text-center p-8 bg-slate-50 dark:bg-slate-900 border-dashed">
        <CardContent>
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No History Yet</h3>
          <p className="text-sm text-slate-500 mt-2">Generate a Lesson Plan or save a Post-Lesson Reflection to see it here.</p>
        </CardContent>
      </Card>
    );
  }

  // Combine and sort by date descending
  const combinedHistory = [
    ...lessonPlans.map(lp => ({ type: 'lesson_plan', date: new Date(lp.createdAt), data: lp })),
    ...reflections.map(r => ({ type: 'reflection', date: new Date(r.reflectedAt), data: r }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-800/30">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <HistoryIcon className="w-5 h-5 text-purple-400" /> Lesson Planner History
        </h2>
        <p className="text-sm text-slate-300 mt-2">
          Review your generated lesson plans and post-lesson reflections to track your instructional progress.
        </p>
      </div>

      <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-4 pl-6 space-y-8">
        {combinedHistory.map((item, index) => {
          if (item.type === 'lesson_plan') {
            const lp = item.data as LessonPlan;
            return (
              <div key={`lp-${lp.id}`} className="relative">
                <div className="absolute -left-[35px] bg-blue-500 p-1.5 rounded-full ring-4 ring-white dark:ring-slate-950">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <Card className="shadow-sm border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            Lesson Plan
                          </Badge>
                          <Badge variant={lp.status === 'completed' ? 'default' : 'outline'} className={lp.status === 'completed' ? 'bg-emerald-600 text-white' : ''}>
                            {lp.status === 'completed' ? '✓ Completed' : 'Draft / Active'}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                          {lp.topic} ({lp.subject})
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1.5 text-xs">
                          <Calendar className="w-3.5 h-3.5" /> {lp.date}
                          <span className="text-slate-300">•</span>
                          <span className="font-medium">{lp.gradeClass}</span>
                          <span className="text-slate-300">•</span>
                          <span>{lp.durationMinutes} mins</span>
                        </CardDescription>
                      </div>
                      {onSelectPlan && (
                        <Button size="sm" variant="outline" onClick={() => onSelectPlan(lp)} className="text-xs font-semibold">
                          <FileText className="w-3.5 h-3.5 mr-1.5" /> View & Edit Document
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 text-sm text-slate-600 dark:text-slate-400">
                    <p className="line-clamp-2">
                      <strong>Objectives:</strong> {lp.objectives?.knowledge?.[0] || 'Curriculum aligned learning goals'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          } else {
            const ref = item.data as PostLessonReflection;
            return (
              <div key={`ref-${ref.reflectionId}`} className="relative">
                <div className="absolute -left-[35px] bg-purple-500 p-1.5 rounded-full ring-4 ring-white dark:ring-slate-950">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <Card className="shadow-sm border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div>
                        <Badge className="mb-2 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                          Post-Lesson Reflection
                        </Badge>
                        <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                          Session Reflection: {ref.lessonId}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1.5 text-xs">
                          <Clock className="w-3.5 h-3.5" /> {formatDateTime(ref.reflectedAt)}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className={
                        ref.studentUnderstandingLevel === 'Excellent' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' :
                        ref.studentUnderstandingLevel === 'Good' ? 'border-indigo-200 text-indigo-700 bg-indigo-50' :
                        'border-amber-200 text-amber-700 bg-amber-50'
                      }>
                        Understanding: {ref.studentUnderstandingLevel}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-3 rounded-lg border border-emerald-100/50 dark:border-emerald-900/20">
                        <h4 className="font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 mb-1.5 text-xs uppercase tracking-wider">
                          <Star className="w-3.5 h-3.5" /> 1. Observations & What Worked
                        </h4>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">{ref.observations || ref.whatWorkedWell}</p>
                      </div>
                      <div className="bg-amber-50/50 dark:bg-amber-950/10 p-3 rounded-lg border border-amber-100/50 dark:border-amber-900/20">
                        <h4 className="font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-1.5 mb-1.5 text-xs uppercase tracking-wider">
                          <AlertCircle className="w-3.5 h-3.5" /> 2. Student Feedback & Responses
                        </h4>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">{ref.feedback || ref.areasForImprovement}</p>
                      </div>
                      <div className="bg-indigo-50/50 dark:bg-indigo-950/10 p-3 rounded-lg border border-indigo-100/50 dark:border-indigo-900/20">
                        <h4 className="font-semibold text-indigo-800 dark:text-indigo-400 flex items-center gap-1.5 mb-1.5 text-xs uppercase tracking-wider">
                          <BookOpen className="w-3.5 h-3.5" /> 3. Pedagogical Insights
                        </h4>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">{ref.insights || ref.followUpActions}</p>
                      </div>
                      <div className="bg-purple-50/50 dark:bg-purple-950/10 p-3 rounded-lg border border-purple-100/50 dark:border-purple-900/20">
                        <h4 className="font-semibold text-purple-800 dark:text-purple-400 flex items-center gap-1.5 mb-1.5 text-xs uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 4. Actionable Next Steps
                        </h4>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">{ref.recommendations || ref.schoolRecommendations || 'Ready for next unit.'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

// Helper for icon
const HistoryIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </svg>
);
