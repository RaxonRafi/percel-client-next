'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type { Parcel } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { parcelStatusVariant } from '@/lib/parcel-utils';

function TrackContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || '';
  
  const [trackingId, setTrackingId] = useState(initialId);
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const performTrack = async (idToTrack: string) => {
    if (!idToTrack.trim()) return;
    setError('');
    setParcel(null);
    setLoading(true);
    try {
      const data = await api.getParcel(idToTrack.trim());
      setParcel(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Parcel not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      performTrack(initialId);
    }
  }, [initialId]);

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    performTrack(trackingId);
  }

  return (
    <>
      <form onSubmit={handleTrack} className="flex gap-2">
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
        <div className="mt-6 space-y-3 border-t border-surface-2 pt-6">
          <div className="flex justify-between">
            <span className="font-semibold">{parcel.trackingId}</span>
            <Badge variant={parcelStatusVariant(parcel.status)}>
              {parcel.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-sm text-ink-2">
            {parcel.pickupAddress} → {parcel.deliveryAddress}
          </p>
          <p className="text-sm">
            Sender: {parcel.senderName} · Receiver: {parcel.receiverName}
          </p>
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
