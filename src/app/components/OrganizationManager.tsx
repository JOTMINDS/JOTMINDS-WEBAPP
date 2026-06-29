import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getAuthToken } from '../utils/api';
import { Loader, Plus, Trash2, Copy, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';

interface Organization {
  code: string;
  name: string;
  type: string;
  industrySector?: string;
  createdAt: string;
  createdBy: string;
}

export function OrganizationManager() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgType, setNewOrgType] = useState('School');
  const [newOrgSector, setNewOrgSector] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    loadOrganizations();
  }, []);

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
        setOrganizations(data.organizations || []);
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
            industrySector: newOrgSector || null
          })
        }
      );

      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess(`Organization created successfully! Code: ${data.organization.code}`);
        setNewOrgName('');
        setNewOrgType('School');
        setNewOrgSector('');
        loadOrganizations();
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
    if (!confirm(`Are you sure you want to delete organization ${code}?`)) {
      return;
    }

    setError('');
    setSuccess('');
    
    try {
      const token = getAuthToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847/admin/delete-organization/${code}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token || publicAnonKey}`,
            'X-Admin-Token': token || '',
          }
        }
      );

      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess(`Organization ${code} deleted successfully`);
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization Manager
          </CardTitle>
          <CardDescription>
            Create and manage organization invitation codes for teachers and professionals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Create New Organization */}
          <form onSubmit={createOrganization} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                type="text"
                placeholder="e.g., Springfield High School"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                disabled={creating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orgType">Organization Type</Label>
              <Select value={newOrgType} onValueChange={setNewOrgType} disabled={creating}>
                <SelectTrigger id="orgType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="School">School</SelectItem>
                  <SelectItem value="University">University</SelectItem>
                  <SelectItem value="Corporate">Corporate</SelectItem>
                  <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                  <SelectItem value="Government">Government</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newOrgType === 'Corporate' && (
              <div className="space-y-2">
                <Label htmlFor="orgSector">Industry Sector (Optional)</Label>
                <Input
                  id="orgSector"
                  type="text"
                  placeholder="e.g., Technology, Healthcare"
                  value={newOrgSector}
                  onChange={(e) => setNewOrgSector(e.target.value)}
                  disabled={creating}
                />
              </div>
            )}

            <Button type="submit" disabled={creating || !newOrgName.trim()}>
              {creating ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Organization
                </>
              )}
            </Button>
          </form>

          {/* Feedback Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" style={{ color: '#10B981' }} />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Organizations List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Existing Organizations</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={loadOrganizations}
                disabled={loading}
              >
                {loading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>

            {loading && organizations.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : organizations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No organizations created yet
              </div>
            ) : (
              <div className="space-y-2">
                {organizations.map((org) => (
                  <Card key={org.code}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <h4 className="font-semibold">{org.name}</h4>
                          <div className="flex items-center gap-2">
                            <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                              {org.code}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(org.code)}
                              className="h-8 w-8 p-0"
                              title="Copy code"
                            >
                              {copiedCode === org.code ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Type: {org.type}
                            {org.industrySector && ` • Sector: ${org.industrySector}`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Created: {new Date(org.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteOrganization(org.code)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete organization"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use Organization Codes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <p>
              <strong>1. Create an Organization:</strong> Use the form above to create a new organization.
              The system will generate a unique invitation code (e.g., JOTM-ABC123).
            </p>
            <p>
              <strong>2. Share the Code:</strong> Provide the generated code to teachers or professionals
              who want to join your organization.
            </p>
            <p>
              <strong>3. Teacher/Professional Registration:</strong> During sign-up, they can enter the
              organization code to automatically link their account to your institution.
            </p>
            <p>
              <strong>4. Benefits:</strong> Linked accounts enable organization-wide analytics, centralized
              student management, and institutional reporting.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
