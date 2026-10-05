import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { TrendingUp, Award, Calendar, CheckCircle2, FileText, Star, Target, Info } from 'lucide-react';
import { TeacherPerformanceMetric } from '../../types/lessonPlannerTypes';
import { getTeacherPerformanceMetrics, getSavedLessonPlans } from '../../utils/lessonPlannerStorage';
import { InfoTip } from '../ui/info-tip';

interface TeacherPerformanceAnalyticsViewProps {
  user?: any;
}

export const TeacherPerformanceAnalyticsView: React.FC<TeacherPerformanceAnalyticsViewProps> = ({ user }) => {
  const hasPlans = getSavedLessonPlans(user?.id).length > 0;
  const metrics: TeacherPerformanceMetric = getTeacherPerformanceMetrics(user?.id);
  const deliveryRate = metrics.monthly.lessonsPlanned
    ? Math.round((metrics.monthly.lessonsDelivered / metrics.monthly.lessonsPlanned) * 100)
    : 0;
  const score = metrics.annual.teachingEffectivenessScore;
  const scoreLabel = score >= 80 ? 'Exemplary' : score >= 60 ? 'Strong' : score >= 35 ? 'Developing' : 'Getting Started';
  const coverage = metrics.annual.curriculumCoveragePct;

  if (!hasPlans) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-2xl bg-white shadow-sm mt-6 max-w-4xl mx-auto">
        <div className="bg-slate-100 p-4 rounded-full mb-4">
          <TrendingUp className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-700 mb-2">No Analytics Data Yet</h3>
        <p className="text-slate-500 max-w-md">
          Start generating and using lesson plans to see your teaching performance metrics, engagement trends, and curriculum coverage insights here.
        </p>
      </div>
    );
  }

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
              {score} / 100 Usage Score
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" /> Lesson Planner Usage Insights<InfoTip>Numbers calculated from your saved lesson plans and reflections. They show how you use the planner, not how well you teach.</InfoTip>
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
            <p className="text-[10px] text-slate-500">{deliveryRate}% of this month's lessons</p>
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
                Average student understanding from this month's post-lesson reflections (Excellent = 5, Good = 4, Average = 3, Poor = 2).
              </PopoverContent>
            </Popover>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block pr-6">Avg Student Understanding</span>
            <span className="text-2xl font-black text-amber-500">{metrics.monthly.averageStudentEngagement !== null ? `${metrics.monthly.averageStudentEngagement} / 5.0` : '—'}</span>
            <p className="text-[10px] text-slate-500">{metrics.monthly.reflectionsLogged} reflection{metrics.monthly.reflectionsLogged === 1 ? '' : 's'} this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Annual Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-indigo-500" /> Curriculum Coverage<InfoTip>The share of topics in your Curriculum Tracker that you have marked as covered.</InfoTip>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{metrics.annual.curriculumCoveragePct}%</span>
              <Badge className="bg-indigo-600 text-white text-xs">{coverage === 0 ? 'Not started' : coverage >= 100 ? 'Complete' : 'In progress'}</Badge>
            </div>
            <Progress value={metrics.annual.curriculumCoveragePct} className="h-2 bg-slate-100 dark:bg-slate-800" />
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Completed As Planned<InfoTip>The share of reflected lessons where you answered Yes to "completed as planned". It stays blank until you log a reflection.</InfoTip>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{metrics.annual.completedAsPlannedPct !== null ? `${metrics.annual.completedAsPlannedPct}%` : '—'}</span>
            </div>
            <p className="text-xs text-slate-500">Share of reflected lessons you delivered as planned. Log post-lesson reflections to populate this.</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-500" /> Planner Usage Score<InfoTip>Out of 100. Half is how many saved lessons you have delivered, a quarter is how many delivered lessons have a reflection, and a quarter is how many plans include differentiated activities.</InfoTip>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400">{score} / 100</span>
              <Badge className="bg-purple-600 text-white text-xs">{scoreLabel}</Badge>
            </div>
            <p className="text-xs text-slate-500">Blend of lessons delivered (50%), reflections logged (25%) and differentiated plans (25%).</p>
            <Progress value={score} className="h-2 bg-slate-100 dark:bg-slate-800" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
