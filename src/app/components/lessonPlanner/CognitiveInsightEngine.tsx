import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Brain, Eye, Ear, BookOpen, Activity, AlertTriangle, Lightbulb, Users, CheckCircle2, ShieldCheck } from 'lucide-react';
import { ClassCognitiveSummary } from '../../types/lessonPlannerTypes';

interface CognitiveInsightEngineProps {
  summary: ClassCognitiveSummary;
}

export const CognitiveInsightEngine: React.FC<CognitiveInsightEngineProps> = ({ summary }) => {
  const { learningStylesBreakdown, riskAlerts, topCognitiveStrengths, recommendedTeachingStyle } = summary;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Module Title Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-800/30 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 px-3 py-0.5 text-xs">
              Module 2 • Cognitive Insight Engine
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 px-3 py-0.5 text-xs">
              {summary.totalStudents} Students Analyzed
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" /> Class Cognitive & Learning Style Profile
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Aggregated cognitive profiles, learning modalities, risk alerts, and teaching recommendations for{' '}
            <strong className="text-white">{summary.className}</strong>.
          </p>
        </div>
      </div>

      {/* Learning Styles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 shadow-sm">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-600" /> Visual
              </span>
              <span className="text-lg font-black text-blue-900 dark:text-blue-200">{learningStylesBreakdown.visualPct}%</span>
            </div>
            <Progress value={learningStylesBreakdown.visualPct} className="h-2 bg-blue-100 dark:bg-blue-900" />
            <p className="text-[11px] text-slate-600 dark:text-slate-400">Diagrams, flowcharts, balance scales, and spatial models.</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20 shadow-sm">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Ear className="w-4 h-4 text-purple-600" /> Auditory
              </span>
              <span className="text-lg font-black text-purple-900 dark:text-purple-200">{learningStylesBreakdown.auditoryPct}%</span>
            </div>
            <Progress value={learningStylesBreakdown.auditoryPct} className="h-2 bg-purple-100 dark:bg-purple-900" />
            <p className="text-[11px] text-slate-600 dark:text-slate-400">Discussion, verbal recaps, podcasts, and podcasts.</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" /> Read/Write
              </span>
              <span className="text-lg font-black text-emerald-900 dark:text-emerald-200">{learningStylesBreakdown.readWritePct}%</span>
            </div>
            <Progress value={learningStylesBreakdown.readWritePct} className="h-2 bg-emerald-100 dark:bg-emerald-900" />
            <p className="text-[11px] text-slate-600 dark:text-slate-400">Handouts, structured notes, summaries, and text.</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 shadow-sm">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-600" /> Kinesthetic
              </span>
              <span className="text-lg font-black text-amber-900 dark:text-amber-200">{learningStylesBreakdown.kinestheticPct}%</span>
            </div>
            <Progress value={learningStylesBreakdown.kinestheticPct} className="h-2 bg-amber-100 dark:bg-amber-900" />
            <p className="text-[11px] text-slate-600 dark:text-slate-400">Physical algebra tiles, group tasks, and practical work.</p>
          </CardContent>
        </Card>
      </div>

      {/* Cognitive Risk Alerts */}
      <Card className="border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/10 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-amber-950 dark:text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" /> Cognitive Risk Alerts & Teacher-Guided Remediation
            </CardTitle>
            <Badge className="bg-amber-600 text-white text-xs">
              {riskAlerts.length} Actionable Risk Patterns
            </Badge>
          </div>
          <CardDescription className="text-xs text-amber-800 dark:text-amber-400">
            AI detects specific student learning gaps and tunes the lesson plan so the teacher can provide targeted 1-on-1 and small-group support.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Teacher-Guided Remediation Banner */}
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-4 rounded-xl shadow-xs space-y-1 border border-purple-700/40">
            <span className="text-xs font-bold text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-purple-300" /> Teacher-Mediated Student Tuning Philosophy
            </span>
            <p className="text-xs text-slate-200 leading-relaxed">
              The AI does not replace the teacher; it equips the teacher with exact student cognitive profiles so they can tune lesson pacing, scaffold abstract concepts, and help kids who need extra support.
            </p>
          </div>

          {riskAlerts.map((alert, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/60 shadow-xs space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  {alert.message}
                </span>
                <Badge variant="outline" className="text-[11px] border-amber-300 text-amber-700 dark:text-amber-300">
                  {alert.affectedStudentCount} Students Flagged
                </Badge>
              </div>

              <div className="bg-amber-50/60 dark:bg-amber-950/30 p-3 rounded-lg space-y-1">
                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block">
                  Targeted Teacher Support Strategies:
                </span>
                <ul className="space-y-1">
                  {alert.suggestedInterventions.map((item, i) => (
                    <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Individual Student AI Remediation Roster */}
      {summary.flaggedStudents && summary.flaggedStudents.length > 0 && (
        <Card className="border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/20 dark:bg-indigo-950/10 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Individual Student AI Remediation Roster
              </CardTitle>
              <Badge className="bg-indigo-600 text-white text-xs">
                {summary.flaggedStudents.length} Students Requiring Targeted Support
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
              The AI points to specific named students needing help, detailing their cognitive style, specific learning bottleneck, and exact action for the teacher.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.flaggedStudents.map(student => (
              <div
                key={student.studentId}
                className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/60 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {student.studentName}
                    </h4>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-indigo-300 text-indigo-700 dark:text-indigo-300">
                    {student.learningStyle} Learner
                  </Badge>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <p>
                    <strong className="text-slate-800 dark:text-slate-200">Cognitive Risk Flag:</strong>{' '}
                    {student.flaggedRiskReason}
                  </p>
                </div>

                <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/50 text-xs">
                  <span className="font-bold text-indigo-900 dark:text-indigo-300 block mb-0.5">
                    🎯 Recommended Action for Teacher:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">{student.recommendedTeacherAction}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommended Teaching Style & Top Strengths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" /> Recommended Teaching Style
            </CardTitle>
            <CardDescription className="text-xs">
              Tailored instructional approach for {summary.className}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-300">
              {recommendedTeachingStyle.title}
            </h4>
            <ul className="space-y-2">
              {recommendedTeachingStyle.strategies.map((strat, i) => (
                <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-indigo-600 shrink-0">{i + 1}.</span>
                  <span>{strat}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Top Class Cognitive Strengths
            </CardTitle>
            <CardDescription className="text-xs">
              Core intellectual capabilities to leverage in lesson activities.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCognitiveStrengths.map((str, i) => (
              <div key={i} className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/50 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-emerald-950 dark:text-emerald-200">{str}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
