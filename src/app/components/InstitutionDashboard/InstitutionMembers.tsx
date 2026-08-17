import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Users, Upload, UserPlus, AlertCircle, CheckCircle2, Trash2, Mail, Clock, RefreshCw, Loader, BarChart3, Crown, ShieldMinus, Brain, Download, ChevronDown, ChevronRight
} from 'lucide-react';
import { generatePDF } from '../../utils/pdfGenerator';
import { formatAssessmentType } from '../InstitutionReporting';
import {
  Institution,
  InstitutionMember,
  InstitutionInvitation,
  getMemberCounts,
  approveMember,
  rejectMember,
  removeMember,
  getInstitutionMembers,
  deleteInstitutionInvitation
} from '../../utils/institution';
import { saveUser, getAssessmentsByUserId, getAllClasses, getAssignmentsForTeacher } from '../../utils/storage';

interface InstitutionMembersProps {
  institution: Institution;
  members: InstitutionMember[];
  assessments?: any[];
  institutionInvitations: InstitutionInvitation[];
  allPlatformUsers: any[];
  onRefresh: () => Promise<void>;
  onOpenInviteModal: (email?: string, role?: 'teacher' | 'student') => void;
  onOpenBulkUploadModal: () => void;
  onOpenTransferModal: (memberId: string, role: 'teacher' | 'student', name: string) => void;
  onOpenTeacherManagement: (memberId: string) => void;
  isPrimaryAdmin?: boolean;
  onPromoteMember?: (userId: string) => Promise<void>;
  onDemoteMember?: (userId: string) => Promise<void>;
  onViewTeacherStyles?: () => void;
}

const ROLE_COLORS = { admin: '#5B7DB1', teacher: '#6B4C9A', student: '#1E8A6E' };
const MEMBERS_PER_PAGE = 20;

export function InstitutionMembers({
  institution,
  members,
  institutionInvitations,
  allPlatformUsers,
  onRefresh,
  onOpenInviteModal,
  onOpenBulkUploadModal,
  onOpenTransferModal,
  onOpenTeacherManagement,
  isPrimaryAdmin,
  onPromoteMember,
  onDemoteMember,
  onViewTeacherStyles,
  assessments = []
}: InstitutionMembersProps) {
  // Member search
  const [memberSearch, setMemberSearch] = useState('');
  const [memberRoleFilter, setMemberRoleFilter] = useState<'all' | 'admin' | 'teacher' | 'student'>('all');

  // Batch approve/reject state
  const [selectedPending, setSelectedPending] = useState<Set<string>>(new Set());

  // Invitation tracking state
  const [showInvitations, setShowInvitations] = useState(false);
  const [cancelledInvitationIds, setCancelledInvitationIds] = useState<Set<string>>(new Set());

  // Pagination state
  const [membersPage, setMembersPage] = useState(1);

  // Loading state for member operations
  const [processingMemberId, setProcessingMemberId] = useState<string | null>(null);

  // Collapsible groups state
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['admin', 'teacher', 'student']));
  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  // Reset pagination when search/filter changes
  useEffect(() => {
    setMembersPage(1);
  }, [memberSearch, memberRoleFilter]);

  const filteredMembers = useMemo(() => {
    let list = members;
    if (memberRoleFilter !== 'all') list = list.filter(m => m.role === memberRoleFilter);
    if (memberSearch) {
      const q = memberSearch.toLowerCase();
      list = list.filter(
        m =>
          m.userName.toLowerCase().includes(q) ||
          m.userEmail.toLowerCase().includes(q) ||
          m.userPhone?.includes(memberSearch)
      );
    }
    return list;
  }, [members, memberRoleFilter, memberSearch]);

  const approvedMembers = useMemo(
    () => filteredMembers.filter(m => m.status !== 'pending' && m.status !== 'rejected'),
    [filteredMembers]
  );
  const pendingMembers = useMemo(
    () => filteredMembers.filter(m => m.status === 'pending'),
    [filteredMembers]
  );

  const visibleInvitations = useMemo(
    () => institutionInvitations.filter(inv => !cancelledInvitationIds.has(inv.id)),
    [institutionInvitations, cancelledInvitationIds]
  );

  const adminMembers = useMemo(() => approvedMembers.filter(m => m.role === 'admin'), [approvedMembers]);
  const teacherMembers = useMemo(() => approvedMembers.filter(m => m.role === 'teacher'), [approvedMembers]);
  const studentMembers = useMemo(() => approvedMembers.filter(m => m.role === 'student'), [approvedMembers]);

  // Pagination for student members only
  const paginatedStudentMembers = useMemo(
    () => studentMembers.slice((membersPage - 1) * MEMBERS_PER_PAGE, membersPage * MEMBERS_PER_PAGE),
    [studentMembers, membersPage]
  );
  const totalPages = Math.ceil(studentMembers.length / MEMBERS_PER_PAGE);

  const counts = getMemberCounts(members);

  const getStudentsForTeacherCount = (teacherId: string) => {
    const instTeacherIds = new Set(members.filter(m => m.role === 'teacher' || m.role === 'admin').map(m => m.userId));
    const classes = getAllClasses().filter(c => !c.classTeacherId || instTeacherIds.has(c.classTeacherId));
    const assignments = getAssignmentsForTeacher(teacherId);
    
    // Find all classes this teacher is involved in
    const teacherClassIds = new Set<string>();
    classes.filter(c => c.classTeacherId === teacherId).forEach(c => teacherClassIds.add(c.id));
    assignments.forEach(a => teacherClassIds.add(a.classId));
    
    return allPlatformUsers.filter(u => u.role === 'student' && u.classId && teacherClassIds.has(u.classId)).length;
  };

  const handleApprove = async (userId: string) => {
    setProcessingMemberId(userId);
    try {
      await approveMember(institution.id, userId);
      await onRefresh();
      toast.success('Member approved');
    } catch (err) {
      toast.error('Failed to approve member');
    } finally {
      setProcessingMemberId(null);
    }
  };

  const handleReject = async (userId: string) => {
    if (!window.confirm('Are you sure you want to reject this member? This action can be undone from the rejected members list.')) return;
    setProcessingMemberId(userId);
    try {
      await rejectMember(institution.id, userId);
      await onRefresh();
      toast.success('Member rejected');
    } catch (err) {
      toast.error('Failed to reject member');
    } finally {
      setProcessingMemberId(null);
    }
  };

  const handleBatchApprove = async () => {
    try {
      for (const userId of selectedPending) {
        await approveMember(institution.id, userId);
      }
      await onRefresh();
      toast.success(`Approved ${selectedPending.size} members`);
      setSelectedPending(new Set());
    } catch (err) {
      toast.error('Failed to approve some members');
    }
  };

  const handleBatchReject = async () => {
    if (!window.confirm(`Reject ${selectedPending.size} members?`)) return;
    try {
      for (const userId of selectedPending) {
        await rejectMember(institution.id, userId);
      }
      await onRefresh();
      toast.success(`Rejected ${selectedPending.size} members`);
      setSelectedPending(new Set());
    } catch (err) {
      toast.error('Failed to reject some members');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm('Remove this member from the institution?')) return;

    setProcessingMemberId(userId);
    try {
      const userToUpdate = allPlatformUsers.find(u => u.id === userId);
      if (userToUpdate) {
        userToUpdate.organizationName = undefined;
        userToUpdate.organizationCode = undefined;
        saveUser(userToUpdate);
      }

      await removeMember(institution.id, userId);
      await onRefresh();
      toast.success('Member removed');
    } catch (err) {
      toast.error('Failed to remove member');
    } finally {
      setProcessingMemberId(null);
    }
  };

  const handlePromote = async (userId: string) => {
    if (!window.confirm('Promote this teacher to Admin? They will be able to manage members and see all analytics.')) return;
    setProcessingMemberId(userId);
    try {
      if (onPromoteMember) await onPromoteMember(userId);
    } catch (err: any) {
      toast.error(err.message || 'Failed to promote member');
    } finally {
      setProcessingMemberId(null);
    }
  };

  const handleDemote = async (userId: string) => {
    if (!window.confirm('Demote this Admin to Teacher? They will lose access to the admin dashboard features.')) return;
    setProcessingMemberId(userId);
    try {
      if (onDemoteMember) await onDemoteMember(userId);
    } catch (err: any) {
      toast.error(err.message || 'Failed to demote member');
    } finally {
      setProcessingMemberId(null);
    }
  };

  const renderRoleGroup = (roleMembers: InstitutionMember[], roleLabel: string, roleKey: string, roleColor: string) => (
    roleMembers.length > 0 && (
      <Card key={roleKey}>
        <CardContent className="pt-0 pb-0">
          <button
            onClick={() => toggleGroup(roleKey)}
            className="w-full flex items-center justify-between py-3 text-left"
          >
            <div className="flex items-center gap-2">
              {expandedGroups.has(roleKey) ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
              <span className="text-sm font-semibold text-gray-800">{roleLabel}</span>
              <Badge style={{ backgroundColor: roleColor + '20', color: roleColor }} className="text-[10px]">
                {roleMembers.length}
              </Badge>
            </div>
          </button>
          {expandedGroups.has(roleKey) && (
            <div className="border-t">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider px-3 py-2">Name</th>
                    <th className="text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider px-3 py-2 hidden md:table-cell">Contact</th>
                    <th className="text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider px-3 py-2 hidden lg:table-cell">Info</th>
                    <th className="text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider px-3 py-2 hidden lg:table-cell">Assessments</th>
                    <th className="text-right text-[10px] font-medium text-gray-500 uppercase tracking-wider px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {roleMembers.map(m => (
                    <tr key={m.userId} className="hover:bg-gray-50/50 transition-colors">
                      {/* Name cell */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs shrink-0"
                            style={{ backgroundColor: roleColor }}
                          >
                            {m.userName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium text-gray-900 truncate">{m.userName}</p>
                              {m.role === 'admin' && institution.adminId === m.userId && (
                                <Crown className="w-3 h-3 text-[#5B7DB1] shrink-0" />
                              )}
                            </div>
                            {/* Show email on mobile since contact column is hidden */}
                            <p className="text-xs text-gray-500 truncate md:hidden">{m.userEmail}</p>
                          </div>
                        </div>
                      </td>
                      {/* Contact cell — hidden on mobile */}
                      <td className="px-3 py-2.5 hidden md:table-cell">
                        <p className="text-xs text-gray-600 truncate">{m.userEmail}</p>
                        {m.userPhone && <p className="text-[10px] text-gray-400">{m.userPhone}</p>}
                      </td>
                      {/* Info cell — hidden on mobile */}
                      <td className="px-3 py-2.5 hidden lg:table-cell">
                        {(m.role === 'teacher' || m.role === 'admin') && (
                          <span className="text-xs text-[#6B4C9A]">{getStudentsForTeacherCount(m.userId)} Students</span>
                        )}
                        {m.role === 'student' && (
                          <span className="text-xs text-[#1E8A6E]">
                            {(() => {
                              const studentProfile = allPlatformUsers.find(u => u.id === m.userId);
                              if (studentProfile?.classId) {
                                const instTeacherIds = new Set(members.filter(mem => mem.role === 'teacher' || mem.role === 'admin').map(mem => mem.userId));
                                const classes = getAllClasses().filter(c => !c.classTeacherId || instTeacherIds.has(c.classTeacherId));
                                const studentClass = classes.find(c => c.id === studentProfile.classId);
                                return studentClass ? studentClass.name : 'Unknown';
                              }
                              return 'Unassigned';
                            })()}
                          </span>
                        )}
                        <p className="text-[10px] text-gray-400">
                          Joined {new Date(m.joinedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </td>
                      {/* Assessments cell — hidden on mobile */}
                      <td className="px-3 py-2.5 hidden lg:table-cell">
                        {(() => {
                          const userAssessments = assessments.length > 0 ? assessments.filter(a => a.userId === m.userId) : getAssessmentsByUserId(m.userId);
                          const completed = userAssessments.filter((a: any) => a.completedAt);
                          return (
                            <div className="flex items-center gap-1.5">
                              <Badge variant="secondary" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200">
                                {completed.length} Done
                              </Badge>
                              {completed.slice(0, 2).map((a: any, i: number) => (
                                <Badge key={i} variant="outline" className="text-[10px] text-[#6B4C9A] border-[#6B4C9A]/20">
                                  {formatAssessmentType(a.type)}
                                </Badge>
                              ))}
                              {completed.length > 2 && (
                                <span className="text-[10px] text-gray-400">+{completed.length - 2}</span>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      {/* Actions cell */}
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Export Report button */}
                          {(() => {
                            const completedAssessments = getAssessmentsByUserId(m.userId).filter((a: any) => a.completedAt);
                            if (completedAssessments.length === 0) return null;
                            return (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-[#6B4C9A] hover:bg-[#6B4C9A]/10 h-7 w-7 p-0"
                                title="Export Report"
                                onClick={async () => {
                                  const latestAssessment = completedAssessments.sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];
                                  toast.loading('Generating report...', { id: `pdf-${m.userId}` });
                                  try {
                                    let assignedTeacherName = null;
                                    const studentProfile = allPlatformUsers.find(u => u.id === m.userId);
                                    if (studentProfile?.teacherId) {
                                      const teacher = allPlatformUsers.find(u => u.id === studentProfile.teacherId);
                                      if (teacher) assignedTeacherName = teacher.name;
                                    } else if (studentProfile?.classId) {
                                      const classes = getAllClasses();
                                      const studentClass = classes.find(c => c.id === studentProfile.classId);
                                      if (studentClass?.classTeacherId) {
                                        const teacher = allPlatformUsers.find(u => u.id === studentClass.classTeacherId);
                                        if (teacher) assignedTeacherName = teacher.name;
                                      }
                                    }
                                    await generatePDF(latestAssessment, m.userName, assignedTeacherName, m.role === 'teacher');
                                    toast.success('Report downloaded', { id: `pdf-${m.userId}` });
                                  } catch (error) {
                                    console.error('PDF generation error:', error);
                                    toast.error('Failed to generate report', { id: `pdf-${m.userId}` });
                                  }
                                }}
                                disabled={processingMemberId === m.userId}
                              >
                                <Download className="w-3.5 h-3.5" />
                              </Button>
                            );
                          })()}
  
                          {/* Role-specific actions */}
                          {isPrimaryAdmin && m.role === 'teacher' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[#5B7DB1] hover:bg-[#5B7DB1]/10 h-7 px-2 text-xs"
                              onClick={() => handlePromote(m.userId)}
                              disabled={processingMemberId === m.userId}
                              title="Promote to Admin"
                            >
                              <Crown className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {isPrimaryAdmin && m.role === 'admin' && institution.adminId !== m.userId && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-orange-500 hover:bg-orange-50 h-7 px-2 text-xs"
                              onClick={() => handleDemote(m.userId)}
                              disabled={processingMemberId === m.userId}
                              title="Demote to Teacher"
                            >
                              <ShieldMinus className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {(m.role === 'teacher' || m.role === 'admin') && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[#5B7DB1] hover:bg-[#5B7DB1]/10 h-7 px-2 text-xs"
                              onClick={() => onOpenTeacherManagement(m.userId)}
                              disabled={processingMemberId === m.userId}
                              title="Manage"
                            >
                              <Users className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {m.role !== 'admin' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveMember(m.userId)}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50 h-7 w-7 p-0"
                              disabled={processingMemberId === m.userId}
                              title="Remove Member"
                            >
                              {processingMemberId === m.userId ? (
                                <Loader className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    )
  );

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap items-center justify-between">
        <div className="flex gap-2 flex-wrap flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Users className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, email or phone..."
              value={memberSearch}
              onChange={e => setMemberSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-1">
            {(['all', 'admin', 'teacher', 'student'] as const).map(r => (
              <button
                key={r}
                onClick={() => setMemberRoleFilter(r)}
                className={`px-3 py-1.5 rounded-full text-xs transition-all capitalize ${
                  memberRoleFilter === r ? 'text-white' : 'bg-white text-gray-600 border'
                }`}
                style={memberRoleFilter === r ? { backgroundColor: r === 'all' ? '#5B7DB1' : ROLE_COLORS[r] } : {}}
              >
                {r === 'all' ? 'All' : `${r}s`}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {onViewTeacherStyles && (
            <Button variant="secondary" onClick={onViewTeacherStyles} className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
              <Brain className="w-4 h-4 mr-2" /> Teacher Analytics
            </Button>
          )}
          <Button variant="outline" onClick={onOpenBulkUploadModal}>
            <Upload className="w-4 h-4 mr-2" /> Bulk Upload Students
          </Button>
          <Button style={{ backgroundColor: '#6B4C9A' }} onClick={() => onOpenInviteModal()}>
            <UserPlus className="w-4 h-4 mr-2" /> Invite Member
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total', value: counts.total, color: '#5B7DB1' },
          { label: 'Teachers', value: counts.teachers, color: '#6B4C9A' },
          { label: 'Students', value: counts.students, color: '#1E8A6E' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-3 pb-3 text-center">
              <div className="text-xl font-bold" style={{ color: s.color }}>
                {s.value}
              </div>
              <p className="text-xs text-gray-500">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              {members.length === 0
                ? 'No members yet — share your institution code'
                : 'No members match your search'}
            </p>
          </CardContent>
        </Card>
      )}

      {pendingMembers.length > 0 && (
        <div className="mt-6 mb-4">
          <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" /> Pending Connection Requests ({pendingMembers.length})
          </h3>
          {/* Batch actions */}
          <div className="flex items-center gap-3 mb-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedPending.size === pendingMembers.length && pendingMembers.length > 0}
                onChange={e => {
                  if (e.target.checked) {
                    setSelectedPending(new Set(pendingMembers.map(m => m.userId)));
                  } else {
                    setSelectedPending(new Set());
                  }
                }}
                className="rounded border-gray-300"
              />
              Select All
            </label>
            {selectedPending.size > 0 && (
              <div className="flex gap-2 ml-auto">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleBatchApprove}>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve Selected ({selectedPending.size})
                </Button>
                <Button size="sm" variant="destructive" onClick={handleBatchReject}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Reject Selected ({selectedPending.size})
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-3">
            {pendingMembers.map(m => (
              <Card key={m.userId} className="border-amber-200 bg-amber-50/30">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedPending.has(m.userId)}
                        onChange={e => {
                          const next = new Set(selectedPending);
                          if (e.target.checked) next.add(m.userId);
                          else next.delete(m.userId);
                          setSelectedPending(next);
                        }}
                        className="rounded border-gray-300 mt-2.5"
                      />
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm shrink-0"
                        style={{ backgroundColor: ROLE_COLORS[m.role] }}
                      >
                        {m.userName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-900">{m.userName}</p>
                          <Badge
                            style={{ backgroundColor: ROLE_COLORS[m.role] + '20', color: ROLE_COLORS[m.role] }}
                            className="text-[10px] capitalize"
                          >
                            {m.role}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">{m.userEmail}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Requested to join {new Date(m.joinedAt).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100"
                        onClick={() => handleApprove(m.userId)}
                        disabled={processingMemberId === m.userId}
                      >
                        {processingMemberId === m.userId ? <Loader className="w-3.5 h-3.5 animate-spin" /> : 'Approve'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 bg-red-50 hover:bg-red-100"
                        onClick={() => handleReject(m.userId)}
                        disabled={processingMemberId === m.userId}
                      >
                        {processingMemberId === m.userId ? <Loader className="w-3.5 h-3.5 animate-spin" /> : 'Reject'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Invitation Tracking Panel */}
      <div className="mt-4">
        <Button variant="outline" size="sm" onClick={() => setShowInvitations(!showInvitations)} className="gap-2">
          <Mail className="w-4 h-4" />
          {showInvitations ? 'Hide' : 'Show'} Pending Invitations ({visibleInvitations.length})
        </Button>
        {showInvitations && (
          <Card className="mt-3 border-blue-100">
            <CardContent className="pt-4">
              {visibleInvitations.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No pending invitations.</p>
              ) : (
                <div className="space-y-2">
                  {visibleInvitations.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{inv.email}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="secondary" className="text-[10px] capitalize">
                              {inv.role || 'member'}
                            </Badge>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Invited{' '}
                              {new Date(inv.invitedAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => onOpenInviteModal(inv.email, inv.role)}
                        >
                          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Resend
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to cancel the invitation for ${inv.email}?`)) {
                              setCancelledInvitationIds(prev => new Set([...prev, inv.id]));
                              await deleteInstitutionInvitation(inv.id, inv.email);
                              toast.success(`Invitation for ${inv.email} cancelled.`);
                              if (onRefresh) onRefresh();
                            }
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {approvedMembers.length > 0 && (
        <div className="mt-6 mb-4 space-y-3">
          <h3 className="text-md font-semibold text-gray-800">Members ({approvedMembers.length})</h3>
          
          {/* Admin group */}
          {adminMembers.length > 0 && renderRoleGroup(adminMembers, 'Admin', 'admin', ROLE_COLORS.admin)}
          
          {/* Teacher group */}
          {teacherMembers.length > 0 && renderRoleGroup(teacherMembers, 'Teachers', 'teacher', ROLE_COLORS.teacher)}
          
          {/* Student group */}
          {studentMembers.length > 0 && renderRoleGroup(paginatedStudentMembers, 'Students', 'student', ROLE_COLORS.student)}

          {/* Pagination controls for students */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMembersPage(p => Math.max(1, p - 1))}
                disabled={membersPage === 1}
              >
                ← Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {membersPage} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMembersPage(p => Math.min(totalPages, p + 1))}
                disabled={membersPage === totalPages}
              >
                Next →
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
