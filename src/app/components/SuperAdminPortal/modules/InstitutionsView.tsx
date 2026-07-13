import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Search, MoreVertical, School, CheckCircle2, XCircle, UserCheck } from 'lucide-react';
import { createClient } from '../../../utils/supabase/client';
import { useSupportMode } from '../SupportModeProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';

export function InstitutionsView() {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { requestSupportAccess, supportMode } = useSupportMode();

  const handleRequestAccess = async (inst: any) => {
    const reason = window.prompt(`Enter reason for requesting temporary access to ${inst.name}'s tenant:`);
    if (reason) {
      // Assuming inst.admin_email or similar exists. Using contact_email or a placeholder
      const email = inst.contact_email || inst.admin_email || 'admin@' + (inst.domain || 'example.com');
      const success = await requestSupportAccess(email, inst.name, inst.id, reason);
      if (success) {
        alert(`Access request sent to institution admin at ${email}`);
      } else {
        alert('Failed to send access request.');
      }
    }
  };

  useEffect(() => {
    async function fetchInstitutions() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('institutions').select('*');
        if (error) throw error;
        setInstitutions(data || []);
      } catch (err) {
        console.error('Error fetching institutions:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchInstitutions();
  }, []);

  const filteredInstitutions = institutions.filter(i => 
    i.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Institution Management</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage all registered schools and educational tenants.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">Add Institution</Button>
      </div>

      <div className="bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by school name or code..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Institution Name</th>
                  <th className="px-6 py-4 font-medium">Code</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium hidden md:table-cell">Created Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading institutions...</td>
                  </tr>
                ) : filteredInstitutions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No institutions found.
                    </td>
                  </tr>
                ) : (
                  filteredInstitutions.map((inst) => (
                    <tr key={inst.id} className="bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-md">
                            <School className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">{inst.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {inst.code || inst.institution_code}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 hidden md:table-cell">
                        {new Date(inst.created_at || new Date()).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" onClick={e => e.stopPropagation()}>
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Members List</DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleRequestAccess(inst)}
                              disabled={supportMode.pendingRequests.includes(inst.id)}
                            >
                              <UserCheck className="mr-2 h-4 w-4 text-indigo-600" />
                              <span className="text-indigo-600">
                                {supportMode.pendingRequests.includes(inst.id) ? 'Access Requested' : 'Request Audited Access'}
                              </span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-amber-600">Suspend Institution</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
