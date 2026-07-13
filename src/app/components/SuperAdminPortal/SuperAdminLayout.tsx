import React, { useState } from 'react';
import { Sidebar, SuperAdminTab } from './Sidebar';
import { TopNav } from './TopNav';
import { SupportModeProvider, useSupportMode } from './SupportModeProvider';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../ui/button';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
  activeTab: SuperAdminTab;
  setActiveTab: (tab: SuperAdminTab) => void;
  onLogout: () => void;
}

// Inner component to access the SupportMode context
function LayoutInner({ children, activeTab, setActiveTab, onLogout }: SuperAdminLayoutProps) {
  const { supportMode, deactivateSupportMode } = useSupportMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Mobile Sidebar Overlay (Mocked logic for now) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-950 w-64">
            <Sidebar activeTab={activeTab} setActiveTab={(tab) => {
              setActiveTab(tab);
              setMobileMenuOpen(false);
            }} />
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {supportMode.isActive && (
          <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between shadow-sm z-50">
            <div className="flex items-center space-x-2 text-sm font-medium">
              <AlertTriangle className="h-4 w-4" />
              <span>
                <strong>AUDITED SUPPORT MODE ACTIVE:</strong> Ticket #{supportMode.ticketNumber} - Session expires at {supportMode.expiresAt?.toLocaleTimeString()}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={deactivateSupportMode} className="text-white hover:bg-amber-600 hover:text-white h-7 px-2">
              End Session <X className="ml-1 h-3 w-3" />
            </Button>
          </div>
        )}
        
        <TopNav 
          title={activeTab} 
          onLogout={onLogout} 
          onMenuClick={() => setMobileMenuOpen(true)} 
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function SuperAdminLayout(props: SuperAdminLayoutProps) {
  return (
    <SupportModeProvider>
      <LayoutInner {...props} />
    </SupportModeProvider>
  );
}
