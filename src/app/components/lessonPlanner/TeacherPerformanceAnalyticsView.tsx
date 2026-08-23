import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { TrendingUp, Award, Calendar, CheckCircle2, FileText, Star, Target, Info } from 'lucide-react';
import { TeacherPerformanceMetric } from '../../types/lessonPlannerTypes';
import { getTeacherPerformanceMetrics, getSavedLessonPlans, initialPerformanceMetric } from '../../utils/lessonPlannerStorage';

interface TeacherPerformanceAnalyticsViewProps {
  user?: any;
}

export const TeacherPerformanceAnalyticsView: React.FC<TeacherPerformanceAnalyticsViewProps> = ({ user }) => {
  const hasPlans = getSavedLessonPlans(user?.id).length > 0;
  
  const metrics: TeacherPerformanceMetric = hasPlans 
    ? getTeacherPerformanceMetrics()
    : {
        ...initialPerformanceMetric,
        monthly: {
          monthName: new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' }),
          lessonsPlanned: 0,
          lessonsDelivered: 0,
          assessmentsCreated: 0,
          averageStudentEngagement: 0
        },
        annual: {
          teachingEffectivenessScore: 0,
          curriculumCoveragePct: 0,
          studentOutcomeTrendPct: 0
        }
      };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-800/30 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 px-3 py-0.5 text-xs">
              Lesson Planner Analytics
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 px-3 py-0.5 text-xs">
              {metrics.annual.teachingEffectivenessScore} / 100 Integration Score
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" /> Lesson Planner Usage Insights
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Review how often you generate lessons, use differentiated instruction, and log post-lesson reflections.
          </p>
        </div>
      </div>

      {/* Monthly Metrics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-1 relative">
            <Popover>
              <PopoverTrigger className="absolute top-4 right-4 text-slate-400 hover:text-indigo-500">
                <Info className="w-4 h-4" />
              </PopoverTrigger>
              <PopoverContent className="w-64 text-xs">
                The total number of generated lesson plans you have created and saved this month.
              </PopoverContent>
            </Popover>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block pr-6">Lessons Generated</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">{metrics.monthly.lessonsPlanned}</span>
            <p className="text-[10px] text-slate-500">{metrics.monthly.monthName}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-1 relative">
            <Popover>
              <PopoverTrigger className="absolute top-4 right-4 text-slate-400 hover:text-indigo-500">
                <Info className="w-4 h-4" />
              </PopoverTrigger>
              <PopoverContent className="w-64 text-xs">
                Lessons successfully presented using the Lesson Prep delivery mode. Delivery rate compares this to generated lessons.
              </PopoverContent>
            </Popover>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block pr-6">Lessons Delivered</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{metrics.monthly.lessonsDelivered}</span>
            <p className="text-[10px] text-slate-500">91% Delivery Rate</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-1 relative">
            <Popover>
              <PopoverTrigger className="absolute top-4 right-4 text-slate-400 hover:text-indigo-500">
                <Info className="w-4 h-4" />
              </PopoverTrigger>
              <PopoverContent className="w-64 text-xs">
                Assessments generated across all your active lesson plans. Includes MCQs and discussions.
              </PopoverContent>
            </Popover>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block pr-6">Assessments</span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{metrics.monthly.assessmentsCreated}</span>
            <p className="text-[10px] text-slate-500">Auto-generated & Quizzes</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-1 relative">
            <Popover>
              <PopoverTrigger className="absolute top-4 right-4 text-slate-400 hover:text-indigo-500">
                <Info className="w-4 h-4" />
              </PopoverTrigger>
              <PopoverContent className="w-64 text-xs">
                Average engagement metric based on your post-lesson reflections and evaluations of student responsiveness.
              </PopoverContent>
            </Popover>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block pr-6">Avg Engagement Score</span>
            <span className="text-2xl font-black text-amber-500">{metrics.monthly.averageStudentEngagement} / 5.0</span>
            <p className="text-[10px] text-slate-500">Student classroom rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Annual Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-indigo-500" /> Curriculum Coverage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{metrics.annual.curriculumCoveragePct}%</span>
              <Badge className="bg-indigo-600 text-white text-xs">On Track</Badge>
            </div>
            <Progress value={metrics.annual.curriculumCoveragePct} className="h-2 bg-slate-100 dark:bg-slate-800" />
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Student Outcome Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">+{metrics.annual.studentOutcomeTrendPct}%</span>
              <Badge className="bg-emerald-600 text-white text-xs">Positive Growth</Badge>
            </div>
            <p className="text-xs text-slate-500">Formative & Summative assessment score improvement over baseline.</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-500" /> Teaching Effectiveness Score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400">{metrics.annual.teachingEffectivenessScore} / 100</span>
              <Badge className="bg-purple-600 text-white text-xs">Exemplary</Badge>
            </div>
            <Progress value={metrics.annual.teachingEffectivenessScore} className="h-2 bg-slate-100 dark:bg-slate-800" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
