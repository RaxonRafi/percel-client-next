'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { api, ApiError } from '@/lib/api';
import { Pagination } from '@/components/ui/pagination';
import { formatDate } from '@/lib/parcel-utils';
import { useAuth } from '@/lib/auth-context';
import type { PageMeta, User } from '@/lib/types';
import { ArrowLeft, Clock, Truck } from 'lucide-react';

export default function CourierApplicationsPage() {
  const { user } = useAuth();
  const role = user?.role;
  const [pending, setPending] = useState<User[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const applicants = await api.getPendingCouriers({ page, limit });
      setPending(applicants.data);
      setMeta(applicants.meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load applications');
    }
  }, [page, limit]);

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
        <div className="bg-surface p-8 rounded-xl border border-surface-3">
          <Truck className="h-12 w-12 text-ink-3 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-ink-2 mb-2">Access denied</h2>
          <p className="text-ink-3 text-sm max-w-md">Only system administrators can review and manage delivery partners.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in relative">
      {(error || msg) && (
        <div className={`p-3 rounded-xl border text-sm ${error ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
          {error || msg}
        </div>
      )}

      <div>
        <Link
          href="/dashboard/couriers"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-3 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to couriers
        </Link>
        <h1 className="mt-3 text-xl font-bold text-ink flex items-center gap-2">
          <Clock className="h-5 w-5 text-accent" />
          Courier Applications
        </h1>
        <p className="text-ink-3 text-[13px] mt-1 max-w-2xl">
          Applicants cannot take assignments until approved. Rejecting reverts them to a
          standard sender account so they can apply again later.
        </p>
      </div>

      <div className="bg-white border border-surface-3 rounded-xl shadow-sm flex flex-col">
        <div className="m-5 overflow-x-auto rounded-xl border border-surface-3">
          <table className="w-full text-[13px] text-left">
            <thead className="bg-surface text-[11px] uppercase tracking-wider text-ink-3 border-b border-surface-3">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Applicant</th>
                <th className="px-5 py-3.5 font-semibold">Email</th>
                <th className="px-5 py-3.5 font-semibold">Phone</th>
                <th className="px-5 py-3.5 font-semibold">Applied</th>
                <th className="px-5 py-3.5 font-semibold text-right">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-3">
              {pending.map((u) => (
                <tr key={u.id} className="hover:bg-surface transition-colors">
                  <td className="px-5 py-4 font-semibold text-ink">{u.name}</td>
                  <td className="px-5 py-4 text-ink-2">{u.email}</td>
                  <td className="px-5 py-4 text-ink-2">{u.phone ?? <span className="text-ink-3">—</span>}</td>
                  <td className="px-5 py-4 text-ink-3">{formatDate(u.createdAt).split(',')[0]}</td>
                  <td className="px-5 py-4 text-right">
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
                        className="text-rose-600 hover:text-rose-600 hover:bg-rose-50"
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
                  <td colSpan={5} className="px-5 py-12 text-center text-ink-3 text-sm">
                    No applications waiting.
                  </td>
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
  );
}
