import React, { useState, useEffect, useRef } from 'react';
import { X, User, Phone, Mail, Save, Loader, Building2, Upload, Link as LinkIcon, Power, PowerOff, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { PhoneInput } from './PhoneInput';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { updateUserProfile, updateInstitutionProfile, assignInstitutionAdmin, Organization } from '../utils/api';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getAuthToken } from '../utils/api';
import { generateOTP, verifyOTP } from '../utils/institution';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any; // User object containing current details
  onProfileUpdate: (updatedUser: any) => void;
}

export function ProfileSettingsModal({ isOpen, onClose, user, onProfileUpdate }: ProfileSettingsModalProps) {
  // Personal State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [secondaryEmail, setSecondaryEmail] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [parentName, setParentName] = useState('');
  
  // Institution State
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('School');
  const [orgSector, setOrgSector] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Verification State
  const isVerified = user?.isVerified === true;
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  
  const isOrg = user?.role === 'organization' || user?.role === 'supervisor' || user?.role === 'Supervisor';

  const fetchInstitutionProfile = async () => {
    if (!isOrg || !user.organizationCode) return;
    try {
      setOrgName(user.organizationName || '');
      setOrgType(user.organizationType || 'School');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setSecondaryEmail(user.secondaryEmail || '');
      setSecondaryPhone(user.secondaryPhone || '');
      setAvatarUrl(user.avatarUrl || '');
      setParentName(user.parentName || '');
      setOrgName(user.institutionName || user.organizationName || '');
      setOrgType(user.institutionType || user.organizationType || '');
      setOrgSector(user.industrySector || '');
      setLogoUrl(user.logoUrl || '');
      setError('');
      setSuccess('');
      if (isOrg) {
        fetchInstitutionProfile();
      }
    }
  }, [isOpen, user]);

  const roleTitleText = isOrg ? "Assign Supervisors" : "Assign Administrators";
  const rolePlaceholderText = isOrg ? "manager@yourcompany.com" : "teacher@yourschool.edu";
  const roleDescriptionText = isOrg 
    ? "This user will be elevated to an Organization Supervisor and granted full dashboard access."
    : "This user will be elevated to an Institution Administrator and granted full dashboard access.";

  if (!isOpen) return null;

  const handlePersonalSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const updates = { name, phone, secondaryEmail, secondaryPhone, avatarUrl, parentName };
      const updatedData = await updateUserProfile(updates);
      const updatedUser = { ...user, ...updatedData };
      onProfileUpdate(updatedUser);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVerification = async () => {
    setIsVerifying(true);
    setError('');
    setSuccess('');
    try {
      await generateOTP(email);
      setOtpSent(true);
      setSuccess('Verification code sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode) {
      setError('Please enter the verification code.');
      return;
    }
    setIsVerifying(true);
    setError('');
    setSuccess('');
    try {
      await verifyOTP(email, otpCode);
      const updatedUser = { ...user, isVerified: true };
      onProfileUpdate(updatedUser);
      setOtpSent(false);
      setOtpCode('');
      setSuccess('Email verified successfully!');
      // Update the user profile on the backend
      await updateUserProfile({ isVerified: true });
    } catch (err: any) {
      setError(err.message || 'Invalid verification code.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleInstitutionSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const orgUpdates: Partial<Organization> = {
        name: orgName,
        type: orgType,
        industrySector: orgSector,
        logoUrl: logoUrl,
        isActive: isActive
      };
      
      await updateInstitutionProfile(orgUpdates);
      setSuccess('Institution profile updated successfully!');
      setTimeout(() => setSuccess(''), 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to update institution profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail) return;
    setIsAssigning(true);
    setError('');
    setSuccess('');

    try {
      await assignInstitutionAdmin(adminEmail);
      setSuccess(`User ${adminEmail} assigned as administrator successfully!`);
      setAdminEmail('');
      setTimeout(() => setSuccess(''), 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to assign administrator.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 500) { 
      setError('Logo file size must be less than 500KB.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoUrl(reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 500) { 
      setError('Profile photo size must be less than 500KB.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-slate-800/50 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <User size={18} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200">{error}</div>}
          {success && <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm border border-green-200">{success}</div>}

          <Tabs defaultValue="personal" className="w-full">
            {isOrg && (
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="personal" className="flex items-center gap-2"><User size={16}/> Personal</TabsTrigger>
                <TabsTrigger value="institution" className="flex items-center gap-2"><Building2 size={16}/> Institution</TabsTrigger>
              </TabsList>
            )}

            <TabsContent value="personal">
              <form id="profile-form" onSubmit={handlePersonalSave} className="space-y-5">
                
                <div className="flex flex-col items-center gap-3 mb-6">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-800/50 relative group">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile Photo" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-slate-400" />
                    )}
                    <div 
                      className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      <Upload className="h-6 w-6 text-white mb-1" />
                      <span className="text-[10px] text-white font-medium">Upload</span>
                    </div>
                  </div>
                  <input type="file" accept="image/*" className="hidden" ref={avatarInputRef} onChange={handleAvatarUpload} />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Primary Contact</h3>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" value={email} disabled className="pl-10 bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed" />
                    </div>
                    
                    {!isVerified && (
                      <div className="mt-4 p-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
                        <div className="flex items-start gap-3">
                          <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-amber-900 dark:text-amber-300">Email Verification Required</h4>
                            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 mb-3">
                              Please verify your email address to secure your account. Unverified accounts may be deleted after 48 hours.
                            </p>
                            
                            {!otpSent ? (
                              <Button 
                                type="button" 
                                size="sm" 
                                variant="outline" 
                                className="bg-white hover:bg-slate-50 text-amber-700 border-amber-200"
                                onClick={handleSendVerification}
                                disabled={isVerifying}
                              >
                                {isVerifying ? <Loader className="h-4 w-4 animate-spin mr-2" /> : null}
                                Send Verification Code
                              </Button>
                            ) : (
                              <div className="flex flex-col gap-2 mt-2">
                                <Label htmlFor="otp" className="text-xs text-amber-800">Enter Code</Label>
                                <div className="flex gap-2">
                                  <Input 
                                    id="otp" 
                                    type="text" 
                                    value={otpCode} 
                                    onChange={(e) => setOtpCode(e.target.value)} 
                                    placeholder="6-digit code" 
                                    className="bg-white max-w-[150px]"
                                  />
                                  <Button 
                                    type="button" 
                                    size="sm" 
                                    onClick={handleVerifyOTP}
                                    disabled={isVerifying || !otpCode}
                                  >
                                    {isVerifying ? <Loader className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Verify
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <PhoneInput id="phone" value={phone} onChange={setPhone} label="Phone Number" />
                  
                  {user?.role === 'student' && (
                    <div className="space-y-2">
                      <Label htmlFor="parentName">Parent/Guardian Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="parentName" type="text" value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="Parent/Guardian Name" className="pl-10" />
                      </div>
                    </div>
                  )}
                </div>
                {isOrg && (
                  <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Secondary Contact</h3>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryEmail">Secondary Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="secondaryEmail" type="email" value={secondaryEmail} onChange={(e) => setSecondaryEmail(e.target.value)} placeholder="reports@yourdomain.com" className="pl-10" />
                      </div>
                    </div>
                    <PhoneInput id="secondaryPhone" value={secondaryPhone} onChange={setSecondaryPhone} label="Secondary Phone" />
                  </div>
                )}
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Personal Info</>}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {isOrg && (
              <TabsContent value="institution" className="space-y-8">
                <form id="institution-form" onSubmit={handleInstitutionSave} className="space-y-5">
                  <div className="flex items-start gap-6">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-800/50 relative group">
                        {logoUrl ? (
                          <img src={logoUrl} alt="Institution Logo" className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="h-8 w-8 text-slate-400" />
                        )}
                        <div 
                          className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-6 w-6 text-white mb-1" />
                          <span className="text-[10px] text-white font-medium">Upload File</span>
                        </div>
                      </div>
                      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleLogoUpload} />
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="orgName">Institution Name</Label>
                        <Input id="orgName" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="e.g. Springfield High" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="logoUrl">Or paste Logo URL</Label>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="logoUrl" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." className="pl-10" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">Institution Status</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {isActive ? "Account is active. Users can log in." : "Account paused. Users are blocked."}
                      </p>
                    </div>
                    <Switch checked={isActive} onCheckedChange={setIsActive} className={isActive ? 'bg-green-500' : 'bg-slate-300'} />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isLoading || isUploading}>
                      {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Institution Profile</>}
                    </Button>
                  </div>
                </form>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> {roleTitleText}
                  </h3>
                  <form onSubmit={handleAssignAdmin} className="flex items-end gap-3">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="adminEmail">User Email Address</Label>
                      <Input id="adminEmail" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder={rolePlaceholderText} required />
                    </div>
                    <Button type="submit" variant="secondary" disabled={isAssigning || !adminEmail}>
                      {isAssigning ? <Loader className="h-4 w-4 animate-spin" /> : 'Assign Role'}
                    </Button>
                  </form>
                  <p className="text-xs text-muted-foreground mt-2">
                    {roleDescriptionText}
                  </p>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
