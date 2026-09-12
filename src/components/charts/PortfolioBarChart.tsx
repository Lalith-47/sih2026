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
  ReferenceLine,
  Cell,
} from 'recharts';
import { Project } from '@/types/project';

interface PortfolioBarChartProps {
  projects: Project[];
  height?: number;
}

const STATUS_COLORS: Record<string, string> = {
  ON_TRACK: '#10b981',
  AT_RISK: '#f59e0b',
  DELAYED: '#ef4444',
  COMPLETED: '#3b82f6',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const actual = payload.find((p: any) => p.dataKey === 'actualProgress')?.value ?? 0;
    const planned = payload.find((p: any) => p.dataKey === 'plannedProgress')?.value ?? 0;
    const variance = +(actual - planned).toFixed(1);

    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-2xl min-w-[220px]">
        <p className="text-xs font-bold text-white mb-2 border-b border-gray-800 pb-1.5 truncate">{label}</p>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
              Actual Progress
            </span>
            <span className="font-mono font-bold text-white">{actual}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
              Planned Baseline
            </span>
            <span className="font-mono font-bold text-white">{planned}%</span>
          </div>
          <div className="flex justify-between items-center pt-1 mt-1 border-t border-gray-800">
            <span className="text-gray-400">Variance</span>
            <span
              className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                variance >= 0
                  ? 'bg-emerald-950/60 text-emerald-400'
                  : 'bg-rose-950/60 text-rose-400'
              }`}
            >
              {variance >= 0 ? `+${variance}%` : `${variance}%`}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function PortfolioBarChart({ projects, height = 300 }: PortfolioBarChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        className="flex items-center justify-center bg-gray-800/40 rounded-xl animate-pulse"
        style={{ height }}
      >
        <div className="text-xs text-gray-500 font-mono">Loading Portfolio Chart...</div>
      </div>
    );
  }

  const data = projects.map((p) => ({
    name: p.code || p.name.slice(0, 12),
    fullName: p.name,
    actualProgress: p.currentProgress,
    plannedProgress: p.plannedProgress,
    status: p.status,
  }));

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 16, left: -8, bottom: 20 }}
          barCategoryGap="25%"
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.35} vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            tickLine={false}
            angle={-25}
            textAnchor="end"
            height={48}
          />
          <YAxis
            domain={[0, 100]}
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: '10px' }}
            formatter={(value) => (
              <span className="text-xs font-medium text-gray-300 mr-3">
                {value === 'actualProgress' ? 'Actual (%)' : 'Planned (%)'}
              </span>
            )}
          />
          <Bar dataKey="plannedProgress" name="plannedProgress" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={28} opacity={0.6} />
          <Bar dataKey="actualProgress" name="actualProgress" radius={[3, 3, 0, 0]} maxBarSize={28}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#10b981'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
