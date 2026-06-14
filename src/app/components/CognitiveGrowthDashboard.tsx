import React, { useState, useMemo, useEffect } from 'react';
import { User } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  ArrowLeft, Trophy, TrendingUp, Target, Zap, Star, Lock, CheckCircle2,
  Calendar, BarChart3, Award, Flame, Brain, ChevronRight, Sparkles
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  getCognitiveXPProfile, getLevelProgress, computeMilestones,
  bootstrapXPFromAssessments, getXPCategoryBreakdown, COGNITIVE_LEVELS,
  extractDimensionScores
} from '../utils/cognitiveXP';
import { getAssessmentsByUserId } from '../utils/storage';
import { getGamificationProfile } from '../utils/gamification';

interface CognitiveGrowthDashboardProps {
  user: User;
  onBack: () => void;
}

type Tab = 'xp' | 'milestones' | 'progress';

const CATEGORY_ICONS: Record<string, string> = {
  assessment: '📋', improvement: '📈', streak: '🔥', exploration: '🔍', mastery: '🏆',
};

const CATEGORY_COLORS: Record<string, string> = {
  assessment: '#5B7DB1', improvement: '#1E8A6E', streak: '#E0A020',
  exploration: '#6B4C9A', mastery: '#EC4899',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function CognitiveGrowthDashboard({ user, onBack }: CognitiveGrowthDashboardProps) {
  const [tab, setTab] = useState<Tab>('xp');
  const [milestoneFilter, setMilestoneFilter] = useState<string>('all');

  const assessments = useMemo(() => getAssessmentsByUserId(user.id), [user.id]);
  const gamProfile = useMemo(() => getGamificationProfile(user.id), [user.id]);

  useEffect(() => {
    bootstrapXPFromAssessments(user.id, assessments, gamProfile);
    // Track profile views
    const views = parseInt(localStorage.getItem(`jm_profile_views_${user.id}`) ?? '0');
    localStorage.setItem(`jm_profile_views_${user.id}`, String(views + 1));
  }, [user.id]);

  const xpProfile = useMemo(() => getCognitiveXPProfile(user.id), [user.id, tab]);
  const { level, pct, xpToNext } = useMemo(() => getLevelProgress(xpProfile.totalXP), [xpProfile.totalXP]);
  const milestones = useMemo(() => computeMilestones(user.id, assessments, gamProfile), [user.id, assessments, gamProfile]);
  const categoryBreakdown = useMemo(() => getXPCategoryBreakdown(xpProfile.activities), [xpProfile.activities]);

  const milestoneCategories = ['all', 'assessment', 'streak', 'improvement', 'exploration', 'mastery'];
  const filteredMilestones = milestoneFilter === 'all' ? milestones : milestones.filter(m => m.category === milestoneFilter);
  const achievedCount = milestones.filter(m => m.achievedAt).length;

  // Progress chart data — group completed assessments by type, sort by date
  const progressChartData = useMemo(() => {
    const completed = assessments.filter(a => a.completedAt && a.score);
    if (completed.length === 0) return [];

    const byType: Record<string, any[]> = {};
    completed.forEach(a => {
      if (!byType[a.type]) byType[a.type] = [];
      byType[a.type].push(a);
    });

    // Build a unified timeline: each point has date + avg score per assessment type
    const allDates = [...new Set(completed.map(a => formatDate(a.completedAt!)))];
    return allDates.map(date => {
      const point: Record<string, any> = { date };
      completed.filter(a => formatDate(a.completedAt!) === date).forEach(a => {
        const scores = extractDimensionScores(a);
        if (scores.length > 0) {
          const avg = scores.reduce((s, d) => s + d.score, 0) / scores.length;
          point[a.type] = Math.round(avg);
        }
      });
      return point;
    });
  }, [assessments]);

  // Radar data — latest assessment of each type
  const radarData = useMemo(() => {
    const completed = assessments.filter(a => a.completedAt && a.score);
    const latest: Record<string, any> = {};
    completed.forEach(a => { latest[a.type] = a; });

    const dims: Record<string, number> = {};
    Object.values(latest).forEach(a => {
      extractDimensionScores(a).forEach(({ name, score }) => { dims[name] = score; });
    });

    return Object.entries(dims).map(([dim, value]) => ({ dim, value, fullMark: 48 }));
  }, [assessments]);

  // Trend data — per-dimension over time for the most assessed type
  const trendLines = useMemo(() => {
    const completed = assessments.filter(a => a.completedAt && a.score);
    const byType: Record<string, any[]> = {};
    completed.forEach(a => { if (!byType[a.type]) byType[a.type] = []; byType[a.type].push(a); });
    const richestType = Object.entries(byType).sort((a, b) => b[1].length - a[1].length)[0];
    if (!richestType) return { lines: [], data: [] };

    const [, entries] = richestType;
    const sorted = [...entries].sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime());
    const dimensions = extractDimensionScores(sorted[0]).map(d => d.name);
    const data = sorted.map(a => {
      const point: Record<string, any> = { date: formatDate(a.completedAt!) };
      extractDimensionScores(a).forEach(({ name, score }) => { point[name] = score; });
      return point;
    });
    return { lines: dimensions, data };
  }, [assessments]);

  const LINE_COLORS = ['#5B7DB1', '#6B4C9A', '#1E8A6E', '#E0A020', '#EC4899'];

  const completedAssessments = assessments.filter(a => a.completedAt).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="flex-1">
            <h1 className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#5B7DB1]" />
              Cognitive Growth
            </h1>
            <p className="text-xs text-gray-500">{user.name} · {completedAssessments} assessments completed</p>
          </div>
          <Badge style={{ backgroundColor: level.color + '20', color: level.color }} className="text-xs">
            {level.icon} Level {level.level}
          </Badge>
        </div>
        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4 flex gap-1 pb-0">
          {([['xp', Zap, 'XP & Level'], ['milestones', Trophy, 'Milestones'], ['progress', BarChart3, 'Progress']] as const).map(([t, Icon, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 transition-colors ${tab === t ? 'border-[#5B7DB1] text-[#5B7DB1]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* ─── XP TAB ─── */}
        {tab === 'xp' && (
          <>
            {/* Level Hero Card */}
            <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${level.color}, ${level.color}cc)` }}>
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_80%_20%,white,transparent)]" />
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-4xl mb-1">{level.icon}</div>
                    <div className="text-2xl mb-0.5">{level.title}</div>
                    <p className="text-white/70 text-sm">{level.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl">{xpProfile.totalXP.toLocaleString()}</div>
                    <p className="text-white/70 text-xs">Total XP</p>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-white/70 mb-1">
                    <span>Level {level.level}</span>
                    {level.level < 10 ? <span>{xpToNext.toLocaleString()} XP to Level {level.level + 1}</span> : <span>Max Level!</span>}
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2.5">
                    <div className="bg-white rounded-full h-2.5 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap mt-3">
                  {level.perks.map(p => (
                    <span key={p} className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{p}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Level Road */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Level Roadmap</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-1 overflow-x-auto pb-2">
                  {COGNITIVE_LEVELS.map(l => (
                    <div key={l.level} className="flex flex-col items-center gap-1 min-w-[60px]">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${l.level <= level.level ? 'border-transparent' : 'border-gray-200 grayscale opacity-40'}`}
                        style={{ backgroundColor: l.level <= level.level ? l.color + '20' : undefined }}
                      >
                        {l.level <= level.level ? l.icon : '?'}
                      </div>
                      <span className="text-[10px] text-center text-gray-500 leading-tight">{l.level <= level.level ? l.title.split(' ')[0] : `Lv.${l.level}`}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* XP Breakdown + Activity Feed */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-sm">XP by Category</CardTitle></CardHeader>
                <CardContent>
                  {categoryBreakdown.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Complete activities to earn XP</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie key="pie" data={categoryBreakdown} dataKey="xp" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                          {categoryBreakdown.map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTip />
                        <Legend key="legend" />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-sm">Recent Activity</CardTitle></CardHeader>
                <CardContent className="space-y-2 max-h-[220px] overflow-y-auto">
                  {xpProfile.activities.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No activities yet — take an assessment!</p>
                  ) : (
                    xpProfile.activities.slice(0, 20).map(act => (
                      <div key={act.id} className="flex items-center gap-3">
                        <span className="text-lg">{CATEGORY_ICONS[act.category] ?? '⚡'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-800 truncate">{act.description}</p>
                          <p className="text-[10px] text-gray-400">{timeAgo(act.timestamp)}</p>
                        </div>
                        <span className="text-xs text-green-600 shrink-0">+{act.xp} XP</span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Assessments', value: completedAssessments, icon: <Target className="w-4 h-4" />, color: '#5B7DB1' },
                { label: 'Milestones', value: `${achievedCount}/${milestones.length}`, icon: <Trophy className="w-4 h-4" />, color: '#E0A020' },
                { label: 'Streak', value: `${gamProfile?.currentStreak ?? 0}d`, icon: <Flame className="w-4 h-4" />, color: '#E0A020' },
              ].map(stat => (
                <Card key={stat.label}>
                  <CardContent className="pt-4 text-center">
                    <div className="flex justify-center mb-1" style={{ color: stat.color }}>{stat.icon}</div>
                    <div className="text-xl" style={{ color: stat.color }}>{stat.value}</div>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* ─── MILESTONES TAB ─── */}
        {tab === 'milestones' && (
          <>
            {/* Summary */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl" style={{ color: '#E0A020' }}>{achievedCount} <span className="text-gray-400">/ {milestones.length}</span></div>
                    <p className="text-sm text-gray-500">Milestones achieved</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg text-green-600">{milestones.filter(m => m.achievedAt).reduce((s, m) => s + m.xpReward, 0).toLocaleString()} XP</div>
                    <p className="text-xs text-gray-400">earned from milestones</p>
                  </div>
                </div>
                <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-amber-400 h-2 rounded-full transition-all" style={{ width: `${(achievedCount / milestones.length) * 100}%` }} />
                </div>
              </CardContent>
            </Card>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {milestoneCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setMilestoneFilter(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs shrink-0 transition-all ${milestoneFilter === cat ? 'text-white' : 'bg-white text-gray-600 border'}`}
                  style={milestoneFilter === cat ? { backgroundColor: CATEGORY_COLORS[cat] ?? '#5B7DB1' } : {}}
                >
                  {cat === 'all' ? '✨ All' : `${CATEGORY_ICONS[cat]} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
                </button>
              ))}
            </div>

            {/* Milestone Grid */}
            <div className="grid md:grid-cols-2 gap-3">
              {filteredMilestones.map(m => {
                const done = !!m.achievedAt;
                return (
                  <div
                    key={m.id}
                    className={`p-4 rounded-xl border-2 transition-all ${done ? 'bg-white border-amber-200' : 'bg-gray-50 border-gray-100'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`text-2xl transition-all ${done ? '' : 'grayscale opacity-50'}`}>{m.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${done ? 'text-gray-900' : 'text-gray-500'}`}>{m.title}</p>
                          {done
                            ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            : <Lock className="w-4 h-4 text-gray-300 shrink-0" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
                        {!done && (
                          <div className="mt-2">
                            <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                              <span>{m.current}/{m.requirement}</span>
                              <span>{Math.round(m.progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full transition-all" style={{ width: `${m.progress}%`, backgroundColor: CATEGORY_COLORS[m.category] }} />
                            </div>
                          </div>
                        )}
                        {done && <p className="text-[10px] text-amber-600 mt-1">+{m.xpReward} XP · achieved</p>}
                        {!done && <p className="text-[10px] text-gray-400 mt-1">Reward: +{m.xpReward} XP</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ─── PROGRESS TAB ─── */}
        {tab === 'progress' && (
          <>
            {assessments.filter(a => a.completedAt).length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Complete assessments to see your progress graphs</p>
                  <Button onClick={onBack} className="mt-4" style={{ backgroundColor: '#5B7DB1' }}>Take an Assessment</Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Cognitive Radar */}
                {radarData.length >= 3 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-500" /> Cognitive Profile</CardTitle>
                      <CardDescription>Your current strengths across all assessed dimensions</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid key="pg" />
                          <PolarAngleAxis key="paa" dataKey="dim" tick={{ fontSize: 11 }} />
                          <PolarRadiusAxis key="pra" angle={30} domain={[0, 48]} tick={{ fontSize: 10 }} />
                          <Radar key="radar" name="Score" dataKey="value" stroke="#5B7DB1" fill="#5B7DB1" fillOpacity={0.25} />
                          <RechartsTip key="tip" />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Dimension Trend Lines */}
                {trendLines.data.length >= 2 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-500" /> Dimension Trends</CardTitle>
                      <CardDescription>How each cognitive dimension has changed over your assessments</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendLines.data} margin={{ right: 16 }}>
                          <CartesianGrid key="grid" strokeDasharray="3 3" opacity={0.3} />
                          <XAxis key="xax" dataKey="date" tick={{ fontSize: 11 }} />
                          <YAxis key="yax" domain={[0, 50]} tick={{ fontSize: 11 }} />
                          <RechartsTip key="tip" />
                          <Legend key="legend" />
                          {trendLines.lines.map((dim, i) => (
                            <Line key={dim} type="monotone" dataKey={dim} stroke={LINE_COLORS[i % LINE_COLORS.length]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <TrendingUp className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Retake assessments to see your improvement over time</p>
                    </CardContent>
                  </Card>
                )}

                {/* Score Summary Cards */}
                <div className="grid grid-cols-1 gap-3">
                  {assessments.filter(a => a.completedAt && a.score).reduce((latest: any[], a) => {
                    if (!latest.find(l => l.type === a.type)) latest.push(a);
                    return latest;
                  }, []).map(a => {
                    const dims = extractDimensionScores(a);
                    const avg = dims.length ? Math.round(dims.reduce((s, d) => s + d.score, 0) / dims.length) : 0;
                    const assessmentLabels: Record<string, string> = {
                      kolb: 'Learning Style (Kolb)', sternberg: 'Thinking Style (Sternberg)',
                      'dual-process': 'Decision Style', 'jhs-thinking': 'Thinking (JHS)',
                      'shs-thinking': 'Thinking (SHS)', 'adult-thinking': 'Thinking (Adult)',
                    };
                    const label = assessmentLabels[a.type] ?? a.type;
                    return (
                      <Card key={a.type}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm text-gray-700">{label}</p>
                            <Badge variant="secondary">Avg: {avg}</Badge>
                          </div>
                          <div className="space-y-2">
                            {dims.map(({ name, score }) => {
                              const maxScore = ['CE', 'RO', 'AC', 'AE'].includes(name) ? 48 : 100;
                              const pctVal = Math.min(100, Math.round((score / maxScore) * 100));
                              const color = pctVal >= 70 ? '#1E8A6E' : pctVal >= 40 ? '#E0A020' : '#DC2626';
                              return (
                                <div key={name}>
                                  <div className="flex justify-between text-xs mb-0.5">
                                    <span className="text-gray-600">{name}</span>
                                    <span style={{ color }}>{score}</span>
                                  </div>
                                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${pctVal}%`, backgroundColor: color }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {a.completedAt && (
                            <p className="text-[10px] text-gray-400 mt-2">Last assessed: {formatDate(a.completedAt)}</p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
