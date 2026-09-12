import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
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
  Calendar,
  RefreshCw,
  FolderOpen,
  UserCheck,
  AlertCircle,
  Lock,
  Users,
  Trash2,
  X,
  Check,
  IndianRupee,
  MapPin,
  FileText
} from 'lucide-react';
import { Project, ProjectStatus } from '@/types/project';
import { getStatusBadge } from '@/components/public/ProjectCard';
import { useSession, getApiBaseUrl, apiFetch } from '@/lib/auth-client';
import { useI18n } from '@/lib/i18n-context';
import AuthGuard from '@/components/auth/AuthGuard';
import UserManagement from '@/components/admin/UserManagement';

export default function AdminDashboardPage() {
  return (
    <AuthGuard>
      <AdminDashboardContent />
    </AuthGuard>
  );
}

interface DashboardStats {
  totalProjects: number;
  onTrackCount: number;
  delayedCount: number;
  completedCount: number;
  totalBudgetCr: number;
  avgProgress: number;
  recentUpdates?: any[];
}

function AdminDashboardContent() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useI18n();

  const [officerRole, setOfficerRole] = useState<'ADMIN' | 'SUPERVISOR' | 'VIEWER'>('SUPERVISOR');
  const [activeTab, setActiveTab] = useState<'PROJECTS' | 'USERS'>('PROJECTS');
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    onTrackCount: 0,
    delayedCount: 0,
    completedCount: 0,
    totalBudgetCr: 0,
    avgProgress: 0,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'MINE'>('ALL');
  const [toastMessage, setToastMessage] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Edit Project Modal State
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    status: 'ON_TRACK' as ProjectStatus,
    currentProgress: 0,
    plannedProgress: 0,
    budget: '',
    spent: '',
    department: '',
    category: '',
    location: '',
    contractor: '',
    supervisor: '',
    baselineStartDate: '',
    baselineEndDate: '',
    description: '',
  });

  const apiBase = getApiBaseUrl();

  // 1. Fetch live DB data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      // Check session status & officer profile
      const meRes = await apiFetch(`${apiBase}/api/me`);
      if (meRes.status === 401) {
        router.replace('/login');
        return;
      }
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.user?.role) {
          setOfficerRole(meData.user.role);
        }
      }

      // Fetch live aggregated stats from PostgreSQL
      const statsRes = await apiFetch(`${apiBase}/api/dashboard/stats`);
      if (statsRes.status === 401) {
        router.replace('/login');
        return;
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      // Fetch live projects from PostgreSQL (scoped by role on backend)
      const projRes = await apiFetch(`${apiBase}/api/projects`);
      if (projRes.status === 401) {
        router.replace('/login');
        return;
      }
      if (projRes.ok) {
        const projData = await projRes.json();
        const liveProjects: Project[] = (projData.projects || []).map((bp: any) => ({
          id: bp.id,
          name: bp.name,
          code: bp.code,
          wbsCode: bp.wbsCode,
          department: bp.department,
          category: bp.category,
          location: bp.location,
          description: bp.description,
          baselineStartDate: typeof bp.baselineStartDate === 'string' ? bp.baselineStartDate.slice(0, 10) : '',
          baselineEndDate: typeof bp.baselineEndDate === 'string' ? bp.baselineEndDate.slice(0, 10) : '',
          currentProgress: bp.currentProgress || 0,
          plannedProgress: bp.plannedProgress || 0,
          status: bp.status,
          budget: bp.budget,
          spent: bp.spent,
          supervisor: bp.supervisor,
          contractor: bp.contractor,
          userId: bp.userId || undefined,
          timelineData: (bp.timelinePoints || []).map((tp: any) => ({
            period: tp.period,
            actual: tp.actual,
            planned: tp.planned,
          })),
          recentUpdates: (bp.recentUpdates || []).map((up: any) => ({
            id: up.id,
            channel: up.channel,
            notes: up.notes,
            author: up.author,
            role: up.role,
            progressDelta: up.progressDelta,
            tags: up.tags,
            timestamp: up.timestamp,
          })),
        }));

        setProjects(liveProjects);
      }
    } catch (err: any) {
      setFetchError('Failed to synchronize infrastructure telemetry. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [apiBase, router]);

  const openEditModal = (p: Project) => {
    setEditingProject(p);
    setEditError(null);
    setEditForm({
      name: p.name,
      status: p.status,
      currentProgress: p.currentProgress,
      plannedProgress: p.plannedProgress,
      budget: p.budget,
      spent: p.spent,
      department: p.department,
      category: p.category,
      location: p.location,
      contractor: p.contractor,
      supervisor: p.supervisor,
      baselineStartDate: p.baselineStartDate,
      baselineEndDate: p.baselineEndDate,
      description: p.description || '',
    });
  };

  const handleSaveProjectEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setSavingEdit(true);
    setEditError(null);
    try {
      const res = await apiFetch(`${apiBase}/api/projects/${editingProject.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.message || data.error || 'Failed to update project');
        return;
      }
      setToastMessage(`Corridor "${editForm.name}" details updated successfully in PostgreSQL ledger.`);
      setEditingProject(null);
      fetchData();
    } catch (err: any) {
      setEditError(err.message || 'Network error updating project');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteProject = async (p: Project) => {
    if (
      !confirm(
        `Are you sure you want to delete corridor "${p.name}" (${p.code})? All associated timeline logs and activity updates will be permanently purged from the database.`
      )
    ) {
      return;
    }
    setDeletingId(p.id);
    try {
      const res = await apiFetch(`${apiBase}/api/projects/${p.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || data.error || 'Failed to delete project');
        return;
      }
      setToastMessage(`Corridor "${p.name}" deleted from database.`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Network error deleting project');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-switch tab if specified in URL query
    if (router.query.tab === 'users') {
      setActiveTab('USERS');
    } else {
      setActiveTab('PROJECTS');
    }

    // Auto-refresh on project creation redirect
    if (router.query.created) {
      setToastMessage('New project corridor created successfully.');
      const timer = setTimeout(() => setToastMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [fetchData, router.query]);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.wbsCode.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesScope =
      scopeFilter === 'ALL' ||
      (scopeFilter === 'MINE' &&
        (p.userId === session?.user?.id ||
          (session?.user?.name && p.supervisor?.toLowerCase().includes(session.user.name.toLowerCase()))));

    return matchesSearch && matchesStatus && matchesScope;
  });

  return (
    <>
      <Head>
        <title>{t('dashboard.title', 'National Infrastructure Command Center')} | InfraTrack</title>
      </Head>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Top Header & Role-Aware Action */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white font-sans">
                  {t('dashboard.title', 'National Infrastructure Command Center')}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    {t('dashboard.subtitle', 'Real-time project telemetry, capital expenditure monitoring, and multi-modal progress verification.')}
                  </p>
                  {officerRole === 'SUPERVISOR' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60">
                      <CheckCircle2 className="w-3 h-3 text-blue-500" />
                      Supervisor Clearance
                    </span>
                  )}
                  {officerRole === 'VIEWER' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      Auditor Read-Only
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end md:self-center flex-shrink-0">
            {/* Refresh Button */}
            <button
              onClick={fetchData}
              disabled={loading}
              title="Sync Live Database"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30 transition-all shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
            </button>

            {/* CTA: Create New Project (ADMIN & SUPERVISOR) */}
            {(officerRole === 'ADMIN' || officerRole === 'SUPERVISOR') && (
              <Link
                href="/admin/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-gray-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/15 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4 text-gray-950" />
                <span>{t('dashboard.createProjectBtn', 'Create New Project')}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Success Toast */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="font-medium">{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage('')}
              className="text-emerald-600 dark:text-emerald-400 hover:text-slate-900 dark:hover:text-white font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Fetch Error Banner */}
        {fetchError && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{fetchError}</span>
            </div>
            <button
              onClick={fetchData}
              className="underline font-semibold ml-4 hover:text-rose-950 dark:hover:text-white"
            >
              {t('common.retry', 'Retry')}
            </button>
          </div>
        )}

        {/* Admin Navigation Tabs (Only available to ADMIN clearance) */}
        {officerRole === 'ADMIN' && (
          <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-gray-800/80 pb-3">
            <button
              type="button"
              onClick={() => {
                setActiveTab('PROJECTS');
                router.push('/admin', undefined, { shallow: true });
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'PROJECTS'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800/50 border border-transparent'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{t('dashboard.projectsTab', 'Projects Portfolio')}</span>
              <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'PROJECTS' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300'
              }`}>
                {projects.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('USERS');
                router.push('/admin?tab=users', undefined, { shallow: true });
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'USERS'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800/50 border border-transparent'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t('nav.manageUsers', 'Manage Users')}</span>
            </button>
          </div>
        )}

        {officerRole === 'ADMIN' && activeTab === 'USERS' ? (
          <UserManagement />
        ) : (
          <>
            {/* Quick Stats Cards (From PostgreSQL Aggregations) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xs border border-slate-200/90 dark:border-gray-800 rounded-2xl p-4 shadow-xs transition-all hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('dashboard.totalPortfolio', 'Total Portfolio')}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-slate-500">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl font-mono font-black text-slate-900 dark:text-white mt-2">
                  {stats.totalProjects}
                </div>
                <span className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5 block font-medium">
                  {t('dashboard.managedAssets', 'Managed capital assets')}
                </span>
              </div>

              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xs border border-emerald-200/70 dark:border-emerald-900/40 rounded-2xl p-4 shadow-xs transition-all hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    {t('dashboard.onSchedule', 'On Schedule')}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400 mt-2">
                  {stats.onTrackCount}
                </div>
                <span className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5 block font-medium">
                  {t('dashboard.zeroVariance', 'Zero schedule variance')}
                </span>
              </div>

              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xs border border-rose-200/70 dark:border-rose-900/40 rounded-2xl p-4 shadow-xs transition-all hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
                    {t('dashboard.delayed', 'Delayed / At Risk')}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl font-mono font-black text-rose-600 dark:text-rose-400 mt-2">
                  {stats.delayedCount}
                </div>
                <span className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5 block font-medium">
                  {t('dashboard.needsIntervention', 'Requires intervention')}
                </span>
              </div>

              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xs border border-blue-200/70 dark:border-blue-900/40 rounded-2xl p-4 shadow-xs transition-all hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                    {t('dashboard.completed', 'Completed')}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl font-mono font-black text-blue-600 dark:text-blue-400 mt-2">
                  {stats.completedCount}
                </div>
                <span className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5 block font-medium">
                  {t('dashboard.handedOver', 'Commissioned & handed over')}
                </span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xs border border-slate-200/90 dark:border-gray-800 p-3 rounded-2xl shadow-xs transition-colors">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 dark:text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('dashboard.searchPlaceholder', 'Search projects or WBS code...')}
                  className="w-full bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
                {officerRole === 'SUPERVISOR' && (
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-gray-950 p-1 rounded-xl border border-slate-200/80 dark:border-gray-800 text-xs mr-1">
                    <button
                      type="button"
                      onClick={() => setScopeFilter('ALL')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        scopeFilter === 'ALL'
                          ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      All Corridors
                    </button>
                    <button
                      type="button"
                      onClick={() => setScopeFilter('MINE')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        scopeFilter === 'MINE'
                          ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Created by Me</span>
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-gray-950 p-1 rounded-xl border border-slate-200/80 dark:border-gray-800">
                  {['ALL', 'ON_TRACK', 'AT_RISK', 'DELAYED', 'COMPLETED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                        statusFilter === st
                          ? 'bg-white dark:bg-gray-800 text-slate-900 dark:text-white font-bold shadow-xs'
                          : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {st === 'ALL'
                        ? t('dashboard.filterAll', 'All')
                        : st === 'ON_TRACK'
                        ? t('dashboard.filterOnTrack', 'On Track')
                        : st === 'AT_RISK'
                        ? t('dashboard.filterAtRisk', 'At Risk')
                        : st === 'DELAYED'
                        ? t('dashboard.filterDelayed', 'Delayed')
                        : t('dashboard.filterCompleted', 'Completed')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

        {/* Projects Table (Backed 100% by Real PostgreSQL Data) */}
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xs border border-slate-200/90 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 dark:bg-gray-950/80 text-slate-500 dark:text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200/90 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4">{t('dashboard.colDetails', 'Project & WBS Details')}</th>
                  <th className="px-6 py-4">{t('dashboard.colMinistry', 'Ministry / Sector')}</th>
                  <th className="px-6 py-4">{t('dashboard.colTimeline', 'Baseline Timeline')}</th>
                  <th className="px-6 py-4">{t('dashboard.colProgress', 'Progress (% Actual / Target)')}</th>
                  <th className="px-6 py-4">{t('dashboard.colStatus', 'Status')}</th>
                  <th className="px-6 py-4 text-right">{t('dashboard.colActions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800/80">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-gray-500">
                      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <span className="font-mono text-xs">{t('common.loading', 'Loading Live Database Telemetry...')}</span>
                    </td>
                  </tr>
                ) : filteredProjects.length === 0 ? (
                  // REAL EMPTY STATE: No items in DB
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 flex items-center justify-center mx-auto mb-3 text-slate-400 dark:text-gray-500">
                        <FolderOpen className="w-7 h-7" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-white">
                        {t('dashboard.emptyStateTitle', 'No Infrastructure Projects Found')}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-gray-400 max-w-md mx-auto mt-1">
                        {t('dashboard.emptyStateDesc', 'There are no live projects registered in the central database. Initialize a project baseline to begin monitoring.')}
                      </p>
                      {officerRole === 'ADMIN' && (
                        <div className="mt-4">
                          <Link
                            href="/admin/new"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-gray-950 bg-emerald-400 hover:bg-emerald-300 shadow-md"
                          >
                            <PlusCircle className="w-4 h-4" />
                            <span>{t('dashboard.emptyStateAction', 'Create Initial Project Baseline')}</span>
                          </Link>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((proj) => {
                    const statusInfo = getStatusBadge(proj.status);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <tr
                        key={proj.id}
                        className="hover:bg-slate-50/75 dark:hover:bg-gray-800/40 transition-colors group"
                      >
                        {/* Project Name & WBS */}
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {proj.name}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              {proj.wbsCode}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 dark:text-gray-500">{proj.code}</span>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="px-6 py-4">
                          <div className="text-slate-800 dark:text-gray-200 font-semibold text-xs">{proj.category}</div>
                          <div className="text-[11px] text-slate-500 dark:text-gray-400 truncate max-w-[200px] mt-0.5">
                            {proj.department}
                          </div>
                        </td>

                        {/* Timeline */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-gray-300 font-mono text-[11px]">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
                            <span>{proj.baselineStartDate}</span>
                            <span className="text-slate-400 dark:text-gray-500">&rarr;</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">{proj.baselineEndDate}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-gray-500 mt-1">
                            {t('common.budget', 'Budget')}: <span className="text-slate-800 dark:text-gray-200 font-mono font-bold">{proj.budget}</span>
                          </div>
                        </td>

                        {/* Progress bar */}
                        <td className="px-6 py-4 min-w-[180px]">
                          <div className="flex items-center justify-between mb-1.5 text-[11px]">
                            <span className="font-mono font-bold text-slate-900 dark:text-white">{proj.currentProgress}%</span>
                            <span className="text-slate-400 dark:text-gray-500 font-mono text-[10px]">Target: {proj.plannedProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden border border-slate-200/60 dark:border-gray-700/60">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
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
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border shadow-xs ${statusInfo.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </span>
                        </td>

                        {/* Actions: Role-Gated */}
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Update Progress CTA */}
                            {(officerRole === 'ADMIN' || officerRole === 'SUPERVISOR') && (
                              <Link
                                href={`/admin/${proj.id}/update`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 text-xs font-bold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                                title="Add daily progress via Excel, Text, or Voice"
                              >
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span>{t('dashboard.actionUpdate', 'Update Progress')}</span>
                              </Link>
                            )}

                            {/* Manage / Edit Project Baseline */}
                            {(() => {
                              const isCreator = session?.user?.id && proj.userId === session.user.id;
                              const canManage = officerRole === 'ADMIN' || (officerRole === 'SUPERVISOR' && (isCreator || !proj.userId));

                              if (canManage) {
                                return (
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => openEditModal(proj)}
                                      className="p-1.5 rounded-lg text-slate-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-slate-200/80 dark:border-gray-800 transition-colors"
                                      title="Edit project baseline"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      disabled={deletingId === proj.id}
                                      onClick={() => handleDeleteProject(proj)}
                                      className="p-1.5 rounded-lg text-slate-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-slate-200/80 dark:border-gray-800 transition-colors disabled:opacity-50"
                                      title="Delete project"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                );
                              }

                              if (officerRole === 'SUPERVISOR') {
                                return (
                                  <span
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-gray-800 text-slate-400 dark:text-gray-500 text-[11px] font-mono"
                                    title="Supervisor Scope: You can only edit projects you created"
                                  >
                                    <Lock className="w-3 h-3 text-slate-400" />
                                    <span>Other Owner</span>
                                  </span>
                                );
                              }

                              return null;
                            })()}

                            {officerRole === 'VIEWER' && (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-gray-800 text-slate-400 dark:text-gray-500 text-[11px] font-mono font-medium"
                                title="Read-Only Clearance"
                              >
                                <Lock className="w-3 h-3 text-slate-400" />
                                <span>Read-Only</span>
                              </span>
                            )}

                            {/* View Project Detail / Telemetry */}
                            <Link
                              href={`/projects/${proj.id}`}
                              className="p-1.5 rounded-lg text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800 border border-slate-200/80 dark:border-gray-800 transition-colors"
                              title={t('dashboard.actionView', 'View Live Telemetry')}
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
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

        {/* Modal: Edit Project Baseline */}
        {editingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-gray-800 flex items-center justify-between bg-slate-50/50 dark:bg-gray-950/40">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Manage & Edit Project Corridor
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-gray-400 font-mono">
                      {editingProject.code} • {editingProject.wbsCode}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 hover:text-slate-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSaveProjectEdit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
                {editError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{editError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 dark:text-gray-300 mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as ProjectStatus })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold"
                    >
                      <option value="ON_TRACK">On Track</option>
                      <option value="AT_RISK">At Risk</option>
                      <option value="DELAYED">Delayed</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-gray-300 mb-1">
                      Location / Region
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-gray-300 mb-1">
                      Total Budget
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.budget}
                      onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })}
                      placeholder="e.g. ₹5,200 Cr"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-gray-300 mb-1">
                      Expended Capital (Spent)
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.spent}
                      onChange={(e) => setEditForm({ ...editForm, spent: e.target.value })}
                      placeholder="e.g. ₹1,200 Cr"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-gray-300 mb-1">
                      Current Physical Progress (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      required
                      value={editForm.currentProgress}
                      onChange={(e) => setEditForm({ ...editForm, currentProgress: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-gray-300 mb-1">
                      Planned Schedule Target (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      required
                      value={editForm.plannedProgress}
                      onChange={(e) => setEditForm({ ...editForm, plannedProgress: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-gray-300 mb-1">
                      Baseline Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={editForm.baselineStartDate ? editForm.baselineStartDate.slice(0, 10) : ''}
                      onChange={(e) => setEditForm({ ...editForm, baselineStartDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-gray-300 mb-1">
                      Baseline Target Completion Date
                    </label>
                    <input
                      type="date"
                      required
                      value={editForm.baselineEndDate ? editForm.baselineEndDate.slice(0, 10) : ''}
                      onChange={(e) => setEditForm({ ...editForm, baselineEndDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-gray-300 mb-1">
                      Supervising Officer / Chief Engineer
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.supervisor}
                      onChange={(e) => setEditForm({ ...editForm, supervisor: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-gray-300 mb-1">
                      Lead EPC Contractor
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.contractor}
                      onChange={(e) => setEditForm({ ...editForm, contractor: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 dark:text-gray-300 mb-1">
                      Ministry / Department
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.department}
                      onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 dark:text-gray-300 mb-1">
                      Project Description & Scope
                    </label>
                    <textarea
                      rows={3}
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 border-t border-slate-200 dark:border-gray-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    disabled={savingEdit}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 font-semibold hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {savingEdit ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Updating Database...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-slate-950" />
                        <span>Save & Update Database</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </>
  );
}
