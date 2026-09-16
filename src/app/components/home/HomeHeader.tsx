import React, { useState } from 'react';
import { Globe, ArrowRight, Menu, X } from 'lucide-react';
import { Logo } from '../Logo';
import { LanguageSelector } from '../ui/LanguageSelector';

interface HomeHeaderProps {
  onGetStarted: () => void;
  onNavClick: (sectionId: string) => void;
  onSupervisorPortal?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  onGetStarted,
  onNavClick,
  onSupervisorPortal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Individuals', sectionId: 'journey' },
    { label: 'Education', sectionId: 'journey' },
    { label: 'Professionals', sectionId: 'journey' },
    { label: 'Organizations', sectionId: 'journey', action: onSupervisorPortal },
    { label: 'Assessments', sectionId: 'how-it-works' },
    { label: 'About', sectionId: 'what-it-enables' },
  ];

  const handleItemClick = (item: { label: string; sectionId: string; action?: () => void }) => {
    setMobileMenuOpen(false);
    if (item.action && item.label === 'Organizations') {
      item.action();
    } else {
      onNavClick(item.sectionId);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
        {/* Logo & Tagline */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex flex-col items-start cursor-pointer select-none shrink-0 group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          aria-label="JotMinds Home"
        >
          <Logo size="md" className="h-7 sm:h-8 w-auto transition-transform group-hover:scale-[1.02]" />
          <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium tracking-tight mt-0.5">
            Human Intelligence. Made Actionable.
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8" aria-label="Main Navigation">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleItemClick(item)}
              className="text-[13px] font-medium text-slate-600 hover:text-[#4E35DE] transition-colors cursor-pointer py-1"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Utilities */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Language Selector */}
          <div className="hidden sm:flex items-center">
            <LanguageSelector variant="minimal" />
          </div>

          {/* Primary CTA */}
          <button
            onClick={onGetStarted}
            className="bg-[#4E35DE] hover:bg-[#412dc4] text-white text-[13px] font-semibold px-4 sm:px-5 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-all duration-150 cursor-pointer active:scale-[0.98]"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Navigation</span>
            <LanguageSelector />
          </div>
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleItemClick(item)}
                className="w-full text-left py-2.5 px-3 rounded-md text-sm font-medium text-slate-700 hover:text-[#4E35DE] hover:bg-slate-50 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="pt-2">
            <button
              onClick={() => { setMobileMenuOpen(false); onGetStarted(); }}
              className="w-full bg-[#4E35DE] hover:bg-[#412dc4] text-white text-sm font-semibold py-3 rounded-lg flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
