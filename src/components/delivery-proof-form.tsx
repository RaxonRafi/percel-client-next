'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { api, ApiError } from '@/lib/api';
import { formatMoney } from '@/lib/parcel-utils';
import { toast } from '@/lib/toast';
import type { Parcel } from '@/lib/types';

const MAX_IMAGES = 5;

/**
 * Completes a delivery: submitting moves the parcel to DELIVERED and stamps
 * `deliveredAt`. A parcel carrying COD is refused unless the cash is marked
 * collected, so that box is forced on when `codAmount > 0`.
 */
export function DeliveryProofForm({
  parcel,
  onDone,
  onCancel,
}: {
  parcel: Parcel;
  onDone: () => void;
  onCancel: () => void;
}) {
  const hasCod = parcel.codAmount > 0;
  const [images, setImages] = useState<string[]>(['']);
  const [receivedBy, setReceivedBy] = useState('');
  const [note, setNote] = useState('');
  const [codCollected, setCodCollected] = useState(!hasCod);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const urls = images.map((u) => u.trim()).filter(Boolean);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (urls.length === 0) {
      setError('At least one proof image is required');
      return;
    }
    if (hasCod && !codCollected) {
      setError(`Collect ${formatMoney(parcel.codAmount)} before completing this delivery`);
      return;
    }
    setBusy(true);
    try {
      await api.submitDeliveryProof(parcel.trackingId, {
        images: urls,
        receivedBy: receivedBy.trim() || undefined,
        note: note.trim() || undefined,
        codCollected,
      });
      toast.success(`${parcel.trackingId} delivered`);
      onDone();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not submit proof');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mt-3 space-y-4 rounded-xl border border-surface-3 bg-white p-4"
    >
      <p className="text-[11px] font-bold tracking-wider text-accent uppercase">Complete Delivery — {parcel.trackingId}</p>

      <div>
        <label className="block text-[10px] font-bold tracking-wider text-ink-3 mb-1.5 uppercase">Proof Images (1–{MAX_IMAGES} URLs)</label>
        <div className="space-y-2">
          {images.map((url, i) => (
            <input
              key={i}
              className="w-full h-9 rounded-md border border-surface-3 bg-white px-3 text-[13px] text-ink-2 focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none placeholder:text-ink-3"
              value={url}
              placeholder="https://…"
              onChange={(e) => {
                const next = [...images];
                next[i] = e.target.value;
                setImages(next);
              }}
            />
          ))}
        </div>
        {images.length < MAX_IMAGES && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="mt-2"
            onClick={() => setImages([...images, ''])}
          >
            Add another image
          </Button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="block text-[10px] font-bold tracking-wider text-ink-3 mb-1.5 uppercase">Received by</label>
          <input
            className="w-full h-9 rounded-md border border-surface-3 bg-white px-3 text-[13px] text-ink-2 focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none placeholder:text-ink-3"
            value={receivedBy}
            onChange={(e) => setReceivedBy(e.target.value)}
            placeholder={parcel.receiverName}
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold tracking-wider text-ink-3 mb-1.5 uppercase">Note</label>
          <input
            className="w-full h-9 rounded-md border border-surface-3 bg-white px-3 text-[13px] text-ink-2 focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none placeholder:text-ink-3"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>

      {hasCod ? (
        <label className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-ink-2 uppercase cursor-pointer">
          <input
            type="checkbox"
            className="rounded-md border-surface-3 bg-white text-accent focus:ring-accent/30 h-4 w-4"
            checked={codCollected}
            onChange={(e) => setCodCollected(e.target.checked)}
          />
          Collected {formatMoney(parcel.codAmount)} in cash
        </label>
      ) : (
        <p className="text-[11px] text-ink-3 uppercase">Prepaid — no cash to collect.</p>
      )}

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button type="submit" size="sm" disabled={busy}>
          Mark delivered
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
