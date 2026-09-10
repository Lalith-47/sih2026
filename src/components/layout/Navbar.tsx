import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Building2, 
  BarChart3, 
  ShieldAlert, 
  PlusCircle, 
  Menu, 
  X, 
  Layers,
  User,
  LogOut,
  LogIn
} from 'lucide-react';
import { useSession, signOut } from '@/lib/auth-client';

export default function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, isPending } = useSession();

  const navLinks = [
    { label: 'Home', href: '/', icon: Building2 },
    { label: 'Public Portal', href: '/projects', icon: BarChart3 },
    { label: 'Admin Dashboard', href: '/admin', icon: ShieldAlert },
    { label: 'Create Project', href: '/admin/new', icon: PlusCircle },
  ];

  const isActive = (href: string) => {
    if (href === '/') return router.pathname === '/';
    return router.pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0A0D14]/90 backdrop-blur-md border-b border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5 text-gray-950 font-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white font-mono">
                  Infra<span className="text-emerald-400">Track</span>
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider bg-emerald-950/60 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-700/50">
                  SIH 2026
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium tracking-wide leading-none">
                National Digital Twin & SCADA
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all duration-150 ${
                    active
                      ? 'bg-gray-800 text-emerald-400 shadow-sm border border-emerald-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-emerald-400' : 'text-gray-400'}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Session / Auth Controls */}
          <div className="hidden lg:flex items-center space-x-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900/80 border border-emerald-500/20 text-xs text-gray-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-emerald-400 font-semibold text-[11px]">TELEMETRY ACTIVE</span>
            </div>

            {isPending ? (
              <div className="h-8 w-20 rounded-lg bg-gray-800 animate-pulse" />
            ) : session?.user ? (
              <div className="flex items-center gap-2.5 pl-2 border-l border-gray-800">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                    {session.user.name?.charAt(0).toUpperCase() || <User className="w-3 h-3" />}
                  </div>
                  <span className="text-gray-200 font-medium max-w-[120px] truncate">
                    {session.user.name || session.user.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-2 rounded-lg bg-gray-900 hover:bg-red-950/40 text-gray-400 hover:text-red-400 border border-gray-800 hover:border-red-900/50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-gray-950 bg-emerald-400 hover:bg-emerald-300 shadow-sm shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Officer Login</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-[#0A0D14]/95 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active
                    ? 'bg-gray-800 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-gray-800">
            {session?.user ? (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-950/30 text-red-400 text-sm border border-red-800/40"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({session.user.name})</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 text-gray-950 font-semibold text-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Officer Login</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
