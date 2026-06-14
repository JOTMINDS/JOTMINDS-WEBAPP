import React, { useState, useMemo } from 'react';
import { User } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  ArrowLeft, Brain, Users, TrendingUp, AlertTriangle, CheckCircle,
  Lightbulb, Target, BarChart3, Eye, Star, ChevronDown, ChevronUp,
  Zap, BookOpen, Activity
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { getStudentsBySchool, getAllUsers, getAssessmentsByUserId } from '../utils/storage';
import { extractDimensionScores } from '../utils/cognitiveXP';

interface TeacherIntelligenceDashboardProps {
  user: User;
  onBack: () => void;
}

type Tab = 'overview' | 'heatmap' | 'interventions' | 'trends';

interface StudentProfile {
  user: User;
  assessments: any[];
  completedCount: number;
  completedTypes: Set<string>;
  dimensionScores: Record<string, number>;
  avgScore: number;
  riskLevel: 'high' | 'medium' | 'low' | 'none';
  dominantStyle: string;
  strengths: string[];
  gaps: string[];
}

const RISK_COLORS = { high: '#DC2626', medium: '#E0A020', low: '#1E8A6E', none: '#9ca3af' };
const RISK_LABELS = { high: 'At Risk', medium: 'Needs Support', low: 'On Track', none: 'Not Assessed' };

const DIMENSION_LABELS: Record<string, string> = {
  CE: 'Concrete Exp.', RO: 'Reflective Obs.', AC: 'Abstract Conc.', AE: 'Active Exp.',
  Analytical: 'Analytical', Creative: 'Creative', Practical: 'Practical',
  Intuitive: 'Intuitive', Reflective: 'Reflective',
};

const DIMENSION_GROUPS: Record<string, string[]> = {
  'Learning (Kolb)': ['CE', 'RO', 'AC', 'AE'],
  'Thinking (Sternberg)': ['Analytical', 'Creative', 'Practical'],
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
  return ['CE', 'RO', 'AC', 'AE'].includes(dim) ? 48 : 100;
}

function buildStudentProfile(user: User): StudentProfile {
  const assessments = getAssessmentsByUserId(user.id);
  const completed = assessments.filter((a: any) => a.completedAt && a.score);

  const completedTypes = new Set(completed.map((a: any) => {
    if (['kolb', 'vark'].includes(a.type)) return 'learning';
    if (['sternberg', 'jhs-thinking', 'shs-thinking', 'adult-thinking', 'child-thinking'].includes(a.type)) return 'thinking';
    if (a.type === 'dual-process') return 'decision';
    return a.type;
  }));

  const dimensionScores: Record<string, number> = {};
  completed.forEach((a: any) => {
    extractDimensionScores(a).forEach(({ name, score }) => {
      if (dimensionScores[name] == null || score > dimensionScores[name]) {
        dimensionScores[name] = score;
      }
    });
  });

  const scoreVals = Object.values(dimensionScores);
  const avgScore = scoreVals.length > 0 ? scoreVals.reduce((s, v) => s + v, 0) / scoreVals.length : 0;

  const strengths = Object.entries(dimensionScores)
    .filter(([dim, sc]) => (sc / getMaxForDim(dim)) >= 0.65)
    .map(([dim]) => DIMENSION_LABELS[dim] ?? dim);

  const gaps = Object.entries(dimensionScores)
    .filter(([dim, sc]) => (sc / getMaxForDim(dim)) < 0.4)
    .map(([dim]) => DIMENSION_LABELS[dim] ?? dim);

  let riskLevel: StudentProfile['riskLevel'] = 'none';
  if (completed.length > 0) {
    const normAvg = scoreVals.length > 0 ? scoreVals.reduce((s, v, _, arr) => s + (v / getMaxForDim(Object.keys(dimensionScores)[arr.indexOf(v)])), 0) / scoreVals.length : 0;
    if (normAvg < 0.35 || gaps.length >= 3) riskLevel = 'high';
    else if (normAvg < 0.55 || completedTypes.size < 2) riskLevel = 'medium';
    else riskLevel = 'low';
  }

  const kolb = completed.find((a: any) => a.type === 'kolb');
  const dominantStyle = kolb?.score?.kolb?.style ?? completed[0]?.score?.sternberg?.style ?? completed[0]?.score?.dualProcess?.style ?? '—';

  return { user, assessments: completed, completedCount: completed.length, completedTypes, dimensionScores, avgScore, riskLevel, dominantStyle, strengths, gaps };
}

function generateIntervention(profile: StudentProfile): { priority: 'urgent' | 'normal' | 'optional'; suggestions: string[]; focus: string } {
  if (profile.riskLevel === 'none') {
    return { priority: 'optional', focus: 'Assessment needed', suggestions: ['Encourage student to complete initial assessments', 'Start with the Learning Style (Kolb) assessment', 'Share the benefits of knowing their cognitive profile'] };
  }
  if (profile.riskLevel === 'high') {
    return {
      priority: 'urgent',
      focus: profile.gaps.length > 0 ? `Low scores in: ${profile.gaps.slice(0, 2).join(', ')}` : 'Low overall performance',
      suggestions: [
        `Provide one-on-one support focusing on ${profile.gaps[0] ?? 'foundational skills'}`,
        'Use concrete, hands-on activities to build engagement',
        'Break tasks into smaller steps with frequent feedback',
        `Consider peer pairing with a student strong in ${profile.strengths[0] ?? 'complementary areas'}`,
        'Schedule a check-in to identify non-academic barriers',
      ],
    };
  }
  if (profile.riskLevel === 'medium') {
    return {
      priority: 'normal',
      focus: completedTypesLabel(profile.completedTypes),
      suggestions: [
        profile.completedTypes.size < 3 ? 'Encourage completing all 3 assessment types for a full profile' : 'Reinforce strengths while scaffolding weaker dimensions',
        `Leverage ${profile.strengths[0] ?? 'strong areas'} to build confidence in challenging topics`,
        'Use varied teaching modalities to reach different learning preferences',
        `Assign group work that uses their ${profile.dominantStyle !== '—' ? profile.dominantStyle : 'preferred'} learning style`,
      ],
    };
  }
  return {
    priority: 'optional',
    focus: 'Progressing well',
    suggestions: [
      `Extend learning with advanced challenges in ${profile.strengths[0] ?? 'their strength areas'}`,
      'Encourage them to support peers as a study buddy',
      'Introduce stretch goals aligned with their cognitive strengths',
      'Explore career pathways that match their profile',
    ],
  };
}

function completedTypesLabel(types: Set<string>): string {
  if (types.size === 0) return 'No assessments completed';
  const missing = ['learning', 'thinking', 'decision'].filter(t => !types.has(t));
  if (missing.length === 0) return 'All 3 types complete';
  return `Missing: ${missing.join(', ')}`;
}

const PIE_COLORS = ['#5B7DB1', '#6B4C9A', '#1E8A6E', '#E0A020', '#DC2626', '#06b6d4'];

export function TeacherIntelligenceDashboard({ user, onBack }: TeacherIntelligenceDashboardProps) {
  const [tab, setTab] = useState<Tab>('overview');
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [heatmapGroup, setHeatmapGroup] = useState<string>('Learning (Kolb)');

  const students = useMemo(() => {
    let raw: User[] = [];
    if (user.school) raw = getStudentsBySchool(user.school);
    else raw = getAllUsers().filter((u: User) => u.role === 'student');
    return raw.slice(0, 60); // cap for performance
  }, [user]);

  const profiles = useMemo(() => students.map(buildStudentProfile), [students]);

  const stats = useMemo(() => {
    const assessed = profiles.filter(p => p.completedCount > 0);
    const riskCounts = { high: 0, medium: 0, low: 0, none: 0 };
    profiles.forEach(p => { riskCounts[p.riskLevel]++; });

    const styleDistribution: Record<string, number> = {};
    assessed.forEach(p => {
      if (p.dominantStyle !== '—') styleDistribution[p.dominantStyle] = (styleDistribution[p.dominantStyle] ?? 0) + 1;
    });

    const avgByDimension: Record<string, { total: number; count: number }> = {};
    assessed.forEach(p => {
      Object.entries(p.dimensionScores).forEach(([dim, sc]) => {
        if (!avgByDimension[dim]) avgByDimension[dim] = { total: 0, count: 0 };
        avgByDimension[dim].total += sc;
        avgByDimension[dim].count++;
      });
    });

    const classAvgByDimension = Object.entries(avgByDimension).map(([dim, { total, count }]) => ({
      dim: DIMENSION_LABELS[dim] ?? dim,
      avg: Math.round(total / count),
      max: getMaxForDim(dim),
    }));

    return { assessed: assessed.length, total: profiles.length, riskCounts, styleDistribution, classAvgByDimension };
  }, [profiles]);

  const interventions = useMemo(() =>
    profiles.map(p => ({ profile: p, intervention: generateIntervention(p) }))
      .sort((a, b) => {
        const order = { urgent: 0, normal: 1, optional: 2 };
        return order[a.intervention.priority] - order[b.intervention.priority];
      }),
    [profiles]
  );

  const heatmapDimensions = DIMENSION_GROUPS[heatmapGroup] ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="flex-1">
            <h1 className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#5B7DB1]" />
              Teacher Intelligence
            </h1>
            <p className="text-xs text-gray-500">{user.school ?? 'All students'} · {stats.total} students</p>
          </div>
          <Badge className="bg-blue-50 text-blue-700">{stats.assessed}/{stats.total} assessed</Badge>
        </div>
        <div className="max-w-5xl mx-auto px-4 flex gap-1 pb-0 overflow-x-auto">
          {([
            ['overview', BarChart3, 'Overview'],
            ['heatmap', Activity, 'Heatmap'],
            ['interventions', Lightbulb, 'Interventions'],
            ['trends', TrendingUp, 'Class Trends'],
          ] as const).map(([t, Icon, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 shrink-0 transition-colors ${tab === t ? 'border-[#5B7DB1] text-[#5B7DB1]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* ─── OVERVIEW TAB ─── */}
        {tab === 'overview' && (
          <>
            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total Students', value: stats.total, icon: <Users className="w-4 h-4" />, color: '#5B7DB1' },
                { label: 'Assessed', value: stats.assessed, icon: <CheckCircle className="w-4 h-4" />, color: '#1E8A6E' },
                { label: 'Need Support', value: stats.riskCounts.high + stats.riskCounts.medium, icon: <AlertTriangle className="w-4 h-4" />, color: '#E0A020' },
                { label: 'At Risk', value: stats.riskCounts.high, icon: <Zap className="w-4 h-4" />, color: '#DC2626' },
              ].map(s => (
                <Card key={s.label}>
                  <CardContent className="pt-4 text-center">
                    <div className="flex justify-center mb-1" style={{ color: s.color }}>{s.icon}</div>
                    <div className="text-2xl" style={{ color: s.color }}>{s.value}</div>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Risk Distribution + Style Distribution */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-sm">Student Risk Distribution</CardTitle></CardHeader>
                <CardContent className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie key="pie" data={Object.entries(stats.riskCounts).map(([k, v]) => ({ name: RISK_LABELS[k as keyof typeof RISK_LABELS], value: v }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}>
                        {Object.entries(stats.riskCounts).map(([key], i) => (
                          <Cell key={i} fill={RISK_COLORS[key as keyof typeof RISK_COLORS]} />
                        ))}
                      </Pie>
                      <RechartsTip key="tip" />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-sm">Learning Style Distribution</CardTitle></CardHeader>
                <CardContent className="h-[200px]">
                  {Object.keys(stats.styleDistribution).length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={Object.entries(stats.styleDistribution).map(([name, value]) => ({ name, value }))}>
                        <CartesianGrid key="grid" strokeDasharray="3 3" opacity={0.3} />
                        <XAxis key="xax" dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis key="yax" tick={{ fontSize: 11 }} />
                        <RechartsTip key="tip" />
                        <Bar key="bar" dataKey="value" fill="#5B7DB1" radius={[4, 4, 0, 0]}>
                          {Object.keys(stats.styleDistribution).map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Class Average by Dimension */}
            {stats.classAvgByDimension.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Class Average — Cognitive Dimensions</CardTitle>
                  <CardDescription>Average score per dimension across all assessed students</CardDescription>
                </CardHeader>
                <CardContent className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.classAvgByDimension} layout="vertical" margin={{ left: 24 }}>
                      <CartesianGrid key="grid" strokeDasharray="3 3" opacity={0.3} horizontal={false} />
                      <XAxis key="xax" type="number" />
                      <YAxis key="yax" dataKey="dim" type="category" width={100} tick={{ fontSize: 11 }} />
                      <RechartsTip key="tip" />
                      <Bar key="bar" dataKey="avg" fill="#5B7DB1" radius={[0, 4, 4, 0]}>
                        {stats.classAvgByDimension.map((entry, i) => {
                          const pct = (entry.avg / entry.max) * 100;
                          const fill = pct >= 65 ? '#1E8A6E' : pct >= 40 ? '#E0A020' : '#DC2626';
                          return <Cell key={i} fill={fill} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Quick Student List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Student Overview</span>
                  <Button variant="outline" size="sm" onClick={() => setTab('heatmap')}>View Heatmap <ChevronDown className="w-3 h-3 ml-1" /></Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left px-4 py-2 text-xs text-gray-500">Student</th>
                        <th className="text-center px-3 py-2 text-xs text-gray-500">Assessments</th>
                        <th className="text-center px-3 py-2 text-xs text-gray-500">Style</th>
                        <th className="text-center px-3 py-2 text-xs text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profiles.slice(0, 15).map(p => (
                        <tr key={p.user.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-2.5">
                            <p className="text-gray-900">{p.user.name}</p>
                            <p className="text-xs text-gray-400">{p.user.educationLevel ?? '—'}</p>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className="text-xs text-gray-600">{p.completedCount}</span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className="text-xs text-gray-600">{p.dominantStyle}</span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <Badge style={{ backgroundColor: RISK_COLORS[p.riskLevel] + '20', color: RISK_COLORS[p.riskLevel] }} className="text-[10px]">
                              {RISK_LABELS[p.riskLevel]}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {profiles.length > 15 && <p className="text-xs text-gray-400 px-4 py-2">{profiles.length - 15} more students — see Heatmap for full view</p>}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* ─── HEATMAP TAB ─── */}
        {tab === 'heatmap' && (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm text-gray-600">Dimension Group:</p>
              {Object.keys(DIMENSION_GROUPS).map(g => (
                <button
                  key={g}
                  onClick={() => setHeatmapGroup(g)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all ${heatmapGroup === g ? 'bg-[#5B7DB1] text-white' : 'bg-white text-gray-600 border'}`}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="flex gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-100 border border-green-200" /> Strong (&ge;65%)</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200" /> Developing (40–65%)</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-100 border border-red-200" /> Needs support (&lt;40%)</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gray-100 border" /> No data</div>
            </div>

            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left px-4 py-2.5 text-xs text-gray-500 min-w-[140px]">Student</th>
                      {heatmapDimensions.map(dim => (
                        <th key={dim} className="text-center px-3 py-2.5 text-xs text-gray-500 min-w-[80px]">{DIMENSION_LABELS[dim] ?? dim}</th>
                      ))}
                      <th className="text-center px-3 py-2.5 text-xs text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map(p => (
                      <tr key={p.user.id} className="border-b last:border-0">
                        <td className="px-4 py-2">
                          <p className="text-gray-900 text-xs">{p.user.name}</p>
                        </td>
                        {heatmapDimensions.map(dim => {
                          const score = p.dimensionScores[dim];
                          const max = getMaxForDim(dim);
                          return (
                            <td key={dim} className="px-2 py-2 text-center">
                              {score != null ? (
                                <div
                                  className="px-2 py-1 rounded text-xs"
                                  style={{ backgroundColor: scoreColor(score, max), color: scoreTextColor(score, max) }}
                                >
                                  {score}
                                </div>
                              ) : (
                                <div className="px-2 py-1 rounded text-xs bg-gray-50 text-gray-300">—</div>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-3 py-2 text-center">
                          <Badge style={{ backgroundColor: RISK_COLORS[p.riskLevel] + '20', color: RISK_COLORS[p.riskLevel] }} className="text-[10px]">
                            {RISK_LABELS[p.riskLevel]}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {profiles.length === 0 && (
                  <p className="text-center py-12 text-gray-400 text-sm">No students found for your school</p>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* ─── INTERVENTIONS TAB ─── */}
        {tab === 'interventions' && (
          <>
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-900">AI-Generated Recommendations</p>
                    <p className="text-xs text-amber-700 mt-0.5">Suggestions are generated from each student's cognitive assessment data. Review and adapt to your knowledge of the student.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {interventions.map(({ profile: p, intervention: inv }) => (
              <Card
                key={p.user.id}
                className={`border-l-4 ${inv.priority === 'urgent' ? 'border-l-red-500' : inv.priority === 'normal' ? 'border-l-amber-400' : 'border-l-green-400'}`}
              >
                <CardContent className="pt-4">
                  <button
                    className="w-full flex items-start justify-between gap-3 text-left"
                    onClick={() => setExpandedStudent(expandedStudent === p.user.id ? null : p.user.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${inv.priority === 'urgent' ? 'bg-red-500' : inv.priority === 'normal' ? 'bg-amber-400' : 'bg-green-400'}`} />
                      <div>
                        <p className="text-sm text-gray-900">{p.user.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{inv.focus}</p>
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          <Badge style={{ backgroundColor: RISK_COLORS[p.riskLevel] + '20', color: RISK_COLORS[p.riskLevel] }} className="text-[10px]">
                            {RISK_LABELS[p.riskLevel]}
                          </Badge>
                          {p.strengths.slice(0, 2).map(s => (
                            <Badge key={s} className="bg-green-50 text-green-700 text-[10px]">💪 {s}</Badge>
                          ))}
                          {p.gaps.slice(0, 2).map(g => (
                            <Badge key={g} className="bg-red-50 text-red-700 text-[10px]">⚠️ {g}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    {expandedStudent === p.user.id ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-1" />}
                  </button>

                  {expandedStudent === p.user.id && (
                    <div className="mt-4 space-y-2 pl-5 border-t pt-4">
                      <p className="text-xs text-gray-600 mb-2 flex items-center gap-1"><Target className="w-3.5 h-3.5" /> Recommended Actions:</p>
                      {inv.suggestions.map((s, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-xs text-gray-400 shrink-0 mt-0.5">{i + 1}.</span>
                          <p className="text-xs text-gray-700">{s}</p>
                        </div>
                      ))}
                      {p.completedCount > 0 && (
                        <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-2">
                          {Object.entries(p.dimensionScores).slice(0, 6).map(([dim, score]) => (
                            <div key={dim} className="text-center">
                              <p className="text-[10px] text-gray-500">{DIMENSION_LABELS[dim] ?? dim}</p>
                              <p className="text-xs" style={{ color: scoreTextColor(score, getMaxForDim(dim)) }}>{score}/{getMaxForDim(dim)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </>
        )}

        {/* ─── TRENDS TAB ─── */}
        {tab === 'trends' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Class Cognitive Strengths Radar</CardTitle>
                <CardDescription>Average scores across all assessed students</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {stats.classAvgByDimension.length < 3 ? (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">Not enough assessment data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={stats.classAvgByDimension}>
                      <PolarGrid key="pg" />
                      <PolarAngleAxis key="paa" dataKey="dim" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis key="pra" angle={30} tick={{ fontSize: 10 }} />
                      <Radar key="radar" name="Class Avg" dataKey="avg" stroke="#5B7DB1" fill="#5B7DB1" fillOpacity={0.3} />
                      <RechartsTip key="tip" />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Teaching Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2"><BookOpen className="w-4 h-4" /> Teaching Strategy Recommendations</CardTitle>
                <CardDescription>Based on your class's collective cognitive profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.classAvgByDimension.length === 0 ? (
                  <p className="text-sm text-gray-400">Complete student assessments to generate class-level recommendations.</p>
                ) : (
                  (() => {
                    const weakDims = stats.classAvgByDimension.filter(d => (d.avg / d.max) < 0.45).map(d => d.dim);
                    const strongDims = stats.classAvgByDimension.filter(d => (d.avg / d.max) >= 0.65).map(d => d.dim);
                    const dominantStyles = Object.entries(stats.styleDistribution).sort((a, b) => b[1] - a[1]).slice(0, 2).map(e => e[0]);

                    const recs: string[] = [];
                    if (weakDims.length > 0) recs.push(`Focus extra support on: ${weakDims.slice(0, 2).join(', ')} — use scaffolded, step-by-step instruction`);
                    if (strongDims.length > 0) recs.push(`Build on class strengths in ${strongDims.slice(0, 2).join(', ')} — assign leadership roles and extension tasks`);
                    if (dominantStyles.length > 0) recs.push(`Most students are ${dominantStyles.join(' or ')} learners — design lessons with ${dominantStyles.includes('Diverging') ? 'discussion & reflection' : dominantStyles.includes('Converging') ? 'problem-solving & labs' : 'structured content & examples'}`);
                    if (stats.riskCounts.high > 0) recs.push(`${stats.riskCounts.high} student(s) flagged at-risk — prioritise individual check-ins this week`);
                    recs.push(`${100 - Math.round((stats.assessed / Math.max(stats.total, 1)) * 100)}% of students unassessed — encourage completion to unlock full class insights`);

                    return recs.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                        <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-900">{rec}</p>
                      </div>
                    ));
                  })()
                )}
              </CardContent>
            </Card>

            {/* Assessment Completion by Type */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Assessment Completion by Type</CardTitle></CardHeader>
              <CardContent className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={['learning', 'thinking', 'decision'].map(type => ({
                    name: type.charAt(0).toUpperCase() + type.slice(1),
                    students: profiles.filter(p => p.completedTypes.has(type)).length,
                    total: profiles.length,
                  }))}>
                    <CartesianGrid key="grid" strokeDasharray="3 3" opacity={0.3} />
                    <XAxis key="xax" dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis key="yax" tick={{ fontSize: 11 }} domain={[0, profiles.length || 1]} />
                    <RechartsTip key="tip" />
                    <Bar key="bar-students" dataKey="students" name="Completed" fill="#5B7DB1" radius={[4, 4, 0, 0]} />
                    <Bar key="bar-total" dataKey="total" name="Total students" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                    <Legend key="legend" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
