import React, { useState, useMemo } from 'react';
import { User } from '../../types';
import {
  DevelopmentalBand,
  DEVELOPMENTAL_BANDS,
  DEVELOPMENTAL_DOMAINS,
  EvidenceEvent,
} from '../../types/preschoolDevelopmental';
import {
  calculateClassDevelopmentIntelligence,
  resolveChildBand,
} from '../../utils/preschoolEngine';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  Users, TrendingUp, Sparkles, AlertCircle, CheckCircle2,
  BookOpen, Compass, Layers, Brain, Calendar, Play
} from 'lucide-react';

interface PreschoolClassInsightsViewProps {
  childrenList: User[];
  events: EvidenceEvent[];
  currentUser: User;
  onOpenAssessModal: (childId?: string, indicatorId?: string) => void;
  onRefresh: () => void;
}

export function PreschoolClassInsightsView({
  childrenList,
  events,
  currentUser,
  onOpenAssessModal,
  onRefresh,
}: PreschoolClassInsightsViewProps) {
  // Extract distinct class IDs
  const classOptions = useMemo(() => {
    const map = new Map<string, string>();
    map.set('all', 'All Preschool Cohort');
    childrenList.forEach(c => {
      if (c.classId) {
        map.set(c.classId, c.className || `Class ${c.classId}`);
      }
    });
    return Array.from(map.entries());
  }, [childrenList]);

  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [chartType, setChartType] = useState<'radar' | 'bar'>('bar');

  // Filter children for selected class
  const classChildren = useMemo(() => {
    if (selectedClassId === 'all') return childrenList;
    return childrenList.filter(c => c.classId === selectedClassId);
  }, [childrenList, selectedClassId]);

  const selectedClassName =
    classOptions.find(([id]) => id === selectedClassId)?.[1] || 'Preschool Cohort';

  // Compute Class Intelligence
  const intelligence = useMemo(() => {
    return calculateClassDevelopmentIntelligence(
      classChildren,
      events,
      selectedClassId,
      selectedClassName
    );
  }, [classChildren, events, selectedClassId, selectedClassName]);

  // Chart Data preparation
  const chartData = useMemo(() => {
    return intelligence.domainAverages.map(d => {
      const meta = DEVELOPMENTAL_DOMAINS[d.domainCode];
      return {
        domain: meta?.shortName || d.domainCode,
        fullName: d.domainName,
        averageStage: d.averageStage,
        emerging: d.emergingCount,
        developing: d.developingCount,
        achieving: d.achievingCount,
        extending: d.extendingCount,
        total: d.emergingCount + d.developingCount + d.achievingCount + d.extendingCount,
      };
    });
  }, [intelligence]);

  // Radar Data
  const radarData = useMemo(() => {
    return intelligence.domainAverages.map(d => {
      const meta = DEVELOPMENTAL_DOMAINS[d.domainCode];
      return {
        domain: meta?.shortName || d.domainCode,
        score: Math.round((d.averageStage / 4) * 100),
        stage: d.averageStage,
      };
    });
  }, [intelligence]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-200/50 dark:border-emerald-900/30 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-600 text-white font-medium">Cohort Analytics</Badge>
              <Badge variant="outline" className="text-xs">Multidimensional Tracking</Badge>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Class Developmental Intelligence
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              Cohort-wide developmental footprint across all 7 domains to inform station design, instructional differentiation, and collaborative learning circles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Select Class:</span>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="text-xs border rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 dark:border-slate-800 font-medium shadow-xs"
            >
              {classOptions.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-slate-500">Enrolled Children</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {intelligence.totalChildren}
            </div>
            <span className="text-[11px] text-slate-500">In {selectedClassName}</span>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-slate-500">Active Observations</span>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {intelligence.activeObservations}
            </div>
            <span className="text-[11px] text-slate-500">Evidence events logged</span>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-slate-500">Band Distribution</span>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 pt-1">
              <span>P1: {intelligence.bandDistribution.P1}</span>
              <span>•</span>
              <span>P2: {intelligence.bandDistribution.P2}</span>
              <span>•</span>
              <span>P3: {intelligence.bandDistribution.P3}</span>
              <span>•</span>
              <span>P4: {intelligence.bandDistribution.P4}</span>
            </div>
            <span className="text-[11px] text-slate-500">Age groups 2–6</span>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-slate-500">Identified Strengths</span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {intelligence.cohortStrengths.length}
            </div>
            <span className="text-[11px] text-slate-500">Consolidated domain areas</span>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts & Domain Distribution */}
      <Card className="border border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Domain Mastery & Distribution
            </CardTitle>
            <CardDescription className="text-xs">
              Continuous developmental profile across all 7 framework domains
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                chartType === 'bar'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Stage Breakdown
            </button>
            <button
              onClick={() => setChartType('radar')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                chartType === 'radar'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              7-Domain Radar
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {chartType === 'bar' ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <XAxis dataKey="domain" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const item = chartData.find(d => d.domain === label);
                        return (
                          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl text-xs space-y-1.5">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {item?.fullName}
                            </div>
                            <div className="text-slate-600 dark:text-slate-400">
                              Average Stage: <span className="font-semibold text-blue-600">{item?.averageStage} / 4.0</span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                              <span className="text-amber-600">Emerging: {item?.emerging}</span>
                              <span className="text-blue-600">Developing: {item?.developing}</span>
                              <span className="text-emerald-600">Achieving: {item?.achieving}</span>
                              <span className="text-purple-600">Extending: {item?.extending}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Bar dataKey="emerging" name="Stage 1: Emerging" fill="#F59E0B" stackId="a" />
                  <Bar dataKey="developing" name="Stage 2: Developing" fill="#3B82F6" stackId="a" />
                  <Bar dataKey="achieving" name="Stage 3: Achieving" fill="#10B981" stackId="a" />
                  <Bar dataKey="extending" name="Stage 4: Extending" fill="#8B5CF6" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="domain" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="Cohort Developmental Index"
                    dataKey="score"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.4}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-lg text-xs">
                            <div className="font-bold">{data.domain}</div>
                            <div className="text-emerald-600 font-semibold">
                              Average Stage: {data.stage} / 4.0 ({data.score}%)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cohort Strengths & Support Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cohort Strengths */}
        <Card className="border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <CardTitle className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                Cohort Emerging Strengths
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-emerald-700 dark:text-emerald-400">
              Areas where the majority of learners are progressing independently
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {intelligence.cohortStrengths.map((str, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-800/40 text-xs text-slate-800 dark:text-slate-200 shadow-2xs"
              >
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold shrink-0 text-[11px]">
                  ✓
                </span>
                <span className="leading-relaxed">{str}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Priority Focus & Support Areas */}
        <Card className="border border-amber-200 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <CardTitle className="text-base font-bold text-amber-900 dark:text-amber-200">
                Priority Scaffolding Areas
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-amber-700 dark:text-amber-400">
              Identified clusters where learners benefit from targeted small-group play
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {intelligence.cohortDevelopmentGaps.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                All assessed domains show steady progress.
              </div>
            ) : (
              intelligence.cohortDevelopmentGaps.map((gap, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-800/40 space-y-2 text-xs shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {gap.clusterName}
                    </span>
                    <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-300">
                      {gap.childrenNeedingSupport} Children Consolidating
                    </Badge>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                    {gap.description}
                  </p>
                  <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg font-medium">
                    <span className="font-semibold">Suggested Focus: </span>
                    {gap.recommendedClassroomFocus}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Suggested Classroom Station Configurations */}
      <Card className="border border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Recommended Play & Discovery Stations
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Adapt physical classroom interest centers based on active cohort competencies
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-0">
          {intelligence.teachingInsightRecommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2.5 text-xs"
            >
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                {rec.title}
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Instructional Approach:
                </span>
                <p className="text-slate-700 dark:text-slate-300">{rec.instructionalStrategy}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Station Layout:
                </span>
                <p className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  {rec.suggestedStationSetup}
                </p>
              </div>
              <div className="pt-1 flex items-center gap-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                <BookOpen className="h-3.5 w-3.5 shrink-0" />
                <span>{rec.inServiceTrainingModule}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
