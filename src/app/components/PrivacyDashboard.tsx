import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  ArrowLeft,
  Shield,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Clock,
  Database,
} from 'lucide-react';
import {
  getPrivacySettings,
  updatePrivacySettings,
  getUserConsents,
  recordConsent,
  revokeConsent,
  getDataAccessLogs,
  requestDataExport,
  requestDataDeletion,
  getDataExportRequests,
  getDataDeletionRequests,
  getDataInventory,
  type PrivacySettings,
  type ConsentRecord,
  type DataAccessLog,
  type DataExportRequest,
  type DataDeletionRequest,
  type DataInventory,
} from '../utils/privacyConsent';
import { formatDate } from '../utils/dateFormat';

interface Props {
  userId: string;
  onBack: () => void;
}

export function PrivacyDashboard({ userId, onBack }: Props) {
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [accessLogs, setAccessLogs] = useState<DataAccessLog[]>([]);
  const [exportRequests, setExportRequests] = useState<DataExportRequest[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<DataDeletionRequest[]>([]);
  const [dataInventory, setDataInventory] = useState<DataInventory | null>(null);
  const [activeTab, setActiveTab] = useState('settings');

  useEffect(() => {
    loadPrivacyData();
  }, [userId]);

  const loadPrivacyData = () => {
    setSettings(getPrivacySettings(userId));
    setConsents(getUserConsents(userId));
    setAccessLogs(getDataAccessLogs(userId, 50));
    setExportRequests(getDataExportRequests(userId));
    setDeletionRequests(getDataDeletionRequests(userId));
    setDataInventory(getDataInventory(userId));
  };

  const handleSettingChange = (key: keyof PrivacySettings, value: any) => {
    if (!settings) return;

    const updated = updatePrivacySettings(userId, { [key]: value });
    setSettings(updated);
  };

  const handleConsentToggle = (consentType: ConsentRecord['consentType'], granted: boolean) => {
    if (granted) {
      recordConsent(userId, consentType, true, '1.0');
    } else {
      revokeConsent(userId, consentType);
    }
    loadPrivacyData();
  };

  const handleExportData = () => {
    requestDataExport(userId, 'json');
    loadPrivacyData();
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to request account deletion? This action cannot be undone.')) {
      requestDataDeletion(userId, 'User requested account deletion');
      loadPrivacyData();
    }
  };

  if (!settings || !dataInventory) {
    return <div className="p-8 text-center">Loading privacy settings...</div>;
  }

  const activeConsents = consents.filter(c => c.granted && !c.revokedAt);
  const totalDataPoints = dataInventory.categories.reduce((sum, cat) => sum + cat.dataPoints, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Privacy & Data Management
            </h1>
            <p className="text-xs text-muted-foreground">
              Control your data, manage consents, and privacy settings
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Database className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalDataPoints}</div>
                  <div className="text-xs text-muted-foreground">Data Points</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{activeConsents.length}</div>
                  <div className="text-xs text-muted-foreground">Active Consents</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Eye className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{accessLogs.length}</div>
                  <div className="text-xs text-muted-foreground">Access Logs</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Download className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{exportRequests.length}</div>
                  <div className="text-xs text-muted-foreground">Export Requests</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="consents">Consents</TabsTrigger>
            <TabsTrigger value="data">Your Data</TabsTrigger>
            <TabsTrigger value="access">Access Logs</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Control who can see your data and how it's used</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Visibility */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Profile Visibility</label>
                  <div className="space-y-2">
                    <div
                      className={`p-3 rounded-lg border-2 cursor-pointer transition ${
                        settings.profileVisibility === 'public'
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200'
                      }`}
                      onClick={() => handleSettingChange('profileVisibility', 'public')}
                    >
                      <div className="flex items-center gap-2">
                        <Unlock className="h-4 w-4" />
                        <span className="font-medium">Public</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Anyone can view your profile
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-lg border-2 cursor-pointer transition ${
                        settings.profileVisibility === 'school_only'
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200'
                      }`}
                      onClick={() => handleSettingChange('profileVisibility', 'school_only')}
                    >
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span className="font-medium">School Only</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Only teachers and students in your school can view
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-lg border-2 cursor-pointer transition ${
                        settings.profileVisibility === 'private'
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200'
                      }`}
                      onClick={() => handleSettingChange('profileVisibility', 'private')}
                    >
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <span className="font-medium">Private</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Only you can view your profile
                      </p>
                    </div>
                  </div>
                </div>

                {/* Data Sharing */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium">Data Sharing Preferences</h3>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">Share Progress with Teachers</div>
                      <div className="text-xs text-muted-foreground">
                        Allow teachers to view your assessment results and growth
                      </div>
                    </div>
                    <Switch
                      checked={settings.shareProgressWithTeachers}
                      onCheckedChange={(checked) =>
                        handleSettingChange('shareProgressWithTeachers', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">Share Progress with Parents</div>
                      <div className="text-xs text-muted-foreground">
                        Allow parents to view your learning progress
                      </div>
                    </div>
                    <Switch
                      checked={settings.shareProgressWithParents}
                      onCheckedChange={(checked) =>
                        handleSettingChange('shareProgressWithParents', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">Allow Peer Comparison</div>
                      <div className="text-xs text-muted-foreground">
                        Show your ranking and allow comparison with classmates
                      </div>
                    </div>
                    <Switch
                      checked={settings.allowPeerComparison}
                      onCheckedChange={(checked) =>
                        handleSettingChange('allowPeerComparison', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">Contribute to Research</div>
                      <div className="text-xs text-muted-foreground">
                        Allow anonymized data for educational research
                      </div>
                    </div>
                    <Switch
                      checked={settings.allowResearchData}
                      onCheckedChange={(checked) =>
                        handleSettingChange('allowResearchData', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">Analytics Tracking</div>
                      <div className="text-xs text-muted-foreground">
                        Track usage data to improve your experience
                      </div>
                    </div>
                    <Switch
                      checked={settings.analyticsTracking}
                      onCheckedChange={(checked) =>
                        handleSettingChange('analyticsTracking', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">Marketing Communications</div>
                      <div className="text-xs text-muted-foreground">
                        Receive updates about new features and content
                      </div>
                    </div>
                    <Switch
                      checked={settings.marketingCommunications}
                      onCheckedChange={(checked) =>
                        handleSettingChange('marketingCommunications', checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consents Tab */}
          <TabsContent value="consents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Consent Management</CardTitle>
                <CardDescription>Manage your data processing consents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    type: 'terms_of_service' as const,
                    title: 'Terms of Service',
                    description: 'Agreement to platform terms and conditions',
                    required: true,
                  },
                  {
                    type: 'privacy_policy' as const,
                    title: 'Privacy Policy',
                    description: 'Consent to data collection and processing',
                    required: true,
                  },
                  {
                    type: 'data_processing' as const,
                    title: 'Data Processing',
                    description: 'Consent for processing cognitive assessment data',
                    required: true,
                  },
                  {
                    type: 'analytics' as const,
                    title: 'Analytics',
                    description: 'Usage analytics and performance tracking',
                    required: false,
                  },
                  {
                    type: 'marketing' as const,
                    title: 'Marketing',
                    description: 'Promotional emails and notifications',
                    required: false,
                  },
                  {
                    type: 'third_party_sharing' as const,
                    title: 'Third Party Sharing',
                    description: 'Share data with partner organizations',
                    required: false,
                  },
                ].map((item) => {
                  const consent = consents.find((c) => c.consentType === item.type);
                  const isGranted = consent?.granted && !consent.revokedAt;

                  return (
                    <div
                      key={item.type}
                      className={`p-4 rounded-lg border-2 ${
                        isGranted ? 'border-green-200 bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{item.title}</h4>
                            {item.required && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          {consent && (
                            <p className="text-xs text-gray-500 mt-2">
                              {isGranted ? 'Granted' : 'Revoked'} on{' '}
                              {formatDate(consent.revokedAt || consent.timestamp)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {isGranted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-400" />
                          )}
                          {!item.required && (
                            <Switch
                              checked={isGranted}
                              onCheckedChange={(checked) => handleConsentToggle(item.type, checked)}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900">Ghana Data Protection Act</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      Your data is protected under Ghana's Data Protection Act (Act 843). You have the
                      right to access, modify, and delete your personal data at any time.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Data Inventory</CardTitle>
                <CardDescription>
                  Overview of all data we collect and store about you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dataInventory.categories.map((category) => (
                  <div key={category.category} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold">{category.category}</h4>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                      <Badge>{category.dataPoints} points</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Database className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">{category.storage}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">
                          {category.retention === 0 ? 'Indefinite' : `${category.retention}d`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {category.canExport ? (
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        ) : (
                          <XCircle className="h-3 w-3 text-gray-400" />
                        )}
                        <span className="text-gray-600">Export</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {category.canDelete ? (
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        ) : (
                          <XCircle className="h-3 w-3 text-gray-400" />
                        )}
                        <span className="text-gray-600">Delete</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Export Your Data</CardTitle>
                  <CardDescription>Download a copy of all your data</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleExportData} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Request Data Export
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">
                    You'll receive a downloadable file within 48 hours
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-red-200">
                <CardHeader>
                  <CardTitle className="text-base text-red-900">Delete Your Account</CardTitle>
                  <CardDescription>Permanently delete all your data</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleDeleteAccount} variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Request Account Deletion
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">
                    This action cannot be undone. Data will be retained for 30 days.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Access Logs Tab */}
          <TabsContent value="access" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Access History</CardTitle>
                <CardDescription>Track who accessed your data and when</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {accessLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-gray-50 rounded-lg border flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg border">
                        {log.action === 'view' && <Eye className="h-4 w-4 text-blue-600" />}
                        {log.action === 'edit' && <FileText className="h-4 w-4 text-orange-600" />}
                        {log.action === 'export' && <Download className="h-4 w-4 text-green-600" />}
                        {log.action === 'delete' && <Trash2 className="h-4 w-4 text-red-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm capitalize">{log.action}</span>
                          <Badge variant="outline" className="text-xs">
                            {log.accessedByRole}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {log.dataType}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(log.timestamp)}
                          {log.purpose && ` • ${log.purpose}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            {/* Export Requests */}
            {exportRequests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Export Requests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {exportRequests.map((request) => (
                    <div key={request.id} className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">Data Export ({request.format.toUpperCase()})</div>
                          <div className="text-xs text-muted-foreground">
                            Requested {formatDate(request.requestedAt)}
                          </div>
                        </div>
                        <Badge
                          variant={
                            request.status === 'completed'
                              ? 'default'
                              : request.status === 'failed'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                      {request.status === 'completed' && request.downloadUrl && (
                        <Button size="sm" className="mt-2 w-full" asChild>
                          <a href={request.downloadUrl}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Deletion Requests */}
            {deletionRequests.length > 0 && (
              <Card className="border-2 border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-900">Deletion Requests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {deletionRequests.map((request) => (
                    <div key={request.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">Account Deletion</div>
                          <div className="text-xs text-muted-foreground">
                            Requested {formatDate(request.requestedAt)}
                          </div>
                          {request.reason && (
                            <p className="text-xs text-gray-600 mt-1">{request.reason}</p>
                          )}
                        </div>
                        <Badge
                          variant={
                            request.status === 'completed'
                              ? 'destructive'
                              : request.status === 'rejected'
                              ? 'secondary'
                              : 'default'
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {exportRequests.length === 0 && deletionRequests.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">No active requests</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
