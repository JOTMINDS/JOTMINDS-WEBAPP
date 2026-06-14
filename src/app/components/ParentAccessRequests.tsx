import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { AccessRequest } from '../types';
import { getPendingAccessRequests, getAllAccessRequests, approveAccessRequest, denyAccessRequest, revokeParentAccess } from '../utils/api';
import { UserCheck, UserX, Clock, CheckCircle2, XCircle, Shield, AlertCircle } from 'lucide-react';
import { formatDateTime, formatDate } from '../utils/dateFormat';

interface ParentAccessRequestsProps {
  userId: string;
}

export function ParentAccessRequests({ userId }: ParentAccessRequestsProps) {
  const [pendingRequests, setPendingRequests] = useState<AccessRequest[]>([]);
  const [allRequests, setAllRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const [pendingData, allData] = await Promise.all([
        getPendingAccessRequests(),
        getAllAccessRequests()
      ]);
      
      setPendingRequests(pendingData.requests || []);
      setAllRequests(allData.requests || []);
    } catch (error: any) {
      console.error('Error loading access requests:', error);
      setMessage({ type: 'error', text: 'Failed to load access requests. Please refresh the page.' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: AccessRequest) => {
    try {
      const result = await approveAccessRequest(request.id);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        loadRequests();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to approve request.' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to approve request.' });
    }
  };

  const handleDeny = async (request: AccessRequest) => {
    if (!confirm(`Are you sure you want to deny ${request.parentName}'s access request?`)) {
      return;
    }
    
    try {
      const result = await denyAccessRequest(request.id);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        loadRequests();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to deny request.' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to deny request.' });
    }
  };

  const handleRevoke = async (request: AccessRequest) => {
    if (!confirm(`Are you sure you want to revoke ${request.parentName}'s access to your data? They will no longer be able to view your assessments.`)) {
      return;
    }
    
    try {
      const result = await revokeParentAccess(request.parentId);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        loadRequests();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to revoke access.' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to revoke access.' });
    }
  };

  const approvedRequests = allRequests.filter(r => r.status === 'approved');
  const deniedRequests = allRequests.filter(r => r.status === 'denied');

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading access requests...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert className={`${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card className="border-2 border-[#FF715B]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#FF715B]" />
              Pending Access Requests
              <Badge variant="destructive">{pendingRequests.length}</Badge>
            </CardTitle>
            <CardDescription>
              Parents have requested access to view your assessment results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequests.map(request => (
              <div key={request.id} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{request.parentName}</h4>
                      <Badge variant="outline" className="text-xs">Parent</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{request.parentEmail}</p>
                    <p className="text-xs text-muted-foreground">
                      Requested on {formatDateTime(request.requestedAt)}
                    </p>
                    <div className="mt-3 p-3 bg-white rounded border border-amber-100">
                      <div className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-[#5B7DB1] mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-700">
                          If you approve this request, <strong>{request.parentName}</strong> will be able to view your learning style, thinking style, and decision-making assessments. You can revoke this access at any time.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(request)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <UserCheck className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeny(request)}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <UserX className="mr-1 h-4 w-4" />
                      Deny
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Pending Requests */}
      {pendingRequests.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              No Pending Requests
            </CardTitle>
            <CardDescription>
              You don't have any pending parent access requests at the moment
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Approved Access */}
      {approvedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              Approved Access
              <Badge variant="secondary">{approvedRequests.length}</Badge>
            </CardTitle>
            <CardDescription>
              These parents have access to your assessment results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {approvedRequests.map(request => (
              <div key={request.id} className="p-3 bg-green-50 rounded-lg border border-green-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{request.parentName}</h4>
                    <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Approved
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{request.parentEmail}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Approved on {formatDate(request.respondedAt || request.requestedAt)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRevoke(request)}
                  className="text-red-600 hover:bg-red-50 border-red-200"
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  Revoke Access
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Denied Requests */}
      {deniedRequests.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer list-none">
            <Card className="hover:bg-gray-50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-gray-500" />
                  Denied Requests
                  <Badge variant="outline">{deniedRequests.length}</Badge>
                  <span className="text-sm font-normal text-muted-foreground ml-auto group-open:hidden">
                    Click to expand
                  </span>
                </CardTitle>
              </CardHeader>
            </Card>
          </summary>
          <Card className="mt-2">
            <CardContent className="pt-6 space-y-2">
              {deniedRequests.map(request => (
                <div key={request.id} className="p-2 bg-gray-50 rounded border border-gray-200 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{request.parentName}</span>
                    <span className="text-muted-foreground ml-2">• {request.parentEmail}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Denied on {formatDate(request.respondedAt || request.requestedAt)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </details>
      )}

      {/* Privacy Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[#5B7DB1] mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="font-semibold text-[#5B7DB1]">Your Privacy is Protected</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• You control who can see your assessment results</li>
                <li>• Parents can only view data after you approve their request</li>
                <li>• You can revoke access at any time</li>
                <li>• Parents cannot modify or delete your data</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}