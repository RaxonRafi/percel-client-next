'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { DeliveryProofForm } from '@/components/delivery-proof-form';
import { api, ApiError } from '@/lib/api';
import { toast } from '@/lib/toast';
import { useAuth } from '@/lib/auth-context';
import {
  PARCEL_STATUSES,
  type PageMeta,
  type Parcel,
  type ParcelStatus,
  type User,
} from '@/lib/types';
import {
  allowedTransitions, formatDate, formatMoney, formatStatus, isTerminal, needsProof,
} from '@/lib/parcel-utils';
import { Package, Plus, Search, ChevronRight, ChevronDown, Settings2 } from 'lucide-react';

const modalField =
  'h-10 rounded-lg border border-surface-3 bg-white px-3 text-sm text-ink focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none placeholder:text-ink-3 disabled:bg-surface disabled:text-ink-3';

/** `main` is the role's own list: every parcel for an admin, sent parcels for a sender. */
type View = 'main' | 'incoming' | 'history';

export default function ParcelsPage() {
  const { user } = useAuth();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [couriers, setCouriers] = useState<User[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [statusDraft, setStatusDraft] = useState<Record<string, { status: ParcelStatus; note: string }>>({});
  const [assignDraft, setAssignDraft] = useState<Record<string, string>>({});
  const [proofFor, setProofFor] = useState<Parcel | null>(null);
  const [manageId, setManageId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<{ search: string; status: string }>({
    search: '',
    status: '',
  });
  const role = user?.role;
  const hasMain = role === 'ADMIN' || role === 'SENDER';
  // Incoming and history are scoped by who the parcel is addressed to, not by
  // role: a parcel can be booked to a sender's, courier's or admin's email too.
  const [tab, setTab] = useState<View>(hasMain ? 'main' : 'incoming');
  const view: View = !hasMain && tab === 'main' ? 'incoming' : tab;

  const load = useCallback(async () => {
    if (!role) return;
    setError('');
    const query = {
      page,
      limit,
      search: filters.search || undefined,
      status: (filters.status || undefined) as ParcelStatus | undefined,
    };
    try {
      if (view !== 'main') {
        const list =
          view === 'incoming'
            ? await api.getIncomingParcels(query)
            : await api.getDeliveryHistory(query);
        setParcels(list.data);
        setMeta(list.meta);
      } else if (role === 'ADMIN') {
        const [all, activeCouriers] = await Promise.all([
          api.getAllParcels(query),
          api.getCouriers({ limit: 100 }),
        ]);
        setParcels(all.data);
        setMeta(all.meta);
        setCouriers(activeCouriers.data);
      } else {
        const mine = await api.getMyParcels(query);
        setParcels(mine.data);
        setMeta(mine.meta);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load parcels');
    }
  }, [role, page, limit, filters.search, filters.status, view]);

  useEffect(() => {
    load();
  }, [load]);

  function applyFilter(next: Partial<typeof filters>) {
    setFilters({ ...filters, ...next });
    setPage(1);
  }

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

  const canCreate = user?.role === 'SENDER' || user?.role === 'ADMIN';
  // Looked up from the list so the dialog reflects each reload.
  const managed = parcels.find((p) => p.id === manageId) ?? null;
  const managedDraft = managed
    ? (statusDraft[managed.id] ?? { status: managed.status, note: '' })
    : null;

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
            <Package className="h-5 w-5 text-accent" />
            Parcel Management
          </h1>
          <p className="text-ink-3 text-[13px] mt-1 tracking-wide">
            {view === 'incoming'
              ? 'INCOMING PARCELS'
              : view === 'history'
                ? 'DELIVERY HISTORY'
                : user?.role === 'ADMIN'
                  ? 'SYSTEM FLEET OVERVIEW'
                  : 'MY OUTBOUND SHIPMENTS'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white p-1 rounded-md border border-surface-3">
            {((hasMain ? ['main', 'incoming', 'history'] : ['incoming', 'history']) as View[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setPage(1); setExpanded(null); }}
                className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded-md transition-all cursor-pointer ${
                  view === t
                    ? "bg-accent-bg text-accent border border-accent/20"
                    : "text-ink-3 hover:text-ink-2 hover:bg-surface-2 border border-transparent"
                }`}
              >
                {t === 'main' ? (role === 'ADMIN' ? 'All' : 'Sent') : t === 'incoming' ? 'Incoming' : 'History'}
              </button>
            ))}
          </div>

          {canCreate && (
            <Button asChild>
              <Link href="/dashboard/parcels/new">
                <Plus className="h-4 w-4" /> New shipment
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white border border-surface-3 rounded-xl shadow-sm flex flex-col">
            <div className="px-5 pt-5 flex flex-wrap gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-3" />
                <input
                  className="w-full h-9 rounded-full border border-surface-3 bg-white pl-9 pr-3 text-[13px] text-ink-2 focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none placeholder:text-ink-3"
                  placeholder="Search by tracking ID"
                  value={filters.search}
                  onChange={(e) => applyFilter({ search: e.target.value })}
                />
              </div>
              <select
                className="h-9 rounded-full border border-surface-3 bg-white px-4 text-[13px] text-ink-2 focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none"
                value={filters.status}
                onChange={(e) => applyFilter({ status: e.target.value })}
              >
                <option value="">All statuses</option>
                {PARCEL_STATUSES.map((s) => (
                  <option key={s} value={s}>{formatStatus(s)}</option>
                ))}
              </select>
            </div>

            <div className="m-5 overflow-x-auto rounded-xl border border-surface-3">
              <table className="w-full text-[13px] text-left">
                <thead className="bg-surface text-[11px] uppercase tracking-wider text-ink-3 border-b border-surface-3">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Tracking</th>
                    <th className="px-5 py-3.5 font-semibold">Route</th>
                    <th className="px-5 py-3.5 font-semibold">Status</th>
                    {user?.role === 'ADMIN' && <th className="px-5 py-3.5 font-semibold">Assignment</th>}
                    <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-3">
                  {parcels.map((p) => {
                    const isOpen = expanded === p.id;
                    const addressedToMe = p.receiver?.id === user?.id;
                    const cashDue = needsProof(p);
                    return (
                      <tr key={p.id} className="hover:bg-surface transition-colors group align-top">
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            className="flex items-center gap-1.5 whitespace-nowrap font-semibold text-ink hover:text-accent transition-colors"
                            onClick={() => setExpanded(isOpen ? null : p.id)}
                          >
                            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            {p.trackingId}
                          </button>
                          
                          {isOpen && (
                            <div className="mt-3 space-y-2 text-[11px] font-sans text-ink-2 bg-white p-3 rounded-md border border-surface-2 ml-5">
                              <p><span className="text-ink-3 uppercase tracking-wider">Sender:</span> {p.senderName}{p.senderPhone ? ` · ${p.senderPhone}` : ''}</p>
                              <p><span className="text-ink-3 uppercase tracking-wider">Receiver:</span> {p.receiverName}{p.receiverPhone ? ` · ${p.receiverPhone}` : ''}</p>
                              <p>
                                <span className="text-ink-3 uppercase tracking-wider">Courier:</span>{' '}
                                {p.deliveryPersonnel
                                  ? <span className="text-amber-600">{`${p.deliveryPersonnel.name}${p.deliveryPersonnel.phone ? ` · ${p.deliveryPersonnel.phone}` : ''}`}</span>
                                  : 'Not assigned yet'}
                              </p>
                              <p>
                                <span className="text-ink-3 uppercase tracking-wider">Details:</span> {p.weightKg} kg · Fee {formatMoney(p.deliveryFee)} ·{' '}
                                {p.codAmount > 0
                                  ? <span className="text-emerald-600 font-bold">COD {formatMoney(p.codAmount)}{p.isCodCollected ? ' (Collected)' : ' (Outstanding)'}</span>
                                  : 'Prepaid'}
                              </p>
                              {p.deliveredAt && (
                                <p>
                                  <span className="text-ink-3 uppercase tracking-wider">Delivered:</span> {formatDate(p.deliveredAt)}
                                  {p.receivedBy ? ` — received by ${p.receivedBy}` : ''}
                                </p>
                              )}
                              {p.deliveryProofNote && <p><span className="text-ink-3 uppercase tracking-wider">Proof note:</span> {p.deliveryProofNote}</p>}
                              {p.deliveryProofImages?.length > 0 && (
                                <p className="flex flex-wrap gap-2 mt-1">
                                  {p.deliveryProofImages.map((src, i) => (
                                    <a
                                      key={src}
                                      href={src}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2 py-1 bg-accent-bg text-accent border border-accent/20 rounded-md hover:bg-accent/15 transition-colors"
                                    >
                                      Proof {i + 1}
                                    </a>
                                  ))}
                                </p>
                              )}
                              {p.description && <p><span className="text-ink-3 uppercase tracking-wider">Note:</span> {p.description}</p>}
                              
                              <div className="mt-3 pt-2 border-t border-surface-3">
                                <p className="font-bold text-ink-2 uppercase tracking-wider mb-2 text-[10px]">Status History</p>
                                {(p.statusLogs ?? []).map((log) => (
                                  <p key={log.id} className="mb-1 text-ink-2">
                                    <span className="text-ink-3">{formatDate(log.createdAt).split(',')[0]}</span> — <span className="text-accent">{formatStatus(log.status)}</span>
                                    {log.changedBy ? ` by ${log.changedBy.name}` : ''}
                                    {log.note ? ` (${log.note})` : ''}
                                  </p>
                                ))}
                                {(p.statusLogs ?? []).length === 0 && <p className="text-ink-3 italic">No status history.</p>}
                              </div>
                              
                              {user?.role === 'ADMIN' && (
                                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-surface-3">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={busy}
                                    onClick={() => run(() => api.indexParcel(p), 'Parcel indexed for AI search')}
                                  >
                                    Index for AI search
                                  </Button>
                                  {allowedTransitions(p.status).includes('DELIVERED') && (
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      disabled={busy || p.isBlocked}
                                      onClick={() => setProofFor(proofFor?.id === p.id ? null : p)}
                                    >
                                      Record delivery proof
                                    </Button>
                                  )}
                                </div>
                              )}
                              
                              {proofFor?.id === p.id && (
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
                          )}
                        </td>
                        <td className="px-5 py-4 text-ink-2 text-xs">
                          <div className="flex flex-col gap-1 max-w-[280px]">
                            <div className="truncate" title={p.pickupAddress}>
                              <span className="text-[10px] text-ink-3 uppercase tracking-wider mr-1">F:</span>
                              {p.pickupAddress}
                            </div>
                            <div className="truncate" title={p.deliveryAddress}>
                              <span className="text-[10px] text-ink-3 uppercase tracking-wider mr-1">T:</span>
                              {p.deliveryAddress}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col items-start gap-1">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                              p.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                              ['PENDING', 'ACCEPTED'].includes(p.status) ? 'bg-surface-2 text-ink-2 border-surface-3' :
                              p.status === 'CANCELLED' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                              'bg-accent-bg text-accent border-accent/20'
                            }`}>
                              {formatStatus(p.status)}
                            </span>
                            {p.isBlocked && (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-200">On hold</span>
                            )}
                          </div>
                        </td>
                        
                        {user?.role === 'ADMIN' && (
                          <td className="px-5 py-4 whitespace-nowrap">
                            {p.deliveryPersonnel ? (
                              <span className="text-ink-2">{p.deliveryPersonnel.name}</span>
                            ) : (
                              <span className="text-ink-3">Unassigned</span>
                            )}
                          </td>
                        )}
                        
                        <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col items-end gap-2">
                            {/* After pickup only an admin can cancel, through the status route. */}
                            {user?.role === 'SENDER' && p.sender?.id === user.id && p.status === 'PENDING' && !p.isBlocked && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-rose-600 hover:text-rose-600 hover:bg-rose-50"
                                disabled={busy}
                                onClick={() => run(() => api.cancelParcel(p.trackingId), 'Parcel cancelled')}
                              >
                                Cancel
                              </Button>
                            )}
                            {addressedToMe && allowedTransitions(p.status).includes('DELIVERED') && (
                              <>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  disabled={busy || p.isBlocked || cashDue}
                                  onClick={() => run(() => api.confirmParcel(p.trackingId), 'Delivery confirmed')}
                                >
                                  Confirm delivery
                                </Button>
                                {(p.isBlocked || cashDue) && (
                                  <span className="max-w-[190px] text-[11px] leading-snug text-ink-3">
                                    {p.isBlocked
                                      ? 'This parcel is on hold.'
                                      : `The courier records the ${formatMoney(p.codAmount)} cash handover.`}
                                  </span>
                                )}
                              </>
                            )}
                            {user?.role === 'ADMIN' && (
                              <Button size="sm" variant="secondary" onClick={() => setManageId(p.id)}>
                                <Settings2 className="h-3.5 w-3.5" /> Manage
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {parcels.length === 0 && (
                    <tr>
                      <td colSpan={user?.role === 'ADMIN' ? 5 : 4} className="px-5 py-8 text-center text-ink-3 text-sm font-sans">
                        No parcels to show.
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

      <Dialog open={!!managed} onOpenChange={(open) => !open && setManageId(null)}>
        {managed && managedDraft && (
          <DialogContent
            title={managed.trackingId}
            description={`${managed.pickupAddress} → ${managed.deliveryAddress}`}
          >
            <div className="space-y-6">
              <section>
                <h3 className="mb-2 text-xs font-semibold text-ink-2">Courier</h3>
                <div className="flex flex-wrap gap-2">
                  <select
                    className={`${modalField} min-w-0 flex-1`}
                    value={assignDraft[managed.id] ?? managed.deliveryPersonnel?.id ?? ''}
                    onChange={(e) => setAssignDraft({ ...assignDraft, [managed.id]: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {couriers
                      .filter((c) => c.isActive === 'ACTIVE')
                      .map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                  </select>
                  <Button
                    variant="secondary"
                    disabled={
                      busy ||
                      managed.isBlocked ||
                      !assignDraft[managed.id] ||
                      assignDraft[managed.id] === managed.deliveryPersonnel?.id
                    }
                    onClick={() =>
                      run(
                        () => api.assignParcel(managed.trackingId, assignDraft[managed.id]),
                        'Courier assigned',
                      )
                    }
                  >
                    {managed.deliveryPersonnel ? 'Reassign' : 'Assign'}
                  </Button>
                  {managed.deliveryPersonnel && (
                    <Button
                      variant="ghost"
                      className="text-rose-600 hover:text-rose-600 hover:bg-rose-50"
                      disabled={busy}
                      onClick={() => run(() => api.unassignParcel(managed.trackingId), 'Courier removed')}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-semibold text-ink-2">Status</h3>
                <div className="space-y-2">
                  <select
                    className={`${modalField} w-full`}
                    value={managedDraft.status}
                    disabled={isTerminal(managed.status) || managed.isBlocked}
                    onChange={(e) =>
                      setStatusDraft({
                        ...statusDraft,
                        [managed.id]: { ...managedDraft, status: e.target.value as ParcelStatus },
                      })
                    }
                  >
                    <option value={managed.status}>{formatStatus(managed.status)}</option>
                    {allowedTransitions(managed.status).map((s) => {
                      // Cash on delivery closes through delivery proof, never from here.
                      const locked = s === 'DELIVERED' && needsProof(managed);
                      return (
                        <option key={s} value={s} disabled={locked}>
                          {formatStatus(s)}{locked ? ' (record delivery proof to collect cash)' : ''}
                        </option>
                      );
                    })}
                  </select>
                  <input
                    className={`${modalField} w-full`}
                    placeholder="Status note (optional)"
                    value={managedDraft.note}
                    onChange={(e) =>
                      setStatusDraft({
                        ...statusDraft,
                        [managed.id]: { ...managedDraft, note: e.target.value },
                      })
                    }
                  />
                  {isTerminal(managed.status) && (
                    <p className="text-xs text-ink-3">
                      This parcel is {formatStatus(managed.status).toLowerCase()} — its status can no longer change.
                    </p>
                  )}
                  {managed.isBlocked && !isTerminal(managed.status) && (
                    <p className="text-xs text-ink-3">
                      This parcel is on hold — unblock it to assign a courier or change its status.
                    </p>
                  )}
                </div>
              </section>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-3 pt-4">
                <Button
                  variant="ghost"
                  className={managed.isBlocked ? 'text-emerald-600 hover:text-emerald-600 hover:bg-emerald-50' : 'text-rose-600 hover:text-rose-600 hover:bg-rose-50'}
                  disabled={busy}
                  onClick={() =>
                    run(
                      () =>
                        managed.isBlocked
                          ? api.unblockParcel(managed.trackingId)
                          : api.blockParcel(managed.trackingId),
                      managed.isBlocked ? 'Parcel unblocked' : 'Parcel blocked',
                    )
                  }
                >
                  {managed.isBlocked ? 'Unblock parcel' : 'Block parcel'}
                </Button>
                <Button
                  disabled={busy || managed.isBlocked || managedDraft.status === managed.status}
                  onClick={() =>
                    run(
                      () =>
                        api.updateParcelStatus(
                          managed.trackingId,
                          managedDraft.status,
                          managedDraft.note || undefined,
                        ),
                      'Status updated',
                    )
                  }
                >
                  Update status
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
