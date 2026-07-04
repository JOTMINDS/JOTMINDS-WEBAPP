import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import {
  AlertTriangle, AlertCircle, Building2, MapPin, Mail, Phone, Globe, Shield, QrCode, CheckCircle2, Copy, Share2, Crown, ShieldMinus, BarChart3
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
  setTab: (tab: 'overview' | 'code' | 'members' | 'analytics' | 'reports' | 'settings' | 'profile') => void;
}

export function InstitutionOverview({
  institution,
  members,
  expired,
  daysLeft,
  copied,
  handleCopyCode,
  handleShare,
  setTab
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
            The institution code has <strong>expired</strong>. Regenerate it in the Code Manager tab.
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

      {/* Teaching Styles Overview Link */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Teaching Styles Analytics</h3>
              <p className="text-xs text-gray-600">
                Compare teaching styles across your school's educators to optimize student placement and professional development.
              </p>
            </div>
            <Button 
              size="sm" 
              className="shrink-0"
              style={{ backgroundColor: '#5B7DB1' }}
              onClick={() => setTab('teacher_styles' as any)}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Compare Styles
            </Button>
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

      {/* Code quick-view */}
      <Card className={`border-2 ${expired ? 'border-red-200' : 'border-blue-200'}`}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><QrCode className="w-3.5 h-3.5" />Institution Code</p>
              <div className="text-2xl font-mono tracking-widest text-gray-900">{institution.code}</div>
              {expired ? (
                <p className="text-xs text-red-500 mt-1">⚠ Code expired — regenerate in Code Manager</p>
              ) : daysLeft !== null ? (
                <p className="text-xs text-amber-600 mt-1">⏱ Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</p>
              ) : (
                <p className="text-xs text-green-600 mt-1">✓ No expiry</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleCopyCode}>
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-500" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button size="sm" variant="outline" onClick={handleShare}>
                <Share2 className="w-3.5 h-3.5 mr-1" />Share
              </Button>
              <Button size="sm" style={{ backgroundColor: '#5B7DB1' }} onClick={() => setTab('code')}>
                Manage →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-gray-400 text-center">
        Institution ID: {institution.id} · Created {new Date(institution.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
    </div>
  );
}
