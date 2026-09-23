import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { User, Assessment } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  BarChart, Bar
} from 'recharts';
import { 
  ArrowLeft, TrendingUp, BookOpen, Brain, Target, Lightbulb, FileText, Download,
  Radar as RadarIcon, BarChart3, Compass, LayoutGrid, CheckCircle2, AlertTriangle,
  AlertCircle, HelpCircle, RefreshCw, Zap, GraduationCap, School, Activity
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Textarea } from './ui/textarea';
import { formatDate } from '../utils/dateFormat';
import { generatePDF } from '../utils/pdfGenerator';
import { toast } from 'sonner';
import { diagnoseStudentRisk } from '../utils/riskDiagnostic';

interface StudentDetailViewProps {
  student: User;
  assessments: Assessment[];
  onBack: () => void;
  initialTab?: 'profile' | 'diagnostic' | 'strategies' | 'progress';
}

export function StudentDetailView({ student, assessments, onBack, initialTab = 'profile' }: StudentDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'diagnostic' | 'strategies' | 'progress'>(initialTab);
  const [isRefreshingDiagnostic, setIsRefreshingDiagnostic] = useState(false);
  const [diagnosticRefreshCount, setDiagnosticRefreshCount] = useState(0);

  const diagnostic = useMemo(() => {
    return diagnoseStudentRisk(student, assessments);
  }, [student, assessments, diagnosticRefreshCount]);

  const handleRefreshDiagnostic = () => {
    setIsRefreshingDiagnostic(true);
    setTimeout(() => {
      setDiagnosticRefreshCount(prev => prev + 1);
      setIsRefreshingDiagnostic(false);
      toast.success('Cognitive diagnostic updated with latest metrics.');
    }, 400);
  };

  const [teacherNotes, setTeacherNotes] = useState('');
  const [graphViewMode, setGraphViewMode] = useState<'radar' | 'bars' | 'quadrant' | 'breakdown'>('radar');

  // Get student's assessments
  const studentAssessments = assessments.filter(a => a.userId === student.id && (a.completed || a.completedAt || (a as any).status === 'completed'));
  
  const latestLearning = studentAssessments
    .filter(a => a.type === 'kolb' || (a.type as any) === 'learning')
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
  
  const latestThinking = studentAssessments
    .filter(a => ['sternberg', 'jhs-thinking', 'shs-thinking', 'adult-thinking', 'child-thinking'].includes(a.type))
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
  
  const latestDecision = studentAssessments
    .filter(a => a.type === 'dual-process' || (a.type as any) === 'decision')
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];

  const learningScore = latestLearning?.score?.kolb?.scores || (latestLearning?.score as any)?.learning?.scores || latestLearning?.score?.kolb || (latestLearning?.score as any)?.learning || {};
  const ce = Number(learningScore.CE ?? learningScore.concreteExperience ?? learningScore.ConcreteExperience ?? 0);
  const ro = Number(learningScore.RO ?? learningScore.reflectiveObservation ?? learningScore.ReflectiveObservation ?? 0);
  const ac = Number(learningScore.AC ?? learningScore.abstractConceptualization ?? learningScore.AbstractConceptualization ?? 0);
  const ae = Number(learningScore.AE ?? learningScore.activeExperimentation ?? learningScore.ActiveExperimentation ?? 0);

  // Prepare radar chart data for cognitive profile
  const cognitiveProfile = [
    { dimension: 'Concrete Experience', score: ce, fullMark: 48 },
    { dimension: 'Reflective Observation', score: ro, fullMark: 48 },
    { dimension: 'Abstract Concept', score: ac, fullMark: 48 },
    { dimension: 'Active Experiment', score: ae, fullMark: 48 }
  ];

  // Get personalized teaching recommendations
  const getTeachingStrategies = () => {
    const strategies: string[] = [];
    
    if (latestLearning) {
      const style = latestLearning.score?.kolb?.style || (latestLearning.score as any)?.learning?.style;
      switch (style) {
        case 'Diverging':
          strategies.push(
            'Encourage group discussions and collaborative projects',
            'Use brainstorming sessions to explore multiple perspectives',
            'Provide opportunities for reflection through journals or discussions',
            'Connect learning to personal experiences and emotions',
            'Allow time for observation before asking for action'
          );
          break;
        case 'Assimilating':
          strategies.push(
            'Present information in logical, organized frameworks',
            'Provide reading materials and time for independent study',
            'Use diagrams, models, and theoretical explanations',
            'Encourage note-taking and systematic organization',
            'Allow time for deep thinking and analysis'
          );
          break;
        case 'Converging':
          strategies.push(
            'Focus on practical applications and problem-solving',
            'Use simulations, experiments, and technical tasks',
            'Provide clear objectives and step-by-step processes',
            'Encourage hypothesis testing and logical reasoning',
            'Offer opportunities to apply theories to real situations'
          );
          break;
        case 'Accommodating':
          strategies.push(
            'Incorporate hands-on activities and experiments',
            'Allow learning through trial and error',
            'Use real-world examples and practical demonstrations',
            'Encourage active participation and movement',
            'Provide immediate feedback and opportunities to adjust'
          );
          break;
      }
    }

    if (latestThinking) {
      let style = '';
      if (latestThinking.type === 'sternberg') {
        style = latestThinking.score.sternberg?.style;
      } else if (latestThinking.type === 'jhs-thinking') {
        const primaryKey = latestThinking.score['jhs-thinking']?.primaryStyle;
        style = primaryKey ? primaryKey.charAt(0).toUpperCase() + primaryKey.slice(1) : '';
      } else if (latestThinking.type === 'shs-thinking') {
        style = latestThinking.score['shs-thinking']?.primaryStyle || '';
      } else if (latestThinking.type === 'adult-thinking') {
        style = latestThinking.score['adult-thinking']?.dominantStyle || '';
      } else if (latestThinking.type === 'child-thinking') {
        style = latestThinking.score['child-thinking']?.primaryStyle || '';
      }

      switch (style) {
        case 'Analytical':
        case 'analytical':
          strategies.push(
            'Present challenging analytical problems to solve',
            'Encourage critical evaluation and comparison',
            'Use debates and structured arguments'
          );
          break;
        case 'Creative':
        case 'creative':
          strategies.push(
            'Offer open-ended projects with creative freedom',
            'Encourage innovative solutions and imagination',
            'Value novel approaches even if unconventional'
          );
          break;
        case 'Practical':
        case 'practical':
          strategies.push(
            'Connect lessons to everyday life applications',
            'Use case studies and real-world scenarios',
            'Emphasize practical skills and useful knowledge'
          );
          break;
        case 'Reflective':
        case 'reflective':
            strategies.push(
              'Allow time for observation and thinking before action',
              'Use journaling and self-reflection exercises',
              'Connect learning to past experiences'
            );
            break;
      }
    }

    return strategies;
  };

  // Get areas for support
  const getAreasForSupport = () => {
    const areas: string[] = [];
    
    if (latestLearning) {
      const dimensions = [
        { name: 'Concrete Experience', score: ce },
        { name: 'Reflective Observation', score: ro },
        { name: 'Abstract Conceptualization', score: ac },
        { name: 'Active Experimentation', score: ae }
      ];
      
      const weakest = dimensions.sort((a, b) => a.score - b.score)[0];
      
      if (weakest.score < 25) {
        switch (weakest.name) {
          case 'Concrete Experience':
            areas.push('May need more connection to real-world experiences and emotional engagement');
            break;
          case 'Reflective Observation':
            areas.push('Could benefit from more time to reflect and observe before acting');
            break;
          case 'Abstract Conceptualization':
            areas.push('May need support with theoretical thinking and systematic analysis');
            break;
          case 'Active Experimentation':
            areas.push('Could use more hands-on practice and active application opportunities');
            break;
        }
      }
    }

    if (latestDecision) {
      const style = latestDecision.score?.dualProcess?.style || (latestDecision.score as any)?.decision?.style || latestDecision.score?.['dual-process']?.style;
      if (style === 'Intuitive Dominant') {
        areas.push('Encourage more analytical reasoning and evidence-based decision-making');
      } else if (style === 'Reflective Dominant') {
        areas.push('Help develop confidence in intuitive responses when quick decisions are needed');
      }
    }

    return areas.length > 0 ? areas : ['Continue supporting balanced cognitive development across all areas'];
  };

  const teachingStrategies = getTeachingStrategies();
  const areasForSupport = getAreasForSupport();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Students
        </Button>
      </div>

      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-2xl">{student.name}</CardTitle>
                <Badge className={`text-xs font-semibold ${
                  diagnostic.riskLevel === 'high' 
                    ? 'bg-rose-100 text-rose-800 border-rose-300' 
                    : diagnostic.riskLevel === 'medium' 
                      ? 'bg-amber-100 text-amber-800 border-amber-300' 
                      : diagnostic.riskLevel === 'low' 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                        : 'bg-slate-100 text-slate-700'
                }`}>
                  {diagnostic.riskLevel === 'high' ? 'Priority Support' : diagnostic.riskLevel === 'medium' ? 'Needs Support' : diagnostic.riskLevel === 'low' ? 'On Track' : 'Unassessed'}
                </Badge>
              </div>
              <CardDescription className="text-sm mt-1">
                Engagement Velocity: {diagnostic.metrics.engagementScore}/100 · Focus: {diagnostic.primaryRiskFactor}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {activeTab !== 'diagnostic' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setActiveTab('diagnostic')}
                  className="bg-white hover:bg-slate-50 text-xs font-semibold border-indigo-200 text-indigo-700 shadow-2xs"
                >
                  <Zap className="w-3.5 h-3.5 mr-1 text-amber-500" />
                  View Diagnostic
                </Button>
              )}
              <Badge variant="outline" className="text-xs px-3 py-1.5 bg-white/80">
                {studentAssessments.length} Assessment{studentAssessments.length !== 1 ? 's' : ''} Completed
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
          <TabsTrigger value="profile" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Cognitive Profile</span>
            <span className="sm:hidden">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="diagnostic" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Diagnostic Evaluation</span>
            <span className="sm:hidden">Diagnostic</span>
          </TabsTrigger>
          <TabsTrigger value="strategies" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Teaching Strategies</span>
            <span className="sm:hidden">Strategies</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Progress & Notes</span>
            <span className="sm:hidden">Progress</span>
          </TabsTrigger>
        </TabsList>

        {/* Cognitive Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  Learning Style
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestLearning ? (
                  <div className="space-y-2">
                    <Badge className="text-base px-3 py-1">
                      {latestLearning.score.kolb?.style || (latestLearning.score as any).learning?.style}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Assessed on {formatDate(latestLearning.completedAt!)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not yet assessed</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Thinking Style
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestThinking ? (
                  <div className="space-y-2">
                    <Badge className="text-base px-3 py-1">
                      {(() => {
                        if (latestThinking.type === 'sternberg') return latestThinking.score.sternberg?.style;
                        if (latestThinking.type === 'jhs-thinking') {
                          const s = latestThinking.score['jhs-thinking']?.primaryStyle;
                          return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Assessed';
                        }
                        if (latestThinking.type === 'shs-thinking') return latestThinking.score['shs-thinking']?.primaryStyle || 'Assessed';
                        if (latestThinking.type === 'adult-thinking') {
                            const s = latestThinking.score['adult-thinking']?.dominantStyle;
                            return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Assessed';
                        }
                        if (latestThinking.type === 'child-thinking') return latestThinking.score['child-thinking']?.primaryStyle || 'Assessed';
                        return 'Unknown';
                      })()}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Assessed on {formatDate(latestThinking.completedAt!)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not yet assessed</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  Decision Style
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestDecision ? (
                  <div className="space-y-2">
                    <Badge className="text-base px-3 py-1">
                      {(latestDecision.score as any).dualProcess?.style || (latestDecision.score as any).decision?.style || (latestDecision.score as any)['dual-process']?.style}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Assessed on {formatDate(latestDecision.completedAt!)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not yet assessed</p>
                )}
              </CardContent>
            </Card>
          </div>

          {latestLearning && (
            <Card className="shadow-xs border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3 pb-3">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Compass className="w-5 h-5 text-indigo-600" /> Experiential Learning Dimensions Interpretation
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Multidimensional cognitive analysis for {student.name}
                  </CardDescription>
                </div>

                {/* Graph Interpretation Mode Switcher */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setGraphViewMode('radar')}
                    className={`p-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      graphViewMode === 'radar' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <RadarIcon className="w-3.5 h-3.5" /> Radar View
                  </button>
                  <button
                    onClick={() => setGraphViewMode('bars')}
                    className={`p-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      graphViewMode === 'bars' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" /> Capability Bars
                  </button>
                  <button
                    onClick={() => setGraphViewMode('quadrant')}
                    className={`p-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      graphViewMode === 'quadrant' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" /> 2D Continuum
                  </button>
                  <button
                    onClick={() => setGraphViewMode('breakdown')}
                    className={`p-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      graphViewMode === 'breakdown' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" /> Dimension Cards
                  </button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* 1. RADAR CHART VIEW */}
                {graphViewMode === 'radar' && (
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart data={cognitiveProfile}>
                      <PolarGrid stroke="#E2E8F0" />
                      <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: '#475569' }} />
                      <PolarRadiusAxis angle={90} domain={[0, 48]} tick={{ fontSize: 10 }} />
                      <Radar
                        name={student.name}
                        dataKey="score"
                        stroke="#4F46E5"
                        fill="#6366F1"
                        fillOpacity={0.5}
                      />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                )}

                {/* 2. HORIZONTAL CAPABILITY BARS VIEW */}
                {graphViewMode === 'bars' && (
                  <div className="space-y-4 py-2">
                    {cognitiveProfile.map(item => {
                      const pct = Math.round((item.score / item.fullMark) * 100);
                      const isHigh = pct >= 65;
                      const isLow = pct < 40;
                      return (
                        <div key={item.dimension} className="space-y-1.5 p-3 rounded-xl border bg-slate-50/50 dark:bg-slate-900/50">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              {item.dimension}
                              <Badge variant="outline" className={isHigh ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : isLow ? 'bg-amber-50 text-amber-700 border-amber-300' : 'text-slate-600'}>
                                {isHigh ? 'Strong Modality' : isLow ? 'Growth Focus' : 'Balanced'}
                              </Badge>
                            </span>
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                              {item.score} / {item.fullMark} ({pct}%)
                            </span>
                          </div>
                          <Progress value={pct} className={`h-2.5 ${isHigh ? 'bg-emerald-100' : isLow ? 'bg-amber-100' : 'bg-indigo-100'}`} />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 3. 2D EXPERIENTIAL CONTINUUM GRID */}
                {graphViewMode === 'quadrant' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200">
                      <strong>Kolb Experiential Continuum:</strong> Grasping axis: <em>Concrete (CE: {ce}) vs Abstract (AC: {ac})</em> • Processing axis: <em>Active (AE: {ae}) vs Reflective (RO: {ro})</em>.
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`p-4 rounded-xl border text-xs space-y-1 ${ce >= ac && ro >= ae ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                        <div className="font-bold text-sm text-amber-900">1. Diverging Quadrant</div>
                        <p className="text-slate-600">Concrete Experience + Reflective Observation</p>
                        <p className="text-[11px] text-slate-500">Excels in brainstorming, viewing situations from multiple perspectives.</p>
                      </div>

                      <div className={`p-4 rounded-xl border text-xs space-y-1 ${ac >= ce && ro >= ae ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                        <div className="font-bold text-sm text-blue-900">2. Assimilating Quadrant</div>
                        <p className="text-slate-600">Abstract Conceptualization + Reflective Observation</p>
                        <p className="text-[11px] text-slate-500">Excels in inductive reasoning, organizing ideas into clear concise models.</p>
                      </div>

                      <div className={`p-4 rounded-xl border text-xs space-y-1 ${ac >= ce && ae >= ro ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                        <div className="font-bold text-sm text-emerald-900">3. Converging Quadrant</div>
                        <p className="text-slate-600">Abstract Conceptualization + Active Experimentation</p>
                        <p className="text-[11px] text-slate-500">Excels in finding practical solutions and solving technical problems.</p>
                      </div>

                      <div className={`p-4 rounded-xl border text-xs space-y-1 ${ce >= ac && ae >= ro ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-400' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                        <div className="font-bold text-sm text-purple-900">4. Accommodating Quadrant</div>
                        <p className="text-slate-600">Concrete Experience + Active Experimentation</p>
                        <p className="text-[11px] text-slate-500">Excels in hands-on trial-and-error, adapting quickly to new challenges.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. DETAILED DIMENSION BREAKDOWN CARDS */}
                {graphViewMode === 'breakdown' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800 dark:text-white">Concrete Experience (CE)</span>
                        <Badge variant="outline">{ce} / 48</Badge>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Learning by experiencing: Relies on feelings, personal involvement, and real-life human interactions.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800 dark:text-white">Reflective Observation (RO)</span>
                        <Badge variant="outline">{ro} / 48</Badge>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Learning by reflecting: Observes carefully before making judgements, viewing ideas from multiple sides.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800 dark:text-white">Abstract Conceptualization (AC)</span>
                        <Badge variant="outline">{ac} / 48</Badge>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Learning by thinking: Uses logic, ideas, systematic analysis, and theoretical structures to solve problems.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800 dark:text-white">Active Experimentation (AE)</span>
                        <Badge variant="outline">{ae} / 48</Badge>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Learning by doing: Shows willingness to take risks, try new techniques, and influence people or situations directly.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Diagnostic Evaluation Tab */}
        <TabsContent value="diagnostic" className="space-y-6">
          {/* Executive Overview Banner */}
          <div className={`p-5 rounded-2xl border-2 transition-all ${
            diagnostic.riskLevel === 'high' 
              ? 'bg-gradient-to-r from-rose-50 via-red-50 to-orange-50 border-rose-200' 
              : diagnostic.riskLevel === 'medium' 
                ? 'bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-amber-200' 
                : diagnostic.riskLevel === 'low'
                  ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border-emerald-200'
                  : 'bg-gradient-to-r from-slate-50 via-gray-50 to-zinc-50 border-slate-200'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl ${
                  diagnostic.riskLevel === 'high'
                    ? 'bg-rose-100 text-rose-700'
                    : diagnostic.riskLevel === 'medium'
                      ? 'bg-amber-100 text-amber-700'
                      : diagnostic.riskLevel === 'low'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-700'
                }`}>
                  {diagnostic.riskLevel === 'high' ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : diagnostic.riskLevel === 'medium' ? (
                    <AlertCircle className="w-6 h-6" />
                  ) : diagnostic.riskLevel === 'low' ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <HelpCircle className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={`text-xs font-bold uppercase tracking-wider ${
                      diagnostic.riskLevel === 'high'
                        ? 'bg-rose-600 text-white'
                        : diagnostic.riskLevel === 'medium'
                          ? 'bg-amber-600 text-white'
                          : diagnostic.riskLevel === 'low'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-600 text-white'
                    }`}>
                      {diagnostic.riskLevel === 'high' ? 'Priority Support Needed' : diagnostic.riskLevel === 'medium' ? 'Guided Support Recommended' : diagnostic.riskLevel === 'low' ? 'On Track & Thriving' : 'Baseline Pending'}
                    </Badge>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white/80 border text-slate-700">
                      {diagnostic.diagnosticConfidence}% Diagnostic Confidence
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      Evaluated {formatDate(diagnostic.diagnosedAt)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1.5 flex items-center gap-2">
                    {diagnostic.primaryRiskFactor}
                  </h3>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed max-w-3xl">
                    {diagnostic.pedagogicalSummary}
                  </p>
                </div>
              </div>

              <div className="flex flex-row md:flex-col gap-2 shrink-0">
                <Button 
                  size="sm" 
                  onClick={handleRefreshDiagnostic}
                  disabled={isRefreshingDiagnostic}
                  variant="outline"
                  className="bg-white hover:bg-slate-50 text-xs font-semibold border-slate-300"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshingDiagnostic ? 'animate-spin' : ''}`} />
                  {isRefreshingDiagnostic ? 'Updating...' : 'Refresh Diagnostic'}
                </Button>
                <div className="text-[11px] font-medium text-slate-500 text-center md:text-right">
                  Pathway: <span className="font-semibold text-slate-800">{diagnostic.learningPathway}</span>
                </div>
              </div>
            </div>

            {/* Quick Diagnostic Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200/70">
              <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Engagement Velocity</p>
                <p className="text-base font-extrabold text-slate-900 mt-0.5">
                  {diagnostic.metrics.engagementScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
                </p>
              </div>

              <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Profile Triangulation</p>
                <p className="text-base font-extrabold text-slate-900 mt-0.5">
                  {diagnostic.metrics.completedCount} <span className="text-xs font-normal text-slate-500">/ 3 modules</span>
                </p>
              </div>

              <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Activity Recency</p>
                <p className="text-base font-extrabold text-slate-900 mt-0.5">
                  {diagnostic.metrics.daysSinceLastActive >= 999 ? 'No Activity' : `${diagnostic.metrics.daysSinceLastActive} days ago`}
                </p>
              </div>

              <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Experiential Balance</p>
                <p className="text-base font-extrabold text-slate-900 mt-0.5">
                  {diagnostic.metrics.experientialBalanceScore !== undefined ? `${diagnostic.metrics.experientialBalanceScore}%` : 'Uncalibrated'}
                </p>
              </div>
            </div>
          </div>

          {/* Root-Cause Determination Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                Cognitive Root-Cause Analysis
              </h3>
              <Badge variant="outline" className="text-xs font-medium text-slate-600 ml-auto">
                {diagnostic.rootCauses.length} Factor{diagnostic.rootCauses.length !== 1 ? 's' : ''} Identified
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {diagnostic.rootCauses.map((rc, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-xl border bg-white shadow-xs space-y-2.5 ${
                    rc.severity === 'critical' 
                      ? 'border-rose-200 border-l-4 border-l-rose-500' 
                      : rc.severity === 'moderate'
                        ? 'border-amber-200 border-l-4 border-l-amber-500'
                        : rc.severity === 'positive'
                          ? 'border-emerald-200 border-l-4 border-l-emerald-500'
                          : 'border-slate-200 border-l-4 border-l-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-slate-900">{rc.title}</span>
                    <Badge className={`text-[10px] uppercase font-semibold ${
                      rc.severity === 'critical'
                        ? 'bg-rose-100 text-rose-800'
                        : rc.severity === 'moderate'
                          ? 'bg-amber-100 text-amber-800'
                          : rc.severity === 'positive'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-800'
                    }`}>
                      {rc.severity}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-900">Cognitive Dynamic: </span>
                    {rc.explanation}
                  </div>

                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">Classroom Impact: </span>
                    {rc.impactOnLearning}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prescriptive Interventions & Action Plan */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">
                Prescriptive Interventions & Remediation
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Teacher Column */}
              <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 pb-2.5 border-b border-blue-100 mb-3">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider">Instructional Strategies (Teacher)</h4>
                  </div>
                  <div className="space-y-2.5">
                    {diagnostic.interventions.filter(i => i.target === 'Teacher').length > 0 ? (
                      diagnostic.interventions.filter(i => i.target === 'Teacher').map((item, idx) => (
                        <div key={idx} className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-100/70 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-blue-900">Targeted Accommodation</span>
                            <Badge className={`text-[9px] ${item.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                              {item.priority}
                            </Badge>
                          </div>
                          <p className="text-slate-800 font-medium">{item.action}</p>
                          <p className="text-[11px] text-blue-800 mt-1 italic">Rationale: {item.rationale}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">Continue standard differentiated instruction.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Student Column */}
              <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 pb-2.5 border-b border-purple-100 mb-3">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider">Metacognitive Habits (Student)</h4>
                  </div>
                  <div className="space-y-2.5">
                    {diagnostic.interventions.filter(i => i.target === 'Student').length > 0 ? (
                      diagnostic.interventions.filter(i => i.target === 'Student').map((item, idx) => (
                        <div key={idx} className="p-2.5 bg-purple-50/60 rounded-lg border border-purple-100/70 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-purple-900">Self-Regulation Action</span>
                            <Badge className={`text-[9px] ${item.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'}`}>
                              {item.priority}
                            </Badge>
                          </div>
                          <p className="text-slate-800 font-medium">{item.action}</p>
                          <p className="text-[11px] text-purple-800 mt-1 italic">Rationale: {item.rationale}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">Maintain active study habits and self-evaluation routines.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Institution / Counselor Column */}
              <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 pb-2.5 border-b border-indigo-100 mb-3">
                    <School className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Institutional Support (School)</h4>
                  </div>
                  <div className="space-y-2.5">
                    {diagnostic.interventions.filter(i => i.target === 'Counselor / School').length > 0 ? (
                      diagnostic.interventions.filter(i => i.target === 'Counselor / School').map((item, idx) => (
                        <div key={idx} className="p-2.5 bg-indigo-50/60 rounded-lg border border-indigo-100/70 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-indigo-900">Advisory Action</span>
                            <Badge className={`text-[9px] ${item.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-indigo-100 text-indigo-800'}`}>
                              {item.priority}
                            </Badge>
                          </div>
                          <p className="text-slate-800 font-medium">{item.action}</p>
                          <p className="text-[11px] text-indigo-800 mt-1 italic">Rationale: {item.rationale}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">No administrative or counselor escalation required.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Teaching Strategies Tab */}
        <TabsContent value="strategies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Personalized Teaching Strategies
              </CardTitle>
              <CardDescription>
                Evidence-based strategies tailored to {student.name}'s cognitive profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {teachingStrategies.length > 0 ? (
                <div className="space-y-3">
                  {teachingStrategies.map((strategy, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </div>
                      </div>
                      <p className="text-sm">{strategy}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    Complete assessments to receive personalized teaching strategies for {student.name}.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-600" />
                Areas for Additional Support
              </CardTitle>
              <CardDescription>
                Dimensions where {student.name} may need extra guidance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {areasForSupport.map((area, index) => (
                  <li key={index} className="flex gap-2 text-sm">
                    <span className="text-orange-600">•</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress & Notes Tab */}
        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Assessment History
              </CardTitle>
              <CardDescription>
                Track {student.name}'s assessment journey over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {studentAssessments.length > 0 ? (
                <div className="space-y-3">
                  {studentAssessments
                    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
                    .map((assessment) => (
                      <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">
                            {assessment.type === 'kolb' ? 'Learning Style' : 
                             ['sternberg', 'jhs-thinking', 'shs-thinking', 'adult-thinking', 'child-thinking'].includes(assessment.type) ? 
                               (assessment.type === 'jhs-thinking' ? 'JHS Thinking Style' :
                                assessment.type === 'shs-thinking' ? 'SHS Thinking Style' :
                                assessment.type === 'adult-thinking' ? 'Professional Thinking Style' :
                                assessment.type === 'child-thinking' ? 'Child Thinking Style' : 'Thinking Style') : 
                             'Decision Style'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(assessment.completedAt!)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge>
                            {(() => {
                              if (assessment.type === 'kolb') return assessment.score.kolb?.style;
                              if (assessment.type === 'sternberg') return assessment.score.sternberg?.style;
                              if (assessment.type === 'jhs-thinking') {
                                const s = assessment.score['jhs-thinking']?.primaryStyle;
                                return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Completed';
                              }
                              if (assessment.type === 'shs-thinking') return assessment.score['shs-thinking']?.primaryStyle || 'Completed';
                              if (assessment.type === 'adult-thinking') {
                                const s = assessment.score['adult-thinking']?.dominantStyle;
                                return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Completed';
                              }
                              if (assessment.type === 'child-thinking') return assessment.score['child-thinking']?.primaryStyle || 'Completed';
                              if ((assessment.type as any) === 'decision') return (assessment.score as any).decision?.style;
                              if (assessment.type === 'dual-process') return assessment.score['dual-process']?.style;
                              return 'Completed';
                            })()}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs flex items-center gap-1"
                            onClick={async () => {
                              toast.loading('Generating report...', { id: 'pdf-gen' });
                              try {
                                await generatePDF(assessment, student.name, null, true);
                                toast.success('Report downloaded', { id: 'pdf-gen' });
                              } catch (error) {
                                toast.error('Failed to generate report', { id: 'pdf-gen' });
                              }
                            }}
                          >
                            <Download className="w-3 h-3" />
                            Export PDF
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No assessments completed yet
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Teacher Notes & Observations
              </CardTitle>
              <CardDescription>
                Record your observations and notes about {student.name}'s progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your observations, notes, or strategies that have worked well..."
                value={teacherNotes}
                onChange={(e) => setTeacherNotes(e.target.value)}
                rows={6}
              />
              <Button>Save Notes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
