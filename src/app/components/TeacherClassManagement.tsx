import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { School, Plus, Loader, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Class, User, EducationLevel } from '../types';
import { getAllClasses, saveClass, deleteClass, getAllUsers, saveUser, isStudentConnectedToTeacher } from '../utils/storage';
import { assignMemberToClass, fetchInstitutionClassesAPI, saveInstitutionClassAPI } from '../utils/api';
import { toast } from 'sonner';

interface TeacherClassManagementProps {
  teacher: User;
  students?: User[];
}

export function TeacherClassManagement({ teacher, students: serverStudents = [] }: TeacherClassManagementProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newAcademicYear, setNewAcademicYear] = useState(new Date().getFullYear().toString());
  const [newEducationLevel, setNewEducationLevel] = useState<EducationLevel | ''>('');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  // Student Management
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [activeStudentClassId, setActiveStudentClassId] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

  const loadData = async () => {
    let allClasses = getAllClasses();
    try {
      const response = await fetchInstitutionClassesAPI(teacher.institutionId);
      if (response && response.success && response.classes) {
        // Merge local and server classes
        const mergedClasses = new Map();
        allClasses.forEach(c => mergedClasses.set(c.id, c));
        response.classes.forEach((c: any) => mergedClasses.set(c.id, c));
        allClasses = Array.from(mergedClasses.values());
      }
    } catch (err) {
      console.error("Failed to load classes from server", err);
    }

    const teacherClasses = allClasses.filter(c => c.classTeacherId === teacher.id);
    setClasses(teacherClasses);
    
    // Load students that the teacher can manage
    const allUsers = getAllUsers();
    const teacherClassIds = new Set(teacherClasses.map(c => c.id));
    const managedStudents = allUsers.filter(u => u.role === 'student' && isStudentConnectedToTeacher(u, teacher, teacherClassIds));
    
    // Merge server students
    const mergedStudentsMap = new Map();
    managedStudents.forEach(stu => mergedStudentsMap.set(stu.id, stu));
    serverStudents.forEach(stu => mergedStudentsMap.set(stu.id, stu));
    
    setStudents(Array.from(mergedStudentsMap.values()));
  };

  useEffect(() => {
    loadData();
  }, [teacher.id, serverStudents]);

  const handleCreateClass = async () => {
    if (!newClassName.trim()) {
      toast.error('Class name is required');
      return;
    }
    if (!newEducationLevel) {
      toast.error('Please select an education level for this class');
      return;
    }
    
    setIsCreating(true);
    
    const newClass: Class = {
      id: `cls_${Date.now()}`,
      name: newClassName,
      academicYear: newAcademicYear,
      educationLevel: newEducationLevel,
      classTeacherId: teacher.id,
      institutionId: teacher.institutionId,
      studentCount: 0,
      createdAt: new Date().toISOString(),
      status: 'approved' // Auto-approve classes created by teachers (Revised system)
    };

    saveClass(newClass);
    
    try {
      await saveInstitutionClassAPI(newClass);
      toast.success('Class created successfully! Waiting for admin approval.');
    } catch (err) {
      console.error("Failed to sync class to server", err);
      toast.error('Class saved locally, but failed to sync with server.');
    }
    
    setNewClassName('');
    setNewEducationLevel('');
    setIsCreating(false);
    await loadData();
  };

  const handleManageStudents = (classId: string) => {
    setActiveStudentClassId(classId);
    const assigned = new Set(students.filter(s => s.classId === classId).map(s => s.id));
    setSelectedStudents(assigned);
    setIsStudentModalOpen(true);
  };

  const handleSaveStudents = async () => {
    if (!activeStudentClassId) return;

    const activeClass = classes.find(c => c.id === activeStudentClassId);
    let studentCount = 0;
    
    for (const student of students) {
      const isSelected = selectedStudents.has(student.id);
      if (isSelected && student.classId !== activeStudentClassId) {
        saveUser({ ...student, classId: activeStudentClassId, className: activeClass?.name });
        studentCount++;
        
        try {
          await assignMemberToClass({
            userId: student.id,
            classId: activeStudentClassId,
            className: activeClass?.name || '',
            role: 'student',
            institutionId: teacher.institutionId
          });
        } catch (err) {
          console.error("Failed to assign student to class", err);
        }
      } else if (!isSelected && student.classId === activeStudentClassId) {
        saveUser({ ...student, classId: undefined, className: undefined });
        
        try {
          await assignMemberToClass({
            userId: student.id,
            classId: '',
            className: '',
            role: 'student',
            institutionId: teacher.institutionId
          });
        } catch (err) {
          console.error("Failed to unassign student from class", err);
        }
      } else if (isSelected && student.classId === activeStudentClassId) {
        studentCount++;
      }
    }
    
    // Update class student count
    if (activeClass) {
      saveClass({ ...activeClass, studentCount });
    }

    setIsStudentModalOpen(false);
    loadData();
    toast.success('Students updated successfully');
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#1E8A6E] to-[#156e57] rounded-2xl p-6 text-white shadow-md">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <School className="w-6 h-6" /> Class Management
        </h2>
        <p className="text-white/80 mt-1">
          Create and manage your classes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Create New Class</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Class Name</label>
                <Input 
                  placeholder="e.g. 5th Grade Science"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  disabled={isCreating}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Academic Year</label>
                <Input 
                  value={newAcademicYear}
                  onChange={(e) => setNewAcademicYear(e.target.value)}
                  disabled={isCreating}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Education Level <span className="text-red-500">*</span></label>
                <Select value={newEducationLevel} onValueChange={(v) => setNewEducationLevel(v as EducationLevel)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select level..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Early Years">Early Years (Kindergarten / Nursery)</SelectItem>
                    <SelectItem value="Primary">Primary / Elementary (Basic 1-6)</SelectItem>
                    <SelectItem value="JHS">Junior High School (JHS 1-3)</SelectItem>
                    <SelectItem value="SHS">Senior High School (SHS 1-3)</SelectItem>
                    <SelectItem value="Tertiary">Tertiary (University/College)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleCreateClass}
                disabled={isCreating || !newClassName.trim() || !newEducationLevel}
                className="w-full bg-[#1E8A6E] hover:bg-[#156e57]"
              >
                {isCreating ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Create Class
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xl font-semibold">Your Classes</h3>
            <span className="text-xs text-slate-500">{classes.length} total classes</span>
          </div>

          {/* Educational Level Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 pb-1">
            {[
              { id: 'all', label: 'All Levels' },
              { id: 'Early Years', label: 'Early Years', aliases: ['Early Years', 'Nursery', 'Kindergarten'] },
              { id: 'Primary', label: 'Primary / Elementary', aliases: ['Primary', 'Elementary'] },
              { id: 'JHS', label: 'Junior High (JHS)', aliases: ['JHS'] },
              { id: 'SHS', label: 'Senior High (SHS)', aliases: ['SHS'] },
              { id: 'Tertiary', label: 'Tertiary', aliases: ['Tertiary'] },
            ].map((lvl) => {
              const count = lvl.id === 'all'
                ? classes.length
                : classes.filter(c => lvl.aliases?.includes(c.educationLevel || (c as any).level || '')).length;
              return (
                <button
                  key={lvl.id}
                  onClick={() => setLevelFilter(lvl.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    levelFilter === lvl.id
                      ? 'bg-[#1E8A6E] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{lvl.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    levelFilter === lvl.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {classes.length === 0 ? (
            <Card className="bg-gray-50 border-dashed">
              <CardContent className="p-8 text-center text-gray-500">
                You haven't created any classes yet. Use the form to create your first class.
              </CardContent>
            </Card>
          ) : (
            (() => {
              const filteredClasses = levelFilter === 'all'
                ? classes
                : classes.filter(c => {
                    if (levelFilter === 'Early Years') return ['Early Years', 'Nursery', 'Kindergarten'].includes(c.educationLevel || '');
                    if (levelFilter === 'Primary') return ['Primary', 'Elementary'].includes(c.educationLevel || '');
                    if (levelFilter === 'JHS') return c.educationLevel === 'JHS';
                    if (levelFilter === 'SHS') return c.educationLevel === 'SHS';
                    if (levelFilter === 'Tertiary') return c.educationLevel === 'Tertiary';
                    return true;
                  });

              if (filteredClasses.length === 0) {
                return (
                  <Card className="bg-gray-50 border-dashed">
                    <CardContent className="p-8 text-center text-gray-500">
                      No classes found in the <strong>{levelFilter}</strong> level.
                    </CardContent>
                  </Card>
                );
              }

              // Group classes by educational level
              const levelGroups: Record<string, typeof filteredClasses> = {};
              filteredClasses.forEach(c => {
                let groupKey = 'Primary / Elementary';
                const lvl = c.educationLevel || '';
                if (['Early Years', 'Nursery', 'Kindergarten'].includes(lvl)) groupKey = 'Early Years';
                else if (['Primary', 'Elementary'].includes(lvl)) groupKey = 'Primary / Elementary';
                else if (lvl === 'JHS') groupKey = 'Junior High School (JHS)';
                else if (lvl === 'SHS') groupKey = 'Senior High School (SHS)';
                else if (lvl === 'Tertiary') groupKey = 'Tertiary';
                else groupKey = 'General / Other';

                if (!levelGroups[groupKey]) levelGroups[groupKey] = [];
                levelGroups[groupKey].push(c);
              });

              const levelBadgeColors: Record<string, string> = {
                'Early Years': 'bg-pink-100 text-pink-800 border-pink-200',
                'Primary / Elementary': 'bg-emerald-100 text-emerald-800 border-emerald-200',
                'Junior High School (JHS)': 'bg-blue-100 text-blue-800 border-blue-200',
                'Senior High School (SHS)': 'bg-purple-100 text-purple-800 border-purple-200',
                'Tertiary': 'bg-amber-100 text-amber-800 border-amber-200',
                'General / Other': 'bg-slate-100 text-slate-800 border-slate-200'
              };

              return Object.entries(levelGroups).map(([groupTitle, groupClasses]) => (
                <div key={groupTitle} className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 px-1 pt-1">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${levelBadgeColors[groupTitle] || 'bg-slate-100 text-slate-800'}`}>
                      {groupTitle}
                    </span>
                    <span className="text-xs text-slate-400">({groupClasses.length} {groupClasses.length === 1 ? 'class' : 'classes'})</span>
                  </div>

                  <div className="space-y-2.5">
                    {groupClasses.map(cls => (
                      <Card key={cls.id} className="overflow-hidden border hover:border-slate-300 transition-colors">
                        <CardContent className="p-0">
                          <div className="flex items-center justify-between p-4 bg-white">
                            <div>
                              <h4 className="font-bold text-lg">{cls.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-gray-500">Academic Year: {cls.academicYear}</p>
                                {cls.educationLevel ? (
                                  <Badge className="bg-slate-100 text-slate-800 border-slate-200 text-xs">
                                    {cls.educationLevel}
                                  </Badge>
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-500 border-gray-200 text-xs">
                                    No level set
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div>
                              {cls.status === 'pending' && (
                                <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                                  <Clock className="w-3 h-3 mr-1" /> Pending Approval
                                </Badge>
                              )}
                              {cls.status === 'approved' && (
                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
                                </Badge>
                              )}
                              {cls.status === 'rejected' && (
                                <Badge className="bg-red-100 text-red-800 border-red-200">
                                  <XCircle className="w-3 h-3 mr-1" /> Rejected
                                </Badge>
                              )}
                              {!cls.status && (
                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
                                </Badge>
                              )}
                            </div>
                          </div>
                          {cls.status === 'approved' && (
                            <div className="bg-gray-50 p-4 border-t text-sm text-gray-600 flex justify-between items-center">
                              <span>Students enrolled: {cls.studentCount || 0}</span>
                              <Button variant="outline" size="sm" onClick={() => handleManageStudents(cls.id)}>Manage Students</Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ));
            })()
          )}
        </div>
      </div>

      {isStudentModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
            <h3 className="text-xl font-bold mb-4 flex-shrink-0">Assign Students</h3>
            <p className="text-sm text-gray-500 mb-4 flex-shrink-0">
              Select students to assign to this class. Note that selecting a student will remove them from their current class if they are already assigned elsewhere.
            </p>
            <div className="overflow-y-auto flex-1 border border-gray-200 rounded-lg p-4">
              {students.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No available students.</p>
              ) : (
                <div className="space-y-2">
                  {students.map(s => (
                    <label key={s.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-transparent hover:border-gray-100 transition-colors">
                      <input 
                        type="checkbox"
                        checked={selectedStudents.has(s.id)}
                        onChange={(e) => {
                          const newSet = new Set(selectedStudents);
                          if (e.target.checked) newSet.add(s.id);
                          else newSet.delete(s.id);
                          setSelectedStudents(newSet);
                        }}
                        className="rounded border-gray-300 text-[#1E8A6E] focus:ring-[#1E8A6E]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{s.name}</p>
                          {(s as any).studentCode && (
                            <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded uppercase border border-indigo-200 font-bold">
                              {(s as any).studentCode}
                            </span>
                          )}
                        </div>
                        {s.email && <p className="text-sm text-gray-500">{s.email}</p>}
                      </div>
                      {s.classId && s.classId !== activeStudentClassId && (
                        <span className="ml-auto text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                          Already in another class
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6 flex-shrink-0">
              <button 
                onClick={() => setIsStudentModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveStudents}
                className="px-4 py-2 bg-[#1E8A6E] text-white rounded-lg hover:bg-[#156e57]"
              >
                Save Assignments
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
