'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { DeliveryProofForm } from '@/components/delivery-proof-form';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  PARCEL_STATUSES,
  type PageMeta,
  type Parcel,
  type ParcelStatus,
  type User,
} from '@/lib/types';
import {
  allowedTransitions, formatDate, formatMoney, formatStatus, isTerminal,
} from '@/lib/parcel-utils';
import { Package, Plus, Search, ChevronRight, ChevronDown } from 'lucide-react';

const EMPTY_FORM = {
  receiverId: '',
  receiverName: '',
  receiverPhone: '',
  pickupAddress: '',
  deliveryAddress: '',
  description: '',
  weightKg: '1',
  codAmount: '',
};

export default function ParcelsPage() {
  const { user } = useAuth();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [couriers, setCouriers] = useState<User[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [statusDraft, setStatusDraft] = useState<Record<string, { status: ParcelStatus; note: string }>>({});
  const [assignDraft, setAssignDraft] = useState<Record<string, string>>({});
  const [proofFor, setProofFor] = useState<Parcel | null>(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{ search: string; status: string }>({
    search: '',
    status: '',
  });
  const [tab, setTab] = useState<'incoming' | 'history'>('incoming');

  const role = user?.role;

  const load = useCallback(async () => {
    if (!role) return;
    setError('');
    const query = {
      page,
      limit: 20,
      search: filters.search || undefined,
      status: (filters.status || undefined) as ParcelStatus | undefined,
    };
    try {
      if (role === 'ADMIN') {
        const [all, everyone, activeCouriers] = await Promise.all([
          api.getAllParcels(query),
          api.getAllUsers({ role: 'RECEIVER', limit: 100 }),
          api.getCouriers({ limit: 100 }),
        ]);
        setParcels(all.data);
        setMeta(all.meta);
        setUsers(everyone.data);
        setCouriers(activeCouriers.data);
      } else if (role === 'SENDER') {
        const mine = await api.getMyParcels(query);
        setParcels(mine.data);
        setMeta(mine.meta);
      } else {
        const list =
          tab === 'incoming'
            ? await api.getIncomingParcels(query)
            : await api.getDeliveryHistory(query);
        setParcels(list.data);
        setMeta(list.meta);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load parcels');
    }
  }, [role, page, filters.search, filters.status, tab]);

  useEffect(() => {
    load();
  }, [load]);

  function applyFilter(next: Partial<typeof filters>) {
    setFilters({ ...filters, ...next });
    setPage(1);
  }

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

  async function createParcel(e: React.FormEvent) {
    e.preventDefault();
    await run(
      () =>
        api.createParcel({
          receiverId: form.receiverId,
          receiverName: form.receiverName,
          pickupAddress: form.pickupAddress,
          deliveryAddress: form.deliveryAddress,
          receiverPhone: form.receiverPhone || undefined,
          description: form.description || undefined,
          weightKg: Number(form.weightKg),
          codAmount: form.codAmount ? Number(form.codAmount) : undefined,
        }),
      'Parcel created',
    );
    setForm(EMPTY_FORM);
  }

  const canCreate = user?.role === 'SENDER' || user?.role === 'ADMIN';
  const receivers = users.filter((u) => u.role === 'RECEIVER');

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
            <Package className="h-5 w-5 text-cyan-500" />
            Parcel Management
          </h1>
          <p className="text-slate-500 text-[13px] mt-1 font-mono tracking-wide">
            {user?.role === 'ADMIN'
              ? 'SYSTEM FLEET OVERVIEW'
              : user?.role === 'SENDER'
                ? 'MY OUTBOUND SHIPMENTS'
                : tab === 'incoming'
                  ? 'INCOMING PARCELS'
                  : 'DELIVERY HISTORY'}
          </p>
        </div>
        
        {user?.role === 'RECEIVER' && (
          <div className="flex bg-slate-900 p-1 rounded-md border border-slate-800">
            {(['incoming', 'history'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setPage(1); }}
                className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded transition-all cursor-pointer ${
                  tab === t 
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800 border border-transparent"
                }`}
              >
                {t === 'incoming' ? 'Incoming' : 'History'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className={`space-y-6 ${canCreate ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="bg-slate-900 border border-slate-800 rounded-lg flex flex-col">
            <div className="p-4 border-b border-slate-800/60 bg-slate-900/50 flex flex-wrap gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  className="w-full h-9 rounded border border-slate-800 bg-slate-950 pl-9 pr-3 text-[13px] text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none placeholder:text-slate-600 font-mono"
                  placeholder="SEARCH TRACKING ID..."
                  value={filters.search}
                  onChange={(e) => applyFilter({ search: e.target.value })}
                />
              </div>
              <select
                className="h-9 rounded border border-slate-800 bg-slate-950 px-3 text-[13px] text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none font-mono"
                value={filters.status}
                onChange={(e) => applyFilter({ status: e.target.value })}
              >
                <option value="">ALL STATUSES</option>
                {PARCEL_STATUSES.map((s) => (
                  <option key={s} value={s}>{formatStatus(s).toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-[13px] text-left">
                <thead className="bg-slate-900/50 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-800/60">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Tracking</th>
                    <th className="px-5 py-3 font-semibold">Route</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    {user?.role === 'ADMIN' && <th className="px-5 py-3 font-semibold">Assignment</th>}
                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {parcels.map((p) => {
                    const draft = statusDraft[p.id] ?? { status: p.status, note: '' };
                    const isOpen = expanded === p.id;
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/20 transition-colors group align-top">
                        <td className="px-5 py-3">
                          <button
                            type="button"
                            className="flex items-center gap-1.5 font-bold text-cyan-400 font-mono hover:text-cyan-300 transition-colors"
                            onClick={() => setExpanded(isOpen ? null : p.id)}
                          >
                            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            {p.trackingId}
                          </button>
                          
                          {isOpen && (
                            <div className="mt-3 space-y-2 text-[11px] font-sans text-slate-400 bg-slate-950 p-3 rounded border border-slate-800/60 ml-5">
                              <p><span className="text-slate-500 font-mono uppercase tracking-wider">Sender:</span> {p.senderName}{p.senderPhone ? ` · ${p.senderPhone}` : ''}</p>
                              <p><span className="text-slate-500 font-mono uppercase tracking-wider">Receiver:</span> {p.receiverName}{p.receiverPhone ? ` · ${p.receiverPhone}` : ''}</p>
                              <p>
                                <span className="text-slate-500 font-mono uppercase tracking-wider">Courier:</span>{' '}
                                {p.deliveryPersonnel
                                  ? <span className="text-amber-400">{`${p.deliveryPersonnel.name}${p.deliveryPersonnel.phone ? ` · ${p.deliveryPersonnel.phone}` : ''}`}</span>
                                  : 'Not assigned yet'}
                              </p>
                              <p>
                                <span className="text-slate-500 font-mono uppercase tracking-wider">Details:</span> {p.weightKg} kg · Fee {formatMoney(p.deliveryFee)} ·{' '}
                                {p.codAmount > 0
                                  ? <span className="text-emerald-400 font-mono font-bold">COD {formatMoney(p.codAmount)}{p.isCodCollected ? ' (Collected)' : ' (Outstanding)'}</span>
                                  : 'Prepaid'}
                              </p>
                              {p.deliveredAt && (
                                <p>
                                  <span className="text-slate-500 font-mono uppercase tracking-wider">Delivered:</span> {formatDate(p.deliveredAt)}
                                  {p.receivedBy ? ` — received by ${p.receivedBy}` : ''}
                                </p>
                              )}
                              {p.deliveryProofNote && <p><span className="text-slate-500 font-mono uppercase tracking-wider">Proof note:</span> {p.deliveryProofNote}</p>}
                              {p.deliveryProofImages?.length > 0 && (
                                <p className="flex flex-wrap gap-2 mt-1">
                                  {p.deliveryProofImages.map((src, i) => (
                                    <a
                                      key={src}
                                      href={src}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded hover:bg-cyan-500/20 transition-colors"
                                    >
                                      Proof {i + 1}
                                    </a>
                                  ))}
                                </p>
                              )}
                              {p.description && <p><span className="text-slate-500 font-mono uppercase tracking-wider">Note:</span> {p.description}</p>}
                              
                              <div className="mt-3 pt-2 border-t border-slate-800">
                                <p className="font-bold text-slate-300 font-mono uppercase tracking-wider mb-2 text-[10px]">Status History</p>
                                {(p.statusLogs ?? []).map((log) => (
                                  <p key={log.id} className="mb-1 text-slate-400">
                                    <span className="text-slate-500">{formatDate(log.createdAt).split(',')[0]}</span> — <span className="text-cyan-400">{formatStatus(log.status)}</span>
                                    {log.changedBy ? ` by ${log.changedBy.name}` : ''}
                                    {log.note ? ` (${log.note})` : ''}
                                  </p>
                                ))}
                                {(p.statusLogs ?? []).length === 0 && <p className="text-slate-500 italic">No status history.</p>}
                              </div>
                              
                              {user?.role === 'ADMIN' && (
                                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-800">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={busy}
                                    onClick={() => run(() => api.indexParcel(p.id), 'Parcel indexed for AI search')}
                                  >
                                    Index for AI search
                                  </Button>
                                  {allowedTransitions(p.status).includes('DELIVERED') && (
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      disabled={busy}
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
                                  onDone={async (message) => {
                                    setProofFor(null);
                                    setMsg(message);
                                    await load();
                                  }}
                                />
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3 text-slate-400 text-xs">
                          <div className="flex flex-col gap-1 max-w-[150px]">
                            <div className="truncate" title={p.pickupAddress}>
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider mr-1">F:</span>
                              {p.pickupAddress}
                            </div>
                            <div className="truncate" title={p.deliveryAddress}>
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider mr-1">T:</span>
                              {p.deliveryAddress}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-col items-start gap-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
                              p.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              ['PENDING', 'ACCEPTED'].includes(p.status) ? 'bg-slate-800 text-slate-300 border-slate-700' :
                              p.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                              'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                            }`}>
                              {formatStatus(p.status)}
                            </span>
                            {p.isBlocked && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-rose-500/10 text-rose-500 border border-rose-500/20">Blocked</span>
                            )}
                          </div>
                        </td>
                        
                        {user?.role === 'ADMIN' && (
                          <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-col gap-2">
                              <select
                                className="h-8 rounded border border-slate-800 bg-slate-950 px-2 text-[11px] text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none w-32"
                                value={assignDraft[p.id] ?? p.deliveryPersonnel?.id ?? ''}
                                onChange={(e) =>
                                  setAssignDraft({ ...assignDraft, [p.id]: e.target.value })
                                }
                              >
                                <option value="">Unassigned</option>
                                {couriers
                                  .filter((c) => c.isActive === 'ACTIVE')
                                  .map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                  ))}
                              </select>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-7 text-[10px]"
                                  disabled={
                                    busy ||
                                    !assignDraft[p.id] ||
                                    assignDraft[p.id] === p.deliveryPersonnel?.id
                                  }
                                  onClick={() =>
                                    run(
                                      () => api.assignParcel(p.trackingId, assignDraft[p.id]),
                                      'Courier assigned',
                                    )
                                  }
                                >
                                  {p.deliveryPersonnel ? 'Reassign' : 'Assign'}
                                </Button>
                                {p.deliveryPersonnel && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-[10px] text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                                    disabled={busy}
                                    onClick={() =>
                                      run(() => api.unassignParcel(p.trackingId), 'Courier removed')
                                    }
                                  >
                                    Clear
                                  </Button>
                                )}
                              </div>
                            </div>
                          </td>
                        )}
                        
                        <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col items-end gap-2">
                            {user?.role === 'SENDER' && !isTerminal(p.status) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                                disabled={busy}
                                onClick={() => run(() => api.cancelParcel(p.trackingId), 'Parcel cancelled')}
                              >
                                Cancel
                              </Button>
                            )}
                            {user?.role === 'RECEIVER' && !isTerminal(p.status) && (
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={busy}
                                onClick={() => run(() => api.confirmParcel(p.trackingId), 'Delivery confirmed')}
                              >
                                Confirm delivery
                              </Button>
                            )}
                            {user?.role === 'ADMIN' && (
                              <div className="flex flex-col gap-2 w-48">
                                <select
                                  className="h-8 rounded border border-slate-800 bg-slate-950 px-2 text-[11px] text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none w-full"
                                  value={draft.status}
                                  disabled={isTerminal(p.status)}
                                  onChange={(e) =>
                                    setStatusDraft({
                                      ...statusDraft,
                                      [p.id]: { ...draft, status: e.target.value as ParcelStatus },
                                    })
                                  }
                                >
                                  <option value={p.status}>{formatStatus(p.status)}</option>
                                  {allowedTransitions(p.status).map((s) => (
                                    <option key={s} value={s}>{formatStatus(s)}</option>
                                  ))}
                                </select>
                                <input
                                  className="h-8 rounded border border-slate-800 bg-slate-950 px-2 text-[11px] text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none w-full placeholder:text-slate-600"
                                  placeholder="Status Note (optional)"
                                  value={draft.note}
                                  onChange={(e) =>
                                    setStatusDraft({
                                      ...statusDraft,
                                      [p.id]: { ...draft, note: e.target.value },
                                    })
                                  }
                                />
                                <div className="flex gap-1 justify-end">
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-7 text-[10px]"
                                    disabled={busy || draft.status === p.status}
                                    onClick={() =>
                                      run(
                                        () => api.updateParcelStatus(p.trackingId, draft.status, draft.note || undefined),
                                        'Status updated',
                                      )
                                    }
                                  >
                                    Update
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className={`h-7 text-[10px] ${p.isBlocked ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-rose-500 hover:bg-rose-500/10'}`}
                                    disabled={busy}
                                    onClick={() =>
                                      run(
                                        () => api.blockParcel(p.trackingId),
                                        p.isBlocked ? 'Parcel unblocked' : 'Parcel blocked',
                                      )
                                    }
                                  >
                                    {p.isBlocked ? 'Unblock' : 'Block'}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {parcels.length === 0 && (
                    <tr>
                      <td colSpan={user?.role === 'ADMIN' ? 5 : 4} className="px-5 py-8 text-center text-slate-500 text-sm font-sans">
                        No parcels to show.
                      </td>
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

        {canCreate && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-lg flex flex-col">
              <div className="px-5 py-4 border-b border-slate-800/60 flex items-center gap-2">
                <Plus className="h-4 w-4 text-cyan-500" />
                <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate-300">Create Parcel</h2>
              </div>
              <form onSubmit={createParcel} className="p-5 flex flex-col gap-4 font-mono text-sm">
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">Receiver</label>
                  {receivers.length > 0 ? (
                    <select
                      className="w-full h-9 rounded border border-slate-800 bg-slate-950 px-3 text-[13px] text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none"
                      value={form.receiverId}
                      onChange={(e) => {
                        const u = receivers.find((x) => x.id === e.target.value);
                        setForm({
                          ...form,
                          receiverId: e.target.value,
                          receiverName: u?.name ?? '',
                          receiverPhone: u?.phone ?? '',
                        });
                      }}
                      required
                    >
                      <option value="">SELECT RECEIVER</option>
                      {receivers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="w-full h-9 rounded border border-slate-800 bg-slate-950 px-3 text-[13px] text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none placeholder:text-slate-600"
                      placeholder="Receiver UUID"
                      value={form.receiverId}
                      onChange={(e) => setForm({ ...form, receiverId: e.target.value })}
                      required
                    />
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">Receiver Name</label>
                  <input
                    className="w-full h-9 rounded border border-slate-800 bg-slate-950 px-3 text-[13px] text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none placeholder:text-slate-600"
                    value={form.receiverName}
                    onChange={(e) => setForm({ ...form, receiverName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">Receiver Phone</label>
                  <input
                    className="w-full h-9 rounded border border-slate-800 bg-slate-950 px-3 text-[13px] text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none placeholder:text-slate-600"
                    value={form.receiverPhone}
                    onChange={(e) => setForm({ ...form, receiverPhone: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">Description</label>
                  <input
                    className="w-full h-9 rounded border border-slate-800 bg-slate-950 px-3 text-[13px] text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none placeholder:text-slate-600"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">Pickup Address</label>
                  <input
                    className="w-full h-9 rounded border border-slate-800 bg-slate-950 px-3 text-[13px] text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none placeholder:text-slate-600"
                    value={form.pickupAddress}
                    onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">Delivery Address</label>
                  <input
                    className="w-full h-9 rounded border border-slate-800 bg-slate-950 px-3 text-[13px] text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none placeholder:text-slate-600"
                    value={form.deliveryAddress}
                    onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">Weight (kg)</label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      className="w-full h-9 rounded border border-slate-800 bg-slate-950 px-3 text-[13px] text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none placeholder:text-slate-600"
                      value={form.weightKg}
                      onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">COD ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="w-full h-9 rounded border border-slate-800 bg-slate-950 px-3 text-[13px] text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none placeholder:text-slate-600"
                      value={form.codAmount}
                      onChange={(e) => setForm({ ...form, codAmount: e.target.value })}
                      placeholder="0 (Prepaid)"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <Button type="submit" disabled={busy} className="w-full">Create Shipment</Button>
                  <p className="mt-4 text-[10px] text-slate-500 leading-relaxed font-sans">
                    The delivery fee is calculated from the weight and any COD amount when
                    the parcel is created. A receiver without an account is emailed a link
                    to claim one.
                  </p>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
