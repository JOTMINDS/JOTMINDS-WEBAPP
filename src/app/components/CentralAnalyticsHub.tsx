import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  BarChart3, PieChart, Target, Sparkles, Brain, Layers, 
  Users, CheckCircle2, TrendingUp, Lightbulb, FileText, LayoutGrid, Table
} from 'lucide-react';
import { StudentCognitiveProfile } from '../utils/teacherIntelligence';
import { 
  BarChart, Bar, PieChart as RecharPieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface CentralAnalyticsHubProps {
  students: StudentCognitiveProfile[];
  assessments: any[];
  user: any;
}

export function CentralAnalyticsHub({ students, assessments, user }: CentralAnalyticsHubProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'charts' | 'table' | 'alignment'>('charts');
  const [selectedStyleDimension, setSelectedStyleDimension] = useState<'learning' | 'thinking' | 'decision'>('learning');

  // Compute Style Distributions across students
  const computeDistributions = () => {
    const learningCounts: Record<string, number> = { Visual: 0, Kinesthetic: 0, Reflective: 0, Assimilating: 0 };
    const thinkingCounts: Record<string, number> = { Analytical: 0, Creative: 0, Practical: 0, Reflective: 0 };
    const decisionCounts: Record<string, number> = { Intuitive: 0, Deliberate: 0, Balanced: 0 };

    students.forEach(s => {
      // Find latest assessment for student
      const userAssessments = assessments.filter(a => a.userId === s.id);
      const kolb = userAssessments.find(a => a.type === 'kolb' || a.type === 'learning');
      const think = userAssessments.find(a => ['sternberg', 'adult-thinking', 'shs-thinking', 'jhs-thinking', 'thinking'].includes(a.type));
      const dual = userAssessments.find(a => a.type === 'dual-process' || a.type === 'decision');

      const kStyle = (kolb?.score as any)?.kolb?.style || (kolb?.score as any)?.learning?.style || s.learningStyle || 'Assimilating';
      const tStyle = (think?.score as any)?.sternberg?.style || (think?.score as any)?.thinking?.style || s.thinkingStyle || 'Analytical';
      const dStyle = (dual?.score as any)?.dualProcess?.style || (dual?.score as any)?.decision?.style || s.decisionStyle || 'Balanced';

      if (kStyle) learningCounts[kStyle] = (learningCounts[kStyle] || 0) + 1;
      if (tStyle) thinkingCounts[tStyle] = (thinkingCounts[tStyle] || 0) + 1;
      if (dStyle) decisionCounts[dStyle] = (decisionCounts[dStyle] || 0) + 1;
    });

    return { learningCounts, thinkingCounts, decisionCounts };
  };

  const { learningCounts, thinkingCounts, decisionCounts } = computeDistributions();

  // Chart formatters
  const chartColors = ['#5B7DB1', '#6B4C9A', '#1E8A6E', '#E0A020', '#EC4899'];

  const learningChartData = Object.entries(learningCounts).map(([name, value]) => ({ name, count: value }));
  const thinkingChartData = Object.entries(thinkingCounts).map(([name, value]) => ({ name, count: value }));
  const decisionChartData = Object.entries(decisionCounts).map(([name, value]) => ({ name, count: value }));

  const activeChartData = 
    selectedStyleDimension === 'learning' ? learningChartData :
    selectedStyleDimension === 'thinking' ? thinkingChartData : decisionChartData;

  const assessedCount = students.filter(s => s.hasCompletedAssessment).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider">
            <Brain className="w-3.5 h-3.5 text-purple-300" /> Central Analytics & Insights Hub
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Classroom & School Intelligence Center
          </h2>
          <p className="text-white/80 text-xs md:text-sm leading-relaxed">
            Unified analytics engine tracking learning style distributions, thinking patterns, decision-making dynamics, and teacher-student pedagogical alignment.
          </p>
        </div>
      </div>

      {/* View Mode Toggle Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-950 p-3 rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('charts')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              viewMode === 'charts'
                ? 'bg-[#6B4C9A] text-white shadow-2xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Interactive Charts
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              viewMode === 'cards'
                ? 'bg-[#6B4C9A] text-white shadow-2xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> Summary Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              viewMode === 'table'
                ? 'bg-[#6B4C9A] text-white shadow-2xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
            }`}
          >
            <Table className="w-4 h-4" /> Data Table
          </button>
          <button
            onClick={() => setViewMode('alignment')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              viewMode === 'alignment'
                ? 'bg-[#6B4C9A] text-white shadow-2xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
            }`}
          >
            <Target className="w-4 h-4" /> Alignment & Advice
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Learners: <strong>{students.length}</strong></span> | <span>Assessed: <strong>{assessedCount}</strong></span>
        </div>
      </div>

      {/* VIEW MODE 1: INTERACTIVE CHARTS */}
      {viewMode === 'charts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Cognitive Profile Style Distribution
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Dimension:</span>
              <Select value={selectedStyleDimension} onValueChange={(val: any) => setSelectedStyleDimension(val)}>
                <SelectTrigger className="w-[160px] text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="learning">Learning Styles (Kolb)</SelectItem>
                  <SelectItem value="thinking">Thinking Styles (Sternberg)</SelectItem>
                  <SelectItem value="decision">Decision Styles (Dual)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Frequency Breakdown</CardTitle>
                <CardDescription className="text-xs">Count of students per cognitive archetype</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6B4C9A" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Percentage Share</CardTitle>
                <CardDescription className="text-xs">Proportional distribution across class</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RecharPieChart>
                    <Pie
                      data={activeChartData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {activeChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RecharPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: SUMMARY CARDS */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-t-4 border-t-purple-600 border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                📚 Learning Styles (Kolb)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(learningCounts).map(([style, count]) => (
                <div key={style} className="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <span className="font-semibold">{style}</span>
                  <Badge variant="secondary" className="text-purple-700 bg-purple-50">
                    {count} student{count === 1 ? '' : 's'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-indigo-600 border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                🧠 Thinking Styles (Sternberg)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(thinkingCounts).map(([style, count]) => (
                <div key={style} className="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <span className="font-semibold">{style}</span>
                  <Badge variant="secondary" className="text-indigo-700 bg-indigo-50">
                    {count} student{count === 1 ? '' : 's'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-emerald-600 border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                ⚡ Decision Styles (Dual-Process)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(decisionCounts).map(([style, count]) => (
                <div key={style} className="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <span className="font-semibold">{style}</span>
                  <Badge variant="secondary" className="text-emerald-700 bg-emerald-50">
                    {count} student{count === 1 ? '' : 's'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* VIEW MODE 3: DATA TABLE */}
      {viewMode === 'table' && (
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-base font-bold">Class Roster Analytics Table</CardTitle>
            <CardDescription className="text-xs">Tabular breakdown of student cognitive styles and assessment statuses</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Learning Style</th>
                    <th className="px-4 py-3">Thinking Style</th>
                    <th className="px-4 py-3">Decision Style</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{s.name}</td>
                      <td className="px-4 py-3 text-gray-500">{s.className || 'General'}</td>
                      <td className="px-4 py-3"><Badge variant="outline" className="text-purple-700 border-purple-200">{s.learningStyle || 'Assimilating'}</Badge></td>
                      <td className="px-4 py-3"><Badge variant="outline" className="text-indigo-700 border-indigo-200">{s.thinkingStyle || 'Analytical'}</Badge></td>
                      <td className="px-4 py-3"><Badge variant="outline" className="text-emerald-700 border-emerald-200">{s.decisionStyle || 'Balanced'}</Badge></td>
                      <td className="px-4 py-3">
                        {s.hasCompletedAssessment ? (
                          <span className="text-emerald-600 font-medium">Assessed</span>
                        ) : (
                          <span className="text-amber-600 font-medium">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* VIEW MODE 4: ALIGNMENT & ADVICE */}
      {viewMode === 'alignment' && (
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" /> Pedagogical Alignment & Teaching Strategies
            </CardTitle>
            <CardDescription className="text-xs">Instructional recommendations adapted to your classroom's dominant cognitive styles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-950/40 p-4 rounded-xl border border-purple-200 dark:border-purple-800/60 space-y-2">
              <h4 className="text-xs font-bold text-[#6B4C9A] flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Recommended Instructional Adaptation
              </h4>
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                Your classroom shows a strong distribution of <strong>Visual and Assimilating</strong> learning styles alongside <strong>Analytical</strong> thinking preferences. Structure your core lessons with visual concept frameworks, followed by timed pair-problem-solving.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
                <h5 className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> High Harmony Teaching Touchpoints
                </h5>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Use structured rubrics and step-by-step model answers. Analytical students perform best when criteria are clear before independent work begins.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
                <h5 className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" /> Growth Opportunity
                </h5>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Incorporate 5 minutes of open-ended creative brainstorming at the start of new units to challenge analytical learners to explore non-linear hypotheses.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
