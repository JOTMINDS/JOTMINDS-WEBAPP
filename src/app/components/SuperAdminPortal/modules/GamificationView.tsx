import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Switch } from '../../ui/switch';
import { Loader, Plus, Trash2, Trophy, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { getGamificationConfig, updateGamificationConfig } from '../../../utils/api';

interface Level { level: number; xpRequired: number; title: string; }
interface SeasonalEvent { id: string; name: string; startDate: string; endDate: string; active: boolean; bonusMultiplier: number; }

export function GamificationView() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [events, setEvents] = useState<SeasonalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const response = await getGamificationConfig();
        setLevels(response?.config?.levels || []);
        setEvents(response?.config?.seasonalEvents || []);
      } catch (err) {
        console.error('Error loading gamification config:', err);
        toast.error('Failed to load gamification config');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateGamificationConfig({ levels, seasonalEvents: events });
      toast.success('Gamification config saved');
    } catch (err) {
      console.error('Error saving gamification config:', err);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const updateLevel = (idx: number, field: keyof Level, value: any) => {
    setLevels(levels.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
  };

  const addLevel = () => {
    const next = (levels[levels.length - 1]?.level || 0) + 1;
    setLevels([...levels, { level: next, xpRequired: 0, title: `Level ${next}` }]);
  };

  const removeLevel = (idx: number) => setLevels(levels.filter((_, i) => i !== idx));

  const addEvent = () => {
    setEvents([...events, { id: crypto.randomUUID(), name: 'New Event', startDate: '', endDate: '', active: false, bonusMultiplier: 1.5 }]);
  };

  const updateEvent = (idx: number, field: keyof SeasonalEvent, value: any) => {
    setEvents(events.map((e, i) => (i === idx ? { ...e, [field]: value } : e)));
  };

  const removeEvent = (idx: number) => setEvents(events.filter((_, i) => i !== idx));

  if (loading) {
    return <div className="flex items-center justify-center min-h-[300px] text-slate-500"><Loader className="w-6 h-6 animate-spin mr-2" /> Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Gamification</h2>
          <p className="text-slate-500 dark:text-slate-400">Configure levels, XP, and seasonal events.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
          {saving ? <><Loader className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Changes'}
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Trophy className="w-4 h-4 text-indigo-600" /> Levels & XP</CardTitle>
          <Button variant="outline" size="sm" onClick={addLevel}><Plus className="w-4 h-4 mr-1" /> Add Level</Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {levels.map((lvl, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input className="w-20" type="number" value={lvl.level} onChange={(e) => updateLevel(idx, 'level', Number(e.target.value))} placeholder="Level" />
              <Input className="w-32" type="number" value={lvl.xpRequired} onChange={(e) => updateLevel(idx, 'xpRequired', Number(e.target.value))} placeholder="XP Required" />
              <Input value={lvl.title} onChange={(e) => updateLevel(idx, 'title', e.target.value)} placeholder="Title" />
              <Button variant="ghost" size="sm" onClick={() => removeLevel(idx)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
            </div>
          ))}
          {levels.length === 0 && <p className="text-sm text-slate-500">No levels configured.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-600" /> Seasonal Events</CardTitle>
          <Button variant="outline" size="sm" onClick={addEvent}><Plus className="w-4 h-4 mr-1" /> Add Event</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {events.map((ev, idx) => (
            <div key={ev.id} className="flex items-center gap-2 flex-wrap border border-slate-200 dark:border-slate-800 rounded-lg p-3">
              <Input className="w-40" value={ev.name} onChange={(e) => updateEvent(idx, 'name', e.target.value)} placeholder="Event name" />
              <Input className="w-36" type="date" value={ev.startDate} onChange={(e) => updateEvent(idx, 'startDate', e.target.value)} />
              <Input className="w-36" type="date" value={ev.endDate} onChange={(e) => updateEvent(idx, 'endDate', e.target.value)} />
              <Input className="w-28" type="number" step="0.1" value={ev.bonusMultiplier} onChange={(e) => updateEvent(idx, 'bonusMultiplier', Number(e.target.value))} placeholder="XP Multiplier" />
              <div className="flex items-center gap-2">
                <Switch checked={ev.active} onCheckedChange={(checked) => updateEvent(idx, 'active', checked)} />
                <span className="text-xs text-slate-500">Active</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeEvent(idx)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
            </div>
          ))}
          {events.length === 0 && <p className="text-sm text-slate-500">No seasonal events configured.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
