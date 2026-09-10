import React from 'react';
import { Globe, Check } from 'lucide-react';
import { useI18n, Locale, LOCALE_LABELS } from '@/lib/i18n-context';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  const locales: { id: Locale; label: string; short: string }[] = [
    { id: 'en', label: 'English', short: 'EN' },
    { id: 'hi', label: 'हिन्दी', short: 'हि' },
    { id: 'kn', label: 'ಕನ್ನಡ', short: 'ಕ' },
  ];

  const cycleLocale = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const order: Locale[] = ['en', 'hi', 'kn'];
    const currentIndex = order.indexOf(locale);
    const nextLocale = order[(currentIndex + 1) % order.length];
    setLocale(nextLocale);
  };

  const handleSelect = (e: React.MouseEvent, targetLocale: Locale) => {
    e.preventDefault();
    e.stopPropagation();
    setLocale(targetLocale);
  };

  return (
    <div 
      className="inline-flex items-center p-1 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/90 backdrop-blur-md shadow-sm transition-all"
      role="group"
      aria-label="Language Switcher"
    >
      {/* 1-Click Cycle Button on Globe Icon */}
      <button
        type="button"
        onClick={cycleLocale}
        title={`Current: ${LOCALE_LABELS[locale]?.label}. Click to cycle language.`}
        aria-label="Cycle language"
        className="flex items-center justify-center w-7 h-7 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer mr-1"
      >
        <Globe className="w-4 h-4 transition-transform hover:scale-110 active:rotate-45" />
      </button>

      {/* Segmented Language Pills - 1-Click Instant Switching */}
      <div className="flex items-center gap-1">
        {locales.map((item) => {
          const isSelected = locale === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={(e) => handleSelect(e, item.id)}
              aria-pressed={isSelected}
              title={`Switch language to ${item.label}`}
              className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                isSelected
                  ? 'bg-emerald-500 text-gray-950 shadow-md shadow-emerald-500/25 font-extrabold scale-105'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800/80 font-medium'
              }`}
            >
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.short}</span>
              {isSelected && <span className="w-1 h-1 rounded-full bg-gray-950 inline-block ml-0.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
