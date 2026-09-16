import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { Loader } from 'lucide-react';
import { toast } from 'sonner';
import { getPlatformSettings, updatePlatformSettings } from '../../../utils/api';

export function PlatformSettingsView() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const response = await getPlatformSettings();
        setSettings(response?.settings || {});
      } catch (err) {
        console.error('Error loading platform settings:', err);
        toast.error('Failed to load platform settings');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updatePlatformSettings(settings);
      setSettings(response?.settings || settings);
      toast.success('Settings saved');
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-slate-500">
        <Loader className="w-6 h-6 animate-spin mr-2" /> Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Platform Settings</h2>
        <p className="text-slate-500 dark:text-slate-400">Global variables, branding, and localization.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>General</CardTitle></CardHeader>
        <CardContent className="space-y-4 max-w-lg">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input id="siteName" value={settings.siteName || ''} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supportEmail">Support Email</Label>
            <Input id="supportEmail" type="email" value={settings.supportEmail || ''} onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Brand Color</Label>
            <div className="flex items-center gap-2">
              <Input id="primaryColor" value={settings.primaryColor || ''} onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })} />
              <div className="h-9 w-9 rounded border border-slate-200 dark:border-slate-800 flex-shrink-0" style={{ backgroundColor: settings.primaryColor }} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultLocale">Default Locale</Label>
            <Input id="defaultLocale" value={settings.defaultLocale || ''} onChange={(e) => setSettings({ ...settings, defaultLocale: e.target.value })} placeholder="en" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <div>
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              <p className="text-xs text-slate-500">Show a maintenance banner platform-wide.</p>
            </div>
            <Switch id="maintenanceMode" checked={!!settings.maintenanceMode} onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })} />
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
            {saving ? <><Loader className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
