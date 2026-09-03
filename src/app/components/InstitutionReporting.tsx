import React, { useState, useMemo, useEffect } from 'react';
import { User, Assessment } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Download, Filter, Search, Calendar, FileText, Users, CheckCircle2, AlertTriangle, Sparkles, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { getAllAssessmentResults } from '../utils/api';
import { getAllUsers, getAllClasses, getAssignmentsForTeacher } from '../utils/storage';
import { InstitutionMember } from '../utils/institution';
import { generateSchoolSummaryPDF } from '../utils/pdfGenerator';
import { getStudentCognitiveStyles } from './SchoolAnalyticsDashboard';
import { getEngagementMetrics } from '../utils/engagementTracking';

export const formatAssessmentType = (type: string) => {
  if (!type || type === 'unknown') return 'Assessment';
  const map: Record<string, string> = {
    'kolb': 'Learning Style',
    'sternberg': 'Thinking Style',
    'dual-process': 'Decision Style',
    'jhs-thinking': 'JHS Thinking Style',
    'shs-thinking': 'SHS Thinking Style',
    'adult-thinking': 'Adult Thinking Style',
    'children-thinking': 'Children Thinking Style',
    'jtia': 'Teaching Insights',
  };
  return map[type] || type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

interface InstitutionReportingProps {
  institutionId: string;
  institutionName: string;
  members?: InstitutionMember[];
  currentTeacherId?: string;
}

export function InstitutionReporting({
  institutionId,
  institutionName,
  members = [],
  currentTeacherId
}: InstitutionReportingProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState(currentTeacherId || 'all');
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allAssessments, setAllAssessments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const users = getAllUsers();
        setAllUsers(users);

        let studentMemberIds = members
          .filter(m => m.role === 'student' && m.status === 'approved')
          .map(m => m.userId);

        if (studentMemberIds.length === 0) {
          if (currentTeacherId) {
            const classes = getAllClasses();
            const assignments = getAssignmentsForTeacher(currentTeacherId);
            const teacherClassIds = new Set<string>();
            classes.filter(c => c.classTeacherId === currentTeacherId).forEach(c => teacherClassIds.add(c.id));
            assignments.forEach(a => teacherClassIds.add(a.classId));
            studentMemberIds = users.filter(u => u.role === 'student' && u.classId && teacherClassIds.has(u.classId)).map(u => u.id);
          } else {
            studentMemberIds = [];
          }
        }

        let assessmentsArray: any[] = [];
        if (studentMemberIds.length > 0) {
          const chunkSize = 50;
          for (let i = 0; i < studentMemberIds.length; i += chunkSize) {
            const chunk = studentMemberIds.slice(i, i + chunkSize);
            const response = await getAllAssessmentResults(chunk);
            if (response && Array.isArray(response.results)) {
              assessmentsArray.push(...response.results);
            } else if (Array.isArray(response)) {
              assessmentsArray.push(...response);
            }
          }
        }
        setAllAssessments(assessmentsArray);
      } catch (err) {
        console.error('Failed to load reporting data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [institutionId, members, currentTeacherId]);

  const teachers = members.filter(m => m.role === 'teacher' && m.status === 'approved');
  const allClasses = getAllClasses();

  // Build aggregated student list with cognitive styles
  const studentReports = useMemo(() => {
    const studentMembers = members.filter(m => m.role === 'student' && m.status === 'approved');
    const memberUserIds = new Set(studentMembers.map(m => m.userId));

    let studentsInScope = allUsers.filter(u => u.role === 'student' && memberUserIds.has(u.id));

    // Fallback if no supabase members
    if (studentsInScope.length === 0 && currentTeacherId) {
      const assignments = getAssignmentsForTeacher(currentTeacherId);
      const teacherClassIds = new Set<string>();
      allClasses.filter(c => c.classTeacherId === currentTeacherId).forEach(c => teacherClassIds.add(c.id));
      assignments.forEach(a => teacherClassIds.add(a.classId));
      studentsInScope = allUsers.filter(u => u.role === 'student' && u.classId && teacherClassIds.has(u.classId));
    } else if (studentsInScope.length === 0 && studentMembers.length > 0) {
      studentsInScope = studentMembers.map(m => ({
        id: m.userId,
        name: m.userName,
        email: m.userEmail,
        role: 'student' as const,
      } as User));
    }

    return studentsInScope.map(stu => {
      const stuAssessments = allAssessments.filter(a => a.userId === stu.id);
      const styles = getStudentCognitiveStyles(stuAssessments);
      const studentClass = stu.classId ? allClasses.find(c => c.id === stu.classId) : null;
      const teacher = studentClass?.classTeacherId ? teachers.find(t => t.userId === studentClass.classTeacherId) : null;
      const eng = getEngagementMetrics(stu.id);

      const isAssessed = stuAssessments.length > 0;
      let riskStatus = 'On Track';
      if (!isAssessed) riskStatus = 'Unassessed';
      else if (eng && eng.engagementScore < 30) riskStatus = 'Priority Support';
      else if (eng && eng.engagementScore < 60) riskStatus = 'Needs Support';

      const latestCompleted = stuAssessments
        .filter(a => a.completedAt)
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];

      return {
        user: stu,
        className: studentClass?.name || stu.className || (stu as any).educationLevel || 'General',
        classId: stu.classId,
        teacherName: teacher?.userName || 'Assigned Faculty',
        teacherId: studentClass?.classTeacherId,
        assessments: stuAssessments,
        styles,
        engagementScore: eng?.engagementScore ?? 75,
        riskStatus,
        lastCompletedDate: latestCompleted?.completedAt ? new Date(latestCompleted.completedAt).toLocaleDateString() : '—'
      };
    });
  }, [allUsers, members, allAssessments, allClasses, currentTeacherId, teachers]);

  // Apply filters
  const filteredReports = useMemo(() => {
    return studentReports.filter(rep => {
      if (selectedTeacherId !== 'all' && rep.teacherId !== selectedTeacherId) return false;
      if (selectedClassId !== 'all' && rep.classId !== selectedClassId && rep.className !== selectedClassId) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = rep.user.name?.toLowerCase().includes(q);
        const matchesEmail = rep.user.email?.toLowerCase().includes(q);
        const matchesClass = rep.className?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesClass) return false;
      }
      return true;
    });
  }, [studentReports, selectedTeacherId, selectedClassId, searchQuery]);

  const assessedCount = studentReports.filter(s => s.assessments.length > 0).length;

  const handleExportCSV = () => {
    const headers = [
      'Student Name',
      'Student Code',
      'Email',
      'Class / Grade',
      'Form Teacher',
      'Primary Learning Style',
      'Thinking Style',
      'Decision Style',
      'Engagement Score (/100)',
      'Risk Status',
      'Assessments Completed',
      'Last Completed Date'
    ];

    const rows = filteredReports.map(r => {
      return [
        r.user.name || 'Unknown',
        (r.user as any).studentCode || '',
        r.user.email || '',
        r.className,
        r.teacherName,
        r.styles.learningStyle,
        r.styles.thinkingStyle,
        r.styles.decisionStyle,
        r.engagementScore,
        r.riskStatus,
        r.assessments.length,
        r.lastCompletedDate
      ].map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${institutionName.replace(/[^a-zA-Z0-9]/g, '_')}_Cognitive_Roster_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Clean CSV report generated and downloaded!');
  };

  const handleExportPDF = async () => {
    toast.loading('Generating Institutional Cognitive Summary PDF...', { id: 'school-pdf' });
    const records = filteredReports.map(r => ({
      studentName: r.user.name || 'Learner',
      studentCode: (r.user as any).studentCode,
      className: r.className,
      teacherName: r.teacherName,
      learningStyle: r.styles.learningStyle,
      thinkingStyle: r.styles.thinkingStyle,
      decisionStyle: r.styles.decisionStyle,
      risk: r.riskStatus
    }));

    const ok = await generateSchoolSummaryPDF(institutionName, {
      totalStudents: studentReports.length,
      totalAssessments: allAssessments.length,
      studentCount: studentReports.length,
      teacherCount: teachers.length
    }, records);

    if (ok) toast.success('Institutional Cognitive PDF downloaded!', { id: 'school-pdf' });
    else toast.error('Failed to generate PDF report', { id: 'school-pdf' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/30">
                <FileText className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold">School Reporting & Intelligence Export</h2>
            </div>
            <p className="text-xs text-indigo-200/80 max-w-2xl">
              Export verified cognitive profiles, student style breakdowns, and faculty metrics in formatted PDF and clean CSV spreadsheets.
            </p>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-indigo-900/60">
          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-center">
            <p className="text-2xl font-black text-indigo-300">{studentReports.length}</p>
            <p className="text-xs text-slate-300 mt-0.5">Enrolled Learners</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-center">
            <p className="text-2xl font-black text-emerald-400">
              {assessedCount} ({studentReports.length ? Math.round((assessedCount / studentReports.length) * 100) : 0}%)
            </p>
            <p className="text-xs text-slate-300 mt-0.5">Assessed Students</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-center">
            <p className="text-2xl font-black text-purple-300">{teachers.length}</p>
            <p className="text-xs text-slate-300 mt-0.5">Faculty Members</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-center">
            <p className="text-2xl font-black text-amber-300">2 Formats</p>
            <p className="text-xs text-slate-300 mt-0.5">PDF Dossier & CSV</p>
          </div>
        </div>
      </div>

      {/* Two Direct Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PDF Card */}
        <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-white hover:border-indigo-300 transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 text-xs">
                Official Document
              </Badge>
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <CardTitle className="text-base font-bold text-gray-900 mt-2">
              Institutional Cognitive Dossier (PDF)
            </CardTitle>
            <CardDescription className="text-xs">
              Formatted executive summary document featuring institutional metrics, learner cognitive distribution, and verified student profiles.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-1.5 text-xs text-gray-600 mb-4 bg-white p-3 rounded-lg border border-gray-100">
              <p className="flex items-center gap-1.5 text-indigo-900 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Includes Kolb learning styles & Sternberg thinking styles
              </p>
              <p className="flex items-center gap-1.5 text-indigo-900 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Executive summary metrics & classroom distribution
              </p>
              <p className="flex items-center gap-1.5 text-indigo-900 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Filtered to current selection ({filteredReports.length} learners)
              </p>
            </div>
            <Button onClick={handleExportPDF} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2 text-xs">
              <FileText className="w-4 h-4" /> Download Official PDF Report
            </Button>
          </CardContent>
        </Card>

        {/* CSV Card */}
        <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50/40 via-white to-white hover:border-emerald-300 transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
                Spreadsheet Dataset
              </Badge>
              <Download className="w-5 h-5 text-emerald-600" />
            </div>
            <CardTitle className="text-base font-bold text-gray-900 mt-2">
              Student Cognitive Roster (CSV)
            </CardTitle>
            <CardDescription className="text-xs">
              Structured spreadsheet formatted with student codes, primary learning, thinking, and decision styles, engagement levels, and risk flags.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-1.5 text-xs text-gray-600 mb-4 bg-white p-3 rounded-lg border border-gray-100">
              <p className="flex items-center gap-1.5 text-emerald-900 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Normalized columns ready for Excel & Google Sheets
              </p>
              <p className="flex items-center gap-1.5 text-emerald-900 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> No raw JSON dumps — only actionable educational metrics
              </p>
              <p className="flex items-center gap-1.5 text-emerald-900 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Exports all {filteredReports.length} selected learners
              </p>
            </div>
            <Button onClick={handleExportCSV} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white gap-2 text-xs">
              <Download className="w-4 h-4" /> Download Spreadsheet (CSV)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" /> Report Filters & Scoping
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-semibold text-gray-700 block mb-1">Filter by Class</Label>
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none"
              >
                <option value="all">All Classes / Entire School</option>
                {allClasses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.educationLevel ? `(${c.educationLevel})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold text-gray-700 block mb-1">Filter by Teacher</Label>
              <select
                value={selectedTeacherId}
                onChange={e => setSelectedTeacherId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none"
              >
                <option value="all">All Teachers</option>
                {teachers.map(t => (
                  <option key={t.userId} value={t.userId}>
                    {t.userName || t.userEmail}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold text-gray-700 block mb-1">Search Learner</Label>
              <Input
                placeholder="Search name, email, or class..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview Table */}
      <Card>
        <CardHeader className="py-3 border-b bg-gray-50/50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-bold text-gray-900">
              Report Data Preview ({filteredReports.length} Learners)
            </CardTitle>
            <span className="text-xs text-gray-500">Live Scoped Dataset</span>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-500 border-b">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold">Student</th>
                <th className="text-center px-3 py-2.5 font-semibold">Class</th>
                <th className="text-center px-3 py-2.5 font-semibold">Learning Style</th>
                <th className="text-center px-3 py-2.5 font-semibold">Thinking Style</th>
                <th className="text-center px-3 py-2.5 font-semibold">Decision Style</th>
                <th className="text-center px-3 py-2.5 font-semibold">Engagement</th>
                <th className="text-center px-3 py-2.5 font-semibold">Risk Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReports.slice(0, 50).map(r => (
                <tr key={r.user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{r.user.name}</p>
                      {(r.user as any).studentCode && (
                        <code className="text-[10px] bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded font-mono font-bold">
                          {(r.user as any).studentCode}
                        </code>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400">{r.user.email}</p>
                  </td>
                  <td className="px-3 py-2.5 text-center text-gray-600 font-medium">
                    {r.className}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      r.styles.learningStyle === 'Pending' ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {r.styles.learningStyle}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      r.styles.thinkingStyle === 'Pending' ? 'bg-gray-100 text-gray-500' : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>
                      {r.styles.thinkingStyle}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      r.styles.decisionStyle === 'Pending' ? 'bg-gray-100 text-gray-500' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {r.styles.decisionStyle}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono text-gray-700">
                    {r.engagementScore}/100
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <Badge
                      className={
                        r.riskStatus === 'On Track'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]'
                          : r.riskStatus === 'Needs Support'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 text-[10px]'
                          : 'bg-red-50 text-red-700 border-red-200 text-[10px]'
                      }
                    >
                      {r.riskStatus}
                    </Badge>
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    No learners match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {filteredReports.length > 50 && (
            <div className="p-2.5 text-center text-xs text-gray-500 bg-gray-50 border-t">
              Showing first 50 of {filteredReports.length} records. Download CSV to access complete dataset.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
