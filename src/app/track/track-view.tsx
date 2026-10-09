'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MotionConfig, motion } from 'motion/react';
import { api } from '@/lib/api';
import { formatDate, formatStatus } from '@/lib/parcel-utils';
import { EASE, createMotionScope, motionEnabled, stagger } from '@/lib/motion';
import type { ParcelStatus, PublicParcel } from '@/lib/types';
import { useCached } from '@/lib/use-cached';
import { Icon } from '@/components/icon-sprite';
import { MotionReveal } from '@/components/motion-reveal';
import { SiteNav } from '@/components/site-nav';

/** The happy path, in order. `CANCELLED` sits outside it. */
const STEPS: { status: ParcelStatus; label: string; icon: string }[] = [
  { status: 'PENDING', label: 'Booked', icon: 'i-check' },
  { status: 'PICKED_UP', label: 'Picked up', icon: 'i-box' },
  { status: 'IN_TRANSIT', label: 'In transit', icon: 'i-route' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for delivery', icon: 'i-truck' },
  { status: 'DELIVERED', label: 'Delivered', icon: 'i-home' },
];

const LOG_ICONS: Record<ParcelStatus, string> = {
  PENDING: 'i-clock',
  PICKED_UP: 'i-box',
  IN_TRANSIT: 'i-route',
  OUT_FOR_DELIVERY: 'i-truck',
  DELIVERED: 'i-check',
  CANCELLED: 'i-alert',
};

const ROUTE = 'M48 132 Q 190 -10 352 62';

const rise = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };

function Result({ parcel }: { parcel: PublicParcel }) {
  const [copied, setCopied] = useState(false);
  const routeRef = useRef<SVGPathElement>(null);
  const doneRef = useRef<SVGPathElement>(null);
  const courierRef = useRef<SVGGElement>(null);

  const cancelled = parcel.status === 'CANCELLED';
  const stepIndex = STEPS.findIndex((step) => step.status === parcel.status);
  const delivered = parcel.status === 'DELIVERED';
  // How far along the route the courier marker sits (0–1).
  const progress = cancelled ? 0 : Math.max(stepIndex, 0) / (STEPS.length - 1);

  // Newest first — the API returns logs in insertion order.
  const timeline = [...parcel.statusLogs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  useEffect(() => {
    const route = routeRef.current;
    const done = doneRef.current;
    const courier = courierRef.current;
    if (!route || !done || !courier) return;

    const length = route.getTotalLength();
    const place = (p: number) => {
      const point = route.getPointAtLength(length * p);
      courier.setAttribute('transform', `translate(${point.x} ${point.y})`);
      done.setAttribute('stroke-dasharray', `${p} 1`);
    };
    place(progress);
    if (!motionEnabled() || progress === 0) return;

    const scope = createMotionScope();
    scope.animate(0, progress, { duration: 1.8, ease: 'easeInOut', delay: 0.5, onUpdate: place });
    scope.animate('.steps li i', { scale: [0.4, 1], opacity: [0, 1] },
      { type: 'spring', stiffness: 260, damping: 22, delay: stagger(0.22, { startDelay: 0.3 }) });
    return () => scope.stop();
  }, [progress, parcel.trackingId]);

  async function copyId() {
    try {
      await navigator.clipboard.writeText(parcel.trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard access can be denied; the ID is on screen to copy by hand.
    }
  }

  return (
    <section aria-live="polite">
      {parcel.isBlocked && (
        <div className="hold" role="alert">
          <Icon name="i-alert" size={20} />
          <div><b>This parcel is on hold.</b>Contact support for details.</div>
        </div>
      )}

      <motion.div className="t-card summary" {...rise} transition={{ duration: 0.7, ease: EASE }}>
        <div>
          <span className="t-label">Tracking ID</span>
          <div className="sum-id">
            <b>{parcel.trackingId}</b>
            <button className="copy" type="button" onClick={copyId}>
              <Icon name="i-copy" size={13} /><span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <span className={`badge${cancelled || parcel.isBlocked ? ' danger' : ''}`}>
            <span className="pulse" />
            {parcel.isBlocked ? 'On hold' : formatStatus(parcel.status)}
          </span>
          <p className="sum-meta">Last update: {formatDate(parcel.updatedAt)}</p>
        </div>

        <div>
          <div className="steps-wrap">
            <div className="steps-track" aria-hidden="true">
              <motion.div
                className="steps-fill"
                initial={{ width: '0%' }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.3 }}
              />
            </div>
            <ol className="steps" aria-label="Delivery progress">
              {STEPS.map((step, i) => {
                const state = cancelled ? '' : i < stepIndex || (delivered && i === stepIndex) ? 'done' : i === stepIndex ? 'now' : '';
                return (
                  <li key={step.status} className={state} aria-current={state === 'now' ? 'step' : undefined}>
                    <i><Icon name={state === 'done' ? 'i-check' : step.icon} size={15} /></i>
                    {step.label}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </motion.div>

      <div className="t-grid">
        <motion.div className="t-card" {...rise} transition={{ duration: 0.7, ease: EASE, delay: 0.09 }}>
          <div className="t-head">
            <h2>Journey</h2>
            <span>{timeline.length} {timeline.length === 1 ? 'update' : 'updates'} · newest first</span>
          </div>
          {timeline.length === 0 ? (
            <p className="sum-meta">No updates have been logged for this parcel yet.</p>
          ) : (
            <ol className="journey">
              {timeline.map((log, i) => (
                // The public timeline carries no log id — key on the entry itself.
                <motion.li
                  key={`${log.createdAt}-${log.status}`}
                  className={i === 0 ? 'now' : undefined}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.5 + i * 0.1 }}
                >
                  <i><Icon name={LOG_ICONS[log.status]} size={14} /></i>
                  <div>
                    <b>{formatStatus(log.status)}</b>
                    {/* Assignment notes name the courier by first name only. */}
                    {log.note && <p>{log.note}</p>}
                  </div>
                  <time dateTime={log.createdAt}>{formatDate(log.createdAt)}</time>
                </motion.li>
              ))}
            </ol>
          )}
        </motion.div>

        <div className="t-stack">
          <motion.div className="t-card" {...rise} transition={{ duration: 0.7, ease: EASE, delay: 0.18 }}>
            <div className="route-map" aria-hidden="true">
              <div className="dots" />
              <svg viewBox="0 0 400 170" preserveAspectRatio="xMidYMid slice">
                <path ref={routeRef} d={ROUTE} fill="none" stroke="#cdd3cb" strokeWidth="2" strokeDasharray="5 6" strokeLinecap="round" />
                <path ref={doneRef} d={ROUTE} fill="none" stroke="#2f5a2a" strokeWidth="2.5" strokeLinecap="round" pathLength={1} strokeDasharray="0 1" />
                <circle cx="48" cy="132" r="6" fill="#fff" stroke="#2f5a2a" strokeWidth="2.5" />
                <circle cx="352" cy="62" r="7" fill="#1d3a1b" /><circle cx="352" cy="62" r="2.5" fill="#d3f65b" />
                <g ref={courierRef} transform="translate(48 132)">
                  <circle r="15" fill="#d3f65b" opacity=".35" />
                  <circle r="10" fill="#d3f65b" stroke="#fff" strokeWidth="2" />
                  <path d="M-4.5 -2.5h5v5h-5zM.5 -1h2l2 2v1.5h-4z" fill="none" stroke="#1d3a1b" strokeWidth="1.2" strokeLinejoin="round" />
                </g>
              </svg>
            </div>
            <div className="stops">
              <div className="stop"><i /><div><span className="t-label">Pickup</span><b>{parcel.pickupAddress}</b></div></div>
              <div className="stop end"><i><Icon name="i-pin" size={12} /></i><div><span className="t-label">Delivery</span><b>{parcel.deliveryAddress}</b></div></div>
            </div>
          </motion.div>

          <motion.div className="t-card" {...rise} transition={{ duration: 0.7, ease: EASE, delay: 0.27 }}>
            <div className="t-head" style={{ marginBottom: 18 }}><h2>Parcel details</h2></div>
            <dl className="details">
              <div><dt>Sender</dt><dd>{parcel.senderName}</dd></div>
              <div><dt>Receiver</dt><dd>{parcel.receiverName}</dd></div>
              {/* The public route gives a first name only, never courier contact details. */}
              {parcel.deliveryPersonnelName && (
                <div className="full">
                  <dt>Out with</dt>
                  <dd className="person"><i>{parcel.deliveryPersonnelName[0]}</i>{parcel.deliveryPersonnelName}</dd>
                </div>
              )}
              {parcel.description && (
                <div className="full"><dt>Description</dt><dd>{parcel.description}</dd></div>
              )}
            </dl>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Skeleton() {
  return (
    <section aria-label="Loading" aria-busy="true">
      <div className="t-card">
        <div className="sk" style={{ height: 22, width: '34%' }} />
        <div className="sk" style={{ height: 38, width: '52%', marginTop: 14 }} />
        <div className="sk" style={{ height: 60, marginTop: 26 }} />
      </div>
      <div className="t-grid">
        <div className="t-card">
          <div className="sk" style={{ height: 20, width: '30%' }} />
          <div className="sk" style={{ height: 200, marginTop: 22 }} />
        </div>
        <div className="t-card">
          <div className="sk" style={{ height: 150 }} />
          <div className="sk" style={{ height: 60, marginTop: 18 }} />
        </div>
      </div>
    </section>
  );
}

/** Statuses after which a parcel never changes again — no point polling. */
const TERMINAL: ParcelStatus[] = ['DELIVERED', 'CANCELLED'];
const REFRESH_MS = 30_000;

const clock = (at: number) =>
  new Date(at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });

/**
 * The tracking screen. On /track it is just the search box; on /track/[id] the
 * server passes in the parcel it rendered with (cached by ISR), and this keeps
 * it fresh in the browser while the page stays open.
 */
export function TrackView({
  trackingId,
  initialParcel = null,
  notFound = false,
}: {
  trackingId?: string;
  initialParcel?: PublicParcel | null;
  /** The server looked the ID up and found nothing. */
  notFound?: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(trackingId ?? '');
  const [navigating, startNavigation] = useTransition();

  const live = Boolean(trackingId && initialParcel);
  const { data, updatedAt, refreshing, refresh } = useCached(
    live ? `track:${trackingId}` : null,
    () => api.getParcel(trackingId!),
    {
      initialData: initialParcel ?? undefined,
      // Public data rendered on the server: nothing to restore from storage.
      persist: false,
      refreshMs: initialParcel && TERMINAL.includes(initialParcel.status) ? 0 : REFRESH_MS,
    },
  );
  const parcel = data ?? initialParcel;

  // Header entrance
  useEffect(() => {
    if (!motionEnabled()) return;
    const scope = createMotionScope();
    scope.animate('.pg-track .nav', { opacity: [0, 1], y: [-12, 0] }, { duration: 0.8, ease: EASE });
    scope.animate('.track-head [data-in]', { opacity: [0, 1], y: [18, 0], filter: ['blur(8px)', 'blur(0px)'] },
      { duration: 0.9, ease: EASE, delay: stagger(0.1, { startDelay: 0.1 }) });
    scope.animate('.track-hero .aurora', { x: [0, 80, -40, 0], scale: [1, 1.15, 0.95, 1] },
      { duration: 16, ease: 'easeInOut', repeat: Infinity });
    return () => scope.stop();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = value.trim();
    if (!id) return;
    // Each ID has its own cached page; the transition keeps the skeleton up while it loads.
    startNavigation(() => router.push(`/track/${encodeURIComponent(id)}`));
  }

  return (
    <MotionConfig reducedMotion="user">
      <header className="track-hero on-dark" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <div className="aurora" aria-hidden="true" />
        <SiteNav current="track" />

        <div className="track-head">
          <h1 data-in>Track your parcel</h1>
          <p data-in>Enter your tracking ID to see where your parcel is right now. No account needed.</p>
          <form className="track-form" onSubmit={handleSubmit} data-in>
            <Icon name="i-search" size={20} />
            <input
              ref={inputRef}
              placeholder="Enter tracking ID (e.g. TRK-...)"
              aria-label="Tracking ID"
              autoComplete="off"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
            <button className="btn lg" type="submit" disabled={navigating}>
              {navigating ? 'Tracking…' : 'Track'}
            </button>
          </form>
        </div>
      </header>

      <main className="track-body wrap">
        {navigating ? (
          <Skeleton />
        ) : parcel ? (
          <>
            <Result parcel={parcel} key={parcel.trackingId} />
            <div className="fresh">
              <span>
                <span className="pulse" />
                {updatedAt ? `Checked ${clock(updatedAt)}` : 'Live'}
                {TERMINAL.includes(parcel.status) ? '' : ' · updates automatically'}
              </span>
              <button type="button" onClick={() => refresh()} disabled={refreshing}>
                <Icon name="i-repeat" size={14} />{refreshing ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
          </>
        ) : notFound ? (
          <motion.section className="t-card t-state missing" role="alert" {...rise} transition={{ duration: 0.6, ease: EASE }}>
            <i><Icon name="i-search" size={34} /></i>
            <h2>Parcel not found</h2>
            <p>
              We couldn&apos;t find a parcel with the ID <b>{trackingId}</b>. Check the ID for typos and try again.
            </p>
            <div className="actions">
              <button className="btn dark" type="button" onClick={() => { inputRef.current?.focus(); inputRef.current?.select(); }}>
                Try another ID
              </button>
              <button className="btn line" type="button" data-open-chat>Ask Copilot</button>
            </div>
          </motion.section>
        ) : (
          <motion.section className="t-card t-state" {...rise} transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}>
            <i><Icon name="i-box" size={34} /></i>
            <h2>Where is your parcel?</h2>
            <p>Enter the tracking ID from your booking confirmation above to see its status and full journey.</p>
          </motion.section>
        )}

        <div className="t-help" data-reveal>
          <div>
            <b>Something not right with this delivery?</b>
            <span>Copilot can help, or sign in to manage it from your dashboard.</span>
          </div>
          <div className="actions">
            <button className="btn dark" type="button" data-open-chat><Icon name="i-chat" size={16} />Chat with Copilot</button>
            <Link className="btn line" href="/login">Sign in</Link>
          </div>
        </div>
      </main>
      {/* Mounted here, after the content it reveals has rendered */}
      <MotionReveal />
    </MotionConfig>
  );
}
