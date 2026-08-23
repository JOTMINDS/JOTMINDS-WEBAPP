import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader, AlertCircle, CheckCircle2, GraduationCap, Users, School, Briefcase, Mail, Lock, User, KeyRound } from 'lucide-react';
import { PhoneInput } from './PhoneInput';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { createClient } from '../utils/supabase/client';
import { setAuthToken, signup, signin, validateStudentCode, signInWithStudentCode } from '../utils/api';
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
import { validateInstitutionCode, addMember, generateOTP, verifyOTP, validateInviteToken } from '../utils/institution';

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

  const [inviteToken, setInviteToken] = useState('');
  const [inviteEmailLocked, setInviteEmailLocked] = useState(false);
  const [teacherId, setTeacherId] = useState('');
  const [teacherName, setTeacherName] = useState('');

  // Student Code Authentication States
  const [signInMethod, setSignInMethod] = useState<'email' | 'studentCode'>('email');
  const [studentCodeInput, setStudentCodeInput] = useState('');
  const [studentCodeValidated, setStudentCodeValidated] = useState(false);
  const [studentCodeStudentName, setStudentCodeStudentName] = useState('');
  const [studentCodeSchoolName, setStudentCodeSchoolName] = useState('');
  const [studentCodeLoading, setStudentCodeLoading] = useState(false);

  // Student Code Display After Signup
  const [showStudentCodeModal, setShowStudentCodeModal] = useState(false);
  const [generatedStudentCode, setGeneratedStudentCode] = useState<string | null>(null);
  const [pendingAutoLogin, setPendingAutoLogin] = useState<{ email: string; password: string } | null>(null);
  const [studentCodeCopied, setStudentCodeCopied] = useState(false);

  // Parse URL parameters for magic links and invite tokens
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const mode = searchParams.get('mode');
    const code = searchParams.get('code');
    const inviteTokenParam = searchParams.get('inviteToken');
    const urlRole = searchParams.get('role');

    if (mode === 'signup' || code) {
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

  const handleResendOTP = async () => {
    if (!email.trim()) return;
    try {
      const cleanEmail = email.trim().toLowerCase();
      await generateOTP(cleanEmail);
      toast.success('Verification code sent! Check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    console.log('[AuthForm] ===== SUBMIT STARTED =====');
    console.log('[AuthForm] isLogin:', isLogin);
    console.log('[AuthForm] Email:', cleanEmail);
    console.log('[AuthForm] Password length:', password.length);

    try {
      if (isLogin) {
        console.log('[AuthForm] Using Supabase Auth...');
        const supabase = createClient();
        
        if (loginMethod === 'otp') {
          if (!otpSent) {
            console.log('[AuthForm] Requesting OTP...');
            await generateOTP(cleanEmail);
            setOtpSent(true);
            setError('');
            toast.success(`6-digit verification code sent to ${cleanEmail}`);
            setLoading(false);
            return;
          } else {
            console.log('[AuthForm] Verifying OTP...');
            const verified = await verifyOTP(cleanEmail, otpToken);
            if (!verified) {
              const { error } = await supabase.auth.verifyOtp({ email: cleanEmail, token: otpToken, type: 'email' });
              if (error) {
                console.error('[AuthForm] OTP verification error:', error.message);
                setError(error.message || 'Invalid 6-digit verification code.');
                setLoading(false);
                return;
              }
            }
            console.log('[AuthForm] OTP verification successful');
            toast.success('Login verified!');
            onLogin();
            setLoading(false);
            return;
          }
        }
        
        // Regular sign in through Supabase
        console.log('[AuthForm] Attempting Supabase signInWithPassword...');
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        console.log('[AuthForm] Supabase response - data:', !!data, 'error:', error?.message || 'none');

        if (error) {
          console.error('[AuthForm] Supabase login error:', error.message);
          
          // Provide user-friendly error messages
          if (error.message.includes('Invalid login credentials')) {
            setError('Incorrect email or password. Please check your credentials and try again, or create a new account if you don\'t have one.');
          } else if (error.message.includes('Email not confirmed')) {
            setError('Please confirm your email address before logging in. Enter the 6-digit verification code sent to your inbox.');
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
        
        // STEP 4 -> 5: Send 6-digit OTP to email before finalizing signup
        if (registrationStep === 4) {
          console.log('[AuthForm] Step 4 complete. Sending 6-digit OTP verification code to:', cleanEmail);
          try {
            await generateOTP(cleanEmail);
            setRegistrationStep(5);
            setError('');
          } catch (otpErr: any) {
            console.error('[AuthForm] Failed to send OTP code:', otpErr);
            setError(otpErr.message || 'Failed to send 6-digit verification code to your email. Please try again.');
          }
          setLoading(false);
          return;
        }

        // STEP 5: Verify 6-digit OTP and finalize signup
        if (registrationStep === 5) {
          if (!signupOTP || signupOTP.length < 6) {
            setError('Please enter the complete 6-digit verification code sent to your email.');
            setLoading(false);
            return;
          }
          
          console.log('[AuthForm] Step 5: Verifying 6-digit OTP for email:', cleanEmail);
          try {
            const verified = await verifyOTP(cleanEmail, signupOTP);
            if (!verified) {
              setError('Invalid or expired 6-digit verification code. Please check and try again.');
              setLoading(false);
              return;
            }
          } catch (verifyErr: any) {
            console.error('[AuthForm] OTP verification failed:', verifyErr);
            setError(verifyErr.message || 'Invalid or expired 6-digit verification code.');
            setLoading(false);
            return;
          }
        }
        
        const signupData = {
          email: cleanEmail,
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

          // If a student code was generated, show it before proceeding
          if (result.studentCode && role === 'student') {
            setGeneratedStudentCode(result.studentCode);
            setShowStudentCodeModal(true);
            // Don't auto-login yet — wait for user to acknowledge the code
            setLoading(false);
            
            // Store credentials for auto-login after modal is dismissed
            setPendingAutoLogin({ email: cleanEmail, password });
            return;
          }
        } catch (signupError: any) {
          console.error('[AuthForm] Signup error:', signupError);
          
          // Provide user-friendly error messages for signup errors
          if (signupError.message?.includes('phone number is already registered')) {
            setError(signupError.message);
          } else if (signupError.message?.includes('already registered')) {
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
          email: cleanEmail,
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
    setSignInMethod('email');
    setStudentCodeInput('');
    setStudentCodeValidated(false);
  };

  // Student Code Sign-In Handler
  const handleStudentCodeSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const code = studentCodeInput.trim().toUpperCase();
    if (!code) {
      setError('Please enter your student code.');
      return;
    }

    setStudentCodeLoading(true);
    try {
      if (!studentCodeValidated) {
        // Step 1: Validate the code
        const result = await validateStudentCode(code);
        if (!result.valid) {
          setError('Invalid student code. Please check and try again.');
          setStudentCodeLoading(false);
          return;
        }
        setStudentCodeValidated(true);
        setStudentCodeStudentName(result.studentName || '');
        setStudentCodeSchoolName(result.schoolName || '');
        setStudentCodeLoading(false);
        return;
      }

      // Step 2: Sign in with the validated code
      const { session, user, token } = await signInWithStudentCode(code);
      if (token) {
        setAuthToken(token);
      } else if (session?.access_token) {
        setAuthToken(session.access_token);
      }
      toast.success(`Welcome back, ${studentCodeStudentName || 'Student'}!`);
      onLogin();
    } catch (err: any) {
      console.error('[AuthForm] Student code sign-in error:', err);
      setError(err.message || 'Failed to sign in with student code.');
      setStudentCodeValidated(false);
    } finally {
      setStudentCodeLoading(false);
    }
  };

  const handleAcknowledgeStudentCode = async () => {
    setShowStudentCodeModal(false);
    if (pendingAutoLogin) {
      setLoading(true);
      console.log('[AuthForm] Attempting auto-login after code acknowledgment...');
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: pendingAutoLogin.email,
        password: pendingAutoLogin.password,
      });

      if (error) {
        console.error('[AuthForm] Auto-login after signup failed:', error.message);
        setError('Account created successfully, but auto-login failed. Please login manually.');
        setLoading(false);
        setPendingAutoLogin(null);
        return;
      }

      if (data.session?.access_token) {
        console.log('[AuthForm] Auto-login successful');
        setAuthToken(data.session.access_token);
        onLogin();
      }
      setPendingAutoLogin(null);
    }
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
              {isLogin 
                ? (signInMethod === 'studentCode' 
                  ? 'Sign in with your teacher or school code' 
                  : 'Welcome back to your cognitive journey')
                : 'Your self-discovery begins here'}
            </CardDescription>

            {/* Sign-In Method Toggle — Only show during login */}
            {isLogin && (
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSignInMethod('email');
                    setError('');
                    setStudentCodeInput('');
                    setStudentCodeValidated(false);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                    signInMethod === 'email'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSignInMethod('studentCode');
                    setError('');
                    setLoginMethod('password');
                    setOtpSent(false);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                    signInMethod === 'studentCode'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Student Code
                </button>
              </div>
            )}
            
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
                  {/* Student Code Sign-In */}
                  {signInMethod === 'studentCode' ? (
                    <div className="space-y-4">
                      {!studentCodeValidated ? (
                        <>
                          <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/40 rounded-xl p-4 text-center">
                            <KeyRound className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                            <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                              Do you have a code from your teacher or school?
                            </p>
                            <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-1">
                              Enter the code your teacher gave you to sign in
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="studentCode">
                              Student Code <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="studentCode"
                                type="text"
                                placeholder="JM-XXXX-XXXX"
                                value={studentCodeInput}
                                onChange={(e) => setStudentCodeInput(e.target.value.toUpperCase())}
                                className="pl-10 shadow-sm font-mono tracking-widest text-center text-lg"
                                maxLength={12}
                                autoComplete="off"
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-3">
                          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-4 text-center">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                              Code verified!
                            </p>
                            <p className="text-lg font-bold text-emerald-950 dark:text-emerald-50 mt-1">
                              Welcome, {studentCodeStudentName}
                            </p>
                            {studentCodeSchoolName && (
                              <p className="text-xs text-emerald-600/70 mt-1">{studentCodeSchoolName}</p>
                            )}
                          </div>
                          <p className="text-xs text-center text-muted-foreground">
                            Click "Sign In" below to access your dashboard
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Existing Email Sign-In */
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
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-xs text-muted-foreground">
                                Enter the code sent to {email}
                              </p>
                              <button
                                type="button"
                                className="text-xs text-[#7B61FF] hover:text-[#5B7DB1] underline transition-colors"
                                onClick={handleResendOTP}
                              >
                                Resend Code
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </>
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
                          Enter the Jots Code (Organisation Code) provided by your head teacher. This links your account to the school — the head teacher can then view your <strong>Teaching Insights (JTIA)</strong> and <strong>Thinking Style</strong> side by side and access your full combined professional profile. After signup, complete both assessments from your dashboard's <em>My Style</em> tab.
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
                      <Label htmlFor="studentJotsCode" className="font-bold text-indigo-900">Teacher Code or Class Code</Label>
                      <div className="flex gap-2">
                        <Input
                          id="studentJotsCode"
                          type="text"
                          placeholder="Enter code given by teacher (e.g. JOTM-XXXXXX)"
                          value={organizationCode}
                          onChange={e => { setOrganizationCode(e.target.value.toUpperCase()); setVerifiedOrgName(''); }}
                          disabled={!!verifiedOrgName}
                        />
                        <Button type="button" onClick={validateOrgCode} disabled={verifyingCode || !!verifiedOrgName || !organizationCode} className="whitespace-nowrap bg-indigo-600 hover:bg-indigo-500 text-white">
                          {verifyingCode ? <Loader className="h-4 w-4 animate-spin" /> : verifiedOrgName ? <CheckCircle2 className="h-4 w-4" /> : 'Verify Code'}
                        </Button>
                      </div>
                      {verifiedOrgName && (
                        <Alert><CheckCircle2 className="h-4 w-4" style={{ color: '#10B981' }} /><AlertDescription>Linked to: <strong>{verifiedOrgName}</strong></AlertDescription></Alert>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Enter the code provided by your teacher to link your student account to your class roster.
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
                      {loading ? <Loader className="h-4 w-4 animate-spin" /> : 'Send Verification Code →'}
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
                  {isLogin && signInMethod === 'studentCode' ? (
                    <Button
                      type="button"
                      className="w-full py-6"
                      disabled={studentCodeLoading || (!studentCodeValidated && studentCodeInput.trim().length < 5)}
                      onClick={handleStudentCodeSignIn}
                    >
                      {studentCodeLoading ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          {studentCodeValidated ? 'Signing in...' : 'Verifying...'}
                        </>
                      ) : (
                        studentCodeValidated ? 'Sign In' : 'Continue'
                      )}
                    </Button>
                  ) : (
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
                  )}
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

      {showStudentCodeModal && generatedStudentCode && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-indigo-600 p-6 text-center text-white">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-300" />
              <h3 className="text-2xl font-bold">Account Created!</h3>
              <p className="text-indigo-100 mt-1">Here is your unique student code.</p>
            </div>
            
            <div className="p-6">
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-6 text-center">
                <p className="text-sm text-indigo-800 mb-2 font-medium">Your Student Code</p>
                <div className="text-3xl font-black text-indigo-700 tracking-widest font-mono select-all">
                  {generatedStudentCode}
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  className={`w-full ${studentCodeCopied ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                  onClick={() => {
                    navigator.clipboard.writeText(generatedStudentCode);
                    setStudentCodeCopied(true);
                    toast.success('Code copied to clipboard');
                    setTimeout(() => setStudentCodeCopied(false), 2000);
                  }}
                >
                  {studentCodeCopied ? 'Copied!' : 'Copy to Clipboard'}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full text-gray-600"
                  onClick={handleAcknowledgeStudentCode}
                >
                  Continue to JotMinds
                </Button>
              </div>
              
              <p className="text-xs text-center text-gray-500 mt-4 px-2">
                Save this code. You will use it instead of an email to sign in on your school's devices.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}