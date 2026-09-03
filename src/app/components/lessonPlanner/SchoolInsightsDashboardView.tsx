import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { School, Users, BookOpen, AlertTriangle, CheckCircle2, ShieldCheck, TrendingUp, Sparkles, FileText, MessageSquare, Clock, Filter } from 'lucide-react';
import { ClassCognitiveSummary, LessonPlan, PostLessonReflection } from '../../types/lessonPlannerTypes';
import { getSavedLessonPlans, getPostLessonReflections } from '../../utils/lessonPlannerStorage';

interface SchoolInsightsDashboardViewProps {
  summary: ClassCognitiveSummary;
}

export const SchoolInsightsDashboardView: React.FC<SchoolInsightsDashboardViewProps> = ({ summary }) => {
  const [activeSubTab, setActiveSubTab] = useState<'intelligence' | 'plans' | 'reflections'>('intelligence');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'draft'>('all');

  const savedPlans = getSavedLessonPlans();
  const savedReflections = getPostLessonReflections();

  const totalStudents = summary.totalStudents || 0;
  const visualPct = summary.learningStylesBreakdown?.visualPct ?? 35;
  const auditoryPct = summary.learningStylesBreakdown?.auditoryPct ?? 25;
  const kinestheticPct = summary.learningStylesBreakdown?.kinestheticPct ?? 25;
  const readWritePct = summary.learningStylesBreakdown?.readWritePct ?? 15;

  const filteredPlans = savedPlans.filter(p => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'completed') return p.status === 'completed' || p.status === 'delivered';
    if (statusFilter === 'pending') return p.status === 'pending' || p.status === 'generated';
    if (statusFilter === 'draft') return p.status === 'draft';
    return true;
  });

  const completedPlansCount = savedPlans.filter(p => p.status === 'completed' || p.status === 'delivered').length;
  const pendingPlansCount = savedPlans.filter(p => p.status === 'pending' || p.status === 'generated' || !p.status).length;
  const draftPlansCount = savedPlans.filter(p => p.status === 'draft').length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-800/30 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 px-3 py-0.5 text-xs">
              Module 8 • School & Classroom Intelligence
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 px-3 py-0.5 text-xs font-semibold">
              {completedPlansCount} Plans Completed
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <School className="w-5 h-5 text-indigo-400" /> School Insights & Lesson Oversight
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Track student cognitive distributions, monitor teacher lesson plans (completed/pending), and review post-lesson reflections.
          </p>
        </div>

        {/* Sub-tab navigation buttons */}
        <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl border border-white/20">
          <button
            onClick={() => setActiveSubTab('intelligence')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'intelligence' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Classroom Intelligence
          </button>
          <button
            onClick={() => setActiveSubTab('plans')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'plans' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Saved Plans ({savedPlans.length})
          </button>
          <button
            onClick={() => setActiveSubTab('reflections')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'reflections' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Reflections ({savedReflections.length})
          </button>
        </div>
      </div>

      {/* ─── TAB 1: CLASSROOM INTELLIGENCE ─── */}
      {activeSubTab === 'intelligence' && (
        <div className="space-y-6">
          {/* Top Level School KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardContent className="p-5 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Students Assessed</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">{totalStudents}</span>
                <p className="text-[10px] text-slate-500">Active class roster</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardContent className="p-5 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Dominant Modality</span>
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {visualPct >= Math.max(auditoryPct, kinestheticPct, readWritePct) ? 'Visual' :
                   kinestheticPct >= Math.max(visualPct, auditoryPct, readWritePct) ? 'Kinesthetic' :
                   auditoryPct >= Math.max(visualPct, kinestheticPct, readWritePct) ? 'Auditory' : 'Read/Write'}
                </span>
                <p className="text-[10px] text-slate-500">Highest percentage</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardContent className="p-5 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Lesson Plans Completed</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedPlansCount}</span>
                <p className="text-[10px] text-slate-500">{pendingPlansCount} pending delivery</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardContent className="p-5 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Curriculum Adoption</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">88%</span>
                <p className="text-[10px] text-slate-500">Differentiated coverage</p>
              </CardContent>
            </Card>
          </div>

          {/* School Learning Style & Support Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Insights Card */}
            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" /> Student Cognitive Distribution
                </CardTitle>
                <CardDescription className="text-xs">
                  Aggregated learning modalities across your students.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Visual Learners</span>
                    <span className="text-indigo-600">{visualPct}%</span>
                  </div>
                  <Progress value={visualPct} className="h-2 bg-indigo-100" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Auditory Learners</span>
                    <span className="text-purple-600">{auditoryPct}%</span>
                  </div>
                  <Progress value={auditoryPct} className="h-2 bg-purple-100" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Kinesthetic Learners</span>
                    <span className="text-amber-600">{kinestheticPct}%</span>
                  </div>
                  <Progress value={kinestheticPct} className="h-2 bg-amber-100" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Read/Write Learners</span>
                    <span className="text-emerald-600">{readWritePct}%</span>
                  </div>
                  <Progress value={readWritePct} className="h-2 bg-emerald-100" />
                </div>
              </CardContent>
            </Card>

            {/* Teacher Insights Card */}
            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-500" /> Teaching & Curriculum Benchmarks
                </CardTitle>
                <CardDescription className="text-xs">
                  Curriculum coverage and instructional effectiveness.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>National & International Curriculum Alignment</span>
                    <span className="text-emerald-600">84%</span>
                  </div>
                  <Progress value={84} className="h-2 bg-emerald-100" />
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
                    Actionable Teacher Recommendation:
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Integrate visual balance scale diagrams and interactive peer pair activities for {visualPct}% visual learners.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ─── TAB 2: SAVED LESSON PLANS MONITOR ─── */}
      {activeSubTab === 'plans' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 bg-white dark:bg-slate-900 p-3 rounded-xl border">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800 dark:text-white">Filter by Status:</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                All ({savedPlans.length})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusFilter === 'completed' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                Completed ({completedPlansCount})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusFilter === 'pending' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                Pending ({pendingPlansCount})
              </button>
              <button
                onClick={() => setStatusFilter('draft')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusFilter === 'draft' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                Drafts ({draftPlansCount})
              </button>
            </div>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" /> School Lesson Plan Oversight ({filteredPlans.length})
              </CardTitle>
              <CardDescription className="text-xs">
                Review all lesson plans generated and saved by educators in this school.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {filteredPlans.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No lesson plans found for the selected status.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPlans.map(plan => (
                    <div key={plan.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{plan.topic}</h4>
                          <Badge variant="outline" className="text-[10px]">{plan.subject} • {plan.gradeClass}</Badge>
                          {plan.curriculumFramework && (
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-2 py-0.5 rounded font-medium">
                              {plan.curriculumFramework}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          Scheduled: {plan.date} {plan.endDate ? `to ${plan.endDate}` : ''} • Duration: {plan.durationMinutes} mins
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            plan.status === 'completed' || plan.status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : plan.status === 'draft'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }
                        >
                          {plan.status === 'completed' || plan.status === 'delivered' ? 'Completed' : plan.status === 'draft' ? 'Draft' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── TAB 3: REFLECTIONS & RECOMMENDATIONS ─── */}
      {activeSubTab === 'reflections' && (
        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-600" /> Compulsory Teacher Reflections & School Recommendations ({savedReflections.length})
              </CardTitle>
              <CardDescription className="text-xs">
                Insights submitted by teachers post-lesson, detailing what worked, student understanding levels, and school-wide recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {savedReflections.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No post-lesson reflections submitted yet. Reflections appear here automatically once teachers complete lessons.
                </div>
              ) : (
                savedReflections.map(r => (
                  <div key={r.reflectionId} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          Understanding: {r.studentUnderstandingLevel}
                        </Badge>
                        <Badge variant="outline" className={r.completedAsPlanned ? 'border-emerald-300 text-emerald-700' : 'border-amber-300 text-amber-700'}>
                          {r.completedAsPlanned ? 'Completed as planned' : 'Modified / Adjusted'}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-400">{new Date(r.reflectedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">What Worked Well:</span>
                        <p className="text-slate-700 dark:text-slate-300">{r.whatWorkedWell}</p>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border">
                        <span className="font-bold text-amber-700 dark:text-amber-400 block mb-1">Areas for Improvement / Scaffolding:</span>
                        <p className="text-slate-700 dark:text-slate-300">{r.areasForImprovement}</p>
                      </div>
                    </div>

                    {r.schoolRecommendations && (
                      <div className="bg-indigo-50 dark:bg-indigo-950/40 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800 text-xs">
                        <span className="font-bold text-indigo-900 dark:text-indigo-300 block mb-1">Teacher Recommendation for School Administration:</span>
                        <p className="text-indigo-800 dark:text-indigo-200">{r.schoolRecommendations}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
