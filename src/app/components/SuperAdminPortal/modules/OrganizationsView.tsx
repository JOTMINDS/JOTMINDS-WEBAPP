import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Search, MoreVertical, Building2, CheckCircle2, XCircle, UserCheck, Loader } from 'lucide-react';
import { listAllOrganizations, getOrganizationDetails, setOrganizationSuspended } from '../../../utils/api';
import { useSupportMode } from '../SupportModeProvider';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';

export function OrganizationsView() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { requestSupportAccess, supportMode } = useSupportMode();
  const [detailsFor, setDetailsFor] = useState<any | null>(null);
  const [details, setDetails] = useState<{ organization: any; employees: any[] } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleRequestAccess = async (org: any) => {
    const reason = window.prompt(`Enter reason for requesting temporary access to ${org.name}'s tenant:`);
    if (reason) {
      const email = org.contact_email || org.admin_email || 'admin@' + (org.domain || 'example.com');
      const success = await requestSupportAccess(email, org.name, org.id, reason);
      if (success) {
        toast.success(`Access request sent to organization admin at ${email}`);
      } else {
        toast.error('Failed to send access request.');
      }
    }
  };

  const fetchOrganizations = async () => {
    try {
      // Organizations live in the KV store (kv.set(`organization:${code}`, ...)),
      // not a Postgres table - fetch via the admin-scoped backend endpoint.
      const response = await listAllOrganizations();
      const orgs = (response?.organizations || []).map((o: any) => ({
        ...o,
        id: o.code,
        created_at: o.createdAt,
      }));
      setOrganizations(orgs);
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrganizations(); }, []);

  const openDetails = async (org: any) => {
    setDetailsFor(org);
    setLoadingDetails(true);
    try {
      const response = await getOrganizationDetails(org.code);
      setDetails({ organization: response?.organization, employees: response?.employees || [] });
    } catch (err) {
      console.error('Error loading organization details:', err);
      toast.error('Failed to load organization details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggleSuspend = async (org: any) => {
    const nextActive = org.isActive === false;
    if (!window.confirm(`${nextActive ? 'Reactivate' : 'Suspend'} "${org.name}"?`)) return;
    try {
      await setOrganizationSuspended(org.code, nextActive);
      toast.success(nextActive ? 'Organization reactivated' : 'Organization suspended');
      fetchOrganizations();
    } catch (err) {
      console.error('Error updating organization:', err);
      toast.error('Failed to update organization');
    }
  };

  const filteredOrgs = organizations.filter(o =>
    o.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Organization Management</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage all corporate tenants, businesses, and their subscriptions.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by org name or code..."
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
                  <th className="px-6 py-4 font-medium">Organization Name</th>
                  <th className="px-6 py-4 font-medium">Code</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium hidden md:table-cell">Created Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading organizations...</td>
                  </tr>
                ) : filteredOrgs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No organizations found.
                    </td>
                  </tr>
                ) : (
                  filteredOrgs.map((org) => (
                    <tr key={org.id} className="bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-md">
                            <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">{org.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {org.code || org.organization_code}
                      </td>
                      <td className="px-6 py-4">
                        {org.isActive === false ? (
                          <span className="inline-flex items-center text-xs font-medium text-red-600 dark:text-red-400">
                            <XCircle className="w-3 h-3 mr-1" /> Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 hidden md:table-cell">
                        {new Date(org.created_at || new Date()).toLocaleDateString()}
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
                            <DropdownMenuItem onClick={() => openDetails(org)}>View Details & Employees</DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRequestAccess(org)}
                              disabled={supportMode.pendingRequests.includes(org.id)}
                            >
                              <UserCheck className="mr-2 h-4 w-4 text-indigo-600" />
                              <span className="text-indigo-600">
                                {supportMode.pendingRequests.includes(org.id) ? 'Access Requested' : 'Request Audited Access'}
                              </span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-amber-600" onClick={() => handleToggleSuspend(org)}>
                              {org.isActive === false ? 'Reactivate Org' : 'Suspend Org'}
                            </DropdownMenuItem>
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

      <Dialog open={!!detailsFor} onOpenChange={(open) => { if (!open) { setDetailsFor(null); setDetails(null); } }}>
        <DialogContent className="max-w-lg">
          {detailsFor && (
            <>
              <DialogHeader><DialogTitle>{detailsFor.name}</DialogTitle></DialogHeader>
              {loadingDetails ? (
                <div className="flex items-center justify-center py-8 text-slate-500"><Loader className="w-5 h-5 animate-spin mr-2" /> Loading...</div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-500">Code</span><p className="font-mono">{details?.organization?.code}</p></div>
                    <div><span className="text-slate-500">Type</span><p className="capitalize">{details?.organization?.type || '—'}</p></div>
                    <div><span className="text-slate-500">Industry</span><p>{details?.organization?.industrySector || '—'}</p></div>
                    <div><span className="text-slate-500">Created By</span><p className="truncate">{details?.organization?.createdBy || '—'}</p></div>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-400 mb-2">Employees ({details?.employees.length || 0})</p>
                    <div className="max-h-64 overflow-y-auto space-y-1">
                      {(details?.employees || []).map((e: any) => (
                        <div key={e.id} className="flex items-center justify-between border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5">
                          <div>
                            <p className="text-sm text-slate-700 dark:text-slate-300">{e.name}</p>
                            <p className="text-xs text-slate-500">{e.email}</p>
                          </div>
                          <Badge variant="outline" className="capitalize">{e.role}</Badge>
                        </div>
                      ))}
                      {(details?.employees.length || 0) === 0 && <p className="text-sm text-slate-500">No employees.</p>}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
