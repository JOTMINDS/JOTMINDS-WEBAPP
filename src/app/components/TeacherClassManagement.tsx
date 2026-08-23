import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { School, Plus, Loader, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Class, User } from '../types';
import { getAllClasses, saveClass, deleteClass, getAllUsers, saveUser, isStudentConnectedToTeacher } from '../utils/storage';
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

  // Student Management
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [activeStudentClassId, setActiveStudentClassId] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

  const loadData = () => {
    const allClasses = getAllClasses();
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
    
    setIsCreating(true);
    try {
      const newClass: Class = {
        id: `cls_${Date.now()}`,
        name: newClassName,
        academicYear: newAcademicYear,
        classTeacherId: teacher.id,
        institutionId: teacher.institutionId || undefined,
        studentCount: 0,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      saveClass(newClass);
      toast.success('Class created and is pending approval from school admin');
      setNewClassName('');
      loadData();
    } catch (error) {
      toast.error('Failed to create class');
    } finally {
      setIsCreating(false);
    }
  };

  const handleManageStudents = (classId: string) => {
    setActiveStudentClassId(classId);
    const assigned = new Set(students.filter(s => s.classId === classId).map(s => s.id));
    setSelectedStudents(assigned);
    setIsStudentModalOpen(true);
  };

  const handleSaveStudents = () => {
    if (!activeStudentClassId) return;

    let studentCount = 0;
    for (const student of students) {
      const isSelected = selectedStudents.has(student.id);
      if (isSelected && student.classId !== activeStudentClassId) {
        saveUser({ ...student, classId: activeStudentClassId });
        studentCount++;
      } else if (!isSelected && student.classId === activeStudentClassId) {
        saveUser({ ...student, classId: undefined });
      } else if (isSelected && student.classId === activeStudentClassId) {
        studentCount++;
      }
    }
    
    // Update class student count
    const activeClass = classes.find(c => c.id === activeStudentClassId);
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
          Create and manage your classes. New classes must be approved by your school admin before students can join them.
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
              <Button 
                onClick={handleCreateClass}
                disabled={isCreating || !newClassName.trim()}
                className="w-full bg-[#1E8A6E] hover:bg-[#156e57]"
              >
                {isCreating ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Create Class
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xl font-semibold">Your Classes</h3>
          {classes.length === 0 ? (
            <Card className="bg-gray-50 border-dashed">
              <CardContent className="p-8 text-center text-gray-500">
                You haven't created any classes yet. Use the form to create your first class.
              </CardContent>
            </Card>
          ) : (
            classes.map(cls => (
              <Card key={cls.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-4 bg-white">
                    <div>
                      <h4 className="font-bold text-lg">{cls.name}</h4>
                      <p className="text-sm text-gray-500">Academic Year: {cls.academicYear}</p>
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
            ))
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
