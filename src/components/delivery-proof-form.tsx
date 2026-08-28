'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { api, ApiError } from '@/lib/api';
import { formatMoney } from '@/lib/parcel-utils';
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
  onDone: (message: string) => void;
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
      onDone(`${parcel.trackingId} delivered`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit proof');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mt-3 space-y-4 rounded-lg border border-slate-800 bg-slate-950 p-4"
    >
      <p className="text-[11px] font-bold tracking-wider text-cyan-400 uppercase">Complete Delivery — {parcel.trackingId}</p>

      <div>
        <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">Proof Images (1–{MAX_IMAGES} URLs)</label>
        <div className="space-y-2">
          {images.map((url, i) => (
            <input
              key={i}
              className="w-full h-9 rounded border border-slate-800 bg-slate-900 px-3 text-[13px] text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none placeholder:text-slate-600 font-mono"
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
          <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">Received by</label>
          <input
            className="w-full h-9 rounded border border-slate-800 bg-slate-900 px-3 text-[13px] text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none placeholder:text-slate-600 font-mono"
            value={receivedBy}
            onChange={(e) => setReceivedBy(e.target.value)}
            placeholder={parcel.receiverName}
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">Note</label>
          <input
            className="w-full h-9 rounded border border-slate-800 bg-slate-900 px-3 text-[13px] text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none placeholder:text-slate-600 font-mono"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>

      {hasCod ? (
        <label className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-slate-300 uppercase cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/50 h-4 w-4"
            checked={codCollected}
            onChange={(e) => setCodCollected(e.target.checked)}
          />
          Collected {formatMoney(parcel.codAmount)} in cash
        </label>
      ) : (
        <p className="text-[11px] text-slate-500 font-mono uppercase">Prepaid — no cash to collect.</p>
      )}

      {error && <p className="text-sm text-rose-500 font-mono">{error}</p>}

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
