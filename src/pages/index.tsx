import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { 
  Building2, 
  ShieldCheck, 
  BarChart3, 
  TrendingUp, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  Activity,
  Compass,
  Cpu,
  Radio,
  FileSpreadsheet,
  Mic,
  Lock
} from 'lucide-react';
import { INITIAL_PROJECTS } from '@/data/mockProjects';
import DigitalTwinWrapper from '@/components/3d/DigitalTwinWrapper';
import { useSession } from '@/lib/auth-client';

export default function LandingPage() {
  const sampleProjects = INITIAL_PROJECTS.slice(0, 3);
  const { data: session } = useSession();

  return (
    <div className="relative overflow-hidden bg-[#07090E] text-white min-h-screen">
      <Head>
        <title>InfraTrack • SIH 2026 National Infrastructure Monitoring</title>
        <meta 
          name="description" 
          content="Smart India Hackathon 2026 National Infrastructure Digital Twin and SCADA monitoring platform with Better Auth security." 
        />
      </Head>

      {/* Cyber Grid background pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.12), transparent 70%),
            linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 48px 48px, 48px 48px',
        }}
      />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pt-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Mission & Identity */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900/90 border border-emerald-500/30 text-xs font-semibold text-emerald-400 shadow-inner">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[11px] tracking-wide">SIH 2026 • DIGITAL TWIN TELEMETRY</span>
            </div>

            {/* Hero Heading */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] font-mono">
              Real-Time National <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Infrastructure Grid
              </span>
            </h1>

            {/* Hero Subtitle */}
            <p className="text-sm sm:text-base text-gray-400 max-w-xl font-normal leading-relaxed">
              Eliminate project delays, compare baseline S-Curves, and capture daily field progress seamlessly via 
              multimodal ingestion: voice recordings, Excel sheets, and verified supervisor logs.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {session?.user ? (
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-950 bg-emerald-400 hover:bg-emerald-300 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.02]"
                >
                  <ShieldCheck className="w-4 h-4 text-gray-950" />
                  <span>Launch Command Desk</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-950 bg-emerald-400 hover:bg-emerald-300 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.02]"
                >
                  <Lock className="w-4 h-4 text-gray-950" />
                  <span>Officer Sign In / Register</span>
                </Link>
              )}

              <Link
                href="/projects"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gray-900/90 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 shadow-xl transition-all hover:scale-[1.02]"
              >
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Public Portal</span>
              </Link>
            </div>

            {/* Real-time Status Micro-row */}
            <div className="pt-3 flex items-center gap-6 text-[11px] text-gray-500 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>BACKEND: ONLINE (4000)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>AUTH: BETTER-AUTH</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <span>DB: POSTGRESQL</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Interactive 3D Digital Twin */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 h-[420px] sm:h-[480px] rounded-2xl bg-gradient-to-b from-gray-900/50 to-gray-950/80 border border-emerald-500/20 shadow-2xl relative overflow-hidden flex items-center justify-center"
          >
            <DigitalTwinWrapper />
          </motion.div>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-gray-900/70 border border-gray-800/90 backdrop-blur-md">
          <div className="p-4 rounded-xl bg-gray-950/60 border border-emerald-500/20">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 block font-mono">
              Monitored Outlay
            </span>
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-400 mt-1 block">
              ₹29,710 Cr
            </span>
            <span className="text-[10px] text-gray-500 mt-1 block">5 National Priority Sectors</span>
          </div>

          <div className="p-4 rounded-xl bg-gray-950/60 border border-cyan-500/20">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 block font-mono">
              Active WBS Packages
            </span>
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-cyan-400 mt-1 block">
              142 Nodes
            </span>
            <span className="text-[10px] text-gray-500 mt-1 block">Granular Spatial Telemetry</span>
          </div>

          <div className="p-4 rounded-xl bg-gray-950/60 border border-teal-500/20">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 block font-mono">
              Schedule Adherence
            </span>
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-teal-400 mt-1 block">
              88.4%
            </span>
            <span className="text-[10px] text-gray-500 mt-1 block">Baseline S-Curve Concordance</span>
          </div>

          <div className="p-4 rounded-xl bg-gray-950/60 border border-purple-500/20">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 block font-mono">
              Multimodal Ingestion
            </span>
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-purple-400 mt-1 block">
              3 Channels
            </span>
            <span className="text-[10px] text-gray-500 mt-1 block">Excel, Text & Field Voice</span>
          </div>
        </div>
      </section>

      {/* Feature Pillar Section */}
      <section className="border-t border-gray-800/80 bg-[#0A0D14]/80 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white">
              Engineered for National Infrastructure Governance
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Next-generation project management tooling tailored for central ministries, state departments, and field engineers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/50 border border-emerald-700/60 text-emerald-400 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 font-mono">Automated S-Curve Analytics</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Compare baseline planned targets directly against verified site progress with interactive time-series tracking and variance detection.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-cyan-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/50 border border-cyan-700/60 text-cyan-400 flex items-center justify-center mb-4">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 font-mono">Voice & Multimodal Capture</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Field supervisors dictate progress updates on-site in regional languages or upload Excel WBS sheets with automatic parsing.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-teal-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-950/50 border border-teal-700/60 text-teal-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 font-mono">Enterprise Security & RBAC</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Secured by Better Auth with scrypt password hashing, session tokens, and GitHub/Google OAuth single sign-on.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Showcase */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-mono text-white">Live Monitored Corridors</h2>
            <p className="text-xs text-gray-400 mt-1">Real-time status updates across active state and national projects</p>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
          >
            <span>Explore All Projects</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleProjects.map((p) => (
            <div key={p.id} className="p-5 rounded-xl bg-gray-900/50 border border-gray-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
                  <span className="font-mono text-emerald-400">{p.code}</span>
                  <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300">{p.category}</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{p.name}</h3>
                <p className="text-xs text-gray-400 line-clamp-2">{p.description}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-500 text-[10px] block">Progress</span>
                  <span className="font-mono font-bold text-emerald-400">{p.currentProgress}%</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">Budget</span>
                  <span className="font-mono font-bold text-white">{p.budget}</span>
                </div>
                <Link
                  href={`/admin/${p.id}`}
                  className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 text-[11px] font-semibold transition-colors"
                >
                  Inspect
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 py-8 bg-[#05060A] text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-emerald-400 font-bold">InfraTrack SIH 2026</span>
            <span>•</span>
            <span>Smart India Hackathon</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-gray-400 transition-colors">Officer Portal</Link>
            <Link href="/projects" className="hover:text-gray-400 transition-colors">Public Telemetry</Link>
            <a href="http://localhost:4000/health" target="_blank" rel="noreferrer" className="hover:text-gray-400 transition-colors">API Health (4000)</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
