'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/parcel-utils';
import type { AccountStatus, PageMeta, Role, User } from '@/lib/types';
import { Shield, User as UserIcon, X, Plus } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({ search: '', role: '', isActive: '' });

  function applyFilter(next: Partial<typeof filters>) {
    setFilters({ ...filters, ...next });
    setPage(1);
  }

  const load = useCallback(async () => {
    try {
      const res = await api.getAllUsers({
        page,
        limit,
        search: filters.search || undefined,
        role: (filters.role || undefined) as Role | undefined,
        isActive: (filters.isActive || undefined) as AccountStatus | undefined,
      });
      setUsers(res.data);
      setMeta(res.meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users');
    }
  }, [page, limit, filters.search, filters.role, filters.isActive]);

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
        <div className={`p-3 rounded-xl border text-sm ${error ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
          {error || msg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-accent" />
            User Management
          </h1>
          <p className="text-ink-3 text-[13px] mt-1">System accounts and access control</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/users/new">
            <Plus className="h-4 w-4" /> New account
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className={`space-y-6 ${selected ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="bg-white border border-surface-3 rounded-xl shadow-sm flex flex-col">
            <div className="px-5 pt-5 flex flex-wrap gap-3">
              <input
                className="max-w-xs h-9 rounded-full border border-surface-3 bg-white px-3 text-[13px] text-ink-2 focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none placeholder:text-ink-3 flex-1"
                placeholder="Search name or email"
                value={filters.search}
                onChange={(e) => applyFilter({ search: e.target.value })}
              />
              <select
                className="h-9 rounded-full border border-surface-3 bg-white px-4 text-[13px] text-ink-2 focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none"
                value={filters.role}
                onChange={(e) => applyFilter({ role: e.target.value })}
              >
                <option value="">All roles</option>
                {(['ADMIN', 'SENDER', 'RECEIVER', 'DELIVERY_PERSONNEL', 'PENDING_DELIVERY'] as Role[]).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <select
                className="h-9 rounded-full border border-surface-3 bg-white px-4 text-[13px] text-ink-2 focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none"
                value={filters.isActive}
                onChange={(e) => applyFilter({ isActive: e.target.value })}
              >
                <option value="">Any status</option>
                {(['ACTIVE', 'INACTIVE', 'BLOCKED'] as AccountStatus[]).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="m-5 overflow-x-auto rounded-xl border border-surface-3">
              <table className="w-full text-[13px] text-left">
                <thead className="bg-surface text-[11px] uppercase tracking-wider text-ink-3 border-b border-surface-3">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">User</th>
                    <th className="px-5 py-3.5 font-semibold">Role</th>
                    <th className="px-5 py-3.5 font-semibold">Status</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-3">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-surface transition-colors group cursor-pointer" onClick={() => openUser(u.id)}>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-ink">{u.name}</div>
                        <div className="text-[11px] text-ink-3 mt-0.5">{u.email}</div>
                      </td>
                      <td className="px-5 py-4 text-ink-2">{u.role}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          u.isActive === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                          u.isActive === 'BLOCKED' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                          'bg-surface-2 text-ink-2 border border-surface-3'
                        }`}>
                          {u.isActive}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
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
                            className="text-rose-600 hover:text-rose-600 hover:bg-rose-50"
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
                      <td colSpan={4} className="px-5 py-8 text-center text-ink-3 text-sm font-sans">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 pb-5">
              <Pagination
                meta={meta}
                onPage={setPage}
                onLimit={(n) => { setLimit(n); setPage(1); }}
                busy={busy}
              />
            </div>
          </div>
        </div>

        {selected && (
            <div className="bg-white border border-surface-3 rounded-xl shadow-sm flex flex-col relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-surface-3 opacity-50">
                <Shield size={100} />
              </div>
              <div className="px-5 py-4 border-b border-surface-2 flex items-center justify-between relative z-10 bg-surface-2 backdrop-blur-sm">
                <h2 className="text-[13px] font-bold text-accent uppercase tracking-wider">{selected.name}</h2>
                <button onClick={() => setSelected(null)} className="text-ink-3 hover:text-ink-2">
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 relative z-10">
                <dl className="grid gap-x-4 gap-y-4 grid-cols-2">
                  {[
                    ['Email', selected.email],
                    ['Role', selected.role],
                    ['Status', selected.isActive],
                    ['Verified', selected.isVerified ? 'YES' : 'NO'],
                    ['Phone', selected.phone ?? '-'],
                    ['Joined', formatDate(selected.createdAt).split(',')[0]],
                  ].map(([label, value]) => (
                    <div key={label as string} className="flex flex-col gap-1">
                      <dt className="text-[10px] font-bold tracking-wider text-ink-3 uppercase">{label}</dt>
                      <dd className="text-[12px] text-ink truncate">{value as string}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
        )}
      </div>
    </div>
  );
}
