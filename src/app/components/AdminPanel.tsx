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
import { AnalyticsView } from './SuperAdminPortal/modules/AnalyticsView';
import { PlaceholderView } from './SuperAdminPortal/modules/PlaceholderView';

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
      case 'ai':
        return <PlaceholderView title="AI Management" description="Monitor AI tokens, latency, cost tracking, and failures." />;
      case 'content':
        return <PlaceholderView title="Content Management" description="Manage career databases, scholarships, and resources." />;
      case 'gamification':
        return <PlaceholderView title="Gamification" description="Configure levels, XP, and seasonal events." />;
      case 'analytics':
        return <AnalyticsView />;
      case 'billing':
        return <PlaceholderView title="Billing" description="SaaS subscriptions, invoices, and MRR." />;
      case 'communications':
        return <PlaceholderView title="Communication Center" description="Send broadcast emails and notifications." />;
      case 'support':
        return <PlaceholderView title="Support Center" description="View user feedback and support tickets." />;
      case 'security':
        return <PlaceholderView title="Security Center" description="Monitor sessions, API keys, and rate limits." />;
      case 'settings':
        return <PlaceholderView title="Platform Settings" description="Global variables, branding, and localization." />;
      case 'audit-logs':
        return <PlaceholderView title="Audit Logs" description="Review all actions performed by Super Admins." />;
      case 'developer':
        return <PlaceholderView title="Developer Console" description="Database explorer and edge function logs." />;
      case 'backup':
        return <PlaceholderView title="Backup & Recovery" description="Database snapshots and disaster recovery." />;
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
