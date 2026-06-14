import React, { useState, useMemo } from 'react';
import { User } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  ArrowLeft, Users, TrendingUp, AlertTriangle, CheckCircle,
  Search, ChevronDown, ChevronUp, BarChart3, Activity,
  BookOpen, Award, Zap
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { getStudentsBySchool, getAllUsers, getAssessmentsByUserId } from '../utils/storage';
import { getEngagementMetrics } from '../utils/engagementTracking';
import { getGamificationProfile } from '../utils/gamification';
import { extractDimensionScores } from '../utils/cognitiveXP';

interface SchoolAnalyticsDashboardProps {
  user: User;
  onBack: () => void;
  embedded?: boolean;
}

type Tab = 'overview' | 'students' | 'class' | 'leaders' | 'cognitive' | 'insights';

interface StudentSummary {
  user: User;
  assessmentCount: number;
  completedTypes: string[];
  avgScore: number;
  engagementScore: number;
  streak: number;
  xp: number;
  risk: 'high' | 'medium' | 'low' | 'unassessed';
  gradeLevel: string;
  assessments: any[];
}

const RISK_COLORS = { high: '#DC2626', medium: '#E0A020', low: '#1E8A6E', unassessed: '#9ca3af' };
const RISK_LABELS = { high: 'At Risk', medium: 'Needs Support', low: 'On Track', unassessed: 'Not Started' };

function getGradeLabel(u: User): string {
  if (u.educationLevel) return u.educationLevel;
  if (u.age) {
    if (u.age <= 10) return 'Primary';
    if (u.age <= 14) return 'JHS';
    if (u.age <= 18) return 'SHS';
    return 'Tertiary';
  }
  return 'Unknown';
}

function buildSummary(u: User): StudentSummary {
  const assessments = getAssessmentsByUserId(u.id).filter((a: any) => a.completedAt && a.score);
  const eng = getEngagementMetrics(u.id);
  const gam = getGamificationProfile(u.id);

  const completedTypes = [...new Set(assessments.map((a: any) => {
    if (['kolb', 'vark'].includes(a.type)) return 'learning';
    if (['sternberg', 'jhs-thinking', 'shs-thinking', 'adult-thinking', 'child-thinking'].includes(a.type)) return 'thinking';
    if (a.type === 'dual-process') return 'decision';
    return a.type;
  }))];

  const allScores = assessments.flatMap((a: any) => extractDimensionScores(a).map((d: any) => d.score));
  const avgScore = allScores.length ? Math.round(allScores.reduce((s: number, v: number) => s + v, 0) / allScores.length) : 0;
  const engScore = eng?.engagementScore ?? 0;
  const streak = gam?.currentStreak ?? 0;
  const xp = gam?.xp ?? 0;

  let risk: StudentSummary['risk'] = 'unassessed';
  if (assessments.length > 0) {
    if (engScore < 25 || (avgScore > 0 && avgScore < 20)) risk = 'high';
    else if (engScore < 50 || completedTypes.length < 2) risk = 'medium';
    else risk = 'low';
  }

  return { user: u, assessmentCount: assessments.length, completedTypes, avgScore, engagementScore: engScore, streak, xp, risk, gradeLevel: getGradeLabel(u), assessments };
}

export function SchoolAnalyticsDashboard({ user, onBack, embedded }: SchoolAnalyticsDashboardProps) {
  const [tab, setTab] = useState<Tab>('overview');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'engagement' | 'risk'>('risk');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [riskFilter, setRiskFilter] = useState('all');

  const students = useMemo(() => {
    const raw: User[] = user.school
      ? getStudentsBySchool(user.school)
      : getAllUsers().filter((u: User) => u.role === 'student');
    return raw.slice(0, 100);
  }, [user.school]);

  const summaries = useMemo(() => students.map(buildSummary), [students]);

  const stats = useMemo(() => {
    const assessed = summaries.filter(s => s.assessmentCount > 0);
    const riskCounts = { high: 0, medium: 0, low: 0, unassessed: 0 };
    summaries.forEach(s => riskCounts[s.risk]++);
    const avgEng = assessed.length ? Math.round(assessed.reduce((s, v) => s + v.engagementScore, 0) / assessed.length) : 0;
    const totalXP = summaries.reduce((s, v) => s + v.xp, 0);
    const activeStreaks = summaries.filter(s => s.streak > 0).length;
    const typeCompletion = {
      learning: summaries.filter(s => s.completedTypes.includes('learning')).length,
      thinking: summaries.filter(s => s.completedTypes.includes('thinking')).length,
      decision: summaries.filter(s => s.completedTypes.includes('decision')).length,
    };
    const gradeGroups: Record<string, StudentSummary[]> = {};
    summaries.forEach(s => { if (!gradeGroups[s.gradeLevel]) gradeGroups[s.gradeLevel] = []; gradeGroups[s.gradeLevel].push(s); });
    const gradeData = Object.entries(gradeGroups).map(([grade, ss]) => {
      const a = ss.filter(s => s.assessmentCount > 0);
      return { grade, total: ss.length, assessed: a.length, avgScore: a.length ? Math.round(a.reduce((x, s) => x + s.avgScore, 0) / a.length) : 0, avgEngagement: a.length ? Math.round(a.reduce((x, s) => x + s.engagementScore, 0) / a.length) : 0, atRisk: ss.filter(s => s.risk === 'high').length };
    });
    const engagementBands = [
      { label: 'High (70+)', value: assessed.filter(s => s.engagementScore >= 70).length, color: '#1E8A6E' },
      { label: 'Medium (40–69)', value: assessed.filter(s => s.engagementScore >= 40 && s.engagementScore < 70).length, color: '#E0A020' },
      { label: 'Low (<40)', value: assessed.filter(s => s.engagementScore < 40 && s.engagementScore > 0).length, color: '#DC2626' },
      { label: 'Untracked', value: summaries.filter(s => s.assessmentCount === 0).length, color: '#9ca3af' },
    ].filter(b => b.value > 0);
    const topStreaks = [...summaries].filter(s => s.streak > 0).sort((a, b) => b.streak - a.streak).slice(0, 5);
    const topXP = [...summaries].filter(s => s.xp > 0).sort((a, b) => b.xp - a.xp).slice(0, 5);
    const topScores = [...summaries].filter(s => s.avgScore > 0).sort((a, b) => b.avgScore - a.avgScore).slice(0, 5);

    // Aggregate cognitive dimensions
    const dimensionAggregates: Record<string, { name: string, total: number, count: number, max: number }> = {};
    summaries.forEach(s => {
      s.assessments.forEach(a => {
        const dims = extractDimensionScores(a);
        dims.forEach(d => {
          if (!dimensionAggregates[d.id]) {
            dimensionAggregates[d.id] = { name: d.name, total: 0, count: 0, max: d.max };
          }
          dimensionAggregates[d.id].total += d.value;
          dimensionAggregates[d.id].count += 1;
        });
      });
    });
    const cognitiveSummary = Object.values(dimensionAggregates).map(d => ({
      name: d.name,
      avg: Math.round(d.total / d.count),
      max: d.max
    })).sort((a, b) => (b.avg / b.max) - (a.avg / a.max)); // Sort by highest percentage

    return { 
      assessed: assessed.length, total: summaries.length, riskCounts, avgEng, totalXP, activeStreaks, 
      typeCompletion, gradeData, engagementBands, topStreaks, topXP, topScores, cognitiveSummary 
    };
  }, [summaries]);

  const filtered = useMemo(() => {
    let list = summaries;
    if (search) list = list.filter(s => s.user.name.toLowerCase().includes(search.toLowerCase()));
    if (riskFilter !== 'all') list = list.filter(s => s.risk === riskFilter);
    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.user.name.localeCompare(b.user.name);
      else if (sortBy === 'score') cmp = a.avgScore - b.avgScore;
      else if (sortBy === 'engagement') cmp = a.engagementScore - b.engagementScore;
      else { const o = { high: 0, medium: 1, low: 2, unassessed: 3 }; cmp = o[a.risk] - o[b.risk]; }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [summaries, search, riskFilter, sortBy, sortDir]);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: typeof sortBy }) =>
    sortBy === col ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />) : null;

  const pct = (n: number) => `${Math.round((n / Math.max(stats.total, 1)) * 100)}%`;

  const insights = useMemo(() => {
    const list: { type: 'warning' | 'success' | 'info'; title: string; body: string }[] = [];
    if (stats.riskCounts.high > 0) list.push({ type: 'warning', title: `${stats.riskCounts.high} students at high risk`, body: `${pct(stats.riskCounts.high)} of students have low engagement. Schedule individual check-ins.` });
    if (stats.assessed / Math.max(stats.total, 1) < 0.5) list.push({ type: 'warning', title: 'Low assessment uptake', body: `Only ${pct(stats.assessed)} of students have completed at least one assessment.` });
    if (stats.typeCompletion.decision < stats.total * 0.3) list.push({ type: 'info', title: 'Decision assessment underused', body: `Only ${stats.typeCompletion.decision} students completed the Decision Style assessment.` });
    if (stats.avgEng >= 60) list.push({ type: 'success', title: 'Strong engagement', body: `Average engagement score of ${stats.avgEng}/100 across assessed students.` });
    if (stats.activeStreaks > stats.total * 0.4) list.push({ type: 'success', title: `${stats.activeStreaks} students on active streaks`, body: `${pct(stats.activeStreaks)} of students are maintaining daily learning streaks.` });
    if (stats.riskCounts.unassessed > 5) list.push({ type: 'info', title: `${stats.riskCounts.unassessed} students not yet assessed`, body: 'These students have no cognitive assessment data yet.' });
    return list;
  }, [stats]);

  return (
    <div className={`min-h-screen ${embedded ? 'bg-transparent' : 'bg-[#f8f9fa]'}`}>
      {/* Header */}
      {!embedded && (
        <div className="bg-[#1e1e2d] text-white py-6 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <button onClick={onBack} className="flex items-center text-blue-300 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">{user.school || user.organizationName || 'School'} Analytics</h1>
                <p className="text-gray-400 mt-1">Comprehensive insights into student engagement and performance</p>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="font-semibold">{students.length} Students Monitored</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          {!embedded && <Button variant="ghost" size="sm" onClick={onBack} className="gap-1"><ArrowLeft className="w-4 h-4" /> Back</Button>}
          <div className="flex-1">
            <h1 className="flex items-center gap-2 text-base"><BarChart3 className="w-5 h-5 text-[#5B7DB1]" />School Analytics</h1>
            <p className="text-xs text-gray-500">{user.school ?? 'All schools'} · {stats.total} students</p>
          </div>
          <Badge className="bg-blue-50 text-blue-700 text-xs">{stats.assessed}/{stats.total} assessed</Badge>
        </div>
        <div className="max-w-5xl mx-auto px-4 flex gap-1 pb-0 overflow-x-auto">
          {([
            ['overview', BarChart3, 'Overview'], 
            ['students', Users, 'Students'], 
            ['class', BookOpen, 'By Class'], 
            ['leaders', Award, 'Gamification Leaders'],
            ['cognitive', Zap, 'Cognitive Profiles'],
            ['insights', Activity, 'Insights']
          ] as const).map(([t, Icon, label]) => (
            <button key={t} onClick={() => setTab(t as Tab)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 shrink-0 transition-colors ${tab === t ? 'border-[#5B7DB1] text-[#5B7DB1]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {tab === 'overview' && (<>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Students', value: stats.total, color: '#5B7DB1', icon: <Users className="w-4 h-4" /> },
              { label: 'Assessed', value: `${stats.assessed} (${Math.round((stats.assessed / Math.max(stats.total, 1)) * 100)}%)`, color: '#1E8A6E', icon: <CheckCircle className="w-4 h-4" /> },
              { label: 'Avg Engagement', value: `${stats.avgEng}/100`, color: '#6B4C9A', icon: <Activity className="w-4 h-4" /> },
              { label: 'At Risk', value: stats.riskCounts.high, color: '#DC2626', icon: <AlertTriangle className="w-4 h-4" /> },
            ].map(s => (
              <Card key={s.label}><CardContent className="pt-4 text-center">
                <div className="flex justify-center mb-1" style={{ color: s.color }}>{s.icon}</div>
                <div className="text-xl font-semibold" style={{ color: s.color }}>{s.value}</div>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </CardContent></Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Engagement Distribution</CardTitle></CardHeader>
              <CardContent className="h-[200px]">
                {stats.engagementBands.length === 0
                  ? <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data yet</div>
                  : <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie key="pie" data={stats.engagementBands} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={75}>
                        {stats.engagementBands.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <RechartsTip key="tip" />
                      <Legend key="legend" />
                    </PieChart>
                  </ResponsiveContainer>
                }
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Assessment Type Completion</CardTitle></CardHeader>
              <CardContent className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Learning', completed: stats.typeCompletion.learning, remaining: stats.total - stats.typeCompletion.learning },
                    { name: 'Thinking', completed: stats.typeCompletion.thinking, remaining: stats.total - stats.typeCompletion.thinking },
                    { name: 'Decision', completed: stats.typeCompletion.decision, remaining: stats.total - stats.typeCompletion.decision },
                  ]}>
                    <CartesianGrid key="grid" strokeDasharray="3 3" opacity={0.3} />
                    <XAxis key="xax" dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis key="yax" tick={{ fontSize: 11 }} />
                    <RechartsTip key="tip" />
                    <Bar key="bar-c" dataKey="completed" name="Completed" fill="#1E8A6E" stackId="a" />
                    <Bar key="bar-r" dataKey="remaining" name="Remaining" fill="#e5e7eb" stackId="a" radius={[4, 4, 0, 0]} />
                    <Legend key="legend" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-sm">Student Risk Breakdown</CardTitle></CardHeader>
            <CardContent>
              {Object.entries(stats.riskCounts).map(([risk, count]) => {
                const p = Math.round((count / Math.max(stats.total, 1)) * 100);
                return (
                  <div key={risk} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">{RISK_LABELS[risk as keyof typeof RISK_LABELS]}</span>
                      <span style={{ color: RISK_COLORS[risk as keyof typeof RISK_COLORS] }}>{count} ({p}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: `${p}%`, backgroundColor: RISK_COLORS[risk as keyof typeof RISK_COLORS] }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>)}

        {tab === 'students' && (<>
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
              <Input placeholder="Search student..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
            </div>
            <div className="flex gap-1 flex-wrap">
              {(['all', 'high', 'medium', 'low', 'unassessed'] as const).map(r => (
                <button key={r} onClick={() => setRiskFilter(r)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all ${riskFilter === r ? 'text-white' : 'bg-white text-gray-600 border'}`}
                  style={riskFilter === r ? { backgroundColor: r === 'all' ? '#5B7DB1' : RISK_COLORS[r] } : {}}>
                  {r === 'all' ? 'All' : RISK_LABELS[r]}
                </button>
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs text-gray-500">
                    <th className="text-left px-4 py-2.5 cursor-pointer" onClick={() => toggleSort('name')}>Student <SortIcon col="name" /></th>
                    <th className="text-center px-3 py-2.5">Grade</th>
                    <th className="text-center px-3 py-2.5">Assessments</th>
                    <th className="text-center px-3 py-2.5 cursor-pointer" onClick={() => toggleSort('score')}>Score <SortIcon col="score" /></th>
                    <th className="text-center px-3 py-2.5 cursor-pointer" onClick={() => toggleSort('engagement')}>Engagement <SortIcon col="engagement" /></th>
                    <th className="text-center px-3 py-2.5">Streak</th>
                    <th className="text-center px-3 py-2.5 cursor-pointer" onClick={() => toggleSort('risk')}>Status <SortIcon col="risk" /></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.user.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-2.5">
                        <p className="text-gray-900">{s.user.name}</p>
                        <p className="text-[10px] text-gray-400">{s.user.email}</p>
                      </td>
                      <td className="px-3 py-2.5 text-center text-xs text-gray-600">{s.gradeLevel}</td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex justify-center gap-0.5">
                          {['learning', 'thinking', 'decision'].map(t => (
                            <div key={t} className={`w-2 h-2 rounded-full ${s.completedTypes.includes(t) ? 'bg-green-500' : 'bg-gray-200'}`} title={t} />
                          ))}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">{s.assessmentCount}</p>
                      </td>
                      <td className="px-3 py-2.5 text-center text-xs font-semibold" style={{ color: s.avgScore >= 30 ? '#1E8A6E' : s.avgScore > 0 ? '#E0A020' : '#9ca3af' }}>
                        {s.avgScore > 0 ? s.avgScore : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${s.engagementScore}%`, backgroundColor: s.engagementScore >= 60 ? '#1E8A6E' : s.engagementScore >= 30 ? '#E0A020' : '#DC2626' }} />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">{s.engagementScore}/100</p>
                      </td>
                      <td className="px-3 py-2.5 text-center text-xs text-gray-600">{s.streak > 0 ? `🔥 ${s.streak}d` : '—'}</td>
                      <td className="px-3 py-2.5 text-center">
                        <Badge style={{ backgroundColor: RISK_COLORS[s.risk] + '20', color: RISK_COLORS[s.risk] }} className="text-[10px]">{RISK_LABELS[s.risk]}</Badge>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-gray-400 text-sm">No students match</td></tr>}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>)}

        {tab === 'class' && (<>
          <Card>
            <CardHeader><CardTitle className="text-sm">Performance by Class / Grade</CardTitle></CardHeader>
            <CardContent className="h-[240px]">
              {stats.gradeData.length === 0
                ? <div className="h-full flex items-center justify-center text-gray-400 text-sm">No grade data — students need education level set</div>
                : <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.gradeData}>
                    <CartesianGrid key="grid" strokeDasharray="3 3" opacity={0.3} />
                    <XAxis key="xax" dataKey="grade" tick={{ fontSize: 11 }} />
                    <YAxis key="yax" tick={{ fontSize: 11 }} />
                    <RechartsTip key="tip" />
                    <Bar key="bar-s" dataKey="avgScore" name="Avg Score" fill="#5B7DB1" radius={[4, 4, 0, 0]} />
                    <Bar key="bar-e" dataKey="avgEngagement" name="Avg Engagement" fill="#6B4C9A" radius={[4, 4, 0, 0]} />
                    <Legend key="legend" />
                  </BarChart>
                </ResponsiveContainer>
              }
            </CardContent>
          </Card>
          {stats.gradeData.map(g => (
            <Card key={g.grade}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{g.grade}</p>
                    <p className="text-xs text-gray-500">{g.total} students · {g.assessed} assessed ({Math.round((g.assessed / Math.max(g.total, 1)) * 100)}%)</p>
                  </div>
                  {g.atRisk > 0 && <Badge className="bg-red-50 text-red-700 text-[10px]">⚠ {g.atRisk} at risk</Badge>}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Avg Score', value: g.avgScore || '—', color: '#5B7DB1' },
                    { label: 'Avg Engagement', value: g.avgEngagement ? `${g.avgEngagement}/100` : '—', color: '#6B4C9A' },
                    { label: 'At Risk', value: g.atRisk, color: g.atRisk > 0 ? '#DC2626' : '#9ca3af' },
                  ].map(m => (
                    <div key={m.label} className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-sm font-semibold" style={{ color: m.color }}>{m.value}</p>
                      <p className="text-[10px] text-gray-500">{m.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </>)}

        {tab === 'leaders' && (<>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Award className="w-4 h-4 text-[#E0A020]" /> JotMinds Champions (XP)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {stats.topXP.length === 0 ? <p className="text-sm text-gray-500">No XP data available.</p> : stats.topXP.map((s, i) => (
                  <div key={s.user.id} className="flex justify-between items-center bg-yellow-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-yellow-700 w-4">{i + 1}.</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{s.user.name}</p>
                        <p className="text-[10px] text-gray-500">{s.gradeLevel}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#E0A020]">{s.xp} XP</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-orange-500" /> Streak Leaders</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {stats.topStreaks.length === 0 ? <p className="text-sm text-gray-500">No active streaks.</p> : stats.topStreaks.map((s, i) => (
                  <div key={s.user.id} className="flex justify-between items-center bg-orange-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-orange-700 w-4">{i + 1}.</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{s.user.name}</p>
                        <p className="text-[10px] text-gray-500">{s.gradeLevel}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-orange-500">🔥 {s.streak} Days</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#1E8A6E]" /> Top Quiz Performers</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {stats.topScores.length === 0 ? <p className="text-sm text-gray-500">No quiz scores available.</p> : stats.topScores.map((s, i) => (
                  <div key={s.user.id} className="flex justify-between items-center bg-emerald-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-700 w-4">{i + 1}.</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{s.user.name}</p>
                        <p className="text-[10px] text-gray-500">{s.gradeLevel}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#1E8A6E]">{s.avgScore} Avg Score</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>)}

        {tab === 'cognitive' && (<>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Cognitive Profile Summary</CardTitle>
              <p className="text-xs text-gray-500 mt-1">Aggregated dimensions across all completed student assessments</p>
            </CardHeader>
            <CardContent>
              {stats.cognitiveSummary.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">No cognitive profiles generated yet. Have students complete assessments first.</div>
              ) : (
                <div className="space-y-4">
                  {stats.cognitiveSummary.map((dim, i) => {
                    const p = Math.round((dim.avg / dim.max) * 100);
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-700 font-medium">{dim.name}</span>
                          <span className="text-gray-500">{dim.avg} / {dim.max} ({p}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div className="h-2.5 rounded-full" style={{ width: `${p}%`, backgroundColor: '#5B7DB1' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>)}

        {tab === 'insights' && (<>
          {insights.length === 0 && <p className="text-center py-12 text-gray-400 text-sm">Add students and run assessments to generate insights</p>}
          {insights.map((ins, i) => (
            <Card key={i} className={`border-l-4 ${ins.type === 'warning' ? 'border-l-amber-400 bg-amber-50' : ins.type === 'success' ? 'border-l-green-500 bg-green-50' : 'border-l-blue-400 bg-blue-50'}`}>
              <CardContent className="pt-4 flex items-start gap-3">
                <span className="text-xl">{ins.type === 'warning' ? '⚠️' : ins.type === 'success' ? '✅' : 'ℹ️'}</span>
                <div>
                  <p className={`text-sm font-semibold mb-0.5 ${ins.type === 'warning' ? 'text-amber-900' : ins.type === 'success' ? 'text-green-900' : 'text-blue-900'}`}>{ins.title}</p>
                  <p className={`text-xs ${ins.type === 'warning' ? 'text-amber-700' : ins.type === 'success' ? 'text-green-700' : 'text-blue-700'}`}>{ins.body}</p>
                </div>
              </CardContent>
            </Card>
          ))}
          {summaries.filter(s => s.risk === 'high').length > 0 && (
            <Card className="border-l-4 border-l-red-500">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" />Priority Interventions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {summaries.filter(s => s.risk === 'high').slice(0, 5).map(s => (
                  <div key={s.user.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-sm text-red-900">{s.user.name}</p>
                      <p className="text-[10px] text-red-600">Engagement: {s.engagementScore}/100 · {s.assessmentCount} assessments</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800 text-[10px]">Action needed</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>)}
      </div>
    </div>
  );
}
