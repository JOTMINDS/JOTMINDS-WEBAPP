import { useState } from 'react';
import { Menu, X, LogOut, BookOpen } from 'lucide-react';
import { Button } from './ui/button';
import { FrameworkInfo } from './FrameworkInfo';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from './ui/sheet';

interface MobileHeaderMenuProps {
  onLogout: () => void;
  userRole: string;
}

export function MobileHeaderMenu({ onLogout, userRole }: MobileHeaderMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Access settings, framework information, and account options
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-6">
          <div className="pb-3 border-b">
            <FrameworkInfo 
              userRole={userRole as 'student' | 'teacher' | 'parent' | 'professional'} 
              trigger={
                <button className="flex items-center gap-3 py-2 px-2 hover:bg-gray-100 rounded-md transition-colors text-left w-full">
                  <BookOpen className="h-5 w-5" />
                  <span className="text-sm">About the Framework</span>
                </button>
              }
            />
          </div>

          <button
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="flex items-center gap-3 py-2 px-2 hover:bg-red-50 rounded-md transition-colors text-left text-red-600"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}