import { Users, LogOut, TrendingUp, BookOpen, UserCheck, GraduationCap, Brain, Target, Lightbulb, FileText, AlertCircle, MessageSquare, Sparkles, RefreshCw, Clock } from 'lucide-react';
import { FrameworkInfo } from './FrameworkInfo';
import { StudentDetailView } from './StudentDetailView';
import { KidsCognitiveProfile } from './kids/KidsCognitiveProfile';
import { EducationalResources } from './EducationalResources';
import { useAuth } from './AuthContext';
import { useState, useEffect } from 'react';
import { MobileHeaderMenu } from './MobileHeaderMenu';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { User } from '../types';
import { getUserAssessmentResults, getStudentsForTeacher } from '../utils/api';
import { getStudentsBySchool, getAllUsers, getAllAssessments } from '../utils/storage';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { formatDate, formatTime } from '../utils/dateFormat';
import { 
  TeacherAppHeader, 
  TeacherTabBar, 
  TeacherClassOverview, 
  TeacherIndividualStudentView 
} from './teacher';
import { getInstitutionForMember } from '../utils/institution';
import { TeacherManagementContent } from './InstitutionDashboard/TeacherManagementContent';

interface TeacherDashboardProps {
  user: User;
  onLogout: () => void;
  onViewSchoolAnalytics?: () => void;
  onViewPlatformEssentials?: () => void;
  onStartAssessment?: (type: string) => void;
  onViewSettings?: () => void;
}

export function TeacherDashboard({ 
  user, 
  onLogout, 
  onViewSchoolAnalytics, 
  onViewPlatformEssentials, 
  onStartAssessment, 
  onViewSettings 
}: TeacherDashboardProps) {
  const { impersonatedUser } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [classStats, setClassStats] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [allAssessments, setAllAssessments] = useState<any[]>([]);
  const [activeStudentTab, setActiveStudentTab] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'individual' | 'my-style' | 'manage-class' | 'teaching-style' | 'analytics-compare'>('overview');
  const [institutionId, setInstitutionId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [allPlatformUsers, setAllPlatformUsers] = useState<any[]>([]);

  useEffect(() => {
    loadClassData();
  }, [user.id, impersonatedUser]);

  const loadClassData = async () => {
    setLoading(true);
    let studentUsers: User[] = [];
    let assessmentsForStats: any[] = [];
    
    try {
      const allUsers = getAllUsers();
      setAllPlatformUsers(allUsers);
      
      const inst = await getInstitutionForMember(user.id);
      if (inst) setInstitutionId(inst.id);

      // If viewing as admin (impersonated user), fetch from API
      if (impersonatedUser) {
        const { results: assessmentResults } = await getUserAssessmentResults(user.id);
        assessmentsForStats = assessmentResults || [];
        
        // For teachers viewed by admin, we'd need to fetch their students from API
        // For now, use localStorage fallback
        const allUsers = getAllUsers();
        studentUsers = allUsers.filter(u => u.role === 'student' && (u.teacherId === user.id || (u.linkedTeachers && u.linkedTeachers.includes(user.id))));
      } else {
        // Regular teacher viewing their own data
        try {
          const response = await getStudentsForTeacher();
          if (response.success && response.students) {
            studentUsers = response.students;
            assessmentsForStats = studentUsers.flatMap((s: any) => s.assessments || []);
            
            // Show success toast only on manual refresh
            if (isRefreshing) {
              toast.success('Class data refreshed successfully');
            }
          } else {
            throw new Error('API unsuccessful');
          }
        } catch (err) {
          console.log('Falling back to local storage for students', err);
          
          // Show warning toast only on manual refresh
          if (isRefreshing) {
            toast.warning('Using offline data - backend unavailable');
          }
          
          const allUsers = getAllUsers();
          studentUsers = allUsers.filter(u => u.role === 'student' && (u.teacherId === user.id || (u.linkedTeachers && u.linkedTeachers.includes(user.id))));
          
          // Scope assessments to only this teacher's students
          const studentIds = new Set(studentUsers.map(s => s.id));
          assessmentsForStats = getAllAssessments().filter((a: any) => studentIds.has(a.userId));
        }
      }

      setStudents(studentUsers);
      setAllAssessments(assessmentsForStats);

      // Calculate statistics
      const kolbDistribution: Record<string, number> = {};
      const sternbergDistribution: Record<string, number> = {};
      const levelDistribution: Record<string, number> = {};

      studentUsers.forEach(student => {
        const studentAssessments = assessmentsForStats.filter(a => a.userId === student.id);
        
        const latestKolb = studentAssessments.filter(a => a.type === 'kolb').sort((a, b) => 
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        )[0];
        
        if (latestKolb?.score.kolb) {
          const style = latestKolb.score.kolb.style;
          kolbDistribution[style] = (kolbDistribution[style] || 0) + 1;
        }

        const latestSternberg = studentAssessments.filter(a => 
          ['sternberg', 'jhs-thinking', 'shs-thinking', 'adult-thinking', 'child-thinking'].includes(a.type)
        ).sort((a, b) => 
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        )[0];
        
        if (latestSternberg) {
          let style = '';
          if (latestSternberg.type === 'sternberg') {
            style = latestSternberg.score.sternberg?.style;
          } else if (latestSternberg.type === 'jhs-thinking') {
            // JHS results structure: score['jhs-thinking'].primaryStyle (key like 'creative')
            const primaryKey = latestSternberg.score['jhs-thinking']?.primaryStyle;
            // Capitalize first letter for display if it's a simple string key
            style = primaryKey ? primaryKey.charAt(0).toUpperCase() + primaryKey.slice(1) : 'Unknown';
          } else if (latestSternberg.type === 'shs-thinking') {
             // Assuming similar structure or extracting directly
             style = latestSternberg.score['shs-thinking']?.primaryStyle || 'Assessed';
          } else if (latestSternberg.type === 'adult-thinking') {
             style = latestSternberg.score['adult-thinking']?.dominantStyle || 'Assessed';
          } else if (latestSternberg.type === 'child-thinking') {
             style = latestSternberg.score['child-thinking']?.primaryStyle || 'Assessed';
          }

          if (style) {
            sternbergDistribution[style] = (sternbergDistribution[style] || 0) + 1;
          }
        }

        if (student.educationLevel) {
          levelDistribution[student.educationLevel] = (levelDistribution[student.educationLevel] || 0) + 1;
        }
      });

      setClassStats({
        kolbDistribution: Object.entries(kolbDistribution).map(([name, value]) => ({ name, value })),
        sternbergDistribution: Object.entries(sternbergDistribution).map(([name, value]) => ({ name, value })),
        levelDistribution: Object.entries(levelDistribution).map(([name, value]) => ({ name, value })),
        totalStudents: studentUsers.length,
        assessmentsCompleted: assessmentsForStats.filter(a => 
          studentUsers.some(s => s.id === a.userId)
        ).length,
      });
    } catch (error) {
      console.error('Error loading class data:', error);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }
  };

  // Get personalized quick insights for a student
  const getStudentQuickInsights = (student: User) => {
    const studentAssessments = allAssessments.filter(a => a.userId === student.id && a.completed);
    
    const latestLearning = studentAssessments
      .filter(a => a.type === 'kolb')
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
    
    const latestThinking = studentAssessments
      .filter(a => ['sternberg', 'jhs-thinking', 'shs-thinking', 'adult-thinking', 'child-thinking'].includes(a.type))
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
    
    const latestDecision = studentAssessments
      .filter(a => a.type === 'dual-process')
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];

    const insights: string[] = [];

    if (latestLearning) {
      const style = latestLearning.score.kolb?.style;
      switch (style) {
        case 'Diverging':
          insights.push('💡 Thrives in group discussions and creative brainstorming');
          insights.push('📝 Benefits from reflection time and journaling');
          break;
        case 'Assimilating':
          insights.push('📚 Prefers structured, organized information');
          insights.push('🧠 Needs time for independent analysis');
          break;
        case 'Converging':
          insights.push('🔧 Excels at practical problem-solving');
          insights.push('⚗️ Enjoys hands-on experiments and applications');
          break;
        case 'Accommodating':
          insights.push('🎯 Learns best through active participation');
          insights.push('✨ Adapts well to new situations and trial-and-error');
          break;
      }
    }

    if (latestThinking) {
      let style = '';
      if (latestThinking.type === 'sternberg') {
        style = latestThinking.score.sternberg?.style;
      } else if (latestThinking.type === 'jhs-thinking') {
        const primaryKey = latestThinking.score['jhs-thinking']?.primaryStyle;
        style = primaryKey ? primaryKey.charAt(0).toUpperCase() + primaryKey.slice(1) : '';
      } else if (latestThinking.type === 'shs-thinking') {
        style = latestThinking.score['shs-thinking']?.primaryStyle || '';
      } else if (latestThinking.type === 'adult-thinking') {
        style = latestThinking.score['adult-thinking']?.dominantStyle || '';
      } else if (latestThinking.type === 'child-thinking') {
        style = latestThinking.score['child-thinking']?.primaryStyle || '';
      }

      switch (style) {
        case 'Analytical':
        case 'analytical':
          insights.push('🔍 Strong critical thinking and analysis skills');
          break;
        case 'Creative':
        case 'creative':
          insights.push('🎨 Innovative thinker with imaginative solutions');
          break;
        case 'Practical':
        case 'practical':
          insights.push('🛠️ Applies knowledge to real-world situations effectively');
          break;
        case 'Reflective':
        case 'reflective':
          insights.push('💭 Deep thinker who considers all angles before acting');
          break;
      }
    }

    return insights;
  };

  // Get top 3 teaching strategies for a student
  const getTopStrategies = (student: User) => {
    const studentAssessments = allAssessments.filter(a => a.userId === student.id && a.completed);
    
    const latestLearning = studentAssessments
      .filter(a => a.type === 'kolb')
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];

    if (!latestLearning) return [];

    const style = latestLearning.score.kolb?.style;
    const strategies: string[] = [];

    switch (style) {
      case 'Diverging':
        strategies.push('Start lessons with open-ended questions', 'Use group work for problem exploration', 'Allow time for personal reflection');
        break;
      case 'Assimilating':
        strategies.push('Present clear theoretical frameworks', 'Provide reading materials ahead of time', 'Use diagrams and models');
        break;
      case 'Converging':
        strategies.push('Focus on practical applications', 'Use problem-solving activities', 'Provide clear step-by-step processes');
        break;
      case 'Accommodating':
        strategies.push('Incorporate hands-on activities', 'Allow experimentation', 'Provide immediate feedback');
        break;
    }

    return strategies.slice(0, 3);
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadClassData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-violet-50 to-indigo-50">
      <TeacherAppHeader user={user} onLogout={onLogout} onViewSettings={onViewSettings} />
      
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {selectedStudent ? (
          (() => {
            const studentAge = selectedStudent.age;
            const isKidsMode = studentAge && studentAge >= 6 && studentAge <= 10;
            
            // Use Kids Cognitive Profile for ages 6-10
            if (isKidsMode) {
              return (
                <KidsCognitiveProfile
                  user={selectedStudent}
                  onClose={() => setSelectedStudent(null)}
                  isParentView={true}
                />
              );
            }
            
            // Use regular detail view for older students
            return (
              <StudentDetailView
                student={selectedStudent}
                assessments={allAssessments}
                onBack={() => setSelectedStudent(null)}
              />
            );
          })()
        ) : (
          <>
        {/* Onboarding Info for Teachers */}
        {students.length === 0 && (
          <Alert className="border-[#6B4C9A] bg-blue-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Getting Started</AlertTitle>
            <AlertDescription>
              Students from <strong>{user.school}</strong> will automatically appear here once they register and complete their assessments. 
              Students must select the same school name during registration to be linked to your class.
            </AlertDescription>
          </Alert>
        )}

        <TeacherTabBar activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* MAIN TAB: Individual Students with Personalized Tabs */}
        {activeTab === 'individual' && (
          <div className="space-y-6">
          <Card className="border-2 border-[#6B4C9A]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-6 w-6 text-[#6B4C9A]" />
                    Individual Student Profiles
                  </CardTitle>
                  <CardDescription className="mt-2">
                    View personalized insights, teaching strategies, and educational resources for each student
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {students.length} Students
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {students.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Students Found</AlertTitle>
              <AlertDescription>
                No students from {user.school || 'your school'} have registered yet.
              </AlertDescription>
            </Alert>
          ) : (
            <Tabs value={activeStudentTab || students[0]?.id} onValueChange={setActiveStudentTab} className="w-full">
              <TabsList className="w-full flex-wrap h-auto gap-2 bg-transparent justify-start">
                {students.map(student => {
                  const studentAssessments = allAssessments.filter(a => a.userId === student.id && a.completed);
                  const completionRate = (studentAssessments.length / 3) * 100;
                  
                  return (
                    <TabsTrigger 
                      key={student.id} 
                      value={student.id}
                      className="flex-col h-auto py-3 px-4 data-[state=active]:bg-white data-[state=active]:shadow-md"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#6B4C9A] to-[#5B7DB1] flex items-center justify-center text-white text-sm font-semibold">
                          {student.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{student.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {studentAssessments.length}/3 Complete
                          </div>
                        </div>
                      </div>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {students.map(student => {
                const studentAssessments = allAssessments.filter(a => a.userId === student.id && a.completed);
                
                const latestLearning = studentAssessments
                  .filter(a => a.type === 'kolb')
                  .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
                
                const latestThinking = studentAssessments
                  .filter(a => ['sternberg', 'jhs-thinking', 'shs-thinking', 'adult-thinking', 'child-thinking'].includes(a.type))
                  .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
                
                const latestDecision = studentAssessments
                  .filter(a => a.type === 'dual-process')
                  .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];

                const insights = getStudentQuickInsights(student);
                const strategies = getTopStrategies(student);

                return (
                  <TabsContent key={student.id} value={student.id} className="space-y-6 mt-6">
                    {/* Student Header Card */}
                    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#6B4C9A] to-[#5B7DB1] flex items-center justify-center text-white text-2xl font-bold">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <CardTitle className="text-2xl">{student.name}</CardTitle>
                              <div className="flex items-center gap-2 mt-2">
                                {student.educationLevel && (
                                  <Badge variant="outline">
                                    <GraduationCap className="h-3 w-3 mr-1" />
                                    {student.educationLevel}
                                  </Badge>
                                )}
                                <Badge 
                                  variant={studentAssessments.length === 3 ? "default" : "secondary"}
                                  className={studentAssessments.length === 3 ? "bg-green-600" : ""}
                                >
                                  {studentAssessments.length}/3 Assessments Complete
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Button onClick={() => setSelectedStudent(student)} variant="outline">
                            View Full Profile
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>

                    {studentAssessments.length === 0 ? (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>No Assessment Data Yet</AlertTitle>
                        <AlertDescription>
                          {student.name} hasn't completed any assessments yet. Encourage them to complete their cognitive assessments to receive personalized teaching strategies.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <>
                        {/* Cognitive Profile Summary */}
                        <div className="grid md:grid-cols-3 gap-4">
                          <Card className={latestLearning ? "border-2 border-green-200 bg-green-50/50" : "border-gray-200"}>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-base">
                                <BookOpen className="h-5 w-5 text-green-600" />
                                Learning Style
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {latestLearning ? (
                                <div>
                                  <Badge className="text-base px-3 py-1 bg-green-600">
                                    {latestLearning.score.kolb?.style}
                                  </Badge>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Assessed {formatDate(latestLearning.completedAt!)}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">Not yet assessed</p>
                              )}
                            </CardContent>
                          </Card>

                          <Card className={latestThinking ? "border-2 border-purple-200 bg-purple-50/50" : "border-gray-200"}>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-base">
                                <Brain className="h-5 w-5 text-purple-600" />
                                Thinking Style
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {latestThinking ? (
                                <div>
                                  <Badge className="text-base px-3 py-1 bg-purple-600">
                                    {(() => {
                                      if (latestThinking.type === 'sternberg') return latestThinking.score.sternberg?.style;
                                      if (latestThinking.type === 'jhs-thinking') {
                                        const s = latestThinking.score['jhs-thinking']?.primaryStyle;
                                        return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Assessed';
                                      }
                                      if (latestThinking.type === 'shs-thinking') return latestThinking.score['shs-thinking']?.primaryStyle || 'Assessed';
                                      if (latestThinking.type === 'adult-thinking') {
                                         const s = latestThinking.score['adult-thinking']?.dominantStyle;
                                         return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Assessed';
                                      }
                                      if (latestThinking.type === 'child-thinking') return latestThinking.score['child-thinking']?.primaryStyle || 'Assessed';
                                      return 'Unknown';
                                    })()}
                                  </Badge>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {(() => {
                                      if (latestThinking.type === 'sternberg') return 'Sternberg Thinking Style';
                                      if (latestThinking.type === 'jhs-thinking') return 'JHS Thinking Style';
                                      if (latestThinking.type === 'shs-thinking') return 'SHS Thinking Style';
                                      if (latestThinking.type === 'adult-thinking') return 'Professional Thinking Style';
                                      if (latestThinking.type === 'child-thinking') return 'Child Thinking Style';
                                      return 'Thinking Style';
                                    })()}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Assessed {formatDate(latestThinking.completedAt!)}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">Not yet assessed</p>
                              )}
                            </CardContent>
                          </Card>

                          <Card className={latestDecision ? "border-2 border-orange-200 bg-orange-50/50" : "border-gray-200"}>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-base">
                                <Target className="h-5 w-5 text-orange-600" />
                                Decision Style
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {latestDecision ? (
                                <div>
                                  <Badge className="text-base px-3 py-1 bg-orange-600">
                                    {latestDecision.score.dualProcess?.style}
                                  </Badge>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Assessed {formatDate(latestDecision.completedAt!)}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">Not yet assessed</p>
                              )}
                            </CardContent>
                          </Card>
                        </div>

                        {/* Quick Insights */}
                        {insights.length > 0 && (
                          <Card className="border-[#6B4C9A]">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-yellow-600" />
                                Quick Insights for {student.name}
                              </CardTitle>
                              <CardDescription>
                                Key characteristics based on cognitive profile
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid md:grid-cols-2 gap-3">
                                {insights.map((insight, index) => (
                                  <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <span className="text-sm text-blue-900">{insight}</span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Top Teaching Strategies */}
                        {strategies.length > 0 && (
                          <Card className="border-green-200">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-green-600" />
                                Top 3 Teaching Strategies for {student.name}
                              </CardTitle>
                              <CardDescription>
                                Personalized strategies aligned with their learning style
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {strategies.map((strategy, index) => (
                                  <div key={index} className="flex gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex-shrink-0">
                                      <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
                                        {index + 1}
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm text-green-900">{strategy}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <Button 
                                className="w-full mt-4" 
                                variant="outline"
                                onClick={() => setSelectedStudent(student)}
                              >
                                View All Personalized Strategies
                              </Button>
                            </CardContent>
                          </Card>
                        )}

                        {/* Tailored Educational Resources */}
                        <Card className="border-purple-200">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-purple-600" />
                              Educational Resources for {student.name}
                            </CardTitle>
                            <CardDescription>
                              Materials and guides tailored to their cognitive profile
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <EducationalResources
                              learningStyle={latestLearning?.score.kolb?.style}
                              thinkingStyle={latestThinking?.score.sternberg?.style}
                              decisionStyle={latestDecision?.score.dualProcess?.style}
                              userType="teacher"
                            />
                          </CardContent>
                        </Card>
                      </>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          )}
        </div>
        )}

        {/* Class Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
          <TeacherClassOverview
            students={students}
            assessments={allAssessments}
          />
        </div>
        )}

        {/* General Teaching Resources */}
        {activeTab === 'my-style' && (
          <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Teaching Resources</CardTitle>
              <CardDescription>
                Educational materials and guides for differentiated instruction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EducationalResources
                userType="teacher"
              />
            </CardContent>
          </Card>
          </div>
        )}

        {/* Feedback Tab (Now appended to my-style since there is no button for it) */}
        {activeTab === 'my-style' && (
          <div className="space-y-6">
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
                  Your feedback helps us improve the platform for teachers, students, parents, and professionals across Ghana
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
                      <span className="text-sm">How JotMinds helps your teaching practice</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-[#5B7DB1] font-bold text-lg">•</span>
                      <span className="text-sm">Student insights and data usefulness</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                      <span className="text-[#6B4C9A] font-bold text-lg">•</span>
                      <span className="text-sm">Features that support differentiation</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-[#5B7DB1] font-bold text-lg">•</span>
                      <span className="text-sm">Integration with your classroom workflow</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                      <span className="text-[#6B4C9A] font-bold text-lg">•</span>
                      <span className="text-sm">Resource quality and relevance</span>
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
                      <p className="text-sm font-medium text-gray-900 mb-1">Your Feedback Shapes JotMinds</p>
                      <p className="text-sm text-gray-600">
                        As an educator, your insights help us create better tools for differentiated instruction and student support across Ghana's education system.
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
          </div>
        )}

        {activeTab === 'manage-class' && (
          <div className="h-[800px]">
            <TeacherManagementContent
              teacher={user}
              institutionId={institutionId}
              allPlatformUsers={allPlatformUsers}
              onRefresh={loadClassData}
            />
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}