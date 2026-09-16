import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Loader, LifeBuoy } from 'lucide-react';
import { toast } from 'sonner';
import { listSupportTickets, updateSupportTicket } from '../../../utils/api';

const STATUS_VARIANT: Record<string, any> = { open: 'destructive', in_progress: 'secondary', resolved: 'outline' };

export function SupportCenterView() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [reply, setReply] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const response = await listSupportTickets();
      setTickets(response?.tickets || []);
    } catch (err) {
      console.error('Error loading tickets:', err);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openTicket = (t: any) => {
    setSelected(t);
    setReply('');
  };

  const handleStatusChange = async (status: string) => {
    if (!selected) return;
    try {
      const response = await updateSupportTicket(selected.id, { status });
      setSelected(response?.ticket || { ...selected, status });
      load();
    } catch (err) {
      console.error('Error updating ticket:', err);
      toast.error('Failed to update status');
    }
  };

  const handleReply = async () => {
    if (!selected || !reply.trim()) return;
    setSaving(true);
    try {
      const response = await updateSupportTicket(selected.id, { reply });
      setSelected(response?.ticket || selected);
      setReply('');
      toast.success('Reply added');
      load();
    } catch (err) {
      console.error('Error replying to ticket:', err);
      toast.error('Failed to reply');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Support Center</h2>
        <p className="text-slate-500 dark:text-slate-400">View user feedback and support tickets.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Subject</th>
                  <th className="px-6 py-4 font-medium">From</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500"><Loader className="w-4 h-4 animate-spin inline mr-2" />Loading...</td></tr>
                ) : tickets.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <LifeBuoy className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700 mb-3" />
                    No support tickets submitted yet.
                  </td></tr>
                ) : (
                  tickets.map((t) => (
                    <tr key={t.id} className="bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer" onClick={() => openTicket(t)}>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{t.subject}</td>
                      <td className="px-6 py-4 text-slate-500">{t.userEmail}</td>
                      <td className="px-6 py-4"><Badge variant={STATUS_VARIANT[t.status] || 'outline'}>{t.status}</Badge></td>
                      <td className="px-6 py-4 text-slate-500">{new Date(t.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.subject}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-xs text-slate-500">From {selected.userEmail} · {new Date(selected.createdAt).toLocaleString()}</p>
                <p className="text-sm bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">{selected.message}</p>

                {(selected.replies || []).map((r: any, i: number) => (
                  <div key={i} className="text-sm bg-indigo-50 dark:bg-indigo-950/20 p-3 rounded-lg">
                    <p className="text-xs text-indigo-600 mb-1">{r.adminEmail} · {new Date(r.createdAt).toLocaleString()}</p>
                    {r.message}
                  </div>
                ))}

                <div className="space-y-2">
                  <Select value={selected.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Textarea rows={3} placeholder="Write a reply..." value={reply} onChange={(e) => setReply(e.target.value)} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleReply} disabled={saving || !reply.trim()}>
                  {saving ? <Loader className="w-4 h-4 animate-spin" /> : 'Send Reply'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
