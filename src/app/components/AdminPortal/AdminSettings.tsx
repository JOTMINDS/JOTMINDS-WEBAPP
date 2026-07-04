import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { getAdminSettings, saveAdminSettings, JotMindsAdminSettings } from '../../utils/adminSettingsApi';
import { Save, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<JotMindsAdminSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSettings(getAdminSettings());
  }, []);

  const handleSave = () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      saveAdminSettings(settings);
      toast.success('Settings saved successfully. Changes will apply immediately.');
    } catch (err) {
      toast.error('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Platform Settings</h2>
          <p className="text-muted-foreground">
            Configure assessments, scoring bands, and report texts dynamically.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
          {isSaving ? <span className="animate-spin">⚙</span> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Feature Toggles</CardTitle>
            <CardDescription>Enable or disable major platform features.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="questionBank" className="flex flex-col space-y-1">
                <span>Dynamic Question Bank</span>
                <span className="font-normal text-sm text-muted-foreground">Allow dynamic loading of questions</span>
              </Label>
              <Switch 
                id="questionBank" 
                checked={settings.questionBankEnabled}
                onCheckedChange={(c) => setSettings({...settings, questionBankEnabled: c})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="styleDescriptions" className="flex flex-col space-y-1">
                <span>Style Descriptions</span>
                <span className="font-normal text-sm text-muted-foreground">Show detailed cognitive style descriptions</span>
              </Label>
              <Switch 
                id="styleDescriptions" 
                checked={settings.styleDescriptionsEnabled}
                onCheckedChange={(c) => setSettings({...settings, styleDescriptionsEnabled: c})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="careerMappings" className="flex flex-col space-y-1">
                <span>Career Pathway Mappings</span>
                <span className="font-normal text-sm text-muted-foreground">Display career recommendations in reports</span>
              </Label>
              <Switch 
                id="careerMappings" 
                checked={settings.careerMappingsEnabled}
                onCheckedChange={(c) => setSettings({...settings, careerMappingsEnabled: c})}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scoring Thresholds</CardTitle>
            <CardDescription>Configure the score boundaries for preference levels.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="strongPref">Strong Preference (&ge;)</Label>
                <Input 
                  id="strongPref" 
                  type="number" 
                  value={settings.scoringThresholds.strongPreference}
                  onChange={(e) => setSettings({
                    ...settings, 
                    scoringThresholds: { ...settings.scoringThresholds, strongPreference: Number(e.target.value) }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="devPref">Developing Preference (&ge;)</Label>
                <Input 
                  id="devPref" 
                  type="number" 
                  value={settings.scoringThresholds.developingPreference}
                  onChange={(e) => setSettings({
                    ...settings, 
                    scoringThresholds: { ...settings.scoringThresholds, developingPreference: Number(e.target.value) }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergPref">Emerging Preference (&ge;)</Label>
                <Input 
                  id="emergPref" 
                  type="number" 
                  value={settings.scoringThresholds.emergingPreference}
                  onChange={(e) => setSettings({
                    ...settings, 
                    scoringThresholds: { ...settings.scoringThresholds, emergingPreference: Number(e.target.value) }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="growthOpp">Growth Opportunity (&ge;)</Label>
                <Input 
                  id="growthOpp" 
                  type="number" 
                  value={settings.scoringThresholds.growthOpportunity}
                  onChange={(e) => setSettings({
                    ...settings, 
                    scoringThresholds: { ...settings.scoringThresholds, growthOpportunity: Number(e.target.value) }
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Report Texts & Disclaimers</CardTitle>
            <CardDescription>Update the language used across generated reports.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recommendationText">Recommendation Header Text</Label>
              <Input 
                id="recommendationText" 
                value={settings.recommendationTextTemplate}
                onChange={(e) => setSettings({...settings, recommendationTextTemplate: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">Used as the header for the career recommendations section.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="disclaimerText">Global Scientific Disclaimer</Label>
              <Textarea 
                id="disclaimerText" 
                rows={4}
                value={settings.reportDisclaimerText}
                onChange={(e) => setSettings({...settings, reportDisclaimerText: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">This disclaimer appears at the bottom of all assessment reports.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
