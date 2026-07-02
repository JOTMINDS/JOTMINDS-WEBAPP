import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Assessment, UserRole } from '../types';
import { saveReflection, getReflections, generateId } from '../utils/storage';
import { getGhanaMapping, getStyleDescription } from '../utils/scoring';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { SternbergResults } from './SternbergResults';
import { BookOpen, Briefcase, Lightbulb, FileText, Download, ArrowLeft, TrendingUp, AlertTriangle, Target, Users, BarChart3, Share2, Eye, Brain, ChevronDown, ChevronUp, Printer } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import { getAssessmentInsights, AssessmentInsights } from '../utils/insights';
import { generateAIInsights, AIInsightsResponse } from '../utils/aiService';
import { toast } from 'sonner';
import { FeedbackPrompt } from './FeedbackPrompt';
import { formatDateTime } from '../utils/dateFormat';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, LabelList, Tooltip as RechartsTooltip } from 'recharts';
import { colors, componentSpacing } from '../utils/designTokens';
import { RadarChartWidget, prepareKolbRadarData, prepareSternbergRadarData, prepareDualProcessRadarData } from './RadarChartWidget';
import { PeerComparison, generatePeerComparisonData, defaultAverages } from './PeerComparison';
import { ProfileBadge } from './ProfileBadge';
import { StudyStrategyGenerator } from './StudyStrategyGenerator';
import { CareerRecommendations } from './CareerRecommendations';
import { GuidedReflection } from './GuidedReflection';
import { GhanaEducationGuidance } from './GhanaEducationGuidance';
import { AcademicSuccessTips } from './AcademicSuccessTips';
import { useEffect } from 'react';
import { getOrganizationalAssessmentText, getPersonalDevelopmentText, GLOBAL_DISCLAIMER } from '../utils/reportTextVariations';

interface AssessmentReportProps {
  assessment: Assessment;
  userName: string;
  onBack: () => void;
  isOrganizational?: boolean;
  userRole?: UserRole;
}

export function AssessmentReport({ assessment, userName, onBack, isOrganizational = false, userRole }: AssessmentReportProps) {
  const [reflection, setReflection] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('strengths');

  // Add defensive check for assessment data
  if (!assessment || !assessment.score) {
    console.error('Invalid assessment data:', assessment);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-4xl mx-auto py-8">
          <Card>
            <CardHeader>
              <CardTitle>Error Loading Results</CardTitle>
              <CardDescription>There was a problem loading your assessment results.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                The assessment data could not be loaded. This might be a temporary issue.
              </p>
              <Button onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const ghanaMapping = !isOrganizational ? getGhanaMapping(assessment.score) : null;

  const getReflectionPlaceholder = () => {
    switch (userRole) {
      case 'student':
        return "What insights did you gain from this profile? How will this help your studies?";
      case 'teacher':
        return "What insights did you gain from this profile? How will this help your teaching?";
      case 'parent':
        return "What insights did you gain from this profile? How will this help you support your child?";
      case 'professional':
        return "What insights did you gain from this profile? How will this help your work?";
      default:
        return "What insights did you gain from this profile? How will you use them?";
    }
  };

  const getReflectionDescription = () => {
    switch (userRole) {
      case 'student':
        return "Reflect on your results and how they relate to your learning journey.";
      case 'teacher':
        return "Reflect on how these insights connect to your teaching practice.";
      case 'parent':
        return "Share your thoughts on how this understanding can support your child.";
      case 'professional':
        return "Consider how you'll apply these insights in your professional role.";
      default:
        return "Take a moment to reflect on your results and what they mean for you.";
    }
  };

  const handleSaveReflection = () => {
    if (reflection.trim()) {
      saveReflection({
        id: generateId(),
        userId: assessment.userId,
        assessmentId: assessment.id,
        content: reflection,
        createdAt: new Date().toISOString(),
      });
      setReflectionSaved(true);
      setTimeout(() => setReflectionSaved(false), 3000);
    }
  };

  const handleDownloadPDF = async () => {
    await generatePDF(assessment, userName, ghanaMapping, isOrganizational);
    toast.success('PDF downloaded successfully!');
  };

  const handlePrint = () => {
    window.print();
    toast.success('Opening print dialog...');
  };

  const handleShareResults = async () => {
    const mainStyle = getMainStyle();
    const shareText = `I've completed my ${assessment.type === 'kolb' ? 'Learning Style' : assessment.type === 'sternberg' ? 'Thinking Style' : 'Decision Making Style'} assessment on JotMinds. My profile: ${mainStyle}`;
    
    // Check if Web Share API is available and supported
    if (navigator.share && navigator.canShare) {
      const shareData = {
        title: `${userName}'s Thinking Style Assessment`,
        text: shareText
      };
      
      // Check if the data can be shared
      if (navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          toast.success('Shared successfully!');
          return;
        } catch (error: any) {
          // User cancelled or permission denied
          if (error.name === 'AbortError') {
            // User cancelled, do nothing
            return;
          }
          // For other errors, fall back to clipboard
          console.log('Share API error, using fallback:', error.name);
        }
      }
    }
    
    // Fallback for browsers that don't support Web Share API or if sharing failed
    fallbackShare(shareText);
  };

  const fallbackShare = (shareText?: string) => {
    const textToShare = shareText || `Check out my Thinking Style Assessment on JotMinds - Discover How You Think`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToShare).then(() => {
        toast.success('Assessment summary copied to clipboard!');
      }).catch((err) => {
        console.error('Clipboard error:', err);
        showShareDialog(textToShare);
      });
    } else {
      showShareDialog(textToShare);
    }
  };

  const showShareDialog = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      toast.success('Assessment summary ready to share!');
    } catch (err) {
      toast.info('Share text: ' + text);
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const getChartData = () => {
    if (assessment.score.kolb) {
      return [
        { 
          name: 'Concrete Experience', 
          shortName: 'CE',
          value: assessment.score.kolb.scores.CE || 0,
          color: 'hsl(var(--chart-1))',
          description: 'Learning through feeling and experience'
        },
        { 
          name: 'Reflective Observation', 
          shortName: 'RO',
          value: assessment.score.kolb.scores.RO || 0,
          color: 'hsl(var(--chart-2))',
          description: 'Learning through watching and reflecting'
        },
        { 
          name: 'Abstract Conceptualization', 
          shortName: 'AC',
          value: assessment.score.kolb.scores.AC || 0,
          color: 'hsl(var(--chart-3))',
          description: 'Learning through thinking and analyzing'
        },
        { 
          name: 'Active Experimentation', 
          shortName: 'AE',
          value: assessment.score.kolb.scores.AE || 0,
          color: 'hsl(var(--chart-4))',
          description: 'Learning through doing and testing'
        },
      ];
    } else if (assessment.score.sternberg) {
      return [
        { 
          name: 'Analytical', 
          value: assessment.score.sternberg.scores.analytical || 0,
          color: 'hsl(var(--chart-1))',
          description: 'Critical thinking and problem analysis'
        },
        { 
          name: 'Creative', 
          value: assessment.score.sternberg.scores.creative || 0,
          color: 'hsl(var(--chart-2))',
          description: 'Innovation and imaginative thinking'
        },
        { 
          name: 'Practical', 
          value: assessment.score.sternberg.scores.practical || 0,
          color: 'hsl(var(--chart-3))',
          description: 'Real-world application and common sense'
        },
      ];
    } else if (assessment.score.dualProcess) {
      // Handle both naming conventions: system1/system2 (old) and Intuitive/Reflective (new from server)
      const scores = assessment.score.dualProcess.scores;
      const system1Score = scores.system1 || scores.Intuitive || 0;
      const system2Score = scores.system2 || scores.Reflective || 0;
      
      console.log('[AssessmentReport] Dual-Process scores:', {
        raw: scores,
        system1Score,
        system2Score
      });
      
      return [
        { 
          name: 'Intuitive (System 1)', 
          value: system1Score,
          color: 'hsl(var(--chart-1))',
          description: 'Fast, automatic, intuitive decisions'
        },
        { 
          name: 'Reflective (System 2)', 
          value: system2Score,
          color: 'hsl(var(--chart-2))',
          description: 'Slow, deliberate, analytical decisions'
        },
      ];
    } else if (assessment.score['jhs-thinking'] || assessment.score['shs-thinking'] || assessment.score['children-thinking']) {
      const scores = assessment.score['jhs-thinking']?.scores || assessment.score['shs-thinking']?.scores || assessment.score['children-thinking']?.scores || {};
      return [
        { name: 'Creative', value: scores.creative || 0, color: 'hsl(var(--chart-1))' },
        { name: 'Analytical', value: scores.analytical || 0, color: 'hsl(var(--chart-2))' },
        { name: 'Practical', value: scores.practical || 0, color: 'hsl(var(--chart-3))' },
        { name: 'Reflective', value: scores.reflective || 0, color: 'hsl(var(--chart-4))' }
      ].filter(item => item.value > 0);
    } else if (assessment.score['adult-thinking']) {
      const scores = assessment.score['adult-thinking'].scores || {};
      return [
        { name: 'Creative', value: scores.creative || 0, color: 'hsl(var(--chart-1))' },
        { name: 'Analytical', value: scores.analytical || 0, color: 'hsl(var(--chart-2))' },
        { name: 'Practical', value: scores.practical || 0, color: 'hsl(var(--chart-3))' },
        { name: 'Reflective', value: scores.reflective || 0, color: 'hsl(var(--chart-4))' }
      ].filter(item => item.value > 0);
    }
    return [];
  };

  const getMainStyle = () => {
    if (assessment.score.kolb) return assessment.score.kolb.style;
    if (assessment.score.sternberg) return assessment.score.sternberg.style;
    if (assessment.score.dualProcess) return assessment.score.dualProcess.style;
    if (assessment.score['jhs-thinking']) return assessment.score['jhs-thinking'].personalityType;
    if (assessment.score['shs-thinking']) return assessment.score['shs-thinking'].personalityType;
    if (assessment.score['children-thinking']) return assessment.score['children-thinking'].personalityType;
    if (assessment.score['adult-thinking']) return assessment.score['adult-thinking'].dominantStyle;
    return '';
  };

  const getReportTitle = () => {
    if (isOrganizational) {
      if (assessment.type === 'kolb') return 'Learning Agility Profile';
      if (assessment.type === 'sternberg') return 'Thinking Diversity Profile';
      if (assessment.type === 'dual-process') return 'Decision Intelligence Profile';
      if (assessment.type === 'adult-thinking') return 'Professional Thinking Profile';
    } else {
      if (assessment.type === 'kolb') return 'Your Learning Style Profile';
      if (assessment.type === 'sternberg') return 'Your Thinking Style Profile';
      if (assessment.type === 'dual-process') return 'Your Decision Style Profile';
      if (assessment.type === 'jhs-thinking') return 'JHS Thinking Style Profile';
      if (assessment.type === 'shs-thinking') return 'SHS Thinking Style Profile';
      if (assessment.type === 'adult-thinking') return 'Professional Thinking Profile';
      if (assessment.type === 'children-thinking') return 'Thinking Adventure Profile';
    }
    return 'Assessment Profile';
  };

  const mainStyle = getMainStyle();
  const styleDescription = getStyleDescription(assessment.type, mainStyle);
  const chartData = getChartData().filter(item => {
    // Filter out any items with NaN or undefined values
    return item.value !== undefined && !isNaN(item.value) && isFinite(item.value);
  });
  const reportTitle = getReportTitle();
  
  const [aiInsights, setAiInsights] = useState<AIInsightsResponse | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(true);
  
  // Rule-based fallback
  const fallbackInsights = getAssessmentInsights(assessment);

  useEffect(() => {
    async function fetchInsights() {
      setIsGeneratingAI(true);
      const generated = await generateAIInsights(assessment.score);
      if (generated) {
        setAiInsights(generated);
      }
      setIsGeneratingAI(false);
    }
    fetchInsights();
  }, [assessment.score]);

  // Use AI insights if available, otherwise fallback
  const insights = aiInsights || fallbackInsights;
  
  // Calculate max value for proper chart scaling
  const maxValue = Math.max(...chartData.map(item => item.value), 15); // minimum of 15 for visibility

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 dark:bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-700">
          <p className="font-semibold text-white mb-1">{payload[0].payload.name}</p>
          <p className="text-sm text-gray-300 mb-2">{payload[0].payload.description}</p>
          <p className="text-lg font-bold" style={{ color: payload[0].payload.color }}>
            Score: {payload[0].value}
          </p>
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all" 
                style={{ 
                  width: `${(payload[0].value / 100) * 100}%`,
                  backgroundColor: payload[0].payload.color 
                }}
              />
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom label for radar chart
  const CustomRadarLabel = ({ cx, cy, midAngle, outerRadius, payload }: any) => {
    // Ensure all values are valid numbers
    if (typeof cx !== 'number' || typeof cy !== 'number' || 
        typeof midAngle !== 'number' || typeof outerRadius !== 'number' ||
        isNaN(cx) || isNaN(cy) || isNaN(midAngle) || isNaN(outerRadius)) {
      return null;
    }

    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="hsl(var(--foreground))"
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {payload.shortName || payload.name}
      </text>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-violet-50 to-indigo-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Print-only header */}
        <div className="print-only print-header hidden">
          <div className="print-title">JOTMINDS COGNITIVE ASSESSMENT</div>
          <div className="print-subtitle">Personalized Assessment Report</div>
          <div className="print-meta">
            <strong>Name:</strong> {userName} | <strong>Date:</strong> {new Date(assessment.completedAt).toLocaleDateString()} | <strong>Assessment ID:</strong> {assessment.id}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 no-print">
          <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto">
              <Printer className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Print Report</span>
              <span className="sm:hidden">Print</span>
            </Button>
            <Button onClick={handleDownloadPDF} className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">Download</span>
            </Button>
            <Button onClick={handleShareResults} className="w-full sm:w-auto">
              <Share2 className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Share Results</span>
              <span className="sm:hidden">Share</span>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
              <div className="flex-1">
                <CardTitle className="text-lg sm:text-xl">{reportTitle}</CardTitle>
                <CardDescription className="text-sm">
                  Assessment completed on {formatDateTime(assessment.completedAt)}
                </CardDescription>
              </div>
              <Badge className="text-base sm:text-lg px-3 sm:px-4 py-1.5 sm:py-2 self-start">{mainStyle}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-muted-foreground">{styleDescription}</p>
            </div>

            <div>
              <h3 className="flex items-center gap-2 mb-6">
                <BarChart3 className="h-5 w-5" />
                Your Scores
              </h3>
              <div className="space-y-6">
                {assessment.type === 'kolb' ? (
                  <>
                    {/* Radar Chart */}
                    <div className="h-64 sm:h-80 md:h-96 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl p-2 sm:p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          layout="vertical"
                          margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                        >
                          <defs>
                            {chartData.map((item: any, index: number) => (
                              <linearGradient key={`kolb-gradient-def-${index}`} id={`kolb-gradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor={item.color} stopOpacity={0.8} />
                                <stop offset="100%" stopColor={item.color} stopOpacity={0.4} />
                              </linearGradient>
                            ))}
                          </defs>
                          <CartesianGrid
                            key="kolb-grid"
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            strokeOpacity={0.3}
                            horizontal={false}
                          />
                          <XAxis
                            key="kolb-x-axis"
                            type="number"
                            domain={[0, Math.ceil(maxValue * 1.2)]}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                            stroke="hsl(var(--border))"
                          />
                          <YAxis
                            key="kolb-y-axis-desktop"
                            type="category"
                            dataKey="shortName"
                            width={40}
                            tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
                            stroke="hsl(var(--border))"
                            className="hidden sm:block"
                          />
                          <YAxis
                            key="kolb-y-axis-mobile"
                            type="category"
                            dataKey="shortName"
                            width={35}
                            tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
                            stroke="hsl(var(--border))"
                            className="block sm:hidden"
                          />
                          <RechartsTooltip key="kolb-tooltip" content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} />
                          <Bar
                            key="kolb-bar"
                            dataKey="value"
                            radius={[0, 8, 8, 0]}
                            animationDuration={1500}
                            animationBegin={0}
                          >
                            {chartData.map((item: any, index: number) => (
                              <Cell key={`kolb-cell-${index}`} fill={`url(#kolb-gradient-${index})`} />
                            ))}
                            <LabelList
                              key="kolb-label-list"
                              dataKey="value"
                              position="right"
                              style={{ fill: 'hsl(var(--foreground))', fontWeight: 'bold', fontSize: 11 }}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Score bars with labels */}
                    <div className="grid grid-cols-1 gap-3">
                      {chartData.map((item: any, index: number) => {
                        const percentage = (item.value / maxValue) * 100;
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs sm:text-sm font-medium">{item.name}</span>
                              <span className="text-xs sm:text-sm font-bold" style={{ color: item.color }}>
                                {item.value}
                              </span>
                            </div>
                            <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden">
                              <div
                                className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                                style={{
                                  width: `${percentage}%`,
                                  background: `linear-gradient(to right, ${item.color}, ${item.color}dd)`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Modern Bar Chart - Improved for mobile with vertical orientation */}
                    <div className="h-64 sm:h-80 md:h-96 rounded-xl p-2 sm:p-4" style={{ background: colors.gradients.info }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          layout="vertical"
                          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                        >
                          <defs>
                            {chartData.map((item: any, index: number) => (
                              <linearGradient key={`other-gradient-def-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor={item.color} stopOpacity={0.9} />
                                <stop offset="100%" stopColor={item.color} stopOpacity={0.6} />
                              </linearGradient>
                            ))}
                          </defs>
                          <CartesianGrid
                            key="other-grid"
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            strokeOpacity={0.3}
                            horizontal={false}
                          />
                          <XAxis
                            key="other-x-axis"
                            type="number"
                            domain={[0, Math.ceil(maxValue * 1.2)]}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                            stroke="hsl(var(--border))"
                          />
                          <YAxis
                            key="other-y-axis"
                            type="category"
                            dataKey="name"
                            width={110}
                            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                            stroke="hsl(var(--border))"
                          />
                          <RechartsTooltip key="other-tooltip" content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} />
                          <Bar
                            key="other-bar"
                            dataKey="value"
                            radius={[0, 12, 12, 0]}
                            animationDuration={1500}
                            animationBegin={0}
                          >
                            {chartData.map((item: any, index: number) => (
                              <Cell key={`other-cell-${index}`} fill={`url(#gradient-${index})`} />
                            ))}
                            <LabelList
                              key="other-label-list"
                              dataKey="value"
                              position="right"
                              style={{ fill: 'hsl(var(--foreground))', fontWeight: 'bold', fontSize: 12 }}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Score cards - Standardized 20px padding */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {chartData.map((item: any, index: number) => (
                        <Card key={index} className="border-2 transition-all hover:shadow-md">
                          <CardContent style={{ padding: `${componentSpacing.cardPadding}px` }}>
                            <div className="space-y-2">
                              <div 
                                className="w-12 h-12 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `${item.color}20` }}
                              >
                                <span 
                                  className="text-xl font-bold"
                                  style={{ color: item.color }}
                                >
                                  {item.value}
                                </span>
                              </div>
                              <h4 className="font-semibold text-sm">{item.name}</h4>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-1000"
                                  style={{
                                    width: `${(item.value / 100) * 100}%`,
                                    backgroundColor: item.color,
                                  }}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Executive Summary */}
        <Card className="border-2 shadow-lg" style={{ borderColor: colors.info.border, background: colors.gradients.info }}>
          <CardHeader style={{ paddingBottom: `${componentSpacing.cardPadding}px` }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: colors.primary.main }}>
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2" style={{ color: colors.primary.main }}>
                  Executive Summary
                </CardTitle>
                <CardDescription className="text-base" style={{ color: colors.neutral.gray600 }}>
                  {isOrganizational 
                    ? 'At-a-glance overview for organizational assessment and talent development'
                    : 'Quick overview of your cognitive profile and key insights'
                  }
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent style={{ padding: `${componentSpacing.cardPadding}px`, display: 'flex', flexDirection: 'column', gap: `${componentSpacing.results.contentGap}px` }}>
            {/* Primary Profile */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-indigo-200 dark:border-indigo-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300">
                  <Target className="h-4 w-4" />
                  Primary Cognitive Profile
                </h4>
                <Badge variant="default" className="text-base px-3 py-1 bg-indigo-600">
                  {mainStyle}
                </Badge>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {styleDescription}
              </p>
            </div>

            {/* Key Metrics Grid - Standardized colors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Top Strength */}
              <div className="rounded-lg" style={{ 
                background: colors.success.bg, 
                border: `1px solid ${colors.success.border}`,
                padding: `${componentSpacing.cardPadding}px`
              }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: colors.success.main }}>
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <span style={{ color: colors.success.dark }}>Top Strength</span>
                </div>
                <p className="text-sm" style={{ color: colors.success.dark }}>
                  {insights.strengths[0]}
                </p>
              </div>

              {/* Priority Development */}
              <div className="rounded-lg" style={{ 
                background: colors.warning.bg, 
                border: `1px solid ${colors.warning.border}`,
                padding: `${componentSpacing.cardPadding}px`
              }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: colors.warning.main }}>
                    <AlertTriangle className="h-4 w-4 text-white" />
                  </div>
                  <span style={{ color: colors.warning.dark }}>Priority Area</span>
                </div>
                <p className="text-sm" style={{ color: colors.warning.dark }}>
                  {insights.weaknesses[0]}
                </p>
              </div>

              {/* Key Action */}
              <div className="rounded-lg" style={{ 
                background: colors.info.bg, 
                border: `1px solid ${colors.info.border}`,
                padding: `${componentSpacing.cardPadding}px`
              }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: colors.info.main }}>
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <span style={{ color: colors.info.dark }}>Key Action</span>
                </div>
                <p className="text-sm" style={{ color: colors.info.dark }}>
                  {insights.improvements[0]}
                </p>
              </div>
            </div>

            {isOrganizational && (
              <>
                {/* Organizational Fit Summary */}
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg space-y-2 border border-purple-200 dark:border-purple-700">
                  <h4 className="flex items-center gap-2 mb-3 text-[rgb(104,36,174)] dark:text-purple-200 text-[16px]">
                    <Users className="h-4 w-4" />
                    Organizational Fit Assessment
                  </h4>
                  <div className="space-y-2">
                    {insights.organizationalFit.slice(0, 2).map((fit, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                        <p className="text-sm text-[rgb(133,13,242)] dark:text-purple-300 flex-1">
                          {fit}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overall Recommendation */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-4 text-white">
                  <h4 className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-4 w-4" />
                    Overall Assessment
                  </h4>
                  <p className="text-sm opacity-95">
                    {getOrganizationalAssessmentText(assessment.type, mainStyle, insights.organizationalFit[0]?.split(':')[1]?.trim() || '')}
                  </p>
                </div>
              </>
            )}

            {!isOrganizational && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-4 text-white">
                <h4 className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4" />
                  Your Development Path
                </h4>
                <p className="text-sm opacity-95">
                  {getPersonalDevelopmentText(mainStyle, insights.improvements[0] || '')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insights and Analysis Section - Accordion for Mobile */}
        <Card>
          <CardHeader style={{ padding: `${componentSpacing.cardPadding}px` }}>
            <CardTitle className="flex items-center gap-2" style={{ color: colors.primary.main }}>
              <BarChart3 className="h-6 w-6" />
              {isOrganizational ? 'Professional Analysis' : 'Your Profile Analysis'}
            </CardTitle>
            <CardDescription>
              {isOrganizational 
                ? 'Comprehensive insights for talent assessment and development'
                : 'Understanding your strengths, areas for growth, and development path'
              }
            </CardDescription>
          </CardHeader>
          <CardContent style={{ padding: `${componentSpacing.cardPadding}px` }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${componentSpacing.spacing['2xl']}px` }}>
              {/* Key Strengths - Accordion Section */}
              <div>
                <button
                  onClick={() => setExpandedSection(expandedSection === 'strengths' ? null : 'strengths')}
                  className="w-full flex items-center justify-between rounded-lg p-4 transition-all hover:shadow-md"
                  style={{ 
                    background: colors.success.bg,
                    border: `2px solid ${colors.success.border}`
                  }}
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-6 w-6" style={{ color: colors.success.main }} />
                    <span className="font-semibold" style={{ color: colors.success.dark }}>Key Strengths</span>
                    <Badge variant="secondary" className="ml-2">{insights.strengths.length}</Badge>
                  </div>
                  {expandedSection === 'strengths' ? (
                    <ChevronUp className="h-5 w-5" style={{ color: colors.success.main }} />
                  ) : (
                    <ChevronDown className="h-5 w-5" style={{ color: colors.success.main }} />
                  )}
                </button>
                
                {expandedSection === 'strengths' && (
                  <div className="mt-3 rounded-lg p-4" style={{ 
                    background: colors.neutral.white,
                    border: `1px solid ${colors.success.border}`
                  }}>
                    {isGeneratingAI ? (
                      <div className="flex flex-col items-center justify-center p-8 space-y-4 animate-pulse">
                        <Brain className="w-12 h-12 text-primary/50 animate-bounce" />
                        <p className="text-muted-foreground font-medium">JotMinds AI is analyzing your profile...</p>
                        <div className="w-full max-w-sm bg-muted rounded-full h-2 overflow-hidden">
                          <div className="bg-primary h-full rounded-full w-2/3 animate-pulse"></div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-green-700 dark:text-green-400 flex items-center gap-2 mb-2">
                              <TrendingUp className="h-4 w-4" />
                              Key Strengths
                            </h4>
                            <ul className="space-y-2">
                              {insights.strengths.map((strength, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <span className="text-green-500 mt-0.5">•</span>
                                  <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2 mb-2 mt-4">
                              <AlertTriangle className="h-4 w-4" />
                              Areas for Growth
                            </h4>
                            <ul className="space-y-2">
                              {insights.weaknesses.map((weakness, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <span className="text-amber-500 mt-0.5">•</span>
                                  <span className="text-gray-700 dark:text-gray-300">{weakness}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4" />
                            Actionable Strategies
                          </h4>
                          <div className="space-y-3">
                            {insights.improvements.map((improvement, i) => (
                              <div key={i} className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm border border-blue-100 dark:border-blue-800/30">
                                <span className="text-gray-800 dark:text-gray-200">{improvement}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Areas for Development - Accordion Section */}
              <div>
                <button
                  onClick={() => setExpandedSection(expandedSection === 'development' ? null : 'development')}
                  className="w-full flex items-center justify-between rounded-lg p-4 transition-all hover:shadow-md"
                  style={{ 
                    background: colors.warning.bg,
                    border: `2px solid ${colors.warning.border}`
                  }}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6" style={{ color: colors.warning.main }} />
                    <span className="font-semibold" style={{ color: colors.warning.dark }}>Areas for Development</span>
                    <Badge variant="secondary" className="ml-2">{insights.weaknesses.length}</Badge>
                  </div>
                  {expandedSection === 'development' ? (
                    <ChevronUp className="h-5 w-5" style={{ color: colors.warning.main }} />
                  ) : (
                    <ChevronDown className="h-5 w-5" style={{ color: colors.warning.main }} />
                  )}
                </button>
                
                {expandedSection === 'development' && (
                  <div className="mt-3 rounded-lg p-4" style={{ 
                    background: colors.neutral.white,
                    border: `1px solid ${colors.warning.border}`
                  }}>
                    <ul className="space-y-3">
                      {insights.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="mt-1 flex-shrink-0" style={{ color: colors.warning.main, fontSize: '20px' }}>⚠</span>
                          <span className="text-sm" style={{ color: colors.neutral.gray700 }}>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Recommended Actions - Accordion Section */}
              <div>
                <button
                  onClick={() => setExpandedSection(expandedSection === 'actions' ? null : 'actions')}
                  className="w-full flex items-center justify-between rounded-lg p-4 transition-all hover:shadow-md"
                  style={{ 
                    background: colors.info.bg,
                    border: `2px solid ${colors.info.border}`
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Target className="h-6 w-6" style={{ color: colors.info.main }} />
                    <span className="font-semibold" style={{ color: colors.info.dark }}>Recommended Actions</span>
                    <Badge variant="secondary" className="ml-2">{insights.improvements.length}</Badge>
                  </div>
                  {expandedSection === 'actions' ? (
                    <ChevronUp className="h-5 w-5" style={{ color: colors.info.main }} />
                  ) : (
                    <ChevronDown className="h-5 w-5" style={{ color: colors.info.main }} />
                  )}
                </button>
                
                {expandedSection === 'actions' && (
                  <div className="mt-3 rounded-lg p-4" style={{ 
                    background: colors.neutral.white,
                    border: `1px solid ${colors.info.border}`
                  }}>
                    <ul className="space-y-3">
                      {insights.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="mt-1 flex-shrink-0" style={{ color: colors.info.main, fontSize: '20px' }}>→</span>
                          <span className="text-sm" style={{ color: colors.neutral.gray700 }}>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {isOrganizational && (
                <>
                  {/* Organizational Fit - Improved icons and spacing */}
                  <div>
                    <button
                      onClick={() => setExpandedSection(expandedSection === 'organizational' ? null : 'organizational')}
                      className="w-full flex items-center justify-between rounded-lg p-4 transition-all hover:shadow-md"
                      style={{ 
                        background: '#F5F3FF',
                        border: `2px solid #C4B5FD`
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Users className="h-6 w-6" style={{ color: '#7C3AED' }} />
                        <span className="font-semibold" style={{ color: '#6B21A8' }}>Organizational Fit & Role Alignment</span>
                      </div>
                      {expandedSection === 'organizational' ? (
                        <ChevronUp className="h-5 w-5" style={{ color: '#7C3AED' }} />
                      ) : (
                        <ChevronDown className="h-5 w-5" style={{ color: '#7C3AED' }} />
                      )}
                    </button>
                    
                    {expandedSection === 'organizational' && (
                      <div className="mt-3 rounded-lg space-y-2" style={{ 
                        background: colors.neutral.white,
                        border: `1px solid #C4B5FD`,
                        padding: `${componentSpacing.cardPadding}px`
                      }}>
                        {insights.organizationalFit.map((fit, index) => (
                          <p key={index} className="text-sm" style={{ color: colors.neutral.gray700 }}>
                            <strong>{fit.split(':')[0]}:</strong>
                            {fit.split(':')[1]}
                          </p>
                        ))}
                        <p className="text-xs mt-3" style={{ color: colors.neutral.gray500 }}>
                          Use this information to match candidates with appropriate roles or to optimize team composition 
                          based on cognitive diversity.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Continuous Review Points - Improved icons and spacing */}
                  <div>
                    <button
                      onClick={() => setExpandedSection(expandedSection === 'review' ? null : 'review')}
                      className="w-full flex items-center justify-between rounded-lg p-4 transition-all hover:shadow-md"
                      style={{ 
                        background: colors.primary.light,
                        border: `2px solid ${colors.info.border}`
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-6 w-6" style={{ color: colors.primary.main }} />
                        <span className="font-semibold" style={{ color: colors.primary.dark }}>Performance Review Indicators</span>
                      </div>
                      {expandedSection === 'review' ? (
                        <ChevronUp className="h-5 w-5" style={{ color: colors.primary.main }} />
                      ) : (
                        <ChevronDown className="h-5 w-5" style={{ color: colors.primary.main }} />
                      )}
                    </button>
                    
                    {expandedSection === 'review' && (
                      <div className="mt-3 rounded-lg space-y-2" style={{ 
                        background: colors.neutral.white,
                        border: `1px solid ${colors.info.border}`,
                        padding: `${componentSpacing.cardPadding}px`
                      }}>
                        {insights.continuousReview.map((review, index) => (
                          <p key={index} className="text-sm" style={{ color: colors.neutral.gray700 }}>
                            <strong>{review.split(':')[0]}:</strong>
                            {review.split(':')[1]}
                          </p>
                        ))}
                        <p className="text-xs mt-3" style={{ color: colors.neutral.gray500 }}>
                          Regular assessment helps track development progress, identify training needs, and ensure 
                          continued alignment with organizational goals.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {!isOrganizational && (
                <div className="rounded-lg" style={{ 
                  background: colors.gradients.info,
                  border: `1px solid ${colors.info.border}`,
                  padding: `${componentSpacing.cardPadding}px`
                }}>
                  <h4 className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-6 w-6" style={{ color: colors.info.main }} />
                    <span style={{ color: colors.neutral.gray700 }}>Personal Development Tip</span>
                  </h4>
                  <p className="text-sm" style={{ color: colors.neutral.gray700 }}>
                    Focus on leveraging your strengths while gradually working on your areas for development. 
                    Remember that cognitive styles aren't fixed – you can develop new capabilities over time through 
                    deliberate practice and diverse experiences.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {!isOrganizational && ghanaMapping && (
          <Card>
            <CardHeader style={{ padding: `${componentSpacing.cardPadding}px` }}>
              <CardTitle className="flex items-center gap-2" style={{ color: colors.primary.main }}>
                <BookOpen className="h-5 w-5" />
                Ghana Education Guidance
              </CardTitle>
            </CardHeader>
            <CardContent style={{ 
              padding: `${componentSpacing.cardPadding}px`, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: `${componentSpacing.results.sectionGap}px` 
            }}>
              <div>
                <h4 className="mb-2">Recommended SHS Tracks</h4>
                <div className="flex flex-wrap gap-2">
                  {ghanaMapping.shsTrack.map((track) => (
                    <Badge key={track} variant="secondary">
                      {track}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-2">Suggested Tertiary Focus Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {ghanaMapping.tertiaryFocus.map((area) => (
                    <Badge key={area} variant="outline">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="flex items-center gap-2 mb-2">
                  <Briefcase className="h-4 w-4" />
                  Career Suggestions
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {ghanaMapping.careerSuggestions.map((career) => (
                    <li key={career}>{career}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg" style={{ 
                background: colors.info.bg, 
                border: `1px solid ${colors.info.border}`,
                padding: `${componentSpacing.cardPadding}px`
              }}>
                <h4 className="flex items-center gap-2 mb-2" style={{ color: colors.info.dark }}>
                  <Lightbulb className="h-4 w-4" style={{ color: colors.info.main }} />
                  Development Path
                </h4>
                <p className="text-sm" style={{ color: colors.info.dark }}>{ghanaMapping.decisionTip}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {isOrganizational && (
          <Card>
            <CardHeader style={{ padding: `${componentSpacing.cardPadding}px` }}>
              <CardTitle className="flex items-center gap-2" style={{ color: colors.primary.main }}>
                <Briefcase className="h-5 w-5" />
                Organizational Insights
              </CardTitle>
            </CardHeader>
            <CardContent style={{ 
              padding: `${componentSpacing.cardPadding}px`, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: `${componentSpacing.results.sectionGap}px` 
            }}>
              <div>
                <h4 className="mb-2">Learning Agility Applications</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Apply your learning style to team collaboration and project management</li>
                  <li>Leverage your strengths when adapting to organizational changes</li>
                  <li>Develop strategies for continuous professional development</li>
                </ul>
              </div>

              <div>
                <h4 className="mb-2">Thinking Diversity Strengths</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Use your cognitive profile to contribute unique perspectives</li>
                  <li>Balance analytical, creative, and practical approaches in decision-making</li>
                  <li>Build complementary teams based on cognitive diversity</li>
                </ul>
              </div>

              <div className="rounded-lg" style={{ 
                background: colors.info.bg,
                padding: `${componentSpacing.cardPadding}px`
              }}>
                <h4 className="flex items-center gap-2 mb-2" style={{ color: colors.neutral.gray700 }}>
                  <Lightbulb className="h-4 w-4" style={{ color: colors.info.main }} />
                  Professional Development Tip
                </h4>
                <p className="text-sm" style={{ color: colors.neutral.gray600 }}>
                  Understanding your cognitive profile can help you communicate more effectively with colleagues who think differently, 
                  make better decisions under pressure, and create more innovative solutions to organizational challenges.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tertiary Student Enhancements - Only show for non-organizational assessments */}
        {!isOrganizational && (
          <>
            {/* Profile Badge */}
            {assessment.score.kolb && (
              <ProfileBadge
                style={mainStyle}
                level={0}
                totalScore={
                  (assessment.score.kolb.scores.CE || 0) +
                  (assessment.score.kolb.scores.RO || 0) +
                  (assessment.score.kolb.scores.AC || 0) +
                  (assessment.score.kolb.scores.AE || 0)
                }
                maxScore={60}
              />
            )}
            {assessment.score.sternberg && (
              <ProfileBadge
                style={mainStyle}
                level={0}
                totalScore={
                  (assessment.score.sternberg.scores.analytical || 0) +
                  (assessment.score.sternberg.scores.creative || 0) +
                  (assessment.score.sternberg.scores.practical || 0)
                }
                maxScore={60}
              />
            )}
            {assessment.score.dualProcess && (
              <ProfileBadge
                style={mainStyle}
                level={0}
                totalScore={
                  (assessment.score.dualProcess.scores.system1 || 0) +
                  (assessment.score.dualProcess.scores.system2 || 0)
                }
                maxScore={60}
              />
            )}

            {/* Radar Chart Visualization */}
            <Card>
              <CardContent className="pt-6">
                {assessment.score.kolb && (
                  <RadarChartWidget
                    data={prepareKolbRadarData(assessment.score.kolb.scores)}
                    title="Your Learning Profile Spectrum"
                    description="Visual representation of your learning dimensions"
                  />
                )}
                {assessment.score.sternberg && (
                  <RadarChartWidget
                    data={prepareSternbergRadarData(assessment.score.sternberg.scores)}
                    title="Your Thinking Style Spectrum"
                    description="Visual representation of your thinking dimensions"
                  />
                )}
                {assessment.score.dualProcess && (
                  <RadarChartWidget
                    data={prepareDualProcessRadarData(assessment.score.dualProcess.scores)}
                    title="Your Decision Style Spectrum"
                    description="Visual representation of your decision-making approach"
                  />
                )}
              </CardContent>
            </Card>

            {/* Peer Comparison */}
            <Card>
              <CardContent className="pt-6">
                {assessment.score.kolb && (
                  <PeerComparison
                    data={generatePeerComparisonData(
                      {
                        CE: assessment.score.kolb.scores.CE,
                        RO: assessment.score.kolb.scores.RO,
                        AC: assessment.score.kolb.scores.AC,
                        AE: assessment.score.kolb.scores.AE
                      },
                      defaultAverages.kolb
                    )}
                  />
                )}
                {assessment.score.sternberg && (
                  <PeerComparison
                    data={generatePeerComparisonData(
                      assessment.score.sternberg.scores,
                      defaultAverages.sternberg
                    )}
                  />
                )}
                {assessment.score.dualProcess && (
                  <PeerComparison
                    data={generatePeerComparisonData(
                      {
                        Intuitive: assessment.score.dualProcess.scores.system1,
                        Reflective: assessment.score.dualProcess.scores.system2
                      },
                      defaultAverages.dualProcess
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Academic Success Tips */}
            <AcademicSuccessTips
              cognitiveStyle={mainStyle}
              assessmentType={assessment.type}
            />

            {/* Study Strategy Generator */}
            <StudyStrategyGenerator
              cognitiveStyle={mainStyle}
              assessmentType={assessment.type}
            />

            {/* Career Recommendations */}
            <CareerRecommendations
              cognitiveStyle={mainStyle}
              assessmentType={assessment.type}
            />

            {/* Ghana Education Guidance */}
            <GhanaEducationGuidance
              cognitiveStyle={mainStyle}
              assessmentType={assessment.type}
            />

            {/* Guided Reflection */}
            <GuidedReflection
              cognitiveStyle={mainStyle}
              assessmentType={assessment.type}
              onSaveReflection={async (reflections) => {
                try {
                  // Combine all reflections into one content string
                  const content = Object.entries(reflections)
                    .map(([index, answer]) => `Q${parseInt(index) + 1}: ${answer}`)
                    .join('\n\n');
                  
                  const response = await fetch(`https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847/reflection`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${publicAnonKey}`
                    },
                    body: JSON.stringify({
                      content,
                      assessmentResultId: assessment.id
                    })
                  });
                  
                  if (!response.ok) {
                    throw new Error('Failed to save reflection');
                  }
                  
                  toast.success('Reflections saved successfully!');
                } catch (error) {
                  console.error('Error saving reflections:', error);
                  toast.error('Failed to save reflections. Please try again.');
                }
              }}
            />
          </>
        )}

        <Card>
          <CardHeader style={{ padding: `${componentSpacing.cardPadding}px` }}>
            <CardTitle className="flex items-center gap-2" style={{ color: colors.primary.main }}>
              <FileText className="h-5 w-5" />
              Personal Reflection
            </CardTitle>
            <CardDescription>
              {getReflectionDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent style={{ 
            padding: `${componentSpacing.cardPadding}px`, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: `${componentSpacing.results.contentGap}px` 
          }}>
            <div className="space-y-3">
              <Label htmlFor="reflection" className="text-sm font-medium" style={{ color: colors.neutral.gray700 }}>
                Your Reflection
              </Label>
              <Textarea
                id="reflection"
                placeholder={getReflectionPlaceholder()}
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                className="!resize-y !min-h-[100px] !max-h-[400px]"
                style={{ 
                  padding: '16px',
                  lineHeight: '1.6'
                }}
              />
              <p className="text-xs" style={{ color: colors.neutral.gray500 }}>
                💡 Tip: Start with a few sentences – the text box will expand as you type.
              </p>
            </div>
            <Button 
              onClick={handleSaveReflection} 
              disabled={!reflection.trim()}
              style={{ 
                backgroundColor: reflection.trim() ? colors.primary.main : colors.neutral.gray300,
                color: colors.neutral.white
              }}
            >
              {reflectionSaved ? '✓ Saved!' : 'Save Reflection'}
            </Button>
          </CardContent>
        </Card>

        <div className="no-print">
          <FeedbackPrompt />
        </div>

        <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 max-w-4xl mx-auto dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-400">
          <div className="text-center text-xs mb-4">
            {GLOBAL_DISCLAIMER}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex flex-col md:flex-row justify-between items-center text-xs">
            <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2 md:mb-0">
              JotMinds Learner Report
            </div>
            <div className="flex flex-col md:items-end gap-1">
              <span>Assessment Version: Student {assessment.ageGroup || '15-18'} v1.0</span>
              <span>Framework Version: Evidence-Informed Model v1.0</span>
              <span>Generated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}