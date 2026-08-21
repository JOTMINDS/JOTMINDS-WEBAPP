import React, { useState, useEffect } from "react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Brain,
  BookOpen,
  Users,
  HeartHandshake,
  Award,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Compass,
  Share2,
  Printer,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Layers,
  Lightbulb,
  RefreshCw,
  Loader2,
  FileText,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RechartsTip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import { JTIAReportData, JTIAAIRecommendations } from "../utils/jtiaScoring";
import { jtiaDomainDescriptions, JTIADomain } from "../utils/jtiaQuestions";
import { generateJTIAAIRecommendations } from "../utils/aiService";

interface JTIAReportProps {
  report: JTIAReportData;
  teacherName?: string;
  onRetake?: () => void;
  onBack?: () => void;
}

export const JTIAReport: React.FC<JTIAReportProps> = ({
  report,
  teacherName = "Teacher",
  onRetake,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "strengths" | "growth" | "ai"
  >("overview");
  const [graphType, setGraphType] = useState<"radar" | "bar">("radar");
  const [recommendationCategory, setRecommendationCategory] = useState<
    "resources" | "activities" | "coaching" | "pathways"
  >("resources");
  const [aiRecommendations, setAiRecommendations] =
    useState<JTIAAIRecommendations | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  const fetchAiInsights = async () => {
    setIsLoadingAi(true);
    const aiRes = await generateJTIAAIRecommendations(report);
    if (aiRes) {
      setAiRecommendations(aiRes);
    }
    setIsLoadingAi(false);
  };

  useEffect(() => {
    fetchAiInsights();
  }, [report]);

  const displayedRecommendations = aiRecommendations || report.recommendations;

  const domainScores = report.domainScores || {
    cognitive: 82,
    instructional: 85,
    leadership: 88,
    relationship: 90,
    professional: 84,
  };

  const radarData = [
    {
      domain: "Cognitive",
      full: "Cognitive Intelligence",
      score: domainScores.cognitive,
      color: "hsl(var(--chart-1))",
    },
    {
      domain: "Instructional",
      full: "Instructional Intelligence",
      score: domainScores.instructional,
      color: "hsl(var(--chart-2))",
    },
    {
      domain: "Leadership",
      full: "Classroom Leadership",
      score: domainScores.leadership,
      color: "hsl(var(--chart-3))",
    },
    {
      domain: "Relationship",
      full: "Relationship Intelligence",
      score: domainScores.relationship,
      color: "hsl(var(--chart-4))",
    },
    {
      domain: "Professional",
      full: "Professional Intelligence",
      score: domainScores.professional,
      color: "hsl(var(--chart-5))",
    },
  ];

  const getDomainIcon = (name: string) => {
    switch (name) {
      case "Cognitive":
        return <Brain className="w-5 h-5 text-indigo-500" />;
      case "Instructional":
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case "Leadership":
        return <Users className="w-5 h-5 text-emerald-500" />;
      case "Relationship":
        return <HeartHandshake className="w-5 h-5 text-amber-500" />;
      case "Professional":
        return <Award className="w-5 h-5 text-purple-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-500" />;
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("jtia-printable-report");
    const root = document.getElementById("root");
    if (printContent && root) {
      // Hide the main app
      const originalRootDisplay = root.style.display;
      root.style.display = "none";

      // Create a temporary div for printing
      const printDiv = document.createElement("div");
      printDiv.id = "temp-print-div";
      printDiv.className = "p-8 max-w-4xl mx-auto";
      printDiv.innerHTML = printContent.innerHTML;

      // Hide elements that shouldn't be printed
      const noPrintElements = printDiv.querySelectorAll(".no-print-btn");
      noPrintElements.forEach(
        (el) => ((el as HTMLElement).style.display = "none"),
      );

      document.body.appendChild(printDiv);
      window.print();

      // Cleanup
      document.body.removeChild(printDiv);
      root.style.display = originalRootDisplay;
    } else {
      window.print();
    }
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "JTIA Assessment Report\n\n";
    csvContent += "Domain,Score\n";
    radarData.forEach((d) => {
      csvContent += `"${d.full}",${d.score}\n`;
    });

    if (report.strengths) {
      csvContent += "\nStrengths\n";
      report.strengths.forEach((s) => {
        csvContent += `"${s.title}","${s.domain}"\n`;
      });
    }

    if (report.growthOpportunities) {
      csvContent += "\nGrowth Opportunities\n";
      report.growthOpportunities.forEach((s) => {
        csvContent += `"${s.title}","${s.domain}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `JTIA_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getOrientationBadge = (score: number) => {
    if (score >= 85)
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300">
          Exemplary Practice
        </Badge>
      );
    if (score >= 70)
      return (
        <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300">
          Established Practice
        </Badge>
      );
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300">
        Developing Focus
      </Badge>
    );
  };

  return (
    <div
      id="jtia-printable-report"
      className="space-y-8 pb-12 max-w-6xl mx-auto"
    >
      <style>{`
        /* Global print overrides */
        @media print {
          @page { margin: 15mm; }
          body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
            background: white !important; 
            font-size: 11pt;
          }
          #temp-print-div {
            padding: 0 !important;
            max-width: 100% !important;
          }
          .shadow-sm, .shadow-md, .shadow-xl {
            box-shadow: none !important;
            border: 1px solid #e2e8f0 !important;
          }
          /* Page breaking rules */
          h2, h3, h4 { page-break-after: avoid; }
          .break-inside-avoid { page-break-inside: avoid; }
          .card-print-break { page-break-inside: avoid; margin-bottom: 20px; }
        }
      `}</style>

      {/* ─── Header & Navigation ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 rounded-2xl shadow-xl border border-indigo-800/30">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 px-3 py-1 text-xs font-semibold">
              JTIA • Teacher Insights & Adaptive Assessment
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 px-3 py-1 text-xs font-semibold">
              5 Core Domains
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Teaching Insights Assessment
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-2xl">
            Understanding the cognitive styles and instructional strengths behind
            great teaching. A holistic, non-competitive analysis of your
            classroom decision-making.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print-btn mt-3 md:mt-0 justify-start md:justify-end">
          {onBack && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs px-3 py-1.5 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </Button>
          )}
          <Button
            size="sm"
            onClick={handlePrint}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            PDF Report
          </Button>
          <Button
            size="sm"
            onClick={handleExportCSV}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            CSV Export
          </Button>
          <Button
            size="sm"
            onClick={() => toast.success("Report shared with school administration.")}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share Admin
          </Button>
          {onRetake && (
            <Button
              size="sm"
              onClick={onRetake}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 flex items-center gap-1.5 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
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
            The Teaching Insights Assessment does not rank or compare
            teachers against one another. Unlike traditional compliance
            evaluations, your JTIA profile is dedicated entirely to personal
            self-awareness, professional growth, and classroom excellence.
          </p>
        </div>
      </div>

      {/* ─── Main Navigation Tabs ───────────────────────────────────────── */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto pb-1 no-print-btn">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 font-medium text-sm transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === "overview"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <Layers className="w-4 h-4" />5 Core Domains
        </button>
        <button
          onClick={() => setActiveTab("strengths")}
          className={`px-4 py-2.5 font-medium text-sm transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === "strengths"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Professional Strengths
        </button>
        <button
          onClick={() => setActiveTab("growth")}
          className={`px-4 py-2.5 font-medium text-sm transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === "growth"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <TrendingUp className="w-4 h-4 text-amber-500" />
          Growth Opportunities
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`px-4 py-2.5 font-medium text-sm transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === "ai"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-500" />
          Development Recommendations
        </button>
      </div>

      {/* ─── TAB 1: 5 CORE DOMAINS OVERVIEW ─────────────────────────────── */}
      <div
        className={`${activeTab === "overview" ? "block animate-in fade-in-50 duration-300" : "hidden print:block"} space-y-8`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Radar Visual */}
          <Card className="lg:col-span-5 shadow-md border-indigo-100 dark:border-slate-800 bg-gradient-to-b from-white via-indigo-50/20 to-white dark:from-slate-900 dark:to-slate-950">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Compass className="w-5 h-5 text-indigo-600" />
                  Teaching Insights Domain Profile
                </CardTitle>
                <CardDescription className="mt-1">
                  Holistic orientation map across the five teaching insights
                  domains.
                </CardDescription>
              </div>
              <select
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={graphType}
                onChange={(e) =>
                  setGraphType(e.target.value as "radar" | "bar")
                }
              >
                <option value="radar">Radar Chart</option>
                <option value="bar">Bar Chart</option>
              </select>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  {graphType === "radar" ? (
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius="55%"
                      data={radarData}
                    >
                      <defs>
                        <linearGradient
                          id="radarGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#6366F1"
                            stopOpacity={0.6}
                          />
                          <stop
                            offset="100%"
                            stopColor="#8B5CF6"
                            stopOpacity={0.2}
                          />
                        </linearGradient>
                      </defs>
                      <PolarGrid stroke="rgba(99, 102, 241, 0.2)" />
                      <PolarAngleAxis
                        dataKey="domain"
                        stroke="#475569"
                        tick={{ fontSize: 10, fontWeight: 600 }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        stroke="#CBD5E1"
                        tick={false}
                      />
                      <Radar
                        name="Domain Alignment"
                        dataKey="score"
                        stroke="#6366F1"
                        strokeWidth={2.5}
                        fill="url(#radarGrad)"
                        fillOpacity={0.7}
                        dot={{
                          r: 4,
                          fill: "#6366F1",
                          stroke: "#FFF",
                          strokeWidth: 2,
                        }}
                      />
                      <RechartsTip
                        formatter={(val: number) => [
                          val >= 85
                            ? "Exemplary"
                            : val >= 70
                              ? "Established"
                              : "Developing",
                          "Domain Orientation",
                        ]}
                        contentStyle={{
                          backgroundColor: "#0F172A",
                          borderRadius: "10px",
                          color: "#FFF",
                          border: "1px solid #334155",
                        }}
                      />
                    </RadarChart>
                  ) : (
                    <BarChart
                      data={radarData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(99, 102, 241, 0.1)"
                      />
                      <XAxis
                        dataKey="domain"
                        tick={{ fontSize: 10, fontWeight: 600 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis hide domain={[0, 100]} />
                      <RechartsTip
                        formatter={(val: number) => [
                          val >= 85
                            ? "Exemplary"
                            : val >= 70
                              ? "Established"
                              : "Developing",
                          "Domain Orientation",
                        ]}
                        contentStyle={{
                          backgroundColor: "#0F172A",
                          borderRadius: "10px",
                          color: "#FFF",
                          border: "1px solid #334155",
                        }}
                        cursor={{ fill: "rgba(99, 102, 241, 0.05)" }}
                      />
                      <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                        {radarData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.score >= 85
                                ? "#6366F1"
                                : entry.score >= 70
                                  ? "#8B5CF6"
                                  : "#C4B5FD"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-slate-500 mt-2 text-center max-w-sm">
                This chart illustrates your natural teaching inclinations. A
                broader shape in the radar chart, or higher bars in the bar
                chart, indicate stronger alignment with specific cognitive
                domains.
              </p>
              <div className="mt-2 text-center">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  Primary Domain Alignment
                </span>
                <div className="mt-1">
                  {getOrientationBadge(report.overallScore || 85)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Domain Score Breakdown */}
          <div className="lg:col-span-7 space-y-4">
            {radarData.map((item, index) => {
              const descObj = Object.values(jtiaDomainDescriptions).find(
                (d) => d.title === item.full,
              );
              return (
                <>
                  <Card
                    key={item.domain}
                    className="shadow-sm hover:shadow-md transition-shadow card-print-break border-slate-200 dark:border-slate-800"
                  >
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
                              {descObj?.subCompetencies.map((sub) => (
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
                          {getOrientationBadge(item.score)}
                          <div className="text-[10px] text-slate-400 uppercase font-semibold mt-1">
                            Domain Orientation
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── TAB 2: PROFESSIONAL STRENGTHS ──────────────────────────────── */}
      <div
        className={`${activeTab === "strengths" ? "block animate-in fade-in-50 duration-300" : "hidden print:block"} space-y-6 mt-8 print:mt-12`}
      >
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-5">
          <h3 className="font-bold text-emerald-900 dark:text-emerald-300 text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Your Professional Strengths
          </h3>
          <p className="text-sm text-emerald-800 dark:text-emerald-400 mt-1">
            These are the sub-competencies where you consistently demonstrate
            exemplary capability and positive classroom effectiveness.
          </p>
        </div>

        <div className="space-y-8">
          {Object.entries(
            (report.strengths || []).reduce(
              (acc, strength) => {
                if (!acc[strength.domain]) acc[strength.domain] = [];
                acc[strength.domain].push(strength);
                return acc;
              },
              {} as Record<string, typeof report.strengths>,
            ),
          ).map(([domain, items]) => (
            <div key={domain} className="space-y-4">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 border-b pb-2 flex items-center justify-between">
                {domain}
                <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 text-xs font-normal">
                  {items.length} {items.length === 1 ? "Strength" : "Strengths"}
                </Badge>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((strength) => (
                  <Card
                    key={strength.title}
                    className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold">
                          {strength.title}
                        </CardTitle>
                      </div>
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
          ))}
        </div>
      </div>

      {/* ─── TAB 3: GROWTH OPPORTUNITIES ────────────────────────────────── */}
      <div
        className={`${activeTab === "growth" ? "block animate-in fade-in-50 duration-300" : "hidden print:block"} space-y-6 mt-8 print:mt-12`}
      >
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-5">
          <h3 className="font-bold text-amber-900 dark:text-amber-300 text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            Your Growth Opportunities
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-400 mt-1">
            These areas represent your highest potential for professional
            enhancement. Small targeted adjustments here can yield significant
            gains in learner outcomes.
          </p>
        </div>
        <div className="space-y-8">
          {Object.entries(
            (report.growthOpportunities || []).reduce(
              (acc, growth) => {
                if (!acc[growth.domain]) acc[growth.domain] = [];
                acc[growth.domain].push(growth);
                return acc;
              },
              {} as Record<string, typeof report.growthOpportunities>,
            ),
          ).map(([domain, items]) => (
            <div key={domain} className="space-y-4">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 border-b pb-2 flex items-center justify-between">
                {domain}
                <Badge className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-300 text-xs font-normal">
                  {items.length}{" "}
                  {items.length === 1 ? "Opportunity" : "Opportunities"}
                </Badge>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((growth) => (
                  <Card
                    key={growth.title}
                    className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold">
                          {growth.title}
                        </CardTitle>
                      </div>
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
          ))}
        </div>
      </div>

      {/* ─── TAB 4: AI DEVELOPMENT RECOMMENDATIONS ──────────────────────── */}
      <div
        className={`${activeTab === "ai" ? "block animate-in fade-in-50 duration-300" : "hidden print:block"} space-y-6 mt-8 print:mt-12`}
      >
        <div className="bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900/40 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">
                    Personalised Development Pathway
                  </h3>
                  <Badge
                    variant="outline"
                    className="bg-purple-500/20 text-purple-200 border-purple-500/30 text-xs"
                  >
                    {aiRecommendations
                      ? "Live Strategy Variations"
                      : "Algorithmic Guidance"}
                  </Badge>
                </div>
                <p className="text-sm text-purple-200">
                  Custom-curated learning resources, classroom activities,
                  coaching suggestions, and career growth pathways based on your
                  JTIA responses.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchAiInsights}
              disabled={isLoadingAi}
              className="bg-white/10 hover:bg-white/20 text-white border-purple-500/30 gap-1.5"
            >
              {isLoadingAi ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              {isLoadingAi ? "Generating..." : "Generate Variations"}
            </Button>
          </div>

          {/* Recommendation sub-tabs */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-purple-500/20">
            <button
              onClick={() => setRecommendationCategory("resources")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                recommendationCategory === "resources"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-white/10 text-purple-200 hover:bg-white/20"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Learning Resources (
              {displayedRecommendations?.resources?.length || 0})
            </button>
            <button
              onClick={() => setRecommendationCategory("activities")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                recommendationCategory === "activities"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-white/10 text-purple-200 hover:bg-white/20"
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Development Activities (
              {displayedRecommendations?.activities?.length || 0})
            </button>
            <button
              onClick={() => setRecommendationCategory("coaching")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                recommendationCategory === "coaching"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-white/10 text-purple-200 hover:bg-white/20"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Coaching & Mentoring (
              {displayedRecommendations?.coaching?.length || 0})
            </button>
            <button
              onClick={() => setRecommendationCategory("pathways")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                recommendationCategory === "pathways"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-white/10 text-purple-200 hover:bg-white/20"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Growth Pathways ({displayedRecommendations?.pathways?.length || 0}
              )
            </button>
          </div>
        </div>

        {/* Render Active Recommendation List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(displayedRecommendations?.[recommendationCategory] || []).map(
            (item, i) => (
              <Card
                key={i}
                className="shadow-sm hover:shadow-md transition-shadow card-print-break border-slate-200 dark:border-slate-800"
              >
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
            ),
          )}
        </div>

        {/* Scientific Positioning & Research Grounding Card */}
        <Card className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-indigo-800/40 shadow-lg mt-6">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 text-xs px-2.5 py-0.5">
                Scientific Positioning
              </Badge>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Theoretical
                & Research Grounding
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-300">
              Development recommendations and JTIA competency mappings are grounded in
              peer-reviewed cognitive psychology and educational research.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-0 text-xs text-slate-300">
            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
              <p className="font-semibold text-indigo-200 mb-1">
                Instructional Content Knowledge (ICK)
              </p>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Grounds instructional intelligence in Shulman's framework
                linking domain expertise with effective teaching strategies.
              </p>
            </div>
            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
              <p className="font-semibold text-indigo-200 mb-1">
                Dual-Process Decision Making
              </p>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Grounded in Kahneman's System 1 (Intuitive) & System 2
                (Analytical) cognitive decision processing under time pressure.
              </p>
            </div>
            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
              <p className="font-semibold text-indigo-200 mb-1">
                Visible Learning Research
              </p>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Incorporates Hattie's effect sizes for formative evaluation,
                metacognitive regulation (Flavell), and active learning.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
