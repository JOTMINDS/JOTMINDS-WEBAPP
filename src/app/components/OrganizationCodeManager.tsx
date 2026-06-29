import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import {
  QrCode, Copy, Share2, CheckCircle2, Clock, RefreshCw, Loader, AlertCircle, ToggleRight, ToggleLeft, AlertTriangle
} from 'lucide-react';
import {
  regenerateOrganizationCode,
  updateOrganizationCodeStatus,
  updateOrganizationCodeExpiry
} from '../utils/api';
import { OrganizationCodeDetails } from '../types';

interface OrganizationCodeManagerProps {
  details: OrganizationCodeDetails;
  totalMembersCount: number;
  onUpdate: (updated: OrganizationCodeDetails) => void;
}

const EXPIRY_OPTIONS = [
  { label: 'Never expires', value: null },
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
  { label: '180 days', value: 180 },
];

export function OrganizationCodeManager({
  details,
  totalMembersCount,
  onUpdate
}: OrganizationCodeManagerProps) {
  const [regenerating, setRegenerating] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [expiryDays, setExpiryDays] = useState<number | null>(details.codeExpiryDays ?? null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(details.organizationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join our Organization on JOTMINDS',
        text: `Use this code to join our organization: ${details.organizationCode}`,
      }).catch(console.error);
    } else {
      handleCopyCode();
    }
  };

  const handleRegenerate = async () => {
    if (!confirmRegenerate) {
      setConfirmRegenerate(true);
      return;
    }
    setRegenerating(true);
    try {
      const response = await regenerateOrganizationCode();
      if (response && response.success) {
        onUpdate({
          organizationCode: response.organizationCode,
          codeGeneratedAt: response.codeGeneratedAt,
          codeExpiryDays: response.codeExpiryDays,
          isActive: response.isActive
        });
        setConfirmRegenerate(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleToggleActive = async () => {
    if (details.isActive && !confirmDeactivate) {
      setConfirmDeactivate(true);
      return;
    }
    try {
      const newStatus = !details.isActive;
      const response = await updateOrganizationCodeStatus(newStatus);
      if (response && response.success) {
        onUpdate({
          ...details,
          isActive: newStatus
        });
      }
      setConfirmDeactivate(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveExpirySetting = async () => {
    try {
      const response = await updateOrganizationCodeExpiry(expiryDays);
      if (response && response.success) {
        onUpdate({
          ...details,
          codeExpiryDays: expiryDays
        });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate Expiry Data
  const generatedAt = new Date(details.codeGeneratedAt);
  const expiryDate = details.codeExpiryDays
    ? new Date(generatedAt.getTime() + details.codeExpiryDays * 24 * 60 * 60 * 1000)
    : null;

  const now = new Date();
  const expired = expiryDate ? now > expiryDate : false;
  const daysLeft = expiryDate
    ? Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24)))
    : null;

  return (
    <div className="space-y-5">
      {/* Code display */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{
          background: expired
            ? 'linear-gradient(135deg, #DC2626, #9ca3af)'
            : 'linear-gradient(135deg, #4F46E5, #818CF8)', // Indigo theme for supervisor/organization
        }}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_80%_20%,white,transparent)]" />
        <div className="relative">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
            <div>
              <p className="text-white/70 text-xs mb-1 flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5" />Organization Code
              </p>
              <div className="text-4xl font-mono tracking-[0.2em]">{details.organizationCode}</div>
            </div>
            <div className="flex flex-col gap-1 items-end">
              {expired ? (
                <Badge className="bg-red-200 text-red-900">⚠ Expired</Badge>
              ) : daysLeft !== null ? (
                <Badge className="bg-amber-200 text-amber-900">⏱ {daysLeft}d left</Badge>
              ) : (
                <Badge className="bg-green-200 text-green-900">✓ Never expires</Badge>
              )}
              {!details.isActive && <Badge className="bg-gray-200 text-gray-900">Inactive code</Badge>}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" onClick={handleCopyCode} className="bg-white/20 hover:bg-white/30 text-white border-white/30 border">
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
            <Button size="sm" onClick={handleShare} className="bg-white/20 hover:bg-white/30 text-white border-white/30 border">
              <Share2 className="w-3.5 h-3.5 mr-1" />Share via...
            </Button>
          </div>
        </div>
      </div>

      {/* Code info */}
      <Card>
        <CardContent className="pt-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Generated</span>
            <span className="text-gray-700">
              {generatedAt.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Expiry</span>
            <span className={expired ? 'text-red-600' : 'text-gray-700'}>
              {expiryDate ? expiryDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Never'}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Linked Professionals</span>
            <span className="text-gray-700">{totalMembersCount}</span>
          </div>
        </CardContent>
      </Card>

      {/* Expiry settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" />Code Expiry
          </CardTitle>
          <CardDescription>Set how long the current code remains valid</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {EXPIRY_OPTIONS.map(opt => (
              <label
                key={String(opt.value)}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer text-sm transition-all ${
                  expiryDays === opt.value
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="expiry"
                  checked={expiryDays === opt.value}
                  onChange={() => setExpiryDays(opt.value)}
                  className="sr-only"
                />
                {opt.label}
              </label>
            ))}
          </div>
          {expiryDays !== details.codeExpiryDays && (
            <Button size="sm" className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSaveExpirySetting}>
              Save Expiry Setting
            </Button>
          )}
          {saveSuccess && <p className="text-xs text-green-600 mt-2">Expiry setting saved successfully.</p>}
        </CardContent>
      </Card>

      {/* Regenerate */}
      <Card className={`border-2 ${confirmRegenerate ? 'border-amber-400 bg-amber-50' : 'border-gray-200'}`}>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />Regenerate Code
          </CardTitle>
          <CardDescription>Create a new organization code. The old code will immediately stop working.</CardDescription>
        </CardHeader>
        <CardContent>
          {confirmRegenerate && (
            <Alert className="mb-3 border-amber-300 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Warning:</strong> The current code <code className="font-mono">{details.organizationCode}</code> will become invalid immediately. All {totalMembersCount} linked professionals will keep their accounts, but new members will need the new code.
              </AlertDescription>
            </Alert>
          )}
          <Button
            variant={confirmRegenerate ? 'destructive' : 'outline'}
            onClick={handleRegenerate}
            disabled={regenerating}
          >
            {regenerating ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            {confirmRegenerate ? 'Confirm — Generate New Code' : 'Regenerate Organization Code'}
          </Button>
          {confirmRegenerate && (
            <Button variant="ghost" size="sm" className="ml-2" onClick={() => setConfirmRegenerate(false)}>
              Cancel
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Activate / Deactivate */}
      <Card className={`border-2 ${details.isActive ? 'border-gray-200' : 'border-red-200 bg-red-50'}`}>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            {details.isActive ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-red-500" />}
            Code Status: {details.isActive ? 'Active' : 'Deactivated'}
          </CardTitle>
          <CardDescription>
            {details.isActive
              ? 'Deactivating prevents new professionals from joining via the code. Existing accounts are not affected.'
              : 'Reactivate to allow new professionals to join using the code.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {confirmDeactivate && details.isActive && (
            <Alert variant="destructive" className="mb-3">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>Confirm deactivation? The code will stop working immediately for new joiners.</AlertDescription>
            </Alert>
          )}
          <Button
            variant={details.isActive ? 'destructive' : 'default'}
            onClick={handleToggleActive}
            style={!details.isActive ? { backgroundColor: '#1E8A6E' } : {}}
          >
            {details.isActive
              ? confirmDeactivate ? 'Confirm Deactivate' : 'Deactivate Code'
              : 'Reactivate Code'}
          </Button>
          {confirmDeactivate && (
            <Button variant="ghost" size="sm" className="ml-2" onClick={() => setConfirmDeactivate(false)}>
              Cancel
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Share card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Share2 className="w-4 h-4" />How to Share the Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              icon: '💼',
              title: 'For Professionals',
              desc: 'During signup, professionals select the "Professional" role and enter this code to join your organization.',
            },
            {
              icon: '📱',
              title: 'Share via WhatsApp / SMS',
              desc: 'Click the Share button above to send the code directly via your preferred messaging app.',
            },
          ].map(item => (
            <div key={item.title} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-xl shrink-0">{item.icon}</span>
              <div>
                <p className="text-sm font-medium text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
