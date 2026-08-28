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
  PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  PICKED_UP: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  IN_TRANSIT: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  OUT_FOR_DELIVERY: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  DELIVERED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELLED: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
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
    orange: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    blue: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    red: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  };
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col relative overflow-hidden group">
      <div className="flex justify-between items-start mb-3">
        <div className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">{label}</div>
        <div className={`w-7 h-7 rounded-md flex items-center justify-center border ${bgColors[tone] || bgColors.blue}`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="text-2xl font-bold font-mono text-slate-200">{value}</div>
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
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg">
        <h2 className="text-lg font-bold text-slate-200 mb-2">Application under review</h2>
        <p className="text-sm text-slate-400 mb-4 leading-relaxed">
          Your delivery partner application is waiting on an admin. You can sign in and
          keep your profile up to date, but deliveries stay locked until it is approved.
        </p>
        <Link href="/dashboard/profile" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
          Update my profile →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-3 rounded-lg text-sm">{error}</div>}

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
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg flex flex-col">
          <div className="px-5 py-4 border-b border-slate-800/60 flex justify-between items-center">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate-300">Volume Status</h2>
            {truncated && <span className="text-[11px] text-slate-500 font-mono">LATEST 100</span>}
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
                    <div className="absolute -top-7 bg-slate-800 border border-slate-700 text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 font-mono text-slate-200 transition-opacity z-10 pointer-events-none whitespace-nowrap shadow-lg">
                      {count} {count === 1 ? 'parcel' : 'parcels'}
                    </div>
                    {/* Bar Background Track */}
                    <div className="w-full max-w-[42px] bg-slate-950/60 rounded-t-sm h-full flex flex-col justify-end overflow-hidden border border-slate-800/60 p-0.5">
                      <div
                        className="w-full rounded-t-[2px] transition-all duration-500 group-hover:brightness-125"
                        style={{
                          height: count > 0 ? `${Math.max(percentage, 8)}%` : '0%',
                          background: STATUS_COLORS[status],
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-[10px] uppercase text-slate-400 font-mono text-center tracking-wider truncate w-full px-0.5">
                    {formatStatus(status)}
                  </div>
                  <div className="text-[11px] font-bold font-mono text-slate-300">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg flex flex-col">
          <div className="px-5 py-4 border-b border-slate-800/60">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate-300">Breakdown</h2>
          </div>
          <div className="p-5 flex flex-col gap-3">
            {PARCEL_STATUSES.map((status) => (
              <div className="flex items-center justify-between text-sm" key={status}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[status] }} />
                  <span className="text-slate-400 text-[12px] uppercase">{formatStatus(status)}</span>
                </div>
                <div className="font-mono text-slate-300">
                  {(((byStatus[status] ?? 0) / statusTotal) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
            {user?.role === 'ADMIN' && stats && (
              <div className="mt-2 pt-3 border-t border-slate-800/60 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-slate-400 text-[12px] uppercase">Blocked</span>
                </div>
                <div className="font-mono text-rose-500 font-bold">{stats.blockedParcels}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg">
        <div className="px-5 py-4 border-b border-slate-800/60 flex justify-between items-center">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate-300">Recent Telemetry / Shipments</h2>
          <Link
            href={user?.role === 'DELIVERY_PERSONNEL' ? '/dashboard/deliveries' : '/dashboard/parcels'}
            className="text-[11px] uppercase tracking-wider text-cyan-500 hover:text-cyan-400 font-bold"
          >
            View All Data &rarr;
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-slate-900/50 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-800/60">
              <tr>
                <th className="px-5 py-3 font-semibold">Identifier</th>
                <th className="px-5 py-3 font-semibold">{user?.role === 'RECEIVER' ? 'Sender' : 'Recipient'}</th>
                <th className="px-5 py-3 font-semibold">Route</th>
                <th className="px-5 py-3 font-semibold">State</th>
                <th className="px-5 py-3 font-semibold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recent.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="px-5 py-3">
                    <div className="font-mono text-cyan-400 font-medium">{p.trackingId}</div>
                  </td>
                  <td className="px-5 py-3 text-slate-300">{user?.role === 'RECEIVER' ? p.senderName : p.receiverName}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs">
                    {p.pickupAddress} &rarr; {p.deliveryAddress}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${STATUS_CLASSES[p.status] || STATUS_CLASSES.PENDING}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        {formatStatus(p.status)}
                      </span>
                      {p.isBlocked && (
                        <span className="px-2 py-1 rounded border bg-rose-500/10 text-rose-500 border-rose-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <IconBan size={12} /> BLOCKED
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-slate-500 text-[11px]">
                    {formatDate(p.updatedAt)}
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500 text-sm">
                    No telemetry data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
