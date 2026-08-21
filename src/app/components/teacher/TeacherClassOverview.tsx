import { useState, useMemo } from 'react';
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
  Clock,
  Filter
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

export function TeacherClassOverview({ students: rawStudents, assessments: rawAssessments }: TeacherClassOverviewProps) {
  const [selectedClass, setSelectedClass] = useState<string>('ALL');

  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    rawStudents.forEach((s: any) => {
      if (s.className) set.add(s.className);
      if (s.class) set.add(s.class);
      if (s.grade) set.add(s.grade);
    });
    return Array.from(set).sort();
  }, [rawStudents]);

  const students = useMemo(() => {
    if (selectedClass === 'ALL') return rawStudents;
    return rawStudents.filter((s: any) => 
      s.className === selectedClass || 
      s.class === selectedClass || 
      s.grade === selectedClass
    );
  }, [rawStudents, selectedClass]);

  const filteredStudentIds = useMemo(() => new Set(students.map(s => s.id)), [students]);

  const assessments = useMemo(() => {
    return rawAssessments.filter(a => filteredStudentIds.has(a.userId));
  }, [rawAssessments, filteredStudentIds]);

  // Calculate class statistics
  const totalStudents = students.length;
  
  // Deduplicate assessments by userId and type to prevent double counting
  const uniqueAssessmentsMap = new Map();
  assessments.forEach(a => {
    if (a.completed || a.completedAt) {
      // Normalize type for grouping
      const typeStr = ((a.type as string) === 'learning' || a.type === 'kolb') ? 'kolb' : 
                      ['sternberg', 'jhs-thinking', 'shs-thinking', 'adult-thinking', 'child-thinking'].includes(a.type) ? 'thinking' :
                      ((a.type as string) === 'decision' || a.type === 'dual-process') ? 'decision' : a.type;
      const key = `${a.userId}-${typeStr}`;
      uniqueAssessmentsMap.set(key, a);
    }
  });
  const uniqueCompletedAssessments = Array.from(uniqueAssessmentsMap.values());
  
  const studentsWithAssessments = students.filter(s => 
    uniqueCompletedAssessments.some(a => a.userId === s.id)
  ).length;
  const studentsWithoutAssessments = totalStudents - studentsWithAssessments;
  
  const completedAssessments = uniqueCompletedAssessments.length;
  const averageCompletion = totalStudents > 0 
    ? Math.round((studentsWithAssessments / totalStudents) * 100) 
    : 0;

  // Learning style distribution
  const learningStyleDistribution: Record<string, number> = {};
  assessments
    .filter(a => (a.type === 'kolb' || (a.type as any) === 'learning') && (a.completed || a.completedAt))
    .forEach(a => {
      const style = a.score?.kolb?.style || (a.score as any)?.learning?.style || 'Unknown';
      learningStyleDistribution[style] = (learningStyleDistribution[style] || 0) + 1;
    });

  const learningCount = uniqueCompletedAssessments.filter(a => (a.type === 'kolb' || (a.type as any) === 'learning')).length;
  if (totalStudents > learningCount) {
    learningStyleDistribution['Unknown'] = (learningStyleDistribution['Unknown'] || 0) + (totalStudents - learningCount);
  }

  const learningStyleData = Object.entries(learningStyleDistribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => {
      if (a.name === 'Unknown') return 1;
      if (b.name === 'Unknown') return -1;
      return b.value - a.value;
    });

  // Thinking style distribution
  const thinkingStyleDistribution: Record<string, number> = {};
  assessments
    .filter(a => ['sternberg', 'jhs-thinking', 'shs-thinking', 'adult-thinking', 'child-thinking'].includes(a.type) && (a.completed || a.completedAt))
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

  const thinkingCount = uniqueCompletedAssessments.filter(a => 
    ['sternberg', 'jhs-thinking', 'shs-thinking', 'adult-thinking', 'child-thinking'].includes(a.type)
  ).length;

  if (totalStudents > thinkingCount) {
    thinkingStyleDistribution['Unknown'] = (thinkingStyleDistribution['Unknown'] || 0) + (totalStudents - thinkingCount);
  }

  const thinkingStyleData = Object.entries(thinkingStyleDistribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => {
      if (a.name === 'Unknown') return 1;
      if (b.name === 'Unknown') return -1;
      return b.value - a.value;
    });

  const kolbCount = uniqueCompletedAssessments.filter(a => (a.type === 'kolb' || (a.type as any) === 'learning')).length;
  const decisionCount = uniqueCompletedAssessments.filter(a => (a.type === 'dual-process' || (a.type as any) === 'decision')).length;

  const completionData = [
    { name: 'Learning Style', completed: kolbCount, pending: Math.max(0, totalStudents - kolbCount), total: totalStudents },
    { name: 'Thinking Style', completed: thinkingCount, pending: Math.max(0, totalStudents - thinkingCount), total: totalStudents },
    { name: 'Decision Style', completed: decisionCount, pending: Math.max(0, totalStudents - decisionCount), total: totalStudents }
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FF]">
      <div className="px-4 lg:px-6 py-4 space-y-6 max-w-[960px] mx-auto">
        {/* Class Filter Bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-sm text-slate-800 dark:text-white">Filter View by Class / Grade:</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Classes ({rawStudents.length} Total Students)</option>
              {availableClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Class Stats Header */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
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
                  <p className="text-[13px] text-muted-foreground font-medium">Pending Students</p>
                  <p className="text-[24px] font-bold mt-1 text-red-500">{studentsWithoutAssessments}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-red-600" />
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
              <CardTitle className="text-[16px]">Assessment Completion Progress</CardTitle>
            </div>
            <CardDescription className="text-[13px]">
              See what percentage of your class has completed each assessment type.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={completionData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis 
                  type="number"
                  domain={[0, totalStudents > 0 ? totalStudents : 1]}
                  tick={{ fontSize: 12 }}
                  stroke="#64748b"
                />
                <YAxis 
                  dataKey="name" 
                  type="category"
                  tick={{ fontSize: 13, fill: '#334155', fontWeight: 500 }}
                  stroke="#64748b"
                  width={100}
                />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #E2E8F0',
                    fontSize: '13px'
                  }}
                  formatter={(value: number, name: string) => [value, name === 'completed' ? 'Completed' : 'Pending']}
                />
                <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                <Bar dataKey="completed" stackId="a" fill={COLORS.success} name="Completed" radius={[0, 0, 0, 0]} barSize={24} />
                <Bar dataKey="pending" stackId="a" fill="#E2E8F0" name="Pending" radius={[0, 4, 4, 0]} barSize={24} />
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
                  Learning Styles across your class
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={learningStyleData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                    >
                      {learningStyleData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.name === 'Unknown' ? '#94A3B8' : [COLORS.success, COLORS.primary, COLORS.warning, COLORS.purple][index % 4]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px' }}
                      formatter={(value: number) => [`${value} student${value !== 1 ? 's' : ''}`, 'Count']}
                    />
                    <Legend wrapperStyle={{ fontSize: '13px' }} layout="horizontal" verticalAlign="bottom" align="center" />
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
                  Thinking Styles across your class
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={thinkingStyleData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                    >
                      {thinkingStyleData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.name === 'Unknown' ? '#94A3B8' : [COLORS.purple, COLORS.info, COLORS.pink, COLORS.warning][index % 4]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px' }}
                      formatter={(value: number) => [`${value} student${value !== 1 ? 's' : ''}`, 'Count']}
                    />
                    <Legend wrapperStyle={{ fontSize: '13px' }} layout="horizontal" verticalAlign="bottom" align="center" />
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
                    <strong>Next step:</strong> Review individual student profiles in the "Student Roster" tab 
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