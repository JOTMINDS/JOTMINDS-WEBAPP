import React, { useState, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Button } from './button';
import { toast } from 'sonner';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  gtCode: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', gtCode: 'en' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', gtCode: 'fr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', gtCode: 'es' },
  { code: 'tw', name: 'Twi', nativeName: 'Akan / Twi', flag: '🇬🇭', gtCode: 'ak' },
  { code: 'ee', name: 'Ewe', nativeName: 'Èʋegbe', flag: '🇬🇭', gtCode: 'ee' },
  { code: 'ga', name: 'Ga', nativeName: 'Gã', flag: '🇬🇭', gtCode: 'gaa' },
  { code: 'ha', name: 'Hausa', nativeName: 'Harshen Hausa', flag: '🇳🇬', gtCode: 'ha' },
];

export function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState<string>(() => {
    return localStorage.getItem('jm_selected_language') || 'en';
  });

  const selected = SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  const applyGoogleTranslate = (langObj: Language) => {
    try {
      const gtCode = langObj.gtCode || langObj.code;
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      const rootDomain = parts.length > 2 ? '.' + parts.slice(-2).join('.') : '.' + hostname;

      if (gtCode === 'en') {
        // Reset to English: Clear all translation cookies
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname};`;
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${hostname};`;
        if (hostname !== 'localhost') {
          document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${rootDomain};`;
          document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${rootDomain};`;
        }

        const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
        if (combo) {
          combo.value = '';
          combo.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const iframe = document.querySelector<HTMLIFrameElement>('.goog-te-banner-frame');
        if (iframe) {
          try {
            const innerDoc = iframe.contentDocument || iframe.contentWindow?.document;
            const restoreBtn = innerDoc?.getElementById(':1.restore');
            if (restoreBtn) restoreBtn.click();
          } catch (e) {}
        }

        setTimeout(() => {
          window.location.reload();
        }, 150);
        return;
      }

      // Setting active non-English translation
      document.cookie = `googtrans=/en/${gtCode}; path=/;`;
      document.cookie = `googtrans=/en/${gtCode}; path=/; domain=${hostname};`;
      document.cookie = `googtrans=/en/${gtCode}; path=/; domain=.${hostname};`;
      if (hostname !== 'localhost') {
        document.cookie = `googtrans=/en/${gtCode}; path=/; domain=${rootDomain};`;
        document.cookie = `googtrans=/en/${gtCode}; path=/; domain=.${rootDomain};`;
      }

      const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
      if (combo) {
        combo.value = gtCode;
        combo.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        // If combo is not yet loaded into DOM, wait briefly and fallback to reload
        setTimeout(() => {
          const lateCombo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
          if (lateCombo) {
            lateCombo.value = gtCode;
            lateCombo.dispatchEvent(new Event('change', { bubbles: true }));
          } else {
            window.location.reload();
          }
        }, 300);
      }
    } catch (e) {
      console.warn('[Translate] sync issue:', e);
    }
  };

  useEffect(() => {
    if (currentLang && currentLang !== 'en') {
      const chosen = SUPPORTED_LANGUAGES.find(l => l.code === currentLang);
      if (chosen) {
        const timer = setTimeout(() => applyGoogleTranslate(chosen), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [currentLang]);

  const handleSelectLanguage = (code: string) => {
    setCurrentLang(code);
    localStorage.setItem('jm_selected_language', code);
    const chosen = SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0];
    
    applyGoogleTranslate(chosen);

    toast.success(`Language set to ${chosen.name} (${chosen.nativeName})`);
    window.dispatchEvent(new CustomEvent('jm-language-changed', { detail: code }));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-2.5 rounded-xl border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs flex items-center gap-1.5 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-2xs"
          title="Change Interface Language"
        >
          <span className="text-sm">{selected.flag}</span>
          <span className="hidden sm:inline text-slate-700 dark:text-slate-200">{selected.name}</span>
          <Globe className="w-3.5 h-3.5 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 p-1.5 rounded-2xl shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Select Interface Language
        </div>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleSelectLanguage(lang.code)}
            className="flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 focus:bg-slate-50 dark:focus:bg-slate-900 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{lang.flag}</span>
              <div>
                <div className="font-semibold text-slate-900 dark:text-white leading-none">{lang.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{lang.nativeName}</div>
              </div>
            </div>
            {currentLang === lang.code && (
              <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
