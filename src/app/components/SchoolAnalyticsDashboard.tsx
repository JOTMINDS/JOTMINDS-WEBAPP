import React, { useState, useMemo, useEffect } from 'react';
import { User, Assessment, AssessmentScore, Class } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  ArrowLeft, Users, TrendingUp, AlertTriangle, CheckCircle,
  Search, ChevronDown, ChevronUp, BarChart3, Activity,
  BookOpen, Award, Zap, HelpCircle, Info, Sparkles, Target, X, Eye, ArrowRightLeft
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { getStudentsBySchool, getAllUsers, getAssessmentsByUserId, getAllClasses } from '../utils/storage';
import { getEngagementMetrics } from '../utils/engagementTracking';
import { getGamificationProfile } from '../utils/gamification';
import { extractDimensionScores } from '../utils/cognitiveXP';
import { getAllAssessmentResults } from '../utils/api';
import { normalizeServerResults } from '../utils/assessmentApi';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { generateSchoolAIInsights, SchoolAIInsightsResponse } from '../utils/aiService';
import { StudentDetailView } from './StudentDetailView';
import { InstitutionMember } from '../utils/institution';

interface SchoolAnalyticsDashboardProps {
  user: User;
  onBack: () => void;
  embedded?: boolean;
  institutionMembers?: InstitutionMember[];
  allPlatformUsers?: any[];
  memberAssessments?: any[];
}

type Tab = 'overview' | 'students' | 'class' | 'comparison' | 'alignment' | 'cognitive' | 'insights';

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
  styles?: { learningStyle: string; thinkingStyle: string; decisionStyle: string };
}

const RISK_COLORS = { high: '#DC2626', medium: '#E0A020', low: '#1E8A6E', unassessed: '#9ca3af' };
const RISK_LABELS = { high: 'At Risk', medium: 'Needs Support', low: 'On Track', unassessed: 'Not Started' };

export const KOLB_DIMENSION_NAMES = ['CE', 'RO', 'AC', 'AE', 'Concrete Experience', 'Reflective Observation', 'Abstract Conceptualization', 'Active Experimentation'];
export const THINKING_DIMENSION_NAMES = ['Analytical', 'Creative', 'Practical', 'Social'];

export function getDimensionMaxScore(name: string, _score?: number): number {
  if (KOLB_DIMENSION_NAMES.includes(name)) return 48;
  if (THINKING_DIMENSION_NAMES.includes(name)) return 30;
  return 100;
}

export const determinePrimaryStyle = (scores: any, type: string): string => {
  if (!scores || typeof scores !== 'object') return 'Unknown';
  if (scores.style && typeof scores.style === 'string') return scores.style;

  if (type === 'kolb' || type === 'learning') {
    const { CE = 0, RO = 0, AC = 0, AE = 0 } = scores as any;
    const acCE = AC - CE;
    const aeRO = AE - RO;
    
    if (acCE > 0 && aeRO > 0) return 'Converging';
    if (acCE > 0 && aeRO < 0) return 'Assimilating';
    if (acCE < 0 && aeRO < 0) return 'Diverging';
    return 'Accommodating';
  } else if (type === 'sternberg') {
    const { analytical = 0, creative = 0, practical = 0 } = scores as any;
    if (analytical >= creative && analytical >= practical) return 'Analytical';
    if (creative >= analytical && creative >= practical) return 'Creative';
    return 'Practical';
  } else if (type === 'dual-process' || type === 'decision') {
    const sys1 = scores.system1 ?? scores.intuitive ?? scores.Intuitive;
    const sys2 = scores.system2 ?? scores.reflective ?? scores.Reflective;
    if (sys1 != null && sys2 != null) {
      return sys1 > sys2 ? 'Intuitive' : 'Reflective';
    }
    const validEntries = Object.entries(scores).filter(([k, v]) => typeof v === 'number' && k !== 'total');
    if (validEntries.length > 0) {
      validEntries.sort((a, b) => (b[1] as number) - (a[1] as number));
      return validEntries[0][0];
    }
    return 'Balanced';
  }
  return 'Unknown';
};

export function getStudentCognitiveStyles(assessments: Assessment[]) {
  let learningStyle = 'Pending';
  let thinkingStyle = 'Pending';
  let decisionStyle = 'Pending';

  assessments.forEach(a => {
    const aType = a.type as string;
    const aScore = a.score as any;
    if (aType === 'kolb' || aType === 'learning') {
      const s = aScore?.kolb?.style || aScore?.learning?.style;
      if (s && s !== 'Unknown') learningStyle = s;
    } else if (['sternberg', 'jhs-thinking', 'shs-thinking', 'adult-thinking', 'child-thinking', 'thinking'].includes(aType)) {
      const s = aScore?.sternberg?.style || aScore?.thinking?.style || aScore?.style;
      if (s && s !== 'Unknown') thinkingStyle = s;
    } else if (aType === 'dual-process' || aType === 'decision') {
      const s = aScore?.dualProcess?.style || aScore?.decision?.style || aScore?.style;
      if (s && s !== 'Unknown') {
        decisionStyle = s;
      } else {
        const raw = aScore?.decision?.scores || aScore?.dualProcess?.scores || aScore?.decision || aScore?.dualProcess || aScore;
        const fallback = determinePrimaryStyle(raw, 'decision');
        if (fallback !== 'Unknown') decisionStyle = fallback;
      }
    }
  });

  return { learningStyle, thinkingStyle, decisionStyle };
}

function getGradeLabel(u: User): string {
  if (u.educationLevel) return u.educationLevel;
  if (u.className) return u.className;
  if (u.age) {
    if (u.age <= 10) return 'Primary';
    if (u.age <= 14) return 'JHS';
    if (u.age <= 18) return 'SHS';
    return 'Tertiary';
  }
  return 'General';
}

export function calculateStudentEngagementAndRisk(
  user: User,
  assessments: Assessment[],
  completedTypes: string[],
  normalizedAvgScore: number,
  localEng?: any,
  gamProfile?: any
): { engagementScore: number; risk: 'high' | 'medium' | 'low' | 'unassessed' } {
  if (assessments.length === 0) {
    return {
      engagementScore: localEng && localEng.engagementScore > 0 ? localEng.engagementScore : 0,
      risk: 'unassessed'
    };
  }

  // Calculate recency
  let daysSince = 999;
  const timestamps = assessments
    .map(a => a.completedAt ? new Date(a.completedAt).getTime() : 0)
    .filter(t => !isNaN(t) && t > 0);
  if (timestamps.length > 0) {
    const latestTime = Math.max(...timestamps);
    daysSince = (Date.now() - latestTime) / (1000 * 60 * 60 * 24);
  }

  // 1. Engagement Score Calculation
  let engScore = 0;
  if (localEng && localEng.engagementScore > 0) {
    engScore = localEng.engagementScore;
  } else {
    // Platform-derived engagement: completing assessments represents direct cognitive engagement
    const baseByTypes = completedTypes.length >= 3 ? 80 : completedTypes.length === 2 ? 65 : 45;
    
    let recencyBonus = 0;
    if (timestamps.length > 0) {
      if (daysSince <= 14) {
        recencyBonus = 10;
      } else if (daysSince <= 35) {
        recencyBonus = 5;
      } else if (daysSince >= 45 && completedTypes.length === 1) {
        recencyBonus = -18;
      } else if (daysSince >= 60) {
        recencyBonus = -20;
      }
    }

    const xpBonus = gamProfile?.xp ? Math.min(10, Math.floor(gamProfile.xp / 100)) : 0;
    const streakBonus = gamProfile?.currentStreak ? Math.min(5, gamProfile.currentStreak * 2) : 0;

    engScore = Math.max(15, Math.min(100, baseByTypes + recencyBonus + xpBonus + streakBonus));
  }

  // 2. Normalized Dimension Gaps
  const dimensionScores: number[] = [];
  const KOLB_DIMS = ['CE', 'RO', 'AC', 'AE', 'Concrete Experience', 'Reflective Observation', 'Abstract Conceptualization', 'Active Experimentation'];
  const STERNBERG_DIMS = ['Analytical', 'Creative', 'Practical'];
  assessments.forEach(a => {
    extractDimensionScores(a).forEach(({ name, score }) => {
      const max = KOLB_DIMS.includes(name) ? 48 : STERNBERG_DIMS.includes(name) ? 30 : 100;
      const pct = Math.min(100, Math.round((score / max) * 100));
      dimensionScores.push(pct);
    });
  });

  const criticalGaps = dimensionScores.filter(pct => pct < 35).length;

  // 3. Multi-Factor Risk Classification
  let risk: 'high' | 'medium' | 'low' = 'low';
  if (engScore < 30 || criticalGaps >= 3 || (normalizedAvgScore > 0 && normalizedAvgScore < 30)) {
    risk = 'high';
  } else if (engScore < 65 || criticalGaps > 0 || (normalizedAvgScore > 0 && normalizedAvgScore < 50)) {
    risk = 'medium';
  } else {
    risk = 'low';
  }

  return { engagementScore: engScore, risk };
}

function buildSummary(u: User): StudentSummary {
  const assessments = getAssessmentsByUserId(u.id).filter((a: Assessment) => a.completedAt && a.score);
  const eng = getEngagementMetrics(u.id);
  const gam = getGamificationProfile(u.id);

  const completedTypes = [...new Set(assessments.map((a: Assessment) => {
    if (['kolb', 'vark', 'learning'].includes(a.type)) return 'learning';
    if (['sternberg', 'jhs-thinking', 'shs-thinking', 'adult-thinking', 'child-thinking', 'thinking'].includes(a.type)) return 'thinking';
    if (a.type === 'dual-process' || (a.type as any) === 'decision') return 'decision';
    return a.type;
  }))];

  const allNormalizedScores = assessments.flatMap((a: Assessment) => {
    return extractDimensionScores(a).map((d: { name: string; score: number }) => {
      const max = getDimensionMaxScore(d.name, d.score);
      return Math.min(100, Math.round((d.score / max) * 100));
    });
  });
  const avgScore = allNormalizedScores.length 
    ? Math.round(allNormalizedScores.reduce((s: number, v: number) => s + v, 0) / allNormalizedScores.length) 
    : 0;

  const { engagementScore, risk } = calculateStudentEngagementAndRisk(u, assessments, completedTypes, avgScore, eng, gam);
  const streak = (gam?.currentStreak && gam.currentStreak > 0) ? gam.currentStreak : (assessments.length > 0 ? 1 : 0);
  const xp = (gam?.xp && gam.xp > 0) ? gam.xp : (assessments.length * 200);

  return {
    user: u,
    assessmentCount: assessments.length,
    completedTypes,
    avgScore,
    engagementScore,
    streak,
    xp,
    risk,
    gradeLevel: getGradeLabel(u),
    assessments,
    styles: getStudentCognitiveStyles(assessments)
  };
}

export function SchoolAnalyticsDashboard({ user, onBack, embedded, institutionMembers, allPlatformUsers: parentUsers, memberAssessments: parentAssessments }: SchoolAnalyticsDashboardProps) {
  const [tab, setTab] = useState<Tab>('overview');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'engagement' | 'risk'>('risk');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selectedStudentClass, setSelectedStudentClass] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;

  const [fetchedAssessmentsMap, setFetchedAssessmentsMap] = useState<Record<string, Assessment[]>>({});
  const [loadingAssessments, setLoadingAssessments] = useState(false);

  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [isComparingClasses, setIsComparingClasses] = useState<boolean>(false);
  const [classAId, setClassAId] = useState<string>('');
  const [classBId, setClassBId] = useState<string>('');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<StudentSummary | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<'profile' | 'diagnostic' | 'strategies' | 'progress'>('profile');

  const students = useMemo(() => {
    const localUsers = getAllUsers();
    const allClasses = getAllClasses();

    const userMap = new Map<string, any>();
    localUsers.forEach(u => userMap.set(u.id, u));
    if (parentUsers && Array.isArray(parentUsers)) {
      parentUsers.forEach((u: any) => {
        const existing = userMap.get(u.id) || {};
        userMap.set(u.id, { ...existing, ...u });
      });
    }
    const combinedUsers = Array.from(userMap.values());

    if (institutionMembers && institutionMembers.length > 0) {
      const studentMembers = institutionMembers.filter(m => m.role === 'student' && m.status === 'approved');
      const memberUserIds = new Set(studentMembers.map(m => m.userId));
      
      const mapped = studentMembers.map(m => {
        const full = userMap.get(m.userId);
        const resolvedClass = full?.classId ? allClasses.find(c => c.id === full.classId) : undefined;
        return {
          id: m.userId,
          name: m.userName || full?.name || 'Student',
          email: m.userEmail || full?.email || '',
          phone: m.userPhone || full?.phone || '',
          role: 'student' as const,
          classId: full?.classId,
          className: full?.className || resolvedClass?.name,
          studentCode: (full as any)?.studentCode || (full as any)?.jotsCode || m.userId.slice(0, 8),
          educationLevel: full?.educationLevel || resolvedClass?.educationLevel,
          age: full?.age
        } as User;
      });

      const teacherIds = new Set(institutionMembers.filter(m => m.role === 'teacher' || m.role === 'admin').map(m => m.userId));
      const schoolClasses = allClasses.filter(c => c.institutionId === user.school || (c.classTeacherId && teacherIds.has(c.classTeacherId)));
      const schoolClassIds = new Set(schoolClasses.map(c => c.id));
      
      const enrolledStudents = combinedUsers.filter(u => 
        u.role === 'student' && !memberUserIds.has(u.id) && 
        ((u.classId && schoolClassIds.has(u.classId)) || (u.teacherId && teacherIds.has(u.teacherId)))
      );

      return [...mapped, ...enrolledStudents].slice(0, 200);
    }

    // Fallback: read from combinedUsers
    let raw: User[] = [];
    if (user.role === 'teacher') {
      raw = combinedUsers.filter((u: User) =>
        u.role === 'student' &&
        (u.teacherId === user.id || (u.linkedTeachers && u.linkedTeachers.includes(user.id)))
      );
    } else {
      raw = user.school
        ? getStudentsBySchool(user.school)
        : [];
    }
    return raw.slice(0, 200);
  }, [user.school, user.role, user.id, institutionMembers, parentUsers]);

  const teachers = useMemo(() => {
    const localUsers = getAllUsers();
    const userMap = new Map<string, any>();
    localUsers.forEach(u => userMap.set(u.id, u));
    if (parentUsers && Array.isArray(parentUsers)) {
      parentUsers.forEach((u: any) => {
        const existing = userMap.get(u.id) || {};
        userMap.set(u.id, { ...existing, ...u });
      });
    }

    if (institutionMembers && institutionMembers.length > 0) {
      const teacherMembers = institutionMembers.filter(m => (m.role === 'teacher' || m.role === 'admin') && m.status === 'approved');
      return teacherMembers.slice(0, 100).map(m => {
        const full = userMap.get(m.userId);
        return {
          id: m.userId,
          name: m.userName || full?.name || 'Facilitator',
          email: m.userEmail || full?.email || '',
          phone: m.userPhone || full?.phone || '',
          role: 'teacher' as const,
        } as User;
      });
    }
    let raw: User[] = [];
    raw = user.school
      ? Array.from(userMap.values()).filter((u: User) => (u.role === 'teacher' || u.role === 'admin') && u.school === user.school)
      : [];
    return raw.slice(0, 100);
  }, [user.school, institutionMembers, parentUsers]);

  useEffect(() => {
    if (parentAssessments && parentAssessments.length > 0) {
      const normalized = normalizeServerResults(parentAssessments);
      const grouped: Record<string, Assessment[]> = {};
      normalized.forEach((assessment: any) => {
        const studentId = assessment.userId;
        if (!studentId) return;
        if (!grouped[studentId]) {
          grouped[studentId] = [];
        }
        grouped[studentId].push(assessment);
      });
      setFetchedAssessmentsMap(grouped);
      setLoadingAssessments(false);
      return;
    }

    const fetchAssessmentsData = async () => {
      const userIds = [...students.map(s => s.id), ...teachers.map(t => t.id)];
      if (userIds.length === 0) return;
      
      try {
        setLoadingAssessments(true);
        const response = await getAllAssessmentResults(userIds);
        
        let rawAssessments: any[] = [];
        if (response && Array.isArray(response.results)) {
          rawAssessments = response.results;
        } else if (Array.isArray(response)) {
          rawAssessments = response;
        }
        
        const normalized = normalizeServerResults(rawAssessments);
        const grouped: Record<string, Assessment[]> = {};
        
        normalized.forEach((assessment: any) => {
          const studentId = assessment.userId;
          if (!studentId) return;
          if (!grouped[studentId]) {
            grouped[studentId] = [];
          }
          grouped[studentId].push(assessment);
        });
        
        setFetchedAssessmentsMap(grouped);
      } catch (error) {
        console.error('Failed to fetch student assessments for SchoolAnalyticsDashboard:', error);
      } finally {
        setLoadingAssessments(false);
      }
    };
    
    fetchAssessmentsData();
  }, [students, teachers, parentAssessments]);

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
        if (a.type === 'dual-process' || (a.type as any) === 'decision') return 'decision';
        return a.type;
      }))];

      const allNormalizedScores = assessments.flatMap((a: Assessment) => {
        return extractDimensionScores(a).map((d: { name: string; score: number }) => {
          const max = getDimensionMaxScore(d.name, d.score);
          return Math.min(100, Math.round((d.score / max) * 100));
        });
      });
      const avgScore = allNormalizedScores.length 
        ? Math.round(allNormalizedScores.reduce((s: number, v: number) => s + v, 0) / allNormalizedScores.length) 
        : 0;

      const { engagementScore, risk } = calculateStudentEngagementAndRisk(u, assessments, completedTypes, avgScore, eng, gam);
      const streak = (gam?.currentStreak && gam.currentStreak > 0) ? gam.currentStreak : (assessments.length > 0 ? 1 : 0);
      const xp = (gam?.xp && gam.xp > 0) ? gam.xp : (assessments.length * 200);

      return {
        user: u,
        assessmentCount: assessments.length,
        completedTypes,
        avgScore,
        engagementScore,
        streak,
        xp,
        risk,
        gradeLevel: getGradeLabel(u),
        assessments,
        styles: getStudentCognitiveStyles(assessments)
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
          const maxVal = getDimensionMaxScore(d.name, d.score);
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
          const maxVal = getDimensionMaxScore(d.name, d.score);
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
    const teacherAvgEng = teacherAssessedList.length ? Math.round(teacherAssessedList.reduce((s: any, v: any) => s + (v.assessments.length >= 2 ? 90 : 80), 0) / teacherAssessedList.length) : 0;

    return { 
      assessed: assessed.length, total: summaries.length, riskCounts, avgEng, totalXP, activeStreaks, 
      typeCompletion, gradeData, engagementBands, topStreaks, topXP, topScores, cognitiveSummary, comparisonData,
      teacherTotal: teacherSummaries.length, teacherAssessed: teacherAssessedList.length, teacherAvgEng
    };
  }, [summaries, teacherSummaries]);

  const availableStudentClasses = useMemo(() => {
    const allClasses = getAllClasses();
    const classNamesFromClasses = allClasses
      .filter(c => c.institutionId === user.school || (user.organizationCode && c.institutionId === user.organizationCode))
      .map(c => c.name);
    return Array.from(new Set([
      ...classNamesFromClasses,
      ...summaries.map(s => s.user.className || s.gradeLevel).filter(Boolean)
    ])).filter(Boolean);
  }, [user.school, user.organizationCode, summaries]);

  const filtered = useMemo(() => {
    let list = summaries;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => 
        s.user.name.toLowerCase().includes(q) || 
        s.user.email.toLowerCase().includes(q) || 
        ((s.user as any).studentCode || '').toLowerCase().includes(q)
      );
    }
    if (riskFilter !== 'all') list = list.filter(s => s.risk === riskFilter);
    if (selectedStudentClass !== 'all') {
      list = list.filter(s => (s.user.className || s.gradeLevel) === selectedStudentClass);
    }
    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.user.name.localeCompare(b.user.name);
      else if (sortBy === 'score') cmp = a.avgScore - b.avgScore;
      else if (sortBy === 'engagement') cmp = a.engagementScore - b.engagementScore;
      else { const o = { high: 0, medium: 1, low: 2, unassessed: 3 }; cmp = o[a.risk] - o[b.risk]; }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [summaries, search, riskFilter, selectedStudentClass, sortBy, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: typeof sortBy }) =>
    sortBy === col ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />) : null;

  const pct = (n: number) => `${Math.round((n / Math.max(stats.total, 1)) * 100)}%`;

  const insights = useMemo(() => {
    const list: { type: 'warning' | 'success' | 'info'; title: string; body: string }[] = [];
    if (stats.riskCounts.high > 0) {
      list.push({
        type: 'warning',
        title: `${stats.riskCounts.high} student${stats.riskCounts.high > 1 ? 's' : ''} at high risk`,
        body: `${pct(stats.riskCounts.high)} of students have low engagement or severe cognitive gaps. Schedule individual check-ins.`
      });
    } else if (stats.riskCounts.low > 0) {
      list.push({
        type: 'success',
        title: `${stats.riskCounts.low} student${stats.riskCounts.low > 1 ? 's' : ''} on track`,
        body: `${pct(stats.riskCounts.low)} of students demonstrate consistent engagement and balanced cognitive profiles.`
      });
    }
    if (stats.assessed / Math.max(stats.total, 1) < 0.5) list.push({ type: 'warning', title: 'Low assessment uptake', body: `Only ${pct(stats.assessed)} of students have completed at least one assessment.` });
    if (stats.typeCompletion.decision < stats.total * 0.3) list.push({ type: 'info', title: 'Decision assessment underused', body: `Only ${stats.typeCompletion.decision} students completed the Decision Style assessment.` });
    if (stats.avgEng >= 60) list.push({ type: 'success', title: 'Strong engagement', body: `Average engagement score of ${stats.avgEng}/100 across assessed students.` });
    if (stats.activeStreaks > stats.total * 0.4) list.push({ type: 'success', title: `${stats.activeStreaks} students on active streaks`, body: `${pct(stats.activeStreaks)} of students are maintaining daily learning streaks.` });
    if (stats.riskCounts.unassessed > 5) list.push({ type: 'info', title: `${stats.riskCounts.unassessed} students not yet assessed`, body: 'These students have no cognitive assessment data yet.' });
    return list;
  }, [stats]);

  const [aiSchoolReport, setAiSchoolReport] = useState<SchoolAIInsightsResponse | null>(null);
  const [isGeneratingAiReport, setIsGeneratingAiReport] = useState(false);

  const triggerSchoolAIAnalysis = () => {
    setIsGeneratingAiReport(true);
    generateSchoolAIInsights({
      schoolName: user.school || user.organizationName || 'School',
      role: 'school_admin',
      metrics: {
        totalStudents: stats.total,
        assessed: stats.assessed,
        averageEngagement: stats.avgEng,
        riskCounts: stats.riskCounts,
        typeCompletion: stats.typeCompletion
      },
      algorithmicGuidance: {
        ruleBasedInsights: insights
      }
    }).then(res => {
      if (res) setAiSchoolReport(res);
    }).catch(err => console.error('School report error:', err))
      .finally(() => setIsGeneratingAiReport(false));
  };

  useEffect(() => {
    if (stats.total > 0 && !aiSchoolReport && !isGeneratingAiReport) {
      triggerSchoolAIAnalysis();
    }
  }, [stats.total]);

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
            ['comparison', Users, 'Facilitators vs Students'],
            ['alignment', Target, 'Alignment & Advice'],
            ['cognitive', Zap, 'Cognitive Profiles'],
            ['insights', Activity, 'Strategic Review']
          ] as const).map(([t, Icon, label]) => (
            <button key={t} onClick={() => setTab(t as Tab)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 shrink-0 transition-colors ${tab === t ? 'border-[#5B7DB1] text-[#5B7DB1] font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {tab === 'overview' && (<>
          <div className="mb-6 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 text-blue-900 p-5 rounded-xl border border-blue-100 shadow-sm text-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold flex items-center gap-1.5 text-base">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                {aiSchoolReport ? 'Live Institutional Executive Overview' : 'Understanding Your Dashboard'}
              </h3>
              <Badge variant="outline" className="bg-indigo-100/70 text-indigo-800 border-indigo-200 text-xs">
                {aiSchoolReport ? 'Dynamic Strategic Analysis' : 'Aggregated Analytics'}
              </Badge>
            </div>
            {isGeneratingAiReport ? (
              <p className="text-indigo-700 animate-pulse text-sm">
                Analyzing whole-school cognitive distributions & synthesizing institutional guidance...
              </p>
            ) : aiSchoolReport ? (
              <p className="text-blue-950 leading-relaxed font-medium text-sm">
                {aiSchoolReport.executiveSummary}
              </p>
            ) : (
              <p className="text-blue-800/80 leading-relaxed">
                Welcome to the Assessment Analytics overview. This dashboard aggregates the cognitive and engagement data of all students in your school. 
                Use these insights to identify students who may need additional support, track completion rates for our core cognitive assessments (Learning Style, Thinking Style, and Decision Style), 
                and discover the dominant cognitive traits across your student body.
              </p>
            )}
          </div>

          {(aiSchoolReport?.actionableInterventions?.length || insights.length > 0) && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Actionable Institutional Insights
                </h3>
                {aiSchoolReport?.actionableInterventions?.length && (
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    Priority Actions
                  </span>
                )}
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {aiSchoolReport?.actionableInterventions?.length ? (
                  aiSchoolReport.actionableInterventions.map((item, i) => (
                    <div key={i} className="p-4 rounded-lg border text-sm bg-white shadow-xs border-indigo-100 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-gray-900">{item.area}</span>
                          <Badge className={`text-[10px] ${item.priority === 'urgent' ? 'bg-red-100 text-red-800' : item.priority === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                            {item.priority}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-700">{item.strategy}</div>
                      </div>
                      <div className="text-[10px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded self-start mt-2">
                        Target: {item.targetGroup}
                      </div>
                    </div>
                  ))
                ) : (
                  insights.map((ins, i) => (
                    <div key={i} className={`p-4 rounded-lg border text-sm ${ins.type === 'warning' ? 'bg-red-50 border-red-100 text-red-900' : ins.type === 'success' ? 'bg-green-50 border-green-100 text-green-900' : 'bg-gray-50 border-gray-100 text-gray-900'}`}>
                      <div className="font-semibold mb-1">{ins.title}</div>
                      <div className="opacity-90">{ins.body}</div>
                    </div>
                  ))
                )}
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
          <div className="flex gap-2 flex-wrap items-center justify-between">
            <div className="flex gap-2 flex-1 min-w-[280px] flex-wrap items-center">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Search student or code..." 
                  value={search} 
                  onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} 
                  className="pl-8 text-xs" 
                />
              </div>

              {availableStudentClasses.length > 0 && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs text-gray-500 font-medium">Class:</span>
                  <select
                    value={selectedStudentClass}
                    onChange={e => { setSelectedStudentClass(e.target.value); setCurrentPage(1); }}
                    className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#5B7DB1]"
                  >
                    <option value="all">All Classes ({summaries.length})</option>
                    {availableStudentClasses.map(c => {
                      const count = summaries.filter(s => (s.user.className || s.gradeLevel) === c).length;
                      return <option key={c} value={c}>{c} ({count})</option>;
                    })}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-1 flex-wrap">
              {(['all', 'high', 'medium', 'low', 'unassessed'] as const).map(r => {
                const count = r === 'all' ? summaries.length : summaries.filter(s => s.risk === r).length;
                return (
                  <button key={r} onClick={() => { setRiskFilter(r); setCurrentPage(1); }}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${riskFilter === r ? 'text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                    style={riskFilter === r ? { backgroundColor: r === 'all' ? '#5B7DB1' : RISK_COLORS[r] } : {}}>
                    {r === 'all' ? `All (${count})` : `${RISK_LABELS[r]} (${count})`}
                  </button>
                );
              })}
            </div>
          </div>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs text-gray-500">
                    <th className="text-left px-4 py-2.5 cursor-pointer" onClick={() => toggleSort('name')}>Student <SortIcon col="name" /></th>
                    <th className="text-center px-3 py-2.5">Class</th>
                    <th className="text-center px-3 py-2.5">Progress</th>
                    <th className="text-center px-3 py-2.5">Learning Style</th>
                    <th className="text-center px-3 py-2.5">Thinking Style</th>
                    <th className="text-center px-3 py-2.5">Decision Style</th>
                    <th className="text-center px-3 py-2.5 cursor-pointer" onClick={() => toggleSort('engagement')}>Engagement <SortIcon col="engagement" /></th>
                    <th className="text-center px-3 py-2.5 cursor-pointer" onClick={() => toggleSort('risk')}>Status <SortIcon col="risk" /></th>
                    <th className="text-right px-4 py-2.5">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map(s => (
                    <tr key={s.user.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{s.user.name}</p>
                          {(s.user as any).studentCode && (
                            <code className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-bold">
                              {(s.user as any).studentCode}
                            </code>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400">{s.user.email}</p>
                      </td>
                      <td className="px-3 py-2.5 text-center text-xs text-gray-600 font-medium">
                        {s.user.className || s.gradeLevel || 'General'}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-[11px] font-semibold text-gray-700">{s.completedTypes.length}/3</span>
                          <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all" 
                              style={{ 
                                width: `${Math.min(100, Math.round((s.completedTypes.length / 3) * 100))}%`,
                                backgroundColor: s.completedTypes.length === 3 ? '#1E8A6E' : s.completedTypes.length >= 1 ? '#3B82F6' : '#9ca3af'
                              }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          s.styles?.learningStyle === 'Pending' ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {s.styles?.learningStyle || 'Pending'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          s.styles?.thinkingStyle === 'Pending' ? 'bg-gray-100 text-gray-500' : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {s.styles?.thinkingStyle || 'Pending'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          s.styles?.decisionStyle === 'Pending' ? 'bg-gray-100 text-gray-500' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {s.styles?.decisionStyle || 'Pending'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${s.engagementScore}%`, backgroundColor: s.engagementScore >= 60 ? '#1E8A6E' : s.engagementScore >= 30 ? '#E0A020' : '#DC2626' }} />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{s.engagementScore}/100</p>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Badge style={{ backgroundColor: RISK_COLORS[s.risk] + '20', color: RISK_COLORS[s.risk] }} className="text-[10px] font-medium">{RISK_LABELS[s.risk]}</Badge>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {s.risk !== 'low' && s.risk !== 'unassessed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedStudentForModal(s);
                                setModalInitialTab('diagnostic');
                              }}
                              className="h-7 px-2 text-[11px] text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200 font-semibold cursor-pointer"
                            >
                              <Zap className="w-3 h-3 mr-1 text-amber-600" /> Diagnose
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedStudentForModal(s);
                              setModalInitialTab('profile');
                            }}
                            className="h-7 px-2.5 text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border-indigo-200 font-medium cursor-pointer"
                          >
                            <Eye className="w-3 h-3 mr-1" /> Profile
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedStudents.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-gray-400 text-sm">
                        No students match the current filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
            {filtered.length > pageSize && (
              <div className="p-3 bg-gray-50 border-t flex items-center justify-between text-xs text-gray-500">
                <span>
                  Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} students
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-7 px-2.5 text-xs cursor-pointer"
                  >
                    Previous
                  </Button>
                  <span className="px-2 font-medium">Page {currentPage} of {totalPages}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-7 px-2.5 text-xs cursor-pointer"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Student Profile Modal */}
          {selectedStudentForModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
                <div className="flex justify-between items-center pb-4 border-b mb-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold text-xs">
                      Student Cognitive Profile & Diagnostic
                    </Badge>
                    <span className="font-bold text-gray-900">{selectedStudentForModal.user.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedStudentForModal(null)} className="h-8 w-8 p-0 text-gray-500">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <StudentDetailView
                  student={selectedStudentForModal.user}
                  assessments={selectedStudentForModal.assessments}
                  initialTab={modalInitialTab}
                  onBack={() => setSelectedStudentForModal(null)}
                />
              </div>
            </div>
          )}
        </>)}

        {tab === 'class' && (() => {
          const availableClasses = Array.from(new Set(summaries.map(s => s.user.className || s.gradeLevel).filter(Boolean)));
          
          const filteredByClass = selectedClassId === 'all' 
            ? summaries 
            : summaries.filter(s => (s.user.className || s.gradeLevel) === selectedClassId);

          const classAData = summaries.filter(s => (s.user.className || s.gradeLevel) === classAId);
          const classBData = summaries.filter(s => (s.user.className || s.gradeLevel) === classBId);

          return (
            <div className="space-y-6">
              {/* Header Controls */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Select Class:</span>
                  <select
                    value={selectedClassId}
                    onChange={e => setSelectedClassId(e.target.value)}
                    disabled={isComparingClasses}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-[#5B7DB1] focus:outline-none"
                  >
                    <option value="all">All Classes / Whole School</option>
                    {availableClasses.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <Button
                  variant={isComparingClasses ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const next = !isComparingClasses;
                    setIsComparingClasses(next);
                    if (next && availableClasses.length >= 2) {
                      setClassAId(availableClasses[0]);
                      setClassBId(availableClasses[1]);
                    }
                  }}
                  className={isComparingClasses ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "border-indigo-200 text-indigo-700 hover:bg-indigo-50"}
                >
                  <ArrowRightLeft className="w-4 h-4 mr-1.5" />
                  {isComparingClasses ? "Exit Comparison" : "Compare Two Classes"}
                </Button>
              </div>

              {/* Comparison Mode View */}
              {isComparingClasses && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-blue-200 bg-blue-50/20">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-bold text-blue-950">Cohort A</CardTitle>
                          <select
                            value={classAId}
                            onChange={e => setClassAId(e.target.value)}
                            className="text-xs font-semibold border border-blue-300 rounded-md px-2 py-1 bg-white"
                          >
                            {availableClasses.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 bg-white rounded-lg border border-blue-100">
                            <p className="text-xl font-bold text-blue-900">{classAData.length}</p>
                            <p className="text-[10px] text-gray-500">Students</p>
                          </div>
                          <div className="p-2 bg-white rounded-lg border border-blue-100">
                            <p className="text-xl font-bold text-emerald-600">
                              {classAData.filter(s => s.assessmentCount > 0).length}
                            </p>
                            <p className="text-[10px] text-gray-500">Assessed</p>
                          </div>
                          <div className="p-2 bg-white rounded-lg border border-blue-100">
                            <p className="text-xl font-bold text-purple-600">
                              {classAData.length ? Math.round(classAData.reduce((acc, cur) => acc + cur.engagementScore, 0) / classAData.length) : 0}
                            </p>
                            <p className="text-[10px] text-gray-500">Avg Engagement</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-purple-200 bg-purple-50/20">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-bold text-purple-950">Cohort B</CardTitle>
                          <select
                            value={classBId}
                            onChange={e => setClassBId(e.target.value)}
                            className="text-xs font-semibold border border-purple-300 rounded-md px-2 py-1 bg-white"
                          >
                            {availableClasses.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 bg-white rounded-lg border border-purple-100">
                            <p className="text-xl font-bold text-purple-900">{classBData.length}</p>
                            <p className="text-[10px] text-gray-500">Students</p>
                          </div>
                          <div className="p-2 bg-white rounded-lg border border-purple-100">
                            <p className="text-xl font-bold text-emerald-600">
                              {classBData.filter(s => s.assessmentCount > 0).length}
                            </p>
                            <p className="text-[10px] text-gray-500">Assessed</p>
                          </div>
                          <div className="p-2 bg-white rounded-lg border border-purple-100">
                            <p className="text-xl font-bold text-purple-600">
                              {classBData.length ? Math.round(classBData.reduce((acc, cur) => acc + cur.engagementScore, 0) / classBData.length) : 0}
                            </p>
                            <p className="text-[10px] text-gray-500">Avg Engagement</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Comparative Cognitive Style Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-bold">Class Cognitive Distribution Comparison</CardTitle>
                      <p className="text-xs text-gray-500">Side-by-side comparison of dominant learning and thinking styles between {classAId} and {classBId}.</p>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {(() => {
                        const styleNames = ['Accommodating', 'Assimilating', 'Converging', 'Diverging', 'Analytical', 'Creative', 'Practical'];
                        const compData = styleNames.map(st => {
                          const countA = classAData.filter(s => s.styles?.learningStyle === st || s.styles?.thinkingStyle === st).length;
                          const countB = classBData.filter(s => s.styles?.learningStyle === st || s.styles?.thinkingStyle === st).length;
                          return {
                            style: st,
                            [classAId || 'Class A']: countA,
                            [classBId || 'Class B']: countB,
                          };
                        });

                        return (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={compData} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
                              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                              <XAxis dataKey="style" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" />
                              <YAxis tick={{ fontSize: 11 }} />
                              <RechartsTip />
                              <Legend verticalAlign="top" height={36} />
                              <Bar dataKey={classAId || 'Class A'} fill="#5B7DB1" radius={[4, 4, 0, 0]} />
                              <Bar dataKey={classBId || 'Class B'} fill="#6B4C9A" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Single Class or All Classes View */}
              {!isComparingClasses && (
                <div className="space-y-6">
                  {/* KPI Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card><CardContent className="pt-4 text-center">
                      <div className="text-xl font-bold text-[#5B7DB1]">{filteredByClass.length}</div>
                      <p className="text-xs text-gray-500 mt-0.5">Enrolled Learners</p>
                    </CardContent></Card>

                    <Card><CardContent className="pt-4 text-center">
                      <div className="text-xl font-bold text-[#1E8A6E]">
                        {filteredByClass.filter(s => s.assessmentCount > 0).length} ({filteredByClass.length ? Math.round((filteredByClass.filter(s => s.assessmentCount > 0).length / filteredByClass.length) * 100) : 0}%)
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Assessed</p>
                    </CardContent></Card>

                    <Card><CardContent className="pt-4 text-center">
                      <div className="text-xl font-bold text-[#6B4C9A]">
                        {filteredByClass.length ? Math.round(filteredByClass.reduce((acc, c) => acc + c.engagementScore, 0) / filteredByClass.length) : 0}/100
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Avg Engagement</p>
                    </CardContent></Card>

                    <Card><CardContent className="pt-4 text-center">
                      <div className="text-xl font-bold text-[#DC2626]">{filteredByClass.filter(s => s.risk === 'high').length}</div>
                      <p className="text-xs text-gray-500 mt-0.5">Priority Support</p>
                    </CardContent></Card>
                  </div>

                  {/* Class Cognitive Breakdown Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Learning Style Breakdown */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase text-blue-900 tracking-wider">Dominant Learning Styles</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {['Accommodating', 'Assimilating', 'Converging', 'Diverging'].map(style => {
                          const count = filteredByClass.filter(s => s.styles?.learningStyle === style).length;
                          const pct = filteredByClass.length ? Math.round((count / filteredByClass.length) * 100) : 0;
                          return (
                            <div key={style}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium text-gray-700">{style}</span>
                                <span className="text-gray-500">{count} ({pct}%)</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div className="h-1.5 rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>

                    {/* Thinking Style Breakdown */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase text-purple-900 tracking-wider">Dominant Thinking Styles</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {['Analytical', 'Creative', 'Practical'].map(style => {
                          const count = filteredByClass.filter(s => s.styles?.thinkingStyle === style).length;
                          const pct = filteredByClass.length ? Math.round((count / filteredByClass.length) * 100) : 0;
                          return (
                            <div key={style}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium text-gray-700">{style}</span>
                                <span className="text-gray-500">{count} ({pct}%)</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div className="h-1.5 rounded-full bg-purple-600" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>

                    {/* Decision Style Breakdown */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase text-emerald-900 tracking-wider">Decision Style Processing</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {['Intuitive', 'Reflective'].map(style => {
                          const count = filteredByClass.filter(s => s.styles?.decisionStyle === style).length;
                          const pct = filteredByClass.length ? Math.round((count / filteredByClass.length) * 100) : 0;
                          return (
                            <div key={style}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium text-gray-700">{style}</span>
                                <span className="text-gray-500">{count} ({pct}%)</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div className="h-1.5 rounded-full bg-emerald-600" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Class Student Roster Table */}
                  <Card>
                    <CardHeader className="py-3 border-b">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-600" />
                        Learners in {selectedClassId === 'all' ? 'All Classes' : selectedClassId} ({filteredByClass.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 text-gray-500 border-b">
                          <tr>
                            <th className="text-left px-4 py-2.5">Learner</th>
                            <th className="text-center px-3 py-2.5">Class</th>
                            <th className="text-center px-3 py-2.5">Learning Style</th>
                            <th className="text-center px-3 py-2.5">Thinking Style</th>
                            <th className="text-center px-3 py-2.5">Decision Style</th>
                            <th className="text-center px-3 py-2.5">Risk Status</th>
                            <th className="text-right px-4 py-2.5">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredByClass.map(s => (
                            <tr key={s.user.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-900">{s.user.name}</span>
                                  {(s.user as any).studentCode && (
                                    <code className="text-[10px] bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded font-mono font-bold">
                                      {(s.user as any).studentCode}
                                    </code>
                                  )}
                                </div>
                                <p className="text-[10px] text-gray-400">{s.user.email}</p>
                              </td>
                              <td className="px-3 py-2.5 text-center text-gray-600">{s.user.className || s.gradeLevel || 'General'}</td>
                              <td className="px-3 py-2.5 text-center">
                                <span className={`px-2 py-0.5 rounded-full font-semibold ${s.styles?.learningStyle === 'Pending' ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                                  {s.styles?.learningStyle || 'Pending'}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <span className={`px-2 py-0.5 rounded-full font-semibold ${s.styles?.thinkingStyle === 'Pending' ? 'bg-gray-100 text-gray-500' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
                                  {s.styles?.thinkingStyle || 'Pending'}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <span className={`px-2 py-0.5 rounded-full font-semibold ${s.styles?.decisionStyle === 'Pending' ? 'bg-gray-100 text-gray-500' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                                  {s.styles?.decisionStyle || 'Pending'}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <Badge style={{ backgroundColor: RISK_COLORS[s.risk] + '20', color: RISK_COLORS[s.risk] }} className="text-[10px]">
                                  {RISK_LABELS[s.risk]}
                                </Badge>
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setSelectedStudentForModal(s)}
                                  className="h-6 px-2 text-[10px] text-indigo-600 hover:text-indigo-900 font-semibold"
                                >
                                  Profile
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          );
        })()}



        {tab === 'cognitive' && (() => {
          const learningDims = stats.cognitiveSummary.filter(d => 
            KOLB_DIMENSION_NAMES.includes(d.name)
          );
          const thinkingDims = stats.cognitiveSummary.filter(d => 
            THINKING_DIMENSION_NAMES.includes(d.name)
          );
          const decisionDims = stats.cognitiveSummary.filter(d => 
            !KOLB_DIMENSION_NAMES.includes(d.name) && !THINKING_DIMENSION_NAMES.includes(d.name)
          );

          return (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50/70 to-purple-50/70 p-4 rounded-xl border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm text-indigo-950 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-600" /> School-Wide Cognitive Architecture
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Aggregated scores across all {stats.assessed} assessed students, organized by validated cognitive framework.
                  </p>
                </div>
                <Badge className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1">
                  {stats.assessed} Profiles Analyzed
                </Badge>
              </div>

              {stats.cognitiveSummary.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12 text-gray-400 text-sm">
                    No cognitive profiles generated yet. As students complete learning, thinking, and decision modules, whole-school aggregations will appear here.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Learning Dimensions */}
                  <Card className="border-blue-200">
                    <CardHeader className="pb-3 border-b bg-blue-50/40">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xs font-bold uppercase text-blue-900 tracking-wider">
                          Learning Modalities (Kolb)
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px] bg-white text-blue-700 border-blue-200">
                          Scale: 48
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3.5">
                      {learningDims.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">No learning style data</p>
                      ) : (
                        learningDims.map((dim, i) => {
                          const p = Math.round((dim.avg / dim.max) * 100);
                          return (
                            <div key={i}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-700 font-semibold">{dim.name}</span>
                                <span className="text-gray-500 font-mono text-[11px]">{dim.avg}/{dim.max} ({p}%)</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="h-2 rounded-full bg-[#5B7DB1] transition-all" style={{ width: `${p}%` }} />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>

                  {/* Thinking Dimensions */}
                  <Card className="border-purple-200">
                    <CardHeader className="pb-3 border-b bg-purple-50/40">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xs font-bold uppercase text-purple-900 tracking-wider">
                          Thinking Styles (Sternberg)
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px] bg-white text-purple-700 border-purple-200">
                          Scale: 30
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3.5">
                      {thinkingDims.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">No thinking style data</p>
                      ) : (
                        thinkingDims.map((dim, i) => {
                          const p = Math.round((dim.avg / dim.max) * 100);
                          return (
                            <div key={i}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-700 font-semibold">{dim.name}</span>
                                <span className="text-gray-500 font-mono text-[11px]">{dim.avg}/{dim.max} ({p}%)</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="h-2 rounded-full bg-[#6B4C9A] transition-all" style={{ width: `${p}%` }} />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>

                  {/* Decision Dimensions */}
                  <Card className="border-emerald-200">
                    <CardHeader className="pb-3 border-b bg-emerald-50/40">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xs font-bold uppercase text-emerald-900 tracking-wider">
                          Decision Architecture
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px] bg-white text-emerald-700 border-emerald-200">
                          Scale: 100
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3.5">
                      {decisionDims.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">No decision style data</p>
                      ) : (
                        decisionDims.map((dim, i) => {
                          const p = Math.round((dim.avg / dim.max) * 100);
                          return (
                            <div key={i}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-700 font-semibold">{dim.name}</span>
                                <span className="text-gray-500 font-mono text-[11px]">{dim.avg}/{dim.max} ({p}%)</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="h-2 rounded-full bg-[#1E8A6E] transition-all" style={{ width: `${p}%` }} />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          );
        })()}

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
                  <span>Facilitator Engagement</span>
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
              <CardTitle className="text-sm font-bold">Cognitive Profile Alignment: Facilitators vs. Students</CardTitle>
              <p className="text-xs text-gray-500 mt-1">Comparing the average dimension strengths (in percentage) of school facilitators and students.</p>
            </CardHeader>
            <CardContent className="h-[350px]">
              {stats.comparisonData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">Not enough data to compare. Ensure both facilitators and students have completed assessments.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(val) => `${val}%`} />
                    <RechartsTip cursor={{fill: 'transparent'}} />
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey="Teacher Avg (%)" name="Facilitator Avg (%)" fill="#6B4C9A" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Student Avg (%)" name="Student Avg (%)" fill="#1E8A6E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Connected Facilitator Alignment Roster */}
          <Card className="mb-6">
            <CardHeader className="py-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                Connected School Facilitators ({teachers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-500 border-b">
                  <tr>
                    <th className="text-left px-4 py-2.5">Facilitator</th>
                    <th className="text-center px-3 py-2.5">Role</th>
                    <th className="text-center px-3 py-2.5">Assessments Completed</th>
                    <th className="text-center px-3 py-2.5">Pedagogical Profile</th>
                    <th className="text-center px-3 py-2.5">Class Alignment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {teacherSummaries.map(t => {
                    const hasAssessments = t.assessments.length > 0;
                    const ts = t.assessments.find(a => a.type === 'jtia' || a.type === 'teaching-style' || a.type === 'teaching');
                    const teachingStyle = ts?.score?.['teaching-style']?.primaryStyle || ts?.score?.jtia?.primaryStyle || (hasAssessments ? 'Assessed' : 'Pending profile');
                    return (
                      <tr key={t.user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5">
                          <p className="font-semibold text-gray-900">{t.user.name}</p>
                          <p className="text-[10px] text-gray-400">{t.user.email}</p>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-700">Facilitator</Badge>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {hasAssessments ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                              {t.assessments.length} Completed
                            </Badge>
                          ) : (
                            <span className="text-gray-400 italic text-[11px]">None yet</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="text-gray-800 font-medium text-xs">
                            {teachingStyle}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            hasAssessments ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {hasAssessments ? 'Active Profile' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {teacherSummaries.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-gray-400">
                        No facilitators connected to this institution.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Teaching Style vs. Student Needs</CardTitle>
                <p className="text-xs text-gray-500 mt-1">If the student population skews towards 'Reflective' processing, do the facilitators' styles accommodate that?</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Use the Cognitive Profile Alignment chart above to identify gaps. 
                  For example, if your students score highly in <b>Practical</b> and <b>Concrete Experience (CE)</b>, but your facilitators' cognitive profiles lean heavily towards <b>Analytical</b> or <b>Abstract Conceptualization (AC)</b>, you may need to introduce more hands-on, experiential learning opportunities into the curriculum to bridge the alignment gap.
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
                      <h4 className="text-sm font-semibold text-gray-900">Implement Differentiated Instruction</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Use the cognitive alignment insights above to adapt pedagogical delivery. Group students by cognitive modality during project work so practical and analytical learners reinforce each other.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs mt-0.5">4</div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Review "At Risk" & Needs Support Students</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {stats.riskCounts.high > 0 ? (
                          <>You have {stats.riskCounts.high} student{stats.riskCounts.high > 1 ? 's' : ''} in the "At Risk" category (severe engagement drop or persistent cognitive gaps). Assign targeted interventions to these students to quickly bring up the school average of {stats.avgEng}/100.</>
                        ) : (
                          <>No students are currently flagged as high risk. Focus on encouraging the {stats.riskCounts.medium} student{stats.riskCounts.medium === 1 ? '' : 's'} who need support to achieve full assessment completion and maintain strong engagement.</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>)}

        {tab === 'insights' && (<>
          {/* School Executive Advisor Card */}
          <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-blue-50/80 shadow-md mb-6">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <CardTitle className="text-lg text-indigo-950 font-bold">JotMinds School Executive Advisor</CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={triggerSchoolAIAnalysis} 
                disabled={isGeneratingAiReport}
                className="bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200 text-xs"
              >
                {isGeneratingAiReport ? 'Generating Variation...' : 'Refresh School Analysis'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isGeneratingAiReport ? (
                <div className="py-8 text-center text-indigo-600 text-sm animate-pulse font-medium">
                  Analyzing whole-school cognitive distributions & engagement heuristics...
                </div>
              ) : aiSchoolReport ? (
                <>
                  <div className="p-3 bg-white/80 rounded-lg border border-indigo-100">
                    <p className="text-sm text-gray-800 leading-relaxed font-medium">{aiSchoolReport.executiveSummary}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-white/90 rounded-lg border border-green-100">
                      <h4 className="text-xs font-bold text-green-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Institutional Strengths
                      </h4>
                      <ul className="space-y-1.5 text-xs text-gray-700">
                        {aiSchoolReport.keyStrengths.map((str, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-green-500 font-bold">•</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-white/90 rounded-lg border border-amber-100">
                      <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Strategic Alerts & Risks
                      </h4>
                      <ul className="space-y-1.5 text-xs text-gray-700">
                        {aiSchoolReport.strategicAlerts.map((alt, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{alt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {aiSchoolReport.pedagogicalAlignment && (
                    <div className="p-3 bg-indigo-100/50 rounded-lg border border-indigo-200">
                      <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-indigo-700" /> Whole-School Instructional Strategy Alignment
                      </h4>
                      <p className="text-xs text-indigo-950 leading-relaxed">{aiSchoolReport.pedagogicalAlignment}</p>
                    </div>
                  )}

                  {aiSchoolReport.actionableInterventions?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-blue-600" /> Actionable Institutional Interventions
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {aiSchoolReport.actionableInterventions.map((item, idx) => (
                          <div key={idx} className="p-2.5 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-gray-900">{item.area}</span>
                                <Badge className={`text-[10px] ${item.priority === 'urgent' ? 'bg-red-100 text-red-800' : item.priority === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                                  {item.priority}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">{item.strategy}</p>
                            </div>
                            <span className="text-[10px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded self-start">
                              Target: {item.targetGroup}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-4 text-center">
                  <Button onClick={triggerSchoolAIAnalysis} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Generate Whole-School Analysis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

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
            <Card className="border-l-4 border-l-red-500 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Priority Interventions & Risk Diagnostics
                </CardTitle>
                <Badge variant="outline" className="text-xs text-red-700 bg-red-50 border-red-200 font-semibold">
                  {summaries.filter(s => s.risk === 'high').length} Students Need Action
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {summaries.filter(s => s.risk === 'high').slice(0, 6).map(s => (
                  <div key={s.user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-red-50/70 border border-red-100 rounded-xl gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-red-950">{s.user.name}</p>
                        <Badge className="bg-red-200 text-red-900 text-[10px] font-semibold">Priority Support</Badge>
                      </div>
                      <p className="text-xs text-red-700 mt-0.5">
                        Engagement: {s.engagementScore}/100 · {s.assessmentCount}/3 completed · {s.user.className || s.gradeLevel || 'Class N/A'}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setSelectedStudentForModal(s);
                        setModalInitialTab('diagnostic');
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 self-start sm:self-auto h-8 px-3"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      Run Diagnostic
                    </Button>
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
