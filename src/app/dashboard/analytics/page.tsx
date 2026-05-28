'use client';

import { useEffect, useState } from 'react';
import { DashboardTopbar } from '@/components/dashboard/topbar';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import type { DashboardStats } from '@/lib/types';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.getDashboard().then(setStats).catch(() => setStats(null));
  }, []);

  if (!stats) {
    return (
      <>
        <DashboardTopbar title="Analytics" />
        <div className="p-8 text-ink-3">Loading analytics…</div>
      </>
    );
  }

  return (
    <>
      <DashboardTopbar title="Analytics" />
      <div className="grid gap-6 p-8 md:grid-cols-2 lg:grid-cols-3">
        {[
          ['Total users', stats.totalUsers],
          ['Active users', stats.activeUsers],
          ['Blocked users', stats.blockedUsers],
          ['Total parcels', stats.totalParcels],
          ['Blocked parcels', stats.blockedParcels],
        ].map(([label, val]) => (
          <Card key={label as string}>
            <CardHeader>
              <CardTitle>{label as string}</CardTitle>
            </CardHeader>
            <p className="font-display text-4xl font-bold">{val as number}</p>
          </Card>
        ))}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Status breakdown</CardTitle>
          </CardHeader>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {Object.entries(stats.parcelsByStatus).map(([k, v]) => (
              <div
                key={k}
                className="rounded-lg bg-surface px-4 py-3 text-sm"
              >
                <span className="text-ink-3">{k}</span>
                <p className="font-display text-2xl font-bold">{v}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
