import React, { useState, useEffect } from 'react';
import { 
  LogOut, 
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X
} from 'lucide-react';
import { cn } from './utils';
import { Button } from './button';
import { Badge } from './badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { User } from '../../types';
import { Logo } from '../Logo';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeVariant?: 'default' | 'secondary' | 'outline' | 'destructive';
}

export interface NavGroup {
  groupLabel?: string;
  items: NavItem[];
}

export interface CollapsibleSidebarProps {
  navGroups: NavGroup[];
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  user: User;
  onLogout?: () => void;
  brandTitle?: string;
  brandSubtitle?: string;
  className?: string;
  onOpenSettings?: () => void;
}

export function CollapsibleSidebar({
  navGroups,
  activeTab,
  setActiveTab,
  user,
  onLogout,
  brandTitle = 'JotMinds',
  brandSubtitle,
  className,
  onOpenSettings
}: CollapsibleSidebarProps) {
  // Load initial collapsed state from localStorage or default to expanded (false)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('jotminds_sidebar_collapsed');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  // Persist collapsed state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('jotminds_sidebar_collapsed', JSON.stringify(isCollapsed));
    } catch {
      // Ignore localStorage errors
    }
  }, [isCollapsed]);

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  return (
    <TooltipProvider delayDuration={200}>
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <Logo size="sm" />
          {brandSubtitle && (
            <span className="text-[11px] font-semibold text-muted-foreground border-l border-gray-300 dark:border-gray-700 pl-2 uppercase tracking-wider">
              {brandSubtitle}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          aria-label="Open sidebar navigation"
          className="text-gray-700 dark:text-gray-200"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Overlay Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileOpen(false)} 
          />
          <div className="relative flex-1 max-w-xs w-full bg-white dark:bg-gray-950 flex flex-col h-full z-10 shadow-2xl border-r border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <Logo size="md" />
                {brandSubtitle && (
                  <span className="text-xs font-semibold text-muted-foreground border-l border-gray-300 dark:border-gray-700 pl-2.5 uppercase tracking-wider">
                    {brandSubtitle}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {navGroups.map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-1">
                  {group.groupLabel && (
                    <div className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {group.groupLabel}
                    </div>
                  )}
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150",
                          isActive
                            ? "bg-gradient-to-r from-[#6B4C9A]/15 to-[#7B61FF]/15 text-[#6B4C9A] dark:text-purple-300 font-semibold border-l-4 border-[#6B4C9A]"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={cn("h-5 w-5", isActive ? "text-[#6B4C9A] dark:text-purple-300" : "text-gray-500")} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && (
                          <Badge variant={item.badgeVariant || 'secondary'} className="text-xs px-2 py-0.5">
                            {item.badge}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Mobile Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full gradient-aqua-violet flex items-center justify-center text-white font-bold text-sm">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-semibold text-sm truncate text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </div>
                {onLogout && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onLogout}
                    title="Log out"
                    className="text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Collapsible Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 transition-all duration-300 ease-in-out z-30 select-none",
          isCollapsed ? "w-20" : "w-64",
          className
        )}
      >
        {/* Sidebar Header & Toggle */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Logo size={isCollapsed ? "sm" : "md"} className="flex-shrink-0" />
            {!isCollapsed && brandSubtitle && (
              <span className="text-[11px] font-semibold text-muted-foreground border-l border-gray-300 dark:border-gray-700 pl-2.5 truncate uppercase tracking-wider">
                {brandSubtitle}
              </span>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:hover:text-white flex-shrink-0 rounded-lg"
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {group.groupLabel && !isCollapsed && (
                <div className="px-3 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2 truncate">
                  {group.groupLabel}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                const buttonEl = (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center rounded-xl transition-all duration-150 relative group",
                      isCollapsed ? "justify-center px-0 py-3" : "justify-between px-3.5 py-2.5",
                      isActive
                        ? "bg-gradient-to-r from-[#6B4C9A]/15 to-[#7B61FF]/15 text-[#6B4C9A] dark:text-purple-300 font-semibold shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-900/80 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          "transition-colors",
                          isCollapsed ? "h-5 w-5" : "h-4 w-4",
                          isActive ? "text-[#6B4C9A] dark:text-purple-300" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                        )}
                      />
                      {!isCollapsed && (
                        <span className="text-xs font-medium text-left leading-snug">{item.label}</span>
                      )}
                    </div>

                    {!isCollapsed && item.badge !== undefined && (
                      <Badge variant={item.badgeVariant || 'secondary'} className="text-[10px] px-2 py-0.5 font-bold">
                        {item.badge}
                      </Badge>
                    )}

                    {/* Active Bar Indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#6B4C9A] rounded-r-full" />
                    )}
                  </button>
                );

                if (isCollapsed) {
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>{buttonEl}</TooltipTrigger>
                      <TooltipContent side="right" className="flex items-center gap-2 font-medium">
                        {item.label}
                        {item.badge !== undefined && (
                          <Badge variant={item.badgeVariant || 'secondary'} className="text-[10px] px-1.5 py-0">
                            {item.badge}
                          </Badge>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return buttonEl;
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer User Profile */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <div className={cn("flex items-center justify-between", isCollapsed && "flex-col gap-2")}>
            <div className={cn("flex items-center gap-3 overflow-hidden", isCollapsed && "justify-center")}>
              <div className="w-9 h-9 rounded-full gradient-aqua-violet flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <p className="font-semibold text-xs truncate text-gray-900 dark:text-white leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground capitalize truncate leading-tight">
                    {user.role?.replace('_', ' ')}
                  </p>
                </div>
              )}
            </div>

            <div className={cn("flex items-center", isCollapsed ? "flex-col gap-1" : "gap-1")}>
              {onOpenSettings && (
                isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={onOpenSettings}
                        className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Settings</TooltipContent>
                  </Tooltip>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onOpenSettings}
                    title="Profile Settings"
                    className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                )
              )}

              {onLogout && (
                isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={onLogout}
                        className="h-8 w-8 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Log out</TooltipContent>
                  </Tooltip>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onLogout}
                    title="Log out"
                    className="h-8 w-8 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
