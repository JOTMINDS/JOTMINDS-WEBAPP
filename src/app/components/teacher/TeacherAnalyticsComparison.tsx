import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { User, Assessment } from '../../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell } from 'recharts';
import { calculateTeachingStyleScore } from '../../utils/teachingStyleScoring';
import { getAllAssessments, getAssessmentsByUserId } from '../../utils/storage';
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
  // Merge teacher assessments from props and storage to guarantee complete data
  const allTeacherAssessments = useMemo(() => {
    const all = getAllAssessments();
    const tId = teacherProfile?.id?.toLowerCase();
    const tEmail = teacherProfile?.email?.toLowerCase();
    const local = all.filter(a => {
      if (!a) return false;
      const aId = a.userId?.toLowerCase();
      const aEmail = ((a as any).userEmail || (a as any).email)?.toLowerCase();
      return (tId && aId === tId) || (tEmail && (aId === tEmail || aEmail === tEmail));
    });

    const mergedMap = new Map<string, Assessment>();
    (local || []).forEach(a => { if (a && (a.id || a.type)) mergedMap.set(a.id || a.type, a); });
    (teacherAssessments || []).forEach(a => { if (a && (a.id || a.type)) mergedMap.set(a.id || a.type, a); });
    return Array.from(mergedMap.values());
  }, [teacherAssessments, teacherProfile?.id, teacherProfile?.email]);

  const getLatestAssessment = (types: string[], sourceAssessments: Assessment[]) => {
    const filtered = sourceAssessments.filter(a => a && types.includes(a.type));
    return filtered.sort((a, b) => new Date(b.completedAt || '').getTime() - new Date(a.completedAt || '').getTime())[0];
  };

  const getLatestForUser = (types: string[], userId: string, sourceAssessments: Assessment[]) => {
    const filtered = sourceAssessments.filter(a => a && types.includes(a.type) && a.userId === userId);
    return filtered.sort((a, b) => new Date(b.completedAt || '').getTime() - new Date(a.completedAt || '').getTime())[0];
  };

  const extractKolbStyle = (assessment?: Assessment, user?: User): string => {
    if (assessment?.score) {
      const s = assessment.score;
      const raw = s.kolb?.style || (s as any).learning?.style || (s as any).style || (s as any).primaryStyle;
      if (raw && typeof raw === 'string') return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
    }
    if ((user as any)?.learningStyle && typeof (user as any).learningStyle === 'string') {
      const raw = (user as any).learningStyle;
      return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
    }
    return '';
  };

  const extractThinkStyle = (assessment?: Assessment, user?: User): string => {
    if (assessment?.score) {
      const s = assessment.score;
      const scoreRaw = s.sternberg || s['jhs-thinking'] || s['shs-thinking'] || s['adult-thinking'] || s['child-thinking'] || (s as any).thinking;
      const raw = scoreRaw?.style || scoreRaw?.primaryStyle || scoreRaw?.dominantStyle || (s as any).style || (s as any).primaryStyle;
      if (raw && typeof raw === 'string') return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
    }
    if ((user as any)?.thinkingStyle && typeof (user as any).thinkingStyle === 'string') {
      const raw = (user as any).thinkingStyle;
      return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
    }
    return '';
  };

  const extractDualStyle = (assessment?: Assessment, user?: User): string => {
    if (assessment?.score) {
      const s = assessment.score;
      const raw = s.dualProcess?.style || (s as any).decision?.style || s['dual-process']?.style || (s as any).style || (s as any).primaryStyle;
      if (raw && typeof raw === 'string') return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
    }
    if ((user as any)?.decisionStyle && typeof (user as any).decisionStyle === 'string') {
      const raw = (user as any).decisionStyle;
      return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
    }
    return '';
  };

  const tKolb = getLatestAssessment(['kolb', 'learning'], allTeacherAssessments);
  const tThink = getLatestAssessment(['sternberg', 'adult-thinking', 'shs-thinking', 'jhs-thinking', 'child-thinking', 'thinking'], allTeacherAssessments);
  const tDual = getLatestAssessment(['dual-process', 'decision'], allTeacherAssessments);
  const tJtia = getLatestAssessment(['teaching-style', 'jtia'], allTeacherAssessments);

  const tJtiaReport = tJtia ? ((tJtia.score as any)?.jtia || tJtia.score) : null;

  const tKolbStyle = extractKolbStyle(tKolb, teacherProfile);
  const tThinkStyle = extractThinkStyle(tThink, teacherProfile);
  const tDualStyle = extractDualStyle(tDual, teacherProfile);

  // Aggregate student data
  const studentData = useMemo(() => {
    const counts = {
      kolb: { Total: 0 } as Record<string, number>,
      think: { Total: 0 } as Record<string, number>,
      dual: { Total: 0 } as Record<string, number>
    };

    students.forEach(student => {
      const userAssessments: Assessment[] = [
        ...studentAssessments.filter(a => a && a.userId === student.id),
        ...(Array.isArray((student as any).assessments) ? (student as any).assessments : [])
      ];

      // 1. Learning Style
      const sKolb = getLatestForUser(['kolb', 'learning'], student.id, userAssessments);
      const sKolbStyle = extractKolbStyle(sKolb, student);
      if (sKolbStyle) {
        counts.kolb[sKolbStyle] = (counts.kolb[sKolbStyle] || 0) + 1;
        counts.kolb.Total++;
      }

      // 2. Thinking Style
      const sThink = getLatestForUser(['sternberg', 'jhs-thinking', 'shs-thinking', 'adult-thinking', 'child-thinking', 'thinking'], student.id, userAssessments);
      const sThinkStyle = extractThinkStyle(sThink, student);
      if (sThinkStyle) {
        counts.think[sThinkStyle] = (counts.think[sThinkStyle] || 0) + 1;
        counts.think.Total++;
      }

      // 3. Decision Style
      const sDual = getLatestForUser(['dual-process', 'decision'], student.id, userAssessments);
      const sDualStyle = extractDualStyle(sDual, student);
      if (sDualStyle) {
        counts.dual[sDualStyle] = (counts.dual[sDualStyle] || 0) + 1;
        counts.dual.Total++;
      }
    });

    return counts;
  }, [students, studentAssessments]);

  // Transform data for charts
  const kolbKeys = Array.from(new Set(['Assimilating', 'Diverging', 'Converging', 'Accommodating', tKolbStyle, ...Object.keys(studentData.kolb).filter(k => k !== 'Total')].filter(Boolean)));
  const kolbChartData = kolbKeys.map(key => ({
    name: key + (tKolbStyle === key ? ' (You)' : ''),
    originalName: key,
    Students: studentData.kolb.Total ? Math.round(((studentData.kolb[key] || 0) / studentData.kolb.Total) * 100) : 0,
    isTeacher: tKolbStyle === key
  }));

  const thinkKeys = Array.from(new Set(['Analytical', 'Creative', 'Practical', tThinkStyle, ...Object.keys(studentData.think).filter(k => k !== 'Total')].filter(Boolean)));
  const thinkChartData = thinkKeys.map(key => ({
    name: key + (tThinkStyle === key ? ' (You)' : ''),
    originalName: key,
    Students: studentData.think.Total ? Math.round(((studentData.think[key] || 0) / studentData.think.Total) * 100) : 0,
    isTeacher: tThinkStyle === key
  }));

  const dualKeys = Array.from(new Set(['Reflective', 'Intuitive', 'Balanced', tDualStyle, ...Object.keys(studentData.dual).filter(k => k !== 'Total')].filter(Boolean)));
  const dualChartData = dualKeys.map(key => ({
    name: key + (tDualStyle === key ? ' (You)' : ''),
    originalName: key,
    Students: studentData.dual.Total ? Math.round(((studentData.dual[key] || 0) / studentData.dual.Total) * 100) : 0,
    isTeacher: tDualStyle === key
  }));

  // Calculate Alignment Score
  const calculateAlignmentScore = (): number | null => {
    let score = 0;
    let totalWeights = 0;

    if (tKolbStyle && studentData.kolb.Total > 0) {
      const matchPct = (studentData.kolb[tKolbStyle] || 0) / studentData.kolb.Total;
      if (!isNaN(matchPct)) {
        score += matchPct * 100;
        totalWeights += 1;
      }
    }
    
    if (tThinkStyle && studentData.think.Total > 0) {
      const matchPct = (studentData.think[tThinkStyle] || 0) / studentData.think.Total;
      if (!isNaN(matchPct)) {
        score += matchPct * 100;
        totalWeights += 1;
      }
    }

    if (tDualStyle && studentData.dual.Total > 0) {
      const matchPct = (studentData.dual[tDualStyle] || 0) / studentData.dual.Total;
      if (!isNaN(matchPct)) {
        score += matchPct * 100;
        totalWeights += 1;
      }
    }

    return totalWeights > 0 ? Math.round(score / totalWeights) : null;
  };

  const alignmentScore = calculateAlignmentScore();
  const totalDataPoints = studentData.kolb.Total + studentData.think.Total + studentData.dual.Total;

  const getAlignmentInsight = () => {
    if (alignmentScore === null) {
      return "Complete your educator cognitive assessments and have your students complete theirs to calculate live classroom alignment.";
    }
    if (alignmentScore >= 50) {
      return "Your cognitive profile naturally aligns with the majority of your students. This means your default communication style likely resonates well with the class.";
    } else if (alignmentScore >= 25) {
      return "Your profile has moderate overlap with your students. You might need to consciously adapt your teaching methods occasionally to reach students with different styles.";
    } else {
      return "Your profile is quite distinct from your students' dominant styles. This is a great opportunity to stretch your teaching approaches and introduce new perspectives, while ensuring you provide accommodations for their preferred learning modes.";
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Alignment Analysis</h2>
          <p className="text-muted-foreground mt-1 text-lg">Compare your cognitive profile and teaching style against your class aggregate.</p>
        </div>
      </div>

      {totalDataPoints === 0 && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertTitle>Awaiting Student Assessment Data</AlertTitle>
          <AlertDescription>
            Your connected students have not completed their cognitive assessments yet. Once students take the Learning Style, Thinking Style, or Decision Making assessments, live classroom distributions and alignment percentages will automatically populate here.
          </AlertDescription>
        </Alert>
      )}

      {!tKolbStyle && !tThinkStyle && !tDualStyle && (
        <Alert className="border-indigo-200 bg-indigo-50 text-indigo-900">
          <Info className="h-4 w-4 text-indigo-600" />
          <AlertTitle>Educator Cognitive Assessments Pending</AlertTitle>
          <AlertDescription>
            Complete your educator cognitive assessments (Learning Style, Thinking Style, or Decision Making) to see your personal cognitive profile mapped alongside your classroom.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 bg-gradient-to-br from-indigo-50 to-purple-50 border-none shadow-md">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <Target className="h-12 w-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Overall Alignment</h3>
                <div className="text-5xl font-extrabold text-indigo-600 mb-4">
                  {alignmentScore !== null ? `${alignmentScore}%` : 'Pending'}
                </div>
                <p className="text-sm text-slate-600">{getAlignmentInsight()}</p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl">Teaching Insights Context</CardTitle>
                <CardDescription>How your educator intelligence profile maps to student needs</CardDescription>
              </CardHeader>
              <CardContent>
                {tJtiaReport ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <LayoutTemplate className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-slate-800">{tJtiaReport.topSynergyDomain || 'Teaching Insights Profile'}</h4>
                        <p className="text-sm text-slate-500">Top Synergy Domain ({tJtiaReport.descriptiveLevel || 'Developing'})</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        Your highest synergy is in <strong>{tJtiaReport.topSynergyDomain || 'Teaching Adaptability'}</strong>.
                        {alignmentScore !== null 
                          ? ` Combine this with your ${alignmentScore}% alignment score to see where you might stretch your approach across the 5 Teaching Insights domains to reach students with different cognitive preferences.`
                          : ' Complete classroom assessments to view your live pedagogical alignment breakdown across the 5 Teaching Insights domains.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-slate-500 bg-slate-50 p-4 rounded-lg">
                    <Info className="h-5 w-5" />
                    <p className="text-sm">Complete your Teaching Insights assessment to unlock educator-specific alignment recommendations.</p>
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
                  <span>Learning Style</span>
                  {tKolbStyle && (
                    <Badge style={{ backgroundColor: KOLB_COLORS[tKolbStyle] + '20', color: KOLB_COLORS[tKolbStyle] }}>
                      You: {tKolbStyle}
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
                          <Cell 
                            key={`cell-${index}`} 
                            fill={KOLB_COLORS[entry.originalName] || '#94A3B8'} 
                            fillOpacity={entry.isTeacher ? 1 : 0.4} 
                            stroke={entry.isTeacher ? '#1E293B' : 'none'} 
                            strokeWidth={entry.isTeacher ? 2 : 0} 
                          />
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
                  <span>Thinking Style</span>
                  {tThinkStyle && (
                    <Badge style={{ backgroundColor: THINK_COLORS[tThinkStyle] + '20', color: THINK_COLORS[tThinkStyle] }}>
                      You: {tThinkStyle}
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
                          <Cell 
                            key={`cell-${index}`} 
                            fill={THINK_COLORS[entry.originalName] || '#94A3B8'} 
                            fillOpacity={entry.isTeacher ? 1 : 0.4}
                            stroke={entry.isTeacher ? '#1E293B' : 'none'} 
                            strokeWidth={entry.isTeacher ? 2 : 0}
                          />
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
                  <span>Decision Making</span>
                  {tDualStyle && (
                    <Badge style={{ backgroundColor: DUAL_COLORS[tDualStyle] + '20', color: DUAL_COLORS[tDualStyle] }}>
                      You: {tDualStyle}
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
                          <Cell 
                            key={`cell-${index}`} 
                            fill={DUAL_COLORS[entry.originalName] || '#94A3B8'} 
                            fillOpacity={entry.isTeacher ? 1 : 0.4}
                            stroke={entry.isTeacher ? '#1E293B' : 'none'} 
                            strokeWidth={entry.isTeacher ? 2 : 0}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
    </div>
  );
}
