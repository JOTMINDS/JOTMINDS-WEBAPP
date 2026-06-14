import React, { useState } from 'react';
import { AlertTriangle, XCircle, Pause, Play, Download, Info, Shield } from 'lucide-react';
import { AgeCategory } from '../../types/age-consent-types';
import { getTerminationPermissions, getDataRetentionAfterTermination } from '../../types/age-account-termination';

interface AccountTerminationManagerProps {
  ageCategory: AgeCategory;
  userId: string;
  userName: string;
  userRole: 'parent' | 'guardian' | 'school' | 'student' | 'user';
  isSchoolAccount: boolean;
  onSuspend: (reason: string) => void;
  onTerminate: (reason: string) => void;
  onExportData: () => void;
}

/**
 * Account Termination & Suspension Manager
 * Age-appropriate controls for account management
 */
export function AccountTerminationManager({
  ageCategory,
  userId,
  userName,
  userRole,
  isSchoolAccount,
  onSuspend,
  onTerminate,
  onExportData
}: AccountTerminationManagerProps) {
  const permissions = getTerminationPermissions(ageCategory);
  const dataRetentionDays = getDataRetentionAfterTermination(ageCategory);
  
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [terminateReason, setTerminateReason] = useState('');
  const [confirmText, setConfirmText] = useState('');

  // Check permissions based on user role
  const canSuspend = 
    (userRole === 'parent' && permissions.parentCanSuspend) ||
    (userRole === 'guardian' && permissions.parentCanSuspend) ||
    (userRole === 'school' && permissions.schoolCanSuspend && isSchoolAccount) ||
    (userRole === 'student' && permissions.userCanSelfSuspend) ||
    (userRole === 'user' && permissions.userCanSelfSuspend);

  const canTerminate = 
    (userRole === 'parent' && permissions.parentCanTerminate) ||
    (userRole === 'guardian' && permissions.guardianCanTerminate) ||
    (userRole === 'school' && permissions.schoolCanTerminate && isSchoolAccount) ||
    (userRole === 'student' && permissions.userCanSelfTerminate) ||
    (userRole === 'user' && permissions.userCanSelfTerminate);

  const canExportBeforeDeletion =
    (userRole === 'parent' || userRole === 'guardian') && permissions.parentCanExportBeforeDeletion ||
    (userRole === 'student' || userRole === 'user') && permissions.userCanExportBeforeDeletion;

  const handleSuspend = () => {
    if (suspendReason.trim()) {
      onSuspend(suspendReason);
      setShowSuspendModal(false);
      setSuspendReason('');
    }
  };

  const handleTerminate = () => {
    if (confirmText === 'DELETE') {
      onTerminate(terminateReason);
      setShowTerminateModal(false);
      setTerminateReason('');
      setConfirmText('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-lg">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-white mb-1">Account Management</h1>
            <p className="text-white/90">
              Suspension and termination controls for {userName}
            </p>
          </div>
        </div>
      </div>

      {/* Permission Notice */}
      <PermissionNotice
        userRole={userRole}
        ageCategory={ageCategory}
        permissions={permissions}
        isSchoolAccount={isSchoolAccount}
      />

      {/* Account Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Suspend Account */}
        {canSuspend && (
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-orange-200">
            <div className="flex items-start gap-3 mb-4">
              <Pause className="w-6 h-6 text-orange-600 flex-shrink-0" />
              <div>
                <h3 className="text-gray-900 mb-2">Suspend Account</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Temporarily disable access while preserving all data. Can be reactivated later.
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowSuspendModal(true)}
              className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Suspend Account
            </button>
          </div>
        )}

        {/* Terminate Account */}
        {canTerminate && (
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-red-200">
            <div className="flex items-start gap-3 mb-4">
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="text-gray-900 mb-2">Delete Account</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Permanently delete account. Data retained for {dataRetentionDays} days before permanent deletion.
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowTerminateModal(true)}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Account
            </button>
          </div>
        )}
      </div>

      {/* Export Data Before Deletion */}
      {canExportBeforeDeletion && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <Download className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-gray-900 mb-2">Export Data Before Deletion</h3>
              <p className="text-gray-700 mb-4">
                Before deleting the account, we recommend exporting all data. This includes all 
                assessment results, progress reports, and profile information.
              </p>
              <button
                onClick={onExportData}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Export All Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notice Period Information */}
      {permissions.noticePeriodDays > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-gray-900 mb-2">Notice Period</h4>
              <p className="text-gray-700">
                A {permissions.noticePeriodDays}-day notice period applies before account deletion. 
                During this time, you can cancel the deletion and all data will be preserved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notification Information */}
      <NotificationInfo permissions={permissions} isSchoolAccount={isSchoolAccount} />

      {/* No Permission Notice */}
      {!canSuspend && !canTerminate && (
        <div className="bg-gray-100 border border-gray-300 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-gray-600 flex-shrink-0" />
            <div>
              <h3 className="text-gray-900 mb-2">Limited Access</h3>
              <p className="text-gray-700">
                You do not have permission to suspend or terminate this account. 
                {userRole === 'student' && ageCategory === AgeCategory.JUNIOR_LEARNER && (
                  <span> Please contact your parent/guardian to manage your account.</span>
                )}
                {userRole === 'student' && ageCategory === AgeCategory.EARLY_LEARNER && (
                  <span> Your parent/guardian manages this account.</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && (
        <ActionModal
          title="Suspend Account"
          type="suspend"
          userName={userName}
          onConfirm={handleSuspend}
          onCancel={() => {
            setShowSuspendModal(false);
            setSuspendReason('');
          }}
          reason={suspendReason}
          onReasonChange={setSuspendReason}
        />
      )}

      {/* Terminate Modal */}
      {showTerminateModal && (
        <TerminateModal
          userName={userName}
          dataRetentionDays={dataRetentionDays}
          onConfirm={handleTerminate}
          onCancel={() => {
            setShowTerminateModal(false);
            setTerminateReason('');
            setConfirmText('');
          }}
          reason={terminateReason}
          onReasonChange={setTerminateReason}
          confirmText={confirmText}
          onConfirmTextChange={setConfirmText}
        />
      )}
    </div>
  );
}

function PermissionNotice({
  userRole,
  ageCategory,
  permissions,
  isSchoolAccount
}: {
  userRole: string;
  ageCategory: AgeCategory;
  permissions: any;
  isSchoolAccount: boolean;
}) {
  const getRolePermissions = () => {
    if (userRole === 'parent' || userRole === 'guardian') {
      return {
        canSuspend: permissions.parentCanSuspend,
        canTerminate: permissions.parentCanTerminate,
        canReactivate: permissions.parentCanReactivate
      };
    }
    if (userRole === 'school' && isSchoolAccount) {
      return {
        canSuspend: permissions.schoolCanSuspend,
        canTerminate: permissions.schoolCanTerminate,
        canReactivate: permissions.schoolCanReactivate
      };
    }
    if (userRole === 'student' || userRole === 'user') {
      return {
        canSuspend: permissions.userCanSelfSuspend,
        canTerminate: permissions.userCanSelfTerminate,
        canReactivate: permissions.userCanReactivate
      };
    }
    return { canSuspend: false, canTerminate: false, canReactivate: false };
  };

  const rolePerms = getRolePermissions();

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-6">
      <h3 className="text-gray-900 mb-3 flex items-center gap-2">
        <Info className="w-5 h-5 text-indigo-600" />
        Your Permissions
      </h3>
      
      <div className="grid md:grid-cols-3 gap-3">
        <PermissionBadge
          label="Suspend"
          allowed={rolePerms.canSuspend}
        />
        <PermissionBadge
          label="Terminate"
          allowed={rolePerms.canTerminate}
        />
        <PermissionBadge
          label="Reactivate"
          allowed={rolePerms.canReactivate}
        />
      </div>
    </div>
  );
}

function PermissionBadge({ label, allowed }: { label: string; allowed: boolean }) {
  return (
    <div className={`p-3 rounded-lg border-2 ${
      allowed 
        ? 'bg-green-50 border-green-200' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center gap-2">
        {allowed ? (
          <span className="text-green-600">✓</span>
        ) : (
          <span className="text-gray-400">✗</span>
        )}
        <span className={allowed ? 'text-gray-900' : 'text-gray-500'}>{label}</span>
      </div>
    </div>
  );
}

function NotificationInfo({ permissions, isSchoolAccount }: { permissions: any; isSchoolAccount: boolean }) {
  const notifications = [];
  
  if (permissions.noticeToParent) {
    notifications.push('Parent/Guardian will be notified');
  }
  if (permissions.noticeToSchool && isSchoolAccount) {
    notifications.push('School will be notified');
  }
  if (permissions.noticeToUser) {
    notifications.push('User will be notified');
  }

  if (notifications.length === 0) return null;

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
      <h4 className="text-gray-900 mb-3">Notifications</h4>
      <div className="space-y-2">
        {notifications.map((notice, index) => (
          <div key={index} className="flex items-center gap-2 text-gray-700">
            <span className="text-purple-600">📧</span>
            <span>{notice}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionModal({
  title,
  type,
  userName,
  onConfirm,
  onCancel,
  reason,
  onReasonChange
}: {
  title: string;
  type: 'suspend';
  userName: string;
  onConfirm: () => void;
  onCancel: () => void;
  reason: string;
  onReasonChange: (value: string) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-gray-900 mb-4">{title}</h3>
        
        <p className="text-gray-700 mb-4">
          Are you sure you want to suspend <strong>{userName}</strong>'s account?
        </p>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Reason (optional):
          </label>
          <textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900"
            rows={3}
            placeholder="Enter reason for suspension..."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Suspend Account
          </button>
        </div>
      </div>
    </div>
  );
}

function TerminateModal({
  userName,
  dataRetentionDays,
  onConfirm,
  onCancel,
  reason,
  onReasonChange,
  confirmText,
  onConfirmTextChange
}: {
  userName: string;
  dataRetentionDays: number;
  onConfirm: () => void;
  onCancel: () => void;
  reason: string;
  onReasonChange: (value: string) => void;
  confirmText: string;
  onConfirmTextChange: (value: string) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-gray-900 mb-4">Delete Account Permanently</h3>
        
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-900 mb-2">
            <strong>⚠️ Warning: This action cannot be undone!</strong>
          </p>
          <p className="text-red-800 text-sm">
            <strong>{userName}</strong>'s account will be deleted. All data will be retained 
            for {dataRetentionDays} days before permanent deletion.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Reason (optional):
          </label>
          <textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900"
            rows={2}
            placeholder="Enter reason for deletion..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Type <strong>DELETE</strong> to confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => onConfirmTextChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900"
            placeholder="DELETE"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmText !== 'DELETE'}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Forever
          </button>
        </div>
      </div>
    </div>
  );
}
