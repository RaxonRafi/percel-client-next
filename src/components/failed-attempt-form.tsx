'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { api, ApiError } from '@/lib/api';
import { fromLocalInput } from '@/lib/parcel-utils';
import { toast } from '@/lib/toast';
import { FAILURE_REASONS, type DeliveryFailureReason, type Parcel } from '@/lib/types';

const input =
  'w-full h-9 rounded-md border border-surface-3 bg-white px-3 text-[13px] text-ink-2 focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none placeholder:text-ink-3';
const label = 'block text-[10px] font-bold tracking-wider text-ink-3 mb-1.5 uppercase';

/**
 * The courier was at the door and could not hand the parcel over. Counts
 * against the attempt limit (3 by default); after that the parcel can only
 * go back to its sender. The note stays off the public tracking page.
 */
export function FailedAttemptForm({
  parcel,
  onDone,
  onCancel,
}: {
  parcel: Parcel;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState<DeliveryFailureReason>('RECEIVER_UNAVAILABLE');
  const [note, setNote] = useState('');
  const [rescheduledFor, setRescheduledFor] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const updated = await api.recordFailedAttempt(parcel.trackingId, {
        reason,
        note: note.trim() || undefined,
        rescheduledFor: fromLocalInput(rescheduledFor),
      });
      toast.success(`Attempt ${updated.deliveryAttempts} recorded for ${parcel.trackingId}`);
      onDone();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not record the attempt');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-4 rounded-xl border border-amber-200 bg-amber-50/40 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
        Delivery failed — {parcel.trackingId}
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className={label} htmlFor={`reason-${parcel.id}`}>What happened</label>
          <select
            id={`reason-${parcel.id}`}
            className={input}
            value={reason}
            onChange={(e) => setReason(e.target.value as DeliveryFailureReason)}
          >
            {FAILURE_REASONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor={`again-${parcel.id}`}>Try again on (optional)</label>
          <input
            id={`again-${parcel.id}`}
            type="datetime-local"
            className={input}
            value={rescheduledFor}
            onChange={(e) => setRescheduledFor(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className={label} htmlFor={`note-${parcel.id}`}>Note for the office</label>
        <input
          id={`note-${parcel.id}`}
          className={input}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Gate locked, phone off — not shown publicly"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={busy}>Record attempt</Button>
        <Button type="button" size="sm" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
