import React, { useState, useMemo } from 'react';
import { User } from '../../types';
import {
  DevelopmentalBand,
  DEVELOPMENTAL_BANDS,
  DEVELOPMENTAL_DOMAINS,
  ASSESSMENT_METHODS,
  EvidenceEvent,
  SchoolReadinessProfile,
} from '../../types/preschoolDevelopmental';
import {
  calculateSchoolReadiness,
  calculateIndicatorEvaluation,
  resolveChildBand,
} from '../../utils/preschoolEngine';
import { MASTER_PRESCHOOL_INDICATORS } from '../../data/preschoolIndicators';
import { generateSchoolReadinessPDF } from '../../utils/preschoolPdfGenerator';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  GraduationCap, Download, CheckCircle2, TrendingUp,
  Users, Globe, FileText, Layers, Sparkles, BookOpen, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface PreschoolSchoolInsightsViewProps {
  childrenList: User[];
  events: EvidenceEvent[];
  currentUser: User;
  onRefresh: () => void;
}

const METHOD_COLORS: Record<string, string> = {
  OBS: '#3B82F6', // Blue
  ACT: '#10B981', // Emerald
  ORL: '#8B5CF6', // Purple
  CHK: '#F59E0B', // Amber
  PRT: '#6366F1', // Indigo
  PAR: '#EC4899', // Pink
};

export function PreschoolSchoolInsightsView({
  childrenList,
  events,
  currentUser,
  onRefresh,
}: PreschoolSchoolInsightsViewProps) {
  const [downloadingChildId, setDownloadingChildId] = useState<string | null>(null);

  // Band Enrollment Breakdown
  const bandCounts = useMemo(() => {
    const counts = { P1: 0, P2: 0, P3: 0, P4: 0 };
    childrenList.forEach(c => {
      const b = resolveChildBand(c);
      counts[b]++;
    });
    return counts;
  }, [childrenList]);

  // P4 Learners (School Readiness Cohort)
  const p4Learners = useMemo(() => {
    return childrenList.filter(c => resolveChildBand(c) === 'P4');
  }, [childrenList]);

  // Compute Readiness Profiles for P4 Learners
  const readinessProfiles = useMemo(() => {
    return p4Learners.map(c => {
      const cEvents = events.filter(e => e.childId === c.id);
      const evals = MASTER_PRESCHOOL_INDICATORS.map(ind =>
        calculateIndicatorEvaluation(ind, cEvents)
      );
      const readiness = calculateSchoolReadiness(c, evals);
      const avgScore = Math.round(
        readiness.dimensions.reduce((s, d) => s + d.score, 0) / readiness.dimensions.length
      );
      return {
        child: c,
        readiness,
        avgScore,
      };
    });
  }, [p4Learners, events]);

  // Cohort Readiness Summary Categories
  const readinessStats = useMemo(() => {
    let advanced = 0;
    let consolidating = 0;
    let developing = 0;
    let emergingSupport = 0;

    readinessProfiles.forEach(p => {
      if (p.avgScore >= 80) advanced++;
      else if (p.avgScore >= 65) consolidating++;
      else if (p.avgScore >= 50) developing++;
      else emergingSupport++;
    });

    return {
      advanced,
      consolidating,
      developing,
      emergingSupport,
      total: readinessProfiles.length,
    };
  }, [readinessProfiles]);

  // Assessment Method Breakdown
  const methodDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach(e => {
      if (e.method) {
        counts[e.method] = (counts[e.method] || 0) + 1;
      }
    });

    return Object.entries(counts).map(([code, count]) => {
      const label = ASSESSMENT_METHODS[code as any]?.label || code;
      return {
        name: label,
        code,
        value: count,
        color: METHOD_COLORS[code] || '#94A3B8',
      };
    });
  }, [events]);

  // Language Representation
  const languageDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach(e => {
      const lang = e.languageOfEvidence || 'English';
      counts[lang] = (counts[lang] || 0) + 1;
    });

    return Object.entries(counts).map(([lang, count]) => ({
      name: lang,
      value: count,
    }));
  }, [events]);

  // Download Individual Readiness PDF
  const handleDownloadReadiness = async (childName: string, readiness: SchoolReadinessProfile) => {
    setDownloadingChildId(readiness.childId);
    try {
      const ok = await generateSchoolReadinessPDF(childName, readiness);
      if (ok) {
        toast.success(`School Readiness Portfolio generated for ${childName}!`);
      } else {
        toast.error('Failed to generate portfolio PDF.');
      }
    } catch {
      toast.error('Error generating PDF.');
    } finally {
      setDownloadingChildId(null);
    }
  };

  if (childrenList.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto my-8 space-y-4">
        <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center mx-auto">
          <GraduationCap className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No Preschool Learners Found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            There are currently no early childhood learners enrolled. Once young learners (ages 2 to 6) are added to your class or school, their developmental tracking and school readiness insights will display here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-600 text-white font-medium">Leadership Overview</Badge>
            <Badge variant="outline" className="text-xs">School Overview</Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Early Years Leadership & Transition
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
            Gentle oversight of early childhood development, teacher observations, and Primary 1 school readiness guides.
          </p>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-slate-500">Total Children</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {childrenList.length}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <span>2–3y: {bandCounts.P1}</span> • <span>3–4y: {bandCounts.P2}</span> • <span>4–5y: {bandCounts.P3}</span> • <span>5–6y: {bandCounts.P4}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-slate-500">Observations Logged</span>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {events.length}
            </div>
            <span className="text-[11px] text-slate-500">
              Avg {childrenList.length > 0 ? (events.length / childrenList.length).toFixed(1) : 0} per child
            </span>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-slate-500">Primary 1 Transition Group</span>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {p4Learners.length}
            </div>
            <span className="text-[11px] text-slate-500">Children aged 5–6 preparing for Primary 1</span>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-slate-500">School Ready / Consolidating</span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {readinessStats.total > 0
                ? `${Math.round(((readinessStats.advanced + readinessStats.consolidating) / readinessStats.total) * 100)}%`
                : '100%'}
            </div>
            <span className="text-[11px] text-slate-500">Transition milestone met</span>
          </CardContent>
        </Card>
      </div>

      {/* School Readiness Section */}
      <Card className="border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-base font-bold text-amber-950 dark:text-amber-200">
                  Primary 1 Transition Readiness (Ages 5–6)
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-amber-800/80 dark:text-amber-300">
                Evaluation across foundational school readiness areas for children entering Primary 1
              </CardDescription>
            </div>
            <Badge className="bg-amber-600 text-white self-start sm:self-center">
              {p4Learners.length} Children Preparing for Primary 1
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          {/* Readiness Category Distribution Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
              <span className="text-slate-500 text-[11px]">Ready with Enrichment</span>
              <div className="text-xl font-bold text-purple-600">
                {readinessStats.advanced}
              </div>
              <span className="text-[10px] text-slate-400">Above benchmark</span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
              <span className="text-slate-500 text-[11px]">Consolidating / Ready</span>
              <div className="text-xl font-bold text-emerald-600">
                {readinessStats.consolidating}
              </div>
              <span className="text-[10px] text-slate-400">Age-appropriate milestone</span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
              <span className="text-slate-500 text-[11px]">Developing Steadily</span>
              <div className="text-xl font-bold text-blue-600">
                {readinessStats.developing}
              </div>
              <span className="text-[10px] text-slate-400">Progressing well</span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
              <span className="text-slate-500 text-[11px]">Gentle Support Needed</span>
              <div className="text-xl font-bold text-amber-600">
                {readinessStats.emergingSupport}
              </div>
              <span className="text-[10px] text-slate-400">Extra encouragement recommended</span>
            </div>
          </div>

          {/* Roster of Learners with Readiness Score and Download Button */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
              Kindergarten Class Transition Roster ({readinessProfiles.length} Learners)
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {readinessProfiles.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No children currently in the 5–6 age group.
                </div>
              ) : (
                readinessProfiles.map(({ child, readiness, avgScore }) => (
                  <div
                    key={child.id}
                    className="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {child.name}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          Age: {readiness.ageYears.toFixed(1)} yrs
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {readiness.overallReadinessSummary}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {avgScore}% Readiness Index
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {avgScore >= 80 ? 'Advanced' : avgScore >= 65 ? 'Consolidating' : avgScore >= 50 ? 'Developing' : 'Support'}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadReadiness(child.name, readiness)}
                        disabled={downloadingChildId === child.id}
                        className="h-8 text-xs gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {downloadingChildId === child.id ? 'Generating...' : 'Readiness Report'}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Fidelity & Multilingual Representation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Method Distribution Chart */}
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
              Assessment Methods Utilization
            </CardTitle>
            <CardDescription className="text-xs">
              Natural observation vs structured play vs oral checks vs parent input
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={methodDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={({ name, percent }) => `${name.split(' ')[0]} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {methodDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Multilingual Evidence Representation */}
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-emerald-500" />
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                Multilingual Evidence Representation
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Honoring Ghanaian mother tongues alongside English in developmental tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {languageDistribution.map((item, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                  <span className="text-slate-500">{item.value} observations</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{
                      width: `${events.length > 0 ? (item.value / events.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
