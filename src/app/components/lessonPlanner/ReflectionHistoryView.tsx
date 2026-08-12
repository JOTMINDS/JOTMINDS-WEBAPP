import { formatDateTime } from '../../utils/dateFormat';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Clock, BookOpen, Star, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { PostLessonReflection } from '../../types/lessonPlannerTypes';
import { getPostLessonReflections } from '../../utils/lessonPlannerStorage';

export const ReflectionHistoryView: React.FC = () => {
  const [reflections, setReflections] = useState<PostLessonReflection[]>([]);

  useEffect(() => {
    setReflections(getPostLessonReflections());
  }, []);

  if (reflections.length === 0) {
    return (
      <Card className="text-center p-8 bg-slate-50 dark:bg-slate-900 border-dashed">
        <CardContent>
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No Reflections Yet</h3>
          <p className="text-sm text-slate-500 mt-2">Complete a Lesson Prep delivery and save a post-lesson reflection to see it here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-800/30">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-400" /> Reflection History
        </h2>
        <p className="text-sm text-slate-300 mt-2">
          Review your previous post-lesson reflections to track your instructional growth and classroom insights.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {reflections.map((ref) => (
          <Card key={ref.id} className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b pb-4">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                    {ref.lessonTopic}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Clock className="w-3.5 h-3.5" /> {formatDateTime(ref.createdAt)}
                  </CardDescription>
                </div>
                <Badge className={
                  ref.understandingLevel === 'Excellent' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  ref.understandingLevel === 'Good' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' :
                  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                }>
                  Understanding: {ref.understandingLevel}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                  <h4 className="font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4" /> What Worked Well
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{ref.whatWorkedWell}</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4" /> Areas for Improvement
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{ref.areasForImprovement}</p>
                </div>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                <h4 className="font-semibold text-indigo-800 dark:text-indigo-400 flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4" /> Follow-Up Actions
                </h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{ref.followUpActions}</p>
              </div>
              
              {ref.aiFeedback && (
                <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700">
                  <h4 className="font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4" /> Metacognitive Feedback
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 italic">{ref.aiFeedback}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
