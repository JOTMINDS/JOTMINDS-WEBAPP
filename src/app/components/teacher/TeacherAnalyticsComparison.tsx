import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { User, Assessment } from '../../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell } from 'recharts';
import { calculateTeachingStyleScore } from '../../utils/teachingStyleScoring';
import { Info, Target, LayoutTemplate } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface TeacherAnalyticsComparisonProps {
  teacherAssessments: Assessment[];
  studentAssessments: Assessment[];
  students: User[];
  teacherProfile: User;
}

const KOLB_COLORS: Record<string, string> = {
  'Diverging': '#F59E0B',
  'Assimilating': '#3B82F6',
  'Converging': '#10B981',
  'Accommodating': '#EC4899',
};

const THINK_COLORS: Record<string, string> = {
  'Analytical': '#8B5CF6',
  'Creative': '#EC4899',
  'Practical': '#10B981',
};

const DUAL_COLORS: Record<string, string> = {
  'Intuitive': '#F59E0B',
  'Reflective': '#3B82F6',
  'Balanced': '#8B5CF6',
};

export function TeacherAnalyticsComparison({ teacherAssessments, studentAssessments, students, teacherProfile }: TeacherAnalyticsComparisonProps) {
  const getLatestAssessment = (type: string, sourceAssessments: Assessment[]) => {
    const filtered = sourceAssessments.filter(a => a.type === type);
    return filtered.sort((a, b) => new Date(b.completedAt || '').getTime() - new Date(a.completedAt || '').getTime())[0];
  };

  const getLatestForUser = (type: string, userId: string, sourceAssessments: Assessment[]) => {
    const filtered = sourceAssessments.filter(a => a.type === type && a.userId === userId);
    return filtered.sort((a, b) => new Date(b.completedAt || '').getTime() - new Date(a.completedAt || '').getTime())[0];
  };

  const tKolb = getLatestAssessment('kolb', teacherAssessments);
  const tThink = getLatestAssessment('sternberg', teacherAssessments);
  const tDual = getLatestAssessment('dual-process', teacherAssessments);
  const tTeaching = getLatestAssessment('teaching-style', teacherAssessments);

  const tTeachingScore = tTeaching ? calculateTeachingStyleScore(tTeaching.responses) : null;

  // Aggregate student data
  const studentData = useMemo(() => {
    const counts = {
      kolb: { Diverging: 0, Assimilating: 0, Converging: 0, Accommodating: 0, Total: 0 },
      think: { Analytical: 0, Creative: 0, Practical: 0, Total: 0 },
      dual: { Intuitive: 0, Reflective: 0, Balanced: 0, Total: 0 }
    };

    students.forEach(student => {
      const sKolb = getLatestForUser('kolb', student.id, studentAssessments);
      if (sKolb?.score?.kolb?.style) {
        const style = sKolb.score.kolb.style as keyof typeof counts.kolb;
        if (counts.kolb[style] !== undefined) {
            counts.kolb[style]++;
            counts.kolb.Total++;
        }
      }

      const sThink = getLatestForUser('sternberg', student.id, studentAssessments);
      if (sThink?.score?.sternberg?.style) {
        const style = sThink.score.sternberg.style as keyof typeof counts.think;
        if (counts.think[style] !== undefined) {
            counts.think[style]++;
            counts.think.Total++;
        }
      }

      const sDual = getLatestForUser('dual-process', student.id, studentAssessments);
      if (sDual?.score?.dualProcess?.style) {
        const style = sDual.score.dualProcess.style as keyof typeof counts.dual;
        if (counts.dual[style] !== undefined) {
            counts.dual[style]++;
            counts.dual.Total++;
        }
      }
    });

    return counts;
  }, [students, studentAssessments]);

  // Transform data for charts
  const kolbChartData = Object.keys(KOLB_COLORS).map(key => ({
    name: key,
    Students: studentData.kolb.Total ? Math.round(((studentData.kolb as any)[key] / studentData.kolb.Total) * 100) : 0,
    Teacher: tKolb?.score?.kolb?.style === key ? 100 : 0
  }));

  const thinkChartData = Object.keys(THINK_COLORS).map(key => ({
    name: key,
    Students: studentData.think.Total ? Math.round(((studentData.think as any)[key] / studentData.think.Total) * 100) : 0,
    Teacher: tThink?.score?.sternberg?.style === key ? 100 : 0
  }));

  const dualChartData = Object.keys(DUAL_COLORS).map(key => ({
    name: key,
    Students: studentData.dual.Total ? Math.round(((studentData.dual as any)[key] / studentData.dual.Total) * 100) : 0,
    Teacher: tDual?.score?.dualProcess?.style === key ? 100 : 0
  }));

  // Calculate Alignment Score
  const calculateAlignmentScore = () => {
    let score = 0;
    let totalWeights = 0;

    if (tKolb?.score?.kolb?.style && studentData.kolb.Total > 0) {
      const matchPct = (studentData.kolb as any)[tKolb.score.kolb.style] / studentData.kolb.Total;
      score += matchPct * 100;
      totalWeights += 1;
    }
    
    if (tThink?.score?.sternberg?.style && studentData.think.Total > 0) {
      const matchPct = (studentData.think as any)[tThink.score.sternberg.style] / studentData.think.Total;
      score += matchPct * 100;
      totalWeights += 1;
    }

    if (tDual?.score?.dualProcess?.style && studentData.dual.Total > 0) {
      const matchPct = (studentData.dual as any)[tDual.score.dualProcess.style] / studentData.dual.Total;
      score += matchPct * 100;
      totalWeights += 1;
    }

    return totalWeights > 0 ? Math.round(score / totalWeights) : 0;
  };

  const alignmentScore = calculateAlignmentScore();
  const totalDataPoints = studentData.kolb.Total + studentData.think.Total + studentData.dual.Total;

  const getAlignmentInsight = () => {
    if (alignmentScore >= 50) {
      return "Your cognitive profile naturally aligns with the majority of your students. This means your default communication style likely resonates well with the class.";
    } else if (alignmentScore >= 25) {
      return "Your profile has moderate overlap with your students. You might need to consciously adapt your teaching methods occasionally to reach students with different styles.";
    } else if (totalDataPoints > 0) {
      return "Your profile is quite distinct from your students' dominant styles. This is a great opportunity to stretch your teaching approaches and introduce new perspectives, while ensuring you provide accommodations for their preferred learning modes.";
    }
    return "Not enough data to calculate alignment.";
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Alignment Analysis</h2>
          <p className="text-muted-foreground mt-1 text-lg">Compare your cognitive profile and teaching style against your class aggregate.</p>
        </div>
      </div>

      {!tKolb && !tThink && !tDual ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Profile Incomplete</AlertTitle>
          <AlertDescription>
            You need to complete at least one of your personal cognitive profile assessments (Learning, Thinking, or Decision style) to see comparisons.
          </AlertDescription>
        </Alert>
      ) : totalDataPoints === 0 ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Waiting for Student Data</AlertTitle>
          <AlertDescription>
            Your students haven't completed any assessments yet. Once they do, their aggregate data will appear here for comparison.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1 bg-gradient-to-br from-indigo-50 to-purple-50 border-none shadow-md">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <Target className="h-12 w-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Overall Alignment</h3>
                <div className="text-5xl font-extrabold text-indigo-600 mb-4">{alignmentScore}%</div>
                <p className="text-sm text-slate-600">{getAlignmentInsight()}</p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl">Teaching Style Context</CardTitle>
                <CardDescription>How your instructional approach maps to student needs</CardDescription>
              </CardHeader>
              <CardContent>
                {tTeachingScore ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <LayoutTemplate className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-slate-800">{tTeachingScore.primaryStyle}</h4>
                        <p className="text-sm text-slate-500">Primary Teaching Style</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        As a <strong>{tTeachingScore.primaryStyle}</strong> educator, you tend to focus on {tTeachingScore.primaryStyle === 'Facilitator' ? 'guiding students through self-discovery' : tTeachingScore.primaryStyle === 'Expert' ? 'delivering structured knowledge' : tTeachingScore.primaryStyle === 'Delegator' ? 'fostering independent work' : 'balancing multiple teaching methods'}.
                        Combine this with your {alignmentScore}% alignment score to see where you might need to stretch your approach to reach students with different cognitive preferences.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-slate-500 bg-slate-50 p-4 rounded-lg">
                    <Info className="h-5 w-5" />
                    <p className="text-sm">Complete your Teaching Style assessment to see insights here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Learning Style Comparison */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Learning Style (Kolb)</span>
                  {tKolb?.score?.kolb?.style && (
                    <Badge style={{ backgroundColor: KOLB_COLORS[tKolb.score.kolb.style] + '20', color: KOLB_COLORS[tKolb.score.kolb.style] }}>
                      You: {tKolb.score.kolb.style}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>Your style vs. Class Distribution (%)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={kolbChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fill: '#475569', fontSize: 13 }} />
                      <Tooltip 
                        cursor={{fill: '#F1F5F9'}}
                        formatter={(value: number, name: string) => [`${value}%`, name === 'Students' ? 'Class Distribution' : 'Your Style']}
                      />
                      <Legend />
                      <Bar dataKey="Students" fill="#94A3B8" name="Class (%)" radius={[0, 4, 4, 0]}>
                        {kolbChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={KOLB_COLORS[entry.name] || '#94A3B8'} fillOpacity={0.6} />
                        ))}
                      </Bar>
                      <Bar dataKey="Teacher" fill="#475569" name="Your Match" radius={[0, 4, 4, 0]}>
                         {kolbChartData.map((entry, index) => (
                          <Cell key={`cell-teacher-${index}`} fill={KOLB_COLORS[entry.name] || '#475569'} fillOpacity={entry.Teacher > 0 ? 1 : 0} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Thinking Style Comparison */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Thinking Style (Sternberg)</span>
                  {tThink?.score?.sternberg?.style && (
                    <Badge style={{ backgroundColor: THINK_COLORS[tThink.score.sternberg.style] + '20', color: THINK_COLORS[tThink.score.sternberg.style] }}>
                      You: {tThink.score.sternberg.style}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>Your style vs. Class Distribution (%)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={thinkChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fill: '#475569', fontSize: 13 }} />
                      <Tooltip 
                        cursor={{fill: '#F1F5F9'}}
                        formatter={(value: number, name: string) => [`${value}%`, name === 'Students' ? 'Class Distribution' : 'Your Style']}
                      />
                      <Legend />
                      <Bar dataKey="Students" fill="#94A3B8" name="Class (%)" radius={[0, 4, 4, 0]}>
                        {thinkChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={THINK_COLORS[entry.name] || '#94A3B8'} fillOpacity={0.6} />
                        ))}
                      </Bar>
                      <Bar dataKey="Teacher" fill="#475569" name="Your Match" radius={[0, 4, 4, 0]}>
                         {thinkChartData.map((entry, index) => (
                          <Cell key={`cell-teacher-${index}`} fill={THINK_COLORS[entry.name] || '#475569'} fillOpacity={entry.Teacher > 0 ? 1 : 0} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Decision Style Comparison */}
            <Card className="shadow-sm border-slate-200 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Decision Style</span>
                  {tDual?.score?.dualProcess?.style && (
                    <Badge style={{ backgroundColor: DUAL_COLORS[tDual.score.dualProcess.style] + '20', color: DUAL_COLORS[tDual.score.dualProcess.style] }}>
                      You: {tDual.score.dualProcess.style}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>Your style vs. Class Distribution (%)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full max-w-3xl mx-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dualChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 13 }} dy={10} />
                      <YAxis type="number" domain={[0, 100]} hide />
                      <Tooltip 
                        cursor={{fill: '#F1F5F9'}}
                        formatter={(value: number, name: string) => [`${value}%`, name === 'Students' ? 'Class Distribution' : 'Your Style']}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar dataKey="Students" fill="#94A3B8" name="Class (%)" radius={[4, 4, 0, 0]} maxBarSize={60}>
                        {dualChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={DUAL_COLORS[entry.name] || '#94A3B8'} fillOpacity={0.6} />
                        ))}
                      </Bar>
                      <Bar dataKey="Teacher" fill="#475569" name="Your Match" radius={[4, 4, 0, 0]} maxBarSize={60}>
                         {dualChartData.map((entry, index) => (
                          <Cell key={`cell-teacher-${index}`} fill={DUAL_COLORS[entry.name] || '#475569'} fillOpacity={entry.Teacher > 0 ? 1 : 0} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
