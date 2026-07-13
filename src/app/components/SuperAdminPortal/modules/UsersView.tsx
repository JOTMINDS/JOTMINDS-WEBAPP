import React, { useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Search, MoreVertical, ShieldBan, ShieldAlert, KeyRound, Mail, XCircle, CheckCircle2, UserCheck } from 'lucide-react';
import { useSupportMode } from '../SupportModeProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';

interface UsersViewProps {
  users: any[];
  toggleUserActivation: (userId: string, currentStatus: boolean | undefined) => Promise<any>;
}

export function UsersView({ users, toggleUserActivation }: UsersViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const { requestSupportAccess, supportMode } = useSupportMode();

  const handleRequestAccess = async (user: any) => {
    const reason = window.prompt(`Enter reason for requesting temporary access to ${user.name}'s account:`);
    if (reason) {
      const success = await requestSupportAccess(user.email, user.name, user.id, reason);
      if (success) {
        alert(`Access request sent to ${user.email}`);
      } else {
        alert('Failed to send access request.');
      }
    }
  };

  // Ensure strict privacy: Map over users to strip cognitive data if any leaked into state
  const safeUsers = users.map(u => ({
    id: u.id,
    name: u.name || 'Unknown User',
    email: u.email || 'No Email',
    role: u.role || 'user',
    institution: u.school || u.organizationName || 'None',
    isActive: u.isActive !== false,
    joinedDate: u.createdAt || u.created_at || new Date().toISOString(),
    lastLogin: u.lastLogin || u.last_login || 'Never'
  }));

  const filteredUsers = safeUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">User Directory</h2>
        <p className="text-slate-500 dark:text-slate-400">Manage all tenant and individual user accounts across the platform.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by name or email..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select 
            className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-indigo-800"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="parent">Parent</option>
            <option value="school_admin">School Admin</option>
            <option value="admin">Super Admin</option>
          </select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Institution / Org</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium hidden md:table-cell">Joined Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 dark:text-white">{user.name}</span>
                        <span className="text-slate-500 text-xs">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 capitalize">
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {user.institution}
                    </td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <span className="inline-flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-medium text-red-600 dark:text-red-400">
                          <XCircle className="w-3 h-3 mr-1" /> Disabled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 hidden md:table-cell">
                      {new Date(user.joinedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => alert(`Password reset email sent to ${user.email}`)}>
                            <KeyRound className="mr-2 h-4 w-4" />
                            <span>Reset Password</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => alert(`Email sent to ${user.email}`)}>
                            <Mail className="mr-2 h-4 w-4" />
                            <span>Send Email</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleRequestAccess(user)}
                            disabled={supportMode.pendingRequests.includes(user.id)}
                          >
                            <UserCheck className="mr-2 h-4 w-4 text-indigo-600" />
                            <span className="text-indigo-600">
                              {supportMode.pendingRequests.includes(user.id) ? 'Access Requested' : 'Request Audited Access'}
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => toggleUserActivation(user.id, user.isActive)}
                            className={user.isActive ? "text-amber-600" : "text-emerald-600"}
                          >
                            {user.isActive ? (
                              <><ShieldBan className="mr-2 h-4 w-4" /> <span>Disable User</span></>
                            ) : (
                              <><CheckCircle2 className="mr-2 h-4 w-4" /> <span>Enable User</span></>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50">
                            <ShieldAlert className="mr-2 h-4 w-4" />
                            <span>Suspend Account</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                No users found matching your filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
