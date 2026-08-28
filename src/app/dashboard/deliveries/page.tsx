'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { DeliveryProofForm } from '@/components/delivery-proof-form';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { PageMeta, Parcel, ParcelStatus } from '@/lib/types';
import {
  allowedTransitions, formatDate, formatMoney, formatStatus, isTerminal, statusPillClass,
} from '@/lib/parcel-utils';

export default function DeliveriesPage() {
  const { user } = useAuth();
  const role = user?.role;
  const [queue, setQueue] = useState<Parcel[]>([]);
  const [completed, setCompleted] = useState<Parcel[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { status: ParcelStatus; note: string }>>({});
  const [proofFor, setProofFor] = useState<Parcel | null>(null);
  const [queueMeta, setQueueMeta] = useState<PageMeta | null>(null);
  const [doneMeta, setDoneMeta] = useState<PageMeta | null>(null);
  const [queuePage, setQueuePage] = useState(1);
  const [donePage, setDonePage] = useState(1);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [active, done] = await Promise.all([
        api.getAssignedParcels({ page: queuePage, limit: 20 }),
        api.getCompletedDeliveries({ page: donePage, limit: 20 }),
      ]);
      setQueue(active.data);
      setQueueMeta(active.meta);
      setCompleted(done.data);
      setDoneMeta(done.meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load your deliveries');
    }
  }, [queuePage, donePage]);

  useEffect(() => {
    if (role === 'DELIVERY_PERSONNEL') load();
  }, [load, role]);

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
          <Badge variant={(queueMeta?.total ?? queue.length) > 0 ? 'transit' : 'default'}>{queueMeta?.total ?? queue.length} assigned</Badge>
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

                <div className="mb-3 flex flex-wrap gap-4 text-sm">
                  <span className="text-ink-3">
                    Weight <span className="text-ink">{p.weightKg} kg</span>
                  </span>
                  <span className="text-ink-3">
                    Fee <span className="text-ink">{formatMoney(p.deliveryFee)}</span>
                  </span>
                  {p.codAmount > 0 ? (
                    <span className="font-medium text-amber">
                      Collect {formatMoney(p.codAmount)}
                    </span>
                  ) : (
                    <span className="text-ink-3">Prepaid</span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* The legal next moves only, minus the ones couriers may not set. */}
                  <select
                    className="h-9 rounded-md border border-surface-3 bg-white px-2 text-xs"
                    value={draft.status}
                    disabled={isTerminal(p.status)}
                    onChange={(e) =>
                      setDrafts({
                        ...drafts,
                        [p.id]: { ...draft, status: e.target.value as ParcelStatus },
                      })
                    }
                  >
                    <option value={p.status}>{formatStatus(p.status)}</option>
                    {/* DELIVERED is reached through the proof form instead, so
                        the COD check and deliveredAt stamp are never skipped. */}
                    {allowedTransitions(p.status, 'DELIVERY_PERSONNEL')
                      .filter((s) => s !== 'DELIVERED')
                      .map((s) => (
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
                    variant="secondary"
                    disabled={busy || draft.status === p.status}
                    onClick={() => updateStatus(p)}
                  >
                    Update status
                  </Button>
                  {allowedTransitions(p.status, 'DELIVERY_PERSONNEL').includes('DELIVERED') && (
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() => setProofFor(proofFor?.id === p.id ? null : p)}
                    >
                      Complete delivery
                    </Button>
                  )}
                </div>

                {proofFor?.id === p.id && (
                  <DeliveryProofForm
                    parcel={p}
                    onCancel={() => setProofFor(null)}
                    onDone={async (message) => {
                      setProofFor(null);
                      setMsg(message);
                      await load();
                    }}
                  />
                )}
              </div>
            );
          })}
          {queue.length === 0 && (
            <p className="py-6 text-center text-ink-3">Nothing assigned to you right now.</p>
          )}
        </div>
        <Pagination meta={queueMeta} onPage={setQueuePage} busy={busy} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Completed deliveries</CardTitle>
          <Badge variant="delivered">{doneMeta?.total ?? completed.length} done</Badge>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-2 text-xs uppercase text-ink-3">
                <th className="pb-3 text-left">Tracking</th>
                <th className="pb-3 text-left">Delivered to</th>
                <th className="pb-3 text-left">Received by</th>
                <th className="pb-3 text-left">COD</th>
                <th className="pb-3 text-left">Status</th>
                <th className="pb-3 text-left">Completed</th>
              </tr>
            </thead>
            <tbody>
              {completed.map((p) => (
                <tr key={p.id} className="border-b border-surface-2">
                  <td className="py-3 font-medium">{p.trackingId}</td>
                  <td className="py-3 text-ink-3">{p.receiverName} · {p.deliveryAddress}</td>
                  <td className="py-3">{p.receivedBy ?? '—'}</td>
                  <td className="py-3">
                    {p.codAmount > 0 ? (
                      <span className={p.isCodCollected ? 'text-green' : 'text-red-600'}>
                        {formatMoney(p.codAmount)}
                        {p.isCodCollected ? ' collected' : ' outstanding'}
                      </span>
                    ) : (
                      <span className="text-ink-3">Prepaid</span>
                    )}
                  </td>
                  <td className="py-3">
                    <span className={statusPillClass(p.status)}>{formatStatus(p.status)}</span>
                  </td>
                  <td className="py-3 text-ink-3">
                    {formatDate(p.deliveredAt ?? p.updatedAt)}
                  </td>
                </tr>
              ))}
              {completed.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-ink-3">
                    No completed deliveries yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination meta={doneMeta} onPage={setDonePage} busy={busy} />
      </Card>
    </div>
  );
}
