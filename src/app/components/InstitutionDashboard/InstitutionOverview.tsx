import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner';
import {
  Users, AlertTriangle, AlertCircle, Building2, MapPin, Mail, Phone, Globe, Shield, QrCode, CheckCircle2, Copy, Share2, Crown, ShieldMinus, BarChart3, Settings, BookOpen, X
} from 'lucide-react';
import {
  Institution,
  InstitutionMember,
  getMemberCountsByStatus,
  resolveSchoolLocation,
  GHANA_REGIONS,
  saveInstitution
} from '../../utils/institution';

interface InstitutionOverviewProps {
  institution: Institution;
  members: InstitutionMember[];
  expired: boolean;
  daysLeft: number | null;
  copied: boolean;
  handleCopyCode: () => void;
  handleShare: () => void;
  setTab: (tab: 'overview' | 'training' | 'manage_students' | 'student_insights' | 'teacher_management' | 'teaching_analytics' | 'reports' | 'settings' | 'profile') => void;
  onManageCodes?: () => void;
  onInstitutionUpdate?: (updated: Institution) => void;
}

export function InstitutionOverview({
  institution,
  members,
  expired,
  daysLeft,
  copied,
  handleCopyCode,
  handleShare,
  setTab,
  onManageCodes,
  onInstitutionUpdate
}: InstitutionOverviewProps) {
  const statusCounts = getMemberCountsByStatus(members);
  const headAdminMember = members.find(m => m.userId === institution.adminId);
  const adminName = headAdminMember?.userName || institution.adminName;
  const adminEmail = headAdminMember?.userEmail || institution.adminEmail;

  const loc = resolveSchoolLocation(institution);
  const displayLocation = loc.displayLocation;

  const [isEditLocationOpen, setIsEditLocationOpen] = useState(false);
  const [editRegion, setEditRegion] = useState(loc.region);
  const [editDistrict, setEditDistrict] = useState(loc.district);
  const [editAddress, setEditAddress] = useState(loc.address);
  const [savingLocation, setSavingLocation] = useState(false);

  useEffect(() => {
    const l = resolveSchoolLocation(institution);
    setEditRegion(l.region);
    setEditDistrict(l.district);
    setEditAddress(l.address);
  }, [institution]);

  const handleSaveLocation = async () => {
    setSavingLocation(true);
    const updated: Institution = {
      ...institution,
      region: editRegion,
      district: editDistrict.trim(),
      address: editAddress.trim(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await saveInstitution(updated);
    } catch (err) {
      console.warn('Remote sync error (persisting locally):', err);
    } finally {
      localStorage.setItem('jotminds_institution', JSON.stringify(updated));
      onInstitutionUpdate?.(updated);
      toast.success('School campus location updated successfully');
      setIsEditLocationOpen(false);
      setSavingLocation(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Overview</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Welcome to your Institution Portal. This dashboard provides a central overview of your school's performance, member management, and cognitive insights. Use the sidebar to navigate between student and teacher analytics, review performance reports, or adjust your settings.
        </p>
      </div>

      {!institution.isActive && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This institution account is <strong>deactivated</strong>. Teachers and students cannot join using the institution code. Reactivate in Settings.
          </AlertDescription>
        </Alert>
      )}

      {/* Institution card */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              {institution.logo ? (
                <img src={institution.logo} alt="Logo" className="w-16 h-16 object-contain rounded-xl border" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-[#5B7DB1] flex items-center justify-center text-white text-2xl font-bold">
                  {institution.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-gray-900 truncate">{institution.name}</h2>
              {institution.tagline && <p className="text-xs text-gray-500 italic mb-2">{institution.tagline}</p>}
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <Badge variant="secondary" className="text-[10px] font-semibold">{institution.type}</Badge>
                <Badge variant="secondary" className="text-[10px] flex items-center font-medium bg-emerald-50 text-emerald-800 border-emerald-200">
                  <MapPin className="w-2.5 h-2.5 mr-1 text-emerald-600 shrink-0" />
                  {displayLocation}
                </Badge>
                {loc.address && (
                  <span className="text-[11px] text-gray-500 hidden sm:inline-flex items-center">
                    • {loc.address}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditLocationOpen(true)}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 hover:underline font-medium inline-flex items-center ml-1 cursor-pointer"
                >
                  Edit Location
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 border-t pt-4">
            {[
              { label: 'Campus Location', icon: <MapPin className="w-3.5 h-3.5 text-rose-500" />, value: displayLocation },
              { label: 'School Code', icon: <QrCode className="w-3.5 h-3.5 text-indigo-500" />, value: institution.code },
              { label: 'Head of School', icon: <Shield className="w-3.5 h-3.5 text-amber-500" />, value: adminName },
              { label: 'Email', icon: <Mail className="w-3.5 h-3.5 text-blue-500" />, value: institution.email },
              { label: 'Phone', icon: <Phone className="w-3.5 h-3.5 text-emerald-500" />, value: institution.phone || 'Available in Directory' },
            ].map(row => (
              <div key={row.label} className="min-w-0">
                <p className="text-[10px] text-gray-400 flex items-center gap-1 mb-0.5">{row.icon}{row.label}</p>
                <p className="text-xs text-gray-700 truncate font-medium" title={row.value}>{row.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top School Code Quick Card */}
      <Card className="border-2 border-indigo-200 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Official School Jots Code</span>
                <span className="text-2xl font-mono font-black text-indigo-950 tracking-wider">{institution.code}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button 
                onClick={handleCopyCode}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex-1 sm:flex-initial"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-300" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? 'Code Copied!' : 'Copy Code'}
              </Button>
              <Button 
                variant="outline"
                onClick={handleShare}
                className="border-indigo-200 text-indigo-900 bg-white hover:bg-indigo-50 rounded-xl text-xs"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share Code
              </Button>
              {onManageCodes && (
                <Button 
                  variant="outline"
                  onClick={onManageCodes}
                  className="border-indigo-200 text-indigo-900 bg-white hover:bg-indigo-50 rounded-xl text-xs"
                >
                  <Settings className="w-4 h-4 mr-1" /> Manage Codes
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* School Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Connected Students', value: statusCounts.students, subtitle: `${statusCounts.pending} pending approval`, color: '#1E8A6E' },
          { label: 'Active Teachers', value: statusCounts.teachers, subtitle: 'Faculty & educators', color: '#6B4C9A' },
          { label: 'Total Approved Members', value: statusCounts.approved, subtitle: 'Verified school community', color: '#5B7DB1' },
          { label: 'School Status', value: institution.isActive ? 'Active' : 'Inactive', subtitle: `${daysLeft ?? 30} days left on code`, color: institution.isActive ? '#10B981' : '#EF4444' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <p className="text-xs font-semibold text-gray-700 mt-0.5">{s.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{s.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:bg-gray-50 cursor-pointer transition-colors shadow-xs" onClick={() => setTab('teacher_management')}>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Teacher Management</p>
              <p className="text-xs text-gray-500">Roster & class assignments</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:bg-gray-50 cursor-pointer transition-colors shadow-xs" onClick={() => setTab('class_management' as any)}>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Class Management</p>
              <p className="text-xs text-gray-500">Review teacher classes</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:bg-gray-50 cursor-pointer transition-colors shadow-xs" onClick={() => setTab('student_insights')}>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Student Insights</p>
              <p className="text-xs text-gray-500">Track cognitive growth</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:bg-gray-50 cursor-pointer transition-colors shadow-xs" onClick={() => setTab('lesson_planning' as any)}>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Lesson Planning</p>
              <p className="text-xs text-gray-500">Curriculum & reflections</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Team */}
      <Card>
        <CardContent className="pt-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Admin Team</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#5B7DB1] flex items-center justify-center text-white text-xs shrink-0">
                {adminName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 truncate">{adminName}</p>
                  <Badge className="bg-[#5B7DB1]/20 text-[#5B7DB1] text-[10px] flex items-center gap-1 hover:bg-[#5B7DB1]/20">
                    <Crown className="w-3 h-3" /> Head Admin
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 truncate">{adminEmail}</p>
              </div>
            </div>
            
            {members.filter(m => m.role === 'admin' && m.userId !== institution.adminId).map(m => (
              <div key={m.userId} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#5B7DB1] flex items-center justify-center text-white text-xs shrink-0">
                  {m.userName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{m.userName}</p>
                    <Badge className="bg-[#5B7DB1]/20 text-[#5B7DB1] text-[10px] flex items-center gap-1 hover:bg-[#5B7DB1]/20">
                      <ShieldMinus className="w-3 h-3" /> Admin
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{m.userEmail}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-gray-400 text-center">
        Institution ID: {institution.id} · Created {new Date(institution.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>

      {/* Quick Location Edit Modal */}
      {isEditLocationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2 text-indigo-950">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Update Campus Location</h3>
                  <p className="text-[11px] text-gray-500">Official geographical location of this school</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditLocationOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <Label className="text-xs font-semibold text-gray-700">Region</Label>
                <select
                  value={editRegion}
                  onChange={e => setEditRegion(e.target.value)}
                  className="w-full mt-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {GHANA_REGIONS.map(r => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700">District / Municipality</Label>
                <Input
                  value={editDistrict}
                  onChange={e => setEditDistrict(e.target.value)}
                  placeholder="e.g. Ablekuma Central, Accra Metropolitan"
                  className="mt-1.5 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700">Campus Street Address / Landmark</Label>
                <Input
                  value={editAddress}
                  onChange={e => setEditAddress(e.target.value)}
                  placeholder="e.g. Bubuashie, Winneba Road"
                  className="mt-1.5 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditLocationOpen(false)}
                disabled={savingLocation}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveLocation}
                disabled={savingLocation}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
              >
                {savingLocation ? 'Saving...' : 'Save Location'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
