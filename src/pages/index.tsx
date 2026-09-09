import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  ShieldCheck, 
  BarChart3, 
  Mic, 
  FileSpreadsheet, 
  TrendingUp, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  Activity,
  Compass
} from 'lucide-react';
import { INITIAL_PROJECTS } from '@/data/mockProjects';

export default function LandingPage() {
  const sampleProjects = INITIAL_PROJECTS.slice(0, 3);

  return (
    <div className="relative overflow-hidden bg-gray-900 text-white">
      {/* Background radial gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-emerald-600/15 via-blue-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-800 border border-gray-700 text-xs font-semibold text-emerald-400 shadow-inner">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Smart India Hackathon 2026 • Infrastructure Monitoring Platform</span>
          </div>

          {/* Hero Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15] sm:leading-[1.15]">
            Real-Time Infrastructure <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-500">
              Project Monitoring System
            </span>
          </h1>

          {/* Hero Subtitle */}
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Eliminate project delays, track baseline S-Curves, and capture daily field progress seamlessly via 
            voice recordings, Excel spreadsheets, and supervisor logs.
          </p>

          {/* The Two Main CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/admin"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold text-gray-950 bg-emerald-400 hover:bg-emerald-300 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.02]"
            >
              <ShieldCheck className="w-5 h-5 text-gray-950" />
              <span>Admin Login</span>
            </Link>

            <Link
              href="/projects"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 shadow-xl hover:border-gray-600 transition-all hover:scale-[1.02]"
            >
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span>View Public Projects</span>
            </Link>
          </div>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-gray-800/60 border border-gray-700/80 backdrop-blur-md">
          <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-700/50">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 block">
              Monitored Outlay
            </span>
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-400 mt-1 block">
              ₹29,710 Cr
            </span>
            <span className="text-[11px] text-gray-500 mt-1 block">Across 5 national sectors</span>
          </div>

          <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-700/50">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 block">
              Active WBS Packages
            </span>
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-blue-400 mt-1 block">
              142 Units
            </span>
            <span className="text-[11px] text-gray-500 mt-1 block">Granular tracking nodes</span>
          </div>

          <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-700/50">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 block">
              On-Schedule Compliance
            </span>
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-teal-400 mt-1 block">
              88.4%
            </span>
            <span className="text-[11px] text-gray-500 mt-1 block">S-Curve variance index</span>
          </div>

          <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-700/50">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 block">
              Multimodal Ingestion
            </span>
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-purple-400 mt-1 block">
              3 Modes
            </span>
            <span className="text-[11px] text-gray-500 mt-1 block">Excel, Text & Voice Audio</span>
          </div>
        </div>
      </section>

      {/* Feature Pillar Section */}
      <section className="border-t border-gray-800 bg-gray-950/60 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Engineered for Scalable Infrastructure Governance
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Next-generation project management tooling tailored for central ministries, state departments, and field engineers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-gray-800/80 border border-gray-700 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-gray-600 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-800/70 text-blue-400 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Automated S-Curve Analytics</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Compare baseline planned targets directly against verified site progress with interactive Recharts time-series and completion donuts.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-800/80 border border-gray-700 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-gray-600 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-800/70 text-purple-400 flex items-center justify-center mb-4">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Voice & Excel Field Ingestion</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Empower field supervisors on remote job sites to record voice memos, drop Excel progress sheets, or submit shift logs with instant delta calculation.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-800/80 border border-gray-700 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-gray-600 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-800/70 text-emerald-400 flex items-center justify-center mb-4">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Transparent Citizen Portal</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Provide public stakeholders and audit committees real-time visibility into capital utilization, milestone releases, and contractor performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Preview */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Highlighted Strategic Projects</h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Real-time snapshot of high-priority national corridors.
            </p>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>Explore All Projects</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleProjects.map((p) => (
            <div
              key={p.id}
              className="bg-gray-800 border border-gray-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                    {p.wbsCode}
                  </span>
                  <span className="text-xs font-mono font-bold text-white bg-gray-900 px-2 py-0.5 rounded border border-gray-700">
                    {p.currentProgress}% Complete
                  </span>
                </div>
                <h4 className="font-bold text-white text-base line-clamp-2">{p.name}</h4>
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{p.location}</p>

                {/* mini progress bar */}
                <div className="w-full bg-gray-900 rounded-full h-1.5 mt-4 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${p.currentProgress}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-700/60 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-mono">{p.budget}</span>
                <Link
                  href={`/projects/${p.id}`}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  View Details &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

