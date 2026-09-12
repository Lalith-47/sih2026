import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  HardHat, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Search, 
  Lock, 
  Mail, 
  KeyRound, 
  User as UserIcon,
  RefreshCw,
  ShieldAlert
} from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';
import { getApiBaseUrl, apiFetch } from '@/lib/auth-client';

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'VIEWER';
  createdAt: string;
  _count?: { projects: number };
}

export default function UserManagement() {
  const { t } = useI18n();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'SUPERVISOR' | 'VIEWER'>('ALL');
  
  // New User Modal Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'SUPERVISOR' | 'VIEWER'>('SUPERVISOR');
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const apiBase = getApiBaseUrl();
      const res = await apiFetch(`${apiBase}/api/admin/users`);
      if (res.ok) {
        const data = await res.json();
        if (data.users && Array.isArray(data.users)) {
          setUsers(data.users);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setCreating(true);

    try {
      const apiBase = getApiBaseUrl();
      const res = await apiFetch(`${apiBase}/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword ? newPassword : undefined,
          role: newRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || data.message || 'Failed to provision user');
        setCreating(false);
        return;
      }

      setToastMsg(`Officer "${newName}" provisioned successfully with role ${newRole}!`);
      setModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('SUPERVISOR');
      fetchUsers();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Network error provisioning user');
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (userId: string, targetRole: 'ADMIN' | 'SUPERVISOR' | 'VIEWER') => {
    try {
      const apiBase = getApiBaseUrl();
      const res = await apiFetch(`${apiBase}/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update user role');
        return;
      }

      setToastMsg(`Role updated to ${targetRole}`);
      fetchUsers();
    } catch {
      alert('Error updating user role');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove officer "${userName}"? This cannot be undone.`)) {
      return;
    }

    try {
      const apiBase = getApiBaseUrl();
      const res = await apiFetch(`${apiBase}/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete user');
        return;
      }

      setToastMsg(`Officer "${userName}" removed from system`);
      fetchUsers();
    } catch {
      alert('Error deleting user');
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const supervisorCount = users.filter((u) => u.role === 'SUPERVISOR').length;
  const viewerCount = users.filter((u) => u.role === 'VIEWER').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button
            onClick={() => setToastMsg(null)}
            className="text-emerald-600 dark:text-emerald-400 hover:text-slate-900 dark:hover:text-white font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner & Provision Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 shadow-md transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t('users.title')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              {t('users.subtitle')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setModalOpen(true);
            setErrorMsg(null);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all hover:scale-105"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('users.addOfficer')}</span>
        </button>
      </div>

      {/* Role Breakdown Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-gray-400">Total Officers</span>
          <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-1">{users.length}</div>
          <span className="text-[11px] text-slate-400 dark:text-gray-500">Registered Personnel</span>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Directors (Admin)</span>
            <ShieldCheck className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-mono font-bold text-rose-600 dark:text-rose-400 mt-1">{adminCount}</div>
          <span className="text-[11px] text-slate-400 dark:text-gray-500">Root Command Clearance</span>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Chief Engineers</span>
            <HardHat className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400 mt-1">{supervisorCount}</div>
          <span className="text-[11px] text-slate-400 dark:text-gray-500">Field Progress Updates</span>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Auditors (Viewer)</span>
            <Eye className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-mono font-bold text-amber-600 dark:text-amber-400 mt-1">{viewerCount}</div>
          <span className="text-[11px] text-slate-400 dark:text-gray-500">Read-Only Telemetry View</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 dark:text-gray-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('users.searchPlaceholder')}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {(['ALL', 'ADMIN', 'SUPERVISOR', 'VIEWER'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                roleFilter === r
                  ? 'bg-emerald-500 text-gray-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-gray-900 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700'
              }`}
            >
              {r === 'ALL' ? t('users.allRoles') : r}
            </button>
          ))}

          <button
            type="button"
            onClick={fetchUsers}
            title="Refresh Roster"
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-gray-900 text-slate-600 dark:text-gray-300 hover:text-emerald-500 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Officers Table */}
      <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-gray-900/60 border-b border-slate-200 dark:border-gray-700 text-slate-500 dark:text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="px-5 py-3.5">{t('users.colOfficer')}</th>
                <th className="px-5 py-3.5">{t('users.colRole')}</th>
                <th className="px-5 py-3.5">{t('users.colDelegate')}</th>
                <th className="px-5 py-3.5">{t('users.colEnrolled')}</th>
                <th className="px-5 py-3.5 text-right">{t('users.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-700/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                    <span>{t('users.loading')}</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    {t('users.noOfficers')}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-100/70 dark:hover:bg-gray-750/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-gray-700 flex items-center justify-center font-bold text-slate-700 dark:text-gray-300 text-xs">
                          {u.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                          <div className="text-slate-400 dark:text-gray-400 font-mono text-[11px]">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {u.role === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1 font-mono font-bold uppercase px-2 py-0.5 rounded-full text-[10px] bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
                          <ShieldCheck className="w-3 h-3" />
                          Director (Admin)
                        </span>
                      ) : u.role === 'SUPERVISOR' ? (
                        <span className="inline-flex items-center gap-1 font-mono font-bold uppercase px-2 py-0.5 rounded-full text-[10px] bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800">
                          <HardHat className="w-3 h-3" />
                          Supervisor
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-mono font-bold uppercase px-2 py-0.5 rounded-full text-[10px] bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                          <Eye className="w-3 h-3" />
                          Auditor (Viewer)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                        className="bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-gray-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
                      >
                        <option value="ADMIN">👑 Director (ADMIN)</option>
                        <option value="SUPERVISOR">👷 Chief Engineer (SUPERVISOR)</option>
                        <option value="VIEWER">🔍 Auditor (VIEWER)</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-gray-400 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        title="Remove Officer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision New User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Provision Official Account</h3>
                  <p className="text-[11px] text-slate-400 dark:text-gray-400">Authorized Director Console</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                  Full Name / Officer Title
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Er. Ramesh Deshmukh"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                  Official Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="r.deshmukh@infra.gov.in"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                  Security Passphrase <span className="text-slate-400 font-normal">(Optional for OAuth / SSO)</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave blank to auto-generate (Officer can sign in via Google/Microsoft)"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
                  If left blank, a secure random key is assigned. The officer can log in with Google or Microsoft OAuth using this email.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                  Designated Security Clearance Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewRole('ADMIN')}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      newRole === 'ADMIN'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/50'
                        : 'border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-gray-300'
                    }`}
                  >
                    <div className="font-bold text-xs">Director</div>
                    <div className="text-[10px] text-slate-400">ADMIN</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewRole('SUPERVISOR')}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      newRole === 'SUPERVISOR'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/50'
                        : 'border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-gray-300'
                    }`}
                  >
                    <div className="font-bold text-xs">Engineer</div>
                    <div className="text-[10px] text-slate-400">SUPERVISOR</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewRole('VIEWER')}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      newRole === 'VIEWER'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/50'
                        : 'border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-gray-300'
                    }`}
                  >
                    <div className="font-bold text-xs">Auditor</div>
                    <div className="text-[10px] text-slate-400">VIEWER</div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 text-xs font-semibold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-xs font-bold shadow-md shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Provision Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
