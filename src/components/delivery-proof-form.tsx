'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
      className="mt-3 space-y-3 rounded-[var(--radius-md)] border border-surface-3 bg-surface p-4"
    >
      <p className="text-sm font-medium">Complete delivery — {parcel.trackingId}</p>

      <div>
        <Label>Proof images (1–{MAX_IMAGES} URLs)</Label>
        <div className="space-y-2">
          {images.map((url, i) => (
            <Input
              key={i}
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
          <Label>Received by</Label>
          <Input
            value={receivedBy}
            onChange={(e) => setReceivedBy(e.target.value)}
            placeholder={parcel.receiverName}
          />
        </div>
        <div>
          <Label>Note</Label>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>

      {hasCod ? (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={codCollected}
            onChange={(e) => setCodCollected(e.target.checked)}
          />
          Collected {formatMoney(parcel.codAmount)} in cash
        </label>
      ) : (
        <p className="text-xs text-ink-3">Prepaid — no cash to collect.</p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
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
