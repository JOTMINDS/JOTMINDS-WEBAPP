import { ParentAccessRequests } from './ParentAccessRequests';
import { DailyChallengeTab } from './DailyChallengeTab';
import { ChildrenDailyChallenges } from './ChildrenDailyChallenges';
import { MindMoodMeter } from './MindMoodMeter';
import { DiscoveryOfTheDay } from './DiscoveryOfTheDay';
import { ParentTeacherGuide } from './ParentTeacherGuide';
import { ChildrenThinkingContainer } from './ChildrenThinkingContainer';
import { JHSThinkingContainer } from './JHSThinkingContainer';
import { SHSThinkingContainer } from './SHSThinkingContainer';
import { AdultThinkingContainer } from './AdultThinkingContainer';
import { BrainGym, DailyChallengeResults } from './BrainGym';
import { BrainGymResults } from './BrainGymResults';
import { getBrainGymProgress, saveBrainGymResults, getTodayProgress } from '../utils/brainGymStorage';
import { calculateAge } from '../utils/dateUtils';
import { useState, useEffect } from 'react';
import { User, Assessment } from '../types';
import { getUserAssessments, getUserReflections, getAllUsers } from '../utils/storage';
import { getUserAssessmentResults, getAllAssessmentResults } from '../utils/api';
import { useAuth } from './AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CardV2, CardV2Grid, StatBadge } from './ui/card-v2';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { FeedbackTab } from './StudentDashboardTabs/FeedbackTab';
import { ProfileTab } from './StudentDashboardTabs/ProfileTab';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { toast } from 'sonner';
import { formatMonthYear, formatDate, formatChartDate } from '../utils/dateFormat';
import {
  BookOpen,
  Eye,
  LogOut,
  TrendingUp,
  FileText,
  Sparkles,
  GraduationCap,
  Home,
  BarChart3,
  UserPlus,
  MessageSquare,
  Brain,
  Flame,
  Zap,
  Target,
  RefreshCw,
  Clock,
  User as UserIcon,
  Settings,
  ChevronDown,
  Building2,
  ArrowLeft,
  Briefcase
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AssessmentTaking } from './AssessmentTaking';
import { AssessmentReport } from './AssessmentReport';
import { CombinedCognitiveProfile } from './CombinedCognitiveProfile';
import { FrameworkInfo } from './FrameworkInfo';
import { AssessmentHistory } from './AssessmentHistory';
import { ReflectionsViewer } from './ReflectionsViewer';
import { MobileHeaderMenu } from './MobileHeaderMenu';
import { GamificationDashboard } from './GamificationDashboard';
import { CognitiveGrowthDashboard } from './CognitiveGrowthDashboard';
import { SkillBuilder } from './SkillBuilder';
import { CognitiveProfileView } from './CognitiveProfileView';
import { CareerRecommendations } from './CareerRecommendations';
import { StudentCareerFit } from './StudentCareerFit';
import { getCognitiveProfile, CognitiveProfile } from '../utils/cognitiveProfileApi';
import { DashboardLayout } from './ui/dashboard-layout';
import { NavGroup } from './ui/collapsible-sidebar';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

export function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
  const { impersonatedUser } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [activeAssessment, setActiveAssessment] = useState<'kolb' | 'sternberg' | 'dual-process' | null>(null);
  const [showJHSAssessment, setShowJHSAssessment] = useState(false);
  const [showSHSAssessment, setShowSHSAssessment] = useState(false);
  const [showAdultAssessment, setShowAdultAssessment] = useState(false);
  const [showChildrenAssessment, setShowChildrenAssessment] = useState(false);
  const [viewingReport, setViewingReport] = useState<Assessment | null>(null);
  const [viewingCombinedProfile, setViewingCombinedProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [challengeKey, setChallengeKey] = useState(0);
  const [moodMeterKey, setMoodMeterKey] = useState(0);
  const [showingCognitiveGrowth, setShowingCognitiveGrowth] = useState(false);
  const [showingBrainGym, setShowingBrainGym] = useState(false);
  const [brainGymResults, setBrainGymResults] = useState<DailyChallengeResults | null>(null);
  const [brainGymProgress, setBrainGymProgress] = useState(() => getBrainGymProgress(user.id));
  const [avatarUrl, setAvatarUrl] = useState<string>(user.avatarUrl || '');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showingSkillBuilder, setShowingSkillBuilder] = useState(false);
  const [showingCognitiveProfile, setShowingCognitiveProfile] = useState(false);
  const [showingCareerRecommendations, setShowingCareerRecommendations] = useState(false);
  const [cognitiveProfile, setCognitiveProfile] = useState<CognitiveProfile | null>(null);

  useEffect(() => {
    loadAssessments();
    loadCognitiveProfile();
  }, [user.id, impersonatedUser]);

  // Helper function to safely calculate dominant style from scores
  const calculateDominantStyle = (scores: Record<string, number> | undefined): string => {
    if (!scores || typeof scores !== 'object') return 'Unknown';
    
    const scoreKeys = Object.keys(scores);
    if (scoreKeys.length === 0) return 'Unknown';
    
    // Find the key with the highest score
    // Use a safe initial value to avoid "reduce of empty array" errors
    return scoreKeys.reduce((a, b) => 
      (scores[a] || 0) > (scores[b] || 0) ? a : b
    ); // reduce() with at least one element doesn't need initial value
  };

  const loadAssessments = async () => {
    setLoading(true);
    try {
      // ALWAYS fetch from backend (for both regular users and impersonated users)
      console.log('[StudentDashboard] Fetching assessments from backend for user:', user.id);
      
      let results;
      if (impersonatedUser) {
        // If viewing as admin, use the admin endpoint
        const data = await getUserAssessmentResults(user.id);
        results = data.results;
      } else {
        // Regular user viewing their own data - use their own endpoint
        const data = await getAllAssessmentResults();
        results = data.results;
      }
      
      console.log('[StudentDashboard] Received results from backend:', results);
      
      // Convert API results to Assessment format
      const convertedAssessments: Assessment[] = (results || []).map((result: any) => {
        try {
          let type: any = result.assessmentType;
          if (type === 'learning') type = 'kolb';
          else if (type === 'thinking') type = 'sternberg';
          else if (type === 'decision') type = 'dual-process';

          const rawResults = result.results || {};
          const rawScores = rawResults.scores || rawResults || {};
          const scoreObj: any = {};

          const capitalize = (str: string) => {
            if (!str) return 'Unknown';
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
          };

          if (type === 'kolb') {
            const style = capitalize(rawResults.dominantStyle || rawResults.style || 'Unknown');
            
            // Reconstruct CE, RO, AC, AE from style scores if needed
            const totalQ = rawResults.totalQuestions || 12;
            const maxPerStyle = (totalQ / 4) * 5; // e.g. 15 for 12 questions
            
            const diverging = rawScores.Diverging || rawScores.diverging || 0;
            const accommodating = rawScores.Accommodating || rawScores.accommodating || 0;
            const assimilating = rawScores.Assimilating || rawScores.assimilating || 0;
            const converging = rawScores.Converging || rawScores.converging || 0;

            const ce = rawScores.CE !== undefined ? rawScores.CE : Math.round(((diverging + accommodating) / (maxPerStyle * 2)) * 48);
            const ro = rawScores.RO !== undefined ? rawScores.RO : Math.round(((diverging + assimilating) / (maxPerStyle * 2)) * 48);
            const ac = rawScores.AC !== undefined ? rawScores.AC : Math.round(((assimilating + converging) / (maxPerStyle * 2)) * 48);
            const ae = rawScores.AE !== undefined ? rawScores.AE : Math.round(((accommodating + converging) / (maxPerStyle * 2)) * 48);

            scoreObj.kolb = {
              style,
              scores: {
                CE: ce,
                RO: ro,
                AC: ac,
                AE: ae,
                Diverging: diverging,
                Accommodating: accommodating,
                Assimilating: assimilating,
                Converging: converging
              }
            };
          } else if (type === 'sternberg') {
            const style = capitalize(rawResults.dominantStyle || rawResults.style || 'Unknown');
            scoreObj.sternberg = {
              style,
              scores: {
                analytical: rawScores.analytical !== undefined ? rawScores.analytical : (rawScores.Analytical || 0),
                creative: rawScores.creative !== undefined ? rawScores.creative : (rawScores.Creative || 0),
                practical: rawScores.practical !== undefined ? rawScores.practical : (rawScores.Practical || 0)
              }
            };
          } else if (type === 'dual-process') {
            const style = capitalize(rawResults.dominantStyle || rawResults.style || 'Unknown');
            scoreObj.dualProcess = {
              style,
              scores: {
                system1: rawScores.system1 !== undefined ? rawScores.system1 : (rawScores.System1 || rawScores.intuitive || rawScores.Intuitive || 0),
                system2: rawScores.system2 !== undefined ? rawScores.system2 : (rawScores.System2 || rawScores.reflective || rawScores.Reflective || 0)
              }
            };
          } else if (type === 'jhs-thinking' || type === 'shs-thinking' || type === 'adult-thinking' || type === 'children-thinking') {
            const style = capitalize(rawResults.dominantStyle || rawResults.style || 'Unknown');
            scoreObj[type] = {
              personalityType: rawResults.personalityType || style,
              dominantStyle: style,
              scores: rawScores
            };
          } else {
            scoreObj[type] = rawResults;
          }

          return {
            id: result.id || 'unknown',
            userId: user.id,
            type,
            score: scoreObj,
            completedAt: result.completedAt || new Date().toISOString(),
            responses: []
          };
        } catch (conversionError) {
          console.error('❌ Error converting assessment result:', conversionError);
          return {
            id: result.id || 'unknown',
            userId: user.id,
            type: result.assessmentType || 'unknown' as any,
            score: {},
            completedAt: result.completedAt || new Date().toISOString(),
            responses: []
          };
        }
      }).filter(assessment => assessment.type !== 'unknown' as any); // Filter out failed conversions
      
      setAssessments(convertedAssessments);
      setLastUpdated(new Date());
      console.log('[StudentDashboard] Converted and set assessments:', convertedAssessments.length, 'assessments');
      
      // Show success toast only on manual refresh (not on initial load)
      if (!loading && isRefreshing) {
        toast.success(`Assessment data updated (${convertedAssessments.length} assessments loaded)`);
      }
    } catch (error) {
      console.error('[StudentDashboard] Error loading assessments:', error);
      toast.error('Failed to load assessment data. Please check your connection and try again.');
      
      // Fallback to localStorage if backend fails
      console.log('[StudentDashboard] Falling back to localStorage');
      const localAssessments = getUserAssessments(user.id);
      setAssessments(localAssessments);
      
      if (localAssessments.length > 0) {
        toast.info(`Showing ${localAssessments.length} assessments from local cache`);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadCognitiveProfile = async () => {
    try {
      const profile = await getCognitiveProfile();
      setCognitiveProfile(profile);
      console.log('[StudentDashboard] Loaded cognitive profile:', profile.cognitiveArchetype);
    } catch (e: any) {
      console.log('[StudentDashboard] No cognitive profile yet:', e.message);
      setCognitiveProfile(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAssessments();
    await loadCognitiveProfile();
  };

  const hasCompletedAssessment = (type: Assessment['type']) => {
    return assessments.some(a => a.type === type);
  };

  const hasCompletedAtLeastOne = () => {
    return assessments.length > 0;
  };

  const hasCompletedAllThree = () => {
    const hasKolb = hasCompletedAssessment('kolb');
    const hasSternberg = hasCompletedAssessment('sternberg');
    const hasDualProcess = hasCompletedAssessment('dual-process');
    
    console.log('🔍 Complete Cognitive Profile Debug:', {
      hasKolb,
      hasSternberg,
      hasDualProcess,
      allThree: hasKolb && hasSternberg && hasDualProcess,
      totalAssessments: assessments.length,
      assessmentTypes: assessments.map(a => a.type)
    });
    
    return hasKolb && hasSternberg && hasDualProcess;
  };

  const getLatestAssessment = (type: Assessment['type']) => {
    return assessments.filter(a => a.type === type).sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )[0];
  };

  const handleAssessmentComplete = async (assessment: Assessment) => {
    try {
      console.log('Assessment completed:', assessment);
      await loadAssessments();
      await loadCognitiveProfile(); // Reload profile after assessment completion
      setActiveAssessment(null);
      setViewingReport(assessment);
    } catch (error) {
      console.error('Error handling assessment completion:', error);
      // Still show the report even if loading assessments fails
      setActiveAssessment(null);
      setViewingReport(assessment);
    }
  };

  const getTrendData = () => {
    const validAssessments = assessments
      .filter(a => a && (a.completed || a.completedAt || a.score))
      .sort((a, b) => new Date(a.completedAt || 0).getTime() - new Date(b.completedAt || 0).getTime());

    if (validAssessments.length === 0) return [];

    return validAssessments.map(a => {
      const scoreObj = a.score as any;
      if (!scoreObj) return { date: formatChartDate(a.completedAt || new Date().toISOString()), CE: 70, RO: 65, AC: 75, AE: 70, label: 'Score' };

      // 1. Check for Kolb scores
      const kolb = scoreObj.kolb?.scores || (a.type === 'kolb' ? scoreObj.scores || scoreObj : null);
      if (kolb && (kolb.CE !== undefined || kolb.RO !== undefined || kolb.AC !== undefined || kolb.AE !== undefined)) {
        return {
          date: formatChartDate(a.completedAt || new Date().toISOString()),
          CE: Math.round(kolb.CE || 0),
          RO: Math.round(kolb.RO || 0),
          AC: Math.round(kolb.AC || 0),
          AE: Math.round(kolb.AE || 0),
          label: 'Learning Style'
        };
      }

      // 2. Check for Thinking Styles (JHS, SHS, Adult, Children, Sternberg)
      const thinking = scoreObj['jhs-thinking']?.scores || 
                       scoreObj['shs-thinking']?.scores || 
                       scoreObj['adult-thinking']?.scores || 
                       scoreObj['child-thinking']?.scores || 
                       scoreObj.sternberg?.scores || 
                       scoreObj.scores;

      if (thinking) {
        const analytical = thinking.analytical || thinking.Analytical || thinking.executive || thinking.Executive || 65;
        const creative = thinking.creative || thinking.Creative || thinking.legislative || thinking.Legislative || 70;
        const practical = thinking.practical || thinking.Practical || thinking.judicial || thinking.Judicial || 60;

        return {
          date: formatChartDate(a.completedAt || new Date().toISOString()),
          CE: Math.round(analytical),
          RO: Math.round(creative),
          AC: Math.round(practical),
          AE: Math.round((analytical + creative + practical) / 3),
          label: 'Thinking Profile'
        };
      }

      // 3. Fallback for generic score object or numbers
      const scoreVal = typeof scoreObj === 'number' ? scoreObj : (scoreObj.percentage || scoreObj.overallScore || 70);
      return {
        date: formatChartDate(a.completedAt || new Date().toISOString()),
        CE: Math.round(scoreVal),
        RO: Math.round(scoreVal * 0.9),
        AC: Math.round(scoreVal * 1.05),
        AE: Math.round(scoreVal),
        label: 'Assessment Score'
      };
    });
  };

  const getStudentRecommendations = (): string[] => {
    if (!assessments || assessments.length === 0) {
      return [
        'Complete your first cognitive assessment to unlock personalized study recommendations.',
        'Explore daily brain gym exercises to build reasoning speed and focus.'
      ];
    }

    const recs: string[] = [];
    const latest = assessments[assessments.length - 1];
    const scoreObj = (latest?.score || {}) as any;

    const style = scoreObj['jhs-thinking']?.primaryStyle || 
                  scoreObj['shs-thinking']?.primaryStyle || 
                  scoreObj['adult-thinking']?.dominantStyle || 
                  scoreObj['child-thinking']?.primaryStyle || 
                  scoreObj.kolb?.style || 
                  scoreObj.sternberg?.style || 
                  'Visual & Analytical';

    recs.push(`Tailor study sessions for your ${style} cognitive profile using structured mind maps & key point summaries.`);
    recs.push('Schedule 25-minute study blocks followed by 5-minute cognitive breaks (Pomodoro technique).');
    recs.push('Utilize step-by-step problem checklists and practice past question sets to boost analytical confidence.');
    recs.push('Discuss complex topics verbally with study partners or teachers to reinforce long-term memory retention.');

    return recs;
  };


  // Determine which Thinking Styles assessment to show based on education level (primary) and age (secondary)
  const getThinkingStylesAssessment = () => {
    // Calculate age from dateOfBirth if available
    let userAge = user.age;
    if (!userAge && user.dateOfBirth) {
      userAge = calculateAge(user.dateOfBirth);
    }

    // PRIMARY: Use education level as the main determinant
    // This accounts for students who might be younger/older than typical for their grade
    if (user.educationLevel) {
      switch (user.educationLevel) {
        case 'Elementary':
          return 'Children'; // Ages 6-10 typically
        case 'JHS':
          return 'JHS'; // Ages 11-14 typically
        case 'SHS':
          return 'SHS'; // Ages 15-18 typically
        case 'Tertiary':
          return 'Adult'; // Ages 19+ typically
      }
    }

    // SECONDARY: Fall back to age-based determination if no education level
    if (userAge) {
      if (userAge >= 6 && userAge <= 10) return 'Children';
      if (userAge >= 11 && userAge <= 14) return 'JHS';
      if (userAge >= 15 && userAge <= 18) return 'SHS';
      if (userAge >= 19) return 'Adult';
      
      // User is too young (under 6)
      return null;
    }

    // DEFAULT: If neither education level nor age is available, default to Adult
    return 'Adult';
  };

  const thinkingStylesAssessment = getThinkingStylesAssessment();

  // Helper to check if user should see children's features (ages 6-10)
  const isChildrenUser = () => {
    return user.educationLevel === 'Elementary' || thinkingStylesAssessment === 'Children';
  };

  // Handle Brain Gym completion
  const handleBrainGymComplete = (results: DailyChallengeResults) => {
    const updatedProgress = saveBrainGymResults(user.id, results);
    setBrainGymProgress(updatedProgress);
    setBrainGymResults(results);
    setShowingBrainGym(false);
  };

  // Show Cognitive Growth Dashboard
  if (showingCognitiveGrowth) {
    return <CognitiveGrowthDashboard user={user} onBack={() => setShowingCognitiveGrowth(false)} />;
  }

  // Show Brain Gym
  if (showingBrainGym) {
    return (
      <BrainGym
        userId={user.id}
        onComplete={handleBrainGymComplete}
        onBack={() => setShowingBrainGym(false)}
      />
    );
  }

  // Show Brain Gym Results
  if (brainGymResults) {
    return (
      <BrainGymResults
        results={brainGymResults}
        onBack={() => {
          setBrainGymResults(null);
          setBrainGymProgress(getBrainGymProgress(user.id));
        }}
        onRetry={() => {
          setBrainGymResults(null);
          setShowingBrainGym(true);
        }}
      />
    );
  }

  // Show Skill Builder
  if (showingSkillBuilder) {
    return (
      <SkillBuilder
        onBack={() => setShowingSkillBuilder(false)}
      />
    );
  }

  // Show Cognitive Profile
  if (showingCognitiveProfile) {
    return (
      <CognitiveProfileView
        onBack={() => {
          setShowingCognitiveProfile(false);
          loadCognitiveProfile(); // Reload in case it was regenerated
        }}
        onNavigateToCareers={() => {
          setShowingCognitiveProfile(false);
          setShowingCareerRecommendations(true);
        }}
      />
    );
  }

  // Show Career Recommendations
  if (showingCareerRecommendations) {
    // Use cognitive archetype as the style, or fallback to dominant style from assessments
    const cognitiveStyle = cognitiveProfile?.cognitiveArchetype || cognitiveProfile?.dominantStyle || 'Balanced';

    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowingCareerRecommendations(false)}
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-semibold text-lg">Career Recommendations</h1>
              <p className="text-xs text-muted-foreground">
                Careers that match your cognitive profile
              </p>
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-4">
          {cognitiveProfile ? (
            <StudentCareerFit cognitiveProfile={cognitiveProfile} userName={user.name} />
          ) : (
            <CareerRecommendations
              cognitiveStyle={cognitiveStyle}
              assessmentType="cognitive-profile"
              onNavigateToSkillBuilder={(dimensionId) => {
                setShowingCareerRecommendations(false);
                setShowingSkillBuilder(true);
              }}
            />
          )}
        </main>
      </div>
    );
  }

  if (activeAssessment) {
    return (
      <AssessmentTaking
        userId={user.id}
        assessmentType={activeAssessment}
        userAge={user.age} // Pass user's age for age-appropriate questions (15-18 uses teen bank)
        onComplete={handleAssessmentComplete}
        onCancel={() => setActiveAssessment(null)}
      />
    );
  }

  if (showJHSAssessment) {
    return (
      <JHSThinkingContainer
        userId={user.id}
        userName={user.name}
        onComplete={() => {
          loadAssessments();
          setShowJHSAssessment(false);
        }}
        onCancel={() => setShowJHSAssessment(false)}
        onViewCognitiveProfile={() => {
          setShowJHSAssessment(false);
          setShowingCognitiveProfile(true);
        }}
      />
    );
  }

  if (showSHSAssessment) {
    return (
      <SHSThinkingContainer
        userId={user.id}
        userName={user.name}
        onComplete={() => {
          loadAssessments();
          setShowSHSAssessment(false);
        }}
        onCancel={() => setShowSHSAssessment(false)}
      />
    );
  }

  if (showAdultAssessment) {
    return (
      <AdultThinkingContainer
        userId={user.id}
        userName={user.name}
        onComplete={() => {
          loadAssessments();
          setShowAdultAssessment(false);
        }}
        onCancel={() => setShowAdultAssessment(false)}
      />
    );
  }

  if (showChildrenAssessment) {
    return (
      <ChildrenThinkingContainer
        userId={user.id}
        userName={user.name}
        onComplete={() => {
          loadAssessments();
          setShowChildrenAssessment(false);
        }}
        onCancel={() => setShowChildrenAssessment(false)}
      />
    );
  }

  if (viewingReport) {
    return (
      <AssessmentReport
        assessment={viewingReport}
        userName={user.name}
        onBack={() => setViewingReport(null)}
        userRole={user.role}
      />
    );
  }

  if (viewingCombinedProfile) {
    console.log('✅ Rendering CombinedCognitiveProfile with assessments:', assessments);
    return (
      <CombinedCognitiveProfile
        assessments={assessments}
        userName={user.name}
        onBack={() => setViewingCombinedProfile(false)}
      />
    );
  }

  const trendData = getTrendData();
  const reflections = getUserReflections(user.id);

  const isChild = isChildrenUser();

  const studentNavGroups: NavGroup[] = [
    {
      groupLabel: 'Navigation',
      items: isChild ? [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'daily-challenges', label: 'Mind Play', icon: Sparkles },
        { id: 'mood-meter', label: 'Mood Meter', icon: Sparkles },
        { id: 'discoveries', label: 'Discoveries', icon: BookOpen },
        { id: 'track-record', label: 'My Progress', icon: BarChart3 },
        { id: 'school-profile', label: 'School', icon: Building2 },
      ] : [
        { id: 'dashboard', label: 'Home', icon: Home },
        { id: 'daily-challenges', label: 'Brain Boost', icon: Sparkles },
        { id: 'track-record', label: 'Assessments', icon: BarChart3 },
        { id: 'profile', label: 'Cognitive Profile', icon: UserIcon },
        { id: 'school-profile', label: 'School Portal', icon: Building2 },
      ]
    },
    {
      groupLabel: 'Settings & Account',
      items: [
        { id: 'parent-access', label: 'Parent Access', icon: UserPlus },
        { id: 'settings', label: 'Account Settings', icon: Settings },
      ]
    }
  ];

  const headerContent = (
    <div className="w-full flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
          {activeTab.replace('-', ' ')}
        </h2>
        {user.className && (
          <Badge variant="outline" className="border-[#1E8A6E] text-[#1E8A6E]">
            Class {user.className}
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
        <FrameworkInfo userRole="student" />
      </div>
    </div>
  );

  return (
    <DashboardLayout
      navGroups={studentNavGroups}
      activeTab={activeTab}
      setActiveTab={(val) => {
        setActiveTab(val);
        if (val === 'daily-challenges') setChallengeKey(prev => prev + 1);
        if (val === 'mood-meter') setMoodMeterKey(prev => prev + 1);
      }}
      user={user}
      onLogout={onLogout}
      brandSubtitle="Student Portal"
      onOpenSettings={() => setActiveTab('settings')}
      headerContent={headerContent}
    >
      <Tabs 
        value={activeTab}
        defaultValue="dashboard" 
        className="w-full"
      >
        <TabsContent value="dashboard" className="space-y-6">

            {/* Loading State */}
            {loading && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                    <div>
                      <CardTitle>Loading your assessments...</CardTitle>
                      <CardDescription>Fetching your latest data from the server</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-20 bg-muted animate-pulse rounded-lg"></div>
                  <div className="h-20 bg-muted animate-pulse rounded-lg"></div>
                  <div className="h-20 bg-muted animate-pulse rounded-lg"></div>
                </CardContent>
              </Card>
            )}
            
            {/* Full Cognitive Profile - Shows when all 3 assessments are complete */}
            {!loading && hasCompletedAllThree() && (
              <Card className="border-2 border-gradient-primary bg-gradient-to-br from-[#6B4C9A]/10 via-[#7B61FF]/10 to-[#5B7DB1]/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl bg-gradient-to-r from-[#6B4C9A] via-[#7B61FF] to-[#5B7DB1] bg-clip-text text-transparent">
                        🎉 Your Complete Cognitive Profile
                      </CardTitle>
                      <CardDescription className="mt-2">
                        You've completed all three core assessments! View your comprehensive profile to see how your learning, thinking, and decision styles work together.
                      </CardDescription>
                    </div>
                    <Sparkles className="h-8 w-8 text-[#7B61FF]" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full gradient-primary text-white shadow-lg hover:shadow-xl text-lg py-6"
                    onClick={() => {
                      console.log('🎯 Viewing Complete Cognitive Profile button clicked');
                      setViewingCombinedProfile(true);
                    }}
                  >
                    <GraduationCap className="mr-2 h-5 w-5" />
                    View Your Full Cognitive Profile
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Brain Gym - Daily Cognitive Training */}
            <Card className="border-2 border-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-700 dark:to-pink-700 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-orange-900/20 overflow-hidden relative shadow-xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
                    <Brain className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <CardTitle className="text-xl sm:text-2xl">🧠 Brain Gym - Daily Challenges</CardTitle>
                      {brainGymProgress.currentStreak > 0 && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 flex items-center gap-1">
                          <Flame className="h-3 w-3" />
                          {brainGymProgress.currentStreak} Day Streak
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-sm sm:text-base">
                      Train your cognitive skills daily with fun challenges!
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-4">
                {/* Today's Progress */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-4 border-2 border-purple-200 dark:border-purple-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Today's Challenges</h3>
                    <Badge variant="secondary">{getTodayProgress(user.id).total}/3 Complete</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setShowingBrainGym(true)}
                      disabled={getTodayProgress(user.id).learning}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        getTodayProgress(user.id).learning
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600'
                          : 'bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md cursor-pointer'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Brain className={`h-6 w-6 ${getTodayProgress(user.id).learning ? 'text-green-600' : 'text-purple-600'}`} />
                        <span className="text-xs font-medium text-center">Learning</span>
                        {getTodayProgress(user.id).learning && <span className="text-xs text-green-600">✓</span>}
                      </div>
                    </button>
                    <button
                      onClick={() => setShowingBrainGym(true)}
                      disabled={getTodayProgress(user.id).thinking}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        getTodayProgress(user.id).thinking
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600'
                          : 'bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md cursor-pointer'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Zap className={`h-6 w-6 ${getTodayProgress(user.id).thinking ? 'text-green-600' : 'text-purple-600'}`} />
                        <span className="text-xs font-medium text-center">Thinking</span>
                        {getTodayProgress(user.id).thinking && <span className="text-xs text-green-600">✓</span>}
                      </div>
                    </button>
                    <button
                      onClick={() => setShowingBrainGym(true)}
                      disabled={getTodayProgress(user.id).decision}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        getTodayProgress(user.id).decision
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600'
                          : 'bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md cursor-pointer'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Target className={`h-6 w-6 ${getTodayProgress(user.id).decision ? 'text-green-600' : 'text-purple-600'}`} />
                        <span className="text-xs font-medium text-center">Decision</span>
                        {getTodayProgress(user.id).decision && <span className="text-xs text-green-600">✓</span>}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-700">
                    <div className="flex flex-col items-center gap-1">
                      <Flame className="h-6 w-6 text-orange-500" />
                      <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{brainGymProgress.currentStreak}</div>
                      <p className="text-xs text-orange-600 dark:text-orange-400 text-center">Streak</p>
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
                    <div className="flex flex-col items-center gap-1">
                      <Sparkles className="h-6 w-6 text-purple-500" />
                      <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{brainGymProgress.totalPoints}</div>
                      <p className="text-xs text-purple-600 dark:text-purple-400 text-center">Points</p>
                    </div>
                  </div>
                  <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-3 border border-pink-200 dark:border-pink-700">
                    <div className="flex flex-col items-center gap-1">
                      <TrendingUp className="h-6 w-6 text-pink-500" />
                      <div className="text-2xl font-bold text-pink-700 dark:text-pink-300">
                        {brainGymProgress.completedChallenges.length}
                      </div>
                      <p className="text-xs text-pink-600 dark:text-pink-400 text-center">Total</p>
                    </div>
                  </div>
                </div>

                {/* Start Button */}
                <Button
                  onClick={() => setShowingBrainGym(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  <Brain className="mr-2 h-5 w-5" />
                  Start Daily Challenge
                  <Sparkles className="ml-2 h-5 w-5" />
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  🎯 Build mental agility • Train daily • Level up your brain!
                </p>
              </CardContent>
            </Card>

            {/* Cognitive Profile - Your Thinking Archetype */}
            {cognitiveProfile && (
              <Card className="border-2 border-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-700 dark:to-pink-700 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-orange-900/20 overflow-hidden relative shadow-xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Brain className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <CardTitle className="text-xl sm:text-2xl">🧠 {cognitiveProfile.cognitiveArchetype}</CardTitle>
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                          {Math.round(cognitiveProfile.profileCompleteness)}% Complete
                        </Badge>
                      </div>
                      <CardDescription className="text-sm sm:text-base">
                        Your Cognitive Profile
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-4 border-2 border-purple-200 dark:border-purple-700">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Your Top Strengths:</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 text-center">
                        <p className="text-xs text-muted-foreground">Learning Agility</p>
                        <p className="text-lg font-bold text-purple-600">{cognitiveProfile.learningAgility}</p>
                      </div>
                      <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-2 text-center">
                        <p className="text-xs text-muted-foreground">Innovation</p>
                        <p className="text-lg font-bold text-pink-600">{cognitiveProfile.innovationPotential}</p>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2 text-center">
                        <p className="text-xs text-muted-foreground">Execution</p>
                        <p className="text-lg font-bold text-orange-600">{cognitiveProfile.executionCapability}</p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 text-center">
                        <p className="text-xs text-muted-foreground">Self-Awareness</p>
                        <p className="text-lg font-bold text-purple-600">{cognitiveProfile.metacognitiveAwareness}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowingCognitiveProfile(true)}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all"
                      size="lg"
                    >
                      <Brain className="mr-2 h-5 w-5" />
                      View Full Profile
                    </Button>
                    {cognitiveProfile.profileCompleteness === 100 && (
                      <Button
                        onClick={() => setShowingCareerRecommendations(true)}
                        variant="outline"
                        className="flex-1"
                        size="lg"
                      >
                        <Briefcase className="mr-2 h-5 w-5" />
                        Career Matches
                      </Button>
                    )}
                  </div>

                  {cognitiveProfile.profileCompleteness < 100 && (
                    <p className="text-xs text-center text-muted-foreground">
                      💡 Complete {3 - cognitiveProfile.completedAssessments.length} more assessment(s) for career recommendations
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Skill Builder - Personalized Learning Plans */}
            <Card className="border-2 border-gradient-to-r from-teal-200 to-cyan-200 dark:from-teal-700 dark:to-cyan-700 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-900/20 dark:via-cyan-900/20 dark:to-blue-900/20 overflow-hidden relative shadow-xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                    <Target className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <CardTitle className="text-xl sm:text-2xl">🎯 Skill Builder</CardTitle>
                      <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0">
                        New!
                      </Badge>
                    </div>
                    <CardDescription className="text-sm sm:text-base">
                      7-day personalized plans to strengthen your weakest cognitive dimensions
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-4 border-2 border-teal-200 dark:border-teal-700">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How it works:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-teal-500 font-bold">1.</span>
                      <span>Complete an assessment to identify areas for growth</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-500 font-bold">2.</span>
                      <span>Get a personalized 7-day plan auto-generated for your weakest dimension</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-500 font-bold">3.</span>
                      <span>Each day: play a Brain Gym game, reflect, and complete a real-world challenge</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-500 font-bold">4.</span>
                      <span>Track your progress and build stronger cognitive skills!</span>
                    </li>
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-3 border border-teal-200 dark:border-teal-700">
                    <div className="flex flex-col items-center gap-1">
                      <Brain className="h-6 w-6 text-teal-500" />
                      <p className="text-xs text-teal-600 dark:text-teal-400 text-center font-medium">Metacognition</p>
                    </div>
                  </div>
                  <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-3 border border-cyan-200 dark:border-cyan-700">
                    <div className="flex flex-col items-center gap-1">
                      <Target className="h-6 w-6 text-cyan-500" />
                      <p className="text-xs text-cyan-600 dark:text-cyan-400 text-center font-medium">Problem Solving</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                    <div className="flex flex-col items-center gap-1">
                      <Sparkles className="h-6 w-6 text-blue-500" />
                      <p className="text-xs text-blue-600 dark:text-blue-400 text-center font-medium">Curiosity</p>
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
                    <div className="flex flex-col items-center gap-1">
                      <Flame className="h-6 w-6 text-purple-500" />
                      <p className="text-xs text-purple-600 dark:text-purple-400 text-center font-medium">Emotional Regulation</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setShowingSkillBuilder(true)}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  <Target className="mr-2 h-5 w-5" />
                  View My Skill Plans
                  <Sparkles className="ml-2 h-5 w-5" />
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  💡 Plans are auto-created when you score low on assessments
                </p>
              </CardContent>
            </Card>

            {/* Core Assessments - Using Card v2 */}
            <CardV2Grid columns={3}>
              <CardV2
                icon={BookOpen}
                iconColor="text-blue-600"
                iconBgColor="bg-blue-100"
                title="Learning Style"
                subtitle="Discover how you learn best"
                stats={hasCompletedAssessment('kolb') ? [
                  { label: 'Status', value: '✓ Done' }
                ] : [
                  { label: 'Status', value: 'Not started' }
                ]}
                cta={
                  hasCompletedAssessment('kolb') ? (
                    <div className="flex gap-2 w-full">
                      <Button 
                        size="sm"
                        className="flex-1 gradient-primary text-white" 
                        onClick={() => setViewingReport(getLatestAssessment('kolb'))}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveAssessment('kolb')}
                      >
                        Retake
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      size="sm"
                      className="w-full gradient-primary text-white"
                      onClick={() => setActiveAssessment('kolb')}
                    >
                      Start →
                    </Button>
                  )
                }
                variant="gradient"
              />

              <CardV2
                icon={Brain}
                iconColor="text-purple-600"
                iconBgColor="bg-purple-100"
                title="Thinking Style"
                subtitle="Understand how you think"
                stats={hasCompletedAssessment('sternberg') ? [
                  { label: 'Status', value: '✓ Done' }
                ] : [
                  { label: 'Status', value: 'Not started' }
                ]}
                cta={
                  hasCompletedAssessment('sternberg') ? (
                    <div className="flex gap-2 w-full">
                      <Button 
                        size="sm"
                        className="flex-1 gradient-purple text-white" 
                        onClick={() => setViewingReport(getLatestAssessment('sternberg'))}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveAssessment('sternberg')}
                      >
                        Retake
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      size="sm"
                      className="w-full gradient-purple text-white"
                      onClick={() => setActiveAssessment('sternberg')}
                    >
                      Start →
                    </Button>
                  )
                }
                variant="gradient"
              />

              <CardV2
                icon={Target}
                iconColor="text-orange-600"
                iconBgColor="bg-orange-100"
                title="Decision Style"
                subtitle="Learn how you make decisions"
                stats={hasCompletedAssessment('dual-process') ? [
                  { label: 'Status', value: '✓ Done' }
                ] : [
                  { label: 'Status', value: 'Not started' }
                ]}
                cta={
                  hasCompletedAssessment('dual-process') ? (
                    <div className="flex gap-2 w-full">
                      <Button 
                        size="sm"
                        className="flex-1 gradient-warning text-white" 
                        onClick={() => setViewingReport(getLatestAssessment('dual-process'))}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveAssessment('dual-process')}
                      >
                        Retake
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      size="sm"
                      className="w-full gradient-warning text-white"
                      onClick={() => setActiveAssessment('dual-process')}
                    >
                      Start →
                    </Button>
                  )
                }
                variant="gradient"
              />
            </CardV2Grid>

            {/* NEW: Thinking Styles Adventure - Show ONLY after completing ALL THREE core assessments */}
            {hasCompletedAllThree() && (
              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-green-900">🎉 Great Progress!</CardTitle>
                      <CardDescription>
                        Ready for your next adventure? Discover your Thinking Style!
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-4">
                    Congratulations on completing all three core assessments! Now take the next step to discover your unique thinking patterns and unlock personalized program recommendations!
                  </p>
                  <Button 
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md"
                    onClick={() => {
                      // Scroll down to thinking styles assessment
                      const element = document.getElementById('thinking-styles-section');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Explore Thinking Styles Adventure →
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* NEW: JHS Thinking Styles Adventure - For JHS Students (Ages 11-14) */}
            {thinkingStylesAssessment === 'JHS' && hasCompletedAllThree() && (
            <div id="thinking-styles-section">
            <Card className="border-4 border-[#FF715B] bg-gradient-to-br from-white via-pink-50 to-purple-50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1 text-xs">
                    🎉 NEW: For JHS Students
                  </Badge>
                  <Badge variant="outline" className="border-[#FF715B] text-[#FF715B]">
                    Ages 11-14
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF715B] to-[#5B7DB1] flex items-center justify-center shadow-lg">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl bg-gradient-to-r from-[#FF715B] via-[#6B4C9A] to-[#5B7DB1] bg-clip-text text-transparent">
                      🧠 Thinking Styles Adventure
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      Discover how your mind learns, solves, and creates!
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border-2 border-[#FF715B]/30">
                  <p className="text-sm text-gray-700 mb-3">
                    👋 <strong>Hey there, Thinker!</strong> Take a fun journey to discover:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xl">🎨</span>
                      <span>Creative Thinking</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xl">🔍</span>
                      <span>Analytical Thinking</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xl">🛠️</span>
                      <span>Practical Thinking</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xl">💭</span>
                      <span>Reflective Thinking</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-200">
                  <p className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <span className="text-lg">🎓</span>
                    Get SHS Program Recommendations!
                  </p>
                  <p className="text-xs text-gray-700">
                    Find out which Senior High School programs match your unique thinking powers
                  </p>
                </div>

                {hasCompletedAssessment('jhs-thinking') ? (
                  <Button 
                    onClick={() => {
                        const assessment = getLatestAssessment('jhs-thinking');
                        if (assessment) setViewingReport(assessment);
                    }}
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all text-base py-6"
                    size="lg"
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    View Your Thinking Adventure Report
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setShowJHSAssessment(true)}
                    className="w-full bg-gradient-to-r from-[#FF715B] via-[#6B4C9A] to-[#5B7DB1] hover:from-[#E6644F] hover:via-[#1AB5CC] hover:to-[#252770] text-white shadow-lg hover:shadow-xl transition-all text-base py-6"
                    size="lg"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Your Thinking Adventure! 🚀
                  </Button>
                )}

                <p className="text-xs text-center text-gray-500">
                  ⏱️ Takes about 5-7 minutes • 24 fun questions with emoji responses 😕😐🙂😃🤩
                </p>
              </CardContent>
            </Card>
            </div>
            )}

            {/* NEW: SHS Thinking Styles Adventure - For SHS Students (Ages 15-18) */}
            {thinkingStylesAssessment === 'SHS' && hasCompletedAllThree() && (
            <div id="thinking-styles-section">
            <Card className="border-4 border-indigo-300 bg-gradient-to-br from-white via-indigo-50 to-cyan-50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-3 py-1 text-xs">
                    🎯 NEW: For SHS Students
                  </Badge>
                  <Badge variant="outline" className="border-indigo-500 text-indigo-700">
                    Ages 15-18
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg">
                    <GraduationCap className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                      🎓 SHS Thinking Styles Assessment
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      Discover your thinking profile and find the perfect university program
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border-2 border-indigo-200">
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Understand your unique thinking patterns across four dimensions:</strong>
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xl">🎨</span>
                      <span>Creative Thinking</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xl">🔍</span>
                      <span>Analytical Thinking</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xl">🛠️</span>
                      <span>Practical Thinking</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xl">💭</span>
                      <span>Reflective Thinking</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-200">
                  <p className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-yellow-700" />
                    Get University & College Program Recommendations!
                  </p>
                  <p className="text-xs text-gray-700">
                    Find tertiary programs that align with your thinking style, plus career pathways and top Philippine universities
                  </p>
                </div>

                {hasCompletedAssessment('shs-thinking') ? (
                  <Button 
                    onClick={() => {
                        const assessment = getLatestAssessment('shs-thinking');
                        if (assessment) setViewingReport(assessment);
                    }}
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all text-base py-6"
                    size="lg"
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    View Your SHS Thinking Report
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setShowSHSAssessment(true)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all text-base py-6"
                    size="lg"
                  >
                    <GraduationCap className="mr-2 h-5 w-5" />
                    Begin Assessment →
                  </Button>
                )}

                <p className="text-xs text-center text-gray-500">
                  ⏱️ Takes 6-8 minutes • 24 questions with 5-point rating scale
                </p>
              </CardContent>
            </Card>
            </div>
            )}

            {/* NEW: Adult Thinking Styles Adventure - For Adults */}
            {thinkingStylesAssessment === 'Adult' && hasCompletedAllThree() && (
            <div id="thinking-styles-section">
            <Card className="border-4 border-slate-300 bg-gradient-to-br from-white via-slate-50 to-zinc-50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-gradient-to-r from-slate-700 to-slate-900 text-white px-3 py-1 text-xs">
                    💼 NEW: Professional Assessment
                  </Badge>
                  <Badge variant="outline" className="border-slate-600 text-slate-700">
                    Ages 19+
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                      💼 Professional Thinking Styles
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      Discover your thinking profile for career development and growth
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border-2 border-slate-200">
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Unlock your professional potential across four thinking dimensions:</strong>
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xl">🎨</span>
                      <span>Creative Thinking</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xl">🔍</span>
                      <span>Analytical Thinking</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xl">🛠️</span>
                      <span>Practical Thinking</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xl">💭</span>
                      <span>Reflective Thinking</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <span className="text-lg">💼</span>
                    Get Personalized Career Path Recommendations!
                  </p>
                  <p className="text-xs text-gray-700">
                    Discover 20+ career paths aligned with your thinking style, including entrepreneurship, leadership roles, and professional development opportunities
                  </p>
                </div>

                {hasCompletedAssessment('adult-thinking') ? (
                  <Button 
                    onClick={() => {
                        const assessment = getLatestAssessment('adult-thinking');
                        if (assessment) setViewingReport(assessment);
                    }}
                    className="w-full bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white shadow-lg hover:shadow-xl transition-all text-base py-6"
                    size="lg"
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    View Your Professional Report
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setShowAdultAssessment(true)}
                    className="w-full bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white shadow-lg hover:shadow-xl transition-all text-base py-6"
                    size="lg"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Begin Professional Assessment →
                  </Button>
                )}

                <p className="text-xs text-center text-gray-500">
                  ⏱️ Takes 8-10 minutes • 24 questions with professional Likert scale
                </p>
              </CardContent>
            </Card>
            </div>
            )}

            {/* NEW: Children Thinking Styles Adventure - For Children (Ages 6-10) */}
            {thinkingStylesAssessment === 'Children' && hasCompletedAllThree() && (
            <div id="thinking-styles-section">
            <Card className="border-4 border-[#FF715B] bg-gradient-to-br from-white via-pink-50 to-purple-50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1 text-xs">
                    🎉 NEW: For Children
                  </Badge>
                  <Badge variant="outline" className="border-[#FF715B] text-[#FF715B]">
                    Ages 6-10
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF715B] to-[#5B7DB1] flex items-center justify-center shadow-lg">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl bg-gradient-to-r from-[#FF715B] via-[#6B4C9A] to-[#5B7DB1] bg-clip-text text-transparent">
                      🧠 Thinking Styles Adventure
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      Discover how your mind learns, solves, and creates!
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border-2 border-[#FF715B]/30">
                  <p className="text-sm text-gray-700 mb-3">
                    👋 <strong>Hey there, Thinker!</strong> Take a fun journey to discover:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xl">🎨</span>
                      <span>Creative Thinking</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xl">🔍</span>
                      <span>Analytical Thinking</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xl">🛠️</span>
                      <span>Practical Thinking</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xl">💭</span>
                      <span>Reflective Thinking</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-200">
                  <p className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <span className="text-lg">🎓</span>
                    Get SHS Program Recommendations!
                  </p>
                  <p className="text-xs text-gray-700">
                    Find out which Senior High School programs match your unique thinking powers
                  </p>
                </div>

                {hasCompletedAssessment('child-thinking') ? (
                  <Button 
                    onClick={() => {
                        const assessment = getLatestAssessment('child-thinking');
                        if (assessment) setViewingReport(assessment);
                    }}
                    className="w-full bg-gradient-to-r from-[#FF715B] via-[#6B4C9A] to-[#5B7DB1] hover:from-[#E6644F] hover:via-[#1AB5CC] hover:to-[#252770] text-white shadow-lg hover:shadow-xl transition-all text-base py-6"
                    size="lg"
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    View Your Thinking Adventure Report
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setShowChildrenAssessment(true)}
                    className="w-full bg-gradient-to-r from-[#FF715B] via-[#6B4C9A] to-[#5B7DB1] hover:from-[#E6644F] hover:via-[#1AB5CC] hover:to-[#252770] text-white shadow-lg hover:shadow-xl transition-all text-base py-6"
                    size="lg"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Your Thinking Adventure! 🚀
                  </Button>
                )}

                <p className="text-xs text-center text-gray-500">
                  ⏱️ Takes about 5-7 minutes • 24 fun questions with emoji responses 😕😐🙂😃🤩
                </p>
              </CardContent>
            </Card>
            </div>
            )}

            {trendData.length >= 1 && (
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-white via-purple-50 to-pink-50 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    Your Learning Style Trends
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Track how your learning preferences change over time
                  </CardDescription>
                </div>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1">
                  {trendData.length} Assessments
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-purple-200">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={trendData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient id="colorCE" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="colorRO" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="colorAC" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="colorAE" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="#e5e7eb" 
                      strokeOpacity={0.5}
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280"
                      style={{ fontSize: '12px', fontWeight: 500 }}
                      tick={{ fill: '#6b7280' }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      style={{ fontSize: '12px', fontWeight: 500 }}
                      tick={{ fill: '#6b7280' }}
                      domain={[0, 'dataMax + 10']}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '12px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                      }}
                      labelStyle={{ 
                        fontWeight: 600, 
                        color: '#1f2937',
                        marginBottom: '8px',
                        fontSize: '14px'
                      }}
                      itemStyle={{ 
                        padding: '4px 0',
                        fontSize: '13px',
                        fontWeight: 500
                      }}
                    />
                    <Legend 
                      wrapperStyle={{
                        paddingTop: '20px',
                        fontSize: '13px',
                        fontWeight: 500
                      }}
                      iconType="circle"
                      iconSize={10}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="CE" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      name="Concrete Experience" 
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 5, stroke: '#fff' }}
                      activeDot={{ r: 8, strokeWidth: 3, stroke: '#fff' }}
                      fill="url(#colorCE)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="RO" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="Reflective Observation" 
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5, stroke: '#fff' }}
                      activeDot={{ r: 8, strokeWidth: 3, stroke: '#fff' }}
                      fill="url(#colorRO)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="AC" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="Abstract Conceptualization" 
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 5, stroke: '#fff' }}
                      activeDot={{ r: 8, strokeWidth: 3, stroke: '#fff' }}
                      fill="url(#colorAC)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="AE" 
                      stroke="#f59e0b" 
                      strokeWidth={3}
                      name="Active Experimentation" 
                      dot={{ fill: '#f59e0b', strokeWidth: 2, r: 5, stroke: '#fff' }}
                      activeDot={{ r: 8, strokeWidth: 3, stroke: '#fff' }}
                      fill="url(#colorAE)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend with descriptions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                <div className="p-3 bg-red-50 rounded-lg border-2 border-red-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="font-bold text-xs text-red-900">Analytical / CE</span>
                  </div>
                  <p className="text-[11px] text-red-700">Logical reasoning & problem breakdown</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="font-bold text-xs text-blue-900">Creative / RO</span>
                  </div>
                  <p className="text-[11px] text-blue-700">Idea generation & reflective observation</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg border-2 border-emerald-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="font-bold text-xs text-emerald-900">Practical / AC</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">Real-world application & conceptualization</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border-2 border-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="font-bold text-xs text-amber-900">Overall Focus / AE</span>
                  </div>
                  <p className="text-[11px] text-amber-700">Active experimentation & retention</p>
                </div>
              </div>

              {/* Personalized AI Recommendations Section */}
              <div className="mt-6 pt-6 border-t border-purple-200/60 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-purple-600 text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-base text-gray-900 dark:text-white">
                    Personalized AI Recommendations & Study Tips
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getStudentRecommendations().map((rec, rIdx) => (
                    <div key={rIdx} className="bg-white/80 dark:bg-gray-900 p-3.5 rounded-xl border border-purple-100 dark:border-gray-800 shadow-xs flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {rIdx + 1}
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                        {rec}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
              </Card>
            )}

            {reflections.length > 0 && (
              <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Your Reflections
              </CardTitle>
              <CardDescription>
                Review your past reflections and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reflections.slice(0, 3).map(reflection => (
                  <div key={reflection.id} className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      {formatDate(reflection.createdAt)}
                    </p>
                    <p className="text-sm">{reflection.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="daily-challenges" className="space-y-6">
            {isChildrenUser() ? (
              <ChildrenDailyChallenges 
                key={challengeKey}
                userId={user.id}
                userName={user.name}
              />
            ) : (
              <>
                {/* Gamification Dashboard for ages 11-14+ */}
                <GamificationDashboard userId={user.id} />

                {/* Cognitive Growth shortcut */}
                <div
                  className="rounded-xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #5B7DB1, #6B4C9A)' }}
                  onClick={() => setShowingCognitiveGrowth(true)}
                >
                  <div className="text-white">
                    <p className="text-sm opacity-90 mb-0.5">Track your cognitive development</p>
                    <p className="text-xs opacity-70">XP · Milestones · Progress graphs</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 text-white text-xs px-3 py-1.5 rounded-full shrink-0">
                    🧠 My Growth →
                  </div>
                </div>
                
                {/* Original Daily Challenges */}
                <DailyChallengeTab 
                  key={challengeKey}
                  userId={user.id}
                  userName={user.name}
                  userAge={user.age || 18}
                />
              </>
            )}
          </TabsContent>

          {/* Children-specific tabs based on education level or age */}
          {isChildrenUser() && (
            <>
              <TabsContent value="mood-meter" className="space-y-6">
                <MindMoodMeter 
                  key={moodMeterKey}
                  userId={user.id}
                  userName={user.name}
                />
              </TabsContent>

              <TabsContent value="discoveries" className="space-y-6">
                <DiscoveryOfTheDay 
                  userId={user.id}
                  userName={user.name}
                />
              </TabsContent>
            </>
          )}

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

          <TabsContent value="parent-access" className="space-y-6">
            <ParentAccessRequests 
              userId={user.id}
            />
          </TabsContent>

          <FeedbackTab />

          <ProfileTab
            user={user}
            reflections={reflections}
            assessments={assessments}
            brainGymProgress={brainGymProgress}
            setActiveTab={setActiveTab}
            calculateAge={calculateAge}
            onAvatarChange={setAvatarUrl}
          />
          
          {/* School Profile Tab */}
          <TabsContent value="school-profile" className="space-y-6">
            <Card className="border-t-4 border-t-[#6B4C9A]">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#6B4C9A]/10 rounded-lg">
                    <Building2 className="h-6 w-6 text-[#6B4C9A]" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">School Profile</CardTitle>
                    <CardDescription>Details about your school and class</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">Institution</p>
                      <p className="font-semibold text-lg flex items-center gap-2">
                        {user.organizationName || user.school || 'Not assigned to a school'}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">Your Teacher / Class</p>
                      <p className="font-semibold text-lg flex items-center gap-2">
                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                        {(() => {
                          if (user.teacherName) return user.teacherName;
                          if (!user.teacherId) return 'No Teacher Assigned';
                          const allUsers = getAllUsers();
                          const teacher = allUsers.find(u => u.id === user.teacherId);
                          return teacher ? teacher.name : 'Unknown Teacher';
                        })()}
                      </p>
                    </div>

                  </div>
                  
                  <div className="p-6 bg-gradient-to-br from-[#6B4C9A]/10 to-[#7B61FF]/10 rounded-lg border flex flex-col items-center justify-center text-center">
                    <GraduationCap className="h-16 w-16 text-[#6B4C9A] mb-4 opacity-80" />
                    <h3 className="font-bold text-xl mb-2 text-[#6B4C9A]">JotMinds Scholar</h3>
                    <p className="text-muted-foreground">
                      Your assessments and progress are connected to your school. Keep completing challenges to show your class what you can do!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </DashboardLayout>
  );
}