import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AdminDiagnosticProps {
  onClose: () => void;
}

export const AdminDiagnostic: React.FC<AdminDiagnosticProps> = ({ onClose }) => {
  const [results, setResults] = useState<any>(null);
  const [running, setRunning] = useState(false);

  const runDiagnostics = async () => {
    setRunning(true);
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      checks: []
    };

    // Check 1: localStorage admin_token
    const adminToken = localStorage.getItem('admin_token');
    diagnostics.checks.push({
      name: 'localStorage: admin_token',
      status: adminToken ? 'pass' : 'fail',
      details: adminToken ? `Present (${adminToken.substring(0, 30)}...)` : 'Missing',
      value: adminToken
    });

    // Check 2: localStorage admin_user
    const adminUser = localStorage.getItem('admin_user');
    diagnostics.checks.push({
      name: 'localStorage: admin_user',
      status: adminUser ? 'pass' : 'fail',
      details: adminUser ? 'Present' : 'Missing',
      value: adminUser
    });

    // Check 3: Admin user data valid JSON
    if (adminUser) {
      try {
        const userData = JSON.parse(adminUser);
        diagnostics.checks.push({
          name: 'Admin user data format',
          status: 'pass',
          details: `Email: ${userData.email}, Role: ${userData.role}`,
          value: userData
        });
      } catch (e) {
        diagnostics.checks.push({
          name: 'Admin user data format',
          status: 'fail',
          details: 'Invalid JSON',
          value: null
        });
      }
    }

    // Check 4: Admin token format
    if (adminToken) {
      const validFormat = adminToken.startsWith('admin-token-');
      diagnostics.checks.push({
        name: 'Admin token format',
        status: validFormat ? 'pass' : 'fail',
        details: validFormat ? 'Valid format (admin-token-*)' : 'Invalid format',
        value: validFormat
      });
    }

    // Check 5: Test API call - /admin/stats
    if (adminToken) {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-fc8eb847/admin/stats`,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Admin-Token': adminToken,
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        const data = await response.json();
        
        diagnostics.checks.push({
          name: 'API Call: /admin/stats',
          status: response.ok ? 'pass' : 'fail',
          details: response.ok ? `Success (${response.status})` : `Failed (${response.status})`,
          value: { status: response.status, data }
        });
      } catch (error: any) {
        diagnostics.checks.push({
          name: 'API Call: /admin/stats',
          status: 'fail',
          details: `Error: ${error.message}`,
          value: null
        });
      }
    }

    // Check 6: Test API call - /admin/users
    if (adminToken) {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-fc8eb847/admin/users`,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Admin-Token': adminToken,
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        const data = await response.json();
        
        diagnostics.checks.push({
          name: 'API Call: /admin/users',
          status: response.ok ? 'pass' : 'fail',
          details: response.ok ? `Success (${data.users?.length || 0} users)` : `Failed (${response.status})`,
          value: { status: response.status, data }
        });
      } catch (error: any) {
        diagnostics.checks.push({
          name: 'API Call: /admin/users',
          status: 'fail',
          details: `Error: ${error.message}`,
          value: null
        });
      }
    }

    // Summary
    const passed = diagnostics.checks.filter((c: any) => c.status === 'pass').length;
    const failed = diagnostics.checks.filter((c: any) => c.status === 'fail').length;
    diagnostics.summary = {
      total: diagnostics.checks.length,
      passed,
      failed,
      status: failed === 0 ? 'healthy' : 'issues'
    };

    setResults(diagnostics);
    setRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
      case 'fail':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
      default:
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>🔍 Admin Panel Diagnostics</CardTitle>
          <Button
            onClick={runDiagnostics}
            disabled={running}
            style={{ backgroundColor: '#5B7DB1' }}
          >
            {running ? 'Running Tests...' : 'Run Diagnostics'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!results && !running && (
          <div className="text-center py-12 text-gray-500">
            Click "Run Diagnostics" to check admin panel health
          </div>
        )}

        {running && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#5B7DB1' }}></div>
            <p className="text-gray-600">Running diagnostic tests...</p>
          </div>
        )}

        {results && !running && (
          <div className="space-y-6">
            {/* Summary */}
            <div className={`p-4 rounded-lg border-2 ${
              results.summary.status === 'healthy' 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-lg font-semibold ${
                  results.summary.status === 'healthy' 
                    ? 'text-green-900 dark:text-green-200' 
                    : 'text-red-900 dark:text-red-200'
                }`}>
                  {results.summary.status === 'healthy' ? '✓ System Healthy' : '✗ Issues Detected'}
                </h3>
                <Badge variant={results.summary.status === 'healthy' ? 'default' : 'destructive'}>
                  {results.summary.passed} / {results.summary.total} Passed
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Ran {results.summary.total} diagnostic checks • {results.summary.failed} failed
              </p>
            </div>

            {/* Individual Checks */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700">Diagnostic Results:</h4>
              {results.checks.map((check: any, index: number) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getStatusColor(check.status)}`}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(check.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{check.name}</span>
                        <Badge variant="outline" className={
                          check.status === 'pass' ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600'
                        }>
                          {check.status === 'pass' ? 'PASS' : 'FAIL'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">{check.details}</p>
                      {check.value && check.status === 'fail' && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            Show details
                          </summary>
                          <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-32">
                            {JSON.stringify(check.value, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            {results.summary.failed > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Recommendations:</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  {!localStorage.getItem('admin_token') && (
                    <li>Admin token is missing - you need to log in again</li>
                  )}
                  {!localStorage.getItem('admin_user') && (
                    <li>Admin user data is missing - log in to restore session</li>
                  )}
                  {results.checks.some((c: any) => c.name.includes('API Call') && c.status === 'fail') && (
                    <li>API calls are failing - check network connection or server status</li>
                  )}
                </ul>
                <div className="mt-4 flex gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      localStorage.removeItem('admin_token');
                      localStorage.removeItem('admin_user');
                      window.location.href = '/';
                    }}
                  >
                    Clear Session & Re-login
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    Refresh Page
                  </Button>
                </div>
              </div>
            )}

            {/* Timestamp */}
            <div className="text-xs text-gray-500 text-center">
              Diagnostic run at: {new Date(results.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};