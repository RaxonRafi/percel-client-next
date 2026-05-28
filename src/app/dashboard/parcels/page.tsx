'use client';

import { useEffect, useState } from 'react';
import { DashboardTopbar } from '@/components/dashboard/topbar';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, ApiError } from '@/lib/api';
import { getStoredUser } from '@/lib/auth-storage';
import type { Parcel, User } from '@/lib/types';
import { parcelStatusVariant } from '@/lib/parcel-utils';

export default function ParcelsPage() {
  const user = getStoredUser();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({
    receiverId: '',
    receiverName: '',
    pickupAddress: '',
    deliveryAddress: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  async function load() {
    try {
      if (user?.role === 'ADMIN') {
        setParcels(await api.getAllParcels());
        setUsers(await api.getAllUsers());
      } else if (user?.role === 'SENDER') {
        setParcels(await api.getMyParcels());
      } else if (user?.role === 'RECEIVER') {
        const incoming = await api.getIncomingParcels();
        const history = await api.getDeliveryHistory();
        setParcels([...incoming, ...history]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load parcels');
    }
  }

  useEffect(() => {
    load();
  }, [user?.role]);

  async function createParcel(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    try {
      await api.createParcel(form);
      setMsg('Parcel created');
      setForm({
        receiverId: '',
        receiverName: '',
        pickupAddress: '',
        deliveryAddress: '',
        description: '',
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Create failed');
    }
  }

  return (
    <>
      <DashboardTopbar title="Shipments" />
      <div className="space-y-6 p-8">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {msg && <p className="text-sm text-green">{msg}</p>}

        {(user?.role === 'SENDER' || user?.role === 'ADMIN') && (
          <Card>
            <CardHeader>
              <CardTitle>Create parcel</CardTitle>
            </CardHeader>
            <form
              onSubmit={createParcel}
              className="grid gap-4 md:grid-cols-2"
            >
              <div>
                <Label>Receiver user ID</Label>
                {users.length > 0 ? (
                  <select
                    className="flex h-11 w-full rounded-md border border-surface-3 bg-white px-3 text-sm"
                    value={form.receiverId}
                    onChange={(e) => {
                      const u = users.find((x) => x.id === e.target.value);
                      setForm({
                        ...form,
                        receiverId: e.target.value,
                        receiverName: u?.name ?? '',
                      });
                    }}
                    required
                  >
                    <option value="">Select receiver</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    placeholder="Receiver UUID"
                    value={form.receiverId}
                    onChange={(e) =>
                      setForm({ ...form, receiverId: e.target.value })
                    }
                    required
                  />
                )}
              </div>
              <div>
                <Label>Receiver name</Label>
                <Input
                  value={form.receiverName}
                  onChange={(e) =>
                    setForm({ ...form, receiverName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Pickup address</Label>
                <Input
                  value={form.pickupAddress}
                  onChange={(e) =>
                    setForm({ ...form, pickupAddress: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Delivery address</Label>
                <Input
                  value={form.deliveryAddress}
                  onChange={(e) =>
                    setForm({ ...form, deliveryAddress: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit">Create shipment</Button>
              </div>
            </form>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All shipments</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-2 text-xs uppercase text-ink-3">
                  <th className="pb-3 text-left">Tracking</th>
                  <th className="pb-3 text-left">From → To</th>
                  <th className="pb-3 text-left">Status</th>
                  <th className="pb-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {parcels.map((p) => (
                  <tr key={p.id} className="border-b border-surface-2">
                    <td className="py-3 font-medium">{p.trackingId}</td>
                    <td className="py-3 text-ink-3">
                      {p.senderName} → {p.receiverName}
                    </td>
                    <td className="py-3">
                      <Badge variant={parcelStatusVariant(p.status)}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        {user?.role === 'SENDER' && p.status !== 'DELIVERED' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              api.cancelParcel(p.trackingId).then(load)
                            }
                          >
                            Cancel
                          </Button>
                        )}
                        {user?.role === 'RECEIVER' && (
                          <Button
                            size="sm"
                            onClick={() =>
                              api.confirmParcel(p.trackingId).then(load)
                            }
                          >
                            Confirm
                          </Button>
                        )}
                        {user?.role === 'ADMIN' && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                api
                                  .updateParcelStatus(
                                    p.trackingId,
                                    'IN_TRANSIT',
                                  )
                                  .then(load)
                              }
                            >
                              In transit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                api.blockParcel(p.trackingId).then(load)
                              }
                            >
                              Block
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
