import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { BarChart3, Users, User as UserIcon, Save, CheckCircle2, ClipboardList, Download } from 'lucide-react';
import { toast } from 'sonner';
import { updateMemberDetails } from '../../utils/institution';
import { getAllAssessmentResults } from '../../utils/api';
import { normalizeServerResults } from '../../utils/assessmentApi';
import { generatePDF } from '../../utils/pdfGenerator';
import { saveUser, getAssessmentsByUserId, getAllClasses, getAssignmentsForTeacher } from '../../utils/storage';
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
  const [activeTab, setActiveTab] = useState<'profile' | 'performance' | 'assessments'>('profile');
  const [isSaving, setIsSaving] = useState(false);

  const classes = getAllClasses();
  const assignments = getAssignmentsForTeacher(teacher.id);
  const teacherClassIds = new Set<string>();
  classes.filter(c => c.classTeacherId === teacher.id).forEach(c => teacherClassIds.add(c.id));
  assignments.forEach(a => teacherClassIds.add(a.classId));
  
  // Find students assigned to this teacher via class assignments, teacherId link, or institution membership
  const students = allPlatformUsers.filter(u => {
    if (u.role !== 'student') return false;
    // Match via class assignment (localStorage classes)
    if (u.classId && teacherClassIds.has(u.classId)) return true;
    // Match via direct teacher link
    if (u.teacherId === teacher.id) return true;
    // Match via linked teachers
    if (u.linkedTeachers && Array.isArray(u.linkedTeachers) && u.linkedTeachers.includes(teacher.id)) return true;
    return false;
  });

  const [editName, setEditName] = useState(teacher.name || '');
  const [editPhone, setEditPhone] = useState(teacher.phone || '');
  
  // Sync state when teacher changes
  React.useEffect(() => {
    if (teacher) {
      setEditName(teacher.name || '');
      setEditPhone(teacher.phone || '');
    }
  }, [teacher.id]);

  const [teacherAssessments, setTeacherAssessments] = useState<any[]>([]);
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(false);

  React.useEffect(() => {
    const fetchAssessments = async () => {
      setIsLoadingAssessments(true);
      try {
        const response = await getAllAssessmentResults([teacher.id]);
        if (response && Array.isArray(response.results)) {
          // Normalize raw API records so that `type` and `score` fields match the expected shape
          const normalized = normalizeServerResults(response.results);
          setTeacherAssessments(normalized);
        } else if (Array.isArray(response)) {
          const normalized = normalizeServerResults(response);
          setTeacherAssessments(normalized);
        } else {
          setTeacherAssessments(getAssessmentsByUserId(teacher.id) || []);
        }
      } catch (err) {
        console.error('Failed to load teacher assessments:', err);
        setTeacherAssessments(getAssessmentsByUserId(teacher.id) || []);
      } finally {
        setIsLoadingAssessments(false);
      }
    };
    fetchAssessments();
  }, [teacher.id]);

  const teachingStyleAssmt = teacherAssessments.find((a: any) => a.type === 'teaching-style');

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
                      {Math.round(students.filter((s: any) => getAssessmentsByUserId(s.id).filter((a: any) => a.completedAt).length > 0).length / students.length * 100)}%
                    </p>
                    <p className="text-xs text-gray-500">Assessment Completion</p>
                  </div>
                  <div className="bg-white border rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-amber-500">
                      {students.filter((s: any) => getAssessmentsByUserId(s.id).filter((a: any) => a.completedAt).length === 0).length}
                    </p>
                    <p className="text-xs text-gray-500">Need Attention</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-lg text-sm text-gray-500 border border-gray-200 text-center">
                  No students are currently assigned to this teacher's classes.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ASSESSMENTS TAB */}
        {activeTab === 'assessments' && (
          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#6B4C9A]" /> Assessment History
            </h4>
            
            {isLoadingAssessments ? (
              <div className="text-center py-8 text-gray-500 text-sm border rounded-lg bg-gray-50">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6B4C9A] mx-auto mb-2"></div>
                Loading assessments...
              </div>
            ) : !teacherAssessments || teacherAssessments.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm border rounded-lg bg-gray-50">
                This teacher has not completed any assessments yet.
              </div>
            ) : (
              <div className="space-y-3">
                {teacherAssessments.map((assmt: any, index: number) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-semibold text-gray-900 capitalize">
                          {assmt.type?.replace('-', ' ') || 'Unknown'}
                        </h5>
                        <p className="text-xs text-gray-500">
                          {assmt.completedAt ? new Date(assmt.completedAt).toLocaleDateString() : 'Unknown Date'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">
                          Completed
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-xs flex items-center gap-1"
                          onClick={async () => {
                            toast.loading('Generating report...', { id: 'pdf-gen' });
                            try {
                              await generatePDF(assmt, teacher.name, null, true);
                              toast.success('Report downloaded', { id: 'pdf-gen' });
                            } catch (error) {
                              toast.error('Failed to generate report', { id: 'pdf-gen' });
                            }
                          }}
                        >
                          <Download className="w-3 h-3" />
                          Export PDF
                        </Button>
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
                          <div className="space-y-1">
                            {(() => {
                              const scoreData = assmt.score[assmt.type] || assmt.score;
                              const dominantStyle = scoreData?.dominantStyle || scoreData?.style || scoreData?.primaryStyle;
                              const percentages = scoreData?.percentages || scoreData?.scores;
                              
                              return (
                                <>
                                  {dominantStyle && (
                                    <div><span className="text-gray-500">Dominant Style:</span> <span className="capitalize font-medium">{dominantStyle}</span></div>
                                  )}
                                  {percentages && typeof percentages === 'object' && Object.keys(percentages).length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {Object.entries(percentages).map(([k, v]) => (
                                        typeof v === 'number' && !k.toLowerCase().includes('timestamp') ? (
                                          <span key={k} className="text-xs bg-white border border-gray-200 shadow-sm px-2 py-1 rounded capitalize text-gray-700">
                                            {k}: {v}{k === 'timestamp' ? '' : (scoreData?.percentages ? '%' : '')}
                                          </span>
                                        ) : null
                                      ))}
                                    </div>
                                  )}
                                  {!dominantStyle && (!percentages || typeof percentages !== 'object' || Object.keys(percentages).length === 0) && (
                                    <div className="text-gray-500 italic">Scores recorded. Click 'Export PDF' for full details.</div>
                                  )}
                                </>
                              );
                            })()}
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
