import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, Download, Trash2, AlertCircle } from 'lucide-react';
import { AgeCategory } from '../../types/age-consent-types';
import { getPrivacyConfig, isMinor } from '../../types/age-privacy-configs';

interface AgePrivacySettingsProps {
  ageCategory: AgeCategory;
  userId: string;
  currentSettings?: PrivacySettings;
  onSave: (settings: PrivacySettings) => void;
}

interface PrivacySettings {
  // Analytics (Adults only)
  allowBasicAnalytics?: boolean;
  allowDetailedAnalytics?: boolean;
  allowBehavioralTracking?: boolean;
  
  // Marketing (Adults only)
  allowMarketingEmails?: boolean;
  allowProductUpdates?: boolean;
  
  // Data Management
  dataRetentionOptOut?: boolean;
}

/**
 * Age-Appropriate Privacy Settings
 * Shows different options based on age category
 */
export function AgePrivacySettings({
  ageCategory,
  userId,
  currentSettings = {},
  onSave
}: AgePrivacySettingsProps) {
  const privacyConfig = getPrivacyConfig(ageCategory);
  const minor = isMinor(ageCategory);
  const [settings, setSettings] = useState<PrivacySettings>(currentSettings);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    onSave(settings);
  };

  const handleExportData = () => {
    // Trigger data export
    console.log('Exporting data for user:', userId);
    setShowExportConfirm(false);
  };

  const handleDeleteAccount = () => {
    // Trigger account deletion
    console.log('Deleting account for user:', userId);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-lg">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-white mb-1">Privacy Settings</h1>
            <p className="text-white/90">
              {minor ? 'Protected settings for your age group' : 'Manage your privacy preferences'}
            </p>
          </div>
        </div>
      </div>

      {/* Minor Protection Notice */}
      {minor && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <Lock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-gray-900 mb-2">Age-Appropriate Protection Active</h3>
              <p className="text-gray-700 mb-3">
                As someone under 19, you have enhanced privacy protections. Many settings are automatically 
                configured to keep you safe and cannot be changed.
              </p>
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <p className="text-gray-800 text-sm">
                  <strong>Protected Features:</strong> No advertising, no location tracking, 
                  no social networking, no peer messaging, and no data selling.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Privacy Level */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
        <h3 className="text-gray-900 mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-indigo-600" />
          Your Privacy Level
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <PrivacyFeature
            label="Data Collection"
            value={privacyConfig.dataMinimization.level}
            locked={minor}
          />
          <PrivacyFeature
            label="Analytics"
            value={privacyConfig.analyticsPermissions.basicUsageTracking ? 'Limited' : 'Disabled'}
            locked={minor}
          />
          <PrivacyFeature
            label="Location Tracking"
            value="Disabled"
            locked={true}
          />
          <PrivacyFeature
            label="Advertising"
            value={minor ? 'Blocked' : 'With Consent'}
            locked={minor}
          />
        </div>
      </div>

      {/* Analytics Settings (Adults only) */}
      {ageCategory === AgeCategory.ADULT && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
          <h3 className="text-gray-900 mb-4">Analytics Preferences</h3>
          
          <div className="space-y-4">
            <ToggleSetting
              label="Basic Usage Analytics"
              description="Help us improve by sharing basic usage data"
              checked={settings.allowBasicAnalytics ?? true}
              onChange={(checked) => setSettings({ ...settings, allowBasicAnalytics: checked })}
            />
            
            <ToggleSetting
              label="Detailed Analytics"
              description="Enable detailed insights and personalized recommendations"
              checked={settings.allowDetailedAnalytics ?? true}
              onChange={(checked) => setSettings({ ...settings, allowDetailedAnalytics: checked })}
            />
            
            <ToggleSetting
              label="Behavioral Tracking"
              description="Track learning patterns for advanced insights (requires explicit consent)"
              checked={settings.allowBehavioralTracking ?? false}
              onChange={(checked) => setSettings({ ...settings, allowBehavioralTracking: checked })}
              highlight={true}
            />
          </div>
        </div>
      )}

      {/* Marketing Preferences (Adults only) */}
      {ageCategory === AgeCategory.ADULT && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
          <h3 className="text-gray-900 mb-4">Marketing Preferences</h3>
          
          <div className="space-y-4">
            <ToggleSetting
              label="Product Updates & Tips"
              description="Receive occasional emails about new features and learning tips"
              checked={settings.allowMarketingEmails ?? false}
              onChange={(checked) => setSettings({ ...settings, allowMarketingEmails: checked })}
            />
            
            <ToggleSetting
              label="Feature Announcements"
              description="Be the first to know about new assessments and tools"
              checked={settings.allowProductUpdates ?? false}
              onChange={(checked) => setSettings({ ...settings, allowProductUpdates: checked })}
            />
          </div>
        </div>
      )}

      {/* Data Management */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
        <h3 className="text-gray-900 mb-4">Data Management</h3>
        
        <div className="space-y-4">
          {/* Data Retention */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-gray-900 mb-1">Data Retention</h4>
                <p className="text-gray-600 text-sm mb-2">
                  Your data is retained for {privacyConfig.dataMinimization.retentionPeriodDays} days 
                  ({Math.floor(privacyConfig.dataMinimization.retentionPeriodDays / 365)} years)
                </p>
                {privacyConfig.dataMinimization.anonymizeData && (
                  <p className="text-green-700 text-sm">
                    ✓ Data is automatically anonymized for your protection
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Export Data */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-gray-900 mb-1 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Your Data
                </h4>
                <p className="text-gray-600 text-sm">
                  Download all your assessment results, progress, and profile information
                </p>
              </div>
              <button
                onClick={() => setShowExportConfirm(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                Export
              </button>
            </div>
          </div>

          {/* Delete Account */}
          {(ageCategory === AgeCategory.SENIOR_ADOLESCENT || ageCategory === AgeCategory.ADULT) && (
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-gray-900 mb-1 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-600" />
                    Delete Account
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Parent Must Approve (Minors) */}
          {minor && ageCategory !== AgeCategory.SENIOR_ADOLESCENT && (
            <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-gray-900 mb-1">Account Deletion Restricted</h4>
                  <p className="text-gray-700 text-sm">
                    Your parent/guardian must approve account deletion. Contact them to request deletion.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Guardian Access Info */}
      {minor && privacyConfig.guardianOversight.viewingRequired && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
          <h3 className="text-gray-900 mb-3 flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-600" />
            Guardian Access
          </h3>
          <p className="text-gray-700 mb-3">
            Your parent/guardian has the following access to support your safety:
          </p>
          <div className="space-y-2">
            {privacyConfig.guardianOversight.canViewAllActivity && (
              <GuardianAccessItem text="Can view all activity" />
            )}
            {privacyConfig.guardianOversight.canViewResults && (
              <GuardianAccessItem text="Can view assessment results" />
            )}
            {privacyConfig.guardianOversight.canModifySettings && (
              <GuardianAccessItem text="Can modify account settings" />
            )}
            {privacyConfig.guardianOversight.canDeleteData && (
              <GuardianAccessItem text="Can delete account and data" />
            )}
          </div>
        </div>
      )}

      {/* Save Button (Adults only for changeable settings) */}
      {ageCategory === AgeCategory.ADULT && (
        <div className="flex justify-end gap-3">
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
          >
            Save Privacy Settings
          </button>
        </div>
      )}

      {/* Export Confirmation Modal */}
      {showExportConfirm && (
        <ConfirmationModal
          title="Export Your Data"
          message="We'll prepare a download of all your data including assessments, results, and profile information. You'll receive a download link via email within 24 hours."
          confirmText="Export Data"
          onConfirm={handleExportData}
          onCancel={() => setShowExportConfirm(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <ConfirmationModal
          title="Delete Account"
          message="This will permanently delete your account and all associated data. This action cannot be undone. Are you absolutely sure?"
          confirmText="Delete Forever"
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteConfirm(false)}
          dangerous={true}
        />
      )}
    </div>
  );
}

function PrivacyFeature({ label, value, locked }: { label: string; value: string; locked: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2">
        {locked && <Lock className="w-4 h-4 text-gray-500" />}
        <span className="text-gray-700">{label}</span>
      </div>
      <span className="text-gray-900 capitalize">{value}</span>
    </div>
  );
}

interface ToggleSettingProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  highlight?: boolean;
}

function ToggleSetting({ label, description, checked, onChange, highlight }: ToggleSettingProps) {
  return (
    <div className={`p-4 rounded-lg border ${highlight ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-gray-900 mb-1">{label}</h4>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
        <button
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            checked ? 'bg-indigo-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              checked ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
}

function GuardianAccessItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Eye className="w-4 h-4 text-purple-600" />
      <span className="text-gray-700 text-sm">{text}</span>
    </div>
  );
}

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
  onCancel: () => void;
  dangerous?: boolean;
}

function ConfirmationModal({
  title,
  message,
  confirmText,
  onConfirm,
  onCancel,
  dangerous = false
}: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 text-white py-2 rounded-lg transition-colors ${
              dangerous
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
