import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Target, Plus, Trash2, Save, X } from 'lucide-react';
import { RoleProfile, getRoleProfiles, saveRoleProfile, deleteRoleProfile, generateId } from '../utils/storage';

interface RoleProfilesManagerProps {
  orgId: string;
  onClose: () => void;
}

export function RoleProfilesManager({ orgId, onClose }: RoleProfilesManagerProps) {
  const [profiles, setProfiles] = useState<RoleProfile[]>([]);
  const [editingProfile, setEditingProfile] = useState<RoleProfile | null>(null);

  useEffect(() => {
    setProfiles(getRoleProfiles(orgId));
  }, [orgId]);

  const handleAddNew = () => {
    setEditingProfile({
      id: generateId(),
      orgId,
      name: 'New Job Role',
      idealScores: {
        analytical: 50,
        creative: 50,
        practical: 50,
        intuitive: 50,
        reflective: 50,
      }
    });
  };

  const handleSave = () => {
    if (editingProfile) {
      saveRoleProfile(editingProfile);
      setProfiles(getRoleProfiles(orgId));
      setEditingProfile(null);
    }
  };

  const handleDelete = (id: string) => {
    deleteRoleProfile(id);
    setProfiles(getRoleProfiles(orgId));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-600" />
              Manage Job Role Profiles
            </CardTitle>
            <CardDescription>
              Define ideal cognitive scores for specific roles to compare employees against.
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-6">
          {editingProfile ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Role Title</Label>
                <Input 
                  value={editingProfile.name} 
                  onChange={e => setEditingProfile({...editingProfile, name: e.target.value})}
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground border-b pb-2">Ideal Cognitive Distribution (0-100)</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-blue-600">Analytical</Label>
                    <Input type="number" min="0" max="100" value={editingProfile.idealScores.analytical} 
                      onChange={e => setEditingProfile({
                        ...editingProfile, 
                        idealScores: {...editingProfile.idealScores, analytical: parseInt(e.target.value) || 0}
                      })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-purple-600">Creative</Label>
                    <Input type="number" min="0" max="100" value={editingProfile.idealScores.creative} 
                      onChange={e => setEditingProfile({
                        ...editingProfile, 
                        idealScores: {...editingProfile.idealScores, creative: parseInt(e.target.value) || 0}
                      })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-green-600">Practical</Label>
                    <Input type="number" min="0" max="100" value={editingProfile.idealScores.practical} 
                      onChange={e => setEditingProfile({
                        ...editingProfile, 
                        idealScores: {...editingProfile.idealScores, practical: parseInt(e.target.value) || 0}
                      })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-orange-600">Intuitive</Label>
                    <Input type="number" min="0" max="100" value={editingProfile.idealScores.intuitive} 
                      onChange={e => setEditingProfile({
                        ...editingProfile, 
                        idealScores: {...editingProfile.idealScores, intuitive: parseInt(e.target.value) || 0}
                      })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-teal-600">Reflective</Label>
                    <Input type="number" min="0" max="100" value={editingProfile.idealScores.reflective} 
                      onChange={e => setEditingProfile({
                        ...editingProfile, 
                        idealScores: {...editingProfile.idealScores, reflective: parseInt(e.target.value) || 0}
                      })} 
                    />
                  </div>
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
              <Button onClick={handleAddNew} className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" /> Create New Role Profile
              </Button>
              
              {profiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No role profiles created yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {profiles.map(profile => (
                    <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                      <div>
                        <h4 className="font-semibold">{profile.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          A: {profile.idealScores.analytical} | C: {profile.idealScores.creative} | P: {profile.idealScores.practical}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingProfile(profile)}>Edit</Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(profile.id)}>
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
