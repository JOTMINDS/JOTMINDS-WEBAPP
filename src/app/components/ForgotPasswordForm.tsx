import { useState } from 'react';
import { ArrowLeft, Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { createClient } from '../utils/supabase/client';
import { Logo } from './Logo';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
      
      // Get the current URL origin for the redirect
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (resetError) {
        console.error('[ForgotPassword] Error:', resetError);
        setError('Failed to send password reset email. Please try again or contact support.');
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('[ForgotPassword] Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
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
              {success ? 'Check your email' : 'Reset your password'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {success ? (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-sm">
                    <p className="font-semibold text-green-800 dark:text-green-400 mb-2">
                      Password Reset Email Sent!
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      We've sent a password reset link to <strong>{email}</strong>. 
                      Please check your inbox and click the link to reset your password.
                    </p>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>📧 <strong>Check your email</strong> (including spam folder)</p>
                  <p>🔗 <strong>Click the reset link</strong> in the email</p>
                  <p>🔐 <strong>Create a new password</strong> on the next page</p>
                </div>

                <Button
                  onClick={onBack}
                  className="w-full"
                >
                  Back to Login
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Didn't receive the email?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setSuccess(false);
                      setEmail('');
                    }}
                    className="text-[#7B61FF] hover:text-[#5B7DB1] underline"
                  >
                    Try again
                  </button>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    Enter the email address associated with your account. We'll send you a link to reset your password.
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
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending reset link...
                    </>
                  ) : (
                    'Send Reset Link'
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