import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Target, Users, Settings2, ShieldAlert } from 'lucide-react';
import { getRoleProfiles } from '../utils/api';
import { RoleCognitiveDemand, calculateRoleFitScore, CognitiveRoleFitScore } from '../utils/cognitiveRoleFitEngine';
import { mapAssessmentsToResponses } from './SupervisorDashboard'; // Needed to parse candidate profiles
import { getAssessmentsByUserId } from '../utils/storage';
import { calculateProfessionalCognitiveProfile } from '../utils/professionalCognitiveScoring';
import { RoleProfilesManager } from './RoleProfilesManager';
import { CandidateComparisonPanel } from './CandidateComparisonPanel';
import { MultiCandidateRanking } from './MultiCandidateRanking';

interface RoleFitDashboardProps {
  orgId: string;
  professionals: any[];
}

export function RoleFitDashboard({ orgId, professionals }: RoleFitDashboardProps) {
  const [roleProfiles, setRoleProfiles] = useState<any[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [showRoleBuilder, setShowRoleBuilder] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRoles();
  }, [orgId, showRoleBuilder]); // Reload roles when builder closes

  const loadRoles = async () => {
    setIsLoading(true);
    try {
      const res = await getRoleProfiles(orgId);
      if (res.success) {
        setRoleProfiles(res.profiles);
        if (res.profiles.length > 0 && !selectedRoleId) {
          setSelectedRoleId(res.profiles[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRole = roleProfiles.find(r => r.id === selectedRoleId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Hiring & Promotions (Role Matcher)</h2>
          <p className="text-muted-foreground">Compare team members against standard cognitive role profiles.</p>
        </div>
        <Button onClick={() => setShowRoleBuilder(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Settings2 className="w-4 h-4 mr-2" />
          Manage Role Demands
        </Button>
      </div>

      {showRoleBuilder && (
        <RoleProfilesManager orgId={orgId} onClose={() => setShowRoleBuilder(false)} />
      )}

      {isLoading ? (
        <div className="py-12 text-center text-slate-500">Loading role profiles...</div>
      ) : roleProfiles.length === 0 ? (
        <Card className="border-dashed border-2 bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Target className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">No Role Profiles Found</h3>
            <p className="text-slate-500 max-w-sm mt-1 mb-6">
              Create your first Role Cognitive Demand profile to start matching candidates and predicting performance.
            </p>
            <Button onClick={() => setShowRoleBuilder(true)} variant="outline">
              Create Role Profile
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Available Roles</h3>
            <div className="space-y-2">
              {roleProfiles.map(role => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedRoleId === role.id 
                      ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-medium text-slate-900">{role.title}</div>
                  <div className="text-xs text-slate-500 mt-1 line-clamp-2">{role.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            {selectedRole && (
              <MultiCandidateRanking 
                role={selectedRole} 
                professionals={professionals} 
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
