'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  IconPackages, IconCheck, IconTruckDelivery, IconAlertCircle,
  IconUsers, IconUserCheck, IconUserOff, IconBan,
} from '@tabler/icons-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  PARCEL_STATUSES,
  type DashboardStats,
  type Paginated,
  type Parcel,
} from '@/lib/types';
import {
  formatDate, formatStatus, mergeParcels,
} from '@/lib/parcel-utils';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  PICKED_UP: '#f59e0b',
  IN_TRANSIT: '#0ea5e9',
  OUT_FOR_DELIVERY: '#8b5cf6',
  DELIVERED: '#10b981',
  CANCELLED: '#e11d48',
};

const STATUS_CLASSES: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-600 border-amber-200',
  PICKED_UP: 'bg-amber-50 text-amber-600 border-amber-200',
  IN_TRANSIT: 'bg-accent-bg text-accent border-accent/20',
  OUT_FOR_DELIVERY: 'bg-violet-50 text-violet-600 border-violet-200',
  DELIVERED: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  CANCELLED: 'bg-rose-50 text-rose-600 border-rose-200',
};

function Kpi({
  icon: Icon, tone, value, label,
}: {
  icon: React.ElementType;
  tone: string;
  value: React.ReactNode;
  label: string;
}) {
  const bgColors: Record<string, string> = {
    orange: 'bg-amber-50 text-amber-600 border-amber-200',
    blue: 'bg-accent-bg text-accent border-accent/20',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    red: 'bg-rose-50 text-rose-600 border-rose-200',
  };
  return (
    <div className="bg-white border border-surface-3 rounded-xl shadow-sm p-4 flex flex-col relative overflow-hidden group">
      <div className="flex justify-between items-start mb-3">
        <div className="text-[11px] font-bold tracking-widest text-ink-3 uppercase">{label}</div>
        <div className={`w-7 h-7 rounded-md flex items-center justify-center border ${bgColors[tone] || bgColors.blue}`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="text-2xl font-bold text-ink">{value}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [listTotal, setListTotal] = useState<number | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [error, setError] = useState('');

  const role = user?.role;

  useEffect(() => {
    if (!role) return;
    let cancelled = false;
    const SAMPLE = { limit: 100 };

    const absorb = (...pages: Paginated<Parcel>[]) => {
      setParcels(mergeParcels(...pages.map((p) => p.data)));
      setListTotal(pages.reduce((sum, p) => sum + p.meta.total, 0));
      setTruncated(pages.some((p) => p.meta.total > p.data.length));
    };

    (async () => {
      try {
        if (role === 'ADMIN') {
          const [dashboard, recent] = await Promise.all([
            api.getDashboard(),
            api.getAllParcels({ limit: 6 }),
          ]);
          if (cancelled) return;
          setStats(dashboard);
          setParcels(recent.data);
          setListTotal(recent.meta.total);
        } else if (role === 'SENDER') {
          const mine = await api.getMyParcels(SAMPLE);
          if (!cancelled) absorb(mine);
        } else if (role === 'RECEIVER') {
          const [incoming, history] = await Promise.all([
            api.getIncomingParcels(SAMPLE),
            api.getDeliveryHistory(SAMPLE),
          ]);
          if (!cancelled) absorb(incoming, history);
        } else if (role === 'DELIVERY_PERSONNEL') {
          const [queue, done] = await Promise.all([
            api.getAssignedParcels(SAMPLE),
            api.getCompletedDeliveries(SAMPLE),
          ]);
          if (!cancelled) absorb(queue, done);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load dashboard');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [role]);

  const byStatus =
    stats?.parcelsByStatus ??
    (Object.fromEntries(
      PARCEL_STATUSES.map((s) => [s, parcels.filter((p) => p.status === s).length]),
    ) as Record<string, number>);

  const totalParcels = stats?.totalParcels ?? listTotal ?? parcels.length;
  const statusTotal = Object.values(byStatus).reduce((a, b) => a + b, 0) || 1;
  const recent = parcels.slice(0, 6);

  if (user?.role === 'PENDING_DELIVERY') {
    return (
      <div className="bg-white border border-surface-3 p-6 rounded-xl">
        <h2 className="text-lg font-bold text-ink mb-2">Application under review</h2>
        <p className="text-sm text-ink-2 mb-4 leading-relaxed">
          Your delivery partner application is waiting on an admin. You can sign in and
          keep your profile up to date, but deliveries stay locked until it is approved.
        </p>
        <Link href="/dashboard/profile" className="text-accent hover:text-accent-2 text-sm font-medium">
          Update my profile →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error ? <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-sm">{error}</div> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {user?.role === 'ADMIN' && stats ? (
          <>
            <Kpi icon={IconPackages} tone="orange" value={stats.totalParcels} label="Total parcels" />
            <Kpi icon={IconUsers} tone="blue" value={stats.totalUsers} label="Total users" />
            <Kpi icon={IconUserCheck} tone="green" value={stats.activeUsers} label="Active users" />
            <Kpi icon={IconUserOff} tone="red" value={stats.blockedUsers} label="Blocked users" />
          </>
        ) : (
          <>
            <Kpi icon={IconPackages} tone="orange" value={totalParcels} label="Total parcels" />
            <Kpi icon={IconTruckDelivery} tone="blue" value={byStatus.IN_TRANSIT ?? 0} label="In transit" />
            <Kpi icon={IconCheck} tone="green" value={byStatus.DELIVERED ?? 0} label="Delivered" />
            <Kpi icon={IconAlertCircle} tone="amber" value={byStatus.PENDING ?? 0} label="Pending" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-surface-3 rounded-xl shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-surface-2 flex justify-between items-center">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-ink-2">Volume Status</h2>
            {truncated ? <span className="text-[11px] text-ink-3">LATEST 100</span> : null}
          </div>
          <div className="p-5 flex-1 flex items-end gap-3 h-64">
            {PARCEL_STATUSES.map((status) => {
              const count = byStatus[status] ?? 0;
              const max = Math.max(...PARCEL_STATUSES.map((s) => byStatus[s] ?? 0), 1);
              const percentage = Math.round((count / max) * 100);
              return (
                <div className="flex-1 flex flex-col items-center gap-2 group h-full justify-end" key={status}>
                  <div className="w-full flex-1 flex flex-col justify-end relative items-center">
                    {/* Tooltip */}
                    <div className="absolute -top-7 bg-surface-2 border border-surface-3 text-xs px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 text-ink transition-opacity z-10 pointer-events-none whitespace-nowrap shadow-lg">
                      {count} {count === 1 ? 'parcel' : 'parcels'}
                    </div>
                    {/* Bar Background Track */}
                    <div className="w-full max-w-[42px] bg-surface-2 rounded-t-sm h-full flex flex-col justify-end overflow-hidden border border-surface-2 p-0.5">
                      <div
                        className="w-full rounded-t-[2px] transition-all duration-500 group-hover:brightness-125"
                        style={{
                          height: count > 0 ? `${Math.max(percentage, 8)}%` : '0%',
                          background: STATUS_COLORS[status],
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-[10px] uppercase text-ink-2 text-center tracking-wider truncate w-full px-0.5">
                    {formatStatus(status)}
                  </div>
                  <div className="text-[11px] font-bold text-ink-2">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-surface-3 rounded-xl shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-surface-2">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-ink-2">Breakdown</h2>
          </div>
          <div className="p-5 flex flex-col gap-3">
            {PARCEL_STATUSES.map((status) => (
              <div className="flex items-center justify-between text-sm" key={status}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[status] }} />
                  <span className="text-ink-2 text-[12px] uppercase">{formatStatus(status)}</span>
                </div>
                <div className="text-ink-2">
                  {(((byStatus[status] ?? 0) / statusTotal) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
            {user?.role === 'ADMIN' && stats ? (
              <div className="mt-2 pt-3 border-t border-surface-2 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-ink-2 text-[12px] uppercase">Blocked</span>
                </div>
                <div className="text-rose-600 font-bold">{stats.blockedParcels}</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="bg-white border border-surface-3 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-surface-2 flex justify-between items-center">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-ink-2">Recent Telemetry / Shipments</h2>
          <Link
            href={user?.role === 'DELIVERY_PERSONNEL' ? '/dashboard/deliveries' : '/dashboard/parcels'}
            className="text-[11px] uppercase tracking-wider text-accent hover:text-accent font-bold"
          >
            View All Data &rarr;
          </Link>
        </div>
        <div className="m-5 overflow-x-auto rounded-xl border border-surface-3">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-surface text-[11px] uppercase tracking-wider text-ink-3 border-b border-surface-3">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Identifier</th>
                <th className="px-5 py-3.5 font-semibold">{user?.role === 'RECEIVER' ? 'Sender' : 'Recipient'}</th>
                <th className="px-5 py-3.5 font-semibold">Route</th>
                <th className="px-5 py-3.5 font-semibold">State</th>
                <th className="px-5 py-3.5 font-semibold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-3">
              {recent.map((p) => (
                <tr key={p.id} className="hover:bg-surface transition-colors group">
                  <td className="px-5 py-4">
                    <div className="text-accent font-medium">{p.trackingId}</div>
                  </td>
                  <td className="px-5 py-4 text-ink-2">{user?.role === 'RECEIVER' ? p.senderName : p.receiverName}</td>
                  <td className="px-5 py-4 text-ink-2 text-xs">
                    {p.pickupAddress} &rarr; {p.deliveryAddress}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold flex items-center gap-1.5 ${STATUS_CLASSES[p.status] || STATUS_CLASSES.PENDING}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        {formatStatus(p.status)}
                      </span>
                      {p.isBlocked ? (
                        <span className="px-2 py-1 rounded-md border bg-rose-50 text-rose-600 border-rose-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <IconBan size={12} /> BLOCKED
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right text-ink-3 text-[11px]">
                    {formatDate(p.updatedAt)}
                  </td>
                </tr>
              ))}
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-ink-3 text-sm">
                    No telemetry data available.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
