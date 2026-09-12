import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useI18n, Locale } from '@/lib/i18n-context';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const locales: { id: Locale; label: string; native: string; code: string }[] = [
    { id: 'en', label: 'English', native: 'English', code: 'EN' },
    { id: 'hi', label: 'Hindi', native: 'हिन्दी', code: 'HI' },
    { id: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', code: 'KN' },
  ];

  const current = locales.find((l) => l.id === locale) || locales[0];

  // Robust outside-click handling
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 20);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectLanguage = (targetLocale: Locale, e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setLocale(targetLocale);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left z-50" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title="Select Language / भाषा चुनें / ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-150 shadow-xs cursor-pointer ${
          isOpen
            ? 'border-emerald-500/60 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/50 ring-2 ring-emerald-500/20'
            : 'border-slate-200/90 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/70 hover:text-emerald-700 dark:bg-gray-900/90 dark:border-gray-800 dark:text-gray-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300'
        }`}
      >
        <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <span className="font-medium">{current.native}</span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 dark:text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 mt-2 w-48 rounded-2xl bg-white/95 dark:bg-gray-900/95 border border-slate-200/90 dark:border-gray-800 shadow-xl shadow-slate-900/10 dark:shadow-black/50 p-1.5 z-[100] animate-fadeIn backdrop-blur-md"
        >
          <div className="px-2.5 py-1.5 mb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 border-b border-slate-100 dark:border-gray-800/80">
            Select Language
          </div>
          <div className="space-y-0.5">
            {locales.map((item) => {
              const isSelected = locale === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(e) => selectLanguage(item.id, e)}
                  onTouchStart={(e) => selectLanguage(item.id, e)}
                  onClick={(e) => selectLanguage(item.id, e)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500 text-white font-bold shadow-xs shadow-emerald-500/20'
                      : 'text-slate-700 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-white/25 text-white'
                          : 'bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400'
                      }`}
                    >
                      {item.code}
                    </span>
                    <div className="flex flex-col text-left leading-tight">
                      <span className="text-xs font-semibold">{item.native}</span>
                      {item.native !== item.label && (
                        <span
                          className={`text-[10px] font-normal ${
                            isSelected ? 'text-white/80' : 'text-slate-400 dark:text-gray-500'
                          }`}
                        >
                          {item.label}
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
