import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Building2,
  HardHat,
  Eye,
  Shield,
  Check,
  Ban,
  Sparkles,
  X
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useI18n } from '@/lib/i18n-context';

export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'VIEWER';

interface AuthCardProps {
  initialMode?: 'signin' | 'signup';
  onSuccess?: () => void;
}

export default function AuthCard({ initialMode = 'signin', onSuccess }: AuthCardProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'microsoft' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [unregisteredNotice, setUnregisteredNotice] = useState(false);

  React.useEffect(() => {
    if (router.query.error) {
      const err = String(router.query.error);
      if (err === 'state_mismatch') {
        setError('OAuth state verification failed. Please try clicking the button again.');
      } else if (err === 'signup_disabled' || err.includes('signup_disabled') || err === 'account_not_found') {
        setUnregisteredNotice(true);
        setMode('signup');
        setSelectedRole('SUPERVISOR');
        setError(null);
      } else {
        setError(`Authentication error: ${err}`);
      }
    }
  }, [router.query.error]);

  // Dynamic roles configuration wired directly to i18n
  const rolesConfig = [
    {
      id: 'ADMIN' as const,
      title: t('auth.directorAdmin', 'Director (Admin)'),
      badge: t('auth.level3Root', 'Level 3 Root'),
      clearance: t('auth.fullCommandControl', 'Full Command & System Control'),
      icon: Building2,
      color: 'text-emerald-700 dark:text-emerald-400',
      borderColor: 'border-emerald-500',
      bgLight: 'bg-emerald-50/80',
      bgDark: 'dark:bg-emerald-950/40',
      allowed: [
        t('auth.adminPerm1', 'Create new project baselines (/admin/new)'),
        t('auth.adminPerm2', 'Commit multi-modal field updates & milestones'),
        t('auth.adminPerm3', 'Manage & reassign all national corridors'),
        t('auth.adminPerm4', 'Full administrative overrides & audit control'),
      ],
      restricted: [],
    },
    {
      id: 'SUPERVISOR' as const,
      title: t('auth.chiefEngineer', 'Chief Engineer (Supervisor)'),
      badge: t('auth.level2Field', 'Level 2 Field'),
      clearance: t('auth.operationalExecution', 'Operational Execution'),
      icon: HardHat,
      color: 'text-blue-700 dark:text-blue-400',
      borderColor: 'border-blue-500',
      bgLight: 'bg-blue-50/80',
      bgDark: 'dark:bg-blue-950/40',
      allowed: [
        t('auth.supPerm1', 'Submit multi-modal progress updates (voice/text)'),
        t('auth.supPerm2', 'Monitor assigned sector projects & milestones'),
        t('auth.supPerm3', 'Flag site issues & update S-curve progress'),
      ],
      restricted: [
        t('auth.supRest1', 'Cannot create new project baselines (403 Gate)'),
        t('auth.supRest2', 'Cannot reassign root agency contracts'),
      ],
    },
    {
      id: 'VIEWER' as const,
      title: t('auth.auditorViewer', 'Auditor (Viewer)'),
      badge: t('auth.level1Audit', 'Level 1 Audit'),
      clearance: t('auth.readOnlyTransparency', 'Read-Only Transparency'),
      icon: Eye,
      color: 'text-amber-700 dark:text-amber-400',
      borderColor: 'border-amber-500',
      bgLight: 'bg-amber-50/80',
      bgDark: 'dark:bg-amber-950/40',
      allowed: [
        t('auth.viewPerm1', 'Real-time S-Curve, KPI telemetry & maps'),
        t('auth.viewPerm2', 'Inspect historical submissions & audit logs'),
        t('auth.viewPerm3', 'View public project transparency metrics'),
      ],
      restricted: [
        t('auth.viewRest1', 'Cannot submit field progress updates'),
        t('auth.viewRest2', 'Cannot create project baselines (403 Gate)'),
        t('auth.viewRest3', 'Zero modification permissions (Read-Only)'),
      ],
    },
  ];

  const activeRoleDef = rolesConfig.find((r) => r.id === selectedRole) || rolesConfig[0];

  const handleRoleSelect = (roleId: UserRole) => {
    setSelectedRole(roleId);
    setError(null);
  };

  const syncRoleToBackend = async (role: UserRole) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      await fetch(`${apiBase}/api/me/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role }),
      });
    } catch {
      // Non-blocking fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
        if (mode === 'signup') {
          if (selectedRole === 'ADMIN') {
            setError('Administrative accounts cannot be self-registered. Existing Directors provision Admin accounts through the Command Console.');
            setLoading(false);
            return;
          }

          const { error: signUpError } = await authClient.signUp.email({
            email,
            password,
            name: name.trim() || email.split('@')[0],
          });

          if (signUpError) {
            setError(signUpError.message || 'Failed to create account. Please check credentials.');
            setLoading(false);
            return;
          }

          // Apply chosen role to new user record
          await syncRoleToBackend(selectedRole);

          setSuccessMsg(t('auth.authenticating', `Account created as ${selectedRole}! Redirecting...`));
          setTimeout(() => {
            if (onSuccess) onSuccess();
            else router.push('/admin');
          }, 800);
        } else {
        const targetEmail = email.includes('@')
          ? email.trim()
          : `${email.trim().toLowerCase()}@infra.gov.in`;

        const { error: signInError } = await authClient.signIn.email({
          email: targetEmail,
          password,
        });

        if (signInError) {
          setError(signInError.message || 'Invalid email or password.');
          setLoading(false);
          return;
        }

        setSuccessMsg(t('auth.authenticating', `Access Granted! Initializing Command Portal...`));
        setTimeout(() => {
          if (onSuccess) onSuccess();
          else router.push('/admin');
        }, 500);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'microsoft') => {
    setError(null);
    setOauthLoading(provider);
    try {
      const callbackURL = typeof window !== 'undefined' ? `${window.location.origin}/admin` : '/admin';
      const errorCallbackURL = typeof window !== 'undefined' ? `${window.location.origin}/login` : '/login';
      const res = await authClient.signIn.social({
        provider,
        callbackURL,
        newUserCallbackURL: callbackURL,
        errorCallbackURL,
      });
      if (res?.data?.url) {
        window.location.href = res.data.url;
        return;
      }
      if (res?.error) {
        const msg = res.error.message;
        const providerName = provider === 'google' ? 'Google' : 'Microsoft';
        const envVar = provider === 'google' ? 'GOOGLE_CLIENT_ID' : 'MICROSOFT_CLIENT_ID';
        setError(
          msg ||
          `Unable to initiate ${providerName} OAuth. Ensure DATABASE_URL and ${envVar} are set in your backend environment.`
        );
        setOauthLoading(null);
      }
    } catch (err: unknown) {
      const providerName = provider === 'google' ? 'Google' : 'Microsoft';
      setError(
        err instanceof Error
          ? err.message
          : `Failed to initiate ${providerName} sign-in. Check backend connection.`
      );
      setOauthLoading(null);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-gray-900/90 backdrop-blur-2xl border border-slate-200 dark:border-gray-800 shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Decorative ambient gradient */}
      <div className="absolute -top-24 -right-24 w-52 h-52 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-6 relative">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-blue-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 mb-2.5 shadow-inner">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {mode === 'signin' ? t('auth.signInTitle', 'Officer Security Verification') : t('auth.signUpTitle', 'Register Official Sentinel Account')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 font-medium">
          {t('auth.subtitle', 'National Infrastructure Monitoring • Smart India Hackathon 2026')}
        </p>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 p-1 mt-4 rounded-xl bg-slate-100 dark:bg-gray-950/70 border border-slate-200 dark:border-gray-800">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
              setEmail('');
              setPassword('');
            }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('auth.signInTab', 'Sign In')}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
              setEmail('');
              setPassword('');
              if (selectedRole === 'ADMIN') {
                setSelectedRole('SUPERVISOR');
              }
            }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('auth.signUpTab', 'Register')}
          </button>
        </div>
      </div>

      {/* SECTION: LOGIN AS WHAT ROLE (RBAC Selector) */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              {mode === 'signin' 
                ? t('auth.roleSelectionTitle', 'Select Role Designation')
                : t('auth.signupRoleTitle', 'Select Official Role Designation')}
            </span>
          </label>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
            {mode === 'signin' ? 'ℹ️ Credentials Guide' : t('auth.assignedClearance', 'Designated Role')}
          </span>
        </div>

        {/* Role Options Grid - Admin role strictly restricted from public signup */}
        <div className={`grid ${mode === 'signup' ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
          {rolesConfig
            .filter((role) => mode === 'signin' || role.id !== 'ADMIN')
            .map((role) => {
              const isSelected = selectedRole === role.id;
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleSelect(role.id)}
                  className={`p-2.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? `${role.borderColor} ${role.bgLight} ${role.bgDark} ring-2 ring-emerald-500/30 shadow-md`
                      : 'border-slate-200 dark:border-gray-800 bg-slate-50/60 dark:bg-gray-950/40 hover:border-slate-300 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${isSelected ? 'bg-white dark:bg-gray-900 shadow-sm' : 'bg-slate-200 dark:bg-gray-800'}`}>
                      <Icon className={`w-4 h-4 ${isSelected ? role.color : 'text-slate-500 dark:text-gray-400'}`} />
                    </div>
                    <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/80 dark:bg-gray-900/80 ' + role.color : 'text-slate-400 dark:text-gray-500'}`}>
                      {role.id}
                    </span>
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-gray-400'}`}>
                      {role.title}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-gray-500 line-clamp-1">
                      {role.badge}
                    </div>
                  </div>
                </button>
              );
            })}
        </div>

        {/* Security Notification for Admin Role Restriction on Sign Up */}
        {mode === 'signup' && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
            <Lock className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="leading-tight">
              <span className="font-bold block text-[11px] text-amber-900 dark:text-amber-200">
                🔒 Director (Admin) Clearance Restricted
              </span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400">
                Administrative accounts cannot be self-registered. Only active Directors can provision and assign Admin clearance from the Command Console.
              </span>
            </div>
          </div>
        )}

        {/* Active Role Permissions Card */}
        <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-gray-950/60 border border-slate-200 dark:border-gray-800/80 text-xs transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-slate-800 dark:text-gray-200 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${selectedRole === 'ADMIN' ? 'bg-emerald-500' : selectedRole === 'SUPERVISOR' ? 'bg-blue-500' : 'bg-amber-500'}`} />
              <span>{activeRoleDef.title}:</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-gray-400">
              {activeRoleDef.clearance}
            </span>
          </div>

          <div className="space-y-1">
            {activeRoleDef.allowed.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-gray-300">
                <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
            {activeRoleDef.restricted.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-400">
                <Ban className="w-3 h-3 text-rose-500 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sweet First-Time Sign In Welcome Notice */}
      {unregisteredNotice && (
        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 dark:border-emerald-500/30 backdrop-blur-sm shadow-sm animate-fadeIn relative">
          <button
            type="button"
            onClick={() => setUnregisteredNotice(false)}
            className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-gray-200 transition-colors"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-3 pr-6">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-gray-950 flex-shrink-0 shadow-md shadow-emerald-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Welcome to InfraTrack!</span>
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono">
                  First-Time Sign In
                </span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Your sign-in was verified successfully! Since this is your first time here, please enter a few quick details below to set up your profile and get started.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alert Messages */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-300">
          <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
              {t('auth.fullNameLabel', 'Full Name / Officer Designation')}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 dark:text-gray-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. A. K. Sharma"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-gray-950/70 border border-slate-200 dark:border-gray-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
            Username
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 dark:text-gray-500 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Input username"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-gray-950/70 border border-slate-200 dark:border-gray-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 dark:text-gray-500 absolute left-3.5 top-3" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Input password"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-gray-950/70 border border-slate-200 dark:border-gray-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all duration-200 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('auth.authenticating', 'Verifying Sentinel Credentials...')}</span>
            </>
          ) : (
            <>
              <span>
                {mode === 'signin' 
                  ? `${t('auth.signInBtn', 'Sign In')} (${selectedRole})`
                  : `${t('auth.signUpBtn', 'Register Account')} (${selectedRole})`
                }
              </span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Social OAuth Section */}
      <div className="mt-5">
        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-slate-200 dark:border-gray-800 w-full" />
          <span className="bg-white dark:bg-gray-900 px-3 text-[10px] uppercase tracking-wider text-slate-400 dark:text-gray-500 font-semibold absolute">
            or continue with
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mt-3">
          {/* Google OAuth (Priority 1) */}
          <button
            type="button"
            onClick={() => handleSocialSignIn('google')}
            disabled={oauthLoading !== null || loading}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-gray-950/70 hover:bg-slate-100 dark:hover:bg-gray-800/80 border border-slate-200 dark:border-gray-800 text-xs font-semibold text-slate-700 dark:text-gray-200 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {oauthLoading === 'google' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14.1s.6 4.9 1.6 6.9l3.7-2.9c-.2-.7-.4-1.5-.4-2.3z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 15.9C3.5 19.8 7.4 23 12 23z"
                />
              </svg>
            )}
            <span>Google</span>
          </button>

          {/* Microsoft OAuth (Priority 2) */}
          <button
            type="button"
            onClick={() => handleSocialSignIn('microsoft')}
            disabled={oauthLoading !== null || loading}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-gray-950/70 hover:bg-slate-100 dark:hover:bg-gray-800/80 border border-slate-200 dark:border-gray-800 text-xs font-semibold text-slate-700 dark:text-gray-200 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {oauthLoading === 'microsoft' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 23 23">
                <rect fill="#F25022" x="1" y="1" width="10" height="10" />
                <rect fill="#7FBA00" x="12" y="1" width="10" height="10" />
                <rect fill="#00A4EF" x="1" y="12" width="10" height="10" />
                <rect fill="#FFB900" x="12" y="12" width="10" height="10" />
              </svg>
            )}
            <span>Microsoft</span>
          </button>
        </div>
      </div>
    </div>
  );
}
