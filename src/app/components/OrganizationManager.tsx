import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getAuthToken } from '../utils/api';
import { Loader, Plus, Trash2, Copy, CheckCircle2, AlertCircle, Building2, GraduationCap, Users, ArrowLeft, MoreHorizontal, Settings } from 'lucide-react';
import { User } from '../types';

interface Organization {
  id?: string;
  code: string;
  name: string;
  type: string;
  industrySector?: string;
  createdAt: string;
  createdBy: string;
}

interface OrganizationManagerProps {
  mode?: 'institutions' | 'organizations';
  users?: User[];
}

export function OrganizationManager({ mode = 'organizations', users = [] }: OrganizationManagerProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Detail View State
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  // Form state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgType, setNewOrgType] = useState(mode === 'institutions' ? 'School' : 'Corporate');
  const [newOrgSector, setNewOrgSector] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');

  const isInstitution = mode === 'institutions';
  const themeColor = isInstitution ? 'indigo' : 'emerald';
  const Icon = isInstitution ? GraduationCap : Building2;

  useEffect(() => {
    loadOrganizations();
    setSelectedOrg(null);
  }, [mode]);

  const loadOrganizations = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = getAuthToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847/admin/list-organizations`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token || publicAnonKey}`,
            'X-Admin-Token': token || '',
          }
        }
      );

      const data = await response.json();
      
      if (response.ok && data.success) {
        let orgs = data.organizations || [];
        if (mode === 'institutions') {
            orgs = orgs.filter((o: Organization) => o.type && (o.type.toLowerCase().includes('school') || o.type.toLowerCase().includes('university')));
        } else if (mode === 'organizations') {
            orgs = orgs.filter((o: Organization) => !o.type || (!o.type.toLowerCase().includes('school') && !o.type.toLowerCase().includes('university')));
        }
        setOrganizations(orgs);
      } else {
        setError(data.error || 'Failed to load organizations');
      }
    } catch (err) {
      console.error('Error loading organizations:', err);
      setError('Failed to load organizations. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newOrgName.trim()) {
      setError('Organization name is required');
      return;
    }

    setCreating(true);
    setError('');
    setSuccess('');
    
    try {
      const token = getAuthToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847/admin/create-organization`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || publicAnonKey}`,
            'X-Admin-Token': token || '',
          },
          body: JSON.stringify({
            name: newOrgName,
            type: newOrgType,
            industrySector: newOrgSector || undefined
          })
        }
      );

      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess(`Created successfully. Code: ${data.organization.code}`);
        setNewOrgName('');
        setNewOrgSector('');
        setIsCreateModalOpen(false);
        loadOrganizations();
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(data.error || 'Failed to create organization');
      }
    } catch (err) {
      console.error('Error creating organization:', err);
      setError('Failed to create organization. Please check your connection.');
    } finally {
      setCreating(false);
    }
  };

  const deleteOrganization = async (code: string) => {
    if (!window.confirm('Are you sure you want to delete this organization? This cannot be undone.')) {
      return;
    }

    setError('');
    
    try {
      const token = getAuthToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847/admin/delete-organization`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || publicAnonKey}`,
            'X-Admin-Token': token || '',
          },
          body: JSON.stringify({ code })
        }
      );

      const data = await response.json();
      
      if (response.ok && data.success) {
        if (selectedOrg?.code === code) setSelectedOrg(null);
        loadOrganizations();
      } else {
        setError(data.error || 'Failed to delete organization');
      }
    } catch (err) {
      console.error('Error deleting organization:', err);
      setError('Failed to delete organization. Please check your connection.');
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Helper to get members of an org
  const getOrgMembers = (orgCode: string) => {
    return users.filter(u => u.organizationCode === orgCode || u.organizationId === orgCode);
  };

  if (selectedOrg) {
    const orgMembers = getOrgMembers(selectedOrg.code);
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedOrg(null)} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {selectedOrg.name}
              </h2>
              <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                <Badge variant="outline" className={`bg-${themeColor}-50 text-${themeColor}-700 border-${themeColor}-200`}>
                  {selectedOrg.type}
                </Badge>
                <span>Created {new Date(selectedOrg.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-md p-1 px-3 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 mr-2 uppercase tracking-wider font-semibold">Join Code:</span>
                <code className="font-mono text-sm font-bold">{selectedOrg.code}</code>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(selectedOrg.code)} className="h-6 w-6 ml-2">
                  {copiedCode === selectedOrg.code ? <CheckCircle2 className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                </Button>
             </div>
             <Button variant="outline" size="sm" onClick={() => deleteOrganization(selectedOrg.code)} className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50">
               <Trash2 className="h-4 w-4 mr-2" /> Delete
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-4 rounded-xl bg-${themeColor}-100 dark:bg-${themeColor}-900/30 text-${themeColor}-600 dark:text-${themeColor}-400`}>
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Members</p>
                <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{orgMembers.length}</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Assessments Taken</p>
                <h3 className="text-3xl font-bold text-slate-800 dark:text-white">--</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Member Roster</CardTitle>
            <CardDescription>Users associated with this {isInstitution ? 'institution' : 'organization'}.</CardDescription>
          </CardHeader>
          <CardContent>
             {orgMembers.length === 0 ? (
                <div className="py-12 text-center text-slate-500 flex flex-col items-center">
                   <Users className="h-12 w-12 text-slate-300 mb-3" />
                   <p>No members found for this organization.</p>
                   <p className="text-sm mt-1">Users will appear here when they register using the join code <strong>{selectedOrg.code}</strong>.</p>
                </div>
             ) : (
                <div className="border rounded-md">
                   <Table>
                      <TableHeader>
                         <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined</TableHead>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                         {orgMembers.map((user) => (
                            <TableRow key={user.uid}>
                               <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                               <TableCell>{user.email}</TableCell>
                               <TableCell>
                                 <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                               </TableCell>
                               <TableCell className="text-slate-500">
                                  {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                               </TableCell>
                            </TableRow>
                         ))}
                      </TableBody>
                   </Table>
                </div>
             )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className={`p-2 bg-${themeColor}-100 dark:bg-${themeColor}-900/30 text-${themeColor}-600 rounded-lg`}>
               <Icon className="h-5 w-5" />
            </div>
            <div>
               <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {isInstitution ? 'Institutions' : 'Organizations'} Directory
               </h3>
               <p className="text-sm text-slate-500">Manage your {mode} and their join codes.</p>
            </div>
         </div>
         <div className="flex gap-2">
            <Button variant="outline" onClick={loadOrganizations} disabled={loading}>
              {loading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : null}
              Refresh
            </Button>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                 <Button className={`bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white`}>
                    <Plus className="mr-2 h-4 w-4" /> Add {isInstitution ? 'Institution' : 'Organization'}
                 </Button>
              </DialogTrigger>
              <DialogContent>
                 <DialogHeader>
                    <DialogTitle>Add New {isInstitution ? 'Institution' : 'Organization'}</DialogTitle>
                    <DialogDescription>
                       Generate a new join code to invite members.
                    </DialogDescription>
                 </DialogHeader>
                 <form onSubmit={createOrganization} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="orgName">Name</Label>
                      <Input
                        id="orgName"
                        placeholder={isInstitution ? "e.g., Springfield High School" : "e.g., Acme Corp"}
                        value={newOrgName}
                        onChange={(e) => setNewOrgName(e.target.value)}
                        disabled={creating}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orgType">Type</Label>
                      <Select value={newOrgType} onValueChange={setNewOrgType} disabled={creating}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {isInstitution ? (
                            <>
                              <SelectItem value="School">School</SelectItem>
                              <SelectItem value="University">University</SelectItem>
                              <SelectItem value="District">District</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="Corporate">Corporate</SelectItem>
                              <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                              <SelectItem value="Government">Government</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {!isInstitution && (
                      <div className="space-y-2">
                        <Label htmlFor="orgSector">Industry Sector (Optional)</Label>
                        <Input
                          id="orgSector"
                          placeholder="e.g., Technology, Healthcare"
                          value={newOrgSector}
                          onChange={(e) => setNewOrgSector(e.target.value)}
                          disabled={creating}
                        />
                      </div>
                    )}
                    
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    
                    <DialogFooter>
                       <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                       <Button type="submit" disabled={creating || !newOrgName.trim()} className={`bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white`}>
                         {creating ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                         Create
                       </Button>
                    </DialogFooter>
                 </form>
              </DialogContent>
            </Dialog>
         </div>
      </div>

      {success && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {loading && organizations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Loader className="h-8 w-8 animate-spin mb-4 text-slate-300" />
          <p>Loading directory...</p>
        </div>
      ) : organizations.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className={`w-16 h-16 bg-${themeColor}-50 rounded-full flex items-center justify-center mb-6`}>
              <Icon className={`w-8 h-8 text-${themeColor}-300`} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No {mode} found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">
              You haven't added any {mode} yet. Create one to generate an invitation code.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)} className={`bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white`}>
               <Plus className="mr-2 h-4 w-4" /> Add First {isInstitution ? 'Institution' : 'Organization'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizations.map((org) => {
             const memberCount = getOrgMembers(org.code).length;
             return (
               <Card key={org.code} className="hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer group" onClick={() => setSelectedOrg(org)}>
                 <CardContent className="p-5">
                   <div className="flex justify-between items-start mb-4">
                     <Badge variant="secondary" className={`bg-${themeColor}-50 text-${themeColor}-700`}>{org.type}</Badge>
                     <Button 
                       variant="ghost" 
                       size="icon" 
                       className="opacity-0 group-hover:opacity-100 h-8 w-8 -mr-2 -mt-2 text-slate-400 hover:text-slate-700"
                       onClick={(e) => { e.stopPropagation(); setSelectedOrg(org); }}
                     >
                       <MoreHorizontal className="h-5 w-5" />
                     </Button>
                   </div>
                   
                   <h4 className="font-bold text-lg text-slate-800 dark:text-white line-clamp-1 mb-1">{org.name}</h4>
                   {org.industrySector && <p className="text-xs text-slate-500 mb-3">{org.industrySector}</p>}
                   
                   <div className="flex items-center gap-2 mt-4 mb-4" onClick={(e) => e.stopPropagation()}>
                     <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono font-semibold flex-1 text-center border border-slate-200 dark:border-slate-700">
                       {org.code}
                     </code>
                     <Button
                       variant="outline"
                       size="icon"
                       onClick={() => copyToClipboard(org.code)}
                       className="h-7 w-7"
                       title="Copy code"
                     >
                       {copiedCode === org.code ? (
                         <CheckCircle2 className="h-3 w-3 text-green-600" />
                       ) : (
                         <Copy className="h-3 w-3 text-slate-500" />
                       )}
                     </Button>
                   </div>
                   
                   <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-sm">
                     <div className="flex items-center text-slate-500">
                        <Users className="h-4 w-4 mr-1.5" />
                        <span>{memberCount} members</span>
                     </div>
                     <span className="text-slate-400 text-xs">{new Date(org.createdAt).toLocaleDateString()}</span>
                   </div>
                 </CardContent>
               </Card>
             );
          })}
        </div>
      )}
    </div>
  );
}
