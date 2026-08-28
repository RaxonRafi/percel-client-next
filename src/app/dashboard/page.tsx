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
  formatDate, formatStatus, mergeParcels, statusPillClass,
} from '@/lib/parcel-utils';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'var(--amber)',
  PICKED_UP: 'var(--amber)',
  IN_TRANSIT: 'var(--accent)',
  OUT_FOR_DELIVERY: 'var(--blue)',
  DELIVERED: 'var(--green)',
  CANCELLED: '#A32D2D',
};

function Kpi({
  icon: Icon, tone, value, label,
}: {
  icon: React.ElementType;
  tone: string;
  value: React.ReactNode;
  label: string;
}) {
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <div className={`kpi-icon mc-${tone}`}>
          <Icon size={22} color={`var(--${tone === 'orange' ? 'accent' : tone})`} />
        </div>
      </div>
      <div className="kpi-val">{value}</div>
      <div className="kpi-lbl">{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  /** Exact count from `meta.total`, even when only a page was fetched. */
  const [listTotal, setListTotal] = useState<number | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [error, setError] = useState('');

  // Keyed on the role string, not the user object: what to fetch depends only
  // on the role, and an object dependency refires whenever identity changes.
  const role = user?.role;

  useEffect(() => {
    if (!role) return;
    let cancelled = false;

    /** Roles without a stats endpoint derive counts from the parcels they can
     *  read. 100 is the server's max page size, so beyond that the breakdown
     *  covers the most recent 100 and says so. */
    const SAMPLE = { limit: 100 };

    const absorb = (...pages: Paginated<Parcel>[]) => {
      setParcels(mergeParcels(...pages.map((p) => p.data)));
      setListTotal(pages.reduce((sum, p) => sum + p.meta.total, 0));
      setTruncated(pages.some((p) => p.meta.total > p.data.length));
    };

    (async () => {
      try {
        if (role === 'ADMIN') {
          // Admins get exact figures from /dashboard, so only the recent rows
          // are needed here.
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
        // PENDING_DELIVERY has no readable parcel route — nothing to fetch.
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load dashboard');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [role]);

  // Non-admin roles have no stats endpoint, so derive the same counts locally.
  const byStatus =
    stats?.parcelsByStatus ??
    (Object.fromEntries(
      PARCEL_STATUSES.map((s) => [s, parcels.filter((p) => p.status === s).length]),
    ) as Record<string, number>);

  // meta.total is exact even when only a page came back.
  const totalParcels = stats?.totalParcels ?? listTotal ?? parcels.length;
  const statusTotal = Object.values(byStatus).reduce((a, b) => a + b, 0) || 1;
  const recent = parcels.slice(0, 6);

  if (user?.role === 'PENDING_DELIVERY') {
    return (
      <div className="sp-card">
        <div className="card-header">
          <div className="card-title">Application under review</div>
        </div>
        <p style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.7 }}>
          Your delivery partner application is waiting on an admin. You can sign in and
          keep your profile up to date, but deliveries stay locked until it is approved.
          If it is turned down, the account becomes a normal sender account and you can
          apply again.
        </p>
        <Link href="/dashboard/profile" className="view-all-link" style={{ display: 'inline-block', marginTop: 16 }}>
          Update my profile →
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && <p style={{ color: '#A32D2D', marginBottom: 16 }}>{error}</p>}

      <div className="kpi-grid">
        {user?.role === 'ADMIN' && stats ? (
          <>
            <Kpi icon={IconPackages} tone="orange" value={stats.totalParcels} label="Total parcels" />
            <Kpi icon={IconUsers} tone="blue" value={stats.totalUsers} label="Total users" />
            <Kpi icon={IconUserCheck} tone="green" value={stats.activeUsers} label="Active users" />
            <Kpi icon={IconUserOff} tone="amber" value={stats.blockedUsers} label="Blocked users" />
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

      <div className="chart-row">
        <div className="sp-card">
          <div className="card-header">
            <div className="card-title">Parcels by status</div>
            {truncated && (
              <span style={{ fontSize: 11, color: 'var(--ink3)' }}>
                most recent 100
              </span>
            )}
          </div>
          <div className="bar-chart">
            {PARCEL_STATUSES.map((status) => {
              const count = byStatus[status] ?? 0;
              const max = Math.max(...PARCEL_STATUSES.map((s) => byStatus[s] ?? 0), 1);
              return (
                <div className="bar-col" key={status}>
                  <div className="bar-wrap">
                    <div
                      className="bar"
                      title={`${formatStatus(status)}: ${count}`}
                      style={{
                        height: `${Math.round((count / max) * 100)}%`,
                        background: STATUS_COLORS[status],
                        minHeight: count > 0 ? 4 : 0,
                      }}
                    />
                  </div>
                  <div className="bar-lbl">{formatStatus(status)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="sp-card">
          <div className="card-header">
            <div className="card-title">Status breakdown</div>
          </div>
          <div className="donut-legend">
            {PARCEL_STATUSES.map((status) => (
              <div className="legend-row" key={status}>
                <div className="legend-dot" style={{ background: STATUS_COLORS[status] }} />
                <div className="legend-lbl">{formatStatus(status)}</div>
                <div className="legend-val">
                  {(((byStatus[status] ?? 0) / statusTotal) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
            {user?.role === 'ADMIN' && stats && (
              <div className="legend-row" style={{ marginTop: 12, borderTop: '1px solid var(--surface2)', paddingTop: 12 }}>
                <div className="legend-dot" style={{ background: '#A32D2D' }} />
                <div className="legend-lbl">Blocked parcels</div>
                <div className="legend-val">{stats.blockedParcels}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="sp-card">
        <div className="card-header">
          <div className="card-title">Recent shipments</div>
          <Link
            href={user?.role === 'DELIVERY_PERSONNEL' ? '/dashboard/deliveries' : '/dashboard/parcels'}
            className="view-all-link"
          >
            View all →
          </Link>
        </div>
        <table className="shipments-table">
          <thead>
            <tr>
              <th>Package</th>
              <th>{user?.role === 'RECEIVER' ? 'Sender' : 'Recipient'}</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="pkg-id">{p.trackingId}</div>
                  <div className="pkg-route">{p.pickupAddress} → {p.deliveryAddress}</div>
                </td>
                <td>{user?.role === 'RECEIVER' ? p.senderName : p.receiverName}</td>
                <td>
                  <span className={statusPillClass(p.status)}>{formatStatus(p.status)}</span>
                  {p.isBlocked && (
                    <span className="status-pill s-failed" style={{ marginLeft: 6 }}>
                      <IconBan size={12} /> Blocked
                    </span>
                  )}
                </td>
                <td>{formatDate(p.updatedAt)}</td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <td colSpan={4} style={{ color: 'var(--ink3)' }}>No shipments yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
