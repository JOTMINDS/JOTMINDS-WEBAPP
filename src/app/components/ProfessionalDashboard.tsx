import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { User, Assessment } from '../types';
import { getUserAssessments } from '../utils/storage';
import { getAllAssessmentResults, getUserAssessmentResults } from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Building2, FileText, TrendingUp, LogOut, Eye, GraduationCap, Lightbulb, Brain, BarChart3, MessageSquare, Sparkles, RefreshCw, Clock } from 'lucide-react';
import { AssessmentTaking } from './AssessmentTaking';
import { AssessmentReport } from './AssessmentReport';
import { toast } from 'sonner';
import { ProfessionalAssessmentReport } from './ProfessionalAssessmentReport';
import { ProfessionalCognitiveAssessment, ProfessionalAssessmentResponses } from './ProfessionalCognitiveAssessment';
import { ProfessionalCognitiveResults } from './ProfessionalCognitiveResults';
import { calculateProfessionalCognitiveProfile, ProfessionalCognitiveProfile } from '../utils/professionalCognitiveScoring';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { FrameworkInfo } from './FrameworkInfo';
import { AssessmentHistory } from './AssessmentHistory';
import { ReflectionsViewer } from './ReflectionsViewer';
import { useAuth } from './AuthContext';
import { MobileHeaderMenu } from './MobileHeaderMenu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { formatDate } from '../utils/dateFormat';

interface ProfessionalDashboardProps {
  user: User;
  onLogout: () => void;
}

export function ProfessionalDashboard({ user, onLogout }: ProfessionalDashboardProps) {
  const { impersonatedUser } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [activeAssessment, setActiveAssessment] = useState<'kolb' | 'sternberg' | 'dual-process' | null>(null);
  const [viewingReport, setViewingReport] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [takingProfessionalCognitive, setTakingProfessionalCognitive] = useState(false);
  const [professionalCognitiveProfile, setProfessionalCognitiveProfile] = useState<ProfessionalCognitiveProfile | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadAssessments();
  }, [user.id, impersonatedUser]);

  const loadAssessments = async () => {
    setLoading(true);
    console.log('[ProfessionalDashboard] Fetching assessments from backend...');
    
    try {
      // Determine dominant style from scores
      const getDominantStyle = (scores: any) => {
        if (!scores || Object.keys(scores).length === 0) return 'Unknown';
        const entries = Object.entries(scores).sort((a: any, b: any) => b[1] - a[1]);
        return entries[0]?.[0] || 'Unknown';
      };
      
      // Check if this is an impersonated view (admin viewing someone's data) or regular user
      let results;
      if (impersonatedUser) {
        console.log('[ProfessionalDashboard] Impersonated user detected - using getUserAssessmentResults');
        const data = await getUserAssessmentResults(user.id);
        results = data.results;
      } else {
        console.log('[ProfessionalDashboard] Regular user - using getAllAssessmentResults');
        const data = await getAllAssessmentResults();
        results = data.results;
      }
      console.log(`[ProfessionalDashboard] Backend API returned ${results?.length || 0} assessments`);
      
      if (results && results.length > 0) {
        // DEBUG: Log raw results
        console.log('[ProfessionalDashboard] Raw results from backend:', results);
        
        // Convert API results to Assessment format
        const convertedAssessments: Assessment[] = results.map((result: any) => {
          console.log('[ProfessionalDashboard] Converting result:', { id: result.id, assessmentType: result.assessmentType });
          console.log('[ProfessionalDashboard] Raw result.results:', result.results);
          
          return {
            id: result.id,
            userId: user.id,
            type: result.assessmentType === 'learning' ? 'kolb' : 
                  result.assessmentType === 'thinking' ? 'sternberg' : 
                  result.assessmentType === 'decision' ? 'dual-process' :
                  result.assessmentType, // Use as-is if already in correct format
            score: {
              kolb: result.assessmentType === 'learning' || result.assessmentType === 'kolb' ? {
                primaryStyle: result.results?.kolb?.style || result.results?.style || getDominantStyle(result.results?.kolb?.scores || result.results?.scores || result.results),
                style: result.results?.kolb?.style || result.results?.style || getDominantStyle(result.results?.kolb?.scores || result.results?.scores || result.results),
                scores: result.results?.kolb?.scores || result.results?.scores || result.results || {}
              } : undefined,
              sternberg: result.assessmentType === 'thinking' || result.assessmentType === 'sternberg' ? {
                primaryStyle: result.results?.sternberg?.style || result.results?.style || getDominantStyle(result.results?.sternberg?.scores || result.results?.scores || result.results),
                style: result.results?.sternberg?.style || result.results?.style || getDominantStyle(result.results?.sternberg?.scores || result.results?.scores || result.results),
                scores: result.results?.sternberg?.scores || result.results?.scores || result.results || {}
              } : undefined,
              dualProcess: result.assessmentType === 'decision' || result.assessmentType === 'dual-process' ? {
                primaryStyle: result.results?.dualProcess?.style || result.results?.style || getDominantStyle(result.results?.dualProcess?.scores || result.results?.scores || result.results),
                style: result.results?.dualProcess?.style || result.results?.style || getDominantStyle(result.results?.dualProcess?.scores || result.results?.scores || result.results),
                scores: result.results?.dualProcess?.scores || result.results?.scores || result.results || {}
              } : undefined,
            },
            completed: true,
            completedAt: result.completedAt || new Date().toISOString(),
            createdAt: result.createdAt || new Date().toISOString(),
          };
        });
        
        console.log('[ProfessionalDashboard] Converted assessments:', convertedAssessments);
        console.log('[ProfessionalDashboard] Assessment types:', convertedAssessments.map(a => a.type));
        console.log('[ProfessionalDashboard] Successfully loaded assessments from backend');
        setAssessments(convertedAssessments);
        setLastUpdated(new Date());
        
        // Show success toast only on manual refresh
        if (isRefreshing) {
          toast.success(`Loaded ${convertedAssessments.length} assessment${convertedAssessments.length !== 1 ? 's' : ''}`);
        }
      } else {
        console.log('[ProfessionalDashboard] No assessments found in backend');
        setAssessments([]);
        setLastUpdated(new Date());
        
        if (isRefreshing) {
          toast.info('No assessments found');
        }
      }
    } catch (error) {
      console.error('[ProfessionalDashboard] Error loading assessments from backend:', error);
      toast.error('Failed to load assessments from backend. Using cached data.');
      
      // Fallback to localStorage
      console.log('[ProfessionalDashboard] Attempting localStorage fallback...');
      try {
        const userAssessments = getUserAssessments(user.id);
        console.log(`[ProfessionalDashboard] Loaded ${userAssessments.length} assessments from localStorage`);
        setAssessments(userAssessments);
        
        if (userAssessments.length > 0 && isRefreshing) {
          toast.info(`Showing ${userAssessments.length} cached assessment${userAssessments.length !== 1 ? 's' : ''}`);
        }
      } catch (fallbackError) {
        console.error('[ProfessionalDashboard] localStorage fallback failed:', fallbackError);
        setAssessments([]);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAssessments();
  };

  const hasCompletedAssessment = (type: 'kolb' | 'sternberg' | 'dual-process') => {
    return assessments.some(a => a.type === type);
  };

  const getLatestAssessment = (type: 'kolb' | 'sternberg' | 'dual-process') => {
    return assessments.filter(a => a.type === type).sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )[0];
  };

  const handleAssessmentComplete = (assessment: Assessment) => {
    loadAssessments();
    setActiveAssessment(null);
    setViewingReport(assessment);
  };

  const handleProfessionalCognitiveComplete = (responses: ProfessionalAssessmentResponses) => {
    const profile = calculateProfessionalCognitiveProfile(responses);
    setProfessionalCognitiveProfile(profile);
    setTakingProfessionalCognitive(false);
  };

  const getRadarData = () => {
    const kolbAssessment = getLatestAssessment('kolb');
    const sternbergAssessment = getLatestAssessment('sternberg');
    const dualProcessAssessment = getLatestAssessment('dual-process');

    if (!kolbAssessment || !sternbergAssessment || !dualProcessAssessment) {
      return [];
    }

    return [
      {
        dimension: 'Concrete Experience',
        score: kolbAssessment.score.kolb?.scores.CE || 0,
        category: 'Learning',
        maxScore: 48,
      },
      {
        dimension: 'Reflective Observation',
        score: kolbAssessment.score.kolb?.scores.RO || 0,
        category: 'Learning',
        maxScore: 48,
      },
      {
        dimension: 'Abstract Conceptualization',
        score: kolbAssessment.score.kolb?.scores.AC || 0,
        category: 'Learning',
        maxScore: 48,
      },
      {
        dimension: 'Active Experimentation',
        score: kolbAssessment.score.kolb?.scores.AE || 0,
        category: 'Learning',
        maxScore: 48,
      },
      {
        dimension: 'Analytical Thinking',
        score: sternbergAssessment.score.sternberg?.scores.analytical || 0,
        category: 'Thinking',
        maxScore: 48,
      },
      {
        dimension: 'Creative Thinking',
        score: sternbergAssessment.score.sternberg?.scores.creative || 0,
        category: 'Thinking',
        maxScore: 48,
      },
      {
        dimension: 'Practical Thinking',
        score: sternbergAssessment.score.sternberg?.scores.practical || 0,
        category: 'Thinking',
        maxScore: 48,
      },
      {
        dimension: 'Intuitive Decision',
        score: dualProcessAssessment.score.dualProcess?.scores.system1 || 0,
        category: 'Decision',
        maxScore: 48,
      },
      {
        dimension: 'Analytical Decision',
        score: dualProcessAssessment.score.dualProcess?.scores.system2 || 0,
        category: 'Decision',
        maxScore: 48,
      },
    ];
  };

  const getDetailedBarData = () => {
    const kolbAssessment = getLatestAssessment('kolb');
    const sternbergAssessment = getLatestAssessment('sternberg');
    const dualProcessAssessment = getLatestAssessment('dual-process');

    if (!kolbAssessment || !sternbergAssessment || !dualProcessAssessment) {
      return [];
    }

    return [
      {
        framework: 'Learning Agility',
        CE: kolbAssessment.score.kolb?.scores.CE || 0,
        RO: kolbAssessment.score.kolb?.scores.RO || 0,
        AC: kolbAssessment.score.kolb?.scores.AC || 0,
        AE: kolbAssessment.score.kolb?.scores.AE || 0,
      },
      {
        framework: 'Thinking Diversity',
        Analytical: sternbergAssessment.score.sternberg?.scores.analytical || 0,
        Creative: sternbergAssessment.score.sternberg?.scores.creative || 0,
        Practical: sternbergAssessment.score.sternberg?.scores.practical || 0,
      },
      {
        framework: 'Decision Intelligence',
        Intuitive: dualProcessAssessment.score.dualProcess?.scores.system1 || 0,
        Analytical: dualProcessAssessment.score.dualProcess?.scores.system2 || 0,
      },
    ];
  };

  const getCognitiveStrengthScore = () => {
    const data = getRadarData();
    if (data.length === 0) return 0;
    
    const total = data.reduce((sum, item) => sum + item.score, 0);
    const maxPossible = data.reduce((sum, item) => sum + item.maxScore, 0);
    return Math.round((total / maxPossible) * 100);
  };

  if (activeAssessment) {
    return (
      <AssessmentTaking
        userId={user.id}
        assessmentType={activeAssessment}
        userAge={user.age} // Pass user's age for age-appropriate questions (15-18 uses teen bank)
        onComplete={handleAssessmentComplete}
        onCancel={() => setActiveAssessment(null)}
        isOrganizational={true}
      />
    );
  }

  // Show Professional Cognitive Assessment if taking
  if (takingProfessionalCognitive) {
    return (
      <ProfessionalCognitiveAssessment
        onComplete={handleProfessionalCognitiveComplete}
        onBack={() => setTakingProfessionalCognitive(false)}
      />
    );
  }

  // Show Professional Cognitive Results if profile exists
  if (professionalCognitiveProfile) {
    return (
      <ProfessionalCognitiveResults
        profile={professionalCognitiveProfile}
        userName={user.name}
        userPosition={user.position}
        userLocation={user.organizationName}
        onBack={() => setProfessionalCognitiveProfile(null)}
      />
    );
  }

  const createCombinedAssessment = (): Assessment | null => {
    if (!hasCompletedAssessment('kolb') || !hasCompletedAssessment('sternberg') || !hasCompletedAssessment('dual-process')) {
      return null;
    }

    const kolbAssessment = getLatestAssessment('kolb');
    const sternbergAssessment = getLatestAssessment('sternberg');
    const dualProcessAssessment = getLatestAssessment('dual-process');

    // Create a combined assessment object
    return {
      id: 'combined',
      userId: user.id,
      type: 'kolb', // Keep type for compatibility
      completedAt: new Date().toISOString(),
      score: {
        kolb: kolbAssessment.score.kolb,
        sternberg: sternbergAssessment.score.sternberg,
        dualProcess: dualProcessAssessment.score.dualProcess
      },
      responses: []
    };
  };

  if (viewingReport) {
    // If all assessments are completed and viewing the combined report
    const allAssessmentsCompleted = hasCompletedAssessment('kolb') && 
      hasCompletedAssessment('sternberg') && 
      hasCompletedAssessment('dual-process');

    if (allAssessmentsCompleted && viewingReport.id === 'combined') {
      const combinedAssessment = createCombinedAssessment();
      if (combinedAssessment) {
        return (
          <ProfessionalAssessmentReport
            assessment={combinedAssessment}
            userName={user.name}
            userPosition={user.position}
            userOrganization={user.organizationName}
            onBack={() => setViewingReport(null)}
          />
        );
      }
    }

    return (
      <AssessmentReport
        assessment={viewingReport}
        userName={user.name}
        onBack={() => setViewingReport(null)}
        isOrganizational={true}
        userRole={user.role}
      />
    );
  }

  const radarData = getRadarData();
  const allAssessmentsCompleted = hasCompletedAssessment('kolb') && 
    hasCompletedAssessment('sternberg') && 
    hasCompletedAssessment('dual-process');

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="border-b bg-white/80 backdrop-blur-sm shadow-sm dark:bg-gray-950/80 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <TooltipProvider>
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-12 h-12 rounded-full gradient-aqua-violet flex items-center justify-center text-white text-xl font-bold cursor-pointer hover:opacity-90 transition-opacity">
                    {user.name.charAt(0)}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="p-4 max-w-xs bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.position}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
                      <p className="text-sm text-gray-800 dark:text-gray-200"><span className="text-muted-foreground">Organization:</span> {user.organizationName}</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200"><span className="text-muted-foreground">Type:</span> {user.organizationType}</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200"><span className="text-muted-foreground">Account:</span> Professional</p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#6B4C9A] via-[#7B61FF] to-[#5B7DB1] bg-clip-text text-transparent">JotMinds</h1>
                <p className="text-sm text-muted-foreground">{user.name} - {user.position}</p>
              </div>
            </div>
          </TooltipProvider>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            {/* Last Updated & Refresh */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mr-2">
              {lastUpdated && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Updated {Math.floor((Date.now() - lastUpdated.getTime()) / 1000)}s ago</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-8 px-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <FrameworkInfo userRole="professional" />
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu */}
          <MobileHeaderMenu onLogout={onLogout} userRole="professional" />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 max-w-5xl mx-auto gap-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="assessments" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Assessments</span>
              <span className="sm:hidden">Tests</span>
            </TabsTrigger>
            <TabsTrigger value="track-record" className="text-xs sm:text-sm">
              <span className="hidden md:inline">Track Record</span>
              <span className="md:hidden">Track</span>
            </TabsTrigger>
            <TabsTrigger value="reflections" className="text-xs sm:text-sm">
              <span className="hidden md:inline">Reflections</span>
              <span className="md:hidden">Notes</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm col-span-2 sm:col-span-1">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Feedback</span>
              <span className="sm:hidden">Feed</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Total Assessments</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assessments.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Organizational cognitive evaluations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Organization Type</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.organizationType}</div>
                  <p className="text-xs text-muted-foreground">
                    Industry classification
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Completion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round((assessments.length / 3) * 100)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Of available frameworks
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Cognitive Profile Overview */}
            {allAssessmentsCompleted && (
              <>
                {/* Overall Cognitive Strength Score */}
                <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50/50 via-cyan-50/30 to-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#6B4C9A]/10 to-[#7B61FF]/10 rounded-full blur-3xl" />
                  <CardHeader className="relative">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl mb-2">Cognitive Intelligence Score</CardTitle>
                        <CardDescription className="text-base">
                          Comprehensive evaluation across all three frameworks
                        </CardDescription>
                      </div>
                      <Button 
                        onClick={() => setViewingReport(createCombinedAssessment())}
                        className="bg-gradient-aqua-violet text-white hover:opacity-90"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Full Report
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Circular Progress Score */}
                      <div className="flex flex-col items-center justify-center p-8">
                        <div className="relative w-48 h-48">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="96"
                              cy="96"
                              r="88"
                              stroke="#E5E7EB"
                              strokeWidth="12"
                              fill="none"
                            />
                            <circle
                              cx="96"
                              cy="96"
                              r="88"
                              stroke="url(#gradient)"
                              strokeWidth="12"
                              fill="none"
                              strokeDasharray={`${(getCognitiveStrengthScore() / 100) * 553} 553`}
                              strokeLinecap="round"
                              className="transition-all duration-1000"
                            />
                            <defs>
                              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#6B4C9A" />
                                <stop offset="50%" stopColor="#7B61FF" />
                                <stop offset="100%" stopColor="#5B7DB1" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-bold bg-gradient-to-r from-[#6B4C9A] via-[#7B61FF] to-[#5B7DB1] bg-clip-text text-transparent">
                              {getCognitiveStrengthScore()}
                            </span>
                            <span className="text-sm text-muted-foreground">Overall Score</span>
                          </div>
                        </div>
                        <div className="mt-6 text-center">
                          <Badge variant="secondary" className="text-sm px-4 py-2">
                            {getCognitiveStrengthScore() >= 80 ? 'Exceptional' : 
                             getCognitiveStrengthScore() >= 70 ? 'Advanced' :
                             getCognitiveStrengthScore() >= 60 ? 'Proficient' :
                             getCognitiveStrengthScore() >= 50 ? 'Developing' : 'Emerging'} Performance
                          </Badge>
                        </div>
                      </div>

                      {/* Framework Breakdown */}
                      <div className="space-y-4">
                        {(() => {
                          const kolb = getLatestAssessment('kolb');
                          const sternberg = getLatestAssessment('sternberg');
                          const dualProcess = getLatestAssessment('dual-process');
                          
                          const learningTotal = Object.values(kolb?.score.kolb?.scores || {}).reduce((a: number, b: any) => a + b, 0);
                          const learningPercent = Math.round((learningTotal / 192) * 100);
                          
                          const thinkingTotal = Object.values(sternberg?.score.sternberg?.scores || {}).reduce((a: number, b: any) => a + b, 0);
                          const thinkingPercent = Math.round((thinkingTotal / 144) * 100);
                          
                          const decisionTotal = Object.values(dualProcess?.score.dualProcess?.scores || {}).reduce((a: number, b: any) => a + b, 0);
                          const decisionPercent = Math.round((decisionTotal / 96) * 100);

                          return (
                            <>
                              <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                      <GraduationCap className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="font-semibold">Learning Agility</p>
                                      <p className="text-xs text-muted-foreground">{kolb?.score.kolb?.style}</p>
                                    </div>
                                  </div>
                                  <span className="text-2xl font-bold text-blue-600">{learningPercent}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-1000"
                                    style={{ width: `${learningPercent}%` }}
                                  />
                                </div>
                                <div className="grid grid-cols-4 gap-2 mt-3">
                                  {Object.entries(kolb?.score.kolb?.scores || {}).map(([key, value]) => (
                                    <div key={key} className="text-center">
                                      <p className="text-xs text-muted-foreground">{key}</p>
                                      <p className="font-semibold text-sm">{value}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="bg-white rounded-lg p-4 border border-amber-200 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                      <Lightbulb className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                      <p className="font-semibold">Thinking Diversity</p>
                                      <p className="text-xs text-muted-foreground">{sternberg?.score.sternberg?.style}</p>
                                    </div>
                                  </div>
                                  <span className="text-2xl font-bold text-amber-600">{thinkingPercent}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className="bg-gradient-to-r from-amber-500 to-amber-600 h-2.5 rounded-full transition-all duration-1000"
                                    style={{ width: `${thinkingPercent}%` }}
                                  />
                                </div>
                                <div className="grid grid-cols-3 gap-2 mt-3">
                                  {Object.entries(sternberg?.score.sternberg?.scores || {}).map(([key, value]) => (
                                    <div key={key} className="text-center">
                                      <p className="text-xs text-muted-foreground capitalize">{key}</p>
                                      <p className="font-semibold text-sm">{value}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="bg-white rounded-lg p-4 border border-purple-200 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                      <Brain className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                      <p className="font-semibold">Decision Intelligence</p>
                                      <p className="text-xs text-muted-foreground">{dualProcess?.score.dualProcess?.style}</p>
                                    </div>
                                  </div>
                                  <span className="text-2xl font-bold text-purple-600">{decisionPercent}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2.5 rounded-full transition-all duration-1000"
                                    style={{ width: `${decisionPercent}%` }}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-3">
                                  {Object.entries(dualProcess?.score.dualProcess?.scores || {}).map(([key, value]) => (
                                    <div key={key} className="text-center">
                                      <p className="text-xs text-muted-foreground">{key === 'system1' ? 'Intuitive' : 'Analytical'}</p>
                                      <p className="font-semibold text-sm">{value}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Dimension Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-[#7B61FF]" />
                      Comprehensive Cognitive Dimensions
                    </CardTitle>
                    <CardDescription>
                      Detailed breakdown of all 9 cognitive dimensions across the three frameworks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={500}>
                      <BarChart data={radarData} layout="vertical" margin={{ left: 150, right: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis type="number" domain={[0, 48]} stroke="#6B7280" />
                        <YAxis type="category" dataKey="dimension" stroke="#6B7280" width={140} />
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: '#374151',
                            color: '#ffffff',
                            border: '1px solid #4B5563', 
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                          formatter={(value: any, name: string) => {
                            const percent = Math.round((value / 48) * 100);
                            return [`${value}/48 (${percent}%)`, 'Score'];
                          }}
                        />
                        <Bar 
                          dataKey="score" 
                          radius={[0, 8, 8, 0]}
                          fill="url(#barGradient)"
                        />
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#6B4C9A" />
                            <stop offset="50%" stopColor="#7B61FF" />
                            <stop offset="100%" stopColor="#5B7DB1" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Cognitive Balance Radar */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Multi-Dimensional Profile</CardTitle>
                      <CardDescription>Radar view of all cognitive dimensions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#E5E7EB" />
                          <PolarAngleAxis 
                            dataKey="dimension" 
                            tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }}
                          />
                          <PolarRadiusAxis 
                            angle={90} 
                            domain={[0, 48]} 
                            stroke="#D1D5DB"
                            tick={{ fontSize: 10 }}
                          />
                          <Radar 
                            name="Score" 
                            dataKey="score" 
                            stroke="#7B61FF" 
                            fill="#7B61FF" 
                            fillOpacity={0.5}
                            strokeWidth={2}
                          />
                          <RechartsTooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Cognitive Strengths</CardTitle>
                      <CardDescription>Your highest performing dimensions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {radarData
                          .sort((a, b) => b.score - a.score)
                          .slice(0, 5)
                          .map((dimension, index) => {
                            const percent = Math.round((dimension.score / dimension.maxScore) * 100);
                            const colors = [
                              'from-yellow-400 to-orange-500',
                              'from-blue-400 to-cyan-500',
                              'from-purple-400 to-pink-500',
                              'from-green-400 to-emerald-500',
                              'from-indigo-400 to-violet-500',
                            ];
                            return (
                              <div key={dimension.dimension} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${colors[index]} flex items-center justify-center text-white text-xs font-bold`}>
                                      {index + 1}
                                    </div>
                                    <span className="font-medium text-sm">{dimension.dimension}</span>
                                  </div>
                                  <span className="text-sm font-semibold text-muted-foreground">
                                    {dimension.score}/{dimension.maxScore}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`bg-gradient-to-r ${colors[index]} h-2 rounded-full transition-all duration-1000`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Optional: Professional Cognitive Assessment Invitation */}
                <Card className="border-2 border-gradient-to-r from-emerald-200 to-teal-200 dark:from-emerald-700 dark:to-teal-700 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20 overflow-hidden relative shadow-xl">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl" />
                  <CardHeader className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center animate-pulse">
                        <Sparkles className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <CardTitle className="text-xl sm:text-2xl">Unlock Your Professional Cognitive Profile</CardTitle>
                          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 text-xs">✨ Optional</Badge>
                        </div>
                        <CardDescription className="text-sm sm:text-base">
                          Take our streamlined 16-question assessment for a unified cognitive report
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative space-y-6">
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-5 border-2 border-emerald-200 dark:border-emerald-700">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                            <Brain className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm">Streamlined Experience</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Just 16 questions covering Learning, Thinking & Decision-Making</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                            <BarChart3 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm">Unified Report</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Get a single cohesive professional cognitive profile</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center flex-shrink-0">
                            <Lightbulb className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm">Career Insights</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Ideal roles, competency fit, and development tips</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm">5-10 Minutes</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Quick completion time with immediate results</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 rounded-lg p-4 border border-emerald-300 dark:border-emerald-600">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">✓</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm">Why Take This?</p>
                          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                            You've completed all 3 core assessments! This optional assessment provides an alternative, streamlined way to view your cognitive strengths through a professional lens—perfect for sharing with employers or career planning.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                      <Button
                        onClick={() => setTakingProfessionalCognitive(true)}
                        size="lg"
                        className="w-full sm:flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all"
                      >
                        <Sparkles className="mr-2 h-5 w-5" />
                        Start Professional Cognitive Assessment
                        <Brain className="ml-2 h-5 w-5" />
                      </Button>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <span className="hidden sm:inline">•</span>
                        <span>5-10 min</span>
                        <span>•</span>
                        <span>16 questions</span>
                        <span>•</span>
                        <span>Optional</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Latest Results Summary - Only show if NOT all completed */}
            {!allAssessmentsCompleted && (
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                      Learning Agility
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-lg">
                        {getLatestAssessment('kolb')?.score.kolb?.style}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-2">
                        Learning Agility Assessment
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-600" />
                      Thinking Diversity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-lg">
                        {getLatestAssessment('sternberg')?.score.sternberg?.style}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-2">
                        Thinking Diversity Assessment
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      Decision Intelligence
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-lg">
                        {getLatestAssessment('dual-process')?.score.dualProcess?.style}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-2">
                        Decision Intelligence Assessment
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="assessments" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-1">
              {/* Learning Agility Assessment */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-blue-600" />
                        Learning Agility Assessment
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Measures how you learn from experience, reflect, conceptualize, and apply ideas
                        <br />
                        <span className="text-xs">Discover how you learn</span>
                      </CardDescription>
                    </div>
                    {hasCompletedAssessment('kolb') && (
                      <Badge variant="secondary">Completed</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hasCompletedAssessment('kolb') ? (
                    <>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm">Your Learning Style: <strong>{getLatestAssessment('kolb')?.score.kolb?.style}</strong></p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last assessed: {formatDate(getLatestAssessment('kolb')?.completedAt || '')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => setActiveAssessment('kolb')}>
                          Retake Assessment
                        </Button>
                        <Button variant="outline" onClick={() => setViewingReport(getLatestAssessment('kolb'))}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Report
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button onClick={() => setActiveAssessment('kolb')}>
                      Start Learning Agility Assessment
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Thinking Diversity Assessment */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-amber-600" />
                        Thinking Diversity Assessment
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Evaluates analytical, creative, and practical thinking capabilities
                        <br />
                        <span className="text-xs">Understand how you think</span>
                      </CardDescription>
                    </div>
                    {hasCompletedAssessment('sternberg') && (
                      <Badge variant="secondary">Completed</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hasCompletedAssessment('sternberg') ? (
                    <>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm">Your Thinking Style: <strong>{getLatestAssessment('sternberg')?.score.sternberg?.style}</strong></p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last assessed: {formatDate(getLatestAssessment('sternberg')?.completedAt || '')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => setActiveAssessment('sternberg')}>
                          Retake Assessment
                        </Button>
                        <Button variant="outline" onClick={() => setViewingReport(getLatestAssessment('sternberg'))}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Report
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button onClick={() => setActiveAssessment('sternberg')}>
                      Start Thinking Diversity Assessment
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Decision Intelligence Assessment */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-600" />
                        Decision Intelligence Assessment
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Analyzes your balance between intuitive and analytical decision-making
                        <br />
                        <span className="text-xs">Learn how you make decisions</span>
                      </CardDescription>
                    </div>
                    {hasCompletedAssessment('dual-process') && (
                      <Badge variant="secondary">Completed</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hasCompletedAssessment('dual-process') ? (
                    <>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm">Your Decision Style: <strong>{getLatestAssessment('dual-process')?.score.dualProcess?.style}</strong></p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last assessed: {formatDate(getLatestAssessment('dual-process')?.completedAt || '')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => setActiveAssessment('dual-process')}>
                          Retake Assessment
                        </Button>
                        <Button variant="outline" onClick={() => setViewingReport(getLatestAssessment('dual-process'))}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Report
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button onClick={() => setActiveAssessment('dual-process')}>
                      Start Decision Intelligence Assessment
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="track-record" className="space-y-6">
            <AssessmentHistory 
              assessments={assessments}
              onViewReport={(assessment) => setViewingReport(assessment)}
            />
          </TabsContent>

          <TabsContent value="reflections" className="space-y-6">
            <ReflectionsViewer 
              userId={user.id}
              onViewAssessment={(assessment) => setViewingReport(assessment)}
            />
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <div className="max-w-3xl mx-auto">
              <Card className="border-2 border-[#6B4C9A] bg-gradient-to-br from-cyan-50 to-blue-50">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#6B4C9A] to-[#5B7DB1] flex items-center justify-center">
                      <MessageSquare className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl">Share Your Experience with JotMinds</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Your feedback helps us improve the platform for professionals, organizations, students, and educators across Ghana
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[#6B4C9A]" />
                      We'd love to hear from you about:
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="flex items-start gap-3 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                        <span className="text-[#6B4C9A] font-bold text-lg">•</span>
                        <span className="text-sm">How JotMinds supports your professional development</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-[#5B7DB1] font-bold text-lg">•</span>
                        <span className="text-sm">Insights gained about your cognitive strengths</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                        <span className="text-[#6B4C9A] font-bold text-lg">•</span>
                        <span className="text-sm">Application to your workplace and career</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-[#5B7DB1] font-bold text-lg">•</span>
                        <span className="text-sm">Relevance to Ghana's professional context</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                        <span className="text-[#6B4C9A] font-bold text-lg">•</span>
                        <span className="text-sm">Team and organizational applications</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-[#5B7DB1] font-bold text-lg">•</span>
                        <span className="text-sm">Suggestions for improvement</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#6B4C9A]/10 to-[#5B7DB1]/10 rounded-lg p-4 border border-[#6B4C9A]/30">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">✓</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">Your Professional Insights Matter</p>
                        <p className="text-sm text-gray-600">
                          As a professional, your feedback helps us create better cognitive assessment tools for Ghana's workforce and organizational development.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-4 pt-4">
                    <Button
                      onClick={() => window.open('https://forms.gle/SXPFj29PxUbmYVQq7', '_blank')}
                      size="lg"
                      className="w-full max-w-md bg-gradient-to-r from-[#6B4C9A] to-[#5B7DB1] hover:from-[#1AB5CC] hover:to-[#252770] text-white shadow-lg hover:shadow-xl transition-all"
                    >
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Complete Feedback Form
                      <Sparkles className="ml-2 h-5 w-5" />
                    </Button>
                    <p className="text-sm text-center text-muted-foreground">
                      Takes 2-3 minutes • Your responses are confidential
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 pt-4">
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-2xl font-bold text-[#6B4C9A]">2-3</p>
                      <p className="text-xs text-gray-600">Minutes to complete</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-2xl font-bold text-[#5B7DB1]">100%</p>
                      <p className="text-xs text-gray-600">Confidential</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}