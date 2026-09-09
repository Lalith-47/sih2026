import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Building2, 
  Layers, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  Mic,
  FileSpreadsheet,
  FileText,
  AlertCircle
} from 'lucide-react';
import ProgressUploader from '@/components/admin/ProgressUploader';
import { getProjectById, getProjects } from '@/data/mockProjects';
import { Project, ActivityUpdate } from '@/types/project';

export default function UpdateProgressPage() {
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

  const handleUpdateSubmitted = (newProgress: number) => {
    if (project) {
      const refreshed = getProjectById(project.id);
      if (refreshed) {
        setProject({ ...refreshed });
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-mono">Loading Project WBS Context...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Project Not Found</h2>
        <p className="text-xs text-gray-400">The requested project ID does not exist in the active registry.</p>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-800 text-gray-300 hover:text-white border border-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Admin Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Update Progress: {project.name} | InfraTrack 2026</title>
      </Head>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300"
          >
            <span>View Public Analytics</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Project Header Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-xs text-emerald-400 bg-gray-900 px-2 py-0.5 rounded border border-gray-700 font-semibold">
                  {project.wbsCode}
                </span>
                <span className="text-xs text-gray-400">{project.category}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">{project.name}</h1>
              <p className="text-xs text-gray-400 mt-1">{project.department} • {project.location}</p>
            </div>

            <div className="flex items-center gap-4 bg-gray-900 border border-gray-700 p-3.5 rounded-xl">
              <div>
                <span className="text-[10px] uppercase font-semibold text-gray-500 block">
                  Current Progress
                </span>
                <span className="text-2xl font-mono font-extrabold text-emerald-400 block">
                  {project.currentProgress}%
                </span>
              </div>
              <div className="border-l border-gray-800 pl-4">
                <span className="text-[10px] uppercase font-semibold text-gray-500 block">
                  Target Baseline
                </span>
                <span className="text-2xl font-mono font-extrabold text-blue-400 block">
                  {project.plannedProgress}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Uploader (Excel, Text, Voice tabs) */}
        <ProgressUploader
          projectId={project.id}
          projectName={project.name}
          currentProgress={project.currentProgress}
          onUpdateSubmitted={handleUpdateSubmitted}
        />

        {/* Recent Daily Logs Stream for this project */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Audit History & Field Submissions</span>
          </h3>

          <div className="space-y-3">
            {project.recentUpdates.length === 0 ? (
              <p className="text-xs text-gray-500">No field logs recorded yet for this project.</p>
            ) : (
              project.recentUpdates.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-gray-900/80 border border-gray-700/80 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`p-1.5 rounded-lg ${
                          item.channel === 'VOICE'
                            ? 'bg-purple-950 text-purple-400 border border-purple-800'
                            : item.channel === 'EXCEL'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-blue-950 text-blue-400 border border-blue-800'
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
                      <span className="font-semibold text-white">{item.author}</span>
                      <span className="text-gray-500">({item.role})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-400 font-semibold">
                        +{item.progressDelta}%
                      </span>
                      <span className="text-gray-500 font-mono text-[11px]">{item.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-gray-300 pl-8 leading-relaxed">{item.notes}</p>

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-8 pt-1">
                      {item.tags.map((t) => (
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
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

