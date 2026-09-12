import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`p-2 rounded-xl border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 shadow-xs cursor-pointer ${
        isDark
          ? 'bg-gray-900/90 border-gray-800 text-amber-400 hover:border-amber-500/40 hover:bg-amber-950/30 hover:text-amber-300'
          : 'bg-white border-slate-200/90 text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/70 hover:text-indigo-700'
      }`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
