import { useState } from 'react';
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
  Radar as RadarIcon, BarChart3, Compass, LayoutGrid, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Textarea } from './ui/textarea';
import { formatDate } from '../utils/dateFormat';
import { generatePDF } from '../utils/pdfGenerator';
import { toast } from 'sonner';

interface StudentDetailViewProps {
  student: User;
  assessments: Assessment[];
  onBack: () => void;
}

export function StudentDetailView({ student, assessments, onBack }: StudentDetailViewProps) {
  const [teacherNotes, setTeacherNotes] = useState('');
  const [graphViewMode, setGraphViewMode] = useState<'radar' | 'bars' | 'quadrant' | 'breakdown'>('radar');

  // Get student's assessments
  const studentAssessments = assessments.filter(a => a.userId === student.id && a.completed);
  
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{student.name}</CardTitle>
              <CardDescription className="text-base mt-1">
                Individual Learning Profile & Teaching Recommendations
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-base px-4 py-2">
              {studentAssessments.length} Assessment{studentAssessments.length !== 1 ? 's' : ''} Completed
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-1">
          <TabsTrigger value="profile" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Cognitive Profile</span>
            <span className="sm:hidden">Profile</span>
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
