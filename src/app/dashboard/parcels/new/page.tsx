'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileSpreadsheet, Package, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, ApiError } from '@/lib/api';
import { toast } from '@/lib/toast';
import { useAuth } from '@/lib/auth-context';
import {
  ROUTE_LABELS,
  formatMoney,
  fromLocalInput,
  routeFor,
  toLocalInput,
} from '@/lib/parcel-utils';
import {
  DELIVERY_ZONES,
  type DeliveryZone,
  type FeeBreakdown,
  type ServiceTier,
  type User,
} from '@/lib/types';

const EMPTY_FORM = {
  receiverId: '',
  receiverName: '',
  receiverPhone: '',
  pickupAddress: '',
  deliveryAddress: '',
  description: '',
  weightKg: '1',
  codAmount: '',
  pickupZone: 'DHAKA_CITY' as DeliveryZone,
  deliveryZone: 'DHAKA_CITY' as DeliveryZone,
  serviceTier: 'STANDARD' as ServiceTier,
  pickupWindowStart: '',
  pickupWindowEnd: '',
};

const field =
  'w-full h-10 rounded-lg border border-surface-3 bg-white px-3 text-sm text-ink focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none placeholder:text-ink-3';
const label = 'block text-xs font-semibold text-ink-2 mb-1.5';

/** A sensible first slot: from the next whole hour, three hours long. */
function suggestedWindow(): { start: string; end: string } {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() + 1);
  const end = new Date(start.getTime() + 3 * 3_600_000);
  return { start: toLocalInput(start), end: toLocalInput(end) };
}

export default function NewParcelPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [receivers, setReceivers] = useState<User[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [quote, setQuote] = useState<FeeBreakdown | null>(null);
  const [quoteError, setQuoteError] = useState('');
  const [withWindow, setWithWindow] = useState(false);

  const role = user?.role;
  const canCreate = role === 'SENDER' || role === 'ADMIN';

  // The fee is priced by the server; this asks it rather than re-implementing
  // the rates here. Debounced so typing a weight is one request, not five.
  const weightKg = Number(form.weightKg);
  const codAmount = form.codAmount ? Number(form.codAmount) : 0;
  const priceable = weightKg > 0 && codAmount >= 0;
  const route = routeFor(form.pickupZone, form.deliveryZone);
  // Express is a same-day promise only a Dhaka route can keep; the server
  // refuses it elsewhere, so the option is withdrawn rather than left to fail.
  const expressOffered = route !== 'NATIONAL';
  const serviceTier: ServiceTier = expressOffered ? form.serviceTier : 'STANDARD';
  const { pickupZone, deliveryZone } = form;

  useEffect(() => {
    if (!priceable) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      api
        .quoteParcel({ weightKg, codAmount, pickupZone, deliveryZone, serviceTier })
        .then((fee) => {
          if (cancelled) return;
          setQuote(fee);
          setQuoteError('');
        })
        .catch((err) => {
          // No preview is not a reason to block the booking.
          if (cancelled) return;
          setQuote(null);
          setQuoteError(err instanceof ApiError ? err.message : '');
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [priceable, weightKg, codAmount, pickupZone, deliveryZone, serviceTier]);

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

  function toggleWindow(on: boolean) {
    setWithWindow(on);
    if (on && !form.pickupWindowStart) {
      const { start, end } = suggestedWindow();
      setForm({ ...form, pickupWindowStart: start, pickupWindowEnd: end });
    }
  }

  async function createParcel(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      // The typed field takes either; the admin's dropdown always yields an id.
      const receiver = form.receiverId.trim();
      const parcel = await api.createParcel({
        ...(receiver.includes('@') ? { receiverEmail: receiver } : { receiverId: receiver }),
        receiverName: form.receiverName,
        pickupAddress: form.pickupAddress,
        deliveryAddress: form.deliveryAddress,
        receiverPhone: form.receiverPhone || undefined,
        description: form.description || undefined,
        weightKg: Number(form.weightKg),
        codAmount: form.codAmount ? Number(form.codAmount) : undefined,
        pickupZone: form.pickupZone,
        deliveryZone: form.deliveryZone,
        serviceTier,
        ...(withWindow
          ? {
              pickupWindowStart: fromLocalInput(form.pickupWindowStart),
              pickupWindowEnd: fromLocalInput(form.pickupWindowEnd),
            }
          : {}),
      });
      toast.success(`Shipment ${parcel.trackingId} created`);
      router.push('/dashboard/parcels');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Request failed');
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
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold text-ink">
              <Package className="h-5 w-5 text-accent" />
              New shipment
            </h1>
            <p className="mt-1 text-[13px] text-ink-3">
              Enter the receiver and route. The delivery fee updates as you go.
            </p>
          </div>
          {canCreate && (
            <Button asChild variant="secondary" size="sm">
              <Link href="/dashboard/parcels/bulk">
                <FileSpreadsheet className="h-3.5 w-3.5" /> Book many from a CSV
              </Link>
            </Button>
          )}
        </div>
      </div>

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
                placeholder="Optional — the courier calls this"
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
              <label className={label} htmlFor="pickupZone">Pickup area</label>
              <select
                id="pickupZone"
                className={field}
                value={form.pickupZone}
                onChange={(e) => setForm({ ...form, pickupZone: e.target.value as DeliveryZone })}
              >
                {DELIVERY_ZONES.map((z) => (
                  <option key={z.value} value={z.value}>{z.label}</option>
                ))}
              </select>
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
              <label className={label} htmlFor="deliveryZone">Delivery area</label>
              <select
                id="deliveryZone"
                className={field}
                value={form.deliveryZone}
                onChange={(e) => setForm({ ...form, deliveryZone: e.target.value as DeliveryZone })}
              >
                {DELIVERY_ZONES.map((z) => (
                  <option key={z.value} value={z.value}>{z.label}</option>
                ))}
              </select>
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
              <label className={label} htmlFor="codAmount">Cash to collect (BDT)</label>
              <input
                id="codAmount"
                type="number"
                min="0"
                step="1"
                className={field}
                value={form.codAmount}
                onChange={(e) => setForm({ ...form, codAmount: e.target.value })}
                placeholder="0 — prepaid"
              />
            </div>

            <fieldset className="sm:col-span-2">
              <legend className={label}>Service</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {(['STANDARD', 'EXPRESS'] as ServiceTier[]).map((tier) => {
                  const disabled = tier === 'EXPRESS' && !expressOffered;
                  const selected = serviceTier === tier;
                  return (
                    <label
                      key={tier}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors ${
                        selected ? 'border-accent bg-accent-bg' : 'border-surface-3 bg-white hover:bg-surface'
                      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      <input
                        type="radio"
                        name="serviceTier"
                        className="mt-1 accent-accent"
                        checked={selected}
                        disabled={disabled}
                        onChange={() => setForm({ ...form, serviceTier: tier })}
                      />
                      <span>
                        <b className="flex items-center gap-1 text-ink">
                          {tier === 'EXPRESS' && <Zap className="h-3.5 w-3.5 text-amber-500" />}
                          {tier === 'EXPRESS' ? 'Express' : 'Standard'}
                        </b>
                        <span className="text-xs text-ink-3">
                          {tier === 'EXPRESS'
                            ? disabled
                              ? 'Only inside Dhaka and its suburbs'
                              : 'Same day inside the city, next day to the suburbs'
                            : route === 'NATIONAL'
                              ? 'About three days nationwide'
                              : route === 'SUBURB'
                                ? 'About two days'
                                : 'Next day'}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="sm:col-span-2">
              <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-ink-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-surface-3 accent-accent"
                  checked={withWindow}
                  onChange={(e) => toggleWindow(e.target.checked)}
                />
                Choose a pickup time
              </label>
              {withWindow && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={label} htmlFor="pickupWindowStart">From</label>
                    <input
                      id="pickupWindowStart"
                      type="datetime-local"
                      className={field}
                      value={form.pickupWindowStart}
                      onChange={(e) => setForm({ ...form, pickupWindowStart: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className={label} htmlFor="pickupWindowEnd">Until</label>
                    <input
                      id="pickupWindowEnd"
                      type="datetime-local"
                      className={field}
                      value={form.pickupWindowEnd}
                      onChange={(e) => setForm({ ...form, pickupWindowEnd: e.target.value })}
                      required
                    />
                  </div>
                  <p className="text-[11px] text-ink-3 sm:col-span-2">
                    Up to 12 hours long, within the next 14 days. The delivery estimate counts from the end of it.
                  </p>
                </div>
              )}
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
            <div className="max-w-sm text-xs leading-relaxed text-ink-3">
              {priceable && quote && (
                <p className="mb-1 text-sm text-ink" aria-live="polite">
                  Delivery fee <strong>{formatMoney(quote.total)}</strong>
                  <span className="text-xs text-ink-3">
                    {' '}— {ROUTE_LABELS[quote.route ?? route]}: {formatMoney(quote.baseFee)} base
                    {quote.weightFee > 0 ? ` + ${formatMoney(quote.weightFee)} weight` : ''}
                    {quote.codFee > 0 ? ` + ${formatMoney(quote.codFee)} cash handling` : ''}
                    {(quote.expressFee ?? 0) > 0 ? ` + ${formatMoney(quote.expressFee ?? 0)} express` : ''}
                  </span>
                </p>
              )}
              {quoteError && <p className="mb-1 text-rose-600">{quoteError}</p>}
              <p>
                {codAmount > 0
                  ? 'The fee comes out of the cash the courier collects.'
                  : 'Prepaid: pay the fee online from your shipments, or it is taken from your next payout.'}{' '}
                A receiver without an account is emailed a link to claim one.
              </p>
            </div>
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
