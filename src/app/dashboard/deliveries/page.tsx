'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/use-auth';
import { COURIER_STATUSES, type Parcel, type ParcelStatus } from '@/lib/types';
import { formatDate, formatStatus, statusPillClass } from '@/lib/parcel-utils';

export default function DeliveriesPage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<Parcel[]>([]);
  const [completed, setCompleted] = useState<Parcel[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { status: ParcelStatus; note: string }>>({});
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [active, done] = await Promise.all([
        api.getAssignedParcels(),
        api.getCompletedDeliveries(),
      ]);
      setQueue(active);
      setCompleted(done);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load your deliveries');
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'DELIVERY_PERSONNEL') load();
  }, [load, user]);

  async function updateStatus(parcel: Parcel) {
    const draft = drafts[parcel.id] ?? { status: parcel.status, note: '' };
    setError('');
    setMsg('');
    setBusy(true);
    try {
      await api.updateParcelStatus(parcel.trackingId, draft.status, draft.note || undefined);
      setMsg(`${parcel.trackingId} marked ${formatStatus(draft.status)}`);
      setDrafts({ ...drafts, [parcel.id]: { ...draft, note: '' } });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update status');
    } finally {
      setBusy(false);
    }
  }

  if (user && user.role !== 'DELIVERY_PERSONNEL') {
    return (
      <p className="text-ink-3">
        {user.role === 'PENDING_DELIVERY'
          ? 'Your delivery partner application is still under review.'
          : 'This page is for approved delivery partners.'}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {msg && <p className="text-sm text-green">{msg}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Active queue</CardTitle>
          <Badge variant={queue.length > 0 ? 'transit' : 'default'}>{queue.length} assigned</Badge>
        </CardHeader>
        <div className="space-y-4">
          {queue.map((p) => {
            const draft = drafts[p.id] ?? { status: p.status, note: '' };
            return (
              <div key={p.id} className="rounded-[var(--radius-md)] border border-surface-3 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{p.trackingId}</p>
                    <p className="text-xs text-ink-3">Updated {formatDate(p.updatedAt)}</p>
                  </div>
                  <span className={statusPillClass(p.status)}>{formatStatus(p.status)}</span>
                </div>

                <div className="mb-3 grid gap-2 text-sm md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase text-ink-3">Pick up</p>
                    <p>{p.pickupAddress}</p>
                    <p className="text-xs text-ink-3">
                      {p.senderName}{p.senderPhone ? ` · ${p.senderPhone}` : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-ink-3">Deliver to</p>
                    <p>{p.deliveryAddress}</p>
                    <p className="text-xs text-ink-3">
                      {p.receiverName}{p.receiverPhone ? ` · ${p.receiverPhone}` : ''}
                    </p>
                  </div>
                </div>

                {p.description && (
                  <p className="mb-3 text-sm text-ink-2">Note: {p.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  {/* A courier may only set these four — anything else is a 403. */}
                  <select
                    className="h-9 rounded-md border border-surface-3 bg-white px-2 text-xs"
                    value={draft.status}
                    onChange={(e) =>
                      setDrafts({
                        ...drafts,
                        [p.id]: { ...draft, status: e.target.value as ParcelStatus },
                      })
                    }
                  >
                    {COURIER_STATUSES.map((s) => (
                      <option key={s} value={s}>{formatStatus(s)}</option>
                    ))}
                  </select>
                  <input
                    className="h-9 w-48 rounded-md border border-surface-3 px-2 text-xs"
                    placeholder="Note (optional)"
                    value={draft.note}
                    onChange={(e) =>
                      setDrafts({ ...drafts, [p.id]: { ...draft, note: e.target.value } })
                    }
                  />
                  <Button
                    size="sm"
                    disabled={busy || draft.status === p.status}
                    onClick={() => updateStatus(p)}
                  >
                    Update status
                  </Button>
                </div>
              </div>
            );
          })}
          {queue.length === 0 && (
            <p className="py-6 text-center text-ink-3">Nothing assigned to you right now.</p>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Completed deliveries</CardTitle>
          <Badge variant="delivered">{completed.length} done</Badge>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-2 text-xs uppercase text-ink-3">
                <th className="pb-3 text-left">Tracking</th>
                <th className="pb-3 text-left">Delivered to</th>
                <th className="pb-3 text-left">Status</th>
                <th className="pb-3 text-left">Completed</th>
              </tr>
            </thead>
            <tbody>
              {completed.map((p) => (
                <tr key={p.id} className="border-b border-surface-2">
                  <td className="py-3 font-medium">{p.trackingId}</td>
                  <td className="py-3 text-ink-3">{p.receiverName} · {p.deliveryAddress}</td>
                  <td className="py-3">
                    <span className={statusPillClass(p.status)}>{formatStatus(p.status)}</span>
                  </td>
                  <td className="py-3 text-ink-3">{formatDate(p.updatedAt)}</td>
                </tr>
              ))}
              {completed.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-ink-3">
                    No completed deliveries yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
