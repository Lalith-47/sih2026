import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Building2, 
  PlusCircle, 
  Search, 
  Layers, 
  Edit3, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck,
  TrendingUp,
  SlidersHorizontal,
  Calendar
} from 'lucide-react';
import { getProjects } from '@/data/mockProjects';
import { Project, ProjectStatus } from '@/types/project';
import { getStatusBadge } from '@/components/public/ProjectCard';
import { useSession } from '@/lib/auth-client';

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    setProjects(getProjects());

    if (router.query.created) {
      setToastMessage(`Project ${router.query.created} was successfully initialized with baseline.`);
      const timer = setTimeout(() => setToastMessage(''), 6000);
      return () => clearTimeout(timer);
    }
  }, [router.query]);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.wbsCode.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalProjects = projects.length;
  const onTrackCount = projects.filter((p) => p.status === 'ON_TRACK').length;
  const delayedCount = projects.filter((p) => p.status === 'DELAYED' || p.status === 'AT_RISK').length;
  const completedCount = projects.filter((p) => p.status === 'COMPLETED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-950/80 border border-blue-800 text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Admin Project Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Monitor capital expenditures, review daily supervisor submissions, and update baseline parameters.
          </p>
        </div>

        {/* CTA: Create New Project */}
        <Link
          href="/admin/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-gray-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4 text-gray-950" />
          <span>Create New Project</span>
        </Link>
      </div>

      {/* Success Toast */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-center justify-between shadow-xl animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage('')}
            className="text-emerald-400 hover:text-white font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Officer Auth Status Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
        session?.user 
          ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' 
          : 'bg-gray-900/60 border-gray-800 text-gray-400'
      }`}>
        <div className="flex items-center gap-2.5">
          <span className={`w-2 h-2 rounded-full ${session?.user ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          {session?.user ? (
            <span>
              Authenticated as <strong className="text-white font-mono">{session.user.name || session.user.email}</strong> • Verified Officer Credentials Active
            </span>
          ) : (
            <span>
              Operating in <strong className="text-gray-300 font-mono">Guest Mode</strong> • Sign in with Better Auth to link project baseline records to your officer ID.
            </span>
          )}
        </div>
        {!session?.user && (
          <Link
            href="/login"
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-semibold text-[11px] transition-colors"
          >
            Officer Sign In
          </Link>
        )}
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 shadow-md">
          <span className="text-xs font-semibold text-gray-400">Total Portfolio</span>
          <div className="text-2xl font-mono font-extrabold text-white mt-1">{totalProjects}</div>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Managed capital assets</span>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 shadow-md">
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            On Schedule
          </span>
          <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">{onTrackCount}</div>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Zero schedule variance</span>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 shadow-md">
          <span className="text-xs font-semibold text-rose-400 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Delayed / At Risk
          </span>
          <div className="text-2xl font-mono font-extrabold text-rose-400 mt-1">{delayedCount}</div>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Requires intervention</span>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 shadow-md">
          <span className="text-xs font-semibold text-blue-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Completed
          </span>
          <div className="text-2xl font-mono font-extrabold text-blue-400 mt-1">{completedCount}</div>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Commissioned & handed over</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-800 border border-gray-700 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects or WBS code..."
            className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'ON_TRACK', 'AT_RISK', 'DELAYED', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-gray-700 text-white border border-gray-600 font-bold'
                  : 'text-gray-400 hover:text-white bg-gray-900 border border-gray-800'
              }`}
            >
              {st === 'ALL' ? 'All' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-900/80 text-gray-400 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-700">
              <tr>
                <th className="px-6 py-4">Project & WBS Details</th>
                <th className="px-6 py-4">Ministry / Sector</th>
                <th className="px-6 py-4">Baseline Timeline</th>
                <th className="px-6 py-4">Progress (% Actual / Target)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/60">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No infrastructure projects found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((proj) => {
                  const statusInfo = getStatusBadge(proj.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr
                      key={proj.id}
                      className="hover:bg-gray-750/50 transition-colors group"
                    >
                      {/* Project Name & WBS */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">
                          {proj.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[11px] text-emerald-400 bg-gray-900 px-2 py-0.5 rounded border border-gray-700">
                            {proj.wbsCode}
                          </span>
                          <span className="text-[11px] text-gray-400">{proj.code}</span>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4">
                        <div className="text-gray-200 font-medium">{proj.category}</div>
                        <div className="text-[11px] text-gray-400 truncate max-w-[200px]">
                          {proj.department}
                        </div>
                      </td>

                      {/* Timeline */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-gray-300 font-mono text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-gray-500" />
                          <span>{proj.baselineStartDate}</span>
                          <span className="text-gray-500">&rarr;</span>
                          <span className="text-emerald-400">{proj.baselineEndDate}</span>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          Budget: <span className="text-gray-300 font-mono font-semibold">{proj.budget}</span>
                        </div>
                      </td>

                      {/* Progress bar */}
                      <td className="px-6 py-4 min-w-[180px]">
                        <div className="flex items-center justify-between mb-1 text-[11px]">
                          <span className="font-mono font-bold text-white">{proj.currentProgress}%</span>
                          <span className="text-gray-500 font-mono">/ {proj.plannedProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-900 rounded-full h-2 border border-gray-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              proj.status === 'DELAYED'
                                ? 'bg-rose-500'
                                : proj.status === 'AT_RISK'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${proj.currentProgress}%` }}
                          />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusInfo.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/${proj.id}/update`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-700/70 text-emerald-300 hover:bg-emerald-900 text-xs font-semibold transition-colors"
                            title="Add daily progress via Excel, Text, or Voice"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Update Progress</span>
                          </Link>

                          <Link
                            href={`/projects/${proj.id}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700 text-xs font-medium transition-colors"
                            title="View Public Analytics"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

