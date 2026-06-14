import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User, OrganizationType } from '../types';
import { signup } from '../utils/api';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, ShieldCheck, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { createClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Logo } from './Logo';

interface SupervisorAuthFormProps {
  onLogin: (user: User) => void;
  onBackToMain: () => void;
}

export function SupervisorAuthForm({ onLogin, onBackToMain }: SupervisorAuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationType, setOrganizationType] = useState<OrganizationType>('Corporate');
  const [position, setPosition] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [otpToken, setOtpToken] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();

      if (isLogin) {
        let authData: any = null;
        let authSession: any = null;

        if (loginMethod === 'otp') {
          if (!otpSent) {
            console.log('[SupervisorAuth] Requesting OTP...');
            const { error } = await supabase.auth.signInWithOtp({ email });
            if (error) {
              console.error('[SupervisorAuth] OTP request error:', error.message);
              setError(error.message);
            } else {
              setOtpSent(true);
              setError('');
            }
            setLoading(false);
            return;
          } else {
            console.log('[SupervisorAuth] Verifying OTP...');
            const { data, error } = await supabase.auth.verifyOtp({ email, token: otpToken, type: 'email' });
            if (error) {
              console.error('[SupervisorAuth] OTP verification error:', error.message);
              setError(error.message);
              setLoading(false);
              return;
            }
            console.log('[SupervisorAuth] OTP verification successful');
            authData = data.user;
            authSession = data.session;
          }
        } else {
          // Sign in using Supabase client
          console.log('[SupervisorAuth] Signing in with email:', email);
          const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (signInError) {
            console.error('[SupervisorAuth] Sign in error:', signInError);
            setError(signInError.message);
            setLoading(false);
            return;
          }
          authData = data.user;
          authSession = data.session;
        }

        if (!authSession) {
          console.error('[SupervisorAuth] No session returned after sign in');
          setError('Failed to create session. Please try again.');
          setLoading(false);
          return;
        }

        console.log('[SupervisorAuth] Login successful');
        // Store auth token using the API utility
        import('../utils/api').then(({ setAuthToken }) => {
          setAuthToken(authSession.access_token);
        });
        
        onLogin(authData?.user_metadata as any);
        
        // Fetch user profile from backend
        console.log('[SupervisorAuth] Fetching user profile from backend...');
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-fc8eb847/session`,
          {
            headers: {
              'Authorization': `Bearer ${data.session.access_token}`
            }
          }
        );

        console.log('[SupervisorAuth] Profile fetch response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('[SupervisorAuth] Profile fetch error:', errorData);
          setError(errorData.error || 'Failed to fetch user profile');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        const responseData = await response.json();
        console.log('[SupervisorAuth] Full response data:', responseData);
        
        // The backend returns { success: true, user: {...} }
        const userData = responseData.user || responseData;
        console.log('[SupervisorAuth] User profile received:', { 
          id: userData.id, 
          email: userData.email, 
          role: userData.role,
          organizationName: userData.organizationName 
        });
        
        // Verify the user is a supervisor (check both capitalized and lowercase)
        if (userData.role !== 'Supervisor' && userData.role !== 'supervisor') {
          console.error('[SupervisorAuth] User is not a supervisor, role:', userData.role);
          setError('This account is not registered as a supervisor. Please use the main application.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }
        
        console.log('[SupervisorAuth] ✓ Supervisor verified, calling onLogin');
        
        // Call onLogin with the user data
        onLogin({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          organizationName: userData.organizationName,
          organizationType: userData.organizationType,
          position: userData.position,
          phone: userData.phone || '',
          school: '',
          createdAt: userData.createdAt
        });
      } else {
        // Sign up
        if (!organizationName || !position) {
          setError('Organization name and position are required for supervisors.');
          setLoading(false);
          return;
        }

        const result = await signup({
          email,
          password,
          name,
          role: 'Supervisor',
          organizationName,
          organizationType,
          position,
          phone
        });

        // Show organization code to supervisor
        if (result.organizationCode) {
          alert(`✅ Account created successfully!\n\nYour Organization Code: ${result.organizationCode}\n\nShare this code with your team members so they can join your organization.\n\nYou can also find this code in your dashboard after logging in.`);
        }

        // Auto-login after signup using Supabase client
        console.log('[SupervisorAuth] Auto-login after signup...');
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInError) {
          console.error('[SupervisorAuth] Auto-login error:', signInError);
          setError('Account created but auto-login failed. Please log in manually.');
          setLoading(false);
          return;
        }

        // Fetch user profile
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-fc8eb847/session`,
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
        // The backend returns { success: true, user: {...} }
        const userData = responseData.user || responseData;
        
        onLogin({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          organizationName: userData.organizationName,
          organizationType: userData.organizationType,
          position: userData.position,
          phone: userData.phone || '',
          school: '',
          createdAt: userData.createdAt
        });
      }
    } catch (err: any) {
      console.error('[SupervisorAuth] Error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-100">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={onBackToMain}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Main App
        </Button>
        
        <Card className="w-full border-2 shadow-large">
          <CardHeader className="space-y-3 text-center pb-6">
            <div className="mx-auto flex flex-col items-center gap-2">
              <Logo size="lg" />
              <h2 className="text-xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Supervisor Portal
              </h2>
              <p className="text-sm text-muted-foreground">Organizational Assessment Management</p>
            </div>
            <CardDescription className="text-center text-base">
              {isLogin 
                ? 'Access your organizational dashboard' 
                : 'Register your organization for cognitive assessment management'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="supervisor@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {isLogin && (
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
              )}

              {loginMethod === 'password' || !isLogin ? (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
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
                otpSent && (
                  <div className="space-y-2">
                    <Label htmlFor="otpToken">6-Digit Code <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Input
                        id="otpToken"
                        type="text"
                        placeholder="123456"
                        value={otpToken}
                        onChange={(e) => setOtpToken(e.target.value)}
                        required
                        className="font-mono tracking-widest"
                        maxLength={6}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter the code sent to {email}
                    </p>
                  </div>
                )
              )}

              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+233 XX XXX XXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organizationName">Organization Name</Label>
                    <Input
                      id="organizationName"
                      type="text"
                      placeholder="Your organization"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organizationType">Organization Type</Label>
                    <Select value={organizationType} onValueChange={(val) => setOrganizationType(val as OrganizationType)}>
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
                    <Label htmlFor="position">Position/Role</Label>
                    <Input
                      id="position"
                      type="text"
                      placeholder="e.g., HR Manager, Team Lead"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      required
                    />
                  </div>

                  <Alert className="border-purple-200 bg-purple-50">
                    <AlertCircle className="h-4 w-4 text-purple-600" />
                    <AlertDescription className="text-purple-900 text-sm">
                      ✨ Upon registration, you'll receive a unique <strong>Organization Code</strong> to share with your team members. They can use this code to join your organization when signing up as a Professional.
                    </AlertDescription>
                  </Alert>
                </>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading || (isLogin && loginMethod === 'otp' && otpSent && otpToken.length !== 6)}>
                {loading ? 'Processing...' : (
                  isLogin ? (loginMethod === 'otp' && !otpSent ? 'Send Code' : 'Login to Portal') : 'Register Organization'
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setIsLogin(!isLogin)}
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