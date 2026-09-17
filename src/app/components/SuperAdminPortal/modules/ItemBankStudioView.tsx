import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Loader, Plus, Trash2, FileEdit, Layers } from 'lucide-react';
import { toast } from 'sonner';
import {
  listItemBankDomains, createItemBankDomain, updateItemBankDomain,
  listItemBankConstructs, createItemBankConstruct, updateItemBankConstruct,
  listItemBankItems, createItemBankItem, updateItemBankItem, setItemBankItemStatus,
  listItemBankAssessments, createItemBankAssessment, updateItemBankAssessment, getAssessmentPool, attachItemToAssessment, detachItemFromAssessment,
} from '../../../utils/api';

type SubTab = 'domains' | 'constructs' | 'items' | 'assessments';
const ITEM_TYPES = ['forced_choice', 'situational_judgment', 'ranking', 'multi_select', 'confidence_slider', 'timed_task', 'open_response', 'information_selection', 'resource_allocation', 'simulation'];
const CONSTRUCT_TYPES = ['preference', 'capability', 'behavioral', 'meta', 'validation'];
const ITEM_STATUSES = ['draft', 'review', 'pilot', 'active', 'suspended', 'retired'];

export function ItemBankStudioView() {
  const [tab, setTab] = useState<SubTab>('domains');
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Assessment Studio</h2>
        <p className="text-slate-500 dark:text-slate-400">Professional V2 item bank: domains, constructs, items, and assessment definitions.</p>
      </div>
      <Tabs value={tab} onValueChange={(v) => setTab(v as SubTab)}>
        <TabsList>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="constructs">Constructs</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
        </TabsList>
      </Tabs>
      {tab === 'domains' && <DomainsTab />}
      {tab === 'constructs' && <ConstructsTab />}
      {tab === 'items' && <ItemsTab />}
      {tab === 'assessments' && <AssessmentsTab />}
    </div>
  );
}

function DomainsTab() {
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ domain_key: '', name: '', description: '' });

  const load = async () => {
    setLoading(true);
    try { setDomains((await listItemBankDomains()).domains || []); }
    catch (e) { console.error(e); toast.error('Failed to load domains'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.domain_key.trim() || !form.name.trim()) return toast.error('Key and name are required');
    try { await createItemBankDomain(form); toast.success('Domain created'); setOpen(false); setForm({ domain_key: '', name: '', description: '' }); load(); }
    catch (e: any) { toast.error(e?.message || 'Failed to create domain'); }
  };

  const handleStatus = async (id: string, status: string) => {
    try { await updateItemBankDomain(id, { status }); load(); }
    catch (e) { toast.error('Failed to update status'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" /> New Domain</Button>
      </div>
      <Card><CardContent className="p-0">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
            <tr><th className="px-6 py-4 font-medium">Name</th><th className="px-6 py-4 font-medium">Key</th><th className="px-6 py-4 font-medium">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500"><Loader className="w-4 h-4 animate-spin inline mr-2" />Loading...</td></tr>
              : domains.length === 0 ? <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">No domains yet.</td></tr>
              : domains.map((d) => (
                <tr key={d.id} className="bg-white dark:bg-slate-950">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{d.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{d.domain_key}</td>
                  <td className="px-6 py-4">
                    <Select value={d.status} onValueChange={(v) => handleStatus(d.id, v)}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>{['draft', 'active', 'retired'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </CardContent></Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Domain</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label>Key</Label><Input value={form.domain_key} onChange={(e) => setForm({ ...form, domain_key: e.target.value.toLowerCase() })} placeholder="e.g. collaboration" /></div>
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleCreate}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ConstructsTab() {
  const [constructs, setConstructs] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ construct_key: '', domain_id: '', name: '', definition: '', construct_type: 'preference' });

  const load = async () => {
    setLoading(true);
    try {
      const [c, d] = await Promise.all([listItemBankConstructs(), listItemBankDomains()]);
      setConstructs(c.constructs || []); setDomains(d.domains || []);
    } catch (e) { console.error(e); toast.error('Failed to load constructs'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const domainName = (id: string) => domains.find((d) => d.id === id)?.name || '—';

  const handleCreate = async () => {
    if (!form.construct_key.trim() || !form.domain_id || !form.name.trim() || !form.definition.trim()) return toast.error('All fields except type are required');
    try { await createItemBankConstruct(form); toast.success('Construct created'); setOpen(false); setForm({ construct_key: '', domain_id: '', name: '', definition: '', construct_type: 'preference' }); load(); }
    catch (e: any) { toast.error(e?.message || 'Failed to create construct'); }
  };

  const handleStatus = async (id: string, status: string) => {
    try { await updateItemBankConstruct(id, { status }); load(); }
    catch (e) { toast.error('Failed to update status'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" /> New Construct</Button>
      </div>
      <Card><CardContent className="p-0">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
            <tr><th className="px-6 py-4 font-medium">Name</th><th className="px-6 py-4 font-medium">Domain</th><th className="px-6 py-4 font-medium">Type</th><th className="px-6 py-4 font-medium">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500"><Loader className="w-4 h-4 animate-spin inline mr-2" />Loading...</td></tr>
              : constructs.length === 0 ? <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No constructs yet.</td></tr>
              : constructs.map((c) => (
                <tr key={c.id} className="bg-white dark:bg-slate-950">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{c.name}</div>
                    <div className="text-xs text-slate-500">{c.definition}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{domainName(c.domain_id)}</td>
                  <td className="px-6 py-4"><Badge variant="outline" className="capitalize">{c.construct_type}</Badge></td>
                  <td className="px-6 py-4">
                    <Select value={c.status} onValueChange={(v) => handleStatus(c.id, v)}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>{['draft', 'active', 'retired'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </CardContent></Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Construct</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label>Key</Label><Input value={form.construct_key} onChange={(e) => setForm({ ...form, construct_key: e.target.value.toLowerCase() })} /></div>
            <div className="space-y-2">
              <Label>Domain</Label>
              <Select value={form.domain_id} onValueChange={(v) => setForm({ ...form, domain_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select domain" /></SelectTrigger>
                <SelectContent>{domains.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Definition</Label><Textarea rows={3} value={form.definition} onChange={(e) => setForm({ ...form, definition: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.construct_type} onValueChange={(v) => setForm({ ...form, construct_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CONSTRUCT_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleCreate}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ItemsTab() {
  const [items, setItems] = useState<any[]>([]);
  const [constructs, setConstructs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({ item_key: '', item_type: 'forced_choice', prompt_text: '', construct_ids: [] as string[], options: [{ option_code: 'A', text: '' }, { option_code: 'B', text: '' }] });

  const load = async () => {
    setLoading(true);
    try {
      const [i, c] = await Promise.all([listItemBankItems(statusFilter === 'all' ? undefined : statusFilter), listItemBankConstructs()]);
      setItems(i.items || []); setConstructs(c.constructs || []);
    } catch (e) { console.error(e); toast.error('Failed to load items'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [statusFilter]);

  const constructName = (id: string) => constructs.find((c) => c.id === id)?.name || id;

  const openCreate = () => {
    setEditing(null);
    setForm({ item_key: '', item_type: 'forced_choice', prompt_text: '', construct_ids: [], options: [{ option_code: 'A', text: '' }, { option_code: 'B', text: '' }] });
    setOpen(true);
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({
      item_key: item.item_key, item_type: item.item_type, prompt_text: item.prompt_text,
      construct_ids: item.construct_ids || [],
      options: (item.assessment_item_options || []).map((o: any) => ({ option_code: o.option_code, text: o.text })),
    });
    setOpen(true);
  };

  const toggleConstruct = (id: string) => {
    setForm((f: any) => ({ ...f, construct_ids: f.construct_ids.includes(id) ? f.construct_ids.filter((x: string) => x !== id) : [...f.construct_ids, id] }));
  };

  const updateOption = (idx: number, text: string) => {
    setForm((f: any) => ({ ...f, options: f.options.map((o: any, i: number) => (i === idx ? { ...o, text } : o)) }));
  };
  const addOption = () => setForm((f: any) => ({ ...f, options: [...f.options, { option_code: String.fromCharCode(65 + f.options.length), text: '' }] }));
  const removeOption = (idx: number) => setForm((f: any) => ({ ...f, options: f.options.filter((_: any, i: number) => i !== idx) }));

  const handleSave = async () => {
    if (!form.item_key.trim() || !form.prompt_text.trim()) return toast.error('Key and prompt text are required');
    try {
      if (editing) {
        const res = await updateItemBankItem(editing.id, form);
        toast.success(res.newVersion ? `Saved as version ${res.item.version} (item was ${editing.status})` : 'Draft updated');
      } else {
        await createItemBankItem(form);
        toast.success('Item created');
      }
      setOpen(false); load();
    } catch (e: any) { toast.error(e?.message || 'Failed to save item'); }
  };

  const handleStatus = async (id: string, status: string) => {
    try { await setItemBankItemStatus(id, status); load(); }
    catch (e) { toast.error('Failed to update status'); }
  };

  const needsOptions = !['confidence_slider', 'open_response', 'timed_task', 'simulation'].includes(form.item_type);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Statuses</SelectItem>{ITEM_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> New Item</Button>
      </div>
      <Card><CardContent className="p-0">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
            <tr><th className="px-6 py-4 font-medium">Key</th><th className="px-6 py-4 font-medium">Type</th><th className="px-6 py-4 font-medium">Constructs</th><th className="px-6 py-4 font-medium">Status</th><th className="px-6 py-4 font-medium text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500"><Loader className="w-4 h-4 animate-spin inline mr-2" />Loading...</td></tr>
              : items.length === 0 ? <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No items found.</td></tr>
              : items.map((it) => (
                <tr key={it.id} className="bg-white dark:bg-slate-950">
                  <td className="px-6 py-4 font-mono text-xs">{it.item_key} <span className="text-slate-400">v{it.version}</span></td>
                  <td className="px-6 py-4 text-slate-500">{it.item_type}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(it.construct_ids || []).map((cid: string) => <Badge key={cid} variant="outline">{constructName(cid)}</Badge>)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Select value={it.status} onValueChange={(v) => handleStatus(it.id, v)}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>{ITEM_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(it)}><FileEdit className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </CardContent></Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? `Edit ${editing.item_key}` : 'New Item'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {!editing && (
              <div className="space-y-2"><Label>Key</Label><Input value={form.item_key} onChange={(e) => setForm({ ...form, item_key: e.target.value.toUpperCase() })} placeholder="e.g. CC-041" /></div>
            )}
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.item_type} onValueChange={(v) => setForm({ ...form, item_type: v })} disabled={!!editing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ITEM_TYPES.filter((t) => t !== 'simulation').map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Prompt Text</Label><Textarea rows={3} value={form.prompt_text} onChange={(e) => setForm({ ...form, prompt_text: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Constructs</Label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg p-2">
                {constructs.map((c) => (
                  <button key={c.id} type="button" onClick={() => toggleConstruct(c.id)}
                    className={`text-xs px-2 py-1 rounded-full border ${form.construct_ids.includes(c.id) ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300 dark:border-slate-700'}`}>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
            {needsOptions && (
              <div className="space-y-2">
                <Label>Options</Label>
                {form.options.map((o: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-mono w-5">{o.option_code}</span>
                    <Input value={o.text} onChange={(e) => updateOption(idx, e.target.value)} placeholder={`Option ${o.option_code}`} />
                    <Button variant="ghost" size="sm" onClick={() => removeOption(idx)}><Trash2 className="w-3.5 h-3.5 text-red-600" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addOption}><Plus className="w-3.5 h-3.5 mr-1" /> Add Option</Button>
              </div>
            )}
            {editing && editing.status !== 'draft' && (
              <p className="text-xs text-amber-600 dark:text-amber-400">This item is {editing.status} - saving will create a new draft version rather than overwriting it.</p>
            )}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSave}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AssessmentsTab() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ assessment_key: '', name: '', min_items: 5, max_items: 60, expected_duration_minutes: 30 });
  const [poolFor, setPoolFor] = useState<any | null>(null);
  const [pool, setPool] = useState<any[]>([]);
  const [addItemId, setAddItemId] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [a, i] = await Promise.all([listItemBankAssessments(), listItemBankItems('active')]);
      setAssessments(a.assessments || []); setItems(i.items || []);
    } catch (e) { console.error(e); toast.error('Failed to load assessments'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.assessment_key.trim() || !form.name.trim()) return toast.error('Key and name are required');
    try { await createItemBankAssessment(form); toast.success('Assessment created'); setOpen(false); load(); }
    catch (e: any) { toast.error(e?.message || 'Failed to create assessment'); }
  };

  const handleStatus = async (id: string, status: string) => {
    try { await updateItemBankAssessment(id, { status }); load(); }
    catch (e) { toast.error('Failed to update status'); }
  };

  const openPool = async (assessment: any) => {
    setPoolFor(assessment);
    try { setPool((await getAssessmentPool(assessment.id)).pool || []); }
    catch (e) { toast.error('Failed to load pool'); }
  };

  const handleAddToPool = async () => {
    if (!addItemId || !poolFor) return;
    try { await attachItemToAssessment(poolFor.id, addItemId); setAddItemId(''); openPool(poolFor); }
    catch (e) { toast.error('Failed to attach item'); }
  };

  const handleRemoveFromPool = async (itemId: string) => {
    if (!poolFor) return;
    try { await detachItemFromAssessment(poolFor.id, itemId); openPool(poolFor); }
    catch (e) { toast.error('Failed to detach item'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" /> New Assessment</Button>
      </div>
      <Card><CardContent className="p-0">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
            <tr><th className="px-6 py-4 font-medium">Key</th><th className="px-6 py-4 font-medium">Name</th><th className="px-6 py-4 font-medium">Status</th><th className="px-6 py-4 font-medium text-right">Pool</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500"><Loader className="w-4 h-4 animate-spin inline mr-2" />Loading...</td></tr>
              : assessments.length === 0 ? <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No assessments yet.</td></tr>
              : assessments.map((a) => (
                <tr key={a.id} className="bg-white dark:bg-slate-950">
                  <td className="px-6 py-4 font-mono text-xs">{a.assessment_key} <span className="text-slate-400">v{a.version}</span></td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{a.name}</td>
                  <td className="px-6 py-4">
                    <Select value={a.status} onValueChange={(v) => handleStatus(a.id, v)}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>{['draft', 'pilot', 'active', 'suspended', 'retired'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => openPool(a)}><Layers className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </CardContent></Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Assessment</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label>Key</Label><Input value={form.assessment_key} onChange={(e) => setForm({ ...form, assessment_key: e.target.value.toLowerCase() })} /></div>
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2"><Label>Min Items</Label><Input type="number" value={form.min_items} onChange={(e) => setForm({ ...form, min_items: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Max Items</Label><Input type="number" value={form.max_items} onChange={(e) => setForm({ ...form, max_items: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Duration (min)</Label><Input type="number" value={form.expected_duration_minutes} onChange={(e) => setForm({ ...form, expected_duration_minutes: Number(e.target.value) })} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleCreate}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!poolFor} onOpenChange={(o) => !o && setPoolFor(null)}>
        <DialogContent>
          {poolFor && (<>
            <DialogHeader><DialogTitle>{poolFor.name} - Item Pool</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Select value={addItemId} onValueChange={setAddItemId}>
                  <SelectTrigger><SelectValue placeholder="Add an active item..." /></SelectTrigger>
                  <SelectContent>{items.filter((i) => !pool.some((p) => p.item_id === i.id)).map((i) => <SelectItem key={i.id} value={i.id}>{i.item_key}</SelectItem>)}</SelectContent>
                </Select>
                <Button onClick={handleAddToPool} disabled={!addItemId}>Add</Button>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {pool.length === 0 ? <p className="text-sm text-slate-500">No items in this pool.</p> : pool.map((p) => (
                  <div key={p.item_id} className="flex items-center justify-between border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5">
                    <span className="text-sm font-mono">{p.assessment_items?.item_key}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveFromPool(p.item_id)}><Trash2 className="w-3.5 h-3.5 text-red-600" /></Button>
                  </div>
                ))}
              </div>
            </div>
          </>)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
