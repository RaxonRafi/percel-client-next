'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  IconBan, IconBell, IconPackage, IconTruckDelivery, IconUserCheck, IconX,
} from '@tabler/icons-react';
import { useNotifications, type AppNotification } from '@/lib/notifications-context';
import type { RealtimeNotification } from '@/lib/types';

const ICONS: Record<RealtimeNotification['type'], React.ElementType> = {
  'parcel.created': IconPackage,
  'parcel.status': IconTruckDelivery,
  'parcel.assigned': IconUserCheck,
  'parcel.unassigned': IconUserCheck,
  'parcel.blocked': IconBan,
  'parcel.unblocked': IconPackage,
};

function timeAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
}

function NotificationRow({ item }: { item: AppNotification }) {
  const Icon = ICONS[item.type] ?? IconBell;
  return (
    <>
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent-bg text-accent">
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-ink">{item.title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-ink-2">{item.message}</span>
        <span className="mt-1 block text-[11px] text-ink-3">{timeAgo(item.createdAt)}</span>
      </span>
    </>
  );
}

export function NotificationBell() {
  const { notifications, unread, connected, markAllRead, clear } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function toggle() {
    // Closing counts as having seen them, so the badge clears on the way out.
    if (open) markAllRead();
    setOpen(!open);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        className="icon-btn"
      >
        <IconBell size={18} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e34948] px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[52px] z-50 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[20px] border border-surface-3 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-surface-3 px-4 py-3">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-sm font-semibold text-ink">Notifications</h2>
              <span
                title={connected ? 'Live updates on' : 'Live updates unavailable'}
                className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-surface-3'}`}
              />
            </div>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clear}
                className="text-xs font-medium text-ink-3 transition-colors hover:text-ink"
              >
                Clear all
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-ink-3">
              {connected
                ? 'Nothing new. Parcel updates will appear here as they happen.'
                : 'Live updates are not connected right now.'}
            </p>
          ) : (
            <ul className="max-h-96 divide-y divide-surface-2 overflow-y-auto">
              {notifications.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/track?id=${encodeURIComponent(item.trackingId)}`}
                    onClick={toggle}
                    className={`flex gap-3 px-4 py-3 transition-colors hover:bg-surface ${item.read ? '' : 'bg-accent-bg/50'}`}
                  >
                    <NotificationRow item={item} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/** Briefly surfaces each arrival; the bell keeps the history. */
export function NotificationToasts() {
  const { toasts, dismissToast } = useNotifications();
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-6 top-20 z-[70] flex w-80 max-w-[calc(100vw-3rem)] flex-col gap-2" aria-live="polite">
      {toasts.map((item) => (
        <div
          key={item.id}
          className="pointer-events-auto flex gap-3 rounded-xl border border-surface-3 bg-white p-3 shadow-lg"
        >
          <NotificationRow item={item} />
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => dismissToast(item.id)}
            className="h-6 flex-shrink-0 rounded-md p-1 text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <IconX size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
