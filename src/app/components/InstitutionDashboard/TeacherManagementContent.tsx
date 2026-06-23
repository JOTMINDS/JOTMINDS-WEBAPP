import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { BarChart3, Users, User as UserIcon, Save, CheckCircle2, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { updateMemberDetails } from '../../utils/institution';
import { saveUser, getAssessmentsByUserId } from '../../utils/storage';
import { User } from '../../types';

interface TeacherManagementContentProps {
  teacher: User;
  institutionId?: string;
  allPlatformUsers: any[];
  onRefresh: () => Promise<void>;
}

export function TeacherManagementContent({
  teacher,
  institutionId,
  allPlatformUsers,
  onRefresh
}: TeacherManagementContentProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'students' | 'performance' | 'assessments'>('profile');
  const [isSaving, setIsSaving] = useState(false);

  const students = allPlatformUsers.filter(u => u.role === 'student' && u.teacherId === teacher.id);
  // We show all students in the institution
  const allInstitutionStudents = allPlatformUsers.filter(u => u.role === 'student' && u.school === teacher.school);

  const [editName, setEditName] = useState(teacher.name || '');
  const [editPhone, setEditPhone] = useState(teacher.phone || '');
  
  // Keep track of which students are assigned in the UI before saving
  const [assignedStudentIds, setAssignedStudentIds] = useState<Set<string>>(
    new Set(students.map(s => s.id))
  );

  // Sync state when teacher changes
  React.useEffect(() => {
    if (teacher) {
      setEditName(teacher.name || '');
      setEditPhone(teacher.phone || '');
      setAssignedStudentIds(new Set(allPlatformUsers.filter(u => u.role === 'student' && u.teacherId === teacher.id).map(s => s.id)));
    }
  }, [teacher.id]);

  const teachingStyleAssmt = teacher.assessmentsCompleted?.includes('teaching-style')
    ? teacher.assessments?.find((a: any) => a.type === 'teaching-style')
    : null;

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      toast.error('Name is required');
      return;
    }
    
    setIsSaving(true);
    try {
      if (institutionId) {
        await updateMemberDetails(institutionId, teacher.id, {
          userName: editName,
          userPhone: editPhone
        });
      }
      
      const updatedTeacher = {
        ...teacher,
        name: editName,
        phone: editPhone
      };
      saveUser(updatedTeacher);
      
      await onRefresh();
      toast.success('Teacher profile updated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update teacher profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveStudents = async () => {
    setIsSaving(true);
    try {
      let changes = 0;
      
      // We need to update students who were added to this teacher, and students who were removed.
      allInstitutionStudents.forEach(student => {
        const isSelected = assignedStudentIds.has(student.id);
        const wasAssigned = student.teacherId === teacher.id;
        
        if (isSelected && !wasAssigned) {
          saveUser({ ...student, teacherId: teacher.id });
          changes++;
        } else if (!isSelected && wasAssigned) {
          // Unassign them by removing teacherId
          const updatedStudent = { ...student };
          delete updatedStudent.teacherId;
          saveUser(updatedStudent);
          changes++;
        }
      });
      
      if (changes > 0) {
        await onRefresh();
        toast.success(`Updated assignments for ${changes} student(s)`);
      } else {
        toast.info('No changes to save');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update student assignments');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStudent = (studentId: string) => {
    const next = new Set(assignedStudentIds);
    if (next.has(studentId)) {
      next.delete(studentId);
    } else {
      next.add(studentId);
    }
    setAssignedStudentIds(next);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'profile' ? 'border-[#6B4C9A] text-[#6B4C9A]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <UserIcon className="w-4 h-4" /> Profile
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'students' ? 'border-[#6B4C9A] text-[#6B4C9A]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Users className="w-4 h-4" /> Students
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'performance' ? 'border-[#6B4C9A] text-[#6B4C9A]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Performance
        </button>
        <button
          onClick={() => setActiveTab('assessments')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'assessments' ? 'border-[#6B4C9A] text-[#6B4C9A]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <ClipboardList className="w-4 h-4" /> Assessments
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        
        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Personal Details</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Email Address (Read-only)</label>
                  <Input value={teacher.email} disabled className="bg-gray-50 text-gray-500" />
                  <p className="text-xs text-gray-500 mt-1">Teachers must verify their own email changes.</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Phone Number</label>
                  <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                </div>
              </div>
              <div className="mt-5 flex justify-end">
                <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-[#6B4C9A] hover:bg-[#5a3f81] text-white gap-2">
                  <Save className="w-4 h-4" /> Save Profile
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STUDENTS TAB */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-lg border border-gray-200 flex-1">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-semibold text-gray-900">Assigned Students ({assignedStudentIds.size})</h4>
                <Button onClick={handleSaveStudents} disabled={isSaving} size="sm" className="bg-[#1E8A6E] hover:bg-[#18725b] text-white gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Save Assignments
                </Button>
              </div>
              
              {allInstitutionStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm border rounded-lg bg-gray-50">
                  No students found in this institution.
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden divide-y max-h-80 overflow-y-auto">
                  {allInstitutionStudents.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors bg-white">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                      <Button 
                        variant={assignedStudentIds.has(student.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleStudent(student.id)}
                        className={assignedStudentIds.has(student.id) ? "bg-[#1E8A6E] hover:bg-[#18725b] text-white" : "text-gray-600"}
                      >
                        {assignedStudentIds.has(student.id) ? "Assigned" : "Assign"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PERFORMANCE TAB */}
        {activeTab === 'performance' && (
          <div className="space-y-5">
            {/* Teaching Style Profile */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#6B4C9A]" /> Teaching Style Profile
              </h4>
              {teachingStyleAssmt && teachingStyleAssmt.score && 'teaching-style' in teachingStyleAssmt.score ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 border border-purple-100 p-4 rounded-lg">
                    <p className="text-xs text-purple-600 font-medium mb-1">Primary Style</p>
                    <p className="font-semibold text-purple-900">{teachingStyleAssmt.score['teaching-style'].primaryStyle}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium mb-1">Secondary Style</p>
                    <p className="font-semibold text-blue-900">{teachingStyleAssmt.score['teaching-style'].secondaryStyle}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-lg text-sm text-gray-500 border border-gray-200 text-center">
                  This teacher has not yet completed their teaching style assessment.
                </div>
              )}
            </div>

            {/* Student Metrics */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1E8A6E]" /> Assigned Students ({students.length})
              </h4>
              {students.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white border rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-[#1E8A6E]">{students.length}</p>
                    <p className="text-xs text-gray-500">Total Students</p>
                  </div>
                  <div className="bg-white border rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-[#5B7DB1]">
                      {Math.round(students.filter((s: any) => s.assessmentsCompleted && s.assessmentsCompleted.length > 0).length / students.length * 100)}%
                    </p>
                    <p className="text-xs text-gray-500">Assessment Completion</p>
                  </div>
                  <div className="bg-white border rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-amber-500">
                      {students.filter((s: any) => !s.assessmentsCompleted || s.assessmentsCompleted.length === 0).length}
                    </p>
                    <p className="text-xs text-gray-500">Need Attention</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-lg text-sm text-gray-500 border border-gray-200 text-center">
                  No students are currently assigned to this teacher. Use the Students tab to assign them.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ASSESSMENTS TAB */}
        {activeTab === 'assessments' && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#6B4C9A]" /> Assessment History
            </h4>
            
            {!teacher.assessments || teacher.assessments.length === 0 ? (
              <div className="bg-white p-6 rounded-lg text-sm text-gray-500 border border-gray-200 text-center">
                This teacher has not completed any assessments yet.
              </div>
            ) : (
              <div className="space-y-3">
                {teacher.assessments.map((assmt: any, index: number) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-semibold text-gray-900 capitalize">
                          {assmt.type.replace('-', ' ')}
                        </h5>
                        <p className="text-xs text-gray-500">
                          {assmt.completedAt ? new Date(assmt.completedAt).toLocaleDateString() : 'Unknown Date'}
                        </p>
                      </div>
                      <div className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">
                        Completed
                      </div>
                    </div>
                    
                    {/* Render score details depending on the type */}
                    {assmt.score && (
                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                        {assmt.type === 'teaching-style' ? (
                          <div className="grid grid-cols-2 gap-2">
                            <div><span className="text-gray-500">Primary:</span> {assmt.score['teaching-style']?.primaryStyle || 'N/A'}</div>
                            <div><span className="text-gray-500">Secondary:</span> {assmt.score['teaching-style']?.secondaryStyle || 'N/A'}</div>
                          </div>
                        ) : (
                          <div>
                            <span className="text-gray-500">Score:</span> {JSON.stringify(assmt.score)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
