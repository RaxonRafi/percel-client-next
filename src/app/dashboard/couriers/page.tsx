'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { api, ApiError } from '@/lib/api';
import { Pagination } from '@/components/ui/pagination';
import { formatDate } from '@/lib/parcel-utils';
import { useAuth } from '@/lib/auth-context';
import type { PageMeta, User } from '@/lib/types';
import { Users, Truck, Clock, CheckCircle } from 'lucide-react';

export default function CouriersPage() {
  const { user } = useAuth();
  const role = user?.role;
  const [pending, setPending] = useState<User[]>([]);
  const [approved, setApproved] = useState<User[]>([]);
  const [pendingMeta, setPendingMeta] = useState<PageMeta | null>(null);
  const [approvedMeta, setApprovedMeta] = useState<PageMeta | null>(null);
  const [pendingPage, setPendingPage] = useState(1);
  const [approvedPage, setApprovedPage] = useState(1);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [applicants, couriers] = await Promise.all([
        api.getPendingCouriers({ page: pendingPage, limit: 20 }),
        api.getCouriers({ page: approvedPage, limit: 20 }),
      ]);
      setPending(applicants.data);
      setPendingMeta(applicants.meta);
      setApproved(couriers.data);
      setApprovedMeta(couriers.meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load delivery partners');
    }
  }, [pendingPage, approvedPage]);

  useEffect(() => {
    if (role === 'ADMIN') load();
  }, [load, role]);

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

  if (user && user.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <div className="bg-slate-900/50 p-8 rounded-lg border border-slate-800">
          <Truck className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-300 font-mono tracking-wider uppercase mb-2">Access Denied</h2>
          <p className="text-slate-500 font-mono text-sm max-w-md">Only system administrators can review and manage delivery partners.</p>
        </div>
      </div>
    );
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
            <Truck className="h-5 w-5 text-cyan-500" />
            Courier Operations
          </h1>
          <p className="text-slate-500 text-[13px] mt-1 font-mono tracking-wide">FLEET PERSONNEL MANAGEMENT & ONBOARDING</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg flex flex-col h-full">
            <div className="p-5 border-b border-slate-800/60 bg-slate-900/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <h2 className="text-[13px] font-bold text-slate-300 uppercase tracking-wider">Pending Applications</h2>
              </div>
              <div className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                (pendingMeta?.total ?? pending.length) > 0 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {pendingMeta?.total ?? pending.length} WAITING
              </div>
            </div>
            
            <div className="px-5 py-4 bg-slate-900/30 border-b border-slate-800/60">
              <p className="text-[11px] font-mono text-slate-500 leading-relaxed uppercase">
                Applicants are <span className="text-slate-300">PENDING_DELIVERY</span> and cannot take assignments. 
                Rejecting reverts them to a standard sender account so they can apply again later.
              </p>
            </div>
            
            <div className="overflow-x-auto custom-scrollbar flex-1">
              <table className="w-full text-[13px] text-left">
                <thead className="bg-slate-900/50 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-800/60">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Applicant</th>
                    <th className="px-5 py-3 font-semibold">Contact</th>
                    <th className="px-5 py-3 font-semibold">Applied</th>
                    <th className="px-5 py-3 font-semibold text-right">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {pending.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-5 py-3 font-bold text-cyan-400 font-sans">{u.name}</td>
                      <td className="px-5 py-3 text-slate-400">
                        <div className="text-[11px]">{u.email}</div>
                        {u.phone && <div className="text-[10px] text-slate-500 mt-0.5">{u.phone}</div>}
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-[11px]">{formatDate(u.createdAt).split(',')[0]}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={busy}
                            onClick={() => run(() => api.approveCourier(u.id), `${u.name} approved`)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                            disabled={busy}
                            onClick={() => run(() => api.rejectCourier(u.id), `${u.name} rejected`)}
                          >
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pending.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center text-slate-500 text-sm font-sans">
                        No applications waiting.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {pending.length > 0 && (
              <div className="p-4 border-t border-slate-800/60">
                <Pagination meta={pendingMeta} onPage={setPendingPage} busy={busy} />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg flex flex-col h-full">
            <div className="p-5 border-b border-slate-800/60 bg-slate-900/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <h2 className="text-[13px] font-bold text-slate-300 uppercase tracking-wider">Active Fleet</h2>
              </div>
              <div className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {approvedMeta?.total ?? approved.length} APPROVED
              </div>
            </div>
            
            <div className="overflow-x-auto custom-scrollbar flex-1">
              <table className="w-full text-[13px] text-left">
                <thead className="bg-slate-900/50 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-800/60">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Courier</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {approved.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-bold text-cyan-400 font-sans">{u.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{u.email}</div>
                        {u.phone && <div className="text-[10px] text-slate-500">{u.phone}</div>}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
                          u.isActive === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        }`}>
                          {u.isActive}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex gap-1">
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
                                className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                                disabled={busy}
                                onClick={() => run(() => api.blockUser(u.id), `${u.name} blocked`)}
                              >
                                Block
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                              disabled={busy}
                              onClick={() =>
                                run(() => api.rejectCourier(u.id), `${u.name} moved back to sender`)
                              }
                            >
                              Revoke
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {approved.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-5 py-12 text-center text-slate-500 text-sm font-sans">
                        No approved couriers yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {approved.length > 0 && (
              <div className="p-4 border-t border-slate-800/60">
                <Pagination meta={approvedMeta} onPage={setApprovedPage} busy={busy} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
