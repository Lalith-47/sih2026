import React, { useState, useEffect, useRef } from 'react';
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
  Flag,
  Camera,
  Upload,
  Loader2,
  X,
  Brain,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { Project } from '@/types/project';
import ProgressLineChart from '@/components/charts/ProgressLineChart';
import CompletionPieChart from '@/components/charts/CompletionPieChart';
import BudgetBarChart from '@/components/charts/BudgetBarChart';
import { getStatusBadge } from '@/components/public/ProjectCard';
import AuthGuard from '@/components/auth/AuthGuard';
import { getApiBaseUrl, apiFetch } from '@/lib/auth-client';
import { useI18n } from '@/lib/i18n-context';

export default function ProjectDetailsPage() {
  return (
    <AuthGuard>
      <ProjectDetailsContent />
    </AuthGuard>
  );
}

function ProjectDetailsContent() {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useI18n();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'ADMIN' | 'SUPERVISOR' | 'VIEWER'>('SUPERVISOR');

  // AI Site Inspection state
  const [visionImage, setVisionImage] = useState<string | null>(null);
  const [visionImageName, setVisionImageName] = useState<string | null>(null);
  const [visionNotes, setVisionNotes] = useState('');
  const [visionLoading, setVisionLoading] = useState(false);
  const [visionResult, setVisionResult] = useState<any | null>(null);
  const [visionError, setVisionError] = useState<string | null>(null);
  const visionFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const apiBase = getApiBaseUrl();

    apiFetch(`${apiBase}/api/me`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.role) setUserRole(data.user.role);
      })
      .catch(() => {});

    if (id && typeof id === 'string') {
      apiFetch(`${apiBase}/api/projects/${id}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.project) {
            const bp = data.project;
            setProject({
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
              timelineData: (bp.timelinePoints && bp.timelinePoints.length > 0)
                ? bp.timelinePoints.map((tp: any) => ({
                    date: tp.period,
                    plannedProgress: tp.planned,
                    actualProgress: tp.actual,
                  }))
                : [
                    { date: 'M-1', plannedProgress: 10, actualProgress: bp.currentProgress / 2 },
                    { date: 'Current', plannedProgress: bp.plannedProgress, actualProgress: bp.currentProgress },
                  ],
              recentUpdates: (bp.recentUpdates || []).map((up: any) => ({
                id: up.id,
                channel: up.channel,
                notes: up.notes,
                progressDelta: up.progressDelta,
                author: up.author,
                role: up.role,
                timestamp: new Date(up.createdAt).toLocaleDateString(),
                tags: up.tags || [],
              })),
            });
          }
        })
        .catch(() => {})
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500 dark:text-gray-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-mono">{t('common.loading', 'Loading Project Analytics & S-Curve Telemetry from PostgreSQL...')}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Project Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-gray-400">
          The requested infrastructure project could not be located in the database.
        </p>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-gray-700"
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

  // AI Vision: handle image selection
  const handleVisionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setVisionError('Please upload an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }
    setVisionImageName(file.name);
    setVisionResult(null);
    setVisionError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') setVisionImage(ev.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // AI Vision: run GPT-4o analysis
  const runVisionAnalysis = async () => {
    if (!visionImage || !project) return;
    setVisionLoading(true);
    setVisionError(null);
    setVisionResult(null);
    try {
      const apiBase = getApiBaseUrl();
      const res = await apiFetch(`${apiBase}/api/ai/vision-estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          imageBase64: visionImage,
          imageMime: 'image/jpeg',
          customNotes: visionNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI vision analysis failed');
      setVisionResult(data.result);
    } catch (err: any) {
      setVisionError(err?.message || 'Failed to analyze image. Ensure backend is running.');
    } finally {
      setVisionLoading(false);
    }
  };


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
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Public Directory</span>
          </Link>

          {(userRole === 'ADMIN' || userRole === 'SUPERVISOR') && (
            <Link
              href={`/admin/${project.id}/update`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-gray-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/20 transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Submit Field Update</span>
            </Link>
          )}
        </div>

        {/* Project Header Banner */}
        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 transition-colors">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-50 dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-gray-700">
                  <Layers className="w-3.5 h-3.5" />
                  {project.wbsCode}
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-gray-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-700/60">
                  {project.code}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}
                >
                  <StatusIcon className="w-3.5 h-3.5" />
                  {statusInfo.label}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {project.name}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-gray-400 pt-1">
                <span className="text-slate-800 dark:text-gray-300 font-medium">{project.department}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                  {project.location}
                </span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-medium">{project.category}</span>
              </div>
            </div>

            {/* Overall Progress Stat Box */}
            <div className="flex items-center gap-6 bg-slate-50 dark:bg-gray-900/90 border border-slate-200 dark:border-gray-700/80 p-4 rounded-2xl">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-gray-400 block tracking-wider">
                  Actual Physical Progress
                </span>
                <span className="text-3xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {project.currentProgress}%
                </span>
              </div>
              <div className="border-l border-slate-200 dark:border-gray-800 pl-6">
                <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-gray-400 block tracking-wider">
                  Planned Baseline
                </span>
                <span className="text-3xl font-mono font-extrabold text-blue-600 dark:text-blue-400 mt-0.5 block">
                  {project.plannedProgress}%
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed border-t border-slate-100 dark:border-gray-700/70 pt-4">
            {project.description}
          </p>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl p-4 shadow-lg transition-colors">
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 block flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              Schedule Variance
            </span>
            <div
              className={`text-2xl font-mono font-extrabold mt-1 ${
                variance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {variance >= 0 ? `+${variance}%` : `${variance}%`}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5 block">
              {variance >= 0 ? 'Ahead of baseline target' : 'Behind planned velocity'}
            </span>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl p-4 shadow-lg transition-colors">
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 block flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              Capital Budget
            </span>
            <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white mt-1">
              {project.budget}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5 block">
              Spent to date: {project.spent}
            </span>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl p-4 shadow-lg transition-colors">
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 block flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Target Handover
            </span>
            <div className="text-xl font-mono font-extrabold text-slate-900 dark:text-white mt-1 truncate">
              {project.baselineEndDate}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5 block">
              Started: {project.baselineStartDate}
            </span>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl p-4 shadow-lg transition-colors">
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 block flex items-center gap-1.5">
              <HardHat className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
              Lead EPC Contractor
            </span>
            <div className="text-sm font-semibold text-slate-900 dark:text-white mt-1 truncate">
              {project.contractor}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5 block">
              Eng: {project.supervisor}
            </span>
          </div>
        </div>

        {/* Dynamic Visualizations: S-Curve Progress Line Chart & Radial Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-3xl p-6 shadow-xl transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Progress S-Curve</h3>
                <p className="text-[11px] text-slate-400 dark:text-gray-500">Actual vs Planned baseline over project timeline</p>
              </div>
            </div>
            <ProgressLineChart
              timelineData={project.timelineData}
              currentProgress={project.currentProgress}
              plannedProgress={project.plannedProgress}
            />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-3xl p-5 shadow-xl transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">
                  <BarChart3 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Completion Status</h3>
                  <p className="text-[11px] text-slate-400 dark:text-gray-500">Physical work done vs remaining</p>
                </div>
              </div>
              <CompletionPieChart
                currentProgress={project.currentProgress}
                plannedProgress={project.plannedProgress}
              />
            </div>
          </div>
        </div>

        {/* Budget Utilization Chart */}
        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-3xl p-6 sm:p-8 shadow-xl transition-colors">
          <div className="flex items-center gap-2.5 mb-5 border-b border-slate-200 dark:border-gray-700 pb-4">
            <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400">
              <IndianRupee className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Capital Budget Utilization</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">Allocated vs actual expenditure as of current reporting period</p>
            </div>
          </div>
          <BudgetBarChart
            budget={project.budget}
            spent={project.spent}
            projectName={project.name}
            height={160}
          />
        </div>

        {/* Live Multi-Modal Field Audit Stream */}
        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-gray-700 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 text-purple-600 dark:text-purple-400">
                <Clock className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Multi-Modal Field Ingestion Ledger
                </h3>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  Audit trail of site supervisor voice notes, Excel line item imports, and daily logs.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-gray-900 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-gray-700">
              {project.recentUpdates.length} Submissions
            </span>
          </div>

          <div className="space-y-4">
            {project.recentUpdates.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-gray-500 py-6 text-center">
                No field progress logs submitted yet for this project.
              </p>
            ) : (
              project.recentUpdates.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-gray-900/80 border border-slate-200 dark:border-gray-700/80 space-y-2 text-xs transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`p-1.5 rounded-lg ${
                          item.channel === 'VOICE'
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                            : item.channel === 'EXCEL'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        {item.channel === 'VOICE' ? (
                          <Mic className="w-3.5 h-3.5" />
                        ) : item.channel === 'EXCEL' ? (
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                        ) : (
                          <FileText className="w-3.5 h-3.5" />
                        )}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">{item.author}</span>
                      <span className="text-slate-500 dark:text-gray-500">({item.role})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        +{item.progressDelta}%
                      </span>
                      <span className="text-slate-400 dark:text-gray-500 font-mono text-[11px]">{item.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-slate-700 dark:text-gray-300 pl-8 leading-relaxed">{item.notes}</p>

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-8 pt-1">
                      {item.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-mono text-slate-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-slate-200 dark:border-gray-700"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Site Inspection Panel — Supervisor & Admin only */}
        {(userRole === 'ADMIN' || userRole === 'SUPERVISOR') && (
          <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-950 border border-emerald-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-800/30 pb-5">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400">
                  <Brain className="w-6 h-6" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">AI Site Inspection</h3>
                    <span className="flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      GPT-4o Vision
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Upload a site photo to get an AI-powered structural assessment with confidence scoring against live DB telemetry.
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <input
                  ref={visionFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleVisionImageChange}
                  className="hidden"
                  id="vision-upload"
                />

                {visionImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-emerald-700/50 bg-black/30 group">
                    <img
                      src={visionImage}
                      alt="Site inspection photo"
                      className="w-full max-h-56 object-cover object-center"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 px-3 py-2 flex items-center justify-between">
                      <span className="text-xs text-emerald-300 font-mono truncate">📸 {visionImageName}</span>
                      <button
                        onClick={() => { setVisionImage(null); setVisionImageName(null); setVisionResult(null); setVisionError(null); }}
                        className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => visionFileRef.current?.click()}
                    className="w-full h-40 rounded-2xl border-2 border-dashed border-emerald-700/50 hover:border-emerald-500/60 bg-emerald-950/20 hover:bg-emerald-950/40 flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-emerald-400 transition-all group"
                  >
                    <Camera className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                      <p className="text-xs font-semibold">Upload Site / Drone Photo</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">PNG, JPG, WEBP supported</p>
                    </div>
                  </button>
                )}

                {/* Optional supervisor notes */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                    Supervisor Field Notes (Optional)
                  </label>
                  <textarea
                    value={visionNotes}
                    onChange={(e) => setVisionNotes(e.target.value)}
                    placeholder="e.g. Pile cap concrete pour complete on axis B4-B6, reinforcement cage placed..."
                    rows={3}
                    className="w-full bg-slate-800/60 border border-slate-700/60 focus:border-emerald-500/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors resize-none"
                  />
                </div>

                <button
                  onClick={runVisionAnalysis}
                  disabled={!visionImage || visionLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition-all"
                >
                  {visionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      GPT-4o Vision Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Analyze with AI Vision
                    </>
                  )}
                </button>

                {visionError && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300">
                    ⚠️ {visionError}
                  </div>
                )}
              </div>

              {/* Results Panel */}
              <div className="space-y-3">
                {visionLoading && (
                  <div className="h-full flex flex-col items-center justify-center gap-3 py-12 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    <p className="text-xs font-medium">OpenAI GPT-4o inspecting site photo…</p>
                    <p className="text-[11px] text-slate-500">Cross-referencing with live project telemetry</p>
                  </div>
                )}

                {!visionLoading && !visionResult && !visionError && (
                  <div className="h-full flex flex-col items-center justify-center gap-3 py-12 text-slate-500 border border-dashed border-slate-700/40 rounded-2xl">
                    <Brain className="w-8 h-8 text-slate-600" />
                    <p className="text-xs text-center">Upload a site photo and click<br /><strong className="text-slate-400">Analyze with AI Vision</strong> to get results</p>
                  </div>
                )}

                {visionResult && (
                  <div className="space-y-3 text-xs">
                    {/* Confidence Score Banner */}
                    <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-700/40">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-emerald-400 font-bold text-sm">🎯 AI Confidence Score</span>
                        <span className="text-2xl font-mono font-extrabold text-emerald-400">{visionResult.confidenceScore}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                          style={{ width: `${visionResult.confidenceScore}%` }}
                        />
                      </div>
                      <p className="text-emerald-300/70 text-[11px] mt-1.5 font-medium">{visionResult.summary}</p>
                    </div>

                    {/* Progress metrics */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-center">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Est. Progress</span>
                        <span className="text-lg font-mono font-extrabold text-white mt-0.5 block">{visionResult.currentProgressEstimate}%</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-center">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Progress Delta</span>
                        <span className="text-lg font-mono font-extrabold text-emerald-400 mt-0.5 block">+{visionResult.suggestedProgressDelta}%</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-center">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Days Left</span>
                        <span className="text-lg font-mono font-extrabold text-amber-400 mt-0.5 block">{visionResult.estimatedDaysRemaining}</span>
                      </div>
                    </div>

                    {/* Detected elements */}
                    {visionResult.detectedElements?.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2">
                        <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">🔍 Detected Elements</p>
                        <div className="flex flex-wrap gap-1.5">
                          {visionResult.detectedElements.map((el: string, i: number) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/60 border border-slate-600/50 text-slate-300">
                              {el}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Observations */}
                    {visionResult.observations?.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2">
                        <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">📋 AI Observations</p>
                        <ul className="space-y-1.5">
                          {visionResult.observations.map((obs: string, i: number) => (
                            <li key={i} className="flex gap-2 text-slate-400 leading-relaxed">
                              <span className="text-emerald-500 flex-shrink-0 mt-0.5">•</span>
                              <span>{obs}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p className="text-[10px] text-slate-500 text-center pt-1">
                      {visionResult.estimatedTimeToCompletion && `Est. completion: ${visionResult.estimatedTimeToCompletion}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
