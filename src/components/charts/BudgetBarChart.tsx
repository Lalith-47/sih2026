import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { IndianRupee } from 'lucide-react';

interface BudgetBarChartProps {
  budget: string;
  spent: string;
  projectName?: string;
  height?: number;
}

function parseCrore(val: string): number {
  if (!val) return 0;
  // Handles "₹4,850 Cr", "4850 Cr", "₹4850Cr", plain numbers
  const cleaned = val.replace(/[₹,\s]/g, '').toLowerCase();
  const numMatch = cleaned.match(/[\d.]+/);
  if (!numMatch) return 0;
  return parseFloat(numMatch[0]);
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-2xl min-w-[180px]">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-800 pb-1.5">
          {label}
        </p>
        {payload.map((entry: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-4 text-xs mt-1">
            <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
              <span
                className="w-2.5 h-2.5 rounded-sm inline-block"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="font-mono font-bold text-white">₹{entry.value.toLocaleString()} Cr</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function BudgetBarChart({ budget, spent, projectName, height = 200 }: BudgetBarChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const budgetVal = parseCrore(budget);
  const spentVal = parseCrore(spent);
  const utilization = budgetVal > 0 ? Math.round((spentVal / budgetVal) * 100) : 0;
  const remaining = Math.max(0, budgetVal - spentVal);

  const data = [
    {
      name: projectName ? (projectName.length > 20 ? projectName.slice(0, 18) + '…' : projectName) : 'Project',
      'Budget Allocated': budgetVal,
      'Capital Spent': spentVal,
    },
  ];

  if (!isMounted) {
    return (
      <div
        className="flex items-center justify-center bg-gray-800/40 rounded-xl animate-pulse"
        style={{ height }}
      >
        <div className="text-xs text-gray-500 font-mono">Loading Budget Chart...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* KPI strip */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
          <span className="text-slate-500 dark:text-gray-400">Total Budget</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">{budget}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />
          <span className="text-slate-500 dark:text-gray-400">Spent</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">{spent}</span>
        </div>
        <div className="ml-auto flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-full border"
          style={{
            color: utilization > 90 ? '#f87171' : utilization > 70 ? '#fbbf24' : '#34d399',
            borderColor: utilization > 90 ? '#fca5a5' : utilization > 70 ? '#fcd34d' : '#6ee7b7',
            backgroundColor: utilization > 90 ? '#450a0a40' : utilization > 70 ? '#451a0340' : '#052e1640',
          }}
        >
          <IndianRupee className="w-3 h-3" />
          {utilization}% utilized
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(100, utilization)}%`,
            background: utilization > 90
              ? 'linear-gradient(90deg, #ef4444, #dc2626)'
              : utilization > 70
              ? 'linear-gradient(90deg, #f59e0b, #d97706)'
              : 'linear-gradient(90deg, #10b981, #059669)',
          }}
        />
      </div>

      {/* Bar chart */}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
            barCategoryGap="35%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.35} />
            <XAxis
              dataKey="name"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickLine={false}
              tickFormatter={(v) => `₹${v}Cr`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '8px' }}
              formatter={(value) => (
                <span className="text-xs font-medium text-gray-300 mr-2">{value}</span>
              )}
            />
            <Bar dataKey="Budget Allocated" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
            <Bar dataKey="Capital Spent" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={60} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
