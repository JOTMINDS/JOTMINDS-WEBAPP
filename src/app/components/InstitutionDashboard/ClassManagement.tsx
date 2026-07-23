import React, { useState, useEffect } from 'react';
import { Class, User, TeacherClassAssignment } from '../../types';
import { InstitutionMember, getInstitutionClasses, createInstitutionClass, deleteInstitutionClass, generateNewClassCode } from '../../utils/institution';
import { getAllUsers, saveUser, getAllTeacherAssignments, saveTeacherAssignment, deleteTeacherAssignment, generateId } from '../../utils/storage';
import { assignMemberToClass, sendClassAssignmentEmail } from '../../utils/api';

interface ClassManagementProps {
  institutionMembers?: InstitutionMember[];
  allPlatformUsers?: any[];
  institutionId?: string;
}

export default function ClassManagement({ institutionMembers = [], allPlatformUsers = [], institutionId }: ClassManagementProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<TeacherClassAssignment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClass, setCurrentClass] = useState<Partial<Class>>({});
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  // Class Details Overlay
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [activeClass, setActiveClass] = useState<Class | null>(null);
  
  // Subject Assignments
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [activeClassId, setActiveClassId] = useState<string>('');
  const [newSubject, setNewSubject] = useState('');
  const [selectedSubjectTeacher, setSelectedSubjectTeacher] = useState('');

  // Student Assignments
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [activeStudentClassId, setActiveStudentClassId] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, [institutionMembers, allPlatformUsers, institutionId]);

  const loadData = async () => {
    if (institutionId) {
      setIsLoadingClasses(true);
      try {
        const dbClasses = await getInstitutionClasses(institutionId);
        setClasses(dbClasses);
      } catch (err) {
        console.error("Failed to load classes", err);
      } finally {
        setIsLoadingClasses(false);
      }
    }

    
    // Build a set of member user IDs belonging to THIS institution
    const memberIds = new Set(institutionMembers.map(m => m.userId));
    
    // Use allPlatformUsers (which includes server profiles) if available, else fall back to localStorage
    const usersSource = allPlatformUsers.length > 0 ? allPlatformUsers : getAllUsers();
    
    if (memberIds.size > 0) {
      // Only show teachers/students who are members of this institution
      setTeachers(usersSource.filter((u: any) => u.role === 'teacher' && memberIds.has(u.id)));
      setStudents(usersSource.filter((u: any) => u.role === 'student' && memberIds.has(u.id)));
    } else {
      // Fallback: if no institution members loaded yet, show nothing rather than all users
      setTeachers([]);
      setStudents([]);
    }
    
    setAssignments(getAllTeacherAssignments());
  };

  const handleSaveClass = async () => {
    if (!currentClass.name || !currentClass.academicYear || !institutionId) return;
    
    const isNew = !currentClass.id;
    const previousClass = !isNew ? classes.find(c => c.id === currentClass.id) : null;
    
    const classToSave: Class = {
      id: currentClass.id || `cls_${Date.now()}`,
      name: currentClass.name,
      academicYear: currentClass.academicYear,
      classTeacherId: currentClass.classTeacherId,
      institutionId: institutionId,
      createdAt: currentClass.createdAt || new Date().toISOString(),
    };
    
    try {
      await createInstitutionClass(classToSave);
      
      // If a class teacher was assigned (and it changed from previous)
      if (classToSave.classTeacherId && classToSave.classTeacherId !== previousClass?.classTeacherId) {
        // Sync to backend KV store
        await assignMemberToClass({
          userId: classToSave.classTeacherId,
          classId: classToSave.id,
          className: classToSave.name,
          role: 'teacher',
          institutionId
        });
        
        // Send email
        const teacher = teachers.find(t => t.id === classToSave.classTeacherId);
        if (teacher && teacher.email) {
          await sendClassAssignmentEmail({
            email: teacher.email,
            className: classToSave.name,
            role: 'Class Teacher',
            inviterName: 'Your School Administrator'
          });
        }
      }
      
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error("Failed to save class", err);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this class? This will orphan any assigned students.')) {
      try {
        await deleteInstitutionClass(id);
        loadData();
      } catch (err) {
        console.error("Failed to delete class", err);
      }
    }
  };

  const handleGenerateCode = async (classId: string) => {
    try {
      const code = await generateNewClassCode(classId);
      if (activeClass && activeClass.id === classId) {
        setActiveClass({ ...activeClass, classCode: code });
      }
      loadData();
    } catch (err) {
      console.error("Failed to generate code", err);
    }
  };


  const handleSaveTeacherAssignment = async () => {
    if (!activeClassId || !selectedSubjectTeacher || !newSubject) return;
    
    const newAssignment: TeacherClassAssignment = {
      id: `ta_${Date.now()}`,
      teacherId: selectedSubjectTeacher,
      classId: activeClassId,
      subjectId: newSubject,
      role: 'subject_teacher'
    };
    
    try {
      saveTeacherAssignment(newAssignment);
      
      const activeClassObj = classes.find(c => c.id === activeClassId);
      if (activeClassObj) {
        // Sync to backend KV store
        await assignMemberToClass({
          userId: selectedSubjectTeacher,
          classId: activeClassId,
          className: activeClassObj.name,
          role: 'teacher',
          institutionId
        });
        
        // Send Email
        const teacher = teachers.find(t => t.id === selectedSubjectTeacher);
        if (teacher && teacher.email) {
          await sendClassAssignmentEmail({
            email: teacher.email,
            className: activeClassObj.name,
            role: `Subject Teacher (${newSubject})`,
            inviterName: 'Your School Administrator'
          });
        }
      }
      
      setNewSubject('');
      setSelectedSubjectTeacher('');
      loadData();
    } catch (err) {
      console.error("Failed to save teacher assignment", err);
    }
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    deleteTeacherAssignment(assignmentId);
    loadData();
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
    const className = activeClass ? activeClass.name : 'your class';
    const classCode = activeClass ? activeClass.classCode : undefined;

    const classTeacher = teachers.find(t => t.id === activeClass?.classTeacherId);
    const teacherName = classTeacher ? classTeacher.name : 'Your School Administrator';

    for (const student of students) {
      const isSelected = selectedStudents.has(student.id);
      if (isSelected && student.classId !== activeStudentClassId) {
        saveUser({ ...student, classId: activeStudentClassId });
        
        try {
          await assignMemberToClass({
            userId: student.id,
            classId: activeStudentClassId,
            className: className,
            role: 'student',
            institutionId: institutionId
          });

          // Send email notification that they were added to the class
          await sendClassAssignmentEmail({
            email: student.email,
            role: 'student',
            className: className,
            classCode: classCode,
            inviterName: teacherName
          });
        } catch (err) {
          console.error("Failed to sync student assignment to backend", err);
        }
      } else if (!isSelected && student.classId === activeStudentClassId) {
        saveUser({ ...student, classId: undefined });
      }
    }
    setIsStudentModalOpen(false);
    loadData();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Class Management</h2>
        <button
          onClick={() => { setCurrentClass({ academicYear: new Date().getFullYear().toString() }); setIsModalOpen(true); }}
          className="bg-[#1E8A6E] text-white px-4 py-2 rounded-lg hover:bg-[#156e57] transition-colors"
        >
          Add New Class
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Class Name</th>
              <th className="p-4 font-semibold text-gray-600">Academic Year</th>
              <th className="p-4 font-semibold text-gray-600">Class Teacher</th>
              <th className="p-4 font-semibold text-gray-600">Subject Teachers</th>
              <th className="p-4 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {classes.map(cls => {
              const classTeacher = teachers.find(t => t.id === cls.classTeacherId);
              const subjectAssignments = assignments.filter(a => a.classId === cls.id);

              return (
                <tr key={cls.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">{cls.name}</td>
                  <td className="p-4 text-gray-600">{cls.academicYear}</td>
                  <td className="p-4">
                    {classTeacher ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {classTeacher.name}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      {subjectAssignments.length > 0 ? subjectAssignments.map(a => {
                        const teacher = teachers.find(t => t.id === a.teacherId);
                        return (
                          <div key={a.id} className="text-xs text-gray-600 flex justify-between items-center bg-gray-100 p-1 rounded">
                            <span>{teacher?.name} ({a.subjectId})</span>
                            <button onClick={() => handleDeleteAssignment(a.id)} className="text-red-500 hover:text-red-700 ml-2">&times;</button>
                          </div>
                        );
                      }) : (
                        <span className="text-xs text-gray-400">No subjects assigned</span>
                      )}
                      <button 
                        onClick={() => { setActiveClassId(cls.id); setIsSubjectModalOpen(true); }}
                        className="text-xs text-[#1E8A6E] hover:underline mt-1 text-left"
                      >
                        + Add Subject Teacher
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => { setActiveClass(cls); setIsDetailsModalOpen(true); }}
                      className="text-[#1E8A6E] hover:underline mr-3 font-medium bg-green-50 px-3 py-1 rounded"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => handleManageStudents(cls.id)}
                      className="text-[#1E8A6E] hover:underline mr-3"
                    >
                      Manage Students
                    </button>
                    <button 
                      onClick={() => { setCurrentClass(cls); setIsModalOpen(true); }}
                      className="text-blue-500 hover:underline mr-3"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteClass(cls.id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
            {classes.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No classes created yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{currentClass.id ? 'Edit Class' : 'Create Class'}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                <input 
                  type="text" 
                  value={currentClass.name || ''}
                  onChange={e => setCurrentClass({...currentClass, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E8A6E]"
                  placeholder="e.g. Grade 10A"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <input 
                  type="text" 
                  value={currentClass.academicYear || ''}
                  onChange={e => setCurrentClass({...currentClass, academicYear: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E8A6E]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Teacher</label>
                <select
                  value={currentClass.classTeacherId || ''}
                  onChange={e => setCurrentClass({...currentClass, classTeacherId: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E8A6E]"
                >
                  <option value="">-- Unassigned --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveClass}
                className="px-4 py-2 bg-[#1E8A6E] text-white rounded-lg hover:bg-[#156e57]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {isSubjectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Assign Subject Teacher</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                <input 
                  type="text" 
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E8A6E]"
                  placeholder="e.g. Mathematics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                <select
                  value={selectedSubjectTeacher}
                  onChange={e => setSelectedSubjectTeacher(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E8A6E]"
                >
                  <option value="">-- Select Teacher --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setIsSubjectModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={() => { handleSaveTeacherAssignment(); setIsSubjectModalOpen(false); }}
                className="px-4 py-2 bg-[#1E8A6E] text-white rounded-lg hover:bg-[#156e57]"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {isStudentModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
            <h3 className="text-xl font-bold mb-4 flex-shrink-0">Assign Students</h3>
            <p className="text-sm text-gray-500 mb-4 flex-shrink-0">
              Select students to assign to this class. Note that selecting a student will remove them from their current class if they are already assigned elsewhere.
            </p>
            <div className="overflow-y-auto flex-1 border border-gray-200 rounded-lg p-4">
              {students.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No approved students available.</p>
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
                        className="w-4 h-4 text-[#1E8A6E] rounded focus:ring-[#1E8A6E]"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{s.name}</div>
                        <div className="text-xs text-gray-500">{s.email}</div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        s.classId === activeStudentClassId 
                          ? 'bg-blue-100 text-blue-800' 
                          : s.classId 
                            ? 'bg-gray-100 text-gray-800' 
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {s.classId === activeStudentClassId 
                          ? 'Current Class' 
                          : s.classId 
                            ? `Assigned to ${classes.find(c => c.id === s.classId)?.name || 'another class'}` 
                            : 'Unassigned'}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6 flex-shrink-0">
              <button 
                onClick={() => setIsStudentModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveStudents}
                className="px-4 py-2 bg-[#1E8A6E] text-white rounded-lg hover:bg-[#156e57] transition-colors"
              >
                Save Assignments
              </button>
            </div>
          </div>
        </div>
      )}

      {isDetailsModalOpen && activeClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{activeClass.name}</h3>
                <p className="text-gray-500">Academic Year: {activeClass.academicYear}</p>
              </div>
              <button onClick={() => setIsDetailsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-800 uppercase tracking-wider mb-2">Class Code</h4>
                {activeClass.classCode ? (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-mono text-blue-900 font-bold bg-white px-3 py-1 rounded border border-blue-200">
                      {activeClass.classCode}
                    </span>
                    <button 
                      onClick={() => navigator.clipboard.writeText(activeClass.classCode!)}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Copy
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">No class code generated yet.</p>
                    <button 
                      onClick={() => handleGenerateCode(activeClass.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Generate Code
                    </button>
                  </div>
                )}
                <p className="text-xs text-blue-700/70 mt-2">Share this code with students so they can join this class.</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Class Teacher</h4>
                {activeClass.classTeacherId ? (
                  <div>
                    <p className="font-medium text-gray-900">{teachers.find(t => t.id === activeClass.classTeacherId)?.name}</p>
                    <p className="text-sm text-gray-500">{teachers.find(t => t.id === activeClass.classTeacherId)?.email}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No class teacher assigned.</p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Subject Teachers</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {assignments.filter(a => a.classId === activeClass.id).length > 0 ? (
                  assignments.filter(a => a.classId === activeClass.id).map(a => {
                    const teacher = teachers.find(t => t.id === a.teacherId);
                    return (
                      <div key={a.id} className="flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-100">
                        <div>
                          <p className="font-medium text-gray-800">{a.subjectId}</p>
                          <p className="text-sm text-gray-500">{teacher?.name}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 italic col-span-2">No subject teachers assigned yet.</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3 border-b pb-2">
                <h4 className="text-lg font-bold text-gray-800">Students ({students.filter(s => s.classId === activeClass.id).length})</h4>
                <button 
                  onClick={() => { setIsDetailsModalOpen(false); handleManageStudents(activeClass.id); }}
                  className="text-sm text-[#1E8A6E] hover:underline"
                >
                  Manage Students
                </button>
              </div>
              <div className="bg-gray-50 rounded border border-gray-200 overflow-hidden">
                {students.filter(s => s.classId === activeClass.id).length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {students.filter(s => s.classId === activeClass.id).map(student => (
                      <li key={student.id} className="p-3 hover:bg-gray-100 flex justify-between items-center">
                        <span className="font-medium text-gray-700">{student.name}</span>
                        <span className="text-sm text-gray-500">{student.email}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No students are currently assigned to this class.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
