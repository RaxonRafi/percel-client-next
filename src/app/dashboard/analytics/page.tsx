'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { formatStatus } from '@/lib/parcel-utils';
import { PARCEL_STATUSES, type DashboardStats } from '@/lib/types';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getDashboard()
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load analytics'));
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!stats) return <p className="text-ink-3">Loading analytics…</p>;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {([
        ['Total users', stats.totalUsers],
        ['Active users', stats.activeUsers],
        ['Blocked users', stats.blockedUsers],
        ['Total parcels', stats.totalParcels],
        ['Blocked parcels', stats.blockedParcels],
      ] as const).map(([label, val]) => (
        <Card key={label}>
          <CardHeader>
            <CardTitle>{label}</CardTitle>
          </CardHeader>
          <p className="font-display text-4xl font-bold">{val}</p>
        </Card>
      ))}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Status breakdown</CardTitle>
        </CardHeader>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {/* The API zero-fills every status, but iterate the known list so a
              missing key can never blank out a tile. */}
          {PARCEL_STATUSES.map((status) => (
            <div key={status} className="rounded-lg bg-surface px-4 py-3 text-sm">
              <span className="text-ink-3">{formatStatus(status)}</span>
              <p className="font-display text-2xl font-bold">
                {stats.parcelsByStatus?.[status] ?? 0}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
