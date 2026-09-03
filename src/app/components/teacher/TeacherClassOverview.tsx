import { useState, useMemo } from 'react';
import { User, Assessment } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Users, 
  TrendingUp, 
  BookOpen, 
  Brain, 
  Target,
  Award,
  Clock,
  Filter,
  PieChart as PieIcon,
  BarChart3,
  Radar as RadarIcon,
  LayoutGrid,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

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
  pink: '#EC4899',
  emerald: '#10B981',
  indigo: '#6366F1'
};

const CHART_PALETTE = ['#2563EB', '#16A34A', '#8B5CF6', '#F97316', '#06B6D4', '#EC4899', '#10B981'];

export function TeacherClassOverview({ students: rawStudents, assessments: rawAssessments }: TeacherClassOverviewProps) {
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [graphViewMode, setGraphViewMode] = useState<'donut' | 'bar' | 'radar' | 'cards'>('donut');

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
    .map(([name, value]) => ({ 
      name, 
      value,
      percentage: totalStudents > 0 ? Math.round((value / totalStudents) * 100) : 0
    }))
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
    .map(([name, value]) => ({ 
      name, 
      value,
      percentage: totalStudents > 0 ? Math.round((value / totalStudents) * 100) : 0
    }))
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

  // Radar Data for Multidimensional Profiling
  const radarData = [
    { dimension: 'Accommodating', score: learningStyleDistribution['Accommodating'] || 0, fullMark: totalStudents },
    { dimension: 'Diverging', score: learningStyleDistribution['Diverging'] || 0, fullMark: totalStudents },
    { dimension: 'Converging', score: learningStyleDistribution['Converging'] || 0, fullMark: totalStudents },
    { dimension: 'Assimilating', score: learningStyleDistribution['Assimilating'] || 0, fullMark: totalStudents },
    { dimension: 'Analytical', score: thinkingStyleDistribution['Analytical'] || 0, fullMark: totalStudents },
    { dimension: 'Creative', score: thinkingStyleDistribution['Creative'] || 0, fullMark: totalStudents },
    { dimension: 'Practical', score: thinkingStyleDistribution['Practical'] || 0, fullMark: totalStudents },
  ];

  // Derive Top Dominant Styles for Pedagogical Insights
  const dominantLearning = learningStyleData.filter(d => d.name !== 'Unknown')[0]?.name || 'Diverse';
  const dominantThinking = thinkingStyleData.filter(d => d.name !== 'Unknown')[0]?.name || 'Balanced';

  return (
    <div className="min-h-screen bg-[#F5F7FF] pb-12">
      <div className="px-4 lg:px-6 py-4 space-y-6 max-w-[1020px] mx-auto">
        {/* Class Filter Bar & Graph View Toggle */}
        <div className="flex items-center justify-between gap-3 flex-wrap bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-sm text-slate-800 dark:text-white">Class Filter:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Classes ({rawStudents.length} Students)</option>
              {availableClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Graph View Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setGraphViewMode('donut')}
              className={`p-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                graphViewMode === 'donut' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Donut / Pie Chart View"
            >
              <PieIcon className="w-3.5 h-3.5" /> Donut
            </button>
            <button
              onClick={() => setGraphViewMode('bar')}
              className={`p-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                graphViewMode === 'bar' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Bar Chart View"
            >
              <BarChart3 className="w-3.5 h-3.5" /> Bars
            </button>
            <button
              onClick={() => setGraphViewMode('radar')}
              className={`p-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                graphViewMode === 'radar' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Radar Profile View"
            >
              <RadarIcon className="w-3.5 h-3.5" /> Radar
            </button>
            <button
              onClick={() => setGraphViewMode('cards')}
              className={`p-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                graphViewMode === 'cards' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Grid Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Cards
            </button>
          </div>
        </div>

        {/* Class Stats Header */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <Card className="rounded-2xl shadow-xs border-slate-200 dark:border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] text-muted-foreground font-medium">Total Students</p>
                  <p className="text-[22px] font-bold mt-1 text-slate-900 dark:text-white">{totalStudents}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xs border-slate-200 dark:border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] text-muted-foreground font-medium">Assessed</p>
                  <p className="text-[22px] font-bold mt-1 text-emerald-600">{studentsWithAssessments}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
                  <Award className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xs border-slate-200 dark:border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] text-muted-foreground font-medium">Pending</p>
                  <p className="text-[22px] font-bold mt-1 text-amber-500">{studentsWithoutAssessments}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xs border-slate-200 dark:border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] text-muted-foreground font-medium">Total Tests</p>
                  <p className="text-[22px] font-bold mt-1 text-purple-600">{completedAssessments}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xs border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] text-muted-foreground font-medium">Avg Completion</p>
                  <p className="text-[22px] font-bold mt-1 text-indigo-600">{averageCompletion}%</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actionable Pedagogical Class Insights Banner */}
        <Card className="rounded-2xl shadow-sm border-indigo-100 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white">
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                <CardTitle className="text-base font-bold text-white">Classroom Intelligence & Pedagogical Recommendations</CardTitle>
              </div>
              <Badge className="bg-indigo-500/30 text-indigo-200 border-indigo-400/30 text-xs">
                {selectedClass === 'ALL' ? 'All Classes' : selectedClass} Context
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-300">
              Actionable teaching strategies tailored to this group's dominant cognitive patterns.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 bg-white/10 rounded-xl border border-white/10 space-y-1">
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5" /> Dominant Learning Style: {dominantLearning}
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {dominantLearning === 'Diverging' ? 'Students learn best through open brainstorms, roleplays, and collaborative group discussions.' :
                   dominantLearning === 'Assimilating' ? 'Emphasize concise theoretical frameworks, structured readings, and systematic logical lectures.' :
                   dominantLearning === 'Converging' ? 'Provide hands-on problem-solving exercises, laboratory experiments, and direct technical challenges.' :
                   dominantLearning === 'Accommodating' ? 'Encourage active experimentation, field exploration, and real-world project trials.' :
                   'Employ differentiated multi-modal lessons balancing visual diagrams and practical problems.'}
                </p>
              </div>

              <div className="p-3.5 bg-white/10 rounded-xl border border-white/10 space-y-1">
                <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block flex items-center gap-1">
                  <Brain className="w-3.5 h-3.5" /> Thinking Orientation: {dominantThinking}
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {dominantThinking === 'Analytical' ? 'Incorporate comparison matrices, data interpretation tasks, and critical evaluation rubrics.' :
                   dominantThinking === 'Creative' ? 'Invite divergent thinking questions, design challenges, and open-ended synthesis projects.' :
                   dominantThinking === 'Practical' ? 'Ground each concept in everyday applications, local Ghanaian case studies, and career links.' :
                   'Utilize mixed problem formats that exercise analysis, invention, and real-life execution.'}
                </p>
              </div>

              <div className="p-3.5 bg-white/10 rounded-xl border border-white/10 space-y-1">
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" /> Recommended Lesson Flow
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Start with a 5-min concrete hook, transition into 15-min guided application, and reserve 15 mins for differentiated peer practice.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Completion Progress */}
        <Card className="rounded-2xl shadow-xs border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-[15px] font-bold">Assessment Module Completion Progress</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Tracking completion status across Kolb Learning, Sternberg Thinking, and Dual-Process Decision assessments.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={completionData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis 
                  type="number"
                  domain={[0, totalStudents > 0 ? totalStudents : 1]}
                  tick={{ fontSize: 11 }}
                  stroke="#64748b"
                />
                <YAxis 
                  dataKey="name" 
                  type="category"
                  tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }}
                  stroke="#64748b"
                  width={110}
                />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #E2E8F0',
                    fontSize: '12px'
                  }}
                  formatter={(value: number, name: string) => [value, name === 'completed' ? 'Completed' : 'Pending']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="completed" stackId="a" fill={COLORS.success} name="Completed" radius={[0, 0, 0, 0]} barSize={20} />
                <Bar dataKey="pending" stackId="a" fill="#E2E8F0" name="Pending" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Dynamic Multi-Option Graph Displays */}
        {graphViewMode === 'donut' && (
          <div className="grid md:grid-cols-2 gap-4">
            {/* Learning Styles Donut */}
            <Card className="rounded-2xl shadow-xs border-slate-200 dark:border-slate-800">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-[15px] font-bold flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-emerald-600" /> Learning Style Distribution
                  </CardTitle>
                  <CardDescription className="text-xs">Kolb Experiential Dimensions</CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px]">{learningCount} Assessed</Badge>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={learningStyleData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="name"
                    >
                      {learningStyleData.map((entry, index) => (
                        <Cell 
                          key={`cell-l-${index}`} 
                          fill={entry.name === 'Unknown' ? '#CBD5E1' : CHART_PALETTE[index % CHART_PALETTE.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                      formatter={(value: number) => [`${value} student${value !== 1 ? 's' : ''} (${totalStudents > 0 ? Math.round((value / totalStudents) * 100) : 0}%)`, 'Count']}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} layout="horizontal" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Thinking Styles Donut */}
            <Card className="rounded-2xl shadow-xs border-slate-200 dark:border-slate-800">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-[15px] font-bold flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-600" /> Thinking Style Distribution
                  </CardTitle>
                  <CardDescription className="text-xs">Sternberg Triarchic Dimensions</CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px]">{thinkingCount} Assessed</Badge>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={thinkingStyleData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="name"
                    >
                      {thinkingStyleData.map((entry, index) => (
                        <Cell 
                          key={`cell-t-${index}`} 
                          fill={entry.name === 'Unknown' ? '#CBD5E1' : [COLORS.purple, COLORS.info, COLORS.pink, COLORS.warning][index % 4]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                      formatter={(value: number) => [`${value} student${value !== 1 ? 's' : ''} (${totalStudents > 0 ? Math.round((value / totalStudents) * 100) : 0}%)`, 'Count']}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} layout="horizontal" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {graphViewMode === 'bar' && (
          <div className="grid md:grid-cols-2 gap-4">
            {/* Learning Styles Bar Chart */}
            <Card className="rounded-2xl shadow-xs border-slate-200 dark:border-slate-800">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-[15px] font-bold flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-600" /> Learning Styles (Frequency & Share)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={learningStyleData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                      formatter={(val: number) => [`${val} students`, 'Frequency']}
                    />
                    <Bar dataKey="value" fill={COLORS.emerald} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Thinking Styles Bar Chart */}
            <Card className="rounded-2xl shadow-xs border-slate-200 dark:border-slate-800">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-[15px] font-bold flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-600" /> Thinking Styles (Frequency & Share)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={thinkingStyleData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                      formatter={(val: number) => [`${val} students`, 'Frequency']}
                    />
                    <Bar dataKey="value" fill={COLORS.purple} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {graphViewMode === 'radar' && (
          <Card className="rounded-2xl shadow-xs border-slate-200 dark:border-slate-800">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-[15px] font-bold flex items-center gap-2">
                <RadarIcon className="h-4 w-4 text-indigo-600" /> Class Multi-Dimensional Cognitive Radar Profile
              </CardTitle>
              <CardDescription className="text-xs">
                Holistic view mapping learning and thinking competencies across the entire cohort.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: '#475569' }} />
                  <PolarRadiusAxis angle={30} domain={[0, totalStudents > 0 ? totalStudents : 5]} tick={{ fontSize: 10 }} />
                  <Radar name="Class Strength" dataKey="score" stroke="#4F46E5" fill="#6366F1" fillOpacity={0.4} />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {graphViewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="rounded-2xl shadow-xs">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" /> Learning Style Breakdown Cards
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-2">
                {learningStyleData.map(item => (
                  <div key={item.name} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-slate-800 dark:text-white">{item.name}</span>
                      <p className="text-[11px] text-slate-500">{item.value} of {totalStudents} students</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {item.percentage}%
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-xs">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-600" /> Thinking Style Breakdown Cards
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-2">
                {thinkingStyleData.map(item => (
                  <div key={item.name} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-slate-800 dark:text-white">{item.name}</span>
                      <p className="text-[11px] text-slate-500">{item.value} of {totalStudents} students</p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      {item.percentage}%
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}