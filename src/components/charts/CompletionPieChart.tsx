import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CompletionPieChartProps {
  completedPercentage: number;
  height?: number;
}

export default function CompletionPieChart({
  completedPercentage,
  height = 240,
}: CompletionPieChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const safeCompleted = Math.min(100, Math.max(0, completedPercentage));
  const remaining = Math.max(0, 100 - safeCompleted);

  const data = [
    { name: 'Completed Work', value: safeCompleted, color: '#10b981' }, // emerald-500
    { name: 'Remaining Scope', value: remaining, color: '#374151' }, // gray-700
  ];

  if (!isMounted) {
    return (
      <div
        className="flex items-center justify-center bg-gray-800/40 rounded-xl animate-pulse"
        style={{ height }}
      >
        <div className="text-xs text-gray-500 font-mono">Loading Chart Visualization...</div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="bg-gray-900 border border-gray-700 px-3 py-2 rounded-lg shadow-xl text-xs">
          <p className="font-semibold text-white flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: item.payload.color }}
            />
            {item.name}
          </p>
          <p className="text-emerald-400 font-mono text-sm mt-0.5">{item.value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              stroke="#1f2937"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Center Percentage Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-4">
        <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
          {safeCompleted}%
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
          Completed
        </span>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          <span className="text-gray-300 font-medium">Completed ({safeCompleted}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gray-700" />
          <span className="text-gray-400 font-medium">Remaining ({remaining}%)</span>
        </div>
      </div>
    </div>
  );
}

