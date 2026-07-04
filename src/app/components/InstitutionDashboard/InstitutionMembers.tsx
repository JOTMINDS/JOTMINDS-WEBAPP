import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Users, Upload, UserPlus, AlertCircle, CheckCircle2, Trash2, Mail, Clock, RefreshCw, Loader, BarChart3, Crown, ShieldMinus, Brain
} from 'lucide-react';
import {
  Institution,
  InstitutionMember,
  InstitutionInvitation,
  getMemberCounts,
  approveMember,
  rejectMember,
  removeMember,
  getInstitutionMembers
} from '../../utils/institution';
import { saveUser, getAssessmentsByUserId, getAllClasses, getAssignmentsForTeacher } from '../../utils/storage';

interface InstitutionMembersProps {
  institution: Institution;
  members: InstitutionMember[];
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
  onViewTeacherStyles
}: InstitutionMembersProps) {
  // Member search
  const [memberSearch, setMemberSearch] = useState('');
  const [memberRoleFilter, setMemberRoleFilter] = useState<'all' | 'admin' | 'teacher' | 'student'>('all');

  // Batch approve/reject state
  const [selectedPending, setSelectedPending] = useState<Set<string>>(new Set());

  // Invitation tracking state
  const [showInvitations, setShowInvitations] = useState(false);

  // Pagination state
  const [membersPage, setMembersPage] = useState(1);

  // Loading state for member operations
  const [processingMemberId, setProcessingMemberId] = useState<string | null>(null);

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

  // Pagination for approved members
  const paginatedMembers = useMemo(
    () => approvedMembers.slice((membersPage - 1) * MEMBERS_PER_PAGE, membersPage * MEMBERS_PER_PAGE),
    [approvedMembers, membersPage]
  );
  const totalPages = Math.ceil(approvedMembers.length / MEMBERS_PER_PAGE);

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
          {showInvitations ? 'Hide' : 'Show'} Pending Invitations ({institutionInvitations.length})
        </Button>
        {showInvitations && (
          <Card className="mt-3 border-blue-100">
            <CardContent className="pt-4">
              {institutionInvitations.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No pending invitations.</p>
              ) : (
                <div className="space-y-2">
                  {institutionInvitations.map(inv => (
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
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => onOpenInviteModal(inv.email, inv.role)}
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1" /> Resend
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {approvedMembers.length > 0 && (
        <div className="mt-6 mb-4">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Approved Members ({approvedMembers.length})</h3>
          <div className="space-y-3">
            {paginatedMembers.map(m => (
              <Card key={m.userId}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm shrink-0"
                        style={{ backgroundColor: ROLE_COLORS[m.role] }}
                      >
                        {m.userName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-900">{m.userName}</p>
                          {m.role === 'admin' ? (
                            institution.adminId === m.userId ? (
                              <Badge
                                style={{ backgroundColor: ROLE_COLORS['admin'] + '20', color: ROLE_COLORS['admin'] }}
                                className="text-[10px] capitalize flex items-center gap-1"
                              >
                                <Crown className="w-3 h-3" /> Head Admin
                              </Badge>
                            ) : (
                              <Badge
                                style={{ backgroundColor: ROLE_COLORS['admin'] + '20', color: ROLE_COLORS['admin'] }}
                                className="text-[10px] capitalize flex items-center gap-1"
                              >
                                <ShieldMinus className="w-3 h-3" /> Admin
                              </Badge>
                            )
                          ) : (
                            <Badge
                              style={{ backgroundColor: ROLE_COLORS[m.role] + '20', color: ROLE_COLORS[m.role] }}
                              className="text-[10px] capitalize"
                            >
                              {m.role}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{m.userEmail}</p>
                        {m.userPhone && <p className="text-xs text-gray-400">{m.userPhone}</p>}
                        {(m.role === 'teacher' || m.role === 'admin') && (
                          <p className="text-xs text-[#6B4C9A] mt-0.5 font-medium">
                            {getStudentsForTeacherCount(m.userId)} Assigned Students
                          </p>
                        )}
                        {m.role === 'student' && (
                          <p className="text-xs text-[#1E8A6E] mt-0.5 font-medium">
                            {(() => {
                              const studentProfile = allPlatformUsers.find(u => u.id === m.userId);
                              if (studentProfile?.classId) {
                                const instTeacherIds = new Set(members.filter(m => m.role === 'teacher' || m.role === 'admin').map(m => m.userId));
                                const classes = getAllClasses().filter(c => !c.classTeacherId || instTeacherIds.has(c.classTeacherId));
                                const studentClass = classes.find(c => c.id === studentProfile.classId);
                                return studentClass ? `Class: ${studentClass.name}` : 'Class: Unknown';
                              }
                              return 'Class: Unassigned';
                            })()}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Joined{' '}
                          {new Date(m.joinedAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          · via {m.joinedViaCode}
                        </p>
                      </div>
                    </div>

                    {m.role === 'student' && (
                      <div className="hidden md:flex flex-col items-center justify-center bg-indigo-50/50 rounded-lg px-5 py-2 border border-indigo-100/50">
                          <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider mb-1">Assessments</span>
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="bg-white text-indigo-700 border-indigo-200 font-bold shadow-sm">
                                {getAssessmentsByUserId(m.userId).filter(a => a.completedAt).length} Completed
                            </Badge>
                            <Badge variant="outline" className="bg-white text-slate-600 border-slate-200 shadow-sm" title="Assessment Frequency">
                                {(() => {
                                  const assessments = getAssessmentsByUserId(m.userId).filter(a => a.completedAt);
                                  if (assessments.length === 0) return 'No Tests';
                                  
                                  assessments.sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
                                  const lastTest = new Date(assessments[0].completedAt);
                                  const daysSince = Math.floor((Date.now() - lastTest.getTime()) / (1000 * 3600 * 24));
                                  
                                  if (assessments.length >= 2) {
                                    const firstTest = new Date(assessments[assessments.length - 1].completedAt);
                                    const totalDays = Math.max(1, Math.floor((lastTest.getTime() - firstTest.getTime()) / (1000 * 3600 * 24)));
                                    const avgDays = totalDays / (assessments.length - 1);
                                    
                                    if (daysSince > 60) return 'Inactive';
                                    if (avgDays <= 10) return 'Weekly';
                                    if (avgDays <= 20) return 'Bi-weekly';
                                    if (avgDays <= 45) return 'Monthly';
                                    return 'Sporadic';
                                  }
                                  
                                  if (daysSince <= 7) return 'Active (New)';
                                  if (daysSince > 30) return 'Inactive';
                                  return `${daysSince}d ago`;
                                })()}
                            </Badge>
                          </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      {isPrimaryAdmin && m.role === 'teacher' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-[#5B7DB1] border-[#5B7DB1] hover:bg-[#5B7DB1]/10"
                          onClick={() => handlePromote(m.userId)}
                          disabled={processingMemberId === m.userId}
                        >
                          <Crown className="w-3.5 h-3.5 mr-1.5" /> Make Admin
                        </Button>
                      )}
                      
                      {isPrimaryAdmin && m.role === 'admin' && institution.adminId !== m.userId && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                          onClick={() => handleDemote(m.userId)}
                          disabled={processingMemberId === m.userId}
                        >
                          <ShieldMinus className="w-3.5 h-3.5 mr-1.5" /> Demote to Teacher
                        </Button>
                      )}

                      {(m.role === 'teacher' || m.role === 'admin') && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-[#5B7DB1]"
                          onClick={() => onOpenTeacherManagement(m.userId)}
                          disabled={processingMemberId === m.userId}
                        >
                          <Users className="w-3.5 h-3.5 mr-1.5" /> Manage
                        </Button>
                      )}

                      {m.role !== 'admin' && (
                        <>
                          {m.role === 'teacher' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onOpenTransferModal(m.userId, 'teacher', m.userName)}
                              className="text-gray-500 hover:text-gray-700"
                              disabled={processingMemberId === m.userId}
                            >
                              Transfer
                            </Button>
                          )}
                          {m.role === 'student' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onOpenTransferModal(m.userId, 'student', m.userName)}
                              className="text-gray-500 hover:text-gray-700"
                              disabled={processingMemberId === m.userId}
                            >
                              Change Class
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveMember(m.userId)}
                            className="text-red-400 hover:text-red-600"
                            disabled={processingMemberId === m.userId}
                          >
                            {processingMemberId === m.userId ? (
                              <Loader className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Pagination controls */}
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
