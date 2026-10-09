'use client';

import React, { useEffect, useRef, type CSSProperties } from 'react';
import Link from 'next/link';
import { animate } from 'motion';
import { MotionConfig, motion } from 'motion/react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { EASE, motionEnabled } from '@/lib/motion';
import { useNotifications } from '@/lib/notifications-context';
import { useCached } from '@/lib/use-cached';
import {
  PARCEL_STATUSES,
  type DashboardStats,
  type Paginated,
  type Parcel,
  type ParcelStatus,
  type Role,
} from '@/lib/types';
import { formatDate, formatStatus, mergeParcels } from '@/lib/parcel-utils';
import { Icon } from '@/components/icon-sprite';

/**
 * One fixed colour per status, shared by the chart, the breakdown and the
 * table. Defined in styles/dashboard.css; always paired with a text label.
 */
const STATUS_COLORS: Record<ParcelStatus, string> = {
  PENDING: 'var(--st-pending)',
  PICKED_UP: 'var(--st-picked)',
  IN_TRANSIT: 'var(--st-transit)',
  OUT_FOR_DELIVERY: 'var(--st-out)',
  DELIVERED: 'var(--st-delivered)',
  CANCELLED: 'var(--st-cancelled)',
};

const STATUS_ICONS: Record<ParcelStatus, string> = {
  PENDING: 'i-clock',
  PICKED_UP: 'i-box',
  IN_TRANSIT: 'i-box',
  OUT_FOR_DELIVERY: 'i-truck',
  DELIVERED: 'i-check',
  CANCELLED: 'i-ban',
};

/** Statuses a parcel moves through, for the banner's progress bar. */
const JOURNEY: ParcelStatus[] = ['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const ACTIVE_FIRST: ParcelStatus[] = ['OUT_FOR_DELIVERY', 'IN_TRANSIT', 'PICKED_UP'];

const color = (value: string) => ({ '--c': value }) as CSSProperties;
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;
const percent = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);

function timeAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours}h` : `${Math.floor(hours / 24)}d`;
}

/** Counts up to `value` whenever it changes. */
function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !motionEnabled()) return;
    const controls = animate(0, value, {
      duration: 1.2,
      ease: EASE,
      onUpdate: (v) => { el.textContent = Math.round(v).toLocaleString('en-US'); },
    });
    return () => controls.stop();
  }, [value]);
  return <span ref={ref}>{value.toLocaleString('en-US')}</span>;
}

function Kpi({
  label, value, icon, lead, foot, share, tone,
}: {
  label: string;
  value: number;
  icon: string;
  /** The dark headline tile. */
  lead?: boolean;
  foot: string;
  /** 0–100; draws a thin share meter beside the footnote. */
  share?: number;
  tone?: string;
}) {
  return (
    <motion.article
      className={`card kpi${lead ? ' lead' : ''}`}
      variants={{ hidden: { opacity: 0, y: 20 }, shown: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <div className="kpi-top">{label}<i><Icon name={icon} size={18} /></i></div>
      <div className="kpi-value"><CountUp value={value} /></div>
      <div className="kpi-foot">
        {share !== undefined && (
          <span className="meter">
            <motion.i
              style={tone ? color(tone) : undefined}
              initial={{ width: '0%' }}
              animate={{ width: `${share}%` }}
              transition={{ duration: 1, ease: EASE, delay: 0.4 }}
            />
          </span>
        )}
        {foot}
      </div>
    </motion.article>
  );
}

const REFRESH_MS = 60_000;

type Overview = {
  stats: DashboardStats | null;
  parcels: Parcel[];
  listTotal: number;
  /** True when a role's list was capped, so the charts cover the latest 100 only. */
  truncated: boolean;
};

/** Everything the overview shows, in one cacheable value. What is fetched depends on the role. */
async function loadOverview(role: Role): Promise<Overview> {
  const SAMPLE = { limit: 100 };
  const merge = (...pages: Paginated<Parcel>[]): Overview => ({
    stats: null,
    parcels: mergeParcels(...pages.map((p) => p.data)),
    listTotal: pages.reduce((sum, p) => sum + p.meta.total, 0),
    truncated: pages.some((p) => p.meta.total > p.data.length),
  });

  switch (role) {
    case 'ADMIN': {
      const [stats, recent] = await Promise.all([api.getDashboard(), api.getAllParcels({ limit: 6 })]);
      return { stats, parcels: recent.data, listTotal: recent.meta.total, truncated: false };
    }
    case 'SENDER':
      return merge(await api.getMyParcels(SAMPLE));
    case 'RECEIVER':
      return merge(...(await Promise.all([api.getIncomingParcels(SAMPLE), api.getDeliveryHistory(SAMPLE)])));
    case 'DELIVERY_PERSONNEL':
      return merge(...(await Promise.all([api.getAssignedParcels(SAMPLE), api.getCompletedDeliveries(SAMPLE)])));
    default:
      // PENDING_DELIVERY has no parcel routes until an admin approves it.
      return { stats: null, parcels: [], listTotal: 0, truncated: false };
  }
}

const rise = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const role = user?.role;

  // Per-user key: the cached copy paints instantly, then refreshes every minute.
  const { data, error, refreshing, updatedAt, refresh } = useCached(
    user && role ? `overview:${user.id}:${role}` : null,
    () => loadOverview(role!),
    { refreshMs: REFRESH_MS },
  );

  // A live notification means something just changed — refetch without waiting.
  const latestNotification = notifications[0]?.id;
  useEffect(() => {
    if (latestNotification) refresh(true);
  }, [latestNotification, refresh]);

  if (!user) return null;

  if (role === 'PENDING_DELIVERY') {
    return (
      <div className="card" style={{ padding: 28, maxWidth: 640 }}>
        <div className="card-head" style={{ padding: 0 }}><h2>Application under review</h2></div>
        <p style={{ margin: '10px 0 18px', color: 'var(--muted)' }}>
          Your delivery partner application is waiting on an admin. You can sign in and
          keep your profile up to date, but deliveries stay locked until it is approved.
        </p>
        <Link className="btn dark" href="/dashboard/profile">Update my profile</Link>
      </div>
    );
  }

  const isAdmin = role === 'ADMIN';
  const stats = data?.stats ?? null;
  const parcels = data?.parcels ?? [];
  const listTotal = data?.listTotal ?? null;
  const truncated = data?.truncated ?? false;
  const byStatus: Record<ParcelStatus, number> =
    stats?.parcelsByStatus ??
    (Object.fromEntries(
      PARCEL_STATUSES.map((s) => [s, parcels.filter((p) => p.status === s).length]),
    ) as Record<ParcelStatus, number>);

  const totalParcels = stats?.totalParcels ?? listTotal ?? parcels.length;
  const statusTotal = Object.values(byStatus).reduce((a, b) => a + b, 0);
  const recent = parcels.slice(0, 6);
  const listHref = role === 'DELIVERY_PERSONNEL' ? '/dashboard/deliveries' : '/dashboard/parcels';
  const canCreate = role === 'SENDER' || isAdmin;

  // The parcel furthest along that has not arrived yet.
  const active = ACTIVE_FIRST.map((s) => parcels.find((p) => p.status === s)).find(Boolean);
  const activeProgress = active ? (JOURNEY.indexOf(active.status) / (JOURNEY.length - 1)) * 100 : 0;

  // Axis: three even steps that clear the tallest bar.
  const step = Math.max(1, Math.ceil(Math.max(...Object.values(byStatus), 1) / 3));
  const axisMax = step * 3;

  // Live notifications first, then the latest change on each recent parcel.
  const activity = [
    ...notifications.map((n) => ({
      id: n.id, title: n.title, text: n.message, at: n.createdAt, icon: STATUS_ICONS[n.status] ?? 'i-bell', live: true,
    })),
    ...recent.map((p) => ({
      id: p.id, title: formatStatus(p.status), text: `${p.trackingId} · ${role === 'RECEIVER' ? p.senderName : p.receiverName}`,
      at: p.updatedAt, icon: STATUS_ICONS[p.status], live: false,
    })),
  ].slice(0, 5);

  return (
    <MotionConfig reducedMotion="user">
      <div className="sync">
        {error ? (
          <span className="sync-error" role="alert"><Icon name="i-alert" size={14} />{error}</span>
        ) : (
          <span>
            <span className="pulse" />
            {updatedAt
              ? `Updated ${new Date(updatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })} · refreshes every minute`
              : 'Loading your data…'}
          </span>
        )}
        <button type="button" onClick={() => refresh()} disabled={refreshing}>
          <Icon name="i-repeat" size={14} className={refreshing ? 'spin' : undefined} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <motion.section className="banner on-dark" {...rise} transition={{ duration: 0.7, ease: EASE }}>
        <div className="hero-grid" aria-hidden="true" />
        <div>
          <h2>Welcome back, {user.name.split(' ')[0]}</h2>
          <p>
            {isAdmin && stats
              ? `${plural(byStatus.PENDING ?? 0, 'parcel')} waiting for pickup, and ${stats.blockedParcels} blocked.`
              : `${plural(byStatus.OUT_FOR_DELIVERY ?? 0, 'parcel')} out for delivery right now, and ${byStatus.PENDING ?? 0} waiting for pickup.`}
          </p>
          <div className="banner-actions">
            {canCreate ? (
              <Link className="btn" href="/dashboard/parcels/new"><Icon name="i-plus" size={16} />New shipment</Link>
            ) : (
              <Link className="btn" href={listHref}><Icon name="i-truck" size={16} />{role === 'DELIVERY_PERSONNEL' ? 'Open my deliveries' : 'View shipments'}</Link>
            )}
            <Link className="btn ghost" href="/track">Track a parcel</Link>
          </div>
        </div>

        {active && (
          <Link className="live" href={`/track/${encodeURIComponent(active.trackingId)}`} aria-label={`Track ${active.trackingId}`}>
            <div className="live-head">
              <div><small>Active parcel</small><b>{active.trackingId}</b></div>
              <span className="live-status"><span className="pulse" />{formatStatus(active.status)}</span>
            </div>
            <div className="live-bar">
              <motion.div
                className="live-fill"
                initial={{ width: '0%' }}
                animate={{ width: `${activeProgress}%` }}
                transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.4 }}
              >
                <i><Icon name="i-truck" size={12} /></i>
              </motion.div>
            </div>
            <div className="live-ends"><span>{active.pickupAddress}</span><span>{active.deliveryAddress}</span></div>
          </Link>
        )}
      </motion.section>

      <motion.section
        className="kpis"
        aria-label="Key figures"
        initial="hidden"
        animate="shown"
        transition={{ staggerChildren: 0.08, delayChildren: 0.1 }}
      >
        {isAdmin && stats ? (
          <>
            <Kpi lead icon="i-box" label="Total parcels" value={stats.totalParcels} foot={`${stats.blockedParcels} blocked`} />
            <Kpi icon="i-users" label="Total users" value={stats.totalUsers} foot="All roles" />
            <Kpi icon="i-check" label="Active users" value={stats.activeUsers}
              share={percent(stats.activeUsers, stats.totalUsers)} foot={`${Math.round(percent(stats.activeUsers, stats.totalUsers))}% of users`} />
            <Kpi icon="i-ban" label="Blocked users" value={stats.blockedUsers} tone="#c0392b"
              share={percent(stats.blockedUsers, stats.totalUsers)} foot={`${Math.round(percent(stats.blockedUsers, stats.totalUsers))}% of users`} />
          </>
        ) : (
          <>
            <Kpi lead icon="i-box" label="Total parcels" value={totalParcels} foot={truncated ? 'Charts use the latest 100' : 'Across all statuses'} />
            {(['IN_TRANSIT', 'DELIVERED', 'PENDING'] as const).map((s) => (
              <Kpi key={s} icon={STATUS_ICONS[s] === 'i-box' ? 'i-truck' : STATUS_ICONS[s]} label={formatStatus(s)} value={byStatus[s] ?? 0}
                tone={STATUS_COLORS[s]} share={percent(byStatus[s] ?? 0, statusTotal)}
                foot={`${Math.round(percent(byStatus[s] ?? 0, statusTotal))}% of parcels`} />
            ))}
          </>
        )}
      </motion.section>

      <section className="charts">
        <motion.article className="card" {...rise} transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}>
          <div className="card-head">
            <div><h2>Parcels by status</h2><p>Number of parcels currently in each status</p></div>
          </div>
          <div
            className="plot"
            role="img"
            aria-label={`Bar chart of parcels by status: ${PARCEL_STATUSES.map((s) => `${formatStatus(s)} ${byStatus[s] ?? 0}`).join(', ')}.`}
          >
            <div className="y-axis" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} style={{ bottom: `calc(34px + (100% - 34px) * ${i / 3})` }}>{i * step}</span>
              ))}
            </div>
            <div className="bars-area">
              {[1, 2, 3].map((i) => <span key={i} className="grid-line" style={{ bottom: `${(i / 3) * 100}%` }} />)}
              {PARCEL_STATUSES.map((status, i) => {
                const count = byStatus[status] ?? 0;
                return (
                  <div
                    className="bar-col"
                    key={status}
                    tabIndex={0}
                    style={{ '--h': `${(count / axisMax) * 100}%`, '--c': STATUS_COLORS[status] } as CSSProperties}
                  >
                    <span className="tip">
                      <b>{formatStatus(status)}</b>
                      <span>{plural(count, 'parcel')} · {percent(count, statusTotal).toFixed(1)}%</span>
                    </span>
                    <span className="val">{count}</span>
                    <motion.span
                      className="bar"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ type: 'spring', stiffness: 150, damping: 20, delay: 0.3 + i * 0.08 }}
                    />
                    <span className="lbl">{formatStatus(status)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.article>

        <motion.article className="card" {...rise} transition={{ duration: 0.7, ease: EASE, delay: 0.28 }}>
          <div className="card-head">
            <div><h2>Breakdown</h2><p>Share of {plural(statusTotal, 'parcel')}</p></div>
          </div>
          <div className="share">
            <div className="share-bar" aria-hidden="true">
              {PARCEL_STATUSES.filter((s) => (byStatus[s] ?? 0) > 0).map((status, i) => (
                <motion.i
                  key={status}
                  style={{ '--w': `${percent(byStatus[status], statusTotal)}%`, '--c': STATUS_COLORS[status] } as CSSProperties}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.4 + i * 0.08 }}
                />
              ))}
            </div>
            <ul className="share-list">
              {PARCEL_STATUSES.map((status) => (
                <li key={status}>
                  <i style={color(STATUS_COLORS[status])} />
                  {formatStatus(status)}
                  <b>{byStatus[status] ?? 0}</b>
                  <span>{percent(byStatus[status] ?? 0, statusTotal).toFixed(1)}%</span>
                </li>
              ))}
              {isAdmin && stats ? (
                <li>
                  <i style={color('#c0392b')} />
                  Blocked
                  <b>{stats.blockedParcels}</b>
                  <span />
                </li>
              ) : null}
            </ul>
          </div>
        </motion.article>
      </section>

      <section className="lower">
        <motion.article className="card" {...rise} transition={{ duration: 0.7, ease: EASE, delay: 0.36 }}>
          <div className="card-head">
            <div><h2>Recent shipments</h2><p>Latest {recent.length || ''}, newest first</p></div>
            <Link className="card-link" href={listHref}>View all <Icon name="i-arrow" size={15} /></Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tracking ID · updated</th>
                  <th>{role === 'RECEIVER' ? 'Sender' : 'Recipient'}</th>
                  <th>Route</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((p) => (
                  <tr key={p.id}>
                    <td className="tid">
                      <Link href={`/track/${encodeURIComponent(p.trackingId)}`}><b>{p.trackingId}</b></Link>
                      <span>{formatDate(p.updatedAt)}</span>
                    </td>
                    <td>{role === 'RECEIVER' ? p.senderName : p.receiverName}</td>
                    <td><div className="route"><b>{p.pickupAddress}</b>to {p.deliveryAddress}</div></td>
                    <td>
                      <span className="status"><i style={color(STATUS_COLORS[p.status])} />{formatStatus(p.status)}</span>
                      {p.isBlocked ? <span className="blocked"><Icon name="i-ban" size={11} />Blocked</span> : null}
                    </td>
                  </tr>
                ))}
                {recent.length === 0 ? (
                  <tr><td colSpan={4} className="empty">No shipments yet.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </motion.article>

        <motion.article className="card" {...rise} transition={{ duration: 0.7, ease: EASE, delay: 0.44 }}>
          <div className="card-head">
            <div><h2>Activity</h2><p>Updates as they happen</p></div>
            <span className="live-tag"><span className="pulse" />Live</span>
          </div>
          <ul className="feed" style={{ marginTop: 8 }}>
            {activity.map((item) => (
              <motion.li
                key={`${item.live ? 'n' : 'p'}-${item.id}`}
                className={item.live ? 'new' : undefined}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              >
                <i><Icon name={item.icon} size={17} /></i>
                <div><b>{item.title}</b><p>{item.text}</p></div>
                <time dateTime={item.at}>{timeAgo(item.at)}</time>
              </motion.li>
            ))}
            {activity.length === 0 ? <li><p>Nothing yet. Parcel updates will appear here.</p></li> : null}
          </ul>
        </motion.article>
      </section>
    </MotionConfig>
  );
}
