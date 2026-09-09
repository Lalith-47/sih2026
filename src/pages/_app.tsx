import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Navbar from '@/components/layout/Navbar';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>InfraTrack 2026 - National Infrastructure Monitoring System</title>
        <meta name="description" content="Real-time multi-modal project monitoring for national infrastructure projects (SIH 2026)" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-gray-900 text-slate-50 flex flex-col selection:bg-emerald-500 selection:text-gray-950">
        <Navbar />
        <main className="flex-1">
          <Component {...pageProps} />
        </main>
        <footer className="border-t border-gray-800 bg-gray-950/80 py-8 px-4 sm:px-6 text-center text-xs text-gray-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span className="text-gray-400 font-semibold">InfraTrack AI</span>
              <span>— Smart India Hackathon 2026 Solution</span>
            </div>
            <p className="text-gray-500">
              Pages Router • Recharts • Tailwind CSS • TypeScript • Strict Dark Mode
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

