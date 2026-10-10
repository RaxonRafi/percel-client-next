'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { User } from '@/lib/types';

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

const field =
  'w-full h-10 rounded-lg border border-surface-3 bg-white px-3 text-sm text-ink focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none placeholder:text-ink-3';
const label = 'block text-xs font-semibold text-ink-2 mb-1.5';

export default function NewParcelPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [receivers, setReceivers] = useState<User[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const role = user?.role;
  const canCreate = role === 'SENDER' || role === 'ADMIN';

  // Only admins may list users; senders type the receiver's email or ID instead.
  useEffect(() => {
    if (role !== 'ADMIN') return;
    let cancelled = false;
    api
      .getAllUsers({ role: 'RECEIVER', limit: 100 })
      .then((res) => {
        if (!cancelled) setReceivers(res.data);
      })
      .catch(() => {
        // The form still works with a typed receiver ID.
      });
    return () => {
      cancelled = true;
    };
  }, [role]);

  async function createParcel(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      // The typed field takes either; the admin's dropdown always yields an id.
      const receiver = form.receiverId.trim();
      await api.createParcel({
        ...(receiver.includes('@') ? { receiverEmail: receiver } : { receiverId: receiver }),
        receiverName: form.receiverName,
        pickupAddress: form.pickupAddress,
        deliveryAddress: form.deliveryAddress,
        receiverPhone: form.receiverPhone || undefined,
        description: form.description || undefined,
        weightKg: Number(form.weightKg),
        codAmount: form.codAmount ? Number(form.codAmount) : undefined,
      });
      router.push('/dashboard/parcels');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Request failed');
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/dashboard/parcels"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-3 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to shipments
        </Link>
        <h1 className="mt-3 flex items-center gap-2 text-xl font-bold text-ink">
          <Package className="h-5 w-5 text-accent" />
          New shipment
        </h1>
        <p className="mt-1 text-[13px] text-ink-3">
          Enter the receiver and route. The delivery fee is calculated when the parcel is created.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      {!canCreate ? (
        <div className="rounded-xl border border-surface-3 bg-white p-6 text-sm text-ink-2 shadow-sm">
          Only senders and admins can create shipments.
        </div>
      ) : (
        <form
          onSubmit={createParcel}
          className="rounded-xl border border-surface-3 bg-white shadow-sm"
        >
          <div className="grid gap-5 p-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={label} htmlFor="receiverId">Receiver</label>
              {receivers.length > 0 ? (
                <select
                  id="receiverId"
                  className={field}
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
                <input
                  id="receiverId"
                  className={field}
                  placeholder="Receiver's email, or their account ID"
                  value={form.receiverId}
                  onChange={(e) => setForm({ ...form, receiverId: e.target.value })}
                  required
                />
              )}
            </div>
            <div>
              <label className={label} htmlFor="receiverName">Receiver name</label>
              <input
                id="receiverName"
                className={field}
                value={form.receiverName}
                onChange={(e) => setForm({ ...form, receiverName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className={label} htmlFor="receiverPhone">Receiver phone</label>
              <input
                id="receiverPhone"
                className={field}
                value={form.receiverPhone}
                onChange={(e) => setForm({ ...form, receiverPhone: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className={label} htmlFor="pickupAddress">Pickup address</label>
              <input
                id="pickupAddress"
                className={field}
                value={form.pickupAddress}
                onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
                required
              />
            </div>
            <div>
              <label className={label} htmlFor="deliveryAddress">Delivery address</label>
              <input
                id="deliveryAddress"
                className={field}
                value={form.deliveryAddress}
                onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                required
              />
            </div>
            <div>
              <label className={label} htmlFor="weightKg">Weight (kg)</label>
              <input
                id="weightKg"
                type="number"
                min="0.1"
                step="0.1"
                className={field}
                value={form.weightKg}
                onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                required
              />
            </div>
            <div>
              <label className={label} htmlFor="codAmount">COD ($)</label>
              <input
                id="codAmount"
                type="number"
                min="0"
                step="1"
                className={field}
                value={form.codAmount}
                onChange={(e) => setForm({ ...form, codAmount: e.target.value })}
                placeholder="0 (Prepaid)"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={label} htmlFor="description">Description</label>
              <input
                id="description"
                className={field}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-surface-3 px-6 py-4">
            <p className="max-w-sm text-xs leading-relaxed text-ink-3">
              A receiver without an account is emailed a link to claim one.
            </p>
            <div className="flex gap-3">
              <Button asChild variant="secondary">
                <Link href="/dashboard/parcels">Cancel</Link>
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? 'Creating…' : 'Create shipment'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
