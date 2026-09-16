import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { Badge } from '../../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Loader, Plus, Trash2, ToggleLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import {
  listFeatureFlags, createFeatureFlag, updateFeatureFlag, deleteFeatureFlag,
  listFeatureOverrides, setFeatureOverride, clearFeatureOverride,
} from '../../../utils/api';

const ROLE_OPTIONS = ['student', 'teacher', 'parent', 'professional', 'organization', 'admin'];
const PLAN_OPTIONS = ['free', 'trial', 'active', 'past_due', 'cancelled'];

const WIRED_KEYS = new Set(['ai-coach', 'brain-gym', 'daily-challenge']);

interface FeatureFlagsViewProps {
  users: any[];
}

export function FeatureFlagsView({ users }: FeatureFlagsViewProps) {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newFlag, setNewFlag] = useState({ key: '', name: '', description: '', defaultEnabled: true });

  const load = async () => {
    setLoading(true);
    try {
      const response = await listFeatureFlags();
      setFlags(response?.flags || []);
    } catch (err) {
      console.error('Error loading feature flags:', err);
      toast.error('Failed to load feature flags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggleDefault = async (flag: any) => {
    try {
      await updateFeatureFlag(flag.key, { defaultEnabled: !flag.defaultEnabled });
      load();
    } catch (err) {
      console.error('Error updating flag:', err);
      toast.error('Failed to update');
    }
  };

  const handleCreate = async () => {
    if (!newFlag.key.trim() || !newFlag.name.trim()) {
      toast.error('Key and name are required');
      return;
    }
    try {
      await createFeatureFlag(newFlag);
      toast.success('Flag created');
      setCreateOpen(false);
      setNewFlag({ key: '', name: '', description: '', defaultEnabled: true });
      load();
    } catch (err: any) {
      console.error('Error creating flag:', err);
      toast.error(err?.message || 'Failed to create flag');
    }
  };

  const handleDelete = async (flag: any) => {
    if (!window.confirm(`Delete "${flag.name}"? This also removes any account overrides.`)) return;
    try {
      await deleteFeatureFlag(flag.key);
      toast.success('Deleted');
      load();
    } catch (err) {
      console.error('Error deleting flag:', err);
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Feature Flags</h2>
          <p className="text-slate-500 dark:text-slate-400">Turn app features on or off globally, by role/plan, or for individual accounts - no code changes needed.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Flag
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px] text-slate-500"><Loader className="w-6 h-6 animate-spin mr-2" /> Loading...</div>
      ) : flags.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-slate-500">
          <ToggleLeft className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700 mb-3" />
          No feature flags yet.
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {flags.map((flag) => (
            <Card key={flag.key}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Switch checked={flag.defaultEnabled} onCheckedChange={() => handleToggleDefault(flag)} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-white">{flag.name}</span>
                        <code className="text-xs text-slate-400">{flag.key}</code>
                        {!WIRED_KEYS.has(flag.key) && (
                          <Badge variant="outline" title="This flag exists but no app code currently checks it - a developer needs to wire it in for toggling it to have effect.">
                            Not wired to code yet
                          </Badge>
                        )}
                      </div>
                      {flag.description && <p className="text-xs text-slate-500 truncate">{flag.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setExpandedKey(expandedKey === flag.key ? null : flag.key)}>
                      {expandedKey === flag.key ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(flag)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                  </div>
                </div>

                {expandedKey === flag.key && (
                  <FlagDetail flag={flag} users={users} onChange={load} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Feature Flag</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="flag-key">Key (lowercase, hyphens only)</Label>
              <Input id="flag-key" value={newFlag.key} onChange={(e) => setNewFlag({ ...newFlag, key: e.target.value.toLowerCase() })} placeholder="e.g. career-matching" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flag-name">Display Name</Label>
              <Input id="flag-name" value={newFlag.name} onChange={(e) => setNewFlag({ ...newFlag, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flag-desc">Description</Label>
              <Textarea id="flag-desc" rows={3} value={newFlag.description} onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="flag-default">Enabled by default</Label>
              <Switch id="flag-default" checked={newFlag.defaultEnabled} onCheckedChange={(v) => setNewFlag({ ...newFlag, defaultEnabled: v })} />
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              New flags aren't wired to any real feature yet - a developer needs to reference this key in code before toggling it does anything.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FlagDetail({ flag, users, onChange }: { flag: any; users: any[]; onChange: () => void }) {
  const [roleRules, setRoleRules] = useState<Record<string, boolean>>(flag.roleRules || {});
  const [planRules, setPlanRules] = useState<Record<string, boolean>>(flag.planRules || {});
  const [overrides, setOverrides] = useState<any[]>([]);
  const [overrideEmail, setOverrideEmail] = useState('');
  const [savingRules, setSavingRules] = useState(false);

  const loadOverrides = async () => {
    try {
      const response = await listFeatureOverrides(flag.key);
      setOverrides(response?.overrides || []);
    } catch (err) {
      console.error('Error loading overrides:', err);
    }
  };

  useEffect(() => { loadOverrides(); }, [flag.key]);

  const saveRules = async (nextRole: Record<string, boolean>, nextPlan: Record<string, boolean>) => {
    setSavingRules(true);
    try {
      await updateFeatureFlag(flag.key, { roleRules: nextRole, planRules: nextPlan });
      toast.success('Rules updated');
      onChange();
    } catch (err) {
      console.error('Error saving rules:', err);
      toast.error('Failed to save rules');
    } finally {
      setSavingRules(false);
    }
  };

  const addRoleRule = (role: string) => {
    if (role in roleRules) return;
    const next = { ...roleRules, [role]: true };
    setRoleRules(next);
    saveRules(next, planRules);
  };

  const updateRoleRule = (role: string, enabled: boolean) => {
    const next = { ...roleRules, [role]: enabled };
    setRoleRules(next);
    saveRules(next, planRules);
  };

  const removeRoleRule = (role: string) => {
    const next = { ...roleRules };
    delete next[role];
    setRoleRules(next);
    saveRules(next, planRules);
  };

  const addPlanRule = (plan: string) => {
    if (plan in planRules) return;
    const next = { ...planRules, [plan]: true };
    setPlanRules(next);
    saveRules(roleRules, next);
  };

  const updatePlanRule = (plan: string, enabled: boolean) => {
    const next = { ...planRules, [plan]: enabled };
    setPlanRules(next);
    saveRules(roleRules, next);
  };

  const removePlanRule = (plan: string) => {
    const next = { ...planRules };
    delete next[plan];
    setPlanRules(next);
    saveRules(roleRules, next);
  };

  const handleAddOverride = async (enabled: boolean) => {
    const target = users.find((u) => (u.email || '').toLowerCase() === overrideEmail.trim().toLowerCase());
    if (!target) {
      toast.error('No user found with that email');
      return;
    }
    try {
      await setFeatureOverride(flag.key, target.id, target.email, enabled);
      toast.success(`Override set for ${target.email}`);
      setOverrideEmail('');
      loadOverrides();
    } catch (err) {
      console.error('Error setting override:', err);
      toast.error('Failed to set override');
    }
  };

  const handleRemoveOverride = async (userId: string, email: string) => {
    try {
      await clearFeatureOverride(flag.key, userId);
      toast.success(`Override cleared for ${email}`);
      loadOverrides();
    } catch (err) {
      console.error('Error clearing override:', err);
      toast.error('Failed to clear override');
    }
  };

  const availableRoles = ROLE_OPTIONS.filter((r) => !(r in roleRules));
  const availablePlans = PLAN_OPTIONS.filter((p) => !(p in planRules));

  return (
    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-5">
      <div>
        <Label className="text-xs uppercase text-slate-400">Role Rules</Label>
        <p className="text-xs text-slate-500 mb-2">Override the global default for specific roles. Checked first after account overrides.</p>
        <div className="space-y-2">
          {Object.entries(roleRules).map(([role, enabled]) => (
            <div key={role} className="flex items-center gap-3">
              <span className="text-sm capitalize w-28">{role}</span>
              <Switch checked={enabled} onCheckedChange={(v) => updateRoleRule(role, v)} disabled={savingRules} />
              <Button variant="ghost" size="sm" onClick={() => removeRoleRule(role)}><Trash2 className="w-3.5 h-3.5 text-red-600" /></Button>
            </div>
          ))}
          {availableRoles.length > 0 && (
            <Select onValueChange={addRoleRule}>
              <SelectTrigger className="w-48"><SelectValue placeholder="+ Add role rule" /></SelectTrigger>
              <SelectContent>
                {availableRoles.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div>
        <Label className="text-xs uppercase text-slate-400">Plan Rules</Label>
        <p className="text-xs text-slate-500 mb-2">Override by subscription status. Checked after account overrides and role rules.</p>
        <div className="space-y-2">
          {Object.entries(planRules).map(([plan, enabled]) => (
            <div key={plan} className="flex items-center gap-3">
              <span className="text-sm capitalize w-28">{plan}</span>
              <Switch checked={enabled} onCheckedChange={(v) => updatePlanRule(plan, v)} disabled={savingRules} />
              <Button variant="ghost" size="sm" onClick={() => removePlanRule(plan)}><Trash2 className="w-3.5 h-3.5 text-red-600" /></Button>
            </div>
          ))}
          {availablePlans.length > 0 && (
            <Select onValueChange={addPlanRule}>
              <SelectTrigger className="w-48"><SelectValue placeholder="+ Add plan rule" /></SelectTrigger>
              <SelectContent>
                {availablePlans.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div>
        <Label className="text-xs uppercase text-slate-400">Account Overrides</Label>
        <p className="text-xs text-slate-500 mb-2">Highest priority - overrides role/plan rules and the global default for one specific account.</p>
        <div className="flex gap-2 max-w-md mb-2">
          <Input placeholder="user@email.com" value={overrideEmail} onChange={(e) => setOverrideEmail(e.target.value)} />
          <Button size="sm" variant="outline" onClick={() => handleAddOverride(true)} disabled={!overrideEmail.trim()}>Enable</Button>
          <Button size="sm" variant="outline" onClick={() => handleAddOverride(false)} disabled={!overrideEmail.trim()}>Disable</Button>
        </div>
        <div className="space-y-1">
          {overrides.length === 0 ? (
            <p className="text-sm text-slate-500">No account overrides.</p>
          ) : (
            overrides.map((o) => (
              <div key={o.userId} className="flex items-center justify-between border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5">
                <span className="text-sm text-slate-700 dark:text-slate-300">{o.userEmail || o.userId}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={o.enabled ? 'secondary' : 'destructive'}>{o.enabled ? 'Enabled' : 'Disabled'}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveOverride(o.userId, o.userEmail)}><Trash2 className="w-3.5 h-3.5 text-red-600" /></Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
