import React from 'react';
import { useAuth } from '../AuthContext';
import { Menu, Search, Bell, Moon, Sun, User, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { useTheme } from '../ui/theme-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface TopNavProps {
  title: string;
  onMenuClick?: () => void;
  onLogout: () => void;
}

export function TopNav({ title, onMenuClick, onLogout }: TopNavProps) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
          {title.replace('-', ' ')}
        </h2>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Mock Search / Command Palette Trigger */}
        <Button variant="outline" className="hidden sm:flex items-center text-muted-foreground w-64 justify-start px-3 h-9">
          <Search className="mr-2 h-4 w-4" />
          <span className="text-sm">Search platform...</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>

        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                <User className="h-4 w-4 text-indigo-700 dark:text-indigo-300" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'Super Admin'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'admin@jotminds.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
