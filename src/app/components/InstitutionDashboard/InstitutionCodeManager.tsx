import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import {
  QrCode, Copy, Share2, CheckCircle2, Clock, RefreshCw, Loader2, AlertCircle, ToggleRight, ToggleLeft, AlertTriangle
} from 'lucide-react';
import {
  Institution,
  regenerateCode,
  deactivateInstitution,
  activateInstitution,
  getInstitutionById
} from '../../utils/institution';

interface InstitutionCodeManagerProps {
  institution: Institution;
  expired: boolean;
  daysLeft: number | null;
  expiryDate: Date | null;
  totalMembersCount: number;
  copied: boolean;
  handleCopyCode: () => void;
  handleShare: () => void;
  onInstitutionUpdate: (updated: Institution) => void;
}

const EXPIRY_OPTIONS = [
  { label: 'Never expires', value: null },
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
  { label: '180 days', value: 180 },
];

export function InstitutionCodeManager({
  institution,
  expired,
  daysLeft,
  expiryDate,
  totalMembersCount,
  copied,
  handleCopyCode,
  handleShare,
  onInstitutionUpdate
}: InstitutionCodeManagerProps) {
  const [regenerating, setRegenerating] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [expiryDays, setExpiryDays] = useState<number | null>(institution.codeExpiryDays ?? null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleRegenerate = async () => {
    if (!confirmRegenerate) {
      setConfirmRegenerate(true);
      return;
    }
    setRegenerating(true);
    try {
      const updated = await regenerateCode(institution.id, expiryDays);
      if (updated) {
        onInstitutionUpdate(updated);
        setConfirmRegenerate(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleToggleActive = async () => {
    if (institution.isActive && !confirmDeactivate) {
      setConfirmDeactivate(true);
      return;
    }
    try {
      if (institution.isActive) {
        await deactivateInstitution(institution.id);
      } else {
        await activateInstitution(institution.id);
      }
      const updated = await getInstitutionById(institution.id);
      if (updated) {
        onInstitutionUpdate(updated);
      }
      setConfirmDeactivate(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveExpirySetting = async () => {
    // update codeExpiryDays on local and save
    const updatedInst = { ...institution, codeExpiryDays: expiryDays };
    // wait, we have a saveInstitution database utility call. Let's see if we should import and await saveInstitution
    const { saveInstitution } = await import('../../utils/institution');
    await saveInstitution(updatedInst);
    onInstitutionUpdate(updatedInst);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Code display */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{
          background: expired
            ? 'linear-gradient(135deg, #DC2626, #9ca3af)'
            : 'linear-gradient(135deg, #5B7DB1, #6B4C9A)',
        }}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_80%_20%,white,transparent)]" />
        <div className="relative">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
            <div>
              <p className="text-white/70 text-xs mb-1 flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5" />Institution Code
              </p>
              <div className="text-4xl font-mono tracking-[0.2em]">{institution.code}</div>
            </div>
            <div className="flex flex-col gap-1 items-end">
              {expired ? (
                <Badge className="bg-red-200 text-red-900">⚠ Expired</Badge>
              ) : daysLeft !== null ? (
                <Badge className="bg-amber-200 text-amber-900">⏱ {daysLeft}d left</Badge>
              ) : (
                <Badge className="bg-green-200 text-green-900">✓ Never expires</Badge>
              )}
              {!institution.isActive && <Badge className="bg-gray-200 text-gray-900">Inactive account</Badge>}
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
              {new Date(institution.codeGeneratedAt).toLocaleDateString('en-GB', {
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
            <span className="text-gray-500">Members joined via code</span>
            <span className="text-gray-700">{totalMembersCount - 1}</span>
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
                    ? 'border-[#5B7DB1] bg-blue-50 text-[#5B7DB1]'
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
          {expiryDays !== institution.codeExpiryDays && (
            <Button size="sm" className="mt-3" style={{ backgroundColor: '#5B7DB1' }} onClick={handleSaveExpirySetting}>
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
          <CardDescription>Create a new institution code. The old code will immediately stop working.</CardDescription>
        </CardHeader>
        <CardContent>
          {confirmRegenerate && (
            <Alert className="mb-3 border-amber-300 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Warning:</strong> The current code <code className="font-mono">{institution.code}</code> will become invalid immediately. All {totalMembersCount - 1} linked members will keep their accounts, but new members will need the new code.
              </AlertDescription>
            </Alert>
          )}
          <Button
            variant={confirmRegenerate ? 'destructive' : 'outline'}
            onClick={handleRegenerate}
            disabled={regenerating}
          >
            {regenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            {confirmRegenerate ? 'Confirm — Generate New Code' : 'Regenerate Institution Code'}
          </Button>
          {confirmRegenerate && (
            <Button variant="ghost" size="sm" className="ml-2" onClick={() => setConfirmRegenerate(false)}>
              Cancel
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Activate / Deactivate */}
      <Card className={`border-2 ${institution.isActive ? 'border-gray-200' : 'border-red-200 bg-red-50'}`}>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            {institution.isActive ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-red-500" />}
            Account Status: {institution.isActive ? 'Active' : 'Deactivated'}
          </CardTitle>
          <CardDescription>
            {institution.isActive
              ? 'Deactivating prevents new members from joining via the institution code. Existing member accounts are not affected.'
              : 'Reactivate to allow new teachers and students to join using the institution code.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {confirmDeactivate && institution.isActive && (
            <Alert variant="destructive" className="mb-3">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>Confirm deactivation? The institution code will stop working immediately for new joiners.</AlertDescription>
            </Alert>
          )}
          <Button
            variant={institution.isActive ? 'destructive' : 'default'}
            onClick={handleToggleActive}
            style={!institution.isActive ? { backgroundColor: '#1E8A6E' } : {}}
          >
            {institution.isActive
              ? confirmDeactivate ? 'Confirm Deactivate' : 'Deactivate Institution'
              : 'Reactivate Institution'}
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
              icon: '👨‍🏫',
              title: 'For Teachers',
              desc: 'During signup, teachers select the "Teacher" role and enter this code in the "School Jots Code" field to link their account to your institution.',
            },
            {
              icon: '👩‍🎓',
              title: 'For Students',
              desc: 'During signup, students enter this code in the "School Code" field when prompted. Their account will be linked to your institution.',
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
