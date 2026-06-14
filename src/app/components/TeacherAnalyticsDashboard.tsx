import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Users,
  Brain,
  Eye,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Target,
  BookOpen,
  UserPlus,
  BarChart3,
  PieChart,
  FileText,
} from 'lucide-react';
import {
  analyzeClassroom,
  generateClassroomInsights,
  generateStudentRecommendations,
  generateDifferentiatedLesson,
  type StudentCognitiveProfile,
  type ClassroomDistribution,
  type ClassroomInsight,
} from '../utils/teacherIntelligence';
import { getStudentsForTeacher } from '../utils/api';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface Props {
  teacherId: string;
  classId?: string;
  students?: StudentCognitiveProfile[];
  onBack: () => void;
}

export function TeacherAnalyticsDashboard({ teacherId, classId, students: initialStudents, onBack }: Props) {
  const [students, setStudents] = useState<StudentCognitiveProfile[]>(initialStudents || []);
  const [distribution, setDistribution] = useState<ClassroomDistribution | null>(null);
  const [insights, setInsights] = useState<ClassroomInsight[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentCognitiveProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherData();
  }, [teacherId]);

  const fetchTeacherData = async () => {
    setLoading(true);
    try {
      // Always fetch fresh data from backend
      const response = await getStudentsForTeacher();
      if (response.success && response.students) {
        setStudents(response.students);
        analyzeData(response.students);
      } else {
        analyzeData(initialStudents || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      analyzeData(initialStudents || []);
    }
  };

  const analyzeData = (studentList: StudentCognitiveProfile[]) => {
    try {
      if (studentList.length === 0) {
        setDistribution({
          totalStudents: 0,
          learningStyles: { diverging: 0, assimilating: 0, converging: 0, accommodating: 0 },
          thinkingStyles: { analytical: 0, creative: 0, practical: 0 },
          distribution: { highPerformers: 0, midPerformers: 0, needsSupport: 0 },
          averageScores: { analytical: 0, creative: 0, practical: 0, reflection: 0, intuition: 0, logic: 0 }
        });
        setInsights([]);
        return;
      }
      
      const dist = analyzeClassroom(studentList);
      const classInsights = generateClassroomInsights(dist, studentList);

      setDistribution(dist);
      setInsights(classInsights);
    } catch (error) {
      console.error('Error analyzing classroom:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !distribution) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Prepare chart data
  const learningStyleData = Object.entries(distribution.learningStyles).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    percentage: Math.round((value / distribution.totalStudents) * 100),
  }));

  const thinkingStyleData = Object.entries(distribution.thinkingStyles).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    percentage: Math.round((value / distribution.totalStudents) * 100),
  }));

  const performanceData = [
    { name: 'High Performers', value: distribution.distribution.highPerformers, color: '#10b981' },
    { name: 'Mid Performers', value: distribution.distribution.midPerformers, color: '#3b82f6' },
    { name: 'Needs Support', value: distribution.distribution.needsSupport, color: '#f59e0b' },
  ];

  const cognitiveScoresData = Object.entries(distribution.averageScores).map(([key, value]) => ({
    dimension: key.replace(/([A-Z])/g, ' $1').trim(),
    score: value,
  }));

  const COLORS = ['#5B7DB1', '#6B4C9A', '#10b981', '#f59e0b'];

  const priorityColors = {
    high: 'border-red-500 bg-red-50',
    medium: 'border-yellow-500 bg-yellow-50',
    low: 'border-blue-500 bg-blue-50',
  };

  const priorityIcons = {
    high: AlertCircle,
    medium: Target,
    low: CheckCircle2,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Button variant="ghost" onClick={onBack}>← Back</Button>
          <div className="flex-1">
            <h1 className="font-semibold text-lg">Teacher Analytics Dashboard</h1>
            <p className="text-xs text-muted-foreground">
              Classroom insights and differentiated learning recommendations
            </p>
          </div>
          <Badge className="text-lg px-4 py-2">
            {distribution.totalStudents} Students
          </Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="lessons">Lesson Plans</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{distribution.totalStudents}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">High Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {distribution.distribution.highPerformers}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((distribution.distribution.highPerformers / distribution.totalStudents) * 100)}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Mid Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {distribution.distribution.midPerformers}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((distribution.distribution.midPerformers / distribution.totalStudents) * 100)}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Needs Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    {distribution.distribution.needsSupport}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((distribution.distribution.needsSupport / distribution.totalStudents) * 100)}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Quick Insights
                </CardTitle>
                <CardDescription>Key observations about your classroom</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.slice(0, 3).map((insight, index) => {
                  const Icon = priorityIcons[insight.priority];
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${priorityColors[insight.priority]}`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                          <p className="text-sm font-medium">💡 {insight.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Class Cognitive Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Class Cognitive Profile</CardTitle>
                <CardDescription>Average cognitive dimensions across all students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={cognitiveScoresData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar name="Class Average" dataKey="score" stroke="#5B7DB1" fill="#6B4C9A" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Distribution Tab */}
          <TabsContent value="distribution" className="space-y-6">
            {/* Learning Styles Distribution */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Styles</CardTitle>
                  <CardDescription>How your students prefer to learn</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={learningStyleData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name}: ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {learningStyleData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Thinking Styles Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Thinking Styles</CardTitle>
                  <CardDescription>How your students approach problems</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={thinkingStyleData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name}: ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {thinkingStyleData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Distribution</CardTitle>
                <CardDescription>Student performance levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#5B7DB1">
                        {performanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Cognitive Dimensions Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Class Cognitive Dimensions</CardTitle>
                <CardDescription>Average scores across all dimensions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cognitiveScoresData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dimension" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#6B4C9A" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            {insights.map((insight, index) => {
              const Icon = priorityIcons[insight.priority];
              return (
                <Card key={index} className={`border-2 ${priorityColors[insight.priority]}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        <CardTitle>{insight.title}</CardTitle>
                      </div>
                      <Badge variant={insight.priority === 'high' ? 'destructive' : 'secondary'}>
                        {insight.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <CardDescription>{insight.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4" />
                        <span>Affects {insight.affectedStudents} student{insight.affectedStudents !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="p-3 bg-white rounded-lg border">
                        <p className="text-sm font-medium mb-1">💡 Recommendation:</p>
                        <p className="text-sm text-muted-foreground">{insight.recommendation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {students.map(student => {
                const avgScore = Object.values(student.cognitiveScores).reduce((a, b) => a + b, 0) / 6;
                const performanceColor =
                  avgScore > 75 ? 'text-green-600' : avgScore >= 50 ? 'text-blue-600' : 'text-orange-600';

                return (
                  <Card key={student.userId} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{student.studentName}</CardTitle>
                        <Badge className={performanceColor}>{Math.round(avgScore)}</Badge>
                      </div>
                      <CardDescription>
                        {student.grade} • Age {student.age}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Learning Style</p>
                        <Badge variant="outline" className="capitalize">{student.learningStyle}</Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Thinking Style</p>
                        <Badge variant="outline" className="capitalize">{student.thinkingStyle}</Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Archetype</p>
                        <Badge variant="secondary">{student.archetype}</Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Recommendations
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Student Detail Modal */}
            {selectedStudent && (
              <StudentRecommendationsModal
                student={selectedStudent}
                classmates={students}
                onClose={() => setSelectedStudent(null)}
              />
            )}
          </TabsContent>

          {/* Lesson Plans Tab */}
          <TabsContent value="lessons" className="space-y-4">
            <LessonPlanGenerator distribution={distribution} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Student Recommendations Modal Component
function StudentRecommendationsModal({
  student,
  classmates,
  onClose,
}: {
  student: StudentCognitiveProfile;
  classmates: StudentCognitiveProfile[];
  onClose: () => void;
}) {
  const recommendations = generateStudentRecommendations(student, classmates);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{student.studentName} - Recommendations</CardTitle>
              <CardDescription>Personalized teaching strategies</CardDescription>
            </div>
            <Button variant="ghost" onClick={onClose}>✕</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Teaching Approaches */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Teaching Approaches
            </h3>
            <ul className="space-y-1">
              {recommendations.recommendations.teachingApproaches.map((approach, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>{approach}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Learning Activities */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Learning Activities
            </h3>
            <ul className="space-y-1">
              {recommendations.recommendations.learningActivities.map((activity, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span>{activity}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Peer Pairings */}
          {recommendations.peerPairingsSuggestions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Suggested Peer Pairings
              </h3>
              <div className="space-y-2">
                {recommendations.peerPairingsSuggestions.map((pairing, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg border">
                    <p className="font-medium text-sm">{pairing.partnerName}</p>
                    <p className="text-xs text-muted-foreground">{pairing.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Lesson Plan Generator Component
function LessonPlanGenerator({ distribution }: { distribution: ClassroomDistribution }) {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('');
  const [lessonPlan, setLessonPlan] = useState<any>(null);

  const handleGenerate = () => {
    const plan = generateDifferentiatedLesson(subject, topic, grade, distribution);
    setLessonPlan(plan);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Differentiated Lesson Plan
          </CardTitle>
          <CardDescription>
            Create a lesson plan tailored to your classroom's cognitive distribution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Mathematics"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Fractions"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Grade</label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g., Grade 7"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={!subject || !topic || !grade}>
            Generate Lesson Plan
          </Button>
        </CardContent>
      </Card>

      {lessonPlan && (
        <Card>
          <CardHeader>
            <CardTitle>{lessonPlan.subject}: {lessonPlan.topic}</CardTitle>
            <CardDescription>
              {lessonPlan.grade} • {lessonPlan.duration} minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Objectives</h3>
              <ul className="list-disc list-inside space-y-1">
                {lessonPlan.objectives.map((obj: string, i: number) => (
                  <li key={i} className="text-sm">{obj}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Differentiated Activities</h3>
              <Tabs defaultValue="visual">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="visual">Visual</TabsTrigger>
                  <TabsTrigger value="auditory">Auditory</TabsTrigger>
                  <TabsTrigger value="kinesthetic">Kinesthetic</TabsTrigger>
                </TabsList>
                <TabsContent value="visual" className="space-y-2">
                  {lessonPlan.visualActivities.map((activity: any, i: number) => (
                    <ActivityCard key={i} activity={activity} />
                  ))}
                </TabsContent>
                <TabsContent value="auditory" className="space-y-2">
                  {lessonPlan.auditoryActivities.map((activity: any, i: number) => (
                    <ActivityCard key={i} activity={activity} />
                  ))}
                </TabsContent>
                <TabsContent value="kinesthetic" className="space-y-2">
                  {lessonPlan.kinestheticActivities.map((activity: any, i: number) => (
                    <ActivityCard key={i} activity={activity} />
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ActivityCard({ activity }: { activity: any }) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold">{activity.title}</h4>
        <Badge variant="outline">{activity.duration} min</Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{activity.description}</p>
      <div className="space-y-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Group Size</p>
          <Badge className="capitalize">{activity.groupSize.replace('-', ' ')}</Badge>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Instructions</p>
          <ol className="list-decimal list-inside space-y-1">
            {activity.instructions.map((instruction: string, i: number) => (
              <li key={i} className="text-xs">{instruction}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
