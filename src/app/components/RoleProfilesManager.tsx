import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Target, Plus, Trash2, Save, X, Upload, FileText, AlertCircle } from 'lucide-react';
import { getRoleProfiles, createRoleProfile, updateRoleProfile, deleteRoleProfile } from '../utils/api';
import { RoleCognitiveDemand } from '../utils/cognitiveRoleFitEngine';
import { parseJobDescription, readFileAsText } from '../utils/jobDescriptionParser';
import { toast } from 'sonner';

interface RoleProfilesManagerProps {
  orgId: string;
  onClose: () => void;
}

interface RoleProfileData {
  id?: string;
  title: string;
  description: string;
  cognitive_demands: RoleCognitiveDemand;
}

const defaultDemands: RoleCognitiveDemand = {
  analyticalDepth: 5,
  ambiguityTolerance: 5,
  emotionalLaborLoad: 5,
  decisionSpeed: 5,
  stakeholderComplexity: 5,
  repetitionVsInnovation: 5,
  socialExposure: 5,
  detailSensitivity: 5,
  autonomyRequired: 5,
  cognitiveLoadVolatility: 5,
};

export function RoleProfilesManager({ orgId, onClose }: RoleProfilesManagerProps) {
  const [profiles, setProfiles] = useState<RoleProfileData[]>([]);
  const [editingProfile, setEditingProfile] = useState<RoleProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSource, setUploadSource] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfiles();
  }, [orgId]);

  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      const data = await getRoleProfiles(orgId);
      if (data.success) {
        setProfiles(data.profiles || []);
      }
    } catch (error) {
      console.error('Failed to load role profiles:', error);
      toast.error('Failed to load role profiles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    setUploadSource(null);
    setEditingProfile({
      title: 'New Job Role',
      description: '',
      cognitive_demands: { ...defaultDemands }
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const text = await readFileAsText(file);
      if (!text || text.length < 20) {
        toast.error('Could not extract text from the file. Try a .txt or .pdf file.');
        return;
      }
      
      const parsed = parseJobDescription(text);
      setUploadSource(file.name);
      setEditingProfile({
        title: parsed.title,
        description: parsed.description,
        cognitive_demands: parsed.demands,
      });
      toast.success(`Parsed "${file.name}" — review and adjust the scores below.`);
    } catch (error) {
      console.error('Failed to parse job description:', error);
      toast.error('Failed to parse the uploaded file. Please try a different format.');
    } finally {
      setIsUploading(false);
      // Reset file input so the same file can be re-uploaded
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (editingProfile) {
      try {
        if (editingProfile.id) {
          await updateRoleProfile(editingProfile.id, editingProfile);
          toast.success('Role updated');
        } else {
          await createRoleProfile({ ...editingProfile, org_id: orgId });
          toast.success('Role created');
        }
        await loadProfiles();
        setEditingProfile(null);
      } catch (error) {
        toast.error('Failed to save role profile');
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRoleProfile(id);
      toast.success('Role deleted');
      await loadProfiles();
    } catch (error) {
      toast.error('Failed to delete role profile');
    }
  };

  const updateDemand = (key: keyof RoleCognitiveDemand, value: string) => {
    if (!editingProfile) return;
    const numValue = Math.max(1, Math.min(10, parseInt(value) || 1));
    setEditingProfile({
      ...editingProfile,
      cognitive_demands: {
        ...editingProfile.cognitive_demands,
        [key]: numValue
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-600" />
              Role Cognitive Demand Builder
            </CardTitle>
            <CardDescription>
              Define the cognitive requirements for this role across 10 core dimensions (1-10 scale).
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-6">
          {editingProfile ? (
            <div className="space-y-6">
              {uploadSource && (
                <div className="flex items-start gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg">
                  <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                      Auto-filled from: {uploadSource}
                    </p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
                      Cognitive demand scores were estimated from the job description keywords. Please review and adjust the sliders as needed before saving.
                    </p>
                  </div>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Role Title</Label>
                  <Input 
                    value={editingProfile.title} 
                    onChange={e => setEditingProfile({...editingProfile, title: e.target.value})}
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input 
                    value={editingProfile.description} 
                    onChange={e => setEditingProfile({...editingProfile, description: e.target.value})}
                    placeholder="Brief description of the role's primary function"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground border-b pb-2">Cognitive Demand Profile (1-10)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {[
                    { key: 'analyticalDepth', label: 'Analytical Depth Required' },
                    { key: 'ambiguityTolerance', label: 'Ambiguity Tolerance' },
                    { key: 'emotionalLaborLoad', label: 'Emotional Labor Load' },
                    { key: 'decisionSpeed', label: 'Decision Speed Required' },
                    { key: 'stakeholderComplexity', label: 'Stakeholder Complexity' },
                    { key: 'repetitionVsInnovation', label: 'Repetition (1) vs Innovation (10)' },
                    { key: 'socialExposure', label: 'Social Exposure Level' },
                    { key: 'detailSensitivity', label: 'Detail Sensitivity' },
                    { key: 'autonomyRequired', label: 'Autonomy Required' },
                    { key: 'cognitiveLoadVolatility', label: 'Cognitive Load Volatility' }
                  ].map(dim => (
                    <div key={dim.key} className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm">{dim.label}</Label>
                        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {editingProfile.cognitive_demands[dim.key as keyof RoleCognitiveDemand]}
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        className="w-full accent-indigo-600"
                        value={editingProfile.cognitive_demands[dim.key as keyof RoleCognitiveDemand]} 
                        onChange={e => updateDemand(dim.key as keyof RoleCognitiveDemand, e.target.value)} 
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingProfile(null)}>Cancel</Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" /> Save Profile
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button onClick={handleAddNew} className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" /> Build Manually
                </Button>
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200" 
                  variant="outline"
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" /> 
                  {isUploading ? 'Parsing...' : 'Upload Job Description'}
                </Button>
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".txt,.pdf,.doc,.docx,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
              <p className="text-xs text-center text-muted-foreground">
                Upload a .txt or .pdf job description to auto-fill the cognitive demand sliders
              </p>
              
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : profiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No role profiles created yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {profiles.map(profile => (
                    <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                      <div>
                        <h4 className="font-semibold">{profile.title}</h4>
                        {profile.description && (
                          <p className="text-sm text-muted-foreground mt-1">{profile.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingProfile(profile)}>Edit</Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => profile.id && handleDelete(profile.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
