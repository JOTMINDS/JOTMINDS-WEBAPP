import React, { useState } from 'react';
import { AdminDashboardLayout } from './AdminPortal/AdminDashboardLayout';
import { OverviewMetrics } from './AdminPortal/OverviewMetrics';
import { UserManagementTable } from './AdminPortal/UserManagementTable';
import { useAdminData } from '../hooks/useAdminData';
import { OrganizationManager } from './OrganizationManager';
import { QuestionBankAudit } from './QuestionBankAudit';
import { QuestionSeeder } from './QuestionSeeder';
import { AdminDiagnostic } from './AdminDiagnostic';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader, AlertCircle } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('platform');
  const { users, stats, loading, error, toggleUserActivation, updateSubscription } = useAdminData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-indigo-600 animate-spin" />
          <h3 className="text-xl font-medium text-slate-700">Loading Admin Portal...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950 p-6">
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
      case 'platform':
        return <OverviewMetrics stats={stats} />;
      case 'users':
        return (
          <UserManagementTable 
            users={users} 
            toggleUserActivation={toggleUserActivation}
            updateSubscription={updateSubscription}
            onViewUserDashboard={onViewUserDashboard}
          />
        );
      case 'organizations':
        return <OrganizationManager />;
      case 'content':
        return (
          <div className="space-y-8">
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <QuestionBankAudit />
                <QuestionSeeder />
             </div>
             <AdminDiagnostic />
          </div>
        );
      default:
        return <OverviewMetrics stats={stats} />;
    }
  };

  return (
    <AdminDashboardLayout 
      onBack={onBack} 
      onLogout={onLogout}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {renderContent()}
    </AdminDashboardLayout>
  );
};
