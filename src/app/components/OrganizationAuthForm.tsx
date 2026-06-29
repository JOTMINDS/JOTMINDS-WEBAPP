import { ArrowLeft, ArrowRight, Eye, EyeOff, AlertCircle, Building2, Mail, Lock, User, Phone, Briefcase, Loader } from 'lucide-react';
import { PhoneInput } from './PhoneInput';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User as UserType, OrganizationType, IndustrySector } from '../types';
import { signup, setAuthToken } from '../utils/api';
import { Alert, AlertDescription } from './ui/alert';
import { createClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { PasswordStrengthIndicator, checkPasswordStrength } from './PasswordStrengthIndicator';
import { Checkbox } from './ui/checkbox';
import { Logo } from './Logo';
import { Badge } from './ui/badge';
import { CheckCircle2 } from 'lucide-react';
import { generateOTP, verifyOTP } from '../utils/institution';

interface OrganizationAuthFormProps {
  onLogin: (user: UserType) => void;
  onBackToMain: () => void;
}

export function OrganizationAuthForm({ onLogin, onBackToMain }: OrganizationAuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [registrationStep, setRegistrationStep] = useState(0); // Step 0-4 for multi-step registration
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [secondaryEmail, setSecondaryEmail] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [organizationType, setOrganizationType] = useState<OrganizationType>('Corporate');
  const [industrySector, setIndustrySector] = useState<IndustrySector>('Technology');
  const [position, setPosition] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  const [emailOTP, setEmailOTP] = useState('');
  const [phoneOTP, setPhoneOTP] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [phoneSent, setPhoneSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [simulatedEmailOTP, setSimulatedEmailOTP] = useState('');
  const [simulatedPhoneOTP, setSimulatedPhoneOTP] = useState('');

  // Login OTP States
  const [loginOTPMode, setLoginOTPMode] = useState(false);
  const [loginOTP, setLoginOTP] = useState('');
  const [loginOTPSent, setLoginOTPSent] = useState(false);
  const [simulatedLoginOTP, setSimulatedLoginOTP] = useState('');
  const [pendingSession, setPendingSession] = useState<any>(null);

  // Step validation functions
  const validateStep0 = (): boolean => {
    if (!organizationType) {
      setError('Please select an organization type');
      return false;
    }
    return true;
  };

  const validateStep1 = (): boolean => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    const passwordCheck = checkPasswordStrength(password);
    if (!passwordCheck.isValid) {
      setError('Please create a stronger password. Meet at least 4 out of 5 password requirements.');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!name || !phone) {
      setError('Please fill in all fields');
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    if (!emailVerified) {
      setError('Please verify your email address first.');
      return false;
    }
    return true;
  };

  const validateStep4 = (): boolean => {
    if (!organizationName || !position) {
      setError('Please fill in all organization fields');
      return false;
    }
    if (!hasConsented) {
      setError('Please provide consent to proceed with registration');
      return false;
    }
    return true;
  };

  const [sendingEmail, setSendingEmail] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);

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
      setError('Failed to send email verification code.');
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
      setSimulatedPhoneOTP(otp);
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

  // Handle step navigation
  const handleNextStep = async () => {
    setError('');
    
    if (registrationStep === 0 && !validateStep0()) return;
    if (registrationStep === 1 && !validateStep1()) return;
    if (registrationStep === 2 && !validateStep2()) return;
    if (registrationStep === 3 && !validateStep3()) return;
    
    // Bypass Step 4 for Educational Institutions
    if (registrationStep === 3 && organizationType === 'Educational Institution') {
      // Auto-set some required fields that would normally be collected in Step 4
      setHasConsented(true);
      await processRegistration();
      return;
    }

    setRegistrationStep(registrationStep + 1);
  };

  const handlePreviousStep = () => {
    setError('');
    setRegistrationStep(registrationStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // For login, submit immediately
    if (isLogin) {
      await processLogin();
      return;
    }

    // For registration on step 4, validate and submit
    if (registrationStep === 4) {
      if (!validateStep4()) {
        return;
      }
      await processRegistration();
    }
  };

  const processLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      
      if (loginOTPMode) {
        if (!loginOTPSent) {
          console.log('[OrganizationAuth] Requesting OTP...');
          const { error } = await supabase.auth.signInWithOtp({ email });
          if (error) {
            console.error('[OrganizationAuth] OTP request error:', error.message);
            setError(error.message);
          } else {
            setLoginOTPSent(true);
            setError('');
          }
          setLoading(false);
          return;
        } else {
          console.log('[OrganizationAuth] Verifying OTP...');
          const { data, error } = await supabase.auth.verifyOtp({ email, token: loginOTP, type: 'email' });
          if (error) {
            console.error('[OrganizationAuth] OTP verification error:', error.message);
            setError(error.message);
            setLoading(false);
            return;
          }
          console.log('[OrganizationAuth] OTP verification successful');
          await finalizeLogin(data.session);
          setLoading(false);
          return;
        }
      }

      console.log('[OrganizationAuth] Signing in with email:', email);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        console.error('[OrganizationAuth] Sign in error:', signInError);
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (!data.session) {
        console.error('[OrganizationAuth] No session returned after sign in');
        setError('Failed to create session. Please try again.');
        setLoading(false);
        return;
      }

      console.log('[OrganizationAuth] Login successful');
      await finalizeLogin(data.session);
    } catch (err: any) {
      console.error('[OrganizationAuth] Error:', err);
      setError(err.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const finalizeLogin = async (session: any) => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Store the access token for API requests
      console.log('[OrganizationAuth] Setting auth token for API requests');
      setAuthToken(session.access_token);
      
      // Fetch user profile from backend
      let userData;
      
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847/session`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error('[OrganizationAuth] Profile fetch error:', errorData);
          setError(errorData.error || 'Failed to fetch user profile');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        const responseData = await response.json();
        userData = responseData.user || responseData;
      } catch (fetchError: any) {
        console.error('[OrganizationAuth] Network error fetching profile:', fetchError);
        
        // Backend not available - use Supabase metadata as fallback
        userData = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || '',
          role: session.user.user_metadata?.role || '',
          organizationName: session.user.user_metadata?.organizationName || '',
          organizationType: session.user.user_metadata?.organizationType,
          position: session.user.user_metadata?.position,
          phone: session.user.user_metadata?.phone || ''
        };
      }
      
      // Verify the user is an organization/supervisor/school_admin
      const userRole = (userData.role || '').toLowerCase();
      const isOrgAccount = userRole === 'organization' || userRole === 'supervisor' || userRole === 'school_admin';
      
      if (!isOrgAccount) {
        setError(`This account is not registered as an organization or institution admin. Your role is: "${userData.role}". Please use the main application.`);
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }
      
      onLogin({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userRole === 'school_admin' ? 'school_admin' : 'organization',
        organizationName: userData.organizationName,
        organizationType: userData.organizationType,
        industrySector: userData.industrySector,
        position: userData.position,
        phone: userData.phone || '',
        school: '',
        createdAt: userData.createdAt
      });
    } catch (err: any) {
      console.error('[OrganizationAuth] Error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const processRegistration = async () => {
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();

      const result = await signup({
        email,
        password,
        name,
        role: organizationType === 'Educational Institution' ? 'school_admin' : 'organization',
        organizationName: organizationName || (organizationType === 'Educational Institution' ? 'Educational Institution' : ''),
        organizationType,
        industrySector: organizationType === 'Educational Institution' ? 'Educational Institutions' : industrySector,
        position: position || 'Administrator',
        phone,
        secondaryEmail,
        secondaryPhone,
        hasConsented: true,
        consentType: 'organization_admin',
        consentDate: new Date().toISOString()
      });

      // Send organization code via email
      if (result.organizationCode) {
        try {
          await fetch(`https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847/send-org-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, organizationName, organizationCode: result.organizationCode })
          });
        } catch (err) {
          console.error('[OrganizationAuth] Failed to send org code email:', err);
        }
      }

      // Auto-login after signup
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        console.error('[OrganizationAuth] Auto-login error:', signInError);
        setError('Account created but auto-login failed. Please log in manually.');
        setLoading(false);
        return;
      }

      // Fetch user profile
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847/session`,
        {
          headers: {
            'Authorization': `Bearer ${data.session.access_token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch user profile');
        setLoading(false);
        return;
      }

      const responseData = await response.json();
      const userData = responseData.user || responseData;
      
      onLogin({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: 'organization',
        organizationName: userData.organizationName,
        organizationType: userData.organizationType,
        position: userData.position,
        phone: userData.phone || '',
        school: '',
        createdAt: userData.createdAt
      });
    } catch (err: any) {
      console.error('[OrganizationAuth] Error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-md">
        {onBackToMain && (
          <Button
            variant="ghost"
            onClick={onBackToMain}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Main App
          </Button>
        )}
        
        <Card className="w-full border-2 shadow-large">
          <CardHeader className="space-y-3 text-center pb-8">
            <div className="mx-auto flex flex-col items-center gap-2">
              <Logo size="lg" />
              <h2 className="text-xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Organization Portal
              </h2>
              <p className="text-sm text-muted-foreground">Organizational Assessment Management</p>
            </div>
            <CardDescription className="text-center text-base text-foreground/80 dark:text-foreground/90">
              {isLogin 
                ? 'Welcome back to your organizational dashboard' 
                : 'Your organizational journey begins here'}
            </CardDescription>
            
            {/* Progress Indicator - Only show during registration */}
            {!isLogin && (
              <div className="pt-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {[0, 1, 2, 3, 4].map((step) => {
                    // Don't show step 4 for Educational Institutions
                    if (step === 4 && organizationType === 'Educational Institution') return null;
                    return (
                      <div
                        key={step}
                        className={`h-2 rounded-full transition-all ${
                          step === registrationStep
                            ? 'w-8 bg-gradient-to-r from-purple-600 to-indigo-600'
                            : step < registrationStep
                            ? 'w-2 bg-purple-600'
                            : 'w-2 bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Step {registrationStep + 1} of {organizationType === 'Educational Institution' ? 4 : 5}
                </p>
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* LOGIN FORM */}
              {isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@organization.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-2 mb-2">
                    <button
                      type="button"
                      className="text-sm font-medium text-[#18181b] hover:text-[#18181b]/80 transition-colors"
                      onClick={() => {
                        setLoginOTPMode(!loginOTPMode);
                        setLoginOTPSent(false);
                        setError('');
                      }}
                    >
                      {loginOTPMode ? 'Sign in with Password Instead' : 'Sign in with Email Code Instead'}
                    </button>
                  </div>

                  {!loginOTPMode ? (
                    <div className="space-y-2">
                      <Label htmlFor="password">
                        Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="pl-10 pr-10 shadow-sm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    loginOTPSent && (
                      <div className="space-y-4">
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-3 text-slate-800 mb-2">
                            <Mail className="h-5 w-5 text-indigo-600" />
                            <h3 className="font-medium">Verify Your Identity</h3>
                          </div>
                          <p className="text-sm text-slate-600">
                            We've sent a 6-digit verification code to <strong>{email}</strong>.
                            Please enter it below to complete your login.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="login-otp">Verification Code <span className="text-red-500">*</span></Label>
                          <div className="flex gap-2">
                            <Input
                              id="login-otp"
                              type="text"
                              placeholder="123456"
                              maxLength={6}
                              value={loginOTP}
                              onChange={(e) => setLoginOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              required
                              className="font-mono tracking-widest text-center text-lg h-12 shadow-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </>
              )}

              {/* REGISTRATION FORM - STEP 0: Organization Type */}
              {!isLogin && registrationStep === 0 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800/30">
                    <h3 className="font-medium text-indigo-900 dark:text-indigo-200 mb-2">What type of organization are you setting up?</h3>
                    <p className="text-sm text-indigo-800 dark:text-indigo-300">
                      This helps us customize your portal and features.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setOrganizationType('Educational Institution')}
                      className={`w-full flex items-center p-4 border rounded-xl transition-all ${
                        organizationType === 'Educational Institution' 
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600' 
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex-shrink-0 bg-white p-3 rounded-lg border border-slate-100 shadow-sm mr-4">
                        <Building2 className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="text-left flex-grow">
                        <h4 className="font-semibold text-slate-900">Educational Institution</h4>
                        <p className="text-sm text-slate-500">Schools, Universities, Training Centers</p>
                      </div>
                      {organizationType === 'Educational Institution' && (
                        <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrganizationType('Corporate')}
                      className={`w-full flex items-center p-4 border rounded-xl transition-all ${
                        organizationType !== 'Educational Institution' && organizationType !== ''
                          ? 'border-purple-600 bg-purple-50/50 shadow-sm ring-1 ring-purple-600' 
                          : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex-shrink-0 bg-white p-3 rounded-lg border border-slate-100 shadow-sm mr-4">
                        <Briefcase className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="text-left flex-grow">
                        <h4 className="font-semibold text-slate-900">Corporate / Other</h4>
                        <p className="text-sm text-slate-500">Companies, Teams, Startups, NGOs</p>
                      </div>
                      {organizationType !== 'Educational Institution' && organizationType !== '' && (
                        <CheckCircle2 className="w-5 h-5 text-purple-600" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* REGISTRATION FORM - STEP 1: Email + Password */}
              {!isLogin && registrationStep === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@organization.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 pr-10 shadow-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <PasswordStrengthIndicator password={password} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="pl-10 pr-10 shadow-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* REGISTRATION FORM - STEP 2: Full Name + Phone */}
              {!isLogin && registrationStep === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="pl-10 shadow-sm"
                      />
                    </div>
                  </div>

                  <PhoneInput
                    id="phone"
                    value={phone}
                    onChange={setPhone}
                    required={true}
                    description="Include country code (e.g., +1 for US, +233 for Ghana, +44 for UK). Used for verification and primary contact."
                  />
                </>
              )}

              {/* REGISTRATION FORM - STEP 3: Verification */}
              {!isLogin && registrationStep === 3 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/30">
                    <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Verify Contact Details</h3>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      We need to verify your email address to proceed with organization registration.
                    </p>
                  </div>

                  <div className="space-y-3 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <Label className="text-base">Email Verification</Label>
                        <p className="text-xs text-muted-foreground">{email}</p>
                      </div>
                      {emailVerified ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                        </Badge>
                      ) : (
                        <Button type="button" variant="outline" size="sm" onClick={sendEmailOTP} disabled={sendingEmail}>
                          {sendingEmail ? <Loader className="h-4 w-4 animate-spin" /> : emailSent ? 'Resend Code' : 'Send Code'}
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
                          {verifyingEmail ? <Loader className="h-4 w-4 animate-spin" /> : 'Verify'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* REGISTRATION FORM - STEP 4: Organization Details + Consent */}
              {!isLogin && registrationStep === 4 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="organizationType">Organization Type</Label>
                    <Select value={organizationType} onValueChange={(val) => setOrganizationType(val as OrganizationType)}>
                      <SelectTrigger className="shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Corporate">Corporate</SelectItem>
                        <SelectItem value="NGO">NGO</SelectItem>
                        <SelectItem value="Government">Government</SelectItem>
                        <SelectItem value="Startup">Startup</SelectItem>
                        <SelectItem value="Educational Institution">Educational Institution</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organizationName">
                      Organization Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="organizationName"
                        type="text"
                        placeholder="Your organization"
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        required
                        className="pl-10 shadow-sm"
                      />
                    </div>
                  </div>

                  {organizationType !== 'Educational Institution' && (
                    <div className="space-y-2">
                      <Label htmlFor="industrySector">Industry Sector</Label>
                      <Select value={industrySector} onValueChange={(val) => setIndustrySector(val as IndustrySector)}>
                        <SelectTrigger className="shadow-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Healthcare">Healthcare</SelectItem>
                          <SelectItem value="Educational Institutions">Educational Institutions</SelectItem>
                          <SelectItem value="Agriculture">Agriculture</SelectItem>
                          <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="Financial Services">Financial Services</SelectItem>
                          <SelectItem value="Technology">Technology</SelectItem>
                          <SelectItem value="Telecommunications">Telecommunications</SelectItem>
                          <SelectItem value="Retail & Distribution">Retail & Distribution</SelectItem>
                          <SelectItem value="Logistics & Transport">Logistics & Transport</SelectItem>
                          <SelectItem value="Hospitality & Tourism">Hospitality & Tourism</SelectItem>
                          <SelectItem value="Energy & Utilities">Energy & Utilities</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="position">
                      Position/Role <span className="text-red-500">*</span>
                    </Label>
                    {organizationType === 'Educational Institution' ? (
                      <Select value={position} onValueChange={setPosition} required>
                        <SelectTrigger className="pl-10 shadow-sm relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Principal">Principal</SelectItem>
                          <SelectItem value="Administrator">Administrator</SelectItem>
                          <SelectItem value="Head Teacher">Head Teacher</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="position"
                          type="text"
                          placeholder="e.g., HR Manager, Team Lead"
                          value={position}
                          onChange={(e) => setPosition(e.target.value)}
                          required
                          className="pl-10 shadow-sm"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 pt-2 pb-2 border-t mt-4 border-slate-200 dark:border-slate-800">
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Secondary Contacts (Optional)</h4>
                    <p className="text-xs text-muted-foreground -mt-2 mb-2">Provide a secondary contact for summary reports and insights (great for founders with no time).</p>
                    
                    <div className="space-y-2">
                      <Label htmlFor="secondaryEmail">Secondary Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="secondaryEmail"
                          type="email"
                          placeholder="reports@yourdomain.com"
                          value={secondaryEmail}
                          onChange={(e) => setSecondaryEmail(e.target.value)}
                          className="pl-10 shadow-sm"
                        />
                      </div>
                    </div>

                    <PhoneInput
                      id="secondaryPhone"
                      value={secondaryPhone}
                      onChange={setSecondaryPhone}
                      label="Secondary Phone"
                    />
                  </div>

                  <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800">
                    <AlertCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <AlertDescription className="text-purple-900 dark:text-purple-200 text-sm">
                      ✨ Upon registration, you'll receive a unique <strong>Organization Code</strong> to share with your team members.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3 pt-2">
                    <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800">
                      <AlertCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <AlertDescription className="text-sm">
                        <div className="space-y-2">
                          <p className="font-semibold text-purple-900 dark:text-purple-200">Organizational Terms and Consent</p>
                          <p className="text-gray-700 dark:text-gray-300">
                            By registering your organization, you agree to the collection and use of assessment data from your team members 
                            to provide organizational insights and team analytics.
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>

                    <div className="flex items-start gap-3 p-3 border-2 border-purple-200 rounded-lg bg-white dark:bg-gray-900 dark:border-purple-800">
                      <Checkbox 
                        id="orgConsent" 
                        checked={hasConsented}
                        onCheckedChange={(checked) => setHasConsented(checked as boolean)}
                        className="mt-1"
                      />
                      <label 
                        htmlFor="orgConsent" 
                        className="text-sm cursor-pointer leading-relaxed dark:text-gray-300"
                      >
                        I agree to register this organization for JotMinds cognitive assessments and consent to the collection 
                        and use of organizational assessment data for team insights and analytics.
                      </label>
                    </div>
                  </div>
                </>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Navigation Buttons - For registration steps 1-3 */}
              {!isLogin && registrationStep < 4 && (
                <div className="flex gap-2">
                  {registrationStep > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreviousStep}
                      className="flex-1"
                      aria-label="Go back to previous step"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1"
                    aria-label="Continue to next step"
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Submit Button - For login and final registration step */}
              {(isLogin || (!isLogin && registrationStep === 4)) && (
                <Button type="submit" className="w-full" disabled={loading || (isLogin && loginOTPMode && loginOTPSent && loginOTP.length !== 6)}>
                  {loading ? 'Processing...' : (
                    isLogin ? (loginOTPMode && !loginOTPSent ? 'Send Code' : 'Login to Portal') : 'Register Organization'
                  )}
                </Button>
              )}

              {!loginOTPMode && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setRegistrationStep(0);
                    setError('');
                  }}
                >
                  {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}