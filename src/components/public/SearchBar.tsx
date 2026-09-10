import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  categoryFilter: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

export default function SearchBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  categories,
}: SearchBarProps) {
  const { t } = useI18n();

  const statuses = [
    { label: t('dashboard.filterAll', 'All Statuses'), value: 'ALL' },
    { label: t('dashboard.filterOnTrack', 'On Track'), value: 'ON_TRACK' },
    { label: t('dashboard.filterAtRisk', 'At Risk'), value: 'AT_RISK' },
    { label: t('dashboard.filterDelayed', 'Delayed'), value: 'DELAYED' },
    { label: t('dashboard.filterCompleted', 'Completed'), value: 'COMPLETED' },
  ];

  return (
    <div className="bg-white/90 dark:bg-gray-800/80 border border-slate-200 dark:border-gray-700/80 rounded-2xl p-4 shadow-lg dark:shadow-xl backdrop-blur-sm space-y-4 transition-colors">
      {/* Top Search Field */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 dark:text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('dashboard.searchPlaceholder', 'Search by project name, WBS code, location, or department...')}
          className="w-full bg-slate-50 dark:bg-gray-900/90 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 pl-11 pr-10 py-3 rounded-xl border border-slate-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm transition-all shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-200/80 dark:border-gray-700/50">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 mr-1.5 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('dashboard.colStatus', 'Status')}:</span>
          </span>
          {statuses.map((st) => (
            <button
              key={st.value}
              onClick={() => onStatusChange(st.value)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                statusFilter === st.value
                  ? 'bg-emerald-500 text-gray-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-slate-100 dark:bg-gray-900 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700/60'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="category-select" className="text-xs font-semibold text-slate-500 dark:text-gray-400">
            {t('dashboard.colMinistry', 'Sector')}:
          </label>
          <select
            id="category-select"
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="bg-slate-100 dark:bg-gray-900 text-slate-800 dark:text-gray-200 text-xs rounded-lg border border-slate-200 dark:border-gray-700 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="ALL">{t('dashboard.filterAll', 'All Sectors')}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
