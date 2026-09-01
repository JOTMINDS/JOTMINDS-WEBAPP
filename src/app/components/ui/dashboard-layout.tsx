import React from 'react';
import { CollapsibleSidebar, NavGroup } from './collapsible-sidebar';
import { User } from '../../types';
import { NudgesPanel } from '../NudgesPanel';

export interface DashboardLayoutProps {
  navGroups: NavGroup[];
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  user: User;
  onLogout?: () => void;
  brandTitle?: string;
  brandSubtitle?: string;
  onOpenSettings?: () => void;
  children: React.ReactNode;
  headerContent?: React.ReactNode;
}

export function DashboardLayout({
  navGroups,
  activeTab,
  setActiveTab,
  user,
  onLogout,
  brandTitle = 'JotMinds',
  brandSubtitle,
  onOpenSettings,
  children,
  headerContent
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-gray-900 flex flex-col md:flex-row">
      <CollapsibleSidebar
        navGroups={navGroups}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={onLogout}
        brandTitle={brandTitle}
        brandSubtitle={brandSubtitle}
        onOpenSettings={onOpenSettings}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {(headerContent || user) && (
          <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between shadow-sm">
                        <div className="flex-1 flex items-center">
              {headerContent}
            </div>
            {user && (
              <div className="flex items-center ml-4 gap-4">
                <div id="google_translate_element" className="scale-90 origin-right hidden md:block"></div>
                <NudgesPanel userId={user.id} isNavbarMode={true} onNavigate={(route) => {
                  // Map legacy route names to new dashboard tabs
                  let targetTab = route;
                  if (route.includes('/assessments') || route.includes('jtia')) targetTab = 'jtia';
                  else if (route.includes('/profile') || route.includes('my-style')) targetTab = 'my-style';
                  else if (route.includes('/analytics')) targetTab = 'analytics';
                  else if (route.includes('/lesson')) targetTab = 'lesson-planner';
                  else if (route.includes('/students') || route.includes('class')) targetTab = 'students';
                  setActiveTab(targetTab);
                }} />              </div>
            )}
          </header>
        )}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
