import React, { useState, useMemo, useEffect } from 'react';
import { User, Assessment } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Download, Filter, Search, Calendar } from 'lucide-react';
import { getAllAssessmentResults } from '../utils/api';
import { getAllUsers, getAllClasses, getAssignmentsForTeacher } from '../utils/storage';
import { InstitutionMember } from '../utils/institution';

interface InstitutionReportingProps {
  institutionId: string;
  institutionName: string;
  members?: InstitutionMember[];
  currentTeacherId?: string;
}

export function InstitutionReporting({ institutionId, institutionName, members = [], currentTeacherId }: InstitutionReportingProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState(currentTeacherId || 'all');
  const [selectedClass, setSelectedClass] = useState('all');

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allAssessments, setAllAssessments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // getAllUsers is synchronous from local storage but we'll still use it
        // In a full production app, this should fetch users for the institution from the backend
        const users = getAllUsers();
        setAllUsers(users);

        // Get approved student user IDs in this institution
        let studentMemberIds = members
          .filter(m => m.role === 'student' && m.status === 'approved')
          .map(m => m.userId);

        // Fallback: If members sync is empty, use local storage students for this context
        if (studentMemberIds.length === 0) {
          if (currentTeacherId) {
             const classes = getAllClasses();
             const assignments = getAssignmentsForTeacher(currentTeacherId);
             const teacherClassIds = new Set<string>();
             classes.filter(c => c.classTeacherId === currentTeacherId).forEach(c => teacherClassIds.add(c.id));
             assignments.forEach(a => teacherClassIds.add(a.classId));
             studentMemberIds = users.filter(u => u.role === 'student' && u.classId && teacherClassIds.has(u.classId)).map(u => u.id);
          } else {
             studentMemberIds = []; // Don't leak cross-school data
          }
        }

        let assessmentsArray: any[] = [];
        if (studentMemberIds.length > 0) {
          // Chunk requests to avoid URI Too Long (414)
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
  }, [institutionId, members]);

  // Get only approved members of this institution
  const approvedMemberIds = new Set(members.filter(m => m.status === 'approved').map(m => m.userId));
  
  // Teachers in this institution
  const teachers = members.length > 0 ? allUsers.filter(u => u.role === 'teacher' && approvedMemberIds.has(u.id)) : [];

  // Filtered dataset
  const filteredData = useMemo(() => {
    let usersInScope = allUsers.filter(u => u.role === 'student');
    
    // Check if we actually have any approved student members
    const hasStudentMembers = members.some(m => m.role === 'student' && m.status === 'approved');

    // If members are provided, ensure student is part of institution
    if (hasStudentMembers) {
      const studentMembers = members.filter(m => m.role === 'student' && m.status === 'approved');
      
      usersInScope = studentMembers.map(m => {
        const local = usersInScope.find(u => u.id === m.userId);
        if (local) return local;
        
        // Virtual user for those not in local storage
        return {
          id: m.userId,
          name: m.userName || 'Unknown Student',
          role: 'student',
        } as any;
      });
    } else {
      // Fallback: If no student members are synced, filter local users based on teacher assignment
      if (currentTeacherId) {
        const classes = getAllClasses();
        const assignments = getAssignmentsForTeacher(currentTeacherId);
        const teacherClassIds = new Set<string>();
        classes.filter(c => c.classTeacherId === currentTeacherId).forEach(c => teacherClassIds.add(c.id));
        assignments.forEach(a => teacherClassIds.add(a.classId));
        usersInScope = usersInScope.filter(u => u.role === 'student' && u.classId && teacherClassIds.has(u.classId));
      } else {
        // No institution members and no teacher context — don't show cross-school data
        usersInScope = [];
      }
    }

    // Filter by Teacher
    if (selectedTeacherId !== 'all') {
      const classes = getAllClasses();
      const assignments = getAssignmentsForTeacher(selectedTeacherId);
      const teacherClassIds = new Set<string>();
      classes.filter(c => c.classTeacherId === selectedTeacherId).forEach(c => teacherClassIds.add(c.id));
      assignments.forEach(a => teacherClassIds.add(a.classId));
      usersInScope = usersInScope.filter(u => u.role === 'student' && u.classId && teacherClassIds.has(u.classId));
    }

    // Match assessments
    let relevantAssessments = allAssessments.filter(a => usersInScope.some(u => u.id === a.userId));

    // Filter by Date
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      relevantAssessments = relevantAssessments.filter(a => {
        if (!a.completedAt) return false;
        return new Date(a.completedAt).getTime() >= from;
      });
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime() + 86400000; // include end of day
      relevantAssessments = relevantAssessments.filter(a => {
        if (!a.completedAt) return false;
        return new Date(a.completedAt).getTime() <= to;
      });
    }

    return {
      users: usersInScope,
      assessments: relevantAssessments
    };
  }, [allUsers, allAssessments, approvedMemberIds, selectedTeacherId, dateFrom, dateTo, members.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const handleExportCSV = () => {
    const { users, assessments } = filteredData;

    // Build comprehensive CSV
    // We want to "involve everything"
    
    // Determine all possible keys from assessment scores for dynamic columns
    const scoreKeys = new Set<string>();
    assessments.forEach(a => {
      if (a.score) {
        Object.keys(a.score).forEach(k => scoreKeys.add(k));
      }
    });
    
    const dynamicHeaders = Array.from(scoreKeys).map(k => `Score_${k}`);

    const headers = [
      'Student_ID',
      'Student_Name',
      'Student_Email',
      'Student_Role',
      'Teacher_Name',
      'Teacher_Email',
      'Assessment_ID',
      'Assessment_Type',
      'Completed_At',
      'Overall_Score',
      ...dynamicHeaders,
      'Raw_JSON_Score' // For "everything"
    ];

    const rows = assessments.map(a => {
      const student = users.find(u => u.id === a.userId);
      const studentClass = student?.classId ? getAllClasses().find(c => c.id === student.classId) : null;
      const teacher = studentClass ? teachers.find(t => t.id === studentClass.classTeacherId) : null;
      
      const row = [
        student?.id || a.userId,
        student?.name || 'Unknown',
        student?.email || '',
        student?.role || '',
        studentClass?.name || 'Unassigned',
        teacher?.name || 'Unassigned',
        a.id,
        a.type,
        a.completedAt || '',
        typeof a.score === 'number' ? a.score : (a.score?.overall || '')
      ];
      dynamicHeaders.forEach(dh => {
        const key = dh.replace('Score_', '');
        row.push(a.score && typeof a.score === 'object' && a.score[key] !== undefined ? String(a.score[key]) : '');
      });
      row.push(a.score ? JSON.stringify(a.score).replace(/,/g, ';') : '');
      return row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `JotMinds_Institution_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
          <CardDescription>Filter data before generating or exporting your report.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {!currentTeacherId && (
              <div>
                <Label>Teacher</Label>
                <select 
                  className="w-full mt-1 border rounded-md p-2 h-10 bg-white"
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                >
                  <option value="all">All Teachers</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <Label>Start Date</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="mt-1" />
            </div>
            <div className="flex items-end">
              <Button className="w-full h-10" style={{ backgroundColor: '#1E8A6E' }} onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Search className="h-5 w-5" />
            Report Preview
          </CardTitle>
          <CardDescription>
            Showing {filteredData.assessments.length} assessments across {filteredData.users.length} students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredData.assessments.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No assessment data found for the selected filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-600 font-semibold border-b">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Student</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Teacher</th>
                    <th className="p-3">Assessment Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-white">
                  {filteredData.assessments.slice(0, 50).map(a => {
                    const student = filteredData.users.find(u => u.id === a.userId);
                    const studentClass = student?.classId ? getAllClasses().find(c => c.id === student.classId) : null;
                    const teacher = studentClass ? teachers.find(t => t.id === studentClass.classTeacherId) : null;
                    return (
                      <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 text-gray-500 whitespace-nowrap">
                          {a.completedAt ? new Date(a.completedAt).toLocaleDateString() : 'Unknown'}
                        </td>
                        <td className="p-3 font-medium text-gray-900">{student?.name || 'Unknown Student'}</td>
                        <td className="p-3 text-gray-600">{studentClass?.name || 'Unassigned'}</td>
                        <td className="p-3 text-gray-600">{teacher?.name || 'Unassigned'}</td>
                        <td className="p-3 text-gray-600 capitalize">{a.type?.replace(/-/g, ' ') || 'Unknown'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredData.assessments.length > 50 && (
                <div className="p-3 text-center text-sm text-gray-500 bg-gray-50 border-t">
                  Showing first 50 results. Export CSV to view all.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
