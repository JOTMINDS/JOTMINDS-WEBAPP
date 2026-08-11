import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { getAllUsers, saveUser, deleteUser, getAssessmentsByUserId, getAllClasses, getAssignmentsForTeacher, isStudentConnectedToTeacher } from '../utils/storage';
import { getStudentsForTeacher, updateUserProfile, inviteStudentToClass } from '../utils/api';
import { getInstitutionForMember, joinInstitution } from '../utils/institution';
import { getUserJotsCode } from '../utils/jotsCode';
import { projectId } from '../utils/supabase/info';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Users, UserPlus, Search, MoreVertical, Edit2, Trash2, 
  Mail, Phone, BookOpen, Star, AlertCircle, Loader, Shield, Lock,
  Plus, Upload, FileText, Download, Building2, Edit, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

interface TeacherStudentManagementProps {
  teacher: User;
  onViewReport?: (studentId: string) => void;
  isInstitutionAdmin?: boolean;
  institutionStudents?: User[];
}

export function TeacherStudentManagement({ teacher, onViewReport, isInstitutionAdmin, institutionStudents }: TeacherStudentManagementProps) {
  const [students, setStudents] = useState<User[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkClassId, setBulkClassId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [institutionId, setInstitutionId] = useState<string | null>(null);

  // Observation Modal State
  const [isObservationModalOpen, setIsObservationModalOpen] = useState(false);
  const [observationStudentId, setObservationStudentId] = useState('');
  const [observationData, setObservationData] = useState({ category: 'Academic', notes: '' });

  // Teacher Observation State
  const [observationStudent, setObservationStudent] = useState<User | null>(null);
  const [observationCategory, setObservationCategory] = useState<'Behavioral' | 'Academic' | 'Emotional' | 'Attention'>('Behavioral');
  const [observationNote, setObservationNote] = useState('');

  // Join Institution State
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ id: '', name: '', email: '', phone: '', dateOfBirth: '', classId: '' });
  const classes = getAllClasses();
  const assignments = getAssignmentsForTeacher(teacher.id);
  const myClasses = classes;

  useEffect(() => {
    loadStudents();

    // Fetch teacher's institution
    const fetchInstitution = async () => {
      try {
        const inst = await getInstitutionForMember(teacher.id);
        if (inst) {
          setInstitutionId(inst.id);
        }
      } catch (err) {
        console.error('Failed to load teacher institution:', err);
      }
    };
    fetchInstitution();
    
    // Auto-generate class code if not exists
    if (!teacher.classCode) {
      const generateCode = async () => {
        try {
          const newCode = 'CLASS-' + Math.random().toString(36).substring(2, 8).toUpperCase();
          teacher.classCode = newCode;
          saveUser(teacher); // Save to local storage
          await updateUserProfile({ classCode: newCode }); // Save to backend
        } catch (err) {
          console.error('Failed to generate class code:', err);
        }
      };
      generateCode();
    }
  }, [teacher.id]);

  const loadStudents = async () => {
    if (isInstitutionAdmin && institutionStudents) {
      setStudents(institutionStudents);
      return;
    }

    // 1. Fetch from server
    let serverStudents: User[] = [];
    try {
      const result = await getStudentsForTeacher();
      if (result.success && result.students) {
        serverStudents = result.students;
      }
    } catch (err) {
      console.error('Failed to fetch students from server:', err);
    }

    // 2. Fetch from local storage
    const all = getAllUsers();
    const teacherClassIds = new Set<string>();
    classes.filter(c => c.classTeacherId === teacher.id).forEach(c => teacherClassIds.add(c.id));
    assignments.forEach(a => teacherClassIds.add(a.classId));
    
    const localStudents = all.filter(u => isStudentConnectedToTeacher(u, teacher, teacherClassIds));

    // 3. Merge avoiding duplicates (server takes precedence)
    const mergedMap = new Map();
    localStudents.forEach(stu => mergedMap.set(stu.email?.toLowerCase() || stu.id, stu));
    serverStudents.forEach(stu => mergedMap.set(stu.email?.toLowerCase() || stu.id, stu));

    setStudents(Array.from(mergedMap.values()));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Create local user
      const newId = `usr_${Date.now()}`;
      const newStudent: User = {
        id: newId,
        role: 'student',
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        dateOfBirth: formData.dateOfBirth,
        classId: formData.classId,
        school: teacher.organizationName,
        organizationName: teacher.organizationName,
        organizationCode: teacher.organizationCode,
        createdAt: new Date().toISOString()
      };
      saveUser(newStudent);

      // 2. Send Invite Email via Edge Function
      await inviteStudentToClass({
          email: formData.email,
          studentName: formData.name,
          teacherName: isInstitutionAdmin ? (teacher.organizationName || 'School Admin') : teacher.name,
          schoolName: teacher.organizationName || '',
          teacherId: isInstitutionAdmin ? '' : teacher.id,
          institutionId: institutionId || undefined
      });

      toast.success('Student added and invite sent!');
      setIsAddModalOpen(false);
      setFormData({ id: '', name: '', email: '', phone: '', dateOfBirth: '', classId: '' });
      loadStudents();
    } catch (err) {
      console.error(err);
      toast.error('Student saved locally, but failed to send email invite.');
      loadStudents();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const all = getAllUsers();
    const existing = all.find(u => u.id === formData.id);
    if (existing) {
      const updated = { ...existing, ...formData };
      saveUser(updated);
      toast.success('Student updated!');
      setIsEditModalOpen(false);
      loadStudents();
    }
  };

  const handleRemove = (studentId: string) => {
    if (!window.confirm('Are you sure you want to completely delete this student account? This action cannot be undone.')) return;
    deleteUser(studentId);
    toast.success('Student account deleted.');
    loadStudents();
  };

  const handleObservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!observationData.notes.trim()) return;

    try {
      const existingStr = localStorage.getItem('jm_teacher_observations');
      const observations = existingStr ? JSON.parse(existingStr) : [];
      observations.push({
        id: `obs_${Date.now()}`,
        teacherId: teacher.id,
        studentId: observationStudentId,
        category: observationData.category,
        notes: observationData.notes,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('jm_teacher_observations', JSON.stringify(observations));
      toast.success('Observation logged and shared with parent!');
      setIsObservationModalOpen(false);
      setObservationData({ category: 'Academic', notes: '' });
    } catch (err) {
      toast.error('Failed to save observation.');
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!bulkClassId) {
      toast.error('Please select a class first.');
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        // skip header (name, email, phone, dateOfBirth)
        const newStudents: User[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const [name, email, phone, dateOfBirth] = line.split(',');
          if (name && email) {
            const newStudent: User = {
              id: `usr_${Date.now()}_${i}`,
              role: 'student',
              name: name.trim(),
              email: email.trim(),
              phone: phone?.trim() || '',
              dateOfBirth: dateOfBirth?.trim() || '',
              classId: bulkClassId,
              school: teacher.organizationName,
              createdAt: new Date().toISOString()
            };
            newStudents.push(newStudent);
            saveUser(newStudent);
          }
        }
        
        // Fire and forget emails for all imported students
        Promise.allSettled(newStudents.map(student => 
            inviteStudentToClass({
              email: student.email,
              studentName: student.name,
              teacherName: teacher.name,
              schoolName: teacher.organizationName || '',
              teacherId: teacher.id,
              institutionId: institutionId || undefined
            })
        )).catch(err => console.error("Batch email error", err));
        toast.success(`${newStudents.length} students imported successfully.`);
        setIsBulkModalOpen(false);
        loadStudents();
      } catch (err) {
        toast.error('Error parsing CSV file');
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleJoinInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    
    setIsJoining(true);
    try {
      await joinInstitution(joinCode.toUpperCase(), {
        userId: teacher.id,
        userName: teacher.name,
        userEmail: teacher.email,
        userPhone: teacher.phone,
        role: 'teacher'
      });
      
      toast.success('Access requested! Waiting for administrator approval.');
      
      // Update local teacher object to reflect pending state
      const updatedTeacher = { ...teacher, organizationCode: joinCode.toUpperCase() };
      saveUser(updatedTeacher);
      
      // Reload to refresh the auth context and dashboard state
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      toast.error(err.message || 'Failed to request access. Check the code and try again.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Class Code — for inviting students directly to this teacher's class */}
      {teacher.classCode && (
        <div className="rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap" style={{ background: 'linear-gradient(135deg, #1E8A6E, #10B981)' }}>
          <div className="text-white">
            <p className="text-xs text-white/70 mb-0.5">Your Class Code</p>
            <div className="text-xl tracking-widest font-mono font-bold">{teacher.classCode}</div>
            <p className="text-xs text-white/80 mt-1">Share this code with your students. They can enter it during sign-up to join your class.</p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(teacher.classCode!);
              toast.success('Class code copied to clipboard');
            }}
            className="bg-white/20 hover:bg-white/30 text-white text-xs px-4 py-2 rounded-lg border border-white/30 transition-colors flex items-center gap-2"
          >
            <Copy className="w-3.5 h-3.5" /> Copy Code
          </button>
        </div>
      )}

      {/* Jots Code — school linkage info for teacher */}
      {(() => {
        const jc = getUserJotsCode(teacher);
        if (!jc) return null;
        return (
          <div className="rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap" style={{ background: 'linear-gradient(135deg, #5B7DB1, #6B4C9A)' }}>
            <div className="text-white">
              <p className="text-xs text-white/70 mb-0.5">Your School Jots Code (Organisation Code)</p>
              <div className="text-xl tracking-widest">{jc}</div>
              <p className="text-xs text-white/60 mt-0.5">Your School administrator uses this code to view your teaching methods.</p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(jc)}
              className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg border border-white/30 transition-colors"
            >
              Copy Code
            </button>
          </div>
        );
      })()}

      {/* Join Institution Banner */}
      {!teacher.organizationCode && (
        <Card className="border-[#6B4C9A] bg-purple-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#6B4C9A]" />
              <CardTitle className="text-lg text-[#6B4C9A]">Join an Institution</CardTitle>
            </div>
            <CardDescription>
              Are you part of a school? Enter your Institution Code (Jots Code) to request access to your students.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinInstitution} className="flex gap-3 max-w-md">
              <Input 
                placeholder="Enter code (e.g. JOTM-XXXX)" 
                value={joinCode}
                onChange={e => setJoinCode(e.target.value)}
                className="bg-white uppercase"
                maxLength={12}
              />
              <Button type="submit" disabled={isJoining || !joinCode.trim()} style={{ backgroundColor: '#6B4C9A' }} className="whitespace-nowrap">
                {isJoining ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : 'Request Access'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Teacher Class Code display removed as per system-generated codes approach */}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">{isInstitutionAdmin ? 'All Students' : 'My Students'}</h2>
          <p className="text-muted-foreground">{isInstitutionAdmin ? 'Manage all students in the institution' : 'Manage your assigned students'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsBulkModalOpen(true)}>
            <Upload className="w-4 h-4 mr-2" /> Bulk Upload
          </Button>
          <Button onClick={() => {
            setFormData({ id: '', name: '', email: '', phone: '', dateOfBirth: '', classId: myClasses.length === 1 ? myClasses[0].id : '' });
            setIsAddModalOpen(true);
          }} style={{ backgroundColor: '#6B4C9A' }}>
            <Plus className="w-4 h-4 mr-2" /> Add Student
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Assessments</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map(student => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{student.name}</div>
                    {student.dateOfBirth && <div className="text-xs text-slate-500">DOB: {student.dateOfBirth}</div>}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">{student.email}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="outline" className="bg-slate-100/50">
                      {getAssessmentsByUserId(student.id).filter(a => a.completedAt).length} Completed
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                        onClick={() => onViewReport?.(student.id)}
                      >
                        <BookOpen className="w-3.5 h-3.5 mr-1" /> View
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-xs text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                        onClick={() => {
                          setObservationStudentId(student.id);
                          setIsObservationModalOpen(true);
                        }}
                      >
                        <MessageSquare className="w-3.5 h-3.5 mr-1" /> Log
                      </Button>
                      <div className="h-4 w-px bg-slate-200 mx-1"></div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                        setFormData({
                          id: student.id,
                          name: student.name,
                          email: student.email,
                          phone: student.phone || '',
                          dateOfBirth: student.dateOfBirth || '',
                          classId: student.classId || ''
                        });
                        setIsEditModalOpen(true);
                      }}>
                        <Edit className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50" onClick={() => handleRemove(student.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-red-400 hover:text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-10 h-10 text-slate-300 mb-3" />
                      <p>No students found. Add a student to get started.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Add New Student</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Phone (Optional)</label>
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Date of Birth</label>
                <Input type="date" required value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Assign to Class</label>
                <select
                  required
                  className="w-full mt-1 border rounded-md p-2 bg-white"
                  value={formData.classId}
                  onChange={e => setFormData({...formData, classId: e.target.value})}
                >
                  <option value="">-- Select Class --</option>
                  {myClasses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  style={{ backgroundColor: '#6B4C9A' }}
                  className="disabled:opacity-90 disabled:cursor-wait"
                >
                  {isLoading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {isLoading ? 'Sending...' : 'Add & Send Invite'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Edit Student</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  Date of Birth <Lock className="w-3 h-3" />
                </label>
                <Input type="date" disabled value={formData.dateOfBirth} className="bg-slate-50 text-slate-500 cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1">Locked to ensure COPPA compliance.</p>
              </div>
              <div>
                <label className="text-sm font-medium">Assign to Class</label>
                <select
                  required
                  className="w-full mt-1 border rounded-md p-2 bg-white"
                  value={formData.classId}
                  onChange={e => setFormData({...formData, classId: e.target.value})}
                >
                  <option value="">-- Select Class --</option>
                  {myClasses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button type="submit" style={{ backgroundColor: '#6B4C9A' }}>Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-2">Bulk Upload Students</h3>
            <p className="text-sm text-gray-500 mb-4">Upload a CSV file containing your student roster.</p>
            
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">Assign to Class</label>
              <select
                className="w-full mt-1 border rounded-md p-2 bg-white"
                value={bulkClassId}
                onChange={e => setBulkClassId(e.target.value)}
              >
                <option value="">-- Select Class --</option>
                {myClasses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium mb-1">Expected Format:</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded">
                Name, Email, Phone, DateOfBirth{'\n'}
                John Doe, john@example.com, 1234567890, 2010-05-15
              </pre>
            </div>

            <div className="flex justify-between items-center mb-6">
              <Button variant="outline" size="sm" onClick={() => {
                const csvContent = "Name,Email,Phone,DateOfBirth\nStudent Name,student@example.com,,2010-01-01";
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'students_template.csv';
                a.click();
              }}>
                <Download className="w-4 h-4 mr-2" /> Download Template
              </Button>
            </div>

            <div className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center ${!bulkClassId ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <Input type="file" accept=".csv" className="hidden" id="csv-upload" onChange={handleBulkUpload} disabled={isLoading || !bulkClassId} />
              <label htmlFor="csv-upload" className={`flex flex-col items-center ${!bulkClassId ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 font-medium">Click to upload CSV</span>
                <span className="text-xs text-gray-400 mt-1">Maximum 500 rows</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-6">
              <Button type="button" variant="ghost" onClick={() => setIsBulkModalOpen(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Observation Modal */}
      {observationStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold">Log Observation</h3>
                <p className="text-xs text-gray-500">Student: {observationStudent.name}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setObservationStudent(null)}>✕</Button>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Category</label>
              <select
                className="w-full border rounded-md p-2 text-sm bg-white"
                value={observationCategory}
                onChange={e => setObservationCategory(e.target.value as any)}
              >
                <option value="Behavioral">Behavioral</option>
                <option value="Academic">Academic</option>
                <option value="Emotional">Emotional</option>
                <option value="Attention">Attention / Focus</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Observation Details</label>
              <textarea
                className="w-full border rounded-md p-2 text-sm min-h-[100px]"
                placeholder="Describe your classroom observation or concern for the parent..."
                value={observationNote}
                onChange={e => setObservationNote(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setObservationStudent(null)}>Cancel</Button>
              <Button
                className="bg-[#2C2E83] hover:bg-[#2C2E83]/90 text-white"
                disabled={!observationNote.trim()}
                onClick={() => {
                  try {
                    const existing = JSON.parse(localStorage.getItem('jm_teacher_observations') || '[]');
                    const newObs = {
                      id: `obs_${Date.now()}`,
                      teacherId: teacher.id,
                      teacherName: teacher.name,
                      studentId: observationStudent.id,
                      studentName: observationStudent.name,
                      category: observationCategory,
                      note: observationNote,
                      createdAt: new Date().toISOString(),
                    };
                    localStorage.setItem('jm_teacher_observations', JSON.stringify([newObs, ...existing]));
                    toast.success(`Observation logged for ${observationStudent.name}!`);
                    setObservationStudent(null);
                  } catch (e) {
                    console.error('Error saving observation', e);
                    toast.error('Failed to log observation.');
                  }
                }}
              >
                Submit Observation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
