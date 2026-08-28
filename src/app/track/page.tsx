'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type { Parcel } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatStatus, parcelStatusVariant } from '@/lib/parcel-utils';

function TrackContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [trackingId, setTrackingId] = useState(initialId);
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const performTrack = useCallback(async (idToTrack: string) => {
    if (!idToTrack.trim()) return;
    setError('');
    setParcel(null);
    setLoading(true);
    try {
      setParcel(await api.getParcel(idToTrack.trim()));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Parcel not found');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialId) performTrack(initialId);
  }, [initialId, performTrack]);

  // Newest first — the API returns logs in insertion order.
  const timeline = [...(parcel?.statusLogs ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          performTrack(trackingId);
        }}
        className="flex gap-2"
      >
        <Input
          placeholder="Enter tracking ID (e.g. TRK-...)"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
          <Search className="h-4 w-4" />
        </Button>
      </form>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {parcel && (
        <div className="mt-6 space-y-4 border-t border-surface-2 pt-6">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{parcel.trackingId}</span>
            <Badge variant={parcelStatusVariant(parcel.status)}>
              {formatStatus(parcel.status)}
            </Badge>
          </div>
          <p className="text-sm text-ink-2">
            {parcel.pickupAddress} → {parcel.deliveryAddress}
          </p>
          <p className="text-sm">
            Sender: {parcel.senderName} · Receiver: {parcel.receiverName}
          </p>
          {parcel.description && (
            <p className="text-sm text-ink-3">{parcel.description}</p>
          )}
          {parcel.isBlocked && (
            <p className="text-sm text-red-600">
              This parcel is on hold. Contact support for details.
            </p>
          )}

          {timeline.length > 0 && (
            <div className="border-t border-surface-2 pt-4">
              <h2 className="mb-3 text-sm font-semibold">Journey</h2>
              <ol className="space-y-3">
                {timeline.map((log, i) => (
                  <li key={log.id} className="flex gap-3 text-sm">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        i === 0 ? 'bg-accent' : 'bg-surface-3'
                      }`}
                    />
                    <div>
                      <p className="font-medium">{formatStatus(log.status)}</p>
                      <p className="text-xs text-ink-3">
                        {formatDate(log.createdAt)}
                        {/* changedBy is absent on some list routes — guard it. */}
                        {log.changedBy ? ` · ${log.changedBy.name}` : ''}
                      </p>
                      {log.note && <p className="text-xs text-ink-2">{log.note}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function TrackPage() {
  return (
    <div className="min-h-screen bg-surface px-4 py-16">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="font-display mb-8 block text-xl font-extrabold">
          Parcel <span className="text-accent">Payout</span>
        </Link>
        <Card>
          <h1 className="font-display mb-4 text-2xl font-bold">Track a package</h1>
          <Suspense fallback={<div className="text-sm text-ink-3">Loading tracker...</div>}>
            <TrackContent />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
