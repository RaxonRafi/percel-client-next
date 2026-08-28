'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { DeliveryProofForm } from '@/components/delivery-proof-form';
import { api, ApiError } from '@/lib/api';
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
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <div className="bg-slate-900/50 p-8 rounded-lg border border-slate-800">
          <Truck className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-300 font-mono tracking-wider uppercase mb-2">Delivery Portal</h2>
          <p className="text-slate-500 font-mono text-sm max-w-md">
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
      {(error || msg) && (
        <div className={`p-3 rounded-lg border text-sm font-mono ${error ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
          {error || msg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <Truck className="h-5 w-5 text-cyan-500" />
            My Deliveries
          </h1>
          <p className="text-slate-500 text-[13px] mt-1 font-mono tracking-wide">YOUR ASSIGNED ROUTES AND MANIFEST</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg flex flex-col h-full">
            <div className="p-5 border-b border-slate-800/60 bg-slate-900/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-cyan-500" />
                <h2 className="text-[13px] font-bold text-slate-300 uppercase tracking-wider">Active Queue</h2>
              </div>
              <div className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                (queueMeta?.total ?? queue.length) > 0 ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {queueMeta?.total ?? queue.length} ASSIGNED
              </div>
            </div>
            
            <div className="p-5 space-y-4">
              {queue.map((p) => {
                const draft = drafts[p.id] ?? { status: p.status, note: '' };
                return (
                  <div key={p.id} className="rounded-lg border border-slate-800 bg-slate-950 p-4 transition-all hover:border-slate-700">
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <p className="font-bold font-mono text-cyan-400 tracking-wider text-sm">{p.trackingId}</p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">UPDATED {formatDate(p.updatedAt).toUpperCase()}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border ${
                        ['PENDING', 'ACCEPTED'].includes(p.status) ? 'bg-slate-800 text-slate-300 border-slate-700' :
                        'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                      }`}>
                        {formatStatus(p.status)}
                      </span>
                    </div>

                    <div className="mb-4 grid gap-4 text-[13px] md:grid-cols-2">
                      <div className="bg-slate-900/50 p-3 rounded border border-slate-800/60 relative">
                        <div className="absolute top-3 right-3 text-slate-600"><MapPin size={14} /></div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Pick Up</p>
                        <p className="font-mono text-slate-300 leading-relaxed mb-2">{p.pickupAddress}</p>
                        <p className="text-[11px] font-sans text-slate-400">
                          {p.senderName}{p.senderPhone ? ` · ${p.senderPhone}` : ''}
                        </p>
                      </div>
                      <div className="bg-slate-900/50 p-3 rounded border border-slate-800/60 relative">
                        <div className="absolute top-3 right-3 text-cyan-700"><MapPin size={14} /></div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-500/70 mb-1">Deliver To</p>
                        <p className="font-mono text-slate-300 leading-relaxed mb-2">{p.deliveryAddress}</p>
                        <p className="text-[11px] font-sans text-slate-400">
                          {p.receiverName}{p.receiverPhone ? ` · ${p.receiverPhone}` : ''}
                        </p>
                      </div>
                    </div>

                    {p.description && (
                      <p className="mb-4 text-[12px] font-mono text-slate-400 bg-slate-900/30 p-2 rounded border-l-2 border-slate-700">
                        <span className="text-slate-500 uppercase tracking-wider text-[10px] mr-2">Note:</span> 
                        {p.description}
                      </p>
                    )}

                    <div className="mb-4 flex flex-wrap gap-4 text-[11px] font-mono uppercase tracking-wider">
                      <span className="text-slate-500">
                        Weight <span className="text-slate-300 font-bold ml-1">{p.weightKg} kg</span>
                      </span>
                      <span className="text-slate-500">
                        Fee <span className="text-slate-300 font-bold ml-1">{formatMoney(p.deliveryFee)}</span>
                      </span>
                      {p.codAmount > 0 ? (
                        <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          Collect {formatMoney(p.codAmount)}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-bold px-2 py-0.5 rounded border border-slate-800 bg-slate-900">Prepaid</span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800">
                      <select
                        className="h-9 rounded border border-slate-800 bg-slate-900 px-3 text-[11px] font-bold tracking-wider uppercase text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none"
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
                        {allowedTransitions(p.status, 'DELIVERY_PERSONNEL')
                          .filter((s) => s !== 'DELIVERED')
                          .map((s) => (
                            <option key={s} value={s}>{formatStatus(s)}</option>
                          ))}
                      </select>
                      <input
                        className="h-9 flex-1 min-w-[120px] rounded border border-slate-800 bg-slate-900 px-3 text-[13px] text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none placeholder:text-slate-600 font-mono"
                        placeholder="Status Note (optional)"
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
                        Update Status
                      </Button>
                      {allowedTransitions(p.status, 'DELIVERY_PERSONNEL').includes('DELIVERED') && (
                        <Button
                          size="sm"
                          disabled={busy}
                          onClick={() => setProofFor(proofFor?.id === p.id ? null : p)}
                        >
                          Complete Delivery
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
                <p className="py-12 text-center text-slate-500 text-sm font-sans">Nothing assigned to you right now.</p>
              )}
            </div>
            
            {queue.length > 0 && (
              <div className="p-4 border-t border-slate-800/60 mt-auto">
                <Pagination meta={queueMeta} onPage={setQueuePage} busy={busy} />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg flex flex-col h-full">
            <div className="p-5 border-b border-slate-800/60 bg-slate-900/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <h2 className="text-[13px] font-bold text-slate-300 uppercase tracking-wider">Completed</h2>
              </div>
              <div className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {doneMeta?.total ?? completed.length} DONE
              </div>
            </div>
            
            <div className="overflow-x-auto custom-scrollbar flex-1">
              <table className="w-full text-[13px] text-left">
                <thead className="bg-slate-900/50 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-800/60">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Delivery Details</th>
                    <th className="px-5 py-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {completed.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/20 transition-colors align-top">
                      <td className="px-5 py-3">
                        <div className="font-bold text-cyan-400 font-sans mb-1">{p.trackingId}</div>
                        <div className="text-[11px] text-slate-400 mb-1 leading-relaxed">
                          <span className="text-slate-500 uppercase">To:</span> {p.receiverName} <br/>
                          <span className="text-slate-600">{p.deliveryAddress}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-2">
                          <span className="uppercase">Received By:</span> <span className="text-slate-300">{p.receivedBy ?? '—'}</span>
                        </div>
                        <div className="text-[10px] mt-1">
                          {p.codAmount > 0 ? (
                            <span className={p.isCodCollected ? 'text-emerald-400 font-bold' : 'text-rose-500 font-bold'}>
                              {formatMoney(p.codAmount)}
                              {p.isCodCollected ? ' COLLECTED' : ' OUTSTANDING'}
                            </span>
                          ) : (
                            <span className="text-slate-500 font-bold uppercase">Prepaid</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex flex-col items-end gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            {formatStatus(p.status)}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {formatDate(p.deliveredAt ?? p.updatedAt).split(',')[0]}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {completed.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-5 py-12 text-center text-slate-500 text-sm font-sans">
                        No completed deliveries yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {completed.length > 0 && (
              <div className="p-4 border-t border-slate-800/60 mt-auto">
                <Pagination meta={doneMeta} onPage={setDonePage} busy={busy} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
