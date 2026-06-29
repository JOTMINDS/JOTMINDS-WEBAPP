import { useState, useEffect, useMemo } from 'react';
import { User, Assessment } from '../types';
import { useAuth } from './AuthContext';
import { getUserAssessmentResults, getStudentsForTeacher } from '../utils/api';
import { fetchMyAssessmentResults, submitTeachingStyleAssessment, normalizeServerResults } from '../utils/assessmentApi';
import { getStudentsBySchool, getAllUsers, getAllAssessments, getAssessmentsByUserId, saveAssessment, generateId, saveAssessmentProgress, getAssessmentProgress, clearAssessmentProgress } from '../utils/storage';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { ArrowRight, History, RefreshCcw, Calendar, AlertCircle, Eye, ArrowLeft, ClipboardList } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { 
  TeacherAppHeader, 
  TeacherTabBar, 
  TeacherClassOverview, 
  TeacherIndividualStudentView 
} from './teacher';
import { TeachingStyleAssessment } from './TeachingStyleAssessment';
import { TeachingStyleResults } from './TeachingStyleResults';
import { TeacherStudentManagement } from './TeacherStudentManagement';
import { calculateTeachingStyleScore } from '../utils/teachingStyleScoring';
import { getUserJotsCode } from '../utils/jotsCode';
import { AdultThinkingContainer } from './AdultThinkingContainer';
import { teachingStyleQuestions } from '../utils/teachingStyleQuestions';
import { generateDeepDiveQuestions } from '../utils/teachingStyleData';

interface TeacherDashboardNewProps {
  user: User;
  onLogout: () => void;
  onViewAnalytics?: () => void;
  onViewPrivacy?: () => void;
  onViewEngagement?: () => void;
  onViewTeacherIntelligence?: () => void;
  onViewSchoolAnalytics?: () => void;
  onViewPlatformEssentials?: () => void;
  onStartAssessment?: (type: 'learning' | 'thinking' | 'decision') => void;
  onViewInstitutionDashboard?: () => void;
  onViewSettings?: () => void;
}

export function TeacherDashboardNew({ user, onLogout, onViewAnalytics, onViewPrivacy, onViewEngagement, onViewTeacherIntelligence, onViewSchoolAnalytics, onViewPlatformEssentials, onStartAssessment, onViewInstitutionDashboard, onViewSettings }: TeacherDashboardNewProps) {
  const { impersonatedUser } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [allAssessments, setAllAssessments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'individual' | 'my-style' | 'teaching-style' | 'manage-class'>('individual');
  const [loading, setLoading] = useState(true);
  const [myAssessments, setMyAssessments] = useState<Assessment[]>([]);
  const [isTakingAssessment, setIsTakingAssessment] = useState(false);
  const [initialResponses, setInitialResponses] = useState<number[]>([]);
  const [initialQuestions, setInitialQuestions] = useState<any[]>([]);
  const [initialPage, setInitialPage] = useState<number>(0);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [targetStudentId, setTargetStudentId] = useState<string | null>(null);
  const [showingThinkingAssessment, setShowingThinkingAssessment] = useState(false);
  const [serverAssessments, setServerAssessments] = useState<any[]>([]);

  useEffect(() => {
    loadClassData();
    loadMyAssessments();
    loadServerAssessments();
  }, [user.id, impersonatedUser]);

  const loadMyAssessments = () => {
    const assessments = getAssessmentsByUserId(user.id);
    setMyAssessments(assessments);
  };

  const loadServerAssessments = async () => {
    try {
      const results = await fetchMyAssessmentResults();
      // Normalize server results into the same shape used locally
      setServerAssessments(normalizeServerResults(results));
    } catch (e) {
      console.error('[TeacherDashboard] Failed to load server assessments:', e);
    }
  };

  const startAssessment = () => {
      // Check for saved progress
      const progress = getAssessmentProgress(user.id, 'teaching-style', !!user.organizationName);
      if (progress && progress.responses) {
          setInitialResponses(progress.responses);
          if (progress.questions && progress.questions.length > 0) {
              setInitialQuestions(progress.questions);
          }
          setInitialPage(progress.currentQuestion || 0);
          toast.info("Resuming from your last saved session.");
      } else {
          setInitialResponses([]);
          setInitialQuestions([]);
          setInitialPage(0);
      }
      setIsTakingAssessment(true);
  };

  const handleSaveProgress = (responses: number[], currentSection: number, questions?: any[]) => {
      saveAssessmentProgress({
          userId: user.id,
          assessmentType: 'teaching-style',
          isOrganizational: !!user.organizationName,
          currentQuestion: currentSection, // Roughly maps to section index here
          responses,
          questions: questions || [], 
          lastSaved: new Date().toISOString()
      });
  };

  const loadClassData = async () => {
    setLoading(true);
    let studentUsers: User[] = [];
    let assessmentsForStats: any[] = [];
    
    try {
      // If viewing as admin (impersonated user), fetch from API
      if (impersonatedUser) {
        const { results: assessmentResults } = await getUserAssessmentResults(user.id);
        assessmentsForStats = assessmentResults || [];
        
        const allUsers = getAllUsers();
        studentUsers = allUsers.filter(u => u.role === 'student' && (u.teacherId === user.id || (u.linkedTeachers && u.linkedTeachers.includes(user.id))));
      } else {
        // Regular teacher viewing their own data
        
        // 1. Fetch from server
        let serverStudents: User[] = [];
        let serverAssessments: any[] = [];
        try {
          const response = await getStudentsForTeacher();
          if (response.success && response.students) {
            serverStudents = response.students;
            serverAssessments = serverStudents.flatMap((s: any) => s.assessments || []);
          }
        } catch (err) {
          console.log('[TeacherDashboardNew] Failed to fetch server students:', err);
        }

        // 2. Fetch from local storage
        let localStudents: User[] = [];
        const allUsers = getAllUsers();
        localStudents = allUsers.filter(u => u.role === 'student' && (u.teacherId === user.id || (u.linkedTeachers && u.linkedTeachers.includes(user.id))));
        
        const localAssessments = getAllAssessments();

        // 3. Merge avoiding duplicates (server takes precedence)
        const mergedStudentsMap = new Map();
        localStudents.forEach(stu => mergedStudentsMap.set(stu.email?.toLowerCase() || stu.id, stu));
        serverStudents.forEach(stu => mergedStudentsMap.set(stu.email?.toLowerCase() || stu.id, stu));
        
        studentUsers = Array.from(mergedStudentsMap.values());
        
        // 4. Merge assessments
        const mergedAssessmentsMap = new Map();
        localAssessments.forEach((a: any) => mergedAssessmentsMap.set(a.id, a));
        serverAssessments.forEach((a: any) => mergedAssessmentsMap.set(a.id, a));
        
        assessmentsForStats = Array.from(mergedAssessmentsMap.values());
      }

      setStudents(studentUsers);
      setAllAssessments(assessmentsForStats);
    } catch (error) {
      console.error('Error loading class data:', error);
      // Don't show toast for JSON error to avoid spamming user if LS is messy
      // toast.error('Failed to load class data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentComplete = async (responses: number[]) => {
    const score = calculateTeachingStyleScore(responses);
    
    const newAssessment: Assessment = {
      id: generateId(),
      userId: user.id,
      type: 'teaching-style',
      responses,
      score: {
        'teaching-style': score
      },
      completedAt: new Date().toISOString(),
      completed: true
    };

    saveAssessment(newAssessment);
    clearAssessmentProgress(user.id, 'teaching-style', !!user.organizationName);

    // Sync Teaching Style to the server KV store
    try {
      await submitTeachingStyleAssessment(responses, score);
      console.log('[TeacherDashboardNew] Successfully synced teaching-style to server KV');
    } catch (err) {
      console.error('[TeacherDashboardNew] Failed to sync teaching-style to server KV:', err);
    }

    setMyAssessments([...myAssessments, newAssessment]);
    setIsTakingAssessment(false);
    toast.success('Assessment completed successfully!');
  };

  const teachingStyleAssessments = useMemo(() => 
    [...myAssessments, ...serverAssessments]
      .filter(a => a.type === 'teaching-style')
      .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime()),
    [myAssessments, serverAssessments]
  );

  // Merge server + local assessments for cognitive profile
  const allMyAssessments = useMemo(() => {
    const merged = [...myAssessments, ...serverAssessments];
    // De-duplicate: server results override local by type
    const seen = new Map<string, any>();
    merged.forEach(a => {
      const key = a.type;
      if (!seen.has(key) || (a.fromServer && !seen.get(key).fromServer)) {
        seen.set(key, a);
      }
    });
    return Array.from(seen.values());
  }, [myAssessments, serverAssessments]);

  const displayedAssessment = useMemo(() => {
    if (selectedHistoryId) {
        return teachingStyleAssessments.find(a => a.id === selectedHistoryId) || teachingStyleAssessments[0];
    }
    return teachingStyleAssessments[0];
  }, [teachingStyleAssessments, selectedHistoryId]);

  const handleDeepDive = () => {
    if (displayedAssessment) {
        setInitialResponses(displayedAssessment.responses);
        // Generate a smart subset of ~48 questions for deep dive instead of full 140
        const deepDiveQuestions = generateDeepDiveQuestions(8);
        setInitialQuestions(deepDiveQuestions);
        setIsTakingAssessment(true);
    }
  };

  const handleRetakeAssessment = () => {
    if (window.confirm("Are you sure you want to start a new assessment? Your previous results will be saved in your history.")) {
        // Clear any saved progress to start fresh
        clearAssessmentProgress(user.id, 'teaching-style', !!user.organizationName);
        setInitialResponses([]);
        setInitialQuestions([]);
        setIsTakingAssessment(true);
        setSelectedHistoryId(null); // Ensure we aren't viewing history when retaking
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FF] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading class data...</p>
        </div>
      </div>
    );
  }

  // Show thinking style (Adult) assessment full screen
  if (showingThinkingAssessment) {
    return (
      <AdultThinkingContainer
        userId={user.id}
        userName={user.name}
        onComplete={() => { setShowingThinkingAssessment(false); loadMyAssessments(); }}
        onCancel={() => setShowingThinkingAssessment(false)}
      />
    );
  }

  // If taking assessment, show it full screen or within layout
  if (activeTab === 'teaching-style' && isTakingAssessment) {
    return (
      <TeachingStyleAssessment 
        onComplete={handleAssessmentComplete}
        onBack={() => setIsTakingAssessment(false)}
        initialResponses={initialResponses}
        initialQuestions={initialQuestions}
        initialPage={initialPage}
        onSaveProgress={handleSaveProgress}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FF]">
      <TeacherAppHeader
        user={user}
        onLogout={onLogout}
        onViewAnalytics={onViewAnalytics}
        onViewPrivacy={onViewPrivacy}
        onViewEngagement={onViewEngagement}
        onViewTeacherIntelligence={onViewTeacherIntelligence}
        onViewInstitutionDashboard={onViewInstitutionDashboard}
        onViewSettings={onViewSettings}
      />
      <TeacherTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Onboarding Info for New Teachers */}
      {students.length === 0 && activeTab !== 'my-style' && (
        <div className="px-4 lg:px-6 py-4 max-w-[960px] mx-auto">
          <Alert className="border-[#2563EB] bg-blue-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Welcome to JotMinds Teacher Portal!</AlertTitle>
            <AlertDescription>
              Students from <strong>{user.school}</strong> will automatically appear here once they register and complete their assessments. 
              Students must select the same school name during registration to be linked to your class.
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {activeTab === 'overview' && (
        <TeacherClassOverview students={students} assessments={allAssessments} />
      )}
      
      {activeTab === 'individual' && (
        <TeacherIndividualStudentView students={students} assessments={allAssessments} initialStudentId={targetStudentId} />
      )}

      {activeTab === 'my-style' && (
        <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-8">
          {/* Profile Management Card */}
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">👤</span> Account & Profile Settings
              </CardTitle>
              <CardDescription>
                Manage your personal information, contact details, and account preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <Button onClick={onViewSettings} variant="default" className="bg-[#6B4C9A] hover:bg-[#5B3A8A]">
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Jots Code — school linkage info for teacher */}
          {(() => {
            const jc = getUserJotsCode(user);
            if (!jc) return null;
            return (
              <div className="rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap" style={{ background: 'linear-gradient(135deg, #5B7DB1, #6B4C9A)' }}>
                <div className="text-white">
                  <p className="text-xs text-white/70 mb-0.5">Your School Jots Code (Organisation Code)</p>
                  <div className="text-xl tracking-widest">{jc}</div>
                  <p className="text-xs text-white/60 mt-0.5">Your School administrator uses this code to view your teaching methods.</p>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(jc)}
                  className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg border border-white/30 transition-colors"
                >
                  Copy Code
                </button>
              </div>
            );
          })()}

          {/* Cognitive Profile — all 3 core assessments */}
          {(() => {
            const completed = allMyAssessments.filter(a => a.completedAt && a.score);

            // Learning Style (Kolb)
            const kolbA = completed.filter(a => a.type === 'kolb' || a.type === 'learning').sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
            const kolb = kolbA?.score?.kolb || kolbA?.score?.learning;

            // Thinking Style
            const thinkA = completed.filter(a => ['sternberg','adult-thinking','shs-thinking','jhs-thinking','thinking'].includes(a.type)).sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
            const thinkRaw = thinkA?.score?.sternberg || thinkA?.score?.['adult-thinking'] || thinkA?.score?.['shs-thinking'] || thinkA?.score?.['jhs-thinking'] || thinkA?.score?.thinking;
            const thinkStyle = thinkRaw?.style || thinkRaw?.primaryStyle || thinkRaw?.dominantStyle || null;
            const thinkScores: Record<string, number> = thinkRaw?.scores || {};

            // Decision Style
            const dualA = completed.filter(a => a.type === 'dual-process' || a.type === 'decision').sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
            const dual = dualA?.score?.dualProcess || dualA?.score?.decision || dualA?.score?.['dual-process'];

            const THINK_COLORS: Record<string, string> = { Analytical: '#5B7DB1', Creative: '#6B4C9A', Practical: '#1E8A6E', Reflective: '#E0A020' };
            const KOLB_COLORS: Record<string, string> = { Diverging: '#EC4899', Assimilating: '#5B7DB1', Converging: '#1E8A6E', Accommodating: '#E0A020' };
            const DUAL_COLORS: Record<string, string> = { Intuitive: '#F97316', Reflective: '#6B4C9A', Balanced: '#1E8A6E' };

            const doneCount = [!!kolb, !!thinkStyle, !!dual].filter(Boolean).length;

            return (
              <Card className="border-2 border-[#6B4C9A]/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-base">
                      <span>🧬</span> Cognitive Profile
                    </div>
                    <Badge style={{ backgroundColor: doneCount === 3 ? '#1E8A6E20' : '#E0A02020', color: doneCount === 3 ? '#1E8A6E' : '#E0A020' }}>
                      {doneCount}/3 complete
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    All 3 core assessments — visible to your school in their Combined Analysis report. Complete all three to unlock your full educator profile.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">

                  {/* 1. Learning Style */}
                  <div className="p-3 rounded-lg border" style={{ borderColor: kolb ? KOLB_COLORS[kolb.style] + '40' : '#e5e7eb', backgroundColor: kolb ? KOLB_COLORS[kolb.style] + '06' : '#f9fafb' }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-800">📚 Learning Style (Kolb)</p>
                      <div className="flex items-center gap-2">
                        {kolb && <Badge style={{ backgroundColor: KOLB_COLORS[kolb.style] + '20', color: KOLB_COLORS[kolb.style] }} className="text-[10px]">{kolb.style}</Badge>}
                        <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => onStartAssessment?.('learning')}>
                          {kolb ? 'Retake' : 'Take'}
                        </Button>
                      </div>
                    </div>
                    {kolb && (
                      <div className="grid grid-cols-2 gap-2">
                        {[['CE', kolb.scores.CE, 48], ['RO', kolb.scores.RO, 48], ['AC', kolb.scores.AC, 48], ['AE', kolb.scores.AE, 48]].map(([k, v, max]) => (
                          <div key={String(k)}>
                            <div className="flex justify-between text-[10px] text-gray-500 mb-0.5"><span>{String(k)}</span><span>{Number(v)}/{max}</span></div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="h-1.5 rounded-full" style={{ width: `${Math.round((Number(v) / Number(max)) * 100)}%`, backgroundColor: KOLB_COLORS[kolb.style] }} /></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2. Thinking Style */}
                  <div className="p-3 rounded-lg border" style={{ borderColor: thinkStyle ? THINK_COLORS[thinkStyle] + '40' : '#e5e7eb', backgroundColor: thinkStyle ? THINK_COLORS[thinkStyle] + '06' : '#f9fafb' }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-800">🧠 Thinking Style</p>
                      <div className="flex items-center gap-2">
                        {thinkStyle && <Badge style={{ backgroundColor: THINK_COLORS[thinkStyle] + '20', color: THINK_COLORS[thinkStyle] }} className="text-[10px]">{thinkStyle}</Badge>}
                        <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => setShowingThinkingAssessment(true)}>
                          {thinkStyle ? 'Retake' : 'Take'}
                        </Button>
                      </div>
                    </div>
                    {thinkStyle && (
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(thinkScores).filter(([k]) => ['analytical','creative','practical','reflective'].includes(k.toLowerCase())).map(([dim, val]) => {
                          const v = Number(val); const max = v > 1 ? 30 : 100;
                          const capitalizedDim = dim.charAt(0).toUpperCase() + dim.slice(1).toLowerCase();
                          return (
                            <div key={dim}>
                              <div className="flex justify-between text-[10px] text-gray-500 mb-0.5"><span className="capitalize">{dim}</span><span>{v}</span></div>
                              <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, Math.round((v / max) * 100))}%`, backgroundColor: THINK_COLORS[capitalizedDim] || '#9ca3af' }} /></div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 3. Decision Style */}
                  <div className="p-3 rounded-lg border" style={{ borderColor: dual ? DUAL_COLORS[dual.style] + '40' : '#e5e7eb', backgroundColor: dual ? DUAL_COLORS[dual.style] + '06' : '#f9fafb' }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-800">⚡ Decision Style</p>
                      <div className="flex items-center gap-2">
                        {dual && <Badge style={{ backgroundColor: DUAL_COLORS[dual.style] + '20', color: DUAL_COLORS[dual.style] }} className="text-[10px]">{dual.style}</Badge>}
                        <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => onStartAssessment?.('decision')}>
                          {dual ? 'Retake' : 'Take'}
                        </Button>
                      </div>
                    </div>
                    {dual?.scores && (
                      <div className="grid grid-cols-2 gap-2">
                        {[['Intuitive', dual.scores.intuitive ?? dual.scores.system1 ?? dual.scores.System1 ?? 0], ['Reflective', dual.scores.reflective ?? dual.scores.system2 ?? dual.scores.System2 ?? 0]].map(([k, v]) => (
                          <div key={String(k)}>
                            <div className="flex justify-between text-[10px] text-gray-500 mb-0.5"><span>{String(k)}</span><span>{Number(v)}</span></div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, Math.round((Number(v) / 100) * 100))}%`, backgroundColor: DUAL_COLORS[dual.style] }} /></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {doneCount < 3 && (
                    <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                      Complete all 3 assessments to unlock your full Combined Analysis in your school's dashboard.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })()}
        </div>
      )}

      {activeTab === 'teaching-style' && (
        <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-8">
          {displayedAssessment ? (
            <div className="space-y-8">
                {selectedHistoryId && (
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => setSelectedHistoryId(null)}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Latest Result
                        </Button>
                        <Badge variant="outline" className="text-sm">
                            Viewing Historical Result: {new Date(displayedAssessment.completedAt || "").toLocaleDateString()}
                        </Badge>
                    </div>
                )}

                <TeachingStyleResults 
                    score={displayedAssessment.score['teaching-style']} 
                    onDeepDive={
                        // Only show Deep Dive for LATEST assessment and if incomplete
                        (!selectedHistoryId && displayedAssessment.responses.filter(r => r > 0).length < 40)
                        ? handleDeepDive
                        : undefined
                    }
                />
                
                {!selectedHistoryId && (
                    <div className="flex justify-center">
                        <Button 
                            onClick={handleRetakeAssessment} 
                            size="lg" 
                            variant="outline"
                            className="gap-2 border-indigo-200 hover:bg-indigo-50 text-indigo-700"
                        >
                            <RefreshCcw className="h-4 w-4" />
                            Retake Teaching Style Assessment
                        </Button>
                    </div>
                )}

                {teachingStyleAssessments.length > 1 && !selectedHistoryId && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5 text-muted-foreground" />
                                Assessment History
                            </CardTitle>
                            <CardDescription>
                                Track how your teaching style has evolved over time.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {teachingStyleAssessments.slice(1).map((assessment) => (
                                    <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                                                <Calendar className="h-5 w-5 text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    {assessment.score['teaching-style'].primaryStyle}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Completed on {new Date(assessment.completedAt || "").toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">
                                                {new Date(assessment.completedAt || "").toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </Badge>
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedHistoryId(assessment.id)}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Report
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
          ) : (
             <div className="text-center py-12 bg-white rounded-xl shadow-sm border p-8">
                <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🎓</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">Discover Your Teaching Style</h2>
                <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                    Take the JotMinds Teaching Style Assessment to uncover your dominant teaching engines, strengths, and areas for growth. This 64-question assessment maps your authority, motivation, and instructional preferences.
                </p>
                <button 
                    onClick={startAssessment}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
                >
                    {getAssessmentProgress(user.id, 'teaching-style', !!user.organizationName) ? 'Resume Assessment' : 'Start Assessment'}
                </button>
             </div>
          )}

          {/* All Assessment History */}
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-indigo-600" />
                Complete Assessment History
              </CardTitle>
              <CardDescription>
                A unified list of all assessments you have taken on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const completed = [...allMyAssessments, ...allAssessments]
                  .filter(a => a.userId === user.id && a.completedAt && a.score)
                  .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

                if (completed.length === 0) {
                  return <div className="text-gray-500 text-sm text-center py-4">You have not completed any assessments yet.</div>;
                }

                return (
                  <div className="space-y-3">
                    {completed.map((assmt, idx) => (
                      <div key={assmt.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                        <div>
                          <h5 className="font-semibold text-gray-900 capitalize flex items-center gap-2">
                            {assmt.type.replace('-', ' ')}
                            <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">Completed</Badge>
                          </h5>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(assmt.completedAt!).toLocaleDateString()} at {new Date(assmt.completedAt!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                        
                        <div className="mt-3 sm:mt-0 text-sm bg-white border px-3 py-2 rounded-md">
                          {assmt.type === 'teaching-style' ? (
                            <div className="text-xs">
                              <span className="text-gray-500">Primary:</span> <span className="font-medium text-indigo-700">{assmt.score['teaching-style']?.primaryStyle || 'N/A'}</span>
                            </div>
                          ) : assmt.type === 'kolb' ? (
                            <div className="text-xs">
                              <span className="text-gray-500">Style:</span> <span className="font-medium text-pink-600">{assmt.score.kolb?.style || 'N/A'}</span>
                            </div>
                          ) : assmt.type === 'dual-process' ? (
                            <div className="text-xs">
                              <span className="text-gray-500">Style:</span> <span className="font-medium text-orange-600">{assmt.score.dualProcess?.style || 'N/A'}</span>
                            </div>
                          ) : (
                            <div className="text-xs">
                              <span className="text-gray-500">Style:</span> <span className="font-medium text-blue-600">
                                {assmt.score?.sternberg?.style || assmt.score?.['adult-thinking']?.primaryStyle || assmt.score?.['shs-thinking']?.primaryStyle || assmt.score?.['jhs-thinking']?.primaryStyle || 'N/A'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'manage-class' && (
        <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-8">
          <TeacherStudentManagement 
            teacher={user} 
            onViewReport={(studentId) => {
              setTargetStudentId(studentId);
              setActiveTab('individual');
            }}
          />
        </div>
      )}
    </div>
  );
}
