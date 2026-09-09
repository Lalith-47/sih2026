import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Layers, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  Edit3, 
  Mic, 
  FileSpreadsheet, 
  FileText, 
  Activity, 
  UserCheck, 
  HardHat,
  Flag
} from 'lucide-react';
import { getProjectById } from '@/data/mockProjects';
import { Project } from '@/types/project';
import ProgressLineChart from '@/components/charts/ProgressLineChart';
import CompletionPieChart from '@/components/charts/CompletionPieChart';
import { getStatusBadge } from '@/components/public/ProjectCard';

export default function ProjectDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && typeof id === 'string') {
      const found = getProjectById(id);
      if (found) {
        setProject({ ...found });
      }
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-mono">Loading Project Analytics & S-Curve Telemetry...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Project Not Found</h2>
        <p className="text-xs text-gray-400">
          The requested infrastructure project could not be located in the database.
        </p>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-800 text-gray-300 hover:text-white border border-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects Portal</span>
        </Link>
      </div>
    );
  }

  const statusInfo = getStatusBadge(project.status);
  const StatusIcon = statusInfo.icon;
  const variance = Math.round((project.currentProgress - project.plannedProgress) * 10) / 10;

  return (
    <>
      <Head>
        <title>{project.name} - Project Analytics & Progress | InfraTrack 2026</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Navigation / Header Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Public Directory</span>
          </Link>

          <Link
            href={`/admin/${project.id}/update`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-gray-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/20 transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Submit Field Update (Admin)</span>
          </Link>
        </div>

        {/* Project Header Banner */}
        <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-gray-900 text-emerald-400 border border-gray-700">
                  <Layers className="w-3.5 h-3.5" />
                  {project.wbsCode}
                </span>
                <span className="text-xs font-mono text-gray-400 px-2 py-0.5 rounded bg-gray-900/60 border border-gray-700/60">
                  {project.code}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}
                >
                  <StatusIcon className="w-3.5 h-3.5" />
                  {statusInfo.label}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {project.name}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-400 pt-1">
                <span className="text-gray-300 font-medium">{project.department}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  {project.location}
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-mono font-medium">{project.category}</span>
              </div>
            </div>

            {/* Overall Progress Stat Box */}
            <div className="flex items-center gap-6 bg-gray-900/90 border border-gray-700/80 p-4 rounded-2xl">
              <div>
                <span className="text-[10px] uppercase font-semibold text-gray-400 block tracking-wider">
                  Actual Physical Progress
                </span>
                <span className="text-3xl font-mono font-extrabold text-emerald-400 mt-0.5 block">
                  {project.currentProgress}%
                </span>
              </div>
              <div className="border-l border-gray-800 pl-6">
                <span className="text-[10px] uppercase font-semibold text-gray-400 block tracking-wider">
                  Planned Baseline
                </span>
                <span className="text-3xl font-mono font-extrabold text-blue-400 mt-0.5 block">
                  {project.plannedProgress}%
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed border-t border-gray-700/70 pt-4">
            {project.description}
          </p>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 shadow-lg">
            <span className="text-xs font-semibold text-gray-400 block flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              Schedule Variance
            </span>
            <div
              className={`text-2xl font-mono font-extrabold mt-1 ${
                variance >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {variance >= 0 ? `+${variance}%` : `${variance}%`}
            </div>
            <span className="text-[11px] text-gray-500 mt-0.5 block">
              {variance >= 0 ? 'Ahead of baseline target' : 'Behind planned velocity'}
            </span>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 shadow-lg">
            <span className="text-xs font-semibold text-gray-400 block flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
              Capital Budget
            </span>
            <div className="text-2xl font-mono font-extrabold text-white mt-1">
              {project.budget}
            </div>
            <span className="text-[11px] text-gray-500 mt-0.5 block">
              Spent to date: {project.spent}
            </span>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 shadow-lg">
            <span className="text-xs font-semibold text-gray-400 block flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Baseline Timeline
            </span>
            <div className="text-xs font-mono font-bold text-gray-200 mt-2 space-y-1">
              <div>Start: {project.baselineStartDate}</div>
              <div>End: {project.baselineEndDate}</div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 shadow-lg">
            <span className="text-xs font-semibold text-gray-400 block flex items-center gap-1.5">
              <HardHat className="w-3.5 h-3.5 text-purple-400" />
              Site In-Charge
            </span>
            <div className="text-sm font-bold text-white mt-1 truncate">
              {project.supervisor}
            </div>
            <span className="text-[11px] text-gray-500 mt-0.5 block truncate">
              EPC: {project.contractor}
            </span>
          </div>
        </div>

        {/* Visualizations Grid: S-Curve Line Graph (Left) & Completion Pie Chart (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* S-Curve Line Graph (Spans 2 columns) */}
          <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-700/80 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Progress S-Curve: Actual vs. Planned Baseline</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Chronological timeline tracking actual physical execution against targeted milestones.
                </p>
              </div>
            </div>

            {/* Line Chart */}
            <ProgressLineChart timelineData={project.timelineData} height={320} />
          </div>

          {/* Pie Chart (Spans 1 column) */}
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
            <div className="border-b border-gray-700/80 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Overall % Completion</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Total work scope completion vs. remaining deliverables.
              </p>
            </div>

            {/* Pie Chart Component */}
            <CompletionPieChart completedPercentage={project.currentProgress} height={230} />

            {/* Extra summary block */}
            <div className="pt-3 border-t border-gray-700/60 text-xs text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>Current Status:</span>
                <span className="font-semibold text-white">{statusInfo.label}</span>
              </div>
              <div className="flex justify-between">
                <span>Remaining Scope:</span>
                <span className="font-mono text-gray-300 font-bold">
                  {Math.max(0, 100 - project.currentProgress)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed Section */}
        <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-700 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span>Activity Feed & Supervisor Logs</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Chronological ledger of field progress submissions, voice transcripts, and WBS imports.
              </p>
            </div>

            <span className="text-xs font-mono text-gray-400 bg-gray-900 px-3 py-1.5 rounded-xl border border-gray-700">
              {project.recentUpdates.length} Recorded Entries
            </span>
          </div>

          <div className="space-y-4">
            {project.recentUpdates.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-xs">
                No activity logs currently registered for this project.
              </div>
            ) : (
              project.recentUpdates.map((update, idx) => (
                <div
                  key={update.id}
                  className="relative pl-6 sm:pl-8 pb-6 border-l-2 border-gray-700 last:border-l-0 last:pb-0 group"
                >
                  {/* Channel icon marker */}
                  <div
                    className={`absolute -left-[15px] top-0 w-7 h-7 rounded-full flex items-center justify-center border-2 border-gray-800 shadow-md ${
                      update.channel === 'VOICE'
                        ? 'bg-purple-600 text-white'
                        : update.channel === 'EXCEL'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {update.channel === 'VOICE' ? (
                      <Mic className="w-3.5 h-3.5" />
                    ) : update.channel === 'EXCEL' ? (
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                    ) : (
                      <FileText className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Card Container */}
                  <div className="bg-gray-900/80 border border-gray-700/80 rounded-2xl p-4 shadow-sm space-y-2 hover:border-gray-600 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-white">{update.author}</span>
                        <span className="text-gray-400">({update.role})</span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                            update.channel === 'VOICE'
                              ? 'bg-purple-950/80 text-purple-300 border-purple-800'
                              : update.channel === 'EXCEL'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                              : 'bg-blue-950/80 text-blue-300 border-blue-800'
                          }`}
                        >
                          {update.channel}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        {update.progressDelta > 0 && (
                          <span className="font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                            +{update.progressDelta}%
                          </span>
                        )}
                        <span className="text-gray-400 font-mono text-[11px]">
                          {update.timestamp}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed">{update.notes}</p>

                    {update.tags && update.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {update.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

