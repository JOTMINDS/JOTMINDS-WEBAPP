import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Users, Search, Filter, Eye, Download, CheckCircle2, 
  Clock, AlertCircle, Award, Sparkles, X, ChevronRight, User as UserIcon
} from 'lucide-react';
import { StudentCognitiveProfile } from '../utils/teacherIntelligence';
import { StudentDetailView } from './StudentDetailView';

interface CentralStudentManagementProps {
  students: any[];
  assessments: any[];
  teacher: any;
}

export function CentralStudentManagement({ students, assessments, teacher }: CentralStudentManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [assessmentFilter, setAssessmentFilter] = useState<'all' | 'complete' | 'incomplete'>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Extract unique classes
  const uniqueClasses = Array.from(new Set(students.map(s => s.className).filter(Boolean)));

  // Filter students based on criteria
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.email && student.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesClass = classFilter === 'all' || student.className === classFilter;

    const isComplete = student.hasCompletedAssessment;
    const matchesAssessment = 
      assessmentFilter === 'all' ||
      (assessmentFilter === 'complete' && isComplete) ||
      (assessmentFilter === 'incomplete' && !isComplete);

    return matchesSearch && matchesClass && matchesAssessment;
  });

  const completedCount = students.filter(s => s.hasCompletedAssessment).length;
  const completionRate = students.length > 0 ? Math.round((completedCount / students.length) * 100) : 0;

  // Selected student for detail view
  const selectedStudent = selectedStudentId 
    ? students.find(s => s.id === selectedStudentId) 
    : null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#5B7DB1] via-[#6B4C9A] to-[#1E8A6E] rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" /> Central Roster & Student Profiles
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Student Management Center</h2>
          <p className="text-white/80 text-xs md:text-sm mt-1">
            Manage your class roster, search individual learners, view cognitive profiles, and track assessment progress.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-center border border-white/20">
            <div className="text-xl font-bold">{students.length}</div>
            <div className="text-[10px] uppercase text-white/80">Total Students</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-center border border-white/20">
            <div className="text-xl font-bold text-emerald-300">{completionRate}%</div>
            <div className="text-[10px] uppercase text-white/80">Assessed</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-gray-200 dark:border-gray-800">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by student name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {uniqueClasses.length > 0 && (
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-[140px] text-xs h-9">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {uniqueClasses.map(cls => (
                      <SelectItem key={cls} value={cls as string}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => setAssessmentFilter('all')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    assessmentFilter === 'all'
                      ? 'bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-300 shadow-2xs'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  All ({students.length})
                </button>
                <button
                  onClick={() => setAssessmentFilter('complete')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    assessmentFilter === 'complete'
                      ? 'bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Assessed ({completedCount})
                </button>
                <button
                  onClick={() => setAssessmentFilter('incomplete')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    assessmentFilter === 'incomplete'
                      ? 'bg-white dark:bg-gray-700 text-amber-700 dark:text-amber-300 shadow-2xs'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Pending ({students.length - completedCount})
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Layout: Roster Table vs Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Roster Table */}
        <div className={selectedStudent ? 'lg:col-span-1' : 'lg:col-span-3'}>
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="py-3 px-4 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#6B4C9A]" /> Student Roster ({filteredStudents.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-xs">
                  No students found matching your criteria.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredStudents.map(student => {
                    const isSelected = selectedStudentId === student.id;

                    return (
                      <div
                        key={student.id}
                        onClick={() => setSelectedStudentId(student.id)}
                        className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-purple-50/80 dark:bg-purple-950/40 border-l-4 border-l-[#6B4C9A]'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5B7DB1] to-[#6B4C9A] flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate">
                              {student.name}
                            </h4>
                            <p className="text-[11px] text-gray-500 truncate">
                              {student.className || 'General'} {student.email ? `• ${student.email}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {student.hasCompletedAssessment ? (
                            <>
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] hidden sm:flex">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Assessed
                              </Badge>
                              {!isSelected && (
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-7 px-2 text-[10px] text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100 bg-emerald-50 border border-emerald-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedStudentId(student.id);
                                  }}
                                >
                                  View Profile
                                </Button>
                              )}
                            </>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                              <Clock className="w-3 h-3 mr-1" /> Pending
                            </Badge>
                          )}
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected Student Detail View */}
        {selectedStudent && (
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between bg-white dark:bg-gray-950 p-3 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-[#6B4C9A] text-[#6B4C9A]">
                  Student Cognitive Profile
                </Badge>
                <span className="font-bold text-sm text-gray-900 dark:text-white">{selectedStudent.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedStudentId(null)}
                className="h-7 w-7 p-0 text-gray-500"
                title="Close Student Profile"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <StudentDetailView
              students={students}
              assessments={assessments}
              initialStudentId={selectedStudent.id}
              teacher={teacher}
            />
          </div>
        )}
      </div>
    </div>
  );
}
