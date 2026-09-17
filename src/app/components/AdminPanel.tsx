import React, { useState } from 'react';
import { SuperAdminLayout } from './SuperAdminPortal/SuperAdminLayout';
import { SuperAdminTab } from './SuperAdminPortal/Sidebar';
import { useAdminData } from '../hooks/useAdminData';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader, AlertCircle } from 'lucide-react';

// Modules
import { DashboardView } from './SuperAdminPortal/modules/DashboardView';
import { UsersView } from './SuperAdminPortal/modules/UsersView';
import { InstitutionsView } from './SuperAdminPortal/modules/InstitutionsView';
import { OrganizationsView } from './SuperAdminPortal/modules/OrganizationsView';
import { AssessmentEngineView } from './SuperAdminPortal/modules/AssessmentEngineView';
import { ItemBankStudioView } from './SuperAdminPortal/modules/ItemBankStudioView';
import { PilotAnalyticsView } from './SuperAdminPortal/modules/PilotAnalyticsView';
import { AnalyticsView } from './SuperAdminPortal/modules/AnalyticsView';
import { AiManagementView } from './SuperAdminPortal/modules/AiManagementView';
import { ContentManagementView } from './SuperAdminPortal/modules/ContentManagementView';
import { GamificationView } from './SuperAdminPortal/modules/GamificationView';
import { BillingView } from './SuperAdminPortal/modules/BillingView';
import { CommunicationCenterView } from './SuperAdminPortal/modules/CommunicationCenterView';
import { SupportCenterView } from './SuperAdminPortal/modules/SupportCenterView';
import { SecurityCenterView } from './SuperAdminPortal/modules/SecurityCenterView';
import { PlatformSettingsView } from './SuperAdminPortal/modules/PlatformSettingsView';
import { AuditLogsView } from './SuperAdminPortal/modules/AuditLogsView';
import { DeveloperConsoleView } from './SuperAdminPortal/modules/DeveloperConsoleView';
import { BackupRecoveryView } from './SuperAdminPortal/modules/BackupRecoveryView';
import { FeatureFlagsView } from './SuperAdminPortal/modules/FeatureFlagsView';

interface AdminPanelProps {
  onBack: () => void;
  onLogout: () => void;
  onViewUserDashboard?: (userId: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  onBack, 
  onLogout,
  onViewUserDashboard
}) => {
  const [activeTab, setActiveTab] = useState<SuperAdminTab>('dashboard');
  const { users, stats, loading, error, toggleUserActivation, updateSubscription } = useAdminData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-indigo-600 animate-spin" />
          <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300">Loading Command Center...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Portal</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-4">
              <button onClick={onBack} className="text-sm underline hover:text-red-800">
                Go back to login
              </button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView stats={stats} />;
      case 'users':
        return <UsersView users={users} toggleUserActivation={toggleUserActivation} />;
      case 'institutions':
        return <InstitutionsView />;
      case 'organizations':
        return <OrganizationsView />;
      case 'assessment':
        return <AssessmentEngineView />;
      case 'item-bank-studio':
        return <ItemBankStudioView />;
      case 'pilot-analytics':
        return <PilotAnalyticsView />;
      case 'ai':
        return <AiManagementView />;
      case 'content':
        return <ContentManagementView />;
      case 'gamification':
        return <GamificationView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'billing':
        return <BillingView users={users} updateSubscription={updateSubscription} />;
      case 'communications':
        return <CommunicationCenterView />;
      case 'support':
        return <SupportCenterView />;
      case 'security':
        return <SecurityCenterView users={users} />;
      case 'feature-flags':
        return <FeatureFlagsView users={users} />;
      case 'settings':
        return <PlatformSettingsView />;
      case 'audit-logs':
        return <AuditLogsView />;
      case 'developer':
        return <DeveloperConsoleView />;
      case 'backup':
        return <BackupRecoveryView />;
      default:
        return <DashboardView stats={stats} />;
    }
  };

  return (
    <SuperAdminLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onLogout={onLogout}
    >
      {renderContent()}
    </SuperAdminLayout>
  );
};
