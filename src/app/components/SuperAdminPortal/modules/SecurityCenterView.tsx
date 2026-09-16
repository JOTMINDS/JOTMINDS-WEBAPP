import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Loader, ShieldCheck, Users, Activity, Gauge, UserCog, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getSecurityOverview, listAdmins, setAdminStatus } from '../../../utils/api';

interface SecurityCenterViewProps {
  users: any[];
}

export function SecurityCenterView({ users }: SecurityCenterViewProps) {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<{ id: string; email: string }[]>([]);
  const [grantEmail, setGrantEmail] = useState('');
  const [granting, setGranting] = useState(false);

  const loadAdmins = async () => {
    try {
      const response = await listAdmins();
      setAdmins(response?.admins || []);
    } catch (err) {
      console.error('Error loading admins:', err);
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const response = await getSecurityOverview();
        setOverview(response?.overview || null);
      } catch (err) {
        console.error('Error loading security overview:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
    loadAdmins();
  }, []);

  const handleGrant = async () => {
    const target = users.find((u) => (u.email || '').toLowerCase() === grantEmail.trim().toLowerCase());
    if (!target) {
      toast.error('No user found with that email');
      return;
    }
    setGranting(true);
    try {
      await setAdminStatus(target.id, true);
      toast.success(`${target.email} is now an admin`);
      setGrantEmail('');
      loadAdmins();
    } catch (err) {
      console.error('Error granting admin:', err);
      toast.error('Failed to grant admin access');
    } finally {
      setGranting(false);
    }
  };

  const handleRevoke = async (id: string, email: string) => {
    if (!window.confirm(`Revoke admin access for ${email}?`)) return;
    try {
      await setAdminStatus(id, false);
      toast.success(`Revoked admin access for ${email}`);
      loadAdmins();
    } catch (err) {
      console.error('Error revoking admin:', err);
      toast.error('Failed to revoke admin access');
    }
  };

  if (loading || !overview) {
    return <div className="flex items-center justify-center min-h-[300px] text-slate-500"><Loader className="w-6 h-6 animate-spin mr-2" /> Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Security Center</h2>
        <p className="text-slate-500 dark:text-slate-400">Recent authentication activity and rate-limit status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Accounts</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{overview.totalAccounts.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active (24h)</CardTitle>
            <Activity className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{overview.activeLast24h.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active (7d)</CardTitle>
            <Activity className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{overview.activeLast7d.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rate Limit</CardTitle>
            <Gauge className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{overview.rateLimit.requestsPerMinute}/min</div>
            <p className="text-xs text-slate-500">{overview.rateLimit.scope}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><UserCog className="w-4 h-4 text-indigo-600" /> Admin Access</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-500">
            Grants are written to <code className="px-1 bg-slate-100 dark:bg-slate-900 rounded text-xs">app_metadata</code> via
            the Admin API - not <code className="px-1 bg-slate-100 dark:bg-slate-900 rounded text-xs">user_metadata</code>,
            which a user could set on themselves.
          </p>
          <div className="flex gap-2 max-w-md">
            <Input placeholder="user@email.com" value={grantEmail} onChange={(e) => setGrantEmail(e.target.value)} />
            <Button onClick={handleGrant} disabled={granting || !grantEmail.trim()} className="bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap">
              {granting ? <Loader className="w-4 h-4 animate-spin" /> : 'Grant Admin'}
            </Button>
          </div>
          <div className="space-y-2">
            {admins.length === 0 ? (
              <p className="text-sm text-slate-500">No admins found.</p>
            ) : (
              admins.map((a) => (
                <div key={a.id} className="flex items-center justify-between border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{a.email}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleRevoke(a.id, a.email)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-indigo-600" /> Recent Sign-Ins</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Last Sign-In</th>
                  <th className="px-6 py-4 font-medium">Account Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {overview.recentSignins.map((u: any, i: number) => (
                  <tr key={i} className="bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{u.email}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {u.lastSignInAt ? new Date(u.lastSignInAt).toLocaleString() : <Badge variant="outline">Never signed in</Badge>}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
