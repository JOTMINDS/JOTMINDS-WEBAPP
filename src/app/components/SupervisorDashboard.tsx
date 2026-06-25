import { useState, useEffect } from 'react';
import { User, SupervisorReviewData } from '../types';
import { getAllUsers, getAssessmentsByUserId, saveReview, getReviewsByProfessional, getReviewsBySupervisor, getAssessmentFrequency } from '../utils/storage';
import { getAuthToken, getSupervisedEmployees, removeSupervisedEmployee } from '../utils/api';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { createClient } from '../utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { OrganizationInsights } from './OrganizationInsights';
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
  Mail
} from 'lucide-react';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { formatDate } from '../utils/dateFormat';
import { toast } from 'sonner';
import { MobileHeaderMenu } from './MobileHeaderMenu';
import { TeacherStudentManagement } from './TeacherStudentManagement';
import { SupervisorReview } from './SupervisorReview';
import { ProfessionalCognitiveResults } from './ProfessionalCognitiveResults';
import { calculateProfessionalCognitiveProfile } from '../utils/professionalCognitiveScoring';

interface SupervisorDashboardProps {
  user: User;
  onLogout: () => void;
  onViewSettings?: () => void;
}

export function SupervisorDashboard({ user, onLogout, onViewSettings }: SupervisorDashboardProps) {
  const [professionals, setProfessionals] = useState<User[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [organizationCode, setOrganizationCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);

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
          toast.success('Organization code loaded successfully!');
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
      const profile = calculateProfessionalCognitiveProfile(completedAssessments);
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
      toast.success('Reminder sent successfully!');
    } catch (error: any) {
      toast.error('Failed to send reminder');
    }
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

  const filteredProfessionals = professionals.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-10 dark:bg-gray-950/90 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  {dashboardTitle}
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    {user.organizationName}
                  </p>
                  {user.industrySector && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <Badge variant="outline" className="text-xs">
                        {user.industrySector}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.position}</p>
              </div>
              <Button variant="outline" onClick={handleExportCSV} size="sm" className="sm:size-default">
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
              {onViewSettings && (
                <Button variant="outline" onClick={onViewSettings} size="sm" className="sm:size-default">
                  <Settings className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              )}
              <Button variant="outline" onClick={onLogout} size="sm" className="sm:size-default">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="professionals">
              <Users className="h-4 w-4 mr-2" />
              Professionals
            </TabsTrigger>
            <TabsTrigger value="insights">
              <PieChart className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Organization Code Card - PROMINENT */}
            {organizationCode && (
              <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg">
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
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Total {professionalsTerm}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl">{organizationStats.totalProfessionals}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Assessed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl">{organizationStats.assessedProfessionals}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {organizationStats.totalProfessionals > 0 
                      ? Math.round((organizationStats.assessedProfessionals / organizationStats.totalProfessionals) * 100)
                      : 0}% completion
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Fully Assessed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl">{organizationStats.fullyAssessed}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All 3 assessments complete
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Total Reviews
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl">{organizationStats.totalReviews}</div>
                </CardContent>
              </Card>
            </div>

            {/* Welcome Card */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  Welcome to Your Organization Dashboard
                </CardTitle>
                <CardDescription>
                  Review and manage cognitive assessments for professionals in {user.organizationName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <span>•</span>
                    <span>View all professionals from your organization who have completed assessments</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span>•</span>
                    <span>Review their cognitive profiles to understand strengths and development areas</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span>•</span>
                    <span>Provide structured feedback to align roles with cognitive capabilities</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span>•</span>
                    <span>Track performance reviews and development plans over time</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Access */}
            {professionals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Access</CardTitle>
                  <CardDescription>Recently active {professionalsTerm.toLowerCase()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {professionals.slice(0, 5).map(prof => {
                      const stats = getProfessionalStats(prof);
                      return (
                        <div
                          key={prof.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedProfessional(prof);
                            setActiveTab('professionals');
                          }}
                        >
                          <div>
                            <p>{prof.name}</p>
                            <p className="text-sm text-muted-foreground">{prof.position}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {stats.completedAssessments}/3 assessments
                            </Badge>
                            {stats.totalReviews > 0 && (
                              <Badge variant="secondary">
                                {stats.totalReviews} review{stats.totalReviews > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Professionals Tab */}
          <TabsContent value="professionals" className="space-y-6">
            {professionals.length === 0 ? (
              <Card className="p-12">
                <div className="text-center text-muted-foreground flex flex-col items-center justify-center">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium text-gray-900 mb-2">No {professionalsTerm.toLowerCase()} have registered yet</p>
                  <p className="mb-6 max-w-md mx-auto">
                    Invite your team members to join {user.organizationName} and complete their cognitive assessments.
                  </p>
                  <Button onClick={() => setShowInviteModal(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Invite Team Member
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Professional List */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-24">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Team Members
                        </div>
                        <Button size="sm" onClick={() => setShowInviteModal(true)}>
                          <Plus className="h-4 w-4 mr-2" /> Invite
                        </Button>
                      </CardTitle>
                      <div className="pt-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder={`Search ${professionalsTerm.toLowerCase()}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[600px]">
                        <div className="space-y-1 p-4 pt-0">
                          {filteredProfessionals.map((prof) => {
                            const stats = getProfessionalStats(prof);
                            const isSelected = selectedProfessional?.id === prof.id;
                            
                            return (
                              <button
                                key={prof.id}
                                onClick={() => setSelectedProfessional(prof)}
                                className={`w-full text-left p-3 rounded-lg border transition-all ${
                                  isSelected
                                    ? 'bg-purple-50 border-purple-300 shadow-sm'
                                    : 'hover:bg-accent border-transparent'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{prof.name}</p>
                                    <p className="text-sm text-muted-foreground truncate">
                                      {prof.position}
                                    </p>
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
                    </CardContent>
                  </Card>
                </div>

                {/* Professional Details & Review */}
                <div className="lg:col-span-2">
                  {selectedProfessional ? (
                    <ProfessionalReviewSection
                      professional={selectedProfessional}
                      supervisor={user}
                      term={professionalTerm}
                      onRemove={handleRemove}
                      onNudge={handleNudge}
                    />
                  ) : (
                    <Card className="h-full flex items-center justify-center p-12">
                      <div className="text-center text-muted-foreground">
                        <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Select a {professionalTerm.toLowerCase()} to view their assessments and add reviews</p>
                      </div>
                    </Card>
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
      </div>
    </div>
  );
}

// Separate component for professional review section
function ProfessionalReviewSection({ 
  professional, 
  supervisor,
  term = 'Employee',
  onRemove,
  onNudge
}: { 
  professional: User; 
  supervisor: User;
  term?: string;
  onRemove?: (id: string) => void;
  onNudge?: (email: string, name: string) => void;
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
    const profile = calculateProfessionalCognitiveProfile(completedAssessments);
    return (
      <ProfessionalCognitiveResults 
        profile={profile}
        userName={professional.name}
        userPosition={professional.position}
        userLocation={professional.country || ''}
        onBack={() => setIsViewingProfile(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
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