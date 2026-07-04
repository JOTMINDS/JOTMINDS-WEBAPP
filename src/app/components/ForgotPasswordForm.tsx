import { useState } from 'react';
import { ArrowLeft, Mail, Loader, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { createClient } from '../utils/supabase/client';
import { Logo } from './Logo';

interface ForgotPasswordFormProps {
  onBack: () => void;
  onVerified?: () => void;
}

export function ForgotPasswordForm({ onBack, onVerified }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !email.includes('@')) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      const supabase = createClient();
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);

      if (resetError) {
        console.error('[ForgotPassword] Error:', resetError);
        setError(resetError.message || 'Failed to send password reset code. Please try again or contact support.');
        setLoading(false);
        return;
      }

      setStep('otp');
    } catch (err: any) {
      console.error('[ForgotPassword] Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!otp || otp.length < 6) {
        setError('Please enter a valid 6-digit code');
        setLoading(false);
        return;
      }

      const supabase = createClient();
      
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'recovery'
      });

      if (verifyError) {
        console.error('[ForgotPassword] OTP Verify Error:', verifyError);
        setError(verifyError.message || 'Invalid or expired code. Please try again.');
        setLoading(false);
        return;
      }

      // Success! Move to reset password view
      if (onVerified) {
        onVerified();
      }
    } catch (err: any) {
      console.error('[ForgotPassword] Unexpected verify error:', err);
      setError('An unexpected error occurred verifying your code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-cyan-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
          aria-label="Return to login page"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Button>

        <Card className="w-full border-2 shadow-large">
          <CardHeader className="space-y-3 text-center pb-6">
            <div className="mx-auto flex flex-col items-center">
              <Logo size="lg" className="mb-2" />
              <p className="text-sm text-muted-foreground">Discover How You Think</p>
            </div>
            <CardDescription className="text-center text-base">
              {step === 'otp' ? 'Check your email' : 'Reset your password'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === 'otp' ? (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-sm">
                    <p className="font-semibold text-green-800 dark:text-green-400 mb-1">
                      Verification Code Sent!
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      We've sent a 6-digit code to <strong>{email}</strong>.
                    </p>
                  </AlertDescription>
                </Alert>

                <form onSubmit={handleVerifyOtp} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">
                      6-Digit Code <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="otp"
                        type="text"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        required
                        className="pl-10 shadow-sm text-lg tracking-widest font-mono"
                        maxLength={6}
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={loading || otp.length < 6}>
                    {loading ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Code'
                    )}
                  </Button>
                </form>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  Didn't receive the email?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setOtp('');
                      setError('');
                    }}
                    className="text-[#7B61FF] hover:text-[#5B7DB1] underline"
                  >
                    Try again
                  </button>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address <span className="text-red-500">*</span>
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
                  <p className="text-xs text-muted-foreground">
                    Enter the email address associated with your account. We'll send you a 6-digit code to reset your password.
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    'Send Reset Code'
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={onBack}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Remember your password?{' '}
                    <span className="text-[#7B61FF] hover:text-[#5B7DB1] underline">
                      Login
                    </span>
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}