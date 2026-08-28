'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  PARCEL_STATUSES,
  type Parcel,
  type ParcelStatus,
  type User,
} from '@/lib/types';
import {
  formatDate, formatStatus, mergeParcels, statusPillClass,
} from '@/lib/parcel-utils';

const SELECT_CLASS =
  'flex h-11 w-full rounded-md border border-surface-3 bg-white px-3 text-sm';

const EMPTY_FORM = {
  receiverId: '',
  receiverName: '',
  receiverPhone: '',
  pickupAddress: '',
  deliveryAddress: '',
  description: '',
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
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  // Keyed on the role string so a new user object identity cannot refire this.
  const role = user?.role;

  const load = useCallback(async () => {
    if (!role) return;
    setError('');
    try {
      if (role === 'ADMIN') {
        const [all, everyone, activeCouriers] = await Promise.all([
          api.getAllParcels(),
          api.getAllUsers(),
          api.getCouriers(),
        ]);
        setParcels(all);
        setUsers(everyone);
        setCouriers(activeCouriers);
      } else if (role === 'SENDER') {
        setParcels(await api.getMyParcels());
      } else {
        // A receiver's two lists overlap — merge on id so nothing repeats.
        const [incoming, history] = await Promise.all([
          api.getIncomingParcels(),
          api.getDeliveryHistory(),
        ]);
        setParcels(mergeParcels(incoming, history));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load parcels');
    }
  }, [role]);

  useEffect(() => {
    load();
  }, [load]);

  /** Runs a mutation, surfaces its error, and reloads on success. */
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
          ...form,
          receiverPhone: form.receiverPhone || undefined,
          description: form.description || undefined,
        }),
      'Parcel created',
    );
    setForm(EMPTY_FORM);
  }

  const canCreate = user?.role === 'SENDER' || user?.role === 'ADMIN';
  const receivers = users.filter((u) => u.role === 'RECEIVER');

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {msg && <p className="text-sm text-green">{msg}</p>}

      {canCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Create parcel</CardTitle>
          </CardHeader>
          <form onSubmit={createParcel} className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Receiver</Label>
              {receivers.length > 0 ? (
                <select
                  className={SELECT_CLASS}
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
                  <option value="">Select receiver</option>
                  {receivers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  placeholder="Receiver UUID"
                  value={form.receiverId}
                  onChange={(e) => setForm({ ...form, receiverId: e.target.value })}
                  required
                />
              )}
            </div>
            <div>
              <Label>Receiver name</Label>
              <Input
                value={form.receiverName}
                onChange={(e) => setForm({ ...form, receiverName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Receiver phone</Label>
              <Input
                value={form.receiverPhone}
                onChange={(e) => setForm({ ...form, receiverPhone: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div>
              <Label>Pickup address</Label>
              <Input
                value={form.pickupAddress}
                onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Delivery address</Label>
              <Input
                value={form.deliveryAddress}
                onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                required
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={busy}>Create shipment</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {user?.role === 'ADMIN'
              ? 'All shipments'
              : user?.role === 'SENDER'
                ? 'My shipments'
                : 'Incoming & delivered'}
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-2 text-xs uppercase text-ink-3">
                <th className="pb-3 text-left">Tracking</th>
                <th className="pb-3 text-left">From → To</th>
                <th className="pb-3 text-left">Status</th>
                {user?.role === 'ADMIN' && <th className="pb-3 text-left">Courier</th>}
                <th className="pb-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {parcels.map((p) => {
                const draft = statusDraft[p.id] ?? { status: p.status, note: '' };
                const isOpen = expanded === p.id;
                return (
                  <tr key={p.id} className="border-b border-surface-2 align-top">
                    <td className="py-3 font-medium">
                      <button
                        type="button"
                        className="text-left hover:text-accent"
                        onClick={() => setExpanded(isOpen ? null : p.id)}
                      >
                        {p.trackingId}
                      </button>
                      {isOpen && (
                        <div className="mt-3 space-y-2 text-xs font-normal text-ink-3">
                          <p>Sender: {p.senderName}{p.senderPhone ? ` · ${p.senderPhone}` : ''}</p>
                          <p>Receiver: {p.receiverName}{p.receiverPhone ? ` · ${p.receiverPhone}` : ''}</p>
                          <p>
                            Courier:{' '}
                            {p.deliveryPersonnel
                              ? `${p.deliveryPersonnel.name}${p.deliveryPersonnel.phone ? ` · ${p.deliveryPersonnel.phone}` : ''}`
                              : 'Not assigned yet'}
                          </p>
                          {p.description && <p>Note: {p.description}</p>}
                          <p className="pt-1 font-medium text-ink-2">Status history</p>
                          {(p.statusLogs ?? []).map((log) => (
                            <p key={log.id}>
                              {formatDate(log.createdAt)} — {formatStatus(log.status)}
                              {/* null once the author's account has been deleted */}
                              {log.changedBy ? ` by ${log.changedBy.name}` : ''}
                              {log.note ? ` (${log.note})` : ''}
                            </p>
                          ))}
                          {(p.statusLogs ?? []).length === 0 && <p>No status history.</p>}
                          {user?.role === 'ADMIN' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={busy}
                              onClick={() => run(() => api.indexParcel(p.id), 'Parcel indexed for AI search')}
                            >
                              Index for AI search
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-ink-3">
                      {p.pickupAddress} → {p.deliveryAddress}
                    </td>
                    <td className="py-3">
                      <span className={statusPillClass(p.status)}>{formatStatus(p.status)}</span>
                      {p.isBlocked && (
                        <span className="status-pill s-failed ml-1">Blocked</span>
                      )}
                    </td>
                    {user?.role === 'ADMIN' && (
                      <td className="py-3">
                        <div className="flex flex-col gap-1">
                          <select
                            className="h-9 rounded-md border border-surface-3 bg-white px-2 text-xs"
                            value={assignDraft[p.id] ?? p.deliveryPersonnel?.id ?? ''}
                            onChange={(e) =>
                              setAssignDraft({ ...assignDraft, [p.id]: e.target.value })
                            }
                          >
                            <option value="">Unassigned</option>
                            {/* Assignment is refused for anything but an approved,
                                active courier. */}
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
                    <td className="py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {user?.role === 'SENDER' && p.status === 'PENDING' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={busy}
                            onClick={() => run(() => api.cancelParcel(p.trackingId), 'Parcel cancelled')}
                          >
                            Cancel
                          </Button>
                        )}
                        {user?.role === 'RECEIVER' && p.status !== 'DELIVERED' && p.status !== 'CANCELLED' && (
                          <Button
                            size="sm"
                            disabled={busy}
                            onClick={() => run(() => api.confirmParcel(p.trackingId), 'Delivery confirmed')}
                          >
                            Confirm delivery
                          </Button>
                        )}
                        {user?.role === 'ADMIN' && (
                          <>
                            <select
                              className="h-9 rounded-md border border-surface-3 bg-white px-2 text-xs"
                              value={draft.status}
                              onChange={(e) =>
                                setStatusDraft({
                                  ...statusDraft,
                                  [p.id]: { ...draft, status: e.target.value as ParcelStatus },
                                })
                              }
                            >
                              {PARCEL_STATUSES.map((s) => (
                                <option key={s} value={s}>{formatStatus(s)}</option>
                              ))}
                            </select>
                            <input
                              className="h-9 w-32 rounded-md border border-surface-3 px-2 text-xs"
                              placeholder="Note (optional)"
                              value={draft.note}
                              onChange={(e) =>
                                setStatusDraft({
                                  ...statusDraft,
                                  [p.id]: { ...draft, note: e.target.value },
                                })
                              }
                            />
                            <Button
                              size="sm"
                              variant="secondary"
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
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {parcels.length === 0 && (
                <tr>
                  <td colSpan={user?.role === 'ADMIN' ? 5 : 4} className="py-6 text-center text-ink-3">
                    No parcels to show.
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
