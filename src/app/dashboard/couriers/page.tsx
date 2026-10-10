'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { api, ApiError } from '@/lib/api';
import { toast } from '@/lib/toast';
import { Pagination } from '@/components/ui/pagination';
import { useAuth } from '@/lib/auth-context';
import type { PageMeta, User } from '@/lib/types';
import { Truck, Clock } from 'lucide-react';

export default function CouriersPage() {
  const { user } = useAuth();
  const role = user?.role;
  const [approved, setApproved] = useState<User[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [couriers, applicants] = await Promise.all([
        api.getCouriers({ page, limit }),
        // Only the total is shown here; the list lives on the applications page.
        api.getPendingCouriers({ page: 1, limit: 1 }),
      ]);
      setApproved(couriers.data);
      setMeta(couriers.meta);
      setPendingCount(applicants.meta.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load delivery partners');
    }
  }, [page, limit]);

  useEffect(() => {
    if (role === 'ADMIN') load();
  }, [load, role]);

  async function run(action: () => Promise<unknown>, success: string) {
    setError('');
    setBusy(true);
    try {
      await action();
      toast.success(success);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Request failed');
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
      {error && (
        <div className="p-3 rounded-xl border text-sm bg-rose-50 border-rose-200 text-rose-600">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink flex items-center gap-2">
            <Truck className="h-5 w-5 text-accent" />
            Courier Operations
          </h1>
          <p className="text-ink-3 text-[13px] mt-1">
            {meta?.total ?? approved.length} approved couriers in the active fleet
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/dashboard/couriers/applications">
            <Clock className="h-4 w-4" /> Applications
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                {pendingCount}
              </span>
            )}
          </Link>
        </Button>
      </div>

      <div className="bg-white border border-surface-3 rounded-xl shadow-sm flex flex-col">
        <div className="m-5 overflow-x-auto rounded-xl border border-surface-3">
          <table className="w-full text-[13px] text-left">
            <thead className="bg-surface text-[11px] uppercase tracking-wider text-ink-3 border-b border-surface-3">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Courier</th>
                <th className="px-5 py-3.5 font-semibold">Email</th>
                <th className="px-5 py-3.5 font-semibold">Phone</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-3">
              {approved.map((u) => (
                <tr key={u.id} className="hover:bg-surface transition-colors">
                  <td className="px-5 py-4 font-semibold text-ink">{u.name}</td>
                  <td className="px-5 py-4 text-ink-2">{u.email}</td>
                  <td className="px-5 py-4 text-ink-2">{u.phone ?? <span className="text-ink-3">—</span>}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                      u.isActive === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                      'bg-rose-50 text-rose-600 border-rose-200'
                    }`}>
                      {u.isActive.charAt(0) + u.isActive.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex gap-1 justify-end">
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
                          className="text-amber-600 hover:text-amber-600 hover:bg-amber-50"
                          disabled={busy}
                          onClick={() => run(() => api.blockUser(u.id), `${u.name} blocked`)}
                        >
                          Block
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-600 hover:text-rose-600 hover:bg-rose-50"
                        disabled={busy}
                        onClick={() =>
                          run(() => api.rejectCourier(u.id), `${u.name} moved back to sender`)
                        }
                      >
                        Revoke
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {approved.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-ink-3 text-sm">
                    No approved couriers yet.
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
