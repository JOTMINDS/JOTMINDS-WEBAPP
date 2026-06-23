import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertCircle, CheckCircle, Shield } from 'lucide-react';

interface OAuthConsentPageProps {
  state: string;
  onApprove: () => void;
  onDeny: () => void;
}

interface ConsentDetails {
  clientId: string;
  scope: string[];
  redirectUri: string;
  userId: string;
}

export const OAuthConsentPage: React.FC<OAuthConsentPageProps> = ({ state, onApprove, onDeny }) => {
  const [consentDetails, setConsentDetails] = useState<ConsentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchConsentDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://femvnconxoefpctiptkj.supabase.co/functions/v1/server/make-server-fc8eb847/oauth/consent/${state}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch consent details');
        }

        const data = await response.json();
        setConsentDetails(data.consent);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (state) {
      fetchConsentDetails();
    }
  }, [state]);

  const handleApprove = async () => {
    try {
      setProcessing(true);
      const response = await fetch(
        'https://femvnconxoefpctiptkj.supabase.co/functions/v1/server/make-server-fc8eb847/oauth/consent/approve',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
          body: JSON.stringify({ state })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to approve consent');
      }

      const data = await response.json();

      // Redirect to the application
      if (data.redirectUri) {
        window.location.href = data.redirectUri;
      } else {
        onApprove();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve');
      setProcessing(false);
    }
  };

  const handleDeny = async () => {
    try {
      setProcessing(true);
      const response = await fetch(
        'https://femvnconxoefpctiptkj.supabase.co/functions/v1/server/make-server-fc8eb847/oauth/consent/deny',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
          body: JSON.stringify({ state })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to deny consent');
      }

      const data = await response.json();

      // Redirect to the application
      if (data.redirectUri) {
        window.location.href = data.redirectUri;
      } else {
        onDeny();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deny');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Loading authorization request...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <CardTitle>Authorization Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{error}</p>
            <Button onClick={onDeny} variant="outline" className="w-full">
              Return to Application
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!consentDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Request</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">The authorization request is invalid or has expired.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <CardTitle>Authorization Request</CardTitle>
          </div>
          <CardDescription>
            An application wants to access your JotMinds account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="font-semibold text-gray-900 mb-2">Application Details</p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Client ID:</span> {consentDetails.clientId}
            </p>
          </div>

          <div>
            <p className="font-semibold text-gray-900 mb-2">This application will be able to:</p>
            <ul className="space-y-2">
              {consentDetails.scope.map((scope, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{formatScope(scope)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> You can revoke this access at any time from your account settings.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleApprove}
              disabled={processing}
              className="w-full"
            >
              {processing ? 'Processing...' : 'Authorize Application'}
            </Button>
            <Button
              onClick={handleDeny}
              disabled={processing}
              variant="outline"
              className="w-full"
            >
              Deny Access
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function formatScope(scope: string): string {
  const scopeDescriptions: Record<string, string> = {
    'read:profile': 'Read your profile information',
    'read:content': 'Read your notes and content',
    'write:content': 'Create and edit notes',
    'read:organization': 'Access your organization information',
    'manage:organization': 'Manage organization settings',
  };

  return scopeDescriptions[scope] || scope;
}
