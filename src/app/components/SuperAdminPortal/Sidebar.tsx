import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  School, 
  Building2, 
  BrainCircuit, 
  Bot, 
  FileText, 
  Gamepad2, 
  BarChart3, 
  CreditCard, 
  Megaphone, 
  LifeBuoy, 
  ShieldCheck, 
  Settings, 
  ScrollText, 
  TerminalSquare, 
  DatabaseBackup 
} from 'lucide-react';
import { cn } from "../ui/utils";

export type SuperAdminTab = 
  | 'dashboard' 
  | 'users' 
  | 'institutions' 
  | 'organizations' 
  | 'assessment' 
  | 'ai' 
  | 'content' 
  | 'gamification' 
  | 'analytics' 
  | 'billing' 
  | 'communications' 
  | 'support' 
  | 'security' 
  | 'settings' 
  | 'audit-logs' 
  | 'developer' 
  | 'backup';

interface SidebarProps {
  activeTab: SuperAdminTab;
  setActiveTab: (tab: SuperAdminTab) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'institutions', label: 'Institutions', icon: School },
  { id: 'organizations', label: 'Organizations', icon: Building2 },
  { id: 'assessment', label: 'Assessment Engine', icon: BrainCircuit },
  { id: 'ai', label: 'AI Management', icon: Bot },
  { id: 'content', label: 'Content Management', icon: FileText },
  { id: 'gamification', label: 'Gamification', icon: Gamepad2 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'communications', label: 'Communication Center', icon: Megaphone },
  { id: 'support', label: 'Support Center', icon: LifeBuoy },
  { id: 'security', label: 'Security Center', icon: ShieldCheck },
  { id: 'settings', label: 'Platform Settings', icon: Settings },
  { id: 'audit-logs', label: 'Audit Logs', icon: ScrollText },
  { id: 'developer', label: 'Developer Console', icon: TerminalSquare },
  { id: 'backup', label: 'Backup & Recovery', icon: DatabaseBackup },
] as const;

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex-shrink-0 hidden md:flex flex-col h-screen border-r border-slate-800">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <h1 className="text-white font-bold tracking-tight">JOTMinds <span className="text-xs ml-1 px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded">SUPER</span></h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as SuperAdminTab)}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive 
                  ? "bg-indigo-600 text-white" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
