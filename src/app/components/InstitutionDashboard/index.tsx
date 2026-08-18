import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  ArrowLeft, Building2, Users, BarChart3, Download, Settings, Shield, Loader, LogOut, Brain, RefreshCw, BookOpen, Clock, GraduationCap
} from 'lucide-react';
import { DashboardLayout } from '../ui/dashboard-layout';
import { NavGroup } from '../ui/collapsible-sidebar';
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
  getCodeExpiryDate,
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
import { TrainingPage } from './TrainingPage';
import { InviteMemberModal } from './InviteMemberModal';
import { TransferMemberModal } from './TransferMemberModal';
import { BulkUploadModal } from './BulkUploadModal';
import { TeacherManagementModal } from './TeacherManagementModal';
import ClassManagement from './ClassManagement';
import { CentralStudentManagement } from '../CentralStudentManagement';
// Shared siblings
import { SchoolAnalyticsDashboard } from '../SchoolAnalyticsDashboard';
import { InstitutionReporting } from '../InstitutionReporting';
import { ProfileSettingsModal } from '../ProfileSettingsModal';
import { SchoolTeacherStylesView } from '../SchoolTeacherStylesView';
import { TeacherDashboardNew } from '../TeacherDashboardNew';

interface InstitutionDashboardProps {
  user: User;
  onLogout: () => void;
  onRegisterNew: () => void;
  initialInstitution?: Institution;
  onProfileUpdate?: () => void;
}

type Tab = 'overview' | 'manage_students' | 'student_insights' | 'teacher_management' | 'teaching_analytics' | 'reports' | 'settings' | 'profile';

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
  const [isCodeManagerOpen, setIsCodeManagerOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

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
              let assessmentType = r.assessmentType || r.type;
              
              if (!assessmentType && r.id && typeof r.id === 'string') {
                const parts = r.id.split(':');
                if (parts.length >= 3) {
                  assessmentType = parts[2];
                }
              }
              
              if (!assessmentType) assessmentType = 'unknown';

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

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadData();
      setLastRefresh(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, [institution?.id]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!institution) return;
    const interval = setInterval(() => {
      loadData().then(() => setLastRefresh(new Date()));
    }, 60000);
    return () => clearInterval(interval);
  }, [institution?.id]);

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
  
  const institutionNavGroups: NavGroup[] = [
    {
      groupLabel: 'A. SCHOOL ADMINISTRATION',
      items: [
        { id: 'overview', label: '1. Overview', icon: Building2 },
        { id: 'manage_students', label: '2. Student Management', icon: Users },
        { id: 'student_insights', label: '3. Student Insights', icon: BarChart3 },
      ]
    },
    {
      groupLabel: 'B. TEACHING & ANALYTICS',
      items: [
        { id: 'teacher_management', label: '1. Teacher Management', icon: Users },
        { id: 'teaching_analytics', label: '2. Analytics', icon: Brain },
        { id: 'reports', label: '3. Reports', icon: Download },
      ]
    },
    {
      groupLabel: 'C. ACCOUNT & SETTINGS',
      items: [
        ...(isPrimaryAdmin ? [{ id: 'settings', label: '1. School Settings', icon: Settings }] : []),
        { id: 'profile', label: '2. Administrator', icon: Shield },
      ]
    }
  ];

  const getTimeSinceRefresh = () => {
    const diff = Math.floor((Date.now() - lastRefresh.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    const mins = Math.floor(diff / 60);
    return `${mins}m ago`;
  };

  const institutionHeaderContent = (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      {institution.logo ? (
        <img src={institution.logo} alt="Logo" className="w-8 h-8 object-contain rounded" />
      ) : (
        <div className="w-8 h-8 rounded bg-[#5B7DB1] flex items-center justify-center text-white text-sm font-bold">
          {institution.name.charAt(0)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="text-base text-gray-900 font-semibold truncate">{institution.name}</h1>
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
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] text-gray-400 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {getTimeSinceRefresh()}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`w-4 h-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );

  return (
    <DashboardLayout
      navGroups={institutionNavGroups}
      activeTab={tab}
      setActiveTab={(val: any) => setTab(val)}
      user={user}
      onLogout={onLogout}
      brandSubtitle="Institution Portal"
      headerContent={institutionHeaderContent}
    >
      <div className="max-w-7xl mx-auto space-y-6">
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
            onManageCodes={isPrimaryAdmin ? () => setIsCodeManagerOpen(true) : undefined}
          />
        )}

        {tab === 'teacher_management' && (
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
            onViewTeacherStyles={() => setTab('teaching_analytics')}
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
          <CentralStudentManagement 
            teacher={user} 
            assessments={memberAssessments}
            students={allPlatformUsers.filter(u => u.role === 'student' && members.some(m => m.userId === u.id)).map(stu => {
              // Add basic assessment status so CentralStudentManagement works
              const stuAssessments = memberAssessments.filter(a => a.userId === stu.id && a.score);
              return {
                ...stu,
                hasCompletedAssessment: stuAssessments.length > 0
              };
            })}
          />
        )}



        {tab === 'student_insights' && (
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

        {tab === 'teaching_analytics' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px] relative">
            <SchoolTeacherStylesView 
              admin={user} 
              teachers={members.filter(m => m.status === 'approved' && m.role === 'teacher').map(m => allPlatformUsers.find(u => u.id === m.userId)).filter(Boolean) as User[]}
              onBack={() => setTab('teacher_management')} 
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

      {isCodeManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Manage School Codes</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsCodeManagerOpen(false)}>✕</Button>
            </div>
            <div className="p-4">
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
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
