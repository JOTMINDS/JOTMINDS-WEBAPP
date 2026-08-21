import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  BarChart3, PieChart as PieChartIcon, Target, Sparkles, Brain, Layers, 
  Users, CheckCircle2, TrendingUp, Lightbulb, FileText, LayoutGrid, Table, Activity, ChevronDown, ChevronUp
} from 'lucide-react';
import { StudentCognitiveProfile } from '../utils/teacherIntelligence';
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { extractDimensionScores } from '../utils/cognitiveXP';
import { User } from '../types';

interface CentralAnalyticsHubProps {
  students: any[];
  assessments: any[];
  user: any;
}

type SubTab = 'overview' | 'alignment' | 'class_insights';
type ViewMode = 'cards' | 'charts' | 'table';

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
  const [activeTab, setActiveTab] = useState<SubTab>('overview');
  const [overviewViewMode, setOverviewViewMode] = useState<ViewMode>('charts');
  const [alignmentViewMode, setAlignmentViewMode] = useState<ViewMode>('cards');
  const [selectedStyleDimension, setSelectedStyleDimension] = useState<'learning' | 'thinking' | 'decision'>('learning');
  const [heatmapGroup, setHeatmapGroup] = useState<string>('Learning');
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  // Compute Distributions for Overview
  const computeDistributions = () => {
    const learningCounts: Record<string, number> = { Visual: 0, Kinesthetic: 0, Reflective: 0, Assimilating: 0 };
    const thinkingCounts: Record<string, number> = { Analytical: 0, Creative: 0, Practical: 0, Reflective: 0 };
    const decisionCounts: Record<string, number> = { Intuitive: 0, Deliberate: 0, Balanced: 0 };

    students.forEach(s => {
      const studentAssessments = assessments.filter(a => a.userId === s.id && a.score);
      let kStyle = 'Assimilating';
      let tStyle = 'Analytical';
      let dStyle = 'Balanced';
      
      studentAssessments.forEach(a => {
        if (a.type === 'kolb' || a.type === 'learning') kStyle = a.score?.kolb?.style || a.score?.learning?.style || kStyle;
        if (['sternberg', 'adult-thinking', 'thinking'].includes(a.type)) tStyle = a.score?.sternberg?.style || a.score?.thinking?.style || tStyle;
        if (a.type === 'dual-process' || a.type === 'decision') dStyle = a.score?.dualProcess?.style || a.score?.decision?.style || dStyle;
      });

      learningCounts[kStyle] = (learningCounts[kStyle] || 0) + 1;
      thinkingCounts[tStyle] = (thinkingCounts[tStyle] || 0) + 1;
      decisionCounts[tStyle] = (decisionCounts[tStyle] || 0) + 1;
    });

    return { learningCounts, thinkingCounts, decisionCounts };
  };

  const { learningCounts, thinkingCounts, decisionCounts } = computeDistributions();
  const chartColors = ['#5B7DB1', '#6B4C9A', '#1E8A6E', '#E0A020', '#EC4899'];
  const assessedCount = students.filter(s => assessments.some(a => a.userId === s.id && a.score)).length;

  const activeChartData = 
    selectedStyleDimension === 'learning' ? Object.entries(learningCounts).map(([name, count]) => ({ name, count })) :
    selectedStyleDimension === 'thinking' ? Object.entries(thinkingCounts).map(([name, count]) => ({ name, count })) :
    Object.entries(decisionCounts).map(([name, count]) => ({ name, count }));

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

      let learningStyle = 'Unknown';
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
            <Brain className="w-3.5 h-3.5 text-purple-300" /> Central Analytics & Insights Hub
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Classroom & School Intelligence Center
          </h2>
          <p className="text-white/80 text-xs md:text-sm leading-relaxed">
            Unified analytics engine tracking learning style distributions, alignment dynamics, heatmaps, and AI-driven pedagogical interventions.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-gray-950 p-2 rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xs">
        {[
          { id: 'overview', icon: BarChart3, label: 'Class Overview' },
          { id: 'alignment', icon: Target, label: 'Alignment Analysis' },
          { id: 'class_insights', icon: Activity, label: 'Class Insights' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as SubTab)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === t.id
                ? 'bg-[#6B4C9A] text-white shadow-2xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* ─── CLASS OVERVIEW ─── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">Distribution Overview</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => setOverviewViewMode('charts')} className={`p-1.5 rounded ${overviewViewMode === 'charts' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'}`}><BarChart3 className="w-4 h-4" /></button>
              <button onClick={() => setOverviewViewMode('cards')} className={`p-1.5 rounded ${overviewViewMode === 'cards' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'}`}><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setOverviewViewMode('table')} className={`p-1.5 rounded ${overviewViewMode === 'table' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'}`}><Table className="w-4 h-4" /></button>
            </div>
          </div>

          {overviewViewMode === 'charts' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Select value={selectedStyleDimension} onValueChange={(val: any) => setSelectedStyleDimension(val)}>
                  <SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="learning">Learning Styles</SelectItem>
                    <SelectItem value="thinking">Thinking Styles</SelectItem>
                    <SelectItem value="decision">Decision Styles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card><CardHeader><CardTitle className="text-sm">Frequency Breakdown</CardTitle></CardHeader><CardContent className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={activeChartData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="count" fill="#6B4C9A" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm">Percentage Share</CardTitle></CardHeader><CardContent className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={activeChartData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} >{activeChartData.map((_, i) => <Cell key={`cell-${i}`} fill={chartColors[i % chartColors.length]} />)}</Pie><Tooltip /><Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: "12px" }} /></PieChart></ResponsiveContainer></CardContent></Card>
              </div>
            </div>
          )}

          {overviewViewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-t-4 border-t-purple-600"><CardHeader className="pb-2"><CardTitle className="text-base font-bold">📚 Learning</CardTitle></CardHeader><CardContent className="space-y-2">{Object.entries(learningCounts).map(([style, count]) => (<div key={style} className="flex justify-between text-xs p-2 bg-gray-50 rounded-lg"><span>{style}</span><Badge className="bg-purple-100 text-purple-700 border-none">{count}</Badge></div>))}</CardContent></Card>
              <Card className="border-t-4 border-t-indigo-600"><CardHeader className="pb-2"><CardTitle className="text-base font-bold">🧠 Thinking</CardTitle></CardHeader><CardContent className="space-y-2">{Object.entries(thinkingCounts).map(([style, count]) => (<div key={style} className="flex justify-between text-xs p-2 bg-gray-50 rounded-lg"><span>{style}</span><Badge className="bg-indigo-100 text-indigo-700 border-none">{count}</Badge></div>))}</CardContent></Card>
              <Card className="border-t-4 border-t-emerald-600"><CardHeader className="pb-2"><CardTitle className="text-base font-bold">⚡ Decision (Dual)</CardTitle></CardHeader><CardContent className="space-y-2">{Object.entries(decisionCounts).map(([style, count]) => (<div key={style} className="flex justify-between text-xs p-2 bg-gray-50 rounded-lg"><span>{style}</span><Badge className="bg-emerald-100 text-emerald-700 border-none">{count}</Badge></div>))}</CardContent></Card>
            </div>
          )}

          {overviewViewMode === 'table' && (
            <Card><CardHeader><CardTitle className="text-sm">Roster Analytics</CardTitle></CardHeader><CardContent className="p-0"><table className="w-full text-xs text-left"><thead className="bg-gray-50"><tr><th className="px-4 py-3">Student Name</th><th className="px-4 py-3">Learning Style</th><th className="px-4 py-3">Thinking Style</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y">{students.map(s => (<tr key={s.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-semibold">{s.name}</td><td className="px-4 py-3">{s.learningStyle}</td><td className="px-4 py-3">{s.thinkingStyle}</td><td className="px-4 py-3">{assessments.some(a => a.userId === s.id && (a.completed || a.completedAt)) ? <span className="text-emerald-600 font-medium">Assessed</span> : <span className="text-amber-600">Pending</span>}</td></tr>))}</tbody></table></CardContent></Card>
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
      {activeTab === 'class_insights' && (
        <div className="space-y-8">
          {/* Heatmap Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">Cognitive Score Heatmap</h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm text-gray-600">Dimension Group:</p>
              {Object.keys(DIMENSION_GROUPS).map(g => (
                <button key={g} onClick={() => setHeatmapGroup(g)} className={`px-3 py-1.5 rounded-full text-xs transition-all ${heatmapGroup === g ? 'bg-[#5B7DB1] text-white' : 'bg-white text-gray-600 border'}`}>
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
                            <td key={dim} className="px-2 py-2 text-center">
                              {score != null ? (
                                <div className="px-2 py-1 rounded font-mono text-[10px]" style={{ backgroundColor: scoreColor(score, max), color: scoreTextColor(score, max) }}>{score}</div>
                              ) : <div className="px-2 py-1 rounded text-[10px] bg-gray-50 text-gray-300">—</div>}
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
