import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Brain, BookOpen, Users, HeartHandshake, Award,
  Sparkles, ShieldCheck, TrendingUp, BarChart2,
  Download, Printer, Filter, ChevronRight, Layers, Target, CheckCircle2,
  RefreshCw, Loader2
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip as RechartsTip, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Cell
} from 'recharts';
import { JTIASchoolAggregatedInsights, generateSchoolJTIAInsights, JTIAReportData } from '../utils/jtiaScoring';
import { JTIADomain } from '../utils/jtiaQuestions';
import { generateSchoolJTIAAIInsights } from '../utils/aiService';

interface JTIASchoolDashboardProps {
  reports?: JTIAReportData[];
  schoolName?: string;
  onBack?: () => void;
}

export const JTIASchoolDashboard: React.FC<JTIASchoolDashboardProps> = ({
  reports = [],
  schoolName = 'Our Institution',
  onBack
}) => {
  const [selectedDomain, setSelectedDomain] = useState<JTIADomain | 'ALL'>('ALL');
  const insights: JTIASchoolAggregatedInsights = generateSchoolJTIAInsights(reports);

  const [aiPdPriorities, setAiPdPriorities] = useState<JTIASchoolAggregatedInsights['pdPriorities'] | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  const fetchAiSchoolInsights = async () => {
    setIsLoadingAi(true);
    const aiRes = await generateSchoolJTIAAIInsights(insights, schoolName);
    if (aiRes && aiRes.length > 0) {
      setAiPdPriorities(aiRes);
    }
    setIsLoadingAi(false);
  };

  useEffect(() => {
    fetchAiSchoolInsights();
  }, [insights.totalTeachersAssessed, schoolName]);

  const displayedPdPriorities = aiPdPriorities || insights.pdPriorities;

  const filteredHeatmap = selectedDomain === 'ALL'
    ? insights.competencyHeatmap
    : insights.competencyHeatmap.filter(item => item.domain === selectedDomain);

  const radarData = [
    { domain: 'Cognitive', full: 'Cognitive Intelligence', score: insights.domainAverages.cognitive },
    { domain: 'Instructional', full: 'Instructional Intelligence', score: insights.domainAverages.instructional },
    { domain: 'Leadership', full: 'Classroom Leadership', score: insights.domainAverages.leadership },
    { domain: 'Relationship', full: 'Relationship Intelligence', score: insights.domainAverages.relationship },
    { domain: 'Professional', full: 'Professional Intelligence', score: insights.domainAverages.professional }
  ];

  const getReadinessBadge = (level: string) => {
    switch (level) {
      case 'Exemplary':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300">Exemplary</Badge>;
      case 'Proficient':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300">Proficient</Badge>;
      case 'Developing':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300">Developing</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300">Emerging</Badge>;
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* ─── Header & Institutional Banner ──────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 rounded-2xl shadow-xl border border-indigo-800/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 px-3 py-1 text-xs font-semibold">
              School Intelligence Dashboard • JTIA
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 px-3 py-1 text-xs font-semibold">
              {insights.totalTeachersAssessed} Teachers Assessed
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {schoolName} — Teacher Intelligence Analytics
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-3xl">
            Aggregated intelligence insights across 5 Core Domains to support evidence-based professional development and institutional excellence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="outline" onClick={onBack} className="bg-white/10 hover:bg-white/20 text-white border-white/20">
              Back
            </Button>
          )}
          <Button onClick={() => window.print()} variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
            <Printer className="w-4 h-4 mr-2" />
            Export Summary
          </Button>
        </div>
      </div>

      {/* ─── Non-Ranking Philosophy Notice ──────────────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-teal-950/60 to-slate-900/60 border-2 border-emerald-500/40 rounded-xl p-5 flex items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-extrabold text-emerald-300 text-base md:text-lg">
              Designed for Development, Not Ranking
            </h3>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-3xl">
              The JotMinds Teacher Intelligence Assessment does not rank or compare teachers against one another. This dashboard aggregates anonymized institutional patterns exclusively to guide targeted professional development, celebrate school strengths, and elevate learning experiences.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Key Institutional Metric Cards ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase">Overall School Intelligence</span>
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {insights.overallSchoolIntelligence}/100
              </div>
              <span className="text-xs text-emerald-600 font-medium">Workforce Readiness Index</span>
            </div>
            <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600">
              <Brain className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase">Assessed Participation</span>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {insights.totalTeachersAssessed}
              </div>
              <span className="text-xs text-slate-500 font-medium">100% Complete 120-Item Profile</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase">Top Synergy Domain</span>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 truncate max-w-[180px]">
                {insights.growthPatterns.highSynergyDomains[0] || "Relationship Intelligence"}
              </div>
              <span className="text-xs text-slate-500 font-medium">School-Wide Strength</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600">
              <HeartHandshake className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase">PD Priority Count</span>
              <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {displayedPdPriorities.length}
              </div>
              <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">Targeted Growth Workshops</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600">
              <Target className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── School Capability Radar & Priority Action Plan ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart */}
        <Card className="lg:col-span-5 shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-emerald-600" />
              Institutional Intelligence Map
            </CardTitle>
            <CardDescription>
              Average across 5 core pedagogical intelligence domains
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#94A3B8" strokeOpacity={0.4} />
                <PolarAngleAxis dataKey="domain" stroke="#64748B" fontSize={11} />
                <PolarRadiusAxis domain={[0, 100]} stroke="#64748B" fontSize={10} />
                <Radar name="School Average" dataKey="score" stroke="#10B981" fill="#10B981" fillOpacity={0.35} />
                <RechartsTip formatter={(val: number) => [`${val} / 100`, 'Average Score']} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Professional Development Priorities */}
        <Card className="lg:col-span-7 shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-600" />
                  Evidence-Based PD Priorities
                </CardTitle>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs">
                  {aiPdPriorities ? 'Live AI School Strategy' : 'Algorithmic Priorities'}
                </Badge>
              </div>
              <CardDescription className="mt-1">
                Recommended school-wide professional development programmes based on aggregated capability gaps.
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchAiSchoolInsights}
              disabled={isLoadingAi}
              className="gap-1.5 text-xs"
            >
              {isLoadingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              {isLoadingAi ? 'Generating...' : 'AI Variations'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {displayedPdPriorities.map((pd, idx) => (
              <div
                key={pd.title}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 text-xs font-semibold">
                    {pd.domain}
                  </Badge>
                  <span className="text-sm font-black text-amber-600">
                    School Avg: {pd.averageScore}/100
                  </span>
                </div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  {pd.recommendedProgram}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  <strong>Expected Impact:</strong> {pd.impactArea}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ─── School-Wide Competency Heatmap ─────────────────────────────── */}
      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              School-Wide Competency Heatmap
            </CardTitle>
            <CardDescription>
              Detailed breakdown of all 30 teaching sub-competencies across the 5 domains.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedDomain('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedDomain === 'ALL'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              All Domains
            </button>
            {(Object.keys(jtiaDomainDescriptions) as JTIADomain[]).map(domain => (
              <button
                key={domain}
                onClick={() => setSelectedDomain(domain)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedDomain === domain
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {domain.split(' ')[0]}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHeatmap.map((item) => (
              <div
                key={item.subCompetency}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 shadow-2xs hover:shadow-sm transition-shadow"
              >
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase text-slate-400">
                    {item.domain}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {item.subCompetency}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    {getReadinessBadge(item.readinessLevel)}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {item.averageScore}
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase">Score</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
