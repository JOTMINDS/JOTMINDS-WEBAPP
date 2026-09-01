import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { School, Users, BookOpen, AlertTriangle, CheckCircle2, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react';
import { ClassCognitiveSummary } from '../../types/lessonPlannerTypes';

interface SchoolInsightsDashboardViewProps {
  summary: ClassCognitiveSummary;
}

export const SchoolInsightsDashboardView: React.FC<SchoolInsightsDashboardViewProps> = ({ summary }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-800/30 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 px-3 py-0.5 text-xs">
              Classroom Intelligence
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <School className="w-5 h-5 text-indigo-400" /> Classroom Intelligence
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            A simplified overview of your students' learning styles, curriculum coverage, and overall classroom performance.
          </p>
        </div>
      </div>

      {/* Top Level School KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Students Assessed</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">{summary.totalStudents}</span>
            <p className="text-[10px] text-slate-500">In your current class context</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Unique Profiles</span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{Object.keys(summary.dominantStyles).length}</span>
            <p className="text-[10px] text-slate-500">Distinct learning types in class</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Class Harmony Index</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {summary.totalStudents > 0 ? 
                (Object.values(summary.dominantStyles)[0] || 0) / summary.totalStudents > 0.5 ? 'High' : 'Moderate'
               : 'N/A'}
            </span>
            <p className="text-[10px] text-slate-500">Based on style distribution</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Primary Approach</span>
            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 truncate">
              {Object.entries(summary.dominantStyles).sort((a,b) => b[1] - a[1])[0]?.[0] || 'Mixed'}
            </span>
            <p className="text-[10px] text-slate-500">Most effective strategy</p>
          </CardContent>
        </Card>
      </div>

      {/* School Learning Style & Support Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Insights Card */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" /> Student Cognitive Insights
            </CardTitle>
            <CardDescription className="text-xs">
              Aggregated learning modalities and support patterns across classes.
            </CardDescription>
          </CardHeader>
                    <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Visual Learners</span>
                <span className="text-indigo-600">{Math.round((summary.learningStyles.Visual / summary.totalStudents) * 100) || 0}%</span>
              </div>
              <Progress value={Math.round((summary.learningStyles.Visual / summary.totalStudents) * 100) || 0} className="h-2 bg-indigo-100" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Auditory Learners</span>
                <span className="text-purple-600">{Math.round((summary.learningStyles.Auditory / summary.totalStudents) * 100) || 0}%</span>
              </div>
              <Progress value={Math.round((summary.learningStyles.Auditory / summary.totalStudents) * 100) || 0} className="h-2 bg-purple-100" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Kinesthetic Learners</span>
                <span className="text-amber-600">{Math.round((summary.learningStyles.Kinesthetic / summary.totalStudents) * 100) || 0}%</span>
              </div>
              <Progress value={Math.round((summary.learningStyles.Kinesthetic / summary.totalStudents) * 100) || 0} className="h-2 bg-amber-100" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Read/Write Learners</span>
                <span className="text-emerald-600">{Math.round((summary.learningStyles.ReadWrite / summary.totalStudents) * 100) || 0}%</span>
              </div>
              <Progress value={Math.round((summary.learningStyles.ReadWrite / summary.totalStudents) * 100) || 0} className="h-2 bg-emerald-100" />
            </div>
          </CardContent>
        </Card>

        {/* Teacher Insights Card */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" /> Teacher & Curriculum Insights
            </CardTitle>
            <CardDescription className="text-xs">
              Curriculum coverage and teaching effectiveness scores.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>National Curriculum Coverage</span>
                <span className="text-emerald-600">82%</span>
              </div>
              <Progress value={82} className="h-2 bg-emerald-100" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Differentiated Instruction Adoption</span>
                <span className="text-indigo-600">88%</span>
              </div>
              <Progress value={88} className="h-2 bg-indigo-100" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1 mt-2">
              <span className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                Actionable Recommendation:
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Provide visual manipulative toolkits to your classes to support the flagged abstract-reasoning students.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
