import { useState, useEffect } from 'react';
import { User, SupervisorReviewData, OrganizationCodeDetails } from '../types';
import { getAllUsers, getAssessmentsByUserId, saveReview, getReviewsByProfessional, getReviewsBySupervisor, getAssessmentFrequency } from '../utils/storage';
import { getAuthToken, getSupervisedEmployees, removeSupervisedEmployee, getOrganizationCodeDetails } from '../utils/api';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { createClient } from '../utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { OrganizationInsights } from './OrganizationInsights';
import { OrganizationBulkUploadModal } from './OrganizationBulkUploadModal';
import { RoleProfilesManager } from './RoleProfilesManager';
import { RoleFitDashboard } from './RoleFitDashboard';
import { OrganizationCodeManager } from './OrganizationCodeManager';
import { 
  Building2, 
  LogOut, 
  Users, 
  FileText, 
  Search,
  CheckCircle2,
  Clock,
  TrendingUp,
  UserCheck,
  BarChart3,
  ShieldCheck,
  Copy,
  Check,
  School,
  GraduationCap,
  PieChart,
  Settings,
  Download,
  Plus,
  Send,
  UserMinus,
  Mail,
  Upload,
  Target,
  ArrowLeft
} from 'lucide-react';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { formatDate } from '../utils/dateFormat';
import { toast } from 'sonner';
import { MobileHeaderMenu } from './MobileHeaderMenu';
import { TeacherStudentManagement } from './TeacherStudentManagement';
import { SupervisorReview } from './SupervisorReview';
import { ProfessionalCognitiveResults } from './ProfessionalCognitiveResults';
import { calculateProfessionalCognitiveProfile, getProfessionalInsights } from '../utils/professionalCognitiveScoring';

interface SupervisorDashboardProps {
  user: User;
  onLogout: () => void;
  onViewSettings?: () => void;
}

// Helper to map generic assessments to the format expected by calculateProfessionalCognitiveProfile
export function mapAssessmentsToResponses(assessments: any[]) {
  const profCognitive = assessments.find(a => a.type === 'professional-cognitive');
  if (profCognitive && profCognitive.responses && Array.isArray(profCognitive.responses.learning)) {
    return profCognitive.responses;
  }
  
  const kolb = assessments.find(a => a.type === 'kolb');
  const sternberg = assessments.find(a => a.type === 'sternberg');
  const dual = assessments.find(a => a.type === 'dual-process');
  
  let learningScore = 15;
  if (kolb && kolb.scores) {
     learningScore = Math.min(30, Math.round(((kolb.scores.ae || 0) + (kolb.scores.ce || 0)) * 1.5));
  }
  
  let thinkingScore = 15;
  if (sternberg && sternberg.scores) {
     thinkingScore = Math.min(30, Math.round(((sternberg.scores.creative || 0) + (sternberg.scores.analytical || 0)) * 1.5));
  }
  
  let decisionScore = 15;
  if (dual && dual.scores) {
     decisionScore = Math.min(30, Math.round((dual.scores.system2 || 0) * 1.5));
  }
  
  return {
    learning: [learningScore],
    thinking: [thinkingScore],
    decisionMaking: [decisionScore],
    motivation: [15]
  };
}

export function SupervisorDashboard({ user, onLogout, onViewSettings }: SupervisorDashboardProps) {
  const [professionals, setProfessionals] = useState<User[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [organizationCode, setOrganizationCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [codeDetails, setCodeDetails] = useState<OrganizationCodeDetails | null>(null);

  const dashboardTitle = user.role === 'organization' ? 'Organization Portal' : 'Supervisor Portal';
  const professionalTerm = 'Professional';
  const professionalsTerm = 'Professionals';

  useEffect(() => {
    loadProfessionals();
  }, [user.organizationName]);

  const loadProfessionals = async () => {
    try {
      console.log('[SupervisorDashboard] Loading professionals and organization code...');
      
      // Use getSupervisedEmployees which handles auth headers correctly (including admin tokens)
      const data = await getSupervisedEmployees(user.id);
      
      console.log('[SupervisorDashboard] Received data:', data);
      
      if (data.success) {
        setProfessionals(data.employees || []);
        setOrganizationCode(data.organizationCode || '');
        console.log('[SupervisorDashboard] Organization code:', data.organizationCode);
        
        if (data.organizationCode) {
          try {
            const detailsData = await getOrganizationCodeDetails();
            if (detailsData && detailsData.success) {
              setCodeDetails({
                organizationCode: detailsData.organizationCode,
                codeGeneratedAt: detailsData.codeGeneratedAt,
                codeExpiryDays: detailsData.codeExpiryDays,
                isActive: detailsData.isActive
              });
            }
          } catch (err) {
            console.error('[SupervisorDashboard] Error loading code details:', err);
          }
        }
      } else {
        // This might happen if makeRequest doesn't throw but returns error object
        // though makeRequest usually throws if not ok.
        console.error('[SupervisorDashboard] Error response:', data);
        toast.error(`Failed to load team members: ${data.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('[SupervisorDashboard] Error loading professionals:', error);
      toast.error(`Error loading team members: ${error.message || 'Unknown error'}`);
    }
  };

  const copyOrgCode = async () => {
    if (!organizationCode) return;
    
    try {
      // Try modern API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(organizationCode);
        setCopiedCode(true);
        toast.success('Organization code copied to clipboard!');
        setTimeout(() => setCopiedCode(false), 2000);
      } else {
        throw new Error('Clipboard API not available');
      }
    } catch (error) {
      console.warn('Clipboard API failed, trying fallback:', error);
      
      // Fallback for restricted environments
      try {
        const textArea = document.createElement("textarea");
        textArea.value = organizationCode;
        
        // Ensure it's not visible but part of DOM
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopiedCode(true);
          toast.success('Organization code copied to clipboard!');
          setTimeout(() => setCopiedCode(false), 2000);
        } else {
          throw new Error('Fallback copy failed');
        }
      } catch (fallbackError) {
        console.error('Failed to copy code:', fallbackError);
        toast.error('Failed to copy code. Please select and copy manually.');
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Assessments Completed', 'Dominant Thinking Style', 'Last Review Date'];
    
    const rows = professionals.map(prof => {
      const assessments = prof.assessments || getAssessmentsByUserId(prof.id);
      const completedAssessments = assessments.filter((a: any) => a.completedAt);
      const profile = calculateProfessionalCognitiveProfile(mapAssessmentsToResponses(completedAssessments));
      const reviews = prof.reviews || getReviewsByProfessional(prof.id);
      const lastReview = reviews.length > 0 ? formatDate(reviews[0].createdAt) : 'Never';
      
      return [
        `"${prof.name}"`,
        `"${prof.email}"`,
        `"${prof.position || prof.role || 'Member'}"`,
        completedAssessments.length,
        `"${profile.thinking.style}"`,
        `"${lastReview}"`
      ].join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `Team_Analytics_${formatDate(new Date().toISOString())}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showRoleProfilesModal, setShowRoleProfilesModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Extract unique departments from professionals
  const departments = Array.from(new Set(professionals.map(p => p.department).filter(Boolean))) as string[];

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847/send-professional-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          professionalName: inviteName,
          organizationName: user.organizationName,
          organizationCode: organizationCode,
          supervisorName: user.name
        })
      });
      if (!response.ok) throw new Error('Failed to send invite');
      toast.success('Invitation sent successfully!');
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteName('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (professionalId: string) => {
    if (!confirm('Are you sure you want to remove this employee from your organization?')) return;
    try {
      await removeSupervisedEmployee(professionalId);
      toast.success('Employee removed successfully');
      if (selectedProfessional?.id === professionalId) setSelectedProfessional(null);
      const res = await getSupervisedEmployees();
      if (res.success) setProfessionals(res.employees || []);
    } catch (error: any) {
      toast.error('Failed to remove employee');
    }
  };

  const handleNudge = async (professionalEmail: string, professionalName: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847/send-reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: professionalEmail,
          professionalName: professionalName,
          organizationName: user.organizationName
        })
      });
      if (!response.ok) throw new Error('Failed to send reminder');
      toast.success(`Reminder sent to ${professionalName}`);
    } catch (error: any) {
      toast.error(`Failed to send reminder to ${professionalName}`);
    }
  };

  const [isNudgingAll, setIsNudgingAll] = useState(false);
  
  const handleNudgeAllPending = async () => {
    const pendingProfessionals = professionals.filter(prof => {
      const stats = getProfessionalStats(prof);
      return !stats.hasAllThreeAssessments;
    });

    if (pendingProfessionals.length === 0) {
      toast.info('All team members have completed their assessments!');
      return;
    }

    if (!confirm(`Are you sure you want to send reminder emails to ${pendingProfessionals.length} pending team members?`)) return;

    setIsNudgingAll(true);
    let successCount = 0;
    
    // We run them sequentially to avoid hammering the endpoint, or Promise.all if it's safe.
    for (const prof of pendingProfessionals) {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847/send-reminder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: prof.email,
            professionalName: prof.name,
            organizationName: user.organizationName
          })
        });
        if (response.ok) successCount++;
      } catch (e) {
        console.error("Failed to nudge", prof.email);
      }
    }
    
    setIsNudgingAll(false);
    toast.success(`Sent reminders to ${successCount} out of ${pendingProfessionals.length} pending members.`);
  };

  const getProfessionalStats = (professional: User) => {
    // Use assessments from API if available, otherwise fallback to local storage
    const assessments = professional.assessments || getAssessmentsByUserId(professional.id);
    const reviews = professional.reviews || getReviewsByProfessional(professional.id);
    
    const completedAssessments = assessments.filter(a => a.completedAt);
    const latestReview = reviews.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    return {
      totalAssessments: assessments.length,
      completedAssessments: completedAssessments.length,
      totalReviews: reviews.length,
      latestReview,
      hasAllThreeAssessments: completedAssessments.filter(a => a.type === 'kolb').length > 0 &&
                              completedAssessments.filter(a => a.type === 'sternberg').length > 0 &&
                              completedAssessments.filter(a => a.type === 'dual-process').length > 0
    };
  };

  const filteredProfessionals = professionals.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'all' || p.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const organizationStats = {
    totalProfessionals: professionals.length,
    assessedProfessionals: professionals.filter(p => {
      const assessments = p.assessments || getAssessmentsByUserId(p.id);
      return assessments.some(a => a.completedAt);
    }).length,
    totalReviews: professionals.reduce((sum, p) => {
      const reviews = p.reviews || getReviewsByProfessional(p.id);
      return sum + reviews.length;
    }, 0),
    fullyAssessed: professionals.filter(p => {
      const stats = getProfessionalStats(p);
      return stats.hasAllThreeAssessments;
    }).length
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 font-sans selection:bg-purple-200 dark:selection:bg-purple-900">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Premium Header & Navigation */}
        <header className="sticky top-0 z-40 w-full bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo / Title Area */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                      {user.organizationName}
                    </h1>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {dashboardTitle} {user.industrySector ? `• ${user.industrySector}` : ''}
                    </p>
                  </div>
                </div>

                {/* Horizontal Navigation */}
                <TabsList className="hidden md:flex h-full bg-transparent p-0 space-x-1 border-0">
                  <TabsTrigger 
                    value="overview" 
                    className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-white/10 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 rounded-lg px-4 py-2 text-sm font-medium transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-0 shadow-none"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="professionals" 
                    className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-white/10 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 rounded-lg px-4 py-2 text-sm font-medium transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-0 shadow-none"
                  >
                    Professionals
                  </TabsTrigger>
                  <TabsTrigger 
                    value="insights" 
                    className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-white/10 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 rounded-lg px-4 py-2 text-sm font-medium transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-0 shadow-none"
                  >
                    Insights
                  </TabsTrigger>
                  <TabsTrigger 
                    value="role-fit" 
                    className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-white/10 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 rounded-lg px-4 py-2 text-sm font-medium transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-0 shadow-none flex items-center gap-2"
                  >
                    <Target className="w-4 h-4" /> Role Matcher
                  </TabsTrigger>
                  <TabsTrigger 
                    value="codes" 
                    className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-white/10 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 rounded-lg px-4 py-2 text-sm font-medium transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-0 shadow-none flex items-center gap-2"
                  >
                    Codes
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Actions Area */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end mr-2">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-none">{user.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{user.position}</p>
                </div>
                
                <Button variant="ghost" size="icon" onClick={handleExportCSV} className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full" title="Export CSV">
                  <Download className="h-4 w-4" />
                </Button>
                
                {onViewSettings && (
                  <Button variant="ghost" size="icon" onClick={onViewSettings} className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full" title="Settings">
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
                
                <Button variant="ghost" size="icon" onClick={onLogout} className="text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full" title="Logout">
                  <LogOut className="h-4 w-4" />
                </Button>
                
                {/* Mobile Menu Trigger Placeholder (if needed) */}
                <div className="md:hidden">
                  <MobileHeaderMenu user={user} onLogout={onLogout} onSettings={onViewSettings} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Navigation (shows below header on small screens) */}
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-black/50 backdrop-blur-md px-2 py-2 overflow-x-auto">
            <TabsList className="flex w-full justify-start bg-transparent p-0 border-0 gap-1 h-auto">
              <TabsTrigger value="overview" className="flex-1 data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-white/10 shadow-none rounded-md text-xs py-2">Overview</TabsTrigger>
              <TabsTrigger value="professionals" className="flex-1 data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-white/10 shadow-none rounded-md text-xs py-2">Professionals</TabsTrigger>
              <TabsTrigger value="insights" className="flex-1 data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-white/10 shadow-none rounded-md text-xs py-2">Insights</TabsTrigger>
              <TabsTrigger value="role-fit" className="flex-1 data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-white/10 shadow-none rounded-md text-xs py-2">Roles</TabsTrigger>
              <TabsTrigger value="codes" className="flex-1 data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-white/10 shadow-none rounded-md text-xs py-2">Codes</TabsTrigger>
            </TabsList>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8 mt-0 border-0 p-0">
            {/* Premium Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
              
              <div className="relative px-8 py-12 sm:px-12 sm:py-16 flex flex-col md:flex-row items-center justify-between z-10">
                <div className="max-w-2xl">
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                    Shape your dynamic workforce.
                  </h2>
                  <p className="text-indigo-100 text-lg mb-8 max-w-xl leading-relaxed">
                    Gain unparalleled insights into your team's cognitive diversity. Review profiles, map synergies, and build stronger teams aligned with their natural thinking styles.
                  </p>
                  
                  <div className="flex flex-wrap gap-4">
                    <Button onClick={() => setShowInviteModal(true)} className="bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl px-6 py-6 font-semibold shadow-lg transition-transform hover:-translate-y-1">
                      <Plus className="mr-2 h-5 w-5" /> Invite Member
                    </Button>
                    <Button onClick={() => setShowBulkUploadModal(true)} variant="outline" className="bg-transparent border-indigo-300 text-white hover:bg-indigo-800/50 rounded-xl px-6 py-6 font-medium backdrop-blur-sm transition-all">
                      <Upload className="mr-2 h-5 w-5" /> Bulk Upload
                    </Button>
                  </div>
                </div>
                
                <div className="hidden md:block">
                  <div className="w-48 h-48 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl flex flex-col justify-between transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <Users className="text-white h-5 w-5" />
                      </div>
                      <Badge className="bg-green-400/20 text-green-300 hover:bg-green-400/30 border-0">+{organizationStats.assessedProfessionals}</Badge>
                    </div>
                    <div>
                      <p className="text-indigo-200 text-sm font-medium">Assessed Team</p>
                      <p className="text-4xl font-bold tracking-tight">{organizationStats.assessedProfessionals}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:bg-white dark:hover:bg-slate-900 hover:-translate-y-1 transition-all duration-300 cursor-default">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total {professionalsTerm}</h3>
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{organizationStats.totalProfessionals}</span>
                </div>
              </div>

              <div className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:bg-white dark:hover:bg-slate-900 hover:-translate-y-1 transition-all duration-300 cursor-default">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Assessed</h3>
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{organizationStats.assessedProfessionals}</span>
                </div>
                <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-purple-500 h-full rounded-full" 
                    style={{ width: `${organizationStats.totalProfessionals > 0 ? (organizationStats.assessedProfessionals / organizationStats.totalProfessionals) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:bg-white dark:hover:bg-slate-900 hover:-translate-y-1 transition-all duration-300 cursor-default">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Fully Assessed</h3>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{organizationStats.fullyAssessed}</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">All 3 assessments complete</p>
              </div>

              <div className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:bg-white dark:hover:bg-slate-900 hover:-translate-y-1 transition-all duration-300 cursor-default">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Reviews</h3>
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <FileText className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{organizationStats.totalReviews}</span>
                </div>
              </div>
            </div>

            {/* Quick Access */}
            {professionals.length > 0 && (
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Recent Activity</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Recently active team members</p>
                  </div>
                  <Button variant="ghost" onClick={() => setActiveTab('professionals')} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                    View All
                  </Button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {professionals.slice(0, 5).map(prof => {
                    const stats = getProfessionalStats(prof);
                    return (
                      <div
                        key={prof.id}
                        className="flex items-center justify-between p-4 sm:p-6 hover:bg-white/80 dark:hover:bg-slate-800/80 cursor-pointer transition-colors group"
                        onClick={() => {
                          setSelectedProfessional(prof);
                          setActiveTab('professionals');
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold group-hover:scale-110 transition-transform">
                            {prof.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{prof.name}</p>
                            <p className="text-sm text-slate-500">{prof.position || 'Professional'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                            {stats.completedAssessments}/3 
                            <span className="hidden sm:inline ml-1">assessments</span>
                          </Badge>
                          {stats.totalReviews > 0 && (
                            <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-0 dark:bg-indigo-900/50 dark:text-indigo-300">
                              {stats.totalReviews} <span className="hidden sm:inline ml-1">review{stats.totalReviews > 1 ? 's' : ''}</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Professionals Tab */}
          <TabsContent value="professionals" className="space-y-6">
            {professionals.length === 0 ? (
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-12 shadow-sm text-center">
                <div className="text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
                    <Users className="h-10 w-10 text-indigo-300 dark:text-indigo-700" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No {professionalsTerm.toLowerCase()} have registered yet</p>
                  <p className="mb-8 max-w-md mx-auto text-slate-500">
                    Invite your team members to join {user.organizationName} and complete their cognitive assessments.
                  </p>
                  <div className="flex gap-4">
                    <Button onClick={() => setShowInviteModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg hover:-translate-y-1 transition-transform">
                      <Plus className="h-5 w-5 mr-2" /> Invite Team Member
                    </Button>
                    <Button variant="outline" onClick={() => setShowBulkUploadModal(true)} className="rounded-xl border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                      <Upload className="h-5 w-5 mr-2" /> Bulk Invite
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Professional List (Master) */}
                <div className={`lg:col-span-1 min-w-0 overflow-hidden ${selectedProfessional ? 'hidden lg:block' : ''}`}>
                  <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl overflow-hidden shadow-sm lg:sticky lg:top-24">
                    <div className="p-4 sm:p-6 border-b border-slate-200/60 dark:border-slate-800/60 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">Team Members</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          <Button size="sm" variant="ghost" className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-2" onClick={handleNudgeAllPending} disabled={isNudgingAll} title="Nudge Pending">
                            <Send className="h-4 w-4 xl:mr-1" />
                            <span className="hidden xl:inline">Nudge</span>
                          </Button>
                          <Button size="sm" variant="ghost" className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-2" onClick={() => setShowRoleProfilesModal(true)} title="Roles">
                            <Target className="h-4 w-4 xl:mr-1" />
                            <span className="hidden xl:inline">Roles</span>
                          </Button>
                          <Button size="sm" variant="ghost" className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-2" onClick={() => setShowBulkUploadModal(true)} title="Bulk Upload">
                            <Upload className="h-4 w-4 xl:mr-1" />
                            <span className="hidden xl:inline">Bulk</span>
                          </Button>
                          <Button size="sm" variant="default" className="bg-indigo-600 hover:bg-indigo-700 px-2" onClick={() => setShowInviteModal(true)} title="Invite">
                            <Plus className="h-4 w-4 xl:mr-1" />
                            <span className="hidden xl:inline">Invite</span>
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1 min-w-0">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder={`Search ${professionalsTerm.toLowerCase()}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl focus-visible:ring-indigo-500 w-full"
                          />
                        </div>
                        {departments.length > 0 && (
                          <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="px-3 py-2 bg-white/80 border-slate-200 rounded-xl text-sm dark:bg-slate-800/80 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="all">All Depts</option>
                            {departments.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                    <div className="p-0">
                    <ScrollArea className="h-[600px]">
                      <div className="space-y-1 p-4">
                        {filteredProfessionals.map((prof) => {
                          const stats = getProfessionalStats(prof);
                          const isSelected = selectedProfessional?.id === prof.id;
                          
                          return (
                            <button
                              key={prof.id}
                              onClick={() => setSelectedProfessional(prof)}
                              className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                                isSelected
                                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800 shadow-sm'
                                  : 'hover:bg-white/80 dark:hover:bg-slate-800/80 border-transparent hover:shadow-sm'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                  <span className="font-bold text-slate-500 dark:text-slate-400">{prof.name.charAt(0)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{prof.name}</p>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground truncate">
                                    <span>{prof.position}</span>
                                    {prof.department && (
                                      <>
                                        <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                                        <span className="font-medium text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded">
                                          {prof.department}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    {stats.completedAssessments > 0 ? (
                                      <Badge variant="outline" className="text-xs">
                                        {stats.completedAssessments}/3
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary" className="text-xs">
                                        No assessments
                                      </Badge>
                                    )}
                                    <Badge variant="outline" className="text-xs border-indigo-200 text-indigo-700 bg-indigo-50/30">
                                      {getAssessmentFrequency(prof.id)}
                                    </Badge>
                                    {stats.totalReviews > 0 && (
                                      <Badge variant="secondary" className="text-xs">
                                        <FileText className="h-3 w-3 mr-1" />
                                        {stats.totalReviews}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {stats.hasAllThreeAssessments && (
                                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>

              {/* Professional Details View (Detail) */}
                <div className={`lg:col-span-2 min-w-0 ${!selectedProfessional ? 'hidden lg:block' : ''}`}>
                  {selectedProfessional ? (
                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl overflow-hidden shadow-sm">
                      <div className="p-6">
                        <ProfessionalReviewSection
                          professional={selectedProfessional}
                          supervisor={user}
                          term={professionalTerm}
                          onRemove={handleRemove}
                          onNudge={handleNudge}
                          onClearSelection={() => setSelectedProfessional(null)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/40 dark:border-slate-800/40 rounded-3xl h-full min-h-[400px] flex items-center justify-center p-12 text-center shadow-sm">
                      <div className="max-w-sm">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                          <UserCheck className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Select a Team Member</h3>
                        <p className="text-slate-500 dark:text-slate-400">
                          Choose a {professionalTerm.toLowerCase()} from the list to view their assessments and add reviews.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <OrganizationInsights 
              professionals={professionals} 
              organizationName={user.organizationName || 'your organization'} 
            />
          </TabsContent>

          {/* Role Matcher Tab */}
          <TabsContent value="role-fit" className="space-y-6">
            <RoleFitDashboard
              orgId={user.organizationName || user.id}
              professionals={professionals}
            />
          </TabsContent>

          {/* Codes Tab */}
          <TabsContent value="codes" className="space-y-6">
            {codeDetails ? (
              <OrganizationCodeManager
                details={codeDetails}
                totalMembersCount={professionals.length}
                onUpdate={setCodeDetails}
              />
            ) : organizationCode ? (
              <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg max-w-3xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-indigo-600" />
                    Organization Code
                  </CardTitle>
                  <CardDescription>
                    Share this code with team members to join your organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-white border-2 border-indigo-200 rounded-lg px-4 py-3">
                      <code className="text-2xl tracking-wider" style={{ color: '#5B7DB1' }}>
                        {organizationCode}
                      </code>
                    </div>
                    <Button 
                      size="lg" 
                      onClick={copyOrgCode}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Code
                        </>
                      )}
                    </Button>
                  </div>
                  <Alert className="bg-white/50 border-indigo-200">
                    <AlertDescription className="text-sm">
                      💡 Team members need to select "Professional/Organization" during signup and enter this code to join your organization
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No organization code available.</p>
              </div>
            )}
          </TabsContent>
        </main>
      </Tabs>

        {showInviteModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl">
              <CardHeader>
                <CardTitle>Invite Team Member</CardTitle>
                <CardDescription>
                  Send an email invitation to join your organization.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInvite} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input 
                      placeholder="Jane Doe" 
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input 
                      type="email"
                      placeholder="jane@example.com" 
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowInviteModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isInviting}>
                      {isInviting ? 'Sending...' : 'Send Invitation'}
                      {!isInviting && <Mail className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        <OrganizationBulkUploadModal
          isOpen={showBulkUploadModal}
          onClose={() => setShowBulkUploadModal(false)}
          organizationName={user.organizationName || ''}
          organizationCode={organizationCode}
          supervisorName={user.name}
          onSuccess={() => {
            getSupervisedEmployees(user.id).then(res => {
              if (res.success) setProfessionals(res.employees || []);
            });
          }}
        />

        {showRoleProfilesModal && (
          <RoleProfilesManager 
            orgId={user.id} 
            onClose={() => setShowRoleProfilesModal(false)} 
          />
        )}
      </div>
  );
}

// Separate component for professional review section
function ProfessionalReviewSection({ 
  professional, 
  supervisor,
  term = 'Employee',
  onRemove,
  onNudge,
  onClearSelection
}: { 
  professional: User; 
  supervisor: User;
  term?: string;
  onRemove?: (id: string) => void;
  onNudge?: (email: string, name: string) => void;
  onClearSelection?: () => void;
}) {
  const [showNewReview, setShowNewReview] = useState(false);
  const [isViewingProfile, setIsViewingProfile] = useState(false);
  const assessments = professional.assessments || getAssessmentsByUserId(professional.id);
  const completedAssessments = assessments.filter(a => a.completedAt);
  const reviews = professional.reviews || getReviewsByProfessional(professional.id);

  if (completedAssessments.length === 0) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full p-12 text-center space-y-4">
          <Clock className="h-12 w-12 text-muted-foreground opacity-50" />
          <div>
            <h3 className="font-semibold text-lg">{professional.name} hasn't completed any assessments</h3>
            <p className="text-muted-foreground mt-1">
              Reviews can be added once they complete at least one cognitive assessment.
            </p>
          </div>
          <div className="flex gap-2 mt-4">
            {onNudge && (
              <Button onClick={() => onNudge(professional.email, professional.name)}>
                <Send className="h-4 w-4 mr-2" /> Send Reminder
              </Button>
            )}
            {onRemove && (
              <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => onRemove(professional.id)}>
                <UserMinus className="h-4 w-4 mr-2" /> Remove {term}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isViewingProfile) {
    const profile = calculateProfessionalCognitiveProfile(mapAssessmentsToResponses(completedAssessments));
    return (
      <ProfessionalCognitiveResults 
        profile={profile}
        userName={professional.name}
        userPosition={professional.position}
        userLocation={professional.country || ''}
        supervisorId={supervisor.id}
        onBack={() => setIsViewingProfile(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {onClearSelection && (
        <Button variant="ghost" onClick={onClearSelection} className="lg:hidden mb-4 -ml-2 text-slate-500">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to List
        </Button>
      )}
      
      {/* Professional Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{professional.name}</CardTitle>
              <CardDescription className="mt-1">
                {professional.position} • {professional.email}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {onRemove && (
                <Button
                  onClick={() => onRemove(professional.id)}
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  Remove
                </Button>
              )}
              <Button
                onClick={() => setIsViewingProfile(true)}
                variant="outline"
              >
                View Profile
              </Button>
              <Button
                onClick={() => setShowNewReview(!showNewReview)}
                variant={showNewReview ? "outline" : "default"}
              >
                {showNewReview ? 'Cancel Review' : 'New Review'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>{completedAssessments.length} assessment{completedAssessments.length > 1 ? 's' : ''} completed</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <span>{reviews.length} review{reviews.length > 1 ? 's' : ''} on file</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Review Form */}
      {showNewReview && (
        <SupervisorReview
          employeeName={professional.name}
          assessments={completedAssessments}
          supervisorId={supervisor.id}
          professionalId={professional.id}
          onReviewSubmitted={() => setShowNewReview(false)}
          subjectTerm={term}
        />
      )}

      {/* Previous Reviews */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Review History</CardTitle>
            <CardDescription>
              {reviews.length} review{reviews.length > 1 ? 's' : ''} completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviews
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((review) => (
                  <div key={review.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge>{review.performanceRating}</Badge>
                        <Badge variant="outline">{review.roleAlignment}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(review.reviewDate)}
                      </p>
                    </div>
                    
                    {review.strengths && (
                      <div>
                        <p className="text-sm font-medium mb-1">Strengths:</p>
                        <p className="text-sm text-muted-foreground">{review.strengths}</p>
                      </div>
                    )}
                    
                    {review.developmentAreas && (
                      <div>
                        <p className="text-sm font-medium mb-1">Development Areas:</p>
                        <p className="text-sm text-muted-foreground">{review.developmentAreas}</p>
                      </div>
                    )}

                    {review.supervisorComments && (
                      <div>
                        <p className="text-sm font-medium mb-1">Comments:</p>
                        <p className="text-sm text-muted-foreground">{review.supervisorComments}</p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}