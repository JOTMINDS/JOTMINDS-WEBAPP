import React, { useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Search, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface BillingViewProps {
  users: any[];
  updateSubscription: (userId: string, status: string) => Promise<{ success: boolean; error?: any }>;
}

const STATUS_OPTIONS = ['free', 'trial', 'active', 'past_due', 'cancelled'];
const STATUS_VARIANT: Record<string, any> = { active: 'secondary', trial: 'outline', free: 'outline', past_due: 'destructive', cancelled: 'destructive' };

export function BillingView({ users, updateSubscription }: BillingViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = users.filter((u) =>
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = async (userId: string, status: string) => {
    setUpdatingId(userId);
    try {
      const result = await updateSubscription(userId, status);
      if (result.success) {
        toast.success('Subscription updated');
      } else {
        toast.error('Failed to update subscription');
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const activeCount = users.filter((u) => u.subscriptionStatus === 'active').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Billing</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Manage each account's subscription status. No payment processor is connected yet - this reflects and edits the
          <code className="mx-1 px-1 py-0.5 bg-slate-100 dark:bg-slate-900 rounded text-xs">subscriptionStatus</code>
          field directly; there are no real invoices or MRR calculations.
        </p>
      </div>

      <Card className="bg-indigo-50 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900 max-w-xs">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <CreditCard className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-2" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Active Subscriptions</h3>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{activeCount}</p>
        </CardContent>
      </Card>

      <div className="bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search by name or email..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filtered.slice(0, 200).map((u) => (
                  <tr key={u.id} className="bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{u.name || u.email}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 capitalize">{u.role}</td>
                    <td className="px-6 py-4">
                      <Badge variant={STATUS_VARIANT[u.subscriptionStatus] || 'outline'}>{u.subscriptionStatus || 'free'}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Select value={u.subscriptionStatus || 'free'} onValueChange={(v) => handleChange(u.id, v)} disabled={updatingId === u.id}>
                        <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
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
