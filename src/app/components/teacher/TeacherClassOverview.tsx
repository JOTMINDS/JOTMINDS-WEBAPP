import { User, Assessment } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Users, 
  TrendingUp, 
  BookOpen, 
  Brain, 
  Target,
  Award,
  Clock
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface TeacherClassOverviewProps {
  students: User[];
  assessments: Assessment[];
}

const COLORS = {
  primary: '#2563EB',
  success: '#16A34A',
  warning: '#F97316',
  purple: '#8B5CF6',
  info: '#06B6D4',
  pink: '#EC4899'
};

export function TeacherClassOverview({ students, assessments }: TeacherClassOverviewProps) {
  // Calculate class statistics
  const totalStudents = students.length;
  const studentsWithAssessments = students.filter(s => 
    assessments.some(a => a.userId === s.id && a.completed)
  ).length;
  
  const completedAssessments = assessments.filter(a => a.completed).length;
  const averageCompletion = totalStudents > 0 
    ? Math.round((studentsWithAssessments / totalStudents) * 100) 
    : 0;

  // Learning style distribution
  const learningStyleDistribution: Record<string, number> = {};
  assessments
    .filter(a => (a.type === 'kolb' || a.type === 'learning') && a.completed)
    .forEach(a => {
      const style = a.score?.kolb?.style || a.score?.learning?.style || 'Unknown';
      learningStyleDistribution[style] = (learningStyleDistribution[style] || 0) + 1;
    });

  const learningStyleData = Object.entries(learningStyleDistribution).map(([name, value]) => ({
    name,
    value
  }));

  // Thinking style distribution
  const thinkingStyleDistribution: Record<string, number> = {};
  assessments
    .filter(a => ['sternberg', 'jhs-thinking', 'shs-thinking', 'adult-thinking', 'child-thinking'].includes(a.type) && a.completed)
    .forEach(a => {
      let style = 'Unknown';
      if (a.type === 'sternberg') {
        style = a.score.sternberg?.style || 'Unknown';
      } else if (a.type === 'jhs-thinking') {
        const s = a.score['jhs-thinking']?.primaryStyle;
        style = s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Unknown';
      } else if (a.type === 'shs-thinking') {
        style = a.score['shs-thinking']?.primaryStyle || 'Unknown';
      } else if (a.type === 'adult-thinking') {
        const s = a.score['adult-thinking']?.dominantStyle;
        style = s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Unknown';
      } else if (a.type === 'child-thinking') {
        style = a.score['child-thinking']?.primaryStyle || 'Unknown';
      }
      thinkingStyleDistribution[style] = (thinkingStyleDistribution[style] || 0) + 1;
    });

  const thinkingStyleData = Object.entries(thinkingStyleDistribution).map(([name, value]) => ({
    name,
    value
  }));

  // Assessment completion by type
  const kolbCount = assessments.filter(a => (a.type === 'kolb' || a.type === 'learning') && a.completed).length;
  const thinkingCount = assessments.filter(a => 
    ['sternberg', 'jhs-thinking', 'shs-thinking', 'adult-thinking', 'child-thinking'].includes(a.type) && a.completed
  ).length;
  const decisionCount = assessments.filter(a => (a.type === 'dual-process' || a.type === 'decision') && a.completed).length;

  const completionData = [
    { name: 'Learning Style', completed: kolbCount, total: totalStudents },
    { name: 'Thinking Style', completed: thinkingCount, total: totalStudents },
    { name: 'Decision Style', completed: decisionCount, total: totalStudents }
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FF]">
      <div className="px-4 lg:px-6 py-4 space-y-6 max-w-[960px] mx-auto">
        {/* Class Stats Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-muted-foreground font-medium">Total Students</p>
                  <p className="text-[24px] font-bold mt-1">{totalStudents}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-muted-foreground font-medium">Active Students</p>
                  <p className="text-[24px] font-bold mt-1">{studentsWithAssessments}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-muted-foreground font-medium">Completed</p>
                  <p className="text-[24px] font-bold mt-1">{completedAssessments}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-muted-foreground font-medium">Avg. Completion</p>
                  <p className="text-[24px] font-bold mt-1">{averageCompletion}%</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assessment Completion Progress */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-[16px]">Assessment Completion by Type</CardTitle>
            </div>
            <CardDescription className="text-[13px]">
              Track how many students have completed each assessment type
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={completionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  stroke="#64748b"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#64748b"
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #E2E8F0',
                    fontSize: '13px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '13px' }}
                />
                <Bar dataKey="completed" fill={COLORS.primary} name="Completed" radius={[8, 8, 0, 0]} />
                <Bar dataKey="total" fill="#E2E8F0" name="Total Students" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Learning & Thinking Style Distribution */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Learning Styles */}
          {learningStyleData.length > 0 && (
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-[16px]">Learning Style Distribution</CardTitle>
                </div>
                <CardDescription className="text-[13px]">
                  Kolb Learning Styles across your class
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={learningStyleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = outerRadius + 25;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        
                        return (
                          <text 
                            x={x} 
                            y={y} 
                            fill="#334155"
                            textAnchor={x > cx ? 'start' : 'end'} 
                            dominantBaseline="central"
                            style={{ fontSize: '12px', fontWeight: 500 }}
                          >
                            {`${name} ${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {learningStyleData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={[COLORS.success, COLORS.primary, COLORS.warning, COLORS.purple][index % 4]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: '1px solid #E2E8F0',
                        fontSize: '13px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Thinking Styles */}
          {thinkingStyleData.length > 0 && (
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-[16px]">Thinking Style Distribution</CardTitle>
                </div>
                <CardDescription className="text-[13px]">
                  Sternberg Thinking Styles across your class
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={thinkingStyleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {thinkingStyleData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={[COLORS.purple, COLORS.info, COLORS.pink, COLORS.warning][index % 4]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: '1px solid #E2E8F0',
                        fontSize: '13px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Class Insights */}
        <Card className="rounded-2xl shadow-sm bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle className="text-[16px]">Class Insights</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2">
              {averageCompletion < 50 && (
                <div className="p-3 bg-white rounded-xl">
                  <p className="text-[13px]">
                    <strong>Action needed:</strong> Less than half of your students have completed assessments. 
                    Consider sending reminders to boost participation.
                  </p>
                </div>
              )}
              {learningStyleData.length > 0 && (
                <div className="p-3 bg-white rounded-xl">
                  <p className="text-[13px]">
                    <strong>Diversity strength:</strong> Your class shows diverse learning preferences. 
                    Use varied teaching methods to engage all students effectively.
                  </p>
                </div>
              )}
              {studentsWithAssessments > 0 && (
                <div className="p-3 bg-white rounded-xl">
                  <p className="text-[13px]">
                    <strong>Next step:</strong> Review individual student profiles in the "Individual Students" tab 
                    to access personalized teaching strategies for each learner.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}