import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  ArrowLeft,
  School,
  Users,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  PieChart,
  Target,
  Lightbulb,
  BookOpen,
  UserCheck,
  Settings,
} from 'lucide-react';
import {
  calculateSchoolMetrics,
  generateSchoolInsights,
  calculateTeacherPerformance,
  type SchoolMetrics,
  type SchoolInsight,
  type TeacherPerformance,
  type ClassMetrics,
} from '../utils/schoolAnalytics';
import { getSchoolRosterAPI, getAllAssessmentResults } from '../utils/api';
import { normalizeServerResults } from '../utils/assessmentApi';
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
  const [metrics, setMetrics] = useState<SchoolMetrics | null>(null);
  const [insights, setInsights] = useState<SchoolInsight[]>([]);
  const [teacherPerformances, setTeacherPerformances] = useState<TeacherPerformance[]>([]);
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
             const mappedClasses = (response.teachers || []).map((t: any) => ({
               id: `class-${t.id}`,
               name: `${t.name}'s Class`,
               grade: 'Unknown',
               teacherId: t.id
             }));
             setClasses(mappedClasses);
          } else {
             setClasses(response.classes);
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

  useEffect(() => {
    if (students.length > 0) {
      const schoolMetrics = calculateSchoolMetrics(schoolId, schoolName, students, teachers, classes);
      const schoolInsights = generateSchoolInsights(schoolMetrics);
      
      setMetrics(schoolMetrics);
      setInsights(schoolInsights);

      // Calculate class metrics for teacher performance
      const classMetrics: ClassMetrics[] = classes.map(cls => {
        const classStudents = students.filter(s => s.grade === cls.grade);
        const teacher = teachers.find(t => t.id === cls.teacherId);

      return {
        classId: cls.id,
        className: cls.name,
        grade: cls.grade,
        teacherId: cls.teacherId,
        teacherName: teacher?.name || 'Unknown',
        studentCount: classStudents.length,
        averageEngagementScore: 65,
        averageCognitiveScore: 72,
        averageGrowthRate: 12,
        activeStudentsPercentage: 80,
        topPerformers: classStudents.slice(0, 3).map(s => s.studentName),
        needsAttention: classStudents.slice(-2).map(s => s.studentName),
        lastUpdated: new Date().toISOString(),
      };
    });

      const performances = teachers.map(teacher =>
        calculateTeacherPerformance(teacher.id, teacher.name, classMetrics)
      );

      setTeacherPerformances(performances);
    }
  }, [students, teachers, classes, schoolId, schoolName]);

  if (isLoading || !metrics) {
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

  const performanceData = [
    { name: 'Excellent', value: metrics.performanceDistribution.excellent, color: '#10b981' },
    { name: 'Good', value: metrics.performanceDistribution.good, color: '#5B7DB1' },
    { name: 'Average', value: metrics.performanceDistribution.average, color: '#f59e0b' },
    { name: 'Needs Support', value: metrics.performanceDistribution.needsSupport, color: '#ef4444' },
  ];

  const featureAdoptionData = [
    { feature: 'Assessments', users: metrics.featureAdoption.assessments },
    { feature: 'Brain Gym', users: metrics.featureAdoption.brainGym },
    { feature: 'Career Exp', users: metrics.featureAdoption.careerExploration },
    { feature: 'Profile', users: metrics.featureAdoption.profileImprovement },
    { feature: 'Gamification', users: metrics.featureAdoption.gamification },
  ];

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
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{metrics.totalStudents}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.activeStudents} active (last 7 days)
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-gradient-to-br from-white to-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Avg Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{metrics.averageEngagementScore}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.totalSessions.toLocaleString()} total sessions
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                Avg Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{metrics.averageCognitiveScore}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.averageGrowthRate}% growth rate
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 bg-gradient-to-br from-white to-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-orange-600" />
                Teachers
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
              </CardTitle>
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
                View Teaching Styles →
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
          <TabsList className="grid w-full grid-cols-6 overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Performance Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Distribution</CardTitle>
                  <CardDescription>Students by performance level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RecharPieChart>
                        <Pie
                          data={performanceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {performanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RecharPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Feature Adoption */}
              <Card>
                <CardHeader>
                  <CardTitle>Feature Adoption</CardTitle>
                  <CardDescription>Platform feature usage by students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={featureAdoptionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="feature" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="users" fill="#5B7DB1" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Engagement Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-gray-600">Total Sessions</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {metrics.totalSessions.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-sm text-gray-600">Total Time Spent</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {metrics.totalTimeSpent.toLocaleString()}h
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-sm text-gray-600">Challenge Completion</div>
                    <div className="text-2xl font-bold text-green-600">
                      {metrics.challengeCompletionRate}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-2 border-green-200 bg-gradient-to-br from-white to-green-50">
                <CardHeader>
                  <CardTitle className="text-green-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Improving
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-600">{metrics.studentsImproving}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {Math.round((metrics.studentsImproving / metrics.totalStudents) * 100)}% of students
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-yellow-200 bg-gradient-to-br from-white to-yellow-50">
                <CardHeader>
                  <CardTitle className="text-yellow-900 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    Stagnant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-yellow-600">{metrics.studentsStagnant}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {Math.round((metrics.studentsStagnant / metrics.totalStudents) * 100)}% of students
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-red-200 bg-gradient-to-br from-white to-red-50">
                <CardHeader>
                  <CardTitle className="text-red-900 flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    Regressing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-red-600">{metrics.studentsRegressing}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {Math.round((metrics.studentsRegressing / metrics.totalStudents) * 100)}% of students
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Gamification Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-yellow-600" />
                      <div className="text-sm text-gray-600">Total Badges</div>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {metrics.totalBadgesEarned.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      <div className="text-sm text-gray-600">Total XP</div>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {metrics.totalXPEarned.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <div className="text-sm text-gray-600">Avg Level</div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{metrics.averageLevel}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                      <Badge
                        variant={
                          teacher.performanceRating === 'excellent'
                            ? 'default'
                            : teacher.performanceRating === 'needs_improvement'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {teacher.performanceRating.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-xs text-gray-600">Class Engagement</div>
                        <div className="text-xl font-bold text-blue-600">
                          {teacher.averageClassEngagement}%
                        </div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-xs text-gray-600">Student Growth</div>
                        <div className="text-xl font-bold text-green-600">
                          {teacher.averageStudentGrowth}%
                        </div>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <div className="text-xs text-gray-600">Needs Support</div>
                        <div className="text-xl font-bold text-orange-600">
                          {teacher.studentsNeedingSupport}
                        </div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="text-xs text-gray-600">Lessons Created</div>
                        <div className="text-xl font-bold text-purple-600">
                          {teacher.differentiatedLessonsCreated}
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
          <TabsContent value="grades" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance by Grade</CardTitle>
                <CardDescription>Average scores and engagement across grades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.gradeMetrics.map(grade => (
                    <div key={grade.grade} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{grade.grade}</h4>
                          <p className="text-sm text-muted-foreground">
                            {grade.studentCount} students
                          </p>
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="p-3 bg-white rounded-lg border">
                          <div className="text-xs text-gray-600">Average Score</div>
                          <div className="text-2xl font-bold text-primary">
                            {grade.averageScore}%
                          </div>
                        </div>
                        <div className="p-3 bg-white rounded-lg border">
                          <div className="text-xs text-gray-600">Engagement Score</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {grade.engagementScore}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab — roster summary + per-student report drill-down */}
          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Reports</CardTitle>
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
