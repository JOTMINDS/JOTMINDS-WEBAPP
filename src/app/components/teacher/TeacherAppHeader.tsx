import { Menu, BarChart3, Shield, Activity, Brain, Settings } from 'lucide-react';
import { User } from '../../types';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Logo } from '../Logo';

interface TeacherAppHeaderProps {
  user: User;
  onLogout: () => void;
  onViewAnalytics?: () => void;
  onViewPrivacy?: () => void;
  onViewEngagement?: () => void;
  onViewTeacherIntelligence?: () => void;
  onViewSettings?: () => void;
}

export function TeacherAppHeader({ user, onLogout, onViewAnalytics, onViewPrivacy, onViewEngagement, onViewTeacherIntelligence, onViewSettings }: TeacherAppHeaderProps) {
  return (
    <header className="h-14 bg-white border-b border-border px-4 flex items-center justify-between sticky top-0 z-10">
      {/* Left: Logo + Avatar */}
      <div className="flex items-center gap-3">
        {/* JotMinds Logo */}
        <Logo size="sm" />

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white text-[13px] font-semibold">
          {user.name.charAt(0)}
        </div>
      </div>

      {/* Right: Menu Icon */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent>
          <div className="flex flex-col gap-4 py-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.school && (
                <p className="text-sm text-muted-foreground">{user.school}</p>
              )}
            </div>
            <div className="pt-4 border-t space-y-2">
              {onViewTeacherIntelligence && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={onViewTeacherIntelligence}
                  style={{ borderColor: '#5B7DB1', color: '#5B7DB1' }}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Teacher Intelligence
                </Button>
              )}
              {onViewAnalytics && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={onViewAnalytics}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Classroom Analytics
                </Button>
              )}
              {onViewEngagement && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={onViewEngagement}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  My Engagement
                </Button>
              )}
              {onViewPrivacy && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={onViewPrivacy}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy Settings
                </Button>
              )}
              {onViewSettings && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={onViewSettings}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={onLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
