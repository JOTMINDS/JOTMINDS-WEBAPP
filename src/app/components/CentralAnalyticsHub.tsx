import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  BarChart3, PieChart as PieChartIcon, Target, Sparkles, Brain, Layers, 
  Users, CheckCircle2, TrendingUp, Lightbulb, FileText, LayoutGrid, Table, Activity, ChevronDown, ChevronUp, BookOpen
} from 'lucide-react';
import { StudentCognitiveProfile } from '../utils/teacherIntelligence';
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { extractDimensionScores } from '../utils/cognitiveXP';
import { User } from '../types';
import { TeacherAnalyticsComparison } from './teacher/TeacherAnalyticsComparison';

interface CentralAnalyticsHubProps {
  students: any[];
  assessments: any[];
  user: any;
}

type SubTab = 'learning_style' | 'decision_style' | 'thinking_style' | 'learning_dimensions' | 'alignment' | 'class_insights';
type ViewMode = 'cards' | 'charts' | 'table';
type DimensionVizMode = 'radar' | 'bars' | 'cards';

const RISK_COLORS = { high: '#DC2626', medium: '#E0A020', low: '#1E8A6E', none: '#9ca3af' };
const RISK_LABELS = { high: 'At Risk', medium: 'Needs Support', low: 'On Track', none: 'Not Assessed' };

const DIMENSION_LABELS: Record<string, string> = {
  'Concrete Experience': 'Concrete Exp.', 'Reflective Observation': 'Reflective Obs.', 'Abstract Conceptualization': 'Abstract Conc.', 'Active Experimentation': 'Active Exp.',
  Analytical: 'Analytical', Creative: 'Creative', Practical: 'Practical',
  Intuitive: 'Intuitive', Reflective: 'Reflective',
};

const DIMENSION_GROUPS: Record<string, string[]> = {
  'Learning': ['Concrete Experience', 'Reflective Observation', 'Abstract Conceptualization', 'Active Experimentation'],
  'Thinking': ['Analytical', 'Creative', 'Practical'],
  'Decision': ['Intuitive', 'Reflective'],
};

function scoreColor(score: number, max: number): string {
  const pct = (score / max) * 100;
  if (pct >= 65) return '#dcfce7';
  if (pct >= 40) return '#fef9c3';
  return '#fee2e2';
}

function scoreTextColor(score: number, max: number): string {
  const pct = (score / max) * 100;
  if (pct >= 65) return '#166534';
  if (pct >= 40) return '#854d0e';
  return '#991b1b';
}

function getMaxForDim(dim: string): number {
  return ['Concrete Experience', 'Reflective Observation', 'Abstract Conceptualization', 'Active Experimentation'].includes(dim) ? 48 : 100;
}

export function CentralAnalyticsHub({ students, assessments, user }: CentralAnalyticsHubProps) {
  const [activeTab, setActiveTab] = useState<SubTab>('learning_style');
  const [dimensionVizMode, setDimensionVizMode] = useState<DimensionVizMode>('radar');
  const [overviewViewMode, setOverviewViewMode] = useState<ViewMode>('charts');
  const [heatmapGroup, setHeatmapGroup] = useState<string>('Learning');
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  // Compute Distributions
  const computeDistributions = () => {
    const learningCounts: Record<string, number> = { Visual: 0, Kinesthetic: 0, Reflective: 0, Assimilating: 0 };
    const thinkingCounts: Record<string, number> = { Analytical: 0, Creative: 0, Practical: 0 };
    const decisionCounts: Record<string, number> = { Intuitive: 0, Deliberate: 0, Balanced: 0 };

    students.forEach(s => {
      const studentAssessments = assessments.filter(a => a.userId === s.id && a.score);
      let kStyle = s.learningStyle || 'Visual';
      let tStyle = s.thinkingStyle || 'Analytical';
      let dStyle = s.decisionStyle || 'Balanced';
      
      studentAssessments.forEach(a => {
        if (a.type === 'kolb' || a.type === 'learning') kStyle = a.score?.kolb?.style || a.score?.learning?.style || kStyle;
        if (['sternberg', 'adult-thinking', 'thinking'].includes(a.type)) tStyle = a.score?.sternberg?.style || a.score?.thinking?.style || tStyle;
        if (a.type === 'dual-process' || a.type === 'decision') dStyle = a.score?.dualProcess?.style || a.score?.decision?.style || dStyle;
      });

      learningCounts[kStyle] = (learningCounts[kStyle] || 0) + 1;
      thinkingCounts[tStyle] = (thinkingCounts[tStyle] || 0) + 1;
      decisionCounts[dStyle] = (decisionCounts[dStyle] || 0) + 1;
    });

    return { learningCounts, thinkingCounts, decisionCounts };
  };

  const { learningCounts, thinkingCounts, decisionCounts } = computeDistributions();
  const chartColors = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6'];
  const assessedCount = students.filter(s => assessments.some(a => a.userId === s.id && a.score)).length;

  const learningChartData = Object.entries(learningCounts).map(([name, count]) => ({ name, count }));
  const thinkingChartData = Object.entries(thinkingCounts).map(([name, count]) => ({ name, count }));
  const decisionChartData = Object.entries(decisionCounts).map(([name, count]) => ({ name, count }));

  // Compute classroom dimension averages
  const classroomDimensionAverages = useMemo(() => {
    const allDims = [
      'Concrete Experience', 'Reflective Observation', 'Abstract Conceptualization', 'Active Experimentation',
      'Analytical', 'Creative', 'Practical',
      'Intuitive', 'Reflective'
    ];

    return allDims.map(dim => {
      let total = 0;
      let count = 0;
      const max = getMaxForDim(dim);

      students.forEach(s => {
        const studentAssessments = assessments.filter(a => a.userId === s.id && a.score);
        studentAssessments.forEach(a => {
          extractDimensionScores(a).forEach(({ name, score }) => {
            if (name === dim) {
              total += score;
              count += 1;
            }
          });
        });
      });

      const avgRaw = count > 0 ? total / count : max * 0.65;
      const pct = Math.round((avgRaw / max) * 100);

      return {
        dimension: DIMENSION_LABELS[dim] || dim,
        fullName: dim,
        classAverage: pct,
        benchmark: 70,
        count
      };
    });
  }, [students, assessments]);

  // --- HEATMAP & INTERVENTION PROFILES LOGIC ---
  const profiles = useMemo(() => {
    return students.map(student => {
      const studentAssessments = assessments.filter(a => a.userId === student.id && a.score);
      
      const dimensionScores: Record<string, number> = {};
      studentAssessments.forEach(a => {
        extractDimensionScores(a).forEach(({ name, score }) => {
          if (dimensionScores[name] == null || score > dimensionScores[name]) {
            dimensionScores[name] = score;
          }
        });
      });

      const strengths = Object.entries(dimensionScores).filter(([dim, sc]) => (sc / getMaxForDim(dim)) >= 0.65).map(([dim]) => dim);
      const gaps = Object.entries(dimensionScores).filter(([dim, sc]) => (sc / getMaxForDim(dim)) < 0.4).map(([dim]) => dim);

      const hasCompletedAssessment = studentAssessments.length > 0;
      let riskLevel: 'high' | 'medium' | 'low' | 'none' = 'none';
      if (hasCompletedAssessment) {
        if (gaps.length >= 3) riskLevel = 'high';
        else if (gaps.length > 0) riskLevel = 'medium';
        else riskLevel = 'low';
      }

      let learningStyle = 'Visual';
      studentAssessments.forEach(a => {
        if (a.type === 'kolb' || a.type === 'learning') learningStyle = a.score?.kolb?.style || a.score?.learning?.style || learningStyle;
      });

      const intervention = generateInterventionLocal(riskLevel, strengths, gaps, learningStyle);

      return {
        user: student as any as User,
        dimensionScores,
        strengths,
        gaps,
        riskLevel,
        intervention
      };
    });
  }, [students, assessments]);

  const heatmapDimensions = DIMENSION_GROUPS[heatmapGroup] ?? [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider">
            <Brain className="w-3.5 h-3.5 text-purple-300" /> Central Analytics Hub
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Cognitive & Pedagogical Intelligence
          </h2>
          <p className="text-white/80 text-xs md:text-sm leading-relaxed">
            Switch effortlessly between styles, learning dimensions, teacher-student alignment, and student intervention profiles.
          </p>
        </div>
      </div>

      {/* 6 Clear Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-gray-950 p-2 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        {[
          { id: 'learning_style', icon: BookOpen, label: 'Learning Style' },
          { id: 'decision_style', icon: Sparkles, label: 'Decision Style' },
          { id: 'thinking_style', icon: Brain, label: 'Thinking Style' },
          { id: 'learning_dimensions', icon: Layers, label: 'Learning Dimensions' },
          { id: 'alignment', icon: Target, label: 'Alignment Analysis' },
          { id: 'class_insights', icon: Activity, label: 'Class Insights' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as SubTab)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-500/30'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* ─── 1. LEARNING STYLE ─── */}
      {activeTab === 'learning_style' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Class Learning Style Distribution</h3>
              <p className="text-xs text-slate-500">Visual, Kinesthetic, Reflective, and Assimilating learner preferences.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" /> Student Count by Learning Style
                </CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={learningChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366F1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-indigo-600" /> Proportion Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={learningChartData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                      {learningChartData.map((_, i) => <Cell key={`cell-${i}`} fill={chartColors[i % chartColors.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(learningCounts).map(([style, count], i) => (
              <Card key={style} className="p-4 border-l-4 border-l-indigo-600 bg-white dark:bg-slate-900 shadow-xs">
                <p className="text-xs text-slate-500 font-semibold uppercase">{style}</p>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{count}</span>
                  <Badge variant="outline" className="text-xs">
                    {students.length > 0 ? Math.round((count / students.length) * 100) : 0}% of class
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ─── 2. DECISION STYLE ─── */}
      {activeTab === 'decision_style' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Class Decision Style Distribution</h3>
              <p className="text-xs text-slate-500">Dual-process cognitive modes: Intuitive, Deliberate, and Balanced decision-making.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" /> Decision Style Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={decisionChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-emerald-600" /> Decision Proportion
                </CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={decisionChartData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                      {decisionChartData.map((_, i) => <Cell key={`cell-${i}`} fill={chartColors[(i + 2) % chartColors.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(decisionCounts).map(([style, count]) => (
              <Card key={style} className="p-4 border-l-4 border-l-emerald-600 bg-white dark:bg-slate-900 shadow-xs">
                <p className="text-xs text-slate-500 font-semibold uppercase">{style}</p>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{count}</span>
                  <Badge variant="outline" className="text-xs">
                    {students.length > 0 ? Math.round((count / students.length) * 100) : 0}%
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ─── 3. THINKING STYLE ─── */}
      {activeTab === 'thinking_style' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Class Thinking Style Distribution</h3>
              <p className="text-xs text-slate-500">Analytical, Creative, and Practical cognitive problem-solving modalities.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" /> Thinking Profile Count
                </CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={thinkingChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-purple-600" /> Thinking Distribution Share
                </CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={thinkingChartData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                      {thinkingChartData.map((_, i) => <Cell key={`cell-${i}`} fill={chartColors[(i + 1) % chartColors.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(thinkingCounts).map(([style, count]) => (
              <Card key={style} className="p-4 border-l-4 border-l-purple-600 bg-white dark:bg-slate-900 shadow-xs">
                <p className="text-xs text-slate-500 font-semibold uppercase">{style}</p>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{count}</span>
                  <Badge variant="outline" className="text-xs">
                    {students.length > 0 ? Math.round((count / students.length) * 100) : 0}%
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ─── 4. LEARNING DIMENSIONS (MULTIPLE VISUALIZATION TOGGLES) ─── */}
      {activeTab === 'learning_dimensions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Learning Dimensions Multi-View</h3>
              <p className="text-xs text-slate-500">Analyze the 9 core cognitive dimensions with alternative graph visualizations.</p>
            </div>

            {/* Visual Mode Toggle Options */}
            <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl inline-flex items-center gap-1 border border-slate-200 dark:border-slate-800">
              <Button
                variant={dimensionVizMode === 'radar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDimensionVizMode('radar')}
                className={`text-xs ${dimensionVizMode === 'radar' ? 'bg-indigo-600 text-white' : ''}`}
              >
                <Target className="w-3.5 h-3.5 mr-1" /> Radar Chart
              </Button>
              <Button
                variant={dimensionVizMode === 'bars' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDimensionVizMode('bars')}
                className={`text-xs ${dimensionVizMode === 'bars' ? 'bg-indigo-600 text-white' : ''}`}
              >
                <BarChart3 className="w-3.5 h-3.5 mr-1" /> Comparative Bars
              </Button>
              <Button
                variant={dimensionVizMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDimensionVizMode('cards')}
                className={`text-xs ${dimensionVizMode === 'cards' ? 'bg-indigo-600 text-white' : ''}`}
              >
                <LayoutGrid className="w-3.5 h-3.5 mr-1" /> Metric Cards
              </Button>
            </div>
          </div>

          {/* Option A: Radar Chart */}
          {dimensionVizMode === 'radar' && (
            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>Classroom Cognitive Dimensions Radar</span>
                  <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 text-[11px]">
                    Class Average vs Expected Benchmark (70%)
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Polygon representation mapping across all experiential, analytical, and process dimensions.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={classroomDimensionAverages} outerRadius="75%">
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: '#475569' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar name="Class Average (%)" dataKey="classAverage" stroke="#6366F1" fill="#6366F1" fillOpacity={0.4} />
                    <Radar name="Target Benchmark (70%)" dataKey="benchmark" stroke="#10B981" fill="#10B981" fillOpacity={0.1} strokeDasharray="3 3" />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Option B: Comparative Horizontal Bars */}
          {dimensionVizMode === 'bars' && (
            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Comparative Mastery Levels by Dimension</CardTitle>
                <CardDescription className="text-xs">
                  Direct percentage comparison of class cohort against 100% scale.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classroomDimensionAverages} layout="vertical" margin={{ left: 40, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="dimension" type="category" tick={{ fontSize: 11 }} width={120} />
                    <Tooltip />
                    <Bar dataKey="classAverage" name="Class Average (%)" radius={[0, 4, 4, 0]}>
                      {classroomDimensionAverages.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.classAverage >= 65 ? '#10B981' : entry.classAverage >= 40 ? '#F59E0B' : '#EF4444'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Option C: Dimension Metric Cards */}
          {dimensionVizMode === 'cards' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {classroomDimensionAverages.map((d) => (
                <Card key={d.fullName} className="p-4 border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{d.fullName}</h4>
                    <Badge className={d.classAverage >= 65 ? 'bg-emerald-100 text-emerald-800' : d.classAverage >= 40 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}>
                      {d.classAverage}%
                    </Badge>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full ${d.classAverage >= 65 ? 'bg-emerald-500' : d.classAverage >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${d.classAverage}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {d.classAverage >= 65 ? '✓ Strong cohort mastery. Maintain challenge level.' : d.classAverage >= 40 ? '⚡ Moderate mastery. Incorporate scaffolds.' : '⚠️ Growth opportunity. Dedicate guided sessions.'}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── ALIGNMENT & MATCH ─── */}
      {activeTab === 'alignment' && (
        <div className="-mx-4 sm:mx-0">
          <TeacherAnalyticsComparison 
            teacherAssessments={assessments.filter(a => a.userId === user?.id)}
            studentAssessments={assessments.filter(a => a.userId !== user?.id)}
            students={students}
            teacherProfile={user!}
          />
        </div>
      )}

      {/* ─── CLASS INSIGHTS ─── */}
      {activeTab === 'class_insights' && assessedCount === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-2xl bg-white shadow-sm mt-6">
          <div className="bg-slate-100 p-4 rounded-full mb-4">
            <TrendingUp className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">No Classroom Insights Yet</h3>
          <p className="text-slate-500 max-w-md">
            Once your students complete their cognitive assessments, this page will populate with detailed classroom insights and heatmaps.
          </p>
        </div>
      )}

      {activeTab === 'class_insights' && assessedCount > 0 && (
        <div className="space-y-8">
          {/* Heatmap Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">Cognitive Score Heatmap</h3>
            </div>
            <div className="bg-slate-100 p-1.5 rounded-xl inline-flex items-center gap-1 flex-wrap">
              {Object.keys(DIMENSION_GROUPS).map(g => (
                <button key={g} onClick={() => setHeatmapGroup(g)} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${heatmapGroup === g ? 'bg-[#5B7DB1] text-white shadow-md' : 'bg-transparent text-slate-600 hover:bg-slate-200'}`}>
                  {g}
                </button>
              ))}
            </div>
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left px-4 py-2.5 text-xs text-gray-500 min-w-[140px]">Student</th>
                      {heatmapDimensions.map(dim => <th key={dim} className="text-center px-3 py-2.5 text-xs text-gray-500">{DIMENSION_LABELS[dim] ?? dim}</th>)}
                      <th className="text-center px-3 py-2.5 text-xs text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map(p => (
                      <tr key={p.user.id} className="border-b last:border-0">
                        <td className="px-4 py-3 font-medium text-xs">{p.user.name}</td>
                        {heatmapDimensions.map(dim => {
                          const score = p.dimensionScores[dim];
                          const max = getMaxForDim(dim);
                          return (
                            <td key={dim} className="px-2 py-2 text-center" title={`Score: ${score}/${max}`}>
                              {score != null ? (
                                <div className="flex flex-col items-center">
                                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                                    <div className="h-full" style={{ width: `${(score/max)*100}%`, backgroundColor: scoreColor(score, max) }}></div>
                                  </div>
                                  <span className="text-[10px] font-bold" style={{ color: scoreColor(score, max) }}>
                                    {score > max * 0.75 ? 'HIGH' : score > max * 0.4 ? 'MED' : 'LOW'}
                                  </span>
                                </div>
                              ) : <div className="text-[10px] text-gray-300">—</div>}
                            </td>
                          );
                        })}
                        <td className="px-3 py-2 text-center">
                          <Badge style={{ backgroundColor: RISK_COLORS[p.riskLevel] + '20', color: RISK_COLORS[p.riskLevel] }} className="text-[10px]">{RISK_LABELS[p.riskLevel]}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Interventions Section */}
          <div className="space-y-4">
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-4 flex gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-900">Pedagogical Interventions</p>
                  <p className="text-xs text-amber-700 mt-1">Targeted instructional strategies generated dynamically from students' cognitive gaps and strengths.</p>
                </div>
              </CardContent>
            </Card>

            {profiles.map(({ user: pUser, intervention: inv, riskLevel, strengths, gaps }) => (
              <Card key={pUser.id} className={`border-l-4 ${inv.priority === 'urgent' ? 'border-l-red-500' : inv.priority === 'normal' ? 'border-l-amber-400' : 'border-l-green-400'}`}>
                <CardContent className="pt-4">
                  <button className="w-full flex justify-between items-start text-left" onClick={() => setExpandedStudent(expandedStudent === pUser.id ? null : pUser.id)}>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{pUser.name}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{inv.focus}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge style={{ backgroundColor: RISK_COLORS[riskLevel] + '20', color: RISK_COLORS[riskLevel] }} className="text-[10px]">{RISK_LABELS[riskLevel]}</Badge>
                        {strengths.slice(0, 1).map(s => <Badge key={s} className="bg-green-50 text-green-700 text-[10px]">💪 {s}</Badge>)}
                        {gaps.slice(0, 1).map(g => <Badge key={g} className="bg-red-50 text-red-700 text-[10px]">⚠️ {g}</Badge>)}
                      </div>
                    </div>
                    {expandedStudent === pUser.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expandedStudent === pUser.id && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <p className="text-xs font-semibold text-gray-600">Recommended Actions:</p>
                      {inv.suggestions.map((s, i) => (
                        <div key={i} className="flex gap-2"><span className="text-xs text-gray-400">{i + 1}.</span><p className="text-xs text-gray-700">{s}</p></div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

function generateInterventionLocal(riskLevel: string, strengths: string[], gaps: string[], dominantStyle: string) {
  if (riskLevel === 'none') {
    return { priority: 'optional', focus: 'Assessment needed', suggestions: ['Encourage student to complete initial assessments', 'Share the benefits of knowing their cognitive profile'] };
  }
  if (riskLevel === 'high') {
    return {
      priority: 'urgent',
      focus: Array.isArray(gaps) && gaps.length > 0 ? `Low scores in: ${gaps.slice(0, 2).join(', ')}` : 'Low overall performance',
      suggestions: [
        `Provide one-on-one support focusing on ${gaps[0] ?? 'foundational skills'}`,
        'Use concrete, hands-on activities to build engagement',
        `Consider peer pairing with a student strong in ${strengths[0] ?? 'complementary areas'}`,
      ],
    };
  }
  if (riskLevel === 'medium') {
    return {
      priority: 'normal',
      focus: 'Bridging cognitive gaps',
      suggestions: [
        `Leverage ${strengths[0] ?? 'strong areas'} to build confidence in challenging topics`,
        'Use varied teaching modalities to reach different learning preferences',
        `Assign group work that uses their ${dominantStyle} style`,
      ],
    };
  }
  return {
    priority: 'optional',
    focus: 'Progressing well',
    suggestions: [
      `Extend learning with advanced challenges in ${strengths[0] ?? 'their strength areas'}`,
      'Encourage them to support peers as a study buddy',
    ],
  };
}
