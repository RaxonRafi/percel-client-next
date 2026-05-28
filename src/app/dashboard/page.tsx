'use client';

import { useEffect, useState } from 'react';
import { Package, CheckCircle, Clock, Users } from 'lucide-react';
import { DashboardTopbar } from '@/components/dashboard/topbar';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth-storage';
import type { DashboardStats, Parcel } from '@/lib/types';
import { parcelStatusVariant } from '@/lib/parcel-utils';

export default function DashboardOverviewPage() {
  const user = getStoredUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        if (user?.role === 'ADMIN') {
          const [s, p] = await Promise.all([
            api.getDashboard(),
            api.getAllParcels(),
          ]);
          setStats(s);
          setParcels(p.slice(0, 5));
        } else if (user?.role === 'SENDER') {
          setParcels((await api.getMyParcels()).slice(0, 5));
        } else if (user?.role === 'RECEIVER') {
          setParcels((await api.getIncomingParcels()).slice(0, 5));
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load data');
      }
    }
    load();
  }, [user?.role]);

  const kpis = stats
    ? [
        {
          label: 'Total users',
          val: stats.totalUsers,
          icon: Users,
          color: 'text-accent',
          bg: 'bg-accent-bg',
        },
        {
          label: 'Total parcels',
          val: stats.totalParcels,
          icon: Package,
          color: 'text-blue',
          bg: 'bg-blue-bg',
        },
        {
          label: 'Active users',
          val: stats.activeUsers,
          icon: CheckCircle,
          color: 'text-green',
          bg: 'bg-green-bg',
        },
        {
          label: 'Blocked parcels',
          val: stats.blockedParcels,
          icon: Clock,
          color: 'text-amber',
          bg: 'bg-amber-bg',
        },
      ]
    : [
        {
          label: 'Your shipments',
          val: parcels.length,
          icon: Package,
          color: 'text-accent',
          bg: 'bg-accent-bg',
        },
      ];

  return (
    <>
      <DashboardTopbar title="Overview" />
      <div className="p-8">
        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((k) => (
            <Card key={k.label} className="relative overflow-hidden">
              <div className="mb-4 flex justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${k.bg}`}
                >
                  <k.icon className={`h-5 w-5 ${k.color}`} />
                </div>
              </div>
              <div className="font-display text-3xl font-bold">{k.val}</div>
              <div className="text-sm text-ink-3">{k.label}</div>
            </Card>
          ))}
        </div>

        {stats && (
          <div className="mb-7 grid gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Parcels by status</CardTitle>
              </CardHeader>
              <div className="space-y-2">
                {Object.entries(stats.parcelsByStatus).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-ink-2">{status}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Recent shipments</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-2 text-xs uppercase text-ink-3">
                  <th className="pb-3 pr-4">Package</th>
                  <th className="pb-3 pr-4">Route</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {parcels.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-ink-3">
                      No parcels yet
                    </td>
                  </tr>
                ) : (
                  parcels.map((p) => (
                    <tr key={p.id} className="border-b border-surface-2">
                      <td className="py-3 font-semibold">{p.trackingId}</td>
                      <td className="py-3 text-ink-3">
                        {p.pickupAddress} → {p.deliveryAddress}
                      </td>
                      <td className="py-3">
                        <Badge variant={parcelStatusVariant(p.status)}>
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
