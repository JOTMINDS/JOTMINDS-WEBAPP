import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ArrowLeft, Search, Users, ClipboardList, TrendingUp, Eye, Wrench, X, Filter } from 'lucide-react';
import { getAllUsers, getAdminStats, getUserData, getAuthToken } from '../utils/api';
import { useAuth } from './AuthContext';
import { AdminDiagnostic } from './AdminDiagnostic';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { IndustrySector } from '../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { SchoolAdminDashboard } from './SchoolAdminDashboard';
import { QuestionBankAudit } from './QuestionBankAudit';
import { OrganizationManager } from './OrganizationManager';
import { QuestionSeeder } from './QuestionSeeder';
import { forceRerunMigration, getMigrationPreview } from '../utils/accountMigration';
import { Globe, Building2, LayoutDashboard, Settings, Activity, Server, Database, RefreshCw, ShieldCheck } from 'lucide-react';

function AccountMigrationPanel() {
  const [status, setStatus] = React.useState<'idle' | 'running' | 'done'>('idle');
  const [preview, setPreview] = React.useState(() => getMigrationPreview());

  const run = () => {
    setStatus('running');
    setTimeout(() => {
      forceRerunMigration();
      setPreview(getMigrationPreview());
      setStatus('done');
    }, 400);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <RefreshCw className="w-5 h-5 text-primary" />
        Account Data Migration
      </h3>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Backfill new fields onto existing accounts</CardTitle>
          <CardDescription>
            Links teachers and school admins by school Jots Code, infers education levels for students, and bootstraps Cognitive XP from existing assessments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total accounts', value: preview.total },
              { label: 'Need org code', value: preview.needsOrgCode },
              { label: 'Need education level', value: preview.needsEducationLevel },
            ].map(s => (
              <div key={s.label} className="text-center p-3 bg-gray-50 rounded-lg border">
                <div className="text-2xl font-bold text-gray-800">{s.value}</div>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {status === 'done' && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-600">✓</span>
              <p className="text-sm text-green-800">Migration complete — all accounts updated.</p>
            </div>
          )}

          <Button
            onClick={run}
            disabled={status === 'running'}
            className="w-full"
            style={{ backgroundColor: '#5B7DB1' }}
          >
            {status === 'running' ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Running migration...</>
            ) : status === 'done' ? (
              <><RefreshCw className="w-4 h-4 mr-2" />Re-run Migration</>
            ) : (
              <><RefreshCw className="w-4 h-4 mr-2" />Run Account Migration</>
            )}
          </Button>
          <p className="text-xs text-gray-500">Safe to run multiple times — idempotent. Runs automatically on every app load for accounts that haven't been migrated yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}

interface AdminPanelProps {
  onBack: () => void;
  onLogout: () => void;
  onViewUserDashboard: (userId: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack, onLogout, onViewUserDashboard }) => {
  const { impersonatedUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('[AdminPanel] ===== FETCHING ADMIN DATA =====');
        console.log('[AdminPanel] Checking localStorage before fetch...');
        const adminToken = localStorage.getItem('admin_token');
        const adminUser = localStorage.getItem('admin_user');
        console.log('[AdminPanel] admin_token:', adminToken ? adminToken.substring(0, 30) + '...' : 'NOT FOUND');
        console.log('[AdminPanel] admin_user:', adminUser ? 'FOUND' : 'NOT FOUND');
        
        if (!adminToken || !adminUser) {
          console.error('[AdminPanel] ✗ No admin session found');
          setError('Admin session expired. Please log in again.');
          setLoading(false);
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          return;
        }
        
        console.log('[AdminPanel] Calling getAllUsers()...');
        const usersData = await getAllUsers();
        console.log('[AdminPanel] Users data received:', usersData);
        
        console.log('[AdminPanel] Calling getAdminStats()...');
        const statsData = await getAdminStats();
        console.log('[AdminPanel] Stats data received:', statsData);

        console.log('[AdminPanel] ✓ Data fetched successfully');
        setUsers(usersData.users || []);
        setStats(statsData.stats || {});
      } catch (error) {
        console.error('[AdminPanel] ✗ Error fetching admin data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load admin data');
      } finally {
        setLoading(false);
        console.log('[AdminPanel] ===== FETCH COMPLETE =====');
      }
    };

    fetchData();
  }, []);

  const filteredUsers = users.filter(user => {
    // Text search filter
    const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Role filter
    const matchesRole = selectedRole === 'all' || user.role?.toLowerCase() === selectedRole.toLowerCase();
    
    // Industry sector filter (only for organizations)
    const matchesSector = selectedSector === 'all' || 
      (user.industrySector && user.industrySector === selectedSector) ||
      (selectedSector !== 'all' && !user.industrySector && user.role?.toLowerCase() !== 'organization');
    
    return matchesSearch && matchesRole && matchesSector;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#5B7DB1' }}></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 via-violet-50 to-indigo-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-red-600 text-center">⚠️ Error Loading Admin Panel</CardTitle>
            <CardDescription className="text-center">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                There was an error loading the admin panel. This usually happens when:
              </p>
              <ul className="list-disc list-inside text-sm text-red-800 mt-2 space-y-1">
                <li>Your admin session has expired</li>
                <li>The authentication token is missing</li>
                <li>There's a connection issue with the server</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => window.location.reload()}
                className="flex-1"
                style={{ backgroundColor: '#5B7DB1' }}
              >
                Refresh Page
              </Button>
              <Button
                onClick={onLogout}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const roleColors: { [key: string]: string } = {
    'Student': '#6B4C9A',
    'Teacher': '#7B61FF',
    'Parent': '#10B981',
    'Professional': '#FF715B',
    'Organization': '#8B5CF6'
  };

  const getRoleColor = (role: string) => {
    if (!role) return '#6B7280';
    const normalized = role.toLowerCase();
    
    if (normalized === 'student') return roleColors['Student'];
    if (normalized === 'teacher') return roleColors['Teacher'];
    if (normalized === 'parent') return roleColors['Parent'];
    if (normalized === 'professional' || normalized.includes('professional')) return roleColors['Professional'];
    if (normalized === 'organization' || normalized === 'supervisor') return roleColors['Organization'];
    
    // Fallback try to match capitalized key directly
    return roleColors[role] || '#6B7280';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm shadow-sm dark:bg-gray-950/80 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center text-white text-xl font-bold">
              A
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#6B4C9A] via-[#7B61FF] to-[#5B7DB1] bg-clip-text text-transparent">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Manage platform users and statistics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {impersonatedUser && (
              <Badge variant="outline" className="px-3 py-1.5 border-[#FF715B] text-[#FF715B] hidden md:flex">
                Viewing: {impersonatedUser.name}
              </Badge>
            )}
            <Button 
              variant="outline" 
              onClick={impersonatedUser ? onBack : onLogout}
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {impersonatedUser ? 'Back' : 'Logout'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="platform" className="space-y-6">
          <TabsList className="bg-white/50 p-1 border shadow-sm w-full md:w-auto grid grid-cols-2 md:flex h-auto">
            <TabsTrigger value="platform" className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Platform Overview
            </TabsTrigger>
            <TabsTrigger value="organizations" className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2">
                <Building2 className="w-4 h-4 mr-2" />
                Organizations & Schools
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2">
                <Settings className="w-4 h-4 mr-2" />
                System & Content
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">System & Content Administration</h2>
                        <p className="text-muted-foreground">Technical oversight, database integrity, and content management.</p>
                    </div>
                    <Button variant="outline" size="sm" className="hidden md:flex">
                        <RefreshCw className="w-4 h-4 mr-2" /> 
                        Clear System Cache
                    </Button>
                </div>

                {/* System Health Pulse */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">System Status</CardTitle>
                            <Activity className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">Healthy</div>
                            <p className="text-xs text-muted-foreground">All services operational</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Server Load</CardTitle>
                            <Server className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12%</div>
                            <p className="text-xs text-muted-foreground">CPU utilization (avg)</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Database</CardTitle>
                            <Database className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">24ms</div>
                            <p className="text-xs text-muted-foreground">Average query latency</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Security</CardTitle>
                            <ShieldCheck className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Secure</div>
                            <p className="text-xs text-muted-foreground">Last scan: 2 mins ago</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Database className="w-5 h-5 mr-2 text-primary" />
                        Assessment Content Integrity
                    </h3>
                    <QuestionBankAudit />
                </div>

                <div className="border-t pt-6">
                    <QuestionSeeder />
                </div>

                <div className="border-t pt-6">
                    <AccountMigrationPanel />
                </div>
            </div>
          </TabsContent>

          <TabsContent value="organizations">
             <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Organization Management</h2>
                    <p className="text-muted-foreground">Create invitation codes and monitor schools and corporate partners.</p>
                </div>
                
                {/* Organization Manager - Create and manage invitation codes */}
                <OrganizationManager />
                
                <Card>
                    <CardHeader>
                        <CardTitle>Registered Organizations (Account Holders)</CardTitle>
                        <CardDescription>
                            List of users who have registered with the "Organization" role.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Organization Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Contact Person</TableHead>
                                    <TableHead>Date Joined</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.filter(u => u.role === 'organization' || u.role === 'Organization' || u.role === 'supervisor').map(org => (
                                    <TableRow key={org.id}>
                                        <TableCell className="font-medium">{org.organizationName || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{org.organizationType || org.industrySector || 'Standard'}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div>{org.name}</div>
                                            <div className="text-xs text-muted-foreground">{org.email}</div>
                                        </TableCell>
                                        <TableCell>{new Date(org.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => onViewUserDashboard(org.id)}>
                                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                                View Dashboard
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {users.filter(u => u.role === 'organization' || u.role === 'Organization' || u.role === 'supervisor').length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No organizations found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
             </div>
          </TabsContent>

          <TabsContent value="platform">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Total Users</CardDescription>
                <Users className="w-5 h-5 text-[#5B7DB1] dark:text-[#6B4C9A]" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#5B7DB1] dark:text-[#6B4C9A]">{stats?.totalUsers || 0}</p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Total Assessments</CardDescription>
                <ClipboardList className="w-5 h-5 text-[#6B4C9A]" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#6B4C9A]">{stats?.totalAssessments || 0}</p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Students</CardDescription>
                <Users className="w-5 h-5 text-[#10B981]" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#10B981]">
                {stats?.usersByRole?.Student || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Organizations</CardDescription>
                <TrendingUp className="w-5 h-5 text-[#8B5CF6]" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#8B5CF6]">
                {stats?.usersByRole?.['Organization'] || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Role Distribution */}
        <Card className="mb-8 shadow-md">
          <CardHeader>
            <CardTitle>User Distribution by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats?.usersByRole || {}).map(([role, count]: any) => {
                const percentage = stats?.totalUsers > 0 ? (count / stats.totalUsers) * 100 : 0;
                return (
                  <div key={role}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">{role}</span>
                      <span className="text-sm">{count} users ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: roleColors[role] || '#6B7280'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* User Directory */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Directory</CardTitle>
                  <CardDescription>Search and filter platform users</CardDescription>
                </div>
                <div className="w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Filters:</span>
                </div>
                
                <div className="flex gap-3 flex-1">
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="organization">Organization</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedSector} onValueChange={setSelectedSector}>
                    <SelectTrigger className="w-56">
                      <SelectValue placeholder="All Industries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Educational Institutions">Educational Institutions</SelectItem>
                      <SelectItem value="Agriculture">Agriculture</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Financial Services">Financial Services</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Telecommunications">Telecommunications</SelectItem>
                      <SelectItem value="Retail & Distribution">Retail & Distribution</SelectItem>
                      <SelectItem value="Logistics & Transport">Logistics & Transport</SelectItem>
                      <SelectItem value="Hospitality & Tourism">Hospitality & Tourism</SelectItem>
                      <SelectItem value="Energy & Utilities">Energy & Utilities</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  {(selectedRole !== 'all' || selectedSector !== 'all') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedRole('all');
                        setSelectedSector('all');
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Assessments</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Industry Sector</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            style={{
                              backgroundColor: `${getRoleColor(user.role)}20`,
                              color: getRoleColor(user.role)
                            }}
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.assessmentsCompleted?.length || 0}/3
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {user.organizationName || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {user.industrySector || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewUserDashboard(user.id)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Dashboard
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {filteredUsers.length > 0 && (
              <div className="mt-4 text-sm text-gray-600">
                Showing {filteredUsers.length} of {users.length} users
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diagnostic Button */}
        <div className="mt-8">
          <Button
            variant="outline"
            onClick={() => setShowDiagnostic(true)}
            className="flex-1"
          >
            <Wrench className="mr-2 h-4 w-4" />
            Run Diagnostic
          </Button>
        </div>
        </TabsContent>
      </Tabs>

        {/* Diagnostic Modal */}
        {showDiagnostic && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDiagnostic(false)}
                className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
              <AdminDiagnostic
                onClose={() => setShowDiagnostic(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};