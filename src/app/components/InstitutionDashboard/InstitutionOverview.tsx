import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import {
  AlertTriangle, AlertCircle, Building2, MapPin, Mail, Phone, Globe, Shield, QrCode, CheckCircle2, Copy, Share2, Crown, ShieldMinus, BarChart3, Settings
} from 'lucide-react';
import { Institution, InstitutionMember, getMemberCountsByStatus } from '../../utils/institution';

interface InstitutionOverviewProps {
  institution: Institution;
  members: InstitutionMember[];
  expired: boolean;
  daysLeft: number | null;
  copied: boolean;
  handleCopyCode: () => void;
  handleShare: () => void;
  setTab: (tab: 'overview' | 'members' | 'analytics' | 'reports' | 'settings' | 'profile' | 'training') => void;
  onManageCodes?: () => void;
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
  onManageCodes
}: InstitutionOverviewProps) {
  const statusCounts = getMemberCountsByStatus(members);
  const headAdminMember = members.find(m => m.userId === institution.adminId);
  const adminName = headAdminMember?.userName || institution.adminName;
  const adminEmail = headAdminMember?.userEmail || institution.adminEmail;

  return (
    <div className="space-y-5">
      {!institution.isActive && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This institution account is <strong>deactivated</strong>. Teachers and students cannot join using the institution code. Reactivate in Settings.
          </AlertDescription>
        </Alert>
      )}

      {expired && institution.isActive && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            The institution code has <strong>expired</strong>. Click 'Manage Codes' on the code card below.
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
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-[10px]">{institution.type}</Badge>
                <Badge variant="secondary" className="text-[10px]">
                  <MapPin className="w-2.5 h-2.5 mr-0.5" />
                  {institution.district}, {institution.region}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 border-t pt-4">
            {[
              { label: 'Email', icon: <Mail className="w-3.5 h-3.5" />, value: institution.email },
              { label: 'Phone', icon: <Phone className="w-3.5 h-3.5" />, value: institution.phone },
              { label: 'Website', icon: <Globe className="w-3.5 h-3.5" />, value: institution.website || '—' },
              { label: 'Admin', icon: <Shield className="w-3.5 h-3.5" />, value: adminName },
            ].map(row => (
              <div key={row.label}>
                <p className="text-[10px] text-gray-400 flex items-center gap-1 mb-0.5">{row.icon}{row.label}</p>
                <p className="text-xs text-gray-700 truncate">{row.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Approved Members', value: statusCounts.approved, pending: statusCounts.pending, color: '#5B7DB1' },
          { label: 'Teachers', value: statusCounts.teachers, pending: 0, color: '#6B4C9A' },
          { label: 'Students', value: statusCounts.students, pending: 0, color: '#1E8A6E' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              {s.pending > 0 && (
                <Badge className="mt-1 text-[10px] bg-amber-100 text-amber-700 border-amber-200">{s.pending} pending</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Facts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-slate-50 border-slate-100">
          <CardContent className="pt-4 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">School Type</p>
            <p className="text-sm font-semibold text-gray-800">{institution.type}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-50 border-slate-100">
          <CardContent className="pt-4 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Region</p>
            <p className="text-sm font-semibold text-gray-800">{institution.region}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-50 border-slate-100">
          <CardContent className="pt-4 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">District</p>
            <p className="text-sm font-semibold text-gray-800">{institution.district}</p>
          </CardContent>
        </Card>
        {statusCounts.pending > 0 && (
          <Card className="bg-amber-50 border-amber-100">
            <CardContent className="pt-4 text-center">
              <p className="text-[10px] text-amber-600 uppercase tracking-wider mb-1">Pending Requests</p>
              <p className="text-sm font-semibold text-amber-700">{statusCounts.pending}</p>
            </CardContent>
          </Card>
        )}
      </div>

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
    </div>
  );
}
