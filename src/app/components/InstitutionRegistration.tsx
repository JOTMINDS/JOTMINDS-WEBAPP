import React, { useState, useRef } from 'react';
import { User } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Building2, Mail, Phone,
  Globe, MapPin, Upload, Copy, Share2, Loader2, AlertCircle,
  QrCode, Users, Shield
} from 'lucide-react';
import {
  createInstitution, generateOTP, verifyOTP, validateInstitutionCode,
  GHANA_REGIONS, Institution, InstitutionType
} from '../utils/institution';
import { projectId } from '../utils/supabase/info';

interface InstitutionRegistrationProps {
  user: User;
  onComplete: (institution: Institution) => void;
  onBack: () => void;
}

type Step = 1 | 2 | 3 | 4 | 5;

const INSTITUTION_TYPES: { value: InstitutionType; label: string }[] = [
  { value: 'Primary', label: 'Primary School (Basic 1–6)' },
  { value: 'JHS', label: 'Junior High School (JHS)' },
  { value: 'SHS', label: 'Senior High School (SHS)' },
  { value: 'Tertiary', label: 'Tertiary / University' },
  { value: 'Vocational', label: 'Vocational / Technical' },
  { value: 'Other', label: 'Other Institution' },
];

const STEP_LABELS = ['Details', 'Contact', 'Verify', 'Profile', 'Done'];

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEP_LABELS.map((label, i) => {
        const step = (i + 1) as Step;
        const done = current > step;
        const active = current === step;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${done ? 'bg-green-500 text-white' : active ? 'bg-[#5B7DB1] text-white' : 'bg-gray-100 text-gray-400'}`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : step}
              </div>
              <span className={`text-[10px] ${active ? 'text-[#5B7DB1]' : done ? 'text-green-600' : 'text-gray-400'}`}>{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`h-0.5 w-8 mb-4 transition-all ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

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

export function InstitutionRegistration({ user, onComplete, onBack }: InstitutionRegistrationProps) {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const logoRef = useRef<HTMLInputElement>(null);

  // Step 1 — Institution Details
  const [name, setName] = useState('');
  const [type, setType] = useState<InstitutionType>('SHS');
  const [region, setRegion] = useState('Greater Accra');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [teacherSize, setTeacherSize] = useState('1-50');
  const [studentSize, setStudentSize] = useState('1-100');

  // Step 2 — Contact & Admin
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [website, setWebsite] = useState('');
  const [adminName, setAdminName] = useState(user.name || '');
  const [adminEmail, setAdminEmail] = useState(user.email || '');
  const [adminPhone, setAdminPhone] = useState(user.phone || '');

  // Step 3 — Verification
  const [emailOTP, setEmailOTP] = useState('');
  const [phoneOTP, setPhoneOTP] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [phoneSent, setPhoneSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [simulatedEmailOTP, setSimulatedEmailOTP] = useState('');
  const [simulatedPhoneOTP, setSimulatedPhoneOTP] = useState('');

  // Step 4 — Profile
  const [logo, setLogo] = useState('');
  const [tagline, setTagline] = useState('');

  // Step 5 — Result
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  const next = () => setStep(s => Math.min(5, s + 1) as Step);
  const prev = () => { setError(''); setStep(s => Math.max(1, s - 1) as Step); };

  // ── Step 1 validation ──
  const validateStep1 = () => {
    if (!name.trim()) return setError('Institution name is required');
    if (!district.trim()) return setError('District is required');
    if (!address.trim()) return setError('Address is required');
    setError(''); next();
  };

  // ── Step 2 validation ──
  const validateStep2 = () => {
    if (!email.trim() || !email.includes('@')) return setError('Valid institution email is required');
    if (!phone.trim()) return setError('Institution phone is required');
    if (!adminName.trim()) return setError('Administrator name is required');
    if (!adminEmail.trim() || !adminEmail.includes('@')) return setError('Valid administrator email is required');
    setError(''); next();
  };

  const [sendingEmail, setSendingEmail] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);

  // ── Step 3 — OTP ──
  const sendEmailOTP = async () => {
    if (sendingEmail) return;
    try {
      setSendingEmail(true);
      await generateOTP(email);
      setEmailSent(true);
      setError('');
    } catch (err) {
      console.error('OTP Send Error:', err);
      setEmailSent(true);
      setError('Failed to send OTP code.');
    } finally {
      setSendingEmail(false);
    }
  };

  const [sendingPhone, setSendingPhone] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);

  const sendPhoneOTP = async () => {
    if (sendingPhone) return;
    try {
      setSendingPhone(true);
      const otp = await generateOTP(phone);
      setSimulatedPhoneOTP(otp); // In production, send via SMS
      setPhoneSent(true);
      setError('');
    } catch (err) {
      setPhoneSent(true);
    } finally {
      setSendingPhone(false);
    }
  };

  const verifyEmailOTP = async () => {
    if (verifyingEmail) return;
    try {
      setVerifyingEmail(true);
      const ok = await verifyOTP(email, emailOTP);
      if (ok) {
        setEmailVerified(true);
        setError('');
      } else {
        setError('Incorrect email verification code. Please try again.');
      }
    } finally {
      setVerifyingEmail(false);
    }
  };

  const verifyPhoneOTP = async () => {
    if (verifyingPhone) return;
    try {
      setVerifyingPhone(true);
      const ok = await verifyOTP(phone, phoneOTP);
      if (ok) {
        setPhoneVerified(true);
        setError('');
      } else {
        setError('Incorrect phone verification code. Please try again.');
      }
    } finally {
      setVerifyingPhone(false);
    }
  };

  const proceedFromVerification = () => {
    if (!emailVerified) return setError('Please verify your email address first.');
    if (!phoneVerified) return setError('Please verify your phone number first.');
    setError(''); next();
  };

  // ── Step 4 — Logo ──
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('Please upload an image file.');
    setLoading(true);
    try {
      const compressed = await compressImage(file);
      setLogo(compressed);
      setError('');
    } catch {
      setError('Failed to process image. Please try another file.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 5 — Create institution ──
  const createAndFinish = async () => {
    setLoading(true);
    try {
      const inst = await createInstitution({
        name: name.trim(),
        type,
        region,
        district: district.trim(),
        address: address.trim(),
        email: email.trim(),
        phone: phone.trim(),
        website: website.trim() || undefined,
        logo: logo || undefined,
        tagline: tagline.trim() || undefined,
        teacherSize,
        studentSize,
        adminId: user.id,
        adminName: adminName.trim(),
        adminEmail: adminEmail.trim(),
        adminPhone: adminPhone.trim() || phone.trim(),
        codeExpiryDays: null,
        emailVerified: true,
        phoneVerified: true,
      });
      setInstitution(inst);
      next();
      onComplete(inst);
    } catch (e) {
      setError('Failed to create institution. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (!institution) return;
    navigator.clipboard.writeText(institution.code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const shareCode = () => {
    if (!institution) return;
    const text = `Join ${institution.name} on JotMinds!\n\nUse institution code: ${institution.code}\n\nSign up at JotMinds and enter this code to link your account.`;
    if (navigator.share) {
      navigator.share({ title: `${institution.name} — JotMinds Code`, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1" disabled={step === 5}>
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="flex-1">
            <h1 className="flex items-center gap-2 text-base">
              <Building2 className="w-5 h-5 text-[#5B7DB1]" /> Register Institution
            </h1>
            <p className="text-xs text-gray-500">Set up your school on JotMinds</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <StepIndicator current={step} />

        {/* ── STEP 1: Institution Details ── */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-[#5B7DB1]" /> Institution Details</CardTitle>
              <CardDescription>Basic information about your school or educational institution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="inst-name">Institution Name <span className="text-red-500">*</span></Label>
                <Input id="inst-name" placeholder="e.g. Accra Academy Senior High School" value={name} onChange={e => setName(e.target.value)} className="mt-1" />
              </div>

              <div>
                <Label>Institution Type <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {INSTITUTION_TYPES.map(t => (
                    <label key={t.value} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer text-sm transition-all ${type === t.value ? 'border-[#5B7DB1] bg-blue-50 text-[#5B7DB1]' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                      <input type="radio" name="inst-type" value={t.value} checked={type === t.value} onChange={() => setType(t.value)} className="sr-only" />
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="region">Region <span className="text-red-500">*</span></Label>
                  <select id="region" value={region} onChange={e => setRegion(e.target.value)} className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
                    {GHANA_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="district">District <span className="text-red-500">*</span></Label>
                  <Input id="district" placeholder="e.g. Accra Metropolitan" value={district} onChange={e => setDistrict(e.target.value)} className="mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="teacherSize">Teacher Size</Label>
                  <select id="teacherSize" value={teacherSize} onChange={e => setTeacherSize(e.target.value)} className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="1-10">1-10 teachers</option>
                    <option value="11-50">11-50 teachers</option>
                    <option value="51-100">51-100 teachers</option>
                    <option value="101-200">101-200 teachers</option>
                    <option value="200+">200+ teachers</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="studentSize">Student Size</Label>
                  <select id="studentSize" value={studentSize} onChange={e => setStudentSize(e.target.value)} className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="1-100">1-100 students</option>
                    <option value="101-500">101-500 students</option>
                    <option value="501-1000">501-1000 students</option>
                    <option value="1001-2000">1001-2000 students</option>
                    <option value="2000+">2000+ students</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Physical Address <span className="text-red-500">*</span></Label>
                <textarea id="address" placeholder="Street address, area/suburb" value={address} onChange={e => setAddress(e.target.value)} rows={2}
                  className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>

              {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

              <Button className="w-full" style={{ backgroundColor: '#5B7DB1' }} onClick={validateStep1}>
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── STEP 2: Contact & Admin ── */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Mail className="w-5 h-5 text-[#5B7DB1]" /> Contact & Administrator</CardTitle>
              <CardDescription>Institution contact details and the assigned administrator</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-gray-500 bg-blue-50 px-3 py-2 rounded-lg">Institution contact details — used for official correspondence and login verification.</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="inst-email">Institution Email <span className="text-red-500">*</span></Label>
                  <Input id="inst-email" type="email" placeholder="admin@yourschool.edu.gh" value={email} onChange={e => setEmail(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="inst-phone">Institution Phone <span className="text-red-500">*</span></Label>
                  <Input id="inst-phone" type="tel" placeholder="+233 XX XXX XXXX" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Website (Optional)</Label>
                <Input id="website" type="url" placeholder="https://www.yourschool.edu.gh" value={website} onChange={e => setWebsite(e.target.value)} className="mt-1" />
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-[#6B4C9A]" /> Institution Administrator</p>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="admin-name">Administrator Full Name <span className="text-red-500">*</span></Label>
                    <Input id="admin-name" placeholder="Full name of the head teacher / principal" value={adminName} onChange={e => setAdminName(e.target.value)} className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="admin-email">Admin Email <span className="text-red-500">*</span></Label>
                      <Input id="admin-email" type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="admin-phone">Admin Phone</Label>
                      <Input id="admin-phone" type="tel" value={adminPhone} onChange={e => setAdminPhone(e.target.value)} className="mt-1" />
                    </div>
                  </div>
                </div>
              </div>

              {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

              <div className="flex gap-3">
                <Button variant="outline" onClick={prev} className="flex-1">Back</Button>
                <Button className="flex-1" style={{ backgroundColor: '#5B7DB1' }} onClick={validateStep2}>Continue <ArrowRight className="w-4 h-4 ml-2" /></Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── STEP 3: Verification ── */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-[#5B7DB1]" /> Verify Contact Details</CardTitle>
              <CardDescription>Confirm your email and phone number to activate the institution account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Email verification */}
              <div className={`p-4 rounded-xl border-2 transition-all ${emailVerified ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-800">Email: {email}</span>
                  </div>
                  {emailVerified ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                    </Badge>
                  ) : (
                    <Button type="button" variant="outline" size="sm" onClick={sendEmailOTP} disabled={sendingEmail}>
                      {sendingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : emailSent ? 'Resend Code' : 'Send Code'}
                    </Button>
                  )}
                </div>
                {emailSent && !emailVerified && (
                  <div className="flex gap-2 pt-2">
                    <Input 
                      placeholder="Enter 6-digit code" 
                      value={emailOTP} 
                      onChange={(e) => setEmailOTP(e.target.value)}
                      maxLength={6}
                      disabled={verifyingEmail}
                    />
                    <Button type="button" onClick={verifyEmailOTP} disabled={verifyingEmail || !emailOTP}>
                      {verifyingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Phone verification */}
              <div className={`p-4 rounded-xl border-2 transition-all ${phoneVerified ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-800">Phone: {phone}</span>
                  </div>
                  {phoneVerified && <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Verified</Badge>}
                </div>

                {!phoneVerified && (<>
                  {!phoneSent ? (
                    <Button size="sm" variant="outline" onClick={sendPhoneOTP} className="w-full">Send SMS Code</Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                        <p className="font-semibold mb-1">📱 Demo Mode — SMS Code</p>
                        <p>In production this would be sent via SMS. Your code is: <strong className="font-mono text-lg">{simulatedPhoneOTP}</strong></p>
                      </div>
                      <div className="flex gap-2">
                        <Input placeholder="Enter 6-digit code" value={phoneOTP} onChange={e => setPhoneOTP(e.target.value)} maxLength={6} className="font-mono" />
                        <Button size="sm" onClick={verifyPhoneOTP} style={{ backgroundColor: '#5B7DB1' }}>Verify</Button>
                      </div>
                      <button onClick={sendPhoneOTP} className="text-xs text-[#5B7DB1] hover:underline">Resend code</button>
                    </div>
                  )}
                </>)}
              </div>

              {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

              <div className="flex gap-3">
                <Button variant="outline" onClick={prev} className="flex-1">Back</Button>
                <Button className="flex-1" style={{ backgroundColor: '#5B7DB1' }} onClick={proceedFromVerification}>Continue <ArrowRight className="w-4 h-4 ml-2" /></Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── STEP 4: Profile Setup ── */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5 text-[#5B7DB1]" /> Institution Profile</CardTitle>
              <CardDescription>Add your school logo and a brief tagline (both optional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">

              {/* Logo upload */}
              <div>
                <Label>School Logo</Label>
                <div className="mt-2 flex items-start gap-4">
                  <div
                    className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-[#5B7DB1] hover:bg-blue-50 transition-all overflow-hidden"
                    onClick={() => logoRef.current?.click()}
                  >
                    {logo
                      ? <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                      : <div className="text-center"><Upload className="w-6 h-6 text-gray-300 mx-auto mb-1" /><p className="text-[10px] text-gray-400">Upload logo</p></div>}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-2">Upload your school crest or logo. Square images work best.</p>
                    <p className="text-xs text-gray-400 mb-3">Supported: JPG, PNG, SVG · Max display: 200×200px</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => logoRef.current?.click()} disabled={loading}>
                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Upload className="w-3.5 h-3.5 mr-1" />}
                        {logo ? 'Change Logo' : 'Upload Logo'}
                      </Button>
                      {logo && <Button size="sm" variant="ghost" onClick={() => setLogo('')} className="text-red-500">Remove</Button>}
                    </div>
                  </div>
                </div>
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </div>

              <div>
                <Label htmlFor="tagline">Institution Tagline (Optional)</Label>
                <Input id="tagline" placeholder="e.g. Excellence in Education since 1952" value={tagline} onChange={e => setTagline(e.target.value)} maxLength={100} className="mt-1" />
                <p className="text-xs text-gray-400 mt-1">{tagline.length}/100</p>
              </div>

              {/* Preview */}
              {(logo || name) && (
                <div className="border rounded-xl p-4 bg-gray-50">
                  <p className="text-xs text-gray-500 mb-3">Preview</p>
                  <div className="flex items-center gap-3">
                    {logo
                      ? <img src={logo} alt="Logo" className="w-12 h-12 object-contain rounded-lg" />
                      : <div className="w-12 h-12 rounded-lg bg-[#5B7DB1] flex items-center justify-center text-white text-lg font-bold">{name.charAt(0)}</div>}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{name}</p>
                      {tagline && <p className="text-xs text-gray-500 italic">{tagline}</p>}
                      <p className="text-xs text-gray-400">{type} · {region}</p>
                    </div>
                  </div>
                </div>
              )}

              {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

              <div className="flex gap-3">
                <Button variant="outline" onClick={prev} className="flex-1">Back</Button>
                <Button className="flex-1" style={{ backgroundColor: '#5B7DB1' }} onClick={createAndFinish} disabled={loading}>
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : <>Complete Registration <ArrowRight className="w-4 h-4 ml-2" /></>}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── STEP 5: Complete ── */}
        {step === 5 && institution && (
          <div className="space-y-6">
            {/* Success header */}
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {institution.logo
                  ? <img src={institution.logo} alt="Logo" className="w-14 h-14 object-contain rounded-lg" />
                  : <CheckCircle2 className="w-10 h-10 text-green-600" />}
              </div>
              <h2 className="text-2xl text-gray-900 mb-1">{institution.name}</h2>
              <p className="text-gray-500">{institution.type} · {institution.region}</p>
              {institution.tagline && <p className="text-sm text-gray-400 italic mt-1">{institution.tagline}</p>}
            </div>

            {/* Institution code */}
            <div className="rounded-2xl p-6 text-white text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #5B7DB1, #6B4C9A)' }}>
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_20%,white,transparent)]" />
              <div className="relative">
                <p className="text-white/70 text-sm mb-2 flex items-center justify-center gap-1"><QrCode className="w-4 h-4" /> Your Institution Code</p>
                <div className="text-4xl tracking-[0.3em] font-mono mb-3">{institution.code}</div>
                <p className="text-white/70 text-xs mb-4">Share this code with your teachers and students so they can link their JotMinds accounts to {institution.name}.</p>
                <div className="flex gap-3 justify-center">
                  <Button size="sm" onClick={copyCode} className="bg-white/20 hover:bg-white/30 text-white border-white/30 border">
                    {codeCopied ? <><CheckCircle2 className="w-3.5 h-3.5 mr-1" />Copied!</> : <><Copy className="w-3.5 h-3.5 mr-1" />Copy Code</>}
                  </Button>
                  <Button size="sm" onClick={shareCode} className="bg-white/20 hover:bg-white/30 text-white border-white/30 border">
                    <Share2 className="w-3.5 h-3.5 mr-1" />Share
                  </Button>
                </div>
              </div>
            </div>

            {/* What happens next */}
            <Card>
              <CardHeader><CardTitle className="text-sm">What happens next?</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: '👨‍🏫', title: 'Teachers join', desc: 'Share the institution code with your teaching staff. During signup they enter it as their School Jots Code.' },
                  { icon: '👩‍🎓', title: 'Students join', desc: 'Students enter the same code during signup to be linked to your institution.' },
                  { icon: '📊', title: 'View profiles', desc: 'From your dashboard, view all teacher teaching and cognitive profiles in one place.' },
                  { icon: '🔧', title: 'Manage institution', desc: 'Update details, regenerate codes, activate/deactivate accounts from your Institution Dashboard.' },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">{item.icon}</span>
                    <div><p className="text-sm font-medium text-gray-800">{item.title}</p><p className="text-xs text-gray-500">{item.desc}</p></div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button className="w-full" style={{ backgroundColor: '#5B7DB1' }} onClick={() => onComplete(institution)}>
              Go to Institution Dashboard →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
