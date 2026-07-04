import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ArrowLeft, LayoutDashboard, Building2, Settings, Users, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { cn } from '../ui/utils';

interface AdminDashboardLayoutProps {
  onBack: () => void;
  onLogout: () => void;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({ 
  onBack, 
  onLogout, 
  children,
  activeTab,
  setActiveTab
}) => {
  const { impersonatedUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'platform', label: 'Platform Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'users', label: 'User Directory', icon: <Users className="w-5 h-5" /> },
    { id: 'organizations', label: 'Organizations', icon: <Building2 className="w-5 h-5" /> },
    { id: 'content', label: 'System & Content', icon: <Settings className="w-5 h-5" /> },
    { id: 'settings', label: 'Platform Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">
            A
          </div>
          <span className="font-bold text-lg text-slate-800 dark:text-white">Admin Portal</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-gray-900 border-r flex flex-col transition-transform duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 border-b hidden md:flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            A
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-800 dark:text-white leading-none">Admin</h2>
            <span className="text-xs text-muted-foreground">Superuser Access</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                activeTab === item.id 
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 font-medium" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-t bg-slate-50 dark:bg-gray-950/50">
          {impersonatedUser && (
            <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-100 dark:border-orange-900/50">
              <span className="text-xs text-orange-600 dark:text-orange-400 font-medium block mb-1">IMPERSONATING</span>
              <span className="text-sm font-semibold truncate block">{impersonatedUser.name}</span>
            </div>
          )}
          
          <Button 
            variant="outline" 
            className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
            onClick={impersonatedUser ? onBack : onLogout}
          >
            {impersonatedUser ? (
              <><ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard</>
            ) : (
              <><LogOut className="w-4 h-4 mr-2" /> Logout Admin</>
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full">
        {/* Topbar for Desktop */}
        <header className="hidden md:flex items-center justify-between p-6 bg-white/50 backdrop-blur-sm dark:bg-gray-950/50 border-b sticky top-0 z-30">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {navItems.find(item => item.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <Badge variant="outline" className="px-3 py-1 bg-white dark:bg-gray-900 shadow-sm">
                System Status: <span className="text-green-500 ml-1.5 flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></span> Online</span>
             </Badge>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
