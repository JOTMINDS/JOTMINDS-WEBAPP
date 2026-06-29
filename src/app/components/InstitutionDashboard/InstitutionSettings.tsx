import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Upload, Loader, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  Institution,
  InstitutionType,
  saveInstitution,
  GHANA_REGIONS,
  generateOTP,
  verifyOTP
} from '../../utils/institution';

interface InstitutionSettingsProps {
  institution: Institution;
  onInstitutionUpdate: (updated: Institution) => void;
}

const INSTITUTION_TYPES: InstitutionType[] = ['Primary', 'JHS', 'SHS', 'Tertiary', 'Vocational', 'Other'];

function compressImage(file: File, maxSize = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png', 0.8));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function InstitutionSettings({ institution, onInstitutionUpdate }: InstitutionSettingsProps) {
  const [logoLoading, setLogoLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const logoRef = useRef<HTMLInputElement>(null);

  // Settings form state
  const [editName, setEditName] = useState(institution.name ?? '');
  const [editType, setEditType] = useState<InstitutionType>(institution.type ?? 'SHS');
  const [editRegion, setEditRegion] = useState(institution.region ?? 'Greater Accra');
  const [editDistrict, setEditDistrict] = useState(institution.district ?? '');
  const [editAddress, setEditAddress] = useState(institution.address ?? '');
  const [editEmail, setEditEmail] = useState(institution.email ?? '');
  const [editPhone, setEditPhone] = useState(institution.phone ?? '');
  const [editWebsite, setEditWebsite] = useState(institution.website ?? '');
  const [editTagline, setEditTagline] = useState(institution.tagline ?? '');
  const [editAdminName, setEditAdminName] = useState(institution.adminName ?? '');
  const [editAdminEmail, setEditAdminEmail] = useState(institution.adminEmail ?? '');
  const [editAdminPhone, setEditAdminPhone] = useState(institution.adminPhone ?? '');

  // OTP Verification state for email change
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [pendingUpdateData, setPendingUpdateData] = useState<Institution | null>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoLoading(true);
    try {
      const compressed = await compressImage(file);
      const updated = { ...institution, logo: compressed };
      await saveInstitution(updated);
      onInstitutionUpdate(updated);
      toast.success('Logo uploaded successfully');
    } catch {
      setError('Failed to upload logo.');
    } finally {
      setLogoLoading(false);
    }
  };

  const handleRemoveLogo = async () => {
    const updated = { ...institution, logo: undefined };
    await saveInstitution(updated);
    onInstitutionUpdate(updated);
    toast.success('Logo removed');
  };

  const handleSaveSettings = async () => {
    if (!editName.trim()) return setError('Institution name is required.');
    if (!editEmail.trim() || !editEmail.includes('@')) return setError('Valid email is required.');
    if (!editAdminName.trim()) return setError('Administrator name is required.');

    const updated: Institution = {
      ...institution,
      name: editName.trim(),
      type: editType,
      region: editRegion,
      district: editDistrict.trim(),
      address: editAddress.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      website: editWebsite.trim() || undefined,
      tagline: editTagline.trim() || undefined,
      adminName: editAdminName.trim(),
      adminEmail: editAdminEmail.trim(),
      adminPhone: editAdminPhone.trim(),
      updatedAt: new Date().toISOString(),
    };

    // Email change verification using OTP
    if (editEmail.trim() !== institution.email) {
      setError('');
      setIsVerifyingEmail(true);
      setPendingUpdateData(updated);
      try {
        toast.info(`Sending verification code to ${editEmail.trim()}...`);
        await generateOTP(editEmail.trim());
        toast.success(`Verification code sent to ${editEmail.trim()}`);
      } catch (err) {
        toast.error('Failed to send verification code. Please try again.');
        setIsVerifyingEmail(false);
      }
      return;
    }

    await performSave(updated);
  };

  const performSave = async (data: Institution) => {
    try {
      await saveInstitution(data);
      onInstitutionUpdate(data);
      setError('');
      setSaveSuccess(true);
      toast.success('Settings saved successfully.');
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      setError('Failed to save settings.');
    }
  };

  const handleVerifyOtp = async () => {
    if (!emailOtp.trim()) {
      toast.error('Please enter the OTP verification code.');
      return;
    }
    setVerifyingOtp(true);
    try {
      const isCorrect = await verifyOTP(editEmail.trim(), emailOtp.trim());
      if (isCorrect && pendingUpdateData) {
        toast.success('Email verified successfully!');
        setIsVerifyingEmail(false);
        await performSave(pendingUpdateData);
        setPendingUpdateData(null);
        setEmailOtp('');
      } else {
        toast.error('Incorrect verification code. Please try again.');
      }
    } catch (err) {
      toast.error('Verification failed.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="space-y-5">
      {saveSuccess && (
        <Alert className="border-green-300 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">Settings saved successfully.</AlertDescription>
        </Alert>
      )}

      {/* Logo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">School Logo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-start gap-4">
          <div
            className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#5B7DB1] transition-all"
            onClick={() => logoRef.current?.click()}
          >
            {institution.logo ? (
              <img src={institution.logo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Upload className="w-6 h-6 text-gray-300" />
            )}
          </div>
          <div>
            <div className="flex gap-2 mt-1">
              <Button size="sm" variant="outline" onClick={() => logoRef.current?.click()} disabled={logoLoading}>
                {logoLoading ? <Loader className="w-3.5 h-3.5 animate-spin mr-1" /> : <Upload className="w-3.5 h-3.5 mr-1" />}
                {institution.logo ? 'Change' : 'Upload'} Logo
              </Button>
              {institution.logo && (
                <Button size="sm" variant="ghost" onClick={handleRemoveLogo} className="text-red-500">
                  Remove
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Square images, max 200×200px recommended</p>
          </div>
          <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
        </CardContent>
      </Card>

      {/* Institution details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Institution Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="s-name">Institution Name</Label>
            <Input id="s-name" value={editName} onChange={e => setEditName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Type</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {INSTITUTION_TYPES.map(t => (
                <label
                  key={t}
                  className={`flex items-center justify-center p-2 rounded-lg border cursor-pointer text-xs transition-all ${
                    editType === t ? 'border-[#5B7DB1] bg-blue-50 text-[#5B7DB1]' : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <input type="radio" value={t} checked={editType === t} onChange={() => setEditType(t)} className="sr-only" />
                  {t}
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Region</Label>
              <select
                value={editRegion}
                onChange={e => setEditRegion(e.target.value)}
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {GHANA_REGIONS.map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>District</Label>
              <Input value={editDistrict} onChange={e => setEditDistrict(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <Label>Address</Label>
            <textarea
              value={editAddress}
              onChange={e => setEditAddress(e.target.value)}
              rows={2}
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <Label>Tagline (optional)</Label>
            <Input
              value={editTagline}
              onChange={e => setEditTagline(e.target.value)}
              maxLength={100}
              placeholder="e.g. Excellence in Education"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Email</Label>
              <Input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <Label>Website</Label>
            <Input type="url" value={editWebsite} onChange={e => setEditWebsite(e.target.value)} placeholder="https://" className="mt-1" />
          </div>
        </CardContent>
      </Card>

      {/* Administrator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4" />Assigned Administrator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Administrator Name</Label>
            <Input value={editAdminName} onChange={e => setEditAdminName(e.target.value)} className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Admin Email</Label>
              <Input type="email" value={editAdminEmail} onChange={e => setEditAdminEmail(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Admin Phone</Label>
              <Input type="tel" value={editAdminPhone} onChange={e => setEditAdminPhone(e.target.value)} className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button className="w-full" style={{ backgroundColor: '#5B7DB1' }} onClick={handleSaveSettings}>
        Save All Changes
      </Button>

      {/* OTP verification Modal for Email Change */}
      {isVerifyingEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verify Email Change</h3>
            <p className="text-sm text-gray-500 mb-4">
              We've sent a 6-digit OTP verification code to <strong>{editEmail}</strong> to confirm this change.
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email-otp">Verification Code</Label>
                <Input
                  id="email-otp"
                  placeholder="Enter 6-digit code"
                  value={emailOtp}
                  onChange={e => setEmailOtp(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <Button variant="ghost" onClick={() => setIsVerifyingEmail(false)} disabled={verifyingOtp}>
                  Cancel
                </Button>
                <Button style={{ backgroundColor: '#5B7DB1' }} onClick={handleVerifyOtp} disabled={verifyingOtp}>
                  {verifyingOtp ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Verify & Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
