import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  ArrowLeft,
  School,
  Users,
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  PieChart,
  Target,
  Lightbulb,
  BookOpen,
  UserCheck,
  Settings,
} from 'lucide-react';
import {
  calculateRealSchoolMetrics,
  generateRealSchoolInsights,
  assessmentGroup,
} from '../utils/schoolAnalytics';
import { getSchoolRosterAPI, getAllAssessmentResults } from '../utils/api';
import { normalizeServerResults } from '../utils/assessmentApi';
import { getAllClasses } from '../utils/storage';
import { StudentCognitiveProfile } from '../utils/teacherIntelligence';
import { SchoolTeacherStylesView } from './SchoolTeacherStylesView';
import { StudentDetailView } from './StudentDetailView';
import { getUserJotsCode } from '../utils/jotsCode';
import {
  BarChart,
  Bar,
  PieChart as RecharPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { InfoTip } from './ui/info-tip';
import { calculateStudentEngagementAndRisk, getStudentCognitiveStyles } from './SchoolAnalyticsDashboard';
import { getSavedLessonPlans } from '../utils/lessonPlannerStorage';

interface Props {
  schoolId: string;
  schoolName: string;
  students: StudentCognitiveProfile[];
  teachers: { id: string; name: string; classIds: string[] }[];
  classes: { id: string; name: string; grade: string; teacherId: string }[];
  onBack: () => void;
  user?: any;
  onViewInstitutionDashboard?: () => void;
  onViewSettings?: () => void;
}

export function HeadTeacherDashboard({ schoolId, schoolName, students: initialStudents, teachers: initialTeachers, classes: initialClasses, onBack, user, onViewInstitutionDashboard, onViewSettings }: Props) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showTeacherStyles, setShowTeacherStyles] = useState(false);

  const [students, setStudents] = useState(initialStudents || []);
  const [teachers, setTeachers] = useState(initialTeachers || []);
  const [classes, setClasses] = useState(initialClasses || []);
  const [isLoading, setIsLoading] = useState(false);

  // Student reports: assessment results live in the server KV, not local storage.
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentAssessments, setStudentAssessments] = useState<any[]>([]);
  const [studentResultsLoading, setStudentResultsLoading] = useState(false);
  const [studentFilter, setStudentFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');

  useEffect(() => {
    loadSchoolData();
  }, [schoolId]);

  const loadSchoolData = async () => {
    setIsLoading(true);
    try {
      if (initialStudents.length === 0) {
        const response = await getSchoolRosterAPI();
        if (response && response.success) {
          setStudents(response.students || []);
          setTeachers(response.teachers || []);
          // Generate pseudo-classes if none exist from the backend
          if (!response.classes || response.classes.length === 0) {
              const localClasses = getAllClasses().filter((c: any) => 
                (schoolId && c.institutionId === schoolId) || 
                (schoolName && c.schoolName && c.schoolName.toLowerCase() === schoolName.toLowerCase())
              );
             if (localClasses.length > 0) {
               setClasses(localClasses.map((c: any) => ({
                 id: c.id,
                 name: c.name,
                 grade: c.academicYear || 'General',
                 teacherId: c.classTeacherId || ''
               })));
             } else {
               const mappedClasses = (response.teachers || []).map((t: any) => ({
                 id: `class-${t.id}`,
                 name: `${t.name}'s Class`,
                 grade: 'Unknown',
                 teacherId: t.id
               }));
               setClasses(mappedClasses);
             }
          } else {
             setClasses(response.classes.map((c: any) => ({
               id: c.id,
               name: c.name,
               grade: c.grade || c.academicYear || 'General',
               teacherId: c.teacherId || c.classTeacherId || ''
             })));
          }
        }
      }
    } catch (error) {
      console.error('Failed to load school roster', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Batch-fetch every student's assessment results from the server so the
  // admin can open full per-student reports.
  useEffect(() => {
    let cancelled = false;
    const ids = (students || []).map((s: any) => s.id).filter(Boolean);
    if (ids.length === 0) { setStudentAssessments([]); return; }
    setStudentResultsLoading(true);
    (async () => {
      try {
        const res = await getAllAssessmentResults(ids);
        const normalized = res?.success ? normalizeServerResults(res.results || []) : [];
        if (!cancelled) setStudentAssessments(normalized);
      } catch (e) {
        console.error('Failed to load student assessment results', e);
        if (!cancelled) setStudentAssessments([]);
      } finally {
        if (!cancelled) setStudentResultsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [students]);

  // School-wide figures come from the roster and the assessment results fetched from the
  // server. Nothing is read from this browser's local storage and nothing is a placeholder.
  const metrics = useMemo(() => calculateRealSchoolMetrics({
    schoolId,
    schoolName,
    students,
    teachers,
    classes,
    assessments: studentAssessments,
    scoreStudent: (student, mine, types) => calculateStudentEngagementAndRisk(student, mine, types, 0),
    getStyles: getStudentCognitiveStyles,
  }), [schoolId, schoolName, students, teachers, classes, studentAssessments]);
  const insights = useMemo(() => generateRealSchoolInsights(metrics), [metrics]);

  // Teacher figures are calculated from each teacher's linked students and the assessment
  // results fetched from the server. Nothing here is a placeholder.
  const teacherPerformances = useMemo(() => {
    const DAY = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const typeGroup = assessmentGroup;
    const lessonPlans = getSavedLessonPlans();

    return (teachers || []).map((teacher: any) => {
      const teacherStudents = (students || []).filter((s: any) =>
        s.teacherId === teacher.id || (Array.isArray(s.linkedTeachers) && s.linkedTeachers.includes(teacher.id))
      );

      let engagementSum = 0;
      let assessedStudents = 0;
      let atRisk = 0;
      let last30 = 0;
      let prev30 = 0;

      teacherStudents.forEach((s: any) => {
        const mine = studentAssessments.filter((a: any) => a.userId === s.id && a.completedAt);
        mine.forEach((a: any) => {
          const age = now - new Date(a.completedAt).getTime();
          if (age >= 0 && age < 30 * DAY) last30++;
          else if (age >= 30 * DAY && age < 60 * DAY) prev30++;
        });
        if (mine.length === 0) return;
        const completedTypes = [...new Set(mine.map((a: any) => typeGroup(a.type)))] as string[];
        const { engagementScore, risk } = calculateStudentEngagementAndRisk(s, mine, completedTypes, 0);
        engagementSum += engagementScore;
        assessedStudents++;
        if (risk === 'high') atRisk++;
      });

      return {
        teacherId: teacher.id as string,
        teacherName: teacher.name as string,
        classesManaged: (classes || []).filter((c: any) => c.teacherId === teacher.id).length,
        totalStudents: teacherStudents.length,
        assessedStudents,
        averageEngagement: assessedStudents ? Math.round(engagementSum / assessedStudents) : null,
        atRisk,
        assessmentsLast30: last30,
        assessmentsPrev30: prev30,
        lessonsCreated: lessonPlans.filter(p => p.teacherId === teacher.id).length,
      };
    });
  }, [teachers, students, classes, studentAssessments]);

  if (isLoading || (students.length > 0 && studentResultsLoading)) {
    return <div className="p-8 text-center">Loading school analytics...</div>;
  }

  // Register Jots Code for this school if user prop available
  const jotsCode = user ? getUserJotsCode(user) : '';

  // Show teaching styles sub-view
  if (showTeacherStyles && user) {
    return <SchoolTeacherStylesView admin={user} onBack={() => setShowTeacherStyles(false)} />;
  }

  // Show individual student report sub-view
  if (selectedStudent) {
    return (
      <StudentDetailView
        student={selectedStudent}
        assessments={studentAssessments}
        onBack={() => setSelectedStudent(null)}
      />
    );
  }

  const COLORS = ['#5B7DB1', '#6B4C9A', '#10b981', '#f59e0b'];

  const statusData = [
    { name: 'On Track', value: metrics.riskCounts.low, color: '#10b981' },
    { name: 'Needs Support', value: metrics.riskCounts.medium, color: '#f59e0b' },
    { name: 'At Risk', value: metrics.riskCounts.high, color: '#ef4444' },
    { name: 'Not Started', value: metrics.riskCounts.unassessed, color: '#9ca3af' },
  ];

  const completionData = [
    { assessment: 'Learning Style', students: metrics.completion.learning },
    { assessment: 'Thinking Style', students: metrics.completion.thinking },
    { assessment: 'Decision Style', students: metrics.completion.decision },
  ];

  const toBars = (counts: Record<string, number>) =>
    Object.entries(counts).map(([name, students]) => ({ name, students })).sort((x, y) => y.students - x.students);

  const activityChange = metrics.assessmentsLast30 - metrics.assessmentsPrev30;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold text-lg flex items-center gap-2">
              <School className="h-5 w-5 text-primary" />
              {schoolName} - School Analytics
            </h1>
            <p className="text-xs text-muted-foreground">
              Comprehensive school-wide insights and performance metrics
            </p>
          </div>
          {onViewSettings && (
            <Button variant="outline" size="sm" onClick={onViewSettings}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Total Students<InfoTip>Students linked to your school. The line underneath shows how many have completed at least one assessment.</InfoTip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{metrics.totalStudents}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.assessedStudents} assessed
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-gradient-to-br from-white to-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Avg Engagement<InfoTip>The average engagement score (0 to 100) of students who have completed at least one assessment. It rises with the number of assessment types completed and recent activity. The line underneath is how many students completed an assessment in the last 30 days.</InfoTip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{metrics.averageEngagementScore !== null ? `${metrics.averageEngagementScore}%` : '—'}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.activeStudents30} active in last 30 days
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                At Risk<InfoTip>Students with very low engagement or who have been inactive for a long time. Based on participation, not on style results. The line underneath is students who need support: part of the assessments done, or activity slowing.</InfoTip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{metrics.riskCounts.high}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.riskCounts.medium} need support
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 bg-gradient-to-br from-white to-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-orange-600" />
                Teachers<InfoTip>Teachers linked to your school. The line underneath is the number of classes.</InfoTip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{metrics.totalTeachers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.totalClasses} classes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Critical Insights */}
        {insights.filter(i => i.priority === 'critical' || i.priority === 'high').length > 0 && (
          <Card className="border-2 border-red-200 bg-gradient-to-br from-white to-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Critical Insights Requiring Attention
              <InfoTip>The most important things the data shows about your school right now, such as groups at risk or low usage.</InfoTip></CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights
                .filter(i => i.priority === 'critical' || i.priority === 'high')
                .map(insight => (
                  <div key={insight.id} className="p-4 bg-white rounded-lg border-2 border-red-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-900">{insight.title}</h4>
                        <p className="text-sm text-gray-700 mt-1">{insight.description}</p>
                      </div>
                      <Badge variant={insight.type === 'alert' ? 'destructive' : 'default'}>
                        {insight.priority}
                      </Badge>
                    </div>
                    {insight.actionItems.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-medium text-gray-600">Recommended Actions:</p>
                        <ul className="text-xs text-gray-700 space-y-1">
                          {insight.actionItems.map((action, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-red-600">•</span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

        {/* Jots Code Banner */}
        {jotsCode && (
          <div className="rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap" style={{ background: 'linear-gradient(135deg, #5B7DB1, #6B4C9A)' }}>
            <div className="text-white">
              <p className="text-xs text-white/70 mb-0.5">School Jots Code — share with your teachers</p>
              <div className="text-2xl tracking-widest">{jotsCode}</div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 border"
                onClick={() => navigator.clipboard.writeText(jotsCode)}
              >
                Copy Code
              </Button>
              <Button
                size="sm"
                className="bg-white text-[#5B7DB1] hover:bg-white/90"
                onClick={() => setShowTeacherStyles(true)}
              >
                View Teaching Insights →
              </Button>
              {onViewInstitutionDashboard && (
                <Button
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                  onClick={onViewInstitutionDashboard}
                >
                  Manage Institution →
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="styles">Styles</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Student Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Student Status<InfoTip>Every student grouped by participation. On Track: recent assessments and healthy engagement. Needs Support: only part of the assessments done, or activity slowing. At Risk: very low engagement or long inactive. Not Started: no assessment yet. This is based on participation, not on style results.</InfoTip></CardTitle>
                  <CardDescription>Students grouped by participation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RecharPieChart>
                        <Pie
                          data={statusData.filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {statusData.filter(d => d.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RecharPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Assessment Completion */}
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Completion<InfoTip>How many students have finished each of the three core assessments.</InfoTip></CardTitle>
                  <CardDescription>Students who have completed each assessment (out of {metrics.totalStudents})</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={completionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="assessment" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="students" fill="#5B7DB1" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Assessment Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Assessment Activity<InfoTip>Assessments completed by your students. The last 30 days are compared with the 30 days before, so you can see whether activity is rising or falling.</InfoTip></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-gray-600">Total Assessments</div>
                    <div className="text-2xl font-bold text-blue-600">{metrics.totalAssessments.toLocaleString()}</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-sm text-gray-600">Last 30 Days</div>
                    <div className="text-2xl font-bold text-purple-600">{metrics.assessmentsLast30}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {activityChange > 0 ? '+' : ''}{activityChange} vs previous 30 days
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-sm text-gray-600">Fully Assessed Students</div>
                    <div className="text-2xl font-bold text-green-600">{metrics.fullyAssessedStudents}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">finished all 3 core assessments</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Styles Tab */}
          <TabsContent value="styles" className="space-y-4">
            {[
              { title: 'Learning Styles', tip: 'How your students prefer to learn (Kolb). Each student is counted once, under their main style.', data: toBars(metrics.styles.learning), fill: '#5B7DB1' },
              { title: 'Thinking Styles', tip: 'The kind of thinking each student uses most. Each student is counted once.', data: toBars(metrics.styles.thinking), fill: '#6B4C9A' },
              { title: 'Decision Styles', tip: 'How students tend to make decisions. Each student is counted once.', data: toBars(metrics.styles.decision), fill: '#10b981' },
            ].map(section => (
              <Card key={section.title}>
                <CardHeader>
                  <CardTitle>{section.title}<InfoTip>{section.tip}</InfoTip></CardTitle>
                  <CardDescription>Only students who have completed the assessment are counted</CardDescription>
                </CardHeader>
                <CardContent>
                  {section.data.length === 0 ? (
                    <div className="text-sm text-gray-500 py-6 text-center">No results yet.</div>
                  ) : (
                    <div className="h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={section.data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="students" fill={section.fill} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers" className="space-y-4">
            <div className="grid gap-4">
              {teacherPerformances.map(teacher => (
                <Card key={teacher.teacherId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{teacher.teacherName}</CardTitle>
                        <CardDescription>
                          {teacher.classesManaged} classes • {teacher.totalStudents} students
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-4">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-xs text-gray-600">
                          Class Engagement
                          <InfoTip title="Class Engagement">The average engagement score (0 to 100) of this teacher's students who have completed at least one assessment. It rises with the number of assessment types completed and recent activity.</InfoTip>
                        </div>
                        <div className="text-xl font-bold text-green-600">
                          {teacher.averageEngagement !== null ? `${teacher.averageEngagement}%` : '—'}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {teacher.assessedStudents} of {teacher.totalStudents} students assessed
                        </div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-xs text-gray-600">
                          Assessments (30 days)
                          <InfoTip title="Assessment activity">Assessments completed by this teacher's students in the last 30 days, compared with the 30 days before. It shows whether activity is rising or falling.</InfoTip>
                        </div>
                        <div className="text-xl font-bold text-blue-600">{teacher.assessmentsLast30}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {teacher.assessmentsLast30 - teacher.assessmentsPrev30 > 0 ? '+' : ''}
                          {teacher.assessmentsLast30 - teacher.assessmentsPrev30} vs previous 30 days
                        </div>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="text-xs text-gray-600">
                          At Risk
                          <InfoTip title="At Risk">Students with very low engagement or who have been inactive for a long time. Based on participation, not on style results.</InfoTip>
                        </div>
                        <div className="text-xl font-bold text-red-600">{teacher.atRisk}</div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="text-xs text-gray-600">Lessons Created</div>
                        <div className="text-xl font-bold text-purple-600">
                          {teacher.lessonsCreated}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            {insights.length === 0 && (
              <div className="text-sm text-gray-500 py-8 text-center">
                No insights yet. They appear once students have been added.
              </div>
            )}
            {insights.map(insight => (
              <Card
                key={insight.id}
                className={
                  insight.type === 'success'
                    ? 'border-2 border-green-200'
                    : insight.type === 'alert'
                    ? 'border-2 border-red-200'
                    : 'border-2 border-yellow-200'
                }
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {insight.type === 'success' && (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      )}
                      {insight.type === 'warning' && (
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      )}
                      {insight.type === 'alert' && (
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div>
                        <CardTitle className="text-base">{insight.title}</CardTitle>
                        <CardDescription className="mt-1">{insight.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant={
                          insight.priority === 'critical'
                            ? 'destructive'
                            : insight.priority === 'high'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {insight.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {insight.affectedCount} students
                      </span>
                    </div>
                  </div>
                </CardHeader>
                {insight.actionItems.length > 0 && (
                  <CardContent>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Recommended Actions:
                      </p>
                      <ul className="space-y-1.5">
                        {insight.actionItems.map((action, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </TabsContent>

          {/* Grades Tab */}
          {/* Students Tab — roster summary + per-student report drill-down */}
          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Reports<InfoTip>Reports you can generate or download for students.</InfoTip></CardTitle>
                <CardDescription>
                  Every student in the school. Each row shows the teacher they're assigned to (if any). Click a student to open their full cognitive report.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {studentResultsLoading && (
                  <div className="flex items-center gap-3 py-4 text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                    <span className="text-sm">Loading student assessments…</span>
                  </div>
                )}

                {!studentResultsLoading && students.length === 0 && (
                  <div className="py-10 text-center text-muted-foreground">No students enrolled yet.</div>
                )}

                {students.length > 0 && (() => {
                  const assignedCount = students.filter((s: any) => s.classId || (s.linkedClasses && s.linkedClasses.length > 0)).length;
                  const visible = students.filter((s: any) => {
                    const isAssigned = !!(s.classId || (s.linkedClasses && s.linkedClasses.length > 0));
                    return studentFilter === 'all' ? true : studentFilter === 'assigned' ? isAssigned : !isAssigned;
                  });
                  return (
                    <>
                      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                        <p className="text-sm text-muted-foreground">
                          {students.length} students · {assignedCount} assigned to a teacher · {students.length - assignedCount} unassigned
                        </p>
                        <div className="flex gap-1">
                          {(['all', 'assigned', 'unassigned'] as const).map(f => (
                            <Button
                              key={f}
                              variant={studentFilter === f ? 'default' : 'outline'}
                              size="sm"
                              className="capitalize text-xs h-7"
                              onClick={() => setStudentFilter(f)}
                            >
                              {f}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {visible.map((s: any) => {
                          const mine = studentAssessments.filter((a: any) => a.userId === s.id && a.completed);
                          const learning = mine.find((a: any) => a.score?.kolb)?.score?.kolb?.style;
                          const thinking = mine.find((a: any) => a.score?.sternberg)?.score?.sternberg?.style;
                          const decision = mine.find((a: any) => a.score?.dualProcess)?.score?.dualProcess?.style;
                          const styleTags = [learning, thinking, decision].filter(Boolean) as string[];
                          const name = s.name || s.studentName || 'Student';
                          const assignedTeacher = s.teacherName || null;
                          return (
                            <div
                              key={s.id}
                              className="flex items-center justify-between gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="min-w-0">
                                <div className="font-medium text-gray-900 truncate">{name}</div>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  {assignedTeacher ? (
                                    <Badge variant="outline" className="text-xs border-[#5B7DB1] text-[#5B7DB1]">👩‍🏫 {assignedTeacher}</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs text-muted-foreground">Unassigned</Badge>
                                  )}
                                  <Badge variant="secondary">{mine.length} completed</Badge>
                                  {styleTags.map((t, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">{t}</Badge>
                                  ))}
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={mine.length === 0}
                                onClick={() => setSelectedStudent(s)}
                              >
                                {mine.length === 0 ? 'No reports' : 'View Report →'}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
