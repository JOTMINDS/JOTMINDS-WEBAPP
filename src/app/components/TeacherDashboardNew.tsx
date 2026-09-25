import { formatDateTime } from '../utils/dateFormat';
import { useState, useEffect, useMemo } from 'react';
import { User, Assessment } from '../types';
import { useAuth } from './AuthContext';
import { getStudentsForTeacher, getAllAssessmentResults } from '../utils/api';
import { fetchMyAssessmentResults, submitTeachingStyleAssessment, normalizeServerResults } from '../utils/assessmentApi';
import { getStudentsBySchool, getAllUsers, getAllAssessments, getAssessmentsByUserId, saveAssessment, generateId, saveAssessmentProgress, getAssessmentProgress, clearAssessmentProgress, getAllClasses, getAssignmentsForTeacher, isStudentConnectedToTeacher, getRelatedTeacherAccounts } from '../utils/storage';
import { getInstitutionClasses, getInstitutionForMember } from '../utils/institution';
import { InstitutionMembers } from './InstitutionDashboard/InstitutionMembers';
import { TeacherClassManagement } from './TeacherClassManagement';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { ArrowRight, History, RefreshCcw, Calendar, AlertCircle, Eye, ArrowLeft, ClipboardList, Download, Users, BarChart3, GraduationCap, Brain, Sparkles, School, Target } from 'lucide-react';
import { exportReportToPDF } from '../utils/pdfGenerator';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { 
  TeacherClassOverview,
  TeacherAnalyticsComparison
} from './teacher';
import { JTIAAssessmentTaking } from './JTIAAssessmentTaking';
import { JTIAReport } from './JTIAReport';
import { JTIASchoolDashboard } from './JTIASchoolDashboard';
import { calculateJTIAScore, JTIAReportData } from '../utils/jtiaScoring';
import { generateDeepDiveQuestions } from '../utils/teachingStyleData';
import { AILessonPlannerContainer } from './lessonPlanner/AILessonPlannerContainer';
import { LessonCopilotDrawer } from './lessonPlanner/LessonCopilotDrawer';
import { DashboardLayout } from './ui/dashboard-layout';
import { NavGroup } from './ui/collapsible-sidebar';
import { CentralStudentManagement } from './CentralStudentManagement';
import { CentralAnalyticsHub } from './CentralAnalyticsHub';
import { PreschoolContainer } from './preschool/PreschoolContainer';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'manage-classes' | 'students' | 'preschool' | 'analytics' | 'alignment' | 'lesson-planner' | 'jtia'>('overview');
  const [loading, setLoading] = useState(true);
  const [myAssessments, setMyAssessments] = useState<Assessment[]>([]);
  const [isTakingAssessment, setIsTakingAssessment] = useState(false);
  const [initialResponses, setInitialResponses] = useState<number[]>([]);
  const [initialQuestions, setInitialQuestions] = useState<any[]>([]);
  const [initialPage, setInitialPage] = useState<number>(0);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [jtiaSubTab, setJtiaSubTab] = useState<'profile' | 'cognitive' | 'school'>('profile');
  const [targetStudentId, setTargetStudentId] = useState<string | null>(null);
  const [serverAssessments, setServerAssessments] = useState<any[]>([]);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

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
        const teacherClassIds = new Set<string>();
        const assignments = getAssignmentsForTeacher(user.id);
        classes.filter(c => c.classTeacherId === user.id || (user.email && c.classTeacherId === user.email) || (user.classId && c.id === user.classId) || (user.className && c.name && c.name.toLowerCase() === user.className.toLowerCase())).forEach(c => teacherClassIds.add(c.id));
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
              const normalized = normalizeServerResults(rawResults).filter((a: any) => a.completedAt);
              assessmentsForStats.push(...normalized);
            } catch (e) {
              console.error('Failed to fetch student assessments:', e);
            }
          }
        }
      } else {
        // Regular teacher viewing their own data
        
        // Regular teacher viewing their own data
        try {
          const response = await getStudentsForTeacher();
          if (response.success && response.students) {
            studentUsers = response.students;
            assessmentsForStats = studentUsers.flatMap((s: any) => s.assessments || []);
            
            if (assessmentsForStats.length === 0 && studentUsers.length > 0) {
              const studentIds = studentUsers.map(s => s.id);
              const chunkSize = 50;
              for (let i = 0; i < studentIds.length; i += chunkSize) {
                const chunk = studentIds.slice(i, i + chunkSize);
                try {
                  const res = await getAllAssessmentResults(chunk);
                  const rawResults = res?.results || (Array.isArray(res) ? res : []);
                  // Normalize raw KV records into the shape the frontend expects
                  const normalized = normalizeServerResults(rawResults).filter((a: any) => a.completedAt);
                  assessmentsForStats.push(...normalized);
                } catch (e) {
                  console.error('Failed to fetch assessments chunk:', e);
                }
              }
            }
          } else {
            throw new Error('API unsuccessful');
          }
        } catch (err) {
          console.log('[TeacherDashboardNew] Falling back to local storage for students:', err);
          
          // Fallback: Fetch from local storage only if backend request failed
          const allUsers = getAllUsers();
          const classes = getAllClasses();
          const relatedTeachers = getRelatedTeacherAccounts(user);
          
          const teacherClassIds = new Set<string>();
          const teacherInstId = user.institutionId || (user as any).organizationId;
          relatedTeachers.forEach(rt => {
            classes.filter(c => {
              if (c.classTeacherId === rt.id || (rt.email && c.classTeacherId === rt.email)) return true;
              if (teacherInstId && c.institutionId && c.institutionId !== teacherInstId) return false;
              if (rt.classId && c.id === rt.classId) return true;
              if (rt.className && c.name && c.name.toLowerCase() === rt.className.toLowerCase()) {
                if (!c.institutionId || (teacherInstId && c.institutionId === teacherInstId)) return true;
              }
              return false;
            }).forEach(c => teacherClassIds.add(c.id));
            getAssignmentsForTeacher(rt.id).forEach(a => teacherClassIds.add(a.classId));
          });
          
          studentUsers = allUsers.filter(u => relatedTeachers.some(rt => isStudentConnectedToTeacher(u, rt, teacherClassIds)));
          
          // Scope local assessments to connected students by ID or Email
          const localStudentKeys = new Set<string>();
          studentUsers.forEach(s => {
            if (s.id) localStudentKeys.add(s.id.toLowerCase());
            if (s.email) localStudentKeys.add(s.email.toLowerCase());
          });
          assessmentsForStats = getAllAssessments().filter((a: any) => {
            if (!a) return false;
            const aId = a.userId?.toLowerCase();
            const aEmail = (a.userEmail || a.email)?.toLowerCase();
            return (aId && localStudentKeys.has(aId)) || (aEmail && localStudentKeys.has(aEmail));
          });
        }
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
    toast.success('Teaching Insights Assessment completed successfully!');
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
        { id: 'manage-classes', label: 'Manage Classes', icon: School },
        { id: 'students', label: 'Students', icon: Eye, badge: students.length },
        { id: 'preschool', label: 'Early Years (JM-PDAF)', icon: Sparkles, badge: 'Ages 2–6' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'alignment', label: 'Alignment Analysis', icon: Target },
        { id: 'lesson-planner', label: 'Lesson Planner', icon: ClipboardList },
        { id: 'jtia', label: 'Teaching Insights', icon: GraduationCap },
      ]
    }
  ];

  const teacherHeaderContent = (
    <div className="w-full flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
          {activeTab === 'jtia' ? 'Teaching Insights' : activeTab === 'preschool' ? 'Early Years Developmental Intelligence' : activeTab === 'alignment' ? 'Alignment Analysis' : activeTab.replace('-', ' ')}
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
        {['overview', 'students', 'analytics', 'alignment'].includes(activeTab) && (
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
        {students.length === 0 && activeTab !== 'jtia' && activeTab !== 'lesson-planner' && (
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
            <TeacherClassOverview students={students} assessments={allAssessments} onSelectTab={(tab) => setActiveTab(tab as any)} />
          </div>
        )}

        {(activeTab as string) === 'students' && (
          <div className="space-y-8">
            <CentralStudentManagement students={students as any} assessments={allAssessments} teacher={user} onRefresh={loadClassData} />
          </div>
        )}

        {(activeTab as string) === 'preschool' && (
          <div className="space-y-8">
            <PreschoolContainer
              currentUser={user}
              childrenList={students}
              onBack={() => setActiveTab('overview')}
            />
          </div>
        )}

        {(activeTab as string) === 'manage-classes' && (
          <div className="space-y-8">
            <TeacherClassManagement teacher={user} students={students as any} />
          </div>
        )}

        {(activeTab as string) === 'analytics' && (
          <div className="space-y-8">
            <CentralAnalyticsHub students={students as any} assessments={[...allAssessments, ...allMyAssessments]} user={user} />
          </div>
        )}

        {(activeTab as string) === 'alignment' && (
          <div className="space-y-8">
            <TeacherAnalyticsComparison 
              teacherAssessments={allMyAssessments}
              studentAssessments={allAssessments}
              students={students as any}
              teacherProfile={user}
            />
          </div>
        )}



        {activeTab === 'jtia' && (
          <div className="space-y-8">
          {/* Header Action */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border shadow-2xs">
            <div className="flex items-center gap-2">
              <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                Teaching Insights • 5 Core Domains
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsTakingAssessment(true)}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm"
              >
                <RefreshCcw className="h-3.5 w-3.5 mr-1.5" />
                {displayedAssessment ? 'Retake Teaching Insights Assessment' : 'Start Teaching Insights Assessment'}
              </Button>
            </div>
          </div>



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
              <Badge className="bg-indigo-100 text-indigo-800 mb-3">Teaching Insights • Scenario & Preference Items</Badge>
              <h2 className="text-2xl font-bold mb-2">Teaching Insights Assessment</h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                Unlike traditional assessments that focus on qualifications or compliance, The Teaching Insights Assessment evaluates the deeper cognitive and professional capabilities that drive effective teaching across 5 Core Domains: Cognitive Intelligence, Instructional Intelligence, Classroom Leadership, Relationship Intelligence, and Professional Intelligence.
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
                Start Teaching Insights Assessment
              </button>
            </div>
          )}
          </div>
        )}

        {activeTab === 'lesson-planner' && (
          <AILessonPlannerContainer user={user} students={students} assessments={allAssessments} />
        )}


      </div>

      {/* Floating Ask Jotti Button */}
      <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <button
            onClick={() => setIsCopilotOpen(true)}
            className="relative flex items-center justify-center gap-2 h-14 px-6 rounded-full shadow-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-transform hover:scale-105 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Ask Jotti</span>
          </button>
        </div>
      </div>

      <LessonCopilotDrawer
        isOpen={isCopilotOpen}
        context={activeTab}
        onClose={() => setIsCopilotOpen(false)}
      />
    </DashboardLayout>
  );
}

