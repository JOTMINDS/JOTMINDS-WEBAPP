import { useState, useEffect, useMemo } from 'react';
import { User, Assessment } from '../types';
import { useAuth } from './AuthContext';
import { getStudentsForTeacher, getAllAssessmentResults } from '../utils/api';
import { fetchMyAssessmentResults, submitTeachingStyleAssessment, normalizeServerResults } from '../utils/assessmentApi';
import { getStudentsBySchool, getAllUsers, getAllAssessments, getAssessmentsByUserId, saveAssessment, generateId, saveAssessmentProgress, getAssessmentProgress, clearAssessmentProgress, getAllClasses, getAssignmentsForTeacher, isStudentConnectedToTeacher } from '../utils/storage';
import { getInstitutionClasses, getInstitutionForMember } from '../utils/institution';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { ArrowRight, History, RefreshCcw, Calendar, AlertCircle, Eye, ArrowLeft, ClipboardList, Download, Users, BarChart3, GraduationCap } from 'lucide-react';
import { exportReportToPDF } from '../utils/pdfGenerator';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { 
  TeacherClassOverview, 
  TeacherIndividualStudentView,
  TeacherAnalyticsComparison
} from './teacher';
import { JTIAAssessmentTaking } from './JTIAAssessmentTaking';
import { JTIAReport } from './JTIAReport';
import { JTIASchoolDashboard } from './JTIASchoolDashboard';
import { calculateJTIAScore, JTIAReportData } from '../utils/jtiaScoring';
import { TeacherStudentManagement } from './TeacherStudentManagement';
import { getUserJotsCode } from '../utils/jotsCode';
import { generateDeepDiveQuestions } from '../utils/teachingStyleData';
import { AdultThinkingContainer } from './AdultThinkingContainer';
import { AILessonPlannerContainer } from './lessonPlanner/AILessonPlannerContainer';
import { DashboardLayout } from './ui/dashboard-layout';
import { NavGroup } from './ui/collapsible-sidebar';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'individual' | 'my-style' | 'jtia' | 'lesson-planner' | 'analytics-compare' | 'manage-class'>('overview');
  const [loading, setLoading] = useState(true);
  const [myAssessments, setMyAssessments] = useState<Assessment[]>([]);
  const [isTakingAssessment, setIsTakingAssessment] = useState(false);
  const [initialResponses, setInitialResponses] = useState<number[]>([]);
  const [initialQuestions, setInitialQuestions] = useState<any[]>([]);
  const [initialPage, setInitialPage] = useState<number>(0);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [jtiaSubTab, setJtiaSubTab] = useState<'profile' | 'school'>('profile');
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
        classes.filter(c => !c.classTeacherId || c.classTeacherId === user.id || c.classTeacherId === user.email || c.id === user.classId || c.name === user.className || user.role === 'teacher').forEach(c => teacherClassIds.add(c.id));
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
        const assignments = getAssignmentsForTeacher(user.id);
        const teacherClassIds = new Set<string>();
        classes.filter(c => !c.classTeacherId || c.classTeacherId === user.id || c.classTeacherId === user.email || c.id === user.classId || c.name === user.className || user.role === 'teacher').forEach(c => teacherClassIds.add(c.id));
        assignments.forEach(a => teacherClassIds.add(a.classId));
        
        localStudents = allUsers.filter(u => isStudentConnectedToTeacher(u, user, teacherClassIds));
        
        // Scope local assessments to only this teacher's students
        const localStudentIds = new Set(localStudents.map(s => s.id));
        const localAssessments = getAllAssessments().filter((a: any) => localStudentIds.has(a.userId));

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
      groupLabel: 'Educator Tools',
      items: [
        { id: 'overview', label: 'Class Overview', icon: Users, badge: students.length },
        { id: 'individual', label: 'Student Roster', icon: Eye },
        { id: 'analytics-compare', label: 'Class Analytics', icon: BarChart3 },
        { id: 'manage-class', label: 'Roster & Codes', icon: Calendar },
        { id: 'lesson-planner', label: 'AI Lesson Planner', icon: ClipboardList },
      ]
    },
    {
      groupLabel: 'Professional Development',
      items: [
        { id: 'my-style', label: 'Cognitive Profile', icon: History },
        { id: 'jtia', label: 'Teacher Insights (JTIA)', icon: GraduationCap },
      ]
    }
  ];

  const teacherHeaderContent = (
    <div className="w-full flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
          {activeTab.replace('-', ' ')}
        </h2>
        {user.school && (
          <Badge variant="outline" className="border-purple-600 text-purple-700">
            {user.school}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        {onViewTeacherIntelligence && (
          <Button variant="ghost" size="sm" onClick={onViewTeacherIntelligence}>
            Intelligence Portal
          </Button>
        )}
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
      setActiveTab={(tab: any) => setActiveTab(tab)}
      user={user}
      onLogout={onLogout}
      brandSubtitle="Educator Portal"
      onOpenSettings={onViewSettings}
      headerContent={teacherHeaderContent}
    >
      <div className="max-w-5xl mx-auto w-full space-y-6">

        {/* Students connected banner — visible on class-related tabs */}
        {['overview', 'individual', 'analytics-compare', 'manage-class'].includes(activeTab) && (
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
          <TeacherClassOverview students={students} assessments={allAssessments} />
        )}

        {activeTab === 'individual' && (
          <TeacherIndividualStudentView students={students} assessments={allAssessments} initialStudentId={targetStudentId} />
      )}

        {activeTab === 'my-style' && (
          <div className="space-y-8">
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
              <div id="teacher-cognitive-report">
              <Card className="border-2 border-[#6B4C9A]/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 text-base">
                      <span>🧬</span> Cognitive Profile
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge style={{ backgroundColor: doneCount === 3 ? '#1E8A6E20' : '#E0A02020', color: doneCount === 3 ? '#1E8A6E' : '#E0A020' }}>
                        {doneCount}/3 complete
                      </Badge>
                      {doneCount > 0 && (
                        <Button size="sm" variant="outline" className="no-print h-7 text-xs" onClick={handleDownloadCognitiveResults}>
                          <Download className="w-3.5 h-3.5 mr-1.5" /> Download PDF
                        </Button>
                      )}
                    </div>
                  </CardTitle>
                  <CardDescription>
                    All 3 core assessments — visible to your school in their Combined Analysis report. Complete all three to unlock your full educator profile.
                  </CardDescription>
                  <p className="text-xs text-gray-500 mt-1">
                    Each bar shows relative strength on that dimension — a longer bar means a stronger preference. Your dominant style is highlighted as a badge.
                  </p>
                </CardHeader>
                <CardContent className="space-y-5">

                  {/* 1. Learning Style */}
                  <div className="p-3 rounded-lg border" style={{ borderColor: kolb ? KOLB_COLORS[kolb.style] + '40' : '#e5e7eb', backgroundColor: kolb ? KOLB_COLORS[kolb.style] + '06' : '#f9fafb' }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-800">📚 Learning Style (Kolb)</p>
                      <div className="flex items-center gap-2">
                        {kolb && <Badge style={{ backgroundColor: KOLB_COLORS[kolb.style] + '20', color: KOLB_COLORS[kolb.style] }} className="text-[10px]">{kolb.style}</Badge>}
                        {!kolb && (
                          <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => onStartAssessment?.('learning')}>
                            Take
                          </Button>
                        )}
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
                        {!thinkStyle && (
                          <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => setShowingThinkingAssessment(true)}>
                            Take
                          </Button>
                        )}
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
                        {!dual && (
                          <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => onStartAssessment?.('decision')}>
                            Take
                          </Button>
                        )}
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
              </div>
            );
          })()}
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
                  My JTIA Profile (5 Domains)
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

              {teachingStyleAssessments.length > 1 && !selectedHistoryId && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5 text-muted-foreground" />
                      JTIA Assessment History
                    </CardTitle>
                    <CardDescription>
                      Track how your Teacher Insights domains have evolved over time.
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
                                JTIA Profile • Completed {new Date(assessment.completedAt || "").toLocaleDateString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                5 Core Teacher Intelligence Domains
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
                <span className="text-3xl">🧠</span>
              </div>
              <Badge className="bg-indigo-100 text-indigo-800 mb-3">JTIA • Teacher Insights & Adaptive Assessment</Badge>
              <h2 className="text-2xl font-bold mb-2">JotMinds Teacher Insights Assessment (JTIA)</h2>
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

        {activeTab === 'analytics-compare' && (
          <TeacherAnalyticsComparison
            teacherAssessments={allMyAssessments}
            studentAssessments={allAssessments}
            students={students}
            teacherProfile={user}
          />
        )}

        {activeTab === 'manage-class' && (
          <div className="space-y-8">
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
    </DashboardLayout>
  );
}

