import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  ArrowLeft, Building2, QrCode, Users, BarChart3, Download, Settings, Shield, Loader, LogOut, Brain
} from 'lucide-react';
import { User } from '../../types';
import {
  Institution,
  InstitutionMember,
  InstitutionInvitation,
  getInstitutionByAdminId,
  getInstitutionMembers,
  getAllInvitations,
  addMember,
  generateInstitutionCode,
  saveInstitution,
  isCodeExpired,
  getDaysUntilExpiry,
  getInstitutionForMember,
  createInstitution,
  promoteMember,
  demoteMember
} from '../../utils/institution';
import { getAllUsers } from '../../utils/storage';
import { getAllAssessmentResults } from '../../utils/api';

// Child components
import { InstitutionOverview } from './InstitutionOverview';
import { InstitutionCodeManager } from './InstitutionCodeManager';
import { InstitutionMembers } from './InstitutionMembers';
import { InstitutionSettings } from './InstitutionSettings';
import { InviteMemberModal } from './InviteMemberModal';
import { TransferMemberModal } from './TransferMemberModal';
import { BulkUploadModal } from './BulkUploadModal';
import { TeacherManagementModal } from './TeacherManagementModal';
import ClassManagement from './ClassManagement';

// Shared siblings
import { SchoolAnalyticsDashboard } from '../SchoolAnalyticsDashboard';
import { InstitutionReporting } from '../InstitutionReporting';
import { ProfileSettingsModal } from '../ProfileSettingsModal';
import { SchoolTeacherStylesView } from '../SchoolTeacherStylesView';

interface InstitutionDashboardProps {
  user: User;
  onLogout: () => void;
  onRegisterNew: () => void;
  initialInstitution?: Institution;
  onProfileUpdate?: () => void;
}

type Tab = 'overview' | 'code' | 'members' | 'manage_students' | 'classes' | 'analytics' | 'reports' | 'settings' | 'profile' | 'teacher_styles';

export function InstitutionDashboard({
  user,
  onLogout,
  onRegisterNew,
  initialInstitution,
  onProfileUpdate
}: InstitutionDashboardProps) {
  const [tab, setTab] = useState<Tab>('overview');
  const [institution, setInstitution] = useState<Institution | null>(initialInstitution || null);
  const [loading, setLoading] = useState(!initialInstitution);
  const [members, setMembers] = useState<InstitutionMember[]>([]);
  const [institutionInvitations, setInstitutionInvitations] = useState<InstitutionInvitation[]>([]);
  const [allPlatformUsers, setAllPlatformUsers] = useState<any[]>([]);
  const [memberAssessments, setMemberAssessments] = useState<any[]>([]);

  // Modal active states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteModalEmail, setInviteModalEmail] = useState('');
  const [inviteModalRole, setInviteModalRole] = useState<'teacher' | 'student'>('teacher');

  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  const [transferTargetId, setTransferTargetId] = useState<string | null>(null);
  const [transferTargetRole, setTransferTargetRole] = useState<'teacher' | 'student' | null>(null);
  const [transferTargetName, setTransferTargetName] = useState('');

  const [performanceTargetId, setPerformanceTargetId] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  // Initialize Institution
  useEffect(() => {
    async function initInstitution() {
      if (initialInstitution) {
        setInstitution(initialInstitution);
        setLoading(false);
        return;
      }
      try {
        let inst = await getInstitutionByAdminId(user.id);
        if (!inst) {
          inst = await getInstitutionForMember(user.id);
        }
        if (!inst) {
          // Auto-create a stub institution to avoid blocking the user
          const newInst = await createInstitution({
            name: user.organizationName || 'My School',
            type: 'Other',
            region: 'Not specified',
            district: 'Not specified',
            address: 'Not specified',
            email: user.email,
            phone: user.phone || '',
            adminName: user.name,
            adminEmail: user.email,
            adminPhone: user.phone || '',
            adminId: user.id,
            codeExpiryDays: 30,
            emailVerified: true,
            phoneVerified: true,
          });
          setInstitution(newInst);
          setLoading(false);
          return;
        }
        setInstitution(inst);
      } catch (err) {
        console.error('Failed to initialize institution:', err);
      } finally {
        setLoading(false);
      }
    }
    initInstitution();
  }, [user, initialInstitution]);

  // Load members, invitations, and sync platform users
  const loadData = async () => {
    if (!institution) return;
    try {
      const allUsers = getAllUsers();
      setAllPlatformUsers(allUsers);

      const { members: updatedMembers, profiles: fetchedProfiles } = await getInstitutionMembers(institution.id);
      
      // Merge fetched profiles with any local storage profiles
      const mergedUsers = [...allUsers];
      fetchedProfiles.forEach((p: any) => {
        if (!mergedUsers.find((u: any) => u.id === p.id)) {
          mergedUsers.push(p);
        } else {
          const index = mergedUsers.findIndex((u: any) => u.id === p.id);
          mergedUsers[index] = { ...mergedUsers[index], ...p };
        }
      });
      setAllPlatformUsers(mergedUsers);

      // Fetch assessments for all members and store in state
      let fetchedAssessments: any[] = [];
      if (updatedMembers.length > 0) {
        const memberIds = updatedMembers.map(m => m.userId);
        const chunkSize = 50;
        for (let i = 0; i < memberIds.length; i += chunkSize) {
          const chunk = memberIds.slice(i, i + chunkSize);
          try {
            const res = await getAllAssessmentResults(chunk);
            const rawResults = res?.results || (Array.isArray(res) ? res : []);
            rawResults.forEach((r: any) => {
              const assessmentType = r.assessmentType || r.type || 'unknown';
              const rawScores = r.results || r.score || {};
              let score: any = {};
              if (r.type && r.score) {
                score = r.score;
              } else if (assessmentType === 'kolb') {
                score.kolb = { style: rawScores.style || '', scores: rawScores };
              } else if (assessmentType === 'sternberg') {
                score.sternberg = { style: rawScores.style || '', scores: rawScores };
              } else if (assessmentType === 'dual-process') {
                score.dualProcess = { style: rawScores.style || '', scores: rawScores };
              } else {
                score[assessmentType] = rawScores;
              }
              let userId = r.userId;
              if (!userId && r.id) {
                const parts = r.id.split(':');
                if (parts.length >= 2) userId = parts[1];
              }
              if (r.completedAt) {
                fetchedAssessments.push({
                  id: r.id || `${assessmentType}-${userId}`,
                  userId,
                  type: assessmentType,
                  completed: true,
                  completedAt: r.completedAt,
                  score
                });
              }
            });
          } catch (e) {
            console.error('Failed to fetch member assessments:', e);
          }
        }
      }
      setMemberAssessments(fetchedAssessments);

      if (user.role === 'teacher') {
        const teacherStudents = updatedMembers.filter(m => {
          if (m.role === 'teacher') {
            return m.userId === user.id;
          }
          if (m.role === 'student') {
            const studentProfile = allUsers.find(u => u.id === m.userId);
            return studentProfile && (
              studentProfile.teacherId === user.id ||
              (studentProfile.linkedTeachers && studentProfile.linkedTeachers.includes(user.id))
            );
          }
          return false;
        });
        setMembers(teacherStudents);
      } else {
        setMembers(updatedMembers);
      }

      const invitations = await getAllInvitations(institution.id);
      setInstitutionInvitations(invitations);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const handlePromoteMember = async (userId: string) => {
    if (!institution) return;
    try {
      await promoteMember(institution.id, userId);
      await loadData();
    } catch (err: any) {
      alert(`Error promoting member: ${err.message}`);
      throw err;
    }
  };

  const handleDemoteMember = async (userId: string) => {
    if (!institution) return;
    try {
      await demoteMember(institution.id, userId);
      await loadData();
    } catch (err: any) {
      alert(`Error demoting member: ${err.message}`);
      throw err;
    }
  };

  useEffect(() => {
    if (!institution) return;
    loadData();
  }, [institution?.id, institution?.name, institution?.code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-[#5B7DB1]" />
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <Building2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl text-gray-800 mb-2">No Institution Registered</h2>
            <p className="text-gray-500 text-sm mb-6">
              Register your school or educational institution to unlock teacher profiles, analytics, and institution code management.
            </p>
            <Button style={{ backgroundColor: '#5B7DB1' }} onClick={onRegisterNew} className="w-full">
              <Building2 className="w-4 h-4 mr-2" /> Register Your Institution
            </Button>
            <Button variant="ghost" onClick={onLogout} className="w-full mt-2">Logout</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const expired = isCodeExpired(institution);
  const daysLeft = getDaysUntilExpiry(institution);
  const expiryDate = getCodeExpiryDate(institution);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(institution.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const text = `Join ${institution.name} on JotMinds!\n\nUse institution code: ${institution.code}\n\nSign up at JotMinds and enter this code to link your account to our school.`;
    if (navigator.share) {
      navigator.share({ title: `${institution.name} — JotMinds Code`, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isPrimaryAdmin = institution.adminId === user.id;
  const isCoAdmin = institution.coAdminIds?.includes(user.id) ?? false;
  
  let availableTabs: Tab[];
  if (isPrimaryAdmin) {
    availableTabs = ['overview', 'code', 'members', 'manage_students', 'classes', 'analytics', 'reports', 'teacher_styles', 'settings', 'profile'];
  } else if (isCoAdmin) {
    availableTabs = ['overview', 'members', 'manage_students', 'classes', 'analytics', 'reports', 'teacher_styles', 'profile'];
  } else {
    availableTabs = ['overview', 'members', 'manage_students', 'analytics', 'reports', 'teacher_styles', 'profile'];
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onLogout} className="gap-1">
            <LogOut className="w-4 h-4" /> Logout
          </Button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {institution.logo ? (
              <img src={institution.logo} alt="Logo" className="w-8 h-8 object-contain rounded" />
            ) : (
              <div className="w-8 h-8 rounded bg-[#5B7DB1] flex items-center justify-center text-white text-sm">
                {institution.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-base text-gray-900 truncate">{institution.name}</h1>
              <div className="flex items-center gap-2">
                <Badge
                  style={{
                    backgroundColor: institution.isActive ? '#1E8A6E20' : '#DC262620',
                    color: institution.isActive ? '#1E8A6E' : '#DC2626'
                  }}
                  className="text-[10px]"
                >
                  {institution.isActive ? '● Active' : '● Inactive'}
                </Badge>
                <span className="text-xs text-gray-500">{institution.type} · {institution.region}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 flex gap-1 pb-0 overflow-x-auto">
          <div className="flex overflow-x-auto no-scrollbar border-b">
            {availableTabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 shrink-0 transition-colors ${
                  tab === t ? 'border-[#5B7DB1] text-[#5B7DB1]' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'overview' && <Building2 className="h-4 w-4" />}
                {t === 'code' && <QrCode className="h-4 w-4" />}
                {t === 'members' && <Users className="h-4 w-4" />}
                {t === 'manage_students' && <Users className="h-4 w-4" />}
                {t === 'classes' && <Building2 className="h-4 w-4" />}
                {t === 'analytics' && <BarChart3 className="h-4 w-4" />}
                {t === 'reports' && <Download className="h-4 w-4" />}
                {t === 'teacher_styles' && <Brain className="h-4 w-4" />}
                {t === 'settings' && <Settings className="h-4 w-4" />}
                {t === 'profile' && <Shield className="h-4 w-4" />}
                <span className="capitalize">
                  {t === 'analytics' ? 'Assessment Analytics' : 
                   t === 'manage_students' ? 'Manage Students' :
                   t === 'settings' ? 'School Settings' :
                   t === 'profile' ? 'My Profile' :
                   t.replace('_', ' ')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* tabs */}
        {tab === 'overview' && (
          <InstitutionOverview
            institution={institution}
            members={members}
            expired={expired}
            daysLeft={daysLeft}
            copied={copied}
            handleCopyCode={handleCopyCode}
            handleShare={handleShare}
            setTab={setTab}
          />
        )}

        {tab === 'code' && (
          <InstitutionCodeManager
            institution={institution}
            expired={expired}
            daysLeft={daysLeft}
            expiryDate={expiryDate}
            totalMembersCount={members.length}
            copied={copied}
            handleCopyCode={handleCopyCode}
            handleShare={handleShare}
            onInstitutionUpdate={setInstitution}
          />
        )}

        {tab === 'members' && (
          <InstitutionMembers
            institution={institution}
            members={members}
            assessments={memberAssessments}
            institutionInvitations={institutionInvitations}
            allPlatformUsers={allPlatformUsers}
            isPrimaryAdmin={isPrimaryAdmin}
            onRefresh={loadData}
            onPromoteMember={handlePromoteMember}
            onDemoteMember={handleDemoteMember}
            onViewTeacherStyles={() => setTab('teacher_styles')}
            onOpenInviteModal={(email, role) => {
              setInviteModalEmail(email || '');
              setInviteModalRole(role || 'teacher');
              setIsInviteModalOpen(true);
            }}
            onOpenBulkUploadModal={() => setIsBulkUploadOpen(true)}
            onOpenTransferModal={(memberId, role, name) => {
              setTransferTargetId(memberId);
              setTransferTargetRole(role);
              setTransferTargetName(name);
            }}
            onOpenTeacherManagement={setPerformanceTargetId}
          />
        )}

        {tab === 'manage_students' && (
          <TeacherStudentManagement 
            teacher={user} 
            isInstitutionAdmin={true}
            institutionStudents={allPlatformUsers.filter(u => u.role === 'student' && members.some(m => m.userId === u.id))}
          />
        )}

        {tab === 'classes' && (
          <ClassManagement institutionMembers={members} allPlatformUsers={allPlatformUsers} />
        )}

        {tab === 'analytics' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <SchoolAnalyticsDashboard user={user} onBack={() => setTab('overview')} embedded={true} institutionMembers={members} />
          </div>
        )}

        {tab === 'reports' && (
          <InstitutionReporting institutionId={institution.id} institutionName={institution.name} members={members} currentTeacherId={user.role === 'teacher' ? user.id : undefined} />
        )}

        {tab === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px] relative">
            <ProfileSettingsModal isOpen={true} onClose={() => setTab('overview')} user={user} onProfileUpdate={onProfileUpdate || (() => {})} />
          </div>
        )}

        {tab === 'settings' && (
          <InstitutionSettings institution={institution} onInstitutionUpdate={setInstitution} />
        )}

        {tab === 'teacher_styles' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px] relative">
            <SchoolTeacherStylesView 
              admin={user} 
              teachers={members.filter(m => m.status === 'approved' && m.role === 'teacher').map(m => allPlatformUsers.find(u => u.id === m.userId)).filter(Boolean) as User[]}
              onBack={() => setTab('members')} 
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setInviteModalEmail('');
          setInviteModalRole('teacher');
        }}
        institutionId={institution.id}
        institutionName={institution.name}
        institutionCode={institution.code}
        onInviteSuccess={loadData}
        initialEmail={inviteModalEmail}
        initialRole={inviteModalRole}
      />

      {transferTargetId && transferTargetRole && (
        <TransferMemberModal
          isOpen={!!transferTargetId}
          onClose={() => {
            setTransferTargetId(null);
            setTransferTargetRole(null);
            setTransferTargetName('');
          }}
          memberId={transferTargetId}
          memberRole={transferTargetRole}
          memberName={transferTargetName}
          institutionId={institution.id}
          institutionName={institution.name}
          allPlatformUsers={allPlatformUsers}
          institutionMembers={members}
          onTransferSuccess={loadData}
        />
      )}

      <BulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        institutionId={institution.id}
        institutionName={institution.name}
        institutionCode={institution.code}
        onUploadSuccess={loadData}
      />

      {performanceTargetId && (
        <TeacherManagementModal
          isOpen={!!performanceTargetId}
          onClose={() => setPerformanceTargetId(null)}
          teacherId={performanceTargetId}
          institutionId={institution.id}
          allPlatformUsers={allPlatformUsers}
          onRefresh={loadData}
        />
      )}
    </div>
  );
}
