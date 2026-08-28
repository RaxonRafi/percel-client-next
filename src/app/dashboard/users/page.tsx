'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/parcel-utils';
import type { AccountStatus, PageMeta, Role, User } from '@/lib/types';
import { Shield, ShieldAlert, User as UserIcon, Settings, X, Plus } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', role: '', isActive: '' });

  function applyFilter(next: Partial<typeof filters>) {
    setFilters({ ...filters, ...next });
    setPage(1);
  }

  const [adminForm, setAdminForm] = useState<{
    name: string;
    email: string;
    password: string;
    role: Role;
  }>({ name: '', email: '', password: '', role: 'ADMIN' });

  const load = useCallback(async () => {
    try {
      const res = await api.getAllUsers({
        page,
        limit: 20,
        search: filters.search || undefined,
        role: (filters.role || undefined) as Role | undefined,
        isActive: (filters.isActive || undefined) as AccountStatus | undefined,
      });
      setUsers(res.data);
      setMeta(res.meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users');
    }
  }, [page, filters.search, filters.role, filters.isActive]);

  useEffect(() => {
    load();
  }, [load]);

  async function run(action: () => Promise<unknown>, success: string) {
    setError('');
    setMsg('');
    setBusy(true);
    try {
      await action();
      setMsg(success);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Request failed');
    } finally {
      setBusy(false);
    }
  }

  async function openUser(id: string) {
    setError('');
    try {
      setSelected(await api.getUser(id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load user');
    }
  }

  return (
    <div className="space-y-6 animate-fade-in relative">
      {(error || msg) && (
        <div className={`p-3 rounded-lg border text-sm font-mono ${error ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
          {error || msg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-cyan-500" />
            User Management
          </h1>
          <p className="text-slate-500 text-[13px] mt-1 font-mono tracking-wide">SYSTEM ACCOUNTS AND ACCESS CONTROL</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg flex flex-col">
            <div className="p-4 border-b border-slate-800/60 bg-slate-900/50 flex flex-wrap gap-3">
              <input
                className="max-w-xs h-9 rounded border border-slate-800 bg-slate-950 px-3 text-[13px] text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none placeholder:text-slate-600 font-mono flex-1"
                placeholder="SEARCH NAME/EMAIL"
                value={filters.search}
                onChange={(e) => applyFilter({ search: e.target.value })}
              />
              <select
                className="h-9 rounded border border-slate-800 bg-slate-950 px-3 text-[13px] text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none font-mono"
                value={filters.role}
                onChange={(e) => applyFilter({ role: e.target.value })}
              >
                <option value="">ALL ROLES</option>
                {(['ADMIN', 'SENDER', 'RECEIVER', 'DELIVERY_PERSONNEL', 'PENDING_DELIVERY'] as Role[]).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <select
                className="h-9 rounded border border-slate-800 bg-slate-950 px-3 text-[13px] text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none font-mono"
                value={filters.isActive}
                onChange={(e) => applyFilter({ isActive: e.target.value })}
              >
                <option value="">ANY STATUS</option>
                {(['ACTIVE', 'INACTIVE', 'BLOCKED'] as AccountStatus[]).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-[13px] text-left">
                <thead className="bg-slate-900/50 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-800/60">
                  <tr>
                    <th className="px-5 py-3 font-semibold">User</th>
                    <th className="px-5 py-3 font-semibold">Role</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/20 transition-colors group cursor-pointer" onClick={() => openUser(u.id)}>
                      <td className="px-5 py-3">
                        <div className="font-bold text-cyan-400 font-sans">{u.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{u.email}</div>
                      </td>
                      <td className="px-5 py-3 text-slate-300">{u.role}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                          u.isActive === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          u.isActive === 'BLOCKED' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                          'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {u.isActive}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        {u.isActive === 'BLOCKED' ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={busy}
                            onClick={() => run(() => api.unblockUser(u.id), `${u.name} unblocked`)}
                          >
                            Unblock
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                            disabled={busy}
                            onClick={() => run(() => api.blockUser(u.id), `${u.name} blocked`)}
                          >
                            Block
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-slate-500 text-sm font-sans">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-800/60">
              <Pagination meta={meta} onPage={setPage} busy={busy} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg flex flex-col">
            <div className="px-5 py-4 border-b border-slate-800/60 flex items-center gap-2">
              <Plus className="h-4 w-4 text-cyan-500" />
              <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate-300">Provision Account</h2>
            </div>
            <form
              className="p-5 flex flex-col gap-4 font-mono text-sm"
              onSubmit={async (e) => {
                e.preventDefault();
                await run(() => api.register(adminForm), `${adminForm.role} account created`);
                setAdminForm({ name: '', email: '', password: '', role: 'ADMIN' });
              }}
            >
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">Name</label>
                <input
                  className="w-full h-9 rounded border border-slate-800 bg-slate-950 px-3 text-[13px] text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">Email</label>
                <input
                  type="email"
                  className="w-full h-9 rounded border border-slate-800 bg-slate-950 px-3 text-[13px] text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">Temp Password</label>
                <input
                  type="password"
                  className="w-full h-9 rounded border border-slate-800 bg-slate-950 px-3 text-[13px] text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">Role</label>
                <select
                  className="w-full h-9 rounded border border-slate-800 bg-slate-950 px-3 text-[13px] text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none"
                  value={adminForm.role}
                  onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value as Role })}
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="SENDER">SENDER</option>
                  <option value="RECEIVER">RECEIVER</option>
                </select>
              </div>
              <Button type="submit" disabled={busy} className="mt-2 w-full">Create Account</Button>
            </form>
          </div>
          
          {selected && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg flex flex-col relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-slate-800/30 opacity-50">
                <Shield size={100} />
              </div>
              <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between relative z-10 bg-slate-900/80 backdrop-blur-sm">
                <h2 className="text-[13px] font-bold text-cyan-400 uppercase tracking-wider">{selected.name}</h2>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-300">
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 relative z-10">
                <dl className="grid gap-x-4 gap-y-4 grid-cols-2 font-mono">
                  {[
                    ['Email', selected.email],
                    ['Role', selected.role],
                    ['Status', selected.isActive],
                    ['Verified', selected.isVerified ? 'YES' : 'NO'],
                    ['Phone', selected.phone ?? '-'],
                    ['Joined', formatDate(selected.createdAt).split(',')[0]],
                  ].map(([label, value]) => (
                    <div key={label as string} className="flex flex-col gap-1">
                      <dt className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">{label}</dt>
                      <dd className="text-[12px] text-slate-200 truncate">{value as string}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
