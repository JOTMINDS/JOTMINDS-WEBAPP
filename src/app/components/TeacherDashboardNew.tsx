import { formatDateTime } from '../utils/dateFormat';
import { useState, useEffect, useMemo } from 'react';
import { User, Assessment } from '../types';
import { useAuth } from './AuthContext';
import { getStudentsForTeacher, getAllAssessmentResults } from '../utils/api';
import { fetchMyAssessmentResults, submitTeachingStyleAssessment, normalizeServerResults } from '../utils/assessmentApi';
import { getStudentsBySchool, getAllUsers, getAllAssessments, getAssessmentsByUserId, saveAssessment, generateId, saveAssessmentProgress, getAssessmentProgress, clearAssessmentProgress, getAllClasses, getAssignmentsForTeacher, isStudentConnectedToTeacher, getRelatedTeacherAccounts } from '../utils/storage';
import { getInstitutionClasses, getInstitutionForMember } from '../utils/institution';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { ArrowRight, History, RefreshCcw, Calendar, AlertCircle, Eye, ArrowLeft, ClipboardList, Download, Users, BarChart3, GraduationCap, Brain, Sparkles } from 'lucide-react';
import { exportReportToPDF } from '../utils/pdfGenerator';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { 
  TeacherClassOverview 
} from './teacher';
import { JTIAAssessmentTaking } from './JTIAAssessmentTaking';
import { JTIAReport } from './JTIAReport';
import { JTIASchoolDashboard } from './JTIASchoolDashboard';
import { calculateJTIAScore, JTIAReportData } from '../utils/jtiaScoring';
import { TeacherStudentManagement } from './TeacherStudentManagement';
import { generateDeepDiveQuestions } from '../utils/teachingStyleData';
import { AdultThinkingContainer } from './AdultThinkingContainer';
import { AILessonPlannerContainer } from './lessonPlanner/AILessonPlannerContainer';
import { DashboardLayout } from './ui/dashboard-layout';
import { NavGroup } from './ui/collapsible-sidebar';
import { CentralStudentManagement } from './CentralStudentManagement';
import { CentralAnalyticsHub } from './CentralAnalyticsHub';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'analytics' | 'lesson-planner' | 'jtia'>('overview');
  const [loading, setLoading] = useState(true);
  const [myAssessments, setMyAssessments] = useState<Assessment[]>([]);
  const [isTakingAssessment, setIsTakingAssessment] = useState(false);
  const [initialResponses, setInitialResponses] = useState<number[]>([]);
  const [initialQuestions, setInitialQuestions] = useState<any[]>([]);
  const [initialPage, setInitialPage] = useState<number>(0);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [jtiaSubTab, setJtiaSubTab] = useState<'profile' | 'cognitive' | 'school'>('profile');
  const [targetStudentId, setTargetStudentId] = useState<string | null>(null);
  const [showingThinkingAssessment, setShowingThinkingAssessment] = useState(false);
  const [serverAssessments, setServerAssessments] = useState<any[]>([]);

  useEffect(() => {
    const initClasses = async () => {
      try {
        let instId = (user as any).institutionId || '';
        if (!instId) {
          const inst = await getInstitutionForMember(user.id);
          if (inst) instId = inst.id;
        }
        await getInstitutionClasses(instId);
      } catch (e) {
        console.warn('Failed to sync classes from server:', e);
      }
      loadClassData();
    };
    initClasses();
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
      // Check for saved progress (only JTIA, never legacy teaching-style)
      const progress = getAssessmentProgress(user.id, 'jtia', !!user.organizationName);
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
          assessmentType: 'jtia',
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
        const allUsers = getAllUsers();
        const classes = getAllClasses();
        const assignments = getAssignmentsForTeacher(user.id);
        const teacherClassIds = new Set<string>();
        classes.filter(c => !c.classTeacherId || c.classTeacherId === user.id || c.classTeacherId === user.email || c.id === user.classId || c.name === user.className).forEach(c => teacherClassIds.add(c.id));
        assignments.forEach(a => teacherClassIds.add(a.classId));
        
        studentUsers = allUsers.filter(u => isStudentConnectedToTeacher(u, user, teacherClassIds));
        
        // Fetch assessments for the teacher's students (not the teacher themselves)
        if (studentUsers.length > 0) {
          const studentIds = studentUsers.map(s => s.id);
          const chunkSize = 50;
          for (let i = 0; i < studentIds.length; i += chunkSize) {
            const chunk = studentIds.slice(i, i + chunkSize);
            try {
              const res = await getAllAssessmentResults(chunk);
              const rawResults = res?.results || (Array.isArray(res) ? res : []);
              const normalized = rawResults.map((r: any) => {
                if (r.type && r.score) return r;
                const assessmentType = r.assessmentType || r.type || 'unknown';
                const rawScores = r.results || r.score || {};
                let score: any = {};
                if (assessmentType === 'kolb') {
                  score.kolb = { style: rawScores.style || '', scores: rawScores };
                } else if (assessmentType === 'sternberg') {
                  score.sternberg = { style: rawScores.style || '', scores: rawScores };
                } else if (assessmentType === 'dual-process') {
                  score.dualProcess = { style: rawScores.style || '', scores: rawScores };
                } else {
                  score[assessmentType] = rawScores;
                }
                let userId = r.userId;
                if (!userId && r.id) {
                  const parts = r.id.split(':');
                  if (parts.length >= 2) userId = parts[1];
                }
                return {
                  id: r.id || `${assessmentType}-${userId}`,
                  userId,
                  type: assessmentType,
                  completed: true,
                  completedAt: r.completedAt,
                  score
                };
              }).filter((a: any) => a.completedAt);
              assessmentsForStats.push(...normalized);
            } catch (e) {
              console.error('Failed to fetch student assessments:', e);
            }
          }
        }
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
            
            if (serverAssessments.length === 0 && serverStudents.length > 0) {
              const studentIds = serverStudents.map(s => s.id);
              const chunkSize = 50;
              for (let i = 0; i < studentIds.length; i += chunkSize) {
                const chunk = studentIds.slice(i, i + chunkSize);
                try {
                  const res = await getAllAssessmentResults(chunk);
                  const rawResults = res?.results || (Array.isArray(res) ? res : []);
                  // Normalize raw KV records into the shape the frontend expects
                  const normalized = rawResults.map((r: any) => {
                    // If already in the expected shape, pass through
                    if (r.type && r.score) return r;
                    // Otherwise transform from raw KV shape
                    const assessmentType = r.assessmentType || r.type || 'unknown';
                    const rawScores = r.results || r.score || {};
                    let score: any = {};
                    if (assessmentType === 'kolb') {
                      score.kolb = { style: rawScores.style || '', scores: rawScores };
                    } else if (assessmentType === 'sternberg') {
                      score.sternberg = { style: rawScores.style || '', scores: rawScores };
                    } else if (assessmentType === 'dual-process') {
                      score.dualProcess = { style: rawScores.style || '', scores: rawScores };
                    } else {
                      score[assessmentType] = rawScores;
                    }
                    // Extract userId from the KV key if not present
                    let userId = r.userId;
                    if (!userId && r.id) {
                      const parts = r.id.split(':');
                      if (parts.length >= 2) userId = parts[1];
                    }
                    return {
                      id: r.id || `${assessmentType}-${userId}`,
                      userId: userId,
                      type: assessmentType,
                      completed: true,
                      completedAt: r.completedAt,
                      score: score
                    };
                  }).filter((a: any) => a.completedAt);
                  serverAssessments.push(...normalized);
                } catch (e) {
                  console.error('Failed to fetch assessments chunk:', e);
                }
              }
            }
          }
        } catch (err) {
          console.log('[TeacherDashboardNew] Failed to fetch server students:', err);
        }

        // 2. Fetch from local storage
        let localStudents: User[] = [];
        const allUsers = getAllUsers();
        const classes = getAllClasses();
        const relatedTeachers = getRelatedTeacherAccounts(user);
        
        const teacherClassIds = new Set<string>();
        relatedTeachers.forEach(rt => {
          classes.filter(c => !c.classTeacherId || c.classTeacherId === rt.id || c.classTeacherId === rt.email || c.id === rt.classId || c.name === rt.className).forEach(c => teacherClassIds.add(c.id));
          getAssignmentsForTeacher(rt.id).forEach(a => teacherClassIds.add(a.classId));
        });
        
        localStudents = allUsers.filter(u => relatedTeachers.some(rt => isStudentConnectedToTeacher(u, rt, teacherClassIds)));
        
        // Scope local assessments to connected students by ID or Email
        const localStudentKeys = new Set<string>();
        localStudents.forEach(s => {
          if (s.id) localStudentKeys.add(s.id.toLowerCase());
          if (s.email) localStudentKeys.add(s.email.toLowerCase());
        });
        const localAssessments = getAllAssessments().filter((a: any) => {
          if (!a) return false;
          const aId = a.userId?.toLowerCase();
          const aEmail = (a.userEmail || a.email)?.toLowerCase();
          return (aId && localStudentKeys.has(aId)) || (aEmail && localStudentKeys.has(aEmail));
        });

        // 3. Merge avoiding duplicates (server takes precedence)
        const mergedStudentsMap = new Map();
        localStudents.forEach(stu => mergedStudentsMap.set(stu.email?.toLowerCase() || stu.id, stu));
        serverStudents.forEach(stu => mergedStudentsMap.set(stu.email?.toLowerCase() || stu.id, stu));
        
        // Fallback: If no students matched strict filter, include all student users in the system
        if (mergedStudentsMap.size === 0) {
          allUsers.forEach((u: User) => {
            if (u.id !== user.id && u.email?.toLowerCase() !== user.email?.toLowerCase()) {
              if (!['teacher', 'head_teacher', 'admin', 'school_admin', 'super_admin', 'supervisor', 'parent'].includes(u.role || '')) {
                mergedStudentsMap.set(u.email?.toLowerCase() || u.id, u);
              }
            }
          });
        }

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

  const handleAssessmentComplete = async (responses: number[], report?: JTIAReportData) => {
    const jtiaReport = report || calculateJTIAScore(responses);
    
    const newAssessment: Assessment = {
      id: generateId(),
      userId: user.id,
      type: 'jtia',
      responses,
      score: {
        jtia: jtiaReport
      },
      completedAt: new Date().toISOString(),
      completed: true
    };

    saveAssessment(newAssessment);
    clearAssessmentProgress(user.id, 'jtia', !!user.organizationName);

    // Sync JTIA to the server KV store
    try {
      await submitTeachingStyleAssessment(responses, { jtia: jtiaReport } as any);
      console.log('[TeacherDashboardNew] Successfully synced jtia to server KV');
    } catch (err) {
      console.error('[TeacherDashboardNew] Failed to sync jtia to server KV:', err);
    }

    setMyAssessments([...myAssessments, newAssessment]);
    setIsTakingAssessment(false);
    toast.success('JTIA Assessment completed successfully!');
  };

  const teachingStyleAssessments = useMemo(() => 
    [...myAssessments, ...serverAssessments]
      .filter(a => a.type === 'jtia')
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
        clearAssessmentProgress(user.id, 'jtia', !!user.organizationName);
        setInitialResponses([]);
        setInitialQuestions([]);
        setIsTakingAssessment(true);
        setSelectedHistoryId(null); // Ensure we aren't viewing history when retaking
    }
  };

  const handleDownloadCognitiveResults = async () => {
    toast.loading('Preparing your report…', { id: 'cog-pdf' });
    const ok = await exportReportToPDF(
      'teacher-cognitive-report',
      `${(user.name || 'JotMinds').replace(/\s+/g, '-')}-cognitive-profile.pdf`,
    );
    if (ok) toast.success('Report downloaded', { id: 'cog-pdf' });
    else toast.error('Could not generate the report', { id: 'cog-pdf' });
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
  if (activeTab === 'jtia' && isTakingAssessment) {
    return (
      <div className="min-h-screen bg-[#F5F7FF] py-8 px-4">
        <JTIAAssessmentTaking
          userId={user.id}
          onComplete={(report, responses) => {
            handleAssessmentComplete(responses, report);
          }}
          onCancel={() => setIsTakingAssessment(false)}
          initialResponses={initialResponses}
        />
      </div>
    );
  }

  const teacherNavGroups: NavGroup[] = [
    {
      groupLabel: 'Educator Portal',
      items: [
        { id: 'overview', label: 'Overview', icon: Users },
        { id: 'students', label: 'Students', icon: Eye, badge: students.length },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'lesson-planner', label: 'Lesson Planner', icon: ClipboardList },
        { id: 'jtia', label: 'Teaching Insights', icon: GraduationCap },
      ]
    }
  ];

  const teacherHeaderContent = (
    <div className="w-full flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
          {activeTab === 'jtia' ? 'Teaching Insights' : activeTab.replace('-', ' ')}
        </h2>
        {user.school && (
          <Badge variant="outline" className="border-purple-600 text-purple-700">
            {user.school}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="default" 
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium shadow-sm flex items-center gap-1.5" 
          size="sm" 
          onClick={() => setActiveTab('analytics')}
        >
          <Brain className="w-4 h-4" />
          Central Analytics Hub
        </Button>
        {onViewInstitutionDashboard && (
          <Button variant="outline" size="sm" onClick={onViewInstitutionDashboard}>
            School Dashboard
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout
      navGroups={teacherNavGroups}
      activeTab={activeTab}
      setActiveTab={(tab: any) => {
        setActiveTab(tab);
      }}
      user={user}
      onLogout={onLogout}
      brandSubtitle="Educator Portal"
      onOpenSettings={onViewSettings}
      headerContent={teacherHeaderContent}
    >
      <div className="max-w-5xl mx-auto w-full space-y-6">

        {/* Students connected banner — visible on class-related tabs */}
        {['overview', 'students', 'analytics'].includes(activeTab) && (
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-white" style={{ background: 'linear-gradient(135deg, #5B7DB1, #6B4C9A)' }}>
            <span className="text-xl" aria-hidden>👥</span>
            <div>
              <div className="text-lg font-semibold leading-none">
                {loading ? '…' : students.length}
                <span className="text-sm font-normal text-white/80"> {students.length === 1 ? 'student' : 'students'} connected</span>
              </div>
              <div className="text-xs text-white/70 mt-0.5">Learners linked to your account</div>
            </div>
          </div>
        )}

        {/* Onboarding Info for New Teachers */}
        {students.length === 0 && activeTab !== 'my-style' && activeTab !== 'jtia' && activeTab !== 'lesson-planner' && (
          <Alert className="border-[#2563EB] bg-blue-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Welcome to JotMinds Teacher Portal!</AlertTitle>
            <AlertDescription>
              Students from <strong>{user.school}</strong> will automatically appear here once they register and complete their assessments. 
              Students must select the same school name during registration to be linked to your class.
            </AlertDescription>
          </Alert>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <TeacherClassOverview students={students} assessments={allAssessments} />
          </div>
        )}

        {(activeTab as string) === 'students' && (
          <div className="space-y-8">
            <CentralStudentManagement students={students as any} assessments={allAssessments} teacher={user} />
          </div>
        )}

        {(activeTab as string) === 'analytics' && (
          <div className="space-y-8">
            <CentralAnalyticsHub students={students as any} assessments={allAssessments} user={user} />
          </div>
        )}



        {activeTab === 'jtia' && (
          <div className="space-y-8">
          {/* Sub-navigation inside JTIA tab: My Profile vs School Insights */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border shadow-2xs">
            <div className="flex items-center gap-2">
              <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                JTIA • 5 Core Domains
              </Badge>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button
                  onClick={() => setJtiaSubTab('profile')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    jtiaSubTab === 'profile'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Teaching Insights (JTIA)
                </button>
                <button
                  onClick={() => setJtiaSubTab('cognitive')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    jtiaSubTab === 'cognitive'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Cognitive Profile
                </button>
                <button
                  onClick={() => setJtiaSubTab('school')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    jtiaSubTab === 'school'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  School Insights Dashboard
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsTakingAssessment(true)}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm"
              >
                <RefreshCcw className="h-3.5 w-3.5 mr-1.5" />
                {displayedAssessment ? 'Retake JTIA' : 'Start JTIA Assessment'}
              </Button>
            </div>
          </div>

          {jtiaSubTab === 'school' ? (
            <JTIASchoolDashboard schoolName={user.school || user.organizationName || 'Partner Educational Institution'} />
          ) : jtiaSubTab === 'cognitive' ? (
            <div id="teacher-cognitive-report" className="space-y-6">
              {(() => {
                const completed = allMyAssessments.filter(a => a.completedAt && a.score);
                const kolbA = completed.filter(a => a.type === 'kolb' || a.type === 'learning').sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
                const kolb = kolbA?.score?.kolb || kolbA?.score?.learning;
                const thinkA = completed.filter(a => ['sternberg','adult-thinking','shs-thinking','jhs-thinking','thinking'].includes(a.type)).sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
                const thinkRaw = thinkA?.score?.sternberg || thinkA?.score?.['adult-thinking'] || thinkA?.score?.['shs-thinking'] || thinkA?.score?.['jhs-thinking'] || thinkA?.score?.thinking;
                const thinkStyle = thinkRaw?.style || thinkRaw?.primaryStyle || thinkRaw?.dominantStyle || null;
                const dualA = completed.filter(a => a.type === 'dual-process' || a.type === 'decision').sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
                const dual = dualA?.score?.dualProcess || dualA?.score?.decision || dualA?.score?.['dual-process'];
                const doneCount = [!!kolb, !!thinkStyle, !!dual].filter(Boolean).length;

                return (
                  <Card className="border-2 border-[#6B4C9A]/20">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 text-base">
                          <span>🧬</span> Educator Cognitive Profile Summary
                        </div>
                        <Badge style={{ backgroundColor: doneCount === 3 ? '#1E8A6E20' : '#E0A02020', color: doneCount === 3 ? '#1E8A6E' : '#E0A020' }}>
                          {doneCount}/3 Core Assessments Complete
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Overview of your baseline learning, thinking, and decision-making styles.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-800/40">
                          <p className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-1">Learning Style (Kolb)</p>
                          <p className="text-lg font-bold text-purple-950 dark:text-purple-100">{kolb?.style || 'Not Assessed Yet'}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800/40">
                          <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">Thinking Style (Sternberg)</p>
                          <p className="text-lg font-bold text-blue-950 dark:text-blue-100">{thinkStyle || 'Not Assessed Yet'}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40">
                          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Decision Style (Dual-Process)</p>
                          <p className="text-lg font-bold text-emerald-950 dark:text-emerald-100">{dual?.dominantStyle || 'Not Assessed Yet'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}
            </div>
          ) : displayedAssessment ? (
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

              <JTIAReport
                report={displayedAssessment.score?.jtia || calculateJTIAScore(displayedAssessment.responses)}
                teacherName={user.name || 'Teacher Profile'}
                onRetake={() => setIsTakingAssessment(true)}
              />


            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border p-8">
              <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🧠</span>
              </div>
              <Badge className="bg-indigo-100 text-indigo-800 mb-3">JTIA • Scenario & Preference Items</Badge>
              <h2 className="text-2xl font-bold mb-2">JotMinds Teaching Insights Assessment (JTIA)</h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                Unlike traditional assessments that focus on qualifications or compliance, JTIA evaluates the deeper cognitive and professional capabilities that drive effective teaching across 5 Core Domains: Cognitive Intelligence, Instructional Intelligence, Classroom Leadership, Relationship Intelligence, and Professional Intelligence.
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 max-w-md mx-auto mb-8 text-left">
                <p className="text-xs text-emerald-800">
                  <strong>Designed for Development, Not Ranking:</strong> Your results are never used to rank or compare teachers against one another. Insights are dedicated entirely to personal self-awareness and professional growth.
                </p>
              </div>
              <button
                onClick={() => setIsTakingAssessment(true)}
                className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl cursor-pointer"
              >
                Start JTIA Assessment
              </button>
            </div>
          )}
          </div>
        )}

        {activeTab === 'lesson-planner' && (
          <AILessonPlannerContainer />
        )}


      </div>
    </DashboardLayout>
  );
}

