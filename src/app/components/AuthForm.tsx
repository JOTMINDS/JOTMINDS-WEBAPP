import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader, AlertCircle, CheckCircle2, GraduationCap, Users, School, Briefcase, Mail, Lock, User } from 'lucide-react';
import { PhoneInput } from './PhoneInput';
import { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import { authenticateAdmin, createAdminUser } from '../utils/storage';
import { setAuthToken } from '../utils/api';
import { signup } from '../utils/api';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { PasswordStrengthIndicator, checkPasswordStrength } from './PasswordStrengthIndicator';
import { Checkbox } from './ui/checkbox';
import { OrganizationCodeHelp } from './OrganizationCodeHelp';
import { Logo } from './Logo';
import { validateInstitutionCode, addMember, generateOTP, verifyOTP } from '../utils/institution';

interface AuthFormProps {
  onLogin: () => void;
  onBack?: () => void;
  onForgotPassword?: () => void;
}

export function AuthForm({ onLogin, onBack, onForgotPassword }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [otpToken, setOtpToken] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1); // Step 1-4 for multi-step registration
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [school, setSchool] = useState('');
  const [role, setRole] = useState('student');
  const [educationLevel, setEducationLevel] = useState('JHS');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationType, setOrganizationType] = useState('Corporate');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [organizationCode, setOrganizationCode] = useState('');
  const [verifiedOrgName, setVerifiedOrgName] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  
  // OTP States
  const [signupOTP, setSignupOTP] = useState('');
  const [simulatedSignupOTP, setSimulatedSignupOTP] = useState('');

  const [inviteToken, setInviteToken] = useState('');
  const [inviteEmailLocked, setInviteEmailLocked] = useState(false);
  const [teacherId, setTeacherId] = useState('');
  const [teacherName, setTeacherName] = useState('');

  // Parse URL parameters for magic links and invite tokens
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const mode = searchParams.get('mode');
    const code = searchParams.get('code');
    const inviteTokenParam = searchParams.get('inviteToken');
    const urlRole = searchParams.get('role');

    if (mode === 'signup' || inviteTokenParam || code) {
      setIsLogin(false);
    }
    if (code) {
      setOrganizationCode(code);
      // Auto-validate if code is present
      setTimeout(async () => {
        if (code.toUpperCase().startsWith('CLASS-')) {
          try {
            const response = await fetch(`https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847/validate-org-code`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
              body: JSON.stringify({ code: code.toUpperCase() })
            });
            if (response.ok) {
              const data = await response.json();
              if (data.valid) {
                setVerifiedOrgName(data.teacherName ? `${data.teacherName}'s Class at ${data.organizationName}` : data.organizationName);
                setOrganizationName(data.organizationName);
                if (data.teacherId) {
                  setTeacherId(data.teacherId);
                }
                if (data.teacherName) {
                  setTeacherName(data.teacherName);
                }
              }
            }
          } catch (e) {
            console.error('Error auto-validating class code:', e);
          }
        } else {
          const result = await validateInstitutionCode(code);
          if (result.valid && result.institution) {
            setVerifiedOrgName(result.institution.name);
            setOrganizationName(result.institution.name);
          }
        }
      }, 500);
    }
    if (inviteTokenParam) {
      setInviteToken(inviteTokenParam);
      const processToken = async () => {
        const result = await validateInviteToken(inviteTokenParam);
        if (result.valid && result.institution) {
          setEmail(result.email);
          setInviteEmailLocked(true);
          setRole(result.role);
          setVerifiedOrgName(result.institution.name);
          setOrganizationName(result.institution.name);
        } else {
          setError(result.error || 'Invalid or expired invitation link.');
        }
      };
      processToken().catch(console.error);
    }
    if (urlRole && (urlRole === 'teacher' || urlRole === 'student' || urlRole === 'professional')) {
      setRole(urlRole);
    }
  }, []);

  // Calculate age from date of birth
  const calculateAge = (dob: string): number => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Determine if user is a minor (under 18)
  const isMinor = role === 'student' && dateOfBirth && calculateAge(dateOfBirth) < 18;

  const validateOrgCode = async () => {
    if (!organizationCode.trim()) {
      setError('Please enter a School Jots Code or organisation code');
      return;
    }

    setVerifyingCode(true);
    setError('');

    // Route CLASS- codes directly to the edge function since they are Teacher Class Codes
    if (organizationCode.toUpperCase().startsWith('CLASS-')) {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847/validate-org-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
          body: JSON.stringify({ code: organizationCode.toUpperCase() })
        });
        
        if (!response.ok) {
          setError('Code not found. Please check the code and try again.');
          setVerifiedOrgName('');
          return;
        }

        const data = await response.json();
        if (data.valid) {
          // If it's a class code, the backend returns teacherName and organizationName
          setVerifiedOrgName(data.teacherName ? `${data.teacherName}'s Class at ${data.organizationName}` : data.organizationName);
          setOrganizationName(data.organizationName);
          if (data.teacherId) {
            setTeacherId(data.teacherId);
          }
          if (data.teacherName) {
            setTeacherName(data.teacherName);
          }
        } else {
          setError(data.error || 'Invalid code. Please check with your teacher.');
          setVerifiedOrgName('');
        }
      } catch {
        setError('Could not verify code. Please check your connection and try again.');
        setVerifiedOrgName('');
      } finally {
        setVerifyingCode(false);
      }
      return;
    }

    // Standard Institution check (School Jots Code)
    const localResult = await validateInstitutionCode(organizationCode);
    if (localResult.valid && localResult.institution) {
      setVerifiedOrgName(localResult.institution.name);
      setOrganizationName(localResult.institution.name);
      setVerifyingCode(false);
      return;
    }
    if (!localResult.valid) {
      // It's possible it's an Organization code for professionals, so we check fallback
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847/validate-org-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ code: organizationCode.toUpperCase() })
      });

      if (!response.ok) {
        if (response.status === 403) setError('Connection error. Please check your network and try again.');
        else setError(`Code not found. Please check the code and try again.`);
        setVerifiedOrgName('');
        return;
      }

      const data = await response.json();
      if (data.valid) {
        setVerifiedOrgName(data.organizationName);
        setOrganizationName(data.organizationName);
      } else {
        const primaryError = localResult.errorMessage && localResult.error !== 'not_found' ? localResult.errorMessage : null;
        setError(primaryError || data.error || 'Invalid code. Please check with your institution administrator.');
        setVerifiedOrgName('');
      }
    } catch {
      setError('Could not verify code. Please check your connection and try again.');
      setVerifiedOrgName('');
    } finally {
      setVerifyingCode(false);
    }
    }
  };

  // Step validation functions
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
    if (role === 'student' || role === 'teacher') {
      if (!school) {
        setError('Please enter your school name');
        return false;
      }
    }
    if (role === 'professional') {
      if (!organizationName || !position || !department) {
        setError('Please fill in all organization fields (including department)');
        return false;
      }
    }
    return true;
  };

  // Handle step navigation
  const handleNextStep = () => {
    setError('');
    
    if (registrationStep === 1 && !validateStep1()) {
      return;
    }
    if (registrationStep === 2) {
      if (!validateStep2()) return;
      if (inviteToken) {
        setRegistrationStep(4);
        return;
      }
    }
    if (registrationStep === 3 && !validateStep3()) {
      return;
    }
    
    setRegistrationStep(registrationStep + 1);
  };

  const handlePreviousStep = () => {
    setError('');
    if (registrationStep === 4 && inviteToken) {
      setRegistrationStep(2);
    } else {
      setRegistrationStep(registrationStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('[AuthForm] ===== SUBMIT STARTED =====');
    console.log('[AuthForm] isLogin:', isLogin);
    console.log('[AuthForm] Email:', email);
    console.log('[AuthForm] Password length:', password.length);

    try {
      if (isLogin) {
        // Check for admin login first using the multi-admin system
        console.log('[AuthForm] Checking if admin login...');
        
        if (authenticateAdmin(email, password)) {
          console.log('[AuthForm] ✓ ADMIN LOGIN DETECTED');
          
          // Admin login - bypass Supabase using multi-admin system
          const adminUser = createAdminUser(email);
          
          // Create a mock session for admin
          const adminToken = 'admin-token-' + Date.now();
          console.log('[AuthForm] Generated admin token:', adminToken);
          
          // Store admin user and token in localStorage
          console.log('[AuthForm] Saving to localStorage...');
          localStorage.setItem('admin_user', JSON.stringify(adminUser));
          localStorage.setItem('admin_token', adminToken);
          
          // Verify it was saved
          const savedUser = localStorage.getItem('admin_user');
          const savedToken = localStorage.getItem('admin_token');
          console.log('[AuthForm] Verification - Saved user:', savedUser);
          console.log('[AuthForm] Verification - Saved token:', savedToken);
          
          if (!savedUser || !savedToken) {
            console.error('[AuthForm] ❌ CRITICAL: Failed to save admin credentials to localStorage!');
            setError('Failed to save admin session. Please try again.');
            setLoading(false);
            return;
          }
          
          console.log('[AuthForm] Calling setAuthToken...');
          setAuthToken(adminToken);
          
          console.log('[AuthForm] Waiting 100ms for token to propagate...');
          // Give the token time to propagate through the system
          await new Promise(resolve => setTimeout(resolve, 100));
          
          console.log('[AuthForm] Calling onLogin...');
          onLogin();
          
          setLoading(false);
          console.log('[AuthForm] ✓ ADMIN LOGIN COMPLETE');
          return;
        }

        console.log('[AuthForm] Not admin login, using Supabase...');
        const supabase = createClient();
        
        if (loginMethod === 'otp') {
          if (!otpSent) {
            console.log('[AuthForm] Requesting OTP...');
            const { error } = await supabase.auth.signInWithOtp({ email });
            if (error) {
              console.error('[AuthForm] OTP request error:', error.message);
              setError(error.message);
            } else {
              setOtpSent(true);
              setError('');
            }
            setLoading(false);
            return;
          } else {
            console.log('[AuthForm] Verifying OTP...');
            const { data, error } = await supabase.auth.verifyOtp({ email, token: otpToken, type: 'email' });
            if (error) {
              console.error('[AuthForm] OTP verification error:', error.message);
              setError(error.message);
              setLoading(false);
              return;
            }
            console.log('[AuthForm] OTP verification successful');
            if (data.session?.access_token) {
              setAuthToken(data.session.access_token);
              onLogin();
            }
            setLoading(false);
            return;
          }
        }
        
        // Regular sign in through Supabase
        console.log('[AuthForm] Attempting Supabase signInWithPassword...');
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        console.log('[AuthForm] Supabase response - data:', !!data, 'error:', error?.message || 'none');

        if (error) {
          console.error('[AuthForm] Supabase login error:', error.message);
          
          // Provide user-friendly error messages
          if (error.message.includes('Invalid login credentials')) {
            setError('Incorrect email or password. Please check your credentials and try again, or create a new account if you don\'t have one.');
          } else if (error.message.includes('Email not confirmed')) {
            setError('Please confirm your email address before logging in.');
          } else {
            setError(error.message);
          }
          
          setLoading(false);
          return;
        }

        console.log('[AuthForm] Supabase login successful');
        if (data.session?.access_token) {
          // MIGRATION FIX: Ensure role is lowercase
          // This fixes users who registered with capitalized roles
          const userMetadata = data.user?.user_metadata;
          if (userMetadata?.role) {
            const role = userMetadata.role;
            const normalizedRole = role === 'Professional/Organization' ? 'professional' : role.toLowerCase();
            
            // If role was capitalized or "Professional/Organization", fix it
            if (role !== normalizedRole) {
              console.log(`[AuthForm] Migrating role from "${role}" to "${normalizedRole}"`);
              try {
                await supabase.auth.updateUser({
                  data: { 
                    ...userMetadata,
                    role: normalizedRole
                  }
                });
                console.log('[AuthForm] ✓ Role migrated successfully');
              } catch (migrationError) {
                console.error('[AuthForm] Failed to migrate role:', migrationError);
              }
            }
          }
          
          setAuthToken(data.session.access_token);
          onLogin();
        }
      } else {
        // Sign up - keep roles lowercase for consistency
        console.log('[AuthForm] Attempting signup...');
        
        // Validate consent for registration
        if (!hasConsented) {
          setError('Please provide consent to proceed with registration.');
          setLoading(false);
          return;
        }
        
        // Validate password strength for new signups
        const passwordCheck = checkPasswordStrength(password);
        if (!passwordCheck.isValid) {
          setError('Please create a stronger password. Meet at least 4 out of 5 password requirements.');
          setLoading(false);
          return;
        }
        
        // STEP 4 -> 5: Send OTP before finalizing signup
        if (registrationStep === 4) {
          try {
            setLoading(true);
            await generateOTP(email);
            setRegistrationStep(5);
            setError('');
          } catch (err: any) {
            console.error('Signup OTP Send Error:', err);
            // Fallback for local testing
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            setSimulatedSignupOTP(otp);
            setRegistrationStep(5);
            setError('Could not connect to verification server. Using simulated OTP for dev mode.');
          } finally {
            setLoading(false);
          }
          return;
        }

        // STEP 5: Verify OTP and finalize signup
        if (registrationStep === 5) {
          const isValid = await verifyOTP(email, signupOTP);
          if (!isValid) {
            setError('Incorrect verification code. Please try again.');
            setLoading(false);
            return;
          }
        }
        
        const signupData = {
          email,
          password,
          name,
          role: role,
          organizationName: (role === 'professional' || role === 'teacher') ? organizationName : undefined,
          organizationType: role === 'professional' ? organizationType : undefined,
          position: role === 'professional' ? position : undefined,
          department: role === 'professional' ? department : undefined,
          organizationCode: organizationCode ? organizationCode.toUpperCase() : undefined,
          teacherId: role === 'student' && teacherId ? teacherId : undefined,
          teacherName: role === 'student' && teacherName ? teacherName : undefined,
          phone,
          school: role === 'student' || role === 'teacher' ? school : undefined,
          educationLevel: role === 'student' ? educationLevel : undefined,
          dateOfBirth: role === 'student' && dateOfBirth ? dateOfBirth : undefined,
          hasConsented: true,
          consentType: isMinor ? 'parental' : 'individual',
          consentDate: new Date().toISOString(),
          inviteToken: inviteToken || undefined
        };
        
        console.log('[AuthForm] Signup data:', { ...signupData, password: '[REDACTED]' });
        
        try {
          const result = await signup(signupData);
          console.log('[AuthForm] Signup successful:', result);
        } catch (signupError: any) {
          console.error('[AuthForm] Signup error:', signupError);
          
          // Provide user-friendly error messages for signup errors
          if (signupError.message?.includes('already registered')) {
            setError('This email is already registered. Please login instead or use a different email.');
          } else if (signupError.message?.includes('invalid email')) {
            setError('Please enter a valid email address.');
          } else if (signupError.message?.includes('Password')) {
            setError('Password must be at least 6 characters long.');
          } else {
            setError(signupError.message || 'Failed to create account. Please try again.');
          }
          setLoading(false);
          return;
        }

        // Auto sign in after signup
        console.log('[AuthForm] Signup complete, attempting auto-login...');
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('[AuthForm] Auto-login after signup failed:', error.message);
          setError('Account created successfully, but auto-login failed. Please login manually.');
          setLoading(false);
          return;
        }

        if (data.session?.access_token) {
          console.log('[AuthForm] Auto-login successful');
          setAuthToken(data.session.access_token);
          onLogin();
        }
      }
    } catch (err: any) {
      console.error('[AuthForm] Unexpected error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset to step 1 when switching between login and registration
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setRegistrationStep(1);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-cyan-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-md">
        {onBack && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4"
            aria-label="Return to home page"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        )}
        <Card className="w-full border-2 shadow-large">
          <CardHeader className="space-y-3 text-center pb-8">
            <div className="mx-auto flex flex-col items-center">
              <Logo size="lg" className="mb-2" />
              <p className="text-sm text-muted-foreground">Discover How You Think</p>
            </div>
            <CardDescription className="text-center text-base text-foreground/80 dark:text-foreground/90">
              {isLogin ? 'Welcome back to your cognitive journey' : 'Your self-discovery begins here'}
            </CardDescription>
            
            {/* Progress Indicator - Only show during registration */}
            {!isLogin && (
              <div className="pt-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className={`h-2 rounded-full transition-all ${
                        step === registrationStep
                          ? 'w-8 bg-gradient-to-r from-[#6B4C9A] via-[#7B61FF] to-[#5B7DB1]'
                          : step < registrationStep
                          ? 'w-2 bg-[#7B61FF]'
                          : 'w-2 bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Step {registrationStep} of 5
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
                        placeholder="you@example.com"
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
                      className="text-sm font-medium text-[#7B61FF] hover:text-[#5B7DB1] transition-colors"
                      onClick={() => {
                        setLoginMethod(loginMethod === 'password' ? 'otp' : 'password');
                        setOtpSent(false);
                        setError('');
                      }}
                    >
                      {loginMethod === 'password' ? 'Sign in with Email Code Instead' : 'Sign in with Password Instead'}
                    </button>
                  </div>

                  {loginMethod === 'password' ? (
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
                          <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                      <div className="text-right">
                        <button
                          type="button"
                          className="text-sm text-[#7B61FF] hover:text-[#5B7DB1] underline transition-colors"
                          onClick={onForgotPassword}
                        >
                          Forgot Password?
                        </button>
                      </div>
                    </div>
                  ) : (
                    otpSent && (
                      <div className="space-y-2">
                        <Label htmlFor="otpToken">
                          6-Digit Code <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="otpToken"
                            type="text"
                            placeholder="123456"
                            value={otpToken}
                            onChange={(e) => setOtpToken(e.target.value)}
                            required
                            className="pl-10 shadow-sm font-mono tracking-widest"
                            maxLength={6}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Enter the code sent to {email}
                        </p>
                      </div>
                    )
                  )}
                </>
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
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={inviteEmailLocked}
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
                        <span className="sr-only">
                          {showPassword ? "Hide password" : "Show password"}
                        </span>
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
                        <span className="sr-only">
                          {showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                        </span>
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
                    description={
                      <>Include country code (e.g., +233 for Ghana). {role === 'teacher' ? <strong>For teachers, your phone number is your school identifier — your head teacher can look you up by this number.</strong> : 'Used for account verification.'}</>
                    }
                  />
                </>
              )}

              {/* REGISTRATION FORM - STEP 3: Role Selection + Role-specific fields */}
              {!isLogin && registrationStep === 3 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="role">I am a...</Label>
                    <Select value={role} onValueChange={(val) => {
                      setRole(val);
                      setHasConsented(false);
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            <span>Student</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="parent">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>Parent / Guardian</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="teacher">
                          <div className="flex items-center gap-2">
                            <School className="h-4 w-4" />
                            <span>Teacher / Educator</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="professional">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            <span>Professional</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(role === 'student' || role === 'teacher') && (
                    <div className="space-y-2">
                      <Label htmlFor="school">School Name</Label>
                      <Input
                        id="school"
                        type="text"
                        placeholder="Name of your school"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {role === 'teacher' && (
                    <>
                      <div className="space-y-2 mt-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="teacherOrgCode">School Jots Code</Label>
                          <OrganizationCodeHelp />
                        </div>
                        <div className="flex gap-2">
                          <Input
                            id="teacherOrgCode"
                            type="text"
                            placeholder="JOTM-XXXXXX"
                            value={organizationCode}
                            onChange={(e) => {
                              setOrganizationCode(e.target.value.toUpperCase());
                              setVerifiedOrgName('');
                            }}
                            disabled={!!verifiedOrgName}
                          />
                          <Button
                            type="button"
                            onClick={validateOrgCode}
                            disabled={verifyingCode || !!verifiedOrgName || !organizationCode}
                            className="whitespace-nowrap"
                            aria-label="Verify Jots Code"
                          >
                            {verifyingCode ? (
                              <Loader className="h-4 w-4 animate-spin" />
                            ) : verifiedOrgName ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              'Verify'
                            )}
                          </Button>
                        </div>
                        {verifiedOrgName && (
                          <Alert>
                            <CheckCircle2 className="h-4 w-4" style={{ color: '#10B981' }} />
                            <AlertDescription>
                              Verified school: <strong>{verifiedOrgName}</strong>
                            </AlertDescription>
                          </Alert>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Enter the Jots Code (Organisation Code) provided by your head teacher. This links your account to the school — the head teacher can then view your <strong>Teaching Style</strong> and <strong>Thinking Style</strong> side by side and access your full combined professional profile. After signup, complete both assessments from your dashboard's <em>My Style</em> tab.
                        </p>
                      </div>
                    </>
                  )}

                  {role === 'student' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="level">Education Level</Label>
                        <Select value={educationLevel} onValueChange={(val) => setEducationLevel(val)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Elementary">Elementary (Primary School)</SelectItem>
                            <SelectItem value="JHS">JHS (Junior High School)</SelectItem>
                            <SelectItem value="SHS">SHS (Senior High School)</SelectItem>
                            <SelectItem value="Tertiary">Tertiary</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          placeholder="Your date of birth"
                          value={dateOfBirth}
                          onChange={(e) => {
                            setDateOfBirth(e.target.value);
                            setHasConsented(false);
                          }}
                        />
                      </div>
                    </>
                  )}

                  {role === 'student' && (
                    <div className="space-y-2">
                      <Label htmlFor="studentJotsCode">School Jots Code (Optional)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="studentJotsCode"
                          type="text"
                          placeholder="JOTM-XXXXXX"
                          value={organizationCode}
                          onChange={e => { setOrganizationCode(e.target.value.toUpperCase()); setVerifiedOrgName(''); }}
                          disabled={!!verifiedOrgName}
                        />
                        <Button type="button" onClick={validateOrgCode} disabled={verifyingCode || !!verifiedOrgName || !organizationCode} className="whitespace-nowrap">
                          {verifyingCode ? <Loader className="h-4 w-4 animate-spin" /> : verifiedOrgName ? <CheckCircle2 className="h-4 w-4" /> : 'Verify'}
                        </Button>
                      </div>
                      {verifiedOrgName && (
                        <Alert><CheckCircle2 className="h-4 w-4" style={{ color: '#10B981' }} /><AlertDescription>Linked to: <strong>{verifiedOrgName}</strong></AlertDescription></Alert>
                      )}
                      <p className="text-xs text-muted-foreground">
                        If your school provided a Jots Code, enter it here to link your account. You can leave this blank and add it later.
                      </p>
                    </div>
                  )}

                  {role === 'professional' && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="organizationCode">Organization Code (Optional)</Label>
                          <OrganizationCodeHelp />
                        </div>
                        <div className="flex gap-2">
                          <Input
                            id="organizationCode"
                            type="text"
                            placeholder="JOTM-XXXXXX"
                            value={organizationCode}
                            onChange={(e) => {
                              setOrganizationCode(e.target.value.toUpperCase());
                              setVerifiedOrgName('');
                            }}
                            disabled={!!verifiedOrgName}
                          />
                          <Button
                            type="button"
                            onClick={validateOrgCode}
                            disabled={verifyingCode || !!verifiedOrgName || !organizationCode}
                            className="whitespace-nowrap"
                            aria-label="Verify organization code"
                          >
                            {verifyingCode ? (
                              <Loader className="h-4 w-4 animate-spin" />
                            ) : verifiedOrgName ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              'Verify'
                            )}
                          </Button>
                        </div>
                        {verifiedOrgName && (
                          <Alert>
                            <CheckCircle2 className="h-4 w-4" style={{ color: '#10B981' }} />
                            <AlertDescription>
                              Verified: <strong>{verifiedOrgName}</strong>
                            </AlertDescription>
                          </Alert>
                        )}
                        <p className="text-xs text-muted-foreground">
                          If you have an organization code from your supervisor, enter it here. Otherwise, you can skip this field.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="organizationType">Organization Type</Label>
                        <Select value={organizationType} onValueChange={(val) => setOrganizationType(val)}>
                          <SelectTrigger>
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
                        <Label htmlFor="organizationName">Organization Name</Label>
                        <Input
                          id="organizationName"
                          type="text"
                          placeholder="Your organization"
                          value={organizationName}
                          onChange={(e) => setOrganizationName(e.target.value)}
                          disabled={!!verifiedOrgName}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="position">Position/Role</Label>
                        {organizationType === 'Educational Institution' ? (
                          <Select value={position} onValueChange={setPosition} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Principal">Principal</SelectItem>
                              <SelectItem value="Administrator">Administrator</SelectItem>
                              <SelectItem value="Head Teacher">Head Teacher</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id="position"
                            type="text"
                            placeholder="Your position"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            required
                          />
                        )}
                      </div>

                      {role === 'professional' && (
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Input
                            id="department"
                            type="text"
                            placeholder="e.g. Marketing, Engineering, HR"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            required
                          />
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {/* REGISTRATION FORM - STEP 4: Terms & Consent */}
              {!isLogin && registrationStep === 4 && (
                <div className="space-y-4">
                  {/* Purple Box: Summary */}
                  <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800">
                    <AlertCircle className="h-4 w-4 text-[#7B61FF]" />
                    <AlertDescription className="text-sm">
                      <p className="font-semibold text-[#5B7DB1] dark:text-[#7B61FF] mb-2">
                        {isMinor ? 'Parental Consent Required' : 'Terms and Consent'}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        {isMinor 
                          ? 'A parent or legal guardian must provide consent for users under 18. We collect assessment data to provide personalized educational insights.'
                          : 'We collect and use your assessment data to provide personalized insights and recommendations. Your data is stored securely and used only to improve your learning experience.'
                        }
                      </p>
                    </AlertDescription>
                  </Alert>

                  {/* Simple Checkbox */}
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="consent" 
                      checked={hasConsented}
                      onCheckedChange={(checked) => setHasConsented(checked as boolean)}
                      className="mt-1"
                    />
                    <label 
                      htmlFor="consent" 
                      className="text-sm cursor-pointer leading-relaxed dark:text-gray-300"
                    >
                      {isMinor 
                        ? 'I am a parent/guardian and I consent to the Terms and Privacy Policy.'
                        : 'I agree to the Terms and Privacy Policy.'
                      }
                    </label>
                  </div>

                  {/* Link to full terms */}
                  <div className="text-center">
                    <button
                      type="button"
                      className="text-sm text-[#7B61FF] hover:text-[#5B7DB1] underline transition-colors"
                      onClick={() => window.open('https://jotminds.com/terms', '_blank')}
                    >
                      View full Terms & Privacy Policy
                    </button>
                  </div>
                </div>
              )}

              {/* REGISTRATION FORM - STEP 5: OTP Verification */}
              {!isLogin && registrationStep === 5 && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3 text-slate-800 mb-2">
                      <Mail className="h-5 w-5 text-indigo-600" />
                      <h3 className="font-medium">Verify Your Email Address</h3>
                    </div>
                    <p className="text-sm text-slate-600">
                      We've sent a 6-digit verification code to <strong>{email}</strong>.
                      Please enter it below to create your account.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-otp">Verification Code</Label>
                    <div className="flex gap-2">
                      <Input
                        id="signup-otp"
                        type="text"
                        placeholder="123456"
                        maxLength={6}
                        value={signupOTP}
                        onChange={(e) => setSignupOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="font-mono tracking-widest text-center text-lg h-12 shadow-sm"
                        required
                      />
                    </div>
                    {simulatedSignupOTP && (
                      <p className="text-xs text-orange-500 mt-1">
                        Dev Mode Simulated OTP: {simulatedSignupOTP}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Navigation Buttons */}
              {!isLogin && registrationStep < 5 && (
                <div className="flex gap-2">
                  {registrationStep > 1 && (
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
                  {registrationStep < 4 && (
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1"
                      aria-label="Continue to next step"
                    >
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                  {registrationStep === 4 && (
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={loading || !hasConsented}
                    >
                      {loading ? <Loader className="h-4 w-4 animate-spin" /> : 'Continue'}
                    </Button>
                  )}
                </div>
              )}

              {/* Submit Buttons */}
              {(isLogin || registrationStep === 5) && (
                <>
                  {!isLogin && registrationStep === 5 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreviousStep}
                      className="w-full mb-2"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  )}
                  <Button type="submit" className="w-full py-6" disabled={loading || (!isLogin && signupOTP.length !== 6) || (isLogin && loginMethod === 'otp' && otpSent && otpToken.length !== 6)}>
                    {loading ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        {isLogin ? 'Processing...' : 'Creating account...'}
                      </>
                    ) : (
                      isLogin ? (loginMethod === 'otp' && !otpSent ? 'Send Code' : 'Login') : 'Complete Registration'
                    )}
                  </Button>
                </>
              )}

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={toggleAuthMode}
              >
                {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}