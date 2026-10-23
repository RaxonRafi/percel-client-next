'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, FileSpreadsheet, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { saveText } from '@/lib/download';
import { toast } from '@/lib/toast';
import {
  DELIVERY_ZONES,
  type BulkBookingResult,
  type BulkBookingRowError,
  type DeliveryZone,
} from '@/lib/types';

const field =
  'w-full h-10 rounded-lg border border-surface-3 bg-white px-3 text-sm text-ink focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none placeholder:text-ink-3';
const label = 'block text-xs font-semibold text-ink-2 mb-1.5';

/** Column names are the booking fields; the server matches them case-insensitively. */
const TEMPLATE = [
  'receiverName,receiverEmail,receiverPhone,deliveryAddress,deliveryZone,weightKg,codAmount,serviceTier,description',
  'Karim Ahmed,karim@example.com,+8801711000001,"House 1, Road 3, Mirpur 10, Dhaka",DHAKA_CITY,1.5,2000,STANDARD,Order #1001',
  'Nusrat Jahan,nusrat@example.com,+8801811000002,"12 Station Road, Rajshahi",OUTSIDE_DHAKA,2,,STANDARD,Order #1002 (prepaid)',
].join('\r\n');

export default function BulkBookingPage() {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupZone, setPickupZone] = useState<DeliveryZone>('DHAKA_CITY');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<BulkBookingResult | null>(null);
  const [rowErrors, setRowErrors] = useState<BulkBookingRowError[]>([]);
  const [error, setError] = useState('');

  const canCreate = user?.role === 'SENDER' || user?.role === 'ADMIN';

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError('');
    setRowErrors([]);
    setResult(null);
    try {
      const booked = await api.bulkCreateParcels(file, {
        pickupAddress: pickupAddress.trim() || undefined,
        pickupZone,
      });
      setResult(booked);
      toast.success(`${booked.created} shipment${booked.created === 1 ? '' : 's'} booked`);
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as { errors?: BulkBookingRowError[] } | undefined;
        setRowErrors(body?.errors ?? []);
        setError(err.message);
      } else {
        setError('Upload failed');
      }
    } finally {
      setBusy(false);
    }
  }

  if (!canCreate) {
    return (
      <div className="rounded-xl border border-surface-3 bg-white p-6 text-sm text-ink-2 shadow-sm">
        Only senders and admins can book shipments.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/dashboard/parcels/new"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-3 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to a single shipment
        </Link>
        <h1 className="mt-3 flex items-center gap-2 text-xl font-bold text-ink">
          <FileSpreadsheet className="h-5 w-5 text-accent" />
          Book from a CSV
        </h1>
        <p className="mt-1 text-[13px] text-ink-3">
          One row per parcel, up to 500 at a time. Every row is checked first: if any row has a problem, nothing is booked and you get the list to fix.
        </p>
      </div>

      <form onSubmit={upload} className="rounded-xl border border-surface-3 bg-white shadow-sm">
        <div className="space-y-5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-surface-3 bg-surface p-4">
            <div className="text-xs text-ink-2">
              <b className="block text-sm text-ink">Start from the template</b>
              Columns: receiverName, receiverEmail (or receiverId), receiverPhone, pickupAddress, deliveryAddress,
              pickupZone, deliveryZone, weightKg, codAmount, serviceTier, description, pickupWindowStart, pickupWindowEnd.
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={() => saveText(TEMPLATE, 'shipments-template.csv')}>
              <Download className="h-3.5 w-3.5" /> Template
            </Button>
          </div>

          <div>
            <label className={label} htmlFor="file">Booking file</label>
            <input
              ref={fileRef}
              id="file"
              type="file"
              accept=".csv,text/csv"
              className="block w-full text-sm text-ink-2 file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-accent-2"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setResult(null);
                setRowErrors([]);
                setError('');
              }}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="pickupAddress">Pickup address for every row</label>
              <input
                id="pickupAddress"
                className={field}
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Your warehouse — used where a row leaves it empty"
              />
            </div>
            <div>
              <label className={label} htmlFor="pickupZone">Pickup area</label>
              <select
                id="pickupZone"
                className={field}
                value={pickupZone}
                onChange={(e) => setPickupZone(e.target.value as DeliveryZone)}
              >
                {DELIVERY_ZONES.map((z) => (
                  <option key={z.value} value={z.value}>{z.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-surface-3 px-6 py-4">
          <Button asChild variant="secondary">
            <Link href="/dashboard/parcels">Done</Link>
          </Button>
          <Button type="submit" disabled={busy || !file}>
            <Upload className="h-4 w-4" />
            {busy ? 'Booking…' : 'Upload and book'}
          </Button>
        </div>
      </form>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <p className="font-semibold">{error}</p>
          {rowErrors.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs">
              {rowErrors.map((row) => (
                <li key={row.line}>
                  <b>Line {row.line}:</b> {row.errors.join('; ')}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {result && (
        <div className="rounded-xl border border-surface-3 bg-white shadow-sm">
          <div className="flex flex-wrap gap-4 border-b border-surface-3 px-5 py-4 text-sm">
            <span className="font-semibold text-emerald-600">{result.created} booked</span>
            {result.failed > 0 && <span className="font-semibold text-rose-600">{result.failed} not booked</span>}
          </div>
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-surface-3 bg-surface text-[11px] uppercase tracking-wider text-ink-3">
              <tr>
                <th className="px-5 py-3 font-semibold">Line</th>
                <th className="px-5 py-3 font-semibold">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-3">
              {result.results.map((row) => (
                <tr key={row.line}>
                  <td className="px-5 py-2.5 text-ink-3">{row.line}</td>
                  <td className="px-5 py-2.5">
                    {row.trackingId ? (
                      <Link className="font-semibold text-accent hover:underline" href={`/track/${row.trackingId}`}>
                        {row.trackingId}
                      </Link>
                    ) : (
                      <span className="text-rose-600">{row.error}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
