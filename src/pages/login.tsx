import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Layers, 
  ShieldCheck, 
  Radio, 
  Cpu, 
  Activity, 
  Globe2
} from 'lucide-react';
import AuthCard from '@/components/auth/AuthCard';
import Login3DWrapper from '@/components/3d/Login3DWrapper';
import ThemeToggle from '@/components/layout/ThemeToggle';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import { useSession } from '@/lib/auth-client';
import { useI18n } from '@/lib/i18n-context';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { t } = useI18n();
  const [sceneMode, setSceneMode] = useState<'digital-twin' | 'refinery'>('digital-twin');

  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace('/admin');
    }
  }, [session, isPending, router]);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-slate-50 dark:bg-[#040711] text-slate-900 dark:text-white transition-colors duration-300">
      <Head>
        <title>Command Portal • SIH 2026 InfraTrack AI</title>
        <meta 
          name="description" 
          content="National Infrastructure Real-Time Monitoring & Sentinel Verification Portal" 
        />
      </Head>

      {/* 3D Living Background Canvas */}
      <Login3DWrapper sceneMode={sceneMode} />

      {/* Dynamic Ambient Blur Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-cyan-500/10 dark:bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-[350px] h-[350px] bg-blue-500/10 dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group cursor-pointer focus:outline-none">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-105">
            <Layers className="w-5 h-5 text-white drop-shadow" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
                Infra<span className="bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">Track</span>
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 px-2 py-0.5 rounded-full backdrop-blur-md">
                SIH 2026
              </span>
            </div>
            <p className="text-[10px] font-mono tracking-wider text-slate-500 dark:text-gray-400 hidden sm:block">
              {t('auth.nationalTwin', 'NATIONAL INFRASTRUCTURE DIGITAL TWIN')}
            </p>
          </div>
        </Link>

        {/* Status telemetry & header controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 3D Visual Scene Environment Switcher */}
          <div className="hidden sm:flex items-center gap-1 p-1 rounded-2xl bg-white/90 dark:bg-gray-900/80 backdrop-blur-md border border-slate-200 dark:border-gray-800 text-[11px] font-mono shadow-sm">
            <button
              type="button"
              onClick={() => setSceneMode('digital-twin')}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                sceneMode === 'digital-twin'
                  ? 'bg-emerald-500 text-gray-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white font-medium'
              }`}
              title="Global Digital Twin Planetary Matrix (Trillion-Dollar Tech)"
            >
              🌐 Digital Twin
            </button>
            <button
              type="button"
              onClick={() => setSceneMode('refinery')}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                sceneMode === 'refinery'
                  ? 'bg-emerald-500 text-gray-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white font-medium'
              }`}
              title="Industrial Oil Refinery SCADA Complex"
            >
              🏭 Oil Refinery
            </button>
          </div>

          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Center Stage with AuthCard */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-10">
        {/* Subtle Cyber Title Badge */}
        <div className="mb-4 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-medium backdrop-blur-md shadow-sm mb-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-600 dark:text-emerald-400" />
            <span>{t('auth.zeroTrustAuth', 'MULTI-TIER ACCESS GATE • ZERO TRUST AUTH')}</span>
          </div>
        </div>

        {/* Central Auth Glassmorphism Card */}
        <div className="w-full max-w-lg relative group">
          {/* Outer Glow Frame */}
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-80 group-hover:opacity-100 transition duration-500 pointer-events-none" />
          
          <AuthCard />
        </div>

        {/* Quick Corridor Monitoring Telemetry Pills */}
        <div className="mt-6 hidden lg:flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-gray-900/50 backdrop-blur-md border border-slate-200 dark:border-gray-800/80 text-slate-700 dark:text-gray-300 shadow-sm">
            <Activity className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>{t('auth.corridorNh48', 'NH-48 Smart Corridor: 84% On Track')}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-gray-900/50 backdrop-blur-md border border-slate-200 dark:border-gray-800/80 text-slate-700 dark:text-gray-300 shadow-sm">
            <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{t('auth.corridorDelhiHsr', 'Delhi-Varanasi HSR: Phase 2 Active')}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-gray-900/50 backdrop-blur-md border border-slate-200 dark:border-gray-800/80 text-slate-700 dark:text-gray-300 shadow-sm">
            <Globe2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('auth.corridorRewaSolar', 'Rewa Solar Complex: Operational')}</span>
          </div>
        </div>
      </main>

      {/* Footer Notice */}
      <footer className="relative z-20 py-4 px-4 text-center text-xs font-mono text-slate-500 dark:text-gray-500 border-t border-slate-200 dark:border-gray-900/80 backdrop-blur-md bg-white/60 dark:bg-gray-950/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{t('auth.footerNotice', 'Smart India Hackathon 2026 • Problem Statement: Infrastructure Sentinel')}</span>
          <span className="text-[11px] text-slate-400 dark:text-gray-600">
            {t('auth.confidentialNotice', 'Confidential & Protected Official System • Ministry of Infrastructure')}
          </span>
        </div>
      </footer>
    </div>
  );
}
