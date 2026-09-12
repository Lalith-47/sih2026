import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  MapPin, 
  Calendar, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { Project, ProjectStatus } from '@/types/project';

interface ProjectCardProps {
  project: Project;
}

export const getStatusBadge = (status: ProjectStatus) => {
  switch (status) {
    case 'ON_TRACK':
      return {
        label: 'On Track',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-700/60',
        icon: CheckCircle2,
      };
    case 'AT_RISK':
      return {
        label: 'At Risk',
        color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/80 dark:text-amber-400 dark:border-amber-700/60',
        icon: AlertTriangle,
      };
    case 'DELAYED':
      return {
        label: 'Delayed',
        color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-400 dark:border-rose-700/60',
        icon: Clock,
      };
    case 'COMPLETED':
      return {
        label: 'Completed',
        color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/80 dark:text-blue-400 dark:border-blue-700/60',
        icon: ShieldCheck,
      };
  }
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const statusInfo = getStatusBadge(project.status);
  const StatusIcon = statusInfo.icon;
  const variance = Math.round((project.currentProgress - project.plannedProgress) * 10) / 10;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 shadow-lg hover:border-gray-600 hover:shadow-2xl hover:shadow-emerald-950/20 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top meta row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-gray-900/90 text-gray-300 border border-gray-700">
            <Layers className="w-3 h-3 text-emerald-400" />
            {project.wbsCode}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            {statusInfo.label}
          </span>
        </div>

        {/* Project Title */}
        <Link href={`/projects/${project.id}`}>
          <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
            {project.name}
          </h3>
        </Link>

        {/* Department & Location */}
        <p className="text-xs text-gray-400 mt-1.5 line-clamp-1">{project.department}</p>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
          <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
          <span className="truncate">{project.location}</span>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-gray-400 mt-3 line-clamp-2 leading-relaxed border-t border-gray-700/50 pt-3">
          {project.description}
        </p>

        {/* Progress Section */}
        <div className="mt-4 pt-3 border-t border-gray-700/60">
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-xs font-medium text-gray-300">Physical Progress</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-bold text-white">
                {project.currentProgress}%
              </span>
              <span className="text-[11px] text-gray-500 font-mono">
                / {project.plannedProgress}% target
              </span>
            </div>
          </div>

          {/* Dual progress bar */}
          <div className="relative w-full h-2.5 bg-gray-900 rounded-full overflow-hidden border border-gray-700">
            {/* Planned ghost bar */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-blue-500/30"
              style={{ width: `${project.plannedProgress}%` }}
              title={`Planned: ${project.plannedProgress}%`}
            />
            {/* Actual fill */}
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                project.status === 'DELAYED'
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                  : project.status === 'AT_RISK'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: `${project.currentProgress}%` }}
            />
          </div>

          {/* Variance tag */}
          <div className="flex items-center justify-between text-[11px] mt-2">
            <span className="text-gray-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-blue-400" />
              Schedule Variance:
            </span>
            <span
              className={`font-mono font-semibold ${
                variance >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {variance >= 0 ? `+${variance}% (Ahead)` : `${variance}% (Behind)`}
            </span>
          </div>
        </div>

        {/* Timeline Dates */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 rounded-xl bg-gray-900/60 border border-gray-700/50 text-[11px]">
          <div>
            <span className="text-gray-500 block">Baseline Start</span>
            <span className="text-gray-300 font-mono font-medium flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3 text-gray-400" />
              {project.baselineStartDate}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block">Target Completion</span>
            <span className="text-gray-300 font-mono font-medium flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3 text-emerald-400" />
              {project.baselineEndDate}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3 border-t border-gray-700/70 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">
            Budget
          </span>
          <p className="text-xs font-mono font-bold text-gray-200">{project.budget}</p>
        </div>

        <Link
          href={`/projects/${project.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 group-hover:translate-x-0.5 transition-transform"
        >
          <span>View Analytics</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

