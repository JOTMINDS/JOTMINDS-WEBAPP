import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Search, Filter, X, LayoutDashboard } from 'lucide-react';
import { cn } from '../ui/utils';

interface UserManagementTableProps {
  users: any[];
  toggleUserActivation: (userId: string, currentStatus: boolean | undefined) => Promise<{success: boolean, error?: any}>;
  updateSubscription: (userId: string, status: string) => Promise<{success: boolean, error?: any}>;
  onViewUserDashboard?: (userId: string) => void;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({ 
  users, 
  toggleUserActivation, 
  updateSubscription,
  onViewUserDashboard
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role?.toLowerCase() === selectedRole.toLowerCase();
    
    const matchesSector = selectedSector === 'all' || 
      (user.industrySector && user.industrySector === selectedSector) ||
      (selectedSector !== 'all' && !user.industrySector && user.role?.toLowerCase() !== 'organization');
    
    return matchesSearch && matchesRole && matchesSector;
  });

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
    return roleColors[role] || '#6B7280';
  };

  return (
    <Card className="shadow-sm border-none bg-white dark:bg-gray-900 animate-in fade-in duration-500">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl">User Directory</CardTitle>
              <CardDescription>Search, filter, and manage platform users</CardDescription>
            </div>
            <div className="w-full md:w-72">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by name, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-50 dark:bg-gray-800 border-none focus-visible:ring-indigo-500"
                />
              </div>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center p-3 bg-slate-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2 mr-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Filters:</span>
            </div>
            
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-40 bg-white dark:bg-gray-900 border-none shadow-sm">
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
              <SelectTrigger className="w-48 bg-white dark:bg-gray-900 border-none shadow-sm">
                <SelectValue placeholder="All Industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Educational Institutions">Educational Institutions</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            {(selectedRole !== 'all' || selectedSector !== 'all' || searchQuery !== '') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedRole('all');
                  setSelectedSector('all');
                  setSearchQuery('');
                }}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border overflow-hidden border-slate-100 dark:border-gray-800">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-gray-800/50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Name</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Email</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Role</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Subscription</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500 py-12">
                    <div className="flex flex-col items-center justify-center gap-2">
                       <Filter className="w-8 h-8 text-slate-300" />
                       <p>No users found matching your criteria</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors">
                    <TableCell className="font-medium text-slate-800 dark:text-white">{user.name}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: `${getRoleColor(user.role)}15`,
                          color: getRoleColor(user.role),
                          border: `1px solid ${getRoleColor(user.role)}40`
                        }}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.isActive !== false ? "default" : "destructive"}
                        className={cn(
                           "shadow-none",
                           user.isActive !== false 
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400" 
                              : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                        )}
                      >
                        {user.isActive !== false ? 'Active' : 'Deactivated'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={user.subscriptionStatus || 'active'} 
                        onValueChange={(val) => updateSubscription(user.id, val)}
                      >
                        <SelectTrigger className="w-[130px] h-9 text-sm bg-white dark:bg-gray-900">
                          <SelectValue placeholder="Subscription" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="trial">Trial</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {onViewUserDashboard && (
                            <Button variant="ghost" size="sm" onClick={() => onViewUserDashboard(user.id)} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30">
                                <LayoutDashboard className="w-4 h-4" />
                            </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleUserActivation(user.id, user.isActive)}
                          className={cn(
                              "transition-all",
                              user.isActive !== false 
                                  ? "text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/30" 
                                  : "text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-900/50 dark:hover:bg-emerald-900/30"
                          )}
                        >
                          {user.isActive !== false ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {filteredUsers.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>Showing {filteredUsers.length} of {users.length} users</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
