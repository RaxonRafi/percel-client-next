'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { DeliveryProofForm } from '@/components/delivery-proof-form';
import { api, ApiError } from '@/lib/api';
import { toast } from '@/lib/toast';
import { useAuth } from '@/lib/auth-context';
import type { PageMeta, Parcel, ParcelStatus } from '@/lib/types';
import {
  allowedTransitions, formatDate, formatMoney, formatStatus, isTerminal,
} from '@/lib/parcel-utils';
import { Truck, CheckCircle, Package, MapPin, Search } from 'lucide-react';

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
    setBusy(true);
    try {
      await api.updateParcelStatus(parcel.trackingId, draft.status, draft.note || undefined);
      toast.success(`${parcel.trackingId} marked ${formatStatus(draft.status)}`);
      setDrafts({ ...drafts, [parcel.id]: { ...draft, note: '' } });
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update status');
    } finally {
      setBusy(false);
    }
  }

  if (user && user.role !== 'DELIVERY_PERSONNEL') {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <div className="bg-surface p-8 rounded-xl border border-surface-3">
          <Truck className="h-12 w-12 text-ink-3 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-ink-2 tracking-wider uppercase mb-2">Delivery Portal</h2>
          <p className="text-ink-3 text-sm max-w-md">
            {user.role === 'PENDING_DELIVERY'
              ? 'Your delivery partner application is still under review.'
              : 'This page is for approved delivery partners only.'}
          </p>
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
            My Deliveries
          </h1>
          <p className="text-ink-3 text-[13px] mt-1 tracking-wide">YOUR ASSIGNED ROUTES AND MANIFEST</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-6">
          <div className="bg-white border border-surface-3 rounded-xl shadow-sm flex flex-col h-full">
            <div className="p-5 border-b border-surface-2 bg-surface flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-accent" />
                <h2 className="text-[13px] font-bold text-ink-2 uppercase tracking-wider">Active Queue</h2>
              </div>
              <div className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                (queueMeta?.total ?? queue.length) > 0 ? 'bg-accent-bg text-accent border border-accent/20' : 'bg-surface-2 text-ink-2 border border-surface-3'
              }`}>
                {queueMeta?.total ?? queue.length} ASSIGNED
              </div>
            </div>
            
            <div className="p-5 space-y-4">
              {queue.map((p) => {
                const draft = drafts[p.id] ?? { status: p.status, note: '' };
                return (
                  <div key={p.id} className="rounded-xl border border-surface-3 bg-white p-4 transition-all hover:border-surface-3">
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-2 border-b border-surface-3 pb-3">
                      <div>
                        <p className="font-bold text-accent tracking-wider text-sm">{p.trackingId}</p>
                        <p className="text-[11px] text-ink-3 mt-0.5">UPDATED {formatDate(p.updatedAt).toUpperCase()}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          ['PENDING', 'ACCEPTED'].includes(p.status) ? 'bg-surface-2 text-ink-2 border-surface-3' :
                          'bg-accent-bg text-accent border-accent/20'
                        }`}>
                          {formatStatus(p.status)}
                        </span>
                        {p.isBlocked && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-200">On hold</span>
                        )}
                      </div>
                    </div>

                    <div className="mb-4 grid gap-4 text-[13px] md:grid-cols-2">
                      <div className="bg-surface p-3 rounded-md border border-surface-2 relative">
                        <div className="absolute top-3 right-3 text-ink-3"><MapPin size={14} /></div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-ink-3 mb-1">Pick Up</p>
                        <p className="text-ink-2 leading-relaxed mb-2">{p.pickupAddress}</p>
                        <p className="text-[11px] font-sans text-ink-2">
                          {p.senderName}{p.senderPhone ? ` · ${p.senderPhone}` : ''}
                        </p>
                      </div>
                      <div className="bg-surface p-3 rounded-md border border-surface-2 relative">
                        <div className="absolute top-3 right-3 text-accent"><MapPin size={14} /></div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-accent mb-1">Deliver To</p>
                        <p className="text-ink-2 leading-relaxed mb-2">{p.deliveryAddress}</p>
                        <p className="text-[11px] font-sans text-ink-2">
                          {p.receiverName}{p.receiverPhone ? ` · ${p.receiverPhone}` : ''}
                        </p>
                      </div>
                    </div>

                    {p.description && (
                      <p className="mb-4 text-[12px] text-ink-2 bg-surface p-2 rounded-md border-l-2 border-surface-3">
                        <span className="text-ink-3 uppercase tracking-wider text-[10px] mr-2">Note:</span> 
                        {p.description}
                      </p>
                    )}

                    <div className="mb-4 flex flex-wrap gap-4 text-[11px] uppercase tracking-wider">
                      <span className="text-ink-3">
                        Weight <span className="text-ink-2 font-bold ml-1">{p.weightKg} kg</span>
                      </span>
                      <span className="text-ink-3">
                        Fee <span className="text-ink-2 font-bold ml-1">{formatMoney(p.deliveryFee)}</span>
                      </span>
                      {p.codAmount > 0 ? (
                        <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          Collect {formatMoney(p.codAmount)}
                        </span>
                      ) : (
                        <span className="text-ink-3 font-bold px-2 py-0.5 rounded-md border border-surface-3 bg-white">Prepaid</span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-surface-3">
                      <select
                        className="h-9 rounded-md border border-surface-3 bg-white px-3 text-[11px] font-bold tracking-wider uppercase text-ink-2 focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none"
                        value={draft.status}
                        disabled={isTerminal(p.status) || p.isBlocked}
                        onChange={(e) =>
                          setDrafts({
                            ...drafts,
                            [p.id]: { ...draft, status: e.target.value as ParcelStatus },
                          })
                        }
                      >
                        <option value={p.status}>{formatStatus(p.status)}</option>
                        {/* DELIVERED goes through the proof form, which also records COD cash. */}
                        {allowedTransitions(p.status, 'DELIVERY_PERSONNEL')
                          .filter((s) => s !== 'DELIVERED')
                          .map((s) => (
                            <option key={s} value={s}>{formatStatus(s)}</option>
                          ))}
                      </select>
                      <input
                        className="h-9 flex-1 min-w-[120px] rounded-md border border-surface-3 bg-white px-3 text-[13px] text-ink-2 focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none placeholder:text-ink-3"
                        placeholder="Status Note (optional)"
                        value={draft.note}
                        onChange={(e) =>
                          setDrafts({ ...drafts, [p.id]: { ...draft, note: e.target.value } })
                        }
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busy || p.isBlocked || draft.status === p.status}
                        onClick={() => updateStatus(p)}
                      >
                        Update Status
                      </Button>
                      {allowedTransitions(p.status, 'DELIVERY_PERSONNEL').includes('DELIVERED') && (
                        <Button
                          size="sm"
                          disabled={busy || p.isBlocked}
                          onClick={() => setProofFor(proofFor?.id === p.id ? null : p)}
                        >
                          Complete Delivery
                        </Button>
                      )}
                    </div>

                    {p.isBlocked && (
                      <p className="mt-3 text-[12px] text-rose-600">
                        This parcel is on hold. It cannot be updated or delivered until an admin releases it.
                      </p>
                    )}

                    {proofFor?.id === p.id && !p.isBlocked && (
                      <DeliveryProofForm
                        parcel={p}
                        onCancel={() => setProofFor(null)}
                        onDone={async () => {
                          setProofFor(null);
                          await load();
                        }}
                      />
                    )}
                  </div>
                );
              })}
              {queue.length === 0 && (
                <p className="py-12 text-center text-ink-3 text-sm font-sans">Nothing assigned to you right now.</p>
              )}
            </div>
            
            {queue.length > 0 && (
              <div className="px-5 pb-5 mt-auto">
                <Pagination meta={queueMeta} onPage={setQueuePage} busy={busy} />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-surface-3 rounded-xl shadow-sm flex flex-col h-full">
            <div className="p-5 border-b border-surface-2 bg-surface flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <h2 className="text-[13px] font-bold text-ink-2 uppercase tracking-wider">Completed</h2>
              </div>
              <div className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                {doneMeta?.total ?? completed.length} DONE
              </div>
            </div>
            
            <div className="m-5 overflow-x-auto rounded-xl border border-surface-3 flex-1">
              <table className="w-full text-[13px] text-left">
                <thead className="bg-surface text-[11px] uppercase tracking-wider text-ink-3 border-b border-surface-3">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Delivery Details</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-3">
                  {completed.map((p) => (
                    <tr key={p.id} className="hover:bg-surface transition-colors align-top">
                      <td className="px-5 py-4">
                        <div className="font-bold text-accent font-sans mb-1">{p.trackingId}</div>
                        <div className="text-[11px] text-ink-2 mb-1 leading-relaxed">
                          <span className="text-ink-3 uppercase">To:</span> {p.receiverName} <br/>
                          <span className="text-ink-3">{p.deliveryAddress}</span>
                        </div>
                        <div className="text-[10px] text-ink-3 mt-2">
                          <span className="uppercase">Received By:</span> <span className="text-ink-2">{p.receivedBy ?? '—'}</span>
                        </div>
                        <div className="text-[10px] mt-1">
                          {p.codAmount > 0 ? (
                            <span className={p.isCodCollected ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                              {formatMoney(p.codAmount)}
                              {p.isCodCollected ? ' COLLECTED' : ' OUTSTANDING'}
                            </span>
                          ) : (
                            <span className="text-ink-3 font-bold uppercase">Prepaid</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex flex-col items-end gap-2">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-emerald-50 text-emerald-600 border-emerald-200">
                            {formatStatus(p.status)}
                          </span>
                          <span className="text-[10px] text-ink-3">
                            {p.deliveredAt ? formatDate(p.deliveredAt).split(',')[0] : '—'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {completed.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-5 py-12 text-center text-ink-3 text-sm font-sans">
                        No completed deliveries yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {completed.length > 0 && (
              <div className="px-5 pb-5 mt-auto">
                <Pagination meta={doneMeta} onPage={setDonePage} busy={busy} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
