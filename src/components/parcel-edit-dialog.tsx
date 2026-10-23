'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { api, ApiError } from '@/lib/api';
import { formatMoney, fromLocalInput, routeFor, toLocalInput } from '@/lib/parcel-utils';
import { toast } from '@/lib/toast';
import { DELIVERY_ZONES, type DeliveryZone, type Parcel, type ServiceTier } from '@/lib/types';

const field =
  'h-10 w-full rounded-lg border border-surface-3 bg-white px-3 text-sm text-ink focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none placeholder:text-ink-3';
const label = 'mb-1.5 block text-xs font-semibold text-ink-2';

/**
 * Changes a booking before pickup. Only what changed is sent; weight, cash,
 * zones and tier re-price it, and the difference lands on the sender's
 * balance. A parcel paid online cannot change price — the API says so.
 */
export function ParcelEditDialog({
  parcel,
  onClose,
  onSaved,
}: {
  parcel: Parcel;
  onClose: () => void;
  onSaved: () => void;
}) {
  const initial = {
    receiverName: parcel.receiverName,
    receiverPhone: parcel.receiverPhone ?? '',
    pickupAddress: parcel.pickupAddress,
    deliveryAddress: parcel.deliveryAddress,
    description: parcel.description ?? '',
    weightKg: String(parcel.weightKg),
    codAmount: String(parcel.codAmount),
    pickupZone: parcel.pickupZone,
    deliveryZone: parcel.deliveryZone,
    serviceTier: parcel.serviceTier,
    pickupWindowStart: parcel.pickupWindowStart ? toLocalInput(new Date(parcel.pickupWindowStart)) : '',
    pickupWindowEnd: parcel.pickupWindowEnd ? toLocalInput(new Date(parcel.pickupWindowEnd)) : '',
  };
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);

  const expressOffered = routeFor(form.pickupZone, form.deliveryZone) !== 'NATIONAL';

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const changes: Parameters<typeof api.updateParcel>[1] = {};
    const text = ['receiverName', 'receiverPhone', 'pickupAddress', 'deliveryAddress', 'description'] as const;
    for (const key of text) {
      if (form[key] !== initial[key]) changes[key] = form[key].trim();
    }
    if (form.weightKg !== initial.weightKg) changes.weightKg = Number(form.weightKg);
    if (form.codAmount !== initial.codAmount) changes.codAmount = Number(form.codAmount || 0);
    if (form.pickupZone !== initial.pickupZone) changes.pickupZone = form.pickupZone;
    if (form.deliveryZone !== initial.deliveryZone) changes.deliveryZone = form.deliveryZone;
    const tier = expressOffered ? form.serviceTier : 'STANDARD';
    if (tier !== initial.serviceTier) changes.serviceTier = tier;
    if (form.pickupWindowStart !== initial.pickupWindowStart || form.pickupWindowEnd !== initial.pickupWindowEnd) {
      changes.pickupWindowStart = fromLocalInput(form.pickupWindowStart);
      changes.pickupWindowEnd = fromLocalInput(form.pickupWindowEnd);
    }

    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    setBusy(true);
    try {
      const updated = await api.updateParcel(parcel.trackingId, changes);
      toast.success(
        updated.deliveryFee !== parcel.deliveryFee
          ? `Booking updated — new fee ${formatMoney(updated.deliveryFee)}`
          : 'Booking updated',
      );
      onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update the booking');
    } finally {
      setBusy(false);
    }
  }

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm({ ...form, [key]: value });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent title={`Edit ${parcel.trackingId}`} description="Possible until a courier picks it up." className="max-w-2xl">
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="e-name">Receiver name</label>
              <input id="e-name" className={field} value={form.receiverName} onChange={(e) => set('receiverName', e.target.value)} required />
            </div>
            <div>
              <label className={label} htmlFor="e-phone">Receiver phone</label>
              <input id="e-phone" className={field} value={form.receiverPhone} onChange={(e) => set('receiverPhone', e.target.value)} />
            </div>
            <div>
              <label className={label} htmlFor="e-pickup">Pickup address</label>
              <input id="e-pickup" className={field} value={form.pickupAddress} onChange={(e) => set('pickupAddress', e.target.value)} required />
            </div>
            <div>
              <label className={label} htmlFor="e-pzone">Pickup area</label>
              <select id="e-pzone" className={field} value={form.pickupZone} onChange={(e) => set('pickupZone', e.target.value as DeliveryZone)}>
                {DELIVERY_ZONES.map((z) => <option key={z.value} value={z.value}>{z.label}</option>)}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="e-delivery">Delivery address</label>
              <input id="e-delivery" className={field} value={form.deliveryAddress} onChange={(e) => set('deliveryAddress', e.target.value)} required />
            </div>
            <div>
              <label className={label} htmlFor="e-dzone">Delivery area</label>
              <select id="e-dzone" className={field} value={form.deliveryZone} onChange={(e) => set('deliveryZone', e.target.value as DeliveryZone)}>
                {DELIVERY_ZONES.map((z) => <option key={z.value} value={z.value}>{z.label}</option>)}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="e-weight">Weight (kg)</label>
              <input id="e-weight" type="number" min="0.1" step="0.1" className={field} value={form.weightKg} onChange={(e) => set('weightKg', e.target.value)} required />
            </div>
            <div>
              <label className={label} htmlFor="e-cod">Cash to collect (BDT)</label>
              <input id="e-cod" type="number" min="0" step="1" className={field} value={form.codAmount} onChange={(e) => set('codAmount', e.target.value)} />
            </div>
            <div>
              <label className={label} htmlFor="e-tier">Service</label>
              <select id="e-tier" className={field} value={expressOffered ? form.serviceTier : 'STANDARD'} onChange={(e) => set('serviceTier', e.target.value as ServiceTier)}>
                <option value="STANDARD">Standard</option>
                <option value="EXPRESS" disabled={!expressOffered}>Express{expressOffered ? '' : ' (Dhaka only)'}</option>
              </select>
            </div>
            <div>
              <label className={label} htmlFor="e-desc">Description</label>
              <input id="e-desc" className={field} value={form.description} onChange={(e) => set('description', e.target.value)} />
            </div>
            <div>
              <label className={label} htmlFor="e-from">Pickup from</label>
              <input id="e-from" type="datetime-local" className={field} value={form.pickupWindowStart} onChange={(e) => set('pickupWindowStart', e.target.value)} />
            </div>
            <div>
              <label className={label} htmlFor="e-until">Pickup until</label>
              <input id="e-until" type="datetime-local" className={field} value={form.pickupWindowEnd} onChange={(e) => set('pickupWindowEnd', e.target.value)} />
            </div>
          </div>
          {parcel.paymentStatus === 'PAID' && (
            <p className="text-xs text-ink-3">
              The fee is already paid online, so changes that would alter the price are refused.
            </p>
          )}
          <div className="flex justify-end gap-2 border-t border-surface-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
