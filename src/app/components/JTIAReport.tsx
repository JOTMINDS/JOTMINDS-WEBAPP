import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Brain, BookOpen, Users, HeartHandshake, Award,
  Sparkles, CheckCircle2, TrendingUp, Compass, Share2,
  Printer, ArrowRight, ShieldCheck, HelpCircle, Layers, Lightbulb
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip as RechartsTip, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Cell
} from 'recharts';
import { JTIAReportData } from '../utils/jtiaScoring';
import { jtiaDomainDescriptions, JTIADomain } from '../utils/jtiaQuestions';

interface JTIAReportProps {
  report: JTIAReportData;
  teacherName?: string;
  onRetake?: () => void;
  onBack?: () => void;
}

export const JTIAReport: React.FC<JTIAReportProps> = ({
  report,
  teacherName = 'Teacher',
  onRetake,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'strengths' | 'growth' | 'ai'>('overview');
  const [recommendationCategory, setRecommendationCategory] = useState<'resources' | 'activities' | 'coaching' | 'pathways'>('resources');

  const domainScores = report.domainScores || {
    cognitive: 82,
    instructional: 85,
    leadership: 88,
    relationship: 90,
    professional: 84
  };

  const radarData = [
    { domain: 'Cognitive', full: 'Cognitive Intelligence', score: domainScores.cognitive, color: 'hsl(var(--chart-1))' },
    { domain: 'Instructional', full: 'Instructional Intelligence', score: domainScores.instructional, color: 'hsl(var(--chart-2))' },
    { domain: 'Leadership', full: 'Classroom Leadership', score: domainScores.leadership, color: 'hsl(var(--chart-3))' },
    { domain: 'Relationship', full: 'Relationship Intelligence', score: domainScores.relationship, color: 'hsl(var(--chart-4))' },
    { domain: 'Professional', full: 'Professional Intelligence', score: domainScores.professional, color: 'hsl(var(--chart-5))' },
  ];

  const getDomainIcon = (name: string) => {
    switch (name) {
      case 'Cognitive': return <Brain className="w-5 h-5 text-indigo-500" />;
      case 'Instructional': return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'Leadership': return <Users className="w-5 h-5 text-emerald-500" />;
      case 'Relationship': return <HeartHandshake className="w-5 h-5 text-amber-500" />;
      case 'Professional': return <Award className="w-5 h-5 text-purple-500" />;
      default: return <Sparkles className="w-5 h-5 text-indigo-500" />;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* ─── Header & Navigation ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 rounded-2xl shadow-xl border border-indigo-800/30">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 px-3 py-1 text-xs font-semibold">
              JTIA • 120 Scenario & Preference Items
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 px-3 py-1 text-xs font-semibold">
              5 Core Intelligence Domains
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            JotMinds Teacher Intelligence Assessment
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-2xl">
            Understanding the intelligence behind great teaching. A comprehensive analysis of how you think, teach, lead, and make decisions in real classroom situations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="outline" onClick={onBack} className="bg-white/10 hover:bg-white/20 text-white border-white/20">
              Back to Dashboard
            </Button>
          )}
          <Button onClick={handlePrint} variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
            <Printer className="w-4 h-4 mr-2" />
            Print Report
          </Button>
          {onRetake && (
            <Button onClick={onRetake} className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg">
              Retake JTIA
            </Button>
          )}
        </div>
      </div>

      {/* ─── Crucial Non-Ranking Philosophy Banner ──────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-900/40 via-teal-900/40 to-slate-900/40 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-4">
        <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-semibold text-emerald-300 text-sm md:text-base">
            Designed for Development, Not Ranking
          </h4>
          <p className="text-xs md:text-sm text-slate-300 mt-1">
            The JotMinds Teacher Intelligence Assessment does not rank or compare teachers against one another. Unlike traditional compliance evaluations, your JTIA profile is dedicated entirely to personal self-awareness, professional growth, and classroom excellence.
          </p>
        </div>
      </div>

      {/* ─── Main Navigation Tabs ───────────────────────────────────────── */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 font-medium text-sm transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          5 Core Domains
        </button>
        <button
          onClick={() => setActiveTab('strengths')}
          className={`px-4 py-2.5 font-medium text-sm transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'strengths'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Professional Strengths
        </button>
        <button
          onClick={() => setActiveTab('growth')}
          className={`px-4 py-2.5 font-medium text-sm transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'growth'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-amber-500" />
          Growth Opportunities
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2.5 font-medium text-sm transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'ai'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-500" />
          AI Development Recommendations
        </button>
      </div>

      {/* ─── TAB 1: 5 CORE DOMAINS OVERVIEW ─────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in-50 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Radar Visual */}
            <Card className="lg:col-span-5 shadow-md border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Compass className="w-5 h-5 text-indigo-600" />
                  Intelligence Domain Profile
                </CardTitle>
                <CardDescription>
                  Normalized scores (0-100) across the five teacher intelligence domains.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="rgba(148, 163, 184, 0.3)" />
                      <PolarAngleAxis dataKey="domain" stroke="#64748B" tick={{ fontSize: 12, fontWeight: 500 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94A3B8" />
                      <Radar
                        name="Domain Score"
                        dataKey="score"
                        stroke="#6366F1"
                        fill="#6366F1"
                        fillOpacity={0.3}
                      />
                      <RechartsTip
                        formatter={(val: number) => [`${val} / 100`, 'Score']}
                        contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', color: '#FFF' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-center">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                    Overall Teacher Intelligence Index
                  </span>
                  <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                    {report.overallScore || 85} <span className="text-base font-normal text-slate-400">/ 100</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Domain Score Breakdown */}
            <div className="lg:col-span-7 space-y-4">
              {radarData.map((item, index) => {
                const descObj = Object.values(jtiaDomainDescriptions).find(d => d.title.startsWith(item.domain));
                return (
                  <Card key={item.domain} className="shadow-sm hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                            {getDomainIcon(item.domain)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                                {item.full}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                Domain {index + 1}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              {descObj?.description}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              {descObj?.subCompetencies.map(sub => (
                                <span
                                  key={sub}
                                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                                >
                                  {sub}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-2xl font-black text-slate-900 dark:text-white">
                            {item.score}
                          </div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">
                            Proficiency
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: PROFESSIONAL STRENGTHS ──────────────────────────────── */}
      {activeTab === 'strengths' && (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-5">
            <h3 className="font-bold text-emerald-900 dark:text-emerald-300 text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Your Professional Strengths
            </h3>
            <p className="text-sm text-emerald-800 dark:text-emerald-400 mt-1">
              These are the sub-competencies where you consistently demonstrate exemplary capability and positive classroom effectiveness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(report.strengths || []).map((strength, idx) => (
              <Card key={strength.title} className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 text-xs">
                      {strength.domain}
                    </Badge>
                    <span className="text-lg font-black text-emerald-600">
                      {strength.score}/100
                    </span>
                  </div>
                  <CardTitle className="text-lg font-bold mt-2">
                    {strength.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {strength.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 3: GROWTH OPPORTUNITIES ────────────────────────────────── */}
      {activeTab === 'growth' && (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-5">
            <h3 className="font-bold text-amber-900 dark:text-amber-300 text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              Your Growth Opportunities
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-400 mt-1">
              These areas represent your highest potential for professional enhancement. Small targeted adjustments here can yield significant gains in learner outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(report.growthOpportunities || []).map((growth, idx) => (
              <Card key={growth.title} className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-300 text-xs">
                      {growth.domain}
                    </Badge>
                    <span className="text-lg font-black text-amber-600">
                      {growth.score}/100
                    </span>
                  </div>
                  <CardTitle className="text-lg font-bold mt-2">
                    {growth.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {growth.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: AI DEVELOPMENT RECOMMENDATIONS ──────────────────────── */}
      {activeTab === 'ai' && (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          <div className="bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900/40 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  JotMinds AI Personalised Development Pathway
                </h3>
                <p className="text-sm text-purple-200">
                  Custom-curated learning resources, classroom activities, coaching suggestions, and career growth pathways based on your 120 JTIA responses.
                </p>
              </div>
            </div>

            {/* Recommendation sub-tabs */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-purple-500/20">
              <button
                onClick={() => setRecommendationCategory('resources')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  recommendationCategory === 'resources'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white/10 text-purple-200 hover:bg-white/20'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Learning Resources ({report.recommendations?.resources.length || 0})
              </button>
              <button
                onClick={() => setRecommendationCategory('activities')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  recommendationCategory === 'activities'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white/10 text-purple-200 hover:bg-white/20'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                Development Activities ({report.recommendations?.activities.length || 0})
              </button>
              <button
                onClick={() => setRecommendationCategory('coaching')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  recommendationCategory === 'coaching'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white/10 text-purple-200 hover:bg-white/20'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Coaching & Mentoring ({report.recommendations?.coaching.length || 0})
              </button>
              <button
                onClick={() => setRecommendationCategory('pathways')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  recommendationCategory === 'pathways'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white/10 text-purple-200 hover:bg-white/20'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                Growth Pathways ({report.recommendations?.pathways.length || 0})
              </button>
            </div>
          </div>

          {/* Render Active Recommendation List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(report.recommendations?.[recommendationCategory] || []).map((item, i) => (
              <Card key={i} className="shadow-sm hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white leading-relaxed">
                      {item}
                    </h4>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
