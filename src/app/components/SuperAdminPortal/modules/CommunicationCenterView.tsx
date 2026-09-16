import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Loader, Send, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { sendBroadcast, listBroadcasts } from '../../../utils/api';

export function CommunicationCenterView() {
  const [audience, setAudience] = useState('all');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBroadcasts = async () => {
    try {
      const response = await listBroadcasts();
      setBroadcasts(response?.broadcasts || []);
    } catch (err) {
      console.error('Error loading broadcasts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBroadcasts(); }, []);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Subject and message are required');
      return;
    }
    if (!window.confirm(`Send this broadcast to "${audience}"? This cannot be undone.`)) return;
    setSending(true);
    try {
      const response = await sendBroadcast({ audience, subject, message });
      if (response?.success) {
        toast.success(`Sent to ${response.broadcast.sentCount} of ${response.broadcast.recipientCount} recipients`);
        setSubject('');
        setMessage('');
        loadBroadcasts();
      } else {
        toast.error('Broadcast failed to send - check Resend configuration');
      }
    } catch (err) {
      console.error('Error sending broadcast:', err);
      toast.error('Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Communication Center</h2>
        <p className="text-slate-500 dark:text-slate-400">Send broadcast emails and notifications.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="w-4 h-4 text-indigo-600" /> New Broadcast</CardTitle></CardHeader>
        <CardContent className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Label>Audience</Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger className="w-full sm:w-64"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="students">Students</SelectItem>
                <SelectItem value="teachers">Teachers</SelectItem>
                <SelectItem value="parents">Parents</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="broadcast-subject">Subject</Label>
            <Input id="broadcast-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="broadcast-message">Message (HTML supported)</Label>
            <Textarea id="broadcast-message" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <Button onClick={handleSend} disabled={sending} className="bg-indigo-600 hover:bg-indigo-700">
            {sending ? <><Loader className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : <><Send className="w-4 h-4 mr-2" /> Send Broadcast</>}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Broadcast History</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Subject</th>
                  <th className="px-6 py-4 font-medium">Audience</th>
                  <th className="px-6 py-4 font-medium">Sent</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500"><Loader className="w-4 h-4 animate-spin inline mr-2" />Loading...</td></tr>
                ) : broadcasts.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">No broadcasts sent yet.</td></tr>
                ) : (
                  broadcasts.map((b) => (
                    <tr key={b.id} className="bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{b.subject}</td>
                      <td className="px-6 py-4 text-slate-500 capitalize">{b.audience}</td>
                      <td className="px-6 py-4 text-slate-500">{b.sentCount} / {b.recipientCount}</td>
                      <td className="px-6 py-4 text-slate-500">{new Date(b.createdAt).toLocaleString()}</td>
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
