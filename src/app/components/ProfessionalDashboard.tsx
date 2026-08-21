import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { User, Assessment } from '../types';
import { getUserAssessments } from '../utils/storage';
import { getAllAssessmentResults, getUserAssessmentResults } from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Building2, FileText, TrendingUp, LogOut, Eye, GraduationCap, Lightbulb, Brain, BarChart3, MessageSquare, Sparkles, RefreshCw, Clock, HelpCircle } from 'lucide-react';
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
import { DashboardLayout } from './ui/dashboard-layout';
import { NavGroup } from './ui/collapsible-sidebar';

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
  const [activeTab, setActiveTab] = useState('overview');
  const [showScoreExplainerModal, setShowScoreExplainerModal] = useState(false);

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
    return assessments.some(a => {
      const aType = a.type || (a as any).assessmentType;
      if (type === 'kolb') return aType === 'kolb' || aType === 'learning' || a.score?.kolb;
      if (type === 'sternberg') return aType === 'sternberg' || aType === 'thinking' || String(aType).includes('thinking') || a.score?.sternberg;
      if (type === 'dual-process') return aType === 'dual-process' || aType === 'decision' || a.score?.dualProcess;
      return false;
    });
  };

  const getLatestAssessment = (type: 'kolb' | 'sternberg' | 'dual-process') => {
    return assessments.filter(a => {
      const aType = a.type || (a as any).assessmentType;
      if (type === 'kolb') return aType === 'kolb' || aType === 'learning' || a.score?.kolb;
      if (type === 'sternberg') return aType === 'sternberg' || aType === 'thinking' || String(aType).includes('thinking') || a.score?.sternberg;
      if (type === 'dual-process') return aType === 'dual-process' || aType === 'decision' || a.score?.dualProcess;
      return false;
    }).sort((a, b) => 
      new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime()
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

    if (!kolbAssessment && !sternbergAssessment && !dualProcessAssessment) {
      return [];
    }

    const kolbScores = kolbAssessment?.score?.kolb?.scores || (kolbAssessment?.score as any)?.scores || {};
    const sternbergScores = sternbergAssessment?.score?.sternberg?.scores || (sternbergAssessment?.score as any)?.scores || {};
    const dualScores = dualProcessAssessment?.score?.dualProcess?.scores || (dualProcessAssessment?.score as any)?.scores || {};

    const allValues = [
      ...Object.values(kolbScores),
      ...Object.values(sternbergScores),
      ...Object.values(dualScores)
    ].filter(v => typeof v === 'number') as number[];

    const maxVal = allValues.length ? Math.max(...allValues) : 15;
    const dynamicDimMax = maxVal > 30 ? 48 : maxVal > 15 ? 30 : 15;

    return [
      {
        dimension: 'Concrete Experience',
        score: kolbScores?.CE || kolbScores?.ce || (kolbAssessment ? 10 : 0),
        category: 'Learning',
        maxScore: dynamicDimMax,
      },
      {
        dimension: 'Reflective Observation',
        score: kolbScores?.RO || kolbScores?.ro || (kolbAssessment ? 10 : 0),
        category: 'Learning',
        maxScore: dynamicDimMax,
      },
      {
        dimension: 'Abstract Conceptualization',
        score: kolbScores?.AC || kolbScores?.ac || (kolbAssessment ? 10 : 0),
        category: 'Learning',
        maxScore: dynamicDimMax,
      },
      {
        dimension: 'Active Experimentation',
        score: kolbScores?.AE || kolbScores?.ae || (kolbAssessment ? 10 : 0),
        category: 'Learning',
        maxScore: dynamicDimMax,
      },
      {
        dimension: 'Analytical Thinking',
        score: sternbergScores?.analytical || (sternbergAssessment ? 10 : 0),
        category: 'Thinking',
        maxScore: dynamicDimMax,
      },
      {
        dimension: 'Creative Thinking',
        score: sternbergScores?.creative || (sternbergAssessment ? 10 : 0),
        category: 'Thinking',
        maxScore: dynamicDimMax,
      },
      {
        dimension: 'Practical Thinking',
        score: sternbergScores?.practical || (sternbergAssessment ? 10 : 0),
        category: 'Thinking',
        maxScore: dynamicDimMax,
      },
      {
        dimension: 'Intuitive Decision',
        score: dualScores?.system1 || dualScores?.intuitive || (dualProcessAssessment ? 10 : 0),
        category: 'Decision',
        maxScore: dynamicDimMax,
      },
      {
        dimension: 'Analytical Decision',
        score: dualScores?.system2 || dualScores?.reflective || (dualProcessAssessment ? 10 : 0),
        category: 'Decision',
        maxScore: dynamicDimMax,
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
        CE: kolbAssessment?.score?.kolb?.scores?.CE || 0,
        RO: kolbAssessment?.score?.kolb?.scores?.RO || 0,
        AC: kolbAssessment?.score?.kolb?.scores?.AC || 0,
        AE: kolbAssessment?.score?.kolb?.scores?.AE || 0,
      },
      {
        framework: 'Thinking Diversity',
        Analytical: sternbergAssessment?.score?.sternberg?.scores?.analytical || 0,
        Creative: sternbergAssessment?.score?.sternberg?.scores?.creative || 0,
        Practical: sternbergAssessment?.score?.sternberg?.scores?.practical || 0,
      },
      {
        framework: 'Decision Intelligence',
        Intuitive: dualProcessAssessment?.score?.dualProcess?.scores?.system1 || 0,
        Analytical: dualProcessAssessment?.score?.dualProcess?.scores?.system2 || 0,
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
        kolb: kolbAssessment?.score?.kolb,
        sternberg: sternbergAssessment?.score?.sternberg,
        dualProcess: dualProcessAssessment?.score?.dualProcess
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

  const proNavGroups: NavGroup[] = [
    {
      groupLabel: 'Professional Portal',
      items: [
        { id: 'overview', label: 'Overview', icon: Building2 },
        { id: 'assessments', label: 'Framework Assessments', icon: FileText, badge: assessments.length },
        { id: 'track-record', label: 'Track Record', icon: TrendingUp },
        { id: 'reflections', label: 'Reflections & Notes', icon: Lightbulb },
        { id: 'feedback', label: 'Feedback & Support', icon: MessageSquare },
      ]
    }
  ];

  const proHeaderContent = (
    <div className="w-full flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
          {activeTab.replace('-', ' ')}
        </h2>
        {user.position && (
          <Badge variant="outline" className="border-indigo-600 text-indigo-700">
            {user.position}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        {lastUpdated && (
          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground mr-2">
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
          title="Refresh Dashboard Data"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
        <FrameworkInfo userRole="professional" />
      </div>
    </div>
  );

  return (
    <DashboardLayout
      navGroups={proNavGroups}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      user={user}
      onLogout={onLogout}
      brandSubtitle="Professional Portal"
      headerContent={proHeaderContent}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
                        <CardTitle className="text-2xl mb-1 text-slate-900">Cognitive Intelligence Score</CardTitle>
                        <CardDescription className="text-sm text-slate-600">
                          Comprehensive evaluation across all three psychometric frameworks
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline"
                          onClick={() => setShowScoreExplainerModal(true)}
                          className="bg-purple-50 text-purple-900 hover:bg-purple-100 border-purple-200 text-xs font-bold rounded-xl"
                        >
                          <HelpCircle className="w-3.5 h-3.5 mr-1 text-purple-600" />
                          Metrics Explained
                        </Button>
                        <Button 
                          onClick={() => setViewingReport(createCombinedAssessment())}
                          className="bg-[#6B4C9A] hover:bg-[#5A3B89] text-white font-black text-sm px-5 py-2.5 rounded-xl shadow-lg border border-purple-400 flex items-center gap-2 cursor-pointer"
                        >
                          <Eye className="h-4 w-4 text-white" />
                          <span>Full Report</span>
                        </Button>
                      </div>
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
                          
                          const kolbScores = kolb?.score?.kolb?.scores || (kolb?.score as any)?.scores || {};
                          const sternbergScores = sternberg?.score?.sternberg?.scores || (sternberg?.score as any)?.scores || {};
                          const dualScores = dualProcess?.score?.dualProcess?.scores || (dualProcess?.score as any)?.scores || {};

                          const learningValues = Object.values(kolbScores).filter(v => typeof v === 'number') as number[];
                          const thinkingValues = Object.values(sternbergScores).filter(v => typeof v === 'number') as number[];
                          const decisionValues = Object.values(dualScores).filter(v => typeof v === 'number') as number[];

                          const learningTotal = learningValues.reduce((a, b) => a + b, 0);
                          const maxSingleLearning = learningValues.length ? Math.max(...learningValues) : 0;
                          const learningDimMax = maxSingleLearning > 30 ? 48 : maxSingleLearning > 15 ? 30 : 15;
                          const maxPossibleLearning = Math.max(1, (learningValues.length || 4) * learningDimMax);
                          const learningPercent = Math.min(100, Math.max(10, Math.round((learningTotal / maxPossibleLearning) * 100)));

                          const thinkingTotal = thinkingValues.reduce((a, b) => a + b, 0);
                          const maxSingleThinking = thinkingValues.length ? Math.max(...thinkingValues) : 0;
                          const thinkingDimMax = maxSingleThinking > 30 ? 48 : maxSingleThinking > 15 ? 30 : 15;
                          const maxPossibleThinking = Math.max(1, (thinkingValues.length || 3) * thinkingDimMax);
                          const thinkingPercent = Math.min(100, Math.max(10, Math.round((thinkingTotal / maxPossibleThinking) * 100)));

                          const decisionTotal = decisionValues.reduce((a, b) => a + b, 0);
                          const maxSingleDecision = decisionValues.length ? Math.max(...decisionValues) : 0;
                          const decisionDimMax = maxSingleDecision > 30 ? 48 : maxSingleDecision > 15 ? 30 : 15;
                          const maxPossibleDecision = Math.max(1, (decisionValues.length || 2) * decisionDimMax);
                          const decisionPercent = Math.min(100, Math.max(10, Math.round((decisionTotal / maxPossibleDecision) * 100)));

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
                                      <p className="text-xs text-muted-foreground">{kolb?.score?.kolb?.style || 'Assessed'}</p>
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
                                  {Object.entries(kolbScores).map(([key, value]) => (
                                    <div key={key} className="text-center">
                                      <p className="text-xs text-muted-foreground">{key}</p>
                                      <p className="font-semibold text-sm">{String(value)}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                      <Lightbulb className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                      <p className="font-semibold">Thinking Diversity</p>
                                      <p className="text-xs text-muted-foreground">{sternberg?.score?.sternberg?.style || 'Assessed'}</p>
                                    </div>
                                  </div>
                                  <span className="text-2xl font-bold text-green-600">{thinkingPercent}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-1000"
                                    style={{ width: `${thinkingPercent}%` }}
                                  />
                                </div>
                                <div className="grid grid-cols-3 gap-2 mt-3">
                                  {Object.entries(sternbergScores).map(([key, value]) => (
                                    <div key={key} className="text-center">
                                      <p className="text-xs text-muted-foreground">{key}</p>
                                      <p className="font-semibold text-sm">{String(value)}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="bg-white rounded-lg p-4 border border-purple-200 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                      <TrendingUp className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                      <p className="font-semibold">Decision Intelligence</p>
                                      <p className="text-xs text-muted-foreground">{dualProcess?.score?.dualProcess?.style || 'Assessed'}</p>
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
                                  {Object.entries(dualScores).map(([key, value]) => (
                                    <div key={key} className="text-center">
                                      <p className="text-xs text-muted-foreground">{key === 'system1' ? 'Intuitive' : 'Analytical'}</p>
                                      <p className="font-semibold text-sm">{String(value)}</p>
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
                        <XAxis type="number" domain={[0, 'auto']} stroke="#6B7280" />
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
                            return [`${value} pts`, 'Score'];
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
                        {getLatestAssessment('kolb')?.score?.kolb?.style || 'Pending'}
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
                        {getLatestAssessment('sternberg')?.score?.sternberg?.style || 'Pending'}
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
                        {getLatestAssessment('dual-process')?.score?.dualProcess?.style || 'Pending'}
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
                        <p className="text-sm">Your Learning Style: <strong>{getLatestAssessment('kolb')?.score?.kolb?.style || 'N/A'}</strong></p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last assessed: {formatDate(getLatestAssessment('kolb')?.completedAt || '')}
                        </p>
                      </div>
                      <div className="flex gap-2">

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
                        <p className="text-sm">Your Thinking Style: <strong>{getLatestAssessment('sternberg')?.score?.sternberg?.style || 'N/A'}</strong></p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last assessed: {formatDate(getLatestAssessment('sternberg')?.completedAt || '')}
                        </p>
                      </div>
                      <div className="flex gap-2">

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
                        <p className="text-sm">Your Decision Style: <strong>{getLatestAssessment('dual-process')?.score?.dualProcess?.style || 'N/A'}</strong></p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last assessed: {formatDate(getLatestAssessment('dual-process')?.completedAt || '')}
                        </p>
                      </div>
                      <div className="flex gap-2">

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
      </div>

      {/* Score Metrics Explanation Modal */}
      {showScoreExplainerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-5 border-4 border-purple-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-7 h-7 text-purple-600" />
                <h3 className="text-xl font-black text-purple-950">How Score Metrics Are Calculated</h3>
              </div>
              <button 
                onClick={() => setShowScoreExplainerModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              JotMinds score metrics combine three internationally validated cognitive frameworks. Scores represent comparative strength and preference intensity, not academic intelligence limits.
            </p>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 space-y-1">
                <span className="font-bold text-sm text-purple-900 block">1. Learning Style Assessment</span>
                <p className="text-purple-950 leading-relaxed">
                  Evaluates how you process experience across two dual axes: <strong>Concrete Experience (CE) vs. Abstract Conceptualization (AC)</strong> and <strong>Reflective Observation (RO) vs. Active Experimentation (AE)</strong>. Scores range 0–100% per axis, determining dominant style (Diverging, Assimilating, Converging, Accommodating).
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-1">
                <span className="font-bold text-sm text-blue-900 block">2. Triarchic Theory of Intelligence</span>
                <p className="text-blue-950 leading-relaxed">
                  Measures three distinct cognitive dimensions: <strong>Analytical</strong> (problem breakdown & logical critique), <strong>Creative</strong> (novel problem solving & synthesis), and <strong>Practical</strong> (contextual execution & real-world implementation).
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-1">
                <span className="font-bold text-sm text-emerald-900 block">3. Dual-Process Cognitive Decision Framework</span>
                <p className="text-emerald-950 leading-relaxed">
                  Measures cognitive speed and deliberation: <strong>System 1 (Intuitive)</strong> relies on rapid pattern recognition and gut feeling, while <strong>System 2 (Reflective)</strong> employs slow, conscious, rule-based reasoning.
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 font-medium">
                <strong>Overall Score Derivation:</strong> The Cognitive Intelligence Score is a weighted composite index combining consistency, domain coverage, and agility across all completed assessments.
              </div>
            </div>

            <Button
              onClick={() => setShowScoreExplainerModal(false)}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg"
            >
              Got It, Close
            </Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}