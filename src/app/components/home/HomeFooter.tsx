import React from 'react';
import { Linkedin, Youtube } from 'lucide-react';
import { Logo } from '../Logo';

interface HomeFooterProps {
  onNavClick: (sectionId: string) => void;
  onViewPrivacyPolicy?: () => void;
  onViewTermsOfUse?: () => void;
  onViewContact?: () => void;
}

// Minimal X / Twitter icon component
const XTwitterIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const HomeFooter: React.FC<HomeFooterProps> = ({
  onNavClick,
  onViewPrivacyPolicy,
  onViewTermsOfUse,
  onViewContact,
}) => {
  const footerLinks = [
    { label: 'Individuals', onClick: () => onNavClick('journey') },
    { label: 'Education', onClick: () => onNavClick('journey') },
    { label: 'Professionals', onClick: () => onNavClick('journey') },
    { label: 'Organizations', onClick: () => onNavClick('journey') },
    { label: 'About', onClick: () => onNavClick('what-it-enables') },
    { label: 'Help Center', onClick: () => onViewContact && onViewContact() },
    { label: 'Privacy Policy', onClick: () => onViewPrivacyPolicy && onViewPrivacyPolicy() },
    { label: 'Terms of Use', onClick: () => onViewTermsOfUse && onViewTermsOfUse() },
  ];

  return (
    <footer className="bg-[#090A1A] text-slate-400 py-10 sm:py-12 border-t border-slate-900">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8">
          
          {/* Left: Logo & Tagline */}
          <div className="flex flex-col items-start select-none">
            <div className="bg-white/95 rounded-lg px-2 py-1 inline-block">
              <Logo size="sm" className="h-6 w-auto" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium tracking-tight mt-1.5">
              Human Intelligence. Made Actionable.
            </span>
          </div>

          {/* Center: Horizontal Navigation Links */}
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-300" aria-label="Footer Navigation">
            {footerLinks.map((link) => (
              <button
                key={link.label}
                onClick={link.onClick}
                className="hover:text-white transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right: Social Icons */}
          <div className="flex items-center gap-3">
            <a
              href="https://linkedin.com/company/jotminds"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-[#4E35DE] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              aria-label="JotMinds on LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href="https://youtube.com/@jotminds"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-[#4E35DE] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              aria-label="JotMinds on YouTube"
            >
              <Youtube className="w-4 h-4" />
            </a>
            <a
              href="https://x.com/jotminds"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-[#4E35DE] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              aria-label="JotMinds on X"
            >
              <XTwitterIcon className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

        {/* Bottom Row: Copyright */}
        <div className="pt-6 border-t border-slate-900 flex justify-end">
          <p className="text-[11px] sm:text-xs text-slate-500 font-normal">
            © 2026 JotMinds. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};
