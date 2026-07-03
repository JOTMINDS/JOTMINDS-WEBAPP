import React, { useState, useMemo, useEffect } from 'react';
import { User, Assessment, AssessmentScore } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  ArrowLeft, Users, TrendingUp, AlertTriangle, CheckCircle,
  Search, ChevronDown, ChevronUp, BarChart3, Activity,
  BookOpen, Award, Zap, HelpCircle, Info, Sparkles, Target
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { getStudentsBySchool, getAllUsers, getAssessmentsByUserId } from '../utils/storage';
import { getEngagementMetrics } from '../utils/engagementTracking';
import { getGamificationProfile } from '../utils/gamification';
import { extractDimensionScores } from '../utils/cognitiveXP';
import { getAllAssessmentResults } from '../utils/api';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

import { InstitutionMember } from '../utils/institution';

interface SchoolAnalyticsDashboardProps {
  user: User;
  onBack: () => void;
  embedded?: boolean;
  institutionMembers?: InstitutionMember[];
}

type Tab = 'overview' | 'students' | 'class' | 'leaders' | 'cognitive' | 'insights' | 'comparison' | 'alignment';

interface StudentSummary {
  user: User;
  assessmentCount: number;
  completedTypes: string[];
  avgScore: number;
  engagementScore: number;
  streak: number;
  xp: number;
  risk: 'high' | 'medium' | 'low' | 'unassessed';
  gradeLevel: string;
  assessments: Assessment[];
}

const RISK_COLORS = { high: '#DC2626', medium: '#E0A020', low: '#1E8A6E', unassessed: '#9ca3af' };
const RISK_LABELS = { high: 'At Risk', medium: 'Needs Support', low: 'On Track', unassessed: 'Not Started' };

function getGradeLabel(u: User): string {
  if (u.educationLevel) return u.educationLevel;
  if (u.age) {
    if (u.age <= 10) return 'Primary';
    if (u.age <= 14) return 'JHS';
    if (u.age <= 18) return 'SHS';
    return 'Tertiary';
  }
  return 'Unknown';
}

function buildSummary(u: User): StudentSummary {
  const assessments = getAssessmentsByUserId(u.id).filter((a: Assessment) => a.completedAt && a.score);
  const eng = getEngagementMetrics(u.id);
  const gam = getGamificationProfile(u.id);

  const completedTypes = [...new Set(assessments.map((a: Assessment) => {
    if (['kolb', 'vark', 'learning'].includes(a.type)) return 'learning';
    if (['sternberg', 'jhs-thinking', 'shs-thinking', 'adult-thinking', 'child-thinking', 'thinking'].includes(a.type)) return 'thinking';
    if (a.type === 'dual-process' || a.type === 'decision') return 'decision';
    return a.type;
  }))];

  const allScores = assessments.flatMap((a: Assessment) => extractDimensionScores(a).map((d: { name: string; score: number }) => d.score));
  const avgScore = allScores.length ? Math.round(allScores.reduce((s: number, v: number) => s + v, 0) / allScores.length) : 0;
  const engScore = eng?.engagementScore ?? 0;
  const streak = gam?.currentStreak ?? 0;
  const xp = gam?.xp ?? 0;

  let risk: StudentSummary['risk'] = 'unassessed';
  if (assessments.length > 0) {
    if (engScore < 25 || (avgScore > 0 && avgScore < 20)) risk = 'high';
    else if (engScore < 50 || completedTypes.length < 2) risk = 'medium';
    else risk = 'low';
  }

  return { user: u, assessmentCount: assessments.length, completedTypes, avgScore, engagementScore: engScore, streak, xp, risk, gradeLevel: getGradeLabel(u), assessments };
}

export function SchoolAnalyticsDashboard({ user, onBack, embedded, institutionMembers }: SchoolAnalyticsDashboardProps) {
  const [tab, setTab] = useState<Tab>('overview');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'engagement' | 'risk'>('risk');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [riskFilter, setRiskFilter] = useState('all');

  const [fetchedAssessmentsMap, setFetchedAssessmentsMap] = useState<Record<string, Assessment[]>>({});
  const [loadingAssessments, setLoadingAssessments] = useState(false);

  const students = useMemo(() => {
    // If Supabase institution members are available, use them as the source of truth
    // (handles seeded/demo accounts that are not in localStorage)
    if (institutionMembers && institutionMembers.length > 0) {
      const studentMembers = institutionMembers.filter(m => m.role === 'student' && m.status === 'approved');
      // Build minimal User objects from member records so the rest of the component works unchanged
      return studentMembers.slice(0, 100).map(m => ({
        id: m.userId,
        name: m.userName,
        email: m.userEmail,
        phone: m.userPhone || '',
        role: 'student' as const,
      } as User));
    }

    // Fallback: read from localStorage (legacy path)
    let raw: User[] = [];
    if (user.role === 'teacher') {
      raw = getAllUsers().filter((u: User) =>
        u.role === 'student' &&
        (u.teacherId === user.id || (u.linkedTeachers && u.linkedTeachers.includes(user.id)))
      );
    } else {
      raw = user.school
        ? getStudentsBySchool(user.school)
        : getAllUsers().filter((u: User) => u.role === 'student');
    }
    return raw.slice(0, 100);
  }, [user.school, user.role, user.id, institutionMembers]);

  const teachers = useMemo(() => {
    if (institutionMembers && institutionMembers.length > 0) {
      const teacherMembers = institutionMembers.filter(m => m.role === 'teacher' && m.status === 'approved');
      return teacherMembers.slice(0, 100).map(m => ({
        id: m.userId,
        name: m.userName,
        email: m.userEmail,
        phone: m.userPhone || '',
        role: 'teacher' as const,
      } as User));
    }
    let raw: User[] = [];
    raw = user.school
      ? getAllUsers().filter((u: User) => u.role === 'teacher' && u.school === user.school)
      : getAllUsers().filter((u: User) => u.role === 'teacher');
    return raw.slice(0, 100);
  }, [user.school, institutionMembers]);

  useEffect(() => {
    const fetchAssessmentsData = async () => {
      const userIds = [...students.map(s => s.id), ...teachers.map(t => t.id)];
      if (userIds.length === 0) return;
      
      try {
        setLoadingAssessments(true);
        const response = await getAllAssessmentResults(userIds);
        
        let rawAssessments: Assessment[] = [];
        if (response && Array.isArray(response.results)) {
          rawAssessments = response.results;
        } else if (Array.isArray(response)) {
          rawAssessments = response;
        }
        
        const determinePrimaryStyle = (scores: AssessmentScore, type: string) => {
          if (type === 'kolb' || type === 'learning') {
            const { CE = 0, RO = 0, AC = 0, AE = 0 } = scores;
            const acCE = AC - CE;
            const aeRO = AE - RO;
            
            if (acCE > 0 && aeRO > 0) return 'Converging';
            if (acCE > 0 && aeRO < 0) return 'Assimilating';
            if (acCE < 0 && aeRO < 0) return 'Diverging';
            return 'Accommodating';
          } else if (type === 'sternberg') {
            const { analytical = 0, creative = 0, practical = 0 } = scores;
            if (analytical >= creative && analytical >= practical) return 'Analytical';
            if (creative >= analytical && creative >= practical) return 'Creative';
            return 'Practical';
          } else if (type === 'dual-process') {
            const { system1 = 0, system2 = 0 } = scores;
            return system1 > system2 ? 'Intuitive' : 'Reflective';
          }
          return 'Unknown';
        };

        const grouped: Record<string, Assessment[]> = {};
        
        rawAssessments.forEach((assessment: Assessment) => {
          const studentId = assessment.userId;
          const assessmentType = assessment.assessmentType;
          const results = assessment.results || {};
          
          let score: Record<string, unknown> = {};
          if (assessmentType === 'kolb' || assessmentType === 'learning') {
            const style = determinePrimaryStyle(results, 'kolb');
            score.kolb = { style, scores: results };
            score.learning = { style, scores: results };
          } else if (assessmentType === 'sternberg') {
            const style = determinePrimaryStyle(results, 'sternberg');
            score.sternberg = { style, scores: results };
          } else if (assessmentType === 'dual-process') {
            const style = determinePrimaryStyle(results, 'dual-process');
            score.dualProcess = { style, scores: results };
          } else {
            score[assessmentType] = results;
          }
          
          const transformed = {
            id: assessment.id || `result:${studentId}:${assessmentType}`,
            userId: studentId,
            type: assessmentType,
            completed: true,
            completedAt: assessment.completedAt,
            responses: assessment.answers || [],
            score: score
          };
          
          if (!grouped[studentId]) {
            grouped[studentId] = [];
          }
          grouped[studentId].push(transformed);
        });
        
        setFetchedAssessmentsMap(grouped);
      } catch (error) {
        console.error('Failed to fetch student assessments for SchoolAnalyticsDashboard:', error);
      } finally {
        setLoadingAssessments(false);
      }
    };
    
    fetchAssessmentsData();
  }, [students, teachers]);

  const summaries = useMemo(() => {
    return students.map(u => {
      const localAssessments = getAssessmentsByUserId(u.id).filter((a: Assessment) => a.completedAt && a.score);
      const dbAssessments = fetchedAssessmentsMap[u.id] || [];
      
      const assessmentsMap = new Map();
      dbAssessments.forEach((a: Assessment) => assessmentsMap.set(a.type, a));
      localAssessments.forEach((a: Assessment) => assessmentsMap.set(a.type, a));
      const assessments = Array.from(assessmentsMap.values());
      
      const eng = getEngagementMetrics(u.id);
      const gam = getGamificationProfile(u.id);

      const completedTypes = [...new Set(assessments.map((a: Assessment) => {
        if (['kolb', 'vark', 'learning'].includes(a.type)) return 'learning';
        if (['sternberg', 'jhs-thinking', 'shs-thinking', 'adult-thinking', 'child-thinking', 'thinking'].includes(a.type)) return 'thinking';
        if (a.type === 'dual-process' || a.type === 'decision') return 'decision';
        return a.type;
      }))];

      const allScores = assessments.flatMap((a: Assessment) => extractDimensionScores(a).map((d: { name: string; score: number }) => d.score));
      const avgScore = allScores.length ? Math.round(allScores.reduce((s: number, v: number) => s + v, 0) / allScores.length) : 0;
      const engScore = eng?.engagementScore ?? 0;
      const streak = gam?.currentStreak ?? 0;
      const xp = gam?.xp ?? 0;

      let risk: StudentSummary['risk'] = 'unassessed';
      if (assessments.length > 0) {
        if (engScore < 25 || (avgScore > 0 && avgScore < 20)) risk = 'high';
        else if (engScore < 50 || completedTypes.length < 2) risk = 'medium';
        else risk = 'low';
      }

      return {
        user: u,
        assessmentCount: assessments.length,
        completedTypes,
        avgScore,
        engagementScore: engScore,
        streak,
        xp,
        risk,
        gradeLevel: getGradeLabel(u),
        assessments
      };
    });
  }, [students, fetchedAssessmentsMap]);

  const teacherSummaries = useMemo(() => {
    return teachers.map(u => {
      const localAssessments = getAssessmentsByUserId(u.id).filter((a: Assessment) => a.completedAt && a.score);
      const dbAssessments = fetchedAssessmentsMap[u.id] || [];
      const assessmentsMap = new Map();
      dbAssessments.forEach((a: Assessment) => assessmentsMap.set(a.type, a));
      localAssessments.forEach((a: Assessment) => assessmentsMap.set(a.type, a));
      const assessments = Array.from(assessmentsMap.values());
      return { user: u, assessments };
    });
  }, [teachers, fetchedAssessmentsMap]);

  const stats = useMemo(() => {
    const assessed = summaries.filter(s => s.assessmentCount > 0);
    const riskCounts = { high: 0, medium: 0, low: 0, unassessed: 0 };
    summaries.forEach(s => riskCounts[s.risk]++);
    const avgEng = assessed.length ? Math.round(assessed.reduce((s, v) => s + v.engagementScore, 0) / assessed.length) : 0;
    const totalXP = summaries.reduce((s, v) => s + v.xp, 0);
    const activeStreaks = summaries.filter(s => s.streak > 0).length;
    const typeCompletion = {
      learning: summaries.filter(s => s.completedTypes.includes('learning')).length,
      thinking: summaries.filter(s => s.completedTypes.includes('thinking')).length,
      decision: summaries.filter(s => s.completedTypes.includes('decision')).length,
    };
    const gradeGroups: Record<string, StudentSummary[]> = {};
    summaries.forEach(s => { if (!gradeGroups[s.gradeLevel]) gradeGroups[s.gradeLevel] = []; gradeGroups[s.gradeLevel].push(s); });
    const gradeData = Object.entries(gradeGroups).map(([grade, ss]) => {
      const a = ss.filter(s => s.assessmentCount > 0);
      return { grade, total: ss.length, assessed: a.length, avgScore: a.length ? Math.round(a.reduce((x, s) => x + s.avgScore, 0) / a.length) : 0, avgEngagement: a.length ? Math.round(a.reduce((x, s) => x + s.engagementScore, 0) / a.length) : 0, atRisk: ss.filter(s => s.risk === 'high').length };
    });
    const engagementBands = [
      { label: 'High (70+)', value: assessed.filter(s => s.engagementScore >= 70).length, color: '#1E8A6E' },
      { label: 'Medium (40–69)', value: assessed.filter(s => s.engagementScore >= 40 && s.engagementScore < 70).length, color: '#E0A020' },
      { label: 'Low (<40)', value: assessed.filter(s => s.engagementScore < 40).length, color: '#DC2626' },
      { label: 'Untracked', value: summaries.filter(s => s.assessmentCount === 0).length, color: '#9ca3af' },
    ].filter(b => b.value > 0);
    const topStreaks = [...summaries].filter(s => s.streak > 0).sort((a, b) => b.streak - a.streak).slice(0, 5);
    const topXP = [...summaries].filter(s => s.xp > 0).sort((a, b) => b.xp - a.xp).slice(0, 5);
    const topScores = [...summaries].filter(s => s.avgScore > 0).sort((a, b) => b.avgScore - a.avgScore).slice(0, 5);

    // Aggregate cognitive dimensions
    const dimensionAggregates: Record<string, { name: string, total: number, count: number, max: number }> = {};
    summaries.forEach(s => {
      s.assessments.forEach(a => {
        const dims = extractDimensionScores(a);
        dims.forEach(d => {
          const maxVal = ['CE', 'RO', 'AC', 'AE'].includes(d.name) ? 48 : 100;
          if (!dimensionAggregates[d.name]) {
            dimensionAggregates[d.name] = { name: d.name, total: 0, count: 0, max: maxVal };
          }
          dimensionAggregates[d.name].total += d.score;
          dimensionAggregates[d.name].count += 1;
        });
      });
    });
    const cognitiveSummary = Object.values(dimensionAggregates).map(d => ({
      name: d.name,
      avg: Math.round(d.total / d.count),
      max: d.max
    })).sort((a, b) => (b.avg / b.max) - (a.avg / a.max)); // Sort by highest percentage

    // Compile Teacher Cognitive Profile for comparison
    const teacherDimensionAggregates: Record<string, { name: string, total: number, count: number, max: number }> = {};
    teacherSummaries.forEach(s => {
      s.assessments.forEach(a => {
        const dims = extractDimensionScores(a);
        dims.forEach(d => {
          const maxVal = ['CE', 'RO', 'AC', 'AE'].includes(d.name) ? 48 : 100;
          if (!teacherDimensionAggregates[d.name]) {
            teacherDimensionAggregates[d.name] = { name: d.name, total: 0, count: 0, max: maxVal };
          }
          teacherDimensionAggregates[d.name].total += d.score;
          teacherDimensionAggregates[d.name].count += 1;
        });
      });
    });
    const teacherCognitiveSummary = Object.values(teacherDimensionAggregates).map(d => ({
      name: d.name,
      avg: Math.round(d.total / d.count),
      max: d.max
    }));

    // Comparative Data Array
    const comparisonData = cognitiveSummary.map(studentDim => {
      const teacherDim = teacherCognitiveSummary.find(t => t.name === studentDim.name);
      return {
        name: studentDim.name,
        'Student Avg (%)': Math.round((studentDim.avg / studentDim.max) * 100),
        'Teacher Avg (%)': teacherDim ? Math.round((teacherDim.avg / teacherDim.max) * 100) : 0,
      };
    });
    const teacherAssessedList = teacherSummaries.filter((s: any) => s.assessments.length > 0);
    const teacherAvgEng = teacherAssessedList.length ? Math.round(teacherAssessedList.reduce((s: any, v: any) => s + (v.engagementScore || 0), 0) / teacherAssessedList.length) : 0;

    return { 
      assessed: assessed.length, total: summaries.length, riskCounts, avgEng, totalXP, activeStreaks, 
      typeCompletion, gradeData, engagementBands, topStreaks, topXP, topScores, cognitiveSummary, comparisonData,
      teacherTotal: teacherSummaries.length, teacherAssessed: teacherAssessedList.length, teacherAvgEng
    };
  }, [summaries, teacherSummaries]);

  const filtered = useMemo(() => {
    let list = summaries;
    if (search) list = list.filter(s => s.user.name.toLowerCase().includes(search.toLowerCase()));
    if (riskFilter !== 'all') list = list.filter(s => s.risk === riskFilter);
    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.user.name.localeCompare(b.user.name);
      else if (sortBy === 'score') cmp = a.avgScore - b.avgScore;
      else if (sortBy === 'engagement') cmp = a.engagementScore - b.engagementScore;
      else { const o = { high: 0, medium: 1, low: 2, unassessed: 3 }; cmp = o[a.risk] - o[b.risk]; }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [summaries, search, riskFilter, sortBy, sortDir]);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: typeof sortBy }) =>
    sortBy === col ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />) : null;

  const pct = (n: number) => `${Math.round((n / Math.max(stats.total, 1)) * 100)}%`;

  const insights = useMemo(() => {
    const list: { type: 'warning' | 'success' | 'info'; title: string; body: string }[] = [];
    if (stats.riskCounts.high > 0) list.push({ type: 'warning', title: `${stats.riskCounts.high} students at high risk`, body: `${pct(stats.riskCounts.high)} of students have low engagement. Schedule individual check-ins.` });
    if (stats.assessed / Math.max(stats.total, 1) < 0.5) list.push({ type: 'warning', title: 'Low assessment uptake', body: `Only ${pct(stats.assessed)} of students have completed at least one assessment.` });
    if (stats.typeCompletion.decision < stats.total * 0.3) list.push({ type: 'info', title: 'Decision assessment underused', body: `Only ${stats.typeCompletion.decision} students completed the Decision Style assessment.` });
    if (stats.avgEng >= 60) list.push({ type: 'success', title: 'Strong engagement', body: `Average engagement score of ${stats.avgEng}/100 across assessed students.` });
    if (stats.activeStreaks > stats.total * 0.4) list.push({ type: 'success', title: `${stats.activeStreaks} students on active streaks`, body: `${pct(stats.activeStreaks)} of students are maintaining daily learning streaks.` });
    if (stats.riskCounts.unassessed > 5) list.push({ type: 'info', title: `${stats.riskCounts.unassessed} students not yet assessed`, body: 'These students have no cognitive assessment data yet.' });
    return list;
  }, [stats]);

  return (
    <TooltipProvider>
    <div className={`min-h-screen ${embedded ? 'bg-transparent' : 'bg-[#f8f9fa]'}`}>
      {/* Header */}
      {!embedded && (
        <div className="bg-[#1e1e2d] text-white py-6 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <button onClick={onBack} className="flex items-center text-blue-300 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">{user.school || user.organizationName || 'School'} Analytics</h1>
                <p className="text-gray-400 mt-1">Comprehensive insights into student engagement and performance</p>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="font-semibold">{students.length} Students Monitored</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          {!embedded && <Button variant="ghost" size="sm" onClick={onBack} className="gap-1"><ArrowLeft className="w-4 h-4" /> Back</Button>}
          <div className="flex-1">
            <h1 className="flex items-center gap-2 text-base"><BarChart3 className="w-5 h-5 text-[#5B7DB1]" />School Analytics</h1>
            <p className="text-xs text-gray-500">{user.school ?? 'All schools'} · {stats.total} students</p>
          </div>
          <Badge className="bg-blue-50 text-blue-700 text-xs">{stats.assessed}/{stats.total} assessed</Badge>
        </div>
        <div className="max-w-5xl mx-auto px-4 flex gap-1 pb-0 overflow-x-auto">
          {([
            ['overview', BarChart3, 'Overview'], 
            ['students', Users, 'Students'], 
            ['class', BookOpen, 'By Class'], 
            ['comparison', Users, 'Teachers vs Students'],
            ['alignment', Target, 'Alignment & Advice'],
            ['leaders', Award, 'Gamification Leaders'],
            ['cognitive', Zap, 'Cognitive Profiles'],
            ['insights', Activity, 'Insights']
          ] as const).map(([t, Icon, label]) => (
            <button key={t} onClick={() => setTab(t as Tab)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 shrink-0 transition-colors ${tab === t ? 'border-[#5B7DB1] text-[#5B7DB1]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {tab === 'overview' && (<>
          <div className="mb-6 bg-blue-50/50 text-blue-900 p-5 rounded-xl border border-blue-100 shadow-sm text-sm">
            <h3 className="font-semibold mb-2 flex items-center gap-1.5 text-base"><Info className="w-5 h-5 text-blue-600" /> Understanding Your Dashboard</h3>
            <p className="text-blue-800/80 leading-relaxed">
              Welcome to the Assessment Analytics overview. This dashboard aggregates the cognitive and engagement data of all students in your school. 
              Use these insights to identify students who may need additional support, track completion rates for our core cognitive assessments (Learning Style, Thinking Style, and Decision Style), 
              and discover the dominant cognitive traits across your student body.
            </p>
          </div>

          {insights.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Actionable Insights
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {insights.map((ins, i) => (
                  <div key={i} className={`p-4 rounded-lg border text-sm ${ins.type === 'warning' ? 'bg-red-50 border-red-100 text-red-900' : ins.type === 'success' ? 'bg-green-50 border-green-100 text-green-900' : 'bg-gray-50 border-gray-100 text-gray-900'}`}>
                    <div className="font-semibold mb-1">{ins.title}</div>
                    <div className="opacity-90">{ins.body}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total Students', value: stats.total, color: '#5B7DB1', icon: <Users className="w-4 h-4" />, help: 'Total number of active students currently enrolled in the institution.' },
              { label: 'Assessed', value: `${stats.assessed} (${Math.round((stats.assessed / Math.max(stats.total, 1)) * 100)}%)`, color: '#1E8A6E', icon: <CheckCircle className="w-4 h-4" />, help: 'Number of students who have completed at least one assessment.' },
              { label: 'Avg Engagement', value: `${stats.avgEng}/100`, color: '#6B4C9A', icon: <Activity className="w-4 h-4" />, help: 'Average engagement score across the school based on recent activity, assessments completed, and daily streaks.' },
              { label: 'At Risk', value: stats.riskCounts.high, color: '#DC2626', icon: <AlertTriangle className="w-4 h-4" />, help: 'Students with very low engagement scores, indicating they may need additional support.' },
            ].map(s => (
              <Card key={s.label}><CardContent className="pt-4 text-center">
                <div className="flex justify-center items-center gap-1.5 mb-1" style={{ color: s.color }}>
                  {s.icon}
                  {s.help && (
                    <Tooltip>
                      <TooltipTrigger><HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" /></TooltipTrigger>
                      <TooltipContent className="max-w-[200px] text-center">{s.help}</TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className="text-xl font-semibold" style={{ color: s.color }}>{s.value}</div>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </CardContent></Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-0">
                <CardTitle className="text-sm flex items-center gap-2 mb-1">
                  Engagement Distribution
                  <Tooltip>
                    <TooltipTrigger><HelpCircle className="w-3.5 h-3.5 text-gray-400" /></TooltipTrigger>
                    <TooltipContent className="max-w-[280px]">
                      <p className="mb-1 text-sm font-semibold border-b pb-1 mb-2">How is this calculated?</p>
                      <ul className="text-xs space-y-1.5">
                        <li><strong className="text-[#1E8A6E]">High (70+):</strong> Consistently completing assessments and maintaining learning streaks.</li>
                        <li><strong className="text-[#E0A020]">Medium (40-69):</strong> Semi-active, taking assessments occasionally.</li>
                        <li><strong className="text-[#DC2626]">Low (&lt;40):</strong> Rarely active, dropping streaks, may need motivation.</li>
                        <li><strong className="text-gray-400">Untracked:</strong> Have not taken any assessments yet.</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
                <p className="text-xs text-gray-500 leading-snug">
                  Students grouped by their 0-100 engagement score.
                </p>
              </CardHeader>
              <CardContent className="h-[200px]">
                {stats.engagementBands.length === 0
                  ? <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data yet</div>
                  : <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie key="pie" data={stats.engagementBands} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={75}>
                        {stats.engagementBands.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <RechartsTip key="tip" />
                      <Legend key="legend" />
                    </PieChart>
                  </ResponsiveContainer>
                }
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-0">
                <CardTitle className="text-sm flex items-center gap-2 mb-1">
                  Assessment Type Completion
                  <Tooltip>
                    <TooltipTrigger><HelpCircle className="w-3.5 h-3.5 text-gray-400" /></TooltipTrigger>
                    <TooltipContent className="max-w-[220px]">Shows how many students have completed the 3 core assessments: Learning Style, Thinking Style, and Decision Style.</TooltipContent>
                  </Tooltip>
                </CardTitle>
                <p className="text-xs text-gray-500 leading-snug">
                  Completion status for the 3 core cognitive modules.
                </p>
              </CardHeader>
              <CardContent className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Learning', completed: stats.typeCompletion.learning, remaining: stats.total - stats.typeCompletion.learning },
                    { name: 'Thinking', completed: stats.typeCompletion.thinking, remaining: stats.total - stats.typeCompletion.thinking },
                    { name: 'Decision', completed: stats.typeCompletion.decision, remaining: stats.total - stats.typeCompletion.decision },
                  ]}>
                    <CartesianGrid key="grid" strokeDasharray="3 3" opacity={0.3} />
                    <XAxis key="xax" dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis key="yax" tick={{ fontSize: 11 }} />
                    <RechartsTip key="tip" />
                    <Bar key="bar-c" dataKey="completed" name="Completed" fill="#1E8A6E" stackId="a" />
                    <Bar key="bar-r" dataKey="remaining" name="Remaining" fill="#e5e7eb" stackId="a" radius={[4, 4, 0, 0]} />
                    <Legend key="legend" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-sm flex items-center gap-2 mb-1">
                Student Risk Breakdown
                <Tooltip>
                  <TooltipTrigger><HelpCircle className="w-3.5 h-3.5 text-gray-400" /></TooltipTrigger>
                  <TooltipContent className="max-w-[280px]">
                    <p className="mb-1 text-sm font-semibold border-b pb-1 mb-2">Risk Categories</p>
                    <ul className="text-xs space-y-1.5">
                      <li><strong className="text-[#DC2626]">At Risk:</strong> Severe drop in engagement, action recommended.</li>
                      <li><strong className="text-[#E0A020]">Needs Support:</strong> Noticeable drop in engagement.</li>
                      <li><strong className="text-[#1E8A6E]">On Track:</strong> Healthy and consistent engagement.</li>
                      <li><strong className="text-gray-400">Not Started:</strong> Pending onboarding or first assessment.</li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <p className="text-xs text-gray-500 leading-snug mb-3">
                Students flagged for intervention based on engagement dips.
              </p>
            </CardHeader>
            <CardContent>
              {Object.entries(stats.riskCounts).map(([risk, count]) => {
                const p = Math.round((count / Math.max(stats.total, 1)) * 100);
                return (
                  <div key={risk} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">{RISK_LABELS[risk as keyof typeof RISK_LABELS]}</span>
                      <span style={{ color: RISK_COLORS[risk as keyof typeof RISK_COLORS] }}>{count} ({p}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: `${p}%`, backgroundColor: RISK_COLORS[risk as keyof typeof RISK_COLORS] }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>)}

        {tab === 'students' && (<>
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
              <Input placeholder="Search student..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
            </div>
            <div className="flex gap-1 flex-wrap">
              {(['all', 'high', 'medium', 'low', 'unassessed'] as const).map(r => (
                <button key={r} onClick={() => setRiskFilter(r)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all ${riskFilter === r ? 'text-white' : 'bg-white text-gray-600 border'}`}
                  style={riskFilter === r ? { backgroundColor: r === 'all' ? '#5B7DB1' : RISK_COLORS[r] } : {}}>
                  {r === 'all' ? 'All' : RISK_LABELS[r]}
                </button>
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs text-gray-500">
                    <th className="text-left px-4 py-2.5 cursor-pointer" onClick={() => toggleSort('name')}>Student <SortIcon col="name" /></th>
                    <th className="text-center px-3 py-2.5">Grade</th>
                    <th className="text-center px-3 py-2.5">Assessments</th>
                    <th className="text-center px-3 py-2.5 cursor-pointer" onClick={() => toggleSort('score')}>Score <SortIcon col="score" /></th>
                    <th className="text-center px-3 py-2.5 cursor-pointer" onClick={() => toggleSort('engagement')}>Engagement <SortIcon col="engagement" /></th>
                    <th className="text-center px-3 py-2.5">Streak</th>
                    <th className="text-center px-3 py-2.5 cursor-pointer" onClick={() => toggleSort('risk')}>Status <SortIcon col="risk" /></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.user.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-2.5">
                        <p className="text-gray-900">{s.user.name}</p>
                        <p className="text-[10px] text-gray-400">{s.user.email}</p>
                      </td>
                      <td className="px-3 py-2.5 text-center text-xs text-gray-600">{s.gradeLevel}</td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex justify-center gap-0.5">
                          {['learning', 'thinking', 'decision'].map(t => (
                            <div key={t} className={`w-2 h-2 rounded-full ${s.completedTypes.includes(t) ? 'bg-green-500' : 'bg-gray-200'}`} title={t} />
                          ))}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">{s.assessmentCount}</p>
                      </td>
                      <td className="px-3 py-2.5 text-center text-xs font-semibold" style={{ color: s.avgScore >= 30 ? '#1E8A6E' : s.avgScore > 0 ? '#E0A020' : '#9ca3af' }}>
                        {s.avgScore > 0 ? s.avgScore : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${s.engagementScore}%`, backgroundColor: s.engagementScore >= 60 ? '#1E8A6E' : s.engagementScore >= 30 ? '#E0A020' : '#DC2626' }} />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">{s.engagementScore}/100</p>
                      </td>
                      <td className="px-3 py-2.5 text-center text-xs text-gray-600">{s.streak > 0 ? `🔥 ${s.streak}d` : '—'}</td>
                      <td className="px-3 py-2.5 text-center">
                        <Badge style={{ backgroundColor: RISK_COLORS[s.risk] + '20', color: RISK_COLORS[s.risk] }} className="text-[10px]">{RISK_LABELS[s.risk]}</Badge>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-gray-400 text-sm">No students match</td></tr>}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>)}

        {tab === 'class' && (<>
          <Card>
            <CardHeader><CardTitle className="text-sm">Performance by Class / Grade</CardTitle></CardHeader>
            <CardContent className="h-[240px]">
              {stats.gradeData.length === 0
                ? <div className="h-full flex items-center justify-center text-gray-400 text-sm">No grade data — students need education level set</div>
                : <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.gradeData}>
                    <CartesianGrid key="grid" strokeDasharray="3 3" opacity={0.3} />
                    <XAxis key="xax" dataKey="grade" tick={{ fontSize: 11 }} />
                    <YAxis key="yax" tick={{ fontSize: 11 }} />
                    <RechartsTip key="tip" />
                    <Bar key="bar-s" dataKey="avgScore" name="Avg Score" fill="#5B7DB1" radius={[4, 4, 0, 0]} />
                    <Bar key="bar-e" dataKey="avgEngagement" name="Avg Engagement" fill="#6B4C9A" radius={[4, 4, 0, 0]} />
                    <Legend key="legend" />
                  </BarChart>
                </ResponsiveContainer>
              }
            </CardContent>
          </Card>
          {stats.gradeData.map(g => (
            <Card key={g.grade}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{g.grade}</p>
                    <p className="text-xs text-gray-500">{g.total} students · {g.assessed} assessed ({Math.round((g.assessed / Math.max(g.total, 1)) * 100)}%)</p>
                  </div>
                  {g.atRisk > 0 && <Badge className="bg-red-50 text-red-700 text-[10px]">⚠ {g.atRisk} at risk</Badge>}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Avg Score', value: g.avgScore || '—', color: '#5B7DB1' },
                    { label: 'Avg Engagement', value: g.avgEngagement ? `${g.avgEngagement}/100` : '—', color: '#6B4C9A' },
                    { label: 'At Risk', value: g.atRisk, color: g.atRisk > 0 ? '#DC2626' : '#9ca3af' },
                  ].map(m => (
                    <div key={m.label} className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-sm font-semibold" style={{ color: m.color }}>{m.value}</p>
                      <p className="text-[10px] text-gray-500">{m.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </>)}

        {tab === 'leaders' && (<>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-orange-500" /> 
                  Gamification Leaders
                  <Tooltip>
                    <TooltipTrigger><HelpCircle className="w-3.5 h-3.5 text-gray-400" /></TooltipTrigger>
                    <TooltipContent className="max-w-[200px]">Students with the highest XP earned from taking assessments and logging in daily.</TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.topXP.length === 0 ? <p className="text-sm text-gray-500">No XP data available.</p> : stats.topXP.map((s, i) => (
                  <div key={s.user.id} className="flex justify-between items-center bg-yellow-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-yellow-700 w-4">{i + 1}.</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{s.user.name}</p>
                        <p className="text-[10px] text-gray-500">{s.gradeLevel}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#E0A020]">{s.xp} XP</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" /> 
                  Active Streaks
                  <Tooltip>
                    <TooltipTrigger><HelpCircle className="w-3.5 h-3.5 text-gray-400" /></TooltipTrigger>
                    <TooltipContent className="max-w-[200px]">Students who have logged in and engaged with the platform for consecutive days.</TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.topStreaks.length === 0 ? <p className="text-sm text-gray-500">No active streaks.</p> : stats.topStreaks.map((s, i) => (
                  <div key={s.user.id} className="flex justify-between items-center bg-orange-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-orange-700 w-4">{i + 1}.</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{s.user.name}</p>
                        <p className="text-[10px] text-gray-500">{s.gradeLevel}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-orange-500">🔥 {s.streak} Days</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#1E8A6E]" /> 
                  Top Quiz Performers
                  <Tooltip>
                    <TooltipTrigger><HelpCircle className="w-3.5 h-3.5 text-gray-400" /></TooltipTrigger>
                    <TooltipContent className="max-w-[220px]">Students with the highest average scores across all cognitive assessments taken.</TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.topScores.length === 0 ? <p className="text-sm text-gray-500">No quiz scores available.</p> : stats.topScores.map((s, i) => (
                  <div key={s.user.id} className="flex justify-between items-center bg-emerald-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-700 w-4">{i + 1}.</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{s.user.name}</p>
                        <p className="text-[10px] text-gray-500">{s.gradeLevel}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#1E8A6E]">{s.avgScore} Avg Score</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>)}

        {tab === 'cognitive' && (<>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                Cognitive Profile Summary
                <Tooltip>
                  <TooltipTrigger><HelpCircle className="w-3.5 h-3.5 text-gray-400" /></TooltipTrigger>
                  <TooltipContent className="max-w-[250px]">Averages the scores of all students who took the assessments, highlighting the dominant cognitive traits in your school.</TooltipContent>
                </Tooltip>
              </CardTitle>
              <p className="text-xs text-gray-500 mt-1">Aggregated dimensions across all completed student assessments</p>
            </CardHeader>
            <CardContent>
              {stats.cognitiveSummary.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">No cognitive profiles generated yet. Have students complete assessments first.</div>
              ) : (
                <div className="space-y-4">
                  {stats.cognitiveSummary.map((dim, i) => {
                    const p = Math.round((dim.avg / dim.max) * 100);
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-700 font-medium">{dim.name}</span>
                          <span className="text-gray-500">{dim.avg} / {dim.max} ({p}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div className="h-2.5 rounded-full" style={{ width: `${p}%`, backgroundColor: '#5B7DB1' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>)}

        {tab === 'comparison' && (<>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Student Engagement</span>
                  <Users className="w-4 h-4 text-[#1E8A6E]" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-center mt-2">
                  <div>
                    <p className="text-2xl font-bold text-[#5B7DB1]">{stats.total}</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1E8A6E]">{Math.round((stats.assessed / Math.max(stats.total, 1)) * 100)}%</p>
                    <p className="text-xs text-gray-500">Assessed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#6B4C9A]">{stats.avgEng}</p>
                    <p className="text-xs text-gray-500">Avg Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Teacher Engagement</span>
                  <BookOpen className="w-4 h-4 text-[#E0A020]" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-center mt-2">
                  <div>
                    <p className="text-2xl font-bold text-[#5B7DB1]">{stats.teacherTotal}</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1E8A6E]">{Math.round((stats.teacherAssessed / Math.max(stats.teacherTotal, 1)) * 100)}%</p>
                    <p className="text-xs text-gray-500">Assessed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#6B4C9A]">{stats.teacherAvgEng}</p>
                    <p className="text-xs text-gray-500">Avg Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm">Cognitive Profile Alignment: Teachers vs. Students</CardTitle>
              <p className="text-xs text-gray-500 mt-1">Comparing the average dimension strengths (in percentage) of teachers and students.</p>
            </CardHeader>
            <CardContent className="h-[350px]">
              {stats.comparisonData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">Not enough data to compare. Ensure both teachers and students have completed assessments.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(val) => `${val}%`} />
                    <RechartsTip cursor={{fill: 'transparent'}} />
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey="Teacher Avg (%)" fill="#6B4C9A" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Student Avg (%)" fill="#1E8A6E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Teaching Style vs. Student Needs</CardTitle>
                <p className="text-xs text-gray-500 mt-1">If the student population skews towards 'Reflective' processing, do the teachers' styles accommodate that?</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Use the Cognitive Profile Alignment chart above to identify gaps. 
                  For example, if your students score highly in <b>Practical</b> and <b>Concrete Experience (CE)</b>, but your teachers' cognitive profiles lean heavily towards <b>Analytical</b> or <b>Abstract Conceptualization (AC)</b>, you may need to introduce more hands-on, experiential learning opportunities into the curriculum to bridge the alignment gap.
                </p>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2"><Zap className="w-4 h-4" /> Recommendation Engine</h4>
                  <p className="text-xs text-blue-800 mt-2">
                    {stats.comparisonData.some(d => d.name === 'Practical' && d['Student Avg (%)'] > d['Teacher Avg (%)'] + 15) 
                      ? "High Practical gap detected: Encourage teachers to implement project-based learning." 
                      : "Profiles are generally aligned. Maintain current differentiated instruction strategies."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>)}

        {tab === 'alignment' && (<>
          <div className="mb-6 bg-indigo-50/50 text-indigo-900 p-5 rounded-xl border border-indigo-100 shadow-sm text-sm">
            <h3 className="font-semibold mb-2 flex items-center gap-1.5 text-base"><Target className="w-5 h-5 text-indigo-600" /> School Alignment & Recommendations</h3>
            <p className="text-indigo-800/80 leading-relaxed">
              This section automatically analyzes cognitive gaps between your teaching staff and student body. 
              Review the tailored recommendations below to better align instructional methods with student learning needs, and follow the scoring advice to boost overall engagement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  Cognitive Alignment Recommendations
                </CardTitle>
                <p className="text-xs text-gray-500 mt-1">Generated based on the largest gaps between student needs and teacher styles.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.comparisonData.length === 0 ? (
                  <p className="text-sm text-gray-400">Not enough data to generate recommendations. Ensure both teachers and students have taken assessments.</p>
                ) : (
                  (() => {
                    const gaps = stats.comparisonData.map(d => ({
                      name: d.name,
                      studentScore: d['Student Avg (%)'],
                      teacherScore: d['Teacher Avg (%)'],
                      diff: d['Student Avg (%)'] - d['Teacher Avg (%)']
                    })).filter(g => Math.abs(g.diff) >= 10)
                       .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

                    if (gaps.length === 0) {
                      return (
                        <div className="p-4 bg-green-50 text-green-800 rounded-lg border border-green-100 text-sm">
                          <strong className="flex items-center gap-2 mb-1"><CheckCircle className="w-4 h-4" /> Strong Alignment Detected</strong>
                          Your teaching staff's cognitive profiles align closely with your students' needs. Maintain current differentiated instruction strategies!
                        </div>
                      );
                    }

                    return gaps.map((gap, i) => (
                      <div key={i} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-bold text-blue-900">{gap.name} Gap</span>
                          <Badge variant="outline" className="text-blue-700 bg-blue-100 border-blue-200 text-[10px]">
                            {gap.diff > 0 ? `Students +${Math.round(gap.diff)}%` : `Teachers +${Math.round(Math.abs(gap.diff))}%`}
                          </Badge>
                        </div>
                        <p className="text-xs text-blue-800">
                          {gap.diff > 0 
                            ? `Students show a significantly higher preference for ${gap.name} thinking than the teaching staff.` 
                            : `Teachers lean much more heavily on ${gap.name} thinking than the student body.`}
                        </p>
                        <div className="mt-2 text-xs font-semibold text-blue-900">
                          Recommendation:
                          <span className="font-normal block mt-1">
                            {gap.name === 'Practical' && gap.diff > 0 && "Incorporate more hands-on, project-based learning. Relate abstract concepts to real-world applications."}
                            {gap.name === 'Practical' && gap.diff < 0 && "Ensure theoretical concepts aren't being overlooked in favor of immediate applications."}
                            
                            {gap.name === 'Creative' && gap.diff > 0 && "Allow for more open-ended assignments and creative expression in assessments."}
                            {gap.name === 'Creative' && gap.diff < 0 && "Provide more structured rubrics to help students understand exactly what is expected."}
                            
                            {gap.name === 'Analytical' && gap.diff > 0 && "Challenge students with deeper logical puzzles, debates, and critical thinking exercises."}
                            {gap.name === 'Analytical' && gap.diff < 0 && "Break down complex logical steps more explicitly, as students may struggle to intuitively grasp analytical leaps."}
                            
                            {gap.name === 'Reflective' && gap.diff > 0 && "Provide more time for students to process information internally before requiring answers."}
                            {gap.name === 'Reflective' && gap.diff < 0 && "Incorporate more immediate, active learning activities to keep energy high."}
                            
                            {gap.name === 'Intuitive' && gap.diff > 0 && "Use storytelling, analogies, and big-picture overviews before diving into details."}
                            {gap.name === 'Intuitive' && gap.diff < 0 && "Provide detailed, step-by-step instructions rather than relying on students to 'figure it out'."}

                            {!['Practical', 'Creative', 'Analytical', 'Reflective', 'Intuitive'].includes(gap.name) && gap.diff > 0 && `Provide more opportunities for students to utilize their ${gap.name} strengths.`}
                            {!['Practical', 'Creative', 'Analytical', 'Reflective', 'Intuitive'].includes(gap.name) && gap.diff < 0 && `Be mindful that teachers' strong ${gap.name} preference might not resonate easily with the students.`}
                          </span>
                        </div>
                      </div>
                    ));
                  })()
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Score Improvement Guide
                </CardTitle>
                <p className="text-xs text-gray-500 mt-1">Actionable steps to boost school-wide engagement and Gamification XP scores.</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs mt-0.5">1</div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Encourage Daily Streaks</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Students earn significant XP multipliers by logging in daily. Have teachers incorporate a quick 3-minute morning check-in on the platform.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs mt-0.5">2</div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Assign Cognitive Modules</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Ensure all students complete the Learning Style, Thinking Style, and Decision Style assessments. Currently, {Math.round((stats.assessed / Math.max(stats.total, 1)) * 100)}% of students have taken an assessment.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs mt-0.5">3</div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Host a Gamification Leaderboard</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Use the "Gamification Leaders" tab to announce the top students weekly. Recognition is a powerful motivator for increasing engagement scores.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs mt-0.5">4</div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Review "At Risk" Students</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        You have {stats.riskCounts.high} students in the "At Risk" category (Engagement &lt; 25). Assign targeted interventions to these students to quickly bring up the school average of {stats.avgEng}/100.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>)}

        {tab === 'insights' && (<>
          {insights.map((ins, i) => (
            <Card key={i} className={`border-l-4 ${ins.type === 'warning' ? 'border-l-amber-400 bg-amber-50' : ins.type === 'success' ? 'border-l-green-500 bg-green-50' : 'border-l-blue-400 bg-blue-50'}`}>
              <CardContent className="pt-4 flex items-start gap-3">
                <span className="text-xl">{ins.type === 'warning' ? '⚠️' : ins.type === 'success' ? '✅' : 'ℹ️'}</span>
                <div>
                  <p className={`text-sm font-semibold mb-0.5 ${ins.type === 'warning' ? 'text-amber-900' : ins.type === 'success' ? 'text-green-900' : 'text-blue-900'}`}>{ins.title}</p>
                  <p className={`text-xs ${ins.type === 'warning' ? 'text-amber-700' : ins.type === 'success' ? 'text-green-700' : 'text-blue-700'}`}>{ins.body}</p>
                </div>
              </CardContent>
            </Card>
          ))}
          {summaries.filter(s => s.risk === 'high').length > 0 && (
            <Card className="border-l-4 border-l-red-500">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" />Priority Interventions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {summaries.filter(s => s.risk === 'high').slice(0, 5).map(s => (
                  <div key={s.user.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-sm text-red-900">{s.user.name}</p>
                      <p className="text-[10px] text-red-600">Engagement: {s.engagementScore}/100 · {s.assessmentCount} assessments</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800 text-[10px]">Action needed</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>)}
      </div>
    </div>
    </TooltipProvider>
  );
}
